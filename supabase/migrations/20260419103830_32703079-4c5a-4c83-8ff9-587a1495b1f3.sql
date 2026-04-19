-- Add ticket categories for events that are missing them
INSERT INTO public.ticket_categories (event_id, name, description, price, quantity_total, sort_order)
SELECT e.id, t.name, t.description, t.price, t.qty, t.sort
FROM public.events e
CROSS JOIN (VALUES
  ('Standard', 'General admission with welcome reception', 450::numeric, 200, 1),
  ('VIP', 'Priority access, premium seating & open bar', 950::numeric, 80, 2),
  ('Royal Table', 'Private table for 6, dedicated host & champagne service', 4800::numeric, 12, 3)
) AS t(name, description, price, qty, sort)
WHERE e.slug IN ('luxury-brand-launch', 'vogue-soiree-spring')
AND NOT EXISTS (
  SELECT 1 FROM public.ticket_categories tc WHERE tc.event_id = e.id
);