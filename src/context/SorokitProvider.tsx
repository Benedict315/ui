import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  AccountData,
  Balance,
  NetworkInfo,
  NetworkName,
} from "@/lib/client";

import { SorokitContext, type SorokitProviderProps } from "./SorokitContext";

const STORAGE_KEY_NETWORK = "sorokit_network";
const STORAGE_KEY_CUSTOM_NETWORKS = "sorokit_custom_networks";

export function SorokitProvider({ client, onError, children }: SorokitProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [customNetworks, setCustomNetworks] = useState<NetworkInfo[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_CUSTOM_NETWORKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [errorSeverity, setErrorSeverity] = useState<"info" | "error">("error");
  const [errorHistory, setErrorHistory] = useState<string[]>([]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const reportError = useCallback(
    (err: string, source: string, severity: "info" | "error" = "error") => {
      setError(err);
      setErrorSeverity(severity);
      setErrorHistory((prev) => [...prev, err]);
      onErrorRef.current?.(err, source);
    },
    [],
  );

  // Load network on mount with localStorage persistence restore
  useEffect(() => {
    let active = true;

    const timerId = window.setTimeout(() => {
      let savedNet: string | NetworkInfo | null = null;
      try {
        const item = window.localStorage.getItem(STORAGE_KEY_NETWORK);
        if (item) {
          try {
            savedNet = JSON.parse(item);
          } catch {
            savedNet = item as NetworkName;
          }
        }
      } catch {
        savedNet = null;
      }

      if (savedNet) {
        client.network.switchNetwork(savedNet).then(({ data, error: nextError }) => {
          if (!active) return;
          if (data) setNetwork(data);
          else client.network.getNetwork().then(({ data: fallbackData }) => {
            if (active && fallbackData) setNetwork(fallbackData);
          });
          if (nextError) reportError(nextError, "network", "info");
        });
      } else {
        client.network.getNetwork().then(({ data, error: nextError }) => {
          if (!active) return;
          if (data) setNetwork(data);
          if (nextError) reportError(nextError, "network", "info");
        });
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [client, reportError]);

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
          if (accountRes.error) reportError(accountRes.error, "account", "error");
          else if (balancesRes.error) reportError(balancesRes.error, "account", "error");
        })
        .finally(() => {
          if (active) setIsLoadingAccount(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [address, client, reportError]);

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
        reportError(error, "wallet", "error");
        return;
      }
      if (data?.address) setAddress(data.address);
    } finally {
      setIsConnecting(false);
    }
  }, [client, reportError]);

  const disconnectWallet = useCallback(async () => {
    await client.wallet.disconnect();
    setAddress(null);
    setWalletName(null);
    setAccount(null);
    setBalances([]);
  }, [client]);

  const switchNetwork = useCallback(
    async (param: NetworkName | NetworkInfo) => {
      const { data, error } = await client.network.switchNetwork(param);
      if (error) {
        reportError(error, "network", "error");
        return;
      }
      if (data) {
        setError(null);
        setNetwork(data);
        try {
          window.localStorage.setItem(
            STORAGE_KEY_NETWORK,
            typeof param === "string" ? param : JSON.stringify(data),
          );
        } catch {
          /* fallback */
        }
        setAddress(null);
        setAccount(null);
        setBalances([]);
      }
    },
    [client, reportError],
  );

  const addCustomNetwork = useCallback(
    async (config: NetworkInfo) => {
      setCustomNetworks((prev) => {
        const next = [...prev.filter((n) => n.name !== config.name), config];
        try {
          window.localStorage.setItem(
            STORAGE_KEY_CUSTOM_NETWORKS,
            JSON.stringify(next),
          );
        } catch {
          /* fallback */
        }
        return next;
      });
      await switchNetwork(config);
    },
    [switchNetwork],
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
      if (accountRes.error) reportError(accountRes.error, "account", "error");
      else if (balancesRes.error) reportError(balancesRes.error, "account", "error");
    } finally {
      setIsLoadingAccount(false);
    }
  }, [address, client, reportError]);

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
      customNetworks,
      addCustomNetwork,
      error,
      errorSeverity,
      errorHistory,
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
      customNetworks,
      addCustomNetwork,
      error,
      errorSeverity,
      errorHistory,
      clearError,
    ],
  );

  return (
    <SorokitContext.Provider value={value}>{children}</SorokitContext.Provider>
  );
}
