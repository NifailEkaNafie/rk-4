import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportAlumniToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Tracer Study");
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const finalData = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(finalData, `Tracer_Study_Export.xlsx`);
};