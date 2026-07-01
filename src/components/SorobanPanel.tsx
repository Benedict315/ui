/**
 * SorobanPanel Component
 *
 * Provides a user-friendly interface for interacting with Soroban smart contracts.
 * Handles contract invocation, parameter input, and result display.
 *
 * Features:
 * - Contract ID input with recent-contract suggestions (last 5, localStorage)
 * - Method input with per-contract recent-method suggestions (localStorage)
 * - Arguments input with JSON validation
 * - Invoke / Clear actions
 * - Result block with a "Copy result" button
 *
 * @component
 * @example
 * ```tsx
 * import { SorobanPanel } from 'sorokit-ui';
 *
 * export function App() {
 *   const [contractId, setContractId] = React.useState("");
 *   return <SorobanPanel contractId={contractId} onContractIdChange={setContractId} />;
 * }
 * ```
 *
 * @remarks
 * - Requires SorokitProvider context
 * - Automatically handles wallet connection state
 * - Supports all Soroban contract types
 *
 * @see {@link SorokitProvider} for context setup
 */

import { useRef, useState } from "react";
import { useSorokit } from "@/context/useSorokit";
import { getClient } from "@/lib/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, friendlyError } from "@/lib/utils";

// ─── localStorage keys ────────────────────────────────────────────────────────

const LS_RECENT_CONTRACTS = "sorokit-recent-contracts";
const LS_RECENT_METHODS = "sorokit-recent-methods";
const MAX_RECENT_CONTRACTS = 5;
const MAX_RECENT_METHODS = 5;

// ─── localStorage helpers ────────────────────────────────────────────────────

