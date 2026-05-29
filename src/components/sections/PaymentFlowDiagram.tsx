"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";

export type PaymentFlowTone =
  | "setup"
  | "send"
  | "receive"
  | "queue"
  | "settle"
  | "magic"
  | "private"
  | "backend";

type PaymentStepData = {
  step: string;
  title: string;
  description: string;
  tone: PaymentFlowTone;
  compact: boolean;
  desktopTargetPosition?: HandleSide;
  desktopSourcePosition?: HandleSide;
  compactTargetPosition?: HandleSide;
  compactSourcePosition?: HandleSide;
  hasTargetHandle: boolean;
  hasSourceHandle: boolean;
  iconSrc?: string;
};

export type PaymentStepSourceData = Omit<
  PaymentStepData,
  "compact" | "hasTargetHandle" | "hasSourceHandle"
> & {
  id: string;
};

type PaymentStepNode = Node<PaymentStepData, "paymentStep">;
type HandleSide = "top" | "right" | "bottom" | "left";

const handlePositionMap: Record<HandleSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

const edgeBeamColor = "#FF2E88";

export type FlowPositionMap = Record<string, { x: number; y: number }>;

export type FlowEdgeSource = {
  id: string;
  source: string;
  target: string;
  phase: 1 | 2 | 3 | 4;
};

export type PaymentFlowDefinition = {
  ariaLabel: string;
  mockupLabel: string;
  mockupSrc?: string;
  mockupWidth?: number;
  mockupHeight?: number;
  mockupCaption?: string;
  mockupCaptionAccent?: string;
  nodes: PaymentStepSourceData[];
  desktopPositions: FlowPositionMap;
  compactPositions: FlowPositionMap;
  desktopEdges: FlowEdgeSource[];
  compactEdges: FlowEdgeSource[];
};

function createPaymentNodes(
  nodeData: PaymentStepSourceData[],
  positions: FlowPositionMap,
  compact: boolean,
  edgeData: FlowEdgeSource[]
): PaymentStepNode[] {
  const nodesWithIncoming = new Set(edgeData.map((edge) => edge.target));
  const nodesWithOutgoing = new Set(edgeData.map((edge) => edge.source));

  return nodeData.map(({ id, ...data }) => ({
    id,
    type: "paymentStep",
    position: positions[id],
    data: {
      ...data,
      compact,
      hasTargetHandle: nodesWithIncoming.has(id),
      hasSourceHandle: nodesWithOutgoing.has(id),
    },
  }));
}

function createPaymentEdges(edgeData: FlowEdgeSource[]): Edge[] {
  return edgeData.map((edge) => ({
    ...edge,
    type: "smoothstep",
    className: `hiw-edge hiw-edge--phase-${edge.phase}`,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edgeBeamColor,
      width: 16,
      height: 16,
    },
    style: {
      stroke: edgeBeamColor,
      strokeWidth: 2.4,
    },
  }));
}

function PaymentStepNode({ data }: NodeProps<PaymentStepNode>) {
  const targetPosition = data.compact
    ? handlePositionMap[data.compactTargetPosition ?? "top"]
    : handlePositionMap[data.desktopTargetPosition ?? "left"];
  const sourcePosition = data.compact
    ? handlePositionMap[data.compactSourcePosition ?? "bottom"]
    : handlePositionMap[data.desktopSourcePosition ?? "right"];

  return (
    <article className={`hiw-node-card hiw-node-card--${data.tone}`}>
      {data.hasTargetHandle && (
        <Handle
          type="target"
          position={targetPosition}
          className="hiw-node-card__handle"
        />
      )}
      <div className="hiw-node-card__step" aria-hidden="true">
        {data.step}
      </div>
      <div>
        <div className="hiw-node-card__title-row">
          {data.iconSrc && (
            <Image
              src={data.iconSrc}
              alt=""
              aria-hidden="true"
              width={18}
              height={18}
              className="hiw-node-card__icon"
            />
          )}
          <h3 className="hiw-node-card__title">{data.title}</h3>
        </div>
        <p className="hiw-node-card__description">{data.description}</p>
      </div>
      {data.hasSourceHandle && (
        <Handle
          type="source"
          position={sourcePosition}
          className="hiw-node-card__handle"
        />
      )}
    </article>
  );
}

