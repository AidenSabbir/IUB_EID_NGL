import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { Moon } from 'lucide-react'

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
        <div className="flex h-screen w-full bg-background overflow-hidden">
          <BottomNav />
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="md:hidden flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 shadow-sm z-10 sticky top-0">
              <Moon className="w-6 h-6 text-primary" />
              <h1 className="font-serif text-2xl font-semibold text-primary">Eid Moon</h1>
            </header>
            
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative bg-background">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </Suspense>
  )
}
