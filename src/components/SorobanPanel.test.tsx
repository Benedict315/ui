import { fireEvent,render, screen } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { SorobanPanel } from "./SorobanPanel";

const mockInvokeContract = vi.fn();

// Mock the useSorokit context
vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(() => ({
    isConnected: true,
    address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
  })),
}));

// Mock the getClient from lib/client
vi.mock("../lib/client", () => ({
  getClient: () => ({
    soroban: {
      invokeContract: mockInvokeContract,
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

  it("should have invoke button disabled when method is empty", () => {
    render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });
    expect(invokeBtn).toBeDisabled();
  });

  it("should show error when invalid JSON args are provided", async () => {
    let currentContractId = "";
    const setContractId = (id: string) => {
      currentContractId = id;
    };

    const { rerender } = render(
      <SorobanPanel contractId={currentContractId} onContractIdChange={setContractId} />
    );

    // Fill out contract ID and method to enable the button
    const methodInput = screen.getByPlaceholderText(/transfer/i);
    const argsInput = screen.getByPlaceholderText(/\[.*\]/i);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });

    fireEvent.change(methodInput, { target: { value: "mint" } });
    fireEvent.change(argsInput, { target: { value: "invalid json {" } });

    // Rerender with the updated contract ID to propagate prop change
    rerender(<SorobanPanel contractId="C123" onContractIdChange={setContractId} />);

    expect(invokeBtn).not.toBeDisabled();

    fireEvent.click(invokeBtn);

    const errorText = await screen.findByText(/Invalid JSON in arguments/i);
    expect(errorText).toBeInTheDocument();
  });

  // ── Non-array JSON args (#118) ────────────────────────────────────────────
  // Valid JSON that is not an array (e.g. `{}` or `42`) must be rejected before
  // it is forwarded to invokeContract, which expects an argument array.
  async function invokeWithArgs(argsValue: string) {
    const { rerender } = render(
      <SorobanPanel contractId="" onContractIdChange={() => {}} />,
    );
    fireEvent.change(screen.getByPlaceholderText(/c\.\.\./i), {
      target: { value: "C123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/transfer/i), {
      target: { value: "mint" },
    });
    fireEvent.change(screen.getByPlaceholderText(/\[.*\]/i), {
      target: { value: argsValue },
    });
    rerender(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
  }

  it("rejects a JSON object (non-array) with a 'must be a JSON array' error", async () => {
    await invokeWithArgs("{}");
    expect(
      await screen.findByText(/Arguments must be a JSON array/i),
    ).toBeInTheDocument();
  });

  it("rejects a JSON number (non-array) with a 'must be a JSON array' error", async () => {
    await invokeWithArgs("42");
    expect(
      await screen.findByText(/Arguments must be a JSON array/i),
    ).toBeInTheDocument();
  });

  it("accepts a valid JSON array and reaches the success state", async () => {
    mockInvokeContract.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });
    await invokeWithArgs('["arg1", 42]');
    // No validation error; the mocked invokeContract resolves successfully.
    expect(
      screen.queryByText(/Arguments must be a JSON array/i),
    ).not.toBeInTheDocument();
    expect(await screen.findByText("Result", { selector: "span" })).toBeInTheDocument();
  });

  it("should show error when invokeContract fails", async () => {
    mockInvokeContract.mockResolvedValueOnce({ data: null, error: "Contract execution failed" });

    const onContractIdChange = vi.fn();
    render(<SorobanPanel contractId="C123" onContractIdChange={onContractIdChange} />);

    const methodInput = screen.getByLabelText("Method");
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });

    fireEvent.change(methodInput, { target: { value: "mint" } });
    fireEvent.click(invokeBtn);

    const errorText = await screen.findByText("Contract execution failed");
    expect(errorText).toBeInTheDocument();
  });

  it("should invoke contract successfully, show result, and reset state on Clear", async () => {
    mockInvokeContract.mockResolvedValueOnce({ data: { success: true, balance: 1000 }, error: null });

    const onContractIdChange = vi.fn();
    render(<SorobanPanel contractId="C123" onContractIdChange={onContractIdChange} />);

    const methodInput = screen.getByLabelText("Method");
    const argsInput = screen.getByLabelText("Arguments (JSON array)");
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });

    fireEvent.change(methodInput, { target: { value: "balance" } });
    fireEvent.change(argsInput, { target: { value: '["GAAZI...", 42]' } });

    fireEvent.click(invokeBtn);

    // Verify result is displayed
    const resultHeader = await screen.findByText("Result", { selector: "span" });
    expect(resultHeader).toBeInTheDocument();
    expect(screen.getByText(/"balance": 1000/)).toBeInTheDocument();

    // Verify invokeContract parameters
    expect(mockInvokeContract).toHaveBeenCalledWith({
      contractId: "C123",
      method: "balance",
      args: ["GAAZI...", 42],
      sourceAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
    });

    // Verify Clear resets result
    const clearBtn = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearBtn);

    expect(screen.queryByText("Result")).not.toBeInTheDocument();
    expect(screen.queryByText(/"balance": 1000/)).not.toBeInTheDocument();
  });

  it("disables fields and shows a full result-area skeleton while invoking", async () => {
    let resolveInvoke!: (value: { data: unknown; error: null }) => void;
    mockInvokeContract.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveInvoke = resolve;
      }),
    );
    render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    fireEvent.change(screen.getByLabelText("Method"), {
      target: { value: "balance" },
    });

    fireEvent.click(screen.getByRole("button", { name: /invoke/i }));

    expect(screen.getByLabelText("Contract ID")).toBeDisabled();
    expect(screen.getByLabelText("Method")).toBeDisabled();
    expect(screen.getByLabelText("Arguments (JSON array)")).toBeDisabled();
    expect(screen.getByRole("status", { name: /invoking contract/i })).toHaveClass(
      "absolute",
      "inset-0",
      "h-full",
    );

    resolveInvoke({ data: { ok: true }, error: null });
    expect(await screen.findByText("Result")).toBeInTheDocument();
  });

  it("invokes with Ctrl+Enter from the arguments field", async () => {
    mockInvokeContract.mockResolvedValueOnce({ data: { ok: true }, error: null });
    render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    fireEvent.change(screen.getByLabelText("Method"), {
      target: { value: "balance" },
    });

    fireEvent.keyDown(screen.getByLabelText("Arguments (JSON array)"), {
      key: "Enter",
      ctrlKey: true,
    });

    expect(await screen.findByText("Result")).toBeInTheDocument();
    expect(mockInvokeContract).toHaveBeenCalledOnce();
  });

  it("invokes with Cmd+Enter from the arguments field", async () => {
    mockInvokeContract.mockResolvedValueOnce({ data: { ok: true }, error: null });
    render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    fireEvent.change(screen.getByLabelText("Method"), {
      target: { value: "balance" },
    });

    fireEvent.keyDown(screen.getByLabelText("Arguments (JSON array)"), {
      key: "Enter",
      metaKey: true,
    });

    expect(await screen.findByText("Result")).toBeInTheDocument();
    expect(mockInvokeContract).toHaveBeenCalledOnce();
  });

  it("grows the argument textarea as lines are added and remains user-resizable", () => {
    render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    const textarea = screen.getByLabelText("Arguments (JSON array)");

    fireEvent.input(textarea, { target: { value: "[\n1,\n2,\n3\n]" } });

    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveClass("resize-y");
  });

  it("updates the textarea height style dynamically on input", () => {
    render(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    const textarea = screen.getByLabelText("Arguments (JSON array)") as HTMLTextAreaElement;

    Object.defineProperty(textarea, "scrollHeight", { value: 120, configurable: true });
    fireEvent.input(textarea, { target: { value: "[\nline1\nline2\n]" } });

    expect(textarea.style.height).toBe("120px");
  });

  // ── Contract ID history (#205) ──────────────────────────────────────────
  describe("contract ID history", () => {
    const HISTORY_KEY = "sorokit-soroban-contract-history";

    it("renders no datalist when localStorage has no history", () => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);

      const input = screen.getByLabelText("Contract ID");
      expect(input).not.toHaveAttribute("list");

      vi.unstubAllGlobals();
    });

    it("renders a <datalist> populated from a previously used contract ID in localStorage", () => {
      const store: Record<string, string> = {
        [HISTORY_KEY]: JSON.stringify(["CPREVIOUS123"]),
      };
      vi.stubGlobal("localStorage", {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      const { container } = render(
        <SorobanPanel contractId="" onContractIdChange={() => {}} />,
      );

      const input = screen.getByLabelText("Contract ID");
      expect(input).toHaveAttribute(
        "list",
        "sorokit-soroban-contract-history-list",
      );
      const option = container.querySelector(
        "datalist#sorokit-soroban-contract-history-list option",
      );
      expect(option).toHaveAttribute("value", "CPREVIOUS123");

      vi.unstubAllGlobals();
    });

    it("stores a successfully invoked contract ID in localStorage history", async () => {
      const store: Record<string, string> = {};
      const setItem = vi.fn((key: string, value: string) => {
        store[key] = value;
      });
      vi.stubGlobal("localStorage", {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
      });
      mockInvokeContract.mockResolvedValueOnce({
        data: { ok: true },
        error: null,
      });

      render(<SorobanPanel contractId="CNEW456" onContractIdChange={() => {}} />);
      fireEvent.change(screen.getByLabelText("Method"), {
        target: { value: "balance" },
      });
      fireEvent.click(screen.getByRole("button", { name: /invoke/i }));

      await screen.findByText("Result");

      expect(setItem).toHaveBeenCalledWith(
        HISTORY_KEY,
        JSON.stringify(["CNEW456"]),
      );

      vi.unstubAllGlobals();
    });

    it("does not render a suggestion after localStorage is cleared", () => {
      const store: Record<string, string> = {
        [HISTORY_KEY]: JSON.stringify(["COLD789"]),
      };
      vi.stubGlobal("localStorage", {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(() => {
          for (const key of Object.keys(store)) delete store[key];
        }),
      });

      const { unmount } = render(
        <SorobanPanel contractId="" onContractIdChange={() => {}} />,
      );
      expect(screen.getByLabelText("Contract ID")).toHaveAttribute("list");
      unmount();

      localStorage.clear();

      render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
      expect(screen.getByLabelText("Contract ID")).not.toHaveAttribute(
        "list",
      );

      vi.unstubAllGlobals();
    });
  });
});
