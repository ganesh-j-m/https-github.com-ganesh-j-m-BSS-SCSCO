import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  BookOpen,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { db } from '../../lib/db/store';
import { AttendanceSession, AttendanceRecord } from '../../types';
import { useAuth } from '../../lib/auth/authContext';

interface ClassroomQRPresenterProps {
  sessionId: string;
  onCloseView?: () => void;
}

export const ClassroomQRPresenter: React.FC<ClassroomQRPresenterProps> = ({
  sessionId,
  onCloseView,
}) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(() => db.getSessionLiveStats(sessionId));
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [confirmCloseModal, setConfirmCloseModal] = useState<boolean>(false);

  // Subscribe to DB changes & live polling
  useEffect(() => {
    const updateStats = () => {
      const current = db.getSessionLiveStats(sessionId);
      setStats(current);
    };

    updateStats();
    const unsubscribe = db.subscribe(updateStats);
    // 1-second interval for clock tick and expiration check
    const timerInterval = setInterval(updateStats, 1000);

    return () => {
      unsubscribe();
      clearInterval(timerInterval);
    };
  }, [sessionId]);

  // Generate QR code whenever token is available
  useEffect(() => {
    if (stats?.session) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const payload = `${origin}/attendance/scan/${stats.session.tokenHash}`;
      QRCode.toDataURL(payload, {
        width: 480,
        margin: 2,
        color: {
          dark: '#1e1b4b', // Deep indigo
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR:', err));
    }
  }, [stats?.session?.tokenHash]);

  if (!stats || !stats.session) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">Attendance Session Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">The specified session reference does not exist.</p>
        {onCloseView && (
          <button
            onClick={onCloseView}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }

  const { session, records, presentCount, expectedCount, remainingCount, secondsRemaining, isExpired, isClosed } = stats;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleManualCloseSession = () => {
    if (currentUser) {
      db.closeAttendanceSession(sessionId, {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      });
      setConfirmCloseModal(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`w-full bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'my-4'}`}>
      {/* Top Banner / Session Header */}
      <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Smart Classroom Attendance Screen</h2>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                isClosed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isExpired
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
              }`}>
                {session.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              SCSCO College Digital Platform • Dynamic Cryptographic Attendance Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Projector Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {!isClosed && !isExpired && (
            <button
              onClick={() => setConfirmCloseModal(true)}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-rose-900/40"
            >
              Close Session Now
            </button>
          )}

          {onCloseView && (
            <button
              onClick={onCloseView}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Exit View
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left QR & Projector Timer, Right Session Details & Live Table */}
      <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Code & Countdown Timer */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
          {/* Validity Countdown Box */}
          <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-xl mb-6">
            <div className="flex items-center gap-2.5">
              <Clock className={`w-5 h-5 ${isExpired || isClosed ? 'text-slate-500' : 'text-indigo-400 animate-spin'}`} style={{ animationDuration: '4s' }} />
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">QR Validity Window</p>
                <p className="text-xs font-semibold text-slate-200">Strict 5 Minutes Server Lifetime</p>
              </div>
            </div>

            <div className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-wider ${
              isExpired || isClosed ? 'text-rose-400' : secondsRemaining <= 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}>
              {timeFormatted}
            </div>
          </div>

          {/* QR Display Card */}
          <div className="relative p-5 bg-white rounded-3xl shadow-2xl qr-glow flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Classroom Attendance QR Code"
                className={`w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-xl ${
                  isExpired || isClosed ? 'opacity-20 grayscale' : ''
                }`}
              />
            ) : (
              <div className="w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center bg-slate-100 rounded-xl">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
            )}

            {/* Overlay if Expired or Closed */}
            {(isExpired || isClosed) && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-2" />
                <h4 className="text-xl font-bold text-white">Attendance Session {isClosed ? 'Closed' : 'Expired'}</h4>
                <p className="text-sm text-slate-300 mt-1 max-w-xs">
                  {isClosed
                    ? 'Faculty has manually concluded this attendance session.'
                    : 'The 5-minute security validity window has elapsed. No further scans will be accepted.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick instructions below QR */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Students: Open <span className="text-indigo-400 font-semibold">Student Portal → Scan Attendance QR</span> on mobile
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Token Ref: {session.tokenHash.substring(0, 18)}...
            </p>
          </div>
        </div>

        {/* Right Column: Live Counters, Class Info, Scanned Students */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Lecture Metadata Card */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Class Lecture</span>
                <h3 className="text-lg font-bold text-white">{session.subjectName}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Faculty In-Charge</span>
                <p className="text-sm font-semibold text-slate-200">{session.teacherName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-indigo-400" /> Class</span>
                <p className="font-semibold text-slate-200 mt-0.5">{session.className}</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-400" /> Division</span>
                <p className="font-semibold text-slate-200 mt-0.5">Division {session.divisionName}</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location</span>
                <p className="font-semibold text-slate-200 mt-0.5">{session.roomNumber}</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Topic</span>
                <p className="font-semibold text-slate-200 mt-0.5 truncate" title={session.lectureTopic}>{session.lectureTopic}</p>
              </div>
            </div>
          </div>

          {/* Metric Counter Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Present</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1">{presentCount}</div>
              <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Recorded live</span>
            </div>

            <div className="bg-indigo-950/30 border border-indigo-800/40 p-4 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">Expected</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 mt-1">{expectedCount}</div>
              <span className="text-[10px] text-indigo-500/80 mt-0.5 block">Enrolled batch</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remaining</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 mt-1">{remainingCount}</div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Yet to scan</span>
            </div>
          </div>

          {/* Real-time Student Attendance Scanned List */}
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden flex-1 flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Live Recorded Attendance ({records.length})</h4>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Auto-Updating
              </span>
            </div>

            <div className="p-2 overflow-y-auto max-h-64 sm:max-h-72">
              {records.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                  Waiting for student scans...
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800/80">
                      <th className="p-2.5 font-medium">Student Name</th>
                      <th className="p-2.5 font-medium">Student ID</th>
                      <th className="p-2.5 font-medium">Scan Time</th>
                      <th className="p-2.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {records.map(record => (
                      <tr key={record.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-2.5 font-semibold text-slate-200">{record.studentName}</td>
                        <td className="p-2.5 font-mono text-slate-400">{record.studentIdNumber}</td>
                        <td className="p-2.5 text-slate-400">{record.scanTimeFormatted}</td>
                        <td className="p-2.5 text-right">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded font-semibold text-[11px]">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Close Session */}
      {confirmCloseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Close Attendance Session?</h3>
            <p className="text-sm text-slate-400 mt-2">
              Are you sure you want to close this attendance session? Once closed, no further scans will be accepted and an audit log will be permanently filed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmCloseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleManualCloseSession}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-md shadow-rose-900/30"
              >
                Yes, Close Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
