import { useSorokit } from "@/context/SorokitProvider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";

export function AccountCard() {
  const { address, account, isLoadingAccount } = useSorokit();
  if (!address) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Account</CardTitle>
          <Badge variant="success" dot>
            Active
          </Badge>
        </div>
        <CardDescription>Stellar account details</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingAccount ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 rounded bg-[#1c1c1c] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Address">
              <span data-address className="break-all">
                {address}
              </span>
            </Field>
            {account && (
              <>
                <Field label="Sequence">
                  <span className="font-mono text-[11px] text-[#999999]">
                    {account.sequence}
                  </span>
                </Field>
                <Field label="Subentries">
                  <span className="text-[12px] text-[#ebebeb]">
                    {account.subentryCount}
                  </span>
                </Field>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
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
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-[#1c1c1c] border border-[#2a2a2a]">
      <div className="w-6 h-6 rounded-full bg-[#5645d4] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {address.slice(0, 2)}
      </div>
      <span data-address>{truncateAddress(address)}</span>
    </div>
  );
}
