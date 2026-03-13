"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive mt-4"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  )
}
