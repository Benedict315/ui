import { createContext } from "react";

import type {
  AccountData,
  Balance,
  NetworkInfo,
  NetworkName,
  SorokitClient,
} from "@/lib/client";

export interface SorokitState {
  address: string | null;
  walletName: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  account: AccountData | null;
  balances: Balance[];
  isLoadingAccount: boolean;
  refreshAccount: () => Promise<void>;
  network: NetworkInfo | null;
  switchNetwork: (network: NetworkName | NetworkInfo) => Promise<void>;
  customNetworks?: NetworkInfo[];
  addCustomNetwork?: (config: NetworkInfo) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export interface SorokitProviderProps {
  client: SorokitClient;
  children: React.ReactNode;
}

export const SorokitContext = createContext<SorokitState | null>(null);
