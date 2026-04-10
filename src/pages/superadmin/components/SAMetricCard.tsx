import { LucideIcon } from 'lucide-react';

interface SAMetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  pulse?: boolean;
}

export default function SAMetricCard({ label, value, icon: Icon, pulse }: SAMetricCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-primary" />
        {pulse && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
      </div>
      <p className="font-heading font-bold text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
