import PaymentFlowDiagram, {
  type PaymentFlowDefinition,
} from "@/components/sections/PaymentFlowDiagram";

export interface PrivateSwapFlowProps {
  headline: string;
}

const privateSwapFlow: PaymentFlowDefinition = {
  ariaLabel: "Private swap flow via Jupiter and MagicBlock",
  mockupLabel: "OffPay private swap screen",
  mockupSrc: "/mockups/private_swp.webp",
  mockupWidth: 576,
  mockupHeight: 1161,
  mockupCaption: "Jupiter route,",
  mockupCaptionAccent: "MagicBlock envelope.",
  nodes: [
    {
      id: "gate",
      step: "01",
      title: "Privacy capability",
      description: "Enable only when swap privacy-envelope routes are available.",
      tone: "setup",
      compactSourcePosition: "top",
    },
    {
      id: "executor",
      step: "02",
      title: "One-time executor",
      description: "Client creates an ephemeral executor wallet for the envelope session.",
      tone: "private",
      compactTargetPosition: "bottom",
      compactSourcePosition: "right",
    },
    {
      id: "prepare",
      step: "03",
      title: "Prepare envelope",
      description: "Call /api/swap/privacy-envelope/prepare with executor, pair, amount, slippage.",
      tone: "magic",
      iconSrc: "/node_icons/MagicBlock-Logomark-Black.svg",
      desktopSourcePosition: "bottom",
      compactTargetPosition: "left",
      compactSourcePosition: "bottom",
    },
    {
      id: "fund",
      step: "04",
      title: "Init & fund",
      description: "Active wallet and executor sign required initialization and funding txs.",
      tone: "send",
      desktopTargetPosition: "top",
      desktopSourcePosition: "left",
      compactTargetPosition: "top",
      compactSourcePosition: "bottom",
    },
    {
      id: "quote",
      step: "05",
      title: "Quote finalize",
      description: "Executor signs the Jupiter quote; expired quotes refresh before finalize.",
      tone: "backend",
      iconSrc: "/node_icons/logo-bright.svg",
      desktopTargetPosition: "right",
      desktopSourcePosition: "left",
      compactTargetPosition: "top",
      compactSourcePosition: "left",
    },
    {
      id: "settle",
      step: "06",
      title: "Settlement tx",
      description: "Sign and broadcast returned settlement transaction; app records output amount.",
      tone: "settle",
      desktopTargetPosition: "right",
      compactTargetPosition: "right",
    },
  ],
  desktopPositions: {
    gate: { x: 0, y: 58 },
    executor: { x: 360, y: 58 },
    prepare: { x: 720, y: 58 },
    fund: { x: 720, y: 330 },
    quote: { x: 360, y: 330 },
    settle: { x: 0, y: 330 },
  },
  compactPositions: {
    gate: { x: 0, y: 160 },
    executor: { x: 0, y: 0 },
    prepare: { x: 220, y: 0 },
    fund: { x: 220, y: 160 },
    quote: { x: 220, y: 320 },
    settle: { x: 0, y: 320 },
  },
  desktopEdges: [
    {
      id: "gate-executor",
      source: "gate",
      target: "executor",
      phase: 1,
    },
    {
      id: "executor-prepare",
      source: "executor",
      target: "prepare",
      phase: 2,
    },
    {
      id: "prepare-fund",
      source: "prepare",
      target: "fund",
      phase: 2,
    },
    {
      id: "fund-quote",
      source: "fund",
      target: "quote",
      phase: 3,
    },
    {
      id: "quote-settle",
      source: "quote",
      target: "settle",
      phase: 4,
    },
  ],
  compactEdges: [
    {
      id: "gate-executor",
      source: "gate",
      target: "executor",
      phase: 1,
    },
    {
      id: "executor-prepare",
      source: "executor",
      target: "prepare",
      phase: 2,
    },
    {
      id: "prepare-fund",
      source: "prepare",
      target: "fund",
      phase: 3,
    },
    { id: "fund-quote", source: "fund", target: "quote", phase: 3 },
    {
      id: "quote-settle",
      source: "quote",
      target: "settle",
      phase: 4,
    },
  ],
};

export default function PrivateSwapFlow({ headline }: PrivateSwapFlowProps) {
  return (
    <>
      <h2 className="hiw-title hiw-title--mobile">{headline}</h2>
      <PaymentFlowDiagram definition={privateSwapFlow} />
    </>
  );
}
