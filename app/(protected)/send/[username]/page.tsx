import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ComposeForm } from "@/components/compose-form";
import { AlertCircle } from "lucide-react";

export default async function SendMessagePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const senderId = user?.id;

  const { data: recipientProfile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .ilike("username", username)
    .single();

  if (!recipientProfile) {
    notFound();
  }

  if (senderId && senderId === recipientProfile.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif text-red-950 font-medium">
            Action Not Allowed
          </h2>
          <p className="text-red-800/80">
            You can't send a message to yourself.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 sm:py-16">
      <div className="space-y-3 mb-10 text-center">
        <h1 className="text-4xl font-serif font-medium text-amber-950">
          Send a Message
        </h1>
        <p className="text-amber-800/70 text-lg max-w-lg mx-auto">
          Express your thoughts or share a kind word with @{recipientProfile.username}
        </p>
      </div>
      
      <ComposeForm recipient={recipientProfile} senderId={senderId} />
    </div>
  );
}
