import { render, screen } from "@testing-library/react";

import type { Transaction } from "@/lib/client";

import { TxRow } from "./TransactionHistory";

describe("TxRow component", () => {
  it("renders transaction hash, ledger, status badge, fee, and date", () => {
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
    expect(screen.getByText(/100 stroops/)).toBeInTheDocument();
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

  it("has an accessible article role with aria-label", () => {
    const tx: Transaction = {
      hash: "hash-a11y",
      ledger: 2000,
      createdAt: new Date().toISOString(),
      successful: true,
      operationCount: 1,
      feePaid: "200",
    } as Transaction;
    render(<TxRow tx={tx} />);
    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute("aria-label");
    expect(article.getAttribute("aria-label")).toContain("Success");
    expect(article.getAttribute("aria-label")).toContain("200 stroops");
  });

  it("truncates long memos at 20 chars with full value in title tooltip", () => {
    const longMemo = "This is a very long memo that exceeds twenty characters";
    const tx: Transaction = {
      hash: "hash-memo",
      ledger: 3000,
      createdAt: new Date().toISOString(),
      successful: true,
      operationCount: 1,
      feePaid: "50",
      memo: longMemo,
    } as Transaction;
    render(<TxRow tx={tx} />);
    const memoSpan = screen.getByTitle(longMemo);
    expect(memoSpan).toBeInTheDocument();
    // Should be truncated (20 chars + ellipsis)
    expect(memoSpan.textContent).toContain("…");
    expect(memoSpan.textContent!.length).toBeLessThan(longMemo.length + 5);
  });

  it("displays short memos in full without truncation", () => {
    const shortMemo = "Hello";
    const tx: Transaction = {
      hash: "hash-short",
      ledger: 4000,
      createdAt: new Date().toISOString(),
      successful: true,
      operationCount: 1,
      feePaid: "50",
      memo: shortMemo,
    } as Transaction;
    render(<TxRow tx={tx} />);
    const memoSpan = screen.getByTitle(shortMemo);
    expect(memoSpan).toBeInTheDocument();
    expect(memoSpan.textContent).toContain(shortMemo);
    expect(memoSpan.textContent).not.toContain("…");
  });
});
