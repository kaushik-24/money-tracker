"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
      router.push("/login");
    }
  }, [session, status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
