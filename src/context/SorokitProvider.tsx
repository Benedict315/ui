import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AccountData,
  Balance,
  NetworkInfo,
  NetworkName,
} from "@/lib/client";

import { SorokitContext, type SorokitProviderProps } from "./SorokitContext";

export function SorokitProvider({ client, children }: SorokitProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load network on mount
  useEffect(() => {
    let active = true;

    const timerId = window.setTimeout(() => {
      client.network.getNetwork().then(({ data, error: nextError }) => {
        if (!active) return;
        if (data) setNetwork(data);
        if (nextError) setError(nextError);
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [client]);

  // Load account when address changes
  useEffect(() => {
    if (!address) return;

    let active = true;
    const timerId = window.setTimeout(() => {
      setIsLoadingAccount(true);
      Promise.all([
        client.account.getAccount(address),
        client.account.getBalances(address),
      ])
        .then(([accountRes, balancesRes]) => {
          if (!active) return;
          if (accountRes.data) setAccount(accountRes.data);
          if (balancesRes.data) setBalances(balancesRes.data);
          if (accountRes.error) setError(accountRes.error);
          else if (balancesRes.error) setError(balancesRes.error);
        })
        .finally(() => {
          if (active) setIsLoadingAccount(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [address, client]);

  function detectWalletName(): string | null {
    if (typeof window === "undefined") return null;
    const win = window as unknown as Record<string, unknown>;
    if (win.freighter) return "Freighter";
    if (win.xBull) return "xBull";
    if (win.albedo) return "Albedo";
    if (win.lobstr) return "Lobstr";
    return null;
  }

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const name = detectWalletName();
      setWalletName(name);
      const { data, error } = await client.wallet.connect();
      if (error) {
        setError(error);
        return;
      }
      if (data?.address) setAddress(data.address);
    } finally {
      setIsConnecting(false);
    }
  }, [client]);

  const disconnectWallet = useCallback(async () => {
    await client.wallet.disconnect();
    setAddress(null);
    setWalletName(null);
    setAccount(null);
    setBalances([]);
  }, [client]);

  const switchNetwork = useCallback(
    async (name: NetworkName) => {
      const { data, error } = await client.network.switchNetwork(name);
      if (error) {
        setError(error);
        return;
      }
      if (data) {
        setError(null);
        setNetwork(data);
        setAddress(null);
        setAccount(null);
        setBalances([]);
      }
    },
    [client],
  );

  const clearError = useCallback(() => setError(null), []);

  const refreshAccount = useCallback(async () => {
    if (!address) return;
    setIsLoadingAccount(true);
    try {
      const [accountRes, balancesRes] = await Promise.all([
        client.account.getAccount(address),
        client.account.getBalances(address),
      ]);
      if (accountRes.data) setAccount(accountRes.data);
      if (balancesRes.data) setBalances(balancesRes.data);
      if (accountRes.error) setError(accountRes.error);
      else if (balancesRes.error) setError(balancesRes.error);
    } finally {
      setIsLoadingAccount(false);
    }
  }, [address, client]);

  const value = useMemo(
    () => ({
      address,
      walletName,
      isConnected: !!address,
      isConnecting,
      isLoading: isConnecting || isLoadingAccount,
      connectWallet,
      disconnectWallet,
      account,
      balances,
      isLoadingAccount,
      refreshAccount,
      network,
      switchNetwork,
      error,
      clearError,
    }),
    [
      address,
      walletName,
      isConnecting,
      isLoadingAccount,
      connectWallet,
      disconnectWallet,
      account,
      balances,
      refreshAccount,
      network,
      switchNetwork,
      error,
      clearError,
    ],
  );

  return (
    <SorokitContext.Provider value={value}>{children}</SorokitContext.Provider>
  );
}
