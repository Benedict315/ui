import { TransactionPanel } from "@/components/TransactionPanel";

export function TransactionsScreen() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#ebebeb]">
          Transactions
        </h2>
        <p className="text-[12px] text-[#555555] mt-1">
          Submit payments on the Stellar network
        </p>
      </div>
      <TransactionPanel />
    </div>
  );
}
