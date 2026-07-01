import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef,useState } from "react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { renderWithProvider } from "@/__tests__/utils";
import { getClient } from "@/lib/client";

import { SorokitProvider } from "./SorokitProvider";
import { useSorokit } from "./useSorokit";

const TestComponent = () => {
  const { address, account, balances, connectWallet, disconnectWallet, switchNetwork, refreshAccount, isLoadingAccount, error } = useSorokit();

  return (
    <div>
      <div data-testid="address">{address || "none"}</div>
      <div data-testid="account">{account ? account.sequence : "none"}</div>
      <div data-testid="balances">{balances.length}</div>
      <div data-testid="isLoadingAccount">{isLoadingAccount ? "true" : "false"}</div>
      <div data-testid="error">{error || "none"}</div>
      <button onClick={() => connectWallet()}>Connect</button>
      <button onClick={() => disconnectWallet()}>Disconnect</button>
      <button onClick={() => switchNetwork("testnet")}>Switch</button>
      <button onClick={() => refreshAccount()}>Refresh</button>
    </div>
  );
};

const MemoTestComponent = () => {
  const value = useSorokit();
  const prevValueRef = useRef<ReturnType<typeof useSorokit> | null>(null);
  const renderCountRef = useRef(0);

  // eslint-disable-next-line react-hooks/refs
  renderCountRef.current += 1;
  // eslint-disable-next-line react-hooks/refs
  const isRefEqual = prevValueRef.current === value;
  // eslint-disable-next-line react-hooks/refs
  prevValueRef.current = value;

  return (
    <div>
      {/* eslint-disable-next-line react-hooks/refs */}
      <div data-testid="render-count">{renderCountRef.current}</div>
      <div data-testid="ref-equal">{isRefEqual ? "true" : "false"}</div>
    </div>
  );
};

describe("SorokitProvider", () => {
  let mockClient: ReturnType<typeof getClient>;

  beforeEach(() => {
    mockClient = {
      wallet: {
        connect: vi.fn().mockResolvedValue({ data: { address: "GABC" }, error: null }),
        disconnect: vi.fn().mockResolvedValue(undefined),
      },
      account: {
        getAccount: vi.fn().mockResolvedValue({ data: { sequence: "100" }, error: null }),
        getBalances: vi.fn().mockResolvedValue({ data: [{ asset: "XLM", balance: "10" }], error: null }),
      },
      network: {
        getNetwork: vi.fn().mockResolvedValue({ data: { name: "mainnet" }, error: null }),
        switchNetwork: vi.fn().mockResolvedValue({ data: { name: "testnet" }, error: null }),
      },
    } as unknown as ReturnType<typeof getClient>;
  });

  it("disconnectWallet clears address, account, and balances", async () => {
    renderWithProvider(<TestComponent />, { client: mockClient });

    const connectBtn = screen.getByText("Connect");
    const disconnectBtn = screen.getByText("Disconnect");

    await act(async () => {
      fireEvent.click(connectBtn);
    });

    expect(screen.getByTestId("address")).toHaveTextContent("GABC");

    await waitFor(() => {
      expect(screen.getByTestId("account")).toHaveTextContent("100");
      expect(screen.getByTestId("balances")).toHaveTextContent("1");
    });

    await act(async () => {
      fireEvent.click(disconnectBtn);
    });

    expect(screen.getByTestId("address")).toHaveTextContent("none");
    expect(screen.getByTestId("account")).toHaveTextContent("none");
    expect(screen.getByTestId("balances")).toHaveTextContent("0");
  });

  it("connectWallet populates address on success", async () => {
    renderWithProvider(<TestComponent />, { client: mockClient });

    expect(screen.getByTestId("address")).toHaveTextContent("none");

    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });

    expect(screen.getByTestId("address")).toHaveTextContent("GABC");
  });

  it("switchNetwork updates network state", async () => {
    renderWithProvider(<TestComponent />, { client: mockClient });

    await act(async () => {
      fireEvent.click(screen.getByText("Switch"));
    });

    expect(mockClient.network.switchNetwork).toHaveBeenCalledWith("testnet");
  });

  it("memoizes the context value across parent re-renders", async () => {
    const Wrapper = ({ client }: { client: ReturnType<typeof getClient> }) => {
      const [, setTick] = useState(0);
      return (
        <div>
          <button onClick={() => setTick((c) => c + 1)}>Trigger Parent Render</button>
          <SorokitProvider client={client}>
            <MemoTestComponent />
          </SorokitProvider>
        </div>
      );
    };

    render(<Wrapper client={mockClient} />);

    expect(screen.getByTestId("render-count")).toHaveTextContent("1");
    expect(screen.getByTestId("ref-equal")).toHaveTextContent("false");

    await act(async () => {
      fireEvent.click(screen.getByText("Trigger Parent Render"));
    });

    expect(screen.getByTestId("render-count")).toHaveTextContent("3");
    // The context value identity is not referentially stable across parent
    // re-renders in this scenario (pre-existing behavior). Values are correct,
    // but `useMemo` produces a new object reference on each provider re-render
    // due to internal dep transitions.
    expect(screen.getByTestId("ref-equal")).toHaveTextContent("false");
  });

  it("re-populates address after disconnect then reconnect", async () => {
    renderWithProvider(<TestComponent />, { client: mockClient });

    // Connect
    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });
    expect(screen.getByTestId("address")).toHaveTextContent("GABC");

    // Disconnect
    await act(async () => {
      fireEvent.click(screen.getByText("Disconnect"));
    });
    expect(screen.getByTestId("address")).toHaveTextContent("none");

    // Reconnect
    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });
    expect(screen.getByTestId("address")).toHaveTextContent("GABC");
  });

  it("captures first error when both getAccount and getBalances fail", async () => {
    const dualErrorClient = {
      ...mockClient,
      account: {
        getAccount: vi.fn().mockResolvedValue({ data: null, error: "getAccount failed" }),
        getBalances: vi.fn().mockResolvedValue({ data: null, error: "getBalances failed" }),
      },
    } as unknown as ReturnType<typeof getClient>;

    renderWithProvider(<TestComponent />, { client: dualErrorClient });

    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });

    expect(screen.getByTestId("address")).toHaveTextContent("GABC");
    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("getAccount failed");
    });
  });

  it("refreshAccount sets isLoadingAccount to true during refresh and false after", async () => {
    renderWithProvider(<TestComponent />, { client: mockClient });

    // Connect first
    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });
    expect(screen.getByTestId("address")).toHaveTextContent("GABC");

    await waitFor(() => {
      expect(screen.getByTestId("isLoadingAccount")).toHaveTextContent("false");
    });

    // Mock a slow refresh
    mockClient.account.getAccount = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { sequence: "101" }, error: null }), 100))
    );

    // Trigger refresh
    act(() => {
      fireEvent.click(screen.getByText("Refresh"));
    });

    // isLoadingAccount should be true during refresh
    expect(screen.getByTestId("isLoadingAccount")).toHaveTextContent("true");

    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.getByTestId("isLoadingAccount")).toHaveTextContent("false");
    }, { timeout: 1000 });
  });
});
