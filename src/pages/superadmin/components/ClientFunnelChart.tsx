import { useNavigate } from 'react-router-dom';

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

interface ClientFunnelChartProps {
  restaurants: any[];
  orders: any[];
}

export default function ClientFunnelChart({ restaurants, orders }: ClientFunnelChartProps) {
  const navigate = useNavigate();

  const totalRegistered = restaurants.length;
  // Restaurants with at least 1 branch (proxy for QR active)
  const withQR = restaurants.filter(r => true).length; // all have default branch
  const withOrders = restaurants.filter(r => orders.some(o => o.restaurant_id === r.id)).length;
  const paying = 0; // No billing yet

  const stages: FunnelStage[] = [
    { label: 'Registrados', count: totalRegistered, color: '#f97316' },
    { label: 'Con QR activo', count: withQR, color: '#f97316' },
    { label: 'Con pedidos', count: withOrders, color: '#f97316' },
    { label: 'Pagando', count: paying, color: '#f97316' },
  ];

  const max = Math.max(totalRegistered, 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const prev = i === 0 ? stage.count : stages[i - 1].count;
        const pct = prev > 0 ? Math.round((stage.count / prev) * 100) : 0;
        const widthPct = Math.max((stage.count / max) * 100, 2);

        return (
          <button
            key={stage.label}
            onClick={() => navigate('/superadmin/restaurantes')}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-muted-foreground w-4">{i + 1}</span>
                <span className="text-xs font-medium">{stage.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stage.count}</span>
                {i > 0 && (
                  <span className="text-[10px] text-muted-foreground">{pct}%</span>
                )}
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all group-hover:opacity-80"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                  opacity: 1 - i * 0.2,
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
