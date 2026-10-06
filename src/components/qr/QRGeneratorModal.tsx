import React, { useState } from 'react';
import { QrCode, X, Sparkles, Layers, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { db } from '../../lib/db/store';
import { useAuth } from '../../lib/auth/authContext';

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
}) => {
  const { currentUser } = useAuth();
  const dbState = db.getState();

  const [selectedClassId, setSelectedClassId] = useState<string>(dbState.classes[0]?.id || '');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(dbState.divisions[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(dbState.subjects[0]?.id || '');
  const [lectureTopic, setLectureTopic] = useState<string>('State Synchronization & Security Tokens');
  const [roomNumber, setRoomNumber] = useState<string>('Room 304 (Science Block)');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter divisions for selected class
  const classDivisions = dbState.divisions.filter(d => d.classId === selectedClassId);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('Authenticated teacher credentials required.');
      return;
    }

    try {
      const { session } = db.createAttendanceSession({
        teacherId: currentUser.id,
        classId: selectedClassId,
        divisionId: selectedDivisionId,
        subjectId: selectedSubjectId,
        lectureTopic,
        roomNumber,
      });

      onSessionCreated(session.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create attendance session.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Attendance QR</h3>
              <p className="text-[11px] text-slate-400">Classroom Session Setup • Exactly 5 Minutes Validity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Class Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target College Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => {
                setSelectedClassId(e.target.value);
                const divs = dbState.divisions.filter(d => d.classId === e.target.value);
                if (divs.length > 0) setSelectedDivisionId(divs[0].id);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              {dbState.classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Academic Year 2026-2027)
                </option>
              ))}
            </select>
          </div>

          {/* Division Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Division / Section
              </label>
              <select
                value={selectedDivisionId}
                onChange={e => setSelectedDivisionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                {classDivisions.map(d => (
                  <option key={d.id} value={d.id}>
                    Division {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lecture Room
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 304"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject / Course Module
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              {dbState.subjects.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lecture Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lecture Topic / Discussion Note
            </label>
            <input
              type="text"
              value={lectureTopic}
              onChange={e => setLectureTopic(e.target.value)}
              placeholder="e.g. Relational Normalization & BCNF"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Security Rules Notice */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Cryptographic Expiry Rules:
            </div>
            <p className="text-[11px]">
              • QR session is strictly valid for <strong className="text-slate-200">5 minutes</strong> from generation.
            </p>
            <p className="text-[11px]">
              • Enforces server-side class, division, and subject enrollment boundaries.
            </p>
            <p className="text-[11px]">
              • Database duplicate protection locks <strong className="text-slate-200">UNIQUE(sessionId, studentId)</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Attendance QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
