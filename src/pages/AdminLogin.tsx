import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@fuegosazon.com');
  const [password, setPassword] = useState('demo1234');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin/dashboard');
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
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-heading text-sm">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full gradient-primary font-heading font-semibold h-11">
            Iniciar sesión
          </Button>
          <p className="text-xs text-center text-muted-foreground">Demo: admin@fuegosazon.com / demo1234</p>
        </form>
      </div>
    </div>
  );
}
