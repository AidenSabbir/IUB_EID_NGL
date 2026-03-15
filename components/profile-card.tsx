"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share, Check, MapPin, Calendar, Sparkles, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export function ProfileCard({
  profile,
  isOwner = false,
}: {
  profile: Profile;
  isOwner?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('Fallback: Copying text command was unsuccessful');
        alert('Failed to copy link automatically. Please copy it manually: ' + text);
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('Failed to copy link automatically. Please copy it manually: ' + text);
    }

    document.body.removeChild(textArea);
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" && window.location?.origin 
      ? window.location.origin 
      : (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "");
    
    const url = `${origin}/u/${profile.username}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.full_name || profile.username}'s Eid Profile`,
          text: `Check out my Eid wishes profile!`,
          url: url,
        });
        return; // If share succeeds, we're done
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // User cancelled share
      }
      // Fall through to copy if share fails for other reasons
    }

    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (clipboardErr) {
        console.error("Modern clipboard failed, trying fallback", clipboardErr);
        // Fall through to fallback
      }
    }

    // Fallback for insecure contexts or when modern API fails
    fallbackCopyTextToClipboard(url);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-primary/40 bg-card/95 backdrop-blur-md relative overflow-hidden rounded-[2rem] shadow-[0_0_40px_-15px_rgba(234,179,8,0.4)]">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1], rotate: [0, -5, 0] }} 
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute -top-12 -right-12 text-primary/30 pointer-events-none"
      >
        <Moon className="w-48 h-48" fill="currentColor" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6], scale: [0.8, 1.2, 0.8] }} 
        transition={{ repeat: Infinity, duration: 4, delay: 1 }}
        className="absolute top-12 left-10 text-primary pointer-events-none drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]"
      >
        <Sparkles className="w-5 h-5" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 8, 0], opacity: [0.5, 0.9, 0.5], scale: [0.9, 1.1, 0.9] }} 
        transition={{ repeat: Infinity, duration: 5, delay: 0.5 }}
        className="absolute bottom-24 right-8 text-primary pointer-events-none drop-shadow-[0_0_8px_rgba(234,179,8,0.7)]"
      >
        <Sparkles className="w-7 h-7" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -6, 0], opacity: [0.4, 0.8, 0.4], rotate: [0, 15, 0] }} 
        transition={{ repeat: Infinity, duration: 4.5, delay: 2 }}
        className="absolute top-1/2 left-6 text-primary pointer-events-none"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>

      <CardContent className="pt-10 pb-10 px-8 flex flex-col items-center text-center relative z-10">
        <div className="relative mb-6">
          <Avatar className="size-28 border-4 border-background shadow-xl ring-2 ring-primary/60 ring-offset-4 ring-offset-primary/20">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback className="text-3xl bg-primary/20 text-primary font-serif font-bold">
              {(profile.full_name || profile.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <motion.div 
            animate={{ rotate: [-5, 5, -5] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -bottom-2 -right-2 bg-background text-primary p-2 rounded-full shadow-lg border-2 border-primary/40"
          >
            <Moon className="w-5 h-5" fill="currentColor" />
          </motion.div>
        </div>

        <h2 className="text-3xl font-serif text-foreground font-bold mb-1 tracking-tight">
          {profile.full_name || profile.username}
        </h2>

        <p className="text-primary/90 font-medium mb-6 flex items-center gap-1.5">
          <span>@{profile.username}</span>
        </p>

        {/* Hardcoded Eid details */}
        {isOwner && (
          <div className="bg-primary/10 border border-primary/30 rounded-3xl p-5 mb-8 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            
            <p className="text-sm/relaxed font-medium text-foreground italic mb-5 relative z-10">
              &quot;✨ Wishing everyone peace, prosperity, and a joyous Eid!&quot;
            </p>
            
            <div className="flex flex-col gap-3 text-sm text-foreground/80 items-center justify-center relative z-10">
              <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full border border-primary/30 backdrop-blur-md">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Celebrating Eid</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full border border-primary/30 backdrop-blur-md">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Joined Ramadan 1445</span>
              </div>
            </div>
          </div>
        )}

        {isOwner && (
          <div className="flex w-full gap-3 justify-center">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_20px_-8px_rgba(234,179,8,0.7)] rounded-2xl h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_-5px_rgba(234,179,8,0.8)] group"
              onClick={handleShare}
              aria-label="Share profile"
            >
              {copied ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Copied Link!
                </motion.div>
              ) : (
                <div className="flex items-center">
                  <Share className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Share Profile
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
