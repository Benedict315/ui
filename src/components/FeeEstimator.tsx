import { useEffect, useState } from "react";
import { getClient } from "@/lib/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RefreshCwIcon } from "@hugeicons/react";

const XLM_STROOPS = 10_000_000;
const HIGH_FEE_THRESHOLD = 2;

export interface FeeEstimatorProps {
  operations?: number;
  network?: string;
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

  // Update onEstimate ref without causing re‑render
  useEffect(() => {
    onEstimateRef.current = onEstimate;
  }, [onEstimate]);

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
      if (data?.recommended) {
        const displayRecommended = (parseInt(data.recommended) * operations).toString();
        onEstimateRef.current?.(displayRecommended);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load fee estimate");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [operations, _network]);

  // Initial load and retry trigger
  useEffect(() => {
    let cancelled = false;
    const doLoad = async () => {
      if (!cancelled) await load();
    };
    void doLoad();
    return () => {
      cancelled = true;
    };
  }, [load, retryTrigger]);

  // Polling interval
  useEffect(() => {
    if (refreshInterval <= 0 || error) return;
    const intervalId = setInterval(() => {
      void load();
    }, refreshInterval);
    return () => clearInterval(intervalId);
  }, [load, refreshInterval, error]);

  const handleRetry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  const displayBaseFee = fee ? (parseInt(fee.baseFee) * operations).toString() : "";
  const displayRecommended = fee ? (parseInt(fee.recommended) * operations).toString() : "";

  return (
    <div className={cn(
      "rounded-xl border border-line bg-surface overflow-hidden relative",
      className,
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Network Fee</h3>
          <p className="text-[11px] text-ink-3 mt-0.5">Current Stellar base fee estimate</p>
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
        {/* Live region for assistive tech */}
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
            <FeeCell label="Recommended" value={displayRecommended} unit="stroops" highlight />
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

function FeeCell({ label, value, unit, highlight }: FeeCellProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-[18px] font-semibold leading-none", highlight ? "text-brand" : "text-ink")}>
          {value}
        </span>
        <span className="text-[10px] text-ink-3">{unit}</span>
      </div>
    </div>
  );
}

interface FeeData {
  baseFee: string;
  recommended: string;
}

export function FeeEstimator({ operations = 1, network, onEstimate }: FeeEstimatorProps) {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getClient().transaction.estimateFee({
        operations,
      });
      if (err) {
        setError(err);
        setFeeData(null);
      } else if (data) {
        setFeeData(data);
        onEstimate?.(data.recommended);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to estimate fee");
      setFeeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    const interval = setInterval(fetchFees, 10000);
    return () => clearInterval(interval);
  }, [operations]);

  const isHighFee =
    feeData &&
    parseFloat(feeData.recommended) > parseFloat(feeData.baseFee) * HIGH_FEE_THRESHOLD;

  const recommendedXlm = feeData
    ? (parseFloat(feeData.recommended) / XLM_STROOPS).toFixed(7)
    : null;

  const baseXlm = feeData
    ? (parseFloat(feeData.baseFee) / XLM_STROOPS).toFixed(7)
    : null;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <h3 className="text-[14px] font-semibold text-ink">Network Fee</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchFees}
          disabled={loading}
          aria-label="Refresh fee estimate"
          title="Refresh"
        >
          <RefreshCwIcon size={16} color="currentColor" />
        </Button>
      </div>

      {loading && !feeData ? (
        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="h-4 w-24 rounded bg-surface-2 animate-pulse" />
          <div className="h-4 w-32 rounded bg-surface-2 animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-[13px] text-red text-center py-6">{error}</p>
      ) : feeData ? (
        <div
          className="px-6 py-5"
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-3 uppercase font-semibold">
                Base Fee
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-ink">
                  {feeData.baseFee}
                </span>
                <span className="text-[11px] text-ink-3">
                  ({baseXlm} XLM)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-ink-3 uppercase font-semibold">
                  Recommended
                </span>
                {isHighFee && (
                  <Badge variant="warning" size="xs">
                    High fee
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-ink">
                  {feeData.recommended}
                </span>
                <span className="text-[11px] text-ink-3">
                  ({recommendedXlm} XLM)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
