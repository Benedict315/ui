import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useSorokit } from "@/context/SorokitProvider";
import { cn } from "@/lib/utils";
import type { NetworkName } from "@/lib/client";

const NETWORKS: { name: NetworkName; label: string; dotClass: string }[] = [
  { name: "mainnet", label: "Mainnet", dotClass: "bg-[#22c55e]" },
  { name: "testnet", label: "Testnet", dotClass: "bg-[#f97316]" },
  { name: "futurenet", label: "Futurenet", dotClass: "bg-[#a855f7]" },
  { name: "localnet", label: "Localnet", dotClass: "bg-[#555555]" },
];

export function NetworkSwitcher() {
  const { network, switchNetwork } = useSorokit();
  const current = NETWORKS.find((n) => n.name === network?.name) ?? NETWORKS[1];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#3d3d3d] transition-colors cursor-pointer text-[11px] text-[#999999] focus-visible:outline-none">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              current.dotClass,
            )}
          />
          {current.label}
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            className="opacity-40 ml-0.5"
          >
            <path
              d="M1.5 3L4 5.5L6.5 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className="z-50 min-w-[150px] rounded-lg border border-[#2a2a2a] bg-[#141414] p-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          {NETWORKS.map((net) => (
            <DropdownMenu.Item
              key={net.name}
              onSelect={() => switchNetwork(net.name)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] cursor-pointer outline-none transition-colors",
                network?.name === net.name
                  ? "bg-[#1c1c1c] text-[#ebebeb] font-medium"
                  : "text-[#999999] hover:bg-[#1c1c1c] hover:text-[#ebebeb]",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  net.dotClass,
                )}
              />
              {net.label}
              {network?.name === net.name && (
                <svg
                  className="ml-auto"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M2 5L4.5 7.5L8.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
