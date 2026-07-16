import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type IconCardProps = {
  icon?: LucideIcon;
  image?: { src: string; alt: string };
  title: string;
  description: string;
  tag?: { label: string; icon: LucideIcon };
  className?: string;
};

export function IconCard({ icon: Icon, image, title, description, tag: Tag, className }: IconCardProps) {
  return (
    <Card className={cn('transition hover:border-primary/40 hover:shadow-md', className)}>
      <CardContent className="pt-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          {image && (
            <Image src={image.src} alt={image.alt} width={24} height={24} className="h-6 w-6 object-contain" />
          )}
        </span>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {Tag && (
          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
            <Tag.icon className="h-3.5 w-3.5" />
            {Tag.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
