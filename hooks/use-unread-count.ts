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

        // Fetch unread count using RPC to bypass any strict RLS client issues
        const { data: rpcCount, error } = await supabase.rpc("get_unread_count")

        if (error) {
          console.error("Error fetching unread count:", error)
          setUnreadCount(0)
        } else {
          setUnreadCount(rpcCount || 0)
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
