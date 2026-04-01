"use client";

import { useState } from "react";
import { plans, yearlyMonthlyPrice } from "@/lib/plans";
import type { BillingInterval } from "@/lib/plans";

export default function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const isYearly = interval === "yearly";

  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            料金プラン
          </h2>
          <p className="text-slate-500 text-sm">
            目的に合わせて選べる3つのプラン
          </p>
        </div>

        {/* 月額 / 年額 トグル */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              !isYearly
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            月額
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              isYearly
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            年額
            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
              20%OFF
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const displayPrice = isYearly ? plan.yearlyPrice : plan.price;
            const displayUnit = isYearly ? plan.yearlyUnit : plan.unit;
            const monthlyEquiv = isYearly && plan.yearlyPrice !== "0"
              ? yearlyMonthlyPrice(plan.yearlyPrice)
              : null;

            const ctaLink = plan.key === "free"
              ? plan.ctaLink
              : `/register?plan=${plan.key}${isYearly ? "&interval=yearly" : ""}`;

            return (
              <div
                key={plan.name}
                className={`relative card-hover bg-white rounded-2xl border-2 shadow-sm p-6 flex flex-col ${
                  plan.popular ? "border-amber-400" : "border-slate-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    人気No.1
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-800">
                    {displayPrice}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">{displayUnit}</span>
                  {monthlyEquiv && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      月あたり {monthlyEquiv}円
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.limited.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={ctaLink}
                  className={`block text-center py-3 px-4 rounded-xl font-bold transition ${
                    plan.popular
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
