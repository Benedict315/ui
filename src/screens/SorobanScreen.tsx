import { useEffect, useState } from "react";

import { ContractEventFeed } from "@/components/ContractEventFeed";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SorobanPanel } from "@/components/SorobanPanel";
import { useSorokit } from "@/context/useSorokit";
import { SCREEN_LABELS } from "@/lib/nav-labels";

const CONTRACT_HISTORY_KEY = "sorokit-soroban-contract-history";

function readRecentContract(): string {
  try {
    const raw = localStorage.getItem(CONTRACT_HISTORY_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : "";
  } catch {
    return "";
  }
}

function readAllRecent(): string[] {
  try {
    const raw = localStorage.getItem(CONTRACT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function stellarExpertUrl(networkName: string | undefined, contractId: string): string | null {
  const segment =
    networkName === "mainnet" ? "public" : networkName === "testnet" ? "testnet" : null;
  if (!segment) return null;
  return `https://stellar.expert/explorer/${segment}/contract/${contractId}`;
}

export function SorobanScreen() {
  const { network } = useSorokit();
  const [contractId, setContractId] = useState(() => readRecentContract());
  const [savedContracts, setSavedContracts] = useState<string[]>(() => readAllRecent());
  const { title, sub } = SCREEN_LABELS.soroban;

  // Refresh saved contracts when contractId changes (new entry added by SorobanPanel)
  useEffect(() => {
    setSavedContracts(readAllRecent());
  }, [contractId]);

  const expertUrl =
    contractId.trim() !== "" ? stellarExpertUrl(network?.name, contractId.trim()) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-ink leading-none">
            {title}
          </h2>
          <p className="text-[11px] text-ink-3 mt-0.5">{sub}</p>
        </div>
        {expertUrl && (
          <a
            href={expertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-brand hover:underline shrink-0"
          >
            Stellar Expert ↗
          </a>
        )}
      </div>
      {savedContracts.length > 1 && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4 mb-2">
            Saved Contracts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {savedContracts.map((id) => (
              <button
                key={id}
                onClick={() => setContractId(id)}
                className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                  id === contractId
                    ? "border-brand bg-brand-dim text-brand"
                    : "border-line bg-surface-2 text-ink-2 hover:border-line-2"
                }`}
              >
                {id.slice(0, 6)}…{id.slice(-4)}
              </button>
            ))}
          </div>
        </div>
      )}
      <ErrorBoundary isolate>
        <SorobanPanel contractId={contractId} onContractIdChange={setContractId} />
      </ErrorBoundary>
      {contractId.trim() !== "" && (
        <ErrorBoundary isolate>
          <ContractEventFeed contractId={contractId} />
        </ErrorBoundary>
      )}
    </div>
  );
}
