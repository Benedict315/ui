import { useSorokit } from "@/context/SorokitProvider";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { NetworkName } from "@/lib/client";

const NETWORKS: {
  name: NetworkName;
  label: string;
  description: string;
  dotClass: string;
  badge: "success" | "warning" | "purple" | "default";
}[] = [
  {
    name: "mainnet",
    label: "Mainnet",
    description: "Public Global Stellar Network — real assets",
    dotClass: "bg-[#22c55e]",
    badge: "success",
  },
  {
    name: "testnet",
    label: "Testnet",
    description: "Test SDF Network — free test XLM via Friendbot",
    dotClass: "bg-[#f97316]",
    badge: "warning",
  },
  {
    name: "futurenet",
    label: "Futurenet",
    description: "Test SDF Future Network — bleeding edge features",
    dotClass: "bg-[#a855f7]",
    badge: "purple",
  },
  {
    name: "localnet",
    label: "Localnet",
    description: "Local development network — requires local node",
    dotClass: "bg-[#555555]",
    badge: "default",
  },
];

export function NetworkScreen() {
  const { network, switchNetwork } = useSorokit();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#ebebeb]">Network</h2>
        <p className="text-[12px] text-[#555555] mt-1">
          Switch between Stellar networks
        </p>
      </div>

      {/* Active network info */}
      {network && (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
            Active Network
          </p>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Name" value={network.name} />
            <InfoRow label="Passphrase" value={network.passphrase} mono />
            <InfoRow label="RPC URL" value={network.rpcUrl} mono />
            <InfoRow label="Horizon URL" value={network.horizonUrl} mono />
          </div>
        </div>
      )}

      {/* Selector */}
      <div className="space-y-2">
        {NETWORKS.map((net) => {
          const isActive = network?.name === net.name;
          return (
            <button
              key={net.name}
              onClick={() => switchNetwork(net.name)}
              className={cn(
                "w-full text-left rounded-lg border p-4 transition-colors cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5645d4]",
                isActive
                  ? "border-[rgba(86,69,212,0.4)] bg-[rgba(86,69,212,0.05)]"
                  : "border-[#2a2a2a] bg-[#141414] hover:bg-[#1c1c1c]",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      net.dotClass,
                    )}
                  />
                  <div>
                    <p className="text-[12px] font-medium text-[#ebebeb]">
                      {net.label}
                    </p>
                    <p className="text-[11px] text-[#555555] mt-0.5">
                      {net.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <Badge variant={net.badge} dot>
                    Active
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] text-[#999999] break-all",
          mono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
  );
}
