import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import VehicleManager from './components/VehicleManager';
import Settings from './components/Settings';
import BotStatus from './components/BotStatus';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          // New user registration defaults
          const newProfile = {
            robloxId: '',
            username: user.displayName || 'New Driver',
            points: 15,
            uid: user.uid
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-t-cyan-500 border-slate-800 animate-spin"></div>
          <p className="text-slate-400 font-medium">正在連接至 Nexus 核心...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <div className="h-screen w-full bg-slate-950">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="h-screen flex overflow-hidden bg-slate-50 text-slate-800 font-sans">
        <Navbar profile={profile} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">閘道連線中：rbtc.twkx.us.ci</span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <BotStatus />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-medium">同步延遲：<span className="text-slate-900">24ms</span></span>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-8 selection:bg-blue-500/30">
            <Routes>
              <Route path="/" element={<Dashboard profile={profile} />} />
              <Route path="/vehicles" element={<VehicleManager profile={profile} />} />
              <Route path="/settings" element={<Settings profile={profile} setProfile={setProfile} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">系統狀態</span>
                <span className="text-[10px] font-mono text-slate-900">穩定運行</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Nexus 版本 2.4.2 // 雲端串聯
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}
