import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Copy, Check, Globe, HelpCircle, Key, Info, Shield, MessageSquare, Terminal, Cpu, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SettingsProps {
  profile: any;
  setProfile: any;
}

export default function Settings({ profile, setProfile }: SettingsProps) {
  const [robloxId, setRobloxId] = useState(profile?.robloxId || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('FETCHING...');
  const [copiedKey, setCopiedKey] = useState(false);

  const apiEndpoint = `https://ais-dev-wdnzorsxd24tflk5c7ojxv-487175973493.asia-northeast1.run.app/api`;

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setApiKey(data.robloxApiKey))
      .catch(err => {
        console.error('Failed to fetch config:', err);
        setApiKey('AUTH_ERROR');
      });
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        robloxId,
        username
      });
      setProfile({ ...profile, robloxId, username });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-12 pb-20"
    >
      {/* Profile Section */}
      <motion.section variants={item} className="hardware-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">身分帳號綁定</h2>
              <p className="tech-label mt-1">Cross-Platform Sync Engine v3.0</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Synchronized</span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">玩家呼號 (Callsign)</label>
              <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300"
                placeholder="輸入玩家暱稱"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Roblox UserID</label>
                <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
              </div>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">#</div>
                <input 
                  value={robloxId}
                  onChange={e => setRobloxId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-10 py-4 text-base font-mono font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300"
                  placeholder="102938475"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic ml-1">* 此 ID 用於安全驗證遊戲內請求，確保資產權限正確。</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className={cn(
                "px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3",
                saved ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" : "bg-slate-950 text-white hover:bg-slate-800 shadow-xl shadow-slate-950/10"
              )}
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  完成綁定成功
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  執行同步更新
                </>
              )}
            </button>
          </div>
        </div>
      </motion.section>

      {/* API Matrix */}
      <motion.section variants={item} className="hardware-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">API 核心矩陣</h2>
            <p className="tech-label mt-1">REST API & Discord Bot Bridge</p>
          </div>
        </div>

        <div className="p-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  API Endpoint
                </label>
                <div className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded transition-all">HTTP/SSL SECURE</div>
              </div>
              <div className="group relative">
                <div className="bg-[#0B1120] text-blue-400 border border-slate-800 rounded-2xl pl-6 pr-16 py-5 text-xs overflow-hidden font-mono shadow-inner">
                  {apiEndpoint}
                </div>
                <button 
                  onClick={() => copyToClipboard(apiEndpoint, setCopied)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-lg"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  授權金鑰 (x-api-key)
                </label>
                <div className="text-[10px] font-mono text-blue-500 font-bold bg-blue-500/5 px-2 py-0.5 rounded transition-all italic">ENCRYPTED AT REST</div>
              </div>
              <div className="group relative">
                <div className="bg-[#0B1120] text-emerald-400 border border-slate-800 rounded-2xl pl-6 pr-16 py-5 text-xs overflow-hidden font-mono shadow-inner italic">
                  {apiKey}
                </div>
                <button 
                  onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-lg"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
            <div className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Luau Integration
              </h3>
              <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-8 shadow-2xl relative group">
                <div className="absolute top-4 right-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">Roblox Script</div>
                <pre className="text-[11px] leading-relaxed font-mono text-slate-400 selection:bg-blue-600/30 overflow-x-auto">
                  <span className="text-blue-500">local</span> Http = game:<span className="text-cyan-500">GetService</span>(<span className="text-emerald-400">"HttpService"</span>)<br/>
                  <span className="text-blue-500">local</span> URL = <span className="text-emerald-400">"{apiEndpoint}/vehicle/"</span> .. PlateID<br/><br/>
                  <span className="text-blue-500">local</span> result = Http:<span className="text-cyan-400">GetAsync</span>(URL, <span className="text-blue-500">false</span>, {"{"}<br/>
                  &nbsp;&nbsp;[<span className="text-emerald-400">"x-api-key"</span>] = <span className="text-emerald-400">"{apiKey}"</span><br/>
                  {"}"})
                </pre>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Discord App Node.js
              </h3>
              <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-8 shadow-2xl relative group">
                <div className="absolute top-4 right-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">Discord Bot</div>
                <pre className="text-[11px] leading-relaxed font-mono text-slate-400 selection:bg-blue-600/30 overflow-x-auto">
                  <span className="text-blue-500">const</span> axios = require(<span className="text-emerald-400">'axios'</span>);<br/>
                  <span className="text-blue-500">const</span> res = <span className="text-blue-500">await</span> axios.get(<br/>
                  &nbsp;&nbsp;<span className="text-emerald-400">`{apiEndpoint}/user/$&#123;robloxId&#125;`</span>,<br/>
                  &nbsp;&nbsp;{"{"} <br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;headers: {"{"} <span className="text-emerald-400">'x-api-key'</span>: <span className="text-emerald-400">'{apiKey}'</span> {"}"} <br/>
                  &nbsp;&nbsp;{"}"}<br/>
                  );
                </pre>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100">
            <h3 className="text-lg font-black text-slate-950 mb-8 flex items-center gap-3 tracking-tighter">
              <div className="p-2 bg-blue-100/50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              自建 Discord 機器人部署流程
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                {[
                  { step: "01", title: "建立應用程式", desc: "前往 Discord Developer Portal 建立新 Application 並獲取 Bot Token。" },
                  { step: "02", title: "安全金鑰設定", desc: "在 AI Studio Secrets 中新增 DISCORD_TOKEN 與 Client ID。" },
                  { step: "03", title: "伺服器重新啟動", desc: "重啟 Nexus 後端，系統將自動註冊 Slash Commands 指令。" }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="text-2xl font-black text-blue-100 group-hover:text-blue-600 transition-colors py-1">{s.step}</div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-sm">{s.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 bg-[#F8FAFC] border border-slate-200 rounded-3xl p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">Available Commands</span>
                 </div>
                 <div className="space-y-4">
                   {[
                     { cmd: "/points", info: "Account Credit Check" },
                     { cmd: "/vehicle", info: "Remote Tuning Query" },
                     { cmd: "/status", info: "Core Link Status" }
                   ].map((c, idx) => (
                     <div key={idx} className="flex justify-between items-center group">
                       <code className="text-[11px] font-mono font-black text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">{c.cmd}</code>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.info}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

