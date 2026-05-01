import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Database, 
  CheckCircle, 
  Save, 
  X,
  Smartphone,
  Globe,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Edit,
  Briefcase,
  GraduationCap
} from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

// ==========================================
// KONFIGURASI SUPABASE & GOOGLE SHEETS
// ==========================================
const MASTER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1JepgHxbtFpfwAxUO3DjZd6-TOpvtCr2d/gviz/tq';
const MASTER_SHEET_GID = '1674223372';

const supabaseUrl = 'https://bskyhxwooecxiuqrrijl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza3loeHdvb2VjeGl1cXJyaWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDkzMzMsImV4cCI6MjA5MDY4NTMzM30.FVCQxI8yDDP83k7mw13aQFS8u1lcJIKsoo8GxNRfmJ4';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- FUNGSI PARSER KHUSUS GOOGLE VIZ API (ANTI-CRASH) ---
function parseGvizJSON(text, offset) {
  if (!text || text.includes('<!doctype html>') || text.includes('<html')) {
    throw new Error('Akses ditolak. Pastikan link Spreadsheet diset "Siapa saja yang memiliki link dapat melihat".');
  }
  try {
    const startIndexJson = text.indexOf('{');
    const endIndexJson = text.lastIndexOf('}');
    if (startIndexJson === -1 || endIndexJson === -1) throw new Error("Format respons JSON tidak valid.");

    const jsonString = text.substring(startIndexJson, endIndexJson + 1);
    const jsonData = JSON.parse(jsonString);
    if (jsonData.errors) throw new Error(jsonData.errors[0].message);

    const rows = jsonData.table?.rows || [];
    const result = [];
    let startIndex = 0;
    
    if (offset === 0 && rows.length > 0) {
      const firstCell = rows[0]?.c?.[0];
      if (firstCell && firstCell.v) {
        const cellStr = String(firstCell.v).toLowerCase();
        if (cellStr.includes('nama') || cellStr.includes('nim')) startIndex = 1;
      }
    }

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i]?.c;
      if (!row) continue;
      
      const nama = row[0]?.v ? String(row[0].v) : '';
      const nim = row[1]?.v ? String(row[1].v).trim() : '';
      
      if (nama || nim) {
        result.push({
          nim: nim || `TEMP-${offset+i}`,
          nama: nama || 'Tanpa Nama',
          tahunMasuk: row[2]?.v ? String(row[2].v) : '-',
          tanggalLulus: (row[3]?.f || row[3]?.v) ? String(row[3].f || row[3].v) : '-',
          fakultas: row[4]?.v ? String(row[4].v) : '-',
          prodi: row[5]?.v ? String(row[5].v) : '-',
          email: '', noHp: '', linkedin: '', ig: '', fb: '', tiktok: '', 
          tempatBekerja: '', alamatBekerja: '', posisi: '', jenisPekerjaan: '', sosmedBekerja: ''
        });
      }
    }
    return result;
  } catch (e) {
    console.error("Gagal Parse JSON:", e);
    return [];
  }
}

