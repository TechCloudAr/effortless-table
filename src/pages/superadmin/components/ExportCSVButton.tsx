import { Download } from 'lucide-react';

interface ExportCSVButtonProps {
  headers: string[];
  rows: (string | number)[][];
  filename?: string;
}

export default function ExportCSVButton({ headers, rows, filename = 'export.csv' }: ExportCSVButtonProps) {
  const handleExport = () => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace('.csv', '')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#6b7280] hover:text-[#111110] bg-white transition-colors"
      style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}
    >
      <Download className="h-3.5 w-3.5" />
      CSV
    </button>
  );
}
