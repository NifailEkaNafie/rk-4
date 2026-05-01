import { useState, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

//datatest saat  belum pakai DB
export const useAppModel = () => {
  const [alumniDB, setAlumniDB] = useState([
    { id: 1, nama: 'Naufal Ramzi', nim: '202310370311026', prodi: 'Informatika', kampus: 'Universitas Muhammadiyah Malang', tahun: '2024', pekerjaan: 'UI/UX Designer', instansi: 'Ruangguru', alamat: 'Kec. Blimbing, Kota Malang', status: 'Terverifikasi' },
    { id: 2, nama: 'Siti Aminah', nim: '201810370311045', prodi: 'Informatika', kampus: 'Universitas Muhammadiyah Malang', tahun: '2022', pekerjaan: 'Data Analyst', instansi: 'Bank Mandiri', alamat: 'Kec. Pakong, Kab. Pamekasan', status: 'Terverifikasi' },
    { id: 3, nama: 'Andika Wahyu', nim: '202110370311005', prodi: 'Ilmu Komunikasi', kampus: 'Universitas Brawijaya', tahun: '2025', pekerjaan: 'Backend Developer', instansi: 'Traveloka', alamat: 'Kec. Gubeng, Kota Surabaya', status: 'Terverifikasi' },
    { id: 4, nama: 'Budi Santoso', nim: '201910370311001', prodi: 'Informatika', kampus: 'Universitas Muhammadiyah Malang', tahun: '2023', pekerjaan: 'Software Engineer', instansi: 'PT GoTo', alamat: 'Kec. Lowokwaru, Kota Malang', status: 'Menunggu Verifikasi' }
  ]);

  useEffect(() => {
    if (USE_SUPABASE) {
      fetch(`${SUPABASE_URL}/rest/v1/alumni?select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      })
      .then(res => res.json())
      .then(data => { if(data && !data.error) setAlumniDB(data) })
      .catch(err => console.error("Gagal koneksi ke Supabase:", err));
    }
  }, []);

  return { alumniDB, setAlumniDB };
};
