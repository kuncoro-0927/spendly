"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type Ref,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/* -------------------------------------------------------------------------- */
/*  Types & helpers                                                           */
/* -------------------------------------------------------------------------- */

type Point = { x: number; y: number };
type PendingFile = { id: string; file: File };
type FlightData = { id: string; file: File; from: Point; delay: number };
type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
};

export type UploadHandler = (
  file: File,
  onProgress: (percent: number) => void,
) => Promise<void>;

const BW = 48; // lebar ikon file saat terbang
const BH = 60; // tinggi ikon file saat terbang
const FLIGHT_MS = 950; // durasi lintasan parabola
const ORANGE = "#fb6c00";

const uid = () => Math.random().toString(36).slice(2, 10);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExt(name: string) {
  const ext = name.includes(".") ? name.split(".").pop() : "";
  return (ext || "FILE").toUpperCase().slice(0, 4);
}

const EXT_COLORS: Record<string, string> = {
  PDF: "#E23B4A",
  DOC: "#2F6FEB",
  DOCX: "#2F6FEB",
  XLS: "#1F9D55",
  XLSX: "#1F9D55",
  CSV: "#1F9D55",
  PNG: "#8B5CF6",
  JPG: "#8B5CF6",
  JPEG: "#8B5CF6",
  WEBP: "#8B5CF6",
  ZIP: "#F59E0B",
  MP4: "#0EA5E9",
};

/** Upload palsu (progress simulasi) — dipakai kalau `onUpload` tidak diberikan. */
export const simulateUpload: UploadHandler = (_file, onProgress) =>
  new Promise<void>((resolve) => {
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.random() * 14 + 4);
      onProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        resolve();
      }
    }, 140);
  });

