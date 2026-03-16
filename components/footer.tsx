import Link from "next/link";
import Image from "next/image";
import { Heart, Moon, Facebook, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card/50 backdrop-blur-lg pt-4 pb-2 px-4 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-3">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center gap-3 font-branding text-2xl font-bold text-primary">
            <Link href="/" className="flex items-center gap-1 transition-opacity hover:opacity-80">
              Chand Postal <Image src="/chand_icon.png" alt="Moon" width={50} height={50} className="w-8 h-8 inline-block text-primary" />
            </Link>
            <span className="text-muted-foreground/40 font-light">||</span>
            <a
              href="https://facebook.com/iub.pc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-opacity hover:opacity-80"
            >
              <Image src="/transparent_logo.png" alt="IUBPC Logo" width={36} height={36} className="w-9 h-9" />
              IUBPC
            </a>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <a href="https://facebook.com/iub.pc" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook className="w-7 h-7" />
          </a>
          <a href="https://www.instagram.com/iub.pc" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="w-7 h-7" />
          </a>
          <a href="https://www.linkedin.com/company/iub-programming-club" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="w-7 h-7" />
          </a>
        </div>

        <div className="flex flex-col items-center space-y-2 pt-2 border-t border-border/50 w-full max-w-sm text-center">
          <p className="text-xs text-muted-foreground flex flex-col items-center gap-1">
            <span className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community </span><a href="https://risabbir.vercel.app" className="font-bold flex items-center gap-1">Lead Dev - <span className="text-foreground">Rashedul Islam Sabbir</span></a>
          </p>
        </div>
      </div>
    </footer>
  );
}
