import type { AccountData, Balance, InvokeParams, NetworkInfo, NetworkName, SorokitClient, TxStatus } from './client';
import { deterministicMock } from './deterministic-mock';

// Valid Stellar testnet address (56 chars: G + 55 uppercase alphanumeric)
export const MOCK_ADDRESS = 'GBRPYHIL2CI3WHGSUJGY6O7SROQOMJG7QBCACN4QPKUOQNXJDGONXHPA';

// Generate deterministic mock data (consistent across test runs)
export const MOCK_HISTORY = deterministicMock.generateMockHistory(5);
export const MOCK_EVENTS = deterministicMock.generateMockEvents(3);

export const NETWORKS = {
  testnet: {
    passphrase: 'Test SDF Network ; September 2015',
    rpc_url: 'https://soroban-testnet.stellar.org',
  },
  public: {
    passphrase: 'Public Global Stellar Network ; September 2015',
    rpc_url: 'https://soroban.stellar.org',
  },
};

const MOCK_NETWORK_INFO: Record<string, NetworkInfo> = {
  testnet: {
    name: 'testnet',
    passphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  },
  public: {
    name: 'mainnet',
    passphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
  },
};

const MOCK_ACCOUNT: AccountData = {
  address: MOCK_ADDRESS,
  sequence: '123456789',
  subentryCount: 0,
};

const MOCK_BALANCES: Balance[] = [
  { asset: 'XLM', balance: '10000.0000000', assetType: 'native' },
];

/**
 * Create a mock client that satisfies the SorokitClient interface.
 * If called with an invalid network name, returns the error object
 * (backward compatible with simple-error tests).
 */
export function createMockClient(): SorokitClient;
export function createMockClient(networkName: string): SorokitClient | { data: null; error: string };
export function createMockClient(networkName?: string): SorokitClient | { data: null; error: string } {
  const activeNetwork = networkName && networkName in NETWORKS ? networkName : 'testnet';

  if (networkName && !(networkName in NETWORKS)) {
    const validNetworks = Object.keys(NETWORKS).join(', ');
    return {
      data: null,
      error: `Unknown network: ${networkName}. Valid networks: ${validNetworks}`,
    };
  }

  return {
    wallet: {
      connect: async () => ({
        data: { address: MOCK_ADDRESS },
        error: null,
        status: 'success' as const,
      }),
      disconnect: async () => {},
      getAddress: async () => ({ data: MOCK_ADDRESS, error: null }),
    },
    account: {
      getAccount: async () => ({
        data: MOCK_ACCOUNT,
        error: null,
        status: 'success',
      }),
      getBalances: async () => ({ data: MOCK_BALANCES, error: null }),
      getClaimableBalances: async () => ({ data: [], error: null }),
      claimBalance: async () => ({ data: null, error: null }),
    },
    transaction: {
      submit: async () => ({
        data: { hash: deterministicMock.generateTransactionHash(), ledger: 12345, successful: true },
        error: null,
        status: 'success',
      }),
      getStatus: async () => ({ data: 'success' as TxStatus, error: null }),
      getHistory: async (_address: string, _page?: number, limit?: number) => {
        const history = MOCK_HISTORY.slice(0, limit ?? MOCK_HISTORY.length);
        return { data: history, error: null, total: history.length };
      },
      estimateFee: async () => ({
        data: { baseFee: '100', recommended: '1000' },
        error: null,
      }),
    },
    soroban: {
      invokeContract: async (_params: InvokeParams) => ({
        data: null,
        error: null,
        status: 'success',
      }),
      getEvents: async (_contractId: string, _limit?: number) => ({
        data: MOCK_EVENTS,
        error: null,
      }),
    },
    network: {
      getNetwork: async () => ({
        data: MOCK_NETWORK_INFO[activeNetwork],
        error: null,
      }),
      switchNetwork: async (name: NetworkName) => {
        const info = MOCK_NETWORK_INFO[name];
        if (info) {
          return { data: info, error: null };
        }
        return { data: null, error: `Invalid network: ${name}` };
      },
    },
  } as SorokitClient;
}
