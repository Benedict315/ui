import { useSorokit } from "@/context/SorokitProvider";
import { AccountCard } from "@/components/AccountCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";

export function WalletScreen() {
  const { address, isConnected, disconnectWallet, network } = useSorokit();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#ebebeb]">Wallet</h2>
        <p className="text-[12px] text-[#555555] mt-1">
          Manage your connected wallet
        </p>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(86,69,212,0.15)] border border-[rgba(86,69,212,0.3)] flex items-center justify-center text-[12px] font-bold text-[#5645d4] shrink-0">
              {address ? address.slice(0, 2) : "—"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#ebebeb]">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
                <Badge variant={isConnected ? "success" : "default"} dot>
                  {isConnected ? "Active" : "Inactive"}
                </Badge>
              </div>
              {address && (
                <span data-address className="mt-0.5 block">
                  {truncateAddress(address, 12, 6)}
                </span>
              )}
            </div>
          </div>
          {isConnected && (
            <Button variant="secondary" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          )}
        </div>

        {network && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#2a2a2a]">
            <InfoItem label="Network" value={network.name} />
            <InfoItem label="RPC" value={network.rpcUrl} mono />
          </div>
        )}
      </div>

      <AccountCard />
    </div>
  );
}

function InfoItem({
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
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555555] mb-0.5">
        {label}
      </span>
      <span
        className={`text-[11px] text-[#999999] break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
