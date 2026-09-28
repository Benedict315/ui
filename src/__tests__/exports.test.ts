import { describe, expect,it } from 'vitest';

import * as exports from '../components/index';

describe('Public exports surface', () => {
  it('exposes all public component exports', () => {
    expect(exports.FeeEstimator).toBeTypeOf('function');
    expect(exports.AddressDisplay).toBeTypeOf('function');
    expect(exports.AssetPill).toBeTypeOf('function');
    expect(exports.ContractEventFeed).toBeTypeOf('function');
    expect(exports.GovernanceDashboard).toBeTypeOf('function');
  });

  it('re-exports public types from client', () => {
    type Expected = {
      account: exports.AccountData;
      balance: exports.Balance;
      transaction: exports.Transaction;
      claimableBalance: exports.ClaimableBalance;
      contractEvent: exports.ContractEvent;
      networkInfo: exports.NetworkInfo;
      invokeParams: exports.InvokeParams;
      governanceProps: exports.GovernanceDashboardProps;
      governanceProposal: exports.GovernanceProposal;
      proposalStatus: exports.ProposalStatus;
      voteChoice: exports.VoteChoice;
    };
    const actual: Expected = {} as Expected;
    expect(actual).toBeDefined();
  });
});
