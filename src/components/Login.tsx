import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Car, ShieldCheck, Zap, Globe, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070B14] px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(14,165,233,0.15),_transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-600/10 blur-[160px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[900px] h-[900px] bg-emerald-600/10 blur-[200px] rounded-full"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 filter contrast-125 brightness-150"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070B14]/50 to-[#070B14]"></div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl relative z-10"
      >
        <motion.div 
          variants={item}
          className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-16 shadow-[0_50px_150px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/5"
        >
          <div className="flex flex-col items-center text-center mb-16">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(37,99,235,0.4)] ring-2 ring-white/20"
            >
              <Car className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-6xl font-black tracking-tighter text-white mb-4">NEXUS CORE</h1>
            <p className="text-[13px] text-slate-400 font-black uppercase tracking-[0.6em] opacity-80">Next-Generation Asset Supervision</p>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-16">
            <FeatureItem icon={Globe} text="Roblox 數據實時雙向同步 (Real-time Sync)" delay={0.4} />
            <FeatureItem icon={Zap} text="參數化性能改裝與深度自定義 (Deep Tuning)" delay={0.5} />
            <FeatureItem icon={ShieldCheck} text="自動車庫自動化權限控制 (Logic Guard)" delay={0.6} />
          </div>

          <motion.div variants={item} className="space-y-6">
            <button
              onClick={handleLogin}
              className="w-full group relative py-6 px-10 bg-white text-slate-950 font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] hover:bg-blue-50 transition-all flex items-center justify-center gap-6 active:scale-95 shadow-[0_25px_60px_-10px_rgba(255,255,255,0.1)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
              啟動系統序列：Google 登入
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-3 py-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">AES-256 Cloud Infrastructure Secured</span>
            </div>
          </motion.div>
          
          <motion.p variants={item} className="mt-12 text-center text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
            連結您的網路身分，開啟全新的 <span className="text-blue-400 font-black">NEXUS MESH</span> 虛擬資產部署矩陣。
          </motion.p>
        </motion.div>

        <motion.div 
          variants={item}
          className="mt-12 flex justify-center gap-12"
        >
          <div className="flex flex-col items-center">
            <div className="text-white font-black text-3xl">0.8ms</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-1">Gateway Ping</div>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <div className="text-white font-black text-3xl">v2.4.0</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-1">Engine Version</div>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <div className="text-white font-black text-3xl">ONLINE</div>
            <div className="text-[10px] text-emerald-500 uppercase tracking-[0.4em] font-black mt-1 text-center">Core Status</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text, delay }: { icon: any, text: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-5 bg-white/5 rounded-[1.5rem] border border-white/5 group hover:bg-white/10 transition-colors"
    >
      <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/50 transition-colors">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <span className="text-sm text-slate-300 font-bold tracking-tight">{text}</span>
    </motion.div>
  );
}

