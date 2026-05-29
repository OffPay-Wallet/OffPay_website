import PaymentFlowDiagram, {
  type PaymentFlowDefinition,
} from "@/components/sections/PaymentFlowDiagram";

export interface PrivateP2PFlowProps {
  headline: string;
}

const privateP2pFlow: PaymentFlowDefinition = {
  ariaLabel: "Private P2P payment flow",
  mockupLabel: "OffPay private payment summary screen",
  mockupSrc: "/mockups/p2p.webp",
  mockupWidth: 672,
  mockupHeight: 1313,
  mockupCaption: "Private stablecoin send,",
  mockupCaptionAccent: "verified before signing.",
  nodes: [
    {
      id: "capabilities",
      step: "01",
      title: "Capability gate",
      description: "Check private init, balance, send, settle, and stablecoin support.",
      tone: "setup",
      compactSourcePosition: "top",
    },
    {
      id: "init",
      step: "02",
      title: "Init mint",
      description: "Call /api/payment/private-init-mint and sign setup if required.",
      tone: "backend",
      compactTargetPosition: "bottom",
      compactSourcePosition: "left",
    },
    {
      id: "magicblock",
      step: "03",
      title: "MagicBlock tx",
      description: "Request /api/payment/private-send for a private unsigned tx.",
      tone: "magic",
      iconSrc: "/node_icons/MagicBlock-Logomark-Black.svg",
      compactTargetPosition: "right",
      compactSourcePosition: "bottom",
    },
    {
      id: "verify",
      step: "04",
      title: "Verify route",
      description: "Validate signer, mint, amount, recipient, and private-route metadata.",
      tone: "private",
      desktopSourcePosition: "bottom",
      compactTargetPosition: "top",
      compactSourcePosition: "bottom",
    },
    {
      id: "broadcast",
      step: "05",
      title: "Sign & broadcast",
      description: "Wallet signs locally; backend RPC broadcasts the signed blob.",
      tone: "send",
      desktopTargetPosition: "right",
      desktopSourcePosition: "left",
      compactTargetPosition: "top",
      compactSourcePosition: "left",
    },
    {
      id: "settle",
      step: "06",
      title: "Retry backup",
      description: "Retryable failures become encrypted pending backups for settlement.",
      tone: "settle",
      desktopTargetPosition: "right",
      compactTargetPosition: "right",
    },
  ],
  desktopPositions: {
    capabilities: { x: 0, y: 190 },
    init: { x: 285, y: 54 },
    magicblock: { x: 690, y: 54 },
    verify: { x: 975, y: 190 },
    broadcast: { x: 690, y: 334 },
    settle: { x: 285, y: 334 },
  },
  compactPositions: {
    capabilities: { x: 0, y: 160 },
    init: { x: 220, y: 0 },
    magicblock: { x: 0, y: 0 },
    verify: { x: 220, y: 160 },
    broadcast: { x: 220, y: 320 },
    settle: { x: 0, y: 320 },
  },
  desktopEdges: [
    {
      id: "capabilities-init",
      source: "capabilities",
      target: "init",
      phase: 1,
    },
    {
      id: "init-magicblock",
      source: "init",
      target: "magicblock",
      phase: 2,
    },
    {
      id: "magicblock-verify",
      source: "magicblock",
      target: "verify",
      phase: 2,
    },
    {
      id: "verify-broadcast",
      source: "verify",
      target: "broadcast",
      phase: 3,
    },
    {
      id: "broadcast-settle",
      source: "broadcast",
      target: "settle",
      phase: 4,
    },
  ],
  compactEdges: [
    {
      id: "capabilities-init",
      source: "capabilities",
      target: "init",
      phase: 1,
    },
    { id: "init-magicblock", source: "init", target: "magicblock", phase: 2 },
    { id: "magicblock-verify", source: "magicblock", target: "verify", phase: 2 },
    { id: "verify-broadcast", source: "verify", target: "broadcast", phase: 3 },
    {
      id: "broadcast-settle",
      source: "broadcast",
      target: "settle",
      phase: 4,
    },
  ],
};

export default function PrivateP2PFlow({ headline }: PrivateP2PFlowProps) {
  return (
    <>
      <h2 className="hiw-title hiw-title--mobile">{headline}</h2>
      <PaymentFlowDiagram definition={privateP2pFlow} />
    </>
  );
}
