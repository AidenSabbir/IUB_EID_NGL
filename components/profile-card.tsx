"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share, Check } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export function ProfileCard({
  profile,
}: {
  profile: Profile;
}) {
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

        <div className="flex items-center gap-2 mb-6">
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>

        <div className="flex w-full gap-3">
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
