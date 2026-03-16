import { Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function TopNav() {
  return (
    <header className="md:hidden flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-md px-4 shadow-sm z-50 sticky top-0 w-full">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full">
        <h1 className="font-branding text-xl font-bold text-primary flex items-center justify-between gap-2 w-full">
          <span className="flex items-center gap-1"><Image src="/chand_icon.png" alt="Moon" width={50} height={50} className="w-8 h-8 inline-block text-primary" />Chand Postal</span>
          <span className="flex text-sm items-center"><Image src="/transparent_logo.png" alt="IUBPC Logo" width={50} height={50} className="w-8 h-8 inline-block mx-0.5" />
            An IUBPC Project</span>
        </h1>
      </Link>
    </header>
  );
}
