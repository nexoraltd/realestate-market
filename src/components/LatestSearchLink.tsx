"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLatestDataPeriod } from "@/components/useLatestDataPeriod";

export default function LatestSearchLink({
  area,
  className,
  children,
}: {
  area: string;
  className?: string;
  children: ReactNode;
}) {
  const period = useLatestDataPeriod();
  return (
    <Link
      href={`/search?area=${area}&year=${period.year}&quarter=${period.quarter}`}
      className={className}
    >
      {children}
    </Link>
  );
}
