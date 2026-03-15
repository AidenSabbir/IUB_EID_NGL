import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile-card";
import { ComposeForm } from "@/components/compose-form";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .ilike("username", username)
    .single();

  if (!profile) {
    return {
      title: `User Not Found | ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: "The user you're looking for doesn't exist.",
    };
  }

  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const title = `****** | ${process.env.NEXT_PUBLIC_APP_NAME}`;
  const description = `Send an anonymous Eid wish`;
  const pageUrl = `${defaultUrl}/u/${username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "profile",
    },
  };
}

async function ProfileData({ paramsPromise }: { paramsPromise: Promise<{ username: string }> }) {
  const { username } = await paramsPromise;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .ilike("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <ProfileCard profile={profile} isOwner={user?.id === profile.id} />
      
      {user?.id !== profile.id ? (
        <div className="bg-card border-border rounded-xl shadow-sm overflow-hidden p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-serif font-medium text-foreground">Send an Eid Wish</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Your message will be safely sealed until Eid.
            </p>
          </div>
          <ComposeForm recipient={profile} senderId={user?.id} />
        </div>
      ) : (
        <div className="text-center p-6 bg-secondary/50 rounded-xl border border-primary/20">
          <h3 className="text-lg font-serif font-medium text-foreground mb-2">This is your public page</h3>
          <p className="text-muted-foreground text-sm">
            Share this link with your friends and family so they can send you Eid wishes!
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className="rounded-full bg-background/50 backdrop-blur-sm border border-border/40 hover:bg-background/80 transition-all"
        >
          <Link href="/">
            <Home className="w-5 h-5 text-primary" />
          </Link>
        </Button>
      </div>
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4 pb-32">
        <Suspense fallback={<div className="text-muted-foreground">Loading profile...</div>}>
          <ProfileData paramsPromise={params} />
        </Suspense>
      </div>
    </>
  );
}
