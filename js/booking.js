/**
 * Calendly Clone - Booking Page Logic
 * =====================================
 * สำหรับนัดหมายกับพี่ง้วง
 */

class BookingPage {
  constructor() {
    this.currentStep = 0; // Start at step 0 (select event type)
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedEventType = null;
    this.eventTypeData = null;
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
    // Render event types first
    this.renderEventTypes();
    this.renderSidebar();
    this.setupEventListeners();
  }

  renderEventTypes() {
    const container = document.getElementById('event-types-container');
    if (!container) return;

    container.innerHTML = CONFIG.EVENT_TYPES.map(event => `
      <div class="event-type-card" data-event-id="${event.id}" style="--event-color: ${event.color}">
        <div class="event-type-icon">${this.getEventIcon(event)}</div>
        <div class="event-type-name">${event.name}</div>
        <div class="event-type-duration">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          ${this.formatDuration(event.duration)}
          ${event.fixed_time ? `<span class="duration-badge highlight">${event.fixed_time.start} - ${event.fixed_time.end}</span>` : ''}
        </div>
        <div class="event-type-description">${event.description}</div>
      </div>
    `).join('');

    // Add click listeners
    container.querySelectorAll('.event-type-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectEventType(card.dataset.eventId);
      });
    });
  }

  getEventIcon(event) {
    const duration = event.duration;
    if (event.id === 'full-day') return '📆';
    if (event.id === 'half-day-afternoon') return '🌅';
    if (duration <= 30) return '⚡';
    if (duration <= 60) return '💬';
    if (duration <= 120) return '📊';
    return '🎯';
  }

  formatDuration(minutes) {
    if (minutes >= 420) return 'ทั้งวัน';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชั่วโมง`;
    }
    return `${minutes} นาที`;
  }

  selectEventType(eventId) {
    this.selectedEventType = eventId;
    this.eventTypeData = CONFIG.EVENT_TYPES.find(e => e.id === eventId);

    // Update card selection state
    document.querySelectorAll('.event-type-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.eventId === eventId);
    });

    // Show selected event info
    const infoEl = document.getElementById('selected-event-info');
    if (infoEl && this.eventTypeData) {
      infoEl.innerHTML = `
        <span>${this.getEventIcon(this.eventTypeData)}</span>
        <span>${this.eventTypeData.name} (${this.formatDuration(this.eventTypeData.duration)})</span>
      `;
    }

    // Go to step 1
    this.goToStep(1);
    this.setupCalendar();
    this.loadAvailableSlots();
    this.renderSidebar();
  }

  renderSidebar() {
    const sidebar = document.querySelector('.booking-sidebar');
    if (!sidebar) return;

    const owner = CONFIG.OWNER;

    sidebar.innerHTML = `
      <div class="host-info">
        <div class="host-avatar">
          ${owner.NAME.charAt(0)}
        </div>
        <div class="host-name">${owner.NAME}</div>
      </div>

      <h2 class="event-title">${this.eventTypeData ? this.eventTypeData.name : 'เลือกประเภทนัดหมาย'}</h2>

      ${this.eventTypeData ? `
        <div class="event-details">
          <div class="event-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>${this.formatDuration(this.eventTypeData.duration)}</span>
          </div>
          <div class="event-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>📹 Google Meet</span>
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
      ` : ''}
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

      let classes = ['calendar-day'];
      if (isPast || isTooFar || isOff) classes.push('disabled');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');

      html += `<div class="${classes.join(' ')}" data-date="${dateStr}">${day}</div>`;
    }

    return html;
  }

  navigateMonth(direction) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.renderCalendar();
  }

  async loadAvailableSlots() {
    // Generate mock slots based on event type
    if (!this.eventTypeData) return;

    // Use default working hours, actual hours will be set per-day in renderTimeSlots
    const workingStart = '09:00';
    const workingEnd = '17:00';
    const duration = this.eventTypeData.duration;

    // If fixed time (like full day or half day), only show that option
    if (this.eventTypeData.fixed_time) {
      this.availableSlots = {
        fixed: [{
          time: this.eventTypeData.fixed_time.start,
          endTime: this.eventTypeData.fixed_time.end,
          display: `${this.eventTypeData.fixed_time.start} - ${this.eventTypeData.fixed_time.end}`
        }]
      };
      return;
    }

    // Generate time slots
    const slots = [];
    const [startHour, startMin] = workingStart.split(':').map(Number);
    const [endHour, endMin] = workingEnd.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    for (let mins = startMinutes; mins + duration <= endMinutes; mins += 30) {
      const hour = Math.floor(mins / 60);
      const min = mins % 60;
      const endMins = mins + duration;
      const endHr = Math.floor(endMins / 60);
      const endMn = endMins % 60;

      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        endTime: `${endHr.toString().padStart(2, '0')}:${endMn.toString().padStart(2, '0')}`,
        display: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} - ${endHr.toString().padStart(2, '0')}:${endMn.toString().padStart(2, '0')}`
      });
    }

    this.availableSlots = { default: slots };
  }

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.selectedTime = null;
    this.renderCalendar();
    this.renderTimeSlots();
  }

  generateSlotsForDay(workingStart, workingEnd, duration) {
    const slots = [];
    const [startHour, startMin] = workingStart.split(':').map(Number);
    const [endHour, endMin] = workingEnd.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    for (let mins = startMinutes; mins + duration <= endMinutes; mins += 30) {
      const hour = Math.floor(mins / 60);
      const min = mins % 60;
      const endMins = mins + duration;
      const endHr = Math.floor(endMins / 60);
      const endMn = endMins % 60;

      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        endTime: `${endHr.toString().padStart(2, '0')}:${endMn.toString().padStart(2, '0')}`,
        display: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} - ${endHr.toString().padStart(2, '0')}:${endMn.toString().padStart(2, '0')}`
      });
    }

    return slots;
  }

  renderTimeSlots() {
    const container = document.getElementById('time-slots-container');
    if (!container || !this.selectedDate) return;

    const date = new Date(this.selectedDate);
    const dayOfWeek = date.getDay();
    const dateDisplay = `${THAI_DAYS[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]}`;

    // Get working hours for selected day
    const workingHours = CONFIG.WORKING_HOURS[dayOfWeek];

    // Get slots - generate based on the day's working hours
    let slots;
    if (this.eventTypeData?.fixed_time) {
      slots = this.availableSlots.fixed;
    } else if (workingHours) {
      // Generate slots for this specific day's working hours
      slots = this.generateSlotsForDay(workingHours.start, workingHours.end, this.eventTypeData.duration);
    } else {
      slots = [];
    }

    if (!slots || slots.length === 0) {
      container.innerHTML = `
        <div class="time-slots-date">${dateDisplay}</div>
        <div class="empty-state">
          <p>ไม่มีช่วงเวลาว่าง</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="time-slots-date">${dateDisplay}</div>
      <div class="time-slots-grid">
        ${slots.map(slot => `
          <div class="time-slot ${this.selectedTime === slot.time ? 'selected' : ''}"
               data-time="${slot.time}" data-end="${slot.endTime}">
            <span class="time-slot-time">${slot.display}</span>
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
          this.selectTime(time, slot.dataset.end);
        }
      });
    });
  }

  selectTime(time, endTime) {
    this.selectedTime = time;
    this.selectedEndTime = endTime;
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

    // Back to types button
    document.querySelectorAll('[data-action="back-to-types"]').forEach(btn => {
      btn.addEventListener('click', () => this.goToStep(0));
    });
  }

  goToStep(step) {
    if (step < 0) step = 0;
    if (step > 2) step = 2;

    this.currentStep = step;

    document.querySelectorAll('.booking-step').forEach(el => {
      el.classList.remove('active');
      el.style.display = 'none';
    });

    const stepEl = document.querySelector(`[data-step="${step}"]`);
    if (stepEl) {
      stepEl.classList.add('active');
      stepEl.style.display = 'block';
    }

    if (step === 2) {
      this.renderBookingSummary();
    }
  }

  renderBookingSummary() {
    const container = document.getElementById('booking-summary');
    if (!container || !this.selectedDate || !this.selectedTime) return;

    const date = new Date(this.selectedDate);
    const dateDisplay = `${THAI_DAYS[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;

    container.innerHTML = `
      <div class="summary-item">
        <span class="summary-icon">🎯</span>
        <span class="summary-text">${this.eventTypeData?.name || 'การนัดหมาย'}</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">📅</span>
        <span class="summary-text">${dateDisplay}</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">🕐</span>
        <span class="summary-text">${this.selectedTime} - ${this.selectedEndTime} (${this.formatDuration(this.eventTypeData?.duration || 30)})</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">👤</span>
        <span class="summary-text">กับ ${CONFIG.OWNER.NAME}</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">📹</span>
        <span class="summary-text">Google Meet (จะส่งลิงก์ให้ทางอีเมล)</span>
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
      event_type_name: this.eventTypeData?.name,
      duration: this.eventTypeData?.duration,
      owner_email: CONFIG.OWNER.EMAIL,
      owner_name: CONFIG.OWNER.NAME,
      date: this.selectedDate,
      time: this.selectedTime,
      end_time: this.selectedEndTime,
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
