-- Drop default first (cast fails with the old enum default in place)
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- Rename existing enum
ALTER TYPE "Role" RENAME TO "Role_old";

-- Create new enum with all roles
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'ATTENDANT', 'MECHANIC');

-- Migrate column: USER → ATTENDANT, ADMIN stays ADMIN
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "Role"
  USING (CASE "role"::text
    WHEN 'ADMIN' THEN 'ADMIN'::"Role"
    ELSE 'ATTENDANT'::"Role"
  END);

-- Set new default
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ATTENDANT'::"Role";

-- Drop old enum
DROP TYPE "Role_old";

-- Add new columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "specialty" TEXT;
