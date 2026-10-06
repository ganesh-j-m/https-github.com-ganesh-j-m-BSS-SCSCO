# SCSCO College Digital Platform — Smart QR Attendance Test Plan

## 1. System Overview
The Smart QR Attendance System enforces strict academic integrity through cryptographically secured, dynamic, short-lived QR codes. It eliminates proxy attendance by enforcing 12 atomic validation checks on the server prior to recording attendance in the PostgreSQL database.

---

## 2. The 12-Step Server-Side Validation Pipeline

When a student scans a QR code, the client sends only the safe token reference string (`tokenHash`). The server executes the following validation pipeline:

1. **Authentication Check**: Verifies the student is authenticated via secure session cookies.
2. **Session Existence Check**: Verifies the `AttendanceSession` exists by matching `tokenHash`.
3. **Session Status Check**: Verifies the session status is `ACTIVE` (rejects `CLOSED` or `EXPIRED`).
4. **Exact 5-Minute Server Expiry Check**: Validates that `currentServerTime < expiresAt` (`startsAt + 300,000ms`). If expired, automatically sets status to `EXPIRED` and rejects.
5. **Class Boundary Check**: Asserts the authenticated student belongs to `session.classId` (e.g. "BCS 3rd Year").
6. **Division Boundary Check**: Asserts the student belongs to `session.divisionId` (e.g. "Division A").
7. **Subject Enrollment Check**: Asserts an active `SubjectEnrollment` record exists for `[studentId, subjectId]`.
8. **Faculty Ownership Check**: Asserts the session is anchored to the assigned course instructor.
9. **Duplicate Scan Constraint**: Queries `AttendanceRecord` for `[sessionId, studentId]`. Enforces the unique database constraint `UNIQUE(sessionId, studentId)`.
10. **Transaction Execution**: Creates the `AttendanceRecord` with status `PRESENT` and timestamp.
11. **System Audit Log**: Emits an audit entry in `SystemAuditLog` tracking student ID and timestamp.
12. **Live Broadcaster / Polling Signal**: Live count updates on the classroom projector screen.

---

## 3. Test Cases & Verification Matrix

### Test Case 1: Teacher Generates 5-Minute QR Session
- **Actor**: Teacher (`teacher@scsco.edu` - Prof. Vikramaditya Joshi)
- **Pre-condition**: Logged in to Teacher Portal.
- **Action**: Select "BCS 3rd Year", "Division A", "Web Technology", topic "Client-Server Security", click "Generate Attendance QR".
- **Expected Result**:
  - `AttendanceSession` created in DB with status `ACTIVE`.
  - Expiry set to `startsAt + 300 seconds`.
  - Classroom Projector Screen displays large QR code with countdown starting at `05:00`.
  - Present: `0`, Expected: `3`, Remaining: `3`.

### Test Case 2: Student Scans Within 5 Minutes (Happy Path)
- **Actor**: Student (`student@scsco.edu` - Aarav Patel ST001, BCS 3rd Year Div A).
- **Pre-condition**: Session is ACTIVE, remaining time > 0.
- **Action**: Opens "Scan Attendance QR", points camera at QR code (or triggers live test runner).
- **Expected Result**:
  - Server confirms student is in BCS 3rd Year Div A and enrolled in Web Technology.
  - Returns `Attendance Marked Successfully`.
  - Confetti celebration animates on client.
  - Receipt card displays Student Name, ID, Subject, Class, Division, and Time.
  - Live Teacher Screen auto-increments Present count (`1`), Expected (`3`), Remaining (`2`).

### Test Case 3: Duplicate Scan Protection
- **Actor**: Student (`student@scsco.edu` - Aarav Patel ST001).
- **Pre-condition**: Attendance has already been marked for the active session.
- **Action**: Student rescans the same QR code.
- **Expected Result**:
  - Server catches `UNIQUE(sessionId, studentId)` constraint violation.
  - Returns message: `Attendance Already Marked`.
  - No duplicate record created in database.

### Test Case 4: Student Scans Expired QR Code
- **Actor**: Student (`student@scsco.edu`).
- **Pre-condition**: Server time >= `session.expiresAt` (5 minutes elapsed).
- **Action**: Student attempts to scan the QR code.
- **Expected Result**:
  - Server rejects scan with message: `This Attendance QR has expired.`.
  - Session status transitions to `EXPIRED`.
  - Teacher projector screen displays "Attendance Session Expired" overlay.

### Test Case 5: Student from Another Division Scans
- **Actor**: Student (`student4@scsco.edu` - Pooja Verma ST004, BCS 3rd Year Div B).
- **Action**: Attempts to scan Div A attendance QR.
- **Expected Result**:
  - Server compares `student.divisionId` vs `session.divisionId`.
  - Returns message: `You are not authorized for this attendance session.`.
  - Attendance is NOT recorded.

### Test Case 6: Student from Another Class Scans
- **Actor**: Student (`student5@scsco.edu` - Siddharth Nair ST005, Mechanical 2nd Year).
- **Action**: Attempts to scan BCS 3rd Year QR.
- **Expected Result**:
  - Server detects class mismatch (`cls_mech_2` != `cls_bcs_3`).
  - Returns message: `You are not authorized for this attendance session.`.
  - Attendance is NOT recorded.

### Test Case 7: Unauthenticated QR Scan
- **Actor**: Logged-out user.
- **Action**: Visits QR scan endpoint.
- **Expected Result**:
  - Redirected to Student Login with return callback.
  - Upon login, full 12-step server validation is re-executed.

### Test Case 8: Invalid QR Code
- **Actor**: Any user.
- **Action**: Scans malformed or arbitrary external QR code.
- **Expected Result**:
  - Returns message: `Invalid Attendance QR`.
  - Internal database details and token hashes are never exposed.

### Test Case 9: Manual Session Closure by Faculty
- **Actor**: Teacher (`teacher@scsco.edu`).
- **Action**: Clicks "Close Session Now" on Projector Screen and confirms modal.
- **Expected Result**:
  - Status transitions to `CLOSED`.
  - `closedAt` timestamp stamped.
  - Audit log created: `SESSION_CLOSE` by Prof. Joshi.
  - Any subsequent scan returns: `This attendance session has been closed by the faculty.`.

### Test Case 10: Authorized Manual Attendance Correction
- **Actor**: Teacher, HOD, or Admin.
- **Action**: Opens Attendance Reports, clicks "Correct", changes status from `ABSENT` to `PRESENT`, inputs mandatory reason: `"Medical certificate approved by Department Office"`.
- **Expected Result**:
  - AttendanceRecord updated.
  - `AttendanceAuditLog` entry created with Actor Name, Role, Old Status, New Status, and Reason.
  - Historical audit trail permanently viewable on HOD/Admin audit tabs.
