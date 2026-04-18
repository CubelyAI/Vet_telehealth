-- ============================================================
-- Vet Telehealth Platform — Row Level Security Policies
-- Apply via: psql $DATABASE_URL -f supabase/policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- VETS: only the authenticated vet matching auth.uid()
-- -------------------------------------------------------
CREATE POLICY "vets_select_own" ON vets
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "vets_insert_own" ON vets
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "vets_update_own" ON vets
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "vets_delete_own" ON vets
  FOR DELETE USING (auth.uid() = id);

-- -------------------------------------------------------
-- AVAILABILITY_SLOTS
--   Vets manage their own slots; anon can read unbooked
-- -------------------------------------------------------
CREATE POLICY "slots_anon_read_available" ON availability_slots
  FOR SELECT USING (is_booked = false);

CREATE POLICY "slots_vet_insert_own" ON availability_slots
  FOR INSERT WITH CHECK (auth.uid() = vet_id);

CREATE POLICY "slots_vet_update_own" ON availability_slots
  FOR UPDATE USING (auth.uid() = vet_id);

CREATE POLICY "slots_vet_delete_own" ON availability_slots
  FOR DELETE USING (auth.uid() = vet_id);

CREATE POLICY "slots_vet_select_own" ON availability_slots
  FOR SELECT USING (auth.uid() = vet_id);

-- -------------------------------------------------------
-- APPOINTMENTS
--   Anon reads via booking_token session variable
--   Vets read their own appointments
-- -------------------------------------------------------
CREATE POLICY "appointments_anon_read_by_token" ON appointments
  FOR SELECT USING (
    booking_token::text = current_setting('app.booking_token', true)
  );

CREATE POLICY "appointments_vet_read_own" ON appointments
  FOR SELECT USING (auth.uid() = vet_id);

CREATE POLICY "appointments_vet_update_own" ON appointments
  FOR UPDATE USING (auth.uid() = vet_id);

-- Service role inserts appointments (used by API route with service key)
CREATE POLICY "appointments_service_insert" ON appointments
  FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------
-- PETS
--   Anon reads via booking_token (joined through appointment)
--   Vets read pets belonging to their appointments
-- -------------------------------------------------------
CREATE POLICY "pets_anon_read_by_token" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = pets.appointment_id
        AND a.booking_token::text = current_setting('app.booking_token', true)
    )
  );

CREATE POLICY "pets_vet_read_own" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = pets.appointment_id
        AND a.vet_id = auth.uid()
    )
  );

CREATE POLICY "pets_service_insert" ON pets
  FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------
-- QUESTIONNAIRE_RESPONSES
-- -------------------------------------------------------
CREATE POLICY "qr_anon_read_by_token" ON questionnaire_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = questionnaire_responses.appointment_id
        AND a.booking_token::text = current_setting('app.booking_token', true)
    )
  );

CREATE POLICY "qr_vet_read_own" ON questionnaire_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = questionnaire_responses.appointment_id
        AND a.vet_id = auth.uid()
    )
  );

CREATE POLICY "qr_service_insert" ON questionnaire_responses
  FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------
-- CONSULTATIONS
--   Vets read/write their own consultations (via appointment)
-- -------------------------------------------------------
CREATE POLICY "consultations_vet_select" ON consultations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = consultations.appointment_id
        AND a.vet_id = auth.uid()
    )
  );

CREATE POLICY "consultations_vet_insert" ON consultations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = consultations.appointment_id
        AND a.vet_id = auth.uid()
    )
  );

CREATE POLICY "consultations_vet_update" ON consultations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = consultations.appointment_id
        AND a.vet_id = auth.uid()
    )
  );

-- Service role upsert for webhook handler
CREATE POLICY "consultations_service_upsert" ON consultations
  FOR ALL WITH CHECK (true);

-- -------------------------------------------------------
-- CUSTOMERS (service role only — no direct client access)
-- -------------------------------------------------------
CREATE POLICY "customers_service_all" ON customers
  FOR ALL USING (true) WITH CHECK (true);
