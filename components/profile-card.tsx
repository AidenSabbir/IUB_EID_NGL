"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Share, Send, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export function ProfileCard({
  profile,
  isOwnProfile,
}: {
  profile: Profile;
  isOwnProfile?: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/u/${profile.username}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (newUsername === profile.username) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("id", profile.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setIsEditing(false);
      router.push(`/u/${newUsername}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border bg-card">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <Avatar className="size-24 mb-4 border-2 border-primary">
          <AvatarImage src={profile.avatar_url || ""} />
          <AvatarFallback className="text-2xl bg-secondary text-primary">
            {(profile.full_name || profile.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-2xl font-serif text-foreground font-bold mb-1">
          {profile.full_name || profile.username}
        </h2>

        {isEditing ? (
          <div className="flex flex-col items-center gap-2 mb-6 w-full">
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <span className="text-muted-foreground">@</span>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="h-8"
                disabled={isSaving}
              />
            </div>
            {error && <span className="text-xs text-destructive">{error}</span>}
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveUsername}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <Check className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewUsername(profile.username);
                  setError("");
                }}
                disabled={isSaving}
                className="h-8 w-8 p-0 border-primary text-primary"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-6">
            <p className="text-muted-foreground">@{profile.username}</p>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Edit username"
              >
                <Edit2 className="size-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex w-full gap-3">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            asChild
          >
            <Link href={`/send/${profile.username}`}>
              <Send className="size-4 mr-2" />
              Send a message
            </Link>
          </Button>

          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={handleShare}
            aria-label="Share profile"
          >
            {copied ? (
              <>
                <Check className="size-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share className="size-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
