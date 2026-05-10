import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, X, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import VehicleTable from './vehicle/VehicleTable';
import TuningPanel from './vehicle/TuningPanel';

interface VehicleManagerProps {
  profile: any;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function VehicleManager({ profile }: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

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
    try {
      const q = query(collection(db, 'vehicles'), where('ownerId', '==', profile.uid));
      const snapshot = await getDocs(q);
      setVehicles(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (e) {
      console.error("Fetch vehicles error:", e);
    }
    setLoading(false);
  }

  async function generateAIRender() {
    if (!isEditing) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: `A professional 4K close-up render of a futuristic, high-tech vehicle license plate. 
              The plate text is "${isEditing.plate}". 
              The background style is cyber-industrial with neon accents. 
              The plate has a distinctive border color of ${isEditing.tuning.hexColor}. 
              Clean typography, realistic material textures (metal, plastic), ambient cinematic lighting.`,
      });
      
      const parts = response.candidates?.[0]?.content.parts;
      
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            setGeneratedImg(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (e) {
      console.error("AI Generation error:", e);
    }
    setIsGenerating(false);
  }

  async function handleAddVehicle() {
    if (!newVehicle.plate || !newVehicle.model) return;
    const plateUpper = newVehicle.plate.toUpperCase().trim();
    
    const vehicleData = {
      ...newVehicle,
      plate: plateUpper,
      ownerId: profile.uid,
      ownerRobloxId: profile.robloxId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'vehicles', plateUpper), vehicleData);
      setIsAdding(false);
      setNewVehicle({
        plate: '',
        model: '',
        tuning: { hexColor: '#3b82f6', hpScale: 1.0, suspension: 1.0, kitId: 0 }
      });
      fetchVehicles();
    } catch (e) {
      console.error("Add vehicle error:", e);
    }
  }

  async function handleUpdateVehicle(v: any) {
    try {
      await setDoc(doc(db, 'vehicles', v.plate), {
        ...v,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsEditing(null);
      setGeneratedImg(null);
      fetchVehicles();
    } catch (e) {
      console.error("Update vehicle error:", e);
    }
  }

  const startEditing = (v: any) => {
    setGeneratedImg(null);
    setIsEditing(v);
  };

  async function handleDeleteVehicle(plate: string) {
    if (confirm('確定要註銷此資產登記記錄？此動作無法撤回。')) {
      try {
        await deleteDoc(doc(db, 'vehicles', plate));
        fetchVehicles();
      } catch (e) {
        console.error("Delete vehicle error:", e);
      }
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
              全局監理中心數據庫 (Registry v2.4)
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
          <VehicleTable 
            vehicles={vehicles} 
            isEditing={isEditing} 
            onStartEditing={startEditing} 
            onDelete={handleDeleteVehicle} 
          />
        )}
      </div>

      {/* Right side: Detailed Tuning Panel */}
      <div className="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-10rem)] min-h-[500px]">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <TuningPanel 
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onUpdate={handleUpdateVehicle}
              generateAIRender={generateAIRender}
              isGenerating={isGenerating}
              generatedImg={generatedImg}
              setGeneratedImg={setGeneratedImg}
            />
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0B1120] text-white rounded-[2.5rem] border border-white/5 p-16 flex flex-col items-center justify-center text-center h-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                <Car className="w-10 h-10 text-slate-700" />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">No Target Selected</p>
              <p className="text-[10px] text-slate-600 mt-4 max-w-[200px] font-medium leading-relaxed font-black">
                請從左側列表選擇目標資產以啟動 <span className="text-blue-400"> Tuning Matrix </span> 配置界面
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
              <Input label="車牌號碼 (Roblox唯一標識)" value={newVehicle.plate} onChange={(v: string) => setNewVehicle({...newVehicle, plate: v})} placeholder="JDM-3304" />
              <Input label="車型描述 (如：Nissan Skyline)" value={newVehicle.model} onChange={(v: string) => setNewVehicle({...newVehicle, model: v})} placeholder="Nissan Skyline R34" />
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

// UI Helpers inside
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
