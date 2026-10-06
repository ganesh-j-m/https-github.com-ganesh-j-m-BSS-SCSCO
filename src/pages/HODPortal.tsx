import React, { useState } from 'react';
import {
  Layers,
  Users,
  AlertTriangle,
  FileText,
  BarChart2,
  Calendar,
  CheckCircle2,
  BookOpen,
  History,
  TrendingUp,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { db } from '../lib/db/store';
import { useAuth } from '../lib/auth/authContext';
import { AttendanceReports } from '../components/attendance/AttendanceReports';

export const HODPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'DEFAULTERS' | 'REPORTS' | 'FACULTY'>('ANALYTICS');

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  // Department analytics calculations
  const csStudents = dbState.students.filter(s => s.departmentId === 'dept_cs');
  const csSessions = dbState.attendanceSessions.filter(s => s.academicYearId === 'ay_2026_27');
  const csRecords = dbState.attendanceRecords;

  // Calculate defaulter students (<75% attendance)
  const defaulters = csStudents.map(stu => {
    const records = csRecords.filter(r => r.studentId === stu.id);
    const totalSessions = csSessions.filter(s => s.classId === stu.classId && s.divisionId === stu.divisionId).length || 1;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const pct = Math.round((present / Math.max(totalSessions, 1)) * 100);
    return {
      student: stu,
      present,
      total: totalSessions,
      pct,
    };
  }).filter(d => d.pct < 75);

  // Subject attendance trend data for chart
  const subjectChartData = dbState.subjects.map(sub => {
    const sessions = dbState.attendanceSessions.filter(s => s.subjectId === sub.id);
    const records = dbState.attendanceRecords.filter(r => sessions.some(s => s.id === r.sessionId));
    const totalPossible = sessions.reduce((acc, s) => acc + s.totalExpectedStudents, 0) || 10;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const pct = Math.min(100, Math.round((present / totalPossible) * 100));

    return {
      subject: sub.code,
      name: sub.name,
      attendancePercentage: pct,
      sessionsCount: sessions.length,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-purple-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Department Executive Portal
            </span>
            <span className="text-xs text-purple-300">Computer Science & Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Head of Department Dashboard
          </h1>
          <p className="text-xs text-purple-200">
            Dr. Meera Deshmukh • Department Attendance Oversight, Curriculum Delivery & Audit Logs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-2 text-xs font-semibold">
        {[
          { key: 'ANALYTICS', label: 'Department Analytics' },
          { key: 'DEFAULTERS', label: `Low Attendance Defaulters (${defaulters.length})` },
          { key: 'REPORTS', label: 'Official Records & Audits' },
          { key: 'FACULTY', label: 'Department Faculty Roster' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-purple-700 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Department Enrolment</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{csStudents.length} Students</div>
              <p className="text-[11px] text-indigo-600 mt-2 font-medium">Undergraduate BCS & B.Tech</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Conducted QR Sessions</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{csSessions.length} Sessions</div>
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">100% Cryptographic verification</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Low Attendance Alerts</span>
              <div className={`text-3xl font-extrabold mt-1 ${defaulters.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {defaulters.length} Students
              </div>
              <p className="text-[11px] text-rose-600 mt-2 font-medium">&lt; 75% attendance threshold</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Members</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{dbState.faculty.length} Faculty</div>
              <p className="text-[11px] text-purple-600 mt-2 font-medium">Professors & Lecturers</p>
            </div>
          </div>

          {/* Subject Attendance Performance Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  Subject-wise Attendance Performance Benchmark
                </h3>
                <p className="text-xs text-slate-500">Live aggregated attendance across all conducted QR sessions</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                    formatter={(value: any) => [`${value}%`, 'Attendance Average']}
                  />
                  <Bar dataKey="attendancePercentage" fill="#7c3aed" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFAULTERS */}
      {activeTab === 'DEFAULTERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Defaulter Students List (&lt; 75% Attendance)
              </h3>
              <p className="text-xs text-slate-500">Students ineligible for semester examinations without formal condonation</p>
            </div>
            <button
              onClick={() => alert('Condonation warning notifications dispatched to registered guardians.')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow"
            >
              Dispatch Guardian SMS / Email Alerts
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Class & Div</th>
                <th className="p-3">Guardian Name & Phone</th>
                <th className="p-3">Attendance %</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defaulters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No defaulter students found. All enrolled students exceed 75% attendance.
                  </td>
                </tr>
              ) : (
                defaulters.map(({ student, pct }) => (
                  <tr key={student.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">{student.name}</td>
                    <td className="p-3 font-mono text-slate-600">{student.studentIdNumber}</td>
                    <td className="p-3 text-slate-600">BCS 3rd Year (Div {student.divisionId === 'div_a' ? 'A' : 'B'})</td>
                    <td className="p-3 text-slate-600">{student.guardianName} • {student.guardianPhone}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {pct}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Issued official academic show-cause notice to ${student.name} (${student.studentIdNumber}).`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                      >
                        Issue Warning Notice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: REPORTS & AUDIT TRAIL */}
      {activeTab === 'REPORTS' && (
        <AttendanceReports />
      )}

      {/* TAB 4: FACULTY ROSTER */}
      {activeTab === 'FACULTY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Department Faculty Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {dbState.faculty.map(f => (
              <div key={f.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                <img src={f.photoUrl} alt={f.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-purple-700 font-mono uppercase">{f.employeeCode}</span>
                  <h4 className="font-bold text-slate-800 text-sm">{f.name}</h4>
                  <p className="text-slate-600">{f.designation}</p>
                  <p className="text-slate-500">{f.qualification} • {f.experienceYears} Years Exp.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
