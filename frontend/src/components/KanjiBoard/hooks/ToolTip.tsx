// src/components/KanjiBoard/Tooltip.tsx
export function Tooltip({
  tooltip,
}: {
  tooltip: { x: number; y: number; content: string };
}) {
  return (
      <div
        className="kanji-tooltip"
        style={{
          position: "fixed",
          top: tooltip.y,
          left: tooltip.x,
          background: "rgba(30, 41, 59, 0.9)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "0.9rem",
          pointerEvents: "none",
          zIndex: 1000,
          maxWidth: "200px",
          lineHeight: "1.3",
        }}
        dangerouslySetInnerHTML={{ __html: tooltip.content }}
      />
    )
  }

