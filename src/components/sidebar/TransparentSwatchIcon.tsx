import { useId } from "react";

export function TransparentSwatchIcon() {
  const patternId = useId();

  return (
    <svg
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <pattern
          id={patternId}
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          shapeRendering="crispEdges"
        >
          <rect width="2" height="2" fill="white" opacity="0.2" />
          <rect x="2" y="2" width="2" height="2" fill="white" opacity="0.15" />
        </pattern>
      </defs>

      <rect
        width="14"
        height="14"
        fill={`url(#${patternId})`}
        style={{
          mixBlendMode: "difference",
        }}
      />

      <line
        x1="2"
        y1="12"
        x2="12"
        y2="2"
        stroke="rgba(220, 30, 30, 0.95)"
        strokeWidth="1.3"
        strokeLinecap="square"
      />
    </svg>
  );
}
