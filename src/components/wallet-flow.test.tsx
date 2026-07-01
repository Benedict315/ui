import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletConnectButton } from '../WalletConnectButton';
import { AccountCard } from '../AccountCard';
import { useSorokit } from '@/context/useSorokit';

vi.mock('@/context/useSorokit', () => ({
  useSorokit: vi.fn(),
}));

describe('Wallet flow integration', () => {
  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('connects, shows account, then disconnects', async () => {
    // Initial state: not connected
    (useSorokit as any).mockReturnValue({
      isConnected: false,
      isConnecting: false,
      address: null,
      connectWallet: mockConnect,
      disconnectWallet: mockDisconnect,
      error: null,
      clearError: mockClearError,
    });

    render(
      <>
        <WalletConnectButton />
        <AccountCard />
      </>
    );

    // Click connect
    fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }));
    expect(mockConnect).toHaveBeenCalledTimes(1);

    // Simulate successful connection by updating mock return
    (useSorokit as any).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: 'GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      connectWallet: mockConnect,
      disconnectWallet: mockDisconnect,
      error: null,
      clearError: mockClearError,
    });

    // Re-render to reflect state change
    render(
      <>
        <WalletConnectButton />
        <AccountCard />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('GABC12...WXYZ')).toBeInTheDocument();
    });

    // Click disconnect (the button appears when connected)
    fireEvent.click(screen.getByRole('button', { name: /Wallet connected/ }));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    // Ensure AccountCard is removed after disconnect
    await waitFor(() => {
      expect(screen.queryByText('Account')).not.toBeInTheDocument();
    });
  });
});
