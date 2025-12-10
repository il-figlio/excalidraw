import type { SignedOrder } from "./orders";

export interface TransactionCacheEntry {
  cacheKey: string;
  order: SignedOrder;
  status: "pending" | "submitted" | "confirmed";
}

export const TRANSACTION_CACHE_MODULE_PATH = "src/transaction-cache.ts";