function readRecentContracts(): string[] {
  try {
    const raw = localStorage.getItem(LS_RECENT_CONTRACTS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentContract(contractId: string): void {
  try {
    const existing = readRecentContracts().filter((id) => id !== contractId);
    const updated = [contractId, ...existing].slice(0, MAX_RECENT_CONTRACTS);
    localStorage.setItem(LS_RECENT_CONTRACTS, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function readRecentMethods(contractId: string): string[] {
  try {
    const raw = localStorage.getItem(LS_RECENT_METHODS);
    const all: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    return all[contractId] ?? [];
  } catch {
    return [];
  }
}

function saveRecentMethod(contractId: string, method: string): void {
  try {
    const raw = localStorage.getItem(LS_RECENT_METHODS);
    const all: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const existing = (all[contractId] ?? []).filter((m) => m !== method);
    all[contractId] = [method, ...existing].slice(0, MAX_RECENT_METHODS);
    localStorage.setItem(LS_RECENT_METHODS, JSON.stringify(all));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

type InvokeState = "idle" | "loading" | "success" | "error";

interface SorobanPanelProps {
  /** The current contract ID (controlled) */
  contractId: string;
  /** Called when the user edits the contract ID input */
  onContractIdChange: (id: string) => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SorobanPanel({
  contractId,
  onContractIdChange,
  className,
}: SorobanPanelProps) {
  const { isConnected, address } = useSorokit();

  const [method, setMethod] = useState("");
  const [args, setArgs] = useState("");
  const [state, setState] = useState<InvokeState>("idle");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [argsError, setArgsError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Recent suggestions — re-read from localStorage on each render so they stay
  // fresh after a successful invocation.
  const recentContracts = readRecentContracts();
  const recentMethods = readRecentMethods(contractId);

  const isInvokingRef = useRef(false);

  const canInvoke =
    isConnected &&
    contractId.trim() !== "" &&
    method.trim() !== "" &&
    state !== "loading";

  // ── Invoke ──────────────────────────────────────────────────────────────────

  async function handleInvoke() {
    if (!canInvoke || isInvokingRef.current) return;

    // Validate args JSON
    let parsedArgs: unknown[] = [];
    if (args.trim() !== "") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(args);
      } catch {
        setArgsError("Invalid JSON in arguments");
        return;
      }
      if (!Array.isArray(parsed)) {
        setArgsError("Arguments must be a JSON array");
        return;
      }
      parsedArgs = parsed;
    }

    setArgsError(null);
    isInvokingRef.current = true;
    setState("loading");
    setResult(null);
    setError(null);

    try {
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSorokit } from "@/context/useSorokit";
import { getClient } from "@/lib/client";

type State = "idle" | "loading" | "success" | "error";

interface SorobanPanelProps {
  contractId: string;
  onContractIdChange: (contractId: string) => void;
}

export function SorobanPanel({
  contractId,
  onContractIdChange,
}: SorobanPanelProps) {
  const { isConnected, address } = useSorokit();
  const [method, setMethod] = useState("");
  const [args, setArgs] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state, result, and error when contractId changes to avoid stale result flashes
  useEffect(() => {
    setState("idle");
    setResult(null);
    setError(null);
  }, [contractId]);

  const canInvoke = isConnected && contractId.trim() && method.trim();

  async function doInvoke() {
    if (!canInvoke) return;
    setState("loading");
    setError(null);
    setResult(null);
    try {
      let parsedArgs: unknown[] = [];
      if (args.trim()) {
        try {
          const parsed = JSON.parse(args.trim());
          if (!Array.isArray(parsed)) {
            setError('Arguments must be a JSON array (e.g. ["arg1", 42])');
            setState("error");
            return;
          }
          parsedArgs = parsed;
        } catch {
          setError("Invalid JSON in arguments");
          setState("error");
          return;
        }
      }
      const { data, error: err } = await getClient().soroban.invokeContract({
        contractId: contractId.trim(),
        method: method.trim(),
        args: parsedArgs,
        sourceAccount: address ?? undefined,
      });
      if (err) {
        setError(err);
        setState("error");
        return;
      }
      setResult(data);
      setState("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doInvoke();
  }

  function handleClick() {
    doInvoke();
  }

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">
            Contract Invoke
          </h3>
          <p className="text-[12px] text-ink-3 mt-0.5">
            Call a Soroban smart contract method
          </p>
        </div>
        <Badge variant="teal">Soroban</Badge>
      </div>

      <div className="px-6 py-6">
        {!isConnected ? (
          <p className="text-[13px] text-ink-3 text-center py-8">
            Connect your wallet to invoke contracts
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Contract ID"
              placeholder="C..."
              value={contractId}
              onChange={(e) => onContractIdChange(e.target.value)}
              disabled={state === "loading"}
            />
            <Input
              label="Method"
              placeholder="transfer, balance, mint…"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              disabled={state === "loading"}
            />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="soroban-args"
                className="text-[12px] font-medium text-ink-2"
              >
                Arguments (JSON array)
              </label>
              <textarea
                id="soroban-args"
                placeholder='["arg1", 42]'
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                disabled={state === "loading"}
                rows={3}
                className="w-full rounded-lg border border-line bg-surface-2 px-4 py-3 text-[13px] font-mono text-ink placeholder:text-ink-4 outline-none focus:border-line-2 focus:ring-1 focus:ring-brand-dim transition-colors resize-none disabled:opacity-40"
              />
            </div>

            {state === "success" && result !== null && (
              <div className="rounded-lg bg-success-dim-subtle border border-success-dim px-5 py-4 flex flex-col gap-3">
                <Badge variant="success" dot>
                  Result
                </Badge>
                <pre className="text-[12px] font-mono text-ink-2 whitespace-pre-wrap break-all">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            {state === "error" && error && (
              <div className="rounded-lg bg-error-dim-muted border border-error-dim px-5 py-4">
                <p className="text-[13px] text-red">{error}</p>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="px-6 py-4 border-t border-line flex items-center gap-3">
        {(state === "success" || state === "error") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setState("idle");
              setResult(null);
              setError(null);
            }}
          >
            Clear
          </Button>
        )}
        <Button
          size="md"
          loading={state === "loading"}
          disabled={!canInvoke}
          onClick={handleClick}
        >
          {state === "loading" ? "Invoking…" : "Invoke Contract"}
        </Button>
      </div>
    </div>
  );
}
