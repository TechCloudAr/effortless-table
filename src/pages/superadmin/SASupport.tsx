import { MessageCircle } from 'lucide-react';

export default function SASupport() {
  return (
    <div className="space-y-6">
      <h1 className="text-[15px] font-medium text-[#111110]">Soporte y CRM</h1>

      <div className="bg-white rounded-lg p-8 text-center" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#f8f8f7] flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-[#9ca3af]" />
          </div>
          <h2 className="text-[13px] font-medium text-[#111110]">Sin tickets de soporte aún</h2>
          <p className="text-[12px] text-[#6b7280]">
            Cuando tus restaurantes necesiten ayuda, sus tickets aparecerán acá. También vas a poder gestionar notas internas y pipeline de ventas.
          </p>
        </div>
      </div>
    </div>
  );
}
