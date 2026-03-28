import { TrendingUp, ShoppingBag, Clock, Users, DollarSign, ChefHat } from 'lucide-react';
import { demoOrders, tables, menuItems } from '@/data/mockData';

const stats = [
  { label: 'Pedidos hoy', value: '47', icon: ShoppingBag, change: '+12%', color: 'text-primary' },
  { label: 'Ticket promedio', value: '$342', icon: DollarSign, change: '+5%', color: 'text-success' },
  { label: 'Tiempo medio', value: '14 min', icon: Clock, change: '-8%', color: 'text-info' },
  { label: 'Mesas activas', value: `${tables.filter(t => t.status === 'occupied').length}/${tables.length}`, icon: Users, change: '', color: 'text-warning' },
];

const topProducts = [
  { name: 'Combo Fuego', orders: 23, revenue: '$5,727' },
  { name: 'Burger Clásica', orders: 18, revenue: '$3,402' },
  { name: 'Nachos Supremos', orders: 15, revenue: '$2,235' },
  { name: 'Tacos al Pastor', orders: 14, revenue: '$2,226' },
  { name: 'Churros con Chocolate', orders: 12, revenue: '$1,068' },
];

export default function AdminDashboard() {
  const activeOrders = demoOrders.filter(o => o.status !== 'delivered');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Fuego & Sazón — Resumen del día</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              {stat.change && (
                <span className="text-xs text-success font-medium flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />{stat.change}
                </span>
              )}
            </div>
            <p className="font-heading font-bold text-xl">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Orders */}
        <div className="bg-card rounded-xl p-5 shadow-card">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" /> Pedidos activos
          </h2>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-heading font-semibold text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">Mesa {order.tableNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    order.status === 'received' ? 'bg-info/10 text-info' :
                    order.status === 'preparing' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    {order.status === 'received' ? 'Recibido' : order.status === 'preparing' ? 'Preparando' : 'Listo'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">${order.total.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl p-5 shadow-card">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Productos más vendidos
          </h2>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="font-heading font-bold text-sm text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.orders} pedidos</p>
                </div>
                <span className="font-heading font-semibold text-sm">{product.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
