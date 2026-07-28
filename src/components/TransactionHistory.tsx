import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";
import type { Transaction } from "@/lib/client";
import { getClient } from "@/lib/client";
import { truncateAddress } from "@/lib/utils";

const PAGE_SIZE = 10;
const MEMO_TRUNCATE_LENGTH = 20;
const PAGE_STORAGE_PREFIX = "sorokit-transaction-history-page:";

function readStoredPage(address: string | null): number {
  if (!address) return 1;
  try {
    const storedPage = Number.parseInt(
      sessionStorage.getItem(`${PAGE_STORAGE_PREFIX}${address}`) ?? "",
      10,
    );
    return Number.isInteger(storedPage) && storedPage > 0 ? storedPage : 1;
  } catch {
    return 1;
  }
}

function storePage(address: string | null, page: number): void {
  if (!address) return;
  try {
    sessionStorage.setItem(`${PAGE_STORAGE_PREFIX}${address}`, String(page));
  } catch {
    // sessionStorage may be unavailable; pagination still works for this render.
  }
}

function truncateMemo(memo: string): string {
  return memo.length > MEMO_TRUNCATE_LENGTH
    ? `${memo.slice(0, MEMO_TRUNCATE_LENGTH)}…`
    : memo;
}

function explorerTxUrl(
  networkName: string | undefined,
  hash: string,
): string | null {
  const segment =
    networkName === "mainnet" ? "public" : networkName === "testnet" ? "testnet" : null;
  if (!segment) return null;
  return `https://stellar.expert/explorer/${segment}/tx/${hash}`;
}

export function TxRow({
  tx,
  networkName,
}: {
  tx: Transaction;
  networkName?: string;
}) {
  const date = new Date(tx.createdAt);
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const explorerUrl = explorerTxUrl(networkName, tx.hash);

  const RowWrapper = explorerUrl ? "a" : "div";
  const wrapperProps = explorerUrl
    ? { href: explorerUrl, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <RowWrapper
      {...(wrapperProps as Record<string, string>)}
      role="article"
      aria-label={`Transaction ${truncateAddress(tx.hash, 10, 6)} — ${tx.successful ? "Success" : "Failed"} — Fee: ${tx.feePaid} stroops`}
      className="flex items-center justify-between px-5 py-3.5 border-b border-line last:border-0 gap-4 hover:bg-surface-2 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Status icon */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.successful ? "bg-success-dim" : "bg-error-dim"}`}
        >
          <HugeiconsIcon
            icon={tx.successful ? CheckmarkCircle01Icon : Cancel01Icon}
            size={14}
            color="currentColor"
            strokeWidth={1.5}
            className={tx.successful ? "text-green" : "text-red"}
          />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span data-txhash className="truncate">
            {truncateAddress(tx.hash, 10, 6)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ink-3">Ledger {tx.ledger}</span>
            {tx.memo && (
              <span className="text-[10px] text-ink-3" title={tx.memo}>
                · {truncateMemo(tx.memo)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant={tx.successful ? "success" : "error"} live>
            {tx.successful ? "Success" : "Failed"}
          </Badge>
          {tx.operationCount > 1 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
              {tx.operationCount} ops
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ink-3">
            {dateStr} {timeStr}
          </span>
          <span className="text-[10px] text-ink-3">
            · {tx.feePaid} stroops
          </span>
        </div>
      </div>
    </RowWrapper>
  );
}

type StatusFilter = "all" | "success" | "failed";

export interface TransactionHistoryProps {
  startDate?: string;
  endDate?: string;
}

export function TransactionHistory({ startDate, endDate }: TransactionHistoryProps = {}) {
  const { address, isConnected, network } = useSorokit();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [page, setPage] = useState(() => readStoredPage(address));
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(readStoredPage(address));
  }, [address]);

  useEffect(() => {
    if (!address) return;

    let active = true;
    const timerId = window.setTimeout(() => {
      setLoading(true);
      getClient()
        .transaction.getHistory(address, page, PAGE_SIZE)
        .then(({ data, error: err, total: t }) => {
          if (!active) return;
          if (err) {
            setError(err);
            return;
          }
          setTxs(data ?? []);
          setTotal(Number.isFinite(t) && t > 0 ? t : 0);
          setError(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [address, page]);

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;

  function changePage(nextPage: number) {
    setPage(nextPage);
    storePage(address, nextPage);
  }

  const filteredTxs = txs.filter((tx) => {
    if (statusFilter === "success" && !tx.successful) return false;
    if (statusFilter === "failed" && tx.successful) return false;
    if (startDate && new Date(tx.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(tx.createdAt) > new Date(endDate + "T23:59:59")) return false;
    return true;
  });

  const STATUS_BUTTONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">
            Transaction History
          </h3>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {total > 0 ? `${total} transactions` : "Past transactions"}
          </p>
        </div>
        {loading && (
          <span className="w-4 h-4 border border-ink-3 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <div className="flex items-center gap-1 px-5 py-2 border-b border-line">
        {STATUS_BUTTONS.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setStatusFilter(btn.value)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
              statusFilter === btn.value
                ? "bg-brand-dim text-brand"
                : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {!isConnected ? (
        <p className="text-[13px] text-ink-3 text-center py-10">
          Connect your wallet to view history
        </p>
      ) : error ? (
        <p className="text-[13px] text-red text-center py-10">{error}</p>
      ) : loading && txs.length === 0 ? (
        <div className="px-5 py-4 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-32 rounded bg-surface-2 animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-surface-2 animate-pulse" />
              </div>
              <div className="h-5 w-14 rounded-full bg-surface-2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : txs.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-10 text-center">
          <div
            aria-hidden="true"
            className="mb-3 flex h-12 w-12 items-center justify-center gap-0.5 rounded-full bg-surface-2 text-ink-3"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
            />
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-[13px] font-medium text-ink">No transactions yet</p>
          {network?.name === "testnet" && (
            <a
              href="https://friendbot.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[12px] font-medium text-brand hover:underline"
            >
              Fund with Friendbot →
            </a>
          )}
        </div>
      ) : (
        <>
          <div>
            {filteredTxs.map((tx) => (
              <TxRow key={tx.hash} tx={tx} networkName={network?.name} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-line">
              <span className="text-[11px] text-ink-3">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-[44px] sm:min-h-0"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={12}
                    color="currentColor"
                    strokeWidth={2}
                  />
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-[44px] sm:min-h-0"
                  disabled={page >= totalPages}
                  onClick={() => changePage(page + 1)}
                >
                  Next
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={12}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
