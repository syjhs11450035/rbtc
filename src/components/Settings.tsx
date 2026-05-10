import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Copy, Check, Globe, HelpCircle, Key, Info, Shield, MessageSquare, Terminal, Cpu, Database, Zap, Settings2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'discord'>('general');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleRobloxAuth = () => {
    setIsAuthorizing(true);
    // Simulate Roblox OAuth2 popup
    setTimeout(() => {
      // In a real app, this would be a redirect return
      const simulatedId = Math.floor(100000000 + Math.random() * 900000000).toString();
      setRobloxId(simulatedId);
      setIsAuthorizing(false);
    }, 2000);
  };

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

  const tabs = [
    { id: 'general', label: '設定', icon: Settings2, desc: 'Nexus Core 基礎配置' },
    { id: 'api', label: 'API', icon: Zap, desc: 'REST 核心數據整合' },
    { id: 'discord', label: 'discord機器人', icon: MessageSquare, desc: 'Discord 智聯閘道' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header with Breadcrumbs or Status */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight font-sans">整合管理中心</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2 font-sans">
            <Zap className="w-3.5 h-3.5 text-blue-500 font-sans" />
            Nexus Technology Integration Suite v2.4.2
          </p>
        </div>
        
        {/* Sub Navigation Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200 font-sans">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all font-sans",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-sm font-sans" 
                  : "text-slate-500 hover:text-slate-700 font-sans"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5 font-sans", activeTab === tab.id ? "text-blue-600" : "text-slate-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
            <section className="hardware-card overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight font-sans">核心帳務管理</h2>
                    <p className="tech-label mt-1">Universal Identity Broker v3.0</p>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3 font-sans">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 font-sans">營運代號 (Callsign)</label>
                    <input 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300 font-sans"
                      placeholder="輸入玩家暱稱"
                    />
                  </div>
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center ml-1 font-sans">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-sans">Roblox UserID (Hardware-Link)</label>
                      <button 
                        onClick={handleRobloxAuth}
                        disabled={isAuthorizing}
                        className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 transition-all font-sans"
                      >
                        <Globe className="w-3 h-3 font-sans" />
                        {isAuthorizing ? "核驗中..." : "Roblox 快速核驗"}
                      </button>
                    </div>
                    <div className="relative font-sans">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500 font-sans">#</div>
                      <input 
                        value={robloxId}
                        onChange={e => setRobloxId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-10 py-4 text-base font-mono font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300 font-sans"
                        placeholder="102938475"
                      />
                      {isAuthorizing && (
                        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm rounded-2xl flex items-center justify-center font-sans">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full font-sans"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic ml-1 font-sans">* 此 ID 將用於遊戲內指令驗證與資產安全防護。</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 font-sans">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={cn(
                      "px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 font-sans",
                      saved ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 font-sans" : "bg-slate-950 text-white hover:bg-slate-800 shadow-xl shadow-slate-950/10 font-sans"
                    )}
                  >
                    {loading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full font-sans"></div>
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4 font-sans" />
                        資產同步成功
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 font-sans" />
                        寫入設定數據
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'api' && (
            <section className="hardware-card overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white font-sans" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight font-sans">REST 數據矩陣 API</h2>
                  <p className="tech-label mt-1">Cross-Link Data Environment</p>
                </div>
              </div>

              <div className="p-10 space-y-12 font-sans">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4 font-sans">
                    <div className="flex justify-between items-center mb-2 font-sans">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-sans">
                        <Terminal className="w-4 h-4 text-blue-600 font-sans" />
                        Entry Point
                      </label>
                      <div className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded transition-all font-sans">TLS SECURE</div>
                    </div>
                    <div className="group relative font-sans">
                      <div className="bg-[#0B1120] text-blue-400 border border-slate-800 rounded-2xl pl-6 pr-16 py-5 text-xs overflow-hidden font-mono shadow-inner font-sans">
                        {apiEndpoint}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(apiEndpoint, setCopied)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-lg font-sans"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400 font-sans" /> : <Copy className="w-4 h-4 text-slate-400 font-sans" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 font-sans">
                    <div className="flex justify-between items-center mb-2 font-sans">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-sans">
                        <Shield className="w-4 h-4 text-emerald-500 font-sans" />
                        X-API-KEY
                      </label>
                      <div className="text-[10px] font-mono text-blue-500 font-bold bg-blue-500/5 px-2 py-0.5 rounded transition-all italic font-sans">SHA-256 HMAC</div>
                    </div>
                    <div className="group relative font-sans">
                      <div className="bg-[#0B1120] text-emerald-400 border border-slate-800 rounded-2xl pl-6 pr-16 py-5 text-xs overflow-hidden font-mono shadow-inner italic font-sans">
                        {apiKey}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-lg font-sans"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-400 font-sans" /> : <Copy className="w-4 h-4 text-slate-400 font-sans" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 font-sans">
                  <div className="space-y-5 font-sans">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 font-sans">
                      <Database className="w-4 h-4 text-blue-600 font-sans" />
                      Roblox Luau Client
                    </h3>
                    <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-8 shadow-2xl relative group font-sans">
                      <pre className="text-[11px] leading-relaxed font-mono text-slate-400 selection:bg-blue-600/30 overflow-x-auto font-sans">
                        <span className="text-blue-500">local</span> Http = game:<span className="text-cyan-500">GetService</span>(<span className="text-emerald-400">"HttpService"</span>)<br/>
                        <span className="text-blue-500">local</span> URL = <span className="text-emerald-400">"{apiEndpoint}/vehicle/"</span> .. PlateID<br/><br/>
                        <span className="text-blue-500">local</span> result = Http:<span className="text-cyan-400">GetAsync</span>(URL, <span className="text-blue-500">false</span>, {"{"}<br/>
                        &nbsp;&nbsp;[<span className="text-emerald-400">"x-api-key"</span>] = <span className="text-emerald-400">"{apiKey}"</span><br/>
                        {"}"})
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-5 font-sans">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 font-sans">
                      <Cpu className="w-4 h-4 text-blue-400 font-sans" />
                      External Node.js Integration
                    </h3>
                    <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-8 shadow-2xl relative group font-sans">
                      <pre className="text-[11px] leading-relaxed font-mono text-slate-400 selection:bg-blue-600/30 overflow-x-auto font-sans">
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
              </div>
            </section>
          )}

          {activeTab === 'discord' && (
            <section className="hardware-card overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight font-sans">Discord 互聯中樞</h2>
                  <p className="tech-label mt-1">Cross-Platform Messaging Bridge</p>
                </div>
              </div>

              <div className="p-10 space-y-12 font-sans">
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 font-sans">
                   <div className="lg:col-span-3 space-y-8 font-sans">
                     <h3 className="text-lg font-black text-slate-900 font-sans">部署智聯機器人</h3>
                     <div className="space-y-6 lg:pl-4 font-sans">
                        {[
                          { step: "01", title: "API 與 Webhook 初始化", desc: "前往 Discord Developer Portal 建立 Application 並開啟所有 Intent 權限。" },
                          { step: "02", title: "密鑰安全注入", desc: "將 Bot Token 存入系統環境變數以啟動 WebSocket 偵聽。" },
                          { step: "03", title: "指令全局注入", desc: "系統將自動向 Discord 網關同步即時車輛與資產查詢 Slash Commands。" }
                        ].map((s, idx) => (
                          <div key={idx} className="flex gap-6 items-start group font-sans">
                            <div className="text-2xl font-black text-blue-100 group-hover:text-blue-600 transition-colors py-1 font-sans">{s.step}</div>
                            <div className="space-y-1 font-sans">
                              <h4 className="font-black text-slate-900 text-sm font-sans">{s.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium font-sans">{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="lg:col-span-2 bg-[#F8FAFC] border border-slate-200 rounded-[2.5rem] p-10 font-sans">
                      <div className="flex items-center gap-3 mb-10 font-sans">
                        <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest font-sans">Available Commands</span>
                      </div>
                      <div className="space-y-5 font-sans">
                        {[
                          { cmd: "/points", info: "PX 餘額即時讀取" },
                          { cmd: "/vehicle", info: "Roblox 資產矩陣讀取" },
                          { cmd: "/status", info: "系統反應狀態報告" }
                        ].map((c, idx) => (
                          <div key={idx} className="flex justify-between items-center group font-sans">
                            <code className="text-[11px] font-mono font-black text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all font-sans">{c.cmd}</code>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">{c.info}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-12 pt-6 border-t border-slate-200 font-sans">
                        <p className="text-[10px] text-slate-400 font-bold uppercase italic font-sans leading-relaxed">
                          * 機器人指令即時與 Nexus 資料庫同步，異地查詢無需延遲。
                        </p>
                      </div>
                   </div>
                 </div>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

