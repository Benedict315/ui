import { useSorokit } from "@/context/SorokitProvider";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/lib/utils";

interface WalletConnectButtonProps {
  onOpenModal?: () => void;
}

export function WalletConnectButton({ onOpenModal }: WalletConnectButtonProps) {
  const { isConnected, isConnecting, address, connectWallet } = useSorokit();

  if (isConnected && address) {
    return (
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-2 h-7 px-3 rounded-md bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#3d3d3d] transition-colors cursor-pointer"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
        <span data-address>{truncateAddress(address)}</span>
      </button>
    );
  }

  return (
    <Button size="sm" loading={isConnecting} onClick={connectWallet}>
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
