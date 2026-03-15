import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ProfileCard } from "@/components/profile-card"
import { redirect } from "next/navigation"

async function ProfileDashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return <p className="text-muted-foreground text-center w-full py-8">Error: Profile not found.</p>
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
      <ProfileCard profile={profile} isOwner={true} />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <>
      <main className="flex flex-col items-center justify-start py-8 px-4 w-full">
        <Suspense fallback={<div className="text-muted-foreground text-sm w-full text-center py-8">Loading profile...</div>}>
          <ProfileDashboard />
        </Suspense>
      </main>
    </>
  )
}
