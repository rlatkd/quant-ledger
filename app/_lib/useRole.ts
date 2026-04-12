"use client";

import { useEffect, useState } from "react";

export type Role = "admin" | "member";

export function useRole(): Role | null {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { role?: string } | null) => {
        if (cancelled) return;
        setRole(data?.role === "admin" ? "admin" : "member");
      })
      .catch(() => {
        if (!cancelled) setRole("member");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return role;
}