export default function DaftarPenggunaView() {
  const [alumniList, setAlumniList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalData] = useState(142293); 
  const ITEMS_PER_PAGE = 50;

  const [editingAlumni, setEditingAlumni] = useState(null);
  const [osintTarget, setOsintTarget] = useState(null); // State baru untuk Modal OSINT

  // FUNGSI FETCH YANG SUDAH DIPERBARUI (MENGGABUNGKAN KEDUA DATABASE)
  const fetchPageData = useCallback(async (page, search = '') => {
    setIsLoadingData(true);
    setFetchError('');
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      
      // ===============================================================
      // 1. AMBIL DATA DARI GOOGLE SHEETS
      // ===============================================================
      let queryStr = `select *`;
      if (search) {
        const safeSearch = search.replace(/'/g, "\\'"); 
        queryStr += ` where lower(A) contains lower('${safeSearch}') or lower(B) contains lower('${safeSearch}')`;
      }
      queryStr += ` limit ${ITEMS_PER_PAGE} offset ${offset}`;
      const encodedQuery = encodeURIComponent(queryStr);
      const fetchUrl = `${MASTER_SHEET_URL}?tqx=out:json&gid=${MASTER_SHEET_GID}&tq=${encodedQuery}&cb=${Date.now()}`;

      const gsResponse = await fetch(fetchUrl);
      if (!gsResponse.ok) throw new Error(`HTTP Error: ${gsResponse.status}`);
      const textResponse = await gsResponse.text();
      const parsedData = parseGvizJSON(textResponse, offset);
      const gsNimList = parsedData.map(item => item.nim).filter(Boolean);

      // ===============================================================
      // 2. AMBIL DATA DARI SUPABASE (Pencarian & Data Baru Mandiri)
      // ===============================================================
      let supaQuery = supabase.from('alumni').select('*');
      if (search) {
        supaQuery = supaQuery.or(`nama.ilike.%${search}%,nim.ilike.%${search}%`);
      } else {
        supaQuery = supaQuery.order('created_at', { ascending: false });
      }
      // Ambil data Supabase yang sesuai dengan halaman saat ini
      const { data: supaData1, error: err1 } = await supaQuery.range(offset, offset + ITEMS_PER_PAGE - 1);
      if (err1) console.error("Error ambil Supabase (Query Bebas):", err1);

      // ===============================================================
      // 3. AMBIL DATA DARI SUPABASE (Khusus menimpa baris Google Sheets)
      // ===============================================================
      let supaData2 = [];
      if (gsNimList.length > 0) {
        const { data: sData2, error: err2 } = await supabase
          .from('alumni')
          .select('*')
          .in('nim', gsNimList);
        if (err2) console.error("Error ambil Supabase (Timpa GS):", err2);
        supaData2 = sData2 || [];
      }

      // ===============================================================
      // 4. GABUNGKAN KEDUANYA DAN HAPUS DUPLIKASI (Prioritas Supabase)
      // ===============================================================
      const allSupaData = [...(supaData1 || []), ...supaData2];
      const supaMap = {};
      
      // Normalisasi kolom Supabase agar bisa menimpa/melengkapi data Excel
      allSupaData.forEach(item => {
        supaMap[item.nim] = {
          ...item,
          tahunMasuk: item.tahunmasuk || item.tahun || item.tahunMasuk,
          tanggalLulus: item.tanggallulus || item.tanggalLulus,
          noHp: item.nohp || item.noHp,
          tempatBekerja: item.tempatbekerja || item.instansi || item.tempatBekerja,
          alamatBekerja: item.alamatbekerja || item.alamatBekerja,
          jenisPekerjaan: item.jenispekerjaan || item.jenisPekerjaan,
          sosmedBekerja: item.sosmedbekerja || item.sosmedBekerja,
          posisi: item.posisi || item.pekerjaan || item.posisi,
          isUpdated: true 
        };
      });

      const combinedList = [];
      const seenNims = new Set();

      // PRIORITAS 1: MASUKKAN SEMUA DATA DARI EXCEL TERLEBIH DAHULU
      parsedData.forEach(item => {
        if (!seenNims.has(item.nim)) {
          // Jika ada NIM ini di Supabase, timpa data Excelnya dengan data Supabase yang lebih lengkap
          if (supaMap[item.nim]) {
            combinedList.push(supaMap[item.nim]);
          } else {
            // Jika belum ada di Supabase, masukkan data asli dari Excel
            combinedList.push({ ...item, isUpdated: false });
          }
          seenNims.add(item.nim);
        }
      });

      // PRIORITAS 2: MASUKKAN DATA BARU SUPABASE YANG TIDAK ADA DI EXCEL (Di bagian bawah)
      if (supaData1) {
        supaData1.forEach(item => {
          if (!seenNims.has(item.nim)) {
            combinedList.push(supaMap[item.nim]);
            seenNims.add(item.nim);
          }
        });
      }

      setAlumniList(combinedList);

    } catch (error) {
      console.error("Kesalahan Fetch Data:", error);
      setFetchError(error.message || 'Gagal memuat data dari database.');
      setAlumniList([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPageData(currentPage, searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm, fetchPageData]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUpdateLokal = (updatedData) => {
    // Memperbarui UI secara instan setelah modal Supabase ditutup
    setAlumniList(prev => prev.map(item => 
      item.nim === updatedData.nim ? { ...item, ...updatedData, isUpdated: true } : item
    ));
    setEditingAlumni(null);
  };

  const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-blue-600" /> Daftar ALumni
          </h2>
          <p className="text-sm text-gray-500 mt-1">Halaman pengelolaan alumni</p>
        </div>
      </div>

      <div className="space-y-6">
        {fetchError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Peringatan Koneksi</h3>
              <p className="text-sm mt-1">{fetchError}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 shrink-0">
            <div className="flex gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Cari Nama atau NIM..." 
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white shadow-sm" 
                  value={searchTerm} 
                  onChange={handleSearchChange} 
                />
              </div>
              <button onClick={() => fetchPageData(currentPage, searchTerm)} disabled={isLoadingData} className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 w-10 h-10 rounded-lg hover:bg-gray-50 disabled:opacity-50 shrink-0 shadow-sm transition-all">
                <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 relative custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead className="sticky top-0 z-20 bg-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <tr className="text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-3 font-semibold border-b border-gray-200 sticky left-0 bg-gray-100 z-30 shadow-[1px_0_0_#e5e7eb] w-36">Aksi</th>
                  <th className="p-3 font-semibold border-b border-gray-200">Identitas Diri</th>
                  <th className="p-3 font-semibold border-b border-gray-200">Data Akademik</th>
                  <th className="p-3 font-semibold border-b border-gray-200">Kontak (Email/HP)</th>
                  <th className="p-3 font-semibold border-b border-gray-200">Sosial Media</th>
                  <th className="p-3 font-semibold border-b border-gray-200">Karir & Pekerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoadingData && alumniList.length === 0 ? (
                  <tr><td colSpan="6" className="p-16 text-center text-gray-500"><RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" /> Memuat data alumni...</td></tr>
                ) : alumniList.length > 0 ? (
                  alumniList.map((alumnus, index) => {
                    const isLengkap = alumnus.isUpdated;
                    return (
                      <tr key={`${alumnus.nim}-${index}`} className="hover:bg-blue-50/40 transition-colors group">
                        
                        {/* KOLOM 1: AKSI DENGAN TOMBOL OSINT */}
                        <td className="p-3 align-top sticky left-0 bg-white group-hover:bg-blue-50/40 transition-colors shadow-[1px_0_0_#f3f4f6] z-10 w-36">
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => setOsintTarget(alumnus)} 
                              className="w-full flex justify-center items-center gap-1.5 px-2 py-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            >
                              <Search className="w-3.5 h-3.5" /> OSINT Track
                            </button>
                            <button 
                              onClick={() => setEditingAlumni(alumnus)} 
                              className={`w-full flex justify-center items-center gap-1.5 px-2 py-1.5 border rounded-lg text-[10px] font-bold transition-all shadow-sm ${isLengkap ? 'bg-white border-green-300 text-green-700 hover:bg-green-50' : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'}`}
                            >
                              <Edit className="w-3.5 h-3.5" /> {isLengkap ? 'Edit Data' : 'Lengkapi'}
                            </button>
                          </div>
                        </td>

                        {/* KOLOM 2: IDENTITAS */}
                        <td className="p-3 align-top min-w-[200px]">
                          <div className="font-bold text-gray-900 text-sm line-clamp-2">{alumnus.nama}</div>
                          <div className="inline-block mt-1 font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">NIM: {alumnus.nim}</div>
                        </td>

                        {/* KOLOM 3: AKADEMIK */}
                        <td className="p-3 align-top min-w-[180px]">
                          <div className="text-xs font-semibold text-gray-800">{alumnus.prodi}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{alumnus.fakultas}</div>
                          <div className="text-[10px] text-gray-400 mt-1">Angkatan {alumnus.tahunMasuk} • Lulus {alumnus.tanggalLulus}</div>
                        </td>

                        {/* KOLOM 4: KONTAK */}
                        <td className="p-3 align-top min-w-[180px]">
                          {alumnus.email ? (
                             <div className="text-xs text-gray-700 truncate" title={alumnus.email}>📧 {alumnus.email}</div>
                          ) : <div className="text-xs text-gray-400 italic">Email kosong</div>}
                          
                          {alumnus.noHp ? (
                             <div className="text-xs text-gray-700 mt-1">📞 {alumnus.noHp}</div>
                          ) : <div className="text-xs text-gray-400 italic mt-1">No HP kosong</div>}
                        </td>

                        {/* KOLOM 5: SOSMED */}
                        <td className="p-3 align-top min-w-[160px]">
                          <div className="flex flex-wrap gap-1">
                            {alumnus.linkedin && (
                              <a href={alumnus.linkedin.startsWith('http') ? alumnus.linkedin : `https://${alumnus.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors" title={`Kunjungi LinkedIn: ${alumnus.linkedin}`}>Linkedin</a>
                            )}
                            {alumnus.ig && (
                              <a href={`https://instagram.com/${alumnus.ig.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded hover:bg-pink-200 transition-colors" title={`Kunjungi Instagram: ${alumnus.ig}`}>IG</a>
                            )}
                            {alumnus.fb && (
                              <a href={alumnus.fb.startsWith('http') ? alumnus.fb : `https://facebook.com/search/top/?q=${encodeURIComponent(alumnus.fb)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded hover:bg-indigo-200 transition-colors" title={`Cari Facebook: ${alumnus.fb}`}>FB</a>
                            )}
                            {alumnus.tiktok && (
                              <a href={`https://tiktok.com/@${alumnus.tiktok.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded hover:bg-gray-800 transition-colors" title={`Kunjungi TikTok: ${alumnus.tiktok}`}>TikTok</a>
                            )}
                            {(!alumnus.linkedin && !alumnus.ig && !alumnus.fb && !alumnus.tiktok) && (
                              <span className="text-xs text-gray-400 italic">-</span>
                            )}
                          </div>
                        </td>

                        {/* KOLOM 6: KARIR */}
                        <td className="p-3 align-top min-w-[250px]">
                          {alumnus.tempatBekerja ? (
                            <>
                              <div className="text-xs font-semibold text-gray-800 line-clamp-1" title={alumnus.tempatBekerja}>{alumnus.tempatBekerja}</div>
                              <div className="text-[11px] text-gray-600 mt-0.5">{alumnus.posisi} <span className="text-gray-400">({alumnus.jenisPekerjaan})</span></div>
                              {alumnus.alamatBekerja && <div className="text-[10px] text-gray-400 mt-1 line-clamp-1" title={alumnus.alamatBekerja}>📍 {alumnus.alamatBekerja}</div>}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Belum ada data pekerjaan</span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" className="p-16 text-center text-gray-500">
                    <div className="text-lg font-medium text-gray-800 mb-1">Data tidak ditemukan</div>
                    <p>Pencarian "{searchTerm}" tidak memberikan hasil pada halaman ini.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <div className="text-xs text-gray-500">
              Menampilkan <span className="font-bold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * ITEMS_PER_PAGE, totalData)}</span> Daftar Alumni    
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoadingData} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || isLoadingData || alumniList.length === 0} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Modal Edit Data */}
      {editingAlumni && (
        <DataFormModal alumnus={editingAlumni} onClose={() => setEditingAlumni(null)} onSaveSuccess={handleUpdateLokal} supabase={supabase} />
      )}

      {/* Render Modal OSINT */}
      {osintTarget && (
        <OsintModal 
          alumnus={osintTarget} 
          onClose={() => setOsintTarget(null)} 
          onProceed={() => {
            setEditingAlumni(osintTarget);
            setOsintTarget(null);
          }} 
        />
      )}
    </div>
  );
}

// --- KOMPONEN MODAL OSINT (BARU) ---
function OsintModal({ alumnus, onClose, onProceed }) {
  const qLinked = `site:id.linkedin.com/in OR site:linkedin.com/in "${alumnus.nama}" "${alumnus.prodi}"`;
  const qScholar = `"${alumnus.nama}" "${alumnus.prodi}"`;
  const qWeb = `"${alumnus.nama}" "${alumnus.prodi}" (site:instagram.com OR site:facebook.com OR site:tiktok.com)`;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal OSINT */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-indigo-900 text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 blur-[60px] rounded-full opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5" /> OSINT Tracker Assistant
            </h3>
            <p className="text-sm text-indigo-200 mt-1">Pencarian jejak digital pintar untuk: <strong className="text-white">{alumnus.nama}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-full transition-colors relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten OSINT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-800">LinkedIn & Karir</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4 flex-1">Telusuri riwayat pekerjaan dan profil profesional kandidat.</p>
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(qLinked)}`} 
                target="_blank" rel="noopener noreferrer"
                className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Cari di LinkedIn
              </a>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-800">Akademik & Jurnal</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4 flex-1">Temukan publikasi ilmiah atau status studi lanjutan.</p>
              <a 
                href={`https://scholar.google.com/scholar?q=${encodeURIComponent(qScholar)}`} 
                target="_blank" rel="noopener noreferrer"
                className="w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Cari di Scholar
              </a>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-pink-300 transition-colors flex flex-col md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-800">Sosial Media Publik (IG, FB, TikTok)</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4 flex-1">Pindai presensi digital kandidat di platform sosial media populer.</p>
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(qWeb)}`} 
                target="_blank" rel="noopener noreferrer"
                className="w-full text-center py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Pindai Sosial Media
              </a>
            </div>

          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h5 className="font-bold text-indigo-900 text-sm">Sudah menemukan informasinya?</h5>
              <p className="text-xs text-indigo-700 mt-1">Lanjutkan untuk menyalin data yang ditemukan ke dalam sistem database.</p>
            </div>
            <button 
              onClick={onProceed}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2"
            >
              Lanjutkan Isi Form <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN MODAL FORMULIR (MENYIMPAN KE SUPABASE) ---
function DataFormModal({ alumnus, onClose, onSaveSuccess, supabase }) {
  const [formData, setFormData] = useState({ ...alumnus });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpanKeSupabase = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Menerjemahkan camelCase menjadi lowercase murni sesuai format Postgres 
    // DAN mengisi nilai default skema lama agar kompatibel
    const payload = {
      nim: formData.nim, 
      nama: formData.nama,
      tahunmasuk: formData.tahunMasuk,
      tanggallulus: formData.tanggalLulus,
      fakultas: formData.fakultas,
      prodi: formData.prodi,
      email: formData.email,
      nohp: formData.noHp,
      linkedin: formData.linkedin,
      ig: formData.ig,
      fb: formData.fb,
      tiktok: formData.tiktok,
      tempatbekerja: formData.tempatBekerja,
      alamatbekerja: formData.alamatBekerja,
      posisi: formData.posisi,
      jenispekerjaan: formData.jenisPekerjaan,
      sosmedbekerja: formData.sosmedBekerja,
      
      // KOLOM KOMPATIBILITAS SKEMA LAMA (Agar tidak merusak halaman Peta, Pendataan, & Admin)
      instansi: formData.tempatBekerja,
      pekerjaan: formData.posisi,
      tahun: parseInt(formData.tahunMasuk) || null,
      status: 'Terverifikasi' // Status langsung valid karena diedit oleh Admin via Daftar Pengguna
    };

    try {
      if (!payload.nim || payload.nim === '-') {
         throw new Error("Data ini tidak memiliki NIM valid. Tidak bisa disimpan ke Supabase.");
      }
      
      const { error } = await supabase.from('alumni').upsert(payload, { onConflict: 'nim' });
      if (error) throw error;
      
      onSaveSuccess(formData); 
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert('Gagal menyimpan ke Supabase: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Data Alumni</h3>
            <p className="text-sm text-gray-500 mt-0.5">Memperbarui data Supabase untuk <span className="font-semibold text-gray-700">{alumnus.nama}</span> ({alumnus.nim})</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
          <form id="alumni-form" onSubmit={handleSimpanKeSupabase} className="space-y-8 max-w-3xl mx-auto">
            {/* Section 1 */}
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4 border-b border-blue-200 pb-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-semibold text-blue-900">Kontak & Media Sosial Pribadi</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email Pribadi / Utama</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="contoh@gmail.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nomor HP / WhatsApp aktif</label>
                  <input type="tel" name="noHp" value={formData.noHp || ''} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="0812xxxxxx" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Profil LinkedIn</label>
                  <input type="url" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Instagram</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input type="text" name="ig" value={formData.ig || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 pl-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="username" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Facebook</label>
                  <input type="text" name="fb" value={formData.fb || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Nama Akun FB" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">TikTok</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input type="text" name="tiktok" value={formData.tiktok || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 pl-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="username" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-4 border-b border-green-200 pb-2">
                <Globe className="w-5 h-5 text-green-600" />
                <h4 className="text-base font-semibold text-green-900">Informasi Karir & Pekerjaan Saat Ini</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Status Pekerjaan Utama</label>
                  <select name="jenisPekerjaan" value={formData.jenisPekerjaan || ''} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none cursor-pointer bg-white">
                    <option value="">-- Pilih Status Pekerjaan --</option>
                    <option value="PNS/TNI/POLRI">Aparatur Sipil Negara (PNS / TNI / POLRI)</option>
                    <option value="BUMN/BUMD">Pegawai BUMN / BUMD</option>
                    <option value="Swasta">Pegawai Swasta Nasional / Multinasional</option>
                    <option value="Wirausaha">Wirausaha / Memiliki Usaha Sendiri</option>
                    <option value="Freelance">Freelance / Pekerja Lepas / Profesional</option>
                    <option value="Lainnya">Lainnya (Studi Lanjut / Belum Bekerja)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nama Instansi / Perusahaan</label>
                  <input type="text" name="tempatBekerja" value={formData.tempatBekerja || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow" placeholder="PT. Angin Ribut" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Jabatan / Posisi</label>
                  <input type="text" name="posisi" value={formData.posisi || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow" placeholder="Manager Marketing" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Alamat Lengkap Kantor / Tempat Usaha</label>
                  <textarea name="alamatBekerja" value={formData.alamatBekerja || ''} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none transition-shadow" placeholder="Jl. Sudirman Kav 12..." />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Website / Sosial Media Perusahaan</label>
                  <input type="text" name="sosmedBekerja" value={formData.sosmedBekerja || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow" placeholder="www.perusahaan.com atau @ig_perusahaan" />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">Batal</button>
          <button type="submit" form="alumni-form" disabled={isSaving} className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md disabled:bg-blue-400 transition-colors">
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}