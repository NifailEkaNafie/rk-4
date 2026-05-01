import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const useAdminController = (alumniDB, setAlumniDB) => {
  
  // Filter ketat: Hanya menampilkan data yang statusnya "Menunggu Verifikasi"
  const pendingData = alumniDB.filter(a => a.status === 'Menunggu Verifikasi');

  const verifyAlumni = async (id, isValid) => {
    if (isValid) {
      // 1. Update State di UI agar tulisan "Menunggu Verifikasi" berubah jadi "Terverifikasi"
      setAlumniDB(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'Terverifikasi' } : a
      ));

      // 2. Update kolom status di Database Supabase
      try {
        const { error } = await supabase
          .from('alumni')
          .update({ status: 'Terverifikasi' })
          .eq('id', id);

        if (error) throw error;
        console.log("Status berhasil diperbarui ke Terverifikasi");
      } catch (err) {
        console.error("Gagal update status di database:", err);
      }
    } 
    
    else {
      // Jika Admin menolak, hapus data dari daftar
      const confirmDelete = window.confirm("Apakah Anda yakin ingin menolak dan menghapus data ini?");
      if (!confirmDelete) return;

      setAlumniDB(prev => prev.filter(a => a.id !== id));

      try {
        const { error } = await supabase
          .from('alumni')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error("Gagal menghapus data:", err);
      }
    }
  };

  return { pendingData, verifyAlumni };
};