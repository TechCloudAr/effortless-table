import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Users, TrendingUp, Clock, Receipt, DollarSign, Plus, Minus, Download, MapPin } from 'lucide-react';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useSalesData } from '@/hooks/useSalesData';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TableInfo {
  number: number;
  ordersCount: number;
  totalRevenue: number;
  avgTicket: number;
  isOccupied: boolean;
  activeOrders: number;
}

interface QrTarget {
  tableNum: number;
  branchId: string;
  branchName: string;
}

export default function AdminTables() {
  const { stats, loading } = useSalesData();
  const { restaurant } = useRestaurant();
  const { restaurantId } = useAuth();
  const { activeBranchId, branches, refetch: refetchBranches } = useBranch();
  const [qrDialog, setQrDialog] = useState<QrTarget | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  // Sessions keyed by "branchId:tableNumber"
  const [activeSessions, setActiveSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!restaurantId) return;

    async function fetchSessions() {
      let query = supabase
        .from('table_sessions')
        .select('table_number, branch_id')
        .eq('restaurant_id', restaurantId!)
        .eq('is_active', true);
      if (activeBranchId) query = query.eq('branch_id', activeBranchId);
      const { data } = await query;
      const map: Record<string, boolean> = {};
      data?.forEach(s => {
        if (s.branch_id) map[`${s.branch_id}:${s.table_number}`] = true;
      });
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

  const getTableUrl = (branchId: string, tableNum: number) =>
    `${baseUrl}/mesa/${restaurant.id}/${branchId}/${tableNum}`;

  // Filter branches to display
  const displayBranches = useMemo(() => {
    if (activeBranchId) return branches.filter(b => b.id === activeBranchId);
    return branches.filter(b => b.is_active);
  }, [branches, activeBranchId]);

  // Build table data per branch
  const branchTableData = useMemo(() => {
    const byTable = stats.ordersByTable;
    const ordersByBranch = stats.ordersByBranch || {};

    return displayBranches.map(branch => {
      const branchOrders = ordersByBranch[branch.id] || [];
      // Group branch orders by table number
      const branchOrdersByTable: Record<number, typeof branchOrders> = {};
      branchOrders.forEach(o => {
        const tn = o.table_number;
        if (!branchOrdersByTable[tn]) branchOrdersByTable[tn] = [];
        branchOrdersByTable[tn].push(o);
      });

      const tables: TableInfo[] = Array.from({ length: branch.table_count }, (_, i) => {
        const num = i + 1;
        const orders = branchOrdersByTable[num] || [];
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
        const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
        const activeOrders = orders.filter(o =>
          ['nuevo', 'preparing', 'preparando', 'ready', 'listo'].includes(o.status)
          && (Date.now() - new Date(o.created_at).getTime()) < 4 * 3600000
        );
        const isOccupied = activeSessions[`${branch.id}:${num}`] || activeOrders.length > 0;

        return { number: num, ordersCount: orders.length, totalRevenue, avgTicket, isOccupied, activeOrders: activeOrders.length };
      });

      const occupiedCount = tables.filter(t => t.isOccupied).length;

      return { branch, tables, occupiedCount };
    });
  }, [displayBranches, stats, activeSessions]);

  // Global stats across all displayed branches
  const globalStats = useMemo(() => {
    const allTables = branchTableData.flatMap(b => b.tables);
    const totalTablesCount = allTables.length;
    const occupiedTables = allTables.filter(t => t.isOccupied).length;
    return {
      totalOrders: stats.totalOrders,
      totalRev: stats.totalRevenue,
      avgTicket: Math.round(stats.avgTicket),
      totalTables: totalTablesCount,
      occupiedTables,
    };
  }, [stats, branchTableData]);

  const updateBranchTableCount = useCallback(async (branchId: string, delta: number) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    const newCount = Math.max(1, Math.min(50, branch.table_count + delta));
    if (newCount === branch.table_count) return;
    await supabase.from('branches').update({ table_count: newCount }).eq('id', branchId);
    refetchBranches();
  }, [branches, refetchBranches]);

  const downloadQR = (branchId: string, tableNum: number, branchName: string) => {
    const svg = document.getElementById(`qr-download-${branchId}-${tableNum}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 750;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 750);
      ctx.drawImage(img, 50, 50, 500, 500);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Mesa ${tableNum}`, 300, 620);
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(branchName, 300, 660);
      ctx.font = '18px sans-serif';
      ctx.fillText(restaurant.name, 300, 695);
      const link = document.createElement('a');
      link.download = `mesa-${tableNum}-${branchName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
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
            {displayBranches.length > 1 && ` · ${displayBranches.length} sucursales`}
          </p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pedidos totales', value: globalStats.totalOrders, icon: Receipt },
          { label: 'Facturación', value: `$${globalStats.totalRev.toLocaleString()}`, icon: DollarSign },
          { label: 'Ticket promedio', value: `$${globalStats.avgTicket}`, icon: TrendingUp },
          { label: 'Mesas ocupadas', value: `${globalStats.occupiedTables}/${globalStats.totalTables}`, icon: Clock },
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

      {/* Tables grouped by branch */}
      {branchTableData.map(({ branch, tables, occupiedCount }) => (
        <div key={branch.id} className="mb-8">
          {/* Branch header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-bold text-lg">{branch.name}</h2>
              <Badge variant="outline" className="text-[10px]">
                {occupiedCount}/{tables.length} ocupadas
              </Badge>
            </div>
            <div className="flex items-center gap-2 bg-card rounded-lg border border-border px-2 py-1">
              <button
                onClick={() => updateBranchTableCount(branch.id, -1)}
                className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-heading font-bold text-sm w-6 text-center">{branch.table_count}</span>
              <button
                onClick={() => updateBranchTableCount(branch.id, 1)}
                className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Table cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tables.map(table => (
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
                  <button
                    onClick={() => setQrDialog({ tableNum: table.number, branchId: branch.id, branchName: branch.name })}
                    className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    <QrCode className="h-3 w-3" /> QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* QR Dialog */}
      <Dialog open={qrDialog !== null} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-center">
              Mesa {qrDialog?.tableNum} — {qrDialog?.branchName}
            </DialogTitle>
          </DialogHeader>
          {qrDialog !== null && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-xl" ref={qrRef}>
                <QRCodeSVG
                  id={`qr-download-${qrDialog.branchId}-${qrDialog.tableNum}`}
                  value={getTableUrl(qrDialog.branchId, qrDialog.tableNum)}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-muted-foreground text-center break-all">
                {getTableUrl(qrDialog.branchId, qrDialog.tableNum)}
              </p>
              <p className="text-sm text-muted-foreground text-center">Imprimí este QR y colocalo en la mesa.</p>
              <Button
                onClick={() => downloadQR(qrDialog.branchId, qrDialog.tableNum, qrDialog.branchName)}
                className="w-full gradient-primary font-heading"
              >
                <Download className="mr-2 h-4 w-4" /> Descargar QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
