export default function GradientDefs() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="brand-gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="24"
          y2="24"
        >
          <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-yellow)" }} />
        </linearGradient>

        <linearGradient id="brand-gradient-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-orange)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-yellow)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
