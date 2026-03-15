"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";
import { EID_CARDS } from "@/lib/eid-cards";
import { EidCard } from "@/components/eid-card";
import { PostcardPreview } from "@/components/postcard-preview";

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
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key="message"
          className="w-full max-w-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="text-center mb-6"
          >
            <button
              onClick={handleClose}
              className="inline-block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors border border-primary/40 rounded hover:border-primary/60 bg-background/80 backdrop-blur-sm font-medium"
            >
              ← Back to Inbox
            </button>
          </motion.div>

          <div
            className="bg-[#fdfbf7] rounded-sm border border-primary/40 shadow-2xl overflow-hidden relative"
          >
            {/* Decorative top border */}
            <div className="h-2 bg-gradient-to-r from-primary/70 via-primary to-primary/70" />

            {/* Background texture pattern (subtle) */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="p-8 md:p-12 relative z-10">
              <div
                className="mb-8 pb-6 border-b border-primary/30 flex flex-col items-center text-center"
              >
                <Sparkles className="w-6 h-6 text-primary/70 mb-4" />
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-serif">From</p>
                <h3 className="text-2xl font-serif text-primary font-semibold">
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

              <div className="mb-10">
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
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <PostcardPreview 
                        stampId={stampId} 
                        senderHint={senderName} 
                        date={createdAt ? new Date(createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : ''} 
                        className="w-full max-w-md mx-auto"
                      />
                      <div className="text-center text-primary/80 mt-4 flex flex-col items-center">
                        <Lock className="w-5 h-5 mb-2" />
                        <p className="text-sm font-serif tracking-wide text-primary/90 font-medium">Content Sealed until Eid</p>
                        <p className="text-xs text-primary/80 text-center max-w-xs mt-2">
                          Come back on Eid to reveal the full message and the sender&apos;s identity.
                        </p>
                      </div>
                    </div>
                  );
                })() : (() => {
                  try {
                    const parsed = JSON.parse(content);
                    if (parsed.type === 'eid-card') {
                      const cardConfig = EID_CARDS.find(c => c.id === parsed.cardId) || EID_CARDS[0];
                      return (
                        <div className="flex justify-center">
                          <div className="w-full max-w-md">
                            <EidCard 
                              cardConfig={cardConfig} 
                              message={parsed.text} 
                              fontSize={parsed.fontSize}
                              className="shadow-xl"
                            />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <p className="text-foreground/90 leading-loose font-serif text-lg whitespace-pre-wrap text-center px-4">
                        {content}
                      </p>
                    );
                  } catch {
                    return (
                      <p className="text-foreground/90 leading-loose font-serif text-lg whitespace-pre-wrap text-center px-4">
                        {content}
                      </p>
                    );
                  }
                })()}
              </div>

              <div
                className="pt-8 border-t border-primary/30 flex justify-center"
              >
                <div className="text-primary/70 text-2xl">✦</div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
