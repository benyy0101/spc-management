--
-- PostgreSQL database dump
--

\restrict dUhlNxnpH3VQ8SrJ2oPGMBeEmeIuR0fZZAnREDFPmFVzpVI6pENGcTHqsWt1R0x

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.statement_mappings DROP CONSTRAINT IF EXISTS statement_mappings_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.statement_mappings DROP CONSTRAINT IF EXISTS statement_mappings_account_id_accounts_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_source_event_id_events_id_fk;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_book_id_books_id_fk;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_approved_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_journal_id_journals_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_investor_id_investors_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_counterparty_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_contract_id_contracts_id_fk;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_account_id_accounts_id_fk;
ALTER TABLE IF EXISTS ONLY public.investors DROP CONSTRAINT IF EXISTS investors_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.investor_allocations DROP CONSTRAINT IF EXISTS investor_allocations_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.investor_allocations DROP CONSTRAINT IF EXISTS investor_allocations_investor_id_investors_id_fk;
ALTER TABLE IF EXISTS ONLY public.investor_allocations DROP CONSTRAINT IF EXISTS investor_allocations_fund_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.fx_rates DROP CONSTRAINT IF EXISTS fx_rates_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.fund_investor_positions DROP CONSTRAINT IF EXISTS fund_investor_positions_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.fund_investor_positions DROP CONSTRAINT IF EXISTS fund_investor_positions_investor_id_investors_id_fk;
ALTER TABLE IF EXISTS ONLY public.fund_investor_positions DROP CONSTRAINT IF EXISTS fund_investor_positions_fund_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_investor_id_investors_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_counterparty_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_contract_id_contracts_id_fk;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_book_id_books_id_fk;
ALTER TABLE IF EXISTS ONLY public.event_calculations DROP CONSTRAINT IF EXISTS event_calculations_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.event_calculations DROP CONSTRAINT IF EXISTS event_calculations_event_id_events_id_fk;
ALTER TABLE IF EXISTS ONLY public.entities DROP CONSTRAINT IF EXISTS entities_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.contract_parties DROP CONSTRAINT IF EXISTS contract_parties_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.contract_parties DROP CONSTRAINT IF EXISTS contract_parties_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.contract_parties DROP CONSTRAINT IF EXISTS contract_parties_contract_id_contracts_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_periods DROP CONSTRAINT IF EXISTS close_periods_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_periods DROP CONSTRAINT IF EXISTS close_periods_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_periods DROP CONSTRAINT IF EXISTS close_periods_closed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_periods DROP CONSTRAINT IF EXISTS close_periods_book_id_books_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_adjustment_journals DROP CONSTRAINT IF EXISTS close_adjustment_journals_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_adjustment_journals DROP CONSTRAINT IF EXISTS close_adjustment_journals_reversal_journal_id_journals_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_adjustment_journals DROP CONSTRAINT IF EXISTS close_adjustment_journals_journal_id_journals_id_fk;
ALTER TABLE IF EXISTS ONLY public.close_adjustment_journals DROP CONSTRAINT IF EXISTS close_adjustment_journals_close_period_id_close_periods_id_fk;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_entity_id_entities_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_tenant_id_tenants_id_fk;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_tenant_id_tenants_id_fk;
DROP INDEX IF EXISTS public.users_tenant_email_uq;
DROP INDEX IF EXISTS public.tenants_code_uq;
DROP INDEX IF EXISTS public.statement_mappings_tenant_line_order_uq;
DROP INDEX IF EXISTS public.products_tenant_code_uq;
DROP INDEX IF EXISTS public.journals_tenant_journal_no_uq;
DROP INDEX IF EXISTS public.journal_lines_tenant_journal_line_uq;
DROP INDEX IF EXISTS public.investors_tenant_code_uq;
DROP INDEX IF EXISTS public.fx_rates_tenant_rate_uq;
DROP INDEX IF EXISTS public.events_tenant_type_idempotency_uq;
DROP INDEX IF EXISTS public.events_tenant_entity_date_idx;
DROP INDEX IF EXISTS public.entities_tenant_code_uq;
DROP INDEX IF EXISTS public.contracts_tenant_code_version_uq;
DROP INDEX IF EXISTS public.close_periods_tenant_book_period_uq;
DROP INDEX IF EXISTS public.books_tenant_code_uq;
DROP INDEX IF EXISTS public.accounts_tenant_code_uq;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.statement_mappings DROP CONSTRAINT IF EXISTS statement_mappings_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.journals DROP CONSTRAINT IF EXISTS journals_pkey;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_pkey;
ALTER TABLE IF EXISTS ONLY public.investors DROP CONSTRAINT IF EXISTS investors_pkey;
ALTER TABLE IF EXISTS ONLY public.investor_allocations DROP CONSTRAINT IF EXISTS investor_allocations_pkey;
ALTER TABLE IF EXISTS ONLY public.fx_rates DROP CONSTRAINT IF EXISTS fx_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.fund_investor_positions DROP CONSTRAINT IF EXISTS fund_investor_positions_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.event_calculations DROP CONSTRAINT IF EXISTS event_calculations_pkey;
ALTER TABLE IF EXISTS ONLY public.entities DROP CONSTRAINT IF EXISTS entities_pkey;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_pkey;
ALTER TABLE IF EXISTS ONLY public.contract_parties DROP CONSTRAINT IF EXISTS contract_parties_pkey;
ALTER TABLE IF EXISTS ONLY public.close_periods DROP CONSTRAINT IF EXISTS close_periods_pkey;
ALTER TABLE IF EXISTS ONLY public.close_adjustment_journals DROP CONSTRAINT IF EXISTS close_adjustment_journals_pkey;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.statement_mappings;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.journals;
DROP TABLE IF EXISTS public.journal_lines;
DROP TABLE IF EXISTS public.investors;
DROP TABLE IF EXISTS public.investor_allocations;
DROP TABLE IF EXISTS public.fx_rates;
DROP TABLE IF EXISTS public.fund_investor_positions;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.event_calculations;
DROP TABLE IF EXISTS public.entities;
DROP TABLE IF EXISTS public.contracts;
DROP TABLE IF EXISTS public.contract_parties;
DROP TABLE IF EXISTS public.close_periods;
DROP TABLE IF EXISTS public.close_adjustment_journals;
DROP TABLE IF EXISTS public.books;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.accounts;
DROP TYPE IF EXISTS public.user_status;
DROP TYPE IF EXISTS public.tenant_status;
DROP TYPE IF EXISTS public.statement_type;
DROP TYPE IF EXISTS public.product_type;
DROP TYPE IF EXISTS public.posting_status;
DROP TYPE IF EXISTS public.period_type;
DROP TYPE IF EXISTS public.normal_balance;
DROP TYPE IF EXISTS public.investor_type;
DROP TYPE IF EXISTS public.event_status;
DROP TYPE IF EXISTS public.entity_type;
DROP TYPE IF EXISTS public.contract_type;
DROP TYPE IF EXISTS public.close_status;
DROP TYPE IF EXISTS public.book_type;
DROP TYPE IF EXISTS public.account_type;
--
-- Name: account_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_type AS ENUM (
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense',
    'contra_asset'
);


--
-- Name: book_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.book_type AS ENUM (
    'primary',
    'secondary',
    'reporting'
);


--
-- Name: close_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.close_status AS ENUM (
    'open',
    'closing',
    'closed',
    'reopened'
);


--
-- Name: contract_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_type AS ENUM (
    'loan_agreement',
    'bond_investment',
    'equity_subscription',
    'beneficiary_subscription',
    'other'
);


--
-- Name: entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entity_type AS ENUM (
    'asset_manager',
    'fund',
    'spc',
    'corporate',
    'other'
);


--
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'validated',
    'posted',
    'reversed'
);


--
-- Name: investor_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.investor_type AS ENUM (
    'institutional',
    'individual',
    'other'
);


--
-- Name: normal_balance; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.normal_balance AS ENUM (
    'debit',
    'credit'
);


--
-- Name: period_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.period_type AS ENUM (
    'month',
    'quarter',
    'year'
);


--
-- Name: posting_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.posting_status AS ENUM (
    'draft',
    'approved',
    'posted',
    'reversed'
);


--
-- Name: product_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_type AS ENUM (
    'loan_receivable',
    'bond',
    'beneficiary_certificate',
    'equity',
    'derivative'
);


--
-- Name: statement_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.statement_type AS ENUM (
    'BS',
    'PL',
    'CF'
);


--
-- Name: tenant_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_status AS ENUM (
    'active',
    'inactive'
);


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'inactive'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(200) NOT NULL,
    account_type public.account_type NOT NULL,
    statement_type public.statement_type NOT NULL,
    normal_balance public.normal_balance NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    actor_user_id uuid,
    action_type character varying(50) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid NOT NULL,
    before_payload_json jsonb,
    after_payload_json jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    book_type public.book_type DEFAULT 'primary'::public.book_type NOT NULL,
    accounting_basis character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: close_adjustment_journals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.close_adjustment_journals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    close_period_id uuid NOT NULL,
    journal_id uuid NOT NULL,
    reverse_on_date date,
    reversal_journal_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: close_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.close_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    book_id uuid NOT NULL,
    period_type public.period_type NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    status public.close_status DEFAULT 'open'::public.close_status NOT NULL,
    closed_at timestamp with time zone,
    closed_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contract_parties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_parties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    contract_id uuid NOT NULL,
    party_role character varying(50) NOT NULL,
    entity_id uuid,
    external_party_name character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    product_id uuid NOT NULL,
    contract_type public.contract_type NOT NULL,
    code character varying(50) NOT NULL,
    currency character varying(3) NOT NULL,
    effective_date date NOT NULL,
    maturity_date date,
    interest_rate_type character varying(30),
    interest_rate numeric(12,8),
    day_count_convention character varying(30),
    version_no integer DEFAULT 1 NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    metadata text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: entities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    entity_type public.entity_type NOT NULL,
    functional_currency character varying(3) NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: event_calculations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_calculations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    event_id uuid NOT NULL,
    calculation_type character varying(50) NOT NULL,
    input_payload_json jsonb NOT NULL,
    result_payload_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    book_id uuid NOT NULL,
    event_type character varying(100) NOT NULL,
    idempotency_key character varying(200) NOT NULL,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    trade_date date NOT NULL,
    accounting_date date NOT NULL,
    settlement_date date,
    currency character varying(3) NOT NULL,
    amount numeric(20,2) NOT NULL,
    product_id uuid,
    contract_id uuid,
    counterparty_entity_id uuid,
    investor_id uuid,
    source_reference character varying(200),
    payload_json jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fund_investor_positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fund_investor_positions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    fund_entity_id uuid NOT NULL,
    investor_id uuid NOT NULL,
    commitment_amount numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    paid_in_amount numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    ownership_ratio numeric(12,8) NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fx_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fx_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rate_date timestamp without time zone NOT NULL,
    from_currency character varying(3) NOT NULL,
    to_currency character varying(3) NOT NULL,
    rate numeric(20,8) NOT NULL,
    source_name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: investor_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investor_allocations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    fund_entity_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    allocation_method character varying(30) NOT NULL,
    source_amount_type character varying(30) NOT NULL,
    source_amount numeric(20,2) NOT NULL,
    investor_id uuid NOT NULL,
    ownership_ratio numeric(12,8) NOT NULL,
    allocated_profit_amount numeric(20,2) NOT NULL,
    cash_distribution_amount numeric(20,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: investors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    investor_type public.investor_type NOT NULL,
    default_currency character varying(3) NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_lines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    journal_id uuid NOT NULL,
    line_no integer NOT NULL,
    account_id uuid NOT NULL,
    debit_amount numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    credit_amount numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(3) NOT NULL,
    amount_scale integer DEFAULT 2 NOT NULL,
    fx_rate numeric(20,8),
    amount_in_functional_currency numeric(20,2),
    product_id uuid,
    contract_id uuid,
    counterparty_entity_id uuid,
    investor_id uuid,
    description character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT journal_lines_debit_credit_check CHECK ((((debit_amount = (0)::numeric) AND (credit_amount > (0)::numeric)) OR ((credit_amount = (0)::numeric) AND (debit_amount > (0)::numeric))))
);


