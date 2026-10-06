import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Download,
  Building,
  UserCheck
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { db } from '../../lib/db/store';

interface DigitalIDCardProps {
  student: StudentProfile;
}

export const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ student }) => {
  const [permanentQrUrl, setPermanentQrUrl] = useState<string>('');
  const dbState = db.getState();

  const dept = dbState.departments.find(d => d.id === student.departmentId);
  const course = dbState.courses.find(c => c.id === student.courseId);
  const collegeClass = dbState.classes.find(c => c.id === student.classId);
  const division = dbState.divisions.find(d => d.id === student.divisionId);

  useEffect(() => {
    // Generate Permanent Student ID QR (Strictly distinct from temporary attendance QR)
    const permanentPayload = `SCSCO-STUDENT-PERMANENT-ID:${student.studentIdNumber}:${student.rollNumber}:${student.name}`;
    QRCode.toDataURL(permanentPayload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    })
      .then(url => setPermanentQrUrl(url))
      .catch(err => console.error('Failed to generate permanent ID QR:', err));
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visual notice about ID QR vs Attendance QR */}
      <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 max-w-md w-full">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Notice:</strong> This is your <em>Permanent Student Identity Card</em>. It cannot be used to mark attendance. Use the dedicated <strong>Scan Attendance QR</strong> button for classroom sessions.
        </span>
      </div>

      {/* Official ID Card Container */}
      <div
        id="student-id-card"
        className="w-full max-w-md bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-500/30 relative overflow-hidden"
      >
        {/* Holographic Watermark Badge */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Header: College Branding */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-indigo-900 flex items-center justify-center font-black shadow-lg">
              <GraduationCap className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold tracking-wide uppercase text-white">SCSCO College</h4>
              <p className="text-[10px] text-indigo-300 font-medium">Digital Campus Identity Card</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Photo & Roll */}
          <div className="col-span-5 flex flex-col items-center">
            <div className="w-28 h-32 rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-xl relative bg-slate-800">
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-center py-0.5 text-[9px] font-bold text-indigo-200">
                {student.studentIdNumber}
              </div>
            </div>
            <span className="mt-2 text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800">
              Blood: {student.bloodGroup}
            </span>
          </div>

          {/* Student Academic Details */}
          <div className="col-span-7 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] text-indigo-300 uppercase tracking-wider block">Student Name</span>
              <h3 className="font-bold text-white text-sm leading-tight">{student.name}</h3>
            </div>

            <div>
              <span className="text-[10px] text-indigo-300 uppercase tracking-wider block">Course & Program</span>
              <p className="font-semibold text-slate-200 text-xs">{course?.name || 'BCS'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">Class / Year</span>
                <p className="font-semibold text-slate-200">{collegeClass?.name || '3rd Year'}</p>
              </div>
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">Division</span>
                <p className="font-semibold text-slate-200">Div {division?.name || 'A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">Roll Number</span>
                <p className="font-mono font-semibold text-indigo-200">{student.rollNumber}</p>
              </div>
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">Academic Year</span>
                <p className="font-semibold text-slate-200">2026-2027</p>
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Student ID QR Code & Emergency Verification */}
        <div className="mt-4 pt-4 border-t border-indigo-500/20 flex items-center justify-between gap-3">
          <div className="space-y-0.5 text-[10px] text-indigo-300">
            <p><span className="text-slate-400">Department:</span> {dept?.name || 'Computer Science'}</p>
            <p><span className="text-slate-400">Guardian Contact:</span> {student.guardianPhone}</p>
            <p><span className="text-slate-400">Issued On:</span> {student.admissionDate}</p>
            <span className="inline-block mt-1 font-mono text-[9px] text-emerald-400 font-bold uppercase">
              Permanent Physical & Library Pass
            </span>
          </div>

          <div className="flex flex-col items-center bg-white p-1.5 rounded-xl shadow-lg shrink-0">
            {permanentQrUrl ? (
              <img
                src={permanentQrUrl}
                alt="Permanent ID QR"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded"></div>
            )}
            <span className="text-[8px] text-slate-800 font-bold tracking-tighter mt-0.5">PERMANENT ID</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> Print ID Card
        </button>
      </div>
    </div>
  );
};
