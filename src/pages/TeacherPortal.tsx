import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Clock,
  BookOpen,
  Calendar,
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Play,
  Upload,
  Send,
  Layers,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/db/store';
import { useAuth } from '../lib/auth/authContext';
import { AttendanceReports } from '../components/attendance/AttendanceReports';
import { ClassroomQRPresenter } from '../components/qr/ClassroomQRPresenter';

interface TeacherPortalProps {
  onOpenQRGenerator: () => void;
  onOpenPresenterSession: (sessionId: string) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  onOpenQRGenerator,
  onOpenPresenterSession,
}) => {
  const { currentUser, facultyProfile } = useAuth();
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REPORTS' | 'ASSIGNMENTS' | 'MATERIALS' | 'TIMETABLE'>('DASHBOARD');

  // New assignment form state
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgSubjectId, setAsgSubjectId] = useState(dbState.subjects[0]?.id || '');
  const [asgDeadline, setAsgDeadline] = useState('2026-10-28');
  const [asgMaxMarks, setAsgMaxMarks] = useState(25);
  const [asgFeedback, setAsgFeedback] = useState<string | null>(null);

  // New study material state
  const [matTitle, setMatTitle] = useState('');
  const [matSubjectId, setMatSubjectId] = useState(dbState.subjects[0]?.id || '');
  const [matType, setMatType] = useState<'PDF' | 'DOCX' | 'PPTX'>('PDF');
  const [matFeedback, setMatFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  const fac = facultyProfile || dbState.faculty[0];

  // Active attendance session owned by this teacher or recent
  const activeSession = dbState.attendanceSessions.find(
    s => s.status === 'ACTIVE' && Date.now() < s.expiresAt
  ) || dbState.attendanceSessions[0];

  // Faculty's subjects
  const facultySubjects = dbState.subjects.filter(s => s.facultyId === fac.id);

  // Faculty's timetable slots
  const facultyTimetable = dbState.timetable.filter(t => t.facultyId === fac.id);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = dbState.subjects.find(s => s.id === asgSubjectId);
    db.addAssignment({
      title: asgTitle,
      description: asgDesc,
      subjectId: asgSubjectId,
      subjectName: subject?.name || 'Curriculum Course',
      classId: 'cls_bcs_3',
      divisionId: 'div_a',
      facultyId: fac.id,
      facultyName: fac.name,
      deadline: asgDeadline,
      maxMarks: asgMaxMarks,
    });
    setAsgTitle('');
    setAsgDesc('');
    setAsgFeedback('Assignment published to students successfully.');
    setTimeout(() => setAsgFeedback(null), 3000);
  };

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = dbState.subjects.find(s => s.id === matSubjectId);
    db.addStudyMaterial({
      title: matTitle,
      subjectId: matSubjectId,
      subjectName: subject?.name || 'Curriculum Course',
      facultyId: fac.id,
      facultyName: fac.name,
      fileType: matType,
      fileSize: '3.6 MB',
      fileUrl: '/uploads/' + matTitle.toLowerCase().replace(/\s+/g, '_') + '.' + matType.toLowerCase(),
    });
    setMatTitle('');
    setMatFeedback('Study material uploaded and made available to students.');
    setTimeout(() => setMatFeedback(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Faculty Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">Code: {fac.employeeCode}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {fac.name}
          </h1>
          <p className="text-xs text-indigo-300">
            {fac.designation} • Department of Computer Science & Engineering
          </p>
        </div>

        <button
          onClick={onOpenQRGenerator}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          <span>Generate Attendance QR</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-2 text-xs font-semibold">
        {[
          { key: 'DASHBOARD', label: 'Dashboard & Active Sessions' },
          { key: 'REPORTS', label: 'Attendance Reports & Audit' },
          { key: 'ASSIGNMENTS', label: 'Manage Assignments' },
          { key: 'MATERIALS', label: 'Upload Study Handouts' },
          { key: 'TIMETABLE', label: 'My Teaching Schedule' },
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

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Active Attendance Session Highlight Card */}
          {activeSession && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeSession.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {activeSession.status} Session
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {activeSession.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {activeSession.subjectName} ({activeSession.className} Div {activeSession.divisionName})
                </h3>
                <p className="text-xs text-slate-400">
                  Topic: {activeSession.lectureTopic} • Venue: {activeSession.roomNumber}
                </p>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="text-emerald-400 font-semibold">
                    Present: {dbState.attendanceRecords.filter(r => r.sessionId === activeSession.id).length} Students
                  </span>
                  <span className="text-slate-400">
                    Total Enrolled: {activeSession.totalExpectedStudents}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onOpenPresenterSession(activeSession.id)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Open Projector Screen
                </button>
                <button
                  onClick={onOpenQRGenerator}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700"
                >
                  Create New Session
                </button>
              </div>
            </div>
          )}

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Subjects</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{facultySubjects.length}</div>
              <p className="text-[11px] text-indigo-600 mt-2 font-medium">Undergraduate & Graduate modules</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lectures Delivered Today</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{facultyTimetable.length}</div>
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">All QR timestamps verified</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Student Submissions</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{dbState.submissions.length}</div>
              <p className="text-[11px] text-amber-600 mt-2 font-medium">Pending grading review</p>
            </div>
          </div>

          {/* Today's Teaching Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Today's Teaching Schedule
            </h3>

            <div className="space-y-3">
              {facultyTimetable.map(slot => (
                <div key={slot.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-600 font-mono">{slot.startTime} - {slot.endTime}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">{slot.subjectName}</h4>
                    <p className="text-slate-500">BCS 3rd Year • Division A • {slot.roomNumber}</p>
                  </div>
                  <button
                    onClick={onOpenQRGenerator}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow"
                  >
                    <QrCode className="w-4 h-4" /> Start QR Attendance
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE REPORTS & AUDIT TRAIL */}
      {activeTab === 'REPORTS' && (
        <AttendanceReports />
      )}

      {/* TAB 3: ASSIGNMENTS MANAGEMENT */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateAssignment} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Create & Assign Coursework</h3>
            {asgFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{asgFeedback}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
              <input
                type="text"
                value={asgTitle}
                onChange={e => setAsgTitle(e.target.value)}
                placeholder="e.g. Distributed Consensus in Raft"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Subject</label>
              <select
                value={asgSubjectId}
                onChange={e => setAsgSubjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
              >
                {dbState.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Deadline</label>
                <input
                  type="date"
                  value={asgDeadline}
                  onChange={e => setAsgDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={asgMaxMarks}
                  onChange={e => setAsgMaxMarks(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Problem Description</label>
              <textarea
                value={asgDesc}
                onChange={e => setAsgDesc(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
            >
              Publish Assignment
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Current Coursework & Submissions</h3>
            {dbState.assignments.map(a => (
              <div key={a.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-700 text-[10px] uppercase">{a.subjectName} • Due: {a.deadline}</span>
                <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                <p className="text-slate-600">{a.description}</p>
                <div className="pt-1 flex items-center justify-between text-slate-500 border-t border-slate-200 mt-2">
                  <span>Max Marks: {a.maxMarks}</span>
                  <span className="font-semibold text-emerald-600">
                    Submissions: {dbState.submissions.filter(s => s.assignmentId === a.id).length} Received
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDY MATERIALS */}
      {activeTab === 'MATERIALS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleUploadMaterial} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Upload Handout / Study Material</h3>
            {matFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{matFeedback}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Handout Title</label>
              <input
                type="text"
                value={matTitle}
                onChange={e => setMatTitle(e.target.value)}
                placeholder="e.g. Lecture 8 - Web Cryptography API"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={matSubjectId}
                onChange={e => setMatSubjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
              >
                {dbState.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">File Format</label>
              <select
                value={matType}
                onChange={e => setMatType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
              >
                <option value="PDF">PDF Document</option>
                <option value="PPTX">PowerPoint Presentation (.pptx)</option>
                <option value="DOCX">Word Document (.docx)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
            >
              Upload Material
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Uploaded Course Materials</h3>
            {dbState.studyMaterials.map(m => (
              <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-700 text-[10px] uppercase">{m.fileType} • {m.fileSize}</span>
                  <h4 className="font-bold text-slate-800 text-sm">{m.title}</h4>
                  <p className="text-slate-500">{m.subjectName} • Uploaded by {m.facultyName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TIMETABLE */}
      {activeTab === 'TIMETABLE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Weekly Faculty Teaching Timetable</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyTimetable.map(slot => (
              <div key={slot.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-indigo-600 text-[10px] uppercase block">{slot.dayOfWeek} • {slot.startTime} - {slot.endTime}</span>
                <h4 className="font-bold text-slate-800 text-sm">{slot.subjectName}</h4>
                <p className="text-slate-600">Class: BCS 3rd Year (Div {slot.divisionId === 'div_a' ? 'A' : 'B'})</p>
                <p className="text-slate-500">Hall: {slot.roomNumber}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
