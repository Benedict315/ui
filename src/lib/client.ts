/**
 * sorokit-core client singleton
 *
 * All UI components must use this module to access blockchain functionality.
 * No direct blockchain logic lives in the UI -- everything goes through sorokit-core.
 */

export type GasPriceData = {
  baseFee: string;
  gasPrice: string;
  ledgerCloseTime: number;
  baseReserve: string;
};

export type OperationGasBreakdown = {
  operationType: string;
  gasUnits: number;
  feeStroops: string;
  feeXlm: string;
};

export type FeeScenario = {
  label: "low" | "average" | "high";
  gasPrice: string;
  totalFeeStroops: string;
  totalFeeXlm: string;
  savings: string;
};

export type GasEstimate = {
  totalGasUnits: number;
  breakdown: OperationGasBreakdown[];
  scenarios: FeeScenario[];
  customMultiplier: number;
};

export type SorokitClient = {
  wallet: {
    connect: () => Promise<{
      data: { address: string } | null;
      error: string | null;
      status: "idle" | "loading" | "success" | "error";
    }>;
    disconnect: () => Promise<void>;
    getAddress: () => Promise<{ data: string | null; error: string | null }>;
  };
  account: {
    getAccount: (
      address: string,
    ) => Promise<{
      data: AccountData | null;
      error: string | null;
      status: string;
    }>;
    getBalances: (
      address: string,
    ) => Promise<{ data: Balance[] | null; error: string | null }>;
    getClaimableBalances: (
      address: string,
    ) => Promise<{ data: ClaimableBalance[] | null; error: string | null }>;
    claimBalance: (
      balanceId: string,
    ) => Promise<{ data: TxResult | null; error: string | null }>;
  };
  transaction: {
    submit: (
      tx: unknown,
    ) => Promise<{
      data: TxResult | null;
      error: string | null;
      status: string;
    }>;
    getStatus: (
      txHash: string,
    ) => Promise<{ data: TxStatus | null; error: string | null }>;
    getHistory: (
      address: string,
      page?: number,
      limit?: number,
    ) => Promise<{
      data: Transaction[] | null;
      error: string | null;
      total: number;
    }>;
    estimateFee: () => Promise<{
      data: { baseFee: string; recommended: string } | null;
      error: string | null;
    }>;
    estimateDetailedFee: (params: {
      operations: string[];
      feeMultiplier?: number;
    }) => Promise<{
      data: GasEstimate | null;
      error: string | null;
    }>;
    getFeeScenarios: (params: {
      operations: string[];
      baseGasUnits: number;
    }) => Promise<{
      data: FeeScenario[] | null;
      error: string | null;
    }>;
  };
  soroban: {
    invokeContract: (
      params: InvokeParams,
    ) => Promise<{ data: unknown; error: string | null; status: string }>;
    getEvents: (
      contractId: string,
      limit?: number,
      fromLedger?: number,
    ) => Promise<{ data: ContractEvent[] | null; error: string | null }>;
  };
  network: {
    getNetwork: () => Promise<{
      data: NetworkInfo | null;
      error: string | null;
    }>;
    switchNetwork: (
      network: NetworkName | NetworkInfo,
    ) => Promise<{ data: NetworkInfo | null; error: string | null }>;
    getGasPrice: () => Promise<{
      data: GasPriceData | null;
      error: string | null;
    }>;
  };
  nft: {
    getNfts: (
      address: string,
    ) => Promise<{ data: Nft[] | null; error: string | null }>;
    sendNft: (params: {
      tokenId: string;
      contractId: string;
      recipient: string;
      sourceAccount: string;
    }) => Promise<{ data: TxResult | null; error: string | null }>;
    listNftForSale: (params: {
      tokenId: string;
      contractId: string;
      price: string;
      sourceAccount: string;
    }) => Promise<{ data: TxResult | null; error: string | null }>;
  };
  operation: {
    getOperations: (
      txHash: string,
    ) => Promise<{
      data: Operation[] | null;
      error: string | null;
    }>;
    getTimeline: (
      params: TimelineParams,
    ) => Promise<{
      data: TimelineGroup[] | null;
      error: string | null;
      total: number;
    }>;
  };
  allowance: {
    getAllowances: (
      address: string,
    ) => Promise<{
      data: AllowanceEntry[] | null;
      error: string | null;
    }>;
    approveAllowance: (params: {
      sourceAccount: string;
      asset: string;
      spender: string;
      amount: string;
    }) => Promise<{
      data: TxResult | null;
      error: string | null;
      status: string;
    }>;
    revokeAllowance: (params: {
      sourceAccount: string;
      asset: string;
      spender: string;
    }) => Promise<{
      data: TxResult | null;
      error: string | null;
      status: string;
    }>;
    estimateAllowanceFee: (params: {
      asset: string;
      spender: string;
      amount: string;
      mode: "increase" | "decrease" | "revoke";
    }) => Promise<{
      data: { baseFee: string; recommended: string } | null;
      error: string | null;
    }>;
  };
  batch: {
    submitBatch: (params: {
      entries: BatchEntry[];
      sourceAccount: string;
      asset?: string;
      maxRetries?: number;
    }) => Promise<{
      data: BatchResult | null;
      error: string | null;
      batchId: string;
    }>;
    getBatchStatus: (batchId: string) => Promise<{
      data: BatchProgress | null;
      error: string | null;
    }>;
    cancelBatch: (batchId: string) => Promise<{
      data: boolean;
      error: string | null;
    }>;
    retryEntry: (params: {
      batchId: string;
      entryIndex: number;
    }) => Promise<{
      data: BatchEntryResult | null;
      error: string | null;
    }>;
  };
};

