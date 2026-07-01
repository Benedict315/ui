import { render, screen } from "@testing-library/react";

import type { Transaction } from "@/lib/client";

import { TxRow } from "./TransactionHistory";

describe("TxRow component", () => {
  it("renders transaction hash, ledger, status badge, and date", () => {
    const tx: Transaction = {
      hash: "hash123",
      ledger: 1000,
      createdAt: new Date("2026-07-01T18:52:00").toISOString(),
      successful: true,
      operationCount: 1,
      feePaid: "100",
    } as Transaction;
    render(<TxRow tx={tx} />);
    expect(screen.getByText(/hash123/)).toBeInTheDocument();
    expect(screen.getByText(/Ledger 1000/)).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("shows Failed badge for unsuccessful transactions", () => {
    const tx: Transaction = {
      hash: "hash-fail",
      ledger: 1002,
      createdAt: new Date().toISOString(),
      successful: false,
      operationCount: 1,
      feePaid: "0",
    } as Transaction;
    render(<TxRow tx={tx} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
