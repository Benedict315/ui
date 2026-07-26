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

// NFT Gallery
export { NFTCard, NFTGallery } from "./NFTGallery";
export type { NFTGalleryProps } from "./NFTGallery";

// Portfolio Rebalancer
export { PortfolioRebalancer } from "./PortfolioRebalancer";

// Staking Dashboard
export { StakingDashboard } from "./StakingDashboard";
export type { StakingDashboardProps } from "./StakingDashboard";
export { ValidatorCard } from "./ValidatorCard";
export type { ValidatorCardProps } from "./ValidatorCard";
export { DelegationRow } from "./DelegationRow";
export type { DelegationRowProps } from "./DelegationRow";
export { RewardsPanel } from "./RewardsPanel";
export type { RewardsPanelProps } from "./RewardsPanel";
export { RewardHistory } from "./RewardHistory";
export type { RewardHistoryProps } from "./RewardHistory";
export { ValidatorSearch } from "./ValidatorSearch";
export type { ValidatorSearchProps } from "./ValidatorSearch";
export { AllocationInput } from "./AllocationInput";
export { SwapRoute } from "./SwapRoute";
export { RebalancerHistory } from "./RebalancerHistory";
export { PieChart } from "./ui/PieChart";
export type { PieChartProps, PieSlice } from "./ui/PieChart";

// Utilities
export { QRCode } from "./QRCode";
export {
  BASE_FEE_STROOPS,
  DEFAULT_SWAP_FEE_PCT,
  MIN_TRADE_USD,
  SLIPPAGE_BASE_PCT,
  SLIPPAGE_MARKET_IMPACT_PER_1K,
  buildRebalanceRecord,
  computeAllocationDiffs,
  computeCurrentAllocations,
  createInitialExecution,
  estimateSlippagePct,
  estimateSwapCostUsd,
  formatPct,
  formatUsd,
  generateSwapSuggestions,
  isTargetValid,
  normaliseTargets,
  parseSwapResult,
  totalFeeStroops,
  totalRebalanceCostUsd,
  updateSwapStatus,
  weightedAverageSlippage,
} from "../lib/rebalancer";
export type {
  AllocationDiff,
  PortfolioAsset,
  RebalanceExecution,
  RebalanceRecord,
  SwapStatus,
  SwapSuggestion,
} from "../lib/rebalancer";

// Staking utilities
export {
  DELEGATION_BASE_FEE_STROOPS,
  MIN_DELEGATION_XLM,
  MOCK_DELEGATIONS,
  MOCK_REWARD_SCHEDULE,
  MOCK_VALIDATORS,
  REWARD_HISTORY_DAYS,
  STROOPS_PER_XLM,
  aggregateDailyRewards,
  createDefaultFilter,
  estimateDelegationFeeXlm,
  filterValidators,
  formatXlm,
  generateMockRewardHistory,
  totalClaimableXlm,
  totalDelegatedXlm,
  totalPendingXlm,
  totalRewardHistoryXlm,
  validateDelegationAmount,
  /** @alias formatPct from staking lib */
  formatPct as formatStakingPct,
} from "../lib/staking";
export type {
  DailyReward,
  Delegation,
  DelegationChangeRequest,
  DelegationChangeResult,
  RewardEvent,
  RewardScheduleEntry,
  SortDirection,
  Validator,
  ValidatorFilter,
  ValidatorSortField,
  ValidatorStatus,
} from "../lib/staking";

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
  Nft,
  NftAttribute,
  NftCollection,
  NftMetadata,
  Transaction,
} from "../lib/client";
