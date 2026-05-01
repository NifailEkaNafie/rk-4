import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function ImportExcel() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      setLoading(true);
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const chunks = [];
      for (let i = 0; i < data.length; i += 500) {
        chunks.push(data.slice(i, i + 500));
      }

      for (let i = 0; i < chunks.length; i++) {
        const payload = chunks[i].map(item => ({
          nama: item["Nama Lulusan"],
          nim: item["NIM"],
          tahun_masuk: item["Tahun Masuk"]?.toString(),
          tanggal_lulus: item["Tanggal Lulus"],
          fakultas: item["Fakultas"],
          prodi: item["Program Studi"],
          status: 'Terverifikasi',
          tracking_status: 'Belum Dilacak'
        }));

        const { error } = await supabase.from('alumni').insert(payload);
        if (error) console.error(error);
        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
      setLoading(false);
      alert("Import Selesai!");
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-blue-200 mb-8">
      <h3 className="font-bold text-gray-800 mb-2">Step 1: Upload Database Alumni (142.293 Data)</h3>
      <input type="file" onChange={handleFile} disabled={loading} className="text-sm cursor-pointer" />
      {loading && <p className="mt-2 text-blue-600 font-bold animate-pulse">Memproses: {progress}%</p>}
    </div>
  );
}