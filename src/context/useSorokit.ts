import { useContext } from "react";

import { SorokitContext, type SorokitState } from "./sorokit-context";

const safeDefaults: SorokitState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  account: null,
  balances: [],
  isLoadingAccount: false,
  refreshAccount: async () => {},
  network: null,
  switchNetwork: async () => {},
  error: null,
  clearError: () => {},
};

export function useSorokit(): SorokitState {
  const ctx = useContext(SorokitContext);
  if (!ctx) {
    console.warn(
      "[sorokit-ui] useSorokit used outside <SorokitProvider>. Returning safe defaults.",
    );
    return safeDefaults;
  }
  return ctx;
}
