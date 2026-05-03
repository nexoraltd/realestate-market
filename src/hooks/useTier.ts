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

// Module-level cache so multiple PaywallOverlay instances share one fetch
let _fetchPromise: Promise<TierState> | null = null;
let _cachedResult: TierState | null = null;

function fetchTierOnce(): Promise<TierState> {
  // Invalidate cache if the stored email changed (e.g., user logged in after being a guest)
  if (_cachedResult) {
    const stored = localStorage.getItem(SESSION_KEY);
    const currentEmail = stored ? (() => { try { return JSON.parse(stored).email || null; } catch { return null; } })() : null;
    if (_cachedResult.email !== currentEmail) {
      _cachedResult = null;
      _fetchPromise = null;
    }
  }
  if (_cachedResult) return Promise.resolve(_cachedResult);
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async (): Promise<TierState> => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return { tier: "guest", loading: false, email: null };

    let parsed: { email?: string; plan?: string };
    try { parsed = JSON.parse(stored); } catch {
      return { tier: "guest", loading: false, email: null };
    }

    const userEmail = parsed.email || null;
    if (!userEmail) return { tier: "guest", loading: false, email: null };

    try {
      const r = await fetch(`/api/subscription?email=${encodeURIComponent(userEmail)}`);
      const data = await r.json();
      const verifiedPlan = data.basePlan || data.plan || (data.active ? "free" : null);
      const tier = parseTier(verifiedPlan);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: userEmail, plan: verifiedPlan }));
      _cachedResult = { tier, loading: false, email: userEmail };
    } catch {
      _cachedResult = { tier: parseTier(parsed.plan || null), loading: false, email: userEmail };
    }
    return _cachedResult!;
  })();

  return _fetchPromise;
}

export function useTier(): TierState {
  const [state, setState] = useState<TierState>({
    tier: "guest",
    loading: true,
    email: null,
  });

  useEffect(() => {
    fetchTierOnce().then(setState);
  }, []);

  return state;
}

