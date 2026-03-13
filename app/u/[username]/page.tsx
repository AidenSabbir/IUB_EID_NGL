import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile-card";

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
      title: "User Not Found | Eid Moon",
      description: "The user you're looking for doesn't exist.",
    };
  }

  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const title = `${profile.full_name} | Eid Moon`;
  const description = `Send Eid wishes to ${profile.full_name}`;
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

  
  

  return <ProfileCard profile={profile}  />;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-muted-foreground">Loading profile...</div>}>
        <ProfileData paramsPromise={params} />
      </Suspense>
    </div>
  );
}
