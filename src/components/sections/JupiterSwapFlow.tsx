import PaymentFlowDiagram, {
  type PaymentFlowDefinition,
} from "@/components/sections/PaymentFlowDiagram";

export interface JupiterSwapFlowProps {
  headline: string;
}

const jupiterSwapFlow: PaymentFlowDefinition = {
  ariaLabel: "Jupiter in-app swap flow",
  mockupLabel: "OffPay advanced swap screen showing target and repeat modes",
  mockupSrc: "/mockups/jup-swap.webp",
  mockupWidth: 1023,
  mockupHeight: 1211,
  mockupCaption: "Quote, sign, execute,",
  mockupCaptionAccent: "or schedule advanced orders.",
  nodes: [
    {
      id: "tokenList",
      step: "01",
      title: "Tokens & prices",
      description: "Fetch verified tokens and USD prices from backend Jupiter routes.",
      tone: "setup",
      iconSrc: "/node_icons/logo-bright.svg",
      compactSourcePosition: "top",
    },
    {
      id: "quote",
      step: "02",
      title: "Live quote",
      description: "Debounced /api/swap/quote returns route summary, fee, slippage, and expiry.",
      tone: "magic",
      iconSrc: "/node_icons/logo-bright.svg",
      compactTargetPosition: "bottom",
      compactSourcePosition: "bottom",
    },
    {
      id: "checks",
      step: "03",
      title: "Local checks",
      description: "Verify balance, SOL fee buffer, receive ATA rent, and quote freshness.",
      tone: "receive",
      compactTargetPosition: "top",
      compactSourcePosition: "bottom",
    },
    {
      id: "signSwap",
      step: "04",
      title: "Sign & execute",
      description: "Wallet signs the unsigned transaction; backend executes quoteId.",
      tone: "send",
      desktopSourcePosition: "bottom",
      compactTargetPosition: "top",
      compactSourcePosition: "left",
    },
    {
      id: "advanced",
      step: "05",
      title: "Target orders",
      description: "Trigger flow signs auth challenge, deposit tx, then creates the order.",
      tone: "private",
      desktopTargetPosition: "right",
      desktopSourcePosition: "left",
      compactTargetPosition: "right",
      compactSourcePosition: "top",
    },
    {
      id: "recurring",
      step: "06",
      title: "Repeat swaps",
      description: "Recurring flow creates a plan, signs its tx, and executes through backend.",
      tone: "settle",
      desktopTargetPosition: "right",
      compactTargetPosition: "bottom",
    },
  ],
  desktopPositions: {
    tokenList: { x: 0, y: 190 },
    quote: { x: 285, y: 54 },
    checks: { x: 690, y: 54 },
    signSwap: { x: 975, y: 190 },
    advanced: { x: 690, y: 334 },
    recurring: { x: 285, y: 334 },
  },
  compactPositions: {
    tokenList: { x: 0, y: 160 },
    quote: { x: 220, y: 0 },
    checks: { x: 220, y: 160 },
    signSwap: { x: 220, y: 320 },
    advanced: { x: 0, y: 320 },
    recurring: { x: 0, y: 0 },
  },
  desktopEdges: [
    {
      id: "tokens-quote",
      source: "tokenList",
      target: "quote",
      phase: 1,
    },
    {
      id: "quote-checks",
      source: "quote",
      target: "checks",
      phase: 2,
    },
    {
      id: "checks-sign",
      source: "checks",
      target: "signSwap",
      phase: 2,
    },
    {
      id: "sign-advanced",
      source: "signSwap",
      target: "advanced",
      phase: 3,
    },
    {
      id: "advanced-recurring",
      source: "advanced",
      target: "recurring",
      phase: 4,
    },
  ],
  compactEdges: [
    {
      id: "tokens-quote",
      source: "tokenList",
      target: "quote",
      phase: 1,
    },
    {
      id: "quote-checks",
      source: "quote",
      target: "checks",
      phase: 2,
    },
    {
      id: "checks-sign",
      source: "checks",
      target: "signSwap",
      phase: 3,
    },
    { id: "sign-advanced", source: "signSwap", target: "advanced", phase: 3 },
    {
      id: "advanced-recurring",
      source: "advanced",
      target: "recurring",
      phase: 4,
    },
  ],
};

export default function JupiterSwapFlow({ headline }: JupiterSwapFlowProps) {
  return (
    <>
      <h2 className="hiw-title hiw-title--mobile">{headline}</h2>
      <PaymentFlowDiagram definition={jupiterSwapFlow} />
    </>
  );
}
