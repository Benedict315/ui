import { Loader01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { InfoCell } from "@/components/ui/InfoCell";
import { useSorokit } from "@/context/useSorokit";
import type { NetworkName } from "@/lib/client";
import { cn } from "@/lib/utils";

const NETWORKS: {
  name: NetworkName;
  label: string;
  description: string;
  dot: string;
  badge: "success" | "warning" | "purple" | "default";
}[] = [
  {
    name: "mainnet",
    label: "Mainnet",
    description: "Public Global Stellar Network — real assets",
    dot: "bg-green",
    badge: "success",
  },
  {
    name: "testnet",
    label: "Testnet",
    description: "Test SDF Network — free test XLM via Friendbot",
    dot: "bg-orange",
    badge: "warning",
  },
  {
    name: "futurenet",
    label: "Futurenet",
    description: "Test SDF Future Network — bleeding edge features",
    dot: "bg-purple",
    badge: "purple",
  },
  {
    name: "localnet",
    label: "Localnet",
    description: "Local development network — requires local node",
    dot: "bg-ink-3",
    badge: "default",
  },
];

export function NetworkScreen() {
  const { network, switchNetwork } = useSorokit();
  const [switching, setSwitching] = useState<string | null>(null);
  const activeCardRef = useRef<HTMLButtonElement | null>(null);

  // Scroll active card into view on mount
  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [network?.name]);

  async function handleSwitchNetwork(networkName: string) {
    if (network?.name === networkName) return;
    setSwitching(networkName);
    try {
      await switchNetwork(networkName);
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Active network info */}
      {network && (
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-line">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
              Active Network
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-line">
            <InfoCell
              label="Name"
              value={network.name}
              className="sm:border-r sm:border-line"
            />
            <InfoCell
              label="Passphrase"
              value={network.passphrase}
              mono
              copyable
            />
            <InfoCell
              label="RPC URL"
              value={network.rpcUrl}
              mono
              copyable
              testable
              className="sm:border-t sm:border-r sm:border-line"
            />
            <InfoCell
              label="Horizon URL"
              value={network.horizonUrl}
              mono
              copyable
              testable
              className="sm:border-t sm:border-line"
            />
            <InfoCell
              label="Latest Ledger"
              value={
                typeof network.ledger === "number"
                  ? `#${network.ledger.toLocaleString()}`
                  : "—"
              }
              mono
              className="sm:border-t sm:border-r sm:border-line"
            />
            <InfoCell
              label="Status"
              value={network.status ?? "unknown"}
              className="sm:border-t sm:border-line"
            />
          </div>
        </div>
      )}

      {/* Selector */}
      <div className="flex flex-col gap-3">
        {NETWORKS.map((net) => {
          const isActive = network?.name === net.name;
          const isSwitching = switching === net.name;
          return (
            <button
              key={net.name}
              ref={isActive ? activeCardRef : null}
              onClick={() => {
                if (!isActive) handleSwitchNetwork(net.name);
              }}
              disabled={isActive || isSwitching}
              className={cn(
                "w-full text-left rounded-xl border px-6 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:bg-surface-3",
                isActive
                  ? "border-[rgba(86,69,212,0.35)] bg-brand-dim cursor-default ring-1 ring-brand"
                  : "border-line bg-surface hover:bg-surface-2 hover:border-line-2 cursor-pointer active:border-line-2",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0", net.dot)}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-ink">
                      {net.label}
                    </p>
                    <p className="text-[12px] text-ink-3 mt-0.5">
                      {net.description}
                    </p>
                  </div>
                </div>
                {isSwitching ? (
                  <HugeiconsIcon
                    icon={Loader01Icon}
                    size={20}
                    color="currentColor"
                    className="text-brand animate-spin"
                    strokeWidth={1.5}
                  />
                ) : (
                  isActive && (
                    <Badge variant={net.badge} dot>
                      Active
                    </Badge>
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ProbeState = "idle" | "testing" | "online" | "offline";

function InfoCell({
  label,
  value,
  mono,
  copyable,
  testable,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  testable?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [probe, setProbe] = useState<ProbeState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  }

  async function testConnection() {
    setProbe("testing");
    try {
      await fetch(value, {
        method: "HEAD",
        mode: "no-cors",
        signal: AbortSignal.timeout(3000),
      });
      setProbe("online");
    } catch {
      setProbe("offline");
    }
  }

  return (
    <div className={cn("px-6 py-4 flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
        {label}
      </span>
      <div className="flex items-start gap-2 group">
        <span
          className={cn(
            "text-[13px] text-ink-2 break-all flex-1",
            mono && "font-mono text-[12px]",
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={copy}
            aria-label={copied ? `${label} copied` : `Copy ${label}`}
            className={cn(
              "shrink-0 p-1 rounded-md transition-all mt-0.5",
              copied
                ? "text-green bg-success-dim"
                : "text-ink-3 hover:text-ink-2 hover:bg-surface-2 opacity-50 hover:opacity-100",
            )}
            title={copied ? "Copied!" : `Copy ${label}`}
          >
            <HugeiconsIcon
              icon={copied ? Tick01Icon : Copy01Icon}
              size={12}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        )}
      </div>
      {testable && (
        <div className="flex items-center gap-2 mt-0.5">
          <button
            type="button"
            onClick={testConnection}
            disabled={probe === "testing"}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2 py-1 text-[11px] font-medium text-ink-2 hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {probe === "testing" ? (
              <HugeiconsIcon
                icon={Loader01Icon}
                size={12}
                color="currentColor"
                strokeWidth={2}
                className="animate-spin"
              />
            ) : null}
            {probe === "testing" ? "Testing…" : "Test connection"}
          </button>
          {probe === "online" && (
            <Badge variant="success" dot>
              Reachable
            </Badge>
          )}
          {probe === "offline" && (
            <Badge variant="default" dot>
              Unreachable
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
