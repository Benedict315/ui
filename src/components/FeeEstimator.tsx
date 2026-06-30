import { useEffect, useState, useRef, useCallback } from "react";
import { getClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";

export interface FeeEstimatorProps {
  operations?: number;
  network?: "testnet" | "public";
  onEstimate?: (fee: string) => void;
  className?: string;
  refreshInterval?: number;
}

export function FeeEstimator({
  operations = 1,
  network: _network = "testnet",
  onEstimate,
  className,
  refreshInterval = 10000,
}: FeeEstimatorProps) {
  const [fee, setFee] = useState<{ baseFee: string; recommended: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const loadingRef = useRef(false);
  const onEstimateRef = useRef(onEstimate);

  // Update ref without triggering re-render
  useEffect(() => {
    onEstimateRef.current = onEstimate;
  });

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getClient().transaction.estimateFee();
      if (err) {
        setError(err);
        return;
      }
      setFee(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load fee estimate");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Initial load and retry trigger
  useEffect(() => {
    let cancelled = false;
    const doLoad = async () => {
      if (!cancelled) {
        await load();
      }
    };
    void doLoad();
    return () => {
      cancelled = true;
    };
  }, [load, retryTrigger]);

  // Interval manager
  useEffect(() => {
    if (refreshInterval <= 0 || error) return;

    const intervalId = setInterval(() => {
      void load();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [load, refreshInterval, error]);

  // Handle onEstimate callback when recommended fee or operations changes
  useEffect(() => {
    if (fee?.recommended) {
      const displayRecommended = (parseInt(fee.recommended) * operations).toString();
      onEstimateRef.current?.(displayRecommended);
    }
  }, [fee?.recommended, operations]);

  // Trigger manually or via retry
  const handleRetry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  // Calculate fees to display
  const displayBaseFee = fee ? (parseInt(fee.baseFee) * operations).toString() : "";
  const displayRecommended = fee ? (parseInt(fee.recommended) * operations).toString() : "";

  return (
    <div
      className={cn(
"rounded-xl border border-line bg-surface overflow-hidden relative",
        className,
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Network Fee</h3>
          <p className="text-[11px] text-ink-3 mt-0.5">
            Current Stellar base fee estimate
          </p>
        </div>
        <button
onClick={handleRetry}
          disabled={loading}
          aria-label="Refresh fee estimate"
          className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink-2 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            size={14}
            color="currentColor"
            strokeWidth={1.5}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

<div className="px-5 py-4 min-h-[64px] flex items-center">
        {/* Polite live region for screen readers to announce fee updates */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {fee ? `Base Fee: ${displayBaseFee} stroops, Recommended: ${displayRecommended} stroops` : ""}
        </div>

        {loading && !fee && !error ? (
          <div className="flex gap-4 animate-pulse w-full">
            <div className="h-8 w-24 rounded-lg bg-surface-2" />
            <div className="h-8 w-24 rounded-lg bg-surface-2" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-[12px] text-red">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-3 py-1.5 text-[11px] font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors"
            >
              Retry
            </button>
          </div>
        ) : fee ? (
          <div className="flex items-center gap-4 relative w-full">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-[0.5px]">
                <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin text-brand" />
              </div>
            )}
            <FeeCell label="Base Fee" value={displayBaseFee} unit="stroops" />
            <div className="w-px h-8 bg-line" />
            <FeeCell
              label="Recommended"
              value={displayRecommended}
              unit="stroops"
              highlight
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface FeeCellProps {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

function FeeCell({
  label,
  value,
  unit,
  highlight,
}: FeeCellProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-[18px] font-semibold leading-none",
            highlight ? "text-brand" : "text-ink",
          )}
        >
          {value}
        </span>
        <span className="text-[10px] text-ink-3">{unit}</span>
      </div>
    </div>
  );
}
