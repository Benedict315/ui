import { Cancel01Icon,Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import type { NavSection } from "@/components/Sidebar";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useSorokit } from "@/context/useSorokit";
import { SCREEN_LABELS } from "@/lib/nav-labels";

const LABELS = SCREEN_LABELS;

export function TopBar({
  active,
  sidebarOpen,
  onMenuToggle,
}: {
  active: NavSection;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { error, clearError } = useSorokit();
  const { title, sub } = LABELS[active];
  const menuLabel = sidebarOpen ? "Close menu" : "Open menu";

  return (
    <div className="shrink-0">
      {error && (
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-error-dim bg-error-dim-muted px-6 py-2.5">
          <p className="min-w-0 flex-1 break-words text-[12px] text-red">
            {error}
          </p>
          <button
            onClick={clearError}
            aria-label="Dismiss error"
            className="text-red opacity-50 hover:opacity-100 shrink-0 transition-opacity"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        </div>
      )}
      <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 h-[60px] border-b border-line bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface-2 transition-colors text-ink-2"
            aria-label={menuLabel}
            title={menuLabel}
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
          <div>
            <h1 className="text-[15px] font-semibold text-ink leading-none">
              {title}
            </h1>
            <p className="text-[11px] text-ink-3 mt-0.5 hidden sm:block">
              {sub}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <NetworkSwitcher />
          <WalletConnectButton />
        </div>
      </header>
    </div>
  );
}
