"use client";

import { useState, useEffect } from "react";
import { Lock, MailOpen, Check, Copy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { EnvelopeReveal } from "@/components/envelope-reveal";
import { useEidUnlock } from "@/hooks/use-eid-unlock";
import { useUnreadCount } from "@/hooks/use-unread-count"
interface Message {
  id: string;
  sender_id: string | null;
  sender_username: string | null;
  sender_avatar: string | null;
  sender_full_name: string | null;
  sender_name?: string | null;
  is_anonymous: boolean;
  is_read: boolean;
  created_at: string;
  content: string | null;
  is_unlocked: boolean;
  wish_content: string | null;
  wish_is_preset: boolean;
}

interface InboxClientProps {
  initialMessages: Message[];
  unlockTime: number;
  username: string;
}

export function InboxClient({ initialMessages, unlockTime, username }: InboxClientProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { unreadCount } = useUnreadCount()
  const { isUnlocked, timeRemaining } = useEidUnlock(new Date(unlockTime));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const days = mounted ? Math.floor(timeRemaining / (1000 * 60 * 60 * 24)) : 0;
  const hours = mounted ? Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : 0;
  const minutes = mounted ? Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)) : 0;
  const seconds = mounted ? Math.floor((timeRemaining % (1000 * 60)) / 1000) : 0;

  const handleEnvelopeClick = (message: Message) => {
    setSelectedMessage(message);
  };

  const selectedSenderName = selectedMessage ? (
    isUnlocked
      ? (selectedMessage.is_anonymous ? "Anonymous" : (selectedMessage.sender_name || selectedMessage.sender_full_name || selectedMessage.sender_username || "Someone"))
      : (selectedMessage.is_anonymous ? "A********" : `${(selectedMessage.sender_name || selectedMessage.sender_full_name || selectedMessage.sender_username || "Someone").charAt(0)}****`)
  ) : "";

  return (
    <div className="space-y-8">
      {selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setSelectedMessage(null)} />
          <div className="relative z-10 w-full max-w-xl">
            <EnvelopeReveal
              senderName={selectedSenderName}
              content={selectedMessage.content || ""}
              original_message_id={selectedMessage.id}
              sender_id={selectedMessage.is_anonymous ? null : selectedMessage.sender_id}
              sender_username={selectedMessage.is_anonymous ? null : selectedMessage.sender_username}
              onClose={() => setSelectedMessage(null)}
              isUnlocked={isUnlocked}
              createdAt={selectedMessage.created_at}
            />
          </div>
        </div>
      )}

      {!isUnlocked && (
        <Card className="bg-primary/40 border-primary/30 backdrop-blur-sm shadow-md">
          <CardContent className="p-2 flex flex-col items-center justify-center space-y-2">
            <Lock className="w-12 h-12 text-primary" />
            <h2 className="text-2xl font-decorative font-semibold text-foreground text-center">
              Eid Messages Locked
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              Your messages are sealed until Eid. The countdown has begun!
            </p>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
              <TimeUnit value={days} label="Days" />
              <TimeUnit value={hours} label="Hours" />
              <TimeUnit value={minutes} label="Mins" />
              <TimeUnit value={seconds} label="Secs" />
            </div>
          </CardContent>
        </Card>
      )}

      {isUnlocked && (
        <div className="bg-primary/20 border border-primary/30 rounded-xl p-6 text-center shadow-sm">
          <h2 className="text-2xl font-decorative font-semibold text-primary mb-2">
            Eid Mubarak!
          </h2>
          <p className="text-muted-foreground">
            Your messages are now unlocked. Click an envelope to reveal your wishes.
          </p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-6 bg-card border border-primary/20 rounded-xl shadow-sm space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-decorative font-semibold text-primary">Share Your Profile</h3>
          <p className="text-sm text-muted-foreground">Receive more Eid wishes from your friends!</p>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <input
              className="w-full px-3 py-2 text-sm bg-muted border border-primary/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${username}`}
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 relative">
        <h1 className="text-3xl font-decorative font-bold text-primary">
          Your Inbox
        </h1>
        {unreadCount > 0 ? (
          <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {initialMessages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No messages yet. Share your link to receive Eid wishes!
          </div>
        ) : (

          initialMessages.map((message) => (
            <motion.div
              key={message.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEnvelopeClick(message)}
              className="cursor-pointer w-full max-w-[280px]"
              style={{ perspective: "1000px" }}
            >
              <div className={`relative w-full aspect-[1.5/1] bg-[#f9f7f1] rounded-sm shadow-md border border-primary/30 transition-all ${!isUnlocked && "opacity-95"}`}>
                {/* Back side of the envelope (inside) */}
                <div className="absolute inset-0 bg-[#eee9dc] rounded-sm" />

                {/* A fake letter edge peeking out */}
                <div className="absolute top-2 left-4 right-4 h-1/3 bg-white shadow-inner border border-primary/20 rounded-t-sm opacity-80" />

                {/* Left Flap */}
                <div className="absolute left-0 top-0 bottom-0 w-[55%] z-10 drop-shadow-[2px_0_3px_rgba(0,0,0,0.1)]">
                  <div
                    className="w-full h-full bg-gradient-to-r from-[#f9f7f1] to-[#f4ebd0] border-r border-primary/20"
                    style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
                  />
                </div>

                {/* Right Flap */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%] z-10 drop-shadow-[-2px_0_3px_rgba(0,0,0,0.1)]">
                  <div
                    className="w-full h-full bg-gradient-to-l from-[#f9f7f1] to-[#f4ebd0] border-l border-primary/20"
                    style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
                  />
                </div>

                {/* Bottom Flap */}
                <div className="absolute bottom-0 left-0 right-0 h-[65%] z-20 drop-shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
                  <div
                    className="w-full h-full bg-gradient-to-b from-[#fdfbf7] to-[#eee9dc] border-t border-primary/20"
                    style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
                  >
                    <div className="absolute bottom-3 left-0 right-0 text-center flex flex-col items-center">
                      <span className="text-[10px] sm:text-xs font-decorative text-primary font-medium truncate px-4 w-full">
                        From: {isUnlocked
                          ? (message.is_anonymous ? "Anonymous" : (message.sender_name || message.sender_full_name || message.sender_username || "Someone"))
                          : (message.is_anonymous ? "A********" : `${(message.sender_name || message.sender_full_name || message.sender_username || "Someone").charAt(0)}****`)}
                      </span>
                      <span className="text-[9px] text-primary/70 mt-0.5 font-medium">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Flap (Closed) */}
                <div className="absolute top-0 left-0 right-0 h-[65%]  drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)] origin-top z-30">
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7] to-[#eee9dc]  border-b border-primary/20"
                    style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
                  />

                  {/* Wax Seal */}
                  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-primary/40">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-primary-foreground/50 flex items-center justify-center">
                      {isUnlocked ? (
                        message.is_read ? <MailOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" /> : <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      ) : (
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 flex items-center justify-center bg-card border border-primary/40 rounded-lg shadow-md mb-1">
        <span className="text-2xl font-bold text-primary">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
