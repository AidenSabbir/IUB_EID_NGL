"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

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
  original_message_id,
  sender_id,
  sender_username,
  onClose
}: EnvelopeRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWishingBack, setIsWishingBack] = useState(false);
  const [hasWishedBack, setHasWishedBack] = useState(false);

  const handleWishBack = async () => {
    if (!original_message_id) return;
    
    setIsWishingBack(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("wish_back", {
        original_message_id
      });

      if (error) {
        console.error("Error wishing back:", error);
        // Could show an error state here
      } else {
        setHasWishedBack(true);
      }
    } catch (err) {
      console.error("Failed to wish back:", err);
    } finally {
      setIsWishingBack(false);
    }
  };

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
              opacity: 0.3,
              scale: 0.95,
              transition: {
                duration: 0.6,
              },
            }}
            className="cursor-pointer"
            onClick={() => setIsOpen(true)}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="w-80 h-48 bg-white rounded-sm border border-primary/20 shadow-lg relative overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 bg-white border border-primary/20" />

              <div className="absolute top-0 left-0 w-40 h-24 bg-gradient-to-br from-white to-secondary/30 origin-top-left clip-triangle border-l border-t border-primary/20 opacity-80" />

              <div className="absolute top-0 right-0 w-40 h-24 bg-gradient-to-bl from-white to-secondary/30 origin-top-right clip-triangle border-r border-t border-primary/20 opacity-80" />

              <motion.div
                initial={{ rotateX: 0 }}
                animate={isOpen ? { rotateX: -120 } : { rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: isOpen ? 0.1 : 0,
                }}
                className="absolute top-0 left-0 right-0 w-full h-1/2 bg-gradient-to-b from-white to-secondary/20 origin-top border-b border-primary/20"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary to-primary/90 rounded-full shadow-md flex items-center justify-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/80 to-primary/60 rounded-full flex items-center justify-center text-white text-xl font-serif font-bold opacity-90">
                    ✦
                  </div>
                </div>
              </motion.div>

              <div className="absolute bottom-0 left-0 right-0 h-1/2 p-6 flex flex-col items-center justify-center">
                <p className="text-center text-xs text-muted-foreground font-serif">
                  A message for you
                </p>
                <p className="text-center text-xs text-primary/60 mt-2">
                  Click to open
                </p>
              </div>
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
                className="inline-block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors border border-primary/20 rounded hover:border-primary/40"
              >
                ← Back to envelope
              </button>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className="bg-white rounded-sm border border-primary/20 shadow-2xl overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

              <div className="p-8 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-6 pb-4 border-b border-primary/10 flex justify-between items-start"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">From:</p>
                    <h3 className="text-xl font-serif text-primary font-semibold">
                      {senderName}
                    </h3>
                  </div>
                  
                  {sender_id && original_message_id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button
                        variant={hasWishedBack ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleWishBack}
                        disabled={isWishingBack || hasWishedBack}
                        className={`
                          transition-all duration-300
                          ${hasWishedBack 
                            ? "bg-primary/10 text-primary border-primary/20 opacity-100" 
                            : "hover:bg-primary/5 border-primary/20 text-primary"
                          }
                        `}
                      >
                        {isWishingBack ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Wishing...
                          </>
                        ) : hasWishedBack ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 text-primary" />
                            Wished Back!
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Wish Back
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5,
                  }}
                  className="mb-8"
                >
                  <p className="text-foreground leading-relaxed font-light text-base whitespace-pre-wrap">
                    {content}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="pt-6 border-t border-primary/10 flex justify-center"
                >
                  <div className="text-primary/40 text-lg">✦</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(0 0, 100% 0, 50% 100%);
        }
      `}</style>
    </div>
  );
}
