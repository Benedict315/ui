import { useState } from "react";
import { Sidebar, type NavSection } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { WalletScreen } from "@/screens/WalletScreen";
import { AccountScreen } from "@/screens/AccountScreen";
import { TransactionsScreen } from "@/screens/TransactionsScreen";
import { SorobanScreen } from "@/screens/SorobanScreen";
import { NetworkScreen } from "@/screens/NetworkScreen";

const SCREENS: Record<NavSection, React.ReactNode> = {
  wallet: <WalletScreen />,
  account: <AccountScreen />,
  transactions: <TransactionsScreen />,
  soroban: <SorobanScreen />,
  network: <NetworkScreen />,
};

export function Dashboard() {
  const [active, setActive] = useState<NavSection>("wallet");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      {/* Sidebar takes its own width on lg, hidden off-screen on mobile */}
      <Sidebar
        active={active}
        onNavigate={setActive}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right column: topbar + scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          active={active}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[700px] mx-auto px-6 py-8 sm:px-10 sm:py-10">
            {SCREENS[active]}
          </div>
        </main>
      </div>
    </div>
  );
}
