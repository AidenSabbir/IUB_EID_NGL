import Image from 'next/image';
import { EidCardConfig } from '@/lib/eid-cards';
import { cn } from '@/lib/utils';

interface EidCardProps {
  cardConfig: EidCardConfig;
  message: string;
  className?: string;
  fontSize?: string;
}

export function EidCard({ cardConfig, message, className, fontSize }: EidCardProps) {
  // Convert legacy px values to cqi for responsive scaling. 
  // The original preview container was 240px wide.
  let computedFontSize = fontSize || 'min(6cqi, 2.5rem)';
  if (fontSize && fontSize.endsWith('px')) {
    const pxValue = parseFloat(fontSize);
    if (!isNaN(pxValue)) {
      computedFontSize = `${(pxValue / 2.4).toFixed(2)}cqi`;
    }
  }

  return (
    <div
      className={cn(
        'relative w-full aspect-[4/5] overflow-hidden shadow-xl rounded-xl bg-zinc-100',
        className
      )}
      style={{ containerType: 'inline-size' }}
    >
      <Image
        src={cardConfig.image}
        alt={`Eid Card ${cardConfig.id}`}
        fill
        className="object-cover pointer-events-none"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
      />
      
      <div
        className="absolute flex items-center justify-center p-0.5"
        style={{
          top: cardConfig.rect.top,
          left: cardConfig.rect.left,
          width: cardConfig.rect.width,
          height: cardConfig.rect.height,
        }}
      >
        <p
          className="whitespace-pre-wrap font-medium break-words max-h-full overflow-hidden leading-relaxed"
          style={{
            color: cardConfig.color,
            textAlign: cardConfig.align,
            fontSize: computedFontSize,
            fontFamily: 'var(--font-aref-ruqaa), serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            lineHeight: '1.4',
          }}
        >
          {message || 'Your message here...'}
        </p>
      </div>
    </div>
  );
}
