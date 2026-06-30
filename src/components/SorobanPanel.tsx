import { useState, useEffect, useRef } from "react";
import { useSorokit } from "@/context/useSorokit";
import { getClient } from "@/lib/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, friendlyError } from "@/lib/utils";
import type { InvokeParams } from "@/lib/client";

interface SorobanPanelProps {
  contractId: string;
  onContractIdChange: (contractId: string) => void;
}

type InvokeState = "idle" | "loading" | "success" | "error";

export function SorobanPanel({
  contractId,
  onContractIdChange,
}: SorobanPanelProps) {
  const { isConnected, address } = useSorokit();
  const [method, setMethod] = useState("");
  const [argsText, setArgsText] = useState("");
  const [state, setState] = useState<InvokeState>("idle");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const isInvokingRef = useRef(false);
  const prevContractIdRef = useRef(contractId);

  useEffect(() => {
    if (prevContractIdRef.current !== contractId) {
      setState("idle");
      setResult(null);
      setError(null);
      setParseError(null);
    }
    prevContractIdRef.current = contractId;
  }, [contractId]);

  async function invoke() {
    setParseError(null);
    setError(null);
    setResult(null);

    if (argsText.trim() !== "") {
      try {
        const parsed = JSON.parse(argsText.trim());
        if (!Array.isArray(parsed)) {
          setParseError("Arguments must be a JSON array");
          return;
        }
      } catch {
        setParseError("Invalid JSON in arguments");
        return;
      }
    }

    if (!isConnected || isInvokingRef.current) return;

    isInvokingRef.current = true;
    setState("loading");

    try {
      const params: InvokeParams = {
        contractId,
        method,
        args: argsText.trim() !== "" ? JSON.parse(argsText.trim()) : [],
        sourceAccount: address,
      };

      const { data, error: err } =
        await getClient().soroban.invokeContract(params);
      if (err) {
        const message = friendlyError(err);
        setError(message);
        setState("error");
        return;
      }
      setResult(data);
      setState("success");
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : "Unknown error";
      const msg = friendlyError(rawMessage);
      setError(msg);
      setState("error");
    } finally {
      isInvokingRef.current = false;
    }
  }

  function clear() {
    setState("idle");
    setResult(null);
    setError(null);
    setParseError(null);
  }

  const isFormIncomplete = !contractId.trim() || !method.trim();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="contractId" className="sr-only">
            Contract ID
          </label>
          <input
            id="contractId"
            placeholder="C..."
            value={contractId}
            onChange={(e) => onContractIdChange(e.target.value)}
            className="w-full rounded-lg border border-line-2 bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="method" className="text-[11px] font-medium text-ink-2">
            Method
          </label>
          <input
            id="method"
            placeholder="transfer"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-line-2 bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand mt-1"
          />
        </div>
        <div>
          <label
            htmlFor="args"
            className="text-[11px] font-medium text-ink-2"
          >
            Arguments (JSON array)
          </label>
          <input
            id="args"
            placeholder='["arg1", "arg2"]'
            value={argsText}
            onChange={(e) => setArgsText(e.target.value)}
            className="w-full rounded-lg border border-line-2 bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand mt-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={invoke}
          disabled={!isConnected || isFormIncomplete || state === "loading"}
          loading={state === "loading"}
        >
          {state === "loading" ? "Invoking…" : "Invoke"}
        </Button>

        {state === "success" && (
          <Badge variant="success" dot>
            Done
          </Badge>
        )}
        {state === "error" && <Badge variant="error">Failed</Badge>}
        {(state === "success" || state === "error") && (
          <button
            type="button"
            aria-label="Clear"
            onClick={clear}
            className="text-[11px] text-ink-3 hover:text-ink-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {state === "success" && result !== null && (
        <div className="rounded-lg bg-success-dim-subtle border border-success-dim px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4 mb-1.5">
            Result
          </p>
          <pre className="text-[11px] font-mono text-ink-2 whitespace-pre-wrap break-all">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {state === "error" && error && (
        <div className="rounded-lg bg-error-dim-muted border border-error-dim px-4 py-3">
          <p className="text-[11px] text-red">{error}</p>
        </div>
      )}

      {parseError && (
        <div className="rounded-lg bg-error-dim-muted border border-error-dim px-4 py-3">
          <p className="text-[11px] text-red">{parseError}</p>
        </div>
      )}
    </div>
  );
}
