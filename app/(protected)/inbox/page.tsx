import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "@/components/inbox";

export default async function InboxPage() {
  const supabase = await createClient();

  // Fetch unlock time
  const { data: settingsData } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "eid_unlock_time")
    .single();

  const unlockTimeStr = settingsData?.value || "2026-03-30T12:00:00Z";
  const unlockTime = new Date(unlockTimeStr).getTime();

  // Fetch messages
  const { data: messages, error } = await supabase.rpc("get_inbox_messages");

  if (error) {
    console.error("Error fetching inbox messages:", error);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id)
    .single();

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-12 md:p-6 space-y-6">
      <InboxClient
        initialMessages={messages || []}
        unlockTime={unlockTime}
        username={profile?.username || ""}
      />
    </div>
  );
}
