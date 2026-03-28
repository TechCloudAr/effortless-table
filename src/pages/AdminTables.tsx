import { tables } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { QrCode, Users } from 'lucide-react';

const statusLabel: Record<string, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
};

const statusColor: Record<string, string> = {
  available: 'bg-success/10 text-success',
  occupied: 'bg-warning/10 text-warning',
  reserved: 'bg-info/10 text-info',
};

export default function AdminTables() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Mesas y QR</h1>
        <p className="text-sm text-muted-foreground">
          {tables.filter(t => t.status === 'occupied').length} ocupadas de {tables.length} mesas
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map(table => (
          <div key={table.id} className="bg-card rounded-xl p-4 shadow-card text-center">
            <div className="font-heading font-bold text-2xl mb-1">{table.number}</div>
            <Badge variant="secondary" className={`text-[10px] mb-3 ${statusColor[table.status]}`}>
              {statusLabel[table.status]}
            </Badge>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{table.capacity}</span>
              <button className="flex items-center gap-1 text-primary hover:underline">
                <QrCode className="h-3 w-3" /> QR
              </button>
            </div>
            {table.currentOrderId && (
              <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">
                {table.currentOrderId}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
