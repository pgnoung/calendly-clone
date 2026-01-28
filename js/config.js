/**
 * Calendly Clone - Configuration
 * ================================
 * กรุณาแก้ไข URLs ด้านล่างให้ตรงกับ Make Webhooks ของคุณ
 */

const CONFIG = {
  // Make.com Webhook URLs
  // แก้ไข URLs เหล่านี้หลังจากสร้าง Scenarios ใน Make แล้ว
  API: {
    GET_AVAILABLE_SLOTS: 'YOUR_WEBHOOK_URL_HERE',
    CREATE_BOOKING: 'YOUR_WEBHOOK_URL_HERE',
    CANCEL_BOOKING: 'YOUR_WEBHOOK_URL_HERE',
    GET_TEAM_BOOKINGS: 'YOUR_WEBHOOK_URL_HERE',
    CREATE_RECURRING: 'YOUR_WEBHOOK_URL_HERE',
    GET_TEAM_MEMBERS: 'YOUR_WEBHOOK_URL_HERE',
    GET_EVENT_TYPES: 'YOUR_WEBHOOK_URL_HERE',
    UPDATE_AVAILABILITY: 'YOUR_WEBHOOK_URL_HERE',
  },

  // Default Settings
  DEFAULTS: {
    TIMEZONE: 'Asia/Bangkok',
    DATE_FORMAT: 'th-TH',
    TIME_FORMAT: 'HH:mm',
    SLOT_DURATION: 30, // minutes
    BUFFER_BEFORE: 0,
    BUFFER_AFTER: 0,
    ADVANCE_BOOKING_DAYS: 60, // สามารถจองล่วงหน้าได้กี่วัน
    MIN_NOTICE_HOURS: 24, // ต้องจองล่วงหน้าอย่างน้อยกี่ชั่วโมง
  },

  // Company Info
  COMPANY: {
    NAME: 'Your Company',
    LOGO: './assets/images/logo.png',
    PRIMARY_COLOR: '#0069ff',
  },

  // Working Hours (default)
  WORKING_HOURS: {
    0: null, // Sunday - off
    1: { start: '09:00', end: '17:00' }, // Monday
    2: { start: '09:00', end: '17:00' }, // Tuesday
    3: { start: '09:00', end: '17:00' }, // Wednesday
    4: { start: '09:00', end: '17:00' }, // Thursday
    5: { start: '09:00', end: '17:00' }, // Friday
    6: null, // Saturday - off
  },

  // Event Types (mock data - จะถูกแทนที่ด้วยข้อมูลจาก API)
  EVENT_TYPES: [
    {
      id: 'meeting-30',
      name: 'ประชุมทั่วไป',
      duration: 30,
      description: 'การประชุมแบบสั้น 30 นาที',
      color: '#0069ff',
      location_type: 'google_meet',
    },
    {
      id: 'meeting-60',
      name: 'ประชุมเชิงลึก',
      duration: 60,
      description: 'การประชุมเชิงลึก 1 ชั่วโมง',
      color: '#10b981',
      location_type: 'google_meet',
    },
    {
      id: 'consultation',
      name: 'ให้คำปรึกษา',
      duration: 45,
      description: 'ปรึกษาเรื่องงาน',
      color: '#f59e0b',
      location_type: 'phone',
    },
  ],

  // Team Members (mock data - จะถูกแทนที่ด้วยข้อมูลจาก API)
  TEAM_MEMBERS: [
    {
      id: 'member-1',
      name: 'สมชาย ใจดี',
      email: 'somchai@company.com',
      avatar: '',
      role: 'admin',
    },
    {
      id: 'member-2',
      name: 'สมหญิง รักงาน',
      email: 'somying@company.com',
      avatar: '',
      role: 'member',
    },
  ],

  // Recurring Options
  RECURRING: {
    FREQUENCIES: [
      { value: 'weekly', label: 'ทุกสัปดาห์' },
      { value: 'biweekly', label: 'ทุก 2 สัปดาห์' },
      { value: 'monthly', label: 'ทุกเดือน' },
    ],
    MAX_OCCURRENCES: 12, // จำนวนครั้งสูงสุด
  },

  // Location Types
  LOCATION_TYPES: {
    google_meet: {
      label: 'Google Meet',
      icon: '📹',
    },
    zoom: {
      label: 'Zoom',
      icon: '💻',
    },
    phone: {
      label: 'โทรศัพท์',
      icon: '📞',
    },
    in_person: {
      label: 'พบหน้า',
      icon: '📍',
    },
  },
};

// Thai day names
const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

// Thai month names
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, THAI_DAYS, THAI_DAYS_SHORT, THAI_MONTHS, THAI_MONTHS_SHORT };
}
