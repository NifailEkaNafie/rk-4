    import React, { useState, useEffect } from 'react';
    import { 
    Search, Database, Globe, BookOpen, User, Save, Clock, History, 
    ChevronRight, MapPin, Briefcase, Activity, ChevronLeft, ExternalLink,
    Eye, Edit2, Link, Download, Upload, Smartphone, Building, CloudLightning, 
    FileCheck, Github, Wand, UserPlus, Info, AlertCircle, CheckCircle2, Timer, Loader2,X, Table,Target, Maximize,  Award
    } from 'lucide-react';
    import { usePencarianController } from '../controllers/usePencarianController';

    export default function PencarianView({ setActiveTab }) {
    const { 
        queryNama, setQueryNama, queryAfiliasi, setQueryAfiliasi, queryKonteks, setQueryKonteks, 
        isSearching, internalResults, externalResults, alumniDB, executeSearch, simpanJejak, updateInformasiAlumni,verifyPDDiktiByRange,updatePDDiktiLinksByRange,
        currentPage, setCurrentPage, totalData, searchHistory, 
        exportToSpreadsheet, isExporting, exportProgress, successSheetUrl,
        isImporting, importProgress, importStatus, handleImportExcel,exportProgressCount,
        isAutoTracking, autoTrackStatus, runAutoTrackCurrentPage,runGlobalAutoTrack,runAutoTrackRange,runPageAutoTrack,exportSamplingToSpreadsheet,fetchSamplingDataForView,
        globalStats, verifyWithPDDikti // Pastikan verifyWithPDDikti di-destructure di sini
    } = usePencarianController();

    const [selectedReportId, setSelectedReportId] = useState(null);
    const [showApiPanel, setShowApiPanel] = useState(false);
    const [tableFilter, setTableFilter] = useState('');
    const [isPageLoading, setIsPageLoading] = useState(true);

    // STATE MODE SAMPLING
    const [isSamplingMode, setIsSamplingMode] = useState(false);
    const [samplingData, setSamplingData] = useState([]);
    const [isLoadingSampling, setIsLoadingSampling] = useState(false);
    // HANDLER MODE SAMPLING
    const handleViewSampling = async () => {
        setIsSamplingMode(true);
        setIsLoadingSampling(true);
        try {
            const data = await fetchSamplingDataForView();
            setSamplingData(data);
        } catch (error) {
            alert("Gagal memuat data sampling");
            setIsSamplingMode(false);
        } finally {
            setIsLoadingSampling(false);
        }
    };

    useEffect(() => {
        // Mengecek jika alumniDB sudah ter-load (meskipun kosong/length 0, artinya fetch selesai)
        if (alumniDB) {
        // Memberikan sedikit delay 500ms agar transisi UI terlihat halus
        const timer = setTimeout(() => setIsPageLoading(false), 500);
        return () => clearTimeout(timer);
        }
    }, [alumniDB]);
    // -----------------------------

    // 1. LOGIKA STATISTIK GLOBAL
    const displayStats = globalStats || { terlacak: 0, verifikasi: 0, belum: 0 };

    useEffect(() => {
        if (isSearching) setShowApiPanel(true);
        if (queryNama.trim() === '') setShowApiPanel(false);
    }, [isSearching, queryNama]);

    const groupedExternal = { 'PDDIKTI': [], 'GitHub': [], 'Google Web': [], 'ORCID': [] };
    externalResults.forEach(item => { if (groupedExternal[item.source]) groupedExternal[item.source].push(item); });

    const filteredTableData = internalResults.filter(item => 
        item.nama.toLowerCase().includes(tableFilter.toLowerCase()) || 
        (item.nim && item.nim.toLowerCase().includes(tableFilter.toLowerCase()))
    );

    const SaveTracerButton = ({ item }) => (
        <div className="mt-3 pt-3 border-t border-orange-100 flex items-center gap-1">
        <Save size={12} className="text-orange-500 shrink-0" />
        <select className="w-full text-[10px] p-1.5 border border-orange-200 rounded text-orange-700 bg-orange-50 outline-none cursor-pointer font-bold transition-all hover:bg-orange-100" onChange={(e) => { if(e.target.value) { simpanJejak(e.target.value, item); setSelectedReportId(parseInt(e.target.value)); } e.target.value = ""; }} defaultValue="">
            <option value="" disabled>Tautkan ke Data...</option>
            {internalResults.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        </div>
    );

    const selectedAlumni = internalResults.find(a => a.id.toString() === selectedReportId?.toString()) || 
                            alumniDB.find(a => a.id.toString() === selectedReportId?.toString()) || 
                            samplingData.find(a => a.id.toString() === selectedReportId?.toString());

    const getStatusColor = (status) => {
        if (status === 'Terlacak') return 'bg-yellow-100 text-yellow-700';
        if (status === 'Pending') return 'bg-rose-100 text-rose-700';
        return 'bg-stone-100 text-stone-600';
    };

    const getStatusDot = (status) => {
        if (status === 'Terlacak') return 'bg-yellow-500';
        if (status === 'Pending') return 'bg-rose-500';
        return 'bg-stone-400';
    };

    const SearchableInput = ({ label, field, placeholder, icon, searchContext }) => (
        <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-amber-600 uppercase flex items-center gap-1">{icon} {label}</label>
            <div className="flex gap-2">
                <input 
                    key={`${field}-${selectedAlumni[field]}`}
                    className="flex-1 text-xs font-bold p-2 border border-orange-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
                    defaultValue={selectedAlumni[field]} 
                    onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, field, e.target.value)} 
                    placeholder={placeholder} 
                />
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(searchContext)}`, '_blank')} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 border border-orange-100 transition-colors" title={`Cari ${label}`}>
                    <Search size={14}/>
                </button>
            </div>
        </div>
    );

    const finalValueNum = Number(globalStats.finalValue || 0);
    const accuracyNum = Number(globalStats.accuracyScore || 0);
    const completenessNum = Number(globalStats.completenessScore || 0);
    const coverageNum = Number(globalStats.coverageScore || 0);
    const tableDataToRender = isSamplingMode ? samplingData : filteredTableData;
    return (
        <div className="max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-4 pb-20 font-sans relative bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 min-h-screen rounded-3xl">
        
        {/* UI LOADING OVERLAY INITIAL DATA */}
        {isPageLoading && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-orange-50/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-300 border border-orange-100">
                    <Loader2 size={40} className="text-orange-600 animate-spin mb-4" />
                    <h3 className="text-lg font-black text-amber-900">Memuat Data...</h3>
                    <p className="text-xs font-bold text-amber-600 mt-1">Menyiapkan dashboard pelacakan alumni</p>
                </div>
            </div>
        )}
        
        {/* UI LOADING OVERLAY IMPORT EXCEL */}
        {isImporting && (
            <div className="fixed inset-0 z-[99] flex items-center justify-center bg-amber-900/40 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4"><Upload size={32} className="animate-bounce" /></div>
                    <h3 className="text-xl font-black text-amber-900 mb-2">Mengimpor Data Excel</h3>
                    <p className="text-xs font-bold text-amber-600 mb-6">{importStatus || 'Membaca file...'}</p>
                    <div className="w-full bg-orange-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner"><div className="bg-orange-600 h-full rounded-full transition-all duration-300 ease-out relative" style={{ width: `${importProgress}%` }}><div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div></div></div>
                    <div className="flex justify-between w-full text-xs font-black text-amber-400"><span>Sedang diproses...</span><span className="text-orange-600 text-sm">{importProgress}%</span></div>
                </div>
            </div>
        )}

        {/* HEADER UTAMA */}
        <div className="flex flex-col md:flex-row start-0 items-start md:items-center mb-6 gap-4 mt-4">
            <h2 className="text-2xl font-black text-amber-900 flex items-center gap-3">
            
            </h2>
            
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block mr-2">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total alumni</p>
                    <p className="text-lg font-black text-amber-950">{totalData.toLocaleString('id-ID')}</p>
                </div>
                <div className="h-8 w-px bg-amber-200 hidden sm:block"></div>
                
                {setActiveTab && (
                <button onClick={() => setActiveTab('pendataan')} disabled={isSearching || isImporting || isExporting || isAutoTracking} className="flex items-center gap-2 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-200 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50">
                    <UserPlus size={14} /> Tambah Manual
                </button>
                )}

                <input type="file" id="import-excel" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} disabled={isImporting || isExporting || isSearching || isAutoTracking} />
                <label htmlFor="import-excel" className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm cursor-pointer transition-all ${isImporting ? 'bg-orange-100 text-orange-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-200 active:scale-95'}`}>
                    <Upload size={14} /> Import
                </label>



                <button 
                    onClick={() => exportToSpreadsheet(false)} 
                    disabled={isSearching || isImporting || isExporting || isAutoTracking} 
                    className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all min-w-[160px] ${
                        isExporting 
                        ? 'bg-orange-100 text-orange-600 cursor-wait' 
                        : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 border border-amber-700 active:scale-95 disabled:opacity-50'
                    }`}
                >
                    {/* Baris Atas: Ikon dan Teks Status */}
                    <div className="flex items-center gap-2">
                        {isExporting ? <Activity size={14} className="animate-spin" /> : <Download size={14} />} 
                        <span>{isExporting ? `Sync ${exportProgress}%` : 'Export All To Excel'}</span>
                    </div>

                    {/* Baris Bawah: Counter Data (Hanya muncul saat Exporting) */}
                    {isExporting && (
                        <div className="text-[9px] font-black text-orange-600 bg-orange-200/50 px-2 py-0.5 rounded-full animate-pulse">
                            {(exportProgressCount || 0).toLocaleString('id-ID')} / {totalData.toLocaleString('id-ID')}
                        </div>
                    )}
                </button>
            </div>
        </div>

        {/* 2. DASHBOARD INFORMASI GLOBAL */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-2xl border border-orange-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1"><Globe size={12}/> Teridentifikasi</span>
                <span className="text-[10px] font-bold text-amber-600">{Math.round(((displayStats.terlacak + displayStats.verifikasi) / (totalData || 1)) * 100)}%</span>
            </div>
            <p className="text-2xl font-black text-amber-900">{(displayStats.terlacak + displayStats.verifikasi).toLocaleString('id-ID')}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-2xl border border-yellow-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12}/> Terlacak (Valid)</span>
            </div>
            <p className="text-2xl font-black text-amber-900">{displayStats.terlacak.toLocaleString('id-ID')}</p>
            </div>



        
        </div>
        {/* --- ELEMEN BARU: ACCURACY & HASIL NILAI AKHIR --- */}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
    {/* BOX ACCURACY (Verified Data) */}
        <div className="bg-white border border-stone-100 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between overflow-hidden relative">
    
    {/* Dekorasi Latar Belakang (Soft Glow) */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl pointer-events-none -z-10" />

    {/* Konten Utama */}
    <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <FileCheck size={14} className="text-orange-400" /> 
                    Accuracy Dashboard
                </span>
                <h3 className="text-4xl font-bold text-stone-800 tracking-tight">
                    {globalStats.pddiktiValidCount?.toLocaleString('id-ID') || 0}
                </h3>
            </div>

            {/* Badge Persentase */}
            <div className="bg-orange-50/80 border border-orange-100/50 px-3 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-orange-400/80 mb-0.5">Accuracy</p>
                <p className="text-lg font-bold text-orange-600">
                    {accuracyNum.toFixed(1)}%
                </p>
            </div>
        </div>

        {/* Progress Bar Lembut */}
        <div className="mt-6 w-full bg-stone-100/80 rounded-full h-1.5 overflow-hidden">
            <div 
                className="bg-gradient-to-r from-orange-300 to-orange-400 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(accuracyNum, 100)}%` }}
            ></div>
        </div>
    </div>

    {/* Area Tombol CTA (Bagian Bawah) */}
    <div className="px-6 py-4 border-t border-stone-100/80 bg-stone-50/50 flex justify-end gap-3">
        
        {/* Tombol 1: LIHAT TABEL (Jika ingin diaktifkan, sesuaikan gayanya seperti ini)
        <button
            onClick={handleViewSampling}
            disabled={isExporting || isLoadingSampling} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 bg-white text-stone-500 border border-stone-200 hover:border-orange-200 hover:text-orange-500 shadow-sm"
        >
            <Eye size={14} /> Lihat Tabel
        </button>
        */}

        {/* Tombol 2: EXPORT EXCEL */}
        <button
            onClick={exportSamplingToSpreadsheet}
            disabled={isExporting} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                isExporting 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-transparent' 
                : 'bg-white text-stone-600 border border-stone-200 hover:border-orange-300 hover:text-orange-600 hover:shadow-[0_4px_12px_rgb(251,146,60,0.15)] shadow-sm active:scale-[0.98]'
            }`}
        >
            {isExporting ? (
                <span className="animate-pulse flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></span>
                    Memproses Data...
                </span>
            ) : (
                <>
                    <Download size={14} />
                    Unduh Sampel Evaluasi (500)
                </>
            )}
        </button>
    </div>

</div>

        {/* BOX NILAI AKHIR */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-orange-300 shadow-xl flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        stroke="#f97316" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray="251.32"
                        strokeDashoffset={251.32 - (Math.min(finalValueNum,100) / 100) * 251.32}
                        strokeLinecap="round" 
                        className="transition-all duration-1000" 
                    />
                </svg>

                <span className="text-2xl font-black text-slate-800">
                    {finalValueNum.toFixed(1)}
                </span>
            </div>

            <div className="w-full space-y-3">
  
  {/* Header */}
  <div className="flex items-center gap-2 px-1 mb-3">
    <div className="p-1.5 bg-orange-100 rounded-lg">
      <Award size={14} className="text-orange-600" />
    </div>
    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
      Parameter Penilaian
    </h4>
  </div>

  {/* Bento Box Grid */}
  <div className="grid grid-cols-2 gap-3">
    
    {/* Coverage Card */}
    <div className="bg-[#FFF8F3] border border-orange-100/60 rounded-[1.25rem] p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Coverage</span>
        <Maximize size={14} className="text-orange-300" />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-stone-800">{coverageNum || 0}</span>
          <span className="text-sm font-medium text-orange-400">%</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5">Bobot 40%</p>
      </div>
    </div>

    {/* Accuracy Card */}
    <div className="bg-[#F8FAFC] border border-slate-100 rounded-[1.25rem] p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
        <Target size={14} className="text-slate-300" />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-stone-800">{accuracyNum.toFixed(1)}</span>
          <span className="text-sm font-medium text-slate-400">%</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5">Bobot 40%</p>
      </div>
    </div>

    {/* Completeness Card */}
    <div className="bg-[#FFF5F5] border border-rose-100/60 rounded-[1.25rem] p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Complete</span>
        <CheckCircle2 size={14} className="text-rose-300" />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-stone-800">{completenessNum.toFixed(1)}</span>
          <span className="text-sm font-medium text-rose-400">%</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5">Bobot 20%</p>
      </div>
    </div>

    {/* Final Score Card (Dark Accent) */}
    <div className="bg-stone-800 rounded-[1.25rem] p-4 flex flex-col justify-between shadow-lg shadow-stone-900/10 transition-transform hover:-translate-y-0.5 duration-300 relative overflow-hidden">
      {/* Decorative Blur Inside Card */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Skor Akhir</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white tracking-tight">{finalValueNum.toFixed(2)}</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Kalkulasi Sistem</p>
      </div>
    </div>

  </div>
</div>
        </div>
    </div>


        {/* KOTAK NOTIFIKASI SUKSES */}
        {successSheetUrl && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-600 p-2 rounded-full text-white"><FileCheck size={20} /></div>
                    <div>
                        <p className="font-bold text-yellow-900 text-sm">Laporan Spreadsheet Berhasil Dibuat!</p>
                        <p className="text-[11px] text-yellow-700 mt-0.5">Silakan klik tombol di samping untuk membuka.</p>
                    </div>
                </div>
                <a href={successSheetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-yellow-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-yellow-700 transition-colors shadow-sm whitespace-nowrap">
                    <ExternalLink size={14} /> BUKA SPREADSHEET
                </a>
            </div>
        )}
        
        {/* FORM PENCARIAN WEB */}
        

        {/* HASIL PENCARIAN API */}
        {showApiPanel && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
                {['PDDIKTI', 'GitHub', 'Google Web', 'ORCID'].map((source) => (
                    <div key={source} className={`bg-white rounded-xl shadow-sm border flex flex-col h-[450px] overflow-hidden ${source === 'PDDIKTI' ? 'border-orange-200' : source === 'GitHub' ? 'border-stone-300' : source === 'Google Web' ? 'border-amber-200' : 'border-yellow-200'}`}>
                    <div className={`p-3 flex justify-between items-center shrink-0 text-white ${source === 'PDDIKTI' ? 'bg-orange-600' : source === 'GitHub' ? 'bg-stone-800' : source === 'Google Web' ? 'bg-amber-600' : 'bg-yellow-600'}`}>
                        <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        {source === 'PDDIKTI' ? <BookOpen size={14}/> : source === 'GitHub' ? <Github size={14}/> : source === 'Google Web' ? <Globe size={14}/> : <User size={14}/>} {source}
                        </span>
                        <span className="text-[10px] opacity-80 px-2 py-0.5 rounded-full bg-black/20">{groupedExternal[source].length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-orange-50/30">
                        {groupedExternal[source].length > 0 ? groupedExternal[source].map((item, idx) => (
                        <div key={idx} className="rounded-lg border border-orange-200 bg-white hover:shadow-md transition-shadow overflow-hidden">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border-b border-orange-100">
                                {item.image && <img src={item.image} alt="Avatar" className="w-10 h-10 rounded-full border border-orange-100 object-cover" />}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-amber-900 truncate" title={item.title}>{item.title}</h4>
                                    <p className="text-[10px] text-orange-600 mt-0.5">Lihat Profil &rarr;</p>
                                </div>
                            </a>
                            <div className="px-3 pb-3"><SaveTracerButton item={item} /></div>
                        </div>
                        )) : <p className="text-xs text-amber-400 text-center mt-10">Tidak ada temuan.</p>}
                    </div>
                    </div>
                ))}
            </div>
        )}



        {/* AREA UTAMA (TABEL & VALIDATOR) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* PANEL KIRI: TABEL */}
            <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-3xl border border-orange-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
                    <div className="bg-orange-50 p-4 border-b border-orange-200 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="font-black text-xs uppercase text-amber-700 flex items-center gap-2">
                            <Database size={14}/> 
                            {isSamplingMode ? (
                                <span className="text-orange-600">Mode Sampling Evaluasi (500 Data)</span>
                            ) : 'Data Alumni'}
                        </span>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isSamplingMode ? (
                                // TOMBOL KELUAR MODE SAMPLING
                                <button 
                                    onClick={() => setIsSamplingMode(false)} 
                                    className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all border border-rose-200 active:scale-95"
                                >
                                    <X size={14} /> Tutup Mode Sampel
                                </button>
                            ) : (
                                // TOMBOL-TOMBOL ASLI (Hanya tampil di mode normal)
                                <>
                                    
                            
                           

                            <button 
                                onClick={runGlobalAutoTrack}
                                disabled={isAutoTracking || isSearching || isExporting || isImporting}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm transition-all w-full sm:w-auto justify-center ${
                                    isAutoTracking 
                                    ? 'bg-yellow-100 text-orange-600 cursor-wait' 
                                    : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-700 hover:to-rose-600 active:scale-95'
                                }`}
                            >
                                {isAutoTracking ? <Activity size={12} className="animate-spin"/> : <Wand size={12} />}
                                {isAutoTracking ? autoTrackStatus : 'Lacak Otomatis Seluruh Data'}
                            </button>

                                    <div className="relative w-full sm:w-48">
                                        
                                        
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm">
                                <tr className="text-[10px] font-bold text-amber-700 uppercase tracking-wider border-b border-orange-200">
                                    <th className="p-4 pl-6">INFO ALUMNI</th><th className="p-4">AKADEMIK</th><th className="p-4">CONFIDENCE</th><th className="p-4 pr-6">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100 relative">
                                {/* LOADING OVERLAY SAAT MENGAMBIL DATA SAMPLING */}
                                {isLoadingSampling && (
                                    <tr>
                                        <td colSpan="6" className="h-[500px]">
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm text-orange-600">
                                                <Loader2 size={40} className="animate-spin mb-4" />
                                                <p className="font-black animate-pulse">Menyusun Data Sampling...</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* MENGGUNAKAN tableDataToRender ALIH-ALIH filteredTableData */}
                                {!isLoadingSampling && tableDataToRender.map((item) => {
                                    const getInitials = (name) => {
                                        if (!name) return 'A'; const parts = name.replace(/[^a-zA-Z ]/g, '').trim().split(' ');
                                        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
                                    };
                                    
                                    return (
                                    <tr key={item.id} className={`hover:bg-orange-50 transition-colors ${selectedReportId === item.id ? 'bg-orange-100/50' : ''}`}>
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">{getInitials(item.nama)}</div>
                                                <div><div className="font-bold text-amber-900 text-sm">{item.nama}</div><div className="text-[10px] font-mono text-amber-600">{item.nim}</div></div>
                                            </div>
                                        </td>
                                        <td className="p-4"><div className="font-bold text-amber-800 text-xs">{item.prodi || '-'}</div><div className="text-[10px] text-amber-600">Angkatan {item.tahun || '-'}</div></td>
                                        
                                        
                                        <td className="p-4">
                                            <div className="w-20">
                                                <div className="flex justify-between text-[9px] mb-1"><span className="font-bold text-amber-800">{(item.confidence_score ? item.confidence_score / 10 : 0).toFixed(1)}</span><span className="text-amber-600 font-bold">{item.confidence_score || 0}%</span></div>
                                                <div className="w-full bg-orange-200 rounded-full h-1"><div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${item.confidence_score || 0}%` }}></div></div>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 flex flex-col gap-1">
                                        <button onClick={() => setSelectedReportId(item.id)} className="flex items-center justify-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 border border-orange-200"><Edit2 size={12} /> VALIDASI</button>
                                        
                                        {/* --- START: TOMBOL VERIFIKASI PDDIKTI BARU --- */}
                                        <button 
                                            onClick={() => {
                                            if(item.pddikti_url) {
                                                window.open(item.pddikti_url, '_blank');
                                            } else {
                                                verifyWithPDDikti(item.id, item.nim, item.nama);
                                            }
                                            }}
                                            disabled={isAutoTracking}
                                            className={`flex items-center justify-center gap-2 px-3 py-1.5 font-bold text-[10px] rounded-lg border transition-all active:scale-95 ${
                                            item.pddikti_url 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white' 
                                            : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white'
                                            }`}
                                        >
                                            {item.pddikti_url ? <CheckCircle2 size={12}/> : isAutoTracking && autoTrackStatus.includes("PDDikti") ? <Loader2 size={12} className="animate-spin"/> : <CloudLightning size={12}/>}
                                            {item.pddikti_url ? 'VERIFIED PDDIKTI' : 'VERIFIKASI KE PDDIKTI'}
                                        </button>
                                        {/* --- END --- */}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>

                    <div className="shrink-0 bg-white border-t border-orange-100">
                        <div className="p-4 flex justify-between items-center"><span className="text-[10px] font-bold text-amber-700 uppercase">Hal {currentPage + 1} dari {Math.ceil(totalData / 50)}</span><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg border border-orange-200 transition-all active:scale-95"><ChevronLeft size={16}/></button><button onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg border border-orange-200 transition-all active:scale-95"><ChevronRight size={16}/></button></div></div>
                    </div>
                </div>
            </div>

            {/* PANEL KANAN: VALIDATOR */}
            <div className="w-full lg:w-1/3">
                {selectedAlumni ? (
                <div key={selectedAlumni.id + selectedAlumni.last_tracked_at} className="bg-white rounded-3xl border border-orange-200 shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500 h-[750px] flex flex-col">
                    <div className="bg-gradient-to-r from-amber-800 to-orange-900 p-6 text-white shrink-0">
                        <div className="flex justify-between items-start">
                            <div><h4 className="font-black text-lg uppercase tracking-tighter">{selectedAlumni.nama}</h4><p className="text-orange-200 text-[10px] font-bold mt-1 uppercase">NIM: {selectedAlumni.nim}</p></div>
                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10 min-w-[60px]"><p className="text-[8px] font-black text-orange-200 uppercase">Score</p><p className="text-sm font-black text-yellow-300">{selectedAlumni.confidence_score}%</p></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-orange-50/50">


                            {/* --- END --- */}

                            {/* 1. AKADEMIK */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-orange-900 uppercase flex items-center gap-2 border-b border-orange-200 pb-1"><BookOpen size={12}/> Akademik & Tanggal Lulus</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input key={"prodi-"+selectedAlumni.prodi} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.prodi} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'prodi', e.target.value)} placeholder="Prodi" />
                                    <input key={"tahun-"+selectedAlumni.tahun} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.tanggal_lulus} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'tahun', e.target.value)} placeholder="Tahun Lulus" />
                                </div>
                            </div>

                            {/* 2. KONTAK & DOMISILI */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-orange-900 uppercase flex items-center gap-2 border-b border-orange-200 pb-1"><User size={12}/> Email & No.Hp</label>
                                <input key={"hp-"+selectedAlumni.no_hp} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.no_hp} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'no_hp', e.target.value)} placeholder="No Handphone / WA" />
                                <input key={"eml-"+selectedAlumni.email_alumni} type="email" className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.email_alumni} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'email_alumni', e.target.value)} placeholder="Email Aktif" />
                            </div>

                            {/* 3. SOSMED PRIBADI */}
                            <div className="space-y-3 bg-orange-50 p-4 rounded-xl border border-orange-200">
                                <label className="text-[10px] font-black text-orange-900 uppercase flex items-center gap-2 border-b border-orange-100 pb-2 mb-2"><Smartphone size={12}/> Sosial Media Pribadi</label>
                                <SearchableInput label="LinkedIn" field="linkedin_url" placeholder="Link LinkedIn..." icon={<ExternalLink size={10}/>} searchContext={`${selectedAlumni.nama} LinkedIn`} />
                                <SearchableInput label="Instagram" field="instagram_url" placeholder="Link Instagram..." icon={<ExternalLink size={10}/>} searchContext={`${selectedAlumni.nama} Instagram`} />
                                <SearchableInput label="Facebook" field="facebook_url" placeholder="Link Facebook..." icon={<ExternalLink size={10}/>} searchContext={`${selectedAlumni.nama} Facebook`} />
                                <SearchableInput label="TikTok" field="tiktok_url" placeholder="Link TikTok..." icon={<ExternalLink size={10}/>} searchContext={`${selectedAlumni.nama} TikTok`} />
                            </div>

                            {/* 4. KARIR & INSTANSI */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-orange-900 uppercase flex items-center gap-2 border-b border-orange-200 pb-1"><Briefcase size={12}/> Karir & Tempat Bekerja</label>
                                <select key={"kat-"+selectedAlumni.jenis_instansi} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.jenis_instansi} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'jenis_instansi', e.target.value)}>
                                    <option value="">Pilih Kategori Kerja...</option>
                                    <option value="PNS">PNS / ASN</option>
                                    <option value="Swasta">Swasta</option>
                                    <option value="Wirausaha">Wirausaha / Founder</option>
                                    <option value="BUMN">BUMN</option>
                                
                                </select>
                                <input key={"pek-"+selectedAlumni.pekerjaan} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.pekerjaan} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'pekerjaan', e.target.value)} placeholder="Posisi / Jabatan" />
                                <input key={"inst-"+selectedAlumni.instansi} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.instansi} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'instansi', e.target.value)} placeholder="Nama Tempat Bekerja" />
                                <textarea key={"almbk-"+selectedAlumni.alamat} className="w-full text-xs font-bold p-2 border border-orange-200 rounded-lg h-12 resize-none bg-orange-50 outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedAlumni.alamat} onBlur={(e) => updateInformasiAlumni(selectedAlumni.id, 'alamat', e.target.value)} placeholder="Alamat Tempat Bekerja..." />
                                <SearchableInput label="Sosmed Instansi" field="instansi_sosmed" placeholder="Link Sosmed Kantor..." icon={<Building size={10}/>} searchContext={`${selectedAlumni.instansi} social media`} />
                            </div>

                            {/* 5. AUDIT TRAIL */}
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2 mb-2"><History className="text-indigo-600" size={14} /> Audit Trail Perubahan</h5>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                    {(Array.isArray(selectedAlumni.jejak_digital)
    ? selectedAlumni.jejak_digital
    : []
    ).map((jejak, i) => (
                                        <div key={i} className={`p-3 rounded-xl border text-[13px] shadow-sm ${jejak.source.includes("SISTEM") ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                            <span className={`font-black uppercase px-1.5 py-0.5 rounded text-[7px] ${jejak.source.includes("SISTEM") ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'}`}>{jejak.source}</span>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {new Date(jejak.ditambahkan_pada).toLocaleDateString()}</span>
                                            </div>
                                            <p className="font-bold text-slate-800">{jejak.title}</p>
                                            <p className="text-slate-500 mt-1 italic">{jejak.desc}</p>
                                        </div>
                                    ))}
                                    {(!selectedAlumni.jejak_digital || selectedAlumni.jejak_digital.length === 0) && <p className="text-[11px] text-slate-400 italic text-center py-2">Belum ada riwayat.</p>}
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="h-[750px] border-4 border-dashed border-orange-200 rounded-3xl flex flex-col items-center justify-center text-amber-400 bg-white p-10 text-center shadow-sm">
                        <div className="bg-orange-50 p-6 rounded-full mb-4"><Edit2 size={48} className="text-orange-300"/></div>
                        <p className="font-black text-sm uppercase tracking-widest text-orange-700">Mulai Validasi</p>
                        <p className="text-[11px] mt-2 max-w-[200px] leading-relaxed">Klik tombol <b>Validasi</b> pada baris tabel di samping untuk melengkapi ke-8 data wajib lulusan.</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
    }