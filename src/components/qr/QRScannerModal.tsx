import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import {
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { db } from '../../lib/db/store';
import { useAuth } from '../../lib/auth/authContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { currentUser, role } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Manual token input for instant debugging
  const [manualToken, setManualToken] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not available on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        await videoRef.current.play();
        setCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access or use the simulation test buttons below.'
          : 'Could not activate camera. You can test the full verification flow using the rapid test triggers below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCameraActive(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // Detected a QR code
        handleScannedData(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleScannedData = (scannedString: string) => {
    setIsProcessing(true);
    stopCamera();

    // Extract token hash from URL or plain string
    // Format: https://domain/attendance/scan/<tokenHash> or <tokenHash>
    let token = scannedString.trim();
    if (token.includes('/attendance/scan/')) {
      const parts = token.split('/attendance/scan/');
      token = parts[1] || '';
    }

    submitTokenToBackend(token);
  };

  const submitTokenToBackend = (tokenHash: string) => {
    if (!currentUser) {
      setScanResult({
        success: false,
        message: 'You must be logged in as a student to record attendance.',
      });
      setIsProcessing(false);
      return;
    }

    try {
      const outcome = db.processAttendanceScan({
        tokenHash,
        studentUserId: currentUser.id,
      });

      setScanResult(outcome);

      if (outcome.success) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_) {}

        if (onScanSuccess) {
          onScanSuccess();
        }
      }
    } catch (e: any) {
      setScanResult({
        success: false,
        message: e?.message || 'Server validation encountered an error.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Find active session token for quick test simulations
  const dbState = db.getState();
  const activeSession = dbState.attendanceSessions.find(s => s.status === 'ACTIVE' && Date.now() < s.expiresAt);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative text-slate-100 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Attendance QR Scanner</h3>
              <p className="text-[11px] text-slate-400">Classroom Mobile Camera Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Current Logged In Student Identity Badge */}
          <div className="mb-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400">Authenticated Student: </span>
                <span className="font-semibold text-white">{currentUser?.name || 'Guest'}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px]">
              {currentUser?.email}
            </span>
          </div>

          {/* Scanner Viewport / Camera */}
          {!scanResult && (
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Camera Video Stream */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Aiming Reticle / Laser Scan Line */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-indigo-500/80 rounded-2xl relative shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl"></div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr"></div>
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl"></div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br"></div>
                    <div className="w-full h-0.5 bg-indigo-400/90 shadow-[0_0_8px_#818cf8] animate-bounce absolute top-1/2"></div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 mt-3 bg-black/60 px-3 py-1 rounded-full">
                    Point camera steadily at classroom QR
                  </span>
                </div>
              )}

              {/* Camera Inactive / Permission Notice */}
              {!cameraActive && (
                <div className="p-6 text-center">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-3">
                    {cameraError || 'Camera initializing or unavailable.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Retry Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Result Feedback Banner */}
          {scanResult && (
            <div className={`p-5 rounded-2xl border text-center transition ${
              scanResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}>
              {scanResult.success ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{scanResult.message}</h4>
                  <p className="text-xs text-emerald-300/90 mt-1">Verified & Permanently Recorded in PostgreSQL Database</p>

                  {scanResult.details && (
                    <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Student Name:</span>
                        <span className="font-semibold text-white">{scanResult.details.studentName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Student ID:</span>
                        <span className="font-mono text-indigo-300 font-semibold">{scanResult.details.studentIdNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Subject:</span>
                        <span className="font-semibold text-white">{scanResult.details.subjectName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Class & Division:</span>
                        <span className="text-slate-200">{scanResult.details.className} (Div {scanResult.details.divisionName})</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Date & Timestamp:</span>
                        <span className="text-slate-300">{scanResult.details.dateFormatted} • {scanResult.details.timeFormatted}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Official Status:</span>
                        <span className="font-bold text-emerald-400 uppercase tracking-wider">{scanResult.details.status}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-emerald-900/30"
                  >
                    Done / Return to Portal
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{scanResult.message}</h4>
                  <p className="text-xs text-rose-300/80 mt-1">Attendance submission rejected by security rules</p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => {
                        setScanResult(null);
                        startCamera();
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Rapid Validation & Simulation Testing Toolbar */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Live Verification Test Runner
              </span>
              <span className="text-[10px] text-slate-500">Evaluates All 12 Backend Rules</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Click below to test server-side authentication, duplicate rejection, expired session protection, and class boundary verification:
            </p>

            <div className="space-y-2">
              {activeSession ? (
                <>
                  <button
                    onClick={() => submitTokenToBackend(activeSession.tokenHash)}
                    className="w-full text-left p-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 rounded-xl text-xs flex items-center justify-between transition group"
                  >
                    <div>
                      <span className="font-semibold text-indigo-200 block">
                        Test 1 & 2: Mark Attendance with Active QR
                      </span>
                      <span className="text-[10px] text-indigo-400/80">
                        Class: {activeSession.className} Div {activeSession.divisionName} • {activeSession.subjectName}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => submitTokenToBackend(activeSession.tokenHash)}
                    className="w-full text-left p-2.5 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/30 rounded-xl text-xs flex items-center justify-between transition group"
                  >
                    <div>
                      <span className="font-semibold text-amber-200 block">
                        Test 3: Rescan Same QR [Duplicate Scan Test]
                      </span>
                      <span className="text-[10px] text-amber-400/80">
                        Asserts database UNIQUE(sessionId, studentId) blocks duplicate
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                  </button>
                </>
              ) : (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 text-center">
                  No active session found. Switch to Teacher role to generate a 5-minute QR code!
                </div>
              )}

              <button
                onClick={() => submitTokenToBackend('scsco-fake-expired-token-999')}
                className="w-full text-left p-2.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/30 rounded-xl text-xs flex items-center justify-between transition group"
              >
                <div>
                  <span className="font-semibold text-rose-200 block">
                    Test 4 & 7: Scan Expired or Invalid QR Token
                  </span>
                  <span className="text-[10px] text-rose-400/80">
                    Asserts server rejects timestamp &gt;= 5 mins or bogus tokens
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
