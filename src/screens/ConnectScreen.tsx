import { useSorokit } from "@/context/SorokitProvider";
import { Button } from "@/components/ui/Button";

export function ConnectScreen() {
  const { connectWallet, isConnecting, error, clearError } = useSorokit();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <div className="w-full max-w-[360px] mx-auto px-4 flex flex-col items-center gap-6">
        {/* Mark */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#5645d4] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-[18px] font-semibold text-[#ebebeb] tracking-tight">
              sorokit
            </h1>
            <p className="text-[11px] text-[#555555] mt-0.5">
              Stellar control dashboard
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-xl border border-[#2a2a2a] bg-[#141414] p-8 flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div>
            <h2 className="text-[20px] font-semibold text-[#ebebeb] tracking-tight">
              Connect Wallet
            </h2>
            <p className="text-[12px] text-[#555555] mt-1 leading-relaxed">
              Connect your Stellar wallet to access the dashboard
            </p>
          </div>

          {error && (
            <div className="flex items-start justify-between gap-2 rounded-md bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] px-3 py-2">
              <p className="text-[11px] text-[#ef4444]">{error}</p>
              <button
                onClick={clearError}
                className="text-[#ef4444] opacity-60 hover:opacity-100 shrink-0 mt-0.5"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

          <Button
            size="lg"
            loading={isConnecting}
            onClick={connectWallet}
            className="w-full justify-center"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </Button>

          <p className="text-[10px] text-[#555555] text-center">
            Powered by sorokit-core · Stellar network
          </p>
        </div>
      </div>
    </div>
  );
}
