import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SorokitProvider } from '../context/SorokitProvider';
import { TransactionPanel } from './TransactionPanel';
import { getClient } from '@/lib/client';

vi.mock('@/lib/client', () => ({
  getClient: vi.fn(),
}));

describe('TransactionPanel integration', () => {
  it('submits payment with correct payload', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ data: { hash: 'txhash', ledger: 1 }, error: null });
    vi.mocked(getClient).mockReturnValue({
      transaction: { submit: mockSubmit },
    } as any);

    const mockClient = {
      wallet: { connect: vi.fn(), disconnect: vi.fn() },
      account: { getAccount: vi.fn(), getBalances: vi.fn() },
      network: { getNetwork: vi.fn(), switchNetwork: vi.fn() },
    } as any;

    render(
      <SorokitProvider client={mockClient}>
        <TransactionPanel />
      </SorokitProvider>
    );

    const destInput = screen.getByLabelText('Destination Address');
    const amountInput = screen.getByLabelText('Amount (XLM)');
    const submitBtn = screen.getByRole('button', { name: 'Send Payment' });

    fireEvent.change(destInput, { target: { value: 'GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' } });
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: expect.any(String),
        amount: expect.any(String),
        source: expect.any(String),
      })
    );
  });
});
