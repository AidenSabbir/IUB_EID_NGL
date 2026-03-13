"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user?.id) {
          setIsLoading(false)
          return
        }

        // Fetch unread count
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userData.user.id)
          .eq("is_read", false)

        if (error) {
          console.error("Error fetching unread count:", error)
          setUnreadCount(0)
        } else {
          setUnreadCount(count || 0)
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
        setUnreadCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUnreadCount()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("messages:unread")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { unreadCount, isLoading }
}
