import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";
import {
  BUILDER_MODULE_PATH,
  LAYER1_MODULE_PATH,
  SIGNED_ORDER_MODULE_PATH,
  TRANSACTION_CACHE_MODULE_PATH,
  WALLET_MODULE_PATH,
} from "../path/to/signet-orders/src";
import type {
  Layer1Transaction,
  SignedOrder,
  SignedOrderBuilder,
  TransactionCacheEntry,
  WalletSigner,
} from "../path/to/signet-orders/src";

const nodeWidth = 240;
const nodeHeight = 90;
const nodeGap = 140;
const baseY = 120;

const nodeX = (index: number) => index * (nodeWidth + nodeGap);

const nodes: Array<{
  title: string;
  modulePath: string;
}> = [
  {
    title: `WalletSigner (${WALLET_MODULE_PATH})`,
    modulePath: "Wallet signer responsible for user approvals",
  },
  {
    title: `SignedOrder (${SIGNED_ORDER_MODULE_PATH})`,
    modulePath: "Signet SDK order model",
  },
  {
    title: `TransactionCacheEntry (${TRANSACTION_CACHE_MODULE_PATH})`,
    modulePath: "Persist signed orders before submission",
  },
  {
    title: `SignedOrderBuilder (${BUILDER_MODULE_PATH})`,
    modulePath: "Turns cached orders into Ethereum calldata",
  },
  {
    title: `Layer1Transaction (${LAYER1_MODULE_PATH})`,
    modulePath: "Final transaction on Ethereum L1",
  },
];

const makeNode = (x: number, title: string, subtitle: string): ExcalidrawElementSkeleton => ({
  type: "rectangle",
  x,
  y: baseY,
  width: nodeWidth,
  height: nodeHeight,
  backgroundColor: "#e7f5ff",
  strokeColor: "#1864ab",
  label: {
    text: `${title}\n${subtitle}`,
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 16,
  },
});

const makeArrow = (index: number, text: string): ExcalidrawElementSkeleton => ({
  type: "arrow",
  x: nodeX(index) + nodeWidth,
  y: baseY + nodeHeight / 2,
  width: nodeGap,
  height: 0,
  startArrowhead: "dot",
  endArrowhead: "triangle",
  label: { text },
  strokeColor: "#364fc7",
});

export const makeSignedOrderLifecycleDiagram = (): ExcalidrawElementSkeleton[] => {
  const nodeElements = nodes.map((node, index) =>
    makeNode(nodeX(index), node.title, node.modulePath),
  );

  const arrows: ExcalidrawElementSkeleton[] = [
    makeArrow(0, "sign order"),
    makeArrow(1, "cache"),
    makeArrow(2, "builder"),
    makeArrow(3, "L1 tx"),
  ];

  return nodeElements.concat(arrows);
};

// Type usages ensure the helper stays aligned with the signet-orders source modules.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeCheck: [
  WalletSigner,
  SignedOrder,
  TransactionCacheEntry,
  SignedOrderBuilder,
  Layer1Transaction,
] = [
  { address: "0x", chainId: 1 },
  {
    orderId: "example-order",
    maker: "0xmaker",
    taker: "0xtaker",
    payload: "0xdeadbeef",
    signature: "0xsig",
  },
  {
    cacheKey: "order-cache",
    order: {
      orderId: "example-order",
      maker: "0xmaker",
      taker: "0xtaker",
      payload: "0xdeadbeef",
      signature: "0xsig",
    },
    status: "pending",
  },
  {
    buildLayer1Transaction: (order: SignedOrder) => order.payload,
  },
  {
    hash: "0xhash",
    from: "0xmaker",
    to: "0xtaker",
  },
];
