# Calendly Clone - Documentation for Handover
## ระบบนัดหมายออนไลน์สำหรับ "พี่ง้วง"

---

# 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1 Product Overview

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อโปรเจค** | Calendly Clone - BookingApp |
| **เจ้าของระบบ** | พี่ง้วง (d.chawalid@gmail.com) |
| **วัตถุประสงค์** | ระบบนัดหมายออนไลน์แบบ Calendly สำหรับการจองประชุมกับพี่ง้วง |
| **Target Users** | ลูกค้า/ผู้ที่ต้องการนัดหมายประชุมกับพี่ง้วง |

## 1.2 Key Features

### ฝั่งผู้จอง (Guest/Customer)
- [x] เลือกประเภทการนัดหมาย (7 แบบ: 30 นาที - ทั้งวัน)
- [x] ดูปฏิทินและเลือกวันที่ว่าง
- [x] เลือกช่วงเวลาที่ต้องการ
- [x] กรอกข้อมูลติดต่อ (ชื่อ, อีเมล, เบอร์โทร, หมายเหตุ)
- [x] รับ Calendar Invite + Google Meet link ทางอีเมล
- [x] หน้ายืนยันการจองสำเร็จ

### ฝั่งเจ้าของ (Owner Dashboard)
- [x] ดูรายการนัดหมายทั้งหมด
- [x] ตั้งค่าเวลาทำงาน (Working Hours)
- [x] จัดการประเภทการนัดหมาย
- [ ] ยกเลิกการจอง (Pending)
- [ ] ส่งอีเมลแจ้งเตือน (Pending)

## 1.3 Business Rules

### เวลาทำงาน (Working Hours)
| วัน | เวลา |
|-----|------|
| จันทร์ - ศุกร์ | 09:00 - 17:00 |
| เสาร์ | 09:00 - 12:00 |
| อาทิตย์ | ปิด |

### ข้อจำกัด
- จองล่วงหน้าได้สูงสุด 60 วัน
- ต้องจองล่วงหน้าอย่างน้อย 24 ชั่วโมง
- Time slot ทุกๆ 30 นาที

## 1.4 Event Types (ประเภทการนัดหมาย)

| ID | ชื่อ | ระยะเวลา | รายละเอียด |
|----|------|----------|-----------|
| quick-30 | นัดด่วน 30 นาที | 30 นาที | ประชุมสั้นๆ |
| meeting-1hr | ประชุม 1 ชั่วโมง | 60 นาที | ประชุมมาตรฐาน |
| meeting-2hr | ประชุม 2 ชั่วโมง | 120 นาที | ประชุมเชิงลึก |
| meeting-3hr | ประชุม 3 ชั่วโมง | 180 นาที | ประชุมยาว |
| meeting-4hr | ประชุม 4 ชั่วโมง | 240 นาที | Workshop/Training |
| half-day-afternoon | ครึ่งวันบ่าย | 240 นาที | 13:00 - 17:00 |
| full-day | ทั้งวัน | 420 นาที | 10:00 - 17:00 |

---

# 2. TECHNICAL SPECIFICATION (SPEC)

## 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (Vercel - Static HTML/JS)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  book.html  │  │ dashboard   │  │  confirm    │            │
│  │  (จองนัด)   │  │  (Admin)    │  │  (ยืนยัน)   │            │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘            │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
          │ HTTP POST      │ HTTP POST
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MAKE.COM (Backend)                         │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │  Create Booking     │    │  Get All Bookings   │            │
│  │  Scenario           │    │  Scenario           │            │
│  │  (ID: 4528760)      │    │  (ID: 4528809)      │            │
│  └──────────┬──────────┘    └──────────┬──────────┘            │
│             │                          │                        │
│             ▼                          ▼                        │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │  Google Calendar    │    │   Google Sheets     │            │
│  │  (Create Event)     │    │   (Read Data)       │            │
│  └──────────┬──────────┘    └─────────────────────┘            │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐                                       │
│  │   Google Sheets     │                                       │
│  │   (Add Row)         │                                       │
│  └─────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE SERVICES                            │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │  Google Calendar    │    │   Google Sheets     │            │
│  │  (d.chawalid@...)   │    │   Booking Database  │            │
│  │  + Google Meet      │    │                     │            │
│  └─────────────────────┘    └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | HTML5, CSS3, Vanilla JS | User Interface |
| Hosting | Vercel | Static site hosting + Auto-deploy |
| Backend | Make.com (Integromat) | Automation & API |
| Database | Google Sheets | Data storage |
| Calendar | Google Calendar API | Event management |
| Video Call | Google Meet | Auto-generated meeting links |

## 2.3 API Endpoints (Make.com Webhooks)

### 2.3.1 Create Booking
```
URL: https://hook.us1.make.com/uohh6c67gcznzxhp0g8oe0bhkede3hon
Method: POST
Content-Type: application/json

Request Body:
{
  "event_type": "quick-30",
  "event_name": "นัดด่วน 30 นาที",
  "date": "2025-01-30",
  "start_time": "14:00",
  "end_time": "14:30",
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "0891234567",
  "notes": "หมายเหตุเพิ่มเติม",
  "timezone": "Asia/Bangkok"
}

Response:
{
  "success": true,
  "message": "Booking created successfully"
}
```

### 2.3.2 Get All Bookings
```
URL: https://hook.us1.make.com/fgzoj4fg4y8ydz4h1rshtndtry7mvs
Method: POST
Content-Type: application/json

Request Body: {} (empty)

Response: Array of booking objects from Google Sheets
```

## 2.4 Database Schema (Google Sheets)

**Sheet Name:** Bookings
**Spreadsheet URL:** https://docs.google.com/spreadsheets/d/1CONisp5FS-Iz2eHxBIoIQuTTVePaEbv6kyseISNFkF0/edit

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | booking_id | String | UUID (auto-generated) |
| B | event_type | String | Event type ID |
| C | event_name | String | Event type name |
| D | date | Date | Booking date (YYYY-MM-DD) |
| E | start_time | Time | Start time (HH:mm) |
| F | end_time | Time | End time (HH:mm) |
| G | guest_name | String | Guest's name |
| H | guest_email | Email | Guest's email |
| I | guest_phone | String | Guest's phone |
| J | notes | Text | Additional notes |
| K | status | String | confirmed/cancelled/completed |
| L | google_event_id | String | Google Calendar Event ID |
| M | meeting_link | URL | Google Meet link |
| N | created_at | DateTime | Booking creation timestamp |

## 2.5 File Structure

```
calendly-clone/
├── index.html              # Landing page
├── book.html               # Booking page (main user flow)
├── dashboard.html          # Admin dashboard
├── confirm.html            # Booking confirmation page
├── css/
│   ├── main.css           # Global styles
│   ├── booking.css        # Booking page styles
│   └── dashboard.css      # Dashboard styles
├── js/
│   ├── config.js          # Configuration (URLs, settings)
│   ├── api.js             # API calls to Make.com
│   ├── booking.js         # Booking page logic
│   └── dashboard.js       # Dashboard logic
├── assets/
│   └── images/
└── DOCUMENTATION.md        # This file
```

## 2.6 Key Configuration (js/config.js)

```javascript
const CONFIG = {
  API: {
    CREATE_BOOKING: 'https://hook.us1.make.com/uohh6c67gcznzxhp0g8oe0bhkede3hon',
    GET_TEAM_BOOKINGS: 'https://hook.us1.make.com/fgzoj4fg4y8ydz4h1rshtndtry7mvs',
    CANCEL_BOOKING: 'YOUR_WEBHOOK_URL_HERE',  // TODO
  },

  OWNER: {
    NAME: 'พี่ง้วง',
    EMAIL: 'd.chawalid@gmail.com',
    CALENDAR_ID: 'd.chawalid@gmail.com',
  },

  WORKING_HOURS: {
    0: null,                              // Sunday - off
    1: { start: '09:00', end: '17:00' },  // Monday
    2: { start: '09:00', end: '17:00' },  // Tuesday
    3: { start: '09:00', end: '17:00' },  // Wednesday
    4: { start: '09:00', end: '17:00' },  // Thursday
    5: { start: '09:00', end: '17:00' },  // Friday
    6: { start: '09:00', end: '12:00' },  // Saturday
  },

  DEFAULTS: {
    TIMEZONE: 'Asia/Bangkok',
    ADVANCE_BOOKING_DAYS: 60,
    MIN_NOTICE_HOURS: 24,
  },
};
```

---

# 3. MAKE.COM SCENARIOS

## 3.1 Create Booking Scenario (ID: 4528760)

### Flow:
```
[Webhook] → [Google Calendar: Create Event] → [Google Sheets: Add Row] → [Webhook Response]
```

### Webhook: Create Booking v2
- URL: `https://hook.us1.make.com/uohh6c67gcznzxhp0g8oe0bhkede3hon`
- Data structure: Determined from test payload

### Google Calendar: Create an Event
- Connection: d.chawalid@gmail.com
- Create an Event: **In Detail**
- Calendar ID: d.chawalid@gmail.com (Primary Calendar)
- Event Name: `{{event_name}}` (from webhook)
- Start Date: `{{date}} {{start_time}}`
- End Date: `{{date}} {{end_time}}`
- Time zone: Asia/Bangkok
- Add Google Meet Video Conferencing: **Yes**
- All Day Event: No

### Google Sheets: Add a Row
- Connection: d.chawalid@gmail.com
- Spreadsheet: Booking Database
- Sheet: Bookings
- Values mapped from webhook data + Google Calendar output

### Webhook Response
```json
{
  "success": true,
  "message": "Booking created successfully"
}
```

## 3.2 Get All Bookings Scenario (ID: 4528809)

### Flow:
```
[Webhook] → [Google Sheets: Search Rows] → [Webhook Response]
```

### Configuration:
- Spreadsheet: Booking Database
- Sheet: Bookings
- Column Range: A-Z
- Limit: 100

---

# 4. DEPLOYMENT & ACCESS

## 4.1 URLs

| Environment | URL |
|-------------|-----|
| Production (Vercel) | https://calendly-clone-psi.vercel.app |
| GitHub Repository | https://github.com/pgnoung/calendly-clone |
| Google Sheets | https://docs.google.com/spreadsheets/d/1CONisp5FS-Iz2eHxBIoIQuTTVePaEbv6kyseISNFkF0 |
| Make.com Dashboard | https://us1.make.com/322427/scenarios |

## 4.2 Account Access Required

| Service | Account | Purpose |
|---------|---------|---------|
| GitHub | pgnoung | Source code |
| Vercel | pngoungs-projects | Hosting |
| Make.com | Organization 322427 | Backend automation |
| Google | d.chawalid@gmail.com | Calendar, Sheets, OAuth |

---

# 5. PENDING TASKS / BACKLOG

## 5.1 High Priority
- [ ] **Cancel Booking Scenario** - Allow users to cancel their bookings
- [ ] **Email Confirmation** - Send confirmation email to guest after booking
- [ ] **Real-time Availability Check** - Check Google Calendar for conflicts

## 5.2 Medium Priority
- [ ] **Recurring Bookings** - Support weekly/monthly recurring meetings
- [ ] **Reschedule Feature** - Allow users to change booking time
- [ ] **Dashboard Filters** - Filter bookings by date, status

