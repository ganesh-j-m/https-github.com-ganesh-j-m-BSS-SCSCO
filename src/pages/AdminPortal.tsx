import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Users,
  BookOpen,
  FileText,
  History,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Plus,
  QrCode
} from 'lucide-react';
import { db } from '../lib/db/store';
import { CMSManager } from '../components/cms/CMSManager';
import { AttendanceReports } from '../components/attendance/AttendanceReports';

export const AdminPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState<'CMS' | 'REPORTS' | 'STUDENTS' | 'SYSTEM_AUDIT'>('CMS');
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  const handleResetData = () => {
    if (confirm('Reset database to clean factory demonstration seed? All local modifications will be restored to default.')) {
      db.resetToFactoryDefaults();
      setResetNotice('Database restored to initial factory seed state.');
      setTimeout(() => setResetNotice(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-200 border border-rose-400/30">
              System Administration
            </span>
            <span className="text-xs text-slate-400">PostgreSQL Data Management & CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Admin Master Control Portal
          </h1>
          <p className="text-xs text-rose-200">
            Dr. Rajeshwari Sharma • System Registrar, Dynamic CMS Publishing, Role Governance & Full Audit Tracking
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          title="Reset database to initial demo state"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" /> Reset Demo Seed
        </button>
      </div>

      {resetNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-2 text-xs font-semibold">
        {[
          { key: 'CMS', label: 'College CMS (Notices, Events, News)' },
          { key: 'REPORTS', label: 'Attendance Reports & Corrections' },
          { key: 'STUDENTS', label: `Student Directory (${dbState.students.length})` },
          { key: 'SYSTEM_AUDIT', label: `System Audit Logs (${dbState.systemAuditLogs.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-rose-700 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CMS MANAGER */}
      {activeTab === 'CMS' && (
        <CMSManager />
      )}

      {/* TAB 2: ATTENDANCE & AUDITS */}
      {activeTab === 'REPORTS' && (
        <AttendanceReports />
      )}

      {/* TAB 3: STUDENT DIRECTORY */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrolled Students Database</h3>
              <p className="text-xs text-slate-500">Student accounts mapped to classes, divisions, and subjects</p>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">ID Number</th>
                <th className="p-3">Course & Class</th>
                <th className="p-3">Division</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Guardian Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbState.students.map(s => {
                const c = dbState.classes.find(cls => cls.id === s.classId);
                const d = dbState.divisions.find(div => div.id === s.divisionId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={s.photoUrl} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-semibold text-slate-800 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400">{s.email}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{s.studentIdNumber}</td>
                    <td className="p-3 text-slate-700">{c?.name || 'BCS 3rd Year'}</td>
                    <td className="p-3 text-slate-700 font-semibold">Div {d?.name || 'A'}</td>
                    <td className="p-3 font-mono text-slate-600">{s.rollNumber}</td>
                    <td className="p-3 text-slate-600">{s.guardianName} ({s.guardianPhone})</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: SYSTEM AUDIT LOGS */}
      {activeTab === 'SYSTEM_AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-rose-600" />
              Global System Audit Logs (Section 62)
            </h3>
            <p className="text-xs text-slate-500">Every sensitive action, attendance generation, scan, and policy modification is permanently stamped</p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Entity Ref</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbState.systemAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800 block">{log.actorName}</span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{log.actorRole}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-rose-700">{log.action}</td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">{log.entity} ({log.entityId})</td>
                  <td className="p-3 text-slate-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
