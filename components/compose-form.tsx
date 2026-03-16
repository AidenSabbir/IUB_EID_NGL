"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Send, Loader2, ShieldCheck, UserCircle } from "lucide-react";
import { EID_CARDS } from "@/lib/eid-cards";
import { STAMPS } from "@/lib/stamps";
import { EidCard } from "@/components/eid-card";
import { PostcardPreview } from "@/components/postcard-preview";
import { cn } from "@/lib/utils";

interface ComposeFormProps {
  recipient: {
    id: string;
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  senderId?: string | null;
}

export function ComposeForm({ recipient, senderId }: ComposeFormProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(EID_CARDS[0].id);
  const [selectedStampId, setSelectedStampId] = useState<string>(STAMPS[0].id);
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState<number>(24);
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const MAX_CHARS = 120;

  const selectedCard = EID_CARDS.find((c) => c.id === selectedCardId) || EID_CARDS[0];

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setContent(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!content.trim()) {
      setError("Message cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    if (content.length > MAX_CHARS) {
      setError("Message exceeds character limit.");
      setIsSubmitting(false);
      return;
    }

    if (!isAnonymous && !senderName.trim()) {
      setError("Please enter your name");
      setIsSubmitting(false);
      return;
    }

    if (senderId && senderId === recipient.id) {
      setError("You can't send a message to yourself.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = JSON.stringify({
        type: 'eid-card',
        cardId: selectedCard.id,
        stampId: selectedStampId,
        text: content.trim(),
        fontSize: `${fontSize}px`
      });

      const { error: submitError } = await supabase.from("messages").insert({
        recipient_id: recipient.id,
        sender_name: isAnonymous ? null : senderName.trim(),
        content: payload,
        is_anonymous: isAnonymous,
      });

      if (submitError) throw submitError;

      setIsSuccess(true);
      setContent("");
      setSenderName("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-emerald-100 shadow-sm space-y-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-decorative text-emerald-950 font-medium">
          Card Sent Successfully!
        </h3>
        <p className="text-emerald-900">
          Your Eid Card has been delivered to @{recipient.username}.
        </p>

        {senderId ? (
          <Button
            onClick={() => setIsSuccess(false)}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6"
          >
            Send Another Card
          </Button>
        ) : (
          <div className="w-full pt-4 space-y-4 border-t border-emerald-50">
            <div className="space-y-2">
              <h4 className="font-decorative font-semibold text-primary text-xl">Receive your Eid Wishes</h4>
              <p className="text-sm text-muted-foreground">
                Sign up and share your link to get anonymous messages from your friends!
              </p>
            </div>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-6">
              <Link href="/auth/login">Sign up here</Link>
            </Button>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Send another anonymous wish
            </button>
          </div>
        )}
      </div>
    );
  }

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6 w-full"
    >
      <div className="flex items-center justify-between p-2 px-4 bg-gradient-to-br from-amber-50 to-white rounded-2xl border-2 border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2.5 rounded-xl transition-colors shrink-0",
            isAnonymous ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          )}>
            {isAnonymous ? <ShieldCheck className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <label className="text-base font-decorative font-semibold text-amber-950">
              1. Stay Anonymous
            </label>
            <p className="text-sm text-amber-800/70 leading-tight">
              {isAnonymous
                ? "Your identity will be hidden from everyone."
                : "Your name will be visible to the recipient."}
            </p>
          </div>
        </div>
        <Switch
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          disabled={isSubmitting}
          className="data-[state=checked]:bg-emerald-500 scale-110"
        />
      </div>

      {!isAnonymous && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-amber-950">
            Your Name
          </label>
          <Input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Enter your name"
            disabled={isSubmitting}
            className="bg-amber-50/30 border-amber-200 focus-visible:ring-amber-500/30 focus-visible:border-amber-400 placeholder:text-amber-900/30 text-amber-950"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-amber-950">2. Choose a Postcard (Front)</Label>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center">
          <div className="w-full max-w-[350px] flex justify-center">
            <PostcardPreview
              stampId={selectedStampId}
              senderHint={isAnonymous ? "Anonymous" : senderName.trim() ? `${senderName}` : "Y***"}
              date={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              className="shadow-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {STAMPS.map((stamp) => (
            <button
              key={stamp.id}
              type="button"
              onClick={() => setSelectedStampId(stamp.id)}
              className={cn(
                "relative aspect-[3/2] rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                selectedStampId === stamp.id
                  ? "border-amber-600 shadow-md ring-2 ring-amber-600/50 ring-offset-1"
                  : "border-transparent hover:border-amber-200"
              )}
            >
              <Image
                src={stamp.image}
                alt={`Stamp ${stamp.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-amber-950">3. Choose a Card Design (Inside)</Label>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {EID_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCardId(card.id)}
              className={cn(
                "relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                selectedCardId === card.id
                  ? "border-amber-600 shadow-md ring-2 ring-amber-600/50 ring-offset-1"
                  : "border-transparent hover:border-amber-200"
              )}
            >
              <Image
                src={card.image}
                alt={`Template ${card.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 20vw"
              />
            </button>
          ))}
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center">
          <div className="w-full max-w-[350px] flex justify-center">
            <EidCard
              cardConfig={selectedCard}
              message={content}
              fontSize={`${fontSize}px`}
              className="shadow-md"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-amber-950">4. Write Your Message</Label>
        <div className="relative">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write your heartfelt Eid wishes here..."
            className="min-h-[120px] resize-none bg-amber-50/30 border-amber-200 focus-visible:ring-amber-500/30 focus-visible:border-amber-400 placeholder:text-amber-900/30 text-amber-950 text-base p-4 pb-8"
            disabled={isSubmitting}
            required
            maxLength={MAX_CHARS}
          />
          <div
            className={`absolute bottom-3 right-3 text-xs font-medium ${charCount >= MAX_CHARS ? "text-red-500" : "text-amber-600/70"
              }`}
          >
            {charCount}/{MAX_CHARS}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-amber-950">5. Text Size</Label>
          <span className="text-xs text-amber-700/80">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(vals) => setFontSize(vals[0])}
          min={12}
          max={48}
          step={1}
          className="py-2"
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isOverLimit || !content.trim()}
        className="w-full text-base font-medium py-6 bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Send className="mr-2 h-5 w-5" />
        )}
        {isSubmitting ? "Sending..." : "Send Card"}
      </Button>
    </form>
  );
}
