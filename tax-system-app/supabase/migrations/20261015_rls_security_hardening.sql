-- =========================================================
-- TAX SYSTEM - RLS SECURITY HARDENING
-- 15 October 2026
-- =========================================================

-- =========================================================
-- TAX RATES
-- Only admin and senior can create or update tax rates
-- =========================================================

alter policy "Users can add organization tax rates"
on public.tax_rates
to authenticated
with check (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id = tax_rates.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

alter policy "Users can update organization tax rates"
on public.tax_rates
to authenticated
using (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id = tax_rates.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
)
with check (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id = tax_rates.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);


-- =========================================================
-- TAX PERIODS
-- Only admin and senior can create or directly update periods
-- =========================================================

alter policy "tax_periods_insert"
on public.tax_periods
to authenticated
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "tax_periods_update"
on public.tax_periods
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
)
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

-- =========================================================
-- TAX PERIOD CHANGE REQUESTS
-- Users see their own requests.
-- Admin and senior can view and review organization requests.
-- =========================================================

alter policy "Users can view organization tax period requests"
on public.tax_period_change_requests
to authenticated
using (
  requested_by = auth.uid()
  OR
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          tax_period_change_requests.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

alter policy "Authorized users can review tax period requests"
on public.tax_period_change_requests
to authenticated
using (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          tax_period_change_requests.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
)
with check (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          tax_period_change_requests.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

alter policy "Users can request tax period changes"
on public.tax_period_change_requests
to authenticated
with check (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          tax_period_change_requests.organization_id
  )
  and requested_by = auth.uid()
);


-- =========================================================
-- EMPLOYEE PAYROLL
-- Payroll data restricted to admin and senior
-- =========================================================

alter policy "Users can view organization payroll"
on public.employee_payroll
to authenticated
using (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          employee_payroll.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

alter policy "Users can add organization payroll"
on public.employee_payroll
to authenticated
with check (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          employee_payroll.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

alter policy "Users can update organization payroll"
on public.employee_payroll
to authenticated
using (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          employee_payroll.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
)
with check (
  exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id =
          employee_payroll.organization_id
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

-- =========================================================
-- EMPLOYEES
-- Employee records restricted to admin and senior
-- =========================================================

alter policy "employees_select"
on public.employees
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "employees_insert"
on public.employees
to authenticated
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "employees_update"
on public.employees
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
)
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "employees_delete"
on public.employees
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

-- =========================================================
-- SUPPLIERS
-- Staff may view, add, and update suppliers.
-- Only admin and senior may delete.
-- =========================================================

alter policy "suppliers_delete"
on public.suppliers
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);


-- =========================================================
-- CUSTOMERS
-- Staff may view, add, and update customers.
-- Only admin and senior may delete.
-- =========================================================

alter policy "customers_delete"
on public.customers
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);


-- =========================================================
-- PROJECTS
-- Staff may view, add, and update projects.
-- Only admin and senior may delete.
-- =========================================================

alter policy "projects_delete"
on public.projects
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

-- =========================================================
-- TRANSACTIONS
-- Staff may view and add transactions.
-- Only admin and senior may edit or delete.
-- =========================================================

alter policy "transactions_update"
on public.transactions
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
)
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "transactions_delete"
on public.transactions
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);


-- =========================================================
-- ORGANIZATIONS
-- Only admin and senior may update organization details.
-- Normal authenticated users may no longer create organizations.
-- =========================================================

alter policy "org_admin_update"
on public.organizations
to authenticated
using (
  has_org_role(
    id,
    ARRAY['admin'::text, 'senior'::text]
  )
)
with check (
  has_org_role(
    id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

drop policy if exists "org_authenticated_insert"
on public.organizations;

-- =========================================================
-- ORGANIZATION USERS
-- Normal users see only their own membership.
-- Admin and senior may manage memberships.
-- Only admin may remove users.
-- =========================================================

alter policy "membership_select"
on public.organization_users
to authenticated
using (
  user_id = auth.uid()
  OR
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "membership_admin_insert"
on public.organization_users
to authenticated
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "membership_admin_update"
on public.organization_users
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
)
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "membership_owner_delete"
on public.organization_users
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text]
  )
);

-- =========================================================
-- DOCUMENTS
-- Sensitive document records restricted to admin and senior.
-- =========================================================

alter policy "documents_select"
on public.documents
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "documents_insert"
on public.documents
to authenticated
with check (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);

alter policy "documents_delete"
on public.documents
to authenticated
using (
  has_org_role(
    organization_id,
    ARRAY['admin'::text, 'senior'::text]
  )
);