--
-- Name: journals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    book_id uuid NOT NULL,
    source_event_id uuid,
    journal_no character varying(50) NOT NULL,
    journal_type character varying(50) NOT NULL,
    accounting_date date NOT NULL,
    posting_status public.posting_status DEFAULT 'draft'::public.posting_status NOT NULL,
    description character varying(500),
    created_by uuid,
    approved_by uuid,
    posted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    product_type public.product_type NOT NULL,
    currency character varying(3) NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: statement_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statement_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    account_id uuid NOT NULL,
    statement_type public.statement_type NOT NULL,
    line_code character varying(50) NOT NULL,
    line_name character varying(200) NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    status public.tenant_status DEFAULT 'active'::public.tenant_status NOT NULL,
    base_currency character varying(3) NOT NULL,
    accounting_timezone character varying(64) NOT NULL,
    settings jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(200) NOT NULL,
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    auth_subject character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, tenant_id, code, name, account_type, statement_type, normal_balance, is_active, created_at, updated_at) FROM stdin;
91c0c465-aa3f-4846-b2fb-4a543588158c	7374a609-3d8d-4f06-9da1-ec8549201fe7	111000	Cash	asset	BS	debit	t	2026-04-25 11:32:42.435526+00	2026-04-25 11:32:42.435526+00
c249b00e-14dd-4906-a52c-34ea61cd5ed3	7374a609-3d8d-4f06-9da1-ec8549201fe7	121000	Loan Receivable	asset	BS	debit	t	2026-04-25 11:32:42.435526+00	2026-04-25 11:32:42.435526+00
7be30b2c-5b6b-4453-a019-2dc0e54ada1d	7374a609-3d8d-4f06-9da1-ec8549201fe7	131000	Accrued Interest Receivable	asset	BS	debit	t	2026-04-25 11:32:42.435526+00	2026-04-25 11:32:42.435526+00
b22bc641-0415-4fa3-9aa6-8d7f2788d5ae	7374a609-3d8d-4f06-9da1-ec8549201fe7	411000	Interest Income	revenue	PL	credit	t	2026-04-25 11:32:42.435526+00	2026-04-25 11:32:42.435526+00
1ce67967-fabb-4576-a953-30d55abc5e54	7374a609-3d8d-4f06-9da1-ec8549201fe7	113000	Restricted Cash	asset	BS	debit	t	2026-04-25 22:07:37.650269+00	2026-04-25 22:07:37.650269+00
b2fa5ed4-897a-444f-a81a-854289e781e7	7374a609-3d8d-4f06-9da1-ec8549201fe7	122000	Bond Investments	asset	BS	debit	t	2026-04-25 22:07:37.65122+00	2026-04-25 22:07:37.65122+00
fa3c876d-3358-494f-87ad-a22f1f7b1b26	7374a609-3d8d-4f06-9da1-ec8549201fe7	123000	Equity Investments	asset	BS	debit	t	2026-04-25 22:07:37.651594+00	2026-04-25 22:07:37.651594+00
5517ac6c-3a8d-494c-a93b-836739b4c9ad	7374a609-3d8d-4f06-9da1-ec8549201fe7	124000	Fund Investments	asset	BS	debit	t	2026-04-25 22:07:37.651985+00	2026-04-25 22:07:37.651985+00
d36c6ba2-a782-4c79-8b2d-6a20bb982c96	7374a609-3d8d-4f06-9da1-ec8549201fe7	132000	Fees Receivable	asset	BS	debit	t	2026-04-25 22:07:37.652829+00	2026-04-25 22:07:37.652829+00
54a17ebe-8506-4d8d-956b-a390003b282f	7374a609-3d8d-4f06-9da1-ec8549201fe7	133000	Derivative Assets	asset	BS	debit	t	2026-04-25 22:07:37.653186+00	2026-04-25 22:07:37.653186+00
3f54d28a-d01c-4f3d-80b5-c5fc35e8e3f0	7374a609-3d8d-4f06-9da1-ec8549201fe7	141000	Prepaid Expenses	asset	BS	debit	t	2026-04-25 22:07:37.653553+00	2026-04-25 22:07:37.653553+00
7c8b54d2-904e-45bc-8835-63b5321cfe72	7374a609-3d8d-4f06-9da1-ec8549201fe7	139000	Allowance for Credit Losses	contra_asset	BS	debit	t	2026-04-25 22:07:37.653879+00	2026-04-25 22:07:37.653879+00
55767e63-462d-476b-9f3c-1fbdf27f564c	7374a609-3d8d-4f06-9da1-ec8549201fe7	211000	Borrowings	liability	BS	credit	t	2026-04-25 22:07:37.654213+00	2026-04-25 22:07:37.654213+00
97f8fd27-e1b6-4bd1-8155-a4c70f361c58	7374a609-3d8d-4f06-9da1-ec8549201fe7	212000	Bonds Payable	liability	BS	credit	t	2026-04-25 22:07:37.654543+00	2026-04-25 22:07:37.654543+00
710c80bf-c0a7-432d-9b39-62fa12761c5f	7374a609-3d8d-4f06-9da1-ec8549201fe7	213000	Accrued Expenses	liability	BS	credit	t	2026-04-25 22:07:37.654868+00	2026-04-25 22:07:37.654868+00
5b190126-cc61-4224-bf20-8ab0f8fb38bf	7374a609-3d8d-4f06-9da1-ec8549201fe7	214000	Derivative Liabilities	liability	BS	credit	t	2026-04-25 22:07:37.655231+00	2026-04-25 22:07:37.655231+00
5f912a30-1f67-4fb3-8e97-adaf830bc603	7374a609-3d8d-4f06-9da1-ec8549201fe7	215000	Management Fees Payable	liability	BS	credit	t	2026-04-25 22:07:37.655556+00	2026-04-25 22:07:37.655556+00
2607caea-1d9e-4e20-aa43-f03e21fd94c1	7374a609-3d8d-4f06-9da1-ec8549201fe7	216000	Withholding Tax Payable	liability	BS	credit	t	2026-04-25 22:07:37.655877+00	2026-04-25 22:07:37.655877+00
f07fb4d2-d744-4493-872e-28e0fae74a84	7374a609-3d8d-4f06-9da1-ec8549201fe7	221000	Unearned Revenue	liability	BS	credit	t	2026-04-25 22:07:37.656201+00	2026-04-25 22:07:37.656201+00
5043cb1a-1da8-49d0-b5b4-c7660e7c567e	7374a609-3d8d-4f06-9da1-ec8549201fe7	311000	Paid-in Capital	equity	BS	credit	t	2026-04-25 22:07:37.656518+00	2026-04-25 22:07:37.656518+00
d0c2f6cf-bb8c-4099-9814-d35b0c9e632d	7374a609-3d8d-4f06-9da1-ec8549201fe7	312000	Retained Earnings	equity	BS	credit	t	2026-04-25 22:07:37.656842+00	2026-04-25 22:07:37.656842+00
6363d54c-24d9-4f24-b2de-f43e25793444	7374a609-3d8d-4f06-9da1-ec8549201fe7	313000	Other Comprehensive Income	equity	BS	credit	t	2026-04-25 22:07:37.65734+00	2026-04-25 22:07:37.65734+00
2e7f557f-4618-44d5-81ec-e57d0a7fb9cc	7374a609-3d8d-4f06-9da1-ec8549201fe7	412000	Fee Income	revenue	PL	credit	t	2026-04-25 22:07:37.65833+00	2026-04-25 22:07:37.65833+00
9340b0e5-176d-467d-8817-7078c53d2158	7374a609-3d8d-4f06-9da1-ec8549201fe7	413000	Dividend Income	revenue	PL	credit	t	2026-04-25 22:07:37.658838+00	2026-04-25 22:07:37.658838+00
7c5ca1c6-8d33-42e8-819a-ca38cbbc634f	7374a609-3d8d-4f06-9da1-ec8549201fe7	414000	Realized Gain on Disposal	revenue	PL	credit	t	2026-04-25 22:07:37.659208+00	2026-04-25 22:07:37.659208+00
c8794f25-a83b-4d27-971c-8e10b37ab3f1	7374a609-3d8d-4f06-9da1-ec8549201fe7	421000	Fair Value Gain Loss	revenue	PL	credit	t	2026-04-25 22:07:37.659571+00	2026-04-25 22:07:37.659571+00
e84268b4-4048-4527-b357-4e01715574b0	7374a609-3d8d-4f06-9da1-ec8549201fe7	431000	Foreign Exchange Gain Loss	revenue	PL	credit	t	2026-04-25 22:07:37.659946+00	2026-04-25 22:07:37.659946+00
613b1e04-9c5c-46e6-b34c-24e944e571c3	7374a609-3d8d-4f06-9da1-ec8549201fe7	511000	Interest Expense	expense	PL	debit	t	2026-04-25 22:07:37.660342+00	2026-04-25 22:07:37.660342+00
cd7f6fb0-0953-44dc-9262-056d869ff3f7	7374a609-3d8d-4f06-9da1-ec8549201fe7	512000	Management Fee Expense	expense	PL	debit	t	2026-04-25 22:07:37.660698+00	2026-04-25 22:07:37.660698+00
b0ad73d2-b06e-4110-a062-9da14eef1ba7	7374a609-3d8d-4f06-9da1-ec8549201fe7	513000	Impairment Loss	expense	PL	debit	t	2026-04-25 22:07:37.661026+00	2026-04-25 22:07:37.661026+00
6a4a7dd6-f69c-4402-8acf-6443d1f41942	7374a609-3d8d-4f06-9da1-ec8549201fe7	514000	Operating Expense	expense	PL	debit	t	2026-04-25 22:07:37.661364+00	2026-04-25 22:07:37.661364+00
cbb714a6-a8a7-493e-8847-8b2a205953a3	7374a609-3d8d-4f06-9da1-ec8549201fe7	515000	Custody Expense	expense	PL	debit	t	2026-04-25 22:07:37.661712+00	2026-04-25 22:07:37.661712+00
55110496-0c99-4c04-87c6-22ffbd49bccf	7374a609-3d8d-4f06-9da1-ec8549201fe7	516000	Professional Fee Expense	expense	PL	debit	t	2026-04-25 22:07:37.662067+00	2026-04-25 22:07:37.662067+00
d476bd7f-2862-45d0-9039-430275eabb21	7374a609-3d8d-4f06-9da1-ec8549201fe7	517000	Tax Expense	expense	PL	debit	t	2026-04-25 22:07:37.662588+00	2026-04-25 22:07:37.662588+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, tenant_id, actor_user_id, action_type, resource_type, resource_id, before_payload_json, after_payload_json, created_at) FROM stdin;
67bf2450-e3da-4497-a444-49dab247ba77	7374a609-3d8d-4f06-9da1-ec8549201fe7	\N	create_manual_journal	journal	8bb371df-cb63-4368-9b37-c0028caa767b	\N	{"journalNo": "JV-202601-000001", "lineCount": 2}	2026-04-25 11:32:42.445571+00
a1b5370d-bd9e-4934-a313-f5037432e2f5	7374a609-3d8d-4f06-9da1-ec8549201fe7	\N	post_accounting_event	event	c5f8bcf5-4fba-4d54-9559-6b0825030029	\N	{"eventType": "principal_repayment", "journalCount": 1}	2026-04-25 21:54:34.071098+00
c466f7fa-94b7-4927-ba18-0e71d9b63d10	7374a609-3d8d-4f06-9da1-ec8549201fe7	\N	post_accounting_event	event	6b3d48de-09a9-4024-8332-fc29224f3017	\N	{"eventType": "principal_repayment", "journalCount": 1}	2026-04-25 21:57:14.47249+00
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.books (id, tenant_id, entity_id, code, name, book_type, accounting_basis, status, created_at, updated_at) FROM stdin;
2c67507a-052b-4e1f-a163-a1a1f3425c4d	7374a609-3d8d-4f06-9da1-ec8549201fe7	93aa34ae-41a6-442e-855d-b77c800756ee	SPC_BOOK	SPC Book	primary	KGAAP_GENERAL	active	2026-04-25 11:32:42.434876+00	2026-04-25 11:32:42.434876+00
af0d5012-801d-4fa6-8afe-783ee5198d29	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	FUND_BOOK	Fund Book	primary	KGAAP_GENERAL	active	2026-04-25 11:32:42.435219+00	2026-04-25 11:32:42.435219+00
cb2b5c9d-9b10-44d9-ae4b-a13221f4159e	7374a609-3d8d-4f06-9da1-ec8549201fe7	dccfe7e6-42f6-4150-9b59-e915e48ac25a	FEEDER_BOOK	FEEDER_BOOK	primary	KGAAP_GENERAL	active	2026-04-25 22:07:37.616194+00	2026-04-25 22:07:37.616194+00
3897570d-176b-495b-95b8-3843aa43cf0a	7374a609-3d8d-4f06-9da1-ec8549201fe7	674b7e2b-3c90-4b18-8311-72209883b514	SPC2_BOOK	SPC2_BOOK	primary	KGAAP_GENERAL	active	2026-04-25 22:07:37.618241+00	2026-04-25 22:07:37.618241+00
1c0e69b4-dd7d-4cfe-a15b-3a2daf86a6b0	7374a609-3d8d-4f06-9da1-ec8549201fe7	57d82368-9b73-491a-9e57-d0eda21a24b3	SPC3_BOOK	SPC3_BOOK	primary	KGAAP_GENERAL	active	2026-04-25 22:07:37.619391+00	2026-04-25 22:07:37.619391+00
a22e3fde-3bea-426b-b890-98c06e7e7253	7374a609-3d8d-4f06-9da1-ec8549201fe7	3fc30f74-a336-458c-aa18-7498146729d5	HOLDCO_BOOK	HOLDCO_BOOK	primary	KGAAP_GENERAL	active	2026-04-25 22:07:37.621339+00	2026-04-25 22:07:37.621339+00
3e046ccd-08a7-4d28-a39c-f8cdc4b86140	7374a609-3d8d-4f06-9da1-ec8549201fe7	180d9e62-047c-4dbc-b807-65eae4e5c3af	SERVICER_BOOK	SERVICER_BOOK	primary	KGAAP_GENERAL	active	2026-04-25 22:07:37.623197+00	2026-04-25 22:07:37.623197+00
\.


