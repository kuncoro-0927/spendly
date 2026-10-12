"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PiLightbulb } from "react-icons/pi";
import Skeleton from "@/app/components/ui/Skeleton";
import { useInsight } from "@/app/hooks/insight/useInsight";

export default function InsightCard() {
  const searchParams = useSearchParams();
  const now = new Date();

  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const year = Number(searchParams.get("year")) || now.getFullYear();

  const { aiInsight: insights, loading, error } = useInsight(month, year);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
    containerRef.current?.scrollTo({ left: 0 });
  }, [month, year]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || el.children.length < 2) return;

    const step =
      (el.children[1] as HTMLElement).offsetLeft -
      (el.children[0] as HTMLElement).offsetLeft;

    const index = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.min(Math.max(index, 0), insights.length - 1));
  };

  const scrollToIndex = (index: number) => {
    const el = containerRef.current;
    if (!el) return;

    const child = el.children[index] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-gray-100 p-6">
        {" "}
        <div className="flex items-center gap-3">
          {" "}
          <Skeleton className="h-8 w-8 rounded-sm" />{" "}
          <Skeleton className="h-4 w-16" />{" "}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-gray p-6">
      {" "}
      <div className="flex items-center gap-3">
        {" "}
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-white">
          {" "}
          <PiLightbulb />{" "}
        </span>{" "}
        <span className="text-sm">Insight</span>{" "}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-500">
          Insight gagal dimuat. Silakan coba lagi.
        </p>
      ) : insights.length > 0 ? (
        <>
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="mt-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scrollbar-hide"
          >
            {insights.map((item, index) => (
              <div key={index} className="w-full flex-none snap-start">
                <h3 className="text-sm font-semibold">{item.title}</h3>

                <p className="mt-2 text-sm text-[#6c6c6c]">{item.analysis}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-2">
            {insights.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Insight ${index + 1}`}
                className={`h-1.5 flex-1 cursor-pointer rounded-lg transition-colors duration-300 ${
                  index === activeIndex ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[#6c6c6c]">
          Belum ada insight untuk periode ini.
        </p>
      )}
    </div>
  );
}
