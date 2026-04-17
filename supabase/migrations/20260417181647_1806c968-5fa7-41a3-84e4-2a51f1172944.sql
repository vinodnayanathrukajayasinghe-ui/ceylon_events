
-- Validation on bookings
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 120),
  ADD CONSTRAINT bookings_email_len CHECK (char_length(customer_email) BETWEEN 3 AND 255),
  ADD CONSTRAINT bookings_email_fmt CHECK (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT bookings_phone_len CHECK (char_length(customer_phone) BETWEEN 4 AND 40),
  ADD CONSTRAINT bookings_message_len CHECK (message IS NULL OR char_length(message) <= 2000),
  ADD CONSTRAINT bookings_event_type_len CHECK (char_length(event_type) BETWEEN 1 AND 80),
  ADD CONSTRAINT bookings_guest_count_range CHECK (guest_count IS NULL OR (guest_count BETWEEN 1 AND 10000));

-- Validation on ticket_orders
ALTER TABLE public.ticket_orders
  ADD CONSTRAINT torders_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 120),
  ADD CONSTRAINT torders_email_len CHECK (char_length(customer_email) BETWEEN 3 AND 255),
  ADD CONSTRAINT torders_email_fmt CHECK (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT torders_phone_len CHECK (char_length(customer_phone) BETWEEN 4 AND 40),
  ADD CONSTRAINT torders_qty_max CHECK (quantity BETWEEN 1 AND 100);

-- Validation on inquiries
ALTER TABLE public.inquiries
  ADD CONSTRAINT inq_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
  ADD CONSTRAINT inq_email_len CHECK (char_length(email) BETWEEN 3 AND 255),
  ADD CONSTRAINT inq_email_fmt CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT inq_phone_len CHECK (phone IS NULL OR char_length(phone) BETWEEN 4 AND 40),
  ADD CONSTRAINT inq_subject_len CHECK (subject IS NULL OR char_length(subject) <= 200),
  ADD CONSTRAINT inq_message_len CHECK (char_length(message) BETWEEN 1 AND 4000);
