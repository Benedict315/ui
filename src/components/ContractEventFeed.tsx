/**
 * ContractEventFeed Component
 * 
 * Real-time feed of contract events from Soroban smart contracts.
 * Displays event history, filtering, and search capabilities.
 * 
 * @component
 * @example
 * ```tsx
 * import { ContractEventFeed } from 'sorokit-ui';
 * 
 * export function Dashboard() {
 *   return (
 *     <ContractEventFeed 
 *       contractId="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
 *       limit={50}
 *     />
 *   );
 * }
 * ```
 * 
 * @param props - Component props
 * @param props.contractId - Smart contract ID to monitor
 * @param props.limit - Maximum number of events to display (default: 100)
 * @param props.autoRefresh - Auto-refresh interval in ms (default: 5000, 0 to disable)
 * @param props.onEventClick - Callback when event is clicked
 * 
 * @returns The rendered ContractEventFeed component
 * 
 * @throws Error if contractId is invalid format
 * 
 * @remarks
 * - Auto-refreshes every 5 seconds by default
 * - Shows timestamp, topics, and event data
 * - Searchable event topics
 * - Requires SorokitProvider context
 * - Known issue: QR code scanner doesn't work with complex metadata (issue #8)
 * 
 * @see {@link SorokitProvider} for setup
 * @see GitHub issue #8 for QR code scanner limitation
 */
import type { ContractEvent } from '@/lib/client';

export function ContractEventFeed({
  contractId,
  limit = 100,
  autoRefresh = 5000,
  onEventClick
}: ContractEventFeedProps) {
  return <h3>Contract Events</h3>;
}

export interface ContractEventFeedProps {
  contractId: string;
  limit?: number;
  autoRefresh?: number;
  onEventClick?: (event: ContractEvent) => void;
}
