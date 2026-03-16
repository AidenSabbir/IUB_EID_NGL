import { Moon } from "lucide-react";
import Link from "next/link";

export function TopNav() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-md px-4 shadow-sm z-50 sticky top-0 w-full">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Moon className="w-6 h-6 text-primary" />
        <h1 className="font-decorative text-2xl font-semibold text-primary">
          {process.env.NEXT_PUBLIC_APP_NAME}
        </h1>
      </Link>
    </header>
  );
}
