/**
 * ContractEventFeed Component
 *
 * Real-time feed of contract events from Soroban smart contracts.
 * Displays event history, filtering, and search capabilities.
 *
 * @component
 * @example
 * ```tsx
 * import { ContractEventFeed } from 'sorokit-ui';
 *
 * export function Dashboard() {
 *   return (
 *     <ContractEventFeed
 *       contractId="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
 *       pollInterval={5000}
 *     />
 *   );
 * }
 * ```
 *
 * @param props - Component props
 * @param props.contractId - Smart contract ID to monitor
 * @param props.limit - Maximum number of events to fetch per poll (default: 10)
 * @param props.pollInterval - Auto-poll interval in ms (default: 0, disabled)
 * @param props.filterTypes - Event types to show by default (default: all types)
 * @param props.maxValueLength - Character length before an event value gets a
 *   "Show more" toggle (default: 200)
 *
 * @returns The rendered ContractEventFeed component
 *
 * @remarks
 * - Shows timestamp, topics, and event data
 * - Filterable by event type via toggle buttons
 * - Displays a relative "Last updated" timestamp while polling is active
 * - Requires SorokitProvider context
 * - Known issue: QR code scanner doesn't work with complex metadata (issue #8)
 *
 * @see {@link SorokitProvider} for setup
 * @see GitHub issue #8 for QR code scanner limitation
 */
import {
  Copy01Icon,
  Refresh01Icon,
  Tick01Icon,
  AlertCircleIcon,
  Activity01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import type { ContractEvent } from "@/lib/client";
import { getClient } from "@/lib/client";
import { cn, truncateAddress } from "@/lib/utils";

const EVENT_TYPE_VARIANT: Record<
  string,
  "success" | "warning" | "teal" | "purple" | "default"
> = {
  transfer: "teal",
  mint: "success",
  burn: "warning",
  approve: "purple",
};

const DEFAULT_MAX_VALUE_LENGTH = 200;

function formatRelativeTime(fromMs: number, nowMs: number): string {
  const diff = Math.max(0, nowMs - fromMs);
  if (diff < 5000) return "Updated just now";
  if (diff < 60000) return `Updated ${Math.floor(diff / 1000)}s ago`;
  const minutes = Math.floor(diff / 60000);
  return `Updated ${minutes}m ago`;
}

function EventValue({
  value,
  maxValueLength,
}: {
  value: unknown;
  maxValueLength: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const formatted = JSON.stringify(value, null, 2);
  const isTruncatable = formatted.length > maxValueLength;
  const display =
    isTruncatable && !expanded
      ? `${formatted.slice(0, maxValueLength)}…`
      : formatted;

  return (
    <div className="flex flex-col gap-1 mt-0.5">
      <pre className="text-[10px] font-mono text-ink-3 bg-surface-2 rounded-lg px-3 py-2 border border-line whitespace-pre-wrap break-all">
        {display}
      </pre>
      {isTruncatable && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="self-start text-[10px] font-semibold text-brand hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function TopicTag({ topic }: { topic: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(topic);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* fallback */
    }
  }

  return (
    <span className="group inline-flex items-center gap-1 text-[10px] font-mono text-ink-3 bg-surface-2 rounded px-1.5 py-0.5 border border-line">
      <span>{topic.length > 20 ? truncateAddress(topic, 8, 4) : topic}</span>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy topic"
        className="opacity-0 group-hover:opacity-100 hover:text-ink-1 transition-opacity cursor-pointer p-0.5"
      >
        <HugeiconsIcon
          icon={copied ? Tick01Icon : Copy01Icon}
          size={10}
          color="currentColor"
          strokeWidth={1.5}
        />
      </button>
    </span>
  );
}

function EventRow({
  event,
  maxValueLength,
}: {
  event: ContractEvent;
  maxValueLength: number;
}) {
  const variant = EVENT_TYPE_VARIANT[event.type] ?? "default";
  const time = new Date(event.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-start gap-3 px-5 py-3.5 border-b border-line last:border-0">
      <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
        <Badge variant={variant}>{event.type}</Badge>
        <span className="text-[10px] text-ink-4 font-mono">{time}</span>
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
            Ledger
          </span>
          <span className="text-[11px] text-ink-2 font-mono">
            {event.ledger}
          </span>
        </div>
        {event.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.topics.map((t, i) => (
              <TopicTag key={i} topic={t} />
            ))}
          </div>
        )}
        {event.value !== null && event.value !== undefined && (
          <EventValue value={event.value} maxValueLength={maxValueLength} />
        )}
      </div>
    </div>
  );
}

export interface ContractEventFeedProps {
  /** The Soroban contract ID to monitor */
  contractId: string;
  /** Auto-poll interval in ms. 0 = manual only. */
  pollInterval?: number;
  /** Max number of events fetched per request. */
  limit?: number;
  /** Event types shown by default. Defaults to every type present in the feed. */
  filterTypes?: string[];
  /** Character length before an event value is truncated with a "Show more" toggle. */
  maxValueLength?: number;
  /**
   * Optional start ledger to fetch events from. When omitted, the feed
   * requests the latest events from the network's current ledger. When set,
   * `getEvents(...)` is called with this value as the third argument so
   * consumers can page through historical event windows.
   */
  fromLedger?: number;
}

