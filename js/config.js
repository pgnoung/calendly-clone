/**
 * Just in time meeting - Configuration
 * =====================================
 * กรุณาแก้ไข URLs ด้านล่างให้ตรงกับ Make Webhooks ของคุณ
 */

const CONFIG = {
  // Make.com Webhook URLs
  // แก้ไข URLs เหล่านี้หลังจากสร้าง Scenarios ใน Make แล้ว
  API: {
    GET_AVAILABLE_SLOTS: 'https://hook.us1.make.com/khbt82jzes8os7xwj8gf8enf5p9yr5',
    CREATE_BOOKING: 'https://hook.us1.make.com/uohh6c67gcznzxhp0g8oe0bhkede3hon',
    CANCEL_BOOKING: 'YOUR_WEBHOOK_URL_HERE',
    GET_TEAM_BOOKINGS: 'https://hook.us1.make.com/fgzoj4fg4y8ydz4h1rshtndtry7mvs',
    CREATE_RECURRING: 'YOUR_WEBHOOK_URL_HERE',
    GET_TEAM_MEMBERS: 'YOUR_WEBHOOK_URL_HERE',
    GET_EVENT_TYPES: 'YOUR_WEBHOOK_URL_HERE',
        GET_FREE_BUSY: 'https://hook.us1.make.com/65mv35vx2yqg3ya8xramo837feubxwor',
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
    ADVANCE_BOOKING_DAYS: 180, // สามารถจองล่วงหน้าได้กี่วัน (6 เดือน)
    MIN_NOTICE_HOURS: 24, // ต้องจองล่วงหน้าอย่างน้อยกี่ชั่วโมง
  },

  // Owner Info (เจ้าของปฏิทิน)
  OWNER: {
    NAME: 'พี่ง้วง',
    EMAIL: 'd.chawalid@gmail.com',
    CALENDAR_ID: 'd.chawalid@gmail.com',
  },

  // Company Info
  COMPANY: {
    NAME: 'พี่ง้วง - นัดหมาย',
    LOGO: './assets/images/logo.png',
    PRIMARY_COLOR: '#0069ff',
  },

  // Working Hours (เวลาทำงานของพี่ง้วง)
  WORKING_HOURS: {
    0: null, // Sunday - off
    1: { start: '09:00', end: '17:00' }, // Monday
    2: { start: '09:00', end: '17:00' }, // Tuesday
    3: { start: '09:00', end: '17:00' }, // Wednesday
    4: { start: '09:00', end: '17:00' }, // Thursday
    5: { start: '09:00', end: '17:00' }, // Friday
    6: { start: '09:00', end: '12:00' }, // Saturday
  },

  // Event Types - ตัวเลือกการนัดหมาย
  EVENT_TYPES: [
    {
      id: 'quick-30',
      name: 'นัดด่วน 30 นาที',
      duration: 30,
      description: 'ประชุมสั้นๆ 30 นาที',
      color: '#10b981',
      location_type: 'google_meet',
    },
    {
      id: 'meeting-1hr',
      name: 'ประชุม 1 ชั่วโมง',
      duration: 60,
      description: 'ประชุมมาตรฐาน 1 ชั่วโมง',
      color: '#0069ff',
      location_type: 'google_meet',
    },
    {
      id: 'meeting-2hr',
      name: 'ประชุม 2 ชั่วโมง',
      duration: 120,
      description: 'ประชุมเชิงลึก 2 ชั่วโมง',
      color: '#8b5cf6',
      location_type: 'google_meet',
    },
    {
      id: 'meeting-3hr',
      name: 'ประชุม 3 ชั่วโมง',
      duration: 180,
      description: 'ประชุมยาว 3 ชั่วโมง',
      color: '#f59e0b',
      location_type: 'google_meet',
    },
    {
      id: 'meeting-4hr',
      name: 'ประชุม 4 ชั่วโมง',
      duration: 240,
      description: 'Workshop หรือ Training 4 ชั่วโมง',
      color: '#ec4899',
      location_type: 'google_meet',
    },
    {
      id: 'half-day-afternoon',
      name: 'ครึ่งวันบ่าย',
      duration: 240,
      description: 'จองช่วงบ่าย 13:00 - 17:00',
      color: '#f97316',
      location_type: 'google_meet',
      fixed_time: { start: '13:00', end: '17:00' },
    },
    {
      id: 'full-day',
      name: 'ทั้งวัน',
      duration: 420,
      description: 'จองทั้งวัน 10:00 - 17:00',
      color: '#ef4444',
      location_type: 'google_meet',
      fixed_time: { start: '10:00', end: '17:00' },
    },
  ],

  // เจ้าของปฏิทินคนเดียว
  TEAM_MEMBERS: [
    {
      id: 'owner',
      name: 'พี่ง้วง',
      email: 'd.chawalid@gmail.com',
      avatar: '',
      role: 'owner',
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

// =============================================
// Storage Functions - บันทึกและโหลดค่าจาก localStorage
// =============================================

const STORAGE_KEYS = {
  WORKING_HOURS: 'jitm_working_hours',
  EVENT_TYPES: 'jitm_event_types',
  SETTINGS: 'jitm_settings',
};

// โหลด Working Hours จาก localStorage (ถ้ามี)
function loadWorkingHours() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKING_HOURS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load working hours from localStorage:', e);
  }
  return CONFIG.WORKING_HOURS;
}

// บันทึก Working Hours ลง localStorage
function saveWorkingHours(hours) {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKING_HOURS, JSON.stringify(hours));
    // อัพเดท CONFIG ด้วย
    Object.assign(CONFIG.WORKING_HOURS, hours);
    return true;
  } catch (e) {
    console.error('Could not save working hours:', e);
    return false;
  }
}

// โหลด Event Types จาก localStorage (ถ้ามี)
function loadEventTypes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENT_TYPES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load event types from localStorage:', e);
  }
  return CONFIG.EVENT_TYPES;
}

// บันทึก Event Types ลง localStorage
function saveEventTypes(eventTypes) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENT_TYPES, JSON.stringify(eventTypes));
    CONFIG.EVENT_TYPES = eventTypes;
    return true;
  } catch (e) {
    console.error('Could not save event types:', e);
    return false;
  }
}

// ฟังก์ชันรวมสำหรับใช้ค่าจาก localStorage แทน default
function getWorkingHours() {
  return loadWorkingHours();
}

function getEventTypes() {
  return loadEventTypes();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, THAI_DAYS, THAI_DAYS_SHORT, THAI_MONTHS, THAI_MONTHS_SHORT, loadWorkingHours, saveWorkingHours, loadEventTypes, saveEventTypes, getWorkingHours, getEventTypes, STORAGE_KEYS };
}
