import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Users, TrendingUp, Clock, Receipt, DollarSign, Plus, Minus, Download } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useSalesData } from '@/hooks/useSalesData';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminTables() {
  const { stats, loading } = useSalesData();
  const { restaurant } = useRestaurant();
  const { restaurantId } = useAuth();
  const { activeBranchId } = useBranch();
  const [totalTables, setTotalTables] = useState(10);
  const [qrDialog, setQrDialog] = useState<number | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [activeSessions, setActiveSessions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!restaurantId) return;

    async function fetchSessions() {
      let query = supabase
        .from('table_sessions')
        .select('table_number')
        .eq('restaurant_id', restaurantId!)
        .eq('is_active', true);
      if (activeBranchId) query = query.eq('branch_id', activeBranchId);
      const { data } = await query;
      const map: Record<number, boolean> = {};
      data?.forEach(s => { map[s.table_number] = true; });
      setActiveSessions(map);
    }
    fetchSessions();

    const channel = supabase
      .channel('table-sessions-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'table_sessions',
        filter: `restaurant_id=eq.${restaurantId}`,
      }, () => fetchSessions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, activeBranchId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Build QR URL with branch if a specific branch is selected, otherwise use first branch
  const getTableUrl = (tableNum: number) => {
    const branch = activeBranchId || (branches.length > 0 ? branches[0].id : null);
    if (branch) {
      return `${baseUrl}/mesa/${restaurant.id}/${branch}/${tableNum}`;
    }
    return `${baseUrl}/mesa/${restaurant.id}/${tableNum}`;
  };

  const tableData = useMemo(() => {
    const byTable = stats.ordersByTable;

    return Array.from({ length: totalTables }, (_, i) => {
      const num = i + 1;
      const orders = byTable[num] || [];
      const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
      const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
      const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
      const isOccupied = activeSessions[num] || activeOrders.length > 0;

      return { number: num, ordersCount: orders.length, totalRevenue, avgTicket, isOccupied, activeOrders: activeOrders.length };
    });
  }, [stats, totalTables, activeSessions]);

  const globalStats = useMemo(() => {
    const occupiedTables = tableData.filter(t => t.isOccupied).length;
    return {
      totalOrders: stats.totalOrders,
      totalRev: stats.totalRevenue,
      avgTicket: Math.round(stats.avgTicket),
      totalTables,
      occupiedTables,
    };
  }, [stats, tableData, totalTables]);

  const downloadQR = (tableNum: number) => {
    const svg = document.getElementById(`qr-download-${tableNum}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 700;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 700);
      ctx.drawImage(img, 50, 50, 500, 500);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Mesa ${tableNum}`, 300, 620);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(restaurant.name, 300, 660);
      const link = document.createElement('a');
      link.download = `mesa-${tableNum}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos de mesas...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mesas y Performance</h1>
          <p className="text-sm text-muted-foreground">
            {globalStats.occupiedTables} ocupadas de {globalStats.totalTables} mesas
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg border border-border px-2 py-1">
          <button onClick={() => setTotalTables(prev => Math.max(1, prev - 1))} className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="font-heading font-bold text-sm w-6 text-center">{totalTables}</span>
          <button onClick={() => setTotalTables(prev => Math.min(50, prev + 1))} className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pedidos totales', value: globalStats.totalOrders, icon: Receipt },
          { label: 'Facturación', value: `$${globalStats.totalRev.toLocaleString()}`, icon: DollarSign },
          { label: 'Ticket promedio', value: `$${globalStats.avgTicket}`, icon: TrendingUp },
          { label: 'Mesas con pedidos', value: tableData.filter(t => t.ordersCount > 0).length, icon: Clock },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-heading font-bold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tableData.map(table => (
          <div key={table.number} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-bold text-2xl">{table.number}</span>
              <Badge variant="secondary" className={`text-[10px] ${table.isOccupied ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                {table.isOccupied ? 'Ocupada' : 'Disponible'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-3">
              <div><span className="text-muted-foreground">Pedidos</span><p className="font-heading font-semibold">{table.ordersCount}</p></div>
              <div><span className="text-muted-foreground">Ticket prom.</span><p className="font-heading font-semibold">${table.avgTicket}</p></div>
              <div><span className="text-muted-foreground">Facturación</span><p className="font-heading font-semibold">${table.totalRevenue.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Activos</span><p className="font-heading font-semibold">{table.activeOrders}</p></div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> Mesa {table.number}</span>
              <button onClick={() => setQrDialog(table.number)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                <QrCode className="h-3 w-3" /> QR
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={qrDialog !== null} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-center">Mesa {qrDialog} — Código QR</DialogTitle>
          </DialogHeader>
          {qrDialog !== null && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-xl" ref={qrRef}>
                <QRCodeSVG id={`qr-download-${qrDialog}`} value={`${baseUrl}/mesa/${restaurant.id}/${qrDialog}`} size={240} level="H" includeMargin />
              </div>
              <p className="text-xs text-muted-foreground text-center break-all">{baseUrl}/mesa/{restaurant.id}/{qrDialog}</p>
              <p className="text-sm text-muted-foreground text-center">Imprimí este QR y colocalo en la mesa.</p>
              <Button onClick={() => downloadQR(qrDialog)} className="w-full gradient-primary font-heading">
                <Download className="mr-2 h-4 w-4" /> Descargar QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
