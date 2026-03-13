import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-4xl font-serif mb-4 text-primary">User Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The profile you are looking for does not exist or may have been removed.
      </p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
