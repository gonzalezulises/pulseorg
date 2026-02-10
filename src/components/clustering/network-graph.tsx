"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { forceCollide } from "d3-force";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import type { GraphData, GraphNode, GraphLink } from "@/types/clustering";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});

interface NetworkGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
  height?: number;
  showLabels?: boolean;
}

export function NetworkGraph({
  data,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  height = 600,
  showLabels = true,
}: NetworkGraphProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [height]);

  // Configure D3 forces for better node distribution
  useEffect(() => {
    if (graphRef.current) {
      // Increase charge repulsion to spread nodes apart
      graphRef.current.d3Force("charge")?.strength(-400).distanceMax(500);
      // Increase link distance
      graphRef.current.d3Force("link")?.distance(120).strength(0.3);
      // Add collision detection to prevent overlap
      graphRef.current.d3Force("collide", forceCollide().radius((node: any) => node.size / 2 + 15).strength(0.8));
      // Weaker center force
      graphRef.current.d3Force("center")?.strength(0.03);
      // Reheat simulation
      graphRef.current.d3ReheatSimulation();
    }
  }, [data]);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: any) => {
      if (onNodeClick) {
        onNodeClick(node as GraphNode);
      }
      // Center on clicked node
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 500);
        graphRef.current.zoom(2, 500);
      }
    },
    [onNodeClick]
  );

  // Handle node hover
  const handleNodeHover = useCallback(
    (node: any) => {
      setHoveredNode(node as GraphNode | null);
      if (onNodeHover) {
        onNodeHover(node as GraphNode | null);
      }
    },
    [onNodeHover]
  );

  // Custom node rendering
  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label;
      const fontSize = node.type === "theme" ? 14 / globalScale : 10 / globalScale;
      const nodeSize = node.size / 3;
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNode?.id === node.id;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);

      // Fill color
      ctx.fillStyle = isSelected || isHovered ? "#ffffff" : node.color;
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected
        ? "#3b82f6"
        : isHovered
        ? "#f59e0b"
        : node.borderColor || node.color;
      ctx.lineWidth = isSelected || isHovered ? 3 / globalScale : 1.5 / globalScale;
      ctx.stroke();

      // Draw label
      if (showLabels && (node.type === "theme" || globalScale > 1.5 || isHovered)) {
        ctx.font = `${node.type === "theme" ? "bold " : ""}${fontSize}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Background for label
        const textWidth = ctx.measureText(label).width;
        const padding = 2 / globalScale;

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(
          node.x - textWidth / 2 - padding,
          node.y + nodeSize + 2 / globalScale,
          textWidth + padding * 2,
          fontSize + padding * 2
        );

        // Label text
        ctx.fillStyle = "#1f2937";
        ctx.fillText(label, node.x, node.y + nodeSize + fontSize / 2 + 4 / globalScale);
      }

      // Icon for themes
      if (node.type === "theme") {
        ctx.font = `${12 / globalScale}px Sans-Serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("T", node.x, node.y);
      }
    },
    [selectedNodeId, hoveredNode, showLabels]
  );

  // Custom link rendering
  const linkCanvasObject = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const start = link.source;
      const end = link.target;

      if (!start.x || !end.x) return;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);

      // Style based on link type
      if (link.type === "participant_theme") {
        ctx.strokeStyle = `${link.color}66`; // 40% opacity
        ctx.lineWidth = (link.value * 0.5) / globalScale;
      } else {
        ctx.strokeStyle = `${link.color}33`; // 20% opacity
        ctx.lineWidth = Math.min(2, link.value * 0.3) / globalScale;
      }

      ctx.stroke();
    },
    []
  );

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.5, 300);
    }
  };

  const handleFitToScreen = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
      graphRef.current.d3ReheatSimulation();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleFitToScreen} title="Fit to Screen">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Hovered node tooltip */}
      {hoveredNode && (
        <Card className="absolute top-4 left-4 z-10 max-w-xs shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-1">
              <div className="font-medium">{hoveredNode.label}</div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {hoveredNode.type === "theme" ? "Tema" : "Participante"}
                </Badge>
                {hoveredNode.department && (
                  <Badge variant="secondary" className="text-xs">
                    {hoveredNode.department}
                  </Badge>
                )}
                {hoveredNode.profile && (
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: hoveredNode.color, color: "#fff" }}
                  >
                    {hoveredNode.profile}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="text-xs font-medium mb-1">Leyenda</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#1dc47c]" />
                <span>True Believers</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#00B4D8]" />
                <span>Engaged</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span>Neutrales</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                <span>Desengaged</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded border-2 border-gray-400 flex items-center justify-center text-[8px] font-bold">
                  T
                </div>
                <span>Tema</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Force Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeRelSize={1}
        linkDirectionalParticles={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.25}
        cooldownTicks={150}
        warmupTicks={50}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 80);
          }
        }}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        nodeVal={(node: any) => node.size}
      />
    </div>
  );
}
