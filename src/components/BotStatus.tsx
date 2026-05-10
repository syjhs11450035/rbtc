import { useEffect, useState } from 'react';
import { MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface BotStatusInfo {
  online: boolean;
  tag: string | null;
  latency: number;
  error: string | null;
}

export default function BotStatus() {
  const [status, setStatus] = useState<BotStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/bot/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch bot status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  if (!status || (!status.online && !status.error)) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Discord 機器人：未啟動</span>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100 group relative">
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Discord 機器人：連線失敗</span>
        <div className="absolute top-full right-0 mt-2 p-2 bg-slate-900 text-white text-[9px] rounded hidden group-hover:block whitespace-nowrap z-50">
          錯誤：{status.error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
        />
        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
          {status.tag || '機器人'} 在線
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400">
        <Clock className="w-3 h-3" />
        <span className="text-[10px] font-mono">{status.latency}ms</span>
      </div>
    </div>
  );
}
