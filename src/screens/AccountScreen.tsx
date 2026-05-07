import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { useSorokit } from "@/context/SorokitProvider";

export function AccountScreen() {
  const { isConnected } = useSorokit();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#ebebeb]">Account</h2>
        <p className="text-[12px] text-[#555555] mt-1">
          Account details and asset balances
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-8 text-center">
          <p className="text-[11px] text-[#555555]">
            Connect your wallet to view account details
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AccountCard />
          <BalanceList />
        </div>
      )}
    </div>
  );
}
