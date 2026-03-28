import type { MenuItem } from '@/types/restaurant';
import { Badge } from '@/components/ui/badge';
import { restaurant } from '@/data/mockData';

const tagColors: Record<string, string> = {
  'más vendido': 'bg-primary text-primary-foreground',
  'nuevo': 'bg-success text-success-foreground',
  'vegano': 'bg-accent text-accent-foreground',
  'picante': 'bg-destructive/10 text-destructive',
  'sin gluten': 'bg-secondary text-secondary-foreground',
  'ahorro': 'bg-warning/15 text-warning-foreground',
};

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="flex gap-3 rounded-lg bg-card p-3 shadow-card text-left w-full transition-all active:scale-[0.98] hover:shadow-elevated"
    >
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        width={96}
        height={96}
        className="h-24 w-24 rounded-md object-cover flex-shrink-0"
      />
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="font-heading font-semibold text-sm leading-tight truncate">{item.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-end justify-between mt-1">
          <span className="font-heading font-bold text-primary text-sm">
            {restaurant.currency}{item.price}
          </span>
          {item.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-end">
              {item.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 font-medium ${tagColors[tag] || ''}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
