import { motion } from 'motion/react';
import { Car, Settings2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VehicleTableProps {
  vehicles: any[];
  isEditing: any;
  onStartEditing: (v: any) => void;
  onDelete: (plate: string) => void;
}

export default function VehicleTable({ vehicles, isEditing, onStartEditing, onDelete }: VehicleTableProps) {
  return (
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
                      onClick={() => onStartEditing(v)} 
                      className="p-2 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(v.plate)} 
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
          HANDLING_BRIDGE_V2.4.0_ACTIVE
        </span>
      </div>
    </motion.div>
  );
}
