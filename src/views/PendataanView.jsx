import React from 'react';
import { FileText, CheckCircle, Loader, MapPin, Search, User, Briefcase, Smartphone, Building } from 'lucide-react';
import { usePendataanController } from '../controllers/usePendataanController';

export default function PendataanView({ alumniDB, setAlumniDB }) {
  const { 
    formData, setFormData, submitData, success, isSubmitting,
    locQuery, setLocQuery, suggestions, isSearchingLoc, showDropdown, setShowDropdown, handleSelectLocation
  } = usePendataanController(alumniDB, setAlumniDB);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-black text-gray-800 mb-2 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-lg"><FileText className="text-white" size={20} /></div>
        Form Tambah Data (Manual)
      </h2>
      <p className="text-sm text-gray-500 mb-6">Gunakan form ini untuk melengkapi 8 Data Wajib Tracer Study jika alumni tidak ada di Excel.</p>
      
      {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm animate-in zoom-in-95">
              <CheckCircle size={20} className="text-emerald-500" /> 
              <div className="flex-1">
                  <p className="font-bold">Berhasil Disimpan!</p>
                  <p className="text-xs">Seluruh 8 Data Wajib dan Koordinat telah masuk ke antrean Master Data.</p>
              </div>
          </div>
      )}
      
      <form onSubmit={submitData} className="bg-white rounded-2xl shadow-xl shadow-indigo-900/5 border border-slate-100 p-6 md:p-8 space-y-8">
        
        {/* BAGIAN 1: IDENTITAS & KONTAK PRIBADI (Tugas No 2 & 3) */}
        <div className="space-y-4">
            <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><User size={14}/> Identitas & Kontak Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nama || ''} onChange={e => setFormData({...formData, nama: e.target.value})} disabled={isSubmitting} /></div>
                
                <div><label className="block text-xs font-bold text-gray-700 mb-1">NIM / KTP</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nim || ''} onChange={e => setFormData({...formData, nim: e.target.value})} disabled={isSubmitting} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Tahun Lulus</label><input required type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.tahun || ''} onChange={e => setFormData({...formData, tahun: e.target.value})} disabled={isSubmitting} /></div>
                
                {/* Syarat No 2 & 3 */}
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Email Aktif</label><input type="email" placeholder="contoh@email.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.email_alumni || ''} onChange={e => setFormData({...formData, email_alumni: e.target.value})} disabled={isSubmitting} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">No HP / WhatsApp</label><input type="text" placeholder="0812xxxxxx" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.no_hp || ''} onChange={e => setFormData({...formData, no_hp: e.target.value})} disabled={isSubmitting} /></div>
                
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Program Studi</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.prodi || ''} onChange={e => setFormData({...formData, prodi: e.target.value})} disabled={isSubmitting} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Kampus Afiliasi</label><input required type="text" placeholder="Misal: Universitas Muhammadiyah Malang" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.kampus || ''} onChange={e => setFormData({...formData, kampus: e.target.value})} disabled={isSubmitting} /></div>
            </div>
        </div>

        {/* BAGIAN 2: SOSIAL MEDIA PRIBADI (Tugas No 1) */}
        <div className="space-y-4">
            <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><Smartphone size={14}/> Sosial Media Pribadi (Link URL)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn</label><input type="url" placeholder="https://linkedin.com/in/..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-blue-600 placeholder-gray-400" value={formData.linkedin_url || ''} onChange={e => setFormData({...formData, linkedin_url: e.target.value})} disabled={isSubmitting} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Instagram</label><input type="url" placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-pink-600 placeholder-gray-400" value={formData.instagram_url || ''} onChange={e => setFormData({...formData, instagram_url: e.target.value})} disabled={isSubmitting} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Facebook</label><input type="url" placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-blue-800 placeholder-gray-400" value={formData.facebook_url || ''} onChange={e => setFormData({...formData, facebook_url: e.target.value})} disabled={isSubmitting} /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">TikTok</label><input type="url" placeholder="https://tiktok.com/@..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black placeholder-gray-400" value={formData.tiktok_url || ''} onChange={e => setFormData({...formData, tiktok_url: e.target.value})} disabled={isSubmitting} /></div>
            </div>
        </div>

        {/* BAGIAN 3: KARIR & INSTANSI (Tugas No 4, 5, 6, 7, 8) */}
        <div className="space-y-4">
            <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><Briefcase size={14}/> Informasi Karir & Tempat Kerja</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Syarat No 7 */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kategori Kerja (Wajib)</label>
                    <select required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formData.kategori_kerja || ''} onChange={e => setFormData({...formData, kategori_kerja: e.target.value})} disabled={isSubmitting}>
                        <option value="">Pilih Kategori...</option>
                        <option value="PNS">PNS / ASN / BUMN</option>
                        <option value="Swasta">Pegawai Swasta</option>
                        <option value="Wirausaha">Wirausaha / Founder</option>
                    </select>
                </div>
                {/* Syarat No 6 */}
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Posisi / Jabatan</label><input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.pekerjaan || ''} onChange={e => setFormData({...formData, pekerjaan: e.target.value})} disabled={isSubmitting} /></div>
                
                {/* Syarat No 4 */}
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Tempat Bekerja (Instansi/Perusahaan)</label><input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.instansi || ''} onChange={e => setFormData({...formData, instansi: e.target.value})} disabled={isSubmitting} /></div>
                {/* Syarat No 8 */}
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Sosmed/Web Tempat Kerja <span className="text-[10px] font-normal text-gray-400">(Opsional)</span></label><input type="text" placeholder="IG / LinkedIn / Web Kantor" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.instansi_sosmed || ''} onChange={e => setFormData({...formData, instansi_sosmed: e.target.value})} disabled={isSubmitting} /></div>
                
                {/* Syarat No 5 */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Tempat Bekerja</label>
                    <textarea placeholder="Alamat lengkap instansi/perusahaan..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-16" value={formData.alamat_bekerja || ''} onChange={e => setFormData({...formData, alamat_bekerja: e.target.value})} disabled={isSubmitting} />
                </div>
            </div>
        </div>
        
        {/* BAGIAN 4: SMART AUTOCOMPLETE LOKASI DOMISILI */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <label className="block text-sm font-black text-gray-800 mb-1 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" /> Pemetaan Koordinat Domisili (Wajib)
          </label>
          <p className="text-xs text-gray-500 mb-4">Ketik nama Kecamatan atau Kota domisili saat ini, lalu <strong>klik hasil yang muncul</strong> di bawahnya.</p>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearchingLoc ? <Loader className="animate-spin text-indigo-500" size={16} /> : <Search className="text-gray-400" size={16} />}
            </div>
            
            <input 
              required 
              type="text" 
              placeholder="Mulai ketik... (Cth: Lowokwaru, Malang)" 
              className={`w-full pl-10 pr-3 py-3 font-bold text-sm border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${showDropdown && suggestions.length > 0 ? 'rounded-t-xl border-b-0' : 'rounded-xl'}`}
              value={locQuery} 
              onChange={e => {
                setLocQuery(e.target.value);
                if (formData.lat || formData.lng) {
                  setFormData({...formData, alamat: '', lat: null, lng: null});
                }
              }} 
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)} 
              disabled={isSubmitting}
            />

            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-b-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-gray-100">
                {suggestions.map((loc, idx) => {
                  const shortName = loc.display_name.split(',')[0].replace(/^(Kecamatan|Kec\.|Kabupaten|Kab\.|Kota)\s+/i, '').trim();
                  return (
                    <li key={idx} className="p-3 hover:bg-indigo-50 cursor-pointer transition-colors flex flex-col" onClick={() => handleSelectLocation(loc)}>
                      <span className="text-sm font-bold text-indigo-900 line-clamp-1">{shortName}</span>
                      <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{loc.display_name}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          
          <div className="mt-3">
            {formData.lat ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle size={14} /> Koordinat Terkunci: {formData.lat}, {formData.lng}
              </span>
            ) : (
              <span className="text-xs text-amber-600 italic font-medium flex items-center gap-1">
                * Wajib memilih lokasi dari daftar rekomendasi.
              </span>
            )}
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting || !formData.lat} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black uppercase tracking-widest py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed active:scale-[0.98] shadow-md"
        >
          {isSubmitting ? <><Loader className="animate-spin" size={18} /> Menyimpan...</> : 'Kirim Ke Master Data'}
        </button>
      </form>
    </div>
  );
}