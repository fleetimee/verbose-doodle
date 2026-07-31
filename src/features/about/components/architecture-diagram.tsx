"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NodeId =
  | "frontend"
  | "api-gateway"
  | "controller"
  | "jwt"
  | "database"
  | null;

interface ArchNode {
  color: string;
  darkColor: string;
  description: string;
  glowColor: string;
  id: Exclude<NodeId, null>;
  label: string;
  layer: number;
  sublabel: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const NODES: ArchNode[] = [
  {
    color: "#3b82f6",
    darkColor: "#60a5fa",
    description:
      "Single-page application built with React 19, TypeScript, and TanStack Query. Communicates with the backend via REST API and WebSocket bridge for real-time protocol simulation.",
    glowColor: "rgba(59,130,246,0.25)",
    id: "frontend",
    label: "React Frontend",
    layer: 0,
    sublabel: "Vite + TanStack Query",
  },
  {
    color: "#10b981",
    darkColor: "#34d399",
    description:
      "Spring Boot application with an embedded Tomcat servlet container. Exposes REST endpoints under /api/** and handles HTTP lifecycle, request routing, and response serialization.",
    glowColor: "rgba(16,185,129,0.25)",
    id: "api-gateway",
    label: "Spring Boot",
    layer: 1,
    sublabel: "Embedded Tomcat + REST",
  },
  {
    color: "#f59e0b",
    darkColor: "#fbbf24",
    description:
      "A dynamic catch-all Spring MVC controller registered at the lowest Spring bean priority. It intercepts any unmatched /api/** route and resolves it to the correct JSON-driven biller scenario stored in the database.",
    glowColor: "rgba(245,158,11,0.25)",
    id: "controller",
    label: "Catch-all Controller",
    layer: 2,
    sublabel: "@Order(LOWEST_PRECEDENCE)",
  },
  {
    color: "#8b5cf6",
    darkColor: "#a78bfa",
    description:
      "Stateless JWT authentication via Spring Security filter chain. Every API request carries a signed Bearer token; the filter validates the signature and injects the user principal into the security context.",
    glowColor: "rgba(139,92,246,0.25)",
    id: "jwt",
    label: "JWT Security",
    layer: 2,
    sublabel: "Spring Security Filter Chain",
  },
  {
    color: "#06b6d4",
    darkColor: "#22d3ee",
    description:
      "PostgreSQL relational database that stores biller endpoint configurations, JSON scenario payloads, user records, and transaction histories. Accessed via Spring Data JPA repositories.",
    glowColor: "rgba(6,182,212,0.25)",
    id: "database",
    label: "PostgreSQL",
    layer: 3,
    sublabel: "JSON Scenario Data Store",
  },
];

// Which pairs of node IDs are connected by edges
const EDGES: [Exclude<NodeId, null>, Exclude<NodeId, null>][] = [
  ["frontend", "api-gateway"],
  ["api-gateway", "controller"],
  ["api-gateway", "jwt"],
  ["controller", "database"],
  ["jwt", "database"],
];

// Nodes that become "active" (highlighted) when a given node is hovered
const ACTIVE_MAP: Record<Exclude<NodeId, null>, Set<Exclude<NodeId, null>>> = {
  "api-gateway": new Set(["frontend", "api-gateway", "controller", "jwt"]),
  controller: new Set(["api-gateway", "controller", "database"]),
  database: new Set(["controller", "jwt", "database"]),
  frontend: new Set(["frontend", "api-gateway"]),
  jwt: new Set(["api-gateway", "jwt", "database"]),
};

// ---------------------------------------------------------------------------
// Layout helpers (percentage-based, resolved to pixel in SVG viewBox 0 0 500 320)
// ---------------------------------------------------------------------------

const VB_W = 500;
const VB_H = 355;

// x/y center of each node in viewBox coordinates
const NODE_POSITIONS: Record<
  Exclude<NodeId, null>,
  { x: number; y: number }
> = {
  "api-gateway": { x: 250, y: 138 },
  controller: { x: 145, y: 224 },
  database: { x: 250, y: 285 },
  frontend: { x: 250, y: 52 },
  jwt: { x: 355, y: 224 },
};

// Map of node ID to its icon glyph
const NODE_GLYPHS: Record<Exclude<NodeId, null>, string> = {
  "api-gateway": "⬡",
  controller: "⇌",
  database: "⬡",
  frontend: "◈",
  jwt: "⊕",
};

// Compute edge opacity based on hover state
function getEdgeOpacity(hoveredNode: NodeId, isEdgeActive: boolean): number {
  if (hoveredNode === null) {
    return 0.25;
  }
  if (isEdgeActive) {
    return 0.85;
  }
  return 0.07;
}

// Compute node scale from hover/active state
function getNodeScale(isHovered: boolean, isActive: boolean): number {
  if (isHovered) {
    return 1.08;
  }
  if (isActive) {
    return 1.04;
  }
  return 1;
}

interface DiagramNodeProps {
  isActive: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  node: ArchNode;
  onHover: (id: Exclude<NodeId, null> | null) => void;
  reducedMotion: boolean;
}

function DiagramNode({
  node,
  isActive,
  isDimmed,
  isHovered,
  onHover,
  reducedMotion,
}: DiagramNodeProps) {
  const pos = NODE_POSITIONS[node.id];
  const color = node.color;
  const nodeScale = getNodeScale(isHovered, isActive);
  const nodeOpacity = isDimmed ? 0.28 : 1;
  const glyph = NODE_GLYPHS[node.id];

  return (
    <motion.g
      animate={reducedMotion ? {} : { opacity: nodeOpacity, scale: nodeScale }}
      aria-label={`${node.label}: ${node.sublabel}`}
      initial={false}
      onBlur={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      role="button"
      style={{
        cursor: "pointer",
        opacity: nodeOpacity,
        transformOrigin: `${pos.x}px ${pos.y}px`,
      }}
      tabIndex={0}
      transition={{ damping: 25, stiffness: 350, type: "spring" }}
    >
      {/* Glow halo on active */}
      <AnimatePresence>
        {isActive && !reducedMotion && (
          <motion.circle
            animate={{ opacity: 1, r: 32 }}
            cx={pos.x}
            cy={pos.y}
            exit={{ opacity: 0, r: 26 }}
            fill={node.glowColor}
            initial={{ opacity: 0, r: 26 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* Node circle */}
      <circle
        cx={pos.x}
        cy={pos.y}
        fill={isActive ? color : "transparent"}
        r={24}
        stroke={color}
        strokeWidth={isHovered ? 2.5 : 1.8}
        style={{
          transition: reducedMotion
            ? "none"
            : "fill 0.2s ease, stroke-width 0.15s ease",
        }}
      />

      {/* Icon (foreignObject not reliable in all SVG contexts — use text-based fallback) */}
      <text
        dominantBaseline="central"
        fill={isActive ? "white" : color}
        fontSize="11"
        fontWeight="600"
        style={{
          fontFamily: "system-ui, sans-serif",
          pointerEvents: "none",
          transition: "fill 0.2s ease",
          userSelect: "none",
        }}
        textAnchor="middle"
        x={pos.x}
        y={pos.y - 3}
      >
        {glyph}
      </text>

      {/* Label below */}
      <text
        dominantBaseline="hanging"
        fill="currentColor"
        fontSize="8.5"
        fontWeight="600"
        style={{
          fontFamily: "system-ui, sans-serif",
          pointerEvents: "none",
          userSelect: "none",
        }}
        textAnchor="middle"
        x={pos.x}
        y={pos.y + 28}
      >
        {node.label}
      </text>
      <text
        dominantBaseline="hanging"
        fill="currentColor"
        fontSize="6.5"
        opacity="0.55"
        style={{
          fontFamily: "system-ui, sans-serif",
          pointerEvents: "none",
          userSelect: "none",
        }}
        textAnchor="middle"
        x={pos.x}
        y={pos.y + 39}
      >
        {node.sublabel}
      </text>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ArchitectureDiagram() {
  const [hoveredNode, setHoveredNode] = useState<NodeId>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const activeSet: Set<Exclude<NodeId, null>> =
    hoveredNode === null ? new Set() : ACTIVE_MAP[hoveredNode];

  const activeNode = hoveredNode
    ? NODES.find((n) => n.id === hoveredNode)
    : null;

  return (
    <section
      aria-label="Interactive system architecture diagram"
      className="flex flex-col gap-4"
    >
      {/* SVG Diagram */}
      <div className="w-full overflow-hidden rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm dark:bg-card/40">
        <svg
          aria-hidden="true"
          className="w-full text-foreground"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection edges */}
          <g>
            {EDGES.map(([from, to]) => {
              const fp = NODE_POSITIONS[from];
              const tp = NODE_POSITIONS[to];
              const isEdgeActive =
                hoveredNode !== null &&
                activeSet.has(from) &&
                activeSet.has(to);

              const edgeOpacity = getEdgeOpacity(hoveredNode, isEdgeActive);
              const fromNode = NODES.find((n) => n.id === from);
              const edgeColor = isEdgeActive
                ? (fromNode?.color ?? "#6b7280")
                : "currentColor";
              const strokeDash = isEdgeActive ? "none" : "4 3";
              const strokeW = isEdgeActive ? 2 : 1;

              return (
                <line
                  key={`${from}-${to}`}
                  opacity={edgeOpacity}
                  stroke={edgeColor}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                  strokeWidth={strokeW}
                  style={{
                    transition: shouldReduceMotion
                      ? "none"
                      : "opacity 0.2s ease, stroke 0.2s ease, stroke-width 0.15s ease",
                  }}
                  x1={fp.x}
                  x2={tp.x}
                  y1={fp.y}
                  y2={tp.y}
                />
              );
            })}
          </g>

          {/* Arrow markers on active edges */}
          <defs>
            <marker
              id="arrow-active"
              markerHeight="6"
              markerWidth="6"
              orient="auto"
              refX="3"
              refY="3"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
            </marker>
          </defs>

          {/* Nodes */}
          {NODES.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isActive =
              hoveredNode === null ? false : activeSet.has(node.id);
            const isDimmed = hoveredNode !== null && !activeSet.has(node.id);

            return (
              <DiagramNode
                isActive={isActive}
                isDimmed={isDimmed}
                isHovered={isHovered}
                key={node.id}
                node={node}
                onHover={setHoveredNode}
                reducedMotion={shouldReduceMotion}
              />
            );
          })}

          {/* Layer labels */}
          {(
            [
              { label: "Client Layer", y: 14 },
              { label: "Application Layer", y: 104 },
              { label: "Service Layer", y: 194 },
              { label: "Data Layer", y: 270 },
            ] as const
          ).map(({ y, label }) => (
            <text
              dominantBaseline="hanging"
              fill="currentColor"
              fontSize="7"
              fontWeight="500"
              key={label}
              opacity="0.3"
              style={{
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.05em",
                pointerEvents: "none",
                textTransform: "uppercase",
                userSelect: "none",
              }}
              textAnchor="start"
              x="8"
              y={y}
            >
              {label}
            </text>
          ))}

          {/* Horizontal guide lines */}
          {[32, 122, 212, 282].map((y) => (
            <line
              key={y}
              opacity="0.06"
              stroke="currentColor"
              strokeDasharray="2 4"
              strokeWidth="1"
              x1={0}
              x2={VB_W}
              y1={y}
              y2={y}
            />
          ))}
        </svg>
      </div>

      {/* Detail panel */}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="min-h-[80px] overflow-hidden rounded-xl border border-border/60 bg-card/40 px-5 py-4 backdrop-blur-sm dark:bg-card/30"
      >
        <AnimatePresence mode="wait">
          {activeNode ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1"
              exit={{ opacity: 0, y: -6 }}
              initial={{ opacity: 0, y: 6 }}
              key={activeNode.id}
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
              }
            >
              <p
                className="font-semibold text-foreground text-sm"
                style={{ color: activeNode.color }}
              >
                {activeNode.label}
                <span className="ml-2 font-normal text-muted-foreground text-xs">
                  {activeNode.sublabel}
                </span>
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {activeNode.description}
              </p>
            </motion.div>
          ) : (
            <motion.p
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-sm leading-relaxed"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="idle"
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
              }
            >
              Hover or focus a node to explore how the system layers connect —
              from React client to Spring Boot controller to PostgreSQL data
              store.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <ul
        aria-label="Node legend"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1"
      >
        {NODES.map((node) => (
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-muted-foreground text-xs transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={node.id}
            onBlur={() => setHoveredNode(null)}
            onClick={() =>
              setHoveredNode((prev) => (prev === node.id ? null : node.id))
            }
            onFocus={() => setHoveredNode(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            type="button"
          >
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            {node.label}
          </button>
        ))}
      </ul>
    </section>
  );
}
