import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll,beforeEach, describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { NetworkSwitcher } from "./NetworkSwitcher";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("@radix-ui/react-dropdown-menu", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@radix-ui/react-dropdown-menu")>();
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("@radix-ui/react-tooltip", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@radix-ui/react-tooltip")>();
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("@radix-ui/react-dialog", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@radix-ui/react-dialog")>();
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("NetworkSwitcher", () => {
  let switchNetwork: ReturnType<typeof vi.fn>;
  let addCustomNetwork: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    // Radix measures the tooltip arrow with ResizeObserver, which jsdom lacks.
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    switchNetwork = vi.fn().mockResolvedValue(undefined);
    addCustomNetwork = vi.fn().mockResolvedValue(undefined);
  });

  it("displays the active network label in the trigger button", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "mainnet", rpcUrl: "https://soroban.stellar.org", status: "online" },
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);
    expect(
      screen.getByRole("button", { name: /current network: mainnet/i }),
    ).toBeInTheDocument();
  });

  it("falls back to Testnet label when network is null", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: null,
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);
    expect(
      screen.getByRole("button", { name: /current network: testnet/i }),
    ).toBeInTheDocument();
  });

  it("applies the orange dot class for testnet", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "testnet" },
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<NetworkSwitcher />);
    const triggerButton = container.querySelector("button");
    expect(triggerButton?.querySelector(".bg-orange")).toBeInTheDocument();
  });

  it("applies the green dot class for mainnet", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "mainnet" },
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<NetworkSwitcher />);
    const triggerButton = container.querySelector("button");
    expect(triggerButton?.querySelector(".bg-green")).toBeInTheDocument();
  });

  it("applies the purple dot class for futurenet", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "futurenet" },
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<NetworkSwitcher />);
    const triggerButton = container.querySelector("button");
    expect(triggerButton?.querySelector(".bg-purple")).toBeInTheDocument();
  });

  it("opens dropdown and renders all standard network options and RPC endpoints", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "mainnet", rpcUrl: "https://soroban.stellar.org", status: "online" },
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);

    const trigger = screen.getByRole("button", { name: /current network: mainnet/i });
    fireEvent.pointerDown(trigger, { pointerId: 1, button: 0 });
    fireEvent.click(trigger);

    expect(screen.getByText("Select Network")).toBeInTheDocument();
    expect(screen.getAllByText("Mainnet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Testnet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Futurenet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Localnet").length).toBeGreaterThan(0);
    expect(screen.getByText("https://soroban-testnet.stellar.org")).toBeInTheDocument();
  });

  it("switches network when clicking a network item without page reload", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "mainnet", rpcUrl: "https://soroban.stellar.org" },
      switchNetwork,
      customNetworks: [],
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);

    const trigger = screen.getByRole("button", { name: /current network: mainnet/i });
    fireEvent.pointerDown(trigger, { pointerId: 1, button: 0 });
    fireEvent.click(trigger);

    const testnetItem = screen.getAllByText("Testnet")[0];
    fireEvent.click(testnetItem);

    expect(switchNetwork).toHaveBeenCalledWith("testnet");
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Switched to Testnet");
    });
  });

  it("opens Add Custom Network dialog and creates a new custom network", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "testnet" },
      switchNetwork,
      customNetworks: [],
      addCustomNetwork,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);

    const trigger = screen.getByRole("button", { name: /current network: testnet/i });
    fireEvent.pointerDown(trigger, { pointerId: 1, button: 0 });
    fireEvent.click(trigger);

    const addCustomTrigger = screen.getByText("Add Custom Network...");
    fireEvent.click(addCustomTrigger);

    expect(screen.getAllByText("Add Custom Network").length).toBeGreaterThan(0);

    const nameInput = screen.getByLabelText(/network name/i);
    const rpcInput = screen.getByLabelText(/rpc endpoint url/i);

    fireEvent.change(nameInput, { target: { value: "Private Standalone" } });
    fireEvent.change(rpcInput, { target: { value: "http://127.0.0.1:8000/rpc" } });

    const submitBtn = screen.getByRole("button", { name: /add & switch network/i });
    fireEvent.click(submitBtn);

    expect(addCustomNetwork).toHaveBeenCalledWith({
      name: "Private Standalone",
      rpcUrl: "http://127.0.0.1:8000/rpc",
      horizonUrl: "http://localhost:8000",
      passphrase: "Standalone Network ; February 2017",
      status: "online",
    });
  });

  describe("Alt+N keyboard shortcut", () => {
    beforeEach(() => {
      vi.mocked(useSorokit).mockReturnValue({
        network: { name: "testnet", rpcUrl: "https://soroban-testnet.stellar.org" },
        switchNetwork,
        customNetworks: [],
      } as unknown as ReturnType<typeof useSorokit>);
    });

    it("advertises the shortcut on the trigger", () => {
      render(<NetworkSwitcher />);
      expect(
        screen.getByRole("button", { name: /current network: testnet/i }),
      ).toHaveAttribute("aria-keyshortcuts", "Alt+N");
    });

    it("opens the dropdown on Alt+N", async () => {
      render(<NetworkSwitcher />);
      expect(screen.queryByText("Select Network")).not.toBeInTheDocument();

      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true });

      await waitFor(() => {
        expect(screen.getByText("Select Network")).toBeInTheDocument();
      });
    });

    it("closes the dropdown on a second Alt+N", async () => {
      render(<NetworkSwitcher />);

      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true });
      await waitFor(() => {
        expect(screen.getByText("Select Network")).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true });
      await waitFor(() => {
        expect(screen.queryByText("Select Network")).not.toBeInTheDocument();
      });
    });

    it("ignores N without Alt", () => {
      render(<NetworkSwitcher />);
      fireEvent.keyDown(document, { key: "n", code: "KeyN" });
      expect(screen.queryByText("Select Network")).not.toBeInTheDocument();
    });

    it("ignores Alt+N combined with Ctrl or Meta", () => {
      render(<NetworkSwitcher />);
      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true, ctrlKey: true });
      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true, metaKey: true });
      expect(screen.queryByText("Select Network")).not.toBeInTheDocument();
    });

    it("detaches the listener on unmount", () => {
      const { unmount } = render(<NetworkSwitcher />);
      unmount();
      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true });
      expect(screen.queryByText("Select Network")).not.toBeInTheDocument();
    });

    it("advertises the Alt+N shortcut in the trigger's tooltip text", () => {
      vi.mocked(useSorokit).mockReturnValue({
        network: { name: "mainnet" },
        initialNetwork: { name: "mainnet" },
        switchNetwork: switchNetwork,
        customNetworks: [],
      } as unknown as ReturnType<typeof useSorokit>);

      render(<NetworkSwitcher />);

      expect(
        screen.getByText(/Press Alt\+N to switch networks/i),
      ).toBeInTheDocument();
    });
  });

  describe("client/network mismatch warning", () => {
    it("shows a warning badge when the selection differs from the initialised network", () => {
      vi.mocked(useSorokit).mockReturnValue({
        network: { name: "mainnet", rpcUrl: "https://soroban.stellar.org" },
        initialNetwork: { name: "testnet", rpcUrl: "https://soroban-testnet.stellar.org" },
        switchNetwork,
        customNetworks: [],
      } as unknown as ReturnType<typeof useSorokit>);

      render(<NetworkSwitcher />);

      expect(screen.getByTestId("network-mismatch-badge")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /initialised with testnet/i }),
      ).toBeInTheDocument();
    });

    it("explains the mismatch inside the dropdown", async () => {
      vi.mocked(useSorokit).mockReturnValue({
        network: { name: "mainnet", rpcUrl: "https://soroban.stellar.org" },
        initialNetwork: { name: "testnet" },
        switchNetwork,
        customNetworks: [],
      } as unknown as ReturnType<typeof useSorokit>);

      render(<NetworkSwitcher />);
      fireEvent.keyDown(document, { key: "n", code: "KeyN", altKey: true });

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /client was initialised with testnet/i,
        );
      });
    });

    it("shows no badge when the selection matches the initialised network", () => {
      vi.mocked(useSorokit).mockReturnValue({
        network: { name: "testnet" },
        initialNetwork: { name: "testnet" },
        switchNetwork,
        customNetworks: [],
      } as unknown as ReturnType<typeof useSorokit>);

      render(<NetworkSwitcher />);
      expect(screen.queryByTestId("network-mismatch-badge")).not.toBeInTheDocument();
    });

    it("shows no badge when the initialised network is unknown", () => {
      vi.mocked(useSorokit).mockReturnValue({
        network: { name: "mainnet" },
        initialNetwork: null,
        switchNetwork,
        customNetworks: [],
      } as unknown as ReturnType<typeof useSorokit>);

      render(<NetworkSwitcher />);
      expect(screen.queryByTestId("network-mismatch-badge")).not.toBeInTheDocument();
    });
  });

  it("displays custom networks in dropdown when present", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "custom-node", rpcUrl: "http://127.0.0.1:8000/rpc" },
      switchNetwork,
      customNetworks: [
        {
          name: "custom-node",
          rpcUrl: "http://127.0.0.1:8000/rpc",
          horizonUrl: "http://127.0.0.1:8000",
          passphrase: "Custom Passphrase",
        },
      ],
      addCustomNetwork,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);

    const trigger = screen.getByRole("button", { name: /current network: custom-node/i });
    fireEvent.pointerDown(trigger, { pointerId: 1, button: 0 });
    fireEvent.click(trigger);

    expect(screen.getByText("Custom Networks")).toBeInTheDocument();
    expect(screen.getAllByText("custom-node").length).toBeGreaterThan(0);
    expect(screen.getAllByText("http://127.0.0.1:8000/rpc").length).toBeGreaterThan(0);
  });
});
