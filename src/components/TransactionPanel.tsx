import { useState } from "react";
import { useSorokit } from "@/context/SorokitProvider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getClient, type TxResult } from "@/lib/client";

type State = "idle" | "loading" | "success" | "error";

export function TransactionPanel() {
  const { address, isConnected } = useSorokit();
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    isConnected && dest.trim() && amount.trim() && parseFloat(amount) > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("loading");
    setError(null);
    setResult(null);
    try {
      const { data, error: err } = await getClient().transaction.submit({
        source: address,
        destination: dest.trim(),
        amount: amount.trim(),
        memo: memo.trim() || undefined,
        asset: "XLM",
      });
      if (err) {
        setError(err);
        setState("error");
        return;
      }
      setResult(data);
      setState("success");
      setDest("");
      setAmount("");
      setMemo("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <p className="text-[11px] text-[#555555] text-center py-8">
            Connect your wallet to send transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Payment</CardTitle>
        <CardDescription>
          Submit a payment on the Stellar network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "success" && result ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#ebebeb]">
                  Transaction submitted
                </p>
                <p className="text-[10px] text-[#555555]">
                  Ledger #{result.ledger}
                </p>
              </div>
            </div>
            <div className="rounded-md bg-[#1c1c1c] border border-[#2a2a2a] p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                Tx Hash
              </p>
              <span data-txhash className="break-all block">
                {result.hash}
              </span>
              <Badge variant="success" dot>
                Successful
              </Badge>
            </div>
          </div>
        ) : state === "error" ? (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 4V6.5M6 8.5H6.01"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#ebebeb]">
                Transaction failed
              </p>
              <p className="text-[11px] text-[#ef4444] mt-0.5">{error}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              label="Destination"
              placeholder="G..."
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              disabled={state === "loading"}
            />
            <Input
              label="Amount (XLM)"
              type="number"
              placeholder="0.00"
              min="0.0000001"
              step="0.0000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={state === "loading"}
            />
            <Input
              label="Memo (optional)"
              placeholder="Text memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={state === "loading"}
            />
          </form>
        )}
      </CardContent>
      <CardFooter>
        {state === "success" || state === "error" ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setState("idle");
              setResult(null);
              setError(null);
            }}
          >
            New Transaction
          </Button>
        ) : (
          <Button
            size="sm"
            loading={state === "loading"}
            disabled={!canSubmit}
            onClick={submit as unknown as React.MouseEventHandler}
          >
            {state === "loading" ? "Submitting…" : "Send"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
