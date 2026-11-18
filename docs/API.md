# API Reference

> Summary doc — OpenAPI (Swagger UI at `/api/docs`) is the authoritative source after Phase 6.

Base path: `/api/v1`  
All requests/responses: `Content-Type: application/json`  
Auth: httpOnly cookies (`access_token`, `refresh_token`)  
Pagination: `?page=1&pageSize=12` → `{ data: [...], meta: { page, pageSize, total, totalPages } }`

## Error shape
```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable",
    "details": [{ "field": "fieldName", "message": "what went wrong" }]
  }
}
```

## Endpoints (summary — see OpenAPI for full schemas)

### Auth (`/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | public | Customer registration |
| POST | `/auth/login` | public | Sets cookies, returns user |
| POST | `/auth/refresh` | refresh cookie | Rotates tokens |
| POST | `/auth/logout` | any | Revokes refresh, clears cookies |
| GET | `/auth/me` | auth | Current user |

### Profile (`/users`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | auth | Own profile |
| PATCH | `/users/me` | auth | Update fullName, phone |
| POST | `/users/me/change-password` | auth | Change password |

### Dealerships, Vehicles, Slots, Bookings, Notifications, Dashboard
*(Populated in Phase 6)*

---
*Last updated: Phase 0 stub*