const nodeTypes = {
  paymentStep: PaymentStepNode,
};

function FlowCanvas({ definition }: { definition: PaymentFlowDefinition }) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const flowRef = useRef<ReactFlowInstance<PaymentStepNode, Edge> | null>(null);
  const [isCompactFlow, setIsCompactFlow] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const positions = isCompactFlow
    ? definition.compactPositions
    : definition.desktopPositions;
  const edgeData = isCompactFlow
    ? definition.compactEdges
    : definition.desktopEdges;
  const paymentNodes = useMemo(
    () => createPaymentNodes(definition.nodes, positions, isCompactFlow, edgeData),
    [definition.nodes, edgeData, isCompactFlow, positions]
  );
  const paymentEdges = useMemo(() => createPaymentEdges(edgeData), [edgeData]);
  const fitPadding = isCompactFlow ? 0.08 : 0.12;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let frame = 0;
    const updateLayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nextCompact = panel.clientWidth < 640;
        setIsCompactFlow((prev) => {
          // Bump layoutVersion only when we actually flipped, so we don't
          // run a fitView pass for every pixel of resize.
          if (prev !== nextCompact) {
            setLayoutVersion((value) => value + 1);
            return nextCompact;
          }
          return prev;
        });
      });
    };

    updateLayout();
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(panel);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      flowRef.current?.fitView({ padding: fitPadding, duration: 180 });
    });

    return () => cancelAnimationFrame(frame);
  }, [fitPadding, layoutVersion, paymentEdges, paymentNodes]);

  return (
    <div
      ref={panelRef}
      className={`hiw-flow-panel ${isCompactFlow ? "hiw-flow-panel--compact" : "hiw-flow-panel--desktop"}`}
      aria-label={definition.ariaLabel}
    >
      <ReactFlow
        key={`${definition.ariaLabel}-${isCompactFlow ? "compact" : "desktop"}`}
        nodes={paymentNodes}
        edges={paymentEdges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          flowRef.current = instance;
          instance.fitView({ padding: fitPadding });
        }}
        fitView
        fitViewOptions={{ padding: fitPadding }}
        minZoom={0.35}
        maxZoom={1.35}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={20}
          size={1}
          color="rgba(252, 252, 255, 0.26)"
        />
      </ReactFlow>
    </div>
  );
}

export default function PaymentFlowDiagram({
  definition,
}: {
  definition: PaymentFlowDefinition;
}) {
  const hasCaption = definition.mockupCaption || definition.mockupCaptionAccent;

  return (
    <div className="hiw-layout">
      <FlowCanvas definition={definition} />

      <div className="hiw-mockup-card" aria-label={definition.mockupLabel}>
        {definition.mockupSrc ? (
          <div className="hiw-mockup-card__content">
            {hasCaption && (
              <p className="hiw-mockup-card__caption">
                {definition.mockupCaption && (
                  <span className="hiw-mockup-card__caption-main">
                    {definition.mockupCaption}
                  </span>
                )}
                {definition.mockupCaptionAccent && (
                  <span className="hiw-mockup-card__caption-accent">
                    {definition.mockupCaptionAccent}
                  </span>
                )}
              </p>
            )}
            <Image
              src={definition.mockupSrc}
              alt={definition.mockupLabel}
              width={definition.mockupWidth ?? 390}
              height={definition.mockupHeight ?? 844}
              style={{ width: "100%", height: "auto" }}
              className="hiw-mockup-card__image"
              priority
            />
          </div>
        ) : (
          <div className="hiw-mockup-card__placeholder">
            {definition.mockupLabel}
          </div>
        )}
      </div>
    </div>
  );
}
