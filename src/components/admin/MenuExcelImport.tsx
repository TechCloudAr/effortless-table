import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface MenuExcelImportProps {
  onSuccess?: () => void;
}

export default function MenuExcelImport({ onSuccess }: MenuExcelImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    toast.info('Importación Excel próximamente disponible.');
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="gap-2">
      <Upload className="h-4 w-4" />
      Importar Excel
    </Button>
  );
}
