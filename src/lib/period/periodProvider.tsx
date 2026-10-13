// lib/PeriodProvider.tsx
"use client";

import { createContext, useContext } from "react";

const PeriodContext = createContext(1);

export function PeriodProvider({
  startDay,
  children,
}: {
  startDay: number;
  children: React.ReactNode;
}) {
  return (
    <PeriodContext.Provider value={startDay}>{children}</PeriodContext.Provider>
  );
}

export const usePeriodStartDay = () => useContext(PeriodContext);