/** Upload sungguhan via XHR (multipart/form-data) dengan progress asli. */
export const createXhrUploader =
  (url: string, field = "file"): UploadHandler =>
  (file, onProgress) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed (${xhr.status})`));
      xhr.onerror = () => reject(new Error("Network error"));
      const body = new FormData();
      body.append(field, file);
      xhr.send(body);
    });

/* -------------------------------------------------------------------------- */
/*  Ilustrasi: ikon file, tangan, ring basket                                 */
/* -------------------------------------------------------------------------- */

function FileIcon({
  ext,
  className = "",
}: {
  ext: string;
  className?: string;
}) {
  const color = EXT_COLORS[ext] ?? "#64748B";
  return (
    <svg
      viewBox="0 0 48 60"
      className={className}
      style={{ filter: "drop-shadow(0 6px 8px rgba(15,23,42,.16))" }}
      aria-hidden
    >
      <path
        d="M4 4a4 4 0 0 1 4-4h22l14 14v42a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4Z"
        fill="#fff"
      />
      <path d="M30 0v10a4 4 0 0 0 4 4h10L30 0Z" fill="#E6E9EF" />
      <rect x="11" y="21" width="24" height="2.2" rx="1.1" fill="#E2E8F0" />
      <rect x="11" y="26.5" width="18" height="2.2" rx="1.1" fill="#E2E8F0" />
      <rect x="11" y="32" width="21" height="2.2" rx="1.1" fill="#E2E8F0" />
      <rect x="10" y="41" width="28" height="12" rx="3.5" fill={color} />
      <text
        x="24"
        y="49.4"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill="#fff"
        style={{ fontFamily: "inherit" }}
      >
        {ext}
      </text>
    </svg>
  );
}

function HandIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="#111" stroke="#fff" strokeWidth="1.3">
        <circle cx="7.6" cy="9.6" r="2.2" />
        <circle cx="11.2" cy="8.4" r="2.2" />
        <circle cx="14.8" cy="8.4" r="2.2" />
        <circle cx="18" cy="9.8" r="2.1" />
        <rect x="5.4" y="10" width="14.6" height="9" rx="4.2" />
      </g>
      <rect x="6.6" y="11" width="12.2" height="7.2" rx="3.4" fill="#111" />
    </svg>
  );
}

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

// Jaring: garis diagonal bersilang + sisi luar
const NET_TOP_Y = 80;
const NET_BOT_Y = 130;
const netTop = (i: number) => 10 + i * 12.5;
const netBot = (i: number) => 40 + i * 5;
const NET_PATH = (() => {
  let d = `M${netTop(0)} ${NET_TOP_Y}L${netBot(0)} ${NET_BOT_Y}M${netTop(8)} ${NET_TOP_Y}L${netBot(8)} ${NET_BOT_Y}M${netBot(0)} ${NET_BOT_Y}H${netBot(8)}`;
  for (let i = 0; i < 8; i++) {
    d += `M${netTop(i)} ${NET_TOP_Y}L${netBot(i + 1)} ${NET_BOT_Y}`;
    d += `M${netTop(i + 1)} ${NET_TOP_Y}L${netBot(i)} ${NET_BOT_Y}`;
  }
  return d;
})();

const HOOP_BOX =
  "pointer-events-none absolute left-1/2 top-[calc(100%-82px)] h-[152px] w-[130px] -translate-x-1/2";

/** Lapisan belakang: papan pantul + setengah belakang ring (di bawah bola). */
function HoopBack({ outerRef }: { outerRef: Ref<HTMLDivElement> }) {
  return (
    <div ref={outerRef} className={`${HOOP_BOX} z-10`}>
      <svg
        viewBox="0 0 120 140"
        className="h-full w-full overflow-visible"
        fill="none"
      >
        <rect
          x="13"
          y="3"
          width="94"
          height="62"
          rx="2"
          stroke={ORANGE}
          strokeWidth="3"
        />
        <rect x="52" y="64" width="16" height="10" fill={ORANGE} />
        <path
          d="M5 76A55 7 0 0 1 115 76"
          stroke={ORANGE}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Lapisan depan: setengah depan ring + jaring (di atas bola) + efek "+1". */
function HoopFront({
  netRef,
  plusOnes,
  onPlusDone,
}: {
  netRef: Ref<SVGGElement>;
  plusOnes: string[];
  onPlusDone: (id: string) => void;
}) {
  return (
    <div className={`${HOOP_BOX} z-30`}>
      <svg
        viewBox="0 0 120 140"
        className="h-full w-full overflow-visible"
        fill="none"
      >
        <g
          ref={netRef}
          style={{ transformOrigin: "50% 0%", transformBox: "fill-box" }}
        >
          <path
            d={NET_PATH}
            stroke="#A3AAB9"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M5 76A55 7 0 0 0 115 76"
          stroke={ORANGE}
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      </svg>
      {plusOnes.map((id) => (
        <PlusOne key={id} onDone={() => onPlusDone(id)} />
      ))}
    </div>
  );
}

function PlusOne({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = el.animate(
      [
        { opacity: 0, transform: "translateY(8px) scale(.8)" },
        { opacity: 1, transform: "translateY(-2px) scale(1.12)", offset: 0.25 },
        { opacity: 1, transform: "translateY(-6px) scale(1)", offset: 0.7 },
        { opacity: 0, transform: "translateY(-14px) scale(1)" },
      ],
      { duration: 1100, fill: "forwards" },
    );
    a.finished.then(onDone).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span
      ref={ref}
      className="absolute left-[116px] top-[0px] text-[19px] font-extrabold leading-none opacity-0"
      style={{ color: ORANGE }}
    >
      +1
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bola (file) yang terbang + jejak titik                                    */
/* -------------------------------------------------------------------------- */

type Target = { x: number; y: number; bottom: number };

function FlightBall({
  flight,
  getTarget,
  onApproach,
  onScore,
  onDone,
}: {
  flight: FlightData;
  getTarget: () => Target;
  onApproach: () => void;
  onScore: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [dots, setDots] = useState<
    { x: number; y: number; t: number; s: number }[]
  >([]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const el = ref.current;
    if (!el) return;

    const tgt = getTarget();
    const s0 = flight.from;
    // Parabola = quadratic bezier dengan control point di tengah & di atas
    const cx = (s0.x + tgt.x) / 2;
    const cy =
      Math.min(s0.y, tgt.y) - Math.max(150, Math.abs(s0.y - tgt.y) * 0.45);
    const pos = (t: number): Point => ({
      x: (1 - t) ** 2 * s0.x + 2 * (1 - t) * t * cx + t * t * tgt.x,
      y: (1 - t) ** 2 * s0.y + 2 * (1 - t) * t * cy + t * t * tgt.y,
    });
    const tf = (p: Point, rot: number, sc: number) =>
      `translate(${p.x - BW / 2}px, ${p.y - BH / 2}px) rotate(${rot}deg) scale(${sc})`;

    const N = 28;
    const frames: Keyframe[] = [];
    const ds: { x: number; y: number; t: number; s: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = pos(t);
      frames.push({
        offset: t,
        opacity: 1,
        transform: tf(p, -12 + 46 * t, 1 - 0.4 * t ** 1.4),
      });
      if (i > 2 && i < N - 1 && i % 2 === 0)
        ds.push({ ...p, t, s: 3 + (i % 3) });
    }
    setDots(ds);

    window.setTimeout(onApproach, flight.delay + FLIGHT_MS * 0.6);

    const a1 = el.animate(frames, {
      duration: FLIGHT_MS,
      delay: flight.delay,
      easing: "linear",
      fill: "both",
    });

    a1.finished
      .then(() => {
        onScore();
        // Jatuh menembus jaring, makin kecil & pudar
        const a2 = el.animate(
          [
            { transform: tf(tgt, 34, 0.6), opacity: 1 },
            {
              transform: tf(
                { x: tgt.x + 4, y: tgt.y + (tgt.bottom - tgt.y) * 0.6 },
                46,
                0.52,
              ),
              opacity: 0.9,
              offset: 0.6,
            },
            {
              transform: tf({ x: tgt.x + 6, y: tgt.bottom + 14 }, 58, 0.46),
              opacity: 0.55,
            },
          ],
          {
            duration: 520,
            easing: "cubic-bezier(.4,0,.8,.6)",
            fill: "forwards",
          },
        );
        return a2.finished;
      })
      .then(
        () =>
          el.animate([{ opacity: 0.55 }, { opacity: 0 }], {
            duration: 220,
            fill: "forwards",
          }).finished,
      )
      .then(onDone)
      .catch(onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {dots.map((d, i) => (
        <Dot key={i} {...d} delay={flight.delay + d.t * FLIGHT_MS + 40} />
      ))}
      <div
        ref={ref}
        className="absolute left-0 top-0 opacity-0 will-change-transform"
        style={{ width: BW, height: BH }}
      >
        <FileIcon ext={getExt(flight.file.name)} className="h-full w-full" />
      </div>
    </>
  );
}

function Dot({
  x,
  y,
  s,
  delay,
}: {
  x: number;
  y: number;
  t: number;
  s: number;
  delay: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ref.current?.animate(
      [
        { opacity: 0, scale: "0.3" },
        { opacity: 0.9, scale: "1", offset: 0.25 },
        { opacity: 0, scale: "0.6" },
      ],
      { duration: 800, delay, fill: "both" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span
      ref={ref}
      className="absolute left-0 top-0 rounded-full opacity-0"
      style={{
        width: s,
        height: s,
        background: "#F28C5E",
        transform: `translate(${x - s / 2}px, ${y - s / 2}px)`,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Shooter: file yang siap "ditembak" (klik / drag lalu lepas)               */
/* -------------------------------------------------------------------------- */

function Shooter({
  item,
  extra,
  onShoot,
}: {
  item: PendingFile;
  extra: number;
  onShoot: (item: PendingFile, clientCenter: Point) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Point | null>(null);
  const [off, setOff] = useState<Point>({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    btnRef.current?.animate(
      [
        { opacity: 0, scale: "0.6" },
        { opacity: 1, scale: "1" },
      ],
      { duration: 320, easing: "cubic-bezier(.2,1.4,.4,1)" },
    );
  }, []);

  const shoot = () => {
    const r = iconRef.current?.getBoundingClientRect();
    if (!r) return;
    onShoot(item, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    setOff({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    shoot();
  };

  const showHand = hover || dragging;

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={`Shoot ${item.file.name}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
        setOff({ x: 0, y: 0 });
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={(e) => {
        if (e.detail === 0) shoot(); // aktivasi lewat keyboard (Enter / Space)
      }}
      style={{ transform: `translate(${off.x}px, ${off.y}px)` }}
      className={`relative z-40 ml-1 flex w-[120px] touch-none select-none flex-col items-center gap-1.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div
        ref={iconRef}
        className={`relative h-[60px] w-[48px] transition-transform duration-150 ${
          dragging ? "-rotate-6 scale-110" : "hover:scale-105"
        }`}
      >
        <FileIcon ext={getExt(item.file.name)} className="h-full w-full" />
        {showHand && (
          <HandIcon className="absolute left-1/2 top-[38%] h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2" />
        )}
        {extra > 0 && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
            +{extra}
          </span>
        )}
      </div>
      <span
        className={`max-w-full truncate text-[10px] text-slate-500 transition-opacity ${
          showHand ? "opacity-0" : "opacity-100"
        }`}
      >
        {item.file.name}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Kartu progress upload                                                     */
/* -------------------------------------------------------------------------- */

function UploadRow({ item }: { item: UploadItem }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    ref.current?.animate(
      [
        { opacity: 0, transform: "translateY(14px) scale(.97)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 380, easing: "cubic-bezier(.2,.9,.3,1)" },
    );
  }, []);

  const done = item.status === "done";
  const error = item.status === "error";

  return (
    <li
      ref={ref}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_6px_20px_-6px_rgba(15,23,42,0.18)]"
    >
      <FileIcon ext={getExt(item.file.name)} className="h-7 w-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-900">
          {item.file.name}
        </p>
        <p className="text-[11px] text-slate-400">
          {formatBytes(item.file.size)}
        </p>
      </div>
      <div className="w-[38%] shrink-0">
        <p
          className={`mb-1.5 text-[10px] font-medium ${
            error
              ? "text-red-500"
              : done
                ? "text-emerald-600"
                : "text-slate-400"
          }`}
        >
          {error ? "Failed" : done ? "Uploaded" : "Uploading…"}
        </p>
        <div className="h-[3px] overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-out ${
              error ? "bg-red-500" : "bg-emerald-600"
            }`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-600 text-white transition-all duration-300 ease-[cubic-bezier(.2,1.4,.4,1)] ${
          done ? "h-5 w-5 scale-100 opacity-100" : "h-5 w-0 scale-50 opacity-0"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Komponen utama                                                            */
/* -------------------------------------------------------------------------- */

type Props = {
  /** Handler upload. Default: simulasi progress. Pakai `createXhrUploader("/api/upload")` untuk upload asli. */
  onUpload?: UploadHandler;
  multiple?: boolean;
  accept?: string;
  className?: string;
};

export default function BasketballUpload({
  onUpload = simulateUpload,
  multiple = true,
  accept,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hoopRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<SVGGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const dragDepth = useRef(0);
  const firstCount = useRef(true);

  const [isOver, setIsOver] = useState(false);
  const [hot, setHot] = useState(0); // jumlah bola yang sedang mendekati ring
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [plusOnes, setPlusOnes] = useState<string[]>([]);

  // Counter "Uploaded N" membesar sebentar tiap bertambah
  useEffect(() => {
    if (firstCount.current) {
      firstCount.current = false;
      return;
    }
    countRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.45)" },
        { transform: "scale(1)" },
      ],
      { duration: 380, easing: "ease-out" },
    );
  }, [count]);

  const toLocal = (cx: number, cy: number): Point => {
    const r = rootRef.current!.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  };

  const getTarget = (): Target => {
    const root = rootRef.current!.getBoundingClientRect();
    const h = hoopRef.current!.getBoundingClientRect();
    return {
      x: h.left - root.left + h.width / 2,
      y: h.top - root.top + h.height * (76 / 140), // pusat ring
      bottom: h.top - root.top + h.height * (134 / 140), // ujung bawah jaring
    };
  };

  const startUpload = async (file: File) => {
    const id = uid();

    const patch = (p: Partial<UploadItem>) =>
      setUploads((u) => u.map((x) => (x.id === id ? { ...x, ...p } : x)));

    setUploads((u) => [...u, { id, file, progress: 0, status: "uploading" }]);

    try {
      await onUpload(file, (progress) => {
        patch({ progress: Math.min(99, progress) });
      });

      patch({ progress: 100, status: "done" });
    } catch {
      patch({ status: "error" });
    }
  };

  const score = (file: File) => {
    setHot((h) => Math.max(0, h - 1));
    setCount((c) => c + 1);
    setPlusOnes((p) => [...p, uid()]);
    netRef.current?.animate(
      [
        { transform: "scale(1,1)" },
        { transform: "scale(.9,1.14)", offset: 0.25 },
        { transform: "scale(1.04,.94)", offset: 0.55 },
        { transform: "scale(.98,1.03)", offset: 0.8 },
        { transform: "scale(1,1)" },
      ],
      { duration: 650, easing: "ease-out" },
    );
    startUpload(file);
  };

  const launch = (file: File, from: Point, delay = 0) => {
    if (prefersReducedMotion()) {
      score(file);
      return;
    }
    setFlights((f) => [...f, { id: uid(), file, from, delay }]);
  };

  const addPicked = (files: File[]) => {
    const list = multiple ? files : files.slice(0, 1);
    setPending((p) =>
      multiple
        ? [...p, ...list.map((file) => ({ id: uid(), file }))]
        : list.map((file) => ({ id: uid(), file })),
    );
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    addPicked(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  /* Drag & drop file dari OS ------------------------------------------------ */
  const hasFiles = (e: DragEvent) =>
    Array.from(e.dataTransfer.types).includes("Files");

  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setIsOver(true);
  };
  const onDragOver = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsOver(false);
  };
  const onDrop = (e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setIsOver(false);
    const files = Array.from(e.dataTransfer.files);
    const list = multiple ? files : files.slice(0, 1);
    const p = toLocal(e.clientX, e.clientY);
    list.forEach((file, i) =>
      launch(file, { x: p.x + i * 8, y: p.y }, i * 380),
    );
  };

  const shootFromShooter = (item: PendingFile, c: Point) => {
    setPending((p) => p.filter((x) => x.id !== item.id));
    launch(item.file, toLocal(c.x, c.y));
  };

  const active = isOver || hot > 0;

  return (
    <div
      ref={rootRef}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative isolate flex h-full max-h-screen w-full max-w-[400px] select-none flex-col overflow-hidden rounded-2xl bg-[#E9EDF3] p-6 ${className}`}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-900">
            Upload files
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Drag and drop, or take the shot.
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-300/40 px-2.5 py-1 text-[11px] text-slate-500">
          Uploaded
          <b
            ref={countRef}
            className="inline-block font-semibold tabular-nums text-slate-900"
          >
            {count}
          </b>
        </span>
      </header>
      {/* Dropzone + ring (wrapper tanpa z-index agar lapisan ring ikut stacking card) */}
      <div className="relative mt-6">
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop files here or press Enter to choose files"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          // sebelumnya: flex h-[220px] cursor-pointer ...
          className={`flex h-[200px] cursor-pointer flex-col items-center rounded-3xl border-[1.5px] border-dashed pt-9 text-center outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-orange-400/70 ${
            active
              ? "border-[#fb6c00] bg-[#FDF0E6]"
              : "border-[#C9CED9] bg-white"
          }`}
        >
          <UploadIcon className="h-[18px] w-[18px] text-slate-700" />
          <p className="mt-2.5 text-[15px] font-medium text-slate-900">
            Drop files here
          </p>
          <p className="mt-1 text-[11px] text-slate-400">or take the shot</p>
        </div>

        <HoopBack outerRef={hoopRef} />
        <HoopFront
          netRef={netRef}
          plusOnes={plusOnes}
          onPlusDone={(id) => setPlusOnes((p) => p.filter((x) => x !== id))}
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={onInput}
        className="hidden"
      />
      {/* Area bawah: file siap tembak + daftar upload */}

      <div className="mt-[88px] flex min-h-[clamp(120px,20dvh,170px)] flex-1 flex-col justify-end gap-2.5 overflow-hidden">
        {pending[0] && (
          <div className="flex h-[96px] items-end">
            <Shooter
              key={pending[0].id}
              item={pending[0]}
              extra={pending.length - 1}
              onShoot={shootFromShooter}
            />
          </div>
        )}
        {uploads.length > 0 && (
          <ul className="-m-1 flex min-h-0 flex-col gap-2.5 overflow-y-auto p-1">
            {uploads.map((u) => (
              <UploadRow key={u.id} item={u} />
            ))}
          </ul>
        )}
      </div>
      {/* Lapisan terbang: di antara belakang (z-10) dan depan ring (z-30) */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {flights.map((f) => (
          <FlightBall
            key={f.id}
            flight={f}
            getTarget={getTarget}
            onApproach={() => setHot((h) => h + 1)}
            onScore={() => score(f.file)}
            onDone={() => setFlights((x) => x.filter((y) => y.id !== f.id))}
          />
        ))}
      </div>
    </div>
  );
}
