import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerProfile {
  id: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
}

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [customerIds, setCustomerIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [profilesResult, rolesResult] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id").eq("role", "customer"),
      ]);

      setProfiles((profilesResult.data || []) as CustomerProfile[]);
      setCustomerIds((rolesResult.data || []).map((item: { user_id: string }) => item.user_id));
      setLoading(false);
    })();
  }, []);

  const customers = useMemo(
    () => profiles.filter((profile) => customerIds.includes(profile.id)),
    [profiles, customerIds],
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Audience</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">Registered Customers</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Customer accounts created on the website. Use this view to understand how many people
          have registered and when they joined.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-gold-soft bg-charcoal p-6">
          <Users className="mb-3 text-gold" size={20} />
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Total Customers
          </p>
          <p className="mt-2 font-display text-5xl text-gradient-gold">{customers.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold-soft bg-charcoal">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="border-b border-gold-soft bg-onyx">
              <tr className="text-left text-[10px] uppercase tracking-[0.3em] text-gold">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Registered</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No registered customers found.
                  </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-gold-soft/40 hover:bg-onyx/40">
                  <td className="p-4">
                    <p className="text-ivory">{customer.display_name || "Customer"}</p>
                  </td>
                  <td className="p-4 text-muted-foreground">{customer.phone || "—"}</td>
                  <td className="p-4 font-mono text-xs text-gold/80">{customer.id}</td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(customer.created_at).toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
