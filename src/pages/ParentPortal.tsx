import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  Send,
  GraduationCap
} from 'lucide-react';
import { db } from '../lib/db/store';
import { useAuth } from '../lib/auth/authContext';

export const ParentPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [dbState, setDbState] = useState(db.getState());
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  // Ward: Aarav Patel (ST001)
  const ward = dbState.students[0];
  const wardRecords = dbState.attendanceRecords.filter(r => r.studentId === ward.id);
  const totalSessions = dbState.attendanceSessions.filter(s => s.classId === ward.classId && s.divisionId === ward.divisionId).length || 1;
  const presentCount = wardRecords.filter(r => r.status === 'PRESENT').length;
  const attendancePct = Math.round((presentCount / Math.max(totalSessions, 1)) * 100);
  const isDefaulter = attendancePct < 75;

  const wardFee = dbState.fees.find(f => f.studentId === ward.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Message delivered to Department HOD and Class Teacher.');
    setMsgSubject('');
    setMsgContent('');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
              Parent & Guardian Portal
            </span>
            <span className="text-xs text-slate-400">Ward: {ward.name} ({ward.studentIdNumber})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Parent Overview Dashboard
          </h1>
          <p className="text-xs text-teal-200">
            Monitor real-time classroom attendance, academic milestones, and term fee receipts.
          </p>
        </div>
      </div>

      {/* Ward Profile & Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <img src={ward.photoUrl} alt={ward.name} className="w-16 h-16 rounded-2xl object-cover" />
            <div>
              <span className="text-[10px] font-bold text-indigo-600 font-mono">{ward.studentIdNumber}</span>
              <h3 className="font-bold text-slate-800 text-base">{ward.name}</h3>
              <p className="text-slate-500">Roll: {ward.rollNumber} • BCS 3rd Year</p>
            </div>
          </div>

          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Class & Div:</span>
              <span className="font-semibold text-slate-800">BCS 3rd Year (Div A)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-slate-800">Computer Science</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Admission Date:</span>
              <span>{ward.admissionDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Group:</span>
              <span className="font-bold text-indigo-600">{ward.bloodGroup}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            isDefaulter
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">Aggregate Attendance</span>
              <span className="text-lg font-extrabold">{attendancePct}%</span>
            </div>
            <p className="text-[11px]">
              {isDefaulter
                ? 'Attendance is below mandatory 75% examination threshold.'
                : 'Good academic standing. Meets college attendance criteria.'}
            </p>
          </div>
        </div>

        {/* Attendance Breakdown & Term Fees */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Attended Lectures */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Recent Verified Classroom QR Scans
            </h3>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Session Mode</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardRecords.map(r => {
                  const sess = dbState.attendanceSessions.find(s => s.id === r.sessionId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-semibold text-slate-800">{sess?.subjectName || 'Web Technology'}</td>
                      <td className="p-3 font-mono text-slate-500">{r.scanTimeFormatted}</td>
                      <td className="p-3 text-slate-600 font-semibold">{r.markedVia}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Contact Faculty / Query Form */}
          <form onSubmit={handleSendMessage} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Contact Class Teacher / Faculty In-Charge
            </h3>
            {feedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Query Topic</label>
              <input
                type="text"
                value={msgSubject}
                onChange={e => setMsgSubject(e.target.value)}
                placeholder="e.g. Leave request regarding medical illness"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Description</label>
              <textarea
                value={msgContent}
                onChange={e => setMsgContent(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