## 5.3 Nice to Have
- [ ] **SMS Notifications** - Send SMS reminders
- [ ] **Buffer Time** - Add buffer between meetings
- [ ] **Multiple Team Members** - Support multiple calendars
- [ ] **Custom Branding** - Allow logo/color customization

---

# 6. BUSINESS MODEL & ANALYTICS (BMAD)

## 6.1 Business Model Canvas

### Value Proposition
- ลดเวลาการประสานงานนัดหมาย
- ลูกค้าจองได้ 24/7 โดยไม่ต้องติดต่อโดยตรง
- สร้าง Google Meet อัตโนมัติ
- บันทึกข้อมูลการนัดหมายใน Google Sheets

### Key Metrics to Track
| Metric | Description |
|--------|-------------|
| Total Bookings | จำนวนการจองทั้งหมด |
| Booking by Type | จำนวนการจองแยกตามประเภท |
| Cancellation Rate | อัตราการยกเลิก |
| Peak Booking Hours | ช่วงเวลาที่มีการจองมากที่สุด |
| Lead Time | ระยะเวลาล่วงหน้าที่ลูกค้าจอง |

## 6.2 Cost Analysis

| Item | Cost | Note |
|------|------|------|
| Vercel Hosting | Free | Hobby plan |
| Make.com | Free/Paid | 1,000 ops/month free |
| Google Services | Free | Personal account |
| Domain (optional) | ~$10/year | Custom domain |

## 6.3 Scaling Considerations

เมื่อต้องการขยายระบบ:
1. **Make.com** - อัพเกรด plan ถ้า operations เกิน limit
2. **Database** - ย้ายจาก Google Sheets ไป Airtable/Firebase
3. **Multiple Calendars** - รองรับหลายคนในทีม
4. **Payment Integration** - เพิ่ม Stripe สำหรับจองแบบเสียเงิน

---

# 7. TROUBLESHOOTING GUIDE

## 7.1 Common Issues

### Webhook Returns 404
**สาเหตุ:** Scenario ไม่ได้เปิด หรือ webhook ต้อง redetermine data structure
**แก้ไข:**
1. เปิด Scenario ใน Make.com
2. คลิก "Run once"
3. ส่ง test request
4. ถ้ายังไม่ได้ ให้สร้าง webhook ใหม่

### Calendar Event ไม่ถูกสร้าง
**สาเหตุ:** Google Calendar module ตั้งค่าไม่ถูกต้อง
**แก้ไข:**
1. ตรวจสอบ Connection ว่า authorize แล้ว
2. ใช้ "In Detail" mode แทน "Quickly"
3. Map Start Date = `{{date}} {{start_time}}`

### วันเสาร์/อาทิตย์ เลือกไม่ได้
**สาเหตุ:** `CONFIG.WORKING_HOURS` ตั้งค่าเป็น null
**แก้ไข:** เพิ่มเวลาทำงานใน config.js

## 7.2 Testing Checklist

- [ ] ทดสอบจองวันธรรมดา
- [ ] ทดสอบจองวันเสาร์
- [ ] ทดสอบเลือก event type ทุกแบบ
- [ ] ตรวจสอบ Google Calendar ว่ามี event
- [ ] ตรวจสอบ Google Sheets ว่ามีข้อมูล
- [ ] ตรวจสอบ Google Meet link

---

# 8. CHANGE LOG

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-29 | 1.0.0 | Initial release - Basic booking system |
| 2025-01-29 | 1.0.1 | Fixed Google Calendar "Quickly" → "In Detail" |
| 2025-01-29 | 1.0.2 | Added Saturday working hours support |
| 2025-01-29 | 1.0.3 | Updated webhook URL (Create Booking v2) |

---

# 9. CONTACT & SUPPORT

| Role | Name | Contact |
|------|------|---------|
| Project Owner | พี่ง้วง | d.chawalid@gmail.com |
| Developer | Claude AI | via Claude Code |

---

*Document generated: January 29, 2025*
*Last updated: January 29, 2025*
