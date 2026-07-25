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

import "../styles.css";

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
export { TransactionHistory } from "./TransactionHistory";
export { TransactionPanel } from "./TransactionPanel";

// Soroban
export { ContractEventFeed } from "./ContractEventFeed";
export { SorobanInvokeButton } from "./SorobanInvokeButton";
export { SorobanPanel } from "./SorobanPanel";

// Utilities
export { QRCode } from "./QRCode";

// Providers and hooks
export { SorokitProvider } from "../context/SorokitProvider";
export { useSorokit } from "../context/useSorokit";

// Types
export type {
  AccountData,
  Balance,
  ClaimableBalance,
  ContractEvent,
  InvokeParams,
  NetworkInfo,
  Transaction,
} from "../lib/client";
