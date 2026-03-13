"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Send, Loader2 } from "lucide-react";

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
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const MAX_CHARS = 280;

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

    if (senderId && senderId === recipient.id) {
      setError("You can't send a message to yourself.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: submitError } = await supabase.from("messages").insert({
        recipient_id: recipient.id,
        sender_id: isAnonymous ? null : senderId,
        content: content.trim(),
        is_anonymous: isAnonymous,
      });

      if (submitError) throw submitError;

      setIsSuccess(true);
      setContent("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-white rounded-xl border border-emerald-100 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-serif text-emerald-950 font-medium">
          Message Sent!
        </h3>
        <p className="text-emerald-800/80">
          Your message has been delivered to @{recipient.username}.
        </p>
        <Button
          onClick={() => setIsSuccess(false)}
          className="mt-4 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6 bg-white p-6 rounded-xl border border-amber-100 shadow-sm max-w-lg mx-auto w-full"
    >
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-2 border-amber-100">
          <AvatarImage
            src={recipient.avatar_url || ""}
            alt={recipient.username}
          />
          <AvatarFallback className="bg-amber-50 text-amber-700 font-medium text-xl uppercase">
            {recipient.username.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-amber-700/80">Sending a message to</p>
          <p className="text-xl font-medium text-amber-950">
            {recipient.full_name || `@${recipient.username}`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write something kind..."
            className="min-h-[140px] resize-none bg-amber-50/30 border-amber-200 focus-visible:ring-amber-500/30 focus-visible:border-amber-400 placeholder:text-amber-900/30 text-amber-950 text-base p-4 pb-8"
            disabled={isSubmitting}
            required
            maxLength={MAX_CHARS}
          />
          <div
            className={`absolute bottom-3 right-3 text-xs font-medium ${
              charCount >= MAX_CHARS ? "text-red-500" : "text-amber-600/70"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg border border-amber-100">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-amber-950">
            Stay Anonymous
          </label>
          <p className="text-xs text-amber-700/80">
            {isAnonymous
              ? "Your identity will be hidden."
              : "Your username will be shown."}
          </p>
        </div>
        <Switch
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          disabled={!senderId || isSubmitting}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      {!senderId && !isAnonymous && (
        <p className="text-xs text-amber-700/80 text-center">
          You must be logged in to send a public message.
        </p>
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
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
