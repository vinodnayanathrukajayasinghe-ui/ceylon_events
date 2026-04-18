import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface EventRow {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  event_date: string;
  event_time: string | null;
  venue: string;
  city: string | null;
  banner_url: string | null;
  base_price: number | null;
  currency: string | null;
  category: string | null;
  status: "upcoming" | "sold_out" | "completed";
  is_featured: boolean;
  is_published: boolean;
}

interface Cat {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  sort_order: number | null;
}

const empty: Partial<EventRow> = {
  title: "", slug: "", short_description: "", description: "",
  event_date: new Date().toISOString().slice(0, 10), event_time: "", venue: "",
  city: "Dubai", banner_url: "", base_price: 0, currency: "AED", category: "",
  status: "upcoming", is_featured: false, is_published: true,
};

function AdminEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents((data || []) as EventRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = async (e?: EventRow) => {
    if (e) {
      setEditing(e);
      const { data } = await supabase.from("ticket_categories").select("*").eq("event_id", e.id).order("sort_order");
      setCats((data || []) as Cat[]);
    } else {
      setEditing({ ...empty });
      setCats([]);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title || !editing.venue || !editing.event_date) {
      toast.error("Title, date and venue are required.");
      return;
    }
    setSaving(true);
    const payload = {
      title: editing.title!.trim(),
      slug: (editing.slug || slugify(editing.title!)).trim(),
      short_description: editing.short_description || null,
      description: editing.description || null,
      event_date: editing.event_date!,
      event_time: editing.event_time || null,
      venue: editing.venue!.trim(),
      city: editing.city || "Dubai",
      banner_url: editing.banner_url || null,
      base_price: Number(editing.base_price) || 0,
      currency: editing.currency || "AED",
      category: editing.category || null,
      status: editing.status || "upcoming",
      is_featured: !!editing.is_featured,
      is_published: editing.is_published ?? true,
    };
    const res = editing.id
      ? await supabase.from("events").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("events").insert(payload).select().single();
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Event saved.");
    setEditing(res.data as EventRow);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event? Tickets categories will also be removed.")) return;
    await supabase.from("ticket_categories").delete().eq("event_id", id);
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Event deleted.");
    setEditing(null);
    load();
  };

  const togglePub = async (e: EventRow) => {
    await supabase.from("events").update({ is_published: !e.is_published }).eq("id", e.id);
    load();
  };

  const addCat = async () => {
    if (!editing?.id) { toast.error("Save the event first."); return; }
    const { data, error } = await supabase.from("ticket_categories").insert({
      event_id: editing.id, name: "New Tier", price: 0, quantity_total: 100, sort_order: cats.length,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setCats([...cats, data as Cat]);
  };
  const saveCat = async (c: Cat) => {
    const { error } = await supabase.from("ticket_categories").update({
      name: c.name, description: c.description, price: Number(c.price), quantity_total: Number(c.quantity_total), sort_order: c.sort_order,
    }).eq("id", c.id);
    if (error) toast.error(error.message); else toast.success("Tier saved.");
  };
  const delCat = async (id: string) => {
    if (!confirm("Delete this ticket tier?")) return;
    await supabase.from("ticket_categories").delete().eq("id", id);
    setCats(cats.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.4em] text-gold uppercase">Manage</p>
          <h1 className="font-display text-4xl text-ivory mt-1">Events</h1>
        </div>
        <button onClick={() => openEdit()} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs rounded-sm font-medium">
          <Plus size={14} /> New Event
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="text-gold animate-spin" /></div>
      ) : (
        <div className="border border-gold-soft bg-charcoal overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-onyx border-b border-gold-soft">
              <tr className="text-left text-[10px] tracking-[0.3em] text-gold uppercase">
                <th className="p-4">Event</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Published</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No events yet. Create your first.</td></tr>}
              {events.map((e) => (
                <tr key={e.id} className="border-t border-gold-soft/40 hover:bg-onyx/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {e.is_featured && <Star size={14} className="text-gold" fill="currentColor" />}
                      <div>
                        <p className="text-ivory">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{e.venue}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ivory/80">{new Date(e.event_date).toLocaleDateString("en-GB")}</td>
                  <td className="p-4"><span className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-gold-soft text-gold">{e.status}</span></td>
                  <td className="p-4">
                    <button onClick={() => togglePub(e)} className="text-gold/80 hover:text-gold">
                      {e.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <Link to="/events/$eventId" params={{ eventId: e.slug }} target="_blank" className="inline-block p-2 text-ivory/60 hover:text-gold"><Eye size={14} /></Link>
                    <button onClick={() => openEdit(e)} className="p-2 text-ivory/60 hover:text-gold"><Pencil size={14} /></button>
                    <button onClick={() => remove(e.id)} className="p-2 text-ivory/60 hover:text-destructive"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-onyx border border-gold w-full max-w-3xl p-6 md:p-8 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-gradient-gold">{editing.id ? "Edit Event" : "New Event"}</h2>
              <button onClick={() => setEditing(null)} className="text-ivory/60 hover:text-gold text-sm uppercase tracking-[0.2em]">Close</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title" value={editing.title || ""} onChange={(v) => setEditing({ ...editing, title: v, slug: editing.slug || slugify(v) })} />
              <Field label="Slug" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <Field label="Date" type="date" value={editing.event_date || ""} onChange={(v) => setEditing({ ...editing, event_date: v })} />
              <Field label="Time" value={editing.event_time || ""} onChange={(v) => setEditing({ ...editing, event_time: v })} placeholder="8:00 PM" />
              <Field label="Venue" value={editing.venue || ""} onChange={(v) => setEditing({ ...editing, venue: v })} />
              <Field label="City" value={editing.city || ""} onChange={(v) => setEditing({ ...editing, city: v })} />
              <Field label="Category" value={editing.category || ""} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="Gala / Concert / Wedding" />
              <Field label="Banner URL" value={editing.banner_url || ""} onChange={(v) => setEditing({ ...editing, banner_url: v })} />
              <Field label="Base Price" type="number" value={String(editing.base_price ?? 0)} onChange={(v) => setEditing({ ...editing, base_price: Number(v) })} />
              <Field label="Currency" value={editing.currency || "AED"} onChange={(v) => setEditing({ ...editing, currency: v })} />
              <div className="md:col-span-2">
                <label className="text-[10px] tracking-[0.3em] text-gold uppercase">Short Description</label>
                <textarea value={editing.short_description || ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} rows={2} className="w-full mt-1 px-4 py-2 bg-charcoal border border-gold-soft text-ivory focus:outline-none focus:border-gold" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] tracking-[0.3em] text-gold uppercase">Full Description</label>
                <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={5} className="w-full mt-1 px-4 py-2 bg-charcoal border border-gold-soft text-ivory focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-gold uppercase">Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })} className="w-full mt-1 px-4 py-2 bg-charcoal border border-gold-soft text-ivory">
                  <option value="upcoming">Upcoming</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 text-sm text-ivory">
                  <input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-ivory">
                  <input type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published
                </label>
              </div>
            </div>

            {editing.id && (
              <div className="mt-8 border-t border-gold-soft pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl text-ivory">Ticket Tiers</h3>
                  <button onClick={addCat} className="inline-flex items-center gap-2 px-3 py-2 border border-gold text-gold text-xs uppercase tracking-[0.2em]">
                    <Plus size={12} /> Add Tier
                  </button>
                </div>
                <div className="space-y-3">
                  {cats.length === 0 && <p className="text-sm text-muted-foreground">No tiers yet. Add one to enable ticket sales.</p>}
                  {cats.map((c, i) => (
                    <div key={c.id} className="grid md:grid-cols-[1.5fr_2fr_auto_auto_auto_auto] gap-2 items-center p-3 border border-gold-soft bg-charcoal">
                      <input value={c.name} onChange={(e) => setCats(cats.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Name" className="px-3 py-2 bg-onyx border border-gold-soft text-ivory text-sm" />
                      <input value={c.description || ""} onChange={(e) => setCats(cats.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} placeholder="Description" className="px-3 py-2 bg-onyx border border-gold-soft text-ivory text-sm" />
                      <input type="number" value={c.price} onChange={(e) => setCats(cats.map((x, idx) => idx === i ? { ...x, price: Number(e.target.value) } : x))} placeholder="Price" className="w-24 px-3 py-2 bg-onyx border border-gold-soft text-ivory text-sm" />
                      <input type="number" value={c.quantity_total} onChange={(e) => setCats(cats.map((x, idx) => idx === i ? { ...x, quantity_total: Number(e.target.value) } : x))} placeholder="Qty" className="w-20 px-3 py-2 bg-onyx border border-gold-soft text-ivory text-sm" />
                      <button onClick={() => saveCat(c)} className="px-3 py-2 bg-gradient-gold text-primary-foreground text-xs uppercase tracking-[0.2em]">Save</button>
                      <button onClick={() => delCat(c.id)} className="p-2 text-ivory/60 hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              {editing.id ? (
                <button onClick={() => remove(editing.id!)} className="inline-flex items-center gap-2 px-5 py-3 border border-destructive/60 text-destructive text-xs uppercase tracking-[0.2em]">
                  <Trash2 size={14} /> Delete
                </button>
              ) : <span />}
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="px-5 py-3 border border-gold-soft text-ivory text-xs uppercase tracking-[0.2em]">Cancel</button>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />} Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.3em] text-gold uppercase">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full mt-1 px-4 py-2 bg-charcoal border border-gold-soft text-ivory focus:outline-none focus:border-gold" />
    </div>
  );
}
