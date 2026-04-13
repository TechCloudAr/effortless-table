export function formatARS(value: number): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function isTestAccount(_name: string): boolean {
  return false;
}

export const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  pending_payment: 'Pago pendiente',
  paid: 'Pagado',
  pagado: 'Pagado',
  preparing: 'Preparando',
  preparando: 'Preparando',
  ready: 'Listo',
  listo: 'Listo',
  delivered: 'Entregado',
  entregado: 'Entregado',
  cancelled: 'Cancelado',
  cancelado: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-500/10 text-blue-600',
  pending_payment: 'bg-yellow-500/10 text-yellow-600',
  paid: 'bg-primary/10 text-primary',
  pagado: 'bg-primary/10 text-primary',
  preparing: 'bg-orange-500/10 text-orange-600',
  preparando: 'bg-orange-500/10 text-orange-600',
  ready: 'bg-green-500/10 text-green-600',
  listo: 'bg-green-500/10 text-green-600',
  delivered: 'bg-muted text-muted-foreground',
  entregado: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-600',
  cancelado: 'bg-red-500/10 text-red-600',
};

export const ACTIVE_STATUSES = ['nuevo', 'pending_payment', 'paid', 'pagado', 'preparing', 'preparando', 'ready', 'listo'];
