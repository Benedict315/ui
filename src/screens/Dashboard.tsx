import { type ComponentType,useCallback,useState } from "react";

import { NetworkBanner } from "@/components/NetworkBanner";
import { type NavSection,Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AccountScreen } from "@/screens/AccountScreen";
import { BudgetScreen } from "@/screens/BudgetScreen";
import { ChartingScreen } from "@/screens/ChartingScreen";
import { NetworkScreen } from "@/screens/NetworkScreen";
import { NFTScreen } from "@/screens/NFTScreen";
import { RecoveryScreen } from "@/screens/RecoveryScreen";
import { SorobanScreen } from "@/screens/SorobanScreen";
import { TransactionsScreen } from "@/screens/TransactionsScreen";
import { WalletScreen } from "@/screens/WalletScreen";
import { YieldFarmingScreen } from "@/screens/YieldFarmingScreen";

const SCREENS: Record<NavSection, ComponentType> = {
  wallet: WalletScreen,
  account: AccountScreen,
  transactions: TransactionsScreen,
  soroban: SorobanScreen,
  network: NetworkScreen,
  recovery: RecoveryScreen,
  charts: ChartingScreen,
  farming: YieldFarmingScreen,
  budget: BudgetScreen,
  nfts: NFTScreen,
};

export interface DashboardProps {
  /**
   * Controlled active section. When provided, `Dashboard` renders this section
   * and never changes it internally — the parent owns the state and should
   * update it from `onSectionChange`.
   */
  activeSection?: NavSection;
  /** Fired whenever a nav item is chosen, in both controlled and uncontrolled mode. */
  onSectionChange?: (section: NavSection) => void;
  /** Initial section in uncontrolled mode. Ignored when `activeSection` is set. */
  defaultSection?: NavSection;
}

export function Dashboard({
  activeSection,
  onSectionChange,
  defaultSection = "wallet",
}: DashboardProps = {}) {
  const isControlled = activeSection !== undefined;
  const [internalActive, setInternalActive] =
    useState<NavSection>(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = isControlled ? activeSection : internalActive;

  const handleNavigate = useCallback(
    (section: NavSection) => {
      // In controlled mode the parent decides what renders next; only report.
      if (!isControlled) setInternalActive(section);
      onSectionChange?.(section);
    },
    [isControlled, onSectionChange],
  );

  const ActiveScreen = SCREENS[active] ?? SCREENS.wallet;

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          active={active}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
        />
        <NetworkBanner active={active} />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-[700px] mx-auto px-6 py-8 sm:px-10 sm:py-10 min-h-[300px]">
            <ActiveScreen />
          </div>
        </main>
      </div>
    </div>
  );
}
