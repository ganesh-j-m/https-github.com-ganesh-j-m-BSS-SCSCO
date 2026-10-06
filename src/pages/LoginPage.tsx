import React, { useState } from 'react';
import {
  GraduationCap,
  LogIn,
  KeyRound,
  Mail,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../lib/auth/authContext';
import { UserRole } from '../types';

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  onBackToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'STUDENT',
  onLoginSuccess,
  onBackToPublic,
}) => {
  const { login, availableDemoUsers } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('student@scsco.edu');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const demoUser = availableDemoUsers.find(u => u.role === role);
    if (demoUser) {
      setEmail(demoUser.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = login(email, selectedRole);
    if (success) {
      onLoginSuccess(selectedRole);
    } else {
      setErrorMsg(`Invalid credentials for role ${selectedRole}. Please select an existing demo account below.`);
    }
  };

  const handleQuickLogin = (userEmail: string, role: UserRole) => {
    setSelectedRole(role);
    setEmail(userEmail);
    const success = login(userEmail, role);
    if (success) {
      onLoginSuccess(role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-2">
        <div
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">SCSCO College Digital Platform</h2>
        <p className="text-xs text-slate-400">Production-Grade Role-Based Authentication System</p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 text-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Role Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Your Institutional Role
              </label>
              <select
                value={selectedRole}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="STUDENT">STUDENT (Aarav Patel ST001 - QR Scanner & ID)</option>
                <option value="TEACHER">TEACHER (Prof. Vikramaditya Joshi - QR Generator)</option>
                <option value="HOD">HOD (Dr. Meera Deshmukh - CSE Analytics)</option>
                <option value="PRINCIPAL">PRINCIPAL (Dr. Arvind Kulkarni - College Analytics)</option>
                <option value="ADMIN">ADMIN (Dr. Rajeshwari Sharma - Master CMS)</option>
                <option value="PARENT">PARENT (Sunil Patel - Ward Monitoring)</option>
              </select>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" /> Sign In to {selectedRole} Portal
            </button>
          </form>

          {/* Quick-Click Demo Presets Section */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                One-Click Demo Presets
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold">Test All Roles</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@scsco.edu', 'TEACHER')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="font-bold text-blue-400 block text-[11px]">Teacher</span>
                <span className="text-[10px] text-slate-400 truncate block">Prof. Joshi (QR Gen)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@scsco.edu', 'STUDENT')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="font-bold text-emerald-400 block text-[11px]">Student (ST001)</span>
                <span className="text-[10px] text-slate-400 truncate block">Aarav Patel (Div A)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hod@scsco.edu', 'HOD')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="font-bold text-purple-400 block text-[11px]">HOD</span>
                <span className="text-[10px] text-slate-400 truncate block">Dr. Deshmukh (CSE)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('principal@scsco.edu', 'PRINCIPAL')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="font-bold text-amber-400 block text-[11px]">Principal</span>
                <span className="text-[10px] text-slate-400 truncate block">Dr. Kulkarni</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@scsco.edu', 'ADMIN')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="font-bold text-rose-400 block text-[11px]">Admin</span>
                <span className="text-[10px] text-slate-400 truncate block">Dr. Sharma (CMS)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('parent@scsco.edu', 'PARENT')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="font-bold text-teal-400 block text-[11px]">Parent</span>
                <span className="text-[10px] text-slate-400 truncate block">Sunil Patel</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={onBackToPublic}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ← Return to SCSCO Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
