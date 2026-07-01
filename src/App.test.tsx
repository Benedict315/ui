import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "./App";
import type { AdapterResponse } from "./lib/adapter";

const MOCK_CONNECTED_ADDRESS =
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";

function createMockAdapter() {
  const connect = vi.fn<() => Promise<AdapterResponse<string>>>();
  const disconnect = vi.fn();
  const getAddress = vi.fn<() => string | null>();
  const invokeContract = vi.fn();
  const getEvents = vi.fn();

  return { connect, disconnect, getAddress, invokeContract, getEvents };
}

describe("App", () => {
  it("renders the heading and connect button when not connected", () => {
    const adapter = createMockAdapter();

    render(<App adapter={adapter} />);

    expect(screen.getByText("Sorokit UI")).toBeInTheDocument();
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.queryByText(/Connected/i)).not.toBeInTheDocument();
  });

  it("shows connected state after successful connect", async () => {
    const adapter = createMockAdapter();
    adapter.connect.mockResolvedValue({
      data: MOCK_CONNECTED_ADDRESS,
      error: null,
      status: "success",
    });

    render(<App adapter={adapter} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Connect Wallet"));
    });

    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    expect(screen.getByText("Disconnect")).toBeInTheDocument();
  });

  it("shows error banner when connect fails", async () => {
    const adapter = createMockAdapter();
    adapter.connect.mockResolvedValue({
      data: null,
      error: "Connection failed",
      status: "error",
    });

    render(<App adapter={adapter} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Connect Wallet"));
    });

    expect(screen.getByText("Connection failed")).toBeInTheDocument();
  });

  it("disconnects and returns to initial state", async () => {
    const adapter = createMockAdapter();
    adapter.connect.mockResolvedValue({
      data: MOCK_CONNECTED_ADDRESS,
      error: null,
      status: "success",
    });

    render(<App adapter={adapter} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Connect Wallet"));
    });
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Disconnect"));
    });
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });
});
