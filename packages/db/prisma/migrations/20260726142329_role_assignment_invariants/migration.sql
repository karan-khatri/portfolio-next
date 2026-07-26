-- expiresAt (when set) must be strictly after startsAt.
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "role_assignment_timeframe_check"
  CHECK ("expiresAt" IS NULL OR "expiresAt" > "startsAt");

-- A row assigning an isPermanent Role must never carry an expiresAt — this is
-- a cross-table rule (references Role.isPermanent), so it needs a trigger
-- rather than a plain CHECK constraint, which can only see its own row.
CREATE OR REPLACE FUNCTION enforce_permanent_role_no_expiry() RETURNS trigger AS $$
BEGIN
  IF NEW."expiresAt" IS NOT NULL AND EXISTS (
    SELECT 1 FROM "Role" WHERE "id" = NEW."roleId" AND "isPermanent" = true
  ) THEN
    RAISE EXCEPTION 'UserRoleAssignment for an isPermanent Role must have a NULL expiresAt';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_assignment_permanent_no_expiry
  BEFORE INSERT OR UPDATE ON "UserRoleAssignment"
  FOR EACH ROW
  EXECUTE FUNCTION enforce_permanent_role_no_expiry();
