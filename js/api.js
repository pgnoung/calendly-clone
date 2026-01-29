/**
 * Just in time meeting - API Module
 * ==================================
 * Module สำหรับติดต่อกับ Make.com Backend
 */

const API = {
  /**
   * Helper function for making API calls
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Get available time slots
   * @param {string} memberId - Team member ID
   * @param {string} eventTypeId - Event type ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async getAvailableSlots(memberId, eventTypeId, startDate, endDate) {
    // ถ้ายังไม่ได้ตั้งค่า API URL ให้ใช้ mock data
    if (CONFIG.API.GET_AVAILABLE_SLOTS === 'YOUR_WEBHOOK_URL_HERE') {
      return this.mockGetAvailableSlots(memberId, eventTypeId, startDate, endDate);
    }

    const url = `${CONFIG.API.GET_AVAILABLE_SLOTS}?memberId=${memberId}&eventTypeId=${eventTypeId}&startDate=${startDate}&endDate=${endDate}`;
    return await this.request(url);
  },

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    if (CONFIG.API.CREATE_BOOKING === 'YOUR_WEBHOOK_URL_HERE') {
      return this.mockCreateBooking(bookingData);
    }

    return await this.request(CONFIG.API.CREATE_BOOKING, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId, cancelAll = false) {
    if (CONFIG.API.CANCEL_BOOKING === 'YOUR_WEBHOOK_URL_HERE') {
      return this.mockCancelBooking(bookingId, cancelAll);
    }

    return await this.request(CONFIG.API.CANCEL_BOOKING, {
      method: 'POST',
      body: JSON.stringify({ bookingId, cancelAll }),
    });
  },

  /**
   * Get team bookings
   */
  async getTeamBookings(memberIds = [], startDate, endDate) {
    if (CONFIG.API.GET_TEAM_BOOKINGS === 'YOUR_WEBHOOK_URL_HERE') {
      return this.mockGetTeamBookings(memberIds, startDate, endDate);
    }

    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(memberIds.length && { memberIds: memberIds.join(',') }),
    });

    return await this.request(`${CONFIG.API.GET_TEAM_BOOKINGS}?${params}`);
  },

  /**
   * Create recurring booking
   */
  async createRecurringBooking(recurringData) {
    if (CONFIG.API.CREATE_RECURRING === 'YOUR_WEBHOOK_URL_HERE') {
      return this.mockCreateRecurringBooking(recurringData);
    }

    return await this.request(CONFIG.API.CREATE_RECURRING, {
      method: 'POST',
      body: JSON.stringify(recurringData),
    });
  },

  /**
   * Get team members
   */
  async getTeamMembers() {
    if (CONFIG.API.GET_TEAM_MEMBERS === 'YOUR_WEBHOOK_URL_HERE') {
      return CONFIG.TEAM_MEMBERS;
    }

    return await this.request(CONFIG.API.GET_TEAM_MEMBERS);
  },

  /**
   * Get event types
   */
  async getEventTypes() {
    if (CONFIG.API.GET_EVENT_TYPES === 'YOUR_WEBHOOK_URL_HERE') {
      return CONFIG.EVENT_TYPES;
    }

    return await this.request(CONFIG.API.GET_EVENT_TYPES);
  },

  // ============================================
  // Mock Functions (สำหรับทดสอบก่อนเชื่อม API)
  // ============================================

  /**
   * Mock: Get available slots
   */
  mockGetAvailableSlots(memberId, eventTypeId, startDate, endDate) {
    const eventType = CONFIG.EVENT_TYPES.find(e => e.id === eventTypeId) || CONFIG.EVENT_TYPES[0];
    const duration = eventType.duration;
    const slots = {};

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const workingHours = CONFIG.WORKING_HOURS[dayOfWeek];

      if (!workingHours) continue;

      const dateStr = d.toISOString().split('T')[0];
      slots[dateStr] = [];

      const [startHour, startMin] = workingHours.start.split(':').map(Number);
      const [endHour, endMin] = workingHours.end.split(':').map(Number);

      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      while (currentTime + duration <= endTime) {
        // Random availability (80% available for demo)
        if (Math.random() > 0.2) {
          const hour = Math.floor(currentTime / 60);
          const min = currentTime % 60;
          slots[dateStr].push({
            time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
            available: true,
          });
        }
        currentTime += 30; // 30 minute intervals
      }
    }

    return Promise.resolve(slots);
  },

  /**
   * Mock: Create booking
   */
  mockCreateBooking(bookingData) {
    const bookingId = 'BK' + Date.now().toString(36).toUpperCase();
    const meetingLink = `https://meet.google.com/mock-${bookingId.toLowerCase()}`;

    return Promise.resolve({
      success: true,
      booking: {
        id: bookingId,
        ...bookingData,
        status: 'confirmed',
        meeting_link: meetingLink,
        google_event_id: 'mock_event_' + bookingId,
        created_at: new Date().toISOString(),
      },
    });
  },

  /**
   * Mock: Cancel booking
   */
  mockCancelBooking(bookingId, cancelAll) {
    return Promise.resolve({
      success: true,
      message: cancelAll ? 'All recurring bookings cancelled' : 'Booking cancelled',
      bookingId,
    });
  },

  /**
   * Mock: Get team bookings
   */
  mockGetTeamBookings(memberIds, startDate, endDate) {
    const mockBookings = [
      {
        id: 'BK001',
        event_type_id: 'meeting-30',
        event_name: 'ประชุมทั่วไป',
        member_id: 'member-1',
        member_name: 'สมชาย ใจดี',
        guest_name: 'คุณลูกค้า A',
        guest_email: 'customer_a@example.com',
        guest_phone: '081-234-5678',
        start_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        end_datetime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        is_recurring: false,
      },
      {
        id: 'BK002',
        event_type_id: 'meeting-60',
        event_name: 'ประชุมเชิงลึก',
        member_id: 'member-2',
        member_name: 'สมหญิง รักงาน',
        guest_name: 'คุณลูกค้า B',
        guest_email: 'customer_b@example.com',
        guest_phone: '089-876-5432',
        start_datetime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        end_datetime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        meeting_link: 'https://meet.google.com/xyz-uvwx-rst',
        is_recurring: true,
        recurring_group_id: 'RG001',
      },
      {
        id: 'BK003',
        event_type_id: 'consultation',
        event_name: 'ให้คำปรึกษา',
        member_id: 'member-1',
        member_name: 'สมชาย ใจดี',
        guest_name: 'คุณลูกค้า C',
        guest_email: 'customer_c@example.com',
        guest_phone: '086-111-2222',
        start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_datetime: new Date(Date.now() + 24.75 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        meeting_link: null,
        is_recurring: false,
      },
    ];

    return Promise.resolve(mockBookings);
  },

  /**
   * Mock: Create recurring booking
   */
  mockCreateRecurringBooking(recurringData) {
    const recurringGroupId = 'RG' + Date.now().toString(36).toUpperCase();
    const bookings = [];
    const { frequency, occurrences, startDate, time } = recurringData;

    let currentDate = new Date(startDate);
    const intervalDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;

    for (let i = 0; i < occurrences; i++) {
      const bookingId = `BK${Date.now().toString(36).toUpperCase()}${i}`;
      const startDateTime = new Date(currentDate);
      const [hours, minutes] = time.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (recurringData.duration || 30));

      bookings.push({
        id: bookingId,
        recurring_group_id: recurringGroupId,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        status: 'confirmed',
      });

      currentDate.setDate(currentDate.getDate() + intervalDays);
    }

    return Promise.resolve({
      success: true,
      recurring_group_id: recurringGroupId,
      bookings,
      total_created: bookings.length,
    });
  },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
