import React from "react";
import { animated, useSpring } from "@react-spring/web";

interface KanjiNodeProps {
  character: string;
  meaning: string;
  onHover?: (show: boolean) => void; // new
}

export default function KanjiNode({ character, meaning, onHover }: KanjiNodeProps) {
  const [hovered, setHovered] = React.useState(false);

  const props = useSpring({
    scale: hovered ? 1.2 : 1,
    boxShadow: hovered ? "0px 4px 10px rgba(0,0,0,0.3)" : "0px 0px 0px rgba(0,0,0,0)",
  });

  return (
    <animated.div
      style={{
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#fefefe",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        ...props,
      }}
      onMouseEnter={() => {
        setHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHover?.(false);
      }}
    >
      <div style={{ fontSize: 32 }}>{character}</div>
      {hovered && <div style={{ fontSize: 12 }}>{meaning}</div>}
    </animated.div>
  );
}
