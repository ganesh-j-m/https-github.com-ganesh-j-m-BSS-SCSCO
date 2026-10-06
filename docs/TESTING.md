# SCSCO College Digital Platform — Testing Guide

## Executing the 10 Critical Test Cases

The application includes an integrated live test suite accessible right from the UI, as well as test scripts.

| Test # | Description | How to Verify in UI | Expected Result |
|---|---|---|---|
| **Test 1** | Teacher Generates QR | Switch to Teacher role (`teacher@scsco.edu`), click **Generate Attendance QR**, submit lecture details. | Session launched. Large QR code rendered with exact 5:00 countdown timer and live counters. |
| **Test 2** | Student Scans within 5 mins | Switch to Student (`student@scsco.edu`), click **Scan Attendance QR**, use camera or click **Test 1 & 2** in runner. | Green success receipt: Student Name, ID, Subject, Time, Status: Present. Confetti animates. |
| **Test 3** | Same Student Scans Again | Rescan the active session QR with the same student account. | Rejection notice: **Attendance Already Marked**. No duplicate entry created. |
| **Test 4** | Student Scans after 5 mins | In test runner, click **Test 4: Scan Expired Token** or let 5-minute timer elapse. | Rejection notice: **This Attendance QR has expired.** Status switches to `EXPIRED`. |
| **Test 5** | Student from Wrong Div Scans | Switch to Pooja Verma (`student4@scsco.edu`, Div B) and attempt to scan Div A QR. | Rejection notice: **You are not authorized for this attendance session.** |
| **Test 6** | Student from Wrong Class Scans | Switch to Siddharth Nair (`student5@scsco.edu`, Mech 2nd Year) and scan BCS QR. | Rejection notice: **You are not authorized for this attendance session.** |
| **Test 7** | Invalid QR Code | In test runner, submit an arbitrary random string. | Rejection notice: **Invalid Attendance QR**. No internal stack trace exposed. |
| **Test 8** | Teacher Closes Session | On Projector Screen, click **Close Session Now** and confirm. | Session status becomes `CLOSED`. Any subsequent scans rejected with closed notice. |
| **Test 9** | Live Attendance Count | Keep Projector Screen open on one tab, mark attendance as a student on another tab. | Live Present count and recorded students list increment automatically within seconds. |
| **Test 10** | Manual Attendance Correction | In **Attendance Reports**, click **Correct** on a student row, specify reason, save. | Status updated in DB, immutable entry generated in **Attendance Audit Trail**. |
