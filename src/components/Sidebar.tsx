import { cn } from "@/lib/utils";
import { useSorokit } from "@/context/SorokitProvider";
import { AccountCardCompact } from "@/components/AccountCard";

export type NavSection =
  | "wallet"
  | "account"
  | "transactions"
  | "soroban"
  | "network";

const NAV: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  {
    id: "wallet",
    label: "Wallet",
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect
          x="1"
          y="3.5"
          width="12"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M1 6.5H13" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="10" cy="9" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M2 12C2 9.79 4.24 8 7 8C9.76 8 12 9.79 12 12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 4.5H12M9 2L12 4.5L9 7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 9.5H2M5 7L2 9.5L5 12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "soroban",
    label: "Soroban",
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path
          d="M4.5 2.5L2 7L4.5 11.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 2.5L12 7L9.5 11.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 2L5.5 12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "network",
    label: "Network",
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M7 2C7 2 9 4.5 9 7C9 9.5 7 12 7 12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M7 2C7 2 5 4.5 5 7C5 9.5 7 12 7 12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M2 7H12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  active: NavSection;
  onNavigate: (s: NavSection) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  const { isConnected } = useSorokit();

  function handleNav(id: NavSection) {
    onNavigate(id);
    onClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-[260px] flex flex-col",
          "bg-[#141414] border-r border-[#2a2a2a]",
          "transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:z-auto",
        )}
      >
        {/* Logo — full width, own padding */}
        <div className="flex items-center gap-3 px-5 h-[60px] border-b border-[#2a2a2a] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#5645d4] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6C2 3.79 3.79 2 6 2C8.21 2 10 3.79 10 6C10 8.21 8.21 10 6 10"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M6 10C4.9 10 4 9.1 4 8C4 6.9 4.9 6 6 6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="6" cy="6" r="1" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#ebebeb] leading-none">
              sorokit
            </p>
            <p className="text-[11px] text-[#444] mt-0.5">Stellar Dashboard</p>
          </div>
        </div>

        {/* Nav — own padding */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <p className="px-2 mb-2 mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a3a3a]">
            Navigation
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer",
                  "text-[13px] focus-visible:outline-none",
                  active === item.id
                    ? "bg-[#1e1e1e] text-[#ebebeb] font-medium border border-[#2f2f2f]"
                    : "text-[#555] hover:bg-[#1a1a1a] hover:text-[#aaa] border border-transparent",
                )}
              >
                <span
                  className={cn(
                    "shrink-0",
                    active === item.id ? "text-[#5645d4]" : "",
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
                {active === item.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5645d4] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom wallet */}
        {isConnected && (
          <div className="px-3 py-3 border-t border-[#2a2a2a] shrink-0">
            <AccountCardCompact />
          </div>
        )}
      </aside>
    </>
  );
}
