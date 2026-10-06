import React, { useState } from 'react';
import { ShieldAlert, X, Check, AlertCircle } from 'lucide-react';
import { db } from '../../lib/db/store';
import { AttendanceStatus } from '../../types';
import { useAuth } from '../../lib/auth/authContext';

interface AttendanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  currentStatus: AttendanceStatus;
  onSuccess?: () => void;
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  studentId,
  studentName,
  studentIdNumber,
  currentStatus,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [newStatus, setNewStatus] = useState<AttendanceStatus>(
    currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT'
  );
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason || reason.trim().length < 6) {
      setErrorMsg('A detailed justification (at least 6 characters) is legally required for attendance correction.');
      return;
    }

    if (!currentUser) {
      setErrorMsg('Authenticated actor context is missing.');
      return;
    }

    try {
      db.correctAttendanceRecord({
        sessionId,
        studentId,
        newStatus,
        reason: reason.trim(),
        actor: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
        },
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply attendance correction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official Attendance Correction</h3>
              <p className="text-[11px] text-slate-500">Creates Permanent Audited Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Student Identity */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-slate-800">{studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono text-slate-700">{studentIdNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className={`font-semibold ${currentStatus === 'PRESENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currentStatus}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
              <span className="text-slate-500">Authorizing Officer:</span>
              <span className="font-semibold text-indigo-700">{currentUser?.name} ({currentUser?.role})</span>
            </div>
          </div>

          {/* New Status Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Verified Status
            </label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as AttendanceStatus)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="PRESENT">PRESENT (Verify Physical Attendance)</option>
              <option value="ABSENT">ABSENT (Mark Absent)</option>
              <option value="EXCUSED">EXCUSED (Medical / Authorized Duty)</option>
              <option value="LATE">LATE (Admitted with Tardy)</option>
            </select>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mandatory Justification / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Medical documentation verified by department office; physical attendance confirmed."
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Required by academic audit policy. This reason will be stamped in <code>AttendanceAuditLog</code>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Official Correction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
