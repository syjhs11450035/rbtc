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
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-200"></div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg relative z-10"
      >
        <motion.div 
          variants={item}
          className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/30 ring-1 ring-white/20"
            >
              <Car className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-3">NEXUS CONTROL</h1>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em]">Integrated Vehicle Registry & Tuning Hub</p>
          </div>

          <div className="space-y-4 mb-12">
            <FeatureItem icon={Globe} text="Roblox 數據實時雙向同步" delay={0.4} />
            <FeatureItem icon={Zap} text="參數化性能改裝與自定義" delay={0.5} />
            <FeatureItem icon={ShieldCheck} text="自動車庫自動化權限控制" delay={0.6} />
          </div>

          <motion.div variants={item} className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full group relative py-5 px-8 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl shadow-black/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              使用 Google 核心帳號進入
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-2 py-3">
              <Lock className="w-3 h-3 text-slate-600" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">End-to-End Encryption Secured</span>
            </div>
          </motion.div>
          
          <motion.p variants={item} className="mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
            連接您的網路身分，開啟全新的 <span className="text-blue-500">Virtual Asset</span> 部署矩陣。
          </motion.p>
        </motion.div>

        <motion.div 
          variants={item}
          className="mt-8 flex justify-center gap-8"
        >
          <div className="flex flex-col items-center">
            <div className="text-white font-black text-xl">1.2ms</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Sync Latency</div>
          </div>
          <div className="w-px h-10 bg-white/5"></div>
          <div className="flex flex-col items-center">
            <div className="text-white font-black text-xl">v2.1.8</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Build ID</div>
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