--
-- Data for Name: close_adjustment_journals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.close_adjustment_journals (id, tenant_id, close_period_id, journal_id, reverse_on_date, reversal_journal_id, created_at) FROM stdin;
\.


--
-- Data for Name: close_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.close_periods (id, tenant_id, entity_id, book_id, period_type, period_start, period_end, status, closed_at, closed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contract_parties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_parties (id, tenant_id, contract_id, party_role, entity_id, external_party_name, created_at, updated_at) FROM stdin;
5b4e438f-06ab-483b-bbbc-c46c3a11e808	7374a609-3d8d-4f06-9da1-ec8549201fe7	8625c397-2c3f-4c93-b2bb-1b8b25cb98c0	lender	531820d6-f4f0-489d-a5c5-c6336d231a46	\N	2026-04-25 22:07:37.63996+00	2026-04-25 22:07:37.63996+00
19ba7823-4cf6-4186-a84f-10eaa9c931f8	7374a609-3d8d-4f06-9da1-ec8549201fe7	8625c397-2c3f-4c93-b2bb-1b8b25cb98c0	borrower	\N	Ocean Charter Operator Ltd	2026-04-25 22:07:37.64081+00	2026-04-25 22:07:37.64081+00
d6eb1948-3879-4454-80c7-f492a1f3786e	7374a609-3d8d-4f06-9da1-ec8549201fe7	fbcd9d88-6cd5-4c4f-8673-2b69c0098994	lender	674b7e2b-3c90-4b18-8311-72209883b514	\N	2026-04-25 22:07:37.642812+00	2026-04-25 22:07:37.642812+00
731d339c-4d4e-4080-9117-cf575690952e	7374a609-3d8d-4f06-9da1-ec8549201fe7	fbcd9d88-6cd5-4c4f-8673-2b69c0098994	borrower	\N	Pacific Tanker Holdings Ltd	2026-04-25 22:07:37.64338+00	2026-04-25 22:07:37.64338+00
6d198c31-98cd-445f-8478-92675fad4f3a	7374a609-3d8d-4f06-9da1-ec8549201fe7	5f79a2bf-211a-4093-b30d-45fad2a0228a	lender	57d82368-9b73-491a-9e57-d0eda21a24b3	\N	2026-04-25 22:07:37.644427+00	2026-04-25 22:07:37.644427+00
6f4fbd17-c2c1-4b16-97ec-790ac1c251f9	7374a609-3d8d-4f06-9da1-ec8549201fe7	5f79a2bf-211a-4093-b30d-45fad2a0228a	borrower	\N	BlueHarbor Operating Co	2026-04-25 22:07:37.644971+00	2026-04-25 22:07:37.644971+00
ccef3a41-5507-4a0e-ae80-d5ee5d30d222	7374a609-3d8d-4f06-9da1-ec8549201fe7	d3666748-e4b2-4469-ac93-0c9efe6968c3	borrower	\N	Eastern Port Authority	2026-04-25 22:07:37.645949+00	2026-04-25 22:07:37.645949+00
ab826eba-ba8b-4a9c-848b-c9e78f9aa256	7374a609-3d8d-4f06-9da1-ec8549201fe7	993d6bd1-e03e-4c34-859e-739a88ce78a5	borrower	\N	Meridian Shipping Finance	2026-04-25 22:07:37.64706+00	2026-04-25 22:07:37.64706+00
90f62792-2ae7-48c4-b036-84b93ea465c3	7374a609-3d8d-4f06-9da1-ec8549201fe7	fa23c866-81ad-4c35-bc2e-d81da01d7c97	borrower	\N	Global Derivatives Bank	2026-04-25 22:07:37.649107+00	2026-04-25 22:07:37.649107+00
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, tenant_id, product_id, contract_type, code, currency, effective_date, maturity_date, interest_rate_type, interest_rate, day_count_convention, version_no, status, metadata, created_at, updated_at) FROM stdin;
a6bf1465-5066-4ade-9b6b-fd5d23d23b2f	7374a609-3d8d-4f06-9da1-ec8549201fe7	57a96878-890b-4195-8899-63e6f7083aed	loan_agreement	CTR-LOAN-001	USD	2026-01-01	2028-12-31	fixed	0.08500000	ACT_360	1	active	\N	2026-04-25 11:32:42.437285+00	2026-04-25 11:32:42.437285+00
8625c397-2c3f-4c93-b2bb-1b8b25cb98c0	7374a609-3d8d-4f06-9da1-ec8549201fe7	c68080e7-52e9-4538-a7a5-ffd61a220540	loan_agreement	LOAN-AGREEMENT-A	USD	2026-01-01	2027-12-31	fixed	0.08000000	ACT_360	1	active	\N	2026-04-25 22:07:37.638771+00	2026-04-25 22:07:37.638771+00
f2512c47-87a1-48e7-abe7-5a090c0236c3	7374a609-3d8d-4f06-9da1-ec8549201fe7	a0e4eb56-edde-425c-bc31-07fcdde1d19b	equity_subscription	FUND-SPC-EQUITY-SUB	USD	2026-01-01	\N	\N	\N	\N	1	active	\N	2026-04-25 22:07:37.641378+00	2026-04-25 22:07:37.641378+00
fbcd9d88-6cd5-4c4f-8673-2b69c0098994	7374a609-3d8d-4f06-9da1-ec8549201fe7	c316b305-b160-45fd-b438-ca663e23cce2	loan_agreement	LOAN-AGREEMENT-B	USD	2026-01-01	2029-06-30	floating	0.06750000	ACT_360	1	active	\N	2026-04-25 22:07:37.641959+00	2026-04-25 22:07:37.641959+00
5f79a2bf-211a-4093-b30d-45fad2a0228a	7374a609-3d8d-4f06-9da1-ec8549201fe7	544a32ff-7ece-4ab8-bf2e-f36b7bfe47fc	loan_agreement	WORKING-CAP-LINE-01	USD	2026-01-01	2027-09-30	fixed	0.07250000	ACT_360	1	active	\N	2026-04-25 22:07:37.643798+00	2026-04-25 22:07:37.643798+00
d3666748-e4b2-4469-ac93-0c9efe6968c3	7374a609-3d8d-4f06-9da1-ec8549201fe7	c199ae0c-2516-4eb3-8552-98497581b30c	bond_investment	PORT-BOND-A-2028	USD	2026-01-01	2028-12-31	fixed	0.05900000	ACT_365	1	active	\N	2026-04-25 22:07:37.645346+00	2026-04-25 22:07:37.645346+00
993d6bd1-e03e-4c34-859e-739a88ce78a5	7374a609-3d8d-4f06-9da1-ec8549201fe7	3f27424e-d39d-4256-ba07-dd1c20993c37	bond_investment	TERM-NOTE-2028-A	USD	2026-01-01	2028-05-31	fixed	0.06100000	ACT_365	1	active	\N	2026-04-25 22:07:37.646308+00	2026-04-25 22:07:37.646308+00
0ea2055e-3046-448d-ab99-0c927bae7de2	7374a609-3d8d-4f06-9da1-ec8549201fe7	174b4fa8-f30d-41df-8e14-f64f823a0c56	beneficiary_subscription	FUND-UNIT-B-SUB	USD	2026-01-01	\N	\N	\N	\N	1	active	\N	2026-04-25 22:07:37.647392+00	2026-04-25 22:07:37.647392+00
4ffb6663-0ee0-4252-ba90-048054a90b98	7374a609-3d8d-4f06-9da1-ec8549201fe7	7b2bebb5-ea69-4648-9251-6ad556825652	equity_subscription	FUND-SPC2-EQUITY-SUB	USD	2026-01-01	\N	\N	\N	\N	1	active	\N	2026-04-25 22:07:37.647788+00	2026-04-25 22:07:37.647788+00
fa23c866-81ad-4c35-bc2e-d81da01d7c97	7374a609-3d8d-4f06-9da1-ec8549201fe7	095dc153-0c87-4f6e-b3e2-cc2babba5dfc	other	IRS-USD-001-MASTER	USD	2026-01-01	\N	\N	\N	\N	1	active	\N	2026-04-25 22:07:37.648218+00	2026-04-25 22:07:37.648218+00
\.


--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entities (id, tenant_id, code, name, entity_type, functional_currency, status, created_at, updated_at) FROM stdin;
93aa34ae-41a6-442e-855d-b77c800756ee	7374a609-3d8d-4f06-9da1-ec8549201fe7	SPC-001	Demo SPC	spc	USD	active	2026-04-25 11:32:42.434009+00	2026-04-25 11:32:42.434009+00
21ca9955-d6a9-43b3-b4ae-814af247889c	7374a609-3d8d-4f06-9da1-ec8549201fe7	OCEAN-FUND-I	Ocean Structured Fund I	fund	USD	active	2026-04-25 11:32:42.434566+00	2026-04-25 11:32:42.434566+00
20d28d18-50af-4006-b98e-2f5af5563da9	7374a609-3d8d-4f06-9da1-ec8549201fe7	BLUEHARBOR-AM	BlueHarbor Asset Management	asset_manager	USD	active	2026-04-25 22:07:37.600698+00	2026-04-25 22:07:37.600698+00
531820d6-f4f0-489d-a5c5-c6336d231a46	7374a609-3d8d-4f06-9da1-ec8549201fe7	OCEAN-SPC-001	Ocean Shipping SPC 001	spc	USD	active	2026-04-25 22:07:37.605033+00	2026-04-25 22:07:37.605033+00
674b7e2b-3c90-4b18-8311-72209883b514	7374a609-3d8d-4f06-9da1-ec8549201fe7	OCEAN-SPC-002	Ocean Shipping SPC 002	spc	USD	active	2026-04-25 22:07:37.606231+00	2026-04-25 22:07:37.606231+00
57d82368-9b73-491a-9e57-d0eda21a24b3	7374a609-3d8d-4f06-9da1-ec8549201fe7	OCEAN-SPC-003	Ocean Shipping SPC 003	spc	USD	active	2026-04-25 22:07:37.607764+00	2026-04-25 22:07:37.607764+00
dccfe7e6-42f6-4150-9b59-e915e48ac25a	7374a609-3d8d-4f06-9da1-ec8549201fe7	OCEAN-FEEDER-I	Ocean Feeder Fund I	fund	USD	active	2026-04-25 22:07:37.608593+00	2026-04-25 22:07:37.608593+00
3fc30f74-a336-458c-aa18-7498146729d5	7374a609-3d8d-4f06-9da1-ec8549201fe7	OCEAN-HOLDCO-001	Ocean HoldCo 001	corporate	USD	active	2026-04-25 22:07:37.609697+00	2026-04-25 22:07:37.609697+00
180d9e62-047c-4dbc-b807-65eae4e5c3af	7374a609-3d8d-4f06-9da1-ec8549201fe7	HARBOR-SERVICING	Harbor Loan Servicing Co	corporate	USD	active	2026-04-25 22:07:37.610759+00	2026-04-25 22:07:37.610759+00
f917ab5f-5d32-4b2c-8c98-e80b9a741566	7374a609-3d8d-4f06-9da1-ec8549201fe7	BLUEHARBOR-BROKER	BlueHarbor Securities	corporate	USD	active	2026-04-25 22:07:37.611737+00	2026-04-25 22:07:37.611737+00
\.


