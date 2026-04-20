REVOKE EXECUTE ON FUNCTION public.ensure_ticket_order_attendees(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_order_payment_to_tickets(UUID) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.ensure_my_paid_ticket_issuance(_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.ticket_orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT *
  INTO order_row
  FROM public.ticket_orders
  WHERE id = _order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR order_row.user_id = auth.uid()
    OR (auth.jwt() ->> 'email') = order_row.customer_email
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF order_row.payment_status <> 'paid' THEN
    RETURN 0;
  END IF;

  RETURN public.sync_order_payment_to_tickets(_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_force_ticket_issuance(_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN public.sync_order_payment_to_tickets(_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_my_paid_ticket_issuance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_force_ticket_issuance(UUID) TO authenticated;

SELECT public.sync_order_payment_to_tickets(id)
FROM public.ticket_orders
WHERE payment_status = 'paid';
