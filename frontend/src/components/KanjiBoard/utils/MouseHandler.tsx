import {type Node} from "reactflow"
export const handleNodeMouseEnter = (_: React.MouseEvent, node: Node, setTooltip: React.Dispatch<React.SetStateAction<{x: number; y: number; content: string} | null>>) => {
    const { readings } = node.data;
    const readingText =
      readings?.join?.(", ") || null ;
    const readingOn = readings?.on?.join(", ") || null
    const readingKun = readings?.kun?.join(", ") || null
    const content = `
      <strong>${node.data.label}</strong><br/>
     ${readingText ? `<span>Readings: ${readingText}</span><br/>` : ""}
     ${readingOn ? `<span>On Readings: ${readingOn}</span><br/>` : ""}
     ${readingKun ? `<span>Kun Readings: ${readingKun}</span><br/>` : ""}
    `;

    setTooltip({ x: _.clientX + 10, y: _.clientY + 10, content });
  };

export const handleNodeMouseLeave = (setTooltip: React.Dispatch<React.SetStateAction<{x: number; y: number; content: string} | null>>) => {
    setTooltip(null);
  };