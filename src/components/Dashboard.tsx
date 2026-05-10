import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, count } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Car, Wallet, Key, Activity, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  profile: any;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [stats, setStats] = useState({
    vehicleCount: 0,
    garageCount: 0,
    tuningActions: 0
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.uid) return;
      
      const q = query(collection(db, 'vehicles'), where('ownerId', '==', profile.uid));
      const snapshot = await getDocs(q);
      setStats({
        vehicleCount: snapshot.size,
        garageCount: 1,
        tuningActions: 12
      });
    }
    fetchStats();
  }, [profile]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 max-w-6xl"
    >
      <motion.div variants={item}>
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
          系統狀態：正常運行 (Operational)
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 mb-3">
          營運概覽 <span className="text-slate-300 font-light ml-2">/ Dashboard</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl">實時監控您的 Roblox 資產、經濟體系與車輛參數同步狀態。</p>
      </motion.div>

      {!profile?.robloxId && (
        <motion.div variants={item} className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center justify-between shadow-sm shadow-amber-900/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-base">安全性警告：尚未綁定 Roblox ID</h3>
              <p className="text-sm text-amber-700/80 font-medium">車輛數據與點數資產將無法同步至遊戲，請盡速完成綁定程序。</p>
            </div>
          </div>
          <Link to="/settings" className="px-6 py-3 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition-all uppercase tracking-widest shadow-lg shadow-amber-600/20 active:scale-95">
            前往綁定專區
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Car} 
          label="已登記車隊" 
          value={stats.vehicleCount} 
          unit="UNITS"
          subtitle={`尚有 ${5 - stats.vehicleCount} 個空餘車位`}
          progress={(stats.vehicleCount / 5) * 100}
        />
        <StatCard 
          icon={Wallet} 
          label="帳戶餘額" 
          value={profile?.points || 0} 
          unit="PX"
          subtitle="可用於改裝與高級服務"
        />
        <StatCard 
          icon={Activity} 
          label="通訊協議" 
          value="ENFORCED" 
          unit="SECURE"
          subtitle="HTTP 閘道連線正常"
          status="online"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.section variants={item} className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
              快速入口 / Quick Access
            </h2>
          </div>
          <div className="p-8 grid grid-cols-2 gap-4 flex-1">
            <ActionBtn label="登記新車輛" to="/vehicles" primary />
            <ActionBtn label="改裝實驗室" to="/vehicles" />
            <ActionBtn label="系統日誌" to="#" />
            <ActionBtn label="API 密鑰設定" to="/settings" />
          </div>
        </motion.section>

        <motion.section variants={item} className="bg-[#0B1120] text-white rounded-[2rem] shadow-xl shadow-blue-900/10 flex flex-col justify-between overflow-hidden group">
          <div className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-32 h-32" />
            </div>
            <h2 className="text-sm font-black mb-8 flex items-center gap-3 uppercase tracking-[0.2em] text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              技術診斷儀表板
            </h2>
            <div className="space-y-1">
              <DiagnosticRow label="DB Latency" value="12ms" status="excellent" />
              <DiagnosticRow label="Service Node" value="US-CI-01" />
              <DiagnosticRow label="Auth Method" value="OAuth2.0 / Firebase" />
              <DiagnosticRow label="Environment" value="Production (Stable)" />
            </div>
          </div>
          <div className="p-5 bg-black/40 border-t border-white/5 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UPTIME</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">99.98%</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Nexus-Core v2.1.4
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function DiagnosticRow({ label, value, status }: { label: string, value: string, status?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg group/row">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover/row:text-slate-300 transition-colors">{label}</span>
      <div className="flex items-center gap-3">
        {status === 'excellent' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
        <span className={cn("text-xs font-mono font-medium", status === 'excellent' ? "text-emerald-400" : "text-blue-400")}>{value}</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, unit, status, progress }: any) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
      whileHover={{ y: -5 }}
      className="hardware-card p-8 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
        {status === 'online' && (
          <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase tracking-widest border border-emerald-100">
            Secure
          </div>
        )}
      </div>
      
      <div className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-4xl font-black text-slate-950 tracking-tight">{value}</p>
          <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
        </div>
        <p className="text-[11px] text-slate-500 font-bold italic opacity-70 group-hover:opacity-100 transition-opacity">{subtitle}</p>
      </div>

      {progress !== undefined && (
        <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          />
        </div>
      )}
    </motion.div>
  );
}

function ActionBtn({ label, to, primary }: any) {
  return (
    <Link 
      to={to}
      className={cn(
        "py-4 px-6 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 border",
        primary 
          ? "bg-slate-950 hover:bg-slate-800 text-white shadow-xl shadow-slate-950/20 border-slate-950" 
          : "bg-white hover:bg-slate-50 text-slate-900 border-slate-200"
      )}
    >
      {label}
    </Link>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