--
-- Data for Name: event_calculations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_calculations (id, tenant_id, event_id, calculation_type, input_payload_json, result_payload_json, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, tenant_id, entity_id, book_id, event_type, idempotency_key, status, trade_date, accounting_date, settlement_date, currency, amount, product_id, contract_id, counterparty_entity_id, investor_id, source_reference, payload_json, created_by, created_at, updated_at) FROM stdin;
c5f8bcf5-4fba-4d54-9559-6b0825030029	7374a609-3d8d-4f06-9da1-ec8549201fe7	93aa34ae-41a6-442e-855d-b77c800756ee	2c67507a-052b-4e1f-a163-a1a1f3425c4d	principal_repayment	WEB-649c0634-d159-49ab-b357-8ff51735976f	posted	2026-01-31	2026-01-31	\N	USD	42000.00	57a96878-890b-4195-8899-63e6f7083aed	a6bf1465-5066-4ade-9b6b-fd5d23d23b2f	\N	\N	WEB-649c0634-d159-49ab-b357-8ff51735976f	\N	\N	2026-04-25 21:54:34.052978+00	2026-04-25 21:54:34.052978+00
6b3d48de-09a9-4024-8332-fc29224f3017	7374a609-3d8d-4f06-9da1-ec8549201fe7	93aa34ae-41a6-442e-855d-b77c800756ee	2c67507a-052b-4e1f-a163-a1a1f3425c4d	principal_repayment	WEB-08701226-3541-472c-ab0b-aafee71cc6ba	posted	2026-01-31	2026-01-31	\N	USD	4000.00	57a96878-890b-4195-8899-63e6f7083aed	a6bf1465-5066-4ade-9b6b-fd5d23d23b2f	\N	\N	WEB-08701226-3541-472c-ab0b-aafee71cc6ba	\N	\N	2026-04-25 21:57:14.458812+00	2026-04-25 21:57:14.458812+00
8f76bce1-9838-446b-98ce-26dff0ede138	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	af0d5012-801d-4fa6-8afe-783ee5198d29	fund_subscription_cash_receipt	EVT-001-001	validated	2026-01-02	2026-01-02	2026-01-02	USD	6000000.00	\N	\N	\N	4dff8a8c-c018-4c2a-bbb8-852942785e7e	scenario-001-fund-subscription	{"amount": 6000000, "currency": "USD", "event_id": "EVT-001-001", "event_type": "fund_subscription_cash_receipt", "trade_date": "2026-01-02", "description": "Alpha Pension Fund subscription cash receipt", "investor_id": "INV-001", "accounting_date": "2026-01-02", "settlement_date": "2026-01-02"}	\N	2026-04-25 22:07:37.684766+00	2026-04-25 22:07:37.684766+00
abb8daa7-3b44-4551-9ce3-87ce7486799e	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	af0d5012-801d-4fa6-8afe-783ee5198d29	fund_subscription_cash_receipt	EVT-001-002	validated	2026-01-02	2026-01-02	2026-01-02	USD	4000000.00	\N	\N	\N	c7ee4836-722b-4bb9-a469-7bbbe740d946	scenario-001-fund-subscription	{"amount": 4000000, "currency": "USD", "event_id": "EVT-001-002", "event_type": "fund_subscription_cash_receipt", "trade_date": "2026-01-02", "description": "Beta Insurance subscription cash receipt", "investor_id": "INV-002", "accounting_date": "2026-01-02", "settlement_date": "2026-01-02"}	\N	2026-04-25 22:07:37.685484+00	2026-04-25 22:07:37.685484+00
09f36312-ff99-4919-ba9d-234698326fdf	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	af0d5012-801d-4fa6-8afe-783ee5198d29	equity_contribution_to_spc	EVT-002-001	validated	2026-01-03	2026-01-03	2026-01-03	USD	8000000.00	\N	f2512c47-87a1-48e7-abe7-5a090c0236c3	531820d6-f4f0-489d-a5c5-c6336d231a46	\N	scenario-002-fund-to-spc	{"amount": 8000000, "currency": "USD", "event_id": "EVT-002-001", "event_type": "equity_contribution_to_spc", "trade_date": "2026-01-03", "contract_id": "CTR-SPC-FUND-001", "description": "Fund contributes capital to SPC", "to_entity_id": "ENT-SPC-001", "from_entity_id": "ENT-FUND-001", "accounting_date": "2026-01-03", "settlement_date": "2026-01-03"}	\N	2026-04-25 22:07:37.690571+00	2026-04-25 22:07:37.690571+00
fdd06275-a28a-4cad-a4b8-0b373ebf7e5e	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	loan_origination	EVT-003-001	validated	2026-01-05	2026-01-05	2026-01-05	USD	7000000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	8625c397-2c3f-4c93-b2bb-1b8b25cb98c0	\N	\N	scenario-003-asset-acquisition	{"amount": 7000000, "currency": "USD", "event_id": "EVT-003-001", "event_type": "loan_origination", "product_id": "PROD-LOAN-001", "trade_date": "2026-01-05", "contract_id": "CTR-LOAN-001", "description": "SPC originates senior ship loan", "borrower_name": "Ocean Charter Operator Ltd", "accounting_date": "2026-01-05", "settlement_date": "2026-01-05"}	\N	2026-04-25 22:07:37.695847+00	2026-04-25 22:07:37.695847+00
6f9f4b2d-343a-4e6d-9374-5ba8873bf2e2	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	borrowing_drawdown	EVT-004-001	validated	2026-01-06	2026-01-06	2026-01-06	USD	2000000.00	\N	\N	\N	\N	scenario-004-borrowing-drawdown	{"amount": 2000000, "currency": "USD", "event_id": "EVT-004-001", "event_type": "borrowing_drawdown", "trade_date": "2026-01-06", "description": "SPC drawdown of senior borrowing facility", "lender_name": "Maritime Senior Lender", "accounting_date": "2026-01-06", "settlement_date": "2026-01-06"}	\N	2026-04-25 22:07:37.698859+00	2026-04-25 22:07:37.698859+00
42bd4e92-1cca-4120-8051-0647ab388af2	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	interest_accrual	EVT-005-001	validated	2026-01-31	2026-01-31	2026-01-31	USD	42000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	8625c397-2c3f-4c93-b2bb-1b8b25cb98c0	\N	\N	scenario-005-interest-accrual	{"amount": 42000, "currency": "USD", "event_id": "EVT-005-001", "event_type": "interest_accrual", "product_id": "PROD-LOAN-001", "trade_date": "2026-01-31", "contract_id": "CTR-LOAN-001", "accounting_date": "2026-01-31", "settlement_date": "2026-01-31"}	\N	2026-04-25 22:07:37.702144+00	2026-04-25 22:07:37.702144+00
50246e9e-57cd-4893-b2c3-9c94f69d9ef3	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	interest_cash_receipt	EVT-006-001	validated	2026-02-01	2026-02-01	2026-02-01	USD	42000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-006-interest-receipt	{"amount": 42000, "currency": "USD", "event_id": "EVT-006-001", "event_type": "interest_cash_receipt", "product_id": "PROD-LOAN-001", "trade_date": "2026-02-01", "accounting_date": "2026-02-01", "settlement_date": "2026-02-01"}	\N	2026-04-25 22:07:37.704977+00	2026-04-25 22:07:37.704977+00
a64e14be-e720-434e-ae8a-dba727c5cd5b	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	principal_repayment	EVT-007-001	validated	2026-02-15	2026-02-15	2026-02-15	USD	1000000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-007-principal-repayment	{"amount": 1000000, "currency": "USD", "event_id": "EVT-007-001", "event_type": "principal_repayment", "product_id": "PROD-LOAN-001", "trade_date": "2026-02-15", "accounting_date": "2026-02-15", "settlement_date": "2026-02-15"}	\N	2026-04-25 22:07:37.707635+00	2026-04-25 22:07:37.707635+00
f7d70beb-887d-49ad-81d6-738a6abea43c	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	fair_value_adjustment	EVT-008-001	validated	2026-02-28	2026-02-28	2026-02-28	USD	50000.00	a0e4eb56-edde-425c-bc31-07fcdde1d19b	\N	\N	\N	scenario-008-fair-value-adjustment	{"amount": 50000, "currency": "USD", "event_id": "EVT-008-001", "event_type": "fair_value_adjustment", "product_id": "PROD-EQUITY-001", "trade_date": "2026-02-28", "accounting_date": "2026-02-28", "settlement_date": "2026-02-28"}	\N	2026-04-25 22:07:37.710278+00	2026-04-25 22:07:37.710278+00
6182625c-7eec-40a7-a461-e354ac8738ad	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	impairment_recognition	EVT-009-001	validated	2026-02-28	2026-02-28	2026-02-28	USD	30000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-009-impairment	{"amount": 30000, "currency": "USD", "event_id": "EVT-009-001", "event_type": "impairment_recognition", "product_id": "PROD-LOAN-001", "trade_date": "2026-02-28", "accounting_date": "2026-02-28", "settlement_date": "2026-02-28"}	\N	2026-04-25 22:07:37.712413+00	2026-04-25 22:07:37.712413+00
a7efdf76-d082-4bf8-99d4-6e2808a3e713	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	fx_remeasurement	EVT-010-001	validated	2026-02-28	2026-02-28	2026-02-28	USD	21000000.00	\N	\N	\N	\N	scenario-010-foreign-exchange	{"amount": 21000000, "event_id": "EVT-010-001", "event_type": "fx_remeasurement", "trade_date": "2026-02-28", "to_currency": "KRW", "from_currency": "USD", "prior_fx_rate": 1365, "accounting_date": "2026-02-28", "current_fx_rate": 1372, "settlement_date": "2026-02-28", "usd_amount_basis": 3000000}	\N	2026-04-25 22:07:37.714662+00	2026-04-25 22:07:37.714662+00
cc17fc97-a71b-4e61-9524-cac7edc8e9e4	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	cash_waterfall_allocation	EVT-011-001	validated	2026-03-01	2026-03-01	2026-03-01	USD	0.00	\N	\N	\N	\N	scenario-011-cash-waterfall	{"currency": "USD", "event_id": "EVT-011-001", "event_type": "cash_waterfall_allocation", "trade_date": "2026-03-01", "accounting_date": "2026-03-01", "settlement_date": "2026-03-01", "gross_cash_inflow": 100000}	\N	2026-04-25 22:07:37.717529+00	2026-04-25 22:07:37.717529+00
\.


--
-- Data for Name: fund_investor_positions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fund_investor_positions (id, tenant_id, fund_entity_id, investor_id, commitment_amount, paid_in_amount, ownership_ratio, effective_from, effective_to, created_at, updated_at) FROM stdin;
9ac73c74-0133-4196-a8f1-419528f75e1c	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	4dff8a8c-c018-4c2a-bbb8-852942785e7e	0.00	0.00	0.60000000	2026-01-01	\N	2026-04-25 11:32:42.438933+00	2026-04-25 11:32:42.438933+00
812eef08-ef2e-4d03-966f-ee738e9c78d3	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	c7ee4836-722b-4bb9-a469-7bbbe740d946	0.00	0.00	0.40000000	2026-01-01	\N	2026-04-25 11:32:42.438933+00	2026-04-25 11:32:42.438933+00
bc23609f-df0a-4af1-8195-46fe57e20241	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	40b1b6b2-6077-4b13-bb4b-9860370f76a8	30000000.00	0.00	0.00000000	2026-01-01	\N	2026-04-25 22:07:37.679991+00	2026-04-25 22:07:37.679991+00
ccb85106-d3ab-44e9-b9ae-6fc0ef6b1235	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	56bcf049-6be3-4184-aea0-bbaaecbaed50	25000000.00	0.00	0.00000000	2026-01-01	\N	2026-04-25 22:07:37.6807+00	2026-04-25 22:07:37.6807+00
cc2b4bd1-1c67-4a1c-bca6-74fe48f5168e	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	cf44f30c-3cb9-4346-b7c7-9722f351b6a5	15000000.00	0.00	0.00000000	2026-01-01	\N	2026-04-25 22:07:37.681301+00	2026-04-25 22:07:37.681301+00
ecb5be04-6fba-41b0-b9d4-3fcc325a1a41	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	dd2b05f6-c9b9-4fda-9fe5-7e2be4ed9fe1	10000000.00	0.00	0.00000000	2026-01-01	\N	2026-04-25 22:07:37.682043+00	2026-04-25 22:07:37.682043+00
\.


--
-- Data for Name: fx_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fx_rates (id, tenant_id, rate_date, from_currency, to_currency, rate, source_name, created_at, updated_at) FROM stdin;
2175594c-8a1e-46ab-bc4a-5d281e321ada	7374a609-3d8d-4f06-9da1-ec8549201fe7	2026-01-02 00:00:00	USD	KRW	1350.00000000	fixture	2026-04-25 22:07:37.677456+00	2026-04-25 22:07:37.677456+00
1948a92e-c741-4ef5-9077-83134e5d8ae7	7374a609-3d8d-4f06-9da1-ec8549201fe7	2026-01-31 00:00:00	USD	KRW	1365.00000000	fixture	2026-04-25 22:07:37.678048+00	2026-04-25 22:07:37.678048+00
d914a188-f89f-47a0-adeb-879bbb05a9b3	7374a609-3d8d-4f06-9da1-ec8549201fe7	2026-02-28 00:00:00	USD	KRW	1372.00000000	fixture	2026-04-25 22:07:37.678345+00	2026-04-25 22:07:37.678345+00
18145e1d-7ed8-404b-93ea-4084493685f4	7374a609-3d8d-4f06-9da1-ec8549201fe7	2026-03-31 00:00:00	USD	KRW	1380.00000000	fixture	2026-04-25 22:07:37.678647+00	2026-04-25 22:07:37.678647+00
\.


--
-- Data for Name: investor_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investor_allocations (id, tenant_id, fund_entity_id, period_start, period_end, allocation_method, source_amount_type, source_amount, investor_id, ownership_ratio, allocated_profit_amount, cash_distribution_amount, created_at, updated_at) FROM stdin;
3d89880a-bac0-4012-9425-9ee549198da9	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	2026-01-01	2026-01-31	pro_rata	profit	42000.00	4dff8a8c-c018-4c2a-bbb8-852942785e7e	0.60000000	25200.00	0.00	2026-04-25 22:07:37.720793+00	2026-04-25 22:07:37.720793+00
bb5a3f41-071c-417e-bb28-51bbe006ec81	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	2026-01-01	2026-01-31	pro_rata	profit	42000.00	c7ee4836-722b-4bb9-a469-7bbbe740d946	0.40000000	16800.00	0.00	2026-04-25 22:07:37.721612+00	2026-04-25 22:07:37.721612+00
\.


