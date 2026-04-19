CREATE TYPE public.ticket_verification_status AS ENUM (
  'pending_payment',
  'unused',
  'used',
  'cancelled',
  'invalid'
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.ticket_orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'manual',
  reference TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_order_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ticket_orders(id) ON DELETE CASCADE,
  ticket_category_id UUID NOT NULL REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
  attendee_index INTEGER NOT NULL CHECK (attendee_index > 0),
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendee_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, attendee_index)
);

CREATE TABLE public.issued_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ticket_orders(id) ON DELETE CASCADE,
  order_attendee_id UUID NOT NULL UNIQUE REFERENCES public.ticket_order_attendees(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  ticket_category_id UUID NOT NULL REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
  ticket_code TEXT NOT NULL UNIQUE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendee_phone TEXT,
  purchaser_name TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  purchaser_phone TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  verification_status public.ticket_verification_status NOT NULL DEFAULT 'pending_payment',
  qr_token TEXT NOT NULL UNIQUE,
  qr_expires_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.issued_tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'scanner',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_ticket_attendees_order ON public.ticket_order_attendees(order_id);
CREATE INDEX idx_issued_tickets_order ON public.issued_tickets(order_id);
CREATE INDEX idx_issued_tickets_event ON public.issued_tickets(event_id);
CREATE INDEX idx_issued_tickets_status ON public.issued_tickets(verification_status, payment_status);
CREATE INDEX idx_issued_tickets_lookup ON public.issued_tickets(ticket_code, qr_token);
CREATE INDEX idx_ticket_checkins_ticket ON public.ticket_checkins(ticket_id, checked_in_at DESC);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_order_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_checkins ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_payments_updated
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_issued_tickets_updated
BEFORE UPDATE ON public.issued_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := 'CKE-TKT-' || upper(encode(gen_random_bytes(5), 'hex'));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.issued_tickets WHERE ticket_code = code
    );
  END LOOP;

  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_ticket_qr_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'ckt_' || encode(gen_random_bytes(24), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_ticket_order_attendees(_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.ticket_orders%ROWTYPE;
  existing_count INTEGER;
BEGIN
  SELECT *
  INTO order_row
  FROM public.ticket_orders
  WHERE id = _order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', _order_id;
  END IF;

  SELECT COUNT(*)
  INTO existing_count
  FROM public.ticket_order_attendees
  WHERE order_id = _order_id;

  IF existing_count < order_row.quantity THEN
    INSERT INTO public.ticket_order_attendees (
      order_id,
      ticket_category_id,
      attendee_index,
      attendee_name,
      attendee_email,
      attendee_phone
    )
    SELECT
      order_row.id,
      order_row.ticket_category_id,
      gs.attendee_index,
      order_row.customer_name,
      order_row.customer_email,
      order_row.customer_phone
    FROM generate_series(existing_count + 1, order_row.quantity) AS gs(attendee_index);
  END IF;

  RETURN order_row.quantity;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_issued_ticket_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_cancelled OR NEW.payment_status = 'refunded' THEN
    NEW.verification_status := 'cancelled';
  ELSIF NEW.is_used THEN
    NEW.verification_status := 'used';
  ELSIF NEW.payment_status = 'paid' THEN
    NEW.verification_status := 'unused';
  ELSE
    NEW.verification_status := 'pending_payment';
  END IF;

  IF NEW.is_used AND NEW.checked_in_at IS NULL THEN
    NEW.checked_in_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_issued_ticket_status
BEFORE INSERT OR UPDATE ON public.issued_tickets
FOR EACH ROW EXECUTE FUNCTION public.sync_issued_ticket_status();

CREATE OR REPLACE FUNCTION public.sync_order_payment_to_tickets(_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.ticket_orders%ROWTYPE;
  payment_row public.payments%ROWTYPE;
  existing_count INTEGER := 0;
  required_count INTEGER := 0;
  available_count INTEGER := 0;
  created_count INTEGER := 0;
BEGIN
  SELECT *
  INTO order_row
  FROM public.ticket_orders
  WHERE id = _order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', _order_id;
  END IF;

  INSERT INTO public.payments (
    order_id,
    provider,
    reference,
    amount,
    currency,
    status,
    paid_at
  )
  VALUES (
    order_row.id,
    COALESCE(NULLIF(order_row.payment_provider, ''), 'manual'),
    order_row.payment_reference,
    order_row.total_amount,
    order_row.currency,
    order_row.payment_status,
    CASE WHEN order_row.payment_status = 'paid' THEN now() ELSE NULL END
  )
  ON CONFLICT (order_id)
  DO UPDATE SET
    provider = COALESCE(NULLIF(EXCLUDED.provider, ''), public.payments.provider),
    reference = COALESCE(NULLIF(EXCLUDED.reference, ''), public.payments.reference),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    paid_at = CASE
      WHEN EXCLUDED.status = 'paid' THEN COALESCE(public.payments.paid_at, now())
      ELSE public.payments.paid_at
    END,
    updated_at = now()
  RETURNING *
  INTO payment_row;

  PERFORM public.ensure_ticket_order_attendees(_order_id);

  IF order_row.payment_status = 'paid' THEN
    SELECT COUNT(*)
    INTO existing_count
    FROM public.issued_tickets
    WHERE order_id = _order_id;

    required_count := GREATEST(order_row.quantity - existing_count, 0);

    IF required_count > 0 THEN
      SELECT quantity_total - quantity_sold
      INTO available_count
      FROM public.ticket_categories
      WHERE id = order_row.ticket_category_id
      FOR UPDATE;

      IF available_count < required_count THEN
        RAISE EXCEPTION 'Not enough remaining tickets to issue order %', order_row.order_reference;
      END IF;

      WITH attendees_to_issue AS (
        SELECT
          attendee.id,
          attendee.attendee_name,
          COALESCE(NULLIF(attendee.attendee_email, ''), order_row.customer_email) AS attendee_email,
          COALESCE(NULLIF(attendee.attendee_phone, ''), order_row.customer_phone) AS attendee_phone
        FROM public.ticket_order_attendees AS attendee
        LEFT JOIN public.issued_tickets AS ticket
          ON ticket.order_attendee_id = attendee.id
        WHERE attendee.order_id = _order_id
          AND ticket.id IS NULL
        ORDER BY attendee.attendee_index
        LIMIT required_count
      ),
      inserted AS (
        INSERT INTO public.issued_tickets (
          order_id,
          order_attendee_id,
          payment_id,
          event_id,
          ticket_category_id,
          ticket_code,
          attendee_name,
          attendee_email,
          attendee_phone,
          purchaser_name,
          purchaser_email,
          purchaser_phone,
          unit_price,
          total_amount,
          currency,
          payment_status,
          verification_status,
          qr_token,
          issued_at
        )
        SELECT
          order_row.id,
          attendee.id,
          payment_row.id,
          order_row.event_id,
          order_row.ticket_category_id,
          public.generate_ticket_code(),
          attendee.attendee_name,
          attendee.attendee_email,
          attendee.attendee_phone,
          order_row.customer_name,
          order_row.customer_email,
          order_row.customer_phone,
          order_row.unit_price,
          order_row.total_amount,
          order_row.currency,
          'paid',
          'unused',
          public.generate_ticket_qr_token(),
          now()
        FROM attendees_to_issue AS attendee
        RETURNING id
      )
      SELECT COUNT(*)
      INTO created_count
      FROM inserted;

      IF created_count > 0 THEN
        UPDATE public.ticket_categories
        SET quantity_sold = quantity_sold + created_count
        WHERE id = order_row.ticket_category_id;
      END IF;
    END IF;

    UPDATE public.issued_tickets
    SET
      payment_id = payment_row.id,
      payment_status = 'paid',
      issued_at = COALESCE(issued_at, now()),
      updated_at = now()
    WHERE order_id = _order_id;
  ELSE
    UPDATE public.issued_tickets
    SET
      payment_id = payment_row.id,
      payment_status = order_row.payment_status,
      updated_at = now()
    WHERE order_id = _order_id;
  END IF;

  RETURN created_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_ticket_order_sync_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_order_payment_to_tickets(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ticket_order_sync
AFTER INSERT OR UPDATE OF payment_status, payment_provider, payment_reference
ON public.ticket_orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_ticket_order_sync_trigger();

CREATE OR REPLACE FUNCTION public.admin_verify_ticket(
  _lookup TEXT,
  _event_id UUID DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  payment_confirmed BOOLEAN,
  event_match BOOLEAN,
  ticket_id UUID,
  ticket_code TEXT,
  order_reference TEXT,
  event_id UUID,
  event_name TEXT,
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  attendee_name TEXT,
  attendee_email TEXT,
  purchaser_name TEXT,
  purchaser_email TEXT,
  ticket_tier TEXT,
  status public.ticket_verification_status,
  payment_status public.payment_status,
  is_used BOOLEAN,
  is_cancelled BOOLEAN,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  purchase_date TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  total_amount NUMERIC,
  unit_price NUMERIC,
  currency TEXT,
  checkin_count BIGINT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_lookup TEXT := upper(trim(COALESCE(_lookup, '')));
  resolved_token TEXT := trim(COALESCE(_lookup, ''));
  ticket_row RECORD;
  derived_status public.ticket_verification_status := 'invalid';
  derived_message TEXT := 'Ticket not found.';
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF resolved_token = '' THEN
    RETURN QUERY
    SELECT
      FALSE, FALSE, FALSE,
      NULL::UUID, NULL::TEXT, NULL::TEXT,
      NULL::UUID, NULL::TEXT, NULL::DATE, NULL::TEXT, NULL::TEXT,
      NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT,
      'invalid'::public.ticket_verification_status,
      NULL::public.payment_status,
      FALSE, FALSE, NULL::TIMESTAMPTZ, NULL::UUID,
      NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ,
      NULL::NUMERIC, NULL::NUMERIC, NULL::TEXT, 0::BIGINT,
      'No lookup value provided.';
    RETURN;
  END IF;

  SELECT
    ticket.*,
    orders.order_reference,
    orders.created_at AS purchase_date,
    events.title AS event_name,
    events.event_date,
    events.event_time,
    events.venue,
    category.name AS ticket_tier,
    COALESCE(checkins.count, 0) AS checkin_count
  INTO ticket_row
  FROM public.issued_tickets AS ticket
  INNER JOIN public.ticket_orders AS orders
    ON orders.id = ticket.order_id
  INNER JOIN public.events AS events
    ON events.id = ticket.event_id
  INNER JOIN public.ticket_categories AS category
    ON category.id = ticket.ticket_category_id
  LEFT JOIN (
    SELECT ticket_id, COUNT(*) AS count
    FROM public.ticket_checkins
    GROUP BY ticket_id
  ) AS checkins
    ON checkins.ticket_id = ticket.id
  WHERE ticket.qr_token = resolved_token
     OR ticket.ticket_code = normalized_lookup
  ORDER BY ticket.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      FALSE, FALSE, FALSE,
      NULL::UUID, NULL::TEXT, NULL::TEXT,
      NULL::UUID, NULL::TEXT, NULL::DATE, NULL::TEXT, NULL::TEXT,
      NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT,
      'invalid'::public.ticket_verification_status,
      NULL::public.payment_status,
      FALSE, FALSE, NULL::TIMESTAMPTZ, NULL::UUID,
      NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ,
      NULL::NUMERIC, NULL::NUMERIC, NULL::TEXT, 0::BIGINT,
      'Ticket not found.';
    RETURN;
  END IF;

  UPDATE public.issued_tickets
  SET last_verified_at = now()
  WHERE id = ticket_row.id;

  IF ticket_row.is_cancelled OR ticket_row.payment_status = 'refunded' THEN
    derived_status := 'cancelled';
    derived_message := 'Ticket has been cancelled or refunded.';
  ELSIF ticket_row.payment_status <> 'paid' THEN
    derived_status := 'pending_payment';
    derived_message := 'Payment is not confirmed for this ticket.';
  ELSIF ticket_row.is_used THEN
    derived_status := 'used';
    derived_message := 'Ticket has already been used.';
  ELSE
    derived_status := 'unused';
    derived_message := 'Ticket is valid and ready for check-in.';
  END IF;

  IF _event_id IS NOT NULL AND ticket_row.event_id <> _event_id THEN
    derived_message := 'Ticket belongs to a different event.';
  END IF;

  RETURN QUERY
  SELECT
    derived_status <> 'invalid',
    ticket_row.payment_status = 'paid',
    CASE WHEN _event_id IS NULL THEN TRUE ELSE ticket_row.event_id = _event_id END,
    ticket_row.id,
    ticket_row.ticket_code,
    ticket_row.order_reference,
    ticket_row.event_id,
    ticket_row.event_name,
    ticket_row.event_date,
    ticket_row.event_time,
    ticket_row.venue,
    ticket_row.attendee_name,
    ticket_row.attendee_email,
    ticket_row.purchaser_name,
    ticket_row.purchaser_email,
    ticket_row.ticket_tier,
    derived_status,
    ticket_row.payment_status,
    ticket_row.is_used,
    ticket_row.is_cancelled,
    ticket_row.checked_in_at,
    ticket_row.checked_in_by,
    ticket_row.purchase_date,
    ticket_row.issued_at,
    ticket_row.total_amount,
    ticket_row.unit_price,
    ticket_row.currency,
    ticket_row.checkin_count,
    derived_message;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_check_in_ticket(
  _lookup TEXT,
  _event_id UUID DEFAULT NULL,
  _source TEXT DEFAULT 'scanner'
)
RETURNS TABLE (
  valid BOOLEAN,
  payment_confirmed BOOLEAN,
  event_match BOOLEAN,
  ticket_id UUID,
  ticket_code TEXT,
  order_reference TEXT,
  event_id UUID,
  event_name TEXT,
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  attendee_name TEXT,
  attendee_email TEXT,
  purchaser_name TEXT,
  purchaser_email TEXT,
  ticket_tier TEXT,
  status public.ticket_verification_status,
  payment_status public.payment_status,
  is_used BOOLEAN,
  is_cancelled BOOLEAN,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  purchase_date TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  total_amount NUMERIC,
  unit_price NUMERIC,
  currency TEXT,
  checkin_count BIGINT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_lookup TEXT := upper(trim(COALESCE(_lookup, '')));
  resolved_token TEXT := trim(COALESCE(_lookup, ''));
  ticket_row RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT *
  INTO ticket_row
  FROM public.admin_verify_ticket(resolved_token, _event_id)
  LIMIT 1;

  IF NOT FOUND OR ticket_row.ticket_id IS NULL THEN
    RETURN QUERY SELECT * FROM public.admin_verify_ticket(resolved_token, _event_id);
    RETURN;
  END IF;

  IF ticket_row.status <> 'unused' OR ticket_row.payment_confirmed IS FALSE OR ticket_row.event_match IS FALSE THEN
    RETURN QUERY SELECT * FROM public.admin_verify_ticket(resolved_token, _event_id);
    RETURN;
  END IF;

  UPDATE public.issued_tickets
  SET
    is_used = TRUE,
    checked_in_at = now(),
    checked_in_by = auth.uid(),
    updated_at = now()
  WHERE id = ticket_row.ticket_id
    AND is_used = FALSE;

  INSERT INTO public.ticket_checkins (
    ticket_id,
    event_id,
    checked_in_by,
    source
  )
  VALUES (
    ticket_row.ticket_id,
    ticket_row.event_id,
    auth.uid(),
    COALESCE(NULLIF(_source, ''), 'scanner')
  );

  RETURN QUERY SELECT * FROM public.admin_verify_ticket(resolved_token, _event_id);
END;
$$;

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.ticket_orders AS orders
      WHERE orders.id = order_id
        AND (
          orders.user_id = auth.uid()
          OR (auth.jwt() ->> 'email') = orders.customer_email
        )
    )
  );

CREATE POLICY "Anyone can insert attendee details" ON public.ticket_order_attendees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ticket_orders AS orders
      WHERE orders.id = order_id
        AND orders.payment_status = 'pending'
    )
  );

CREATE POLICY "Users view own attendee details" ON public.ticket_order_attendees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.ticket_orders AS orders
      WHERE orders.id = order_id
        AND (
          orders.user_id = auth.uid()
          OR (auth.jwt() ->> 'email') = orders.customer_email
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE POLICY "Admins update attendee details" ON public.ticket_order_attendees
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all tickets" ON public.issued_tickets
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tickets" ON public.issued_tickets
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own issued tickets" ON public.issued_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.ticket_orders AS orders
      WHERE orders.id = order_id
        AND (
          orders.user_id = auth.uid()
          OR (auth.jwt() ->> 'email') = orders.customer_email
          OR (auth.jwt() ->> 'email') = attendee_email
        )
    )
  );

CREATE POLICY "Admins manage ticket checkins" ON public.ticket_checkins
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own ticket checkins" ON public.ticket_checkins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.issued_tickets AS ticket
      INNER JOIN public.ticket_orders AS orders
        ON orders.id = ticket.order_id
      WHERE ticket.id = ticket_id
        AND (
          orders.user_id = auth.uid()
          OR (auth.jwt() ->> 'email') = orders.customer_email
          OR (auth.jwt() ->> 'email') = ticket.attendee_email
        )
    )
  );

INSERT INTO public.ticket_order_attendees (
  order_id,
  ticket_category_id,
  attendee_index,
  attendee_name,
  attendee_email,
  attendee_phone
)
SELECT
  orders.id,
  orders.ticket_category_id,
  series.attendee_index,
  orders.customer_name,
  orders.customer_email,
  orders.customer_phone
FROM public.ticket_orders AS orders
CROSS JOIN LATERAL generate_series(1, orders.quantity) AS series(attendee_index)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.ticket_order_attendees AS attendee
  WHERE attendee.order_id = orders.id
);

SELECT public.sync_order_payment_to_tickets(id)
FROM public.ticket_orders;
