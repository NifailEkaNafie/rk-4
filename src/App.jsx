import React, { useState, useEffect } from 'react';
import { Search, MapPin, FileText, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAppModel } from './models/useAppModel';
import PencarianView from './views/PencarianView';
import PetaView from './views/PetaView';
import PendataanView from './views/PendataanView';
import AdminView from './views/AdminView';
import AuthView from './views/AuthView'; // Pastikan Anda sudah membuat file ini

// Inisialisasi Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('pencarian');
  const { alumniDB, setAlumniDB } = useAppModel();

  // Handle Cek Sesi Login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Tampilkan Login Screen jika belum ada sesi
  if (!session) {
    return <AuthView onLoginSuccess={(user) => setSession(user)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">

      {/* Sidebar Navigasi */}
      

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'pencarian' && <PencarianView alumniDB={alumniDB} setAlumniDB={setAlumniDB} setActiveTab={setActiveTab} />}
        {activeTab === 'peta' && <PetaView alumniDB={alumniDB} />}
        {activeTab === 'pendataan' && <PendataanView alumniDB={alumniDB} setAlumniDB={setAlumniDB} />}
        {activeTab === 'admin' && <AdminView alumniDB={alumniDB} setAlumniDB={setAlumniDB} />}
      </main>

    </div>
  );
}