--
-- Data for Name: investors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investors (id, tenant_id, code, name, investor_type, default_currency, status, created_at, updated_at) FROM stdin;
4dff8a8c-c018-4c2a-bbb8-852942785e7e	7374a609-3d8d-4f06-9da1-ec8549201fe7	LP-ALPHA	Alpha Pension Fund	institutional	USD	active	2026-04-25 11:32:42.438277+00	2026-04-25 11:32:42.438277+00
c7ee4836-722b-4bb9-a469-7bbbe740d946	7374a609-3d8d-4f06-9da1-ec8549201fe7	LP-BETA	Beta Insurance	institutional	USD	active	2026-04-25 11:32:42.438277+00	2026-04-25 11:32:42.438277+00
40b1b6b2-6077-4b13-bb4b-9860370f76a8	7374a609-3d8d-4f06-9da1-ec8549201fe7	LP-GAMMA	Gamma Sovereign Capital	institutional	USD	active	2026-04-25 22:07:37.627454+00	2026-04-25 22:07:37.627454+00
56bcf049-6be3-4184-aea0-bbaaecbaed50	7374a609-3d8d-4f06-9da1-ec8549201fe7	LP-DELTA	Delta Mutual Life	institutional	USD	active	2026-04-25 22:07:37.629103+00	2026-04-25 22:07:37.629103+00
cf44f30c-3cb9-4346-b7c7-9722f351b6a5	7374a609-3d8d-4f06-9da1-ec8549201fe7	LP-EPSILON	Epsilon Family Office	institutional	USD	active	2026-04-25 22:07:37.630533+00	2026-04-25 22:07:37.630533+00
dd2b05f6-c9b9-4fda-9fe5-7e2be4ed9fe1	7374a609-3d8d-4f06-9da1-ec8549201fe7	LP-ZETA	Zeta Reinsurance	institutional	USD	active	2026-04-25 22:07:37.631646+00	2026-04-25 22:07:37.631646+00
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_lines (id, tenant_id, journal_id, line_no, account_id, debit_amount, credit_amount, currency, amount_scale, fx_rate, amount_in_functional_currency, product_id, contract_id, counterparty_entity_id, investor_id, description, created_at) FROM stdin;
3dbde42a-bc4b-4bc9-ac43-c141097f046f	7374a609-3d8d-4f06-9da1-ec8549201fe7	8bb371df-cb63-4368-9b37-c0028caa767b	1	7be30b2c-5b6b-4453-a019-2dc0e54ada1d	100.00	0.00	USD	2	\N	100.00	\N	\N	\N	\N	\N	2026-04-25 11:32:42.445571+00
42530272-8f62-4519-9f89-c876ccc749b1	7374a609-3d8d-4f06-9da1-ec8549201fe7	8bb371df-cb63-4368-9b37-c0028caa767b	2	b22bc641-0415-4fa3-9aa6-8d7f2788d5ae	0.00	100.00	USD	2	\N	100.00	\N	\N	\N	\N	\N	2026-04-25 11:32:42.445571+00
f2fc2658-104f-4fca-9f19-611d9e4897b4	7374a609-3d8d-4f06-9da1-ec8549201fe7	f717ca5c-b065-41b3-909b-38cf3f31087b	1	91c0c465-aa3f-4846-b2fb-4a543588158c	42000.00	0.00	USD	2	\N	42000.00	57a96878-890b-4195-8899-63e6f7083aed	\N	\N	\N	\N	2026-04-25 21:54:34.052978+00
ea2af060-88f5-442e-892d-24e866922e25	7374a609-3d8d-4f06-9da1-ec8549201fe7	f717ca5c-b065-41b3-909b-38cf3f31087b	2	c249b00e-14dd-4906-a52c-34ea61cd5ed3	0.00	42000.00	USD	2	\N	42000.00	57a96878-890b-4195-8899-63e6f7083aed	\N	\N	\N	\N	2026-04-25 21:54:34.052978+00
fbc7ddb8-4739-471e-9fdb-14e3f5e2bffa	7374a609-3d8d-4f06-9da1-ec8549201fe7	b9cb4e77-ca43-4aeb-a031-88081364a029	1	91c0c465-aa3f-4846-b2fb-4a543588158c	4000.00	0.00	USD	2	\N	4000.00	57a96878-890b-4195-8899-63e6f7083aed	\N	\N	\N	\N	2026-04-25 21:57:14.458812+00
a0d2ef66-9c6d-473f-a0e4-4082c18a3dfb	7374a609-3d8d-4f06-9da1-ec8549201fe7	b9cb4e77-ca43-4aeb-a031-88081364a029	2	c249b00e-14dd-4906-a52c-34ea61cd5ed3	0.00	4000.00	USD	2	\N	4000.00	57a96878-890b-4195-8899-63e6f7083aed	\N	\N	\N	\N	2026-04-25 21:57:14.458812+00
ed6763e7-2e60-4d17-aec5-ddf860360c73	7374a609-3d8d-4f06-9da1-ec8549201fe7	15d29532-a6a7-4c81-8254-1bccbca62ad2	1	91c0c465-aa3f-4846-b2fb-4a543588158c	6000000.00	0.00	USD	2	\N	6000000.00	\N	\N	\N	4dff8a8c-c018-4c2a-bbb8-852942785e7e	scenario-001-fund-subscription	2026-04-25 22:07:37.686834+00
bddd5aeb-0a9a-4d96-878a-ed5505bb034e	7374a609-3d8d-4f06-9da1-ec8549201fe7	15d29532-a6a7-4c81-8254-1bccbca62ad2	2	5043cb1a-1da8-49d0-b5b4-c7660e7c567e	0.00	6000000.00	USD	2	\N	6000000.00	\N	\N	\N	4dff8a8c-c018-4c2a-bbb8-852942785e7e	scenario-001-fund-subscription	2026-04-25 22:07:37.687413+00
39eeebc9-9ced-4666-88a6-0090d6f8a996	7374a609-3d8d-4f06-9da1-ec8549201fe7	484c671b-76d4-4fdc-88eb-f59f2cfdf23b	1	91c0c465-aa3f-4846-b2fb-4a543588158c	4000000.00	0.00	USD	2	\N	4000000.00	\N	\N	\N	c7ee4836-722b-4bb9-a469-7bbbe740d946	scenario-001-fund-subscription	2026-04-25 22:07:37.688254+00
2b99ef70-29d3-4dc1-99a3-cbe1b8804c59	7374a609-3d8d-4f06-9da1-ec8549201fe7	484c671b-76d4-4fdc-88eb-f59f2cfdf23b	2	5043cb1a-1da8-49d0-b5b4-c7660e7c567e	0.00	4000000.00	USD	2	\N	4000000.00	\N	\N	\N	c7ee4836-722b-4bb9-a469-7bbbe740d946	scenario-001-fund-subscription	2026-04-25 22:07:37.68866+00
73d7912a-19e3-48ef-8dfe-d0080c99b33e	7374a609-3d8d-4f06-9da1-ec8549201fe7	083fea08-e198-4f5d-8ba0-ff2c7cd9240b	1	fa3c876d-3358-494f-87ad-a22f1f7b1b26	8000000.00	0.00	USD	2	\N	8000000.00	\N	\N	531820d6-f4f0-489d-a5c5-c6336d231a46	\N	scenario-002-fund-to-spc	2026-04-25 22:07:37.692363+00
fa151c1a-4e5e-4106-8884-b26d57e8d48a	7374a609-3d8d-4f06-9da1-ec8549201fe7	083fea08-e198-4f5d-8ba0-ff2c7cd9240b	2	91c0c465-aa3f-4846-b2fb-4a543588158c	0.00	8000000.00	USD	2	\N	8000000.00	\N	\N	531820d6-f4f0-489d-a5c5-c6336d231a46	\N	scenario-002-fund-to-spc	2026-04-25 22:07:37.692909+00
fe825650-fcfb-4c5f-8d69-718fd7ef993d	7374a609-3d8d-4f06-9da1-ec8549201fe7	271ac634-daf0-4adb-89e6-db8b56ce191e	1	91c0c465-aa3f-4846-b2fb-4a543588158c	8000000.00	0.00	USD	2	\N	8000000.00	\N	\N	21ca9955-d6a9-43b3-b4ae-814af247889c	\N	scenario-002-fund-to-spc	2026-04-25 22:07:37.693769+00
3da3dd2a-0d41-415a-8e41-621c0616393e	7374a609-3d8d-4f06-9da1-ec8549201fe7	271ac634-daf0-4adb-89e6-db8b56ce191e	2	5043cb1a-1da8-49d0-b5b4-c7660e7c567e	0.00	8000000.00	USD	2	\N	8000000.00	\N	\N	21ca9955-d6a9-43b3-b4ae-814af247889c	\N	scenario-002-fund-to-spc	2026-04-25 22:07:37.694147+00
19454f2f-91c6-4632-89f1-7f32268aa0af	7374a609-3d8d-4f06-9da1-ec8549201fe7	0c524efc-2231-417e-9fa2-5bd889c707a9	1	c249b00e-14dd-4906-a52c-34ea61cd5ed3	7000000.00	0.00	USD	2	\N	7000000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-003-asset-acquisition	2026-04-25 22:07:37.696945+00
1c2ac640-c37e-45ec-9341-7200c707e621	7374a609-3d8d-4f06-9da1-ec8549201fe7	0c524efc-2231-417e-9fa2-5bd889c707a9	2	91c0c465-aa3f-4846-b2fb-4a543588158c	0.00	7000000.00	USD	2	\N	7000000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-003-asset-acquisition	2026-04-25 22:07:37.697408+00
8b9da12a-8e0d-483f-89f6-40241e1b1f51	7374a609-3d8d-4f06-9da1-ec8549201fe7	5292d0f9-9b4f-4ce5-bd00-fdd3bc0b7d4e	1	91c0c465-aa3f-4846-b2fb-4a543588158c	2000000.00	0.00	USD	2	\N	2000000.00	\N	\N	\N	\N	scenario-004-borrowing-drawdown	2026-04-25 22:07:37.700365+00
a2057093-e489-49a1-8663-63f7e3b96400	7374a609-3d8d-4f06-9da1-ec8549201fe7	5292d0f9-9b4f-4ce5-bd00-fdd3bc0b7d4e	2	55767e63-462d-476b-9f3c-1fbdf27f564c	0.00	2000000.00	USD	2	\N	2000000.00	\N	\N	\N	\N	scenario-004-borrowing-drawdown	2026-04-25 22:07:37.700813+00
b9b460f6-0140-4bbb-b93c-9ad22b87c3ef	7374a609-3d8d-4f06-9da1-ec8549201fe7	ae88e115-e24f-4567-adc9-b561b213415f	1	7be30b2c-5b6b-4453-a019-2dc0e54ada1d	42000.00	0.00	USD	2	\N	42000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-005-interest-accrual	2026-04-25 22:07:37.703119+00
02e6050a-70d9-4b5f-be15-7b8af881bb95	7374a609-3d8d-4f06-9da1-ec8549201fe7	ae88e115-e24f-4567-adc9-b561b213415f	2	b22bc641-0415-4fa3-9aa6-8d7f2788d5ae	0.00	42000.00	USD	2	\N	42000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-005-interest-accrual	2026-04-25 22:07:37.703524+00
b5189e92-c421-4b78-9f73-4b3a0ce68dae	7374a609-3d8d-4f06-9da1-ec8549201fe7	82ce8e51-7ae4-47e9-aebc-15c6cd29220b	1	91c0c465-aa3f-4846-b2fb-4a543588158c	42000.00	0.00	USD	2	\N	42000.00	\N	\N	\N	\N	scenario-006-interest-receipt	2026-04-25 22:07:37.705835+00
b2c04e3e-a6ec-49fc-9e18-261c6360402f	7374a609-3d8d-4f06-9da1-ec8549201fe7	82ce8e51-7ae4-47e9-aebc-15c6cd29220b	2	7be30b2c-5b6b-4453-a019-2dc0e54ada1d	0.00	42000.00	USD	2	\N	42000.00	\N	\N	\N	\N	scenario-006-interest-receipt	2026-04-25 22:07:37.706206+00
297b269f-92ef-4070-806b-97373a0e3f59	7374a609-3d8d-4f06-9da1-ec8549201fe7	f86f24a4-0604-4479-9fea-c908a4099973	1	91c0c465-aa3f-4846-b2fb-4a543588158c	1000000.00	0.00	USD	2	\N	1000000.00	\N	\N	\N	\N	scenario-007-principal-repayment	2026-04-25 22:07:37.70886+00
0a8a8f09-df4e-4857-a594-f8484e6b0d0b	7374a609-3d8d-4f06-9da1-ec8549201fe7	f86f24a4-0604-4479-9fea-c908a4099973	2	c249b00e-14dd-4906-a52c-34ea61cd5ed3	0.00	1000000.00	USD	2	\N	1000000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-007-principal-repayment	2026-04-25 22:07:37.709271+00
05b785af-932e-4d8a-9997-e696ea15713c	7374a609-3d8d-4f06-9da1-ec8549201fe7	28a58cfe-b5e8-4c98-ba44-2a8e90c54e1e	1	fa3c876d-3358-494f-87ad-a22f1f7b1b26	50000.00	0.00	USD	2	\N	50000.00	\N	\N	\N	\N	scenario-008-fair-value-adjustment	2026-04-25 22:07:37.711097+00
a562bd00-8930-41e9-a289-4d5b60e0e115	7374a609-3d8d-4f06-9da1-ec8549201fe7	28a58cfe-b5e8-4c98-ba44-2a8e90c54e1e	2	c8794f25-a83b-4d27-971c-8e10b37ab3f1	0.00	50000.00	USD	2	\N	50000.00	\N	\N	\N	\N	scenario-008-fair-value-adjustment	2026-04-25 22:07:37.711454+00
e22091be-4156-4e5d-8b99-4e69def84b07	7374a609-3d8d-4f06-9da1-ec8549201fe7	09f8bfae-0355-4dc4-8a9d-b12ca34de0d4	1	b0ad73d2-b06e-4110-a062-9da14eef1ba7	30000.00	0.00	USD	2	\N	30000.00	\N	\N	\N	\N	scenario-009-impairment	2026-04-25 22:07:37.713198+00
5403b47f-b97d-4a8d-b303-d5739e957f72	7374a609-3d8d-4f06-9da1-ec8549201fe7	09f8bfae-0355-4dc4-8a9d-b12ca34de0d4	2	7c8b54d2-904e-45bc-8835-63b5321cfe72	0.00	30000.00	USD	2	\N	30000.00	c68080e7-52e9-4538-a7a5-ffd61a220540	\N	\N	\N	scenario-009-impairment	2026-04-25 22:07:37.713764+00
07799418-6f03-4a7b-8715-9d7d155e2457	7374a609-3d8d-4f06-9da1-ec8549201fe7	0bfe87b4-869f-40bd-8780-4192e55b197b	1	91c0c465-aa3f-4846-b2fb-4a543588158c	21000000.00	0.00	KRW	0	\N	21000000.00	\N	\N	\N	\N	scenario-010-foreign-exchange	2026-04-25 22:07:37.715479+00
3b3a04d9-33e7-4c2a-9a35-7942b032f007	7374a609-3d8d-4f06-9da1-ec8549201fe7	0bfe87b4-869f-40bd-8780-4192e55b197b	2	e84268b4-4048-4527-b357-4e01715574b0	0.00	21000000.00	KRW	0	\N	21000000.00	\N	\N	\N	\N	scenario-010-foreign-exchange	2026-04-25 22:07:37.716157+00
0e438ecb-6c5e-4c83-ab2e-c7e70ece3acb	7374a609-3d8d-4f06-9da1-ec8549201fe7	fb9c8f7d-0581-4654-9b89-195e052ed53c	1	91c0c465-aa3f-4846-b2fb-4a543588158c	100000.00	0.00	USD	2	\N	100000.00	\N	\N	\N	\N	scenario-011-cash-waterfall	2026-04-25 22:07:37.718426+00
adfb2092-2b1c-46f9-bd40-284f0b88e98a	7374a609-3d8d-4f06-9da1-ec8549201fe7	fb9c8f7d-0581-4654-9b89-195e052ed53c	2	2e7f557f-4618-44d5-81ec-e57d0a7fb9cc	0.00	100000.00	USD	2	\N	100000.00	\N	\N	\N	\N	scenario-011-cash-waterfall	2026-04-25 22:07:37.718944+00
\.


