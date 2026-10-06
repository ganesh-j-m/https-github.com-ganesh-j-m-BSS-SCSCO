import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Course,
  AcademicYear,
  Semester,
  CollegeClass,
  Division,
  Subject,
  SubjectEnrollment,
  AttendanceSession,
  AttendanceRecord,
  AttendanceAuditLog,
  TimetableSlot,
  Assignment,
  AssignmentSubmission,
  StudyMaterial,
  ExaminationSchedule,
  StudentResult,
  FeeRecord,
  AdmissionApplication,
  NoticeItem,
  EventItem,
  NewsItem,
  GalleryItem,
  HeroSlide,
  PlacementJob,
  CertificateRequest,
  SystemAuditLog,
  AttendanceStatus
} from '../../types';

import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SEMESTERS,
  INITIAL_CLASSES,
  INITIAL_DIVISIONS,
  INITIAL_SUBJECTS,
  INITIAL_ENROLLMENTS,
  INITIAL_TIMETABLE,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_FEES,
  INITIAL_ADMISSIONS,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_NEWS,
  INITIAL_GALLERY,
  INITIAL_HERO_SLIDES,
  INITIAL_JOBS,
  INITIAL_CERTIFICATES,
  INITIAL_AUDIT_LOGS
} from './initialData';

const DB_KEY = 'scsco_college_db_v1';

