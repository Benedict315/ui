import { act,fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import type { ContractEvent,SorokitClient } from "@/lib/client";
import { getClient } from "@/lib/client";

import { ContractEventFeed } from "./ContractEventFeed";

vi.mock("@/lib/client", () => ({
  getClient: vi.fn(),
}));

const CONTRACT_ID = "CAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";

const MOCK_EVENT: ContractEvent = {
  id: "evt-1",
  type: "transfer",
  ledger: 123456,
  topics: ["GA...from", "GB...to"],
  value: { amount: 100 },
  createdAt: new Date("2024-01-01T12:00:00Z").toISOString(),
};

function mockGetEvents(result: { data: ContractEvent[] | null; error: string | null }) {
  vi.mocked(getClient).mockReturnValue({
    soroban: {
      getEvents: vi.fn().mockResolvedValue(result),
    },
  } as unknown as SorokitClient);
}

describe("ContractEventFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loading skeleton on initial load", () => {
    vi.mocked(getClient).mockReturnValue({
      soroban: {
        getEvents: vi.fn().mockReturnValue(new Promise(() => {})),
      },
    } as unknown as SorokitClient);

    const { container } = render(
      <ContractEventFeed contractId={CONTRACT_ID} />,
    );
    act(() => { vi.advanceTimersByTime(0); });
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders events after loading", async () => {
    mockGetEvents({ data: [MOCK_EVENT], error: null });

    render(<ContractEventFeed contractId={CONTRACT_ID} />);
    act(() => { vi.advanceTimersByTime(0); });

    await waitFor(() => {
      expect(screen.getByText("transfer")).toBeInTheDocument();
    });
  });

  it("renders 'No events found' when the events array is empty", async () => {
    mockGetEvents({ data: [], error: null });

    render(<ContractEventFeed contractId={CONTRACT_ID} />);
    act(() => { vi.advanceTimersByTime(0); });

    await waitFor(() => {
      expect(screen.getByText("No events found")).toBeInTheDocument();
    });
  });

  it("renders an error message when getEvents returns an error", async () => {
    mockGetEvents({ data: null, error: "Contract not found" });

    render(<ContractEventFeed contractId={CONTRACT_ID} />);
    act(() => { vi.advanceTimersByTime(0); });

    await waitFor(() => {
      expect(screen.getByText("Contract not found")).toBeInTheDocument();
    });
  });

  it("starts polling when pollInterval > 0 and live is true", async () => {
    const getEvents = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(getClient).mockReturnValue({
      soroban: { getEvents },
    } as unknown as SorokitClient);

    render(<ContractEventFeed contractId={CONTRACT_ID} pollInterval={500} />);

    // Initial load
    act(() => { vi.advanceTimersByTime(0); });
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(1));

    // Advance past one poll interval
    act(() => { vi.advanceTimersByTime(500); });
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(2));
  });

  it("stops polling when the Live/Paused toggle is clicked", async () => {
    const getEvents = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(getClient).mockReturnValue({
      soroban: { getEvents },
    } as unknown as SorokitClient);

    render(<ContractEventFeed contractId={CONTRACT_ID} pollInterval={500} />);
    act(() => { vi.advanceTimersByTime(0); });
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(1));

    // Toggle to Paused
    fireEvent.click(screen.getByRole("button", { name: /live/i }));
    const callsAfterPause = getEvents.mock.calls.length;

    // Advance well past interval — no new calls should happen
    act(() => { vi.advanceTimersByTime(1500); });
    expect(getEvents).toHaveBeenCalledTimes(callsAfterPause);
  });

  it("triggers a new load when contractId changes", async () => {
    const getEvents = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(getClient).mockReturnValue({
      soroban: { getEvents },
    } as unknown as SorokitClient);

    const { rerender } = render(
      <ContractEventFeed contractId={CONTRACT_ID} />,
    );
    act(() => { vi.advanceTimersByTime(0); });
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(1));

    const NEW_ID = "CBBB4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";
    rerender(<ContractEventFeed contractId={NEW_ID} />);
    act(() => { vi.advanceTimersByTime(0); });

    await waitFor(() => {
      expect(getEvents).toHaveBeenCalledTimes(2);
      expect(getEvents).toHaveBeenLastCalledWith(NEW_ID, 10);
    });
  });

  // ── Accessibility (#120) ──────────────────────────────────────────────────
  describe("accessibility", () => {
    it("reflects polling state on the Live/Paused toggle via aria-pressed", async () => {
      const getEvents = vi.fn().mockResolvedValue({ data: [], error: null });
      vi.mocked(getClient).mockReturnValue({
        soroban: { getEvents },
      } as unknown as SorokitClient);

      render(<ContractEventFeed contractId={CONTRACT_ID} pollInterval={500} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(1));

      const toggle = screen.getByRole("button", { name: /live/i });
      // Live while polling…
      expect(toggle).toHaveAttribute("aria-pressed", "true");

      // …and Paused after toggling off.
      fireEvent.click(toggle);
      expect(
        screen.getByRole("button", { name: /paused/i }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("announces new events through a polite live region", async () => {
      const getEvents = vi.fn().mockResolvedValue({ data: [MOCK_EVENT], error: null });
      vi.mocked(getClient).mockReturnValue({
        soroban: { getEvents },
      } as unknown as SorokitClient);

      const { container } = render(
        <ContractEventFeed contractId={CONTRACT_ID} />,
      );
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() =>
        expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument(),
      );
    });
  });

  // ── Event type filtering (#263) ───────────────────────────────────────────
  describe("event type filtering", () => {
    const MULTI_TYPE_EVENTS: ContractEvent[] = [
      { ...MOCK_EVENT, id: "evt-transfer", type: "transfer" },
      { ...MOCK_EVENT, id: "evt-mint", type: "mint" },
      { ...MOCK_EVENT, id: "evt-burn", type: "burn" },
    ];

    it("renders a toggle button per distinct event type present in the feed", async () => {
      mockGetEvents({ data: MULTI_TYPE_EVENTS, error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /transfer \(1\)/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /mint \(1\)/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /burn \(1\)/i })).toBeInTheDocument();
      });
    });

    it("shows every type as active by default", async () => {
      mockGetEvents({ data: MULTI_TYPE_EVENTS, error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /transfer \(1\)/i })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
      });
    });

    it("filters the displayed events when a type toggle is clicked", async () => {
      mockGetEvents({ data: MULTI_TYPE_EVENTS, error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => screen.getByRole("button", { name: /transfer \(1\)/i }));

      // Turn off "mint" and "burn", leaving only "transfer" events visible.
      fireEvent.click(screen.getByRole("button", { name: /mint \(1\)/i }));
      fireEvent.click(screen.getByRole("button", { name: /burn \(1\)/i }));

      expect(screen.getAllByText("transfer")).toHaveLength(1);
      expect(screen.queryByText("mint")).not.toBeInTheDocument();
      expect(screen.queryByText("burn")).not.toBeInTheDocument();
    });

    it("re-enables a type when its toggle is clicked again", async () => {
      mockGetEvents({ data: MULTI_TYPE_EVENTS, error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => screen.getByRole("button", { name: /mint \(1\)/i }));

      const mintToggle = screen.getByRole("button", { name: /mint \(1\)/i });
      fireEvent.click(mintToggle);
      expect(screen.queryByText("mint")).not.toBeInTheDocument();

      fireEvent.click(mintToggle);
      expect(screen.getByText("mint")).toBeInTheDocument();
    });

    it("shows a 'no events match' message when every type is filtered out", async () => {
      mockGetEvents({ data: MULTI_TYPE_EVENTS, error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => screen.getByRole("button", { name: /transfer \(1\)/i }));

      fireEvent.click(screen.getByRole("button", { name: /transfer \(1\)/i }));
      fireEvent.click(screen.getByRole("button", { name: /mint \(1\)/i }));
      fireEvent.click(screen.getByRole("button", { name: /burn \(1\)/i }));

      expect(
        screen.getByText("No events match the selected filters"),
      ).toBeInTheDocument();
    });

    it("respects the filterTypes prop as the initial active set", async () => {
      mockGetEvents({ data: MULTI_TYPE_EVENTS, error: null });
      render(
        <ContractEventFeed contractId={CONTRACT_ID} filterTypes={["transfer"]} />,
      );
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => {
        expect(screen.getByText("transfer")).toBeInTheDocument();
      });
      expect(screen.queryByText("mint")).not.toBeInTheDocument();
      expect(screen.queryByText("burn")).not.toBeInTheDocument();
    });
  });

  // ── Event value truncation (#263) ─────────────────────────────────────────
  describe("event value truncation", () => {
    function eventWithValue(value: unknown): ContractEvent {
      return { ...MOCK_EVENT, id: "evt-value", value };
    }

    it("renders short values without a Show more toggle", async () => {
      mockGetEvents({ data: [eventWithValue({ a: 1 })], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => {
        expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
      });
      expect(screen.queryByRole("button", { name: /show more/i })).not.toBeInTheDocument();
    });

    it("truncates values exceeding maxValueLength and shows a 'Show more' toggle", async () => {
      const longValue = { data: "x".repeat(300) };
      mockGetEvents({ data: [eventWithValue(longValue)], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} maxValueLength={50} />);
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /show more/i })).toBeInTheDocument();
      });
      const fullJson = JSON.stringify(longValue, null, 2);
      expect(screen.queryByText(fullJson)).not.toBeInTheDocument();
    });

    it("expands to the full value when 'Show more' is clicked, then collapses on 'Show less'", async () => {
      const longValue = { data: "y".repeat(300) };
      mockGetEvents({ data: [eventWithValue(longValue)], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} maxValueLength={50} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => screen.getByRole("button", { name: /show more/i }));

      fireEvent.click(screen.getByRole("button", { name: /show more/i }));
      const pre = document.querySelector("pre");
      expect(pre?.textContent).toBe(JSON.stringify(longValue, null, 2));
      expect(screen.getByRole("button", { name: /show less/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /show less/i }));
      expect(screen.getByRole("button", { name: /show more/i })).toBeInTheDocument();
    });

    it("defaults maxValueLength to 200 characters", async () => {
      const value = { data: "z".repeat(180) };
      mockGetEvents({ data: [eventWithValue(value)], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });

      // JSON.stringify(value, null, 2) is under 200 chars, so no toggle should appear.
      await waitFor(() => {
        expect(screen.getByText(/"data"/)).toBeInTheDocument();
      });
      expect(screen.queryByRole("button", { name: /show more/i })).not.toBeInTheDocument();
    });
  });

  // ── Last-updated relative timestamp (#263) ────────────────────────────────
  describe("last-updated timestamp", () => {
    it("does not show a timestamp when polling is disabled", async () => {
      mockGetEvents({ data: [], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} />);
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => screen.getByText("No events found"));
      expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
    });

    it("shows 'Updated just now' immediately after a poll while live", async () => {
      mockGetEvents({ data: [], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} pollInterval={5000} />);
      act(() => { vi.advanceTimersByTime(0); });

      await waitFor(() => {
        expect(screen.getByText("Updated just now")).toBeInTheDocument();
      });
    });

    it("updates the relative time string once a second while polling", async () => {
      mockGetEvents({ data: [], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} pollInterval={60_000} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => screen.getByText("Updated just now"));

      act(() => { vi.advanceTimersByTime(12_000); });
      await waitFor(() => {
        expect(screen.getByText("Updated 12s ago")).toBeInTheDocument();
      });

      act(() => { vi.advanceTimersByTime(120_000); });
      await waitFor(() => {
        expect(screen.getByText(/Updated \dm ago/)).toBeInTheDocument();
      });
    });

    it("hides the last-updated timestamp once paused", async () => {
      mockGetEvents({ data: [], error: null });
      render(<ContractEventFeed contractId={CONTRACT_ID} pollInterval={60_000} />);
      act(() => { vi.advanceTimersByTime(0); });
      await waitFor(() => screen.getByText("Updated just now"));

      fireEvent.click(screen.getByRole("button", { name: /live/i }));
      expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();

      act(() => { vi.advanceTimersByTime(30_000); });
      expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
    });
  });
});
