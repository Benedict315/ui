import type {
  AccountData,
  Balance,
  ClaimableBalance,
  ContractEvent,
  NetworkInfo,
  NetworkName,
  SorokitClient,
  Transaction,
  TxResult,
  TxStatus,
} from './client';
import { deterministicMock } from './deterministic-mock';

// Valid 56-char Stellar testnet address
export const MOCK_ADDRESS = 'GBRPYHIL2CI3WHGSUJGY6O7SROQOMJG7QBCACN4QPKUOQNXJDGONXHPA';

// Generate deterministic mock data (consistent across test runs)
export const MOCK_HISTORY = deterministicMock.generateMockHistory(5);
export const MOCK_EVENTS = deterministicMock.generateMockEvents(3);

export const NETWORKS = {
  testnet: {
    name: 'testnet' as NetworkName,
    passphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  },
  public: {
    name: 'public' as NetworkName,
    passphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
  },
};

function randomHash(): string {
  return deterministicMock.generateTransactionHash();
}

function mockTx(
  hash: string,
  seq: number,
  memo?: string,
): Transaction {
  return {
    hash,
    ledger: 1000 + seq,
    createdAt: new Date(Date.now() - seq * 60000).toISOString(),
    successful: true,
    operationCount: 1,
    feePaid: '100',
    memo,
  };
}

/**
 * Create a full mock SorokitClient with deterministic data.
 * All methods are mocked with vi.fn() when vitest is available.
 */
export function createMockClient(): SorokitClient {
  const mockTransactions: Transaction[] = MOCK_HISTORY.map((h, i) =>
    mockTx(h.id, i),
  );

  return {
    wallet: {
      connect: () =>
        Promise.resolve({
          data: { address: MOCK_ADDRESS },
          error: null,
          status: 'success' as const,
        }),
      disconnect: () => Promise.resolve(),
      getAddress: () =>
        Promise.resolve({ data: MOCK_ADDRESS, error: null }),
    },
    account: {
      getAccount: () =>
        Promise.resolve({
          data: {
            address: MOCK_ADDRESS,
            sequence: '100',
            subentryCount: 0,
          } as AccountData,
          error: null,
          status: 'success',
        }),
      getBalances: () =>
        Promise.resolve({
          data: [
            {
              asset: 'XLM',
              balance: '10000',
              assetType: 'native' as const,
            },
          ] as Balance[],
          error: null,
        }),
      getClaimableBalances: () =>
        Promise.resolve({
          data: [] as ClaimableBalance[],
          error: null,
        }),
      claimBalance: () =>
        Promise.resolve({
          data: { hash: randomHash(), ledger: 0, successful: true } as TxResult,
          error: null,
        }),
    },
    transaction: {
      submit: () =>
        Promise.resolve({
          data: { hash: randomHash(), ledger: 0, successful: true } as TxResult,
          error: null,
          status: 'success',
        }),
      getStatus: () =>
        Promise.resolve({
          data: 'success' as TxStatus,
          error: null,
        }),
      getHistory: (
        _address: string,
        _page?: number,
        limit?: number,
      ) =>
        Promise.resolve({
          data: mockTransactions.slice(0, limit ?? mockTransactions.length),
          error: null,
          total: mockTransactions.length,
        }),
      estimateFee: () =>
        Promise.resolve({
          data: { baseFee: '100', recommended: '1000' },
          error: null,
        }),
    },
    soroban: {
      invokeContract: () =>
        Promise.resolve({
          data: null,
          error: null,
          status: 'success',
        }),
      getEvents: () =>
        Promise.resolve({
          data: MOCK_EVENTS.map((e) => ({
            id: e.id,
            contractId: e.data.contractId,
            type: e.type,
            ledger: 0,
            createdAt: new Date(e.timestamp).toISOString(),
            topics: e.data.topics,
            value: e.data.value,
          })) as ContractEvent[],
          error: null,
        }),
    },
    network: {
      getNetwork: () =>
        Promise.resolve({
          data: NETWORKS.testnet as NetworkInfo,
          error: null,
        }),
      switchNetwork: (name: NetworkName) => {
        if (name in NETWORKS) {
          return Promise.resolve({
            data: NETWORKS[name as keyof typeof NETWORKS] as NetworkInfo,
            error: null,
          });
        }
        return Promise.resolve({
          data: null,
          error: `Invalid network: ${name}`,
        });
      },
    },
  };
}
