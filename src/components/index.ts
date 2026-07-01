/**
 * Sorokit UI - React components for Stellar/Soroban development
 * 
 * @packageDocumentation
 * 
 * @example
 * ```tsx
 * import { SorokitProvider, SorobanPanel } from 'sorokit-ui';
 * 
 * export function App() {
 *   return (
 *     <SorokitProvider>
 *       <SorobanPanel />
 *     </SorokitProvider>
 *   );
 * }
 * ```
 */

// Export all components
export { AssetBadge, AssetPill } from './AssetBadge';
export { SorobanPanel } from './SorobanPanel';
export { TransactionPanel } from './TransactionPanel';
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';
export { FeeEstimator } from './FeeEstimator';
export type { FeeEstimatorProps } from './FeeEstimator';
export { ContractEventFeed } from './ContractEventFeed';
export type { ContractEventFeedProps } from './ContractEventFeed';

// Export UI primitives
export { Separator } from './ui/Separator';
export { Skeleton, SkeletonRow, SkeletonCard, AssetRowSkeleton } from './ui/Skeleton';
export type { SkeletonProps } from './ui/Skeleton';

// Export providers and hooks
export { SorokitProvider } from '../context/SorokitProvider';
export { useSorokit } from '../context/useSorokit';

// Export types
export type { SorokitClient, Transaction, ContractEvent } from '../lib/client';
// UI primitives
export { Badge } from "./ui/Badge";
export { Button } from "./ui/Button";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
export { Input } from "./ui/Input";
export { AssetRowSkeleton, Skeleton, SkeletonCard, SkeletonRow } from "./ui/Skeleton";

// Error handling
export { ErrorBoundary } from "./ErrorBoundary";
export type { ErrorBoundaryProps } from "./ErrorBoundary";

// Wallet
export { AccountCard, AccountCardCompact } from "./AccountCard";
export { BalanceList } from "./BalanceList";
export { WalletConnectButton } from "./WalletConnectButton";

// Assets
export { AssetBadge, AssetPill } from "./AssetBadge";

// Address
export { AddressDisplay } from "./AddressDisplay";

// Network
export { NetworkBanner } from "./NetworkBanner";
export { NetworkSwitcher } from "./NetworkSwitcher";

// Transactions
export { ClaimableBalanceCard } from "./ClaimableBalanceCard";
export { FeeEstimator } from "./FeeEstimator";
export type { FeeEstimatorProps } from "./FeeEstimator";
export { TransactionHistory } from "./TransactionHistory";
export { TransactionPanel } from "./TransactionPanel";

// Soroban
export { ContractEventFeed } from "./ContractEventFeed";
export type { ContractEventFeedProps } from "./ContractEventFeed";
export { SorobanInvokeButton } from "./SorobanInvokeButton";
export { SorobanPanel } from "./SorobanPanel";

// Providers and hooks
export { SorokitProvider } from "../context/SorokitProvider";
export { useSorokit } from "../context/useSorokit";

// Utilities
export { QRCode } from "./QRCode";

// Types
export type {
  AccountData,
  Balance,
  ClaimableBalance,
  ContractEvent,
  InvokeParams,
  NetworkInfo,
  SorokitClient,
  Transaction,
} from "../lib/client";
