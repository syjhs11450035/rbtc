import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { Car, LayoutDashboard, Settings as SettingsIcon, LogOut, Wallet, Globe, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  profile: any;
}

export default function Navbar({ profile }: NavbarProps) {
  const location = useLocation();

  const navItems = [
    { name: '控制面板', path: '/', icon: LayoutDashboard, category: 'Management' },
    { name: '虛擬車庫', path: '/vehicles', icon: Car, category: 'Management' },
    { name: '系統設定', path: '/settings', icon: SettingsIcon, category: 'Technical' },
  ];

  return (
    <aside className="w-64 bg-[#0B1120] flex flex-col border-r border-slate-800 shrink-0 h-full relative overflow-hidden">
      {/* Decorative background pulse */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="p-6 border-b border-slate-800/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black tracking-tighter text-xl leading-none">
              NEXUS
            </h1>
            <span className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em] block mt-1">
              Vehicle Core v2.1
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-8 relative z-10">
        <div>
          <div className="px-3 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            管理模組
          </div>
          <div className="space-y-1">
            {navItems.filter(i => i.category === 'Management').map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden",
                  location.pathname === item.path
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                {location.pathname === item.path && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            技術整合
          </div>
          <div className="space-y-1">
            {navItems.filter(i => i.category === 'Technical').map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden",
                  location.pathname === item.path
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                {location.pathname === item.path && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 bg-black/20 border-t border-slate-800/50 relative z-10">
        <div className="flex items-center gap-3 mb-5 p-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 shrink-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
            <SettingsIcon className="w-5 h-5 text-slate-500 group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-white truncate">{profile?.username || '操作員'}</p>
            <p className="text-[10px] text-slate-500 font-mono font-medium truncate uppercase tracking-widest opacity-60">
              UID: {profile?.robloxId || 'UNLINKED'}
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-4 mb-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
            <span className="text-[10px] text-blue-400/80 font-black uppercase tracking-[0.2em]">目前資產</span>
          </div>
          <p className="text-2xl font-black text-blue-400 leading-none relative z-10">{profile?.points || 0} <span className="text-xs font-bold text-blue-400/50 ml-1">PX</span></p>
        </div>

        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          終止系統連接
        </button>
      </div>
    </aside>
  );
}
