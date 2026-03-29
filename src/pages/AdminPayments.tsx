import { useState } from 'react';
import { CreditCard, Check, ExternalLink, Settings2 } from 'lucide-react';

type Gateway = {
  id: string;
  name: string;
  logo: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  fields: { key: string; label: string; placeholder: string }[];
};

const initialGateways: Gateway[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    logo: '💚',
    description: 'La pasarela más usada en LATAM. Acepta tarjetas, transferencias y billetera digital.',
    enabled: true,
    configured: true,
    fields: [
      { key: 'access_token', label: 'Access Token', placeholder: 'APP_USR-...' },
      { key: 'public_key', label: 'Public Key', placeholder: 'APP_USR-...' },
    ],
  },
  {
    id: 'modo',
    name: 'MODO',
    logo: '🔵',
    description: 'Pagos con QR desde cualquier billetera bancaria argentina.',
    enabled: false,
    configured: false,
    fields: [
      { key: 'store_id', label: 'Store ID', placeholder: 'Tu ID de tienda MODO' },
      { key: 'api_key', label: 'API Key', placeholder: 'Tu API Key de MODO' },
    ],
  },
  {
    id: 'nave',
    name: 'Nave (Naranja X)',
    logo: '🟠',
    description: 'Procesador de pagos de Naranja X. Tarjetas y cuotas.',
    enabled: false,
    configured: false,
    fields: [
      { key: 'merchant_id', label: 'Merchant ID', placeholder: 'Tu Merchant ID' },
      { key: 'secret_key', label: 'Secret Key', placeholder: 'Tu Secret Key' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '💜',
    description: 'Pasarela global. Ideal si operás en múltiples países.',
    enabled: false,
    configured: false,
    fields: [
      { key: 'publishable_key', label: 'Publishable Key', placeholder: 'pk_...' },
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_...' },
    ],
  },
];

export default function AdminPayments() {
  const [gateways, setGateways] = useState(initialGateways);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setGateways(prev => prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" /> Medios de pago
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configurá las pasarelas de pago para tu restaurante</p>
      </div>

      <div className="space-y-3">
        {gateways.map(gw => (
          <div key={gw.id} className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <span className="text-3xl">{gw.logo}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-sm">{gw.name}</h3>
                  {gw.configured && gw.enabled && (
                    <span className="text-[10px] font-medium bg-success/15 text-success px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check className="h-2.5 w-2.5" /> Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{gw.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === gw.id ? null : gw.id)}
                  className="h-8 w-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggle(gw.id)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${gw.enabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${gw.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {expandedId === gw.id && (
              <div className="px-4 pb-4 pt-0 border-t border-border/30">
                <div className="mt-4 space-y-3">
                  {gw.fields.map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
                      <input
                        type="password"
                        placeholder={field.placeholder}
                        className="w-full bg-muted/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
                        defaultValue={gw.configured ? '••••••••••••••••' : ''}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                      Guardar
                    </button>
                    <a
                      href="#"
                      className="px-4 py-2 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> Documentación
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-accent/30 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-heading font-semibold text-foreground mb-1">💡 Tip</p>
        <p>Podés tener múltiples pasarelas activas. El cliente podrá elegir su método preferido al momento de pagar.</p>
      </div>
    </div>
  );
}
