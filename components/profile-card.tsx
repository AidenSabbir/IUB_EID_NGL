"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share, Check, Sparkles, Moon, LogOut, Pencil, X, Save } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile name.");
    } else {
      setIsEditing(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };
  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  const fallbackCopyTextToClipboard = (text: string, isShareFallback: boolean = false) => {
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
        if (isShareFallback) {
          setCopiedShare(true);
          setTimeout(() => setCopiedShare(false), 2000);
        } else {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        }
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
    setIsSharing(true);
    const origin = typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "");

    const url = `${origin}/u/${profile.username}`;

    try {
      if (!cardRef.current) throw new Error("Card ref not found");

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
        pixelRatio: 4,
        skipFonts: false,
        fontEmbedCSS: '',
        width: cardRef.current.scrollWidth,
        height: cardRef.current.scrollHeight,
        style: {
          transform: 'none',
          borderRadius: '0.75rem',
          margin: '0',
          padding: '24px',
        }
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `eid-wish-${profile.username}.png`, { type: 'image/png' });

      if (navigator.share) {
        const shareData: ShareData = {
          title: `Send me Eid Wishes! 🌙`,
          text: `Send me an anonymous Eid wish! 🌙✨\n\n${url}`,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }

        await navigator.share(shareData);
      } else {
        fallbackCopyTextToClipboard(url, true);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      } else {
        console.error("Share failed, falling back to copy", err);
        fallbackCopyTextToClipboard(url, true);
      }
    } finally {
      setIsSharing(false);
    }
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
        <div 
          ref={cardRef} 
          className={cn(
            "flex flex-col items-center w-full py-8 px-6 transition-all duration-300",
            isSharing ? "border-2 border-primary/40 rounded-xl bg-white shadow-2xl scale-[1.02]" : "bg-transparent"
          )}
        >
          <div className="relative mb-6">
            <Avatar className="size-28 border-4 border-background shadow-xl ring-2 ring-primary/60 ring-offset-4 ring-offset-background">
              <AvatarImage
                src={profile.avatar_url || ""}
                alt={profile.full_name || profile.username}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-3xl bg-primary/20 text-primary font-decorative font-bold">
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className={cn(
                "absolute -bottom-2 -right-2 bg-background text-primary p-2 rounded-full shadow-lg border-2 border-primary/40",
                isSharing && "opacity-0"
              )}
            >
              <Moon className="w-5 h-5" fill="currentColor" />
            </motion.div>
          </div>

          <div className="flex flex-col items-center w-full">
            {isEditing ? (
              <div className="flex flex-col items-center w-full space-y-3 mb-4">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full text-center text-2xl font-decorative border-b-2 border-primary bg-transparent focus:outline-none focus:border-primary/60 transition-colors py-1"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4"
                  >
                    {isLoading ? "Saving..." : <><Save className="w-4 h-4 mr-1.5" /> Save</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile.full_name || "");
                    }}
                    className="border-primary/40 text-primary hover:bg-primary/5 rounded-xl px-4"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group relative flex items-center justify-center mb-1">
                <h2 className="text-3xl font-decorative text-foreground font-bold tracking-tight">
                  {profile.full_name || profile.username}
                </h2>
                {isOwner && !isSharing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 p-1.5 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all duration-300"
                    aria-label="Edit name"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-primary/90 font-medium flex items-center gap-1.5 mt-2">
            <span>@{profile.username}</span>
          </p>

          <div className="mt-6 text-primary py-3 px-4 rounded-2xl font-spartan font-bold text-xl border-2 border-primary/50 bg-primary/5 shadow-inner">
            Send me EID Wishes!🌙
          </div>

          {isSharing && (
            <div className="mt-8 pt-6 border-t border-primary/10 w-full flex flex-col items-center gap-1 opacity-80">
              <p className="text-sm font-branding text-primary font-bold tracking-tight uppercase">Chand Postal</p>
              <p className="text-[10px] text-muted-foreground font-mono italic">link: </p>
            </div>
          )}
        </div>
        <h3 className=" text-center font-bold font-mono flex justify-center items-center gap-2">
          Step 1: Copy the link
        </h3>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <input
              className="w-full px-3 py-2 text-sm bg-muted border border-primary/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.username}`}
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {isOwner && (

          <div className="flex flex-col w-full gap-3 mt-8 justify-center">
            <h3 className=" text-center font-bold mb-[-10]  font-mono flex justify-center items-center gap-2">
              Step 2: Share to Socials
            </h3>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_20px_-8px_rgba(234,179,8,0.7)] rounded-2xl h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_-5px_rgba(234,179,8,0.8)] group"
              onClick={handleShare}
              disabled={isSharing}
              aria-label="Share profile"
            >
              {copiedShare ? (
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
                  Share
                </div>
              )}
            </Button>

            <Button
              variant="default"
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg rounded-2xl h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
