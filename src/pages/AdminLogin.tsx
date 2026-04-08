import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  // role is fetched from useAuth below
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, user, role } = useAuth();

  // If already logged in, redirect based on role
  if (user) {
    if (role === 'superadmin') {
      navigate('/superadmin', { replace: true });
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Credenciales inválidas. Revisá tu email y contraseña.'
        : error.message);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-14 w-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Flame className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Mesa Digital</h1>
          <p className="text-sm text-muted-foreground mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-heading text-sm">Correo electrónico</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-heading text-sm">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary font-heading font-semibold h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Iniciar sesión
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            ¿No tenés cuenta?{' '}
            <Link to="/admin/registro" className="text-primary font-semibold hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
