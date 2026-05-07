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
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const { isConnected } = useSorokit();

  return (
    <aside className="w-[220px] shrink-0 h-full flex flex-col border-r border-[#2a2a2a] bg-[#141414]">
      {/* Logo */}
      <div className="h-12 flex items-center px-4 border-b border-[#2a2a2a] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#5645d4] flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
          <span className="text-[13px] font-semibold text-[#ebebeb] tracking-tight">
            sorokit
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-left transition-colors cursor-pointer",
                "text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5645d4]",
                active === item.id
                  ? "bg-[#1c1c1c] text-[#ebebeb] font-medium"
                  : "text-[#666666] hover:bg-[#1c1c1c] hover:text-[#ebebeb]",
              )}
            >
              <span
                className={cn(
                  "shrink-0 transition-colors",
                  active === item.id ? "text-[#5645d4]" : "",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Connected wallet at bottom */}
      {isConnected && (
        <div className="p-3 border-t border-[#2a2a2a] shrink-0">
          <AccountCardCompact />
        </div>
      )}
    </aside>
  );
}
