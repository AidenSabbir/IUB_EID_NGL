"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { STAMPS } from "@/lib/stamps";

interface PostcardPreviewProps {
  stampId: string;
  senderHint: string;
  date: string;
  className?: string;
}

export function PostcardPreview({ stampId, senderHint, date, className }: PostcardPreviewProps) {
  const config = STAMPS.find((s) => s.id === stampId) || STAMPS[0];

  return (
    <div className={cn("relative w-full overflow-hidden rounded-md shadow-lg bg-stone-100", className)}>
      <Image
        src={config.image}
        alt="Vintage Postcard"
        width={1200}
        height={800}
        className="w-full h-auto object-contain block"
        sizes="(max-width: 768px) 100vw, 800px"
        priority
      />
      <div
        className="absolute flex items-end font-decorative -translate-y-1/2"
        style={{
          top: config.nameRect.top,
          left: config.nameRect.left,
          width: config.nameRect.width,
          height: config.nameRect.height,
          color: config.color,
          fontFamily: config.fontFamily || "inherit",
          fontSize: 'clamp(12px, 2.5vw, 18px)',
          lineHeight: 1.2
        }}
      >
        <span className="truncate border-b border-transparent w-full pb-1 pl-1">
          {senderHint}
        </span>
      </div>
      <div
        className="absolute flex items-end font-decorative -translate-y-1/2"
        style={{
          top: config.dateRect.top,
          left: config.dateRect.left,
          width: config.dateRect.width,
          height: config.dateRect.height,
          color: config.color,
          fontFamily: config.fontFamily || "inherit",
          fontSize: 'clamp(10px, 2vw, 16px)',
          lineHeight: 1.2
        }}
      >
        <span className="truncate border-b border-transparent w-full pb-1 pl-1">
          {date}
        </span>
      </div>
    </div>
  );
}
