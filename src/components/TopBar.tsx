import { WalletConnectButton } from "@/components/WalletConnectButton";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { useSorokit } from "@/context/SorokitProvider";
import type { NavSection } from "@/components/Sidebar";

const LABELS: Record<NavSection, { title: string; sub: string }> = {
  wallet: { title: "Wallet", sub: "Manage your connected wallet" },
  account: { title: "Account", sub: "Balances and account details" },
  transactions: { title: "Transactions", sub: "Send payments on Stellar" },
  soroban: { title: "Soroban", sub: "Invoke smart contracts" },
  network: { title: "Network", sub: "Switch between networks" },
};

interface TopBarProps {
  active: NavSection;
  onMenuToggle: () => void;
}

export function TopBar({ active, onMenuToggle }: TopBarProps) {
  const { error, clearError } = useSorokit();
  const { title, sub } = LABELS[active];

  return (
    <div className="shrink-0">
      {error && (
        <div className="flex items-center justify-between gap-4 px-6 py-2.5 bg-[rgba(239,68,68,0.08)] border-b border-[rgba(239,68,68,0.15)]">
          <p className="text-[12px] text-[#ef4444]">{error}</p>
          <button
            onClick={clearError}
            className="text-[#ef4444] opacity-50 hover:opacity-100 shrink-0 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2L10 10M10 2L2 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      <header className="flex items-center justify-between px-6 h-[60px] border-b border-[#2a2a2a] bg-[#141414] shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8 rounded-md hover:bg-[#1c1c1c] transition-colors"
            aria-label="Open menu"
          >
            <span className="w-4 h-px bg-[#888] block mx-auto" />
            <span className="w-4 h-px bg-[#888] block mx-auto" />
            <span className="w-4 h-px bg-[#888] block mx-auto" />
          </button>

          <div>
            <h1 className="text-[15px] font-semibold text-[#ebebeb] leading-none">
              {title}
            </h1>
            <p className="text-[11px] text-[#555] mt-0.5 hidden sm:block">
              {sub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <NetworkSwitcher />
          <WalletConnectButton />
        </div>
      </header>
    </div>
  );
}
