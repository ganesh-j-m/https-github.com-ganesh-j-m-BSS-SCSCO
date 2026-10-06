import React, { useState } from 'react';
import {
  GraduationCap,
  QrCode,
  Camera,
  LogIn,
  LogOut,
  UserCheck,
  ShieldAlert,
  ChevronDown,
  Globe,
  Bell,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../lib/auth/authContext';
import { UserRole } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenQRGenerator?: () => void;
  onOpenQRScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenQRGenerator,
  onOpenQRScanner,
}) => {
  const { currentUser, role, logout, switchUser, availableDemoUsers } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('public')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                SCSCO
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                College
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Digital Campus & Smart QR Attendance</p>
          </div>
        </div>

        {/* Center / Navigation Links for Public View */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('public')}
            className={`px-3 py-2 rounded-lg transition ${
              currentView === 'public' ? 'text-indigo-600 bg-indigo-50' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Public Website
          </button>
          {currentUser && (
            <button
              onClick={() => onNavigate('portal')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                currentView === 'portal' ? 'text-indigo-600 bg-indigo-50' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {role} Portal
            </button>
          )}
        </nav>

        {/* Right Section: Smart QR Triggers & User Account Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick QR Actions */}
          {role === 'TEACHER' && onOpenQRGenerator && (
            <button
              onClick={onOpenQRGenerator}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Launch</span> Attendance QR
            </button>
          )}

          {role === 'STUDENT' && onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-1.5 animate-pulse"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scan</span> Attendance QR
            </button>
          )}

          {/* Demo User Switcher Dropdown (Allows instant role testing per requirement) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              title="Switch demo user or test different roles"
            >
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  <span>Login</span>
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Role Switcher
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Test complete RBAC authorization flows
                  </p>
                </div>

                <div className="py-1 max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {availableDemoUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowRoleMenu(false);
                        onNavigate('portal');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition ${
                        currentUser?.id === u.id ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            u.role === 'STUDENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.role === 'TEACHER'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'HOD'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'PRINCIPAL'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'ADMIN'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {currentUser && (
                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                        onNavigate('public');
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
