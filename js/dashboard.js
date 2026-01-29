/**
 * Just in time meeting - Dashboard Logic
 * =======================================
 */

class Dashboard {
  constructor() {
    this.bookings = [];
    this.members = [];
    this.eventTypes = [];
    this.currentFilter = 'all';
    this.dateRange = {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.init();
  }

  async init() {
    await this.loadData();
    this.renderStats();
    this.renderBookingsTable();
    this.renderUpcomingList();
    this.setupEventListeners();
  }

  async loadData() {
    try {
      // Load all data in parallel
      const [members, eventTypes, bookings] = await Promise.all([
        API.getTeamMembers(),
        API.getEventTypes(),
        API.getTeamBookings(
          [],
          this.dateRange.start.toISOString().split('T')[0],
          this.dateRange.end.toISOString().split('T')[0]
        ),
      ]);

      this.members = members;
      this.eventTypes = eventTypes;
      this.bookings = bookings;
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  renderStats() {
    const statsContainer = document.querySelector('.stats-grid');
    if (!statsContainer) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.start_datetime);
      return bookingDate >= today && bookingDate < tomorrow && b.status === 'confirmed';
    });

    const upcomingBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.start_datetime);
      return bookingDate >= now && b.status === 'confirmed';
    });

    const completedBookings = this.bookings.filter(b => b.status === 'completed');
    const cancelledBookings = this.bookings.filter(b => b.status === 'cancelled');

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-value">${todayBookings.length}</div>
        <div class="stat-label">นัดหมายวันนี้</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="stat-value">${upcomingBookings.length}</div>
        <div class="stat-label">ที่กำลังจะถึง</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon yellow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
        </div>
        <div class="stat-value">${completedBookings.length}</div>
        <div class="stat-label">เสร็จสิ้นแล้ว</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="stat-value">${cancelledBookings.length}</div>
        <div class="stat-label">ยกเลิก</div>
      </div>
    `;
  }

  renderBookingsTable() {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;

    // Filter bookings
    let filteredBookings = this.bookings;
    if (this.currentFilter !== 'all') {
      filteredBookings = this.bookings.filter(b => b.status === this.currentFilter);
    }

    // Sort by start date
    filteredBookings.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    if (filteredBookings.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted" style="padding: 3rem;">
            ไม่พบนัดหมาย
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filteredBookings.map(booking => {
      const startDate = new Date(booking.start_datetime);
      const dateStr = `${startDate.getDate()} ${THAI_MONTHS_SHORT[startDate.getMonth()]} ${startDate.getFullYear() + 543}`;
      const timeStr = startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>
            <div><strong>${booking.guest_name}</strong></div>
            <div class="text-muted text-small">${booking.guest_email}</div>
          </td>
          <td>${booking.event_name || booking.event_type_id}</td>
          <td>
            <div>${dateStr}</div>
            <div class="text-muted text-small">${timeStr}</div>
          </td>
          <td>${booking.member_name || booking.member_id}</td>
          <td>
            <span class="status-badge ${booking.status}">${this.getStatusLabel(booking.status)}</span>
            ${booking.is_recurring ? '<span class="text-muted text-small">🔄</span>' : ''}
          </td>
          <td>
            <div class="d-flex gap-sm">
              ${booking.meeting_link ? `
                <a href="${booking.meeting_link}" target="_blank" class="btn btn-sm btn-primary">
                  เข้าร่วม
                </a>
              ` : ''}
              ${booking.status === 'confirmed' ? `
                <button class="btn btn-sm btn-secondary" onclick="dashboard.cancelBooking('${booking.id}')">
                  ยกเลิก
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderUpcomingList() {
    const container = document.getElementById('upcoming-list');
    if (!container) return;

    const now = new Date();
    const upcoming = this.bookings
      .filter(b => new Date(b.start_datetime) >= now && b.status === 'confirmed')
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 5);

    if (upcoming.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>ไม่มีนัดหมายที่กำลังจะถึง</p>
        </div>
      `;
      return;
    }

    container.innerHTML = upcoming.map(booking => {
      const startDate = new Date(booking.start_datetime);
      const isToday = startDate.toDateString() === now.toDateString();
      const timeStr = startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const dateStr = isToday ? 'วันนี้' : `${startDate.getDate()} ${THAI_MONTHS_SHORT[startDate.getMonth()]}`;

      return `
        <div class="upcoming-item" style="display: flex; gap: 1rem; padding: 0.75rem; border-radius: 0.5rem; background: var(--gray-50); margin-bottom: 0.5rem;">
          <div class="upcoming-time" style="font-weight: 500; color: var(--primary); min-width: 60px;">
            ${timeStr}
          </div>
          <div class="upcoming-info" style="flex: 1;">
            <div style="font-weight: 500;">${booking.guest_name}</div>
            <div class="text-muted text-small">${booking.event_name || booking.event_type_id} • ${dateStr}</div>
          </div>
          ${booking.meeting_link ? `
            <a href="${booking.meeting_link}" target="_blank" class="btn btn-sm btn-outline">
              เข้าร่วม
            </a>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  getStatusLabel(status) {
    const labels = {
      confirmed: 'ยืนยันแล้ว',
      pending: 'รอดำเนินการ',
      cancelled: 'ยกเลิก',
      completed: 'เสร็จสิ้น',
    };
    return labels[status] || status;
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderBookingsTable();
      });
    });

    // Sidebar toggle (mobile)
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Refresh button
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.refreshData();
    });
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span class="spinner"></span>';
    }

    await this.loadData();
    this.renderStats();
    this.renderBookingsTable();
    this.renderUpcomingList();

    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = 'รีเฟรช';
    }
  }

  async cancelBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    let confirmMessage = `ยืนยันยกเลิกนัดหมายกับ ${booking.guest_name}?`;
    if (booking.is_recurring) {
      confirmMessage += '\n\nนัดหมายนี้เป็นแบบซ้ำ ต้องการยกเลิกทั้งหมดหรือไม่?';
    }

    if (!confirm(confirmMessage)) return;

    const cancelAll = booking.is_recurring && confirm('ยกเลิกนัดหมายซ้ำทั้งหมด?');

    try {
      const result = await API.cancelBooking(bookingId, cancelAll);
      if (result.success) {
        alert('ยกเลิกนัดหมายเรียบร้อยแล้ว');
        this.refreshData();
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});
