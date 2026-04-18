import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiries,
});

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  source: string | null;
  is_handled: boolean;
  created_at: string;
}

function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHandled, setShowHandled] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setItems((data || []) as Inquiry[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleHandled = async (i: Inquiry) => {
    const { error } = await supabase.from("inquiries").update({ is_handled: !i.is_handled }).eq("id", i.id);
    if (error) toast.error(error.message);
    else { toast.success(!i.is_handled ? "Marked as handled." : "Reopened."); load(); }
  };

  const filtered = showHandled ? items : items.filter((i) => !i.is_handled);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.4em] text-gold uppercase">Contact</p>
          <h1 className="font-display text-4xl text-ivory mt-1">Inquiries</h1>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-ivory">
          <input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} /> Show handled
        </label>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="text-gold animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-gold-soft bg-charcoal">No inquiries.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <div key={i.id} className={`p-5 border bg-charcoal ${i.is_handled ? "border-gold-soft/40 opacity-60" : "border-gold-soft hover:border-gold"} transition-all`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-display text-xl text-ivory">{i.name}</p>
                  <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 text-sm text-gold hover:underline mt-1">
                    <Mail size={14} /> {i.email}
                  </a>
                  {i.phone && <span className="ml-3 text-sm text-muted-foreground">· {i.phone}</span>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">{new Date(i.created_at).toLocaleString("en-GB")}</p>
                  {i.source && <p className="text-[10px] text-gold/60 mt-1">{i.source}</p>}
                </div>
              </div>
              {i.subject && <p className="text-ivory/80 font-medium mb-2">{i.subject}</p>}
              <p className="text-ivory/75 whitespace-pre-line text-sm">{i.message}</p>
              <button onClick={() => toggleHandled(i)} className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.3em] uppercase border ${i.is_handled ? "border-gold-soft text-ivory/60" : "border-gold text-gold hover:bg-gold hover:text-primary-foreground"} transition-all`}>
                <Check size={12} /> {i.is_handled ? "Reopen" : "Mark Handled"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
