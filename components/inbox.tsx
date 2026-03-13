"use client";

import { useState } from "react";
import { Lock, Mail, MailOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { EnvelopeReveal } from "@/components/envelope-reveal";
import { useEidUnlock } from "@/hooks/use-eid-unlock";

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
}

export function InboxClient({ initialMessages, unlockTime }: InboxClientProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const { isUnlocked, timeRemaining } = useEidUnlock(new Date(unlockTime));

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const handleEnvelopeClick = (message: Message) => {
    if (!isUnlocked) return;
    setSelectedMessage(message);
  };

  if (selectedMessage) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <EnvelopeReveal
          senderName={selectedMessage.is_anonymous ? "Anonymous" : (selectedMessage.sender_name || selectedMessage.sender_full_name || selectedMessage.sender_username || "Someone")}
          content={selectedMessage.content || ""}
          original_message_id={selectedMessage.id}
          sender_id={selectedMessage.is_anonymous ? null : selectedMessage.sender_id}
          sender_username={selectedMessage.is_anonymous ? null : selectedMessage.sender_username}
          onClose={() => setSelectedMessage(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isUnlocked && (
        <Card className="bg-primary/10 border-primary/20 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
            <Lock className="w-12 h-12 text-primary mb-2" />
            <h2 className="text-2xl font-serif font-semibold text-foreground text-center">
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
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <h2 className="text-2xl font-serif font-semibold text-primary mb-2">
            Eid Mubarak!
          </h2>
          <p className="text-muted-foreground">
            Your messages are now unlocked. Click an envelope to reveal your wishes.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {initialMessages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No messages yet. Share your link to receive Eid wishes!
          </div>
        ) : (
          initialMessages.map((message) => (
            <motion.div
              key={message.id}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
              onClick={() => handleEnvelopeClick(message)}
              className={`
                relative overflow-hidden rounded-xl border p-6 transition-all
                ${isUnlocked 
                  ? "bg-card border-primary/30 cursor-pointer hover:shadow-md hover:border-primary/50" 
                  : "bg-muted/50 border-border/50 cursor-not-allowed opacity-80"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-3 rounded-full 
                    ${isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                  `}>
                    {isUnlocked ? (
                      message.is_read ? <MailOpen className="w-6 h-6" /> : <Mail className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      From: {message.is_anonymous ? "Anonymous" : (message.sender_name || message.sender_full_name || message.sender_username || "Someone")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {isUnlocked && message.content && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-foreground line-clamp-2">
                    {message.content}
                  </p>
                </div>
              )}
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
      <div className="w-16 h-16 flex items-center justify-center bg-card border border-primary/20 rounded-lg shadow-sm mb-1">
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
