"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/googlea1061e93d1208ad4.html") {
      router.push("/inbox");
    }
  }, []);
}