import { useEffect, useRef, useState } from "react";
import { getClient, hasClient } from "@/lib/client";

/**
 * Internal type for fee data returned by the Soroban client.
 */
interface FeeData {
  baseFee: string;
  recommended: string;
}

interface FeeEstimatorProps {
  operations?: number;
  network: "testnet" | "public";
  onEstimate?: (fee: string) => void;
}

/**
 * FeeEstimator Component
 *
 * Calculates and displays estimated transaction fees based on network conditions,
 * operation complexity, and current Stellar network state.
 *
 * @component
 * @example
 * ```tsx
 * import { FeeEstimator } from "sorokit-ui";
 *
 * export function TransactionForm() {
 *   return (
 *     <div>
 *       <FeeEstimator operations={5} network="testnet" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @param props - Component props
 * @param props.operations - Number of operations in transaction (default: 1)
 * @param props.network - Network to estimate fees for ('testnet' | 'public')
 * @param props.onEstimate - Callback when fee is calculated
 *
 * @returns The rendered FeeEstimator component
 */
export function FeeEstimator({
  operations = 1,
  network,
  onEstimate,
}: FeeEstimatorProps) {
  const [fee, setFee] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  // Load fee estimate from client
  const load = async () => {
    if (inFlightRef.current) return; // guard against concurrent calls
    if (!hasClient()) {
      setError("[sorokit-ui] Client not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    inFlightRef.current = true;
    try {
      const result = await getClient().transaction.estimateFee({ network, operations });
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setFee(result.data);
        if (onEstimate) onEstimate(result.data.recommended);
      }
    } catch (e) {
      setError((e as Error).message ?? "Unexpected error");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  // Initial load and polling every 10 seconds
  useEffect(() => {
    load(); // initial load
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, operations]); // re‑load when props change

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      {/* Section title */}
      <h3 className="text-lg font-medium text-ink mb-2">Network Fee</h3>

      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fee ? `${fee.baseFee} base, ${fee.recommended} recommended` : ""}
      </div>

      {/* Fee display */}
      <div className="flex items-center gap-2">
        {/* Show last known fee or placeholder */}
        {fee ? (
          <div className="flex flex-col">
            <span className="text-sm text-ink-2">Base Fee</span>
            <span className="text-xl font-mono text-ink">{fee.baseFee}</span>
            <span className="text-sm text-ink-2">Recommended</span>
            <span className="text-xl font-mono text-ink">{fee.recommended}</span>
          </div>
        ) : (
          <div className="text-sm text-ink-3">—</div>
        )}

        {/* Loading indicator – does not hide fee */}
        {loading && (
          <div className="w-5 h-5 border-2 border-ink-3 border-t-transparent rounded-full animate-spin" />
        )}

        {/* Error message */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Retry button – visible on error or when not loading */}
        <button
          type="button"
          title="Refresh fee estimate"
          aria-label="Refresh fee estimate"
          onClick={load}
          disabled={loading}
          className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-sm text-ink-2 bg-surface-2 hover:bg-surface-3 disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.01M20 20v-5h-.01M4 20l5-5M20 4l-5 5"
            />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}

interface FeeEstimatorProps {
  operations?: number;
  network: 'testnet' | 'public';
  onEstimate?: (fee: string) => void;
}
