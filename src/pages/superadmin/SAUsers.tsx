import { useState, useEffect } from 'react';
import { Users, ShieldCheck, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  user_id: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

export default function SAUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role, created_at');
      if (!roles) { setLoading(false); return; }

      const userIds = [...new Set(roles.map(r => r.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name');

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name]));

      const merged: UserWithRole[] = roles.map(r => ({
        user_id: r.user_id,
        role: r.role,
        full_name: profileMap.get(r.user_id) || null,
        created_at: r.created_at,
      }));

      setUsers(merged);
      setLoading(false);
    }
    load();
  }, []);

  const superadmins = users.filter(u => u.role === 'superadmin');
  const owners = users.filter(u => u.role === 'owner');

  if (loading) return <div className="flex items-center justify-center py-20"><span className="text-muted-foreground text-sm">Cargando...</span></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-xl flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" /> Usuarios
      </h1>

      {/* Superadmins */}
      <div className="bg-card rounded-xl p-4 border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" /> Super Admins
        </h2>
        {superadmins.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguno</p>
        ) : (
          <div className="space-y-2">
            {superadmins.map(u => (
              <div key={u.user_id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{u.full_name || u.user_id.slice(0, 8)}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString('es-AR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Owners */}
      <div className="bg-card rounded-xl p-4 border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-1.5">
          <Store className="h-4 w-4 text-primary" /> Owners ({owners.length})
        </h2>
        {owners.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguno</p>
        ) : (
          <div className="space-y-2">
            {owners.map(u => (
              <div key={u.user_id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{u.full_name || u.user_id.slice(0, 8)}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString('es-AR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