--
-- Data for Name: journals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journals (id, tenant_id, entity_id, book_id, source_event_id, journal_no, journal_type, accounting_date, posting_status, description, created_by, approved_by, posted_at, created_at, updated_at) FROM stdin;
8bb371df-cb63-4368-9b37-c0028caa767b	7374a609-3d8d-4f06-9da1-ec8549201fe7	93aa34ae-41a6-442e-855d-b77c800756ee	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JV-202601-000001	manual	2026-01-31	posted	Manual adjustment	\N	\N	2026-04-25 11:32:42.447+00	2026-04-25 11:32:42.445571+00	2026-04-25 11:32:42.445571+00
f717ca5c-b065-41b3-909b-38cf3f31087b	7374a609-3d8d-4f06-9da1-ec8549201fe7	93aa34ae-41a6-442e-855d-b77c800756ee	2c67507a-052b-4e1f-a163-a1a1f3425c4d	c5f8bcf5-4fba-4d54-9559-6b0825030029	JV-202601-000002	auto	2026-01-31	posted	Principal repayment	\N	\N	2026-04-25 21:54:34.065+00	2026-04-25 21:54:34.052978+00	2026-04-25 21:54:34.052978+00
b9cb4e77-ca43-4aeb-a031-88081364a029	7374a609-3d8d-4f06-9da1-ec8549201fe7	93aa34ae-41a6-442e-855d-b77c800756ee	2c67507a-052b-4e1f-a163-a1a1f3425c4d	6b3d48de-09a9-4024-8332-fc29224f3017	JV-202601-000003	auto	2026-01-31	posted	Principal repayment	\N	\N	2026-04-25 21:57:14.466+00	2026-04-25 21:57:14.458812+00	2026-04-25 21:57:14.458812+00
15d29532-a6a7-4c81-8254-1bccbca62ad2	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	af0d5012-801d-4fa6-8afe-783ee5198d29	\N	JNL-001-001	fixture_expected	2026-01-02	posted	Investor subscription into fund	\N	\N	\N	2026-04-25 22:07:37.686257+00	2026-04-25 22:07:37.686257+00
484c671b-76d4-4fdc-88eb-f59f2cfdf23b	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	af0d5012-801d-4fa6-8afe-783ee5198d29	\N	JNL-001-002	fixture_expected	2026-01-02	posted	Investor subscription into fund	\N	\N	\N	2026-04-25 22:07:37.687845+00	2026-04-25 22:07:37.687845+00
083fea08-e198-4f5d-8ba0-ff2c7cd9240b	7374a609-3d8d-4f06-9da1-ec8549201fe7	21ca9955-d6a9-43b3-b4ae-814af247889c	af0d5012-801d-4fa6-8afe-783ee5198d29	\N	JNL-002-001-FUND	fixture_expected	2026-01-03	posted	Fund capital contribution into SPC	\N	\N	\N	2026-04-25 22:07:37.691539+00	2026-04-25 22:07:37.691539+00
271ac634-daf0-4adb-89e6-db8b56ce191e	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-002-002-SPC	fixture_expected	2026-01-03	posted	Fund capital contribution into SPC	\N	\N	\N	2026-04-25 22:07:37.69335+00	2026-04-25 22:07:37.69335+00
0c524efc-2231-417e-9fa2-5bd889c707a9	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-003-001	fixture_expected	2026-01-05	posted	SPC loan receivable acquisition	\N	\N	\N	2026-04-25 22:07:37.696403+00	2026-04-25 22:07:37.696403+00
5292d0f9-9b4f-4ce5-bd00-fdd3bc0b7d4e	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-004-001	fixture_expected	2026-01-06	posted	SPC borrowing drawdown	\N	\N	\N	2026-04-25 22:07:37.699703+00	2026-04-25 22:07:37.699703+00
ae88e115-e24f-4567-adc9-b561b213415f	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-005-001	fixture_expected	2026-01-31	posted	Month-end interest accrual	\N	\N	\N	2026-04-25 22:07:37.702598+00	2026-04-25 22:07:37.702598+00
82ce8e51-7ae4-47e9-aebc-15c6cd29220b	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-006-001	fixture_expected	2026-02-01	posted	Interest cash receipt	\N	\N	\N	2026-04-25 22:07:37.705411+00	2026-04-25 22:07:37.705411+00
f86f24a4-0604-4479-9fea-c908a4099973	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-007-001	fixture_expected	2026-02-15	posted	Partial principal repayment	\N	\N	\N	2026-04-25 22:07:37.708359+00	2026-04-25 22:07:37.708359+00
28a58cfe-b5e8-4c98-ba44-2a8e90c54e1e	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-008-001	fixture_expected	2026-02-28	posted	Fair value adjustment	\N	\N	\N	2026-04-25 22:07:37.710704+00	2026-04-25 22:07:37.710704+00
09f8bfae-0355-4dc4-8a9d-b12ca34de0d4	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-009-001	fixture_expected	2026-02-28	posted	Impairment recognition	\N	\N	\N	2026-04-25 22:07:37.712821+00	2026-04-25 22:07:37.712821+00
0bfe87b4-869f-40bd-8780-4192e55b197b	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-010-001	fixture_expected	2026-02-28	posted	Foreign exchange remeasurement	\N	\N	\N	2026-04-25 22:07:37.715075+00	2026-04-25 22:07:37.715075+00
fb9c8f7d-0581-4654-9b89-195e052ed53c	7374a609-3d8d-4f06-9da1-ec8549201fe7	531820d6-f4f0-489d-a5c5-c6336d231a46	2c67507a-052b-4e1f-a163-a1a1f3425c4d	\N	JNL-011-001	fixture_expected	2026-03-01	posted	Cash waterfall allocation	\N	\N	\N	2026-04-25 22:07:37.717971+00	2026-04-25 22:07:37.717971+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, tenant_id, code, name, product_type, currency, status, created_at, updated_at) FROM stdin;
57a96878-890b-4195-8899-63e6f7083aed	7374a609-3d8d-4f06-9da1-ec8549201fe7	LOAN-001	Demo Loan	loan_receivable	USD	active	2026-04-25 11:32:42.436744+00	2026-04-25 11:32:42.436744+00
c68080e7-52e9-4538-a7a5-ffd61a220540	7374a609-3d8d-4f06-9da1-ec8549201fe7	SHIP-LOAN-A	Senior Ship Loan A	loan_receivable	USD	active	2026-04-25 22:07:37.632802+00	2026-04-25 22:07:37.632802+00
d72f6f9a-b37f-4003-84f4-cb24f5cb6c84	7374a609-3d8d-4f06-9da1-ec8549201fe7	SHIP-BOND-A	Shipping Bond A	bond	USD	active	2026-04-25 22:07:37.634032+00	2026-04-25 22:07:37.634032+00
029bba19-93ce-43f1-b29a-009cdcf44db8	7374a609-3d8d-4f06-9da1-ec8549201fe7	FUND-UNIT-A	Fund Beneficiary Unit A	beneficiary_certificate	USD	active	2026-04-25 22:07:37.634515+00	2026-04-25 22:07:37.634515+00
a0e4eb56-edde-425c-bc31-07fcdde1d19b	7374a609-3d8d-4f06-9da1-ec8549201fe7	SPC-EQUITY-A	SPC Equity A	equity	USD	active	2026-04-25 22:07:37.634938+00	2026-04-25 22:07:37.634938+00
c316b305-b160-45fd-b438-ca663e23cce2	7374a609-3d8d-4f06-9da1-ec8549201fe7	SHIP-LOAN-B	Senior Ship Loan B	loan_receivable	USD	active	2026-04-25 22:07:37.635398+00	2026-04-25 22:07:37.635398+00
544a32ff-7ece-4ab8-bf2e-f36b7bfe47fc	7374a609-3d8d-4f06-9da1-ec8549201fe7	WORKING-CAP-LOAN	Working Capital Loan	loan_receivable	USD	active	2026-04-25 22:07:37.635773+00	2026-04-25 22:07:37.635773+00
c199ae0c-2516-4eb3-8552-98497581b30c	7374a609-3d8d-4f06-9da1-ec8549201fe7	PORT-BOND-A	Port Infrastructure Bond A	bond	USD	active	2026-04-25 22:07:37.636202+00	2026-04-25 22:07:37.636202+00
3f27424e-d39d-4256-ba07-dd1c20993c37	7374a609-3d8d-4f06-9da1-ec8549201fe7	TERM-NOTE-2028	Term Note 2028	bond	USD	active	2026-04-25 22:07:37.636622+00	2026-04-25 22:07:37.636622+00
174b4fa8-f30d-41df-8e14-f64f823a0c56	7374a609-3d8d-4f06-9da1-ec8549201fe7	FUND-UNIT-B	Fund Beneficiary Unit B	beneficiary_certificate	USD	active	2026-04-25 22:07:37.637154+00	2026-04-25 22:07:37.637154+00
7b2bebb5-ea69-4648-9251-6ad556825652	7374a609-3d8d-4f06-9da1-ec8549201fe7	SPC-EQUITY-B	SPC Equity B	equity	USD	active	2026-04-25 22:07:37.637542+00	2026-04-25 22:07:37.637542+00
095dc153-0c87-4f6e-b3e2-cc2babba5dfc	7374a609-3d8d-4f06-9da1-ec8549201fe7	IRS-USD-001	USD Fixed-Floating IRS	derivative	USD	active	2026-04-25 22:07:37.637926+00	2026-04-25 22:07:37.637926+00
\.


