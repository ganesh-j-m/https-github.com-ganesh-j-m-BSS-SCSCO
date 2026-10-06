import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Edit3,
  History,
  BookOpen
} from 'lucide-react';
import { db } from '../../lib/db/store';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';
import { useAuth } from '../../lib/auth/authContext';
import { AttendanceStatus } from '../../types';

export const AttendanceReports: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState<'RECORDS' | 'SESSIONS' | 'AUDIT'>('RECORDS');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');

  // Correction Modal state
  const [selectedCorrection, setSelectedCorrection] = useState<{
    sessionId: string;
    studentId: string;
    studentName: string;
    studentIdNumber: string;
    currentStatus: AttendanceStatus;
  } | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  // Filter records
  const filteredRecords = dbState.attendanceRecords.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const session = dbState.attendanceSessions.find(s => s.id === r.sessionId);
    const matchesClass = filterClass === 'ALL' || (session && session.classId === filterClass);
    const matchesSubject = filterSubject === 'ALL' || (session && session.subjectId === filterSubject);

    return matchesSearch && matchesClass && matchesSubject;
  });

  const exportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Session ID', 'Subject', 'Class', 'Date/Time', 'Status', 'Method'];
    const rows = filteredRecords.map(r => {
      const sess = dbState.attendanceSessions.find(s => s.id === r.sessionId);
      return [
        r.studentIdNumber,
        `"${r.studentName}"`,
        r.sessionId,
        `"${sess?.subjectName || ''}"`,
        `"${sess?.className || ''} Div ${sess?.divisionName || ''}"`,
        r.scanTimeFormatted,
        r.status,
        r.markedVia,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SCSCO_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const canCorrectAttendance = ['TEACHER', 'HOD', 'PRINCIPAL', 'ADMIN'].includes(role);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header and Controls */}
      <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Official Attendance Records & Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically logged classroom attendance data backed by PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'RECORDS'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Records ({filteredRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'SESSIONS'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Session History ({dbState.attendanceSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'AUDIT'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Attendance Audit Trail ({dbState.attendanceAuditLogs.length})
        </button>
      </div>

      {/* Search & Filters */}
      {activeTab === 'RECORDS' && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student by name or ID (e.g. Aarav, ST001)..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Classes</option>
              {dbState.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {dbState.subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeTab === 'RECORDS' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Subject & Class</th>
                <th className="p-3.5">Marked Time</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                {canCorrectAttendance && <th className="p-3.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No attendance records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const sess = dbState.attendanceSessions.find(s => s.id === r.sessionId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-semibold text-slate-800">
                        {r.studentName}
                        <span className="block text-[11px] font-mono text-slate-400">{r.studentIdNumber}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {dbState.students.find(s => s.id === r.studentId)?.rollNumber || 'BCS-301'}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-medium text-slate-800">{sess?.subjectName || 'Web Technology'}</span>
                        <span className="block text-[11px] text-slate-400">
                          {sess?.className || 'BCS 3rd Year'} Div {sess?.divisionName || 'A'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono">
                        {r.scanTimeFormatted}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {r.markedVia}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      {canCorrectAttendance && (
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedCorrection({
                              sessionId: r.sessionId,
                              studentId: r.studentId,
                              studentName: r.studentName,
                              studentIdNumber: r.studentIdNumber,
                              currentStatus: r.status,
                            })}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition inline-flex items-center gap-1 font-semibold text-[11px]"
                            title="Audited Manual Correction"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Correct
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'SESSIONS' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Session ID</th>
                <th className="p-3.5">Subject & Class</th>
                <th className="p-3.5">Faculty In-Charge</th>
                <th className="p-3.5">Topic & Room</th>
                <th className="p-3.5">Generated At</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbState.attendanceSessions.map(sess => (
                <tr key={sess.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono text-indigo-600 font-semibold">{sess.id}</td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800">{sess.subjectName}</span>
                    <span className="block text-[11px] text-slate-500">{sess.className} Div {sess.divisionName}</span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">{sess.teacherName}</td>
                  <td className="p-3.5 text-slate-600">
                    <div>{sess.lectureTopic}</div>
                    <span className="text-[11px] text-slate-400">{sess.roomNumber}</span>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(sess.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      sess.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sess.status === 'CLOSED'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {sess.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'AUDIT' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Authorizing Officer</th>
                <th className="p-3.5">Target Student</th>
                <th className="p-3.5">Action & Change</th>
                <th className="p-3.5">Mandatory Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbState.attendanceAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No manual attendance corrections have been logged yet. All active records originate from secure QR scans.
                  </td>
                </tr>
              ) : (
                dbState.attendanceAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-indigo-700">{log.actorName}</span>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">{log.actorRole}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {log.studentName || 'Session Wide'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {log.oldValue} → {log.newValue}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 italic max-w-xs">
                      "{log.reason}"
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Attendance Correction Modal */}
      {selectedCorrection && (
        <AttendanceCorrectionModal
          isOpen={true}
          onClose={() => setSelectedCorrection(null)}
          sessionId={selectedCorrection.sessionId}
          studentId={selectedCorrection.studentId}
          studentName={selectedCorrection.studentName}
          studentIdNumber={selectedCorrection.studentIdNumber}
          currentStatus={selectedCorrection.currentStatus}
          onSuccess={() => setDbState({ ...db.getState() })}
        />
      )}
    </div>
  );
};
