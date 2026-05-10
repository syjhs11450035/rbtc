import { motion } from 'motion/react';
import { Gauge, Settings2, Palette, Copy, Wand2, Download, Save, X } from 'lucide-react';
import LicensePlate3D from '../LicensePlate3D';

interface TuningPanelProps {
  isEditing: any;
  setIsEditing: (v: any) => void;
  onUpdate: (v: any) => void;
  generateAIRender: () => void;
  isGenerating: boolean;
  generatedImg: string | null;
  setGeneratedImg: (img: string | null) => void;
}

export default function TuningPanel({ 
  isEditing, 
  setIsEditing, 
  onUpdate, 
  generateAIRender, 
  isGenerating, 
  generatedImg,
  setGeneratedImg 
}: TuningPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-[#0B1120] text-white rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl shadow-blue-900/20 border border-white/5"
    >
      {/* Top: 3D Visualization & Identification */}
      <div className="p-8 pb-4 relative overflow-hidden bg-slate-950 shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/60">Registry Identification</span>
            <h4 className="text-2xl font-black leading-tight tracking-tighter text-white">{isEditing.model}</h4>
          </div>
          <div className="bg-blue-600 px-4 py-2 rounded-xl text-[14px] font-mono border border-white/10 uppercase font-black tracking-widest text-white shadow-lg shadow-blue-600/30">
            {isEditing.plate}
          </div>
        </div>
        
        <div className="h-48 mb-4 border border-white/5 rounded-2xl overflow-hidden bg-black/40">
           <LicensePlate3D plate={isEditing.plate} color={isEditing.tuning.hexColor} />
        </div>
      </div>
      
      {/* Bottom: Settings (Scrollable) */}
      <div className="px-8 py-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-900/30">
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              Power Output Scale
            </label>
            <span className="font-mono font-black text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">{isEditing.tuning.hpScale}x</span>
          </div>
          <input 
            type="range" min={0.5} max={2.0} step={0.1}
            value={isEditing.tuning.hpScale}
            onChange={e => setIsEditing({...isEditing, tuning: {...isEditing.tuning, hpScale: parseFloat(e.target.value)}})}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-blue-400" />
              Suspension Force
            </label>
            <span className="font-mono font-black text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">{isEditing.tuning.suspension}x</span>
          </div>
          <input 
            type="range" min={0.1} max={3.0} step={0.1}
            value={isEditing.tuning.suspension}
            onChange={e => setIsEditing({...isEditing, tuning: {...isEditing.tuning, suspension: parseFloat(e.target.value)}})}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-6">
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            Chassis Color Sync
          </label>
          <div className="flex gap-4 p-2 bg-black/30 rounded-2xl border border-white/5">
            <div className="relative group">
              <input 
                type="color" 
                value={isEditing.tuning.hexColor}
                onChange={e => setIsEditing({...isEditing, tuning: {...isEditing.tuning, hexColor: e.target.value}})}
                className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden"
              />
              <div className="absolute inset-0 rounded-xl border-2 border-white/10 group-hover:border-white/20 transition-colors pointer-events-none"></div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <input 
                type="text" 
                value={isEditing.tuning.hexColor} 
                onChange={e => setIsEditing({...isEditing, tuning: {...isEditing.tuning, hexColor: e.target.value}})}
                className="w-full bg-transparent text-xl font-mono text-white outline-none focus:text-blue-400 transition-colors uppercase font-black"
              />
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Hex Code Verified</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-6">
          <h5 className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em]">Bot Integration Link</h5>
           <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 transition-all group">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">Quick Query Command</span>
                <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[9px] font-black uppercase">Slash Cmd</div>
             </div>
             <div className="flex items-center gap-3">
                <code className="text-[11px] font-mono text-white flex-1 bg-black/40 px-3 py-2 rounded-xl border border-white/5 group-hover:border-blue-500/10 transition-colors">
                   /vehicle plate:{isEditing.plate}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`/vehicle plate:${isEditing.plate}`);
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all active:scale-90"
                >
                   <Copy className="w-4 h-4" />
                </button>
             </div>
           </div>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-6">
          <h5 className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em]">Advanced Media Core</h5>
          {generatedImg ? (
            <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={generatedImg} alt="AI Render" className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => setGeneratedImg(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-md transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <a 
                  href={generatedImg} 
                  download={`NEXUS_RENDER_${isEditing.plate}.png`}
                  className="p-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white shadow-xl shadow-blue-600/20 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save Render
                </a>
              </div>
            </div>
          ) : (
            <button 
              onClick={generateAIRender}
              disabled={isGenerating}
              className="w-full py-6 bg-slate-900 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:bg-slate-800 transition-all relative overflow-hidden"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Computing 4K Asset...</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-600/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Wand2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest">Generate Engine Render</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Directly Powered by Gemini 3.1</div>
                  </div>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 bg-black/40 border-t border-white/5">
        <button 
          onClick={() => onUpdate(isEditing)}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-3"
        >
          <Save className="w-4 h-4" />
          提交參數至伺服器
        </button>
        <div className="flex items-center justify-center gap-4 mt-6">
           <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-600 uppercase">Latency:</span>
             <span className="text-[9px] font-mono text-blue-500 font-bold">~120ms</span>
           </div>
           <button onClick={() => setIsEditing(null)} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-slate-500 transition-all">
             取消當前編輯
           </button>
        </div>
      </div>
    </motion.div>
  );
}
