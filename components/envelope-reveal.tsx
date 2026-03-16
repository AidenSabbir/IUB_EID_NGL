"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Download, Layout, Image as ImageIcon, Share2 } from "lucide-react";
import { EID_CARDS } from "@/lib/eid-cards";
import { EidCard } from "@/components/eid-card";
import { PostcardPreview } from "@/components/postcard-preview";
import { Label } from "@/components/ui/label";
import { toPng } from "html-to-image";
import download from "downloadjs";
import { cn } from "@/lib/utils";

interface EnvelopeRevealProps {
  senderName: string;
  content: string;
  original_message_id?: string;
  sender_id?: string | null;
  sender_username?: string | null;
  onClose?: () => void;
  isUnlocked?: boolean;
  createdAt?: string;
}

export function EnvelopeReveal({
  senderName,
  content,
  onClose,
  isUnlocked = true,
  createdAt
}: EnvelopeRevealProps) {
  const [viewMode, setViewMode] = useState<'card' | 'postcard'>('card');
  const [canShare, setCanShare] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !!navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      download(dataUrl, `eid-wish-${senderName.replace(/\s+/g, '-').toLowerCase()}.png`);
    } catch (err) {
      console.error('Download failed', err);
    }
  }, [senderName]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `eid-wish-${senderName.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

      if (navigator.share) {
        const shareData: ShareData = {
          title: `Eid Wish from ${senderName}`,
          text: `Check out this Eid wish I received from ${senderName}!`,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }

        await navigator.share(shareData);
      } else {
        alert("Sharing is not supported on this browser. Please use the download button to save and share the image manually.");
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  }, [senderName]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="message"
        className="w-full max-w-xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="rounded-sm border border-primary/40 shadow-2xl overflow-hidden relative bg-card"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 text-primary/70 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="h-2 bg-gradient-to-r from-primary/70 via-primary to-primary/70" />

          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="p-3 md:p-6 relative z-10">
            <div
              className="mb-5 pb-2 border-b border-primary/30 flex flex-col items-center text-center"
            >
              <p className="text-muted-foreground mb-1 uppercase tracking-widest font-decorative">From</p>
              <h3 className="text-2xl font-decorative text-primary font-semibold">
                {senderName}
              </h3>
              {createdAt && (
                <p className="text-sm text-muted-foreground mt-2">
                  Date: {new Date(createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              {isUnlocked && (
                <div className="flex items-center space-x-6 mb-6">
                  <button
                    onClick={() => setViewMode('card')}
                    className={cn(
                      "flex flex-col items-center gap-1.5 transition-all",
                      viewMode === 'card' 
                        ? "text-primary scale-110" 
                        : "text-muted-foreground hover:text-primary/70"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full border-2",
                      viewMode === 'card' ? "border-primary bg-primary/5" : "border-transparent"
                    )}>
                      <Layout className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider">Card</span>
                  </button>
                  <div className="w-px h-8 bg-primary/20" />
                  <button
                    onClick={() => setViewMode('postcard')}
                    className={cn(
                      "flex flex-col items-center gap-1.5 transition-all",
                      viewMode === 'postcard' 
                        ? "text-primary scale-110" 
                        : "text-muted-foreground hover:text-primary/70"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full border-2",
                      viewMode === 'postcard' ? "border-primary bg-primary/5" : "border-transparent"
                    )}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider">Postcard</span>
                  </button>
                </div>
              )}

              <div className="relative group w-full flex justify-center pb-4">
                {!isUnlocked ? (() => {
                  let stampId = '1';
                  try {
                    const parsed = JSON.parse(content);
                    if (parsed.stampId) {
                      stampId = parsed.stampId;
                    }
                  } catch {
                  }

                  return (
                    <div className="flex flex-col items-center justify-center space-y-6 w-full py-4 px-4 bg-white rounded-lg shadow-lg">
                      <PostcardPreview
                        stampId={stampId}
                        senderHint={senderName}
                        date={createdAt ? new Date(createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : ''}
                        className="w-full max-w-md mx-auto"
                      />
                      <div className="text-center text-primary/80 mt-4 flex flex-col items-center pb-4">
                        <Lock className="w-5 h-5 mb-2" />
                        <p className="text-sm font-decorative tracking-wide text-primary/90 font-medium">Content Sealed until Eid</p>
                        <p className="text-xs text-primary/80 text-center max-w-xs mt-2">
                          Come back on Eid to reveal the full message and the sender&apos;s identity.
                        </p>
                      </div>
                    </div>
                  );
                })() : (() => {
                  try {
                    const parsed = JSON.parse(content);
                    
                    if (viewMode === 'postcard') {
                      return (
                        <div className="relative w-full max-w-md mx-auto flex justify-center group">
                          <div ref={cardRef} className="w-full">
                            <PostcardPreview
                              stampId={parsed.stampId || '1'}
                              senderHint={senderName}
                              date={createdAt ? new Date(createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : ''}
                              content={parsed.text || content}
                              className="w-full mx-auto"
                            />
                          </div>
                          <div className="absolute bottom-3 right-3 flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                            <button
                              onClick={handleShare}
                              className="p-2.5 bg-white/90 text-primary rounded-full shadow-md border border-primary/20 hover:bg-white hover:scale-105 transition-all"
                              title="Share Wish"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleDownload}
                              className="p-2.5 bg-white/90 text-primary rounded-full shadow-md border border-primary/20 hover:bg-white hover:scale-105 transition-all"
                              title="Download Wish"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (parsed.type === 'eid-card') {
                      const cardConfig = EID_CARDS.find(c => c.id === parsed.cardId) || EID_CARDS[0];
                      return (
                        <div className="relative w-full max-w-md mx-auto group">
                          <div ref={cardRef} className="w-full">
                            <EidCard
                              cardConfig={cardConfig}
                              message={parsed.text}
                              fontSize={parsed.fontSize}
                              className="shadow-xl"
                            />
                          </div>
                          <div className="absolute bottom-3 right-3 flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                            <button
                              onClick={handleShare}
                              className="p-2.5 bg-white/90 text-primary rounded-full shadow-md border border-primary/20 hover:bg-white hover:scale-105 transition-all"
                              title="Share Wish"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleDownload}
                              className="p-2.5 bg-white/90 text-primary rounded-full shadow-md border border-primary/20 hover:bg-white hover:scale-105 transition-all"
                              title="Download Wish"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <p className="text-foreground/90 leading-loose font-serif text-lg whitespace-pre-wrap text-center px-8 py-12 bg-white rounded-lg shadow-lg">
                        {content}
                      </p>
                    );
                  } catch {
                    return (
                      <p className="text-foreground/90 leading-loose font-serif text-lg whitespace-pre-wrap text-center px-8 py-12 bg-white rounded-lg shadow-lg">
                        {content}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}