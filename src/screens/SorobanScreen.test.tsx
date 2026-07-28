import { act,fireEvent, render, screen } from "@testing-library/react";
import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";
import type { SorokitClient } from "@/lib/client";
import { getClient } from "@/lib/client";

import { SorobanScreen } from "./SorobanScreen";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("@/lib/client", () => ({
  getClient: vi.fn(),
}));

function mockClient() {
  vi.mocked(getClient).mockReturnValue({
    soroban: {
      invokeContract: vi.fn().mockReturnValue(new Promise(() => {})),
      getEvents: vi.fn().mockReturnValue(new Promise(() => {})),
    },
  } as unknown as SorokitClient);
}

describe("SorobanScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useSorokit).mockReturnValue({
      isConnected: true,
      address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
    } as unknown as ReturnType<typeof useSorokit>);
    mockClient();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the screen heading", () => {
    render(<SorobanScreen />);
    expect(screen.getAllByText("Soroban")).toHaveLength(2);
  });

  it("does not render ContractEventFeed when contractId is empty", () => {
    render(<SorobanScreen />);
    expect(screen.queryByText("Contract Events")).not.toBeInTheDocument();
  });

  it("renders ContractEventFeed when a contractId is entered", () => {
    render(<SorobanScreen />);

    const input = screen.getByPlaceholderText(/C\.\.\./i);
    fireEvent.change(input, {
      target: { value: "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA" },
    });

    act(() => { vi.advanceTimersByTime(0); });

    expect(screen.getByText("Contract Events")).toBeInTheDocument();
  });

  it("hides ContractEventFeed again when contractId is cleared", () => {
    render(<SorobanScreen />);

    const input = screen.getByPlaceholderText(/C\.\.\./i);
    fireEvent.change(input, {
      target: { value: "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA" },
    });
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByText("Contract Events")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });
    expect(screen.queryByText("Contract Events")).not.toBeInTheDocument();
  });

  it("does not render ContractEventFeed for a whitespace-only contractId", () => {
    render(<SorobanScreen />);

    const input = screen.getByPlaceholderText(/C\.\.\./i);
    fireEvent.change(input, { target: { value: "   " } });

    expect(screen.queryByText("Contract Events")).not.toBeInTheDocument();
  });

  describe("localStorage pre-fill and saved contracts (#350)", () => {
    const CONTRACT_A = "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";
    const CONTRACT_B = "CBBZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNB";

    beforeEach(() => {
      localStorage.clear();
    });

    it("pre-fills contractId from the most recent entry in localStorage on mount", () => {
      localStorage.setItem(
        "sorokit-soroban-contract-history",
        JSON.stringify([CONTRACT_A, CONTRACT_B]),
      );

      render(<SorobanScreen />);

      const input = screen.getByPlaceholderText(/C\.\.\./i) as HTMLInputElement;
      expect(input.value).toBe(CONTRACT_A);
    });

    it("does not render the saved-contracts dropdown when there is only one entry", () => {
      localStorage.setItem("sorokit-soroban-contract-history", JSON.stringify([CONTRACT_A]));

      render(<SorobanScreen />);

      expect(screen.queryByText("Saved Contracts")).not.toBeInTheDocument();
    });

    it("lists saved contracts in a dropdown and applies one on click", () => {
      localStorage.setItem(
        "sorokit-soroban-contract-history",
        JSON.stringify([CONTRACT_A, CONTRACT_B]),
      );

      render(<SorobanScreen />);

      expect(screen.getByText("Saved Contracts")).toBeInTheDocument();
      const labelA = `${CONTRACT_A.slice(0, 6)}…${CONTRACT_A.slice(-4)}`;
      const labelB = `${CONTRACT_B.slice(0, 6)}…${CONTRACT_B.slice(-4)}`;
      expect(screen.getByText(labelA)).toBeInTheDocument();
      const buttonB = screen.getByText(labelB);
      expect(buttonB).toBeInTheDocument();

      fireEvent.click(buttonB);

      const input = screen.getByPlaceholderText(/C\.\.\./i) as HTMLInputElement;
      expect(input.value).toBe(CONTRACT_B);
    });

    it("ignores malformed JSON in localStorage and starts with an empty contractId", () => {
      localStorage.setItem("sorokit-soroban-contract-history", "not-json{{{");

      render(<SorobanScreen />);

      const input = screen.getByPlaceholderText(/C\.\.\./i) as HTMLInputElement;
      expect(input.value).toBe("");
      expect(screen.queryByText("Saved Contracts")).not.toBeInTheDocument();
    });
  });

  describe("Stellar Expert link (#350)", () => {
    const CONTRACT_ID = "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";

    beforeEach(() => {
      localStorage.clear();
    });

    it("links to the testnet Stellar Expert contract page", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
        network: { name: "testnet" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<SorobanScreen />);
      const input = screen.getByPlaceholderText(/C\.\.\./i);
      fireEvent.change(input, { target: { value: CONTRACT_ID } });

      const link = screen.getByRole("link", { name: /Stellar Expert/i });
      expect(link).toHaveAttribute(
        "href",
        `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
      );
    });

    it("links to the public (mainnet) Stellar Expert contract page", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
        network: { name: "mainnet" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<SorobanScreen />);
      const input = screen.getByPlaceholderText(/C\.\.\./i);
      fireEvent.change(input, { target: { value: CONTRACT_ID } });

      const link = screen.getByRole("link", { name: /Stellar Expert/i });
      expect(link).toHaveAttribute(
        "href",
        `https://stellar.expert/explorer/public/contract/${CONTRACT_ID}`,
      );
    });

    it("renders no Stellar Expert link for an unrecognized network", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
        network: { name: "futurenet" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<SorobanScreen />);
      const input = screen.getByPlaceholderText(/C\.\.\./i);
      fireEvent.change(input, { target: { value: CONTRACT_ID } });

      expect(screen.queryByRole("link", { name: /Stellar Expert/i })).not.toBeInTheDocument();
    });

    it("renders no Stellar Expert link when contractId is empty", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
        network: { name: "testnet" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<SorobanScreen />);

      expect(screen.queryByRole("link", { name: /Stellar Expert/i })).not.toBeInTheDocument();
    });
  });
});
