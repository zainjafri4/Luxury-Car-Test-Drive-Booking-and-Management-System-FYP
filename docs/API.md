# API Reference — Aurum Drive

Base URL: `http://localhost:4000/api/v1`  
Interactive Swagger UI: `http://localhost:4000/api/docs`  
OpenAPI JSON Specification: `http://localhost:4000/api/docs.json`

## Global Conventions
- All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require `Content-Type: application/json` or custom header `X-Requested-With: XMLHttpRequest` for CSRF mitigation.
- Authentication: Session tokens issued via httpOnly, SameSite=Lax cookies (`access_token` [15m], `refresh_token` [7d]) or Bearer Authorization header.
- Uniform Error Shape:
  ```json
  {
    "error": {
      "code": "STRING_ERROR_CODE",
      "message": "Human readable message",
      "details": [{ "field": "optional.field", "message": "specific error" }]
    }
  }
  ```

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Customer registration with password complexity check |
| `POST` | `/auth/login` | Public | Sets JWT cookies; generic `INVALID_CREDENTIALS` error |
| `POST` | `/auth/refresh` | Cookie | Rotates refresh token; revokes family if reuse detected |
| `POST` | `/auth/logout` | Any | Revokes active refresh token and clears cookies |
| `GET` | `/auth/me` | Authenticated | Returns current authenticated user |

---

## 2. Profile Management (`/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | Authenticated | View own profile details |
| `PATCH` | `/users/me` | Authenticated | Update full name and phone number |
| `POST` | `/users/me/change-password` | Authenticated | Requires current password; revokes all other active sessions |

---

## 3. Dealerships (`/dealerships`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dealerships` | Public | List active dealerships with available vehicle counts |
| `GET` | `/dealerships/:id` | Public | View dealership profile and associated active vehicles |
| `POST` | `/dealerships` | Staff | Create dealership (unique on name + city) |
| `PATCH` | `/dealerships/:id` | Staff | Update dealership hours, contact info, address |
| `POST` | `/dealerships/:id/deactivate` | Staff | Soft delete; supports `cascade=true` to cancel active bookings |
| `POST` | `/dealerships/:id/activate` | Staff | Re-activate dealership |

---

## 4. Vehicles (`/vehicles`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/vehicles` | Public | Search and filter vehicles (manufacturer, model, type, fuel, year, sort) |
| `GET` | `/vehicles/filters` | Public | Distinct manufacturer, type, and fuel values for UI filters |
| `GET` | `/vehicles/:id` | Public | Vehicle specifications, dealership info, features |
| `GET` | `/vehicles/:id/slots` | Public | Future active slots with `isBooked` flag |
| `POST` | `/vehicles` | Staff | Add luxury vehicle record |
| `PATCH` | `/vehicles/:id` | Staff | Update specs, features, availability flag |
| `POST` | `/vehicles/:id/images` | Staff | Multipart upload (JPEG/PNG/WebP, max 8 images, ≤ 5MB) |
| `DELETE` | `/vehicles/:id/images` | Staff | Remove image by URL |
| `POST` | `/vehicles/:id/deactivate` | Staff | Soft delete; supports `cascade=true` |
| `POST` | `/vehicles/:id/activate` | Staff | Re-activate vehicle |

---

## 5. Time Slots (`/slots`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/slots` | Staff | Filter slots by vehicle, dealership, status, date range |
| `POST` | `/slots` | Staff | Create slot (validates dealership hours in APP_TIMEZONE, prevents overlap) |
| `POST` | `/slots/bulk` | Staff | Bulk generation across date range, skipping overlaps |
| `PATCH` | `/slots/:id` | Staff | Reschedule slot (blocked if slot has pending/approved booking) |
| `POST` | `/slots/:id/deactivate` | Staff | Deactivate slot (blocked if slot has active booking) |
| `POST` | `/slots/:id/activate` | Staff | Re-activate slot |

---

## 6. Bookings (`/bookings` & `/admin/bookings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/bookings` | Customer | Create booking request (transactional checks, max active limit) |
| `GET` | `/bookings/mine` | Customer | Partitioned bookings list (`group=pending\|upcoming\|completed\|cancelled\|past\|all`) |
| `GET` | `/bookings/:id` | Owner / Staff | View booking details, audit history, notes (404 on unowned) |
| `POST` | `/bookings/:id/cancel` | Owner / Staff | Cancel booking; enforces 24h cutoff for customers |
| `GET` | `/admin/bookings` | Staff | Filter bookings by status, customer text, dates, vehicle |
| `POST` | `/admin/bookings/:id/approve` | Staff | Approve PENDING booking |
| `POST` | `/admin/bookings/:id/reject` | Staff | Reject PENDING booking with mandatory `staffNote` |
| `POST` | `/admin/bookings/:id/reschedule` | Staff | Move booking to another free slot on same vehicle |
| `POST` | `/admin/bookings/:id/complete` | Staff | Complete booking when slot time has arrived |

---

## 7. Admin Dashboard & Management (`/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard/summary` | Staff | KPI stats (pending, today, upcoming 7d, vehicles, slot utilization %) |
| `GET` | `/admin/dashboard/trends` | Staff | 30-day booking volume daily trend chart data |
| `GET` | `/admin/customers` | Staff | Customer list with total booking counts |
| `GET` | `/admin/customers/:id` | Staff | Customer profile & entire booking history |
| `POST` | `/admin/customers/:id/deactivate` | Staff | Deactivate customer account |
| `POST` | `/admin/customers/:id/activate` | Staff | Re-activate customer account |
| `POST` | `/admin/staff` | Staff | Create new staff admin account |

---

## 8. Notifications (`/notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | List notifications with `unreadOnly` filter |
| `GET` | `/notifications/unread-count` | Authenticated | Counter for notification bell badge |
| `POST` | `/notifications/:id/read` | Authenticated | Mark individual notification as read |
| `POST` | `/notifications/read-all` | Authenticated | Mark all notifications as read |