--
-- Data for Name: statement_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.statement_mappings (id, tenant_id, account_id, statement_type, line_code, line_name, display_order, created_at, updated_at) FROM stdin;
4c31108b-8fea-47c4-9f2b-37d594170e99	7374a609-3d8d-4f06-9da1-ec8549201fe7	91c0c465-aa3f-4846-b2fb-4a543588158c	BS	CASH	Cash	10	2026-04-25 11:32:42.436175+00	2026-04-25 11:32:42.436175+00
988defad-cd38-488c-ad73-57f137b405be	7374a609-3d8d-4f06-9da1-ec8549201fe7	c249b00e-14dd-4906-a52c-34ea61cd5ed3	BS	LOAN_RECEIVABLE	Loan Receivable	20	2026-04-25 11:32:42.436175+00	2026-04-25 11:32:42.436175+00
94e63d53-429d-4adb-8a8f-e88ee55c91e8	7374a609-3d8d-4f06-9da1-ec8549201fe7	7be30b2c-5b6b-4453-a019-2dc0e54ada1d	BS	ACCRUED_INTEREST	Accrued Interest Receivable	30	2026-04-25 11:32:42.436175+00	2026-04-25 11:32:42.436175+00
87836300-e269-4160-8c92-ff2e00023f20	7374a609-3d8d-4f06-9da1-ec8549201fe7	b22bc641-0415-4fa3-9aa6-8d7f2788d5ae	PL	INTEREST_INCOME	Interest Income	10	2026-04-25 11:32:42.436175+00	2026-04-25 11:32:42.436175+00
5d336620-b6da-4e76-bf73-cf87ea633e01	7374a609-3d8d-4f06-9da1-ec8549201fe7	91c0c465-aa3f-4846-b2fb-4a543588158c	CF	OPERATING_CASH	Operating Cash Flow	10	2026-04-25 11:32:42.436175+00	2026-04-25 11:32:42.436175+00
e6e08018-e796-4b7b-8435-ab58f158c091	7374a609-3d8d-4f06-9da1-ec8549201fe7	91c0c465-aa3f-4846-b2fb-4a543588158c	BS	CASH_AND_EQUIVALENTS	Cash and Cash Equivalents	10	2026-04-25 22:07:37.662953+00	2026-04-25 22:07:37.662953+00
6bf3b7f4-12d6-4bc8-bf8c-08e46e5e1622	7374a609-3d8d-4f06-9da1-ec8549201fe7	1ce67967-fabb-4576-a953-30d55abc5e54	BS	CASH_AND_EQUIVALENTS	Cash and Cash Equivalents	10	2026-04-25 22:07:37.66348+00	2026-04-25 22:07:37.66348+00
442da5a5-153d-4219-ab5d-df895648496e	7374a609-3d8d-4f06-9da1-ec8549201fe7	c249b00e-14dd-4906-a52c-34ea61cd5ed3	BS	LOANS_AND_RECEIVABLES	Loans and Receivables	20	2026-04-25 22:07:37.663867+00	2026-04-25 22:07:37.663867+00
791fc71b-594a-41d6-a7d5-6ee353a9941e	7374a609-3d8d-4f06-9da1-ec8549201fe7	7be30b2c-5b6b-4453-a019-2dc0e54ada1d	BS	LOANS_AND_RECEIVABLES	Loans and Receivables	20	2026-04-25 22:07:37.664208+00	2026-04-25 22:07:37.664208+00
edf2d28b-9958-4814-9590-9a7dcb5a4a60	7374a609-3d8d-4f06-9da1-ec8549201fe7	d36c6ba2-a782-4c79-8b2d-6a20bb982c96	BS	LOANS_AND_RECEIVABLES	Loans and Receivables	20	2026-04-25 22:07:37.664546+00	2026-04-25 22:07:37.664546+00
81dbde6e-e7a4-45b7-8f02-dfb406be7106	7374a609-3d8d-4f06-9da1-ec8549201fe7	7c8b54d2-904e-45bc-8835-63b5321cfe72	BS	LOANS_AND_RECEIVABLES	Loans and Receivables	20	2026-04-25 22:07:37.664885+00	2026-04-25 22:07:37.664885+00
fe6bb961-8b8f-4455-9c34-d736965ba3e0	7374a609-3d8d-4f06-9da1-ec8549201fe7	b2fa5ed4-897a-444f-a81a-854289e781e7	BS	INVESTMENTS	Investments	30	2026-04-25 22:07:37.665388+00	2026-04-25 22:07:37.665388+00
b644a65e-cdab-431d-bf67-9b4fdcbd907d	7374a609-3d8d-4f06-9da1-ec8549201fe7	fa3c876d-3358-494f-87ad-a22f1f7b1b26	BS	INVESTMENTS	Investments	30	2026-04-25 22:07:37.665791+00	2026-04-25 22:07:37.665791+00
02591ff2-3655-4ea8-a3c1-6f6610b5bd02	7374a609-3d8d-4f06-9da1-ec8549201fe7	5517ac6c-3a8d-494c-a93b-836739b4c9ad	BS	INVESTMENTS	Investments	30	2026-04-25 22:07:37.666133+00	2026-04-25 22:07:37.666133+00
007f9495-58ed-4b8a-8124-cd2deaccbe2d	7374a609-3d8d-4f06-9da1-ec8549201fe7	54a17ebe-8506-4d8d-956b-a390003b282f	BS	DERIVATIVE_ASSETS	Derivative Assets	40	2026-04-25 22:07:37.666436+00	2026-04-25 22:07:37.666436+00
386f88ea-3fd0-46e7-99ba-3f0544e45e1f	7374a609-3d8d-4f06-9da1-ec8549201fe7	3f54d28a-d01c-4f3d-80b5-c5fc35e8e3f0	BS	PREPAIDS_AND_OTHER_ASSETS	Prepaids and Other Assets	50	2026-04-25 22:07:37.666796+00	2026-04-25 22:07:37.666796+00
f22fc27d-ee2e-478c-9b73-5da38c6f7e6d	7374a609-3d8d-4f06-9da1-ec8549201fe7	55767e63-462d-476b-9f3c-1fbdf27f564c	BS	INTEREST_BEARING_LIABILITIES	Interest-Bearing Liabilities	60	2026-04-25 22:07:37.667379+00	2026-04-25 22:07:37.667379+00
31e4af6d-c899-49e3-acfc-3d567cf9b0b1	7374a609-3d8d-4f06-9da1-ec8549201fe7	97f8fd27-e1b6-4bd1-8155-a4c70f361c58	BS	INTEREST_BEARING_LIABILITIES	Interest-Bearing Liabilities	60	2026-04-25 22:07:37.667761+00	2026-04-25 22:07:37.667761+00
210c70d2-05c2-4e80-8582-7c07e0041144	7374a609-3d8d-4f06-9da1-ec8549201fe7	710c80bf-c0a7-432d-9b39-62fa12761c5f	BS	ACCRUED_AND_OTHER_PAYABLES	Accrued and Other Payables	70	2026-04-25 22:07:37.668075+00	2026-04-25 22:07:37.668075+00
166ae230-cd14-44dc-8fa3-a74c4871c3e4	7374a609-3d8d-4f06-9da1-ec8549201fe7	5f912a30-1f67-4fb3-8e97-adaf830bc603	BS	ACCRUED_AND_OTHER_PAYABLES	Accrued and Other Payables	70	2026-04-25 22:07:37.668389+00	2026-04-25 22:07:37.668389+00
2a5daf12-39aa-4797-a646-b6e211102e46	7374a609-3d8d-4f06-9da1-ec8549201fe7	2607caea-1d9e-4e20-aa43-f03e21fd94c1	BS	ACCRUED_AND_OTHER_PAYABLES	Accrued and Other Payables	70	2026-04-25 22:07:37.668726+00	2026-04-25 22:07:37.668726+00
a908105e-916a-439f-9851-2543e7274060	7374a609-3d8d-4f06-9da1-ec8549201fe7	f07fb4d2-d744-4493-872e-28e0fae74a84	BS	ACCRUED_AND_OTHER_PAYABLES	Accrued and Other Payables	70	2026-04-25 22:07:37.669026+00	2026-04-25 22:07:37.669026+00
1c52ee60-2231-42e1-9ec6-d813d5900077	7374a609-3d8d-4f06-9da1-ec8549201fe7	5b190126-cc61-4224-bf20-8ab0f8fb38bf	BS	DERIVATIVE_LIABILITIES	Derivative Liabilities	80	2026-04-25 22:07:37.669316+00	2026-04-25 22:07:37.669316+00
05745224-1dc9-48bf-a9f3-64731c93ab0d	7374a609-3d8d-4f06-9da1-ec8549201fe7	5043cb1a-1da8-49d0-b5b4-c7660e7c567e	BS	EQUITY	Equity	90	2026-04-25 22:07:37.669614+00	2026-04-25 22:07:37.669614+00
557c0b98-9901-4866-8e9c-330ad93c8b53	7374a609-3d8d-4f06-9da1-ec8549201fe7	d0c2f6cf-bb8c-4099-9814-d35b0c9e632d	BS	EQUITY	Equity	90	2026-04-25 22:07:37.66996+00	2026-04-25 22:07:37.66996+00
263fbdde-d451-4086-9bfe-54d95849ddd8	7374a609-3d8d-4f06-9da1-ec8549201fe7	6363d54c-24d9-4f24-b2de-f43e25793444	BS	EQUITY	Equity	90	2026-04-25 22:07:37.670272+00	2026-04-25 22:07:37.670272+00
48dc8ebf-e731-49c1-a1fc-a03f681e999c	7374a609-3d8d-4f06-9da1-ec8549201fe7	b22bc641-0415-4fa3-9aa6-8d7f2788d5ae	PL	INVESTMENT_INCOME	Investment Income	10	2026-04-25 22:07:37.670578+00	2026-04-25 22:07:37.670578+00
c664b881-53e9-4e6e-aec0-70dcc7e315de	7374a609-3d8d-4f06-9da1-ec8549201fe7	9340b0e5-176d-467d-8817-7078c53d2158	PL	INVESTMENT_INCOME	Investment Income	10	2026-04-25 22:07:37.670883+00	2026-04-25 22:07:37.670883+00
6ab7a4ad-9529-4e35-bc87-b1cdb5ab4759	7374a609-3d8d-4f06-9da1-ec8549201fe7	2e7f557f-4618-44d5-81ec-e57d0a7fb9cc	PL	FEE_AND_OTHER_OPERATING_INCOME	Fee and Other Operating Income	20	2026-04-25 22:07:37.671192+00	2026-04-25 22:07:37.671192+00
9c19e48e-a22f-4251-b43e-1d14989326a1	7374a609-3d8d-4f06-9da1-ec8549201fe7	7c5ca1c6-8d33-42e8-819a-ca38cbbc634f	PL	FEE_AND_OTHER_OPERATING_INCOME	Fee and Other Operating Income	20	2026-04-25 22:07:37.671491+00	2026-04-25 22:07:37.671491+00
aa978b02-1aee-42cb-a62f-43a9c6ef03af	7374a609-3d8d-4f06-9da1-ec8549201fe7	c8794f25-a83b-4d27-971c-8e10b37ab3f1	PL	FEE_AND_OTHER_OPERATING_INCOME	Fee and Other Operating Income	20	2026-04-25 22:07:37.671796+00	2026-04-25 22:07:37.671796+00
7ded04a7-06a8-45b8-bc5e-dda45687c65a	7374a609-3d8d-4f06-9da1-ec8549201fe7	e84268b4-4048-4527-b357-4e01715574b0	PL	FEE_AND_OTHER_OPERATING_INCOME	Fee and Other Operating Income	20	2026-04-25 22:07:37.672116+00	2026-04-25 22:07:37.672116+00
95fac1f3-5dfb-4370-9729-a9b47d2bd043	7374a609-3d8d-4f06-9da1-ec8549201fe7	613b1e04-9c5c-46e6-b34c-24e944e571c3	PL	FINANCING_COSTS	Financing Costs	30	2026-04-25 22:07:37.672413+00	2026-04-25 22:07:37.672413+00
aa309e2a-7cfe-4467-b4d2-58bfc81ed145	7374a609-3d8d-4f06-9da1-ec8549201fe7	cd7f6fb0-0953-44dc-9262-056d869ff3f7	PL	OPERATING_EXPENSES	Operating Expenses	40	2026-04-25 22:07:37.672744+00	2026-04-25 22:07:37.672744+00
0a02c58b-d303-4ba8-b232-6c5476f03c22	7374a609-3d8d-4f06-9da1-ec8549201fe7	6a4a7dd6-f69c-4402-8acf-6443d1f41942	PL	OPERATING_EXPENSES	Operating Expenses	40	2026-04-25 22:07:37.673034+00	2026-04-25 22:07:37.673034+00
359c2dc4-7d17-4c8c-b0ec-bc4fd19a6450	7374a609-3d8d-4f06-9da1-ec8549201fe7	cbb714a6-a8a7-493e-8847-8b2a205953a3	PL	OPERATING_EXPENSES	Operating Expenses	40	2026-04-25 22:07:37.673419+00	2026-04-25 22:07:37.673419+00
2839c72a-2426-4391-abeb-f800070f5ed2	7374a609-3d8d-4f06-9da1-ec8549201fe7	55110496-0c99-4c04-87c6-22ffbd49bccf	PL	OPERATING_EXPENSES	Operating Expenses	40	2026-04-25 22:07:37.673782+00	2026-04-25 22:07:37.673782+00
43881c1e-d1f0-423f-a610-3c79fe081256	7374a609-3d8d-4f06-9da1-ec8549201fe7	b0ad73d2-b06e-4110-a062-9da14eef1ba7	PL	CREDIT_AND_TAX_COSTS	Credit and Tax Costs	50	2026-04-25 22:07:37.674087+00	2026-04-25 22:07:37.674087+00
d6b1a377-7d0f-409b-b7bc-b4d44fb64340	7374a609-3d8d-4f06-9da1-ec8549201fe7	d476bd7f-2862-45d0-9039-430275eabb21	PL	CREDIT_AND_TAX_COSTS	Credit and Tax Costs	50	2026-04-25 22:07:37.674384+00	2026-04-25 22:07:37.674384+00
9dbd3c87-b48e-471c-a247-f8ec87e1702b	7374a609-3d8d-4f06-9da1-ec8549201fe7	91c0c465-aa3f-4846-b2fb-4a543588158c	CF	OPERATING_CASH_FLOW	Operating Cash Flow	10	2026-04-25 22:07:37.674699+00	2026-04-25 22:07:37.674699+00
a1404fd6-7570-4e2a-9348-83c6b3221cc5	7374a609-3d8d-4f06-9da1-ec8549201fe7	c249b00e-14dd-4906-a52c-34ea61cd5ed3	CF	INVESTING_CASH_FLOW	Investing Cash Flow	20	2026-04-25 22:07:37.675015+00	2026-04-25 22:07:37.675015+00
a254ac9d-e0b6-4336-8b83-cc49a95d384b	7374a609-3d8d-4f06-9da1-ec8549201fe7	b2fa5ed4-897a-444f-a81a-854289e781e7	CF	INVESTING_CASH_FLOW	Investing Cash Flow	20	2026-04-25 22:07:37.675327+00	2026-04-25 22:07:37.675327+00
51ccf57f-acc4-4185-bd8d-5ae1e10c566d	7374a609-3d8d-4f06-9da1-ec8549201fe7	fa3c876d-3358-494f-87ad-a22f1f7b1b26	CF	INVESTING_CASH_FLOW	Investing Cash Flow	20	2026-04-25 22:07:37.675647+00	2026-04-25 22:07:37.675647+00
aca71edc-15f4-402f-b89e-0738d5df9329	7374a609-3d8d-4f06-9da1-ec8549201fe7	5517ac6c-3a8d-494c-a93b-836739b4c9ad	CF	INVESTING_CASH_FLOW	Investing Cash Flow	20	2026-04-25 22:07:37.675983+00	2026-04-25 22:07:37.675983+00
1bfbc45c-646a-4efd-80ed-deaac68d649f	7374a609-3d8d-4f06-9da1-ec8549201fe7	55767e63-462d-476b-9f3c-1fbdf27f564c	CF	FINANCING_CASH_FLOW	Financing Cash Flow	30	2026-04-25 22:07:37.676324+00	2026-04-25 22:07:37.676324+00
9f0f145f-c220-43aa-a69c-5c3efa1a64ca	7374a609-3d8d-4f06-9da1-ec8549201fe7	97f8fd27-e1b6-4bd1-8155-a4c70f361c58	CF	FINANCING_CASH_FLOW	Financing Cash Flow	30	2026-04-25 22:07:37.676621+00	2026-04-25 22:07:37.676621+00
904597e4-91b8-4b7f-99da-6cd66c5ee684	7374a609-3d8d-4f06-9da1-ec8549201fe7	5043cb1a-1da8-49d0-b5b4-c7660e7c567e	CF	FINANCING_CASH_FLOW	Financing Cash Flow	30	2026-04-25 22:07:37.676952+00	2026-04-25 22:07:37.676952+00
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, code, name, status, base_currency, accounting_timezone, settings, created_at, updated_at) FROM stdin;
7374a609-3d8d-4f06-9da1-ec8549201fe7	TENANT-DEMO-001	Demo Tenant	active	USD	Asia/Seoul	\N	2026-04-25 11:32:42.433332+00	2026-04-25 11:32:42.433332+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, tenant_id, email, name, status, auth_subject, created_at, updated_at) FROM stdin;
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: close_adjustment_journals close_adjustment_journals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_adjustment_journals
    ADD CONSTRAINT close_adjustment_journals_pkey PRIMARY KEY (id);


