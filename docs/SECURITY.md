# SCSCO College Digital Platform — Security Architecture & Guidelines

## 1. Threat Model & Mitigations

### 1.1 Proxy Attendance Attacks
- **Threat**: Students sending photos of attendance QR codes to absent peers outside the lecture hall.
- **Mitigation**:
  - Exact 5-minute server-authoritative expiration window.
  - Dynamic token references generated via cryptographically secure pseudo-random numbers (`crypto.randomUUID()` + entropy hash).
  - Strict server-time validation (`Date.now() < expiresAt`).
  - Class boundary and subject enrollment isolation.
  - Unique database constraints (`UNIQUE(sessionId, studentId)`).

### 1.2 Digital Student ID vs Attendance QR Separation
- **Threat**: Confusion or exploitation of Permanent Student ID QR for lecture attendance.
- **Mitigation**:
  - The Digital Student ID QR code encodes permanent physical student pass data (`SCSCO-STUDENT-PERMANENT-ID:...`) and is strictly rejected by the attendance scan parser.
  - Attendance sessions only accept active temporary cryptographic session tokens.

### 1.3 Audit Logging & Accountability
- **Threat**: Unauthorized or silent modification of historical attendance percentages.
- **Mitigation**:
  - Every manual correction requires a mandatory justification/reason (minimum length enforced).
  - Records previous state, new state, actor identity, role, and server timestamp in immutable `AttendanceAuditLog` table.
  - Full system audit log (`SystemAuditLog`) tracks user creation, logins, session creations, and CMS publications.

### 1.4 Password Hashing & Sensitive Secrets
- Plaintext passwords are never stored or logged.
- Passwords are hashed using Argon2id with recommended parameters (memory cost 64MB, time cost 3, parallelism 1).
- Session cookies use `HttpOnly`, `SameSite=Lax`, and `Secure` attributes in production.
- Database connection strings (`DATABASE_URL`, `DIRECT_URL`) and `AUTH_SECRET` are stored exclusively in environment variables and excluded via `.gitignore`.
