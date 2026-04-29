"use client";

import { useState, useEffect } from "react";
import { setSession, clearSession } from "./sessionStorage";

export type Tier = "guest" | "free" | "standard" | "professional";
export { setSession, clearSession };

interface TierState {
  tier: Tier;
  loading: boolean;
  email: string | null;
}

const SESSION_KEY = "realestate_verified_email";

function parseTier(plan: string | null): Tier {
  if (!plan) return "guest";
  if (plan.startsWith("professional")) return "professional";
  if (plan.startsWith("standard")) return "standard";
  if (plan === "free") return "free";
  return "guest";
}

export function useTier(): TierState {
  const [state, setState] = useState<TierState>({
    tier: "guest",
    loading: true,
    email: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      setState({ tier: "guest", loading: false, email: null });
      return;
    }

    let parsed: { email?: string; plan?: string };
    try {
      parsed = JSON.parse(stored);
    } catch {
      setState({ tier: "guest", loading: false, email: null });
      return;
    }

    const userEmail = parsed.email || null;
    if (!userEmail) {
      setState({ tier: "guest", loading: false, email: null });
      return;
    }

    // Use cached plan for immediate display, then verify
    const cachedTier = parseTier(parsed.plan || null);
    setState({ tier: cachedTier, loading: true, email: userEmail });

    fetch(`/api/subscription?email=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        const verifiedPlan = data.basePlan || data.plan || (data.active ? "free" : null);
        const tier = parseTier(verifiedPlan);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ email: userEmail, plan: verifiedPlan }));
        setState({ tier, loading: false, email: userEmail });
      })
      .catch(() => {
        setState({ tier: cachedTier, loading: false, email: userEmail });
      });
  }, []);

  return state;
}

