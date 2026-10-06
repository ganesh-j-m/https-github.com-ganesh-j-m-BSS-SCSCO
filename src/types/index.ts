export type UserRole = 'STUDENT' | 'PARENT' | 'TEACHER' | 'HOD' | 'PRINCIPAL' | 'ADMIN';

export type SessionStatus = 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  departmentId?: string;
  studentProfileId?: string;
  facultyProfileId?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentIdNumber: string; // e.g. ST001
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  departmentId: string;
  courseId: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  divisionId: string;
  rollNumber: string;
  bloodGroup: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  dateOfBirth: string;
  admissionDate: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  employeeCode: string; // e.g. FAC001
  name: string;
  designation: string; // e.g. Professor, Assistant Professor, HOD
  departmentId: string;
  qualification: string;
  experienceYears: number;
  phone: string;
  email: string;
  photoUrl: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
  establishedYear: number;
  description: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  durationYears: number;
  totalSemesters: number;
  degreeType: 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DIPLOMA';
}

export interface AcademicYear {
  id: string;
  yearString: string; // e.g. 2026-2027
  isCurrent: boolean;
}

export interface Semester {
  id: string;
  courseId: string;
  semesterNumber: number;
  name: string; // e.g. Semester 5
}

export interface CollegeClass {
  id: string;
  name: string; // e.g. BCS 3rd Year
  courseId: string;
  academicYearId: string;
  semesterId: string;
}

export interface Division {
  id: string;
  classId: string;
  name: string; // e.g. A, B, C
  roomNumber: string;
  capacity: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
  credits: number;
  facultyId: string; // primary teacher
}

export interface SubjectEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  academicYearId: string;
  semesterId: string;
}

export interface AttendanceSession {
  id: string;
  tokenHash: string; // Cryptographic short-lived reference
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  divisionId: string;
  divisionName: string;
  academicYearId: string;
  semesterId: string;
  lectureTopic: string;
  roomNumber: string;
  startsAt: number; // Timestamp ms
  expiresAt: number; // Timestamp ms (startsAt + 5 mins)
  status: SessionStatus;
  createdAt: string;
  closedAt?: string;
  totalExpectedStudents: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  markedAt: number; // Timestamp ms
  scanTimeFormatted: string;
  status: AttendanceStatus;
  markedVia: 'QR_SCAN' | 'MANUAL_CORRECTION';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'MANUAL_OVERRIDE' | 'SESSION_CLOSE' | 'SESSION_CREATE' | 'STATUS_CHANGE';
  sessionId: string;
  recordId?: string;
  studentId?: string;
  studentName?: string;
  reason: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  divisionId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. 09:00 AM
  endTime: string; // e.g. 10:00 AM
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  divisionId: string;
  facultyId: string;
  facultyName: string;
  deadline: string;
  maxMarks: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileUrl: string;
  fileName: string;
  marksObtained?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED';
}

export interface StudyMaterial {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX';
  fileSize: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ExaminationSchedule {
  id: string;
  examName: string; // e.g. Mid-Term Semester V Examination
  courseId: string;
  semesterId: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  totalMarks: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  semesterId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  status: 'PASS' | 'FAIL';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  receiptNumber?: string;
  lastPaymentDate?: string;
}

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  previousSchoolOrCollege: string;
  marksPercentage: number;
  appliedDate: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  adminComments?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: 'ACADEMIC' | 'EXAMINATION' | 'PLACEMENT' | 'EVENT' | 'GENERAL';
  content: string;
  targetRole: 'ALL' | 'STUDENT' | 'TEACHER';
  isImportant: boolean;
  publishedDate: string;
  attachmentName?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'TECHNICAL' | 'CULTURAL' | 'SPORTS' | 'SEMINAR';
  description: string;
  eventDate: string;
  location: string;
  registeredCount: number;
  capacity: number;
  imageUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedDate: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'CAMPUS' | 'LABORATORY' | 'SPORTS' | 'EVENTS';
  imageUrl: string;
  description: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export interface PlacementJob {
  id: string;
  companyName: string;
  companyLogo: string;
  jobRole: string;
  packageLPA: string;
  location: string;
  eligibleDepartments: string[];
  minCgpa: number;
  lastDateToApply: string;
  openings: number;
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  certificateType: 'BONAFIDE' | 'TRANSCRIPT' | 'LEAVING' | 'CHARACTER';
  purpose: string;
  requestDate: string;
  status: 'REQUESTED' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'ISSUED';
  issuedDate?: string;
}

export interface SystemAuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}
