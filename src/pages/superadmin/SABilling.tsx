import { DollarSign, CreditCard, Repeat, TrendingUp } from 'lucide-react';
import SAMetricCard from './components/SAMetricCard';

export default function SABilling() {
  return (
    <div className="space-y-6">
      <h1 className="text-[15px] font-medium text-[#111110]">Facturación</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SAMetricCard label="MRR" value="$0" icon={DollarSign} iconColor="#16a34a" iconBg="rgba(22,163,74,0.1)" trend="Sin datos aún" />
        <SAMetricCard label="ARR" value="$0" icon={TrendingUp} iconColor="#2563eb" iconBg="rgba(37,99,235,0.1)" trend="MRR × 12" />
        <SAMetricCard label="Churn rate" value="0%" icon={Repeat} iconColor="#dc2626" iconBg="rgba(220,38,38,0.1)" trend="Target: <3%" />
        <SAMetricCard label="LTV promedio" value="—" icon={CreditCard} iconColor="#f97316" trend="Sin datos aún" />
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-lg p-8 text-center" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#f8f8f7] flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-[#9ca3af]" />
          </div>
          <h2 className="text-[13px] font-medium text-[#111110]">Todavía no cobrás a tus restaurantes</h2>
          <p className="text-[12px] text-[#6b7280]">
            Configurá tu modelo de cobro para empezar a trackear MRR, churn y revenue.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-lg p-4 text-left" style={{ border: '1.5px dashed rgba(0,0,0,0.12)' }}>
              <p className="text-[12px] font-medium text-[#111110] mb-1">Suscripción mensual</p>
              <p className="text-[11px] text-[#6b7280]">Cobrás un fee fijo por mes a cada restaurante</p>
            </div>
            <div className="rounded-lg p-4 text-left" style={{ border: '1.5px dashed rgba(0,0,0,0.12)' }}>
              <p className="text-[12px] font-medium text-[#111110] mb-1">Comisión por pedido</p>
              <p className="text-[11px] text-[#6b7280]">Cobrás un % de cada transacción procesada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