export type AccountData = {
  address: string;
  sequence: string;
  subentryCount: number;
  thresholds?: { low: number; med: number; high: number; master: number };
  homeDomain?: string;
  createdAt?: string;
};

export type Balance = {
  asset: string;
  balance: string;
  assetType:
    | "native"
    | "credit_alphanum4"
    | "credit_alphanum12"
    | "liquidity_pool_shares";
  assetCode?: string;
  assetIssuer?: string;
};

export type TxResult = {
  hash: string;
  ledger: number;
  successful: boolean;
};

export type TxStatus = "pending" | "success" | "failed" | "not_found";

export type Transaction = {
  hash: string;
  ledger: number;
  createdAt: string;
  successful: boolean;
  operationCount: number;
  feePaid: string;
  memo?: string;
};

export type ClaimableBalance = {
  id: string;
  asset: string;
  amount: string;
  sponsor: string;
  claimants: { destination: string; predicate: unknown }[];
};

export type ContractEvent = {
  id: string;
  contractId: string;
  type: string;
  ledger: number;
  createdAt: string;
  topics: string[];
  value: unknown;
};

export type InvokeParams = {
  contractId: string;
  method: string;
  args?: unknown[];
  sourceAccount?: string;
};

export type NetworkName = "mainnet" | "testnet" | "futurenet" | "localnet" | "custom" | (string & {});

export type NetworkInfo = {
  name: NetworkName;
  passphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  status?: "online" | "degraded" | "offline" | string;
};

// ─── Allowance Types ───────────────────────────────────────────────────

export type AllowanceEntry = {
  asset: string;
  spender: string;
  spenderName?: string;
  amount: string;
  expirationDate?: string;
  tokenCode?: string;
  tokenIssuer?: string;
};

export type AllowanceChangeParams = {
  asset: string;
  spender: string;
  amount: string;
  mode: "increase" | "decrease" | "revoke";
};

// ─── Batch Payment Types ──────────────────────────────────────────

export type BatchEntry = {
  address: string;
  amount: string;
  asset?: string;
  memo?: string;
};

export type BatchEntryResult = {
  address: string;
  amount: string;
  status: "queued" | "signing" | "submitted" | "confirmed" | "failed";
  txHash?: string;
  error?: string;
  retryCount: number;
};

export type BatchResult = {
  batchId: string;
  totalEntries: number;
  successful: number;
  failed: number;
  entries: BatchEntryResult[];
};

export type BatchProgress = {
  batchId: string;
  completed: number;
  total: number;
  percentage: number;
  etaSeconds: number;
  currentStatus: BatchEntryResult["status"];
};

// ─── NFT Types ────────────────────────────────────────────────────────────────

export type NftAttribute = {
  traitType: string;
  value: string;
  /** Rarity as a percentage (0–100). Optional — may not be available for all NFTs. */
  rarityPct?: number;
};

export type NftMetadata = {
  name: string;
  description?: string;
  image?: string;
  externalUrl?: string;
  attributes: NftAttribute[];
};

export type Nft = {
  /** Unique token identifier (contract + token_id combo) */
  id: string;
  tokenId: string;
  contractId: string;
  collectionName: string;
  collectionId: string;
  metadata: NftMetadata;
  owner: string;
  /** Floor price in XLM */
  floorPrice?: string;
  /** User's estimated valuation in XLM */
  userValuation?: string;
  /** Rarity rank within the collection (lower is rarer) */
  rarityRank?: number;
  /** Total supply of the collection */
  collectionSize?: number;
  mintedAt?: string;
};

export type NftCollection = {
  id: string;
  name: string;
  contractId: string;
  description?: string;
  image?: string;
  floorPrice?: string;
  totalSupply?: number;
  nfts: Nft[];
};

// ─── Activity Timeline Types ──────────────────────────────────────────

export type Operation = {
  id: string;
  txHash: string;
  type: string;
  source: string;
  destination: string;
  amount: string;
  asset: string;
  memo?: string;
  fee: string;
  success: boolean;
  createdAt: string;
};

export type GroupedTransaction = {
  hash: string;
  date: string;
  time: string;
  type: string;
  totalAmount: string;
  status: "success" | "failed";
  operationCount: number;
  operations: Operation[];
};

export type TimelineGroup = {
  date: string;
  transactions: GroupedTransaction[];
};

export type TimelineFilter = {
  operationType?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
};

export type TimelineParams = {
  address: string;
  page?: number;
  limit?: number;
  filters?: TimelineFilter;
};

let _client: SorokitClient | null = null;

export function initClient(client: SorokitClient): void {
  _client = client;
}

export function hasClient(): boolean {
  return _client !== null;
}

export function getClient(): SorokitClient {
  if (!_client)
    throw new Error(
      "[sorokit-ui] Client not initialized. Call initClient(createSorokitClient()) first.",
    );
  return _client;
}
