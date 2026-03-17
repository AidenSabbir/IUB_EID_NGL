'use client'

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

const ONBOARDING_STEPS = [
  {
    id: 1,
    text: "Start by logging into your account using your credentials.",
  },
  {
    id: 2,
    text: "Once you're in, share your profile with your friends so they can connect with you.",
  },
  {
    id: 3,
    text: "Your friends can send you Eid cards directly through your profile.",
  },
  {
    id: 4,
    text: "All the Eid cards you receive will be saved, but they will remain locked and hidden until Eid day.",
  },
  {
    id: 5,
    text: "On Eid, all your received cards will automatically unlock and appear on your profile for you to view.",
  },
]

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm mb-5 border border-primary/10 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <CardContent className="pt-8 px-8 pb-10">
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-primary/70 mb-1">
                How to use
              </h3>
              <div className="h-px w-8 bg-primary/20" />
            </div>
            
            <div className="relative space-y-5">
              <div className="absolute left-[13px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
              
              {ONBOARDING_STEPS.map((step) => (
                <div key={step.id} className="relative flex items-start gap-5 group">
                  <div className="flex-none w-7 h-7 rounded-full bg-card border border-primary/20 flex items-center justify-center text-[11px] font-black text-primary/80 z-10 shadow-sm transition-colors group-hover:border-primary/40 group-hover:text-primary">
                    {step.id}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-medium transition-colors group-hover:text-foreground/80">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
        </Card>
        <Card className="w-full mb-10 max-w-sm border-2 border-primary/40 shadow-xl">
          <CardHeader className="text-center space-y-6 pt-10">
            <CardTitle className="text-xl font-branding text-foreground flex justify-center items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="md:text-xl text-lg tracking-tight">Chand Postal</span>
                <Moon className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground/30 font-light text-xl">||</span>
                <Image src="/transparent_logo.png" alt="IUBPC Logo" width={40} height={40} className="w-10 h-10" />
                <span className="text-2xl tracking-tight">IUBPC</span>
              </div>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Send heartfelt Eid wishes to your loved ones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you can receive Eid wishes<br />Your email will be your username
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