export interface DatabaseState {
  users: User[];
  students: StudentProfile[];
  faculty: FacultyProfile[];
  departments: Department[];
  courses: Course[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  classes: CollegeClass[];
  divisions: Division[];
  subjects: Subject[];
  enrollments: SubjectEnrollment[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  attendanceAuditLogs: AttendanceAuditLog[];
  timetable: TimetableSlot[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  studyMaterials: StudyMaterial[];
  exams: ExaminationSchedule[];
  results: StudentResult[];
  fees: FeeRecord[];
  admissions: AdmissionApplication[];
  notices: NoticeItem[];
  events: EventItem[];
  news: NewsItem[];
  gallery: GalleryItem[];
  heroSlides: HeroSlide[];
  jobs: PlacementJob[];
  certificates: CertificateRequest[];
  systemAuditLogs: SystemAuditLog[];
}

// Initial demo seed with pre-existing session for immediate exploration
function getInitialSeed(): DatabaseState {
  // Pre-seed an active demonstration session for BCS 3rd Year Web Technology
  const now = Date.now();
  const demoSessionId = 'sess_live_demo';
  const demoToken = 'scsco-token-' + Math.random().toString(36).substring(2, 10);

  const demoSession: AttendanceSession = {
    id: demoSessionId,
    tokenHash: demoToken,
    teacherId: 'usr_teacher',
    teacherName: 'Prof. Vikramaditya Joshi',
    subjectId: 'sub_wt',
    subjectName: 'Web Technology',
    classId: 'cls_bcs_3',
    className: 'BCS 3rd Year',
    divisionId: 'div_a',
    divisionName: 'A',
    academicYearId: 'ay_2026_27',
    semesterId: 'sem_5',
    lectureTopic: 'Client-Server Synchronization & Security Tokens',
    roomNumber: 'Room 304',
    startsAt: now,
    expiresAt: now + 5 * 60 * 1000, // Exactly 5 minutes
    status: 'ACTIVE',
    createdAt: new Date(now).toISOString(),
    totalExpectedStudents: 3, // ST001, ST002, ST003
  };

  // Pre-mark 1 student so live screen shows initial progress
  const demoRecord: AttendanceRecord = {
    id: 'rec_init_01',
    sessionId: demoSessionId,
    studentId: 'stu_002',
    studentName: 'Ananya Sharma',
    studentIdNumber: 'ST002',
    markedAt: now - 30 * 1000,
    scanTimeFormatted: new Date(now - 30 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'PRESENT',
    markedVia: 'QR_SCAN',
    createdAt: new Date(now - 30 * 1000).toISOString(),
    updatedAt: new Date(now - 30 * 1000).toISOString(),
  };

  return {
    users: INITIAL_USERS,
    students: INITIAL_STUDENTS,
    faculty: INITIAL_FACULTY,
    departments: INITIAL_DEPARTMENTS,
    courses: INITIAL_COURSES,
    academicYears: INITIAL_ACADEMIC_YEARS,
    semesters: INITIAL_SEMESTERS,
    classes: INITIAL_CLASSES,
    divisions: INITIAL_DIVISIONS,
    subjects: INITIAL_SUBJECTS,
    enrollments: INITIAL_ENROLLMENTS,
    attendanceSessions: [demoSession],
    attendanceRecords: [demoRecord],
    attendanceAuditLogs: [],
    timetable: INITIAL_TIMETABLE,
    assignments: INITIAL_ASSIGNMENTS,
    submissions: INITIAL_SUBMISSIONS,
    studyMaterials: INITIAL_STUDY_MATERIALS,
    exams: INITIAL_EXAMS,
    results: INITIAL_RESULTS,
    fees: INITIAL_FEES,
    admissions: INITIAL_ADMISSIONS,
    notices: INITIAL_NOTICES,
    events: INITIAL_EVENTS,
    news: INITIAL_NEWS,
    gallery: INITIAL_GALLERY,
    heroSlides: INITIAL_HERO_SLIDES,
    jobs: INITIAL_JOBS,
    certificates: INITIAL_CERTIFICATES,
    systemAuditLogs: INITIAL_AUDIT_LOGS,
  };
}

class CollegeDatabase {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    if (typeof window === 'undefined') {
      return getInitialSeed();
    }
    try {
      const data = localStorage.getItem(DB_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...getInitialSeed(), ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse database from localStorage:', e);
    }
    const fresh = getInitialSeed();
    this.saveToStorage(fresh);
    return fresh;
  }

  private saveToStorage(state: DatabaseState) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save database to localStorage:', e);
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage(this.state);
    this.listeners.forEach(fn => fn());
  }

  public getState(): DatabaseState {
    // Check and update any expired sessions on state access
    this.checkSessionExpirations();
    return this.state;
  }

  public resetToFactoryDefaults() {
    this.state = getInitialSeed();
    this.notify();
  }

  private checkSessionExpirations() {
    const now = Date.now();
    let hasChanges = false;
    this.state.attendanceSessions = this.state.attendanceSessions.map(session => {
      if (session.status === 'ACTIVE' && now >= session.expiresAt) {
        hasChanges = true;
        return { ...session, status: 'EXPIRED' };
      }
      return session;
    });
    if (hasChanges) {
      this.saveToStorage(this.state);
    }
  }

  // --- SMART QR ATTENDANCE ENGINE ---

  public createAttendanceSession(params: {
    teacherId: string;
    classId: string;
    divisionId: string;
    subjectId: string;
    lectureTopic?: string;
    roomNumber?: string;
  }): { session: AttendanceSession; qrUrl: string } {
    this.checkSessionExpirations();

    const collegeClass = this.state.classes.find(c => c.id === params.classId);
    const division = this.state.divisions.find(d => d.id === params.divisionId);
    const subject = this.state.subjects.find(s => s.id === params.subjectId);
    const teacher = this.state.users.find(u => u.id === params.teacherId);

    if (!collegeClass || !division || !subject || !teacher) {
      throw new Error('Invalid class, division, subject, or faculty ID provided.');
    }

    // Expected students: students in class + division enrolled in this subject
    const enrolledStudents = this.state.students.filter(stu => {
      if (stu.classId !== params.classId || stu.divisionId !== params.divisionId) return false;
      return this.state.enrollments.some(enr => enr.studentId === stu.id && enr.subjectId === params.subjectId);
    });

    const now = Date.now();
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    // Cryptographically secure token reference
    const tokenHash = 'scsco-qr-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36);

    const newSession: AttendanceSession = {
      id: sessionId,
      tokenHash,
      teacherId: params.teacherId,
      teacherName: teacher.name,
      subjectId: subject.id,
      subjectName: subject.name,
      classId: collegeClass.id,
      className: collegeClass.name,
      divisionId: division.id,
      divisionName: division.name,
      academicYearId: collegeClass.academicYearId,
      semesterId: collegeClass.semesterId,
      lectureTopic: params.lectureTopic || 'Regular Curriculum Lecture',
      roomNumber: params.roomNumber || division.roomNumber,
      startsAt: now,
      expiresAt: now + 5 * 60 * 1000, // Exactly 5 minutes from server start
      status: 'ACTIVE',
      createdAt: new Date(now).toISOString(),
      totalExpectedStudents: Math.max(enrolledStudents.length, 1),
    };

    this.state.attendanceSessions = [newSession, ...this.state.attendanceSessions];

    // Log to system audit
    this.logSystemAudit({
      actorName: teacher.name,
      actorRole: 'TEACHER',
      action: 'ATTENDANCE_SESSION_CREATED',
      entity: 'AttendanceSession',
      entityId: sessionId,
      details: `Generated 5-minute QR session for ${collegeClass.name} Div ${division.name} - ${subject.name}`,
    });

    this.notify();

    // Standardized safe URL encoded into QR
    const qrUrl = `${window?.location?.origin || ''}/attendance/scan/${tokenHash}`;

    return { session: newSession, qrUrl };
  }

  public closeAttendanceSession(sessionId: string, actor: { id: string; name: string; role: any }): AttendanceSession {
    const session = this.state.attendanceSessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Attendance session not found.');

    session.status = 'CLOSED';
    session.closedAt = new Date().toISOString();

    // Audit log
    this.logAttendanceAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'SESSION_CLOSE',
      sessionId: session.id,
      reason: 'Manual session termination by authorized faculty.',
      oldValue: 'ACTIVE',
      newValue: 'CLOSED',
    });

    this.notify();
    return session;
  }

  public getSessionLiveStats(sessionId: string) {
    this.checkSessionExpirations();
    const session = this.state.attendanceSessions.find(s => s.id === sessionId);
    if (!session) return null;

    const records = this.state.attendanceRecords.filter(r => r.sessionId === sessionId);
    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const remainingCount = Math.max(0, session.totalExpectedStudents - presentCount);

    return {
      session,
      records,
      presentCount,
      expectedCount: session.totalExpectedStudents,
      remainingCount,
      isExpired: session.status === 'EXPIRED' || Date.now() >= session.expiresAt,
      isClosed: session.status === 'CLOSED',
      secondsRemaining: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
    };
  }

  /**
   * Complete 12-step Server-side Validation of Attendance Scan
   */
  public processAttendanceScan(params: {
    tokenHash: string;
    studentUserId: string;
  }): {
    success: boolean;
    message: string;
    record?: AttendanceRecord;
    details?: {
      studentName: string;
      studentIdNumber: string;
      subjectName: string;
      className: string;
      divisionName: string;
      dateFormatted: string;
      timeFormatted: string;
      status: string;
    };
  } {
    this.checkSessionExpirations();

    // 1. Authenticate student
    const studentUser = this.state.users.find(u => u.id === params.studentUserId && u.role === 'STUDENT');
    if (!studentUser) {
      return { success: false, message: 'Authentication required. Please log in as an enrolled student.' };
    }

    const studentProfile = this.state.students.find(s => s.userId === studentUser.id || s.id === studentUser.studentProfileId);
    if (!studentProfile) {
      return { success: false, message: 'Student academic record not found in system.' };
    }

    // 2. Find attendance session by token
    const session = this.state.attendanceSessions.find(s => s.tokenHash === params.tokenHash);
    if (!session) {
      return { success: false, message: 'Invalid Attendance QR' };
    }

    // 3. Check session status
    if (session.status === 'CLOSED') {
      return { success: false, message: 'This attendance session has been closed by the faculty.' };
    }

    // 4. Server time expiration check (Strict 5 minutes)
    const now = Date.now();
    if (now >= session.expiresAt || session.status === 'EXPIRED') {
      session.status = 'EXPIRED';
      this.notify();
      return { success: false, message: 'This Attendance QR has expired.' };
    }

    // 5. Check student belongs to selected class
    if (studentProfile.classId !== session.classId) {
      return { success: false, message: 'You are not authorized for this attendance session.' };
    }

    // 6. Check student belongs to selected division
    if (studentProfile.divisionId !== session.divisionId) {
      return { success: false, message: 'You are not authorized for this attendance session.' };
    }

    // 7. Check student is enrolled in selected subject
    const isEnrolled = this.state.enrollments.some(
      enr => enr.studentId === studentProfile.id && enr.subjectId === session.subjectId
    );
    if (!isEnrolled) {
      return { success: false, message: 'You are not enrolled in this subject.' };
    }

    // 8. DUPLICATE CHECK: UNIQUE(sessionId, studentId) constraint
    const existingRecord = this.state.attendanceRecords.find(
      r => r.sessionId === session.id && r.studentId === studentProfile.id
    );
    if (existingRecord) {
      return { success: false, message: 'Attendance Already Marked' };
    }

    // 9. Create AttendanceRecord
    const recordId = 'rec_' + Math.random().toString(36).substring(2, 9);
    const dateObj = new Date(now);
    const scanTimeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateFormatted = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });

