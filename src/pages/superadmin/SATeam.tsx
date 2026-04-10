import { useState, useEffect } from 'react';
import { Users, Shield, ShoppingBag, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  superadmin: { label: 'Full access', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: Shield, desc: 'Acceso total. Ve todo, hace todo.' },
  owner: { label: 'Owner', color: '#f97316', bg: 'rgba(249,115,22,0.08)', icon: ShoppingBag, desc: 'Gestiona su restaurante.' },
};

export default function SATeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data: roles } = await supabase.from('user_roles').select('*');
      if (!roles) { setLoading(false); return; }

      const { data: profiles } = await supabase.from('profiles').select('*');

      const merged = roles.map(r => {
        const profile = profiles?.find(p => p.user_id === r.user_id);
        return {
          user_id: r.user_id,
          role: r.role,
          full_name: profile?.full_name || undefined,
        };
      });
      setMembers(merged);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="py-20 text-center text-[12px] text-[#6b7280]">Cargando equipo...</div>;

  const superadmins = members.filter(m => m.role === 'superadmin');
  const owners = members.filter(m => m.role === 'owner');

  return (
    <div className="space-y-6">
      <h1 className="text-[15px] font-medium text-[#111110]">Equipo y roles</h1>

      {/* Roles explanation */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { title: 'Super Admin (vos)', desc: 'Acceso total. Ve todo, hace todo.', badge: 'Full access', badgeColor: '#dc2626' },
          { title: 'Agente de ventas', desc: 'Ve clientes y trials. No ve facturación.', badge: 'Ventas', badgeColor: '#f97316' },
          { title: 'Agente de soporte', desc: 'Ve pedidos y tickets. No toca configuración.', badge: 'Soporte', badgeColor: '#7c3aed' },
        ].map(role => (
          <div key={role.title} className="bg-white rounded-lg p-4 flex items-start justify-between" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div>
              <p className="text-[12px] font-medium text-[#111110] mb-1">{role.title}</p>
              <p className="text-[11px] text-[#6b7280]">{role.desc}</p>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: role.badgeColor, backgroundColor: `${role.badgeColor}11` }}>
              {role.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Team list */}
      <div className="bg-white rounded-lg" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
          <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em]">
            {members.length} miembros · {superadmins.length} admins · {owners.length} owners
          </p>
        </div>
        <div className="divide-y" style={{ '--tw-divide-opacity': '0.08' } as any}>
          {members.map(m => {
            const cfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.owner;
            return (
              <div key={m.user_id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#f8f8f7] flex items-center justify-center text-[11px] font-medium text-[#6b7280]">
                    {(m.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#111110]">{m.full_name || 'Sin nombre'}</p>
                    <p className="text-[10px] text-[#9ca3af]">{m.user_id.slice(0, 8)}...</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
