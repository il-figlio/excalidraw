export interface SignedOrder {
  orderId: string;
  maker: string;
  taker: string;
  payload: string;
  signature: string;
}

export const SIGNED_ORDER_MODULE_PATH = "src/orders.ts";
