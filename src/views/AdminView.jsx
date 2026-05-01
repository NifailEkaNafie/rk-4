import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAdminController } from '../controllers/useAdminController';

export default function AdminView({ alumniDB, setAlumniDB }) {
  const { pendingData, verifyAlumni } = useAdminController(alumniDB, setAlumniDB);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><ShieldCheck className="text-blue-600" /> Dashboard Verifikasi Admin</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="px-6 py-4 font-semibold">Nama / NIM</th><th className="px-6 py-4 font-semibold">Instansi</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
          </thead>
          <tbody>
            {pendingData.length > 0 ? pendingData.map(item => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="px-6 py-4 font-bold">{item.nama} <br/><span className="font-normal text-xs">{item.nim}</span></td>
                <td className="px-6 py-4">{item.instansi}</td>
                <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full">{item.status}</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => verifyAlumni(item.id, true)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-xs font-bold">Valid</button>
                  <button onClick={() => verifyAlumni(item.id, false)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-xs font-bold">Tolak</button>
                </td>
              </tr>
            )) : <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Tidak ada antrean pendataan baru.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
