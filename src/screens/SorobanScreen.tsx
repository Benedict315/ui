import { SorobanPanel } from "@/components/SorobanPanel";

export function SorobanScreen() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#ebebeb]">Soroban</h2>
        <p className="text-[12px] text-[#555555] mt-1">
          Invoke smart contracts on the Stellar network
        </p>
      </div>
      <SorobanPanel />
    </div>
  );
}
