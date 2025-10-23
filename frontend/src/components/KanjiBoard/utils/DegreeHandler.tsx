import type { Node,Edge } from "reactflow";

  export const handleNodeContextMenu = (event: React.MouseEvent, node: Node,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  ) => {
    event.preventDefault();
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
  };
  export const handleReset = (
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  ) => {
    setNodes([]);
    setEdges([]);
  };

export const handleOrganize = (
    nodes: Node[],
    edges: Edge[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  if (nodes.length === 0) return;

  const centerX = 600;
  const centerY = 300;

  // Count edges per node
  const degreeMap: Record<string, number> = {};
  edges.forEach((e) => {
    degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
    degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
  });

  // Group nodes by degree
  const degreeGroups: Record<number, typeof nodes> = {};
  nodes.forEach((node) => {
    const degree = degreeMap[node.id] || 0;
    if (!degreeGroups[degree]) degreeGroups[degree] = [];
    degreeGroups[degree].push(node);
  });

  // Sort degrees descending
  const sortedDegrees = Object.keys(degreeGroups)
    .map(Number)
    .sort((a, b) => b - a);

  const arrangedNodes: typeof nodes = [];
  const baseRadius = 200;  // radius of first ring
  const ringSpacing = 100; // distance between rings
  let ringIndex = 0;

  sortedDegrees.forEach((deg) => {
    const group = degreeGroups[deg];
    const radius = ringIndex === 0 ? 0 : baseRadius + (ringIndex - 1) * ringSpacing;

    group.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      arrangedNodes.push({
        ...node,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      });
    });

    ringIndex++;
  });

  setNodes(arrangedNodes);
};
