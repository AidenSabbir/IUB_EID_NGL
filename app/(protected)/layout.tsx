import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { BottomNav } from '@/components/bottom-nav'

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  console.log('AuthGuard check:', {
    hasClaims: !!data?.claims,
    nodeEnv: process.env.NODE_ENV,
    e2eTest: process.env.NEXT_PUBLIC_E2E_TEST
  })

  if (!data?.claims && process.env.NODE_ENV !== 'test' && process.env.NEXT_PUBLIC_E2E_TEST !== 'true') {
    // redirect('/auth/login')
  }

  return <>{children}</>
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <AuthGuard>
        <div className="flex h-[calc(100dvh-64px)] w-full overflow-hidden">
          <BottomNav />
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <main className="flex-1 overflow-y-auto relative">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </Suspense>
  )
}
