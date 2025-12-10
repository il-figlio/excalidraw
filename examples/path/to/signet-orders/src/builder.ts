import type { SignedOrder } from "./orders";

export interface SignedOrderBuilder {
  buildLayer1Transaction(order: SignedOrder): string;
}

export const BUILDER_MODULE_PATH = "src/builder.ts";
