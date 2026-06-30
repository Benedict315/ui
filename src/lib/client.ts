/**
 * sorokit-core client singleton
 *
 * All UI components must use this module to access blockchain functionality.
 * No direct blockchain logic lives in the UI -- everything goes through sorokit-core.
 */

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
  };
  soroban: {
    invokeContract: (
      params: InvokeParams,
    ) => Promise<{ data: unknown; error: string | null; status: string }>;
    getEvents: (
      contractId: string,
      limit?: number,
    ) => Promise<{ data: ContractEvent[] | null; error: string | null }>;
  };
  network: {
    getNetwork: () => Promise<{
      data: NetworkInfo | null;
      error: string | null;
    }>;
    switchNetwork: (
      network: NetworkName,
    ) => Promise<{ data: NetworkInfo | null; error: string | null }>;
  };
};

export type AccountData = {
  address: string;
  sequence: string;
  subentryCount: number;
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

export type NetworkName = "mainnet" | "testnet" | "futurenet" | "localnet";

export type NetworkInfo = {
  name: NetworkName;
  passphrase: string;
  rpcUrl: string;
  horizonUrl: string;
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
