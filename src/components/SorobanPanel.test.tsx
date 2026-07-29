import { fireEvent, render, screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { SorobanPanel } from "./SorobanPanel";

const mockInvokeContract = vi.fn();
const mockSimulateContract = vi.fn();

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(() => ({
    isConnected: true,
    address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
  })),
}));

vi.mock("../lib/client", () => ({
  getClient: () => ({
    soroban: {
      invokeContract: mockInvokeContract,
      simulateContract: mockSimulateContract,
    },
  }),
}));

describe("SorobanPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSorokit).mockReturnValue({
      isConnected: true,
      address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
    } as unknown as ReturnType<typeof useSorokit>);
  });

  describe("invoke mode (default)", () => {
    it("should have invoke button disabled when method is empty", () => {
      render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
      expect(screen.getByRole("button", { name: /invoke/i })).toBeDisabled();
    });

    it("should show error when invalid JSON args are provided", async () => {
      let currentContractId = "";
      const setContractId = (id: string) => { currentContractId = id; };
      const { rerender } = render(<SorobanPanel contractId={currentContractId} onContractIdChange={setContractId} />);
      fireEvent.change(screen.getByPlaceholderText(/transfer/i), { target: { value: "mint" } });
      fireEvent.change(screen.getByPlaceholderText(/\[.*\]/i), { target: { value: "invalid json {" } });
      rerender(<SorobanPanel contractId="C123" onContractIdChange={setContractId} />);
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      expect(await screen.findByText(/Invalid JSON in arguments/i)).toBeInTheDocument();
    });

    it("rejects a JSON object with 'must be a JSON array' error", async () => {
      const { rerender } = render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/c\.\.\./i), { target: { value: "C123" } });
      fireEvent.change(screen.getByPlaceholderText(/transfer/i), { target: { value: "mint" } });
      fireEvent.change(screen.getByPlaceholderText(/\[.*\]/i), { target: { value: "{}" } });
      rerender(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      expect(await screen.findByText(/Arguments must be a JSON array/i)).toBeInTheDocument();
    });

    it("accepts a valid JSON array and reaches success state", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { success: true }, error: null });
      const { rerender } = render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByPlaceholderText(/c\.\.\./i), { target: { value: "C123" } });
      fireEvent.change(screen.getByPlaceholderText(/transfer/i), { target: { value: "mint" } });
      fireEvent.change(screen.getByPlaceholderText(/\[.*\]/i), { target: { value: '["arg1", 42]' } });
      rerender(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      expect(await screen.findByText("Result", { selector: "span" })).toBeInTheDocument();
    });

    it("calls invokeContract with correct parameters", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { success: true, balance: 1000 }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.change(screen.getByLabelText("Arguments (JSON array)"), { target: { value: '["GAAZI...", 42]' } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      await screen.findByText("Result", { selector: "span" });
      expect(mockInvokeContract).toHaveBeenCalledWith({
        contractId: "C123",
        method: "balance",
        args: ["GAAZI...", 42],
        sourceAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
      });
    });

    it("shows error text when invokeContract returns an error", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: null, error: "Contract execution failed" });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "mint" } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      expect(await screen.findByText("Contract execution failed")).toBeInTheDocument();
    });

    it("resets state on Clear", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { success: true }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      await screen.findByText("Result", { selector: "span" });
      fireEvent.click(screen.getByRole("button", { name: /clear/i }));
      expect(screen.queryByText("Result")).not.toBeInTheDocument();
    });
  });

  describe("simulate mode", () => {
    it("renders Simulate badge and subtitle", () => {
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} mode="simulate" />);
      const badges = screen.getAllByText("Simulate");
      expect(badges.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/read-only/i)).toBeInTheDocument();
    });

    it("calls simulateContract instead of invokeContract", async () => {
      mockSimulateContract.mockResolvedValueOnce({ data: { gasEstimate: 123456 }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} mode="simulate" />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
      await screen.findByText("Simulation Result", { selector: "span" });
      expect(mockSimulateContract).toHaveBeenCalled();
      expect(mockInvokeContract).not.toHaveBeenCalled();
    });

    it("shows Simulation Result badge on success", async () => {
      mockSimulateContract.mockResolvedValueOnce({ data: { gasEstimate: 123456 }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} mode="simulate" />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
      expect(await screen.findByText("Simulation Result", { selector: "span" })).toBeInTheDocument();
    });

    it("shows Simulating… label while loading", async () => {
      let resolveSimulate: (v: { data: unknown; error: null }) => void = () => {};
      mockSimulateContract.mockReturnValueOnce(new Promise((resolve) => { resolveSimulate = resolve; }));
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} mode="simulate" />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
      expect(screen.getByText("Simulating…")).toBeInTheDocument();
      expect(screen.getByRole("status", { name: /simulating contract/i })).toBeInTheDocument();
      await act(async () => { resolveSimulate({ data: { ok: true }, error: null }); });
    });

    it("passes correct params to simulateContract", async () => {
      mockSimulateContract.mockResolvedValueOnce({ data: { gasEstimate: 50000 }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} mode="simulate" />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
      await screen.findByText("Simulation Result", { selector: "span" });
      expect(mockSimulateContract).toHaveBeenCalledWith({
        contractId: "C123",
        method: "balance",
        args: [],
        sourceAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
      });
    });
  });

  describe("Copy as cURL", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
        writable: true,
      });
    });

    it("renders a Copy as cURL button in the success result section", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { ok: true }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      await screen.findByText("Result", { selector: "span" });
      const curlButtons = screen.getAllByRole("button", { name: /copy as cURL/i });
      expect(curlButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("copies a parseable cURL command to clipboard on click", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { ok: true }, error: null });
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      await screen.findByText("Result", { selector: "span" });
      const curlButtons = screen.getAllByRole("button", { name: /copy as cURL/i });
      fireEvent.click(curlButtons[0]);
      const curlText = writeText.mock.calls[0][0] as string;
      expect(curlText).toContain("curl -X POST");
      expect(curlText).toContain("https://soroban-rpc.example.com/invoke");
      expect(curlText).toContain("C123");
      expect(curlText).toContain("balance");
      expect(curlText).toContain("Content-Type: application/json");
    });

    it("shows Copied state briefly after clicking Copy as cURL", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { ok: true }, error: null });
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      await screen.findByText("Result", { selector: "span" });
      const curlButtons = screen.getAllByRole("button", { name: /copy as cURL/i });
      fireEvent.click(curlButtons[0]);
      expect(writeText).toHaveBeenCalled();
    });

    it("renders Copy as cURL in footbar for invoke mode success", async () => {
      mockInvokeContract.mockResolvedValueOnce({ data: { ok: true }, error: null });
      render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), { target: { value: "balance" } });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
      await screen.findByText("Result", { selector: "span" });
      const buttons = screen.getAllByRole("button", { name: /copy as cURL/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