export function ContractEventFeed({
  contractId,
  pollInterval = 0,
  limit = 10,
  filterTypes,
  maxValueLength = DEFAULT_MAX_VALUE_LENGTH,
  fromLedger,
}: ContractEventFeedProps) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(pollInterval > 0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [activeTypes, setActiveTypes] = useState<Set<string> | null>(
    filterTypes ? new Set(filterTypes) : null,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!contractId.trim()) return;
    setLoading(true);
    try {
      const { data, error: err } = await getClient().soroban.getEvents(
        contractId,
        limit,
        fromLedger,
      );
      if (err) {
        setError(err);
        return;
      }
      setEvents(data ?? []);
      setError(null);
      setLastUpdatedAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, [contractId, limit, fromLedger]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [load]);

  useEffect(() => {
    if (live && pollInterval > 0) {
      intervalRef.current = setInterval(() => {
        void load();
      }, pollInterval);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [live, pollInterval, load]);

  // Tick the relative "Last updated" label once a second while polling is active.
  useEffect(() => {
    if (!live || pollInterval <= 0) return;
    const tickId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tickId);
  }, [live, pollInterval]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    }
    return counts;
  }, [events]);

  const availableTypes = useMemo(
    () => Array.from(typeCounts.keys()).sort(),
    [typeCounts],
  );

  const filteredEvents = useMemo(() => {
    if (!activeTypes) return events;
    return events.filter((e) => activeTypes.has(e.type));
  }, [events, activeTypes]);

  function toggleType(type: string) {
    setActiveTypes((prev) => {
      // Start from "all types currently available" the first time a filter is toggled.
      const base = prev ?? new Set(availableTypes);
      const next = new Set(base);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  const isTypeActive = (type: string) =>
    activeTypes ? activeTypes.has(type) : true;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">
            Contract Events
          </h3>
          <p className="text-[12px] text-ink-3 mt-0.5 font-mono">
            {truncateAddress(contractId, 10, 6)}
          </p>
          {live && pollInterval > 0 && lastUpdatedAt !== null && (
            <p className="text-[10px] text-ink-4 mt-0.5">
              {formatRelativeTime(lastUpdatedAt, now)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pollInterval > 0 && (
            <button
              onClick={() => setLive((l) => !l)}
              aria-pressed={live}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${live ? "bg-success-dim text-green border-success-dim-strong" : "bg-surface-2 text-ink-3 border-line-2"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green animate-pulse" : "bg-ink-3"}`}
              />
              {live ? "Live" : "Paused"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const jsonStr = JSON.stringify(events, null, 2);
              const blob = new Blob([jsonStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `contract-events-${contractId || "export"}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={events.length === 0}
            title="Export JSON"
            aria-label={`Export ${events.length} event${events.length === 1 ? "" : "s"} as JSON`}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-surface-2 hover:bg-surface-3 text-ink-2 border border-line transition-colors disabled:opacity-40"
          >
            Export JSON
          </button>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink-2 transition-colors disabled:opacity-40"
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
      </div>

      {availableTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-5 py-3 border-b border-line">
          {availableTypes.map((type) => {
            const active = isTypeActive(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                aria-pressed={active}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors capitalize",
                  active
                    ? "bg-brand-dim text-brand border-[rgba(86,69,212,0.25)]"
                    : "bg-surface-2 text-ink-3 border-line-2 opacity-60",
                )}
              >
                {type} ({typeCounts.get(type)})
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-3 px-5 py-10">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={32}
            color="currentColor"
            className="text-red"
            strokeWidth={1.5}
          />
          <p className="text-[13px] text-red text-center">{error}</p>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-dim text-red border border-red-dim-strong hover:bg-red-dim-strong transition-colors disabled:opacity-40"
          >
            Retry
          </button>
        </div>
      ) : loading && events.length === 0 ? (
        <div className="px-5 py-4 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-surface-2 animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10">
          <HugeiconsIcon
            icon={Activity01Icon}
            size={32}
            color="currentColor"
            className="text-ink-3"
            strokeWidth={1.5}
          />
          <p className="text-[13px] text-ink-3 text-center">No events found</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10">
          <HugeiconsIcon
            icon={Activity01Icon}
            size={32}
            color="currentColor"
            className="text-ink-3"
            strokeWidth={1.5}
          />
          <p className="text-[13px] text-ink-3 text-center">
            No events match the selected filters
          </p>
        </div>
      ) : (
        <div aria-live="polite">
          {filteredEvents.map((e) => (
            <EventRow key={e.id} event={e} maxValueLength={maxValueLength} />
          ))}
        </div>
      )}
    </div>
  );
}