--
-- Name: close_periods close_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_periods
    ADD CONSTRAINT close_periods_pkey PRIMARY KEY (id);


--
-- Name: contract_parties contract_parties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_parties
    ADD CONSTRAINT contract_parties_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: entities entities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: event_calculations event_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_calculations
    ADD CONSTRAINT event_calculations_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: fund_investor_positions fund_investor_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_investor_positions
    ADD CONSTRAINT fund_investor_positions_pkey PRIMARY KEY (id);


--
-- Name: fx_rates fx_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fx_rates
    ADD CONSTRAINT fx_rates_pkey PRIMARY KEY (id);


--
-- Name: investor_allocations investor_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_allocations
    ADD CONSTRAINT investor_allocations_pkey PRIMARY KEY (id);


--
-- Name: investors investors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT investors_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: journals journals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: statement_mappings statement_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statement_mappings
    ADD CONSTRAINT statement_mappings_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_tenant_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX accounts_tenant_code_uq ON public.accounts USING btree (tenant_id, code);


--
-- Name: books_tenant_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX books_tenant_code_uq ON public.books USING btree (tenant_id, code);


--
-- Name: close_periods_tenant_book_period_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX close_periods_tenant_book_period_uq ON public.close_periods USING btree (tenant_id, book_id, period_type, period_start, period_end);


--
-- Name: contracts_tenant_code_version_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX contracts_tenant_code_version_uq ON public.contracts USING btree (tenant_id, code, version_no);


--
-- Name: entities_tenant_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX entities_tenant_code_uq ON public.entities USING btree (tenant_id, code);


--
-- Name: events_tenant_entity_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_tenant_entity_date_idx ON public.events USING btree (tenant_id, entity_id, accounting_date, id);


--
-- Name: events_tenant_type_idempotency_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_tenant_type_idempotency_uq ON public.events USING btree (tenant_id, event_type, idempotency_key);


--
-- Name: fx_rates_tenant_rate_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fx_rates_tenant_rate_uq ON public.fx_rates USING btree (tenant_id, rate_date, from_currency, to_currency, source_name);


--
-- Name: investors_tenant_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX investors_tenant_code_uq ON public.investors USING btree (tenant_id, code);


--
-- Name: journal_lines_tenant_journal_line_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX journal_lines_tenant_journal_line_uq ON public.journal_lines USING btree (tenant_id, journal_id, line_no);


--
-- Name: journals_tenant_journal_no_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX journals_tenant_journal_no_uq ON public.journals USING btree (tenant_id, journal_no);


--
-- Name: products_tenant_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_tenant_code_uq ON public.products USING btree (tenant_id, code);


--
-- Name: statement_mappings_tenant_line_order_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX statement_mappings_tenant_line_order_uq ON public.statement_mappings USING btree (tenant_id, statement_type, line_code, account_id);


--
-- Name: tenants_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tenants_code_uq ON public.tenants USING btree (code);


--
-- Name: users_tenant_email_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_tenant_email_uq ON public.users USING btree (tenant_id, email);


--
-- Name: accounts accounts_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: audit_logs audit_logs_actor_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_user_id_users_id_fk FOREIGN KEY (actor_user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: books books_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_entity_id_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id);


--
-- Name: books books_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: close_adjustment_journals close_adjustment_journals_close_period_id_close_periods_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_adjustment_journals
    ADD CONSTRAINT close_adjustment_journals_close_period_id_close_periods_id_fk FOREIGN KEY (close_period_id) REFERENCES public.close_periods(id);


--
-- Name: close_adjustment_journals close_adjustment_journals_journal_id_journals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_adjustment_journals
    ADD CONSTRAINT close_adjustment_journals_journal_id_journals_id_fk FOREIGN KEY (journal_id) REFERENCES public.journals(id);


--
-- Name: close_adjustment_journals close_adjustment_journals_reversal_journal_id_journals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_adjustment_journals
    ADD CONSTRAINT close_adjustment_journals_reversal_journal_id_journals_id_fk FOREIGN KEY (reversal_journal_id) REFERENCES public.journals(id);


--
-- Name: close_adjustment_journals close_adjustment_journals_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_adjustment_journals
    ADD CONSTRAINT close_adjustment_journals_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: close_periods close_periods_book_id_books_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_periods
    ADD CONSTRAINT close_periods_book_id_books_id_fk FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: close_periods close_periods_closed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_periods
    ADD CONSTRAINT close_periods_closed_by_users_id_fk FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- Name: close_periods close_periods_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_periods
    ADD CONSTRAINT close_periods_entity_id_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id);


--
-- Name: close_periods close_periods_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.close_periods
    ADD CONSTRAINT close_periods_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: contract_parties contract_parties_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_parties
    ADD CONSTRAINT contract_parties_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: contract_parties contract_parties_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_parties
    ADD CONSTRAINT contract_parties_entity_id_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id);


--
-- Name: contract_parties contract_parties_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_parties
    ADD CONSTRAINT contract_parties_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: contracts contracts_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: contracts contracts_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: entities entities_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: event_calculations event_calculations_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_calculations
    ADD CONSTRAINT event_calculations_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: event_calculations event_calculations_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_calculations
    ADD CONSTRAINT event_calculations_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: events events_book_id_books_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_book_id_books_id_fk FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: events events_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: events events_counterparty_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_counterparty_entity_id_entities_id_fk FOREIGN KEY (counterparty_entity_id) REFERENCES public.entities(id);


--
-- Name: events events_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: events events_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_entity_id_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id);


--
-- Name: events events_investor_id_investors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_investor_id_investors_id_fk FOREIGN KEY (investor_id) REFERENCES public.investors(id);


--
-- Name: events events_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: events events_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: fund_investor_positions fund_investor_positions_fund_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_investor_positions
    ADD CONSTRAINT fund_investor_positions_fund_entity_id_entities_id_fk FOREIGN KEY (fund_entity_id) REFERENCES public.entities(id);


--
-- Name: fund_investor_positions fund_investor_positions_investor_id_investors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_investor_positions
    ADD CONSTRAINT fund_investor_positions_investor_id_investors_id_fk FOREIGN KEY (investor_id) REFERENCES public.investors(id);


--
-- Name: fund_investor_positions fund_investor_positions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_investor_positions
    ADD CONSTRAINT fund_investor_positions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: fx_rates fx_rates_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fx_rates
    ADD CONSTRAINT fx_rates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: investor_allocations investor_allocations_fund_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_allocations
    ADD CONSTRAINT investor_allocations_fund_entity_id_entities_id_fk FOREIGN KEY (fund_entity_id) REFERENCES public.entities(id);


--
-- Name: investor_allocations investor_allocations_investor_id_investors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_allocations
    ADD CONSTRAINT investor_allocations_investor_id_investors_id_fk FOREIGN KEY (investor_id) REFERENCES public.investors(id);


--
-- Name: investor_allocations investor_allocations_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_allocations
    ADD CONSTRAINT investor_allocations_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: investors investors_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT investors_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: journal_lines journal_lines_account_id_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_account_id_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: journal_lines journal_lines_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: journal_lines journal_lines_counterparty_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_counterparty_entity_id_entities_id_fk FOREIGN KEY (counterparty_entity_id) REFERENCES public.entities(id);


--
-- Name: journal_lines journal_lines_investor_id_investors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_investor_id_investors_id_fk FOREIGN KEY (investor_id) REFERENCES public.investors(id);


--
-- Name: journal_lines journal_lines_journal_id_journals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_journal_id_journals_id_fk FOREIGN KEY (journal_id) REFERENCES public.journals(id);


--
-- Name: journal_lines journal_lines_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: journal_lines journal_lines_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: journals journals_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: journals journals_book_id_books_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_book_id_books_id_fk FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: journals journals_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: journals journals_entity_id_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_entity_id_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id);


--
-- Name: journals journals_source_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_source_event_id_events_id_fk FOREIGN KEY (source_event_id) REFERENCES public.events(id);


--
-- Name: journals journals_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: products products_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: statement_mappings statement_mappings_account_id_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statement_mappings
    ADD CONSTRAINT statement_mappings_account_id_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: statement_mappings statement_mappings_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statement_mappings
    ADD CONSTRAINT statement_mappings_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users users_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- PostgreSQL database dump complete
--

\unrestrict dUhlNxnpH3VQ8SrJ2oPGMBeEmeIuR0fZZAnREDFPmFVzpVI6pENGcTHqsWt1R0x