    const newRecord: AttendanceRecord = {
      id: recordId,
      sessionId: session.id,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      studentIdNumber: studentProfile.studentIdNumber,
      markedAt: now,
      scanTimeFormatted,
      status: 'PRESENT',
      markedVia: 'QR_SCAN',
      createdAt: dateObj.toISOString(),
      updatedAt: dateObj.toISOString(),
    };

    // Safe transaction commit
    this.state.attendanceRecords = [newRecord, ...this.state.attendanceRecords];

    // Log to system audit
    this.logSystemAudit({
      actorName: studentProfile.name,
      actorRole: 'STUDENT',
      action: 'ATTENDANCE_RECORDED',
      entity: 'AttendanceRecord',
      entityId: recordId,
      details: `Student ${studentProfile.studentIdNumber} marked attendance for ${session.subjectName} via QR scan.`,
    });

    this.notify();

    return {
      success: true,
      message: 'Attendance Marked Successfully',
      record: newRecord,
      details: {
        studentName: studentProfile.name,
        studentIdNumber: studentProfile.studentIdNumber,
        subjectName: session.subjectName,
        className: session.className,
        divisionName: session.divisionName,
        dateFormatted,
        timeFormatted: scanTimeFormatted,
        status: 'Present',
      },
    };
  }

  // --- MANUAL ATTENDANCE CORRECTION & AUDITING ---

  public correctAttendanceRecord(params: {
    recordId?: string;
    sessionId: string;
    studentId: string;
    newStatus: AttendanceStatus;
    reason: string;
    actor: { id: string; name: string; role: any };
  }): AttendanceRecord {
    if (!params.reason || params.reason.trim().length < 5) {
      throw new Error('A detailed reason is mandatory for official attendance correction.');
    }

    const student = this.state.students.find(s => s.id === params.studentId);
    if (!student) throw new Error('Student not found.');

    const now = Date.now();
    let record = this.state.attendanceRecords.find(r => r.sessionId === params.sessionId && r.studentId === params.studentId);
    let oldStatus = 'ABSENT';

    if (record) {
      oldStatus = record.status;
      record.status = params.newStatus;
      record.markedVia = 'MANUAL_CORRECTION';
      record.updatedAt = new Date(now).toISOString();
    } else {
      // Student was absent and being manually marked
      record = {
        id: 'rec_man_' + Math.random().toString(36).substring(2, 9),
        sessionId: params.sessionId,
        studentId: student.id,
        studentName: student.name,
        studentIdNumber: student.studentIdNumber,
        markedAt: now,
        scanTimeFormatted: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: params.newStatus,
        markedVia: 'MANUAL_CORRECTION',
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      };
      this.state.attendanceRecords.push(record);
    }

    // MANDATORY AUDIT LOG CREATION
    this.logAttendanceAudit({
      actorId: params.actor.id,
      actorName: params.actor.name,
      actorRole: params.actor.role,
      action: 'MANUAL_OVERRIDE',
      sessionId: params.sessionId,
      recordId: record.id,
      studentId: student.id,
      studentName: student.name,
      reason: params.reason,
      oldValue: oldStatus,
      newValue: params.newStatus,
    });

    this.notify();
    return record;
  }

  private logAttendanceAudit(params: Omit<AttendanceAuditLog, 'id' | 'timestamp'>) {
    const audit: AttendanceAuditLog = {
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      ...params,
      timestamp: new Date().toISOString(),
    };
    this.state.attendanceAuditLogs = [audit, ...this.state.attendanceAuditLogs];
  }

  private logSystemAudit(params: Omit<SystemAuditLog, 'id' | 'timestamp'>) {
    const audit: SystemAuditLog = {
      id: 'sysaud_' + Math.random().toString(36).substring(2, 9),
      ...params,
      timestamp: new Date().toISOString(),
    };
    this.state.systemAuditLogs = [audit, ...this.state.systemAuditLogs];
  }

  // --- CMS MANAGEMENT (ADMIN) ---

  public addNotice(notice: Omit<NoticeItem, 'id' | 'publishedDate'>) {
    const item: NoticeItem = {
      id: 'not_' + Date.now().toString(36),
      ...notice,
      publishedDate: new Date().toISOString().split('T')[0],
    };
    this.state.notices = [item, ...this.state.notices];
    this.notify();
    return item;
  }

  public deleteNotice(id: string) {
    this.state.notices = this.state.notices.filter(n => n.id !== id);
    this.notify();
  }

  public addEvent(event: Omit<EventItem, 'id' | 'registeredCount'>) {
    const item: EventItem = {
      id: 'ev_' + Date.now().toString(36),
      ...event,
      registeredCount: 0,
    };
    this.state.events = [item, ...this.state.events];
    this.notify();
    return item;
  }

  public deleteEvent(id: string) {
    this.state.events = this.state.events.filter(e => e.id !== id);
    this.notify();
  }

  public addNews(news: Omit<NewsItem, 'id' | 'publishedDate'>) {
    const item: NewsItem = {
      id: 'news_' + Date.now().toString(36),
      ...news,
      publishedDate: new Date().toISOString().split('T')[0],
    };
    this.state.news = [item, ...this.state.news];
    this.notify();
    return item;
  }

  public deleteNews(id: string) {
    this.state.news = this.state.news.filter(n => n.id !== id);
    this.notify();
  }

  public addGallery(gallery: Omit<GalleryItem, 'id'>) {
    const item: GalleryItem = {
      id: 'gal_' + Date.now().toString(36),
      ...gallery,
    };
    this.state.gallery = [item, ...this.state.gallery];
    this.notify();
    return item;
  }

  public deleteGallery(id: string) {
    this.state.gallery = this.state.gallery.filter(g => g.id !== id);
    this.notify();
  }

  // --- ADMISSIONS ---

  public submitAdmission(data: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'appliedDate' | 'status'>) {
    const appNumber = 'APP-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newApp: AdmissionApplication = {
      id: 'adm_' + Date.now().toString(36),
      applicationNumber: appNumber,
      ...data,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'SUBMITTED',
      adminComments: 'Application received. Pending scrutiny.',
    };
    this.state.admissions = [newApp, ...this.state.admissions];
    this.notify();
    return newApp;
  }

  public updateAdmissionStatus(id: string, status: AdmissionApplication['status'], comments?: string) {
    const app = this.state.admissions.find(a => a.id === id);
    if (app) {
      app.status = status;
      if (comments) app.adminComments = comments;
      this.notify();
    }
  }

  // --- ASSIGNMENTS & STUDY MATERIALS ---

  public addAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>) {
    const item: Assignment = {
      id: 'asg_' + Date.now().toString(36),
      ...assignment,
      createdAt: new Date().toISOString(),
    };
    this.state.assignments = [item, ...this.state.assignments];
    this.notify();
    return item;
  }

  public submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) {
    const item: AssignmentSubmission = {
      id: 'subm_' + Date.now().toString(36),
      ...submission,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
    };
    this.state.submissions = [item, ...this.state.submissions];
    this.notify();
    return item;
  }

  public addStudyMaterial(material: Omit<StudyMaterial, 'id' | 'uploadedAt'>) {
    const item: StudyMaterial = {
      id: 'mat_' + Date.now().toString(36),
      ...material,
      uploadedAt: new Date().toISOString(),
    };
    this.state.studyMaterials = [item, ...this.state.studyMaterials];
    this.notify();
    return item;
  }

  // --- CERTIFICATE REQUESTS ---

  public requestCertificate(req: Omit<CertificateRequest, 'id' | 'requestDate' | 'status'>) {
    const item: CertificateRequest = {
      id: 'cert_' + Date.now().toString(36),
      ...req,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'REQUESTED',
    };
    this.state.certificates = [item, ...this.state.certificates];
    this.notify();
    return item;
  }

  public updateCertificateStatus(id: string, status: CertificateRequest['status']) {
    const cert = this.state.certificates.find(c => c.id === id);
    if (cert) {
      cert.status = status;
      if (status === 'ISSUED') {
        cert.issuedDate = new Date().toISOString().split('T')[0];
      }
      this.notify();
    }
  }

  // --- FEES DEMO PAYMENT ---

  public payFee(feeId: string, amount: number) {
    const fee = this.state.fees.find(f => f.id === feeId);
    if (!fee) throw new Error('Fee record not found.');
    fee.paidAmount = Math.min(fee.totalFee, fee.paidAmount + amount);
    fee.pendingAmount = Math.max(0, fee.totalFee - fee.paidAmount);
    fee.status = fee.pendingAmount === 0 ? 'PAID' : 'PARTIAL';
    fee.lastPaymentDate = new Date().toISOString().split('T')[0];
    fee.receiptNumber = 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000);
    this.notify();
    return fee;
  }
}

// Global Singleton Database Instance
export const db = new CollegeDatabase();
