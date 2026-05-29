import PaymentFlowDiagram, {
  type PaymentFlowDefinition,
} from "@/components/sections/PaymentFlowDiagram";

export interface UmbraPrivacyFlowProps {
  headline: string;
}

const umbraFlow: PaymentFlowDefinition = {
  ariaLabel: "Umbra ZK privacy flow",
  mockupLabel: "Umbra shielded vault mockup",
  mockupSrc: "/mockups/umbra.webp",
  mockupWidth: 576,
  mockupHeight: 1161,
  mockupCaption: "Shielded stablecoin actions,",
  mockupCaptionAccent: "signed on-device.",
  nodes: [
    {
      id: "gate",
      step: "01",
      title: "Network gate",
      description: "Umbra actions require a supported network, supported tokens, and execution capability.",
      tone: "setup",
      iconSrc: "/node_icons/umbra-mark.svg",
      desktopSourcePosition: "bottom",
      compactSourcePosition: "right",
    },
    {
      id: "rpc",
      step: "02",
      title: "Backend RPC deps",
      description: "Umbra SDK reads accounts, blockhashes, slots, and statuses via OffPay RPC.",
      tone: "backend",
      desktopTargetPosition: "top",
      compactTargetPosition: "left",
      compactSourcePosition: "bottom",
    },
    {
      id: "register",
      step: "03",
      title: "Register vault",
      description: "Client signer creates the encrypted-balance account and derives Umbra PDAs locally.",
      tone: "private",
      iconSrc: "/node_icons/umbra-mark.svg",
      desktopSourcePosition: "bottom",
      compactTargetPosition: "top",
      compactSourcePosition: "left",
    },
    {
      id: "balances",
      step: "04",
      title: "Reconcile UTXOs",
      description: "Indexer scan derives nullifier hashes and reconciles against on-chain nullifier-set accounts.",
      tone: "receive",
      desktopTargetPosition: "top",
      compactTargetPosition: "right",
      compactSourcePosition: "bottom",
    },
    {
      id: "shield",
      step: "05",
      title: "Shield",
      description: "Public balance becomes encrypted balance; Arcium callback finalizes before UI confirms.",
      tone: "magic",
      iconSrc: "/node_icons/umbra-mark.svg",
      desktopSourcePosition: "bottom",
      compactTargetPosition: "top",
      compactSourcePosition: "right",
    },
    {
      id: "withdraw",
      step: "06",
      title: "Withdraw",
      description: "Encrypted balance returns to a public wallet; Arcium callback gates the success screen.",
      tone: "settle",
      iconSrc: "/node_icons/umbra-mark.svg",
      desktopTargetPosition: "top",
      compactTargetPosition: "left",
    },
  ],
  desktopPositions: {
    gate: { x: 0, y: 54 },
    rpc: { x: 0, y: 334 },
    register: { x: 420, y: 54 },
    balances: { x: 420, y: 334 },
    shield: { x: 840, y: 54 },
    withdraw: { x: 840, y: 334 },
  },
  compactPositions: {
    gate: { x: 0, y: 0 },
    rpc: { x: 220, y: 0 },
    register: { x: 220, y: 160 },
    balances: { x: 0, y: 160 },
    shield: { x: 0, y: 320 },
    withdraw: { x: 220, y: 320 },
  },
  desktopEdges: [
    {
      id: "gate-rpc",
      source: "gate",
      target: "rpc",
      phase: 1,
    },
    {
      id: "rpc-register",
      source: "rpc",
      target: "register",
      phase: 2,
    },
    {
      id: "register-balances",
      source: "register",
      target: "balances",
      phase: 2,
    },
    {
      id: "balances-shield",
      source: "balances",
      target: "shield",
      phase: 3,
    },
    {
      id: "shield-withdraw",
      source: "shield",
      target: "withdraw",
      phase: 4,
    },
  ],
  compactEdges: [
    {
      id: "gate-rpc",
      source: "gate",
      target: "rpc",
      phase: 1,
    },
    {
      id: "rpc-register",
      source: "rpc",
      target: "register",
      phase: 2,
    },
    {
      id: "register-balances",
      source: "register",
      target: "balances",
      phase: 3,
    },
    { id: "balances-shield", source: "balances", target: "shield", phase: 3 },
    {
      id: "shield-withdraw",
      source: "shield",
      target: "withdraw",
      phase: 4,
    },
  ],
};

export default function UmbraPrivacyFlow({ headline }: UmbraPrivacyFlowProps) {
  return (
    <>
      <h2 className="hiw-title hiw-title--mobile">{headline}</h2>
      <PaymentFlowDiagram definition={umbraFlow} />
    </>
  );
}
