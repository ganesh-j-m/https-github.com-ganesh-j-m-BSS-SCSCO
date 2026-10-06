import React, { useState } from 'react';
import {
  GraduationCap,
  Camera,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  FileText,
  CreditCard,
  Briefcase,
  Award,
  Bell,
  Sparkles,
  Download,
  Send,
  Layers,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/db/store';
import { useAuth } from '../lib/auth/authContext';
import { DigitalIDCard } from '../components/student/DigitalIDCard';

interface StudentPortalProps {
  onOpenQRScanner: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onOpenQRScanner }) => {
  const { currentUser, studentProfile } = useAuth();
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ID_CARD' | 'ATTENDANCE' | 'TIMETABLE' | 'ASSIGNMENTS' | 'MATERIALS' | 'EXAMS' | 'RESULTS' | 'FEES' | 'CERTIFICATES' | 'PLACEMENTS'
  >('DASHBOARD');

  // Certificate request form state
  const [certType, setCertType] = useState<'BONAFIDE' | 'TRANSCRIPT' | 'LEAVING' | 'CHARACTER'>('BONAFIDE');
  const [certPurpose, setCertPurpose] = useState('');
  const [certFeedback, setCertFeedback] = useState<string | null>(null);

  // Assignment submission simulation
  const [selectedAsgId, setSelectedAsgId] = useState<string | null>(null);
  const [submittingFile, setSubmittingFile] = useState<string>('my_solution_code.zip');
  const [asgSuccess, setAsgSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  const stu = studentProfile || dbState.students[0];

  // Calculate attendance statistics
  const studentRecords = dbState.attendanceRecords.filter(r => r.studentId === stu.id);
  const totalClassesRecorded = dbState.attendanceSessions.filter(s => s.classId === stu.classId && s.divisionId === stu.divisionId).length || 1;
  const presentCount = studentRecords.filter(r => r.status === 'PRESENT').length;
  const attendancePercentage = Math.round((presentCount / Math.max(totalClassesRecorded, 1)) * 100);
  const isLowAttendance = attendancePercentage < 75;

  // Enrolled subjects for this student
  const studentEnrollments = dbState.enrollments.filter(e => e.studentId === stu.id);
  const enrolledSubjects = dbState.subjects.filter(s =>
    studentEnrollments.some(e => e.subjectId === s.id)
  );

  // Student Timetable
  const studentTimetable = dbState.timetable.filter(
    t => t.classId === stu.classId && t.divisionId === stu.divisionId
  );

  // Student Fees
  const feeRecord = dbState.fees.find(f => f.studentId === stu.id);

  const handleCertificateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certPurpose.trim()) return;
    db.requestCertificate({
      studentId: stu.id,
      studentName: stu.name,
      certificateType: certType,
      purpose: certPurpose,
    });
    setCertFeedback('Certificate application logged. Admin processing initiated.');
    setCertPurpose('');
    setTimeout(() => setCertFeedback(null), 3000);
  };

  const handlePayFee = () => {
    if (feeRecord && feeRecord.pendingAmount > 0) {
      db.payFee(feeRecord.id, feeRecord.pendingAmount);
    }
  };

  const handleSubmitAssignment = (assignmentId: string) => {
    db.submitAssignment({
      assignmentId,
      studentId: stu.id,
      studentName: stu.name,
      fileName: submittingFile,
      fileUrl: '/uploads/' + submittingFile,
    });
    setSelectedAsgId(null);
    setAsgSuccess('Assignment submitted successfully.');
    setTimeout(() => setAsgSuccess(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Quick QR Action */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-indigo-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Student Portal
            </span>
            <span className="text-xs text-indigo-300 font-mono">ID: {stu.studentIdNumber} • Roll: {stu.rollNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {stu.name}
          </h1>
          <p className="text-xs text-indigo-200">
            BCS 3rd Year • Division A • Department of Computer Science & Engineering
          </p>
        </div>

        <button
          onClick={onOpenQRScanner}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl transition shadow-lg shadow-emerald-700/40 flex items-center gap-2 animate-bounce"
        >
          <Camera className="w-5 h-5" />
          <span>Scan Attendance QR Code</span>
        </button>
      </div>

      {/* Low Attendance Warning Banner (Section 57) */}
      {isLowAttendance && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900">Low Attendance Warning (Defaulter Alert)</h4>
            <p className="mt-0.5">
              Your overall attendance is currently <strong className="text-rose-700">{attendancePercentage}%</strong>, which is below the mandatory <strong className="text-rose-700">75% threshold</strong> required for semester examination hall tickets. Please attend all regular lectures and scan verified classroom QR codes.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-2 text-xs font-semibold">
        {[
          { key: 'DASHBOARD', label: 'Dashboard & Overview' },
          { key: 'ID_CARD', label: 'Digital Student ID' },
          { key: 'ATTENDANCE', label: 'Attendance Breakdown' },
          { key: 'TIMETABLE', label: 'Daily Timetable' },
          { key: 'ASSIGNMENTS', label: 'Assignments' },
          { key: 'MATERIALS', label: 'Study Materials' },
          { key: 'EXAMS', label: 'Exams & Schedule' },
          { key: 'RESULTS', label: 'Results & Grade Card' },
          { key: 'FEES', label: 'Fees & Receipts' },
          { key: 'CERTIFICATES', label: 'Certificates' },
          { key: 'PLACEMENTS', label: 'Placements' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-extrabold ${isLowAttendance ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {attendancePercentage}%
                </span>
                <span className="text-xs text-slate-500">of 100% target</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${isLowAttendance ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Present Sessions</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-800">{presentCount}</span>
                <span className="text-xs text-slate-500">verified scans</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-3 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cryptographic integrity
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Assignments</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-800">{dbState.assignments.length}</span>
                <span className="text-xs text-slate-500">active tasks</span>
              </div>
              <p className="text-[11px] text-indigo-600 mt-3 font-medium">Due by October 25, 2026</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Exams</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-800">{dbState.exams.length}</span>
                <span className="text-xs text-slate-500">papers scheduled</span>
              </div>
              <p className="text-[11px] text-amber-600 mt-3 font-medium">Starts October 26, 2026</p>
            </div>
          </div>

          {/* Today's Schedule & Subject-wise Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today's Class Timetable */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-indigo-600" /> Today's Lecture Timetable
              </h3>

              <div className="space-y-3">
                {studentTimetable.map(slot => (
                  <div key={slot.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600 font-mono">{slot.startTime} - {slot.endTime}</span>
                        <span className="text-slate-400">• {slot.roomNumber}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{slot.subjectName}</h4>
                      <p className="text-slate-500">{slot.facultyName}</p>
                    </div>

                    <button
                      onClick={onOpenQRScanner}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1 transition"
                    >
                      <Camera className="w-3.5 h-3.5" /> Scan QR
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Attendance Breakdown */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Subject-wise Attendance
              </h3>

              <div className="space-y-3 text-xs">
                {enrolledSubjects.map(sub => {
                  // Subject records
                  const subRecords = studentRecords.filter(r => {
                    const sess = dbState.attendanceSessions.find(s => s.id === r.sessionId);
                    return sess && sess.subjectId === sub.id;
                  });
                  const subTotal = dbState.attendanceSessions.filter(s => s.subjectId === sub.id).length || 1;
                  const pct = Math.round((subRecords.length / subTotal) * 100);

                  return (
                    <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{sub.name}</span>
                        <span className={`font-mono font-bold ${pct < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL STUDENT ID CARD */}
      {activeTab === 'ID_CARD' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
          <DigitalIDCard student={stu} />
        </div>
      )}

      {/* TAB 3: ATTENDANCE RECORDS */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Attendance History</h3>
              <p className="text-xs text-slate-500">Every marked lecture is timestamped with cryptographic session verification</p>
            </div>
            <button
              onClick={onOpenQRScanner}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Camera className="w-4 h-4" /> Scan Attendance QR
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Session Ref</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Validation Mode</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No attendance records logged yet. Scan the classroom QR during an active lecture!
                  </td>
                </tr>
              ) : (
                studentRecords.map(r => {
                  const sess = dbState.attendanceSessions.find(s => s.id === r.sessionId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono text-indigo-600">{r.sessionId}</td>
                      <td className="p-3 font-semibold text-slate-800">{sess?.subjectName || 'Web Technology'}</td>
                      <td className="p-3 text-slate-600 font-mono">{r.scanTimeFormatted}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-semibold text-slate-700">
                          {r.markedVia}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: TIMETABLE */}
      {activeTab === 'TIMETABLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Official Weekly Class Timetable</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentTimetable.map(slot => (
              <div key={slot.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase block">{slot.dayOfWeek} • {slot.startTime} - {slot.endTime}</span>
                <h4 className="font-bold text-slate-800 text-sm">{slot.subjectName}</h4>
                <p className="text-slate-600">Faculty: {slot.facultyName}</p>
                <p className="text-slate-500">Venue: {slot.roomNumber}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ASSIGNMENTS */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Academic Assignments & Tasks</h3>
          {asgSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{asgSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            {dbState.assignments.map(asg => {
              const submission = dbState.submissions.find(s => s.assignmentId === asg.id && s.studentId === stu.id);
              return (
                <div key={asg.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 max-w-xl">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{asg.subjectName} • Due: {asg.deadline}</span>
                    <h4 className="font-bold text-slate-800 text-sm">{asg.title}</h4>
                    <p className="text-slate-600">{asg.description}</p>
                    <span className="text-[11px] text-slate-500 block">Max Marks: {asg.maxMarks} • Teacher: {asg.facultyName}</span>
                  </div>

                  <div>
                    {submission ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Submitted ({submission.status})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSubmitAssignment(asg.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> Submit Solution
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: STUDY MATERIALS */}
      {activeTab === 'MATERIALS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Course Handouts & Study Materials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {dbState.studyMaterials.map(mat => (
              <div key={mat.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">{mat.fileType} • {mat.fileSize}</span>
                  <h4 className="font-bold text-slate-800">{mat.title}</h4>
                  <p className="text-slate-500">{mat.subjectName}</p>
                </div>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); alert(`Downloading official study material: ${mat.title}`); }}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition"
                  title="Download Handout"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: EXAMS */}
      {activeTab === 'EXAMS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Mid-Semester Examination Schedule</h3>
          <div className="space-y-3 text-xs">
            {dbState.exams.map(ex => (
              <div key={ex.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-600 text-[10px] uppercase">{ex.examName}</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">{ex.subjectName}</h4>
                  <p className="text-slate-500">Date: {ex.examDate} • Timing: {ex.startTime} - {ex.endTime} • Hall: {ex.roomNumber}</p>
                </div>
                <span className="font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  {ex.totalMarks} Marks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: RESULTS */}
      {activeTab === 'RESULTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Semester Grade Card & Academic Results</h3>
              <p className="text-xs text-slate-500">Cumulative Performance Index: 9.20 CGPA</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition flex items-center gap-1"
            >
              <Download className="w-4 h-4" /> Print Transcript
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Subject Title</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Internal</th>
                <th className="p-3">External</th>
                <th className="p-3">Total</th>
                <th className="p-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbState.results.map(res => (
                <tr key={res.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-indigo-600 font-semibold">{res.subjectCode}</td>
                  <td className="p-3 font-bold text-slate-800">{res.subjectName}</td>
                  <td className="p-3">{res.credits}</td>
                  <td className="p-3">{res.internalMarks}</td>
                  <td className="p-3">{res.externalMarks}</td>
                  <td className="p-3 font-bold">{res.totalMarks}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {res.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 9: FEES & PAYMENTS */}
      {activeTab === 'FEES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">College Academic Fee Summary</h3>
          {feeRecord && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block">Total Tuition Fee</span>
                  <span className="text-base font-bold text-slate-800">₹{feeRecord.totalFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Paid Amount</span>
                  <span className="text-base font-bold text-emerald-600">₹{feeRecord.paidAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pending Balance</span>
                  <span className="text-base font-bold text-rose-600">₹{feeRecord.pendingAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Status</span>
                  <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-0.5">
                    {feeRecord.status}
                  </span>
                </div>
              </div>

              {feeRecord.pendingAmount > 0 ? (
                <button
                  onClick={handlePayFee}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Pay Balance Online (Demo Gateway)
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
                  <span>Fee dues are completely settled for Academic Year 2026-2027.</span>
                  <span className="font-mono text-xs font-bold text-indigo-700">Receipt: {feeRecord.receiptNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 10: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCertificateRequest} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Request Official Certificate</h3>
            {certFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{certFeedback}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Certificate Category</label>
              <select
                value={certType}
                onChange={e => setCertType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
              >
                <option value="BONAFIDE">Bonafide Certificate</option>
                <option value="TRANSCRIPT">Official Academic Transcript</option>
                <option value="CHARACTER">Character Certificate</option>
                <option value="LEAVING">College Leaving Certificate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purpose / Reason</label>
              <textarea
                value={certPurpose}
                onChange={e => setCertPurpose(e.target.value)}
                placeholder="e.g. Passport verification, education loan application..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
            >
              Submit Certificate Request
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Requested Certificates History</h3>
            {dbState.certificates.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-700">{c.certificateType} CERTIFICATE</span>
                  <p className="text-slate-600 mt-0.5">Purpose: {c.purpose}</p>
                  <span className="text-[11px] text-slate-400">Date: {c.requestDate}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  c.status === 'ISSUED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: PLACEMENTS */}
      {activeTab === 'PLACEMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Campus Placement Drives</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {dbState.jobs.map(job => (
              <div key={job.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-3">
                  <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800">{job.companyName}</h4>
                    <span className="font-semibold text-indigo-600">{job.packageLPA}</span>
                  </div>
                </div>
                <p className="text-slate-600"><strong>Role:</strong> {job.jobRole}</p>
                <p className="text-slate-500">Eligibility: Min CGPA {job.minCgpa}</p>
                <button
                  onClick={() => alert(`Applied to ${job.companyName} (${job.jobRole}). Application sent to placement officer.`)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
