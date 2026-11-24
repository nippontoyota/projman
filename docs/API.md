# Incheon Mobility Project Management REST API

All API responses follow a uniform JSON structure:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 1. Projects API

### `GET /api/projects`
List all dealership project tracks.

**Query Parameters:**
- `facilityType` (string): `Sales`, `Service`, `Stock Yard`, `Sales & Service`, or `ALL`
- `status` (string): Project status filter
- `health` (string): Schedule health filter (`Completed`, `On Track`, `Watchlist`, `Delayed (>30d)`, `Action Needed`)
- `search` (string): Keyword search on location, code, or remarks

**Response:**
Returns array of projects with relations (`brand`, `location`, `milestones`, `blockers`, `auditLogs`).

---

### `POST /api/projects`
Create a new project track (Admin role).

**Request Body:**
```json
{
  "brandName": "River EV",
  "locationName": "Kollam",
  "facilityType": "Sales & Service",
  "targetDate": "2027-03-31",
  "initialRemarks": "Initial landlord negotiation",
  "userRole": "Admin"
}
```

**Actions:**
- Finds or creates brand and location.
- Generates project code (e.g. `RIV-KOL-SAL-01`).
- Auto-initializes all 21 milestone tasks in sequential order.
- Records an audit log.

---

### `GET /api/projects/:id`
Fetch single project details.

---

### `PATCH /api/projects/:id`
Update project master fields (status, health, progress %, target date, remarks).

**Request Body:**
```json
{
  "currentStatus": "Ready for Handover",
  "scheduleHealth": "Action Needed",
  "workPercentage": 100,
  "keyRemarks": "Waterproofing repair underway",
  "userRole": "Admin"
}
```

---

### `DELETE /api/projects/:id`
Delete a project track and cascade its milestones, blockers, and audit history.

---

## 2. Milestones API

### `PATCH /api/milestones/:id`
Update an individual milestone checkpoint.

**Request Body:**
```json
{
  "status": "Completed",
  "actualDate": "2026-11-20",
  "remarks": "Signed by managing director",
  "userRole": "User"
}
```

**Actions:**
- Updates milestone record.
- Automatically recalculates overall project `workPercentage`.
- Records audit log.

---

## 3. Bottlenecks & Blockers API

### `GET /api/blockers`
List active or resolved blockers.

**Query Parameters:**
- `projectId` (string): Filter by project
- `status` (string): `Open`, `Under Discussion`, `Resolved`, or `ALL`

---

### `POST /api/blockers`
Log a new bottleneck or issue.

**Request Body:**
```json
{
  "projectId": "...",
  "category": "Landlord",
  "severity": "Critical",
  "title": "Lease Agreement Delay",
  "description": "Owner requesting revised deposit structure",
  "userRole": "User"
}
```

---

### `PATCH /api/blockers/:id`
Update or resolve a blocker.

**Request Body:**
```json
{
  "status": "Resolved",
  "userRole": "Admin"
}
```

---

## 4. Executive Dashboard & Metrics API

### `GET /api/stats`
Returns portfolio summary metrics:
- Total tracks, commissioned count, open count, days to fixed target.
- Portfolio status breakdown with percentage shares and avg elapsed days.
- Stage-wise benchmark durations (stages 1 to 5).
- List of open critical blockers.

---

### `POST /api/seed/reset`
Resets the database back to the pristine Incheon Mobility master dataset (15 initial tracks).
