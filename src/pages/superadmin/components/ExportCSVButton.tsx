import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-1" /> CSV
    </Button>
  );
}
