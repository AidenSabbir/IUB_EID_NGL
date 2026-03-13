"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface EnvelopeRevealProps {
  senderName: string;
  content: string;
  original_message_id?: string;
  sender_id?: string | null;
  sender_username?: string | null;
  onClose?: () => void;
}

export function EnvelopeReveal({ 
  senderName, 
  content,
  onClose
}: EnvelopeRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      setTimeout(onClose, 600); // Wait for animation
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.6 },
            }}
            className="cursor-pointer group"
            onClick={() => setIsOpen(true)}
            style={{ perspective: "1200px" }}
          >
            {/* The Envelope */}
            <motion.div
              className="relative w-80 h-52 bg-[#f9f7f1] rounded-sm shadow-xl border border-primary/20 transition-transform duration-300 group-hover:scale-105"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Back side of the envelope (inside) */}
              <div className="absolute inset-0 bg-[#eee9dc] rounded-sm" />

              {/* A fake letter edge peeking out */}
              <div className="absolute top-2 left-4 right-4 h-20 bg-white shadow-inner border border-primary/10 rounded-t-sm opacity-50" />

              {/* Left Flap */}
              <div className="absolute left-0 top-0 bottom-0 w-[55%] z-10 drop-shadow-[2px_0_3px_rgba(0,0,0,0.05)]">
                <div 
                  className="w-full h-full bg-gradient-to-r from-[#f9f7f1] to-[#f4ebd0] border-r border-primary/10" 
                  style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} 
                />
              </div>
              
              {/* Right Flap */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] z-10 drop-shadow-[-2px_0_3px_rgba(0,0,0,0.05)]">
                <div 
                  className="w-full h-full bg-gradient-to-l from-[#f9f7f1] to-[#f4ebd0] border-l border-primary/10" 
                  style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} 
                />
              </div>

              {/* Bottom Flap */}
              <div className="absolute bottom-0 left-0 right-0 h-[65%] z-20 drop-shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                <div 
                  className="w-full h-full bg-[#fdfbf7] border-t border-primary/10" 
                  style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} 
                >
                  <div className="absolute bottom-4 left-0 right-0 text-center flex flex-col items-center">
                    <span className="text-xs font-serif text-primary/60 tracking-wider">A MESSAGE FOR YOU</span>
                    <span className="text-[10px] text-primary/40 mt-1">Tap to open</span>
                  </div>
                </div>
              </div>

              {/* Top Flap (Animated) */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={isOpen ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 h-[65%] origin-top z-30"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7] to-[#eee9dc] drop-shadow-md"
                  style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)', backfaceVisibility: "hidden" }}
                />
                
                {/* Wax Seal */}
                <div 
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-primary/20"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-12 h-12 rounded-full border border-primary-foreground/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="message"
            className="w-full max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-6"
            >
              <button
                onClick={handleClose}
                className="inline-block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors border border-primary/20 rounded hover:border-primary/40 bg-background/50 backdrop-blur-sm"
              >
                ← Back to envelope
              </button>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: "easeOut"
              }}
              className="bg-[#fdfbf7] rounded-sm border border-primary/20 shadow-2xl overflow-hidden relative"
            >
              {/* Decorative top border */}
              <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

              {/* Background texture pattern (subtle) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              <div className="p-8 md:p-12 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-8 pb-6 border-b border-primary/10 flex flex-col items-center text-center"
                >
                  <Sparkles className="w-6 h-6 text-primary/40 mb-4" />
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-serif">From</p>
                  <h3 className="text-2xl font-serif text-primary font-semibold">
                    {senderName}
                  </h3>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5,
                  }}
                  className="mb-10"
                >
                  <p className="text-foreground/90 leading-loose font-serif text-lg whitespace-pre-wrap text-center px-4">
                    {content}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="pt-8 border-t border-primary/10 flex justify-center"
                >
                  <div className="text-primary/30 text-2xl">✦</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
