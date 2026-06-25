import type { NavSection } from "@/components/Sidebar";

export const SCREEN_LABELS: Record<NavSection, { title: string; sub: string }> =
  {
    wallet: { title: "Wallet", sub: "Manage your connected wallet" },
    account: { title: "Account", sub: "Balances and account details" },
    transactions: { title: "Transactions", sub: "Send payments on Stellar" },
    soroban: { title: "Soroban", sub: "Invoke smart contracts" },
    network: { title: "Network", sub: "Switch between networks" },
  };
