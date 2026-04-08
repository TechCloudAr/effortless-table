import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    toast.success('¡Cuenta creada! Revisá tu email para confirmar tu cuenta antes de iniciar sesión.');
    setLoading(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-14 w-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Flame className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Registrá tu restaurante en Mesa Digital</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="font-heading text-sm">Tu nombre</Label>
            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ej: Juan Pérez" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="restaurantName" className="font-heading text-sm">Nombre del restaurante</Label>
            <Input id="restaurantName" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} placeholder="Ej: La Parrilla de Juan" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-heading text-sm">Correo electrónico</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-heading text-sm">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary font-heading font-semibold h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Crear cuenta
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link to="/admin" className="text-primary font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
