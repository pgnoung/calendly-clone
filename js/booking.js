/**
 * Calendly Clone - Booking Page Logic
 * =====================================
 */

class BookingPage {
  constructor() {
    this.currentStep = 1;
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedMember = null;
    this.selectedEventType = null;
    this.isRecurring = false;
    this.recurringOptions = {
      frequency: 'weekly',
      occurrences: 4,
    };
    this.availableSlots = {};
    this.currentMonth = new Date();

    this.init();
  }

  async init() {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    this.selectedMember = params.get('member') || CONFIG.TEAM_MEMBERS[0]?.id;
    this.selectedEventType = params.get('event') || CONFIG.EVENT_TYPES[0]?.id;

    // Load data
    await this.loadEventType();
    await this.loadMember();

    // Setup UI
    this.setupCalendar();
    this.setupEventListeners();
    this.renderSidebar();

    // Load initial slots
    await this.loadAvailableSlots();
  }

  async loadEventType() {
    const eventTypes = await API.getEventTypes();
    this.eventTypeData = eventTypes.find(e => e.id === this.selectedEventType) || eventTypes[0];
  }

  async loadMember() {
    const members = await API.getTeamMembers();
    this.memberData = members.find(m => m.id === this.selectedMember) || members[0];
  }

  renderSidebar() {
    const sidebar = document.querySelector('.booking-sidebar');
    if (!sidebar || !this.eventTypeData || !this.memberData) return;

    const locationInfo = CONFIG.LOCATION_TYPES[this.eventTypeData.location_type] || {};

    sidebar.innerHTML = `
      <div class="host-info">
        <div class="host-avatar">
          ${this.memberData.avatar ?
            `<img src="${this.memberData.avatar}" alt="${this.memberData.name}">` :
            this.memberData.name.charAt(0)}
        </div>
        <div class="host-name">${this.memberData.name}</div>
      </div>

      <h2 class="event-title">${this.eventTypeData.name}</h2>

      <div class="event-details">
        <div class="event-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>${this.eventTypeData.duration} นาที</span>
        </div>
        <div class="event-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${locationInfo.icon || ''} ${locationInfo.label || 'ออนไลน์'}</span>
        </div>
        ${this.eventTypeData.description ? `
          <div class="event-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            <span>${this.eventTypeData.description}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupCalendar() {
    this.renderCalendar();
  }

  renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();

    container.innerHTML = `
      <div class="calendar-header">
        <span class="calendar-month">${THAI_MONTHS[month]} ${year + 543}</span>
        <div class="calendar-nav">
          <button id="prev-month" ${month === today.getMonth() && year === today.getFullYear() ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button id="next-month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="calendar-grid">
        ${THAI_DAYS_SHORT.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
        ${this.generateCalendarDays(year, month, startingDay, lastDay.getDate(), today)}
      </div>
    `;

    // Add navigation listeners
    document.getElementById('prev-month')?.addEventListener('click', () => this.navigateMonth(-1));
    document.getElementById('next-month')?.addEventListener('click', () => this.navigateMonth(1));

