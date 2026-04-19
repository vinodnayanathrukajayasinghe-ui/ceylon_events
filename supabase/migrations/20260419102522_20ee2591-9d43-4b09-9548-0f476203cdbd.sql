-- Create admin user with email/password and grant admin role
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@ceylonkandyevents.com';
  
  IF admin_uid IS NULL THEN
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated', 'authenticated',
      'admin@ceylonkandyevents.com',
      crypt('Ceylon@123#', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Ceylon Kandy Admin"}'::jsonb,
      '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      admin_uid,
      json_build_object('sub', admin_uid::text, 'email', 'admin@ceylonkandyevents.com')::jsonb,
      'email',
      admin_uid::text,
      now(), now(), now()
    );
  END IF;

  -- Ensure profile + admin role
  INSERT INTO public.profiles (id, display_name)
  VALUES (admin_uid, 'Ceylon Kandy Admin')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_uid, 'admin')
  ON CONFLICT DO NOTHING;
END $$;

-- Allow guests/users to also see ticket orders by matching email (so anonymous checkouts appear in My Bookings after signup/login)
DROP POLICY IF EXISTS "Users view own orders" ON public.ticket_orders;
CREATE POLICY "Users view own orders"
ON public.ticket_orders
FOR SELECT
USING (
  auth.uid() = user_id
  OR (auth.jwt() ->> 'email') = customer_email
);

-- Same for bookings
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings"
ON public.bookings
FOR SELECT
USING (
  auth.uid() = user_id
  OR (auth.jwt() ->> 'email') = customer_email
);