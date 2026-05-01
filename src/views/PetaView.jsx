import React from 'react';
import { MapPin, Filter } from 'lucide-react';
import { usePetaController } from '../controllers/usePetaController';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const createCustomIcon = (city) => {
  return L.divIcon({
    className: 'custom-pin-container',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-md group-hover:scale-110 transition-transform">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <div class="mt-1 bg-white/95 text-blue-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md border border-blue-200 flex items-center gap-1.5 whitespace-nowrap">
          <span class="capitalize">${city.nama}</span>
          <span class="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] leading-none">
            ${city.jumlah}
          </span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0], 
    popupAnchor: [0, -45] 
  });
};

export default function PetaView({ alumniDB = [] }) {
  const { filterKampus, setFilterKampus, aggregatedMapData, availableCampuses } = usePetaController(alumniDB);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MapPin className="text-red-500" /> Peta Sebaran Alumni
      </h2>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <Filter className="text-gray-400" size={20} />
        <select 
          className="flex-1 border-none focus:ring-0 outline-none text-gray-700 font-medium cursor-pointer bg-transparent" 
          value={filterKampus} 
          onChange={(e) => setFilterKampus(e.target.value)} 
        >
          <option value="">Lihat Semua Kampus</option>
          {availableCampuses.map((kampus, idx) => (
            <option key={idx} value={kampus}>{kampus}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner relative z-0">
          
          <style>{`
            .custom-pin-container { background: transparent; border: none; }
            .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; }
          `}</style>

          <MapContainer 
            center={[-2.5, 118.0]} 
            zoom={5} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {aggregatedMapData.map((city, idx) => (
              <Marker 
                key={idx} 
                position={[city.lat, city.lng]}
                icon={createCustomIcon(city)}
              >
                <Popup>
                  <div className="text-center min-w-[140px] p-1">
                    <strong className="text-blue-700 capitalize text-lg block mb-1 border-b pb-1 border-gray-100">
                      {city.nama}
                    </strong>
                    <div className="text-gray-600 font-medium text-sm mt-2">
                      Total: <span className="text-red-600 font-bold">{city.jumlah} Alumni</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 italic">
                      Koordinat: ${city.lat.toFixed(3)}, ${city.lng.toFixed(3)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Lokasi Akurat dari Database</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
            <span>Angka menunjukkan jumlah alumni di titik tersebut</span>
          </div>
        </div>
      </div>
    </div>
  );
}
