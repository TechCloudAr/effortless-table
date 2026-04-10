import { LucideIcon } from 'lucide-react';

interface SAMetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
  trendColor?: string;
  pulse?: boolean;
}

export default function SAMetricCard({
  label,
  value,
  icon: Icon,
  iconColor = '#f97316',
  iconBg = 'rgba(249,115,22,0.1)',
  trend,
  trendColor = '#6b7280',
  pulse,
}: SAMetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-4" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-[26px] w-[26px] rounded-[7px] flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
        </div>
        {pulse && (
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
      <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-1">{label}</p>
      <p className="text-[22px] font-medium text-[#111110] leading-tight">{value}</p>
      {trend && (
        <p className="text-[11px] mt-1" style={{ color: trendColor }}>{trend}</p>
      )}
    </div>
  );
}
