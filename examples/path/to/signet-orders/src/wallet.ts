export interface WalletSigner {
  address: string;
  chainId: number;
}

export const WALLET_MODULE_PATH = "src/wallet.ts";
