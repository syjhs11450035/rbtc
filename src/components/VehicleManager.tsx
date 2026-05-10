import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Car, Plus, Trash2, Edit3, Save, X, Palette, Gauge, Settings2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VehicleManagerProps {
  profile: any;
}

export default function VehicleManager({ profile }: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // New vehicle form
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    model: '',
    tuning: {
      hexColor: '#3b82f6',
      hpScale: 1.0,
      suspension: 1.0,
      kitId: 0
    }
  });

  useEffect(() => {
    fetchVehicles();
  }, [profile]);

  async function fetchVehicles() {
    if (!profile) return;
    setLoading(true);
    const q = query(collection(db, 'vehicles'), where('ownerId', '==', profile.uid));
    const snapshot = await getDocs(q);
    setVehicles(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    setLoading(false);
  }

  async function handleAddVehicle() {
    if (!newVehicle.plate || !newVehicle.model) return;
    
    // Plate as unique ID for consistency with Roblox queries
    const vehicleData = {
      ...newVehicle,
      ownerId: profile.uid,
      ownerRobloxId: profile.robloxId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'vehicles', newVehicle.plate), vehicleData);
      setIsAdding(false);
      setNewVehicle({
        plate: '',
        model: '',
        tuning: { hexColor: '#3b82f6', hpScale: 1.0, suspension: 1.0, kitId: 0 }
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleUpdateVehicle(v: any) {
    try {
      await setDoc(doc(db, 'vehicles', v.plate), {
        ...v,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsEditing(null);
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteVehicle(plate: string) {
    if (confirm('Are you sure you want to de-register this vehicle?')) {
      await deleteDoc(doc(db, 'vehicles', plate));
      fetchVehicles();
    }
  }

  return (
    <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto h-full">
      {/* Left side: Vehicle Table */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">活動車隊</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              全局監理中心數據庫 (Registry v2.1)
            </p>
          </motion.div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            註冊新資產
          </button>
        </div>

        {loading ? (
          <div className="hardware-card border-dashed p-32 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="tech-label">資產同步中...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hardware-card overflow-hidden flex flex-col h-full min-h-[500px]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm italic">
                  部署部隊 <span className="ml-2 font-mono text-[11px] text-slate-400 font-normal">[{vehicles.length} / 5]</span>
                </h3>
              </div>
              {vehicles.length >= 5 && (
                <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-100">
                  Storage Full
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
                  <tr className="tech-label">
                    <th className="py-5 px-8">Unique Plate ID</th>
                    <th className="py-5 px-8">Vehicle Model</th>
                    <th className="py-5 px-8">Config Status</th>
                    <th className="py-5 px-8 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {vehicles.map((v) => (
                    <tr key={v.plate} className={cn(
                      "group border-b border-slate-50 last:border-0 transition-all duration-300",
                      isEditing?.plate === v.plate ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                    )}>
                      <td className="py-5 px-8">
                        <span className="mono-data font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {v.plate}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{v.model}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Class Standard</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-125" style={{ backgroundColor: v.tuning.hexColor }}></div>
                          <div className="flex flex-col">
                            <span className="mono-data text-slate-400">{v.tuning.hexColor}</span>
                            <span className="text-[9px] text-blue-500 font-bold uppercase">{v.tuning.hpScale}x Power</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setIsEditing(v)} 
                            className="p-2 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVehicle(v.plate)} 
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-32 text-center group">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Car className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">機庫目前為空 (Hangar Empty)</p>
                          <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2 font-medium">請啟動註冊程序以部署資產</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-tighter">
              <span>PATH: nexus/database/garage/local</span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                HANDLING_BRIDGE_V2.1.8_ACTIVE
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right side: Detailed Tuning Panel */}
      <div className="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-10rem)] min-h-[500px]">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="editing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[#0B1120] text-white rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl shadow-blue-900/20 border border-white/5"
            >
              <div className="p-8 pb-12 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/60">Tuning Matrix Configuration</span>
                    <div className="bg-black/30 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono border border-white/10 uppercase font-black tracking-widest">
                      {isEditing.plate}
                    </div>
                  </div>
                  <h4 className="text-3xl font-black leading-tight tracking-tighter mb-1">{isEditing.model}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    <span className="text-[10px] font-bold text-blue-100/80 uppercase tracking-widest italic">Live Interface Active</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20">
                <div className="space-y-6">
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

                <div className="pt-8 border-t border-white/5">
                  <h5 className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em] mb-6">Security Permissions</h5>
                  <div className="space-y-6">
                    <Toggle row label="Excl. Owner Authorized" active />
                    <Toggle row label="Auto Garage Tagging" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/40 border-t border-white/5">
                <button 
                  onClick={() => handleUpdateVehicle(isEditing)}
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
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0B1120] text-white rounded-[2.5rem] border border-white/5 p-16 flex flex-col items-center justify-center text-center h-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                <Settings2 className="w-10 h-10 text-slate-700" />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">No Target Selected</p>
              <p className="text-[10px] text-slate-600 mt-4 max-w-[200px] font-medium leading-relaxed">
                請從左側列表選擇目標資產以啟動 <span className="text-blue-400 font-bold"> Tuning Matrix </span> 配置界面
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <Modal title="車輛註冊中心" onClose={() => setIsAdding(false)}>
            <div className="space-y-6">
              <Input label="車牌號碼 (Roblox唯一標識)" value={newVehicle.plate} onChange={v => setNewVehicle({...newVehicle, plate: v})} placeholder="JDM-3304" />
              <Input label="車型描述 (如：Nissan Skyline)" value={newVehicle.model} onChange={v => setNewVehicle({...newVehicle, model: v})} placeholder="Nissan Skyline R34" />
              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-slate-100 text-slate-900 font-bold text-xs rounded uppercase tracking-wider">取消</button>
                <button onClick={handleAddVehicle} className="flex-1 py-3 bg-slate-900 text-white font-bold text-xs rounded uppercase tracking-wider">執行註冊</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ label, active, row }: { label: string, active?: boolean, row?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", row ? "flex-row" : "flex-col gap-2")}>
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <div className={cn("w-8 h-4 rounded-full relative transition-colors cursor-pointer", active ? "bg-blue-600" : "bg-slate-800")}>
        <div className={cn("absolute top-1 w-2 h-2 bg-white rounded-full transition-all", active ? "right-1" : "left-1")}></div>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, onEdit, onDelete }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group"
    >
      <div className="h-24 relative overflow-hidden bg-slate-800">
        <div 
          className="absolute inset-0 opacity-40 blur-2xl" 
          style={{ backgroundColor: vehicle.tuning.hexColor }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-12 h-12 text-white/20" />
        </div>
        <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black tracking-widest text-white border border-white/10 uppercase">
          {vehicle.plate}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1">{vehicle.model}</h3>
        <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Plate Indexed: {vehicle.plate}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Badge icon={Palette} text="Color Sync" active />
          <Badge icon={Gauge} text={`${vehicle.tuning.hpScale}x Power`} active />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onEdit} 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Tune
          </button>
          <button 
            onClick={onDelete} 
            className="w-12 flex items-center justify-center py-2.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-xl text-sm transition-all text-slate-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ icon: Icon, text, active }: any) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase",
      active ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" : "bg-slate-800 text-slate-500"
    )}>
      <Icon className="w-3 h-3" />
      {text}
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-slate-100"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-950">{title}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Remote Access Authorized</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all group">
            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-950 group-hover:rotate-90 transition-all" />
          </button>
        </div>
        <div className="p-8 bg-slate-50/30">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
      />
    </div>
  );
}

function RangeSlider({ label, value, min, max, step, onChange }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{value}x</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value} 
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
      />
    </div>
  );
}
