import * as Toast from "@radix-ui/react-toast";
import { useState } from "react";

import { AddressDisplay } from "@/components/AddressDisplay";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSorokit } from "@/context/useSorokit";
import { truncateAddress } from "@/lib/utils";

export function AccountCard() {
  const { address, account, isLoadingAccount } = useSorokit();
  const [toastOpen, setToastOpen] = useState(false);

  if (!address) return null;

  return (
    <Toast.Provider swipeDirection="right">
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h3 className="text-[14px] font-semibold text-ink">Account</h3>
            <p className="text-[12px] text-ink-3 mt-0.5">
              Stellar account details
            </p>
          </div>
          {isLoadingAccount ? (
            <Badge variant="default">Loading</Badge>
          ) : (
            account && (
              <Badge variant="success" dot>
                Active
              </Badge>
            )
          )}
        </div>
        <div className="px-5 py-5">
          {isLoadingAccount ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <AddressDisplay 
                address={address} 
                showFull 
                label="Address" 
                onCopy={() => setToastOpen(true)}
              />
              {account && (
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Sequence">
                    <span className="font-mono text-[12px] text-ink-2">
                      {account.sequence}
                    </span>
                  </Field>
                  <Field label="Subentries">
                    <span className="text-[13px] text-ink">
                      {account.subentryCount}
                    </span>
                  </Field>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Toast.Root
        open={toastOpen}
        onOpenChange={setToastOpen}
        duration={3000}
        className="bg-surface border border-line rounded-md p-4 shadow-lg"
      >
        <Toast.Title className="text-[13px] font-semibold text-ink">
          Address Copied
        </Toast.Title>
        <Toast.Description className="text-[12px] text-ink-3">
          The address has been copied to your clipboard.
        </Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-[390px] max-w-[100vw] m-0 list-none z-50 outline-none" />
    </Toast.Provider>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
        {label}
      </span>
      {children}
    </div>
  );
}

export function AccountCardCompact() {
  const { address } = useSorokit();
  if (!address) return null;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-2 border border-line">
      <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-[11px] font-bold text-white shrink-0">
        {address.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[9px] text-ink-4 uppercase tracking-widest">
          Connected
        </span>
        <span data-address className="truncate">
          {truncateAddress(address)}
        </span>
      </div>
    </div>
  );
}
