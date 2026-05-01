import { useState, useEffect } from 'react';

/**
 * Controller untuk mengelola state dan logika pemetaan sebaran alumni.
 * Menggunakan koordinat asli dari database untuk akurasi maksimal.
 */
export const usePetaController = (alumniDB = []) => {
  const [filterKampus, setFilterKampus] = useState('');
  const [aggregatedMapData, setAggregatedMapData] = useState([]);

  const availableCampuses = [...new Set(alumniDB
    .filter(a => a.status === 'Terverifikasi' && a.kampus)
    .map(a => a.kampus)
  )].sort();

  useEffect(() => {
    const isFilterAll = filterKampus.trim() === '' || filterKampus.toLowerCase() === 'semua';

    
    const filteredAlumni = alumniDB.filter(a => {
      const isVerified = a.status === 'Terverifikasi';
      const hasCoords = a.lat !== undefined && a.lng !== undefined && a.lat !== null;
      const matchesKampus = isFilterAll || a.kampus.toLowerCase().includes(filterKampus.toLowerCase());
      return isVerified && hasCoords && matchesKampus;
    });

    const locationGroups = {};

    filteredAlumni.forEach(alumni => {
      const parts  = alumni.alamat.split(',');
      let cityName = parts[parts.length - 1].trim();
      cityName     = cityName.replace(/(kota|kabupaten|kab\.)/g, '').trim();
      const geoKey = `${alumni.lat},${alumni.lng}`;

      if (!locationGroups[geoKey]) {
        locationGroups[geoKey] = {
          nama: cityName,
          jumlah: 0,
          lat: alumni.lat,
          lng: alumni.lng,
          alumniList: [] 
        };
      }
      locationGroups[geoKey].jumlah += 1;
      locationGroups[geoKey].alumniList.push(alumni.nama);
    });

    setAggregatedMapData(Object.values(locationGroups));
  }, [alumniDB, filterKampus]);

  return { filterKampus, setFilterKampus, aggregatedMapData, availableCampuses };
};