    // Add day click listeners
    container.querySelectorAll('.calendar-day:not(.disabled)').forEach(day => {
      day.addEventListener('click', () => this.selectDate(day.dataset.date));
    });
  }

  generateCalendarDays(year, month, startingDay, totalDays, today) {
    let html = '';
    const maxAdvanceDays = CONFIG.DEFAULTS.ADVANCE_BOOKING_DAYS;
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      html += '<div class="calendar-day disabled"></div>';
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const workingHours = CONFIG.WORKING_HOURS[dayOfWeek];

      const isPast = date < today;
      const isTooFar = date > maxDate;
      const isOff = !workingHours;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedDate === dateStr;
      const hasSlots = this.availableSlots[dateStr]?.length > 0;

      let classes = ['calendar-day'];
      if (isPast || isTooFar || isOff) classes.push('disabled');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (hasSlots) classes.push('has-slots');

      html += `<div class="${classes.join(' ')}" data-date="${dateStr}">${day}</div>`;
    }

    return html;
  }

  navigateMonth(direction) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.renderCalendar();
    this.loadAvailableSlots();
  }

  async loadAvailableSlots() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    try {
      this.availableSlots = await API.getAvailableSlots(
        this.selectedMember,
        this.selectedEventType,
        startDate,
        endDate
      );
      this.renderCalendar();
    } catch (error) {
      console.error('Failed to load slots:', error);
    }
  }

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.selectedTime = null;
    this.renderCalendar();
    this.renderTimeSlots();
  }

  renderTimeSlots() {
    const container = document.getElementById('time-slots-container');
    if (!container || !this.selectedDate) return;

    const slots = this.availableSlots[this.selectedDate] || [];
    const date = new Date(this.selectedDate);
    const dateDisplay = `${THAI_DAYS[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]}`;

    if (slots.length === 0) {
      container.innerHTML = `
        <div class="time-slots-date">${dateDisplay}</div>
        <div class="empty-state">
          <p>ไม่มีช่วงเวลาว่างในวันนี้</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="time-slots-date">${dateDisplay}</div>
      <div class="time-slots-grid">
        ${slots.map(slot => `
          <div class="time-slot ${this.selectedTime === slot.time ? 'selected' : ''}"
               data-time="${slot.time}">
            <span class="time-slot-time">${slot.time}</span>
            <span class="time-slot-confirm">ยืนยัน</span>
          </div>
        `).join('')}
      </div>
    `;

    // Add click listeners
    container.querySelectorAll('.time-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const time = slot.dataset.time;
        if (this.selectedTime === time) {
          // Confirm selection - go to next step
          this.goToStep(2);
        } else {
          this.selectTime(time);
        }
      });
    });
  }

  selectTime(time) {
    this.selectedTime = time;
    this.renderTimeSlots();
  }

  setupEventListeners() {
    // Recurring toggle
    const recurringToggle = document.getElementById('recurring-toggle');
    if (recurringToggle) {
      recurringToggle.addEventListener('change', (e) => {
        this.isRecurring = e.target.checked;
        document.querySelector('.recurring-fields')?.classList.toggle('active', this.isRecurring);
      });
    }

    // Recurring frequency
    const frequencySelect = document.getElementById('recurring-frequency');
    if (frequencySelect) {
      frequencySelect.addEventListener('change', (e) => {
        this.recurringOptions.frequency = e.target.value;
      });
    }

    // Recurring occurrences
    const occurrencesInput = document.getElementById('recurring-occurrences');
    if (occurrencesInput) {
      occurrencesInput.addEventListener('change', (e) => {
        this.recurringOptions.occurrences = parseInt(e.target.value) || 4;
      });
    }

    // Form submission
    const form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Back button
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', () => this.goToStep(this.currentStep - 1));
    });
  }

  goToStep(step) {
    if (step < 1) step = 1;
    if (step > 2) step = 2;

    this.currentStep = step;

    document.querySelectorAll('.booking-step').forEach(el => {
      el.classList.remove('active');
    });

    document.querySelector(`[data-step="${step}"]`)?.classList.add('active');

    if (step === 2) {
      this.renderBookingSummary();
    }
  }

  renderBookingSummary() {
    const container = document.getElementById('booking-summary');
    if (!container || !this.selectedDate || !this.selectedTime) return;

    const date = new Date(this.selectedDate);
    const dateDisplay = `${THAI_DAYS[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;

    const locationInfo = CONFIG.LOCATION_TYPES[this.eventTypeData?.location_type] || {};

    container.innerHTML = `
      <div class="summary-item">
        <span class="summary-icon">📅</span>
        <span class="summary-text">${dateDisplay}</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">🕐</span>
        <span class="summary-text">${this.selectedTime} (${this.eventTypeData?.duration || 30} นาที)</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">${locationInfo.icon || '📍'}</span>
        <span class="summary-text">${locationInfo.label || 'ออนไลน์'}</span>
      </div>
      ${this.isRecurring ? `
        <div class="summary-item">
          <span class="summary-icon">🔄</span>
          <span class="summary-text">
            ${CONFIG.RECURRING.FREQUENCIES.find(f => f.value === this.recurringOptions.frequency)?.label}
            (${this.recurringOptions.occurrences} ครั้ง)
          </span>
        </div>
      ` : ''}
    `;
  }

  async handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Get form data
    const formData = {
      event_type_id: this.selectedEventType,
      member_id: this.selectedMember,
      date: this.selectedDate,
      time: this.selectedTime,
      guest_name: form.guest_name.value,
      guest_email: form.guest_email.value,
      guest_phone: form.guest_phone?.value || '',
      notes: form.notes?.value || '',
    };

    // Validate
    if (!formData.guest_name || !formData.guest_email) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> กำลังจอง...';

    try {
      let result;

      if (this.isRecurring) {
        result = await API.createRecurringBooking({
          ...formData,
          frequency: this.recurringOptions.frequency,
          occurrences: this.recurringOptions.occurrences,
          duration: this.eventTypeData?.duration || 30,
        });
      } else {
        result = await API.createBooking(formData);
      }

      if (result.success) {
        // Store booking info for confirmation page
        sessionStorage.setItem('lastBooking', JSON.stringify({
          ...formData,
          booking: result.booking || result,
          eventType: this.eventTypeData,
          member: this.memberData,
          isRecurring: this.isRecurring,
          recurringOptions: this.isRecurring ? this.recurringOptions : null,
        }));

        // Redirect to confirmation page
        window.location.href = 'confirm.html';
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'ยืนยันการจอง';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.bookingPage = new BookingPage();
});
