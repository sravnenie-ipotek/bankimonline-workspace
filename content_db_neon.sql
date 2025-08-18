--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Debian 16.8-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Homebrew)

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

--
-- Name: get_content_by_screen(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_content_by_screen(p_screen_location character varying, p_language_code character varying) RETURNS TABLE(content_key character varying, value text, component_type character varying, category character varying, language character varying, status character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.content_key,
        v.content_value as value,
        v.component_type,
        v.category,
        v.language_code as language,
        v.status
    FROM v_content_by_screen v
    WHERE v.screen_location = p_screen_location
      AND v.language_code = p_language_code
    ORDER BY v.content_key;
END;
$$;


ALTER FUNCTION public.get_content_by_screen(p_screen_location character varying, p_language_code character varying) OWNER TO neondb_owner;

--
-- Name: get_content_with_fallback(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_content_with_fallback(p_content_key character varying, p_language_code character varying) RETURNS TABLE(content_key character varying, value text, language character varying, status character varying, fallback_used boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
    default_lang VARCHAR(10);
BEGIN
    -- Get default language
    SELECT code INTO default_lang FROM languages WHERE is_default = TRUE LIMIT 1;
    
    -- Try to get content in requested language first
    RETURN QUERY
    SELECT 
        v.content_key,
        v.content_value as value,
        v.language_code as language,
        v.status,
        FALSE as fallback_used
    FROM v_content_by_screen v
    WHERE v.content_key = p_content_key
      AND v.language_code = p_language_code
    LIMIT 1;
    
    -- If not found, fallback to default language
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            v.content_key,
            v.content_value as value,
            v.language_code as language,
            v.status,
            TRUE as fallback_used
        FROM v_content_by_screen v
        WHERE v.content_key = p_content_key
          AND v.language_code = default_lang
        LIMIT 1;
    END IF;
END;
$$;


ALTER FUNCTION public.get_content_with_fallback(p_content_key character varying, p_language_code character varying) OWNER TO neondb_owner;

--
-- Name: get_current_mortgage_rate(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_current_mortgage_rate() RETURNS numeric
    LANGUAGE plpgsql
    AS $$
      BEGIN
        -- Return default 5.00% mortgage rate as per CLAUDE.md documentation
        RETURN 5.00;
      END;
      $$;


ALTER FUNCTION public.get_current_mortgage_rate() OWNER TO neondb_owner;

--
-- Name: get_property_ownership_ltv(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_property_ownership_ltv(property_ownership_type text) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
      BEGIN
        CASE property_ownership_type
          WHEN 'no_property' THEN RETURN 75.00;  -- No property: 75% financing
          WHEN 'has_property' THEN RETURN 50.00; -- Has property: 50% financing  
          WHEN 'selling_property' THEN RETURN 70.00; -- Selling property: 70% financing
          -- Handle legacy/alternative naming
          WHEN 'option_1' THEN RETURN 75.00;  -- No property
          WHEN 'option_2' THEN RETURN 50.00;  -- Has property
          WHEN 'option_3' THEN RETURN 70.00;  -- Selling property
          ELSE RETURN 75.00; -- Default fallback
        END CASE;
      END;
      $$;


ALTER FUNCTION public.get_property_ownership_ltv(property_ownership_type text) OWNER TO neondb_owner;

--
-- Name: update_cities_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_cities_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_cities_updated_at() OWNER TO neondb_owner;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: 11111; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."11111" (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."11111" OWNER TO neondb_owner;

--
-- Name: 11111_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."11111_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."11111_id_seq" OWNER TO neondb_owner;

--
-- Name: 11111_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."11111_id_seq" OWNED BY public."11111".id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255),
    role character varying(20) DEFAULT 'content_manager'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    password_hash character varying(255),
    CONSTRAINT admin_users_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'content_manager'::character varying, 'translator'::character varying, 'reviewer'::character varying])::text[])))
);


ALTER TABLE public.admin_users OWNER TO neondb_owner;

--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO neondb_owner;

--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: bank_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_configurations (
    id integer NOT NULL,
    bank_id integer NOT NULL,
    base_interest_rate numeric(5,3) NOT NULL,
    min_interest_rate numeric(5,3) NOT NULL,
    max_interest_rate numeric(5,3) NOT NULL,
    max_ltv_ratio numeric(5,2) NOT NULL,
    min_credit_score integer NOT NULL,
    max_loan_amount numeric(15,2) NOT NULL,
    min_loan_amount numeric(15,2) NOT NULL,
    processing_fee numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_type character varying(50) DEFAULT 'mortgage'::character varying,
    is_active boolean DEFAULT true,
    effective_from date DEFAULT CURRENT_DATE,
    effective_to date,
    risk_premium numeric(5,2) DEFAULT 0.0,
    auto_approval_enabled boolean DEFAULT false
);


ALTER TABLE public.bank_configurations OWNER TO neondb_owner;

--
-- Name: bank_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_configurations_id_seq OWNER TO neondb_owner;

--
-- Name: bank_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_configurations_id_seq OWNED BY public.bank_configurations.id;


--
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    name_en character varying(255) NOT NULL,
    name_he character varying(255) NOT NULL,
    name_ru character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banks OWNER TO neondb_owner;

--
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banks_id_seq OWNER TO neondb_owner;

--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    name_en character varying(255) NOT NULL,
    name_he character varying(255) NOT NULL,
    name_ru character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cities OWNER TO neondb_owner;

--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO neondb_owner;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: client_form_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_form_sessions (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    client_id integer,
    current_step integer DEFAULT 1,
    property_value numeric(15,2),
    property_city character varying(255),
    loan_period_preference character varying(50),
    initial_payment numeric(15,2),
    loan_term_years integer,
    property_ownership character varying(50),
    ltv_ratio numeric(5,2),
    personal_data jsonb,
    financial_data jsonb,
    ip_address inet,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.client_form_sessions OWNER TO neondb_owner;

--
-- Name: client_form_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_form_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_form_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: client_form_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_form_sessions_id_seq OWNED BY public.client_form_sessions.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20) NOT NULL,
    email character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    verified_phone boolean DEFAULT false,
    last_login timestamp with time zone
);


ALTER TABLE public.clients OWNER TO neondb_owner;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO neondb_owner;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: content_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_audit_log (
    id integer NOT NULL,
    user_id integer,
    user_email character varying(255) NOT NULL,
    user_name character varying(255) NOT NULL,
    user_role character varying(50) NOT NULL,
    session_id character varying(255),
    content_item_id integer,
    content_key character varying(255),
    screen_location character varying(255),
    language_code character varying(10),
    action_type character varying(50) NOT NULL,
    field_changed character varying(100) DEFAULT 'content_value'::character varying,
    old_value text,
    new_value text,
    source_page character varying(255),
    user_agent text,
    ip_address inet,
    referer_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_audit_log OWNER TO neondb_owner;

--
-- Name: content_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_audit_log_id_seq OWNER TO neondb_owner;

--
-- Name: content_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_audit_log_id_seq OWNED BY public.content_audit_log.id;


--
-- Name: content_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100),
    description text,
    parent_id integer,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);


ALTER TABLE public.content_categories OWNER TO neondb_owner;

--
-- Name: content_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_categories_id_seq OWNER TO neondb_owner;

--
-- Name: content_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_categories_id_seq OWNED BY public.content_categories.id;


--
-- Name: content_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_items (
    id bigint NOT NULL,
    content_key character varying(255) NOT NULL,
    content_type character varying(20) DEFAULT 'text'::character varying,
    category character varying(100),
    screen_location character varying(100),
    component_type character varying(50),
    description text,
    is_active boolean DEFAULT true,
    legacy_translation_key character varying(255),
    migration_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_by integer,
    page_number numeric(3,1),
    CONSTRAINT content_items_content_type_check CHECK (((content_type)::text = ANY ((ARRAY['text'::character varying, 'html'::character varying, 'markdown'::character varying, 'json'::character varying])::text[])))
);


ALTER TABLE public.content_items OWNER TO neondb_owner;

--
-- Name: TABLE content_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.content_items IS 'Refinance Credit Step 3 migration completed - all income details fields and dropdown options added';


--
-- Name: COLUMN content_items.page_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_items.page_number IS 'Confluence page number (e.g. 2, 4, 7.1, 11.2) from pageNumber.md mapping';


--
-- Name: content_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_items_id_seq OWNER TO neondb_owner;

--
-- Name: content_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_items_id_seq OWNED BY public.content_items.id;


--
-- Name: content_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_test (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_test OWNER TO neondb_owner;

--
-- Name: content_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_test_id_seq OWNER TO neondb_owner;

--
-- Name: content_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_test_id_seq OWNED BY public.content_test.id;


--
-- Name: content_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_translations (
    id bigint NOT NULL,
    content_item_id bigint NOT NULL,
    language_code character varying(10) NOT NULL,
    content_value text NOT NULL,
    is_default boolean DEFAULT false,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    CONSTRAINT content_translations_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'review'::character varying, 'approved'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.content_translations OWNER TO neondb_owner;

--
-- Name: content_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_translations_id_seq OWNER TO neondb_owner;

--
-- Name: content_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_translations_id_seq OWNED BY public.content_translations.id;


--
-- Name: credit_data_backup_20250127; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_data_backup_20250127 (
    id bigint,
    content_key character varying(255),
    content_type character varying(20),
    category character varying(100),
    screen_location character varying(100),
    component_type character varying(50),
    description text,
    is_active boolean,
    legacy_translation_key character varying(255),
    migration_status character varying(20),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by integer,
    updated_by integer,
    page_number numeric(3,1),
    content_ru text,
    content_he text,
    content_en text
);


ALTER TABLE public.credit_data_backup_20250127 OWNER TO neondb_owner;

--
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.languages (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    native_name character varying(100),
    direction character varying(3) DEFAULT 'ltr'::character varying,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT languages_direction_check CHECK (((direction)::text = ANY ((ARRAY['ltr'::character varying, 'rtl'::character varying])::text[])))
);


ALTER TABLE public.languages OWNER TO neondb_owner;

--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.languages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.languages_id_seq OWNER TO neondb_owner;

--
-- Name: languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.languages_id_seq OWNED BY public.languages.id;


--
-- Name: login_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_audit_log (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    user_id integer,
    session_id character varying(255),
    success boolean NOT NULL,
    failure_reason character varying(255),
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_audit_log OWNER TO neondb_owner;

--
-- Name: login_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_audit_log_id_seq OWNER TO neondb_owner;

--
-- Name: login_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_audit_log_id_seq OWNED BY public.login_audit_log.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying(255) NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: test11; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test11 (
    id integer NOT NULL,
    name character varying(100)
);


ALTER TABLE public.test11 OWNER TO neondb_owner;

--
-- Name: test11_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test11_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test11_id_seq OWNER TO neondb_owner;

--
-- Name: test11_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test11_id_seq OWNED BY public.test11.id;


--
-- Name: v_content_by_screen; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_content_by_screen AS
 SELECT ci.content_key,
    ci.screen_location,
    ci.component_type,
    ci.category,
    ct.language_code,
    ct.content_value,
    ct.status,
    ci.is_active,
    ci.updated_at
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ct.content_item_id = ci.id)))
  WHERE ((ci.is_active = true) AND ((ct.status)::text = 'approved'::text));


ALTER VIEW public.v_content_by_screen OWNER TO neondb_owner;

--
-- Name: v_content_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_content_stats AS
 SELECT screen_location,
    language_code,
    count(*) AS content_count,
    max(updated_at) AS last_updated
   FROM public.v_content_by_screen
  GROUP BY screen_location, language_code;


ALTER VIEW public.v_content_stats OWNER TO neondb_owner;

--
-- Name: view_mortgage_all_steps; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_all_steps AS
 SELECT ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at,
        CASE
            WHEN ((ci.screen_location)::text = 'mortgage_calculation'::text) THEN 0
            WHEN ((ci.screen_location)::text = 'mortgage_step1'::text) THEN 1
            WHEN ((ci.screen_location)::text = 'mortgage_step2'::text) THEN 2
            WHEN ((ci.screen_location)::text = 'mortgage_step3'::text) THEN 3
            WHEN ((ci.screen_location)::text = 'mortgage_step4'::text) THEN 4
            ELSE 99
        END AS step_number
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = ANY ((ARRAY['mortgage_calculation'::character varying, 'mortgage_step1'::character varying, 'mortgage_step2'::character varying, 'mortgage_step3'::character varying, 'mortgage_step4'::character varying])::text[])) AND (ci.is_active = true))
  ORDER BY
        CASE
            WHEN ((ci.screen_location)::text = 'mortgage_calculation'::text) THEN 0
            WHEN ((ci.screen_location)::text = 'mortgage_step1'::text) THEN 1
            WHEN ((ci.screen_location)::text = 'mortgage_step2'::text) THEN 2
            WHEN ((ci.screen_location)::text = 'mortgage_step3'::text) THEN 3
            WHEN ((ci.screen_location)::text = 'mortgage_step4'::text) THEN 4
            ELSE 99
        END, ci.category, ci.component_type, ci.content_key;


ALTER VIEW public.view_mortgage_all_steps OWNER TO neondb_owner;

--
-- Name: view_mortgage_calculator; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_calculator AS
 SELECT ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = 'mortgage_calculation'::text) AND (ci.is_active = true))
  ORDER BY ci.category, ci.component_type, ci.content_key;


ALTER VIEW public.view_mortgage_calculator OWNER TO neondb_owner;

--
-- Name: view_mortgage_categories_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_categories_summary AS
 SELECT ci.screen_location,
    ci.category,
    ci.component_type,
    count(*) AS item_count,
    count(DISTINCT ct.language_code) AS language_count,
    array_agg(DISTINCT ct.language_code) AS available_languages,
    min(ci.created_at) AS first_created,
    max(ci.updated_at) AS last_updated
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = ANY ((ARRAY['mortgage_calculation'::character varying, 'mortgage_step1'::character varying, 'mortgage_step2'::character varying, 'mortgage_step3'::character varying, 'mortgage_step4'::character varying])::text[])) AND (ci.is_active = true))
  GROUP BY ci.screen_location, ci.category, ci.component_type
  ORDER BY ci.screen_location, ci.category, ci.component_type;


ALTER VIEW public.view_mortgage_categories_summary OWNER TO neondb_owner;

--
-- Name: view_mortgage_step1; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_step1 AS
 SELECT ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = 'mortgage_step1'::text) AND (ci.is_active = true))
  ORDER BY ci.category, ci.component_type, ci.content_key;


ALTER VIEW public.view_mortgage_step1 OWNER TO neondb_owner;

--
-- Name: view_mortgage_step2; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_step2 AS
 SELECT ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = 'mortgage_step2'::text) AND (ci.is_active = true))
  ORDER BY ci.category, ci.component_type, ci.content_key;


ALTER VIEW public.view_mortgage_step2 OWNER TO neondb_owner;

--
-- Name: view_mortgage_step3; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_step3 AS
 SELECT ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = 'mortgage_step3'::text) AND (ci.is_active = true))
  ORDER BY ci.category, ci.component_type, ci.content_key;


ALTER VIEW public.view_mortgage_step3 OWNER TO neondb_owner;

--
-- Name: view_mortgage_step4; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mortgage_step4 AS
 SELECT ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active,
    ci.created_at,
    ci.updated_at
   FROM (public.content_items ci
     JOIN public.content_translations ct ON ((ci.id = ct.content_item_id)))
  WHERE (((ci.screen_location)::text = 'mortgage_step4'::text) AND (ci.is_active = true))
  ORDER BY ci.category, ci.component_type, ci.content_key;


ALTER VIEW public.view_mortgage_step4 OWNER TO neondb_owner;

--
-- Name: 11111 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."11111" ALTER COLUMN id SET DEFAULT nextval('public."11111_id_seq"'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: bank_configurations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations ALTER COLUMN id SET DEFAULT nextval('public.bank_configurations_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: client_form_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_form_sessions ALTER COLUMN id SET DEFAULT nextval('public.client_form_sessions_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: content_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_audit_log ALTER COLUMN id SET DEFAULT nextval('public.content_audit_log_id_seq'::regclass);


--
-- Name: content_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_categories ALTER COLUMN id SET DEFAULT nextval('public.content_categories_id_seq'::regclass);


--
-- Name: content_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items ALTER COLUMN id SET DEFAULT nextval('public.content_items_id_seq'::regclass);


--
-- Name: content_test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_test ALTER COLUMN id SET DEFAULT nextval('public.content_test_id_seq'::regclass);


--
-- Name: content_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations ALTER COLUMN id SET DEFAULT nextval('public.content_translations_id_seq'::regclass);


--
-- Name: languages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages ALTER COLUMN id SET DEFAULT nextval('public.languages_id_seq'::regclass);


--
-- Name: login_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_audit_log ALTER COLUMN id SET DEFAULT nextval('public.login_audit_log_id_seq'::regclass);


--
-- Name: test11 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test11 ALTER COLUMN id SET DEFAULT nextval('public.test11_id_seq'::regclass);


--
-- Data for Name: 11111; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."11111" (id, created_at) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, username, email, full_name, role, is_active, created_at, last_login, password_hash) FROM stdin;
2	content_manager	content@bankim.com	Content Manager	content_manager	t	2025-07-17 16:53:42.284005	\N	$2b$10$tdLtfIzT88DxEFu..MuQz.uzmhdA1lggbXC257inDspE3ynojm66a
1	admin	admin@bankim.com	System Administrator	super_admin	t	2025-07-17 16:53:42.284005	2025-08-15 11:37:23.055863	$2b$10$lyT/42cxN6W7IDbHUS3hwO6D2DxRli4YGtLMY2TYdcO1Nkh7Yjqoy
\.


--
-- Data for Name: bank_configurations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_configurations (id, bank_id, base_interest_rate, min_interest_rate, max_interest_rate, max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, processing_fee, created_at, updated_at, product_type, is_active, effective_from, effective_to, risk_premium, auto_approval_enabled) FROM stdin;
2	2	3.750	3.000	4.800	80.00	650	2500000.00	150000.00	1750.00	2025-08-06 18:58:26.074338	2025-08-06 18:58:26.074338	mortgage	t	2025-08-06	\N	0.00	f
4	4	3.900	3.200	5.000	75.00	640	2200000.00	120000.00	1600.00	2025-08-06 18:58:26.074338	2025-08-06 18:58:26.074338	mortgage	t	2025-08-06	\N	0.00	f
5	5	3.600	2.900	4.600	78.00	630	2100000.00	110000.00	1400.00	2025-08-06 18:58:26.074338	2025-08-06 18:58:26.074338	mortgage	t	2025-08-06	\N	0.00	f
1	1	4.600	2.900	4.600	76.00	625	2100000.00	105000.00	1600.00	2025-08-06 18:58:26.074338	2025-08-06 19:03:38.917279	mortgage	t	2025-08-06	\N	0.00	f
3	3	4.250	2.500	4.200	70.00	600	1800000.00	80000.00	1200.00	2025-08-06 18:58:26.074338	2025-08-06 19:04:00.595128	mortgage	t	2025-08-06	\N	0.00	f
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, name_en, name_he, name_ru, code, is_active, created_at, updated_at) FROM stdin;
1	Bank Apoalim	בנק אפועלים	Банк Апоалим	APOALIM	t	2025-08-06 18:58:25.981993	2025-08-06 18:58:25.981993
2	Bank Hapoalim	בנק הפועלים	Банк Хапоалим	HAPOALIM	t	2025-08-06 18:58:25.981993	2025-08-06 18:58:25.981993
3	Bank Leumi	בנק לאומי	Банк Леуми	LEUMI	t	2025-08-06 18:58:25.981993	2025-08-06 18:58:25.981993
4	Discount Bank	בנק דיסקונט	Банк Дисконт	DISCOUNT	t	2025-08-06 18:58:25.981993	2025-08-06 18:58:25.981993
5	First International Bank	בנק בינלאומי ראשון	Первый международный банк	FIBI	t	2025-08-06 18:58:25.981993	2025-08-06 18:58:25.981993
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, key, name_en, name_he, name_ru, is_active, sort_order, created_at, updated_at) FROM stdin;
1	tel_aviv	Tel Aviv	תל אביב	Тель-Авив	t	1	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
2	jerusalem	Jerusalem	ירושלים	Иерусалим	t	2	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
3	haifa	Haifa	חיפה	Хайфа	t	3	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
4	beer_sheva	Beer Sheva	באר שבע	Беэр-Шева	t	4	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
5	netanya	Netanya	נתניה	Нетания	t	5	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
6	ashdod	Ashdod	אשדוד	Ашдод	t	6	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
7	holon	Holon	חולון	Холон	t	7	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
8	petah_tikva	Petah Tikva	פתח תקווה	Петах-Тиква	t	8	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
9	rishon_lezion	Rishon LeZion	ראשון לציון	Ришон-ле-Цион	t	9	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
10	rehovot	Rehovot	רחובות	Реховот	t	10	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
11	ramat_gan	Ramat Gan	רמת גן	Рамат-Ган	t	11	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
12	bnei_brak	Bnei Brak	בני ברק	Бней-Брак	t	12	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
13	bat_yam	Bat Yam	בת ים	Бат-Ям	t	13	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
14	givatayim	Givatayim	גבעתיים	Гиватаим	t	14	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
15	herzliya	Herzliya	הרצליה	Герцлия	t	15	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
16	kfar_saba	Kfar Saba	כפר סבא	Кфар-Саба	t	16	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
17	raanana	Raanana	רעננה	Раанана	t	17	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
18	hod_hasharon	Hod HaSharon	הוד השרון	Ход-а-Шарон	t	18	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
19	nazareth	Nazareth	נצרת	Назарет	t	19	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
20	akko	Akko	עכו	Акко	t	20	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
21	tiberias	Tiberias	טבריה	Тверия	t	21	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
22	kiryat_shmona	Kiryat Shmona	קרית שמונה	Кирьят-Шмона	t	22	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
23	nahariya	Nahariya	נהריה	Нагария	t	23	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
24	ashkelon	Ashkelon	אשקלון	Ашкелон	t	24	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
25	kiryat_gat	Kiryat Gat	קרית גת	Кирьят-Гат	t	25	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
26	dimona	Dimona	דימונה	Димона	t	26	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
27	arad	Arad	ערד	Арад	t	27	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
28	eilat	Eilat	אילת	Эйлат	t	28	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
29	modi_in	Modiin	מודיעין	Модиин	t	29	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
30	lod	Lod	לוד	Лод	t	30	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
31	ramla	Ramla	רמלה	Рамла	t	31	2025-08-11 12:07:24.93765	2025-08-11 12:07:24.93765
\.


--
-- Data for Name: client_form_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_form_sessions (id, session_id, client_id, current_step, property_value, property_city, loan_period_preference, initial_payment, loan_term_years, property_ownership, ltv_ratio, personal_data, financial_data, ip_address, is_completed, created_at, updated_at) FROM stdin;
1	test_session_456	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:05:37.074975	2025-08-06 21:05:37.074975
2	test_session_789	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:06:29.555626	2025-08-06 21:06:29.555626
3	test_session_final	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:08:00.032713	2025-08-06 21:08:00.032713
4	test_session_success	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:09:36.67651	2025-08-06 21:09:36.67651
5	test_session_final_working	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:10:08.635553	2025-08-06 21:10:08.635553
6	test_session_almost_working	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:10:43.473636	2025-08-06 21:10:43.473636
7	test_session_final_fix	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 21:12:11.180649	2025-08-06 21:17:53.195824
9	sess_1754515806446_bkzakmtt2	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 18, "birth_date": 1186435754720}	{"monthly_income": 22222, "employment_years": 0}	::1	f	2025-08-06 21:30:06.754085	2025-08-06 21:30:06.754085
10	sess_1754515806448_ojbub1l4f	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 18, "birth_date": 1186435754720}	{"monthly_income": 22222, "employment_years": 0}	::1	f	2025-08-06 21:30:07.635005	2025-08-06 21:30:07.635005
11	sess_1754515806457_5j1w4rddi	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 18, "birth_date": 1186435754720}	{"monthly_income": 22222, "employment_years": 0}	::1	f	2025-08-06 21:30:07.679748	2025-08-06 21:30:07.679748
12	sess_1754516076733_mzr19llyl	\N	4	1000000.00	\N	\N	500000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186436017972}	{"monthly_income": 22222, "employment_years": 1.100339592966512}	::1	f	2025-08-06 21:34:37.769753	2025-08-06 21:34:37.769753
13	sess_1754516076735_iwlsgonew	\N	4	1000000.00	\N	\N	500000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186436017972}	{"monthly_income": 22222, "employment_years": 1.1003395930298883}	::1	f	2025-08-06 21:34:37.770028	2025-08-06 21:34:37.770028
14	sess_1754516076742_7wz4doop3	\N	4	1000000.00	\N	\N	500000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186436017972}	{"monthly_income": 22222, "employment_years": 1.1003395931883286}	::1	f	2025-08-06 21:34:37.770859	2025-08-06 21:34:37.770859
15	sess_1754516088588_1if1pmmi4	\N	4	1000000.00	\N	\N	500000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186436017972}	{"monthly_income": 22222, "employment_years": 1.100339968565417}	::1	f	2025-08-06 21:34:49.535795	2025-08-06 21:34:49.535795
16	sess_1754516088590_0l0re6pil	\N	4	1000000.00	\N	\N	500000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186436017972}	{"monthly_income": 22222, "employment_years": 1.1003399686604811}	::1	f	2025-08-06 21:34:49.553598	2025-08-06 21:34:49.553598
17	test_session	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 35}	{"monthly_income": 15000}	::1	f	2025-08-06 23:18:45.800858	2025-08-06 23:18:45.800858
18	sess_1754522974287_r124ua9sw	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186442942063}	{"monthly_income": 222222, "employment_years": 2.0232138785585723}	::1	f	2025-08-06 23:29:35.322297	2025-08-06 23:29:35.322297
19	sess_1754522974297_3ee67s4wg	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186442942063}	{"monthly_income": 222222, "employment_years": 2.0232138787487006}	::1	f	2025-08-06 23:29:35.324982	2025-08-06 23:29:35.324982
20	sess_1754522974290_bw0t4pukf	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186442942063}	{"monthly_income": 222222, "employment_years": 2.0232138786536367}	::1	f	2025-08-06 23:29:35.418768	2025-08-06 23:29:35.418768
21	sess_1754562747572_3qjrhlfd0	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 18, "birth_date": 1186480794924}	{"monthly_income": 22222, "employment_years": 0}	::1	f	2025-08-07 10:32:30.078024	2025-08-07 10:32:30.078024
22	sess_1754562747570_qnx7hqv2e	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 18, "birth_date": 1186480794924}	{"monthly_income": 22222, "employment_years": 0}	::1	f	2025-08-07 10:32:30.078317	2025-08-07 10:32:30.078317
23	sess_1754562747580_b91rv539z	\N	4	1000000.00	\N	\N	500000.00	30	has_property	50.00	{"age": 18, "birth_date": 1186480794924}	{"monthly_income": 22222, "employment_years": 0}	::1	f	2025-08-07 10:32:30.126438	2025-08-07 10:32:30.126438
24	sess_1754566315144_012thbymn	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03416974532283824}	::1	f	2025-08-07 11:31:56.7696	2025-08-07 11:31:56.7696
25	sess_1754566315133_16azw7ytp	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03416974487920501}	::1	f	2025-08-07 11:31:56.770599	2025-08-07 11:31:56.770599
26	sess_1754566315135_k305i0fgd	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03416974494258118}	::1	f	2025-08-07 11:31:56.770666	2025-08-07 11:31:56.770666
27	sess_1754568283847_8cf7a5j2f	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03423212947118919}	::1	f	2025-08-07 12:04:45.03747	2025-08-07 12:04:45.03747
28	sess_1754568283823_yrvpnh52h	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03423212877405126}	::1	f	2025-08-07 12:04:45.148559	2025-08-07 12:04:45.148559
29	sess_1754568283828_gr93vo0yw	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03423212890080361}	::1	f	2025-08-07 12:04:45.394637	2025-08-07 12:04:45.394637
30	sess_1754572949664_jrqjt9277	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.034379981145587754}	::1	f	2025-08-07 13:22:30.907936	2025-08-07 13:22:30.907936
31	sess_1754572949678_2uieogpys	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.034379981145587754}	::1	f	2025-08-07 13:22:30.925777	2025-08-07 13:22:30.925777
32	sess_1754572949661_v927yvc74	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03437998073364261}	::1	f	2025-08-07 13:22:31.054856	2025-08-07 13:22:31.054856
33	sess_1754575366865_m39q6mzmj	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03445657746469947}	::1	f	2025-08-07 14:02:48.571266	2025-08-07 14:02:48.571266
34	sess_1754575366868_yjkn5jhhg	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03445657759145182}	::1	f	2025-08-07 14:02:48.573582	2025-08-07 14:02:48.573582
35	sess_1754575366877_zowuwrnd0	\N	4	1000000.00	\N	\N	800000.00	30	no_property	75.00	{"age": 18, "birth_date": 1186484961663}	{"monthly_income": 222222, "employment_years": 0.03445657778158035}	::1	f	2025-08-07 14:02:48.854366	2025-08-07 14:02:48.854366
36	sess_1754576585921_n5v7w36kh	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016409970973711562}	::1	f	2025-08-07 14:23:07.390615	2025-08-07 14:23:07.390615
37	sess_1754576585908_7s4qfjy4x	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016409965903617513}	::1	f	2025-08-07 14:23:07.391145	2025-08-07 14:23:07.391145
38	sess_1754576585911_l8cfqa2o1	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001640996970618805}	::1	f	2025-08-07 14:23:07.391823	2025-08-07 14:23:07.391823
39	sess_1754576653087_yh5adsp3f	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016431252376606586}	::1	f	2025-08-07 14:24:14.309877	2025-08-07 14:24:14.309877
40	sess_1754576653085_xaxu7ludu	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016431252059725709}	::1	f	2025-08-07 14:24:14.494578	2025-08-07 14:24:14.494578
41	sess_1754576661087_6r23i9q1x	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016433787740512587}	::1	f	2025-08-07 14:24:22.45375	2025-08-07 14:24:22.45375
42	sess_1754576661080_f2vitk7ic	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016433786472989074}	::1	f	2025-08-07 14:24:22.58101	2025-08-07 14:24:22.58101
43	sess_1754576794082_zf3mvcsud	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016475931629781732}	::1	f	2025-08-07 14:26:35.308365	2025-08-07 14:26:35.308365
44	sess_1754576794086_pq55vobfw	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016475932580424367}	::1	f	2025-08-07 14:26:35.310277	2025-08-07 14:26:35.310277
45	sess_1754576807904_fkuc4z3nq	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016480311557279387}	::1	f	2025-08-07 14:26:49.442234	2025-08-07 14:26:49.442234
46	sess_1754576807921_bx1le2y8y	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016480316627373438}	::1	f	2025-08-07 14:26:49.442409	2025-08-07 14:26:49.442409
47	sess_1754576807907_0k7k4oyhw	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016480313775445535}	::1	f	2025-08-07 14:26:49.442886	2025-08-07 14:26:49.442886
48	sess_1754576927954_w1ykvvwen	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016518353423581008}	::1	f	2025-08-07 14:28:49.213534	2025-08-07 14:28:49.213534
49	sess_1754576927968_zxi4kwoen	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016518356909270668}	::1	f	2025-08-07 14:28:49.228545	2025-08-07 14:28:49.228545
50	sess_1754576927950_vtyzmx29h	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001651835152229574}	::1	f	2025-08-07 14:28:49.2283	2025-08-07 14:28:49.2283
51	sess_1754576973082_amaduw835	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.00165326539407306}	::1	f	2025-08-07 14:29:34.445269	2025-08-07 14:29:34.445269
52	sess_1754576973088_hmqzrgbnx	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016532655208254113}	::1	f	2025-08-07 14:29:34.488106	2025-08-07 14:29:34.488106
53	sess_1754576981081_g58e5z504	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001653518772023221}	::1	f	2025-08-07 14:29:42.54271	2025-08-07 14:29:42.54271
54	sess_1754576981085_8whjl48mm	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016535188670874844}	::1	f	2025-08-07 14:29:42.542403	2025-08-07 14:29:42.542403
55	sess_1754576990085_l3uts7745	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016538041549420742}	::1	f	2025-08-07 14:29:51.60701	2025-08-07 14:29:51.60701
56	sess_1754576990092_rvc85s398	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001653804376758689}	::1	f	2025-08-07 14:29:51.607032	2025-08-07 14:29:51.607032
57	sess_1754577000091_ucj6fwryw	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016541211942606535}	::1	f	2025-08-07 14:30:01.384642	2025-08-07 14:30:01.384642
58	sess_1754577000086_rxbh5k2rc	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016541210675083023}	::1	f	2025-08-07 14:30:01.873204	2025-08-07 14:30:01.873204
59	sess_1754577039079_16kdk0rno	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016553566811164347}	::1	f	2025-08-07 14:30:40.267585	2025-08-07 14:30:40.267585
60	sess_1754577039084_2lz00shhe	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016553567761806982}	::1	f	2025-08-07 14:30:40.317677	2025-08-07 14:30:40.317677
61	sess_1754577069084_zpiq8terr	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016563073871270313}	::1	f	2025-08-07 14:31:10.318142	2025-08-07 14:31:10.318142
62	sess_1754577069080_8rnxg0e97	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016563073237508556}	::1	f	2025-08-07 14:31:10.346886	2025-08-07 14:31:10.346886
63	sess_1754577139488_wsf9n5pz6	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016585383552614901}	::1	f	2025-08-07 14:32:20.745103	2025-08-07 14:32:20.745103
64	sess_1754577139503_uri44bcgd	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001658538862270895}	::1	f	2025-08-07 14:32:20.744909	2025-08-07 14:32:20.744909
65	sess_1754577139484_g4bgbhab1	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001658538228509139}	::1	f	2025-08-07 14:32:20.746228	2025-08-07 14:32:20.746228
66	sess_1754577143243_8c9kgnsd8	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016586574390954952}	::1	f	2025-08-07 14:32:24.621251	2025-08-07 14:32:24.621251
67	sess_1754577143275_po23lkd5j	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016586584214262174}	::1	f	2025-08-07 14:32:24.623196	2025-08-07 14:32:24.623196
68	sess_1754577147569_7ke77luv7	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.0016587945217633787}	::1	f	2025-08-07 14:32:29.045008	2025-08-07 14:32:29.045008
69	sess_1754577147601_bxfm46g9u	\N	4	0.00	\N	\N	\N	30	no_property	75.00	{"age": 18, "birth_date": 1186495435603}	{"monthly_income": 23123124, "employment_years": 0.001658926375896773}	::1	f	2025-08-07 14:32:33.119302	2025-08-07 14:32:33.119302
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, first_name, last_name, phone, email, created_at, updated_at, is_active, verified_phone, last_login) FROM stdin;
1	New	Client	+972655566776	972655566776@bankim.com	2025-08-06 21:27:27.555578+00	2025-08-06 21:27:27.555578+00	t	f	\N
2	New	Client	+972123456789	972123456789@bankim.com	2025-08-06 21:28:20.746064+00	2025-08-06 21:28:20.746064+00	t	f	\N
3	New	Client	+972786567876	972786567876@bankim.com	2025-08-06 21:29:14.720666+00	2025-08-06 21:29:14.720666+00	t	f	\N
5	New	Client	+972765567876	972765567876@bankim.com	2025-08-06 21:33:37.974449+00	2025-08-06 21:33:37.974449+00	t	f	\N
7	New	Client	+972786556776	972786556776@bankim.com	2025-08-06 21:36:44.353398+00	2025-08-06 21:36:44.353398+00	t	f	\N
9	New	Client	+972344443243	972344443243@bankim.com	2025-08-06 23:29:02.084426+00	2025-08-06 23:29:02.084426+00	t	f	\N
10	New	Client	972544123456	972544123456@bankim.com	2025-08-07 08:47:08.661496+00	2025-08-07 08:47:08.661496+00	t	f	\N
11	New	Client	+972345565334	972345565334@bankim.com	2025-08-07 08:49:32.905301+00	2025-08-07 08:49:32.905301+00	t	f	\N
13	New	Client	+972765556789	972765556789@bankim.com	2025-08-07 09:59:55.069656+00	2025-08-07 09:59:55.069656+00	t	f	\N
15	New	Client	+972655765576	972655765576@bankim.com	2025-08-07 10:47:44.052931+00	2025-08-07 10:47:44.052931+00	t	f	\N
17	New	Client	+972765567765	972765567765@bankim.com	2025-08-07 11:02:04.920138+00	2025-08-07 11:02:04.920138+00	t	f	\N
19	New	Client	+972655445678	972655445678@bankim.com	2025-08-07 11:09:21.679806+00	2025-08-07 11:09:21.679806+00	t	f	\N
\.


--
-- Data for Name: content_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_audit_log (id, user_id, user_email, user_name, user_role, session_id, content_item_id, content_key, screen_location, language_code, action_type, field_changed, old_value, new_value, source_page, user_agent, ip_address, referer_url, created_at) FROM stdin;
\.


--
-- Data for Name: content_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_categories (id, name, display_name, description, parent_id, sort_order, is_active) FROM stdin;
1	headers	Page Headers	Main headings and titles	\N	1	t
2	buttons	Button Labels	Text for clickable buttons	\N	2	t
3	placeholders	Input Placeholders	Placeholder text for form inputs	\N	3	t
4	hints	Help Text	Tooltips and help messages	\N	4	t
5	dropdowns	Dropdown Options	Options for select elements	\N	5	t
6	errors	Error Messages	Validation and error text	\N	6	t
7	notifications	Notifications	Success and info messages	\N	7	t
8	labels	Form Labels	Labels for form fields	\N	8	t
9	navigation	Navigation Elements	Menu items and navigation	\N	9	t
10	descriptions	Descriptions	Explanatory text and descriptions	\N	10	t
12	titles	Page Titles	Page and section titles	\N	2	t
16	metadata	Metadata	Page metadata and configuration	\N	6	t
\.


--
-- Data for Name: content_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_items (id, content_key, content_type, category, screen_location, component_type, description, is_active, legacy_translation_key, migration_status, created_at, updated_at, created_by, updated_by, page_number) FROM stdin;
2401	navigation.menu.home	text	headers	navigation_menu	menu_item	Home menu item	t	\N	pending	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
1612	refinance_step2_education_label	text	form	refinance_step2	label	Education dropdown label	t	\N	pending	2025-07-30 13:44:54.458942	2025-07-30 13:44:54.458942	1	\N	\N
2402	navigation.menu.about	text	headers	navigation_menu	menu_item	About menu item	t	\N	pending	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
1614	refinance_step2_education_no_certificate	text	form	refinance_step2	option	Education option - No high school certificate	t	\N	pending	2025-07-30 13:44:55.748943	2025-07-30 13:44:55.748943	1	\N	\N
1615	refinance_step2_education_partial_certificate	text	form	refinance_step2	option	Education option - Partial high school certificate	t	\N	pending	2025-07-30 13:44:56.709286	2025-07-30 13:44:56.709286	1	\N	\N
1616	refinance_step2_education_full_certificate	text	form	refinance_step2	option	Education option - Full high school certificate	t	\N	pending	2025-07-30 13:44:57.594909	2025-07-30 13:44:57.594909	1	\N	\N
1617	refinance_step2_education_post_secondary	text	form	refinance_step2	option	Education option - Post-secondary education	t	\N	pending	2025-07-30 13:44:58.368741	2025-07-30 13:44:58.368741	1	\N	\N
1636	mortgage_step3.field.main_source	text	mortgage	mortgage_step3	dropdown_container	\N	t	\N	migrated	2025-07-31 19:54:23.169109	2025-07-31 19:54:23.169109	\N	\N	\N
1637	mortgage_step3.field.additional_income	text	mortgage	mortgage_step3	dropdown_container	\N	t	\N	migrated	2025-07-31 19:54:23.169109	2025-07-31 19:54:23.169109	\N	\N	\N
1638	mortgage_step3.field.obligations	text	mortgage	mortgage_step3	dropdown_container	\N	t	\N	migrated	2025-07-31 19:54:23.169109	2025-07-31 19:54:23.169109	\N	\N	\N
240	mortgage_step3.field.obligations_other	text	form	mortgage_step3	dropdown_option	Obligation option 5 - Other	t	\N	completed	2025-07-20 11:58:57.498519	2025-07-31 19:54:23.169109	1	\N	7.0
1908	mortgage_step3_obligation_mizrahi	text	ui	mortgage_step3	option	Bank Mizrahi option for obligation	t	\N	pending	2025-08-02 13:26:27.414904	2025-08-02 13:26:27.414904	1	\N	\N
1909	mortgage_step3_obligation_other	text	ui	mortgage_step3	option	Other bank option for obligation	t	\N	pending	2025-08-02 13:26:36.457001	2025-08-02 13:26:36.457001	1	\N	\N
926	mortgage_calculation.header.filter_title	text	headers	mortgage_step4	header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
929	mortgage_calculation.section.parameters	text	headers	mortgage_step4	section_header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
930	mortgage_calculation.section.parameters_initial	text	headers	mortgage_step4	section_header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
1602	refinance_step2_education	text	form	refinance_step2	label	Education dropdown label	t	\N	pending	2025-07-30 13:39:52.142633	2025-07-30 21:48:08.757559	1	\N	\N
1604	refinance_step2_education_no_high_school_certificate	text	form	refinance_step2	option	Education option 1 - No high school certificate	t	\N	pending	2025-07-30 13:39:53.606522	2025-07-30 21:48:08.757559	1	\N	\N
2087	other_borrowers_obligation_title	text	obligation	other_borrowers_step2	text	\N	t	\N	pending	2025-08-07 13:28:56.37173	2025-08-12 12:54:15.651703	\N	\N	\N
2088	other_borrowers_obligation_placeholder	text	obligation	other_borrowers_step2	placeholder	\N	t	\N	pending	2025-08-07 13:28:57.207733	2025-08-12 12:54:15.651703	\N	\N	\N
2239	error_balance	text	error_messages	refinance_step1	validation	Balance mismatch error message for mortgage refinance	t	\N	pending	2025-08-13 09:46:44.534245	2025-08-13 09:46:44.534245	\N	\N	\N
924	mortgage_calculation.header.title	text	headers	mortgage_calculation	header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
925	mortgage_calculation.header.calculator_title	text	headers	mortgage_calculation	header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1605	refinance_step2_education_partial_high_school_certificat	text	form	refinance_step2	option	Education option 2 - Partial high school certificate	t	\N	pending	2025-07-30 13:39:54.502106	2025-07-30 21:48:08.757559	1	\N	\N
927	mortgage_calculation.video.title	text	headers	mortgage_calculation	header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
928	mortgage_calculation.banner.subtext	text	descriptions	mortgage_calculation	text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1606	refinance_step2_education_full_high_school_certificate	text	form	refinance_step2	option	Education option 3 - Full high school certificate	t	\N	pending	2025-07-30 13:39:55.272292	2025-07-30 21:48:08.757559	1	\N	\N
1607	refinance_step2_education_postsecondary_education	text	form	refinance_step2	option	Education option 4 - Post-secondary education	t	\N	pending	2025-07-30 13:39:56.317523	2025-07-30 21:48:08.757559	1	\N	\N
247	app.mortgage.step3.profession_ph	text	form	mortgage_step3	placeholder	Profession field placeholder	t	\N	completed	2025-07-20 11:59:32.78983	2025-07-30 13:41:40.186028	1	\N	7.0
248	app.mortgage.step3.start_date	text	form	mortgage_step3	label	Work start date field	t	\N	completed	2025-07-20 11:59:33.255855	2025-07-30 13:41:40.186028	1	\N	7.0
249	app.mortgage.step3.borrower	text	form	mortgage_step3	label	Borrower section title	t	\N	completed	2025-07-20 11:59:33.720759	2025-07-30 13:41:40.186028	1	\N	7.0
250	app.mortgage.step3.add_borrower	text	form	mortgage_step3	button	Add borrower button text	t	\N	completed	2025-07-20 11:59:34.192267	2025-07-30 13:41:40.186028	1	\N	7.0
251	app.mortgage.step3.add_workplace	text	form	mortgage_step3	button	Add workplace button text	t	\N	completed	2025-07-20 11:59:34.655169	2025-07-30 13:41:40.186028	1	\N	7.0
252	app.mortgage.step3.add_additional_income	text	form	mortgage_step3	button	Add additional income button text	t	\N	completed	2025-07-20 11:59:35.126245	2025-07-30 13:41:40.186028	1	\N	7.0
253	app.mortgage.step3.add_obligation	text	form	mortgage_step3	button	Add obligation button text	t	\N	completed	2025-07-20 11:59:35.589613	2025-07-30 13:41:40.186028	1	\N	7.0
254	app.mortgage.step3.source_of_income	text	form	mortgage_step3	label	Source of income modal title	t	\N	completed	2025-07-20 12:02:05.7903	2025-07-30 13:41:40.186028	1	\N	7.0
255	app.mortgage.step3.additional_source_of_income	text	form	mortgage_step3	label	Additional source of income modal title	t	\N	completed	2025-07-20 12:02:06.569125	2025-07-30 13:41:40.186028	1	\N	7.0
256	app.mortgage.step3.obligation	text	form	mortgage_step3	label	Obligation modal title	t	\N	completed	2025-07-20 12:02:07.117244	2025-07-30 13:41:40.186028	1	\N	7.0
1608	refinance_step2_education_bachelors	text	form	refinance_step2	option	Education option 5 - Bachelor's degree	t	\N	pending	2025-07-30 13:39:57.096403	2025-07-30 21:48:08.757559	1	\N	\N
1609	refinance_step2_education_masters	text	form	refinance_step2	option	Education option 6 - Master's degree	t	\N	pending	2025-07-30 13:39:58.086847	2025-07-30 21:48:08.757559	1	\N	\N
1610	refinance_step2_education_doctorate	text	form	refinance_step2	option	Education option 7 - Doctoral degree	t	\N	pending	2025-07-30 13:39:59.0341	2025-07-30 21:48:08.757559	1	\N	\N
1603	refinance_step2_education_ph	text	form	refinance_step2	placeholder	Education dropdown placeholder	t	\N	pending	2025-07-30 13:39:52.858016	2025-07-30 21:48:08.757559	1	\N	\N
228	mortgage_step3.field.additional_income_additional_salary	text	form	mortgage_step3	dropdown_option	Additional income option 2 - Extra salary	t	\N	completed	2025-07-20 11:58:25.257749	2025-07-31 19:54:23.169109	1	\N	7.0
229	mortgage_step3.field.additional_income_additional_work	text	form	mortgage_step3	dropdown_option	Additional income option 3 - Extra work	t	\N	completed	2025-07-20 11:58:25.853926	2025-07-31 19:54:23.169109	1	\N	7.0
230	mortgage_step3.field.additional_income_property_rental_income	text	form	mortgage_step3	dropdown_option	Additional income option 4 - Property rental	t	\N	completed	2025-07-20 11:58:26.526208	2025-07-31 19:54:23.169109	1	\N	7.0
231	mortgage_step3.field.additional_income_investment	text	form	mortgage_step3	dropdown_option	Additional income option 5 - Investments	t	\N	completed	2025-07-20 11:58:27.162542	2025-07-31 19:54:23.169109	1	\N	7.0
1625	main_step1	text	main_steps	main_step1	step	\N	t	\N	pending	2025-07-30 23:35:39.617268	2025-07-30 23:35:39.617268	\N	\N	1.0
1626	main_step2	text	main_steps	main_step2	step	\N	t	\N	pending	2025-07-30 23:35:40.027087	2025-07-30 23:35:40.027087	\N	\N	2.0
1627	main_page_welcome	text	page_content	main_step1	text	\N	t	\N	pending	2025-07-30 23:35:40.420282	2025-07-30 23:35:40.420282	\N	\N	\N
1628	main_page_description	text	page_content	main_step1	text	\N	t	\N	pending	2025-07-30 23:35:40.806368	2025-07-30 23:35:40.806368	\N	\N	\N
1629	main_page_navigation_header	text	page_header	main_step1	text	\N	t	\N	pending	2025-07-30 23:35:41.165516	2025-07-30 23:35:41.165516	\N	\N	\N
1621	mortgage_step1.field.city_ph	text	form	mortgage_step1	placeholder	City dropdown placeholder text	t	\N	pending	2025-07-30 20:33:27.016672	2025-07-30 20:33:27.016672	1	\N	\N
1630	main_page_settings	text	page_content	main_step2	text	\N	t	\N	pending	2025-07-30 23:35:41.511597	2025-07-30 23:35:41.511597	\N	\N	\N
1631	main_page_admin_tools	text	navigation	main_step2	button	\N	t	\N	pending	2025-07-30 23:35:41.859303	2025-07-30 23:35:41.859303	\N	\N	\N
1639	calculate_mortgage_citizenship_israel	text	mortgage	mortgage_step2	option	Citizenship option: Israel	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1640	calculate_mortgage_citizenship_united_states	text	mortgage	mortgage_step2	option	Citizenship option: United States	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1641	calculate_mortgage_citizenship_russia	text	mortgage	mortgage_step2	option	Citizenship option: Russia	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1642	calculate_mortgage_citizenship_germany	text	mortgage	mortgage_step2	option	Citizenship option: Germany	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1643	calculate_mortgage_citizenship_france	text	mortgage	mortgage_step2	option	Citizenship option: France	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1644	calculate_mortgage_citizenship_united_kingdom	text	mortgage	mortgage_step2	option	Citizenship option: United Kingdom	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1645	calculate_mortgage_citizenship_canada	text	mortgage	mortgage_step2	option	Citizenship option: Canada	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1646	calculate_mortgage_citizenship_ukraine	text	mortgage	mortgage_step2	option	Citizenship option: Ukraine	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
1647	calculate_mortgage_citizenship_other	text	mortgage	mortgage_step2	option	Citizenship option: Other	t	\N	pending	2025-07-31 20:24:36.504627	2025-07-31 20:27:46.167677	\N	\N	\N
227	mortgage_step3.field.additional_income_0_no_additional_income	text	form	mortgage_step3	dropdown_option	Additional income option 1 - None	t	\N	completed	2025-07-20 11:58:24.67596	2025-08-01 06:46:14.390154	1	\N	7.0
1910	mortgage_step3_bank_container	text	ui	mortgage_step3	dropdown_container	Bank dropdown container for mortgage step 3	t	\N	pending	2025-08-02 13:31:24.533111	2025-08-02 13:31:24.533111	1	\N	\N
1911	mortgage_step3_bank_hapoalim	text	ui	mortgage_step3	option	Bank Hapoalim option for mortgage step 3	t	\N	pending	2025-08-02 13:31:32.995797	2025-08-02 13:31:32.995797	1	\N	\N
1480	mortgage_step1.field.first_home_yes_first_home	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
1047	mortgage_step2.field.citizenship_israel	text	form	mortgage_step2	dropdown_option	Citizenship option: Israel	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1495	mortgage_step2.field.education_no_high_school_diploma	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1496	mortgage_step2.field.education_partial_high_school_diploma	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1497	mortgage_step2.field.education_full_high_school_diploma	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1498	mortgage_step2.field.education_postsecondary_education	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1499	mortgage_step2.field.education_bachelors	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1500	mortgage_step2.field.education_masters	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1501	mortgage_step2.field.education_doctorate	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1504	mortgage_step2.field.family_status_single	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1505	mortgage_step2.field.family_status_married	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1506	mortgage_step2.field.family_status_divorced	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1507	mortgage_step2.field.family_status_widowed	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1508	mortgage_step2.field.family_status_commonlaw_partner	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1509	mortgage_step2.field.family_status_other	text	form	mortgage_step2	dropdown_option	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
2090	other_borrowers.field.obligations_no_obligations	text	form	other_borrowers	dropdown_option	\N	t	\N	pending	2025-08-07 13:43:37.405117	2025-08-12 07:03:44.331571	\N	\N	\N
2091	other_borrowers.field.obligations_bank_loan	text	form	other_borrowers	dropdown_option	\N	t	\N	pending	2025-08-07 13:43:37.707208	2025-08-12 07:03:44.331571	\N	\N	\N
2092	other_borrowers.field.obligations_consumer_credit	text	form	other_borrowers	dropdown_option	\N	t	\N	pending	2025-08-07 13:43:38.026423	2025-08-12 07:03:44.331571	\N	\N	\N
2093	other_borrowers.field.obligations_credit_card	text	form	other_borrowers	dropdown_option	\N	t	\N	pending	2025-08-07 13:43:38.337278	2025-08-12 07:03:44.331571	\N	\N	\N
2240	refinance_step3.field.additional_income_0_no_additional_income	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:03.364929	2025-08-13 09:56:03.364929	\N	\N	\N
2241	refinance_step3.field.additional_income_additional_salary	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:03.894642	2025-08-13 09:56:03.894642	\N	\N	\N
2242	refinance_step3.field.additional_income_additional_work	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:04.375596	2025-08-13 09:56:04.375596	\N	\N	\N
218	mortgage_step3.field.main_source_employee	text	form	mortgage_step3	dropdown_option	Main income option 1 - Employee	t	\N	completed	2025-07-20 11:57:28.375605	2025-07-31 19:54:23.169109	1	\N	7.0
219	mortgage_step3.field.main_source_selfemployed	text	form	mortgage_step3	dropdown_option	Main income option 2 - Self-employed	t	\N	completed	2025-07-20 11:57:29.059044	2025-07-31 19:54:23.169109	1	\N	7.0
220	mortgage_step3.field.main_source_pension	text	form	mortgage_step3	dropdown_option	Main income option 3 - Pensioner	t	\N	completed	2025-07-20 11:57:29.55718	2025-07-31 19:54:23.169109	1	\N	7.0
232	mortgage_step3.field.additional_income_pension	text	form	mortgage_step3	dropdown_option	Additional income option 6 - Pension	t	\N	completed	2025-07-20 11:58:27.764027	2025-07-31 19:54:23.169109	1	\N	7.0
233	mortgage_step3.field.additional_income_other	text	form	mortgage_step3	dropdown_option	Additional income option 7 - Other	t	\N	completed	2025-07-20 11:58:28.33161	2025-07-31 19:54:23.169109	1	\N	7.0
1648	calculate_mortgage_citizenship_dropdown	text	form	mortgage_step2	dropdown	Citizenship dropdown container for new options	t	\N	pending	2025-07-31 20:26:16.732764	2025-07-31 20:26:16.732764	\N	\N	\N
1912	mortgage_step3_bank_leumi	text	ui	mortgage_step3	option	Bank Leumi option for mortgage step 3	t	\N	pending	2025-08-02 13:31:44.593857	2025-08-02 13:31:44.593857	1	\N	\N
1913	mortgage_step3_bank_discount	text	ui	mortgage_step3	option	Bank Discount option for mortgage step 3	t	\N	pending	2025-08-02 13:31:45.149313	2025-08-02 13:31:45.149313	1	\N	\N
1914	mortgage_step3_bank_massad	text	ui	mortgage_step3	option	Bank Massad option for mortgage step 3	t	\N	pending	2025-08-02 13:31:45.680875	2025-08-02 13:31:45.680875	1	\N	\N
2403	refinance_mortgage_final	text	mortgage-refi	refinance_mortgage_4	title	\N	t	\N	pending	2025-08-16 21:58:06.329486	2025-08-16 21:58:06.329486	\N	\N	\N
2094	other_borrowers_obligations	text	\N	other_borrowers	dropdown_container	\N	t	\N	pending	2025-08-07 13:45:18.31048	2025-08-07 13:47:44.106498	\N	\N	\N
2243	refinance_step3.field.additional_income_investment	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:04.849275	2025-08-13 09:56:04.849275	\N	\N	\N
2244	refinance_step3.field.additional_income_pension	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:05.376798	2025-08-13 09:56:05.376798	\N	\N	\N
2245	refinance_step3.field.additional_income_property_rental_income	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:05.799597	2025-08-13 09:56:05.799597	\N	\N	\N
2246	refinance_step3.field.additional_income_other	text	form	refinance_step3	dropdown_option	Additional income option for refinance	t	\N	pending	2025-08-13 09:56:06.261668	2025-08-13 09:56:06.261668	\N	\N	\N
2247	app.refinance.step3.additional_income	text	form	refinance_step3	label	Additional income field for refinance	t	\N	pending	2025-08-13 09:56:06.776875	2025-08-13 09:56:06.776875	\N	\N	\N
2248	app.refinance.step3.additional_income_ph	text	form	refinance_step3	placeholder	Additional income field for refinance	t	\N	pending	2025-08-13 09:56:07.351903	2025-08-13 09:56:07.351903	\N	\N	\N
272	mortgage_step4_filter_all_mortgage_programs	text	form	mortgage_step4	option	All mortgage programs filter option	t	\N	completed	2025-07-20 14:21:29.387287	2025-07-30 13:41:40.186028	1	\N	11.0
273	mortgage_step4_filter_prime_rate_mortgages	text	form	mortgage_step4	option	Prime rate mortgages filter option	t	\N	completed	2025-07-20 14:21:29.92011	2025-07-30 13:41:40.186028	1	\N	11.0
1483	mortgage_step1.field.property_ownership	text	form	mortgage_step1	dropdown_container	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.188794	1	1	\N
93	app.mortgage.form.calculate_mortgage_when_next_3_months	text	form	mortgage_step1	dropdown_option	Timing option 1	t	\N	completed	2025-07-20 08:51:06.312408	2025-07-31 13:09:13.313729	1	\N	2.0
94	app.mortgage.form.calculate_mortgage_when_3_to_6_months	text	form	mortgage_step1	dropdown_option	Timing option 2	t	\N	completed	2025-07-20 08:51:07.558691	2025-07-31 13:09:13.313729	1	\N	2.0
95	app.mortgage.form.calculate_mortgage_when_6_to_12_months	text	form	mortgage_step1	dropdown_option	Timing option 3	t	\N	completed	2025-07-20 08:51:08.700653	2025-07-31 13:09:13.313729	1	\N	2.0
2404	refinance_mortgage_warning	text	mortgage-refi	refinance_mortgage_4	text	\N	t	\N	pending	2025-08-16 21:58:06.329486	2025-08-16 21:58:06.329486	\N	\N	\N
1593	refinance_mortgage_1_property_type_apartment	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1594	refinance_mortgage_1_property_type_house	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1595	refinance_mortgage_1_property_type_commercial	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1586	refinance_mortgage_1_registered_yes	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1587	refinance_mortgage_1_registered_no	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1588	refinance_mortgage_1_why_lower_interest_rate	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1589	refinance_mortgage_1_why_extend_loan_term	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1590	refinance_mortgage_1_why_change_bank	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1591	refinance_mortgage_1_why_increase_loan_amount	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1592	refinance_mortgage_1_why_other	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1566	mortgage_refinance_registered_land	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1567	mortgage_refinance_registered_no_not_registered	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1461	refinance_step1_property_type_apartment	text	form	refinance_step1	option	Apartment	t	app.refinance.step1.property_option_1	pending	2025-07-29 10:50:37.451076	2025-07-30 13:41:40.186028	\N	\N	\N
1462	refinance_step1_property_type_private_house	text	form	refinance_step1	option	Private House	t	app.refinance.step1.property_option_2	pending	2025-07-29 10:50:37.451076	2025-07-30 13:41:40.186028	\N	\N	\N
1463	refinance_step1_property_type_commercial	text	form	refinance_step1	option	Commercial Property	t	app.refinance.step1.property_option_3	pending	2025-07-29 10:50:37.451076	2025-07-30 13:41:40.186028	\N	\N	\N
1464	refinance_step1_property_type_land	text	form	refinance_step1	option	Land	t	app.refinance.step1.property_option_4	pending	2025-07-29 10:50:37.451076	2025-07-30 13:41:40.186028	\N	\N	\N
309	refinance_step1_property_type_other	text	form	refinance_step1	option	Other property type option	t	\N	completed	2025-07-20 14:43:23.506324	2025-07-30 13:41:40.186028	1	\N	\N
1138	mortgage_credit_why	text	form_field	refinance_credit_1	text	Goal of credit refinancing	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1224	calculate_mortgage_birthday	text	form_field	refinance_credit_2	text	Date of birth	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1225	calculate_mortgage_birthday_ph	text	form_field	refinance_credit_2	text	Select date	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1227	calculate_mortgage_education_ph	text	form_field	refinance_credit_2	text	Select education level	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1228	calculate_mortgage_additional_citizenships	text	form_field	refinance_credit_2	text	Additional citizenships	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1229	calculate_mortgage_citizenships_dropdown	text	form_field	refinance_credit_2	text	Select citizenships	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
533	tenders_for_lawyers_process_step_5_description	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
532	tenders_for_lawyers_process_step_5_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
478	temporary_franchise_includes_support_phone	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
476	temporary_franchise_includes_support_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
477	temporary_franchise_includes_support_training	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
470	temporary_franchise_includes_turnkey_benefit_brand	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
471	temporary_franchise_includes_turnkey_benefit_marketing	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
527	tenders_for_lawyers_process_step_2_description	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
526	tenders_for_lawyers_process_step_2_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
529	tenders_for_lawyers_process_step_3_description	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
528	tenders_for_lawyers_process_step_3_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
96	app.mortgage.form.calculate_mortgage_when_more_than_12_months	text	form	mortgage_step1	dropdown_option	Timing option 4	t	\N	completed	2025-07-20 08:51:09.965411	2025-07-31 13:09:13.313729	1	\N	2.0
1649	credit_step1.field.loan_amount	text	form	credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1481	mortgage_step1.field.first_home_no_additional_property	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
960	mortgage_calculation.button.show_offers	text	buttons	mortgage_calculation	button	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1482	mortgage_step1.field.first_home_investment	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
1650	credit_step1.field.loan_purpose	text	form	credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1651	credit_step1.field.loan_period	text	form	credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1652	refinance_mortgage_step1.field.loan_amount	text	form	refinance_mortgage_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1376	error_select_field_of_activity	text	form_validation	validation_errors	validation_error	\N	t	error_select_field_of_activity	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1653	refinance_mortgage_step1.field.loan_purpose	text	form	refinance_mortgage_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1377	error_select_one_of_the_options	text	form_validation	validation_errors	validation_error	\N	t	error_select_one_of_the_options	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1378	error_select_bank	text	form_validation	validation_errors	validation_error	\N	t	error_select_bank	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1379	error_max_price	text	form_validation	validation_errors	validation_error	\N	t	error_max_price	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1380	error_property_value_required	text	form_validation	validation_errors	validation_error	\N	t	error_property_value_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1381	error_city_required	text	form_validation	validation_errors	validation_error	\N	t	error_city_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1382	error_when_need_mortgage	text	form_validation	validation_errors	validation_error	\N	t	error_when_need_mortgage	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1383	error_initial_fee	text	form_validation	validation_errors	validation_error	\N	t	error_initial_fee	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1384	error_initial_payment_required	text	form_validation	validation_errors	validation_error	\N	t	error_initial_payment_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1385	error_mortgage_type_required	text	form_validation	validation_errors	validation_error	\N	t	error_mortgage_type_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1386	error_first_home_required	text	form_validation	validation_errors	validation_error	\N	t	error_first_home_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1387	error_property_ownership_required	text	form_validation	validation_errors	validation_error	\N	t	error_property_ownership_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1388	error_min_period	text	form_validation	validation_errors	validation_error	\N	t	error_min_period	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1389	error_max_period	text	form_validation	validation_errors	validation_error	\N	t	error_max_period	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1413	mortgage_fix_percent	text	program_types	bank_offers	label	\N	t	\N	pending	2025-07-27 05:49:14.091106	2025-07-30 13:41:40.186028	\N	\N	\N
1654	refinance_mortgage_step1.field.loan_period	text	form	refinance_mortgage_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1655	refinance_credit_step1.field.loan_amount	text	form	refinance_credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
609	tenders_for_lawyers_steps_step_3_desc	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
608	tenders_for_lawyers_steps_step_3_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
611	tenders_for_lawyers_steps_step_4_desc	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
610	tenders_for_lawyers_steps_step_4_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
613	tenders_for_lawyers_steps_step_5_desc	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
612	tenders_for_lawyers_steps_step_5_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
740	app.refinance_credit.step1.delete_button	text	buttons	refinance_credit_1	button	Delete button text	f	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
1487	mortgage_step1.field.property_ownership_selling_property	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 19:24:20.45801	1	1	\N
1485	mortgage_step1.field.property_ownership_no_property	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 19:24:20.45801	1	1	\N
1656	refinance_credit_step1.field.loan_purpose	text	form	refinance_credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
469	temporary_franchise_includes_turnkey_benefit_team	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
467	temporary_franchise_includes_turnkey_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
483	temporary_franchise_steps_step_1_description	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
482	temporary_franchise_steps_step_1_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
485	temporary_franchise_steps_step_2_description	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
484	temporary_franchise_steps_step_2_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
487	temporary_franchise_steps_step_3_description	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
486	temporary_franchise_steps_step_3_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
489	temporary_franchise_steps_step_4_description	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
488	temporary_franchise_steps_step_4_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
491	temporary_franchise_steps_step_5_description	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
490	temporary_franchise_steps_step_5_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1393	error_education_required	text	form_validation	validation_errors	validation_error	\N	t	error_education_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1394	error_citizenship_required	text	form_validation	validation_errors	validation_error	\N	t	error_citizenship_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1395	error_citizenship_countries_required	text	form_validation	validation_errors	validation_error	\N	t	error_citizenship_countries_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1396	error_taxes_required	text	form_validation	validation_errors	validation_error	\N	t	error_taxes_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1397	error_tax_countries_required	text	form_validation	validation_errors	validation_error	\N	t	error_tax_countries_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1398	error_children_required	text	form_validation	validation_errors	validation_error	\N	t	error_children_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1399	error_children_count_required	text	form_validation	validation_errors	validation_error	\N	t	error_children_count_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1400	error_medical_insurance_required	text	form_validation	validation_errors	validation_error	\N	t	error_medical_insurance_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1401	error_foreigner_required	text	form_validation	validation_errors	validation_error	\N	t	error_foreigner_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1402	error_public_person_required	text	form_validation	validation_errors	validation_error	\N	t	error_public_person_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1370	add_borrower	text	income_details	mortgage_step3	button	\N	t	add_borrower	pending	2025-07-26 14:59:32.05034	2025-07-30 13:41:40.186028	\N	\N	7.0
1371	who_are_you_for_borrowers_ph	text	relationship_details	other_borrowers_step1	placeholder	\N	t	who_are_you_for_borrowers_ph	pending	2025-07-26 15:00:18.027861	2025-07-30 13:41:40.186028	\N	\N	\N
1403	error_quantity_borrowers	text	form_validation	validation_errors	validation_error	\N	t	error_quantity_borrowers	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1404	error_family_status_required	text	form_validation	validation_errors	validation_error	\N	t	error_family_status_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1405	error_partner_mortgage_required	text	form_validation	validation_errors	validation_error	\N	t	error_partner_mortgage_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1414	mortgage_float_percent	text	program_types	bank_offers	label	\N	t	\N	pending	2025-07-27 05:49:14.091106	2025-07-30 13:41:40.186028	\N	\N	\N
1415	mortgage_register	text	labels	bank_offers	label	\N	t	\N	pending	2025-07-27 05:49:14.091106	2025-07-30 13:41:40.186028	\N	\N	\N
5	menu.main.refinance_sub	text	navigation	menu_navigation	menu_item	Дополнительные услуги рефинансирования	t	\N	completed	2025-07-21 14:22:40.090343	2025-07-30 13:41:40.186028	\N	\N	1.2
1657	refinance_credit_step1.field.loan_period	text	form	refinance_credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:00:37.40242	2025-07-31 23:00:37.40242	\N	\N	\N
1915	mortgage_step3.field.bank	text	ui	mortgage_step3	dropdown_container	Bank dropdown container for mortgage step 3	t	\N	pending	2025-08-02 13:33:40.31245	2025-08-02 13:33:40.31245	1	\N	\N
2095	calculate_mortgage_when_needed	text	dropdown	mortgage_calculation	label	\N	t	\N	pending	2025-08-08 08:42:06.855071	2025-08-08 08:42:06.855071	\N	\N	\N
2096	calculate_mortgage_when_needed_ph	text	dropdown	mortgage_calculation	placeholder	\N	t	\N	pending	2025-08-08 08:42:06.95619	2025-08-08 08:42:06.95619	\N	\N	\N
2097	calculate_mortgage_when_needed_option_1	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:07.071984	2025-08-08 08:42:07.071984	\N	\N	\N
2098	calculate_mortgage_when_needed_option_2	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:07.181131	2025-08-08 08:42:07.181131	\N	\N	\N
2099	calculate_mortgage_when_needed_option_3	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:07.299048	2025-08-08 08:42:07.299048	\N	\N	\N
2100	calculate_mortgage_when_needed_option_4	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:07.387002	2025-08-08 08:42:07.387002	\N	\N	\N
2101	calculate_mortgage_first_home	text	dropdown	mortgage_calculation	label	\N	t	\N	pending	2025-08-08 08:42:07.483865	2025-08-08 08:42:07.483865	\N	\N	\N
2102	calculate_mortgage_first_home_ph	text	dropdown	mortgage_calculation	placeholder	\N	t	\N	pending	2025-08-08 08:42:07.570618	2025-08-08 08:42:07.570618	\N	\N	\N
2103	calculate_mortgage_first_home_option_1	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:07.672723	2025-08-08 08:42:07.672723	\N	\N	\N
1583	refinance_mortgage_1_registered	text	form	refinance_mortgage_1	dropdown	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1584	refinance_mortgage_1_why	text	form	refinance_mortgage_1	dropdown	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
409	tenders_hero_b2	text	hero	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1585	refinance_mortgage_1_property_type	text	form	refinance_mortgage_1	dropdown	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
646	sidebar_menu_dashboard	text	sidebar_menu	sidebar	menu_item	Dashboard menu item in sidebar	t	Dashboard	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
647	sidebar_menu_bank_offers	text	sidebar_menu	sidebar	menu_item	Bank Offers menu item in sidebar	t	Bank Offers	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
1660	credit_step1.field.loan_period.period_5_years	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1661	credit_step1.field.loan_period.period_10_years	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1019	mortgage_calculation.field.debt_types_ph	text	form	mortgage_step3	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 22:07:07.010099	\N	\N	2.0
1662	credit_step1.field.loan_period.period_15_years	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1663	credit_step1.field.loan_period.period_20_years	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1664	credit_step1.field.loan_period.period_25_years	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1665	credit_step1.field.loan_period.period_30_years	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1667	credit_step1.field.loan_purpose.purpose_investment	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1668	credit_step1.field.loan_purpose.purpose_personal	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1669	credit_step1.field.loan_purpose.purpose_business	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1486	mortgage_step1.field.property_ownership_has_property	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 19:24:20.45801	1	1	\N
1670	credit_step1.field.loan_purpose.purpose_other	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1671	credit_step1.field.city	text	form	credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
961	mortgage_calculation.button.add_partner	text	buttons	mortgage_step2	button	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
1672	credit_step1.field.when_needed	text	form	credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1673	credit_step1.field.when_needed.when_needed_within_3_months	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
606	tenders_for_lawyers_steps_step_2_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1674	credit_step1.field.when_needed.when_needed_3_to_6_months	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
648	sidebar_menu_calculate_mortgage	text	sidebar_menu	sidebar	menu_item	Calculate Mortgage menu item in sidebar	t	Calculate Mortgage	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
650	sidebar_menu_refinance_mortgage	text	sidebar_menu	sidebar	menu_item	Refinance Mortgage menu item in sidebar	t	Refinance Mortgage	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
652	sidebar_menu_personal_cabinet	text	sidebar_menu	sidebar	menu_item	Personal Cabinet menu item in sidebar	t	Personal Cabinet	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
653	sidebar_menu_about_us	text	sidebar_menu	sidebar	menu_item	About Us menu item in sidebar	t	About Us	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
654	sidebar_menu_contact	text	sidebar_menu	sidebar	menu_item	Contact menu item in sidebar	t	Contact	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
655	sidebar_menu_settings	text	sidebar_menu	sidebar	menu_item	Settings menu item in sidebar	t	Settings	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
656	sidebar_menu_support	text	sidebar_menu	sidebar	menu_item	Support menu item in sidebar	t	Support	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
657	sidebar_menu_help	text	sidebar_menu	sidebar	menu_item	Help menu item in sidebar	t	Help	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
658	sidebar_menu_faq	text	sidebar_menu	sidebar	menu_item	FAQ menu item in sidebar	t	FAQ	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
1675	credit_step1.field.when_needed.when_needed_6_to_12_months	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1676	credit_step1.field.when_needed.when_needed_over_12_months	text	form	credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1677	credit_step2.field.education	text	form	credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
659	sidebar_menu_privacy_policy	text	sidebar_menu	sidebar	menu_item	Privacy Policy menu item in sidebar	t	Privacy Policy	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
660	sidebar_menu_terms_of_service	text	sidebar_menu	sidebar	menu_item	Terms of Service menu item in sidebar	t	Terms of Service	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
661	sidebar_menu_logout	text	sidebar_menu	sidebar	menu_item	Logout menu item in sidebar	t	Logout	migrated	2025-07-22 08:23:46.753675	2025-07-30 13:41:40.186028	\N	\N	1.1
616	lawyers_advantage_digital_title	text	advantages	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
617	lawyers_advantage_digital_platform	text	advantages	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
618	lawyers_advantage_digital_marketing	text	advantages	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
619	lawyers_advantage_digital_crm	text	advantages	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
620	lawyers_advantage_platform_access	text	advantages	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
621	lawyers_advantage_client_management	text	advantages	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
622	lawyers_get_consultation_button	text	advantages	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
623	lawyers_collaboration_cta_button	text	collaboration	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
636	contacts_secretary	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
637	contacts_secretary_phone	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
669	about_why_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
670	about_why_solve_problem_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
671	about_why_solve_problem	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
963	mortgage_calculation.field.name_surname_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
966	mortgage_calculation.field.education_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
1037	mortgage_calculation.units.months	text	units	mortgage_calculation	text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1632	mortgage_step1.field.type_fixed_rate	text	\N	mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
1633	mortgage_step1.field.type_variable_rate	text	\N	mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
1038	mortgage_calculation.text.cost	text	descriptions	mortgage_calculation	text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
672	about_why_bank_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
673	about_why_bank	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
674	about_why_mortgage_complete_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
675	about_why_mortgage_complete	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
676	about_why_simple_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
677	about_why_simple	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
680	about_why_security_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
681	about_why_security	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
682	about_why_fast_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
683	about_why_fast	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
684	contacts_title	text	contact_info	contacts	label	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
685	contacts_main_office	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
686	contacts_address	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
687	contacts_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
688	contacts_phone_label	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
689	contacts_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
690	contacts_email_label	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
691	contacts_general_questions	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
692	contacts_service_questions	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
693	contacts_cooperation	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
694	contacts_customer_service	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
695	contacts_mortgage_calc	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
696	contacts_mortgage_calc_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
697	contacts_mortgage_calc_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
701	contacts_real_estate_questions	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
702	contacts_real_estate_buy_sell	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
703	contacts_real_estate_buy_sell_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
704	contacts_real_estate_buy_sell_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
705	contacts_real_estate_rent	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
706	contacts_real_estate_rent_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
707	contacts_real_estate_rent_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
708	contacts_cooperation_management	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
1035	mortgage_calculation.units.period_min	text	units	mortgage_step1	text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
1036	mortgage_calculation.units.period_max	text	units	mortgage_step1	text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
709	contacts_cooperation_management_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
710	contacts_cooperation_management_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
711	contacts_management_contacts	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
712	contacts_management_contacts_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
713	contacts_management_contacts_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
714	contacts_accounting	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
715	contacts_accounting_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
716	contacts_accounting_email	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
718	contacts_fax_phone	text	contact_info	contacts	contact_info	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
719	contacts_social_follow	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
1	app.login.header.welcome	text	headers	login_page	header	Main welcome message on login page	t	\N	completed	2025-07-17 16:54:29.265678	2025-07-30 13:41:40.186028	1	\N	\N
2	app.login.button.sign_in	text	buttons	login_page	button	Sign in button text	t	\N	completed	2025-07-17 16:54:29.265678	2025-07-30 13:41:40.186028	1	\N	\N
3	app.login.placeholder.username	text	placeholders	login_page	placeholder	Username input placeholder	t	\N	completed	2025-07-17 16:54:29.265678	2025-07-30 13:41:40.186028	1	\N	\N
34	test_new_format_key	text	test	mortgage_calculation	text	Test content with new format	t	\N	completed	2025-07-18 08:19:42.665444	2025-07-30 13:41:40.186028	1	\N	2.0
37	app.mortgage.step.mobile_step_1_fixed	text	progress	mortgage_calculation	text	Calculator progress step - fixed	t	\N	completed	2025-07-20 08:25:54.722712	2025-07-30 13:41:40.186028	1	\N	2.0
1359	video_calculate_mortgage_title	text	ui_elements	mortgage_calculation	text	\N	t	video_calculate_mortgage_title	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	2.0
1360	show_offers	text	ui_elements	mortgage_calculation	text	\N	t	show_offers	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	2.0
1678	credit_step2.field.education.education_no_high_school_diploma	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1679	credit_step2.field.education.education_partial_high_school_diploma	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
568	cooperation_steps_step3_title	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
585	tenders_for_brokers_steps_step1	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1149	add_credit	text	action	refinance_credit_1	text	Add credit	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1363	source_of_income	text	form	mortgage_step3	label	\N	t	source_of_income	pending	2025-07-26 14:59:32.05034	2025-07-30 21:48:08.757559	\N	\N	7.0
975	mortgage_calculation.field.family_status_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
1026	mortgage_calculation.field.citizenship_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
1680	credit_step2.field.education.education_full_high_school_diploma	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1681	credit_step2.field.education.education_postsecondary_education	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1682	credit_step2.field.education.education_bachelors	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
571	cooperation_steps_step4_desc	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
570	cooperation_steps_step4_title	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
573	cooperation_steps_step5_desc	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
572	cooperation_steps_step5_title	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
565	cooperation_steps_step1_desc	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
564	cooperation_steps_step1_title	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
567	cooperation_steps_step2_desc	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
566	cooperation_steps_step2_title	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
569	cooperation_steps_step3_desc	text	form	cooperation	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
81	app.mortgage.form.calculate_mortgage_when_options_ph	text	form	mortgage_step1	placeholder	Mortgage timing placeholder	t	\N	completed	2025-07-20 08:50:50.045135	2025-07-30 22:18:12.744489	1	\N	2.0
38	app.mortgage.step.mobile_step_2_fixed	text	progress	mortgage_calculation	text	Personal details progress step	t	\N	completed	2025-07-20 08:30:35.292403	2025-07-30 13:41:40.186028	1	\N	2.0
40	app.mortgage.form.calculate_mortgage_title_fixed	text	form	mortgage_calculation	text	Form title	t	\N	completed	2025-07-20 08:31:20.022817	2025-07-30 13:41:40.186028	1	\N	2.0
1596	refinance_mortgage_1_registered_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1597	refinance_mortgage_1_registered_ph	text	form	refinance_mortgage_1	placeholder	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1598	refinance_mortgage_1_why_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1683	credit_step2.field.education.education_masters	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
89	app.mortgage.form.calculate_mortgage_period	text	form	mortgage_step1	dropdown_container	Loan period field label	t	\N	completed	2025-07-20 08:51:00.917592	2025-07-31 13:09:13.188794	1	\N	2.0
92	app.mortgage.form.calculate_mortgage_initial_payment	text	form	mortgage_step1	dropdown_container	Monthly payment field label	t	\N	completed	2025-07-20 08:51:05.102722	2025-07-31 13:09:13.188794	1	\N	2.0
1634	mortgage_step1.field.type_mixed_rate	text	\N	mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
1635	mortgage_step1.field.type_not_sure	text	\N	mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
90	app.mortgage.form.calculate_mortgage_period_units_min	text	form	mortgage_step1	text	Minimum period unit label	t	\N	completed	2025-07-20 08:51:02.177426	2025-07-30 21:47:12.130532	1	\N	2.0
91	app.mortgage.form.calculate_mortgage_period_units_max	text	form	mortgage_step1	text	Maximum period unit label	t	\N	completed	2025-07-20 08:51:03.885186	2025-07-30 21:47:12.130532	1	\N	2.0
1684	credit_step2.field.education.education_doctorate	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1685	credit_step2.field.family_status	text	form	credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1686	credit_step2.field.family_status.family_status_single	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1687	credit_step2.field.family_status.family_status_married	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1688	credit_step2.field.family_status.family_status_divorced	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1689	credit_step2.field.family_status.family_status_widowed	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1690	credit_step2.field.family_status.family_status_commonlaw_partner	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1691	credit_step2.field.family_status.family_status_other	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1692	credit_step2.field.citizenship	text	form	credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1693	credit_step2.field.citizenship.citizenship_israel	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1694	credit_step2.field.citizenship.citizenship_united_states	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1695	credit_step2.field.citizenship.citizenship_canada	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1696	credit_step2.field.citizenship.citizenship_united_kingdom	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1697	credit_step2.field.citizenship.citizenship_france	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1698	credit_step2.field.citizenship.citizenship_germany	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1364	add_place_to_work	text	income_details	mortgage_step3	button	\N	t	add_place_to_work	pending	2025-07-26 14:59:32.05034	2025-07-30 13:41:40.186028	\N	\N	7.0
86	app.mortgage.form.calculate_mortgage_first_ph	text	form	mortgage_step1	placeholder	First apartment placeholder	t	\N	completed	2025-07-20 08:50:56.937523	2025-07-30 22:18:12.744489	1	\N	2.0
1366	add_additional_source_of_income	text	income_details	mortgage_step3	button	\N	t	add_additional_source_of_income	pending	2025-07-26 14:59:32.05034	2025-07-30 13:41:40.186028	\N	\N	7.0
221	mortgage_step3.field.main_source_student	text	form	mortgage_step3	dropdown_option	Main income option 4 - Student	t	\N	completed	2025-07-20 11:57:30.050455	2025-07-31 19:54:23.169109	1	\N	7.0
1368	add_obligation	text	income_details	mortgage_step3	button	\N	t	add_obligation	pending	2025-07-26 14:59:32.05034	2025-07-30 13:41:40.186028	\N	\N	7.0
222	mortgage_step3.field.main_source_unpaid_leave	text	form	mortgage_step3	dropdown_option	Main income option 5 - Unpaid leave	t	\N	completed	2025-07-20 11:57:30.567702	2025-07-31 19:54:23.169109	1	\N	7.0
586	tenders_for_brokers_steps_step2	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
429	tenders_for_brokers_steps_step2_desc	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
428	tenders_for_brokers_steps_step2_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
587	tenders_for_brokers_steps_step3	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
431	tenders_for_brokers_steps_step3_desc	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
430	tenders_for_brokers_steps_step3_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
588	tenders_for_brokers_steps_step4	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1599	refinance_mortgage_1_why_ph	text	form	refinance_mortgage_1	placeholder	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
1600	refinance_mortgage_1_property_type_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
80	app.mortgage.form.calculate_mortgage_when	text	form	mortgage_step1	dropdown_container	Mortgage timing field label	t	\N	completed	2025-07-20 08:50:48.837697	2025-07-31 13:09:13.188794	1	\N	2.0
85	app.mortgage.form.calculate_mortgage_first	text	form	mortgage_step1	dropdown_container	First apartment field label	t	\N	completed	2025-07-20 08:50:55.667806	2025-07-31 13:09:13.188794	1	\N	2.0
78	app.mortgage.form.calculate_mortgage_price	text	form	mortgage_step1	dropdown_container	Property value field label	t	\N	completed	2025-07-20 08:50:46.280761	2025-07-31 13:09:13.188794	1	\N	2.0
79	app.mortgage.form.calculate_mortgage_city	text	form	mortgage_step1	dropdown_container	City field label	t	\N	completed	2025-07-20 08:50:47.502796	2025-07-31 13:09:13.188794	1	\N	2.0
1601	refinance_mortgage_1_property_type_ph	text	form	refinance_mortgage_1	placeholder	\N	t	\N	pending	2025-07-30 13:04:25.339905	2025-07-30 13:41:40.186028	\N	\N	\N
82	app.mortgage.form.calculate_mortgage_initial_fee	text	form	mortgage_step1	dropdown_container	Down payment field label	t	\N	completed	2025-07-20 08:50:51.497524	2025-07-31 13:09:13.188794	1	\N	2.0
83	app.mortgage.form.calculate_mortgage_type	text	form	mortgage_step1	dropdown_container	Mortgage type field label	t	\N	completed	2025-07-20 08:50:52.737459	2025-07-31 13:09:13.188794	1	\N	2.0
87	app.mortgage.form.calculate_mortgage_property_ownership	text	form	mortgage_step1	dropdown_container	Property ownership field label	t	\N	completed	2025-07-20 08:50:58.443875	2025-07-31 13:09:13.188794	1	\N	2.0
1493	mortgage_step2.field.education	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1502	mortgage_step2.field.family_status	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1510	mortgage_step2.field.tax	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
6	app.home.service.calculate_mortgage	text	buttons	home_page	service_card	Calculate Mortgage service card title	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
7	app.home.service.refinance_mortgage	text	buttons	home_page	service_card	Refinance Mortgage service card title	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
1511	mortgage_step2.field.is_medinsurance	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1512	mortgage_step2.field.is_public	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1513	mortgage_step2.field.partner_pay_mortgage	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1515	mortgage_step2.field.name_surname	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1517	mortgage_step2.field.borrowers	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1518	mortgage_step2.field.is_foreigner	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
84	app.mortgage.form.calculate_mortgage_type_ph	text	form	mortgage_step1	placeholder	Mortgage type placeholder	t	\N	completed	2025-07-20 08:50:53.957793	2025-07-30 21:47:12.130532	1	\N	2.0
88	app.mortgage.form.calculate_mortgage_property_ownership_ph	text	form	mortgage_step1	placeholder	Property ownership placeholder	t	\N	completed	2025-07-20 08:50:59.59904	2025-07-30 21:47:12.130532	1	\N	2.0
1365	additional_source_of_income	text	form	mortgage_step3	label	\N	t	additional_source_of_income	pending	2025-07-26 14:59:32.05034	2025-07-30 21:48:08.757559	\N	\N	7.0
1367	obligation	text	form	mortgage_step3	label	\N	t	obligation	pending	2025-07-26 14:59:32.05034	2025-07-30 21:48:08.757559	\N	\N	7.0
1369	borrower	text	form	mortgage_step3	label	\N	t	borrower	pending	2025-07-26 14:59:32.05034	2025-07-30 21:48:08.757559	\N	\N	7.0
1248	calculate_mortgage_education_high_school	text	form	refinance_credit_2	option	Partial high school diploma	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
1249	calculate_mortgage_education_high_school_diploma	text	form	refinance_credit_2	option	Full high school diploma	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
1250	calculate_mortgage_education_professional	text	form	refinance_credit_2	option	Post-secondary education	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
1251	calculate_mortgage_education_bachelors	text	form	refinance_credit_2	option	Bachelor's degree	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
1252	calculate_mortgage_education_masters	text	form	refinance_credit_2	option	Master's degree	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
1253	calculate_mortgage_education_doctorate	text	form	refinance_credit_2	option	Doctoral degree	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
433	tenders_for_brokers_steps_step4_desc	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
23	app.mortgage.step.mobile_step_1	text	progress	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 07:53:35.79588	2025-07-30 13:41:40.186028	1	\N	2.0
24	app.mortgage.step.mobile_step_2	text	progress	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 07:55:07.84693	2025-07-30 13:41:40.186028	1	\N	2.0
25	app.mortgage.step.mobile_step_3	text	progress	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 07:56:13.822885	2025-07-30 13:41:40.186028	1	\N	2.0
223	mortgage_step3.field.main_source_unemployed	text	form	mortgage_step3	dropdown_option	Main income option 6 - Unemployed	t	\N	completed	2025-07-20 11:57:31.076325	2025-07-31 19:54:23.169109	1	\N	7.0
224	mortgage_step3.field.main_source_other	text	form	mortgage_step3	dropdown_option	Main income option 7 - Other	t	\N	completed	2025-07-20 11:57:31.566423	2025-07-31 19:54:23.169109	1	\N	7.0
26	app.mortgage.step.mobile_step_4	text	progress	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 07:56:43.944262	2025-07-30 13:41:40.186028	1	\N	2.0
27	app.mortgage.header.video_calculate_mortgage_title	text	header	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 07:57:18.311196	2025-07-30 13:41:40.186028	1	\N	2.0
28	test.mortgage.simple	text	test	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 07:59:13.779198	2025-07-30 13:41:40.186028	1	\N	2.0
30	debug.check.database	text	test	mortgage_calculation	text	\N	f	\N	pending	2025-07-18 08:01:49.094146	2025-07-30 13:41:40.186028	1	\N	2.0
32	test_debug_key	text	debug	test_location	text	Test debug content	f	\N	pending	2025-07-18 08:13:55.465619	2025-07-30 13:41:40.186028	1	\N	\N
29	app.home.test.mortgage_step	text	test	home_page	text	\N	f	\N	pending	2025-07-18 07:59:55.977155	2025-07-30 13:41:40.186028	1	\N	1.0
432	tenders_for_brokers_steps_step4_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
589	tenders_for_brokers_steps_step5	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
435	tenders_for_brokers_steps_step5_desc	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
434	tenders_for_brokers_steps_step5_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
414	tenders_for_brokers_license_features_feature1_p1	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
415	tenders_for_brokers_license_features_feature1_p2	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
416	tenders_for_brokers_license_features_feature1_p3	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
39	app.mortgage.header.video_calculate_mortgage_title_fixed	text	header	mortgage_calculation	text	Video header title	t	\N	completed	2025-07-20 08:30:50.248187	2025-07-30 13:41:40.186028	1	\N	2.0
473	temporary_franchise_includes_digital_platform	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
237	mortgage_step3.field.obligations_bank_loan	text	form	mortgage_step3	dropdown_option	Obligation option 2 - Bank loan	t	\N	completed	2025-07-20 11:58:55.752477	2025-07-31 19:54:23.169109	1	\N	7.0
475	temporary_franchise_includes_digital_support	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
472	temporary_franchise_includes_digital_title	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
474	temporary_franchise_includes_digital_tools	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
479	temporary_franchise_includes_support_consultation	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
238	mortgage_step3.field.obligations_consumer_credit	text	form	mortgage_step3	dropdown_option	Obligation option 3 - Consumer credit	t	\N	completed	2025-07-20 11:58:56.459901	2025-07-31 19:54:23.169109	1	\N	7.0
239	mortgage_step3.field.obligations_credit_card	text	form	mortgage_step3	dropdown_option	Obligation option 4 - Credit card debt	t	\N	completed	2025-07-20 11:58:56.94863	2025-07-31 19:54:23.169109	1	\N	7.0
1699	credit_step2.field.citizenship.citizenship_russia	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1700	credit_step2.field.citizenship.citizenship_ukraine	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1701	credit_step2.field.citizenship.citizenship_other	text	form	credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1702	credit_step2.field.how_much_childrens	text	form	credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1703	credit_step3.field.main_source	text	form	credit_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1704	credit_step3.field.main_source.main_source_employee	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1705	credit_step3.field.main_source.main_source_selfemployed	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1706	credit_step3.field.main_source.main_source_unemployed	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1707	credit_step3.field.main_source.main_source_student	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1708	credit_step3.field.main_source.main_source_pension	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1709	credit_step3.field.main_source.main_source_unpaid_leave	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1710	credit_step3.field.main_source.main_source_other	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1711	credit_step3.field.additional_income	text	form	credit_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1713	credit_step3.field.additional_income.additional_income_additional_salary	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:41:50.224003	\N	\N	1.0
1712	credit_step3.field.additional_income.additional_income_00_no_additional_income	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:42:55.056414	\N	\N	0.0
1719	credit_step3.field.obligations	text	form	credit_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
215	app.mortgage.step3.title	text	form	mortgage_step3	title	Step 3 main page title	t	\N	completed	2025-07-20 10:58:23.519291	2025-07-30 13:41:40.186028	1	\N	7.0
216	app.mortgage.step3.main_source_income	text	form	mortgage_step3	label	Main source of income field label	t	\N	completed	2025-07-20 10:58:36.304511	2025-07-30 13:41:40.186028	1	\N	7.0
217	app.mortgage.step3.main_source_income_ph	text	form	mortgage_step3	placeholder	Main source of income field placeholder	t	\N	completed	2025-07-20 11:39:53.951096	2025-07-30 13:41:40.186028	1	\N	7.0
225	app.mortgage.step3.additional_income	text	form	mortgage_step3	label	Additional income field label	t	\N	completed	2025-07-20 11:58:23.19169	2025-07-30 13:41:40.186028	1	\N	7.0
234	app.mortgage.step3.obligations	text	form	mortgage_step3	label	Financial obligations field label	t	\N	completed	2025-07-20 11:58:53.99891	2025-07-30 13:41:40.186028	1	\N	7.0
1720	credit_step3.field.obligations.obligations_no_obligations	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1721	credit_step3.field.obligations.obligations_credit_card	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1722	credit_step3.field.obligations.obligations_bank_loan	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1723	credit_step3.field.obligations.obligations_consumer_credit	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
257	app.other_borrowers.step1.title	text	form	other_borrowers_step1	title	Other borrowers personal data title	t	\N	completed	2025-07-20 13:24:21.198279	2025-07-30 13:41:40.186028	1	\N	\N
258	app.other_borrowers.step1.who_are_you_label	text	form	other_borrowers_step1	label	Who are you for borrowers field label	t	\N	completed	2025-07-20 13:24:22.092894	2025-07-30 13:41:40.186028	1	\N	\N
259	app.other_borrowers.step1.who_are_you_ph	text	form	other_borrowers_step1	placeholder	Who are you for borrowers field placeholder	t	\N	completed	2025-07-20 13:24:22.646409	2025-07-30 13:41:40.186028	1	\N	\N
260	app.other_borrowers.step1.progress_label	text	navigation	other_borrowers_step1	progress	Step 1 progress label	t	\N	completed	2025-07-20 13:24:23.268619	2025-07-30 13:41:40.186028	1	\N	\N
261	app.other_borrowers.step2.progress_label	text	navigation	other_borrowers_step1	progress	Step 2 progress label	t	\N	completed	2025-07-20 13:24:23.961429	2025-07-30 13:41:40.186028	1	\N	\N
262	app.other_borrowers.step2.income_title	text	form	other_borrowers_step2	title	Income section title for other borrowers	t	\N	completed	2025-07-20 13:24:24.656706	2025-07-30 13:41:40.186028	1	\N	\N
1724	credit_step3.field.obligations.obligations_other	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
322	sms_modal_privacy_policy	text	modal	sms_verification	link	\N	t	\N	completed	2025-07-20 16:21:39.476455	2025-07-30 13:41:40.186028	1	\N	\N
280	app.refinance.step1.title	text	form	refinance_step1	title	Refinance mortgage page title	t	\N	completed	2025-07-20 14:42:50.157505	2025-07-30 13:41:40.186028	1	\N	\N
281	app.refinance.step1.subtitle	text	form	refinance_step1	subtitle	Refinance mortgage subtitle	t	\N	completed	2025-07-20 14:42:50.689228	2025-07-30 13:41:40.186028	1	\N	\N
282	app.refinance.step1.why_label	text	form	refinance_step1	label	Purpose of refinance field label	t	\N	completed	2025-07-20 14:42:51.294359	2025-07-30 13:41:40.186028	1	\N	\N
283	app.refinance.step1.balance_label	text	form	refinance_step1	label	Mortgage balance field label	t	\N	completed	2025-07-20 14:42:51.960042	2025-07-30 13:41:40.186028	1	\N	\N
284	app.refinance.step1.property_value_label	text	form	refinance_step1	label	Current property value field label	t	\N	completed	2025-07-20 14:42:52.515702	2025-07-30 13:41:40.186028	1	\N	\N
285	app.refinance.step1.property_type_label	text	form	refinance_step1	label	Property type field label	t	\N	completed	2025-07-20 14:42:53.130812	2025-07-30 13:41:40.186028	1	\N	\N
286	app.refinance.step1.current_bank_label	text	form	refinance_step1	label	Current mortgage bank field label	t	\N	completed	2025-07-20 14:42:53.671137	2025-07-30 13:41:40.186028	1	\N	\N
287	app.refinance.step1.registered_label	text	form	refinance_step1	label	Is mortgage registered field label	t	\N	completed	2025-07-20 14:42:54.287534	2025-07-30 13:41:40.186028	1	\N	\N
288	app.refinance.step1.start_date_label	text	form	refinance_step1	label	Mortgage start date field label	t	\N	completed	2025-07-20 14:42:54.819886	2025-07-30 13:41:40.186028	1	\N	\N
263	app.mortgage.step4.title	text	form	mortgage_step4	title	Step 4 application summary title	t	\N	completed	2025-07-20 14:21:24.439883	2025-07-30 13:41:40.186028	1	\N	11.0
264	app.mortgage.step4.warning	text	legal	mortgage_step4	disclaimer	Legal disclaimer about calculation estimates	t	\N	completed	2025-07-20 14:21:24.978698	2025-07-30 13:41:40.186028	1	\N	11.0
265	app.mortgage.step4.parameters_title	text	form	mortgage_step4	section_header	Calculation parameters section title	t	\N	completed	2025-07-20 14:21:25.600497	2025-07-30 13:41:40.186028	1	\N	11.0
266	app.mortgage.step4.profile_title	text	form	mortgage_step4	section_header	Personal profile section title	t	\N	completed	2025-07-20 14:21:26.15849	2025-07-30 13:41:40.186028	1	\N	11.0
267	app.mortgage.step4.filter_title	text	form	mortgage_step4	section_header	Mortgage filter section title	t	\N	completed	2025-07-20 14:21:26.70653	2025-07-30 13:41:40.186028	1	\N	11.0
268	app.mortgage.step4.parameters_initial	text	form	mortgage_step4	label	Basic parameters label	t	\N	completed	2025-07-20 14:21:27.241137	2025-07-30 13:41:40.186028	1	\N	11.0
269	app.mortgage.step4.parameters_cost	text	form	mortgage_step4	label	Mortgage cost label	t	\N	completed	2025-07-20 14:21:27.765924	2025-07-30 13:41:40.186028	1	\N	11.0
270	app.mortgage.step4.parameters_period	text	form	mortgage_step4	label	Mortgage period label	t	\N	completed	2025-07-20 14:21:28.319276	2025-07-30 13:41:40.186028	1	\N	11.0
271	app.mortgage.step4.parameters_months	text	form	mortgage_step4	unit	Months unit label	t	\N	completed	2025-07-20 14:21:28.855423	2025-07-30 13:41:40.186028	1	\N	11.0
289	app.refinance.step1.mortgage_details_title	text	form	refinance_step1	section_header	Mortgage details section title	t	\N	completed	2025-07-20 14:42:55.34442	2025-07-30 13:41:40.186028	1	\N	\N
290	app.refinance.step1.desired_period_label	text	form	refinance_step1	label	Desired mortgage period field label	t	\N	completed	2025-07-20 14:42:55.943761	2025-07-30 13:41:40.186028	1	\N	\N
291	app.refinance.step1.monthly_payment_label	text	form	refinance_step1	label	Monthly payment field label	t	\N	completed	2025-07-20 14:42:56.525754	2025-07-30 13:41:40.186028	1	\N	\N
292	app.refinance.step1.program_header	text	form	refinance_step1	table_header	Program table header	t	\N	completed	2025-07-20 14:42:57.147649	2025-07-30 13:41:40.186028	1	\N	\N
293	app.refinance.step1.balance_header	text	form	refinance_step1	table_header	Balance table header	t	\N	completed	2025-07-20 14:42:57.807967	2025-07-30 13:41:40.186028	1	\N	\N
294	app.refinance.step1.end_date_header	text	form	refinance_step1	table_header	End date table header	t	\N	completed	2025-07-20 14:42:58.334077	2025-07-30 13:41:40.186028	1	\N	\N
1727	refinance_mortgage_step1.field.loan_period.period_5_years	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1412	mortgage_prime_percent	text	program_types	bank_offers	label	\N	t	\N	pending	2025-07-27 05:49:14.091106	2025-07-30 13:41:40.186028	\N	\N	\N
663	about_title	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
664	about_desc	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
665	about_how_it_work	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
666	about_how_it_work_text	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
667	bankimonline	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
668	about_how_it_work_text_second	text	page_content	about	text	\N	t	\N	migrated	2025-07-22 12:30:41.345835	2025-07-30 13:41:40.186028	1	\N	\N
295	app.refinance.step1.interest_rate_header	text	form	refinance_step1	table_header	Interest rate table header	t	\N	completed	2025-07-20 14:42:58.905817	2025-07-30 13:41:40.186028	1	\N	\N
296	app.refinance.step1.add_program_button	text	form	refinance_step1	button	Add program button text	t	\N	completed	2025-07-20 14:42:59.426911	2025-07-30 13:41:40.186028	1	\N	\N
314	sms_modal_title	text	modal	sms_verification	heading	\N	t	\N	completed	2025-07-20 16:20:45.346836	2025-07-30 13:41:40.186028	1	\N	\N
315	sms_modal_subtitle	text	modal	sms_verification	text	\N	t	\N	completed	2025-07-20 16:21:02.603142	2025-07-30 13:41:40.186028	1	\N	\N
316	sms_modal_name_placeholder	text	modal	sms_verification	input	\N	t	\N	completed	2025-07-20 16:21:03.257941	2025-07-30 13:41:40.186028	1	\N	\N
317	sms_modal_phone_placeholder	text	modal	sms_verification	input	\N	t	\N	completed	2025-07-20 16:21:03.826926	2025-07-30 13:41:40.186028	1	\N	\N
318	sms_modal_continue_button	text	modal	sms_verification	button	\N	t	\N	completed	2025-07-20 16:21:04.364753	2025-07-30 13:41:40.186028	1	\N	\N
319	sms_modal_agreement_start	text	modal	sms_verification	text	\N	t	\N	completed	2025-07-20 16:21:05.009095	2025-07-30 13:41:40.186028	1	\N	\N
320	sms_modal_user_agreement	text	modal	sms_verification	link	\N	t	\N	completed	2025-07-20 16:21:38.24109	2025-07-30 13:41:40.186028	1	\N	\N
321	sms_modal_and_text	text	modal	sms_verification	text	\N	t	\N	completed	2025-07-20 16:21:38.952675	2025-07-30 13:41:40.186028	1	\N	\N
323	sms_modal_already_client	text	modal	sms_verification	text	\N	t	\N	completed	2025-07-20 16:21:39.936255	2025-07-30 13:41:40.186028	1	\N	\N
324	sms_modal_login_here	text	modal	sms_verification	link	\N	t	\N	completed	2025-07-20 16:21:40.417809	2025-07-30 13:41:40.186028	1	\N	\N
325	sms_modal_close	text	modal	sms_verification	button	\N	t	\N	completed	2025-07-20 16:21:40.893189	2025-07-30 13:41:40.186028	1	\N	\N
326	sms_code_modal_title	text	modal	sms_code_verification	heading	\N	t	\N	completed	2025-07-20 16:56:16.224355	2025-07-30 13:41:40.186028	1	\N	\N
327	sms_code_modal_subtitle	text	modal	sms_code_verification	text	\N	t	\N	completed	2025-07-20 16:56:17.034028	2025-07-30 13:41:40.186028	1	\N	\N
328	sms_code_not_received	text	modal	sms_code_verification	text	\N	t	\N	completed	2025-07-20 16:56:17.505972	2025-07-30 13:41:40.186028	1	\N	\N
329	sms_code_send_again	text	modal	sms_code_verification	link	\N	t	\N	completed	2025-07-20 16:56:18.030959	2025-07-30 13:41:40.186028	1	\N	\N
330	sms_code_verify_button	text	modal	sms_code_verification	button	\N	t	\N	completed	2025-07-20 16:56:18.530075	2025-07-30 13:41:40.186028	1	\N	\N
331	refinance_step2_title	text	form	refinance_step2	heading	\N	t	\N	completed	2025-07-20 17:25:57.785875	2025-07-30 13:41:40.186028	1	\N	\N
332	refinance_step3_title	text	form	refinance_step3	heading	\N	t	\N	completed	2025-07-20 17:40:50.825863	2025-07-30 13:41:40.186028	1	\N	\N
312	refinance_step1_bank_discount	text	form	refinance_step1	option	Discount Bank option	t	\N	completed	2025-07-20 14:43:24.999394	2025-07-30 13:41:40.186028	1	\N	\N
310	refinance_step1_bank_hapoalim	text	form	refinance_step1	option	Bank Hapoalim option	t	\N	completed	2025-07-20 14:43:24.008347	2025-07-30 13:41:40.186028	1	\N	\N
1728	refinance_mortgage_step1.field.loan_period.period_10_years	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1729	refinance_mortgage_step1.field.loan_period.period_15_years	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1730	refinance_mortgage_step1.field.loan_period.period_20_years	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1269	calculate_mortgage_add_partner_as_primary_borrower	text	form	refinance_credit_2	option	As primary borrower	t	\N	pending	2025-07-26 08:09:45.776923	2025-07-30 21:48:08.757559	\N	\N	\N
1270	calculate_mortgage_add_partner_as_secondary_borrower	text	form	refinance_credit_2	option	As secondary borrower	t	\N	pending	2025-07-26 08:09:45.776923	2025-07-30 21:48:08.757559	\N	\N	\N
1271	calculate_mortgage_add_partner_no	text	form	refinance_credit_2	option	No	t	\N	pending	2025-07-26 08:09:45.776923	2025-07-30 21:48:08.757559	\N	\N	\N
1731	refinance_mortgage_step1.field.loan_period.period_25_years	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1514	mortgage_step2.button.add_partner	text	buttons	mortgage_step2	button	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-30 13:41:40.186028	1	1	\N
1732	refinance_mortgage_step1.field.loan_period.period_30_years	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1734	refinance_mortgage_step1.field.loan_purpose.purpose_investment	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1735	refinance_mortgage_step1.field.loan_purpose.purpose_personal	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1736	refinance_mortgage_step1.field.loan_purpose.purpose_business	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1737	refinance_mortgage_step1.field.loan_purpose.purpose_other	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1738	refinance_mortgage_step1.field.city	text	form	refinance_mortgage_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1739	refinance_mortgage_step1.field.when_needed	text	form	refinance_mortgage_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1740	refinance_mortgage_step1.field.when_needed.when_needed_within_3_months	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1741	refinance_mortgage_step1.field.when_needed.when_needed_3_to_6_months	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1742	refinance_mortgage_step1.field.when_needed.when_needed_6_to_12_months	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1314	refinance_credit_debt_types_no_obligations	text	form	refinance_credit_3	option	No obligations	t	\N	pending	2025-07-26 08:09:48.961735	2025-07-30 21:48:08.757559	\N	\N	\N
1315	refinance_credit_debt_types_bank_loan	text	form	refinance_credit_3	option	Bank loan	t	\N	pending	2025-07-26 08:09:48.961735	2025-07-30 21:48:08.757559	\N	\N	\N
1478	mortgage_step1.field.first_home	text	form	mortgage_step1	dropdown_container	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.188794	1	1	\N
413	tenders_for_brokers_license_features_feature1_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
418	tenders_for_brokers_license_features_feature2_p1	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
419	tenders_for_brokers_license_features_feature2_p2	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
420	tenders_for_brokers_license_features_feature2_p3	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
717	contacts_fax	text	contact_info	contacts	text	\N	t	\N	migrated	2025-07-22 12:31:43.473465	2025-07-30 13:41:40.186028	1	\N	\N
1743	refinance_mortgage_step1.field.when_needed.when_needed_over_12_months	text	form	refinance_mortgage_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
394	cooperation_title	text	hero	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
395	cooperation_subtitle	text	hero	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
396	register_partner_program	text	hero	cooperation	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
397	marketplace_title	text	marketplace	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
398	marketplace_description	text	marketplace	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
399	feature_mortgage_calc	text	marketplace	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
400	feature_mortgage_refinance	text	marketplace	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
403	one_click_mortgage	text	marketplace	cooperation	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1744	refinance_mortgage_step2.field.education	text	form	refinance_mortgage_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1745	refinance_mortgage_step2.field.education.education_no_high_school_diploma	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1746	refinance_mortgage_step2.field.education.education_partial_high_school_diploma	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1747	refinance_mortgage_step2.field.education.education_full_high_school_diploma	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
404	referral_title	text	referral	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
405	referral_description	text	referral	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
406	cooperation_cta_title	text	cta	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
410	tenders_hero_b3	text	hero	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
411	tenders_hero_cta	text	hero	tenders_for_brokers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
412	tenders_license_title	text	license	tenders_for_brokers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
425	tenders_steps_title	text	steps	tenders_for_brokers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
436	tenders_metrics_title	text	metrics	tenders_for_brokers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
437	tenders_metrics_prospects_label	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
438	tenders_metrics_prospects_value	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
439	tenders_metrics_investment_label	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
440	tenders_metrics_investment_display	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
441	tenders_metrics_payback_label	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1748	refinance_mortgage_step2.field.education.education_postsecondary_education	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
442	tenders_metrics_payback_display	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
443	tenders_metrics_disclaimer	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
444	tenders_metrics_button	text	metrics	tenders_for_brokers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
445	franchise_main_hero_title	text	main_hero	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
446	franchise_main_hero_benefit_income	text	main_hero	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
447	franchise_main_hero_benefit_turnover	text	main_hero	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
448	franchise_main_hero_benefit_roi	text	main_hero	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
449	franchise_main_hero_cta	text	main_hero	temporary_franchise	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
450	franchise_hero_title	text	hero	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
451	franchise_hero_description	text	hero	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
452	franchise_hero_cta	text	hero	temporary_franchise	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1749	refinance_mortgage_step2.field.education.education_bachelors	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1750	refinance_mortgage_step2.field.education.education_masters	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1010	mortgage_calculation.field.has_additional_ph	text	form	mortgage_step3	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
274	mortgage_step4_filter_fixed_rate_mortgages	text	form	mortgage_step4	option	Fixed rate mortgages filter option	t	\N	completed	2025-07-20 14:21:30.455228	2025-07-30 13:41:40.186028	1	\N	11.0
275	mortgage_step4_filter_variable_rate_mortgages	text	form	mortgage_step4	option	Variable rate mortgages filter option	t	\N	completed	2025-07-20 14:21:31.048439	2025-07-30 13:41:40.186028	1	\N	11.0
417	tenders_for_brokers_license_features_feature2_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
422	tenders_for_brokers_license_features_feature3_p1	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
423	tenders_for_brokers_license_features_feature3_p2	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
424	tenders_for_brokers_license_features_feature3_p3	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
421	tenders_for_brokers_license_features_feature3_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
427	tenders_for_brokers_steps_step1_desc	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
426	tenders_for_brokers_steps_step1_title	text	form	tenders_for_brokers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1446	personal_data_gender	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.533913	2025-07-30 13:41:40.186028	\N	\N	1.0
1447	personal_data_gender_ph	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.533913	2025-07-30 13:41:40.186028	\N	\N	1.0
1448	personal_data_gender_option_1	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.533913	2025-07-30 13:41:40.186028	\N	\N	1.0
1449	personal_data_gender_option_2	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.533913	2025-07-30 13:41:40.186028	\N	\N	1.0
1450	personal_data_address	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.616279	2025-07-30 13:41:40.186028	\N	\N	1.0
1451	personal_data_address_ph	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.616279	2025-07-30 13:41:40.186028	\N	\N	1.0
1452	personal_data_document_issue_date	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.696566	2025-07-30 13:41:40.186028	\N	\N	1.0
1453	personal_data_document_issue_date_ph	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.696566	2025-07-30 13:41:40.186028	\N	\N	1.0
1454	personal_data_id_document	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.778143	2025-07-30 13:41:40.186028	\N	\N	1.0
1455	personal_data_id_document_ph	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.778143	2025-07-30 13:41:40.186028	\N	\N	1.0
1456	personal_data_property_ownership	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.860031	2025-07-30 13:41:40.186028	\N	\N	1.0
1457	personal_data_property_ownership_ph	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.860031	2025-07-30 13:41:40.186028	\N	\N	1.0
1458	personal_data_property_ownership_option_1	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.860031	2025-07-30 13:41:40.186028	\N	\N	1.0
1459	personal_data_property_ownership_option_2	text	form	mortgage_step2	text	\N	t	\N	pending	2025-07-29 10:02:48.860031	2025-07-30 13:41:40.186028	\N	\N	1.0
1751	refinance_mortgage_step2.field.education.education_doctorate	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1752	refinance_mortgage_step2.field.family_status	text	form	refinance_mortgage_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
468	temporary_franchise_includes_turnkey_benefit_office	text	form	temporary_franchise	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
453	franchise_client_sources_title	text	client_sources	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
454	franchise_client_sources_description	text	client_sources	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
455	franchise_client_service_mortgage_calc	text	client_sources	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
456	franchise_client_service_mortgage_refinance	text	client_sources	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
459	franchise_partnership_title	text	partnership	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1753	refinance_mortgage_step2.field.family_status.family_status_single	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1479	mortgage_step1.field.first_home_ph	text	form	mortgage_step1	placeholder	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-30 21:48:08.757559	1	1	\N
1754	refinance_mortgage_step2.field.family_status.family_status_married	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1484	mortgage_step1.field.property_ownership_ph	text	form	mortgage_step1	placeholder	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-30 21:48:08.757559	1	1	\N
1755	refinance_mortgage_step2.field.family_status.family_status_divorced	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1492	mortgage_step2.field.citizenship_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-30 21:48:08.757559	1	1	\N
1756	refinance_mortgage_step2.field.family_status.family_status_widowed	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1494	mortgage_step2.field.education_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-30 21:48:08.757559	1	1	\N
1757	refinance_mortgage_step2.field.family_status.family_status_commonlaw_partner	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1503	mortgage_step2.field.family_status_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-30 21:48:08.757559	1	1	\N
1240	calculate_mortgage_family_status	text	form	refinance_credit_2	dropdown	Marital status	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 21:48:08.757559	\N	\N	\N
1758	refinance_mortgage_step2.field.family_status.family_status_other	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1759	refinance_mortgage_step2.field.citizenship	text	form	refinance_mortgage_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1760	refinance_mortgage_step2.field.citizenship.citizenship_israel	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1516	mortgage_step2.field.name_surname_ph	text	form	mortgage_step2	placeholder	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-30 21:48:08.757559	1	1	\N
1254	calculate_mortgage_family_status_single	text	form	refinance_credit_2	option	Single	t	\N	pending	2025-07-26 08:09:45.604887	2025-07-30 21:48:08.757559	\N	\N	\N
1255	calculate_mortgage_family_status_married	text	form	refinance_credit_2	option	Married	t	\N	pending	2025-07-26 08:09:45.604887	2025-07-30 21:48:08.757559	\N	\N	\N
1256	calculate_mortgage_family_status_divorced	text	form	refinance_credit_2	option	Divorced	t	\N	pending	2025-07-26 08:09:45.604887	2025-07-30 21:48:08.757559	\N	\N	\N
1761	refinance_mortgage_step2.field.citizenship.citizenship_united_states	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1468	mortgage_step1.field.when_needed_within_3_months	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
1469	mortgage_step1.field.when_needed_3_to_6_months	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
1470	mortgage_step1.field.when_needed_6_to_12_months	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
1471	mortgage_step1.field.when_needed_over_12_months	text	form	mortgage_step1	dropdown_option	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.313729	1	1	\N
1762	refinance_mortgage_step2.field.citizenship.citizenship_canada	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
931	mortgage_calculation.section.profile_title	text	headers	mortgage_step4	section_header	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
1763	refinance_mortgage_step2.field.citizenship.citizenship_united_kingdom	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1764	refinance_mortgage_step2.field.citizenship.citizenship_france	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1765	refinance_mortgage_step2.field.citizenship.citizenship_germany	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1766	refinance_mortgage_step2.field.citizenship.citizenship_russia	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1767	refinance_mortgage_step2.field.citizenship.citizenship_ukraine	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1768	refinance_mortgage_step2.field.citizenship.citizenship_other	text	form	refinance_mortgage_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1769	refinance_mortgage_step2.field.how_much_childrens	text	form	refinance_mortgage_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1770	refinance_mortgage_step3.field.main_source	text	form	refinance_mortgage_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1771	refinance_mortgage_step3.field.main_source.main_source_employee	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
720	app.refinance_credit.step1.title	text	form	refinance_credit_1	title	Credit refinance page title	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
721	app.refinance_credit.step1.subtitle	text	form	refinance_credit_1	subtitle	Credit refinance banner subtitle	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
1772	refinance_mortgage_step3.field.main_source.main_source_selfemployed	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1773	refinance_mortgage_step3.field.main_source.main_source_unemployed	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1774	refinance_mortgage_step3.field.main_source.main_source_student	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1465	mortgage_step1.field.city	text	form	mortgage_step1	label	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-08-16 22:32:11.152616	1	1	\N
460	franchise_partnership_description	text	partnership	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
461	franchise_partnership_service_buy	text	partnership	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
462	franchise_partnership_service_rent	text	partnership	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
463	franchise_partnership_service_sell	text	partnership	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
464	franchise_partnership_service_lease	text	partnership	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
465	franchise_partnership_cta	text	partnership	temporary_franchise	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
466	franchise_includes_title	text	includes	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1257	calculate_mortgage_family_status_widowed	text	form	refinance_credit_2	option	Widowed	t	\N	pending	2025-07-26 08:09:45.604887	2025-07-30 21:48:08.757559	\N	\N	\N
1258	calculate_mortgage_family_status_separated	text	form	refinance_credit_2	option	Common-law partner	t	\N	pending	2025-07-26 08:09:45.604887	2025-07-30 21:48:08.757559	\N	\N	\N
1259	calculate_mortgage_family_status_cohabiting	text	form	refinance_credit_2	option	Other	t	\N	pending	2025-07-26 08:09:45.604887	2025-07-30 21:48:08.757559	\N	\N	\N
480	franchise_includes_cta	text	includes	temporary_franchise	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
481	franchise_how_to_open_title	text	steps	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
492	franchise_pricing_title	text	pricing	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
493	franchise_pricing_investments	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
494	franchise_pricing_investments_value	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
495	franchise_pricing_income	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
496	franchise_pricing_income_value	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
497	franchise_pricing_roi	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
498	franchise_pricing_roi_value	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
499	franchise_pricing_note	text	pricing	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
500	franchise_pricing_cta	text	pricing	temporary_franchise	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
501	franchise_final_cta_title	text	final_cta	temporary_franchise	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
502	franchise_final_cta_button	text	final_cta	temporary_franchise	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
503	franchise_final_cta_arrow	text	final_cta	temporary_franchise	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
504	lawyers_hero_title	text	hero	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
505	lawyers_fill_form_button	text	hero	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
506	lawyers_benefit_leads_title	text	hero	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
507	lawyers_benefit_partnership_title	text	hero	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1466	mortgage_step1.field.when_needed	text	form	mortgage_step1	dropdown_container	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.188794	1	1	\N
1472	mortgage_step1.field.type	text	form	mortgage_step1	dropdown_container	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-31 13:09:13.188794	1	1	\N
1775	refinance_mortgage_step3.field.main_source.main_source_pension	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1776	refinance_mortgage_step3.field.main_source.main_source_unpaid_leave	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1777	refinance_mortgage_step3.field.main_source.main_source_other	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1778	refinance_mortgage_step3.field.additional_income	text	form	refinance_mortgage_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
722	app.refinance_credit.step1.why_label	text	form	refinance_credit_1	label	Purpose of credit refinance field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
723	app.refinance_credit.step1.why_placeholder	text	form	refinance_credit_1	placeholder	Purpose of credit refinance placeholder	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
1779	refinance_mortgage_step3.field.additional_income.additional_income_no_additional_income	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1780	refinance_mortgage_step3.field.additional_income.additional_income_additional_salary	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
728	app.refinance_credit.step1.credit_list_title	text	form	refinance_credit_1	section_title	Credit list section title	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
1488	mortgage_step2.field.birth_date	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1489	mortgage_step2.field.children18	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
1490	mortgage_step2.field.how_much_childrens	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-07-31 19:46:42.436634	1	1	\N
508	lawyers_benefit_expansion_title	text	hero	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
509	lawyers_about_title	text	about	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1781	refinance_mortgage_step3.field.additional_income.additional_income_additional_work	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1782	refinance_mortgage_step3.field.additional_income.additional_income_investment	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
510	lawyers_about_description	text	about	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
511	lawyers_about_button	text	about	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1467	mortgage_step1.field.when_needed_ph	text	form	mortgage_step1	placeholder	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-30 21:48:08.757559	1	1	\N
512	lawyers_earnings_info_title	text	earnings	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
513	lawyers_earnings_info_card_title	text	earnings	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
514	lawyers_earnings_info_card_description	text	earnings	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
515	lawyers_collaboration_advantages_title	text	collaboration	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
516	lawyers_collaboration_advantages_subtitle	text	collaboration	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
517	lawyers_collaboration_advantage_platform	text	collaboration	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
518	lawyers_collaboration_advantage_marketing	text	collaboration	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
519	lawyers_collaboration_advantage_crm	text	collaboration	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
520	lawyers_collaboration_floating_crm	text	collaboration	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
521	lawyers_collaboration_floating_platform	text	collaboration	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
522	lawyers_collaboration_get_consultation	text	collaboration	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
523	lawyers_how_it_works_process_title	text	process	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
534	lawyers_process_apply_button	text	process	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
535	lawyers_partnership_title	text	partnership	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
536	lawyers_partnership_button	text	partnership	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
538	footer_about	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
539	footer_contacts	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
540	footer_vacancies	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
541	footer_cooperation	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
542	footer_contacts_title	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
543	footer_email	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
544	footer_phone	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
545	footer_admin_contact	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
546	footer_legal	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
547	footer_user_agreement	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
548	footer_privacy_policy	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
549	footer_cookie_policy	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
550	footer_return_policy	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
551	footer_copyright	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1473	mortgage_step1.field.type_ph	text	form	mortgage_step1	placeholder	\N	t	\N	new	2025-07-29 21:29:29.162912	2025-07-30 21:48:08.757559	1	1	\N
724	refinance_credit_why_improve_interest_rate	text	form	refinance_credit_1	option	Improve interest rate option	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
725	refinance_credit_why_reduce_credit_amount	text	form	refinance_credit_1	option	Reduce credit amount option	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
729	app.refinance_credit.step1.bank_label	text	form	refinance_credit_1	label	Bank field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
730	app.refinance_credit.step1.bank_placeholder	text	form	refinance_credit_1	placeholder	Bank field placeholder	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
731	app.refinance_credit.step1.amount_label	text	form	refinance_credit_1	label	Credit amount field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
732	app.refinance_credit.step1.monthly_payment_label	text	form	refinance_credit_1	label	Monthly payment field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
733	app.refinance_credit.step1.start_date_label	text	form	refinance_credit_1	label	Credit start date field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
734	app.refinance_credit.step1.end_date_label	text	form	refinance_credit_1	label	Credit end date field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
1783	refinance_mortgage_step3.field.additional_income.additional_income_property_rental_income	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1784	refinance_mortgage_step3.field.additional_income.additional_income_pension	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1785	refinance_mortgage_step3.field.additional_income.additional_income_other	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1786	refinance_mortgage_step3.field.obligations	text	form	refinance_mortgage_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
552	cooperation_about_title	text	about	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
553	cooperation_about_description_1	text	about	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
554	cooperation_about_description_2	text	about	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
555	cooperation_about_description_3	text	about	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
556	cooperation_earning_title	text	earning	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
557	cooperation_earning_commission_title	text	earning	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
558	cooperation_earning_commission_desc	text	earning	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
559	cooperation_earning_bonus_title	text	earning	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
560	cooperation_earning_bonus_desc	text	earning	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
561	cooperation_earning_targets_title	text	earning	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
562	cooperation_earning_targets_desc	text	earning	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
563	cooperation_steps_title	text	steps	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
574	cooperation_partners_title	text	partners	cooperation	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
575	cooperation_cta_description	text	cta	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
576	cooperation_email	text	contact	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1787	refinance_mortgage_step3.field.obligations.obligations_no_obligations	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1788	refinance_mortgage_step3.field.obligations.obligations_credit_card	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1789	refinance_mortgage_step3.field.obligations.obligations_bank_loan	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1790	refinance_mortgage_step3.field.obligations.obligations_consumer_credit	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1791	refinance_mortgage_step3.field.obligations.obligations_other	text	form	refinance_mortgage_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1794	refinance_credit_step1.field.loan_period.period_5_years	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1795	refinance_credit_step1.field.loan_period.period_10_years	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1796	refinance_credit_step1.field.loan_period.period_15_years	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1797	refinance_credit_step1.field.loan_period.period_20_years	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1798	refinance_credit_step1.field.loan_period.period_25_years	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1799	refinance_credit_step1.field.loan_period.period_30_years	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1801	refinance_credit_step1.field.loan_purpose.purpose_investment	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1802	refinance_credit_step1.field.loan_purpose.purpose_personal	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1803	refinance_credit_step1.field.loan_purpose.purpose_business	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1804	refinance_credit_step1.field.loan_purpose.purpose_other	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
935	mortgage_calculation.field.monthly_payment	text	form	mortgage_step4	dropdown	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
726	refinance_credit_why_increase_term_to_reduce_paymen	text	form	refinance_credit_1	option	Increase term to reduce payment option	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
727	refinance_credit_why_increase_payment_to_reduce_ter	text	form	refinance_credit_1	option	Increase payment to reduce term option	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
304	refinance_step1_program_fixed_interest	text	form	refinance_step1	option	Fixed interest program option	t	\N	completed	2025-07-20 14:43:21.000246	2025-07-30 13:41:40.186028	1	\N	\N
305	refinance_step1_program_variable_interest	text	form	refinance_step1	option	Variable interest program option	t	\N	completed	2025-07-20 14:43:21.494287	2025-07-30 13:41:40.186028	1	\N	\N
1805	refinance_credit_step1.field.city	text	form	refinance_credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1806	refinance_credit_step1.field.when_needed	text	form	refinance_credit_step1	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1807	refinance_credit_step1.field.when_needed.when_needed_within_3_months	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
306	refinance_step1_program_prime_interest	text	form	refinance_step1	option	Prime interest program option	t	\N	completed	2025-07-20 14:43:22.002501	2025-07-30 13:41:40.186028	1	\N	\N
307	refinance_step1_program_mixed_interest	text	form	refinance_step1	option	Mixed interest program option	t	\N	completed	2025-07-20 14:43:22.499966	2025-07-30 13:41:40.186028	1	\N	\N
735	app.refinance_credit.step1.date_placeholder	text	form	refinance_credit_1	placeholder	Date field placeholder	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
736	app.refinance_credit.step1.early_repayment_label	text	form	refinance_credit_1	label	Early repayment field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
737	app.refinance_credit.step1.desired_payment_label	text	form	refinance_credit_1	label	Desired monthly payment field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
738	app.refinance_credit.step1.desired_term_label	text	form	refinance_credit_1	label	Desired term field label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
739	app.refinance_credit.step1.add_credit_button	text	buttons	refinance_credit_1	button	Add credit button text	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
741	app.refinance_credit.step1.remove_modal_title	text	modals	refinance_credit_1	modal_title	Remove credit modal title	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
742	app.refinance_credit.step1.remove_modal_subtitle	text	modals	refinance_credit_1	modal_subtitle	Remove credit modal subtitle	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
743	app.refinance_credit.progress.step1	text	progress	refinance_credit_1	progress_label	Progress bar step 1 label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
744	app.refinance_credit.progress.step2	text	progress	refinance_credit_2	progress_label	Progress bar step 2 label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
745	app.refinance_credit.progress.step3	text	progress	refinance_credit_3	progress_label	Progress bar step 3 label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
746	app.refinance_credit.progress.step4	text	progress	refinance_credit_4	progress_label	Progress bar step 4 label	t	\N	pending	2025-07-22 19:49:55.392095	2025-07-30 13:41:40.186028	\N	\N	\N
311	refinance_step1_bank_leumi	text	form	refinance_step1	option	Bank Leumi option	t	\N	completed	2025-07-20 14:43:24.502847	2025-07-30 13:41:40.186028	1	\N	\N
313	refinance_step1_bank_massad	text	form	refinance_step1	option	Massad Bank option	t	\N	completed	2025-07-20 14:43:25.489433	2025-07-30 13:41:40.186028	1	\N	\N
577	cooperation_phone	text	contact	cooperation	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
578	cooperation_partner_login	text	auth	cooperation	button	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
579	cooperation_register	text	auth	cooperation	button	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
580	tenders_hero_title	text	hero	tenders_for_brokers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
581	tenders_hero_subtitle	text	hero	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
582	tenders_market_b1	text	marketplace	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1808	refinance_credit_step1.field.when_needed.when_needed_3_to_6_months	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1809	refinance_credit_step1.field.when_needed.when_needed_6_to_12_months	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1810	refinance_credit_step1.field.when_needed.when_needed_over_12_months	text	form	refinance_credit_step1	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1811	refinance_credit_step2.field.education	text	form	refinance_credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1812	refinance_credit_step2.field.education.education_no_high_school_diploma	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1561	mortgage_refinance_step_1_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 21:48:08.757559	\N	\N	\N
197	app.mortgage.step2.public_person	text	form	mortgage_step2	label	Public person status - compliance declaration	t	\N	completed	2025-07-20 09:33:56.784151	2025-07-30 21:48:08.757559	1	\N	4.0
1135	refinance_credit_bank_discount	text	form	refinance_credit_1	option	Discount Bank	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 21:48:08.757559	\N	\N	\N
1137	refinance_credit_bank_israel	text	form	refinance_credit_1	option	Bank of Israel	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 21:48:08.757559	\N	\N	\N
1136	refinance_credit_bank_massad	text	form	refinance_credit_1	option	Massad Bank	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 21:48:08.757559	\N	\N	\N
1411	search	text	form	mortgage_step3	placeholder	\N	t	search	pending	2025-07-26 15:29:42.647525	2025-07-30 21:48:08.757559	\N	\N	7.0
1406	calculate_mortgage_sfere	text	form	mortgage_step3	label	\N	t	calculate_mortgage_sfere	pending	2025-07-26 15:29:42.647525	2025-07-30 21:48:08.757559	\N	\N	7.0
1813	refinance_credit_step2.field.education.education_partial_high_school_diploma	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1814	refinance_credit_step2.field.education.education_full_high_school_diploma	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1815	refinance_credit_step2.field.education.education_postsecondary_education	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1816	refinance_credit_step2.field.education.education_bachelors	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1817	refinance_credit_step2.field.education.education_masters	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1818	refinance_credit_step2.field.education.education_doctorate	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
308	refinance_step1_program_other	text	form	refinance_step1	option	Other program option	t	\N	completed	2025-07-20 14:43:22.994012	2025-07-30 13:41:40.186028	1	\N	\N
1139	credit_refinance_why_ph	text	form_field	refinance_credit_1	text	Select goal	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1140	bank_apply_credit	text	form_field	refinance_credit_1	text	Bank	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1141	amount_credit_title	text	form_field	refinance_credit_1	text	Credit amount	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1142	calculate_mortgage_initial_payment	text	form_field	refinance_credit_1	text	Monthly payment	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1143	refinance_credit_start_date	text	form_field	refinance_credit_1	text	Start date	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1144	refinance_credit_end_date	text	form_field	refinance_credit_1	text	End date	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1145	early_repayment	text	form_field	refinance_credit_1	text	Early repayment amount	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1146	desired_monthly_payment	text	form_field	refinance_credit_1	text	Desired monthly payment	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1147	credit_loan_period	text	form_field	refinance_credit_1	text	Desired loan period	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1148	list_credits_title	text	section	refinance_credit_1	text	List of existing credits	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1150	credit_refinance_title	text	page	refinance_credit_1	text	Credit Refinancing	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1151	calculate_mortgage_first_ph	text	form_field	refinance_credit_1	text	Select property status	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1152	date_ph	text	form_field	refinance_credit_1	text	Select date	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1153	remove_credit	text	text	refinance_credit_1	text	Delete loan details?	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1154	remove_credit_subtitle	text	text	refinance_credit_1	text	By clicking confirm, all details of this loan will be deleted	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1836	refinance_credit_step2.field.how_much_childrens	text	form	refinance_credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1156	calculate_mortgage_period_units_min	text	text	refinance_credit_1	text	years	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1157	calculate_mortgage_period_units_max	text	text	refinance_credit_1	text	years	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 13:41:40.186028	\N	\N	\N
1215	refinance_credit_final	text	page	refinance_credit_4	text	Credit Refinancing Results	t	\N	pending	2025-07-26 08:07:58.402071	2025-07-30 13:41:40.186028	\N	\N	\N
1216	refinance_credit_warning	text	warning	refinance_credit_4	text	The results above are estimates only for refinancing existing credit and do not constitute a commitment. To receive binding offers from banks, you must complete the registration process.	t	\N	pending	2025-07-26 08:07:58.402071	2025-07-30 13:41:40.186028	\N	\N	\N
1217	refinance_credit_new_amount	text	result_field	refinance_credit_4	text	New loan amount	t	\N	pending	2025-07-26 08:07:58.402071	2025-07-30 13:41:40.186028	\N	\N	\N
583	tenders_market_b2	text	marketplace	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
584	tenders_clients_text	text	clients	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
590	tenders_metrics_investment_title	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
591	tenders_metrics_investment_value	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
592	tenders_metrics_income_title	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
593	tenders_metrics_income_value	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
594	tenders_metrics_payback_title	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
595	tenders_metrics_payback_value	text	metrics	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1819	refinance_credit_step2.field.family_status	text	form	refinance_credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1820	refinance_credit_step2.field.family_status.family_status_single	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1821	refinance_credit_step2.field.family_status.family_status_married	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1822	refinance_credit_step2.field.family_status.family_status_divorced	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1823	refinance_credit_step2.field.family_status.family_status_widowed	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1824	refinance_credit_step2.field.family_status.family_status_commonlaw_partner	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1825	refinance_credit_step2.field.family_status.family_status_other	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1826	refinance_credit_step2.field.citizenship	text	form	refinance_credit_step2	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1827	refinance_credit_step2.field.citizenship.citizenship_israel	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1828	refinance_credit_step2.field.citizenship.citizenship_united_states	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1829	refinance_credit_step2.field.citizenship.citizenship_canada	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1830	refinance_credit_step2.field.citizenship.citizenship_united_kingdom	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1831	refinance_credit_step2.field.citizenship.citizenship_france	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1832	refinance_credit_step2.field.citizenship.citizenship_germany	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1833	refinance_credit_step2.field.citizenship.citizenship_russia	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1834	refinance_credit_step2.field.citizenship.citizenship_ukraine	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1835	refinance_credit_step2.field.citizenship.citizenship_other	text	form	refinance_credit_step2	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1837	refinance_credit_step3.field.main_source	text	form	refinance_credit_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1218	refinance_credit_new_monthly	text	result_field	refinance_credit_4	text	New monthly payment	t	\N	pending	2025-07-26 08:07:58.402071	2025-07-30 13:41:40.186028	\N	\N	\N
1219	refinance_credit_monthly_saving	text	result_field	refinance_credit_4	text	Monthly savings	t	\N	pending	2025-07-26 08:07:58.402071	2025-07-30 13:41:40.186028	\N	\N	\N
1220	refinance_credit_total_saving	text	result_field	refinance_credit_4	text	Total savings	t	\N	pending	2025-07-26 08:07:58.402071	2025-07-30 13:41:40.186028	\N	\N	\N
1221	calculate_mortgage_step2_title	text	page	refinance_credit_2	text	Personal Details	t	\N	pending	2025-07-26 08:09:45.254772	2025-07-30 13:41:40.186028	\N	\N	\N
1222	calculate_mortgage_name	text	form_field	refinance_credit_2	text	Full name	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1223	calculate_mortgage_name_ph	text	form_field	refinance_credit_2	text	Enter full name	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1838	refinance_credit_step3.field.main_source.main_source_employee	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1230	calculate_mortgage_citizenships_dropdown_ph	text	form_field	refinance_credit_2	text	Select countries	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1231	calculate_mortgage_taxes	text	form_field	refinance_credit_2	text	Do you pay taxes abroad?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1232	calculate_mortgage_countries_pay_taxes	text	form_field	refinance_credit_2	text	Countries where you pay taxes	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1233	calculate_mortgage_countries_pay_taxes_ph	text	form_field	refinance_credit_2	text	Select countries	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1234	calculate_mortgage_childrens	text	form_field	refinance_credit_2	text	Do you have children?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1235	calculate_mortgage_how_much_childrens	text	form_field	refinance_credit_2	text	Number of children	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1236	calculate_mortgage_medical_insurance	text	form_field	refinance_credit_2	text	Do you have medical insurance?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1237	calculate_mortgage_is_foreigner	text	form_field	refinance_credit_2	text	Are you a foreign resident?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1238	calculate_mortgage_public_person	text	form_field	refinance_credit_2	text	Are you a public figure?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
537	footer_company	text	footer	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
596	lawyers_benefit_leads_desc	text	hero	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
597	lawyers_benefit_partnership_desc	text	hero	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
598	lawyers_benefit_expansion_desc	text	hero	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
599	lawyers_earning_title	text	earnings	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
600	lawyers_earning_card_title	text	earnings	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
601	lawyers_earning_card_description	text	earnings	tenders_for_lawyers	text	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
602	lawyers_cta_title	text	cta	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
603	lawyers_steps_title	text	steps	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
614	lawyers_apply_button	text	steps	tenders_for_lawyers	button	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
615	lawyers_advantages_title	text	advantages	tenders_for_lawyers	heading	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
638	contacts_secretary_email	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
639	contacts_secretary_link	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
640	contacts_tech_support_phone	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
641	contacts_tech_support_email	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
642	contacts_tech_support_link	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
643	contacts_customer_service_phone	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
644	contacts_customer_service_email	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
645	contacts_customer_service_link	text	contact	contacts	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	\N
1133	refinance_credit_bank_hapoalim	text	form	refinance_credit_1	option	Bank Hapoalim	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 21:48:08.757559	\N	\N	\N
1839	refinance_credit_step3.field.main_source.main_source_selfemployed	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1840	refinance_credit_step3.field.main_source.main_source_unemployed	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1841	refinance_credit_step3.field.main_source.main_source_student	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1842	refinance_credit_step3.field.main_source.main_source_pension	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1843	refinance_credit_step3.field.main_source.main_source_unpaid_leave	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1844	refinance_credit_step3.field.main_source.main_source_other	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1845	refinance_credit_step3.field.additional_income	text	form	refinance_credit_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1846	refinance_credit_step3.field.additional_income.additional_income_no_additional_income	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1847	refinance_credit_step3.field.additional_income.additional_income_additional_salary	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1848	refinance_credit_step3.field.additional_income.additional_income_additional_work	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1849	refinance_credit_step3.field.additional_income.additional_income_investment	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1850	refinance_credit_step3.field.additional_income.additional_income_property_rental_income	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1851	refinance_credit_step3.field.additional_income.additional_income_pension	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1852	refinance_credit_step3.field.additional_income.additional_income_other	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
302	refinance_step1_registration_land	text	form	refinance_step1	option	Yes, registered in land registry option	t	\N	completed	2025-07-20 14:43:20.007163	2025-07-30 13:41:40.186028	1	\N	\N
303	refinance_step1_registration_no_not_registered	text	form	refinance_step1	option	No, not registered option	t	\N	completed	2025-07-20 14:43:20.504606	2025-07-30 13:41:40.186028	1	\N	\N
297	refinance_step1_why_lower_interest_rate	text	form	refinance_step1	option	Lower interest rate refinance option	t	\N	completed	2025-07-20 14:43:17.447038	2025-07-30 13:41:40.186028	1	\N	\N
298	refinance_step1_why_reduce_monthly_payment	text	form	refinance_step1	option	Reduce monthly payment refinance option	t	\N	completed	2025-07-20 14:43:17.964229	2025-07-30 13:41:40.186028	1	\N	\N
299	refinance_step1_why_shorten_mortgage_term	text	form	refinance_step1	option	Shorten mortgage term refinance option	t	\N	completed	2025-07-20 14:43:18.477863	2025-07-30 13:41:40.186028	1	\N	\N
1239	calculate_mortgage_borrowers	text	form_field	refinance_credit_2	text	Are there other borrowers?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1241	calculate_mortgage_family_status_ph	text	form_field	refinance_credit_2	text	Select marital status	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1242	calculate_mortgage_partner_pay_mortgage	text	form_field	refinance_credit_2	text	Will your partner participate in loan payments?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1244	calculate_mortgage_add_partner_ph	text	form_field	refinance_credit_2	text	Select option	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1245	calculate_mortgage_yes	text	text	refinance_credit_2	text	Yes	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1246	calculate_mortgage_no	text	text	refinance_credit_2	text	No	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 13:41:40.186028	\N	\N	\N
1524	app.mortgage_refi.step1.button	text	buttons	refinance_mortgage_1	button	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1526	app.mortgage_refi.step2.button	text	buttons	refinance_mortgage_2	button	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1528	app.mortgage_refi.step3.button	text	buttons	refinance_mortgage_3	button	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1530	app.mortgage_refi.step4.button	text	buttons	refinance_mortgage_4	button	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1523	app.mortgage_refi.step1.description	text	text	refinance_mortgage_1	text	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1525	app.mortgage_refi.step2.description	text	text	refinance_mortgage_2	text	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1527	app.mortgage_refi.step3.description	text	text	refinance_mortgage_3	text	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1529	app.mortgage_refi.step4.description	text	text	refinance_mortgage_4	text	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1521	app.mortgage_refi.step3.title	text	headers	refinance_mortgage_3	title	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1522	app.mortgage_refi.step4.title	text	headers	refinance_mortgage_4	title	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
605	tenders_for_lawyers_steps_step_1_desc	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
604	tenders_for_lawyers_steps_step_1_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
625	sidebar_company_1	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
627	sidebar_company_3	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
628	sidebar_company_4	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
629	sidebar_company_5	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
630	sidebar_company_6	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
632	sidebar_business_1	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
633	sidebar_business_2	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
634	sidebar_business_3	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
635	sidebar_business_4	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
624	sidebar_company	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
631	sidebar_business	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-07-30 13:41:40.186028	\N	\N	1.1
1531	refinance_credit_bank	text	form	refinance_credit_1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1532	refinance_credit_why	text	form	refinance_credit_1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1533	refinance_credit_debt_types	text	form	refinance_credit_3	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1534	refinance_credit_additional_income	text	form	refinance_credit_3	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1535	refinance_credit_main_source	text	form	refinance_credit_3	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1536	refinance_step1_bank	text	form	refinance_step1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1853	refinance_credit_step3.field.obligations	text	form	refinance_credit_step3	dropdown_container	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1854	refinance_credit_step3.field.obligations.obligations_no_obligations	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1855	refinance_credit_step3.field.obligations.obligations_credit_card	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1856	refinance_credit_step3.field.obligations.obligations_bank_loan	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1857	refinance_credit_step3.field.obligations.obligations_consumer_credit	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1858	refinance_credit_step3.field.obligations.obligations_other	text	form	refinance_credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1916	mortgage_step3.field.bank_hapoalim	text	ui	mortgage_step3	dropdown_option	Bank Hapoalim option	t	\N	pending	2025-08-02 13:33:52.993526	2025-08-02 13:33:52.993526	1	\N	\N
626	sidebar_company_2	text	navigation	sidebar	text	\N	t	\N	completed	2025-07-22 08:07:06.006194	2025-08-01 06:02:02.759329	\N	\N	1.1
1917	mortgage_step3.field.bank_leumi	text	ui	mortgage_step3	dropdown_option	Bank Leumi option	t	\N	pending	2025-08-02 13:33:53.512293	2025-08-02 13:33:53.512293	1	\N	\N
1918	mortgage_step3.field.bank_discount	text	ui	mortgage_step3	dropdown_option	Bank Discount option	t	\N	pending	2025-08-02 13:33:54.018819	2025-08-02 13:33:54.018819	1	\N	\N
1919	mortgage_step3.field.bank_massad	text	ui	mortgage_step3	dropdown_option	Bank Massad option	t	\N	pending	2025-08-02 13:33:54.519091	2025-08-02 13:33:54.519091	1	\N	\N
4	app.mortgage.step1.dropdown.property_ownership	json	form	mortgage_step1	dropdown_container	Property ownership dropdown options	t	\N	completed	2025-07-17 16:54:29.265678	2025-07-31 13:09:13.188794	1	\N	2.0
1155	delete	text	action	refinance_credit_1	text	Delete	t	\N	pending	2025-07-26 08:07:56.940543	2025-08-01 05:18:49.919995	\N	\N	\N
1920	obligation_monthly_payment_title	text	ui	common	label	Monthly payment title for obligation modal	t	\N	pending	2025-08-02 13:45:47.230112	2025-08-02 13:45:47.230112	1	\N	\N
1921	obligation_monthly_payment_placeholder	text	ui	common	placeholder	Monthly payment placeholder for obligation modal	t	\N	pending	2025-08-02 13:45:53.980308	2025-08-02 13:45:53.980308	1	\N	\N
2104	calculate_mortgage_first_home_option_2	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:07.759793	2025-08-08 08:42:07.759793	\N	\N	\N
300	refinance_step1_why_cash_out_refinance	text	form	refinance_step1	option	Cash out refinance option	t	\N	completed	2025-07-20 14:43:18.980158	2025-07-30 13:41:40.186028	1	\N	\N
301	refinance_step1_why_consolidate_debts	text	form	refinance_step1	option	Consolidate debts refinance option	t	\N	completed	2025-07-20 14:43:19.480588	2025-07-30 13:41:40.186028	1	\N	\N
2105	calculate_mortgage_first_home_option_3	text	dropdown	mortgage_calculation	option	\N	t	\N	pending	2025-08-08 08:42:08.180691	2025-08-08 08:42:08.180691	\N	\N	\N
1278	calculate_mortgage_step3_title	text	page	refinance_credit_3	text	Income Details	t	\N	pending	2025-07-26 08:09:47.359704	2025-07-30 13:41:40.186028	\N	\N	\N
2249	date_placeholder	text	form	common	placeholder	Date input placeholder for different languages	t	\N	pending	2025-08-13 09:57:11.334005	2025-08-13 09:57:11.334005	\N	\N	\N
525	tenders_for_lawyers_process_step_1_description	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
524	tenders_for_lawyers_process_step_1_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
407	tenders_hero_headline	text	hero	tenders_for_brokers	heading	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1537	refinance_step1_program	text	form	refinance_step1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1538	refinance_step1_property_type	text	form	refinance_step1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1539	refinance_step1_registration	text	form	refinance_step1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1540	refinance_step1_why	text	form	refinance_step1	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1544	mortgage_step4_filter	text	form	mortgage_step4	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1545	temporary_franchise_includes	text	form	temporary_franchise	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1546	temporary_franchise_steps	text	form	temporary_franchise	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1547	tenders_for_brokers_license_features	text	form	tenders_for_brokers	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1548	tenders_for_brokers_steps	text	form	tenders_for_brokers	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1549	tenders_for_lawyers_process	text	form	tenders_for_lawyers	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1550	tenders_for_lawyers_steps	text	form	tenders_for_lawyers	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1551	cooperation_steps	text	form	cooperation	dropdown	\N	t	\N	pending	2025-07-30 06:10:28.470039	2025-07-30 13:41:40.186028	\N	\N	\N
1520	app.mortgage_refi.step2.title	text	headers	refinance_mortgage_2	title	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1297	refinance_credit_additional_income_none	text	form	refinance_credit_3	option	None	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1284	refinance_credit_main_source_employee	text	form	refinance_credit_3	option	Employee	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1285	refinance_credit_main_source_selfemployed	text	form	refinance_credit_3	option	Self-employed	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1286	refinance_credit_main_source_pension	text	form	refinance_credit_3	option	Pensioner	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1287	refinance_credit_main_source_student	text	form	refinance_credit_3	option	Student	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1288	refinance_credit_main_source_unpaid_leave	text	form	refinance_credit_3	option	Unpaid leave	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1289	refinance_credit_main_source_unemployed	text	form	refinance_credit_3	option	Unemployed	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1290	refinance_credit_main_source_other	text	form	refinance_credit_3	option	Other	t	\N	pending	2025-07-26 08:09:47.947037	2025-07-30 21:48:08.757559	\N	\N	\N
1247	calculate_mortgage_education_elementary	text	form	refinance_credit_2	option	No high school diploma	t	\N	pending	2025-07-26 08:09:45.518535	2025-07-30 21:48:08.757559	\N	\N	\N
1226	calculate_mortgage_education	text	form	refinance_credit_2	dropdown	Education level	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 21:48:08.757559	\N	\N	\N
1243	calculate_mortgage_add_partner	text	form	refinance_credit_2	dropdown	Add partner as borrower?	t	\N	pending	2025-07-26 08:09:45.433233	2025-07-30 21:48:08.757559	\N	\N	\N
1859	mortgage_step3_additional_income_label	text	form	mortgage_step3	label	\N	t	\N	pending	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
1860	mortgage_step3_additional_income_ph	text	form	mortgage_step3	placeholder	\N	t	\N	pending	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
1922	obligation_end_date_title	text	ui	common	label	Obligation end date title	t	\N	pending	2025-08-02 13:46:19.169074	2025-08-02 13:46:19.169074	1	\N	\N
2117	refinance_step3.field.obligations	text	mortgage	refinance_step3	dropdown_container	\N	t	\N	pending	2025-08-12 06:22:57.24296	2025-08-12 06:22:57.24296	\N	\N	\N
2118	refinance_step3.field.obligations_other	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-12 06:22:57.24296	2025-08-12 06:22:57.24296	\N	\N	\N
2119	refinance_step3.field.obligations_bank_loan	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-12 06:22:57.24296	2025-08-12 06:22:57.24296	\N	\N	\N
2120	refinance_step3.field.obligations_consumer_credit	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-12 06:22:57.24296	2025-08-12 06:22:57.24296	\N	\N	\N
2121	refinance_step3.field.obligations_credit_card	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-12 06:22:57.24296	2025-08-12 06:22:57.24296	\N	\N	\N
2122	refinance_step3.field.obligations_0_no_obligations	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-12 06:22:57.24296	2025-08-12 06:22:57.24296	\N	\N	\N
1571	mortgage_refinance_why_lower_payment	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1572	mortgage_refinance_why_better_rate	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1573	mortgage_refinance_why_cash_out	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1574	mortgage_refinance_why_change_terms	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1575	mortgage_refinance_why_other	text	form	refinance_mortgage_2	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
531	tenders_for_lawyers_process_step_4_description	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1519	app.mortgage_refi.step1.title	text	headers	refinance_mortgage_1	title	\N	t	\N	pending	2025-07-29 21:55:13.676689	2025-07-30 13:41:40.186028	\N	\N	1.0
1570	mortgage_refinance_why	text	form	refinance_mortgage_2	dropdown	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1552	mortgage_refinance_bank	text	form	refinance_mortgage_1	dropdown	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1553	mortgage_refinance_bank_hapoalim	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1554	mortgage_refinance_bank_leumi	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1555	mortgage_refinance_bank_discount	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1556	mortgage_refinance_bank_massad	text	form	refinance_mortgage_1	option	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1557	mortgage_refinance_bank_ph	text	form	refinance_mortgage_1	placeholder	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1558	mortgage_refinance_bank_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1559	mortgage_refinance_left_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1560	mortgage_refinance_price_label	text	form	refinance_mortgage_1	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
988	mortgage_calculation.field.monthly_income_hint	text	hints	mortgage_step3	hint	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
1298	refinance_credit_additional_income_salary	text	form	refinance_credit_3	option	Additional Salary	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1299	refinance_credit_additional_income_additional_work	text	form	refinance_credit_3	option	Additional Work	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1300	refinance_credit_additional_income_rental	text	form	refinance_credit_3	option	Property Rental	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1301	refinance_credit_additional_income_investment	text	form	refinance_credit_3	option	Investments	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1302	refinance_credit_additional_income_pension	text	form	refinance_credit_3	option	Pension	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1303	refinance_credit_additional_income_other	text	form	refinance_credit_3	option	Other	t	\N	pending	2025-07-26 08:09:48.459482	2025-07-30 21:48:08.757559	\N	\N	\N
1316	refinance_credit_debt_types_consumer_credit	text	form	refinance_credit_3	option	Consumer credit	t	\N	pending	2025-07-26 08:09:48.961735	2025-07-30 21:48:08.757559	\N	\N	\N
984	mortgage_calculation.field.profession_ph	text	form	mortgage_step3	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
987	mortgage_calculation.field.monthly_income_ph	text	form	mortgage_step3	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
1861	mortgage_step3.field.field_of_activity	text	form	mortgage_step3	dropdown_container	\N	t	\N	pending	2025-08-01 06:47:33.007358	2025-08-01 06:49:50.966342	\N	\N	\N
1862	mortgage_step3.field.field_of_activity_agriculture	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:51.146786	\N	\N	\N
1863	mortgage_step3.field.field_of_activity_technology	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:51.25401	\N	\N	\N
1864	mortgage_step3.field.field_of_activity_healthcare	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:51.453856	\N	\N	\N
1865	mortgage_step3.field.field_of_activity_education	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:51.66644	\N	\N	\N
1866	mortgage_step3.field.field_of_activity_finance	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:51.824244	\N	\N	\N
1867	mortgage_step3.field.field_of_activity_real_estate	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:51.956627	\N	\N	\N
1876	mortgage_step3.field.field_of_activity_ph	text	form	mortgage_step3	placeholder	\N	t	\N	pending	2025-08-01 06:47:33.404824	2025-08-01 06:49:53.573634	\N	\N	\N
1877	mortgage_step3.field.field_of_activity_label	text	form	mortgage_step3	label	\N	t	\N	pending	2025-08-01 06:47:33.612714	2025-08-01 06:49:53.71872	\N	\N	\N
1923	obligation_bank_title	text	ui	common	label	Obligation bank title	t	\N	pending	2025-08-02 13:47:00.735855	2025-08-02 13:47:00.735855	1	\N	\N
1924	obligation_bank_placeholder	text	ui	common	placeholder	Obligation bank placeholder	t	\N	pending	2025-08-02 13:47:06.673608	2025-08-02 13:47:06.673608	1	\N	\N
2123	app.refinance.step3.obligations	text	form	refinance_step3	label	\N	t	\N	pending	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
2124	app.refinance.step3.obligations_ph	text	form	refinance_step3	placeholder	\N	t	\N	pending	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
1868	mortgage_step3.field.field_of_activity_construction	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:52.066605	\N	\N	\N
1869	mortgage_step3.field.field_of_activity_retail	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:52.278955	\N	\N	\N
1870	mortgage_step3.field.field_of_activity_manufacturing	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:52.463945	\N	\N	\N
1871	mortgage_step3.field.field_of_activity_government	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:52.681647	\N	\N	\N
1872	mortgage_step3.field.field_of_activity_transport	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:52.883864	\N	\N	\N
1873	mortgage_step3.field.field_of_activity_consulting	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:53.064163	\N	\N	\N
1874	mortgage_step3.field.field_of_activity_entertainment	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:53.20362	\N	\N	\N
530	tenders_for_lawyers_process_step_4_title	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1327	app.other_borrowers.step2.borrowers_income_title	text	income_details	other_borrowers_step2	title	\N	t	borrowers_income	pending	2025-07-26 14:49:11.790859	2025-07-30 13:41:40.186028	\N	\N	\N
1328	app.other_borrowers.step2.source_of_income_label	text	income_details	other_borrowers_step2	label	\N	t	source_of_income	pending	2025-07-26 14:49:11.790859	2025-07-30 13:41:40.186028	\N	\N	\N
1329	app.other_borrowers.step1.personal_data_title	text	personal_details	other_borrowers_step1	title	\N	t	personal_data_borrowers_title	pending	2025-07-26 14:49:11.790859	2025-07-30 13:41:40.186028	\N	\N	\N
1330	app.other_borrowers.step1.who_are_you_for_borrowers_label	text	relationship_details	other_borrowers_step1	label	\N	t	who_are_you_for_borrowers	pending	2025-07-26 14:49:11.790859	2025-07-30 13:41:40.186028	\N	\N	\N
408	tenders_hero_b1	text	hero	tenders_for_brokers	text	\N	t	\N	completed	2025-07-21 12:29:44.878698	2025-07-30 13:41:40.186028	\N	\N	\N
1875	mortgage_step3.field.field_of_activity_other	text	form	mortgage_step3	dropdown_option	\N	t	\N	pending	2025-08-01 06:47:33.213211	2025-08-01 06:49:53.406465	\N	\N	\N
1562	mortgage_refinance_type	text	form	refinance_mortgage_2	dropdown	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1563	mortgage_refinance_type_ph	text	form	refinance_mortgage_2	placeholder	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1564	mortgage_refinance_type_label	text	form	refinance_mortgage_2	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1565	mortgage_refinance_registered	text	form	refinance_mortgage_2	dropdown	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
990	mortgage_calculation.field.main_source_ph	text	form	mortgage_step3	placeholder	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:48:08.757559	\N	\N	2.0
1568	mortgage_refinance_registered_ph	text	form	refinance_mortgage_2	placeholder	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1569	mortgage_refinance_registered_label	text	form	refinance_mortgage_2	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1576	mortgage_refinance_why_ph	text	form	refinance_mortgage_2	placeholder	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1577	mortgage_refinance_why_label	text	form	refinance_mortgage_2	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 13:41:40.186028	\N	\N	\N
1491	mortgage_step2.field.citizenship	text	form	mortgage_step2	dropdown_container	\N	t	\N	new	2025-07-29 21:47:57.020657	2025-08-02 13:50:18.383475	1	1	\N
2125	app.mortgage.step3.obligations.option_1	text	form	mortgage_step3	dropdown_option	No obligations option	t	\N	pending	2025-08-12 06:26:58.246835	2025-08-12 06:26:58.246835	\N	\N	1.0
2126	app.mortgage.step3.obligations.option_2	text	form	mortgage_step3	dropdown_option	Bank loan option	t	\N	pending	2025-08-12 06:26:58.246835	2025-08-12 06:26:58.246835	\N	\N	2.0
2127	app.mortgage.step3.obligations.option_3	text	form	mortgage_step3	dropdown_option	Credit card option	t	\N	pending	2025-08-12 06:26:58.246835	2025-08-12 06:26:58.246835	\N	\N	3.0
2128	app.mortgage.step3.obligations.option_4	text	form	mortgage_step3	dropdown_option	Private loan option	t	\N	pending	2025-08-12 06:26:58.246835	2025-08-12 06:26:58.246835	\N	\N	4.0
236	mortgage_step3.field.obligations_0_no_obligations	text	form	mortgage_step3	dropdown_option	Obligation option 1 - No obligations	t	\N	completed	2025-07-20 11:58:55.22593	2025-08-01 07:01:10.134082	1	\N	7.0
1925	calculate_mortgage_main_source	text	income_details	calculate_credit_3	label	\N	t	calculate_mortgage_main_source	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1926	calculate_mortgage_main_source_ph	text	income_details	calculate_credit_3	placeholder	\N	t	calculate_mortgage_main_source_ph	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1927	calculate_mortgage_main_source_option_1	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_1	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1928	calculate_mortgage_main_source_option_2	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_2	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
607	tenders_for_lawyers_steps_step_2_desc	text	form	tenders_for_lawyers	option	\N	t	\N	completed	2025-07-21 12:29:45.098412	2025-07-30 13:41:40.186028	\N	\N	\N
1372	error_select_answer	text	form_validation	validation_errors	validation_error	\N	t	error_select_answer	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1373	error_fill_field	text	form_validation	validation_errors	validation_error	\N	t	error_fill_field	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1374	error_date	text	form_validation	validation_errors	validation_error	\N	t	error_date	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1929	calculate_mortgage_main_source_option_3	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_3	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1930	calculate_mortgage_main_source_option_4	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_4	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1931	calculate_mortgage_main_source_option_5	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_5	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1932	calculate_mortgage_main_source_option_6	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_6	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1933	calculate_mortgage_main_source_option_7	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_main_source_option_7	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1934	calculate_mortgage_has_additional	text	income_details	calculate_credit_3	label	\N	t	calculate_mortgage_has_additional	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1935	calculate_mortgage_has_additional_ph	text	income_details	calculate_credit_3	placeholder	\N	t	calculate_mortgage_has_additional_ph	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1936	calculate_mortgage_has_additional_option_1	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_1	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1937	calculate_mortgage_has_additional_option_2	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_2	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1938	calculate_mortgage_has_additional_option_3	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_3	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1939	calculate_mortgage_has_additional_option_4	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_4	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1940	calculate_mortgage_has_additional_option_5	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_5	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1941	calculate_mortgage_has_additional_option_6	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_6	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1942	calculate_mortgage_has_additional_option_7	text	income_details	calculate_credit_3	option	\N	t	calculate_mortgage_has_additional_option_7	pending	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
1943	calculate_mortgage_debt_types	text	income_details	mortgage_step3	label	\N	t	calculate_mortgage_debt_types	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
1944	calculate_mortgage_debt_types_ph	text	income_details	mortgage_step3	placeholder	\N	t	calculate_mortgage_debt_types_ph	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
1945	calculate_mortgage_debt_types_option_1	text	income_details	mortgage_step3	option	\N	t	calculate_mortgage_debt_types_option_1	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
1946	calculate_mortgage_debt_types_option_2	text	income_details	mortgage_step3	option	\N	t	calculate_mortgage_debt_types_option_2	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
1947	calculate_mortgage_debt_types_option_3	text	income_details	mortgage_step3	option	\N	t	calculate_mortgage_debt_types_option_3	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
1948	calculate_mortgage_debt_types_option_4	text	income_details	mortgage_step3	option	\N	t	calculate_mortgage_debt_types_option_4	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
2134	other_borrowers_step2.field.field_of_activity	text	\N	other_borrowers_step2	dropdown_container	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
1375	error_name_surname	text	form_validation	validation_errors	validation_error	\N	t	error_name_surname	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
2135	other_borrowers_step2.field.field_of_activity_agriculture	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2136	other_borrowers_step2.field.field_of_activity_construction	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2137	other_borrowers_step2.field.field_of_activity_consulting	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2138	other_borrowers_step2.field.field_of_activity_education	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2139	other_borrowers_step2.field.field_of_activity_entertainment	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
1878	error_refinance_why_required	text	errors	validation_errors	validation	Validation error for refinance why field	t	\N	pending	2025-08-02 11:24:27.705859	2025-08-02 11:24:27.705859	1	\N	\N
1950	app.privacy_policy.title	text	page_header	privacy_policy	title	Privacy policy page title	t	privacy_policy_title	migrated	2025-08-05 13:00:39.886151	2025-08-05 13:00:39.886151	\N	\N	\N
1951	app.privacy_policy.full_content	html	page_content	privacy_policy	html_content	Complete privacy policy HTML content	t	privacy_policy_full_text	migrated	2025-08-05 13:00:40.086056	2025-08-05 13:00:40.086056	\N	\N	\N
2140	other_borrowers_step2.field.field_of_activity_finance	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2141	other_borrowers_step2.field.field_of_activity_government	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
1390	error_period_required	text	form_validation	validation_errors	validation_error	\N	t	error_period_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1391	error_min_monthly_payment	text	form_validation	validation_errors	validation_error	\N	t	error_min_monthly_payment	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1392	error_monthly_payment_required	text	form_validation	validation_errors	validation_error	\N	t	error_monthly_payment_required	pending	2025-07-26 15:28:33.522572	2025-07-30 13:41:40.186028	\N	\N	\N
1362	mortgage_step3_title	text	step_headers	mortgage_step3	title	\N	t	calculate_mortgage_step3_title	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	7.0
1040	mortgage_calculation.help.step3_ctx	text	hints	mortgage_calculation	help_text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1041	mortgage_calculation.help.ctx	text	hints	mortgage_calculation	help_text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1042	mortgage_calculation.help.ctx_1	text	hints	mortgage_calculation	help_text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 13:41:40.186028	\N	\N	2.0
1355	mobile_step_1	text	navigation	mortgage_calculation	text	\N	t	mobile_step_1	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	2.0
1054	mortgage_step2.field.citizenship_ukraine	text	form	mortgage_step2	dropdown_option	Citizenship option: Ukraine	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1055	mortgage_step2.field.citizenship_other	text	form	mortgage_step2	dropdown_option	Citizenship option: Other	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
2142	other_borrowers_step2.field.field_of_activity_healthcare	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
1361	mortgage_step2_title	text	step_headers	mortgage_step2	title	\N	t	calculate_mortgage_step2_title	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	4.0
2143	other_borrowers_step2.field.field_of_activity_label	text	\N	other_borrowers_step2	label	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2144	other_borrowers_step2.field.field_of_activity_manufacturing	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
173	app.mortgage.step2.title	text	form	mortgage_step2	title	Step 2 main page title	t	\N	completed	2025-07-20 09:33:24.357425	2025-07-30 13:41:40.186028	1	\N	4.0
174	app.mortgage.step2.privacy_notice	text	legal	mortgage_step2	notice	Privacy law compliance statement - critical legal text	t	\N	completed	2025-07-20 09:33:25.636927	2025-07-30 13:41:40.186028	1	\N	4.0
175	app.mortgage.step2.name_surname	text	form	mortgage_step2	label	Full name field label	t	\N	completed	2025-07-20 09:33:26.911605	2025-07-30 13:41:40.186028	1	\N	4.0
176	app.mortgage.step2.name_surname_ph	text	form	mortgage_step2	placeholder	Full name field placeholder	t	\N	completed	2025-07-20 09:33:28.151717	2025-07-30 13:41:40.186028	1	\N	4.0
2145	other_borrowers_step2.field.field_of_activity_other	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2146	other_borrowers_step2.field.field_of_activity_ph	text	\N	other_borrowers_step2	placeholder	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2147	other_borrowers_step2.field.field_of_activity_real_estate	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
1039	mortgage_calculation.text.monthly_income_title	text	descriptions	mortgage_step3	text	\N	t	\N	new	2025-07-23 14:53:40.447288	2025-07-30 21:47:12.130532	\N	\N	2.0
2148	other_borrowers_step2.field.field_of_activity_retail	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
1317	refinance_credit_debt_types_credit_card	text	form	refinance_credit_3	option	Credit card debt	t	\N	pending	2025-07-26 08:09:48.961735	2025-07-30 21:48:08.757559	\N	\N	\N
1318	refinance_credit_debt_types_other	text	form	refinance_credit_3	option	Other	t	\N	pending	2025-07-26 08:09:48.961735	2025-07-30 21:48:08.757559	\N	\N	\N
2149	other_borrowers_step2.field.field_of_activity_technology	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2150	other_borrowers_step2.field.field_of_activity_transport	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
2301	credit_step3.field.field_of_activity	text	form	credit_step3	dropdown_container	\N	t	\N	debug_test	2025-08-13 11:39:38.938998	2025-08-13 11:39:38.938998	\N	\N	\N
1578	mortgage_refinance_step_2_label	text	form	refinance_mortgage_2	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 21:48:08.757559	\N	\N	\N
1579	mortgage_refinance_step_3_label	text	form	refinance_mortgage_3	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 21:48:08.757559	\N	\N	\N
1580	mortgage_refinance_step_4_label	text	form	refinance_mortgage_4	label	\N	t	\N	pending	2025-07-30 06:14:52.485162	2025-07-30 21:48:08.757559	\N	\N	\N
1333	mortgage_step2_education_ph	text	form	mortgage_step2	placeholder	\N	t	calculate_mortgage_education_ph	pending	2025-07-26 14:56:17.93122	2025-07-30 21:48:08.757559	\N	\N	4.0
1332	mortgage_step2_education	text	form	mortgage_step2	label	\N	t	calculate_mortgage_education	pending	2025-07-26 14:56:17.93122	2025-07-30 21:48:08.757559	\N	\N	4.0
1356	mobile_step_2	text	navigation	mortgage_calculation	text	\N	t	mobile_step_2	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	2.0
1357	mobile_step_3	text	navigation	mortgage_calculation	text	\N	t	mobile_step_3	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	2.0
1358	mobile_step_4	text	navigation	mortgage_calculation	text	\N	t	mobile_step_4	pending	2025-07-26 14:58:28.243008	2025-07-30 13:41:40.186028	\N	\N	2.0
177	app.mortgage.step2.birth_date	text	form	mortgage_step2	label	Birthday field label	t	\N	completed	2025-07-20 09:33:29.357563	2025-07-30 13:41:40.186028	1	\N	4.0
178	app.mortgage.step2.education	text	form	mortgage_step2	label	Education dropdown label	t	\N	completed	2025-07-20 09:33:30.571481	2025-07-30 13:41:40.186028	1	\N	4.0
179	app.mortgage.step2.education_ph	text	form	mortgage_step2	placeholder	Education dropdown placeholder	t	\N	completed	2025-07-20 09:33:31.856714	2025-07-30 13:41:40.186028	1	\N	4.0
187	app.mortgage.step2.citizenship	text	form	mortgage_step2	label	Additional citizenship question	t	\N	completed	2025-07-20 09:33:42.531507	2025-07-30 13:41:40.186028	1	\N	4.0
188	app.mortgage.step2.citizenship_title	text	form	mortgage_step2	title	Citizenship dropdown title	t	\N	completed	2025-07-20 09:33:43.916527	2025-07-30 13:41:40.186028	1	\N	4.0
189	app.mortgage.step2.citizenship_ph	text	form	mortgage_step2	placeholder	Citizenship dropdown placeholder	t	\N	completed	2025-07-20 09:33:45.294066	2025-07-30 13:41:40.186028	1	\N	4.0
191	app.mortgage.step2.tax_tooltip	text	legal	mortgage_step2	tooltip	Tax obligations tooltip	t	\N	completed	2025-07-20 09:33:48.291561	2025-07-30 13:41:40.186028	1	\N	4.0
192	app.mortgage.step2.children_under_18	text	form	mortgage_step2	label	Children under 18 question	t	\N	completed	2025-07-20 09:33:49.511785	2025-07-30 13:41:40.186028	1	\N	4.0
193	app.mortgage.step2.children_count	text	form	mortgage_step2	label	Number of children field	t	\N	completed	2025-07-20 09:33:50.864023	2025-07-30 13:41:40.186028	1	\N	4.0
1879	error_refinance_bank_required	text	errors	validation_errors	validation	Validation error for refinance bank field	t	\N	pending	2025-08-02 11:24:34.356438	2025-08-02 11:24:34.356438	1	\N	\N
1880	error_refinance_type_required	text	errors	validation_errors	validation	Validation error for refinance property type field	t	\N	pending	2025-08-02 11:24:41.298374	2025-08-02 11:24:41.298374	1	\N	\N
196	app.mortgage.step2.foreign_resident_tooltip	text	legal	mortgage_step2	tooltip	Foreign resident definition - tax law reference	t	\N	completed	2025-07-20 09:33:55.404225	2025-07-30 13:41:40.186028	1	\N	4.0
211	app.mortgage.step2.add_partner	text	form	mortgage_step2	button	Add partner button text	t	\N	completed	2025-07-20 09:34:14.951787	2025-08-02 20:10:53.984766	1	\N	4.0
198	app.mortgage.step2.public_person_tooltip	text	legal	mortgage_step2	tooltip	Public person definition - legal requirement	t	\N	completed	2025-07-20 09:33:58.212005	2025-07-30 13:41:40.186028	1	\N	4.0
199	app.mortgage.step2.borrowers_count	text	form	mortgage_step2	label	Number of borrowers question	t	\N	completed	2025-07-20 09:33:59.591721	2025-07-30 13:41:40.186028	1	\N	4.0
200	app.mortgage.step2.borrowers_placeholder	text	form	mortgage_step2	placeholder	Borrowers field placeholder	t	\N	completed	2025-07-20 09:34:00.816584	2025-07-30 13:41:40.186028	1	\N	4.0
201	app.mortgage.step2.family_status	text	form	mortgage_step2	label	Family status dropdown label	t	\N	completed	2025-07-20 09:34:02.2565	2025-07-30 13:41:40.186028	1	\N	4.0
202	app.mortgage.step2.family_status_ph	text	form	mortgage_step2	placeholder	Family status dropdown placeholder	t	\N	completed	2025-07-20 09:34:03.491717	2025-07-30 13:41:40.186028	1	\N	4.0
209	app.mortgage.step2.partner_mortgage_participation	text	form	mortgage_step2	label	Partner mortgage participation question	t	\N	completed	2025-07-20 09:34:12.496641	2025-07-30 13:41:40.186028	1	\N	4.0
210	app.mortgage.step2.add_partner_title	text	form	mortgage_step2	title	Add partner section title	t	\N	completed	2025-07-20 09:34:13.716582	2025-07-30 13:41:40.186028	1	\N	4.0
212	app.mortgage.step2.search	text	form	mortgage_step2	placeholder	Search placeholder for multiselect dropdowns	t	\N	completed	2025-07-20 09:34:16.311789	2025-07-30 13:41:40.186028	1	\N	4.0
213	app.mortgage.step2.nothing_found	text	form	mortgage_step2	text	No results text for multiselect dropdowns	t	\N	completed	2025-07-20 09:34:17.753657	2025-07-30 13:41:40.186028	1	\N	4.0
214	app.mortgage.step2.countries	text	form	mortgage_step2	text	Countries label for multiselect	t	\N	completed	2025-07-20 09:34:19.036631	2025-07-30 13:41:40.186028	1	\N	4.0
1952	about_why_credit_title	text	feature_card_title	about	text	About page credit feature title	t	\N	pending	2025-08-05 13:28:11.334642	2025-08-05 13:28:11.334642	\N	\N	\N
1953	about_why_credit	text	feature_card_text	about	text	About page credit feature description	t	\N	pending	2025-08-05 13:28:11.449109	2025-08-05 13:28:11.449109	\N	\N	\N
226	app.mortgage.step3.additional_income_ph	text	form	mortgage_step3	placeholder	Additional income field placeholder	t	\N	completed	2025-07-20 11:58:24.044175	2025-07-30 13:41:40.186028	1	\N	7.0
235	app.mortgage.step3.obligations_ph	text	form	mortgage_step3	placeholder	Financial obligations field placeholder	t	\N	completed	2025-07-20 11:58:54.736823	2025-07-30 13:41:40.186028	1	\N	7.0
241	app.mortgage.step3.monthly_income	text	form	mortgage_step3	label	Monthly income field label	t	\N	completed	2025-07-20 11:59:29.658396	2025-07-30 13:41:40.186028	1	\N	7.0
242	app.mortgage.step3.monthly_income_ph	text	form	mortgage_step3	placeholder	Monthly income field placeholder	t	\N	completed	2025-07-20 11:59:30.429004	2025-07-30 13:41:40.186028	1	\N	7.0
243	app.mortgage.step3.monthly_income_hint	text	form	mortgage_step3	hint	Monthly income field hint	t	\N	completed	2025-07-20 11:59:30.892189	2025-07-30 13:41:40.186028	1	\N	7.0
244	app.mortgage.step3.field_activity	text	form	mortgage_step3	label	Field of activity label	t	\N	completed	2025-07-20 11:59:31.378734	2025-07-30 13:41:40.186028	1	\N	7.0
245	app.mortgage.step3.company_name	text	form	mortgage_step3	label	Company name field	t	\N	completed	2025-07-20 11:59:31.841964	2025-07-30 13:41:40.186028	1	\N	7.0
246	app.mortgage.step3.profession	text	form	mortgage_step3	label	Profession field label	t	\N	completed	2025-07-20 11:59:32.323891	2025-07-30 13:41:40.186028	1	\N	7.0
190	app.mortgage.step2.tax_obligations	text	form	mortgage_step2	label	Tax obligations question - legal compliance	t	\N	completed	2025-07-20 09:33:46.991454	2025-07-30 21:48:08.757559	1	\N	4.0
194	app.mortgage.step2.medical_insurance	text	form	mortgage_step2	label	Medical insurance compliance question	t	\N	completed	2025-07-20 09:33:52.421582	2025-07-30 21:48:08.757559	1	\N	4.0
195	app.mortgage.step2.foreign_resident	text	form	mortgage_step2	label	Foreign resident status - tax law compliance	t	\N	completed	2025-07-20 09:33:53.736602	2025-07-30 21:48:08.757559	1	\N	4.0
1881	error_refinance_registered_required	text	errors	validation_errors	validation	Validation error for refinance registration field	t	\N	pending	2025-08-02 11:24:48.477392	2025-08-02 11:24:48.477392	1	\N	\N
1882	error_refinance_start_date_required	text	errors	validation_errors	validation	Validation error for refinance start date field	t	\N	pending	2025-08-02 11:24:55.190406	2025-08-02 11:24:55.190406	1	\N	\N
1954	franchise_alt_professional_meeting	text	alt_text	temporary_franchise	image_alt	Alt text for professional meeting image	t	\N	pending	2025-08-05 14:15:25.696988	2025-08-05 14:15:25.696988	\N	\N	\N
1955	franchise_alt_techrealt_logo	text	alt_text	temporary_franchise	image_alt	Alt text for TechRealt logo	t	\N	pending	2025-08-05 14:15:26.841828	2025-08-05 14:15:26.841828	\N	\N	\N
1956	franchise_alt_bankimonline_platform	text	alt_text	temporary_franchise	image_alt	Alt text for Bankimonline platform	t	\N	pending	2025-08-05 14:15:27.392148	2025-08-05 14:15:27.392148	\N	\N	\N
1957	franchise_alt_real_estate_keys	text	alt_text	temporary_franchise	image_alt	Alt text for real estate keys image	t	\N	pending	2025-08-05 14:15:27.984199	2025-08-05 14:15:27.984199	\N	\N	\N
1958	franchise_alt_equipped_office	text	alt_text	temporary_franchise	image_alt	Alt text for equipped office image	t	\N	pending	2025-08-05 14:15:28.610449	2025-08-05 14:15:28.610449	\N	\N	\N
1959	franchise_client_service_credit_calc	text	service_item	temporary_franchise	list_item	Credit calculation service	t	\N	pending	2025-08-05 14:15:29.13138	2025-08-05 14:15:29.13138	\N	\N	\N
1960	franchise_client_service_credit_refinance	text	service_item	temporary_franchise	list_item	Credit refinancing service	t	\N	pending	2025-08-05 14:15:29.758933	2025-08-05 14:15:29.758933	\N	\N	\N
1961	franchise_includes_turnkey_title	text	accordion_title	temporary_franchise	heading	Turnkey solution section title	t	\N	pending	2025-08-05 14:15:30.411582	2025-08-05 14:15:30.411582	\N	\N	\N
1962	franchise_includes_turnkey_benefit_office	text	accordion_benefit	temporary_franchise	benefit_item	Turnkey office benefit	t	\N	pending	2025-08-05 14:15:30.976308	2025-08-05 14:15:30.976308	\N	\N	\N
1963	franchise_includes_turnkey_benefit_team	text	accordion_benefit	temporary_franchise	benefit_item	Turnkey team benefit	t	\N	pending	2025-08-05 14:15:31.58144	2025-08-05 14:15:31.58144	\N	\N	\N
1964	franchise_includes_turnkey_benefit_brand	text	accordion_benefit	temporary_franchise	benefit_item	Turnkey brand benefit	t	\N	pending	2025-08-05 14:15:32.246837	2025-08-05 14:15:32.246837	\N	\N	\N
1965	franchise_includes_turnkey_benefit_marketing	text	accordion_benefit	temporary_franchise	benefit_item	Turnkey marketing benefit	t	\N	pending	2025-08-05 14:15:32.901532	2025-08-05 14:15:32.901532	\N	\N	\N
1966	franchise_includes_digital_title	text	accordion_title	temporary_franchise	heading	Digital solutions section title	t	\N	pending	2025-08-05 14:15:33.51653	2025-08-05 14:15:33.51653	\N	\N	\N
1967	franchise_includes_digital_platform	text	accordion_benefit	temporary_franchise	benefit_item	Digital platform benefit	t	\N	pending	2025-08-05 14:15:34.221562	2025-08-05 14:15:34.221562	\N	\N	\N
1968	franchise_includes_digital_tools	text	accordion_benefit	temporary_franchise	benefit_item	Digital tools benefit	t	\N	pending	2025-08-05 14:15:34.698953	2025-08-05 14:15:34.698953	\N	\N	\N
1969	franchise_includes_digital_support	text	accordion_benefit	temporary_franchise	benefit_item	Digital support benefit	t	\N	pending	2025-08-05 14:15:35.286587	2025-08-05 14:15:35.286587	\N	\N	\N
1970	franchise_includes_support_title	text	accordion_title	temporary_franchise	heading	Support services section title	t	\N	pending	2025-08-05 14:15:35.80395	2025-08-05 14:15:35.80395	\N	\N	\N
1971	franchise_includes_support_training	text	accordion_benefit	temporary_franchise	benefit_item	Support training benefit	t	\N	pending	2025-08-05 14:15:36.69673	2025-08-05 14:15:36.69673	\N	\N	\N
1972	franchise_includes_support_phone	text	accordion_benefit	temporary_franchise	benefit_item	Support phone benefit	t	\N	pending	2025-08-05 14:15:37.18677	2025-08-05 14:15:37.18677	\N	\N	\N
1973	franchise_includes_support_consultation	text	accordion_benefit	temporary_franchise	benefit_item	Support consultation benefit	t	\N	pending	2025-08-05 14:15:37.946654	2025-08-05 14:15:37.946654	\N	\N	\N
1974	franchise_includes_info_card_brand	text	info_card	temporary_franchise	card_text	Brand info card text	t	\N	pending	2025-08-05 14:15:38.491379	2025-08-05 14:15:38.491379	\N	\N	\N
1975	franchise_includes_info_card_office	text	info_card	temporary_franchise	card_text	Office info card text	t	\N	pending	2025-08-05 14:15:39.014069	2025-08-05 14:15:39.014069	\N	\N	\N
1976	franchise_includes_info_card_manager	text	info_card	temporary_franchise	card_text	Manager info card text	t	\N	pending	2025-08-05 14:15:39.656466	2025-08-05 14:15:39.656466	\N	\N	\N
1977	franchise_step_1_title	text	process_step	temporary_franchise	step_title	Franchise step 1 title	t	\N	pending	2025-08-05 14:15:40.163984	2025-08-05 14:15:40.163984	\N	\N	\N
1978	franchise_step_1_description	text	process_step	temporary_franchise	step_description	Franchise step 1 description	t	\N	pending	2025-08-05 14:15:40.656362	2025-08-05 14:15:40.656362	\N	\N	\N
1979	franchise_step_2_title	text	process_step	temporary_franchise	step_title	Franchise step 2 title	t	\N	pending	2025-08-05 14:15:41.216416	2025-08-05 14:15:41.216416	\N	\N	\N
1980	franchise_step_2_description	text	process_step	temporary_franchise	step_description	Franchise step 2 description	t	\N	pending	2025-08-05 14:15:41.96427	2025-08-05 14:15:41.96427	\N	\N	\N
1981	franchise_step_3_title	text	process_step	temporary_franchise	step_title	Franchise step 3 title	t	\N	pending	2025-08-05 14:15:42.462048	2025-08-05 14:15:42.462048	\N	\N	\N
1982	franchise_step_3_description	text	process_step	temporary_franchise	step_description	Franchise step 3 description	t	\N	pending	2025-08-05 14:15:43.226811	2025-08-05 14:15:43.226811	\N	\N	\N
1983	franchise_step_4_title	text	process_step	temporary_franchise	step_title	Franchise step 4 title	t	\N	pending	2025-08-05 14:15:43.769223	2025-08-05 14:15:43.769223	\N	\N	\N
1984	franchise_step_4_description	text	process_step	temporary_franchise	step_description	Franchise step 4 description	t	\N	pending	2025-08-05 14:15:44.344135	2025-08-05 14:15:44.344135	\N	\N	\N
1985	franchise_step_5_title	text	process_step	temporary_franchise	step_title	Franchise step 5 title	t	\N	pending	2025-08-05 14:15:44.916885	2025-08-05 14:15:44.916885	\N	\N	\N
1986	franchise_step_5_description	text	process_step	temporary_franchise	step_description	Franchise step 5 description	t	\N	pending	2025-08-05 14:15:45.454254	2025-08-05 14:15:45.454254	\N	\N	\N
2156	other_borrowers_step2.field.obligations	text	form	other_borrowers_step2	dropdown_container	\N	t	\N	pending	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
2157	other_borrowers_step2.field.obligations_no_obligations	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
2158	other_borrowers_step2.field.obligations_bank_loan	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
2159	other_borrowers_step2.field.obligations_consumer_credit	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
2160	other_borrowers_step2.field.obligations_credit_card	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
2302	credit_step3.field.field_of_activity_agriculture	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2303	credit_step3.field.field_of_activity_technology	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2304	credit_step3.field.field_of_activity_healthcare	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2305	credit_step3.field.field_of_activity_education	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2306	credit_step3.field.field_of_activity_finance	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
1987	feature_credit_calc	text	feature_item	cooperation	text	\N	t	\N	pending	2025-08-05 16:17:20.939808	2025-08-05 16:17:20.939808	\N	\N	\N
1988	feature_credit_refinance	text	feature_item	cooperation	text	\N	t	\N	pending	2025-08-05 16:17:21.358275	2025-08-05 16:17:21.358275	\N	\N	\N
2161	other_borrowers_step2.field.obligations_placeholder	text	other_borrowers_step2	other_borrowers_step2	placeholder	\N	t	\N	pending	2025-08-12 07:27:36.010155	2025-08-12 07:27:36.010155	\N	\N	\N
2307	credit_step3.field.field_of_activity_real_estate	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2308	credit_step3.field.field_of_activity_ph	text	form	credit_step3	placeholder	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2309	credit_step3.field.field_of_activity_label	text	form	credit_step3	label	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2310	credit_step3.field.field_of_activity_construction	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2311	credit_step3.field.field_of_activity_retail	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2312	credit_step3.field.field_of_activity_manufacturing	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2313	credit_step3.field.field_of_activity_government	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2314	credit_step3.field.field_of_activity_transport	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2315	credit_step3.field.field_of_activity_consulting	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2316	credit_step3.field.field_of_activity_entertainment	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2317	credit_step3.field.field_of_activity_other	text	form	credit_step3	dropdown_option	\N	t	\N	manual_fix	2025-08-13 11:40:01.242764	2025-08-13 11:40:01.242764	\N	\N	\N
2318	credit_step3.field.professional_sphere	text	form	credit_step3	dropdown_container	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2319	credit_step3.field.professional_sphere_agriculture	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2320	credit_step3.field.professional_sphere_technology	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2321	credit_step3.field.professional_sphere_healthcare	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2322	credit_step3.field.professional_sphere_education	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2323	credit_step3.field.professional_sphere_finance	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2324	credit_step3.field.professional_sphere_real_estate	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2325	credit_step3.field.professional_sphere_ph	text	form	credit_step3	placeholder	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2326	credit_step3.field.professional_sphere_label	text	form	credit_step3	label	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2327	credit_step3.field.professional_sphere_construction	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2328	credit_step3.field.professional_sphere_retail	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2329	credit_step3.field.professional_sphere_manufacturing	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2330	credit_step3.field.professional_sphere_government	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2331	credit_step3.field.professional_sphere_transport	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2332	credit_step3.field.professional_sphere_consulting	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2333	credit_step3.field.professional_sphere_entertainment	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
2334	credit_step3.field.professional_sphere_other	text	form	credit_step3	dropdown_option	\N	t	\N	alias_fix	2025-08-13 11:40:01.477587	2025-08-13 11:40:01.477587	\N	\N	\N
1989	contacts_tech_support	text	contact_info	contacts	text	\N	t	\N	pending	2025-08-05 16:29:12.986212	2025-08-05 16:29:12.986212	\N	\N	\N
1990	contacts_credit_calc	text	contact_info	contacts	text	\N	t	\N	pending	2025-08-05 16:29:13.460492	2025-08-05 16:29:13.460492	\N	\N	\N
1991	contacts_credit_calc_phone	text	contact_info	contacts	text	\N	t	\N	pending	2025-08-05 16:29:13.910825	2025-08-05 16:29:13.910825	\N	\N	\N
1992	contacts_credit_calc_email	text	contact_info	contacts	text	\N	t	\N	pending	2025-08-05 16:29:14.336817	2025-08-05 16:29:14.336817	\N	\N	\N
2162	other_borrowers_step2.field.main_source	text	main_source	other_borrowers_step2	dropdown_container	\N	t	\N	pending	2025-08-13 06:13:32.257174	2025-08-13 06:14:21.517153	\N	\N	\N
2163	other_borrowers_step2.field.main_source_employee	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:22.551983	\N	\N	\N
2164	other_borrowers_step2.field.main_source_selfemployed	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:23.054807	\N	\N	\N
2165	other_borrowers_step2.field.main_source_pension	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:23.472431	\N	\N	\N
2166	other_borrowers_step2.field.main_source_unemployed	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:23.939246	\N	\N	\N
2167	other_borrowers_step2.field.main_source_unpaid_leave	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:24.391936	\N	\N	\N
2168	other_borrowers_step2.field.main_source_student	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:24.81924	\N	\N	\N
2169	other_borrowers_step2.field.main_source_other	text	main_source	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 06:13:32.769921	2025-08-13 06:14:25.371758	\N	\N	\N
2335	credit_step3.field.field_of_activity.field_of_activity_agriculture	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2336	credit_step3.field.field_of_activity.field_of_activity_technology	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2337	credit_step3.field.field_of_activity.field_of_activity_healthcare	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2338	credit_step3.field.field_of_activity.field_of_activity_education	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2339	credit_step3.field.field_of_activity.field_of_activity_finance	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2340	credit_step3.field.field_of_activity.field_of_activity_real_estate	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2341	credit_step3.field.field_of_activity.field_of_activity_construction	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2342	credit_step3.field.field_of_activity.field_of_activity_retail	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2343	credit_step3.field.field_of_activity.field_of_activity_manufacturing	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2344	credit_step3.field.field_of_activity.field_of_activity_government	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2345	credit_step3.field.field_of_activity.field_of_activity_transport	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2346	credit_step3.field.field_of_activity.field_of_activity_consulting	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2347	credit_step3.field.field_of_activity.field_of_activity_entertainment	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
2348	credit_step3.field.field_of_activity.field_of_activity_other	text	form	credit_step3	dropdown_option	\N	t	\N	api_fix_opt	2025-08-13 11:40:48.748669	2025-08-13 11:40:48.748669	\N	\N	\N
1993	title_compare	text	home_page	home_page	text	\N	t	\N	pending	2025-08-05 16:58:37.443836	2025-08-05 16:58:37.443836	\N	\N	\N
1994	compare_in_5minutes	text	home_page	home_page	text	\N	t	\N	pending	2025-08-05 16:58:37.926306	2025-08-05 16:58:37.926306	\N	\N	\N
2171	other_borrowers_step2.field.main_source_placeholder	text	main_source	other_borrowers_step2	placeholder	\N	t	\N	pending	2025-08-13 06:14:22.044682	2025-08-13 06:14:22.044682	\N	\N	\N
1995	error_required_to_fill_out	text	form_validation	validation_errors	validation_error	\N	t	\N	pending	2025-08-06 23:40:34.351571	2025-08-06 23:40:34.351571	\N	\N	\N
2180	refinance_step3.field.main_source_employee	text	form	refinance_step3	dropdown_option	Main income option 1 - Employee	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2181	refinance_step3.field.main_source_selfemployed	text	form	refinance_step3	dropdown_option	Main income option 2 - Self-employed	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2182	refinance_step3.field.main_source_pension	text	form	refinance_step3	dropdown_option	Main income option 3 - Pensioner	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2183	refinance_step3.field.main_source_student	text	form	refinance_step3	dropdown_option	Main income option 4 - Student	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2184	refinance_step3.field.main_source_unpaid_leave	text	form	refinance_step3	dropdown_option	Main income option 5 - Unpaid leave	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2185	refinance_step3.field.main_source_unemployed	text	form	refinance_step3	dropdown_option	Main income option 6 - Unemployed	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2186	refinance_step3.field.main_source_other	text	form	refinance_step3	dropdown_option	Main income option 7 - Other	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 06:58:00.449157	\N	\N	\N
2179	refinance_step3.field.main_source	text	mortgage	refinance_step3	dropdown_container	\N	t	\N	pending	2025-08-13 06:58:00.449157	2025-08-13 08:57:17.737288	\N	\N	\N
1714	credit_step3.field.additional_income.additional_income_additional_work	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:41:50.224003	\N	\N	2.0
1715	credit_step3.field.additional_income.additional_income_investment	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:41:50.224003	\N	\N	3.0
1716	credit_step3.field.additional_income.additional_income_property_rental_income	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:41:50.224003	\N	\N	6.0
1717	credit_step3.field.additional_income.additional_income_pension	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:41:50.224003	\N	\N	5.0
1718	credit_step3.field.additional_income.additional_income_other	text	form	credit_step3	dropdown_option	\N	t	\N	pending	2025-07-31 23:01:48.304569	2025-08-13 11:41:50.224003	\N	\N	4.0
1889	source_of_income_modal_title	text	ui	common	text	Source of income modal title for modals and forms	t	\N	pending	2025-08-02 11:53:24.081196	2025-08-02 11:53:24.081196	1	\N	\N
2021	calculate_credit_step3_title	text	credit_calculator	calculate_credit_3	text	\N	t	\N	pending	2025-08-07 04:03:07.515386	2025-08-07 04:03:07.515386	\N	\N	\N
2015	calculate_credit_3_main_source	text	credit_calculator	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:03:05.01759	2025-08-07 04:09:55.718269	\N	\N	\N
2017	calculate_credit_3_has_additional	text	credit_calculator	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:03:05.846374	2025-08-07 04:09:55.718269	\N	\N	\N
2019	calculate_credit_3_debt_types	text	credit_calculator	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:03:06.673284	2025-08-07 04:09:55.718269	\N	\N	\N
2016	calculate_credit_3_main_source_ph	text	credit_calculator	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:03:05.433295	2025-08-07 04:09:55.810154	\N	\N	\N
2018	calculate_credit_3_has_additional_ph	text	credit_calculator	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:03:06.260496	2025-08-07 04:09:55.810154	\N	\N	\N
2020	calculate_credit_3_debt_types_ph	text	credit_calculator	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:03:07.101427	2025-08-07 04:09:55.810154	\N	\N	\N
1996	calculate_credit_3_main_source_option_1	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:56.678817	2025-08-07 04:09:55.911251	\N	\N	\N
1997	calculate_credit_3_main_source_option_2	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:57.123589	2025-08-07 04:09:55.911251	\N	\N	\N
1998	calculate_credit_3_main_source_option_3	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:57.569745	2025-08-07 04:09:55.911251	\N	\N	\N
1999	calculate_credit_3_main_source_option_4	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:57.995732	2025-08-07 04:09:55.911251	\N	\N	\N
2000	calculate_credit_3_main_source_option_5	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:58.418567	2025-08-07 04:09:55.911251	\N	\N	\N
2001	calculate_credit_3_main_source_option_6	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:58.846271	2025-08-07 04:09:55.911251	\N	\N	\N
2002	calculate_credit_3_main_source_option_7	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:02:59.31529	2025-08-07 04:09:55.911251	\N	\N	\N
2003	calculate_credit_3_has_additional_option_1	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:00.010603	2025-08-07 04:09:55.911251	\N	\N	\N
2004	calculate_credit_3_has_additional_option_2	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:00.428447	2025-08-07 04:09:55.911251	\N	\N	\N
2005	calculate_credit_3_has_additional_option_3	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:00.843168	2025-08-07 04:09:55.911251	\N	\N	\N
2006	calculate_credit_3_has_additional_option_4	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:01.257406	2025-08-07 04:09:55.911251	\N	\N	\N
2007	calculate_credit_3_has_additional_option_5	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:01.673416	2025-08-07 04:09:55.911251	\N	\N	\N
2008	calculate_credit_3_has_additional_option_6	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:02.088481	2025-08-07 04:09:55.911251	\N	\N	\N
2009	calculate_credit_3_has_additional_option_7	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:02.511389	2025-08-07 04:09:55.911251	\N	\N	\N
2010	calculate_credit_3_debt_types_option_1	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:02.927315	2025-08-07 04:09:55.911251	\N	\N	\N
2011	calculate_credit_3_debt_types_option_2	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:03.347449	2025-08-07 04:09:55.911251	\N	\N	\N
2012	calculate_credit_3_debt_types_option_3	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:03.766609	2025-08-07 04:09:55.911251	\N	\N	\N
2013	calculate_credit_3_debt_types_option_4	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:04.188445	2025-08-07 04:09:55.911251	\N	\N	\N
2187	other_borrowers_step2.field.additional_income	text	mortgage	other_borrowers_step2	dropdown_container	\N	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2188	other_borrowers_step2.field.additional_income_additional_salary	text	form	other_borrowers_step2	dropdown_option	Additional income option 2 - Extra salary	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2189	other_borrowers_step2.field.additional_income_additional_work	text	form	other_borrowers_step2	dropdown_option	Additional income option 3 - Extra work	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2190	other_borrowers_step2.field.additional_income_property_rental_income	text	form	other_borrowers_step2	dropdown_option	Additional income option 4 - Property rental	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2191	other_borrowers_step2.field.additional_income_investment	text	form	other_borrowers_step2	dropdown_option	Additional income option 5 - Investments	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2192	other_borrowers_step2.field.additional_income_0_no_additional_income	text	form	other_borrowers_step2	dropdown_option	Additional income option 1 - None	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2193	other_borrowers_step2.field.additional_income_pension	text	form	other_borrowers_step2	dropdown_option	Additional income option 6 - Pension	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2194	other_borrowers_step2.field.additional_income_other	text	form	other_borrowers_step2	dropdown_option	Additional income option 7 - Other	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2195	other_borrowers_step2_additional_income_label	text	form	other_borrowers_step2	label	\N	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
2196	other_borrowers_step2_additional_income_ph	text	form	other_borrowers_step2	placeholder	\N	t	\N	pending	2025-08-13 07:00:41.026077	2025-08-13 07:00:41.026077	\N	\N	\N
1890	additional_source_of_income_modal_title	text	ui	common	text	Additional source of income modal title	t	\N	pending	2025-08-02 11:57:18.701852	2025-08-02 11:57:18.701852	1	\N	\N
2014	calculate_credit_3_debt_types_option_5	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:03:04.600327	2025-08-07 04:09:55.911251	\N	\N	\N
2197	other_borrowers_step2_obligations_option_1	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 07:07:15.586445	2025-08-13 07:07:15.586445	\N	\N	\N
2198	other_borrowers_step2_obligations_option_2	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 07:07:16.111439	2025-08-13 07:07:16.111439	\N	\N	\N
2199	other_borrowers_step2_obligations_option_3	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 07:07:16.603487	2025-08-13 07:07:16.603487	\N	\N	\N
2200	other_borrowers_step2_obligations_option_4	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 07:07:17.113812	2025-08-13 07:07:17.113812	\N	\N	\N
2201	other_borrowers_step2_obligations_option_5	text	form	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 07:07:17.626261	2025-08-13 07:07:17.626261	\N	\N	\N
1891	source_of_income_label	text	ui	refinance_step3	text	Source of income label for cards	t	\N	pending	2025-08-02 12:04:44.915897	2025-08-02 12:04:44.915897	1	\N	\N
1892	additional_source_of_income_label	text	ui	refinance_step3	text	Additional source of income label for cards	t	\N	pending	2025-08-02 12:04:50.896541	2025-08-02 12:04:50.896541	1	\N	\N
2037	calculate_credit_3_field_of_activity	text	form	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2038	calculate_credit_3_field_of_activity_ph	text	form	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2039	calculate_credit_3_field_of_activity_option_1	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2040	calculate_credit_3_field_of_activity_option_2	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2041	calculate_credit_3_field_of_activity_option_3	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2042	calculate_credit_3_field_of_activity_option_4	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2043	calculate_credit_3_field_of_activity_option_5	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2044	calculate_credit_3_field_of_activity_option_6	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2045	calculate_credit_3_field_of_activity_option_7	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2046	calculate_credit_3_field_of_activity_option_8	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2047	calculate_credit_3_field_of_activity_option_9	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2048	calculate_credit_3_field_of_activity_option_10	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2049	calculate_credit_3_field_of_activity_option_11	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2050	calculate_credit_3_field_of_activity_option_12	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2051	calculate_credit_3_field_of_activity_option_13	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	1	\N	\N
2217	refinance_step3.field.field_of_activity	text	form	refinance_step3	dropdown_container	\N	t	\N	pending	2025-08-13 08:28:39.571946	2025-08-13 08:28:39.571946	\N	\N	\N
2218	refinance_step3.field.field_of_activity_technology	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:40.084411	2025-08-13 08:28:40.084411	\N	\N	\N
2219	refinance_step3.field.field_of_activity_healthcare	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:40.704501	2025-08-13 08:28:40.704501	\N	\N	\N
2220	refinance_step3.field.field_of_activity_education	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:41.187258	2025-08-13 08:28:41.187258	\N	\N	\N
2221	refinance_step3.field.field_of_activity_finance	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:41.676977	2025-08-13 08:28:41.676977	\N	\N	\N
2222	refinance_step3.field.field_of_activity_real_estate	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:42.204403	2025-08-13 08:28:42.204403	\N	\N	\N
2223	refinance_step3.field.field_of_activity_construction	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:42.721693	2025-08-13 08:28:42.721693	\N	\N	\N
2224	refinance_step3.field.field_of_activity_retail	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:43.264308	2025-08-13 08:28:43.264308	\N	\N	\N
2225	refinance_step3.field.field_of_activity_manufacturing	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:43.851764	2025-08-13 08:28:43.851764	\N	\N	\N
2226	refinance_step3.field.field_of_activity_government	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:44.364465	2025-08-13 08:28:44.364465	\N	\N	\N
2227	refinance_step3.field.field_of_activity_transport	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:44.896887	2025-08-13 08:28:44.896887	\N	\N	\N
2228	refinance_step3.field.field_of_activity_consulting	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:45.4117	2025-08-13 08:28:45.4117	\N	\N	\N
2229	refinance_step3.field.field_of_activity_entertainment	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:45.984527	2025-08-13 08:28:45.984527	\N	\N	\N
2230	refinance_step3.field.field_of_activity_agriculture	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:46.514201	2025-08-13 08:28:46.514201	\N	\N	\N
2231	refinance_step3.field.field_of_activity_other	text	form	refinance_step3	dropdown_option	\N	t	\N	pending	2025-08-13 08:28:47.010664	2025-08-13 08:28:47.010664	\N	\N	\N
2232	refinance_step3.field.field_of_activity_ph	text	form	refinance_step3	placeholder	\N	t	\N	pending	2025-08-13 08:28:47.51952	2025-08-13 08:28:47.51952	\N	\N	\N
1895	obligation_modal_title	text	ui	common	text	Obligation modal title	t	\N	pending	2025-08-02 12:13:28.155213	2025-08-02 12:13:28.155213	1	\N	\N
2052	calculate_mortgage_types	text	income_details	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2053	calculate_mortgage_types_ph	text	income_details	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2054	calculate_mortgage_types_option_1	text	income_details	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2055	calculate_mortgage_types_option_2	text	income_details	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2056	calculate_mortgage_types_option_3	text	income_details	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2057	calculate_mortgage_types_option_4	text	income_details	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2058	calculate_mortgage_types_option_5	text	income_details	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2059	calculate_credit_3_types	text	credit_calculator	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2060	calculate_credit_3_types_ph	text	credit_calculator	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2061	calculate_credit_3_types_option_1	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2062	calculate_credit_3_types_option_2	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2063	calculate_credit_3_types_option_3	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2064	calculate_credit_3_types_option_4	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2065	calculate_credit_3_types_option_5	text	credit_calculator	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2066	calculate_credit_3_activity	text	form	calculate_credit_3	label	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2067	calculate_credit_3_activity_ph	text	form	calculate_credit_3	placeholder	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2068	calculate_credit_3_activity_option_1	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2069	calculate_credit_3_activity_option_2	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2070	calculate_credit_3_activity_option_3	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2071	calculate_credit_3_activity_option_4	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2072	calculate_credit_3_activity_option_5	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2073	calculate_credit_3_activity_option_6	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2074	calculate_credit_3_activity_option_7	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2075	calculate_credit_3_activity_option_8	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2076	calculate_credit_3_activity_option_9	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2077	calculate_credit_3_activity_option_10	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2078	calculate_credit_3_activity_option_11	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2079	calculate_credit_3_activity_option_12	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2080	calculate_credit_3_activity_option_13	text	form	calculate_credit_3	option	\N	t	\N	pending	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	1	\N	\N
2233	refinance_step3.field.main_source_label	text	form	refinance_step3	label	\N	t	\N	pending	2025-08-13 08:56:39.045201	2025-08-13 08:56:39.045201	\N	\N	\N
2384	other_borrowers_step2.field.professional_sphere	text	\N	other_borrowers_step2	dropdown_container	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2385	other_borrowers_step2.field.professional_sphere_agriculture	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2386	other_borrowers_step2.field.professional_sphere_construction	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2387	other_borrowers_step2.field.professional_sphere_consulting	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2388	other_borrowers_step2.field.professional_sphere_education	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2389	other_borrowers_step2.field.professional_sphere_entertainment	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2390	other_borrowers_step2.field.professional_sphere_finance	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2391	other_borrowers_step2.field.professional_sphere_government	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2392	other_borrowers_step2.field.professional_sphere_healthcare	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2393	other_borrowers_step2.field.professional_sphere_label	text	\N	other_borrowers_step2	label	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2394	other_borrowers_step2.field.professional_sphere_manufacturing	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2395	other_borrowers_step2.field.professional_sphere_other	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2396	other_borrowers_step2.field.professional_sphere_ph	text	\N	other_borrowers_step2	placeholder	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2397	other_borrowers_step2.field.professional_sphere_real_estate	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2398	other_borrowers_step2.field.professional_sphere_retail	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
1134	refinance_credit_bank_leumi	text	form	refinance_credit_1	option	Bank Leumi	t	\N	pending	2025-07-26 08:07:56.940543	2025-07-30 21:48:08.757559	\N	\N	\N
1900	add_place_to_work_button	text	ui	refinance_step3	text	Add place to work button text	t	\N	pending	2025-08-02 12:15:35.926133	2025-08-02 12:15:35.926133	1	\N	\N
1901	add_additional_source_of_income_button	text	ui	refinance_step3	text	Add additional source of income button text	t	\N	pending	2025-08-02 12:15:41.397146	2025-08-02 12:15:41.397146	1	\N	\N
1902	add_obligation_button	text	ui	refinance_step3	text	Add obligation button text	t	\N	pending	2025-08-02 12:15:48.303598	2025-08-02 12:15:48.303598	1	\N	\N
2081	bank_option_1	text	bank	common	option	\N	t	\N	pending	2025-08-07 08:15:51.61709	2025-08-07 08:15:51.61709	\N	\N	\N
2082	bank_option_2	text	bank	common	option	\N	t	\N	pending	2025-08-07 08:15:52.177035	2025-08-07 08:15:52.177035	\N	\N	\N
2083	bank_option_3	text	bank	common	option	\N	t	\N	pending	2025-08-07 08:15:52.696893	2025-08-07 08:15:52.696893	\N	\N	\N
2084	bank_option_4	text	bank	common	option	\N	t	\N	pending	2025-08-07 08:15:53.23654	2025-08-07 08:15:53.23654	\N	\N	\N
2085	bank_option_5	text	bank	common	option	\N	t	\N	pending	2025-08-07 08:15:53.896531	2025-08-07 08:15:53.896531	\N	\N	\N
2234	refinance_step3.field.main_source_ph	text	form	refinance_step3	placeholder	\N	t	\N	pending	2025-08-13 08:56:51.440316	2025-08-13 08:57:18.615525	\N	\N	\N
2399	other_borrowers_step2.field.professional_sphere_technology	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
2400	other_borrowers_step2.field.professional_sphere_transport	text	\N	other_borrowers_step2	dropdown_option	\N	t	\N	pending	2025-08-13 11:57:35.560028	2025-08-13 11:57:35.560028	\N	\N	\N
1048	mortgage_step2.field.citizenship_united_states	text	form	mortgage_step2	dropdown_option	Citizenship option: United States	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1049	mortgage_step2.field.citizenship_russia	text	form	mortgage_step2	dropdown_option	Citizenship option: Russia	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1050	mortgage_step2.field.citizenship_germany	text	form	mortgage_step2	dropdown_option	Citizenship option: Germany	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1051	mortgage_step2.field.citizenship_france	text	form	mortgage_step2	dropdown_option	Citizenship option: France	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1052	mortgage_step2.field.citizenship_united_kingdom	text	form	mortgage_step2	dropdown_option	Citizenship option: United Kingdom	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1053	mortgage_step2.field.citizenship_canada	text	form	mortgage_step2	dropdown_option	Citizenship option: Canada	t	\N	pending	2025-07-24 14:52:11.709577	2025-07-31 19:46:42.436634	\N	\N	4.0
1903	obligation_label	text	ui	refinance_step3	text	Obligation label for cards	t	\N	pending	2025-08-02 12:16:11.642803	2025-08-02 12:16:11.642803	1	\N	\N
2237	app.refinance.step3.main_source	text	form	refinance_step3	label	\N	t	\N	pending	2025-08-13 08:58:16.834494	2025-08-13 08:58:16.834494	\N	\N	\N
276	app.mortgage.step4.mortgage_total	text	form	mortgage_step4	label	Total mortgage amount label	t	\N	completed	2025-07-20 14:29:02.494674	2025-07-30 13:41:40.186028	1	\N	11.0
277	app.mortgage.step4.mortgage_total_return	text	form	mortgage_step4	label	Total return amount label	t	\N	completed	2025-07-20 14:29:03.039317	2025-07-30 13:41:40.186028	1	\N	11.0
278	app.mortgage.step4.mortgage_monthly	text	form	mortgage_step4	label	Monthly payment label	t	\N	completed	2025-07-20 14:29:03.753809	2025-07-30 13:41:40.186028	1	\N	11.0
279	app.mortgage.step4.mortgage_select_bank	text	form	mortgage_step4	button	Select bank button text	t	\N	completed	2025-07-20 14:29:04.340973	2025-07-30 13:41:40.186028	1	\N	11.0
333	calculate_mortgage_final	text	page_header	mortgage_step4	title	\N	t	\N	completed	2025-07-20 18:26:58.124607	2025-07-30 13:41:40.186028	1	\N	11.0
334	calculate_mortgage_warning	text	warning_message	mortgage_step4	text	\N	t	\N	completed	2025-07-20 18:27:36.147894	2025-07-30 13:41:40.186028	1	\N	11.0
335	prime_description	text	mortgage_programs	mortgage_step4	text	\N	t	\N	completed	2025-07-20 18:27:57.610739	2025-07-30 13:41:40.186028	1	\N	11.0
10	app.home.header.title_compare	text	headers	home_page	header	Main header: Compare Mortgages	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
11	app.home.text.compare_in_5minutes	text	descriptions	home_page	text	Subheader: Find optimal mortgage in 5 minutes	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
12	app.home.button.show_offers	text	buttons	home_page	button	Show offers button	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
13	app.home.button.fill_form	text	buttons	home_page	button	Fill the form button	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
14	app.home.navigation.home	text	navigation	home_page	nav_link	Home navigation link	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
15	app.home.text.how_it_works	text	headers	home_page	section_header	How does it work section header	t	\N	completed	2025-07-18 06:12:10.935049	2025-07-30 13:41:40.186028	\N	\N	1.0
16	app.home.header.TITLE_COMPARE	text	headers	home_page	header	Alternative title: Compare Mortgages (uppercase)	t	\N	completed	2025-07-18 06:21:29.26988	2025-07-30 13:41:40.186028	\N	\N	1.0
17	app.home.text.compare_in_5mins	text	descriptions	home_page	text	Alternative text: Compare mortgages in 5 minutes	t	\N	completed	2025-07-18 06:21:29.26988	2025-07-30 13:41:40.186028	\N	\N	1.0
18	app.home.text.how_it_works_text	text	descriptions	home_page	description	How it works explanation text	t	\N	completed	2025-07-18 06:21:29.26988	2025-07-30 13:41:40.186028	\N	\N	1.0
19	app.home.text.partner_institutions	text	descriptions	home_page	section_header	Partner Financial Institutions	t	\N	completed	2025-07-18 06:33:37.835496	2025-07-30 13:41:40.186028	\N	\N	1.0
20	app.home.text.mortgage_calculator	text	headers	home_page	section_header	Mortgage Calculator section	t	\N	completed	2025-07-18 06:33:37.835496	2025-07-30 13:41:40.186028	\N	\N	1.0
21	app.home.text.calculator_description	text	descriptions	home_page	description	Calculate your mortgage or credit using our advanced calculator	t	\N	completed	2025-07-18 06:33:37.835496	2025-07-30 13:41:40.186028	\N	\N	1.0
22	app.home.text.fill_form_description	text	descriptions	home_page	description	Fill your details to get personalized mortgage offers	t	\N	completed	2025-07-18 06:33:37.835496	2025-07-30 13:41:40.186028	\N	\N	1.0
1904	mortgage_step3_obligation_container	text	ui	mortgage_step3	dropdown_container	Obligation type dropdown container	t	\N	pending	2025-08-02 13:25:50.015184	2025-08-02 13:25:50.015184	1	\N	\N
1905	mortgage_step3_obligation_hapoalim	text	ui	mortgage_step3	option	Bank Hapoalim option for obligation	t	\N	pending	2025-08-02 13:25:58.878791	2025-08-02 13:25:58.878791	1	\N	\N
1906	mortgage_step3_obligation_leumi	text	ui	mortgage_step3	option	Bank Leumi option for obligation	t	\N	pending	2025-08-02 13:26:06.746973	2025-08-02 13:26:06.746973	1	\N	\N
1907	mortgage_step3_obligation_discount	text	ui	mortgage_step3	option	Bank Discount option for obligation	t	\N	pending	2025-08-02 13:26:16.50604	2025-08-02 13:26:16.50604	1	\N	\N
1949	calculate_mortgage_debt_types_option_5	text	income_details	mortgage_step3	option	\N	t	calculate_mortgage_debt_types_option_5	pending	2025-08-04 11:34:37.257501	2025-08-07 10:26:22.484885	\N	\N	\N
2238	mortgage_refinance_increase	text	refinance_mortgage	refinance_step1	text	Purpose: Increase Loan Amount	t	\N	pending	2025-08-13 09:24:59.029367	2025-08-13 09:35:50.659412	\N	\N	\N
\.


--
-- Data for Name: content_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_test (id, title, content, created_at) FROM stdin;
1	Test Content	This is a test content entry for the content database	2025-07-18 07:52:33.428958
\.


--
-- Data for Name: content_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_translations (id, content_item_id, language_code, content_value, is_default, status, created_at, updated_at, created_by, approved_by, approved_at) FROM stdin;
96	85	ru	Это ваша первая квартира?	f	approved	2025-07-20 08:50:55.667806	2025-07-23 14:30:46.238563	1	\N	\N
2342	928	he	קבל את הצעות המשכנתא המתאימות ביותר עבורך	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2343	928	ru	Получите наиболее подходящие предложения по ипотеке для вас	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2344	929	en	Calculation Parameters	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2345	929	he	פרמטרי החישוב	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
3	1	ru	Сайд навигация. Меню	t	approved	2025-07-17 16:54:29.466467	2025-07-22 11:59:34.099765	1	\N	\N
2346	929	ru	Параметры расчета	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2347	930	en	Basic parameters	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2348	930	he	נתוני בסיס	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
19	10	en	Compare Mortgages	f	approved	2025-07-18 06:12:24.818512	2025-07-18 06:12:24.818512	\N	\N	\N
20	10	he	השוואת משכנתאות	f	approved	2025-07-18 06:12:24.818512	2025-07-18 06:12:24.818512	\N	\N	\N
21	10	ru	Сравнение ипотек	f	approved	2025-07-18 06:12:24.818512	2025-07-18 06:12:24.818512	\N	\N	\N
22	11	en	Find your optimal mortgage in 5 minutes	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
23	11	he	מצא את המשכנתא האופטימלית שלך תוך 5 דקות	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
24	11	ru	Найдите оптимальную ипотеку за 5 минут	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
25	12	en	Show offers	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
26	12	he	הצג הצעות	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
27	12	ru	Показать предложения	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
28	13	en	Fill the form	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
29	13	he	מלא את הטופס	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
30	13	ru	Заполнить форму	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
31	14	en	Home	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
32	14	he	בית	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
33	14	ru	Главная	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
34	15	en	How does it work?	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
35	15	he	איך זה עובד?	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
36	15	ru	Как это работает?	f	approved	2025-07-18 06:12:38.192552	2025-07-18 06:12:38.192552	\N	\N	\N
37	16	en	Compare Mortgages	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
38	16	he	השוואת משכנתה / אשראי	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
39	16	ru	Сравнение ипотек / кредитов	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
40	17	en	Compare mortgages in 5 minutes	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
41	17	he	השווה משכנתאות תוך 5 דקות	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
42	17	ru	Сравните ипотеки за 5 минут	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
43	18	en	Our mortgage calculator allows you to calculate the most suitable mortgage for you in real time. All you need to do is enter the required details and click the calculate button. Our mortgage calculator provides various enhanced mortgage programs from leading market providers.	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
44	18	he	מחשבון משכנתא שלנו מאפשר לך לחשב את המשכנתא המתאימה ביותר לך בזמן אמת. כל מה שאתה צריך לעשות הוא להזין את הפרטים הנדרשים ולחץ על כפתור החישוב. מחשבון משכנתא שלנו מספק מגוון תכניות משכנתא משופרות מהספקים המובילים בשוק.	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
45	18	ru	Наш ипотечный калькулятор позволяет вам рассчитать наиболее подходящую ипотеку в режиме реального времени. Все, что вам нужно сделать, это ввести необходимые данные и нажать кнопку расчета. Наш ипотечный калькулятор предоставляет различные улучшенные ипотечные программы от ведущих поставщиков на рынке.	f	approved	2025-07-18 06:21:53.943873	2025-07-18 06:21:53.943873	\N	\N	\N
46	19	en	Partner financial institutions	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
47	19	he	מוסדות פיננסיים שותפים	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
48	19	ru	Финансовые учреждения-партнеры	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
49	20	en	Mortgage calculator	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
50	20	he	מחשבון משכנתא	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
51	20	ru	Ипотечный калькулятор	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
52	21	en	Calculate your mortgage or credit using our advanced calculator	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
53	21	he	חישבו את המשכנתא או האשראי שלכם באמצעות המחשבון המתקדם שלנו	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
54	21	ru	Рассчитайте свою ипотеку или кредит с помощью нашего усовершенствованного калькулятора	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
55	22	en	Complete your details to receive personalized mortgage offers	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
56	22	he	מלאו את פרטיכם לקבלת הצעות משכנתא מותאמות אישית	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
4539	1637	he	הכנסה נוספת	f	approved	2025-07-31 19:54:23.169109	2025-08-15 13:26:16.599523	\N	\N	\N
4540	1637	en	Additional income	f	approved	2025-07-31 19:54:23.169109	2025-08-15 13:26:16.599523	\N	\N	\N
4541	1637	ru	Дополнительный доход	f	approved	2025-07-31 19:54:23.169109	2025-08-15 13:26:16.599523	\N	\N	\N
10	7	en	Refinance Mortgage	f	approved	2025-07-18 06:12:24.818512	2025-07-22 13:02:57.666275	\N	\N	\N
11	7	he	מחזור משכנתא	f	approved	2025-07-18 06:12:24.818512	2025-07-22 13:02:58.085006	\N	\N	\N
12	7	ru	Рефинансирование ипотеки	f	approved	2025-07-18 06:12:24.818512	2025-07-22 13:02:58.084973	\N	\N	\N
57	22	ru	Заполните свои данные для получения персонализированных ипотечных предложений	f	approved	2025-07-18 06:34:25.312563	2025-07-18 06:34:25.312563	\N	\N	\N
58	34	en	New Test English	t	approved	2025-07-18 08:19:42.665444	2025-07-18 08:19:42.665444	1	\N	\N
59	34	he	New Test Hebrew	f	approved	2025-07-18 08:19:42.665444	2025-07-18 08:19:42.665444	1	\N	\N
60	34	ru	New Test Russian	f	approved	2025-07-18 08:19:42.665444	2025-07-18 08:19:42.665444	1	\N	\N
61	37	en	Calculator	t	approved	2025-07-20 08:25:54.722712	2025-07-20 08:25:54.722712	1	\N	\N
62	37	he	מחשבון	f	approved	2025-07-20 08:25:54.722712	2025-07-20 08:25:54.722712	1	\N	\N
63	37	ru	Калькулятор	f	approved	2025-07-20 08:25:54.722712	2025-07-20 08:25:54.722712	1	\N	\N
4542	1638	he	התחייבויות	f	draft	2025-07-31 19:54:23.169109	2025-07-31 19:54:23.169109	\N	\N	\N
4543	1638	en	Obligations	f	draft	2025-07-31 19:54:23.169109	2025-07-31 19:54:23.169109	\N	\N	\N
70	40	en	Calculate Mortgage	t	approved	2025-07-20 08:31:20.022817	2025-07-20 08:31:20.022817	1	\N	\N
71	40	he	חישוב משכנתא	f	approved	2025-07-20 08:31:20.022817	2025-07-20 08:31:20.022817	1	\N	\N
72	40	ru	Рассчитать ипотеку	f	approved	2025-07-20 08:31:20.022817	2025-07-20 08:31:20.022817	1	\N	\N
73	78	en	Property Value	t	approved	2025-07-20 08:50:46.280761	2025-07-20 08:50:46.280761	1	\N	\N
74	78	he	שווי הנכס	f	approved	2025-07-20 08:50:46.280761	2025-07-20 08:50:46.280761	1	\N	\N
4544	1638	ru	Обязательства	f	draft	2025-07-31 19:54:23.169109	2025-07-31 19:54:23.169109	\N	\N	\N
79	80	en	When do you plan to take the mortgage?	t	approved	2025-07-20 08:50:48.837697	2025-07-20 08:50:48.837697	1	\N	\N
80	80	he	מתי תרצה לקחת את המשכנתא?	f	approved	2025-07-20 08:50:48.837697	2025-07-20 08:50:48.837697	1	\N	\N
81	80	ru	Когда вы планируете взять ипотеку?	f	approved	2025-07-20 08:50:48.837697	2025-07-20 08:50:48.837697	1	\N	\N
82	81	en	Select timing	t	approved	2025-07-20 08:50:50.045135	2025-07-20 08:50:50.045135	1	\N	\N
83	81	he	בחר זמן	f	approved	2025-07-20 08:50:50.045135	2025-07-20 08:50:50.045135	1	\N	\N
84	81	ru	Выберите время	f	approved	2025-07-20 08:50:50.045135	2025-07-20 08:50:50.045135	1	\N	\N
85	82	en	Down Payment	t	approved	2025-07-20 08:50:51.497524	2025-07-20 08:50:51.497524	1	\N	\N
88	83	en	Mortgage Type	t	approved	2025-07-20 08:50:52.737459	2025-07-20 08:50:52.737459	1	\N	\N
89	83	he	סוג המשכנתא	f	approved	2025-07-20 08:50:52.737459	2025-07-20 08:50:52.737459	1	\N	\N
90	83	ru	Тип ипотеки	f	approved	2025-07-20 08:50:52.737459	2025-07-20 08:50:52.737459	1	\N	\N
91	84	en	Select mortgage type	t	approved	2025-07-20 08:50:53.957793	2025-07-20 08:50:53.957793	1	\N	\N
92	84	he	בחר סוג משכנתא	f	approved	2025-07-20 08:50:53.957793	2025-07-20 08:50:53.957793	1	\N	\N
93	84	ru	Выберите тип ипотеки	f	approved	2025-07-20 08:50:53.957793	2025-07-20 08:50:53.957793	1	\N	\N
77	79	he	חישוב משכנתא	f	approved	2025-07-20 08:50:47.502796	2025-07-28 07:44:36.696764	1	\N	\N
97	86	en	Select option	t	approved	2025-07-20 08:50:56.937523	2025-07-20 08:50:56.937523	1	\N	\N
98	86	he	בחר אפשרות	f	approved	2025-07-20 08:50:56.937523	2025-07-20 08:50:56.937523	1	\N	\N
99	86	ru	Выберите вариант	f	approved	2025-07-20 08:50:56.937523	2025-07-20 08:50:56.937523	1	\N	\N
100	87	en	Property Ownership Status	t	approved	2025-07-20 08:50:58.443875	2025-07-20 08:50:58.443875	1	\N	\N
101	87	he	סטטוס בעלות על נכס	f	approved	2025-07-20 08:50:58.443875	2025-07-20 08:50:58.443875	1	\N	\N
102	87	ru	Статус владения недвижимостью	f	approved	2025-07-20 08:50:58.443875	2025-07-20 08:50:58.443875	1	\N	\N
103	88	en	Select your property status	t	approved	2025-07-20 08:50:59.59904	2025-07-20 08:50:59.59904	1	\N	\N
104	88	he	בחר את סטטוס הנכס שלך	f	approved	2025-07-20 08:50:59.59904	2025-07-20 08:50:59.59904	1	\N	\N
105	88	ru	Выберите статус недвижимости	f	approved	2025-07-20 08:50:59.59904	2025-07-20 08:50:59.59904	1	\N	\N
106	89	en	Loan Period (Years)	t	approved	2025-07-20 08:51:00.917592	2025-07-20 08:51:00.917592	1	\N	\N
107	89	he	תקופת ההלוואה (שנים)	f	approved	2025-07-20 08:51:00.917592	2025-07-20 08:51:00.917592	1	\N	\N
108	89	ru	Срок кредита (лет)	f	approved	2025-07-20 08:51:00.917592	2025-07-20 08:51:00.917592	1	\N	\N
109	90	en	years minimum	t	approved	2025-07-20 08:51:02.177426	2025-07-20 08:51:02.177426	1	\N	\N
110	90	he	שנים מינימום	f	approved	2025-07-20 08:51:02.177426	2025-07-20 08:51:02.177426	1	\N	\N
111	90	ru	лет минимум	f	approved	2025-07-20 08:51:02.177426	2025-07-20 08:51:02.177426	1	\N	\N
112	91	en	years maximum	t	approved	2025-07-20 08:51:03.885186	2025-07-20 08:51:03.885186	1	\N	\N
113	91	he	שנים מקסימום	f	approved	2025-07-20 08:51:03.885186	2025-07-20 08:51:03.885186	1	\N	\N
114	91	ru	лет максимум	f	approved	2025-07-20 08:51:03.885186	2025-07-20 08:51:03.885186	1	\N	\N
115	92	en	Monthly Payment	t	approved	2025-07-20 08:51:05.102722	2025-07-20 08:51:05.102722	1	\N	\N
116	92	he	תשלום חודשי	f	approved	2025-07-20 08:51:05.102722	2025-07-20 08:51:05.102722	1	\N	\N
117	92	ru	Ежемесячный платеж	f	approved	2025-07-20 08:51:05.102722	2025-07-20 08:51:05.102722	1	\N	\N
118	93	en	In the next 3 months	t	approved	2025-07-20 08:51:06.312408	2025-07-20 08:51:06.312408	1	\N	\N
119	93	he	בשלושת החודשים הקרובים	f	approved	2025-07-20 08:51:06.312408	2025-07-20 08:51:06.312408	1	\N	\N
120	93	ru	В ближайшие 3 месяца	f	approved	2025-07-20 08:51:06.312408	2025-07-20 08:51:06.312408	1	\N	\N
121	94	en	In 3-6 months	t	approved	2025-07-20 08:51:07.558691	2025-07-20 08:51:07.558691	1	\N	\N
122	94	he	בעוד 3-6 חודשים	f	approved	2025-07-20 08:51:07.558691	2025-07-20 08:51:07.558691	1	\N	\N
123	94	ru	Через 3-6 месяцев	f	approved	2025-07-20 08:51:07.558691	2025-07-20 08:51:07.558691	1	\N	\N
94	85	en	Is this your first apartment?	t	approved	2025-07-20 08:50:55.667806	2025-07-23 14:30:46.723777	1	\N	\N
95	85	he	האם זו הדירה הראשונה שלך???	f	approved	2025-07-20 08:50:55.667806	2025-07-23 14:30:46.912956	1	\N	\N
3677	724	ru	Улучшить процентную ставку	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
69	39	ru	Расчет ипотеки	f	approved	2025-07-20 08:30:50.248187	2025-07-27 06:27:34.182795	1	\N	\N
76	79	en	City	t	approved	2025-07-20 08:50:47.502796	2025-07-23 14:31:29.169032	1	\N	\N
66	38	ru	Личные данные	f	approved	2025-07-20 08:30:35.292403	2025-07-24 22:42:35.490832	1	\N	\N
65	38	he	פרטים אישיים2	f	approved	2025-07-20 08:30:35.292403	2025-07-24 22:42:35.490832	1	\N	\N
75	78	ru	Стоимость недвижимости	f	approved	2025-07-20 08:50:46.280761	2025-07-27 06:16:31.10644	1	\N	\N
86	82	he	מקדמה	f	approved	2025-07-20 08:50:51.497524	2025-07-27 06:29:58.446905	1	\N	\N
67	39	en	Mortgage Calculation	t	approved	2025-07-20 08:30:50.248187	2025-07-26 11:25:50.367235	1	\N	\N
87	82	ru	Первоначальный взнос	f	approved	2025-07-20 08:50:51.497524	2025-07-27 06:29:58.067148	1	\N	\N
124	95	en	In 6-12 months	t	approved	2025-07-20 08:51:08.700653	2025-07-20 08:51:08.700653	1	\N	\N
125	95	he	בעוד 6-12 חודשים	f	approved	2025-07-20 08:51:08.700653	2025-07-20 08:51:08.700653	1	\N	\N
126	95	ru	Через 6-12 месяцев	f	approved	2025-07-20 08:51:08.700653	2025-07-20 08:51:08.700653	1	\N	\N
127	96	en	More than 12 months	t	approved	2025-07-20 08:51:09.965411	2025-07-20 08:51:09.965411	1	\N	\N
128	96	he	יותר מ-12 חודשים	f	approved	2025-07-20 08:51:09.965411	2025-07-20 08:51:09.965411	1	\N	\N
129	96	ru	Более 12 месяцев	f	approved	2025-07-20 08:51:09.965411	2025-07-20 08:51:09.965411	1	\N	\N
4545	1639	en	Israel	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4546	1639	he	ישראל	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4547	1639	ru	Израиль	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4548	1640	en	United States	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4549	1640	he	ארצות הברית	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4550	1640	ru	США	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4551	1641	en	Russia	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4552	1641	he	רוסיה	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4553	1641	ru	Россия	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4554	1642	en	Germany	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4555	1642	he	גרמניה	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4556	1642	ru	Германия	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4557	1643	en	France	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4558	1643	he	צרפת	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4559	1643	ru	Франция	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4560	1644	en	United Kingdom	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4561	1644	he	בריטניה	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4562	1644	ru	Великобритания	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4563	1645	en	Canada	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4564	1645	he	קנדה	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4565	1645	ru	Канада	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4566	1646	en	Ukraine	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4567	1646	he	אוקראינה	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4568	1646	ru	Украина	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4569	1647	en	Other	t	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4570	1647	he	אחר	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
4571	1647	ru	Другое	f	approved	2025-07-31 20:24:36.504627	2025-07-31 20:24:36.504627	\N	\N	\N
5151	1891	en	Source of Income	t	approved	2025-08-02 12:04:44.915897	2025-08-02 12:04:44.915897	1	\N	\N
5152	1891	he	מקור הכנסה	f	approved	2025-08-02 12:04:44.915897	2025-08-02 12:04:44.915897	1	\N	\N
5153	1891	ru	Источник дохода	f	approved	2025-08-02 12:04:44.915897	2025-08-02 12:04:44.915897	1	\N	\N
160	173	en	Personal Details	t	approved	2025-07-20 09:33:24.357425	2025-07-20 09:33:24.357425	1	\N	\N
161	173	he	פרטים אישיים	f	approved	2025-07-20 09:33:24.357425	2025-07-20 09:33:24.357425	1	\N	\N
162	173	ru	Личные данные	f	approved	2025-07-20 09:33:24.357425	2025-07-20 09:33:24.357425	1	\N	\N
163	174	en	Your personal data will not be transferred to third parties. We operate in accordance with the Privacy Protection Law, 1981 and data protection regulations	t	approved	2025-07-20 09:33:25.636927	2025-07-20 09:33:25.636927	1	\N	\N
164	174	he	הנתונים האישיים שלכם לא יועברו לגורמים חיצוניים. אנו פועלים בהתאם להוראות חוק הגנת הפרטיות התשמ"א-1981 ותקנות הגנת הנתונים	f	approved	2025-07-20 09:33:25.636927	2025-07-20 09:33:25.636927	1	\N	\N
165	174	ru	Ваши личные данные не будут переданы третьим лицам. Мы действуем в соответствии с Законом о защите конфиденциальности 1981 года и правилами защиты данных	f	approved	2025-07-20 09:33:25.636927	2025-07-20 09:33:25.636927	1	\N	\N
166	175	en	Full Name	t	approved	2025-07-20 09:33:26.911605	2025-07-20 09:33:26.911605	1	\N	\N
167	175	he	שם מלא	f	approved	2025-07-20 09:33:26.911605	2025-07-20 09:33:26.911605	1	\N	\N
168	175	ru	Полное имя	f	approved	2025-07-20 09:33:26.911605	2025-07-20 09:33:26.911605	1	\N	\N
169	176	en	Enter first name and last name	t	approved	2025-07-20 09:33:28.151717	2025-07-20 09:33:28.151717	1	\N	\N
170	176	he	הזן שם פרטי ושם משפחה	f	approved	2025-07-20 09:33:28.151717	2025-07-20 09:33:28.151717	1	\N	\N
171	176	ru	Введите имя и фамилию	f	approved	2025-07-20 09:33:28.151717	2025-07-20 09:33:28.151717	1	\N	\N
172	177	en	Date of Birth	t	approved	2025-07-20 09:33:29.357563	2025-07-20 09:33:29.357563	1	\N	\N
173	177	he	תאריך לידה	f	approved	2025-07-20 09:33:29.357563	2025-07-20 09:33:29.357563	1	\N	\N
174	177	ru	Дата рождения	f	approved	2025-07-20 09:33:29.357563	2025-07-20 09:33:29.357563	1	\N	\N
175	178	en	Education	t	approved	2025-07-20 09:33:30.571481	2025-07-20 09:33:30.571481	1	\N	\N
176	178	he	השכלה	f	approved	2025-07-20 09:33:30.571481	2025-07-20 09:33:30.571481	1	\N	\N
177	178	ru	Образование	f	approved	2025-07-20 09:33:30.571481	2025-07-20 09:33:30.571481	1	\N	\N
178	179	en	Select education level	t	approved	2025-07-20 09:33:31.856714	2025-07-20 09:33:31.856714	1	\N	\N
179	179	he	בחר רמת השכלה	f	approved	2025-07-20 09:33:31.856714	2025-07-20 09:33:31.856714	1	\N	\N
180	179	ru	Выберите уровень образования	f	approved	2025-07-20 09:33:31.856714	2025-07-20 09:33:31.856714	1	\N	\N
5154	1892	en	Additional Source of Income	t	approved	2025-08-02 12:04:50.896541	2025-08-02 12:04:50.896541	1	\N	\N
5155	1892	he	מקור הכנסה נוסף	f	approved	2025-08-02 12:04:50.896541	2025-08-02 12:04:50.896541	1	\N	\N
5156	1892	ru	Дополнительный источник дохода	f	approved	2025-08-02 12:04:50.896541	2025-08-02 12:04:50.896541	1	\N	\N
5205	1915	en	Bank	t	approved	2025-08-02 13:33:40.31245	2025-08-02 13:33:40.31245	1	\N	\N
5206	1915	he	בנק מלווה	f	approved	2025-08-02 13:33:40.31245	2025-08-02 13:33:40.31245	1	\N	\N
5207	1915	ru	Банк	f	approved	2025-08-02 13:33:40.31245	2025-08-02 13:33:40.31245	1	\N	\N
275	211	he	הוסף שותף	f	approved	2025-07-20 09:34:14.951787	2025-08-02 20:10:53.887828	1	\N	\N
5266	1952	en	Responsible credit	f	approved	2025-08-05 13:28:11.941443	2025-08-05 13:28:11.941443	\N	\N	\N
5267	1952	he	אשראי אחראי	f	approved	2025-08-05 13:28:12.051439	2025-08-05 13:28:12.051439	\N	\N	\N
5268	1952	ru	Ответственный кредит	f	approved	2025-08-05 13:28:12.159191	2025-08-05 13:28:12.159191	\N	\N	\N
5269	1953	en	We do not impose hidden services or commissions. Everything is transparent and clear.	f	approved	2025-08-05 13:28:12.271931	2025-08-05 13:28:12.271931	\N	\N	\N
5299	1963	en	Professional team training and support	f	approved	2025-08-05 14:15:31.771501	2025-08-05 14:15:31.771501	\N	\N	\N
4572	1648	en	Select citizenship	t	approved	2025-07-31 20:26:16.732764	2025-07-31 20:26:16.732764	\N	\N	\N
4573	1648	he	בחר אזרחות	f	approved	2025-07-31 20:26:16.732764	2025-07-31 20:26:16.732764	\N	\N	\N
4574	1648	ru	Выберите гражданство	f	approved	2025-07-31 20:26:16.732764	2025-07-31 20:26:16.732764	\N	\N	\N
5157	1895	en	Obligation	t	approved	2025-08-02 12:13:28.155213	2025-08-02 12:13:28.155213	1	\N	\N
5158	1895	he	התחייבות	f	approved	2025-08-02 12:13:28.155213	2025-08-02 12:13:28.155213	1	\N	\N
5159	1895	ru	Обязательство	f	approved	2025-08-02 12:13:28.155213	2025-08-02 12:13:28.155213	1	\N	\N
5208	1916	en	Bank Hapoalim	t	approved	2025-08-02 13:33:52.993526	2025-08-02 13:33:52.993526	1	\N	\N
5209	1916	he	בנק הפועלים	f	approved	2025-08-02 13:33:52.993526	2025-08-02 13:33:52.993526	1	\N	\N
5210	1916	ru	Банк Апоалим	f	approved	2025-08-02 13:33:52.993526	2025-08-02 13:33:52.993526	1	\N	\N
5211	1917	en	Bank Leumi	t	approved	2025-08-02 13:33:53.512293	2025-08-02 13:33:53.512293	1	\N	\N
5212	1917	he	בנק לאומי	f	approved	2025-08-02 13:33:53.512293	2025-08-02 13:33:53.512293	1	\N	\N
5213	1917	ru	Банк Леуми	f	approved	2025-08-02 13:33:53.512293	2025-08-02 13:33:53.512293	1	\N	\N
5214	1918	en	Bank Discount	t	approved	2025-08-02 13:33:54.018819	2025-08-02 13:33:54.018819	1	\N	\N
5215	1918	he	בנק דיסקונט	f	approved	2025-08-02 13:33:54.018819	2025-08-02 13:33:54.018819	1	\N	\N
5216	1918	ru	Банк Дисконт	f	approved	2025-08-02 13:33:54.018819	2025-08-02 13:33:54.018819	1	\N	\N
202	187	en	Do you have additional citizenship?	t	approved	2025-07-20 09:33:42.531507	2025-07-20 09:33:42.531507	1	\N	\N
203	187	he	האם יש לך אזרחות נוספת?	f	approved	2025-07-20 09:33:42.531507	2025-07-20 09:33:42.531507	1	\N	\N
204	187	ru	Есть ли у вас дополнительное гражданство?	f	approved	2025-07-20 09:33:42.531507	2025-07-20 09:33:42.531507	1	\N	\N
205	188	en	Citizenship	t	approved	2025-07-20 09:33:43.916527	2025-07-20 09:33:43.916527	1	\N	\N
206	188	he	אזרחות	f	approved	2025-07-20 09:33:43.916527	2025-07-20 09:33:43.916527	1	\N	\N
207	188	ru	Гражданство	f	approved	2025-07-20 09:33:43.916527	2025-07-20 09:33:43.916527	1	\N	\N
208	189	en	Select citizenship	t	approved	2025-07-20 09:33:45.294066	2025-07-20 09:33:45.294066	1	\N	\N
209	189	he	בחר אזרחות	f	approved	2025-07-20 09:33:45.294066	2025-07-20 09:33:45.294066	1	\N	\N
210	189	ru	Выберите гражданство	f	approved	2025-07-20 09:33:45.294066	2025-07-20 09:33:45.294066	1	\N	\N
211	190	en	Are you liable for tax in foreign countries or additional jurisdictions?	t	approved	2025-07-20 09:33:46.991454	2025-07-20 09:33:46.991454	1	\N	\N
212	190	he	האם אתם חייבים במס במדינות זרות או בתחומי שיפוט נוספים?	f	approved	2025-07-20 09:33:46.991454	2025-07-20 09:33:46.991454	1	\N	\N
213	190	ru	Обязаны ли вы платить налоги в зарубежных странах или дополнительных юрисдикциях?	f	approved	2025-07-20 09:33:46.991454	2025-07-20 09:33:46.991454	1	\N	\N
214	191	en	Do you pay taxes abroad?	t	approved	2025-07-20 09:33:48.291561	2025-07-20 09:33:48.291561	1	\N	\N
215	191	he	האם אתה משלם מס בחו"ל?	f	approved	2025-07-20 09:33:48.291561	2025-07-20 09:33:48.291561	1	\N	\N
216	191	ru	Платите ли вы налоги за границей?	f	approved	2025-07-20 09:33:48.291561	2025-07-20 09:33:48.291561	1	\N	\N
217	192	en	Children under 18	t	approved	2025-07-20 09:33:49.511785	2025-07-20 09:33:49.511785	1	\N	\N
218	192	he	ילדים מתחת לגיל 18	f	approved	2025-07-20 09:33:49.511785	2025-07-20 09:33:49.511785	1	\N	\N
219	192	ru	Дети до 18 лет	f	approved	2025-07-20 09:33:49.511785	2025-07-20 09:33:49.511785	1	\N	\N
220	193	en	Number of children under 18	t	approved	2025-07-20 09:33:50.864023	2025-07-20 09:33:50.864023	1	\N	\N
221	193	he	כמות ילדים מתחת לגיל 18	f	approved	2025-07-20 09:33:50.864023	2025-07-20 09:33:50.864023	1	\N	\N
222	193	ru	Количество детей до 18 лет	f	approved	2025-07-20 09:33:50.864023	2025-07-20 09:33:50.864023	1	\N	\N
223	194	en	Are you insured with valid health insurance and entitled to medical insurance benefits?	t	approved	2025-07-20 09:33:52.421582	2025-07-20 09:33:52.421582	1	\N	\N
224	194	he	האם אתם מבוטחים בביטוח בריאות תקף וחלים עליכם זכויות ביטוח רפואי?	f	approved	2025-07-20 09:33:52.421582	2025-07-20 09:33:52.421582	1	\N	\N
225	194	ru	Застрахованы ли вы действующей медицинской страховкой и имеете ли право на льготы по медицинскому страхованию?	f	approved	2025-07-20 09:33:52.421582	2025-07-20 09:33:52.421582	1	\N	\N
226	195	en	Are you considered a foreign resident under the Income Tax Law?	t	approved	2025-07-20 09:33:53.736602	2025-07-20 09:33:53.736602	1	\N	\N
227	195	he	האם אתם נחשבים לתושבי חוץ על פי חוק מס הכנסה?	f	approved	2025-07-20 09:33:53.736602	2025-07-20 09:33:53.736602	1	\N	\N
228	195	ru	Считаетесь ли вы иностранным резидентом согласно Закону о подоходном налоге?	f	approved	2025-07-20 09:33:53.736602	2025-07-20 09:33:53.736602	1	\N	\N
229	196	en	A foreign resident under the Income Tax Law is a person who resides abroad or does not meet the definition of an Israeli resident for tax purposes	t	approved	2025-07-20 09:33:55.404225	2025-07-20 09:33:55.404225	1	\N	\N
230	196	he	תושב חוץ על פי חוק מס הכנסה הוא אדם המתגורר בחו"ל או אינו עונה על הגדרת תושב ישראל לצורכי מס	f	approved	2025-07-20 09:33:55.404225	2025-07-20 09:33:55.404225	1	\N	\N
231	196	ru	Иностранный резидент согласно Закону о подоходном налоге - это лицо, проживающее за границей или не соответствующее определению израильского резидента для налоговых целей	f	approved	2025-07-20 09:33:55.404225	2025-07-20 09:33:55.404225	1	\N	\N
232	197	en	Do you hold a senior public position or are you among the family members/business partners of a public official?	t	approved	2025-07-20 09:33:56.784151	2025-07-20 09:33:56.784151	1	\N	\N
233	197	he	האם אתם מכהנים בתפקיד ציבורי בכיר או נמנים עם קרובי המשפחה/השותפים העסקיים של נושא תפקיד ציבורי?	f	approved	2025-07-20 09:33:56.784151	2025-07-20 09:33:56.784151	1	\N	\N
234	197	ru	Занимаете ли вы высокую государственную должность или являетесь членом семьи/деловым партнером государственного должностного лица?	f	approved	2025-07-20 09:33:56.784151	2025-07-20 09:33:56.784151	1	\N	\N
235	198	en	Public position: MKs, ministers, judges, senior officers, heads of authorities. Relationship: close family or business partners. Required by law.	t	approved	2025-07-20 09:33:58.212005	2025-07-20 09:33:58.212005	1	\N	\N
300	219	ru	Самозанятый	f	approved	2025-07-20 11:57:29.059044	2025-07-20 11:57:29.059044	1	\N	\N
301	220	en	Pensioner	t	approved	2025-07-20 11:57:29.55718	2025-07-20 11:57:29.55718	1	\N	\N
5217	1919	en	Bank Massad	t	approved	2025-08-02 13:33:54.519091	2025-08-02 13:33:54.519091	1	\N	\N
236	198	he	תפקיד ציבורי: חכ"ם, שרים, שופטים, קצינים בכירים, ראשי רשויות. קרבה: משפחה קרובה או שותפים עסקיים. נדרש על פי חוק.	f	approved	2025-07-20 09:33:58.212005	2025-07-20 09:33:58.212005	1	\N	\N
237	198	ru	Государственная должность: депутаты Кнессета, министры, судьи, старшие офицеры, главы органов власти. Родство: близкая семья или деловые партнеры. Требуется по закону.	f	approved	2025-07-20 09:33:58.212005	2025-07-20 09:33:58.212005	1	\N	\N
238	199	en	How many borrowers will there be in total, including you?	t	approved	2025-07-20 09:33:59.591721	2025-07-20 09:33:59.591721	1	\N	\N
239	199	he	כמה חייבים במשכנתא יהיו בסך הכול, כולל אתכם?	f	approved	2025-07-20 09:33:59.591721	2025-07-20 09:33:59.591721	1	\N	\N
240	199	ru	Сколько заемщиков будет всего, включая вас?	f	approved	2025-07-20 09:33:59.591721	2025-07-20 09:33:59.591721	1	\N	\N
241	200	en	Enter number of borrowers	t	approved	2025-07-20 09:34:00.816584	2025-07-20 09:34:00.816584	1	\N	\N
242	200	he	הזן מספר לווים	f	approved	2025-07-20 09:34:00.816584	2025-07-20 09:34:00.816584	1	\N	\N
243	200	ru	Введите количество заемщиков	f	approved	2025-07-20 09:34:00.816584	2025-07-20 09:34:00.816584	1	\N	\N
244	201	en	Marital Status	t	approved	2025-07-20 09:34:02.2565	2025-07-20 09:34:02.2565	1	\N	\N
245	201	he	מצב משפחתי	f	approved	2025-07-20 09:34:02.2565	2025-07-20 09:34:02.2565	1	\N	\N
246	201	ru	Семейное положение	f	approved	2025-07-20 09:34:02.2565	2025-07-20 09:34:02.2565	1	\N	\N
247	202	en	Select marital status	t	approved	2025-07-20 09:34:03.491717	2025-07-20 09:34:03.491717	1	\N	\N
248	202	he	בחר מצב משפחתי	f	approved	2025-07-20 09:34:03.491717	2025-07-20 09:34:03.491717	1	\N	\N
249	202	ru	Выберите семейное положение	f	approved	2025-07-20 09:34:03.491717	2025-07-20 09:34:03.491717	1	\N	\N
4575	1649	en	Loan Amount	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4576	1649	he	סכום ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4577	1649	ru	Сумма кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4578	1651	en	Loan Period	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4579	1660	en	5 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4580	1661	en	10 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4581	1662	en	15 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4582	1663	en	20 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4583	1664	en	25 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4584	1665	en	30 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4585	1651	he	תקופת ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4586	1660	he	5 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4587	1661	he	10 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4588	1662	he	15 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4589	1663	he	20 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4590	1664	he	25 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4591	1665	he	30 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4592	1651	ru	Срок кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
268	209	en	Will the partner participate in mortgage payments?	t	approved	2025-07-20 09:34:12.496641	2025-07-20 09:34:12.496641	1	\N	\N
269	209	he	האם השותף ישתתף בתשלומי המשכנתא?	f	approved	2025-07-20 09:34:12.496641	2025-07-20 09:34:12.496641	1	\N	\N
270	209	ru	Будет ли партнер участвовать в выплатах по ипотеке?	f	approved	2025-07-20 09:34:12.496641	2025-07-20 09:34:12.496641	1	\N	\N
271	210	en	Add	t	approved	2025-07-20 09:34:13.716582	2025-07-20 09:34:13.716582	1	\N	\N
272	210	he	הוסף	f	approved	2025-07-20 09:34:13.716582	2025-07-20 09:34:13.716582	1	\N	\N
273	210	ru	Добавить	f	approved	2025-07-20 09:34:13.716582	2025-07-20 09:34:13.716582	1	\N	\N
274	211	en	Add Partner	t	approved	2025-07-20 09:34:14.951787	2025-07-20 09:34:14.951787	1	\N	\N
276	211	ru	Добавить партнера	f	approved	2025-07-20 09:34:14.951787	2025-07-20 09:34:14.951787	1	\N	\N
277	212	en	Search	t	approved	2025-07-20 09:34:16.311789	2025-07-20 09:34:16.311789	1	\N	\N
278	212	he	חיפוש	f	approved	2025-07-20 09:34:16.311789	2025-07-20 09:34:16.311789	1	\N	\N
279	212	ru	Поиск	f	approved	2025-07-20 09:34:16.311789	2025-07-20 09:34:16.311789	1	\N	\N
280	213	en	No results found	t	approved	2025-07-20 09:34:17.753657	2025-07-20 09:34:17.753657	1	\N	\N
281	213	he	לא נמצאו תוצאות	f	approved	2025-07-20 09:34:17.753657	2025-07-20 09:34:17.753657	1	\N	\N
282	213	ru	Результаты не найдены	f	approved	2025-07-20 09:34:17.753657	2025-07-20 09:34:17.753657	1	\N	\N
283	214	en	Countries	t	approved	2025-07-20 09:34:19.036631	2025-07-20 09:34:19.036631	1	\N	\N
284	214	he	מדינות	f	approved	2025-07-20 09:34:19.036631	2025-07-20 09:34:19.036631	1	\N	\N
285	214	ru	Страны	f	approved	2025-07-20 09:34:19.036631	2025-07-20 09:34:19.036631	1	\N	\N
286	215	en	Income Details	t	approved	2025-07-20 10:58:23.519291	2025-07-20 10:58:23.519291	1	\N	\N
287	215	he	פרטי הכנסה	f	approved	2025-07-20 10:58:23.519291	2025-07-20 10:58:23.519291	1	\N	\N
288	215	ru	Данные о доходах	f	approved	2025-07-20 10:58:23.519291	2025-07-20 10:58:23.519291	1	\N	\N
289	216	en	Main source of income	t	approved	2025-07-20 10:58:36.304511	2025-07-20 10:58:36.304511	1	\N	\N
290	216	he	מקור הכנסה עיקרי	f	approved	2025-07-20 10:58:36.304511	2025-07-20 10:58:36.304511	1	\N	\N
291	216	ru	Основной источник дохода	f	approved	2025-07-20 10:58:36.304511	2025-07-20 10:58:36.304511	1	\N	\N
292	217	en	Select main source of income	t	approved	2025-07-20 11:39:53.951096	2025-07-20 11:39:53.951096	1	\N	\N
293	217	he	בחר מקור הכנסה עיקרי	f	approved	2025-07-20 11:39:53.951096	2025-07-20 11:39:53.951096	1	\N	\N
294	217	ru	Выберите основной источник дохода	f	approved	2025-07-20 11:39:53.951096	2025-07-20 11:39:53.951096	1	\N	\N
295	218	en	Employee	t	approved	2025-07-20 11:57:28.375605	2025-07-20 11:57:28.375605	1	\N	\N
296	218	he	עובד שכיר	f	approved	2025-07-20 11:57:28.375605	2025-07-20 11:57:28.375605	1	\N	\N
297	218	ru	Наемный работник	f	approved	2025-07-20 11:57:28.375605	2025-07-20 11:57:28.375605	1	\N	\N
298	219	en	Self-employed	t	approved	2025-07-20 11:57:29.059044	2025-07-20 11:57:29.059044	1	\N	\N
299	219	he	עצמאי	f	approved	2025-07-20 11:57:29.059044	2025-07-20 11:57:29.059044	1	\N	\N
4593	1660	ru	5 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4594	1661	ru	10 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4595	1662	ru	15 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
302	220	he	פנסיונר	f	approved	2025-07-20 11:57:29.55718	2025-07-20 11:57:29.55718	1	\N	\N
303	220	ru	Пенсионер	f	approved	2025-07-20 11:57:29.55718	2025-07-20 11:57:29.55718	1	\N	\N
304	221	en	Student	t	approved	2025-07-20 11:57:30.050455	2025-07-20 11:57:30.050455	1	\N	\N
305	221	he	סטודנט	f	approved	2025-07-20 11:57:30.050455	2025-07-20 11:57:30.050455	1	\N	\N
306	221	ru	Студент	f	approved	2025-07-20 11:57:30.050455	2025-07-20 11:57:30.050455	1	\N	\N
307	222	en	Unpaid leave	t	approved	2025-07-20 11:57:30.567702	2025-07-20 11:57:30.567702	1	\N	\N
308	222	he	חופשה ללא תשלום	f	approved	2025-07-20 11:57:30.567702	2025-07-20 11:57:30.567702	1	\N	\N
309	222	ru	Неоплачиваемый отпуск	f	approved	2025-07-20 11:57:30.567702	2025-07-20 11:57:30.567702	1	\N	\N
310	223	en	Unemployed	t	approved	2025-07-20 11:57:31.076325	2025-07-20 11:57:31.076325	1	\N	\N
311	223	he	מובטל	f	approved	2025-07-20 11:57:31.076325	2025-07-20 11:57:31.076325	1	\N	\N
312	223	ru	Безработный	f	approved	2025-07-20 11:57:31.076325	2025-07-20 11:57:31.076325	1	\N	\N
313	224	en	Other	t	approved	2025-07-20 11:57:31.566423	2025-07-20 11:57:31.566423	1	\N	\N
314	224	he	אחר	f	approved	2025-07-20 11:57:31.566423	2025-07-20 11:57:31.566423	1	\N	\N
315	224	ru	Другое	f	approved	2025-07-20 11:57:31.566423	2025-07-20 11:57:31.566423	1	\N	\N
316	225	en	Do you have additional income?	t	approved	2025-07-20 11:58:23.19169	2025-07-20 11:58:23.19169	1	\N	\N
317	225	he	האם קיימות הכנסות נוספות?	f	approved	2025-07-20 11:58:23.19169	2025-07-20 11:58:23.19169	1	\N	\N
318	225	ru	Есть ли дополнительные доходы?	f	approved	2025-07-20 11:58:23.19169	2025-07-20 11:58:23.19169	1	\N	\N
319	226	en	Select additional income type	t	approved	2025-07-20 11:58:24.044175	2025-07-20 11:58:24.044175	1	\N	\N
320	226	he	בחר סוג הכנסה נוספת	f	approved	2025-07-20 11:58:24.044175	2025-07-20 11:58:24.044175	1	\N	\N
321	226	ru	Выберите тип дополнительного дохода	f	approved	2025-07-20 11:58:24.044175	2025-07-20 11:58:24.044175	1	\N	\N
322	227	en	No additional income	t	approved	2025-07-20 11:58:24.67596	2025-07-20 11:58:24.67596	1	\N	\N
323	227	he	אין הכנסות נוספות	f	approved	2025-07-20 11:58:24.67596	2025-07-20 11:58:24.67596	1	\N	\N
324	227	ru	Нет дополнительных доходов	f	approved	2025-07-20 11:58:24.67596	2025-07-20 11:58:24.67596	1	\N	\N
325	228	en	Additional salary	t	approved	2025-07-20 11:58:25.257749	2025-07-20 11:58:25.257749	1	\N	\N
326	228	he	שכר נוסף	f	approved	2025-07-20 11:58:25.257749	2025-07-20 11:58:25.257749	1	\N	\N
327	228	ru	Дополнительная зарплата	f	approved	2025-07-20 11:58:25.257749	2025-07-20 11:58:25.257749	1	\N	\N
328	229	en	Additional work	t	approved	2025-07-20 11:58:25.853926	2025-07-20 11:58:25.853926	1	\N	\N
329	229	he	עבודה נוספת	f	approved	2025-07-20 11:58:25.853926	2025-07-20 11:58:25.853926	1	\N	\N
330	229	ru	Дополнительная работа	f	approved	2025-07-20 11:58:25.853926	2025-07-20 11:58:25.853926	1	\N	\N
331	230	en	Property rental income	t	approved	2025-07-20 11:58:26.526208	2025-07-20 11:58:26.526208	1	\N	\N
332	230	he	הכנסה מהשכרת נכסים	f	approved	2025-07-20 11:58:26.526208	2025-07-20 11:58:26.526208	1	\N	\N
333	230	ru	Доход от аренды недвижимости	f	approved	2025-07-20 11:58:26.526208	2025-07-20 11:58:26.526208	1	\N	\N
334	231	en	Investment income	t	approved	2025-07-20 11:58:27.162542	2025-07-20 11:58:27.162542	1	\N	\N
335	231	he	הכנסה מהשקעות	f	approved	2025-07-20 11:58:27.162542	2025-07-20 11:58:27.162542	1	\N	\N
336	231	ru	Доход от инвестиций	f	approved	2025-07-20 11:58:27.162542	2025-07-20 11:58:27.162542	1	\N	\N
337	232	en	Pension income	t	approved	2025-07-20 11:58:27.764027	2025-07-20 11:58:27.764027	1	\N	\N
338	232	he	קצבת פנסיה	f	approved	2025-07-20 11:58:27.764027	2025-07-20 11:58:27.764027	1	\N	\N
339	232	ru	Пенсионный доход	f	approved	2025-07-20 11:58:27.764027	2025-07-20 11:58:27.764027	1	\N	\N
340	233	en	Other	t	approved	2025-07-20 11:58:28.33161	2025-07-20 11:58:28.33161	1	\N	\N
341	233	he	אחר	f	approved	2025-07-20 11:58:28.33161	2025-07-20 11:58:28.33161	1	\N	\N
342	233	ru	Другое	f	approved	2025-07-20 11:58:28.33161	2025-07-20 11:58:28.33161	1	\N	\N
343	234	en	Do you have existing bank debts or financial obligations?	t	approved	2025-07-20 11:58:53.99891	2025-07-20 11:58:53.99891	1	\N	\N
344	234	he	האם יש לכם חובות בנקאיים או התחייבויות פיננסיות קיימות?	f	approved	2025-07-20 11:58:53.99891	2025-07-20 11:58:53.99891	1	\N	\N
345	234	ru	Есть ли банковские долги или финансовые обязательства?	f	approved	2025-07-20 11:58:53.99891	2025-07-20 11:58:53.99891	1	\N	\N
346	235	en	Select obligation type	t	approved	2025-07-20 11:58:54.736823	2025-07-20 11:58:54.736823	1	\N	\N
347	235	he	בחר סוג התחייבות	f	approved	2025-07-20 11:58:54.736823	2025-07-20 11:58:54.736823	1	\N	\N
348	235	ru	Выберите тип обязательства	f	approved	2025-07-20 11:58:54.736823	2025-07-20 11:58:54.736823	1	\N	\N
349	236	en	No obligations	t	approved	2025-07-20 11:58:55.22593	2025-07-20 11:58:55.22593	1	\N	\N
4536	1636	he	מקור הכנסה עיקרי	f	approved	2025-07-31 19:54:23.169109	2025-08-15 13:26:16.490851	\N	\N	\N
351	236	ru	Нет обязательств	f	approved	2025-07-20 11:58:55.22593	2025-07-20 11:58:55.22593	1	\N	\N
352	237	en	Bank loan	t	approved	2025-07-20 11:58:55.752477	2025-07-20 11:58:55.752477	1	\N	\N
4537	1636	en	Main source of income	f	approved	2025-07-31 19:54:23.169109	2025-08-15 13:26:16.490851	\N	\N	\N
354	237	ru	Банковский кредит	f	approved	2025-07-20 11:58:55.752477	2025-07-20 11:58:55.752477	1	\N	\N
355	238	en	Consumer credit	t	approved	2025-07-20 11:58:56.459901	2025-07-20 11:58:56.459901	1	\N	\N
4538	1636	ru	Основной источник дохода	f	approved	2025-07-31 19:54:23.169109	2025-08-15 13:26:16.490851	\N	\N	\N
357	238	ru	Потребительский кредит	f	approved	2025-07-20 11:58:56.459901	2025-07-20 11:58:56.459901	1	\N	\N
358	239	en	Credit card debt	t	approved	2025-07-20 11:58:56.94863	2025-07-20 11:58:56.94863	1	\N	\N
360	239	ru	Долг по кредитной карте	f	approved	2025-07-20 11:58:56.94863	2025-07-20 11:58:56.94863	1	\N	\N
361	240	en	Other	t	approved	2025-07-20 11:58:57.498519	2025-07-20 11:58:57.498519	1	\N	\N
362	240	he	אחר	f	approved	2025-07-20 11:58:57.498519	2025-07-20 11:58:57.498519	1	\N	\N
363	240	ru	Другое	f	approved	2025-07-20 11:58:57.498519	2025-07-20 11:58:57.498519	1	\N	\N
364	241	en	Net monthly income	t	approved	2025-07-20 11:59:29.658396	2025-07-20 11:59:29.658396	1	\N	\N
365	241	he	הכנסה חודשית נטו	f	approved	2025-07-20 11:59:29.658396	2025-07-20 11:59:29.658396	1	\N	\N
366	241	ru	Чистый месячный доход	f	approved	2025-07-20 11:59:29.658396	2025-07-20 11:59:29.658396	1	\N	\N
367	242	en	Enter net monthly income	t	approved	2025-07-20 11:59:30.429004	2025-07-20 11:59:30.429004	1	\N	\N
368	242	he	הזן הכנסה חודשית נטו	f	approved	2025-07-20 11:59:30.429004	2025-07-20 11:59:30.429004	1	\N	\N
369	242	ru	Введите чистый месячный доход	f	approved	2025-07-20 11:59:30.429004	2025-07-20 11:59:30.429004	1	\N	\N
370	243	en	Amount shown after tax deduction as certified by accountant	t	approved	2025-07-20 11:59:30.892189	2025-07-20 11:59:30.892189	1	\N	\N
371	243	he	הסכום מוצג לאחר ניכוי מיסים כפי שמאושר על ידי רואה חשבון	f	approved	2025-07-20 11:59:30.892189	2025-07-20 11:59:30.892189	1	\N	\N
372	243	ru	Сумма указана после вычета налогов в соответствии с подтверждением бухгалтера	f	approved	2025-07-20 11:59:30.892189	2025-07-20 11:59:30.892189	1	\N	\N
373	244	en	Professional field of activity	t	approved	2025-07-20 11:59:31.378734	2025-07-20 11:59:31.378734	1	\N	\N
374	244	he	תחום פעילות מקצועי	f	approved	2025-07-20 11:59:31.378734	2025-07-20 11:59:31.378734	1	\N	\N
375	244	ru	Профессиональная сфера деятельности	f	approved	2025-07-20 11:59:31.378734	2025-07-20 11:59:31.378734	1	\N	\N
376	245	en	Workplace	t	approved	2025-07-20 11:59:31.841964	2025-07-20 11:59:31.841964	1	\N	\N
377	245	he	מקום עבודה	f	approved	2025-07-20 11:59:31.841964	2025-07-20 11:59:31.841964	1	\N	\N
378	245	ru	Место работы	f	approved	2025-07-20 11:59:31.841964	2025-07-20 11:59:31.841964	1	\N	\N
379	246	en	Position	t	approved	2025-07-20 11:59:32.323891	2025-07-20 11:59:32.323891	1	\N	\N
380	246	he	תפקיד	f	approved	2025-07-20 11:59:32.323891	2025-07-20 11:59:32.323891	1	\N	\N
381	246	ru	Должность	f	approved	2025-07-20 11:59:32.323891	2025-07-20 11:59:32.323891	1	\N	\N
382	247	en	Your current position at workplace	t	approved	2025-07-20 11:59:32.78983	2025-07-20 11:59:32.78983	1	\N	\N
383	247	he	תפקידכם הנוכחי במקום העבודה	f	approved	2025-07-20 11:59:32.78983	2025-07-20 11:59:32.78983	1	\N	\N
384	247	ru	Ваша текущая должность на рабочем месте	f	approved	2025-07-20 11:59:32.78983	2025-07-20 11:59:32.78983	1	\N	\N
385	248	en	Work start date	t	approved	2025-07-20 11:59:33.255855	2025-07-20 11:59:33.255855	1	\N	\N
386	248	he	תאריך תחילת העבודה	f	approved	2025-07-20 11:59:33.255855	2025-07-20 11:59:33.255855	1	\N	\N
387	248	ru	Дата начала работы	f	approved	2025-07-20 11:59:33.255855	2025-07-20 11:59:33.255855	1	\N	\N
388	249	en	Borrower	t	approved	2025-07-20 11:59:33.720759	2025-07-20 11:59:33.720759	1	\N	\N
389	249	he	לווה	f	approved	2025-07-20 11:59:33.720759	2025-07-20 11:59:33.720759	1	\N	\N
390	249	ru	Заемщик	f	approved	2025-07-20 11:59:33.720759	2025-07-20 11:59:33.720759	1	\N	\N
391	250	en	Add borrower	t	approved	2025-07-20 11:59:34.192267	2025-07-20 11:59:34.192267	1	\N	\N
392	250	he	הוסף לווה	f	approved	2025-07-20 11:59:34.192267	2025-07-20 11:59:34.192267	1	\N	\N
393	250	ru	Добавить заемщика	f	approved	2025-07-20 11:59:34.192267	2025-07-20 11:59:34.192267	1	\N	\N
394	251	en	Add workplace	t	approved	2025-07-20 11:59:34.655169	2025-07-20 11:59:34.655169	1	\N	\N
395	251	he	הוסף מקום עבודה	f	approved	2025-07-20 11:59:34.655169	2025-07-20 11:59:34.655169	1	\N	\N
396	251	ru	Добавить место работы	f	approved	2025-07-20 11:59:34.655169	2025-07-20 11:59:34.655169	1	\N	\N
397	252	en	Add additional income source	t	approved	2025-07-20 11:59:35.126245	2025-07-20 11:59:35.126245	1	\N	\N
398	252	he	הוסף מקור הכנסה נוסף	f	approved	2025-07-20 11:59:35.126245	2025-07-20 11:59:35.126245	1	\N	\N
399	252	ru	Добавить дополнительный источник дохода	f	approved	2025-07-20 11:59:35.126245	2025-07-20 11:59:35.126245	1	\N	\N
400	253	en	Add obligation	t	approved	2025-07-20 11:59:35.589613	2025-07-20 11:59:35.589613	1	\N	\N
401	253	he	הוסף התחייבות	f	approved	2025-07-20 11:59:35.589613	2025-07-20 11:59:35.589613	1	\N	\N
402	253	ru	Добавить обязательство	f	approved	2025-07-20 11:59:35.589613	2025-07-20 11:59:35.589613	1	\N	\N
403	254	en	Income source	t	approved	2025-07-20 12:02:05.7903	2025-07-20 12:02:05.7903	1	\N	\N
404	254	he	מקור הכנסה	f	approved	2025-07-20 12:02:05.7903	2025-07-20 12:02:05.7903	1	\N	\N
405	254	ru	Источник дохода	f	approved	2025-07-20 12:02:05.7903	2025-07-20 12:02:05.7903	1	\N	\N
406	255	en	Additional income source	t	approved	2025-07-20 12:02:06.569125	2025-07-20 12:02:06.569125	1	\N	\N
407	255	he	מקור הכנסה נוסף	f	approved	2025-07-20 12:02:06.569125	2025-07-20 12:02:06.569125	1	\N	\N
408	255	ru	Дополнительный источник дохода	f	approved	2025-07-20 12:02:06.569125	2025-07-20 12:02:06.569125	1	\N	\N
409	256	en	Obligation	t	approved	2025-07-20 12:02:07.117244	2025-07-20 12:02:07.117244	1	\N	\N
410	256	he	התחייבות	f	approved	2025-07-20 12:02:07.117244	2025-07-20 12:02:07.117244	1	\N	\N
411	256	ru	Обязательство	f	approved	2025-07-20 12:02:07.117244	2025-07-20 12:02:07.117244	1	\N	\N
412	257	en	Personal details of borrowers	t	approved	2025-07-20 13:24:21.198279	2025-07-20 13:24:21.198279	1	\N	\N
413	257	he	פרטים אישיים של הלווים	f	approved	2025-07-20 13:24:21.198279	2025-07-20 13:24:21.198279	1	\N	\N
414	257	ru	Личные данные заемщиков	f	approved	2025-07-20 13:24:21.198279	2025-07-20 13:24:21.198279	1	\N	\N
415	258	en	What is your relationship to the borrowers?	t	approved	2025-07-20 13:24:22.092894	2025-07-20 13:24:22.092894	1	\N	\N
416	258	he	מה הקשר שלכם ללווים?	f	approved	2025-07-20 13:24:22.092894	2025-07-20 13:24:22.092894	1	\N	\N
417	258	ru	Какова ваша связь с заемщиками?	f	approved	2025-07-20 13:24:22.092894	2025-07-20 13:24:22.092894	1	\N	\N
418	259	en	Enter your relationship (e.g., spouse, parent, guarantor)	t	approved	2025-07-20 13:24:22.646409	2025-07-20 13:24:22.646409	1	\N	\N
419	259	he	הזן את הקשר שלך (למשל: בן/בת זוג, הורה, ערב)	f	approved	2025-07-20 13:24:22.646409	2025-07-20 13:24:22.646409	1	\N	\N
420	259	ru	Введите ваши отношения (например: супруг, родитель, поручитель)	f	approved	2025-07-20 13:24:22.646409	2025-07-20 13:24:22.646409	1	\N	\N
421	260	en	Personal Info	t	approved	2025-07-20 13:24:23.268619	2025-07-20 13:24:23.268619	1	\N	\N
422	260	he	מידע אישי	f	approved	2025-07-20 13:24:23.268619	2025-07-20 13:24:23.268619	1	\N	\N
423	260	ru	Личная информация	f	approved	2025-07-20 13:24:23.268619	2025-07-20 13:24:23.268619	1	\N	\N
424	261	en	Income Details	t	approved	2025-07-20 13:24:23.961429	2025-07-20 13:24:23.961429	1	\N	\N
425	261	he	פרטי הכנסה	f	approved	2025-07-20 13:24:23.961429	2025-07-20 13:24:23.961429	1	\N	\N
426	261	ru	Данные о доходах	f	approved	2025-07-20 13:24:23.961429	2025-07-20 13:24:23.961429	1	\N	\N
427	262	en	Income Details	t	approved	2025-07-20 13:24:24.656706	2025-07-20 13:24:24.656706	1	\N	\N
428	262	he	פרטי הכנסה	f	approved	2025-07-20 13:24:24.656706	2025-07-20 13:24:24.656706	1	\N	\N
429	262	ru	Данные о доходах	f	approved	2025-07-20 13:24:24.656706	2025-07-20 13:24:24.656706	1	\N	\N
430	263	en	Application Summary	t	approved	2025-07-20 14:21:24.439883	2025-07-20 14:21:24.439883	1	\N	\N
431	263	he	סיכום הבקשה	f	approved	2025-07-20 14:21:24.439883	2025-07-20 14:21:24.439883	1	\N	\N
1330	593	he	עד ₪ 300,000	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
432	263	ru	Сводка заявки	f	approved	2025-07-20 14:21:24.439883	2025-07-20 14:21:24.439883	1	\N	\N
433	264	en	The detailed results above are estimates only and do not constitute any commitment. To receive customized and binding offers from financial institutions, you need to complete the official registration process.	t	approved	2025-07-20 14:21:24.978698	2025-07-20 14:21:24.978698	1	\N	\N
434	264	he	התוצאות המפורטות לעיל הן בגדר הערכה בלבד ואינן מהוות התחייבות כלשהי. לקבלת הצעות מותאמות ומחייבות מהמוסדות הפיננסיים, נדרש להשלים את תהליך הרישום הרשמי.	f	approved	2025-07-20 14:21:24.978698	2025-07-20 14:21:24.978698	1	\N	\N
435	264	ru	Приведенные выше подробные результаты являются только оценками и не являются обязательствами. Для получения индивидуальных и обязывающих предложений от финансовых учреждений необходимо завершить процесс официальной регистрации.	f	approved	2025-07-20 14:21:24.978698	2025-07-20 14:21:24.978698	1	\N	\N
436	265	en	Calculation Parameters	t	approved	2025-07-20 14:21:25.600497	2025-07-20 14:21:25.600497	1	\N	\N
437	265	he	פרמטרי החישוב	f	approved	2025-07-20 14:21:25.600497	2025-07-20 14:21:25.600497	1	\N	\N
438	265	ru	Параметры расчета	f	approved	2025-07-20 14:21:25.600497	2025-07-20 14:21:25.600497	1	\N	\N
439	266	en	Personal Profile Details	t	approved	2025-07-20 14:21:26.15849	2025-07-20 14:21:26.15849	1	\N	\N
440	266	he	פרטי הפרופיל האישי	f	approved	2025-07-20 14:21:26.15849	2025-07-20 14:21:26.15849	1	\N	\N
441	266	ru	Данные личного профиля	f	approved	2025-07-20 14:21:26.15849	2025-07-20 14:21:26.15849	1	\N	\N
442	267	en	Mortgage Filter	t	approved	2025-07-20 14:21:26.70653	2025-07-20 14:21:26.70653	1	\N	\N
443	267	he	מסנן משכנתאות	f	approved	2025-07-20 14:21:26.70653	2025-07-20 14:21:26.70653	1	\N	\N
444	267	ru	Фильтр ипотеки	f	approved	2025-07-20 14:21:26.70653	2025-07-20 14:21:26.70653	1	\N	\N
445	268	en	Basic parameters	t	approved	2025-07-20 14:21:27.241137	2025-07-20 14:21:27.241137	1	\N	\N
446	268	he	נתוני בסיס	f	approved	2025-07-20 14:21:27.241137	2025-07-20 14:21:27.241137	1	\N	\N
447	268	ru	Базовые параметры	f	approved	2025-07-20 14:21:27.241137	2025-07-20 14:21:27.241137	1	\N	\N
448	269	en	Mortgage cost	t	approved	2025-07-20 14:21:27.765924	2025-07-20 14:21:27.765924	1	\N	\N
449	269	he	עלות המשכנתא	f	approved	2025-07-20 14:21:27.765924	2025-07-20 14:21:27.765924	1	\N	\N
450	269	ru	Стоимость ипотеки	f	approved	2025-07-20 14:21:27.765924	2025-07-20 14:21:27.765924	1	\N	\N
451	270	en	Mortgage period	t	approved	2025-07-20 14:21:28.319276	2025-07-20 14:21:28.319276	1	\N	\N
452	270	he	תקופת המשכנתא	f	approved	2025-07-20 14:21:28.319276	2025-07-20 14:21:28.319276	1	\N	\N
453	270	ru	Период ипотеки	f	approved	2025-07-20 14:21:28.319276	2025-07-20 14:21:28.319276	1	\N	\N
454	271	en	months	t	approved	2025-07-20 14:21:28.855423	2025-07-20 14:21:28.855423	1	\N	\N
455	271	he	חודשים	f	approved	2025-07-20 14:21:28.855423	2025-07-20 14:21:28.855423	1	\N	\N
456	271	ru	месяцев	f	approved	2025-07-20 14:21:28.855423	2025-07-20 14:21:28.855423	1	\N	\N
457	272	en	All mortgage programs	t	approved	2025-07-20 14:21:29.387287	2025-07-20 14:21:29.387287	1	\N	\N
458	272	he	כל תכניות המשכנתא	f	approved	2025-07-20 14:21:29.387287	2025-07-20 14:21:29.387287	1	\N	\N
459	272	ru	Все ипотечные программы	f	approved	2025-07-20 14:21:29.387287	2025-07-20 14:21:29.387287	1	\N	\N
460	273	en	Prime rate mortgages	t	approved	2025-07-20 14:21:29.92011	2025-07-20 14:21:29.92011	1	\N	\N
461	273	he	משכנתאות בריבית פריים	f	approved	2025-07-20 14:21:29.92011	2025-07-20 14:21:29.92011	1	\N	\N
462	273	ru	Ипотека по базовой ставке	f	approved	2025-07-20 14:21:29.92011	2025-07-20 14:21:29.92011	1	\N	\N
463	274	en	Fixed rate mortgages	t	approved	2025-07-20 14:21:30.455228	2025-07-20 14:21:30.455228	1	\N	\N
464	274	he	משכנתאות בריבית קבועה	f	approved	2025-07-20 14:21:30.455228	2025-07-20 14:21:30.455228	1	\N	\N
465	274	ru	Ипотека с фиксированной ставкой	f	approved	2025-07-20 14:21:30.455228	2025-07-20 14:21:30.455228	1	\N	\N
466	275	en	Variable rate mortgages	t	approved	2025-07-20 14:21:31.048439	2025-07-20 14:21:31.048439	1	\N	\N
467	275	he	משכנתאות בריבית משתנה	f	approved	2025-07-20 14:21:31.048439	2025-07-20 14:21:31.048439	1	\N	\N
468	275	ru	Ипотека с переменной ставкой	f	approved	2025-07-20 14:21:31.048439	2025-07-20 14:21:31.048439	1	\N	\N
469	276	en	Total Amount	t	approved	2025-07-20 14:29:02.494674	2025-07-20 14:29:02.494674	1	\N	\N
470	276	he	סכום כולל	f	approved	2025-07-20 14:29:02.494674	2025-07-20 14:29:02.494674	1	\N	\N
471	276	ru	Общая сумма	f	approved	2025-07-20 14:29:02.494674	2025-07-20 14:29:02.494674	1	\N	\N
472	277	en	Total Return	t	approved	2025-07-20 14:29:03.039317	2025-07-20 14:29:03.039317	1	\N	\N
473	277	he	סך החזר	f	approved	2025-07-20 14:29:03.039317	2025-07-20 14:29:03.039317	1	\N	\N
474	277	ru	Общий возврат	f	approved	2025-07-20 14:29:03.039317	2025-07-20 14:29:03.039317	1	\N	\N
475	278	en	Monthly Payment	t	approved	2025-07-20 14:29:03.753809	2025-07-20 14:29:03.753809	1	\N	\N
476	278	he	תשלום חודשי	f	approved	2025-07-20 14:29:03.753809	2025-07-20 14:29:03.753809	1	\N	\N
477	278	ru	Ежемесячный платеж	f	approved	2025-07-20 14:29:03.753809	2025-07-20 14:29:03.753809	1	\N	\N
478	279	en	Select Bank	t	approved	2025-07-20 14:29:04.340973	2025-07-20 14:29:04.340973	1	\N	\N
479	279	he	בחר בנק	f	approved	2025-07-20 14:29:04.340973	2025-07-20 14:29:04.340973	1	\N	\N
480	279	ru	Выбрать банк	f	approved	2025-07-20 14:29:04.340973	2025-07-20 14:29:04.340973	1	\N	\N
481	280	en	Mortgage Refinancing	t	approved	2025-07-20 14:42:50.157505	2025-07-20 14:42:50.157505	1	\N	\N
482	280	he	מחזור משכנתא	f	approved	2025-07-20 14:42:50.157505	2025-07-20 14:42:50.157505	1	\N	\N
483	280	ru	Рефинансирование ипотеки	f	approved	2025-07-20 14:42:50.157505	2025-07-20 14:42:50.157505	1	\N	\N
484	281	en	Get improved mortgage terms	t	approved	2025-07-20 14:42:50.689228	2025-07-20 14:42:50.689228	1	\N	\N
485	281	he	קבל תנאי משכנתא משופרים	f	approved	2025-07-20 14:42:50.689228	2025-07-20 14:42:50.689228	1	\N	\N
486	281	ru	Получите улучшенные условия ипотеки	f	approved	2025-07-20 14:42:50.689228	2025-07-20 14:42:50.689228	1	\N	\N
487	282	en	Purpose of Mortgage Refinance	t	approved	2025-07-20 14:42:51.294359	2025-07-20 14:42:51.294359	1	\N	\N
488	282	he	מטרת מחזור המשכנתא	f	approved	2025-07-20 14:42:51.294359	2025-07-20 14:42:51.294359	1	\N	\N
489	282	ru	Цель рефинансирования ипотеки	f	approved	2025-07-20 14:42:51.294359	2025-07-20 14:42:51.294359	1	\N	\N
490	283	en	Remaining Mortgage Balance	t	approved	2025-07-20 14:42:51.960042	2025-07-20 14:42:51.960042	1	\N	\N
491	283	he	יתרת המשכנתא	f	approved	2025-07-20 14:42:51.960042	2025-07-20 14:42:51.960042	1	\N	\N
492	283	ru	Остаток по ипотеке	f	approved	2025-07-20 14:42:51.960042	2025-07-20 14:42:51.960042	1	\N	\N
493	284	en	Current Property Value	t	approved	2025-07-20 14:42:52.515702	2025-07-20 14:42:52.515702	1	\N	\N
494	284	he	שווי הנכס הנוכחי	f	approved	2025-07-20 14:42:52.515702	2025-07-20 14:42:52.515702	1	\N	\N
495	284	ru	Текущая стоимость недвижимости	f	approved	2025-07-20 14:42:52.515702	2025-07-20 14:42:52.515702	1	\N	\N
496	285	en	Property Type	t	approved	2025-07-20 14:42:53.130812	2025-07-20 14:42:53.130812	1	\N	\N
497	285	he	סוג הנכס	f	approved	2025-07-20 14:42:53.130812	2025-07-20 14:42:53.130812	1	\N	\N
498	285	ru	Тип недвижимости	f	approved	2025-07-20 14:42:53.130812	2025-07-20 14:42:53.130812	1	\N	\N
499	286	en	Current Mortgage Bank	t	approved	2025-07-20 14:42:53.671137	2025-07-20 14:42:53.671137	1	\N	\N
500	286	he	בנק המשכנתא הנוכחית	f	approved	2025-07-20 14:42:53.671137	2025-07-20 14:42:53.671137	1	\N	\N
501	286	ru	Текущий ипотечный банк	f	approved	2025-07-20 14:42:53.671137	2025-07-20 14:42:53.671137	1	\N	\N
502	287	en	Is the Mortgage Registered in Land Registry?	t	approved	2025-07-20 14:42:54.287534	2025-07-20 14:42:54.287534	1	\N	\N
503	287	he	האם המשכנתא רשומה בטאבו?	f	approved	2025-07-20 14:42:54.287534	2025-07-20 14:42:54.287534	1	\N	\N
504	287	ru	Зарегистрирована ли ипотека в земельном реестре?	f	approved	2025-07-20 14:42:54.287534	2025-07-20 14:42:54.287534	1	\N	\N
505	288	en	Mortgage Start Date	t	approved	2025-07-20 14:42:54.819886	2025-07-20 14:42:54.819886	1	\N	\N
506	288	he	תאריך תחילת המשכנתא	f	approved	2025-07-20 14:42:54.819886	2025-07-20 14:42:54.819886	1	\N	\N
507	288	ru	Дата начала ипотеки	f	approved	2025-07-20 14:42:54.819886	2025-07-20 14:42:54.819886	1	\N	\N
508	289	en	Enter Mortgage Details	t	approved	2025-07-20 14:42:55.34442	2025-07-20 14:42:55.34442	1	\N	\N
509	289	he	הזן פרטי המשכנתא	f	approved	2025-07-20 14:42:55.34442	2025-07-20 14:42:55.34442	1	\N	\N
510	289	ru	Введите данные ипотеки	f	approved	2025-07-20 14:42:55.34442	2025-07-20 14:42:55.34442	1	\N	\N
511	290	en	Desired Mortgage Period	t	approved	2025-07-20 14:42:55.943761	2025-07-20 14:42:55.943761	1	\N	\N
512	290	he	תקופת משכנתא רצויה	f	approved	2025-07-20 14:42:55.943761	2025-07-20 14:42:55.943761	1	\N	\N
513	290	ru	Желаемый период ипотеки	f	approved	2025-07-20 14:42:55.943761	2025-07-20 14:42:55.943761	1	\N	\N
514	291	en	Monthly Payment	t	approved	2025-07-20 14:42:56.525754	2025-07-20 14:42:56.525754	1	\N	\N
515	291	he	תשלום חודשי	f	approved	2025-07-20 14:42:56.525754	2025-07-20 14:42:56.525754	1	\N	\N
516	291	ru	Ежемесячный платеж	f	approved	2025-07-20 14:42:56.525754	2025-07-20 14:42:56.525754	1	\N	\N
517	292	en	Program	t	approved	2025-07-20 14:42:57.147649	2025-07-20 14:42:57.147649	1	\N	\N
518	292	he	תוכנית	f	approved	2025-07-20 14:42:57.147649	2025-07-20 14:42:57.147649	1	\N	\N
519	292	ru	Программа	f	approved	2025-07-20 14:42:57.147649	2025-07-20 14:42:57.147649	1	\N	\N
520	293	en	Balance	t	approved	2025-07-20 14:42:57.807967	2025-07-20 14:42:57.807967	1	\N	\N
521	293	he	יתרה	f	approved	2025-07-20 14:42:57.807967	2025-07-20 14:42:57.807967	1	\N	\N
522	293	ru	Остаток	f	approved	2025-07-20 14:42:57.807967	2025-07-20 14:42:57.807967	1	\N	\N
523	294	en	End Date	t	approved	2025-07-20 14:42:58.334077	2025-07-20 14:42:58.334077	1	\N	\N
524	294	he	תאריך סיום	f	approved	2025-07-20 14:42:58.334077	2025-07-20 14:42:58.334077	1	\N	\N
525	294	ru	Дата окончания	f	approved	2025-07-20 14:42:58.334077	2025-07-20 14:42:58.334077	1	\N	\N
526	295	en	Interest Rate	t	approved	2025-07-20 14:42:58.905817	2025-07-20 14:42:58.905817	1	\N	\N
527	295	he	אחוז ריבית	f	approved	2025-07-20 14:42:58.905817	2025-07-20 14:42:58.905817	1	\N	\N
528	295	ru	Процентная ставка	f	approved	2025-07-20 14:42:58.905817	2025-07-20 14:42:58.905817	1	\N	\N
529	296	en	Add Program	t	approved	2025-07-20 14:42:59.426911	2025-07-20 14:42:59.426911	1	\N	\N
530	296	he	הוסף תוכנית	f	approved	2025-07-20 14:42:59.426911	2025-07-20 14:42:59.426911	1	\N	\N
531	296	ru	Добавить программу	f	approved	2025-07-20 14:42:59.426911	2025-07-20 14:42:59.426911	1	\N	\N
532	297	en	Lower Interest Rate	t	approved	2025-07-20 14:43:17.447038	2025-07-20 14:43:17.447038	1	\N	\N
533	297	he	הפחתת ריבית	f	approved	2025-07-20 14:43:17.447038	2025-07-20 14:43:17.447038	1	\N	\N
534	297	ru	Снижение процентной ставки	f	approved	2025-07-20 14:43:17.447038	2025-07-20 14:43:17.447038	1	\N	\N
535	298	en	Reduce Monthly Payment	t	approved	2025-07-20 14:43:17.964229	2025-07-20 14:43:17.964229	1	\N	\N
536	298	he	הפחתת תשלום חודשי	f	approved	2025-07-20 14:43:17.964229	2025-07-20 14:43:17.964229	1	\N	\N
537	298	ru	Снижение ежемесячного платежа	f	approved	2025-07-20 14:43:17.964229	2025-07-20 14:43:17.964229	1	\N	\N
538	299	en	Shorten Mortgage Term	t	approved	2025-07-20 14:43:18.477863	2025-07-20 14:43:18.477863	1	\N	\N
539	299	he	קיצור תקופת המשכנתא	f	approved	2025-07-20 14:43:18.477863	2025-07-20 14:43:18.477863	1	\N	\N
540	299	ru	Сокращение срока ипотеки	f	approved	2025-07-20 14:43:18.477863	2025-07-20 14:43:18.477863	1	\N	\N
541	300	en	Cash Out Refinance	t	approved	2025-07-20 14:43:18.980158	2025-07-20 14:43:18.980158	1	\N	\N
542	300	he	מחזור למזומן	f	approved	2025-07-20 14:43:18.980158	2025-07-20 14:43:18.980158	1	\N	\N
543	300	ru	Рефинансирование с доп. средствами	f	approved	2025-07-20 14:43:18.980158	2025-07-20 14:43:18.980158	1	\N	\N
544	301	en	Consolidate Debts	t	approved	2025-07-20 14:43:19.480588	2025-07-20 14:43:19.480588	1	\N	\N
545	301	he	איחוד חובות	f	approved	2025-07-20 14:43:19.480588	2025-07-20 14:43:19.480588	1	\N	\N
546	301	ru	Консолидация долгов	f	approved	2025-07-20 14:43:19.480588	2025-07-20 14:43:19.480588	1	\N	\N
547	302	en	Yes, Registered in Land Registry	t	approved	2025-07-20 14:43:20.007163	2025-07-20 14:43:20.007163	1	\N	\N
548	302	he	כן, רשומה בטאבו	f	approved	2025-07-20 14:43:20.007163	2025-07-20 14:43:20.007163	1	\N	\N
549	302	ru	Да, зарегистрирована в земельном реестре	f	approved	2025-07-20 14:43:20.007163	2025-07-20 14:43:20.007163	1	\N	\N
550	303	en	No, Not Registered	t	approved	2025-07-20 14:43:20.504606	2025-07-20 14:43:20.504606	1	\N	\N
551	303	he	לא, לא רשומה	f	approved	2025-07-20 14:43:20.504606	2025-07-20 14:43:20.504606	1	\N	\N
552	303	ru	Нет, не зарегистрирована	f	approved	2025-07-20 14:43:20.504606	2025-07-20 14:43:20.504606	1	\N	\N
553	304	en	Fixed Interest	t	approved	2025-07-20 14:43:21.000246	2025-07-20 14:43:21.000246	1	\N	\N
554	304	he	ריבית קבועה	f	approved	2025-07-20 14:43:21.000246	2025-07-20 14:43:21.000246	1	\N	\N
555	304	ru	Фиксированная ставка	f	approved	2025-07-20 14:43:21.000246	2025-07-20 14:43:21.000246	1	\N	\N
556	305	en	Variable Interest	t	approved	2025-07-20 14:43:21.494287	2025-07-20 14:43:21.494287	1	\N	\N
557	305	he	ריבית משתנה	f	approved	2025-07-20 14:43:21.494287	2025-07-20 14:43:21.494287	1	\N	\N
558	305	ru	Переменная ставка	f	approved	2025-07-20 14:43:21.494287	2025-07-20 14:43:21.494287	1	\N	\N
559	306	en	Prime Interest	t	approved	2025-07-20 14:43:22.002501	2025-07-20 14:43:22.002501	1	\N	\N
560	306	he	ריבית פריים	f	approved	2025-07-20 14:43:22.002501	2025-07-20 14:43:22.002501	1	\N	\N
561	306	ru	Ставка Прайм	f	approved	2025-07-20 14:43:22.002501	2025-07-20 14:43:22.002501	1	\N	\N
562	307	en	Mixed Interest	t	approved	2025-07-20 14:43:22.499966	2025-07-20 14:43:22.499966	1	\N	\N
563	307	he	ריבית מעורבת	f	approved	2025-07-20 14:43:22.499966	2025-07-20 14:43:22.499966	1	\N	\N
564	307	ru	Смешанная ставка	f	approved	2025-07-20 14:43:22.499966	2025-07-20 14:43:22.499966	1	\N	\N
565	308	en	Other	t	approved	2025-07-20 14:43:22.994012	2025-07-20 14:43:22.994012	1	\N	\N
566	308	he	אחר	f	approved	2025-07-20 14:43:22.994012	2025-07-20 14:43:22.994012	1	\N	\N
567	308	ru	Другое	f	approved	2025-07-20 14:43:22.994012	2025-07-20 14:43:22.994012	1	\N	\N
4596	1663	ru	20 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
571	310	en	Bank Hapoalim	t	approved	2025-07-20 14:43:24.008347	2025-07-20 14:43:24.008347	1	\N	\N
572	310	he	בנק הפועלים	f	approved	2025-07-20 14:43:24.008347	2025-07-20 14:43:24.008347	1	\N	\N
573	310	ru	Банк Апоалим	f	approved	2025-07-20 14:43:24.008347	2025-07-20 14:43:24.008347	1	\N	\N
574	311	en	Bank Leumi	t	approved	2025-07-20 14:43:24.502847	2025-07-20 14:43:24.502847	1	\N	\N
575	311	he	בנק לאומי	f	approved	2025-07-20 14:43:24.502847	2025-07-20 14:43:24.502847	1	\N	\N
576	311	ru	Банк Леуми	f	approved	2025-07-20 14:43:24.502847	2025-07-20 14:43:24.502847	1	\N	\N
577	312	en	Discount Bank	t	approved	2025-07-20 14:43:24.999394	2025-07-20 14:43:24.999394	1	\N	\N
578	312	he	בנק דיסקונט	f	approved	2025-07-20 14:43:24.999394	2025-07-20 14:43:24.999394	1	\N	\N
579	312	ru	Банк Дисконт	f	approved	2025-07-20 14:43:24.999394	2025-07-20 14:43:24.999394	1	\N	\N
580	313	en	Massad Bank	t	approved	2025-07-20 14:43:25.489433	2025-07-20 14:43:25.489433	1	\N	\N
581	313	he	בנק מסד	f	approved	2025-07-20 14:43:25.489433	2025-07-20 14:43:25.489433	1	\N	\N
582	313	ru	Банк Масад	f	approved	2025-07-20 14:43:25.489433	2025-07-20 14:43:25.489433	1	\N	\N
583	314	en	Enter your mobile phone number to receive bank offers	t	approved	2025-07-20 16:20:45.346836	2025-07-20 16:20:45.346836	1	\N	\N
584	314	he	הזן את מספר הטלפון הנייד שלך כדי לקבל הצעות מבנקים	f	approved	2025-07-20 16:20:45.346836	2025-07-20 16:20:45.346836	1	\N	\N
585	314	ru	Введите номер мобильного телефона для получения предложений от банков	f	approved	2025-07-20 16:20:45.346836	2025-07-20 16:20:45.346836	1	\N	\N
586	315	en	You can use your phone number to receive customized offers	t	approved	2025-07-20 16:21:02.603142	2025-07-20 16:21:02.603142	1	\N	\N
587	315	he	אתה יכול להשתמש במספר הטלפון שלך כדי לקבל הצעות מותאמות אישית	f	approved	2025-07-20 16:21:02.603142	2025-07-20 16:21:02.603142	1	\N	\N
588	315	ru	Вы можете использовать свой номер телефона для получения персонализированных предложений	f	approved	2025-07-20 16:21:02.603142	2025-07-20 16:21:02.603142	1	\N	\N
589	316	en	Full Name	t	approved	2025-07-20 16:21:03.257941	2025-07-20 16:21:03.257941	1	\N	\N
590	316	he	שם מלא	f	approved	2025-07-20 16:21:03.257941	2025-07-20 16:21:03.257941	1	\N	\N
591	316	ru	Полное имя	f	approved	2025-07-20 16:21:03.257941	2025-07-20 16:21:03.257941	1	\N	\N
592	317	en	Phone Number	t	approved	2025-07-20 16:21:03.826926	2025-07-20 16:21:03.826926	1	\N	\N
593	317	he	מספר טלפון	f	approved	2025-07-20 16:21:03.826926	2025-07-20 16:21:03.826926	1	\N	\N
594	317	ru	Номер телефона	f	approved	2025-07-20 16:21:03.826926	2025-07-20 16:21:03.826926	1	\N	\N
595	318	en	Continue	t	approved	2025-07-20 16:21:04.364753	2025-07-20 16:21:04.364753	1	\N	\N
596	318	he	המשך	f	approved	2025-07-20 16:21:04.364753	2025-07-20 16:21:04.364753	1	\N	\N
597	318	ru	Продолжить	f	approved	2025-07-20 16:21:04.364753	2025-07-20 16:21:04.364753	1	\N	\N
598	319	en	By clicking "Continue" I accept the	t	approved	2025-07-20 16:21:05.009095	2025-07-20 16:21:05.009095	1	\N	\N
599	319	he	בלחיצה על "המשך" אני מקבל את	f	approved	2025-07-20 16:21:05.009095	2025-07-20 16:21:05.009095	1	\N	\N
600	319	ru	Нажимая "Продолжить", я принимаю	f	approved	2025-07-20 16:21:05.009095	2025-07-20 16:21:05.009095	1	\N	\N
601	320	en	User Agreement	t	approved	2025-07-20 16:21:38.24109	2025-07-20 16:21:38.24109	1	\N	\N
602	320	he	הסכם המשתמש	f	approved	2025-07-20 16:21:38.24109	2025-07-20 16:21:38.24109	1	\N	\N
603	320	ru	Пользовательское соглашение	f	approved	2025-07-20 16:21:38.24109	2025-07-20 16:21:38.24109	1	\N	\N
604	321	en	and	t	approved	2025-07-20 16:21:38.952675	2025-07-20 16:21:38.952675	1	\N	\N
605	321	he	ו	f	approved	2025-07-20 16:21:38.952675	2025-07-20 16:21:38.952675	1	\N	\N
606	321	ru	и	f	approved	2025-07-20 16:21:38.952675	2025-07-20 16:21:38.952675	1	\N	\N
607	322	en	Privacy Policy	t	approved	2025-07-20 16:21:39.476455	2025-07-20 16:21:39.476455	1	\N	\N
608	322	he	מדיניות פרטיות	f	approved	2025-07-20 16:21:39.476455	2025-07-20 16:21:39.476455	1	\N	\N
609	322	ru	Политика конфиденциальности	f	approved	2025-07-20 16:21:39.476455	2025-07-20 16:21:39.476455	1	\N	\N
610	323	en	Already a customer?	t	approved	2025-07-20 16:21:39.936255	2025-07-20 16:21:39.936255	1	\N	\N
611	323	he	כבר לקוח?	f	approved	2025-07-20 16:21:39.936255	2025-07-20 16:21:39.936255	1	\N	\N
612	323	ru	Уже клиент?	f	approved	2025-07-20 16:21:39.936255	2025-07-20 16:21:39.936255	1	\N	\N
613	324	en	Login here	t	approved	2025-07-20 16:21:40.417809	2025-07-20 16:21:40.417809	1	\N	\N
614	324	he	בוא כאן	f	approved	2025-07-20 16:21:40.417809	2025-07-20 16:21:40.417809	1	\N	\N
615	324	ru	Войти здесь	f	approved	2025-07-20 16:21:40.417809	2025-07-20 16:21:40.417809	1	\N	\N
616	325	en	Close	t	approved	2025-07-20 16:21:40.893189	2025-07-20 16:21:40.893189	1	\N	\N
617	325	he	סגור	f	approved	2025-07-20 16:21:40.893189	2025-07-20 16:21:40.893189	1	\N	\N
618	325	ru	Закрыть	f	approved	2025-07-20 16:21:40.893189	2025-07-20 16:21:40.893189	1	\N	\N
619	326	en	What password did you receive?	t	approved	2025-07-20 16:56:16.224355	2025-07-20 16:56:16.224355	1	\N	\N
620	326	he	מה הסיסמה שקיבלתם?	f	approved	2025-07-20 16:56:16.224355	2025-07-20 16:56:16.224355	1	\N	\N
621	326	ru	Какой пароль вы получили?	f	approved	2025-07-20 16:56:16.224355	2025-07-20 16:56:16.224355	1	\N	\N
622	327	en	SMS verification	t	approved	2025-07-20 16:56:17.034028	2025-07-20 16:56:17.034028	1	\N	\N
623	327	he	אימות בהודעת SMS	f	approved	2025-07-20 16:56:17.034028	2025-07-20 16:56:17.034028	1	\N	\N
624	327	ru	Верификация SMS	f	approved	2025-07-20 16:56:17.034028	2025-07-20 16:56:17.034028	1	\N	\N
569	309	he	אחר	f	approved	2025-07-20 14:43:23.506324	2025-07-29 10:58:43.224578	1	\N	\N
570	309	ru	Другое	f	approved	2025-07-20 14:43:23.506324	2025-07-29 10:58:43.380827	1	\N	\N
625	328	en	Didnt receive SMS?	t	approved	2025-07-20 16:56:17.505972	2025-07-20 16:56:17.505972	1	\N	\N
626	328	he	לא קיבלת הודעת SMS?	f	approved	2025-07-20 16:56:17.505972	2025-07-20 16:56:17.505972	1	\N	\N
627	328	ru	Не получили SMS?	f	approved	2025-07-20 16:56:17.505972	2025-07-20 16:56:17.505972	1	\N	\N
628	329	en	Send verification code again	t	approved	2025-07-20 16:56:18.030959	2025-07-20 16:56:18.030959	1	\N	\N
629	329	he	שלח קוד אימות שוב	f	approved	2025-07-20 16:56:18.030959	2025-07-20 16:56:18.030959	1	\N	\N
630	329	ru	Отправить код подтверждения снова	f	approved	2025-07-20 16:56:18.030959	2025-07-20 16:56:18.030959	1	\N	\N
631	330	en	Verify phone	t	approved	2025-07-20 16:56:18.530075	2025-07-20 16:56:18.530075	1	\N	\N
632	330	he	אמת טלפון	f	approved	2025-07-20 16:56:18.530075	2025-07-20 16:56:18.530075	1	\N	\N
633	330	ru	Подтвердить телефон	f	approved	2025-07-20 16:56:18.530075	2025-07-20 16:56:18.530075	1	\N	\N
634	331	en	Personal Information	t	approved	2025-07-20 17:25:57.785875	2025-07-20 17:25:57.785875	1	\N	\N
635	331	he	פרטים אישיים	f	approved	2025-07-20 17:25:57.785875	2025-07-20 17:25:57.785875	1	\N	\N
636	331	ru	Личная информация	f	approved	2025-07-20 17:25:57.785875	2025-07-20 17:25:57.785875	1	\N	\N
637	332	en	Income Details	t	approved	2025-07-20 17:40:50.825863	2025-07-20 17:40:50.825863	1	\N	\N
638	332	he	פרטי הכנסה	f	approved	2025-07-20 17:40:50.825863	2025-07-20 17:40:50.825863	1	\N	\N
639	332	ru	Детали дохода	f	approved	2025-07-20 17:40:50.825863	2025-07-20 17:40:50.825863	1	\N	\N
640	333	en	Application Summary	t	approved	2025-07-20 18:26:58.124607	2025-07-20 18:26:58.124607	1	\N	\N
641	333	he	סיכום הבקשה	f	approved	2025-07-20 18:26:58.124607	2025-07-20 18:26:58.124607	1	\N	\N
642	333	ru	Сводка заявки	f	approved	2025-07-20 18:26:58.124607	2025-07-20 18:26:58.124607	1	\N	\N
643	334	en	These are preliminary results. Final offers depend on bank approval and additional documentation.	t	approved	2025-07-20 18:27:36.147894	2025-07-20 18:27:36.147894	1	\N	\N
644	334	he	אלו תוצאות ראשוניות. הצעות סופיות תלויות באישור הבנק ובתיעוד נוסף.	f	approved	2025-07-20 18:27:36.147894	2025-07-20 18:27:36.147894	1	\N	\N
645	334	ru	Это предварительные результаты. Окончательные предложения зависят от одобрения банка и дополнительной документации.	f	approved	2025-07-20 18:27:36.147894	2025-07-20 18:27:36.147894	1	\N	\N
646	335	en	Prime rate linked mortgage with competitive terms	t	approved	2025-07-20 18:27:57.610739	2025-07-20 18:27:57.610739	1	\N	\N
647	335	he	משכנתא צמודה לפריים בתנאים תחרותיים	f	approved	2025-07-20 18:27:57.610739	2025-07-20 18:27:57.610739	1	\N	\N
648	335	ru	Ипотека по прайм-ставке с конкурентными условиями	f	approved	2025-07-20 18:27:57.610739	2025-07-20 18:27:57.610739	1	\N	\N
4597	1664	ru	25 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4598	1665	ru	30 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4599	1650	en	Loan Purpose	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4600	1667	en	Investment	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4601	1668	en	Personal use	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4602	1669	en	Business	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4603	1670	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4604	1650	he	מטרת ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4605	1667	he	השקעה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4606	1668	he	שימוש אישי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4607	1669	he	עסק	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4608	1670	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4609	1650	ru	Цель кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4610	1667	ru	Инвестиции	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4611	1668	ru	Личное использование	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4612	1669	ru	Бизнес	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4613	1670	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4614	1671	en	City	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4615	1671	he	עיר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4616	1671	ru	Город	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4617	1672	en	When do you need the loan?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4618	1673	en	Within 3 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4619	1674	en	3-6 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4620	1675	en	6-12 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4621	1676	en	Over 12 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4622	1672	he	מתי אתה צריך את ההלוואה?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4623	1673	he	תוך 3 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4624	1674	he	3-6 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4625	1675	he	6-12 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4626	1676	he	מעל 12 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4627	1672	ru	Когда вам нужен кредит?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4628	1673	ru	В течение 3 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4629	1674	ru	3-6 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4630	1675	ru	6-12 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4631	1676	ru	Более 12 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4632	1677	en	Education	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4633	1678	en	No high school diploma	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4634	1679	en	Partial high school	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4635	1680	en	High school diploma	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
3679	726	ru	Увеличить срок, чтобы уменьшить платеж	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
4636	1681	en	Post-secondary education	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4637	1682	en	Bachelor's degree	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4638	1683	en	Master's degree	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4639	1684	en	Doctorate	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4640	1677	he	השכלה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4641	1678	he	ללא תעודת בגרות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4642	1679	he	בגרות חלקית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4643	1680	he	תעודת בגרות מלאה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4644	1681	he	השכלה על-תיכונית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4645	1682	he	תואר ראשון	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4646	1683	he	תואר שני	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4647	1684	he	דוקטורט	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4648	1677	ru	Образование	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4649	1685	en	Family Status	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4650	1686	en	Single	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4651	1687	en	Married	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4652	1688	en	Divorced	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4653	1689	en	Widowed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4654	1690	en	Common-law partner	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4655	1691	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4656	1685	he	מצב משפחתי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4657	1686	he	רווק/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4658	1687	he	נשוי/אה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4659	1688	he	גרוש/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4660	1689	he	אלמן/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4661	1690	he	ידוע/ה בציבור	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4662	1691	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4663	1685	ru	Семейное положение	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4664	1692	en	Citizenship	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4665	1693	en	Israeli citizen	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4666	1694	en	United States	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4667	1695	en	Canada	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4668	1696	en	United Kingdom	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4669	1697	en	France	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4670	1698	en	Germany	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4671	1699	en	Russia	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4672	1700	en	Ukraine	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4673	1701	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4674	1692	he	אזרחות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5395	1995	he	שדה חובה	f	approved	2025-08-06 23:40:35.150563	2025-08-06 23:40:35.150563	\N	\N	\N
732	394	en	Join our Partner Program	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
733	394	he	הצטרפו לתוכנית השותפים שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
734	394	ru	Присоединяйтесь к нашей партнерской программе	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
735	395	en	Earn commissions by referring clients to our mortgage and credit services	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
736	395	he	הרוויחו עמלות על הפניית לקוחות לשירותי המשכנתא והאשראי שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
737	395	ru	Зарабатывайте комиссионные, направляя клиентов к нашим ипотечным и кредитным услугам	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
738	396	en	Register as Partner	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
739	396	he	הירשמו כשותפים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
740	396	ru	Зарегистрироваться как партнер	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
741	397	en	Bankimonline Marketplace	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
742	397	he	מרקטפלייס בנקימאונליין	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
743	397	ru	Маркетплейс Bankimonline	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
744	398	en	Digital platform for financial services with advanced tools and calculators	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
745	398	he	פלטפורמה דיגיטלית לשירותים פיננסיים עם כלים ומחשבונים מתקדמים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
746	398	ru	Цифровая платформа для финансовых услуг с продвинутыми инструментами и калькуляторами	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
747	399	en	Mortgage Calculator	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
748	399	he	מחשבון משכנתא	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
749	399	ru	Ипотечный калькулятор	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
750	400	en	Mortgage Refinancing	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
751	400	he	מיחזור משכנתא	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
752	400	ru	Рефинансирование ипотеки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
3718	1148	ru	Список существующих кредитов	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3720	1150	ru	Рефинансирование кредита	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
759	403	en	One-Click Mortgage	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
760	403	he	משכנתא בקליק אחד	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
4091	1461	he	דירה	t	approved	2025-07-29 10:50:43.660619	2025-07-29 10:58:40.864532	\N	\N	\N
4174	1514	en	Add partner	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4175	1514	he	הוסף שותף	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4176	1514	ru	Добавить партнера	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4177	1516	en	Enter first name and last name	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4178	1516	he	הזן שם פרטי ושם משפחה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4179	1516	ru	Введите имя и фамилию	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4180	1494	en	Select education level	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4181	1494	he	בחר רמת השכלה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4182	1494	ru	Выберите уровень образования	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
761	403	ru	Ипотека в один клик	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
762	404	en	Bring a client and get 500 ₪ reward	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
763	404	he	הביאו לקוח וקבלו פרס של 500 ₪	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
764	404	ru	Приведите клиента и получите вознаграждение 500 ₪	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
765	405	en	Earn a commission for every client who purchases our services	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
766	405	he	הרוויחו עמלה על כל לקוח שרוכש את השירותים שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
767	405	ru	Зарабатывайте комиссию за каждого клиента, который приобретает наши услуги	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
2329	924	en	Calculate Mortgage	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
771	407	en	Become a Licensed Mortgage Broker	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
772	407	he	הפכו ליועץ משכנתאות מורשה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
773	407	ru	Станьте лицензированным ипотечным брокером	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
774	408	en	Professional training and certification	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
775	408	he	הכשרה מקצועית והסמכה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
776	408	ru	Профессиональная подготовка и сертификация	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
777	409	en	Access to exclusive mortgage programs	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
778	409	he	גישה לתוכניות משכנתא בלעדיות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
779	409	ru	Доступ к эксклюзивным ипотечным программам	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
780	410	en	Comprehensive support system	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
781	410	he	מערכת תמיכה מקיפה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
782	410	ru	Комплексная система поддержки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
783	411	en	Start Your Journey	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
784	411	he	התחילו את המסע שלכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
785	411	ru	Начните свой путь	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
786	412	en	What Does Your License Include?	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
787	412	he	מה כולל הרישיון שלכם?	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
788	412	ru	Что включает ваша лицензия?	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
789	413	en	Professional Infrastructure	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
790	413	he	תשתית מקצועית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
791	413	ru	Профессиональная инфраструктура	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
792	414	en	Advanced CRM system for client management	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
793	414	he	מערכת CRM מתקדמת לניהול לקוחות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
794	414	ru	Продвинутая CRM-система для управления клиентами	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
795	415	en	Professional tools and calculators	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
796	415	he	כלים ומחשבונים מקצועיים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
797	415	ru	Профессиональные инструменты и калькуляторы	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
798	416	en	Office and equipment support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
799	416	he	תמיכה במשרד וציוד	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
800	416	ru	Поддержка офиса и оборудования	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
801	417	en	Marketing Support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
802	417	he	תמיכה שיווקית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
803	417	ru	Маркетинговая поддержка	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
804	418	en	Lead generation system	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
805	418	he	מערכת לייצור לידים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
806	418	ru	Система генерации лидов	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
807	419	en	Digital marketing campaigns	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
808	419	he	קמפיינים שיווקיים דיגיטליים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
809	419	ru	Цифровые маркетинговые кампании	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
810	420	en	Brand and reputation building	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
811	420	he	בניית מותג ומוניטין	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
812	420	ru	Построение бренда и репутации	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
813	421	en	Training & Support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
814	421	he	הכשרה ותמיכה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
815	421	ru	Обучение и поддержка	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
816	422	en	Comprehensive training program	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
817	422	he	תוכנית הכשרה מקיפה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
818	422	ru	Комплексная программа обучения	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
819	423	en	Ongoing professional development	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
820	423	he	פיתוח מקצועי מתמשך	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
821	423	ru	Постоянное профессиональное развитие	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
822	424	en	24/7 technical support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
770	406	ru	Готовы стать партнером?	f	approved	2025-07-21 12:29:44.878698	2025-07-22 12:09:43.345177	\N	\N	\N
768	406	en	Ready to become a partner?	f	approved	2025-07-21 12:29:44.878698	2025-07-22 12:09:43.809519	\N	\N	\N
6405	2401	ru	Главная	t	approved	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
823	424	he	תמיכה טכנית 24/7	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
824	424	ru	Техническая поддержка 24/7	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
825	425	en	Your Path to Success	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
826	425	he	הדרך שלכם להצלחה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
827	425	ru	Ваш путь к успеху	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
828	426	en	Apply Online	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
829	426	he	הגישו בקשה מקוונת	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
830	426	ru	Подайте заявку онлайн	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
831	427	en	Fill out our simple application form	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
832	427	he	מלאו את טופס הבקשה הפשוט שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
833	427	ru	Заполните нашу простую форму заявки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
834	428	en	Initial Interview	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
835	428	he	ראיון ראשוני	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
836	428	ru	Первичное собеседование	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
837	429	en	Meet with our team to discuss your goals	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
838	429	he	פגשו את הצוות שלנו כדי לדון ביעדים שלכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
839	429	ru	Встретьтесь с нашей командой для обсуждения ваших целей	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
840	430	en	Training Program	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
841	430	he	תוכנית הכשרה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
842	430	ru	Программа обучения	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
843	431	en	Complete our comprehensive training course	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
844	431	he	השלימו את קורס ההכשרה המקיף שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
845	431	ru	Пройдите наш комплексный учебный курс	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
846	432	en	License & Setup	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
847	432	he	רישיון והקמה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
848	432	ru	Лицензия и настройка	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
849	433	en	Receive your license and set up your office	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
850	433	he	קבלו את הרישיון שלכם והקימו את המשרד	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
851	433	ru	Получите лицензию и настройте офис	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
852	434	en	Start Earning	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
853	434	he	התחילו להרוויח	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
854	434	ru	Начните зарабатывать	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
855	435	en	Begin working with clients and earning commissions	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
856	435	he	התחילו לעבוד עם לקוחות ולהרוויח עמלות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
857	435	ru	Начните работать с клиентами и зарабатывать комиссионные	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
858	436	en	Investment & Returns	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
859	436	he	השקעה ותשואות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
860	436	ru	Инвестиции и доходность	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
861	437	en	Expected Annual Income	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
862	437	he	הכנסה שנתית צפויה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
863	437	ru	Ожидаемый годовой доход	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
864	438	en	₪150,000 - ₪500,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
865	438	he	₪150,000 - ₪500,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
866	438	ru	₪150,000 - ₪500,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
867	439	en	Initial Investment	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
868	439	he	השקעה ראשונית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
869	439	ru	Первоначальные инвестиции	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
870	440	en	From ₪50,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
871	440	he	החל מ-₪50,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
872	440	ru	От ₪50,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
873	441	en	Payback Period	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
874	441	he	תקופת החזר	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
875	441	ru	Срок окупаемости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
876	442	en	6-12 months	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
877	442	he	6-12 חודשים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
878	442	ru	6-12 месяцев	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
879	443	en	Results depend on individual performance and market conditions	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
880	443	he	התוצאות תלויות בביצועים אישיים ובתנאי השוק	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
881	443	ru	Результаты зависят от индивидуальной производительности и рыночных условий	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
882	444	en	Get Investment Details	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
883	444	he	קבלו פרטי השקעה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
884	444	ru	Получить детали инвестиций	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
885	445	en	Open a Real Estate Franchise Office	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
886	445	he	פתחו משרד זכיינות נדל"ן	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
887	445	ru	Откройте франчайзинговый офис недвижимости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
888	446	en	Monthly income from ₪30,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
889	446	he	הכנסה חודשית מ-₪30,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
890	446	ru	Ежемесячный доход от ₪30,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
891	447	en	Annual turnover ₪2-5 million	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
892	447	he	מחזור שנתי ₪2-5 מיליון	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
893	447	ru	Годовой оборот ₪2-5 млн	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
894	448	en	ROI within 12-18 months	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
895	448	he	החזר השקעה תוך 12-18 חודשים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
896	448	ru	Окупаемость за 12-18 месяцев	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
897	449	en	Start Your Franchise	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
898	449	he	התחילו את הזכיינות שלכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
899	449	ru	Начните свою франшизу	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
900	450	en	Join TechRealt Real Estate Network	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
901	450	he	הצטרפו לרשת הנדל"ן טקריאלט	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
902	450	ru	Присоединяйтесь к сети недвижимости TechRealt	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
903	451	en	Leading real estate franchise with proven success model	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
904	451	he	זכיינות נדל"ן מובילה עם מודל הצלחה מוכח	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
905	451	ru	Ведущая франшиза недвижимости с проверенной моделью успеха	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
906	452	en	Learn More	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
907	452	he	למידע נוסף	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
908	452	ru	Узнать больше	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
909	453	en	Multiple Revenue Streams	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
910	453	he	מקורות הכנסה מרובים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
911	453	ru	Множественные источники дохода	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
912	454	en	Access to Bankimonline platform with thousands of monthly users	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
913	454	he	גישה לפלטפורמת בנקימאונליין עם אלפי משתמשים חודשיים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
914	454	ru	Доступ к платформе Bankimonline с тысячами ежемесячных пользователей	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
915	455	en	Mortgage Calculator	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
916	455	he	מחשבון משכנתא	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
917	455	ru	Ипотечный калькулятор	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
918	456	en	Mortgage Refinancing	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
919	456	he	מיחזור משכנתא	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
920	456	ru	Рефинансирование ипотеки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
5398	1996	he	עובד שכיר	f	approved	2025-08-07 04:02:56.855047	2025-08-07 04:02:56.855047	\N	\N	\N
3730	1217	ru	Новая сумма кредита	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
4303	1552	en	Current Bank	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4304	1553	en	Bank Hapoalim	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
927	459	en	Complete Real Estate Services	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
928	459	he	שירותי נדל"ן מקיפים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
929	459	ru	Полный спектр услуг недвижимости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
930	460	en	Offer comprehensive real estate solutions to your clients	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
931	460	he	הציעו פתרונות נדל"ן מקיפים ללקוחות שלכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
932	460	ru	Предлагайте комплексные решения недвижимости вашим клиентам	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
933	461	en	Property Purchase	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
934	461	he	רכישת נכס	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
935	461	ru	Покупка недвижимости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
936	462	en	Property Rental	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
937	462	he	השכרת נכס	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
938	462	ru	Аренда недвижимости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
939	463	en	Property Sale	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
940	463	he	מכירת נכס	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
941	463	ru	Продажа недвижимости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
942	464	en	Property Management	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
943	464	he	ניהול נכסים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
944	464	ru	Управление недвижимостью	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
945	465	en	Join Our Network	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
946	465	he	הצטרפו לרשת שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
947	465	ru	Присоединяйтесь к нашей сети	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
948	466	en	What Your Franchise Includes	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
949	466	he	מה כולל הזיכיון שלכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
950	466	ru	Что включает ваша франшиза	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
951	467	en	Turnkey Business Solution	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
952	467	he	פתרון עסקי מוכן	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
4305	1554	en	Bank Leumi	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4306	1555	en	Discount Bank	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4307	1556	en	Massad Bank	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
953	467	ru	Готовое бизнес-решение	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
954	468	en	Fully equipped office setup	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
955	468	he	הקמת משרד מאובזר במלואו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
956	468	ru	Полностью оборудованный офис	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
957	469	en	Recruitment and training support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
958	469	he	תמיכה בגיוס והכשרה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
959	469	ru	Поддержка в найме и обучении	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
960	470	en	Established brand recognition	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
961	470	he	זיהוי מותג מבוסס	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
962	470	ru	Узнаваемость бренда	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
963	471	en	Marketing and advertising support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
964	471	he	תמיכה בשיווק ופרסום	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
965	471	ru	Маркетинговая и рекламная поддержка	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
966	472	en	Digital Technology Platform	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
967	472	he	פלטפורמה טכנולוגית דיגיטלית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
968	472	ru	Цифровая технологическая платформа	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
969	473	en	Advanced CRM system	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
970	473	he	מערכת CRM מתקדמת	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
971	473	ru	Продвинутая CRM-система	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
972	474	en	Professional real estate tools	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
973	474	he	כלי נדל"ן מקצועיים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
974	474	ru	Профессиональные инструменты недвижимости	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
975	475	en	Technical support and updates	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
976	475	he	תמיכה טכנית ועדכונים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
977	475	ru	Техническая поддержка и обновления	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
978	476	en	Comprehensive Training & Support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
979	476	he	הכשרה ותמיכה מקיפה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
980	476	ru	Комплексное обучение и поддержка	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
981	477	en	Initial and ongoing training programs	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
982	477	he	תוכניות הכשרה ראשוניות ומתמשכות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
983	477	ru	Начальные и постоянные программы обучения	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
984	478	en	24/7 phone support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
985	478	he	תמיכה טלפונית 24/7	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
986	478	ru	Телефонная поддержка 24/7	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
987	479	en	Business development consultation	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
988	479	he	ייעוץ לפיתוח עסקי	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
989	479	ru	Консультации по развитию бизнеса	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
990	480	en	Get Franchise Details	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
991	480	he	קבלו פרטי זיכיון	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
992	480	ru	Получить детали франшизы	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
993	481	en	How to Open Your Franchise	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
994	481	he	איך לפתוח את הזיכיון שלכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
995	481	ru	Как открыть вашу франшизу	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
996	482	en	Submit Application	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
997	482	he	הגישו בקשה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
998	482	ru	Подать заявку	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
999	483	en	Complete our online franchise application form	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1000	483	he	השלימו את טופס הבקשה המקוון לזיכיון	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1001	483	ru	Заполните нашу онлайн-форму заявки на франшизу	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1002	484	en	Evaluation Meeting	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1003	484	he	פגישת הערכה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1004	484	ru	Оценочная встреча	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1005	485	en	Meet with our franchise team for mutual evaluation	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1006	485	he	פגשו את צוות הזיכיון שלנו להערכה הדדית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1007	485	ru	Встреча с нашей командой франчайзинга для взаимной оценки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1008	486	en	Sign Agreement	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1009	486	he	חתימה על הסכם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1010	486	ru	Подписание договора	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1011	487	en	Review and sign the franchise agreement	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1012	487	he	עיון וחתימה על הסכם הזיכיון	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1013	487	ru	Изучение и подписание франчайзингового договора	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1014	488	en	Setup & Training	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1015	488	he	הקמה והכשרה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1016	488	ru	Настройка и обучение	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1017	489	en	Set up your office and complete training program	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1018	489	he	הקימו את המשרד והשלימו תוכנית הכשרה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1019	489	ru	Настройте офис и пройдите программу обучения	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1020	490	en	Grand Opening	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1021	490	he	פתיחה חגיגית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1022	490	ru	Торжественное открытие	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1023	491	en	Launch your franchise with full support	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1024	491	he	השיקו את הזיכיון שלכם עם תמיכה מלאה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1025	491	ru	Запустите вашу франшизу с полной поддержкой	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1026	492	en	Investment & Returns	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1027	492	he	השקעה ותשואות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1028	492	ru	Инвестиции и доходность	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1029	493	en	Initial Investment	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1030	493	he	השקעה ראשונית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1031	493	ru	Первоначальные инвестиции	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1032	494	en	₪150,000 - ₪300,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1033	494	he	₪150,000 - ₪300,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1034	494	ru	₪150,000 - ₪300,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1035	495	en	Expected Monthly Income	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1036	495	he	הכנסה חודשית צפויה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1037	495	ru	Ожидаемый месячный доход	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1038	496	en	₪30,000 - ₪100,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1039	496	he	₪30,000 - ₪100,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1040	496	ru	₪30,000 - ₪100,000	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1041	497	en	Return on Investment	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1042	497	he	החזר השקעה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1043	497	ru	Окупаемость инвестиций	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1044	498	en	12-18 months	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1045	498	he	12-18 חודשים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1046	498	ru	12-18 месяцев	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1047	499	en	Results vary based on location and individual performance	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1048	499	he	התוצאות משתנות בהתאם למיקום וביצועים אישיים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1049	499	ru	Результаты варьируются в зависимости от местоположения и личных результатов	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1050	500	en	Get Financial Details	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1051	500	he	קבלו פרטים פיננסיים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1052	500	ru	Получить финансовые детали	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1053	501	en	Ready to Start Your<br/>Real Estate Franchise?	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1054	501	he	מוכנים להתחיל את<br/>זיכיון הנדל"ן שלכם?	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1055	501	ru	Готовы начать вашу<br/>франшизу недвижимости?	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1056	502	en	Start Application	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1057	502	he	התחילו בקשה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1058	502	ru	Начать заявку	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1059	503	en	→	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1060	503	he	←	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1061	503	ru	→	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1062	504	en	Join Our Legal<br/>Partnership Network	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1063	504	he	הצטרפו לרשת<br/>השותפות המשפטית שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1064	504	ru	Присоединяйтесь к нашей<br/>юридической партнерской сети	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1065	505	en	Fill Application Form	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1066	505	he	מלאו טופס בקשה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1067	505	ru	Заполнить форму заявки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1068	506	en	Quality Leads	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1069	506	he	לידים איכותיים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1070	506	ru	Качественные лиды	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1071	507	en	Strategic Partnership	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1072	507	he	שותפות אסטרטגית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1073	507	ru	Стратегическое партнерство	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1074	508	en	Business Growth	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1075	508	he	צמיחה עסקית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1076	508	ru	Рост бизнеса	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1077	509	en	About TechRealt Legal Services	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1078	509	he	אודות שירותי המשפט של טקריאלט	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1079	509	ru	О юридических услугах TechRealt	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1080	510	en	Leading legal technology platform connecting lawyers with real estate and mortgage clients	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1081	510	he	פלטפורמת טכנולוגיה משפטית מובילה המחברת עורכי דין עם לקוחות נדל"ן ומשכנתאות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1082	510	ru	Ведущая юридическая технологическая платформа, соединяющая юристов с клиентами недвижимости и ипотеки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1083	511	en	Join Our Network	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1084	511	he	הצטרפו לרשת שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1085	511	ru	Присоединиться к нашей сети	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1086	512	en	Earn More with Every Client	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1087	512	he	הרוויחו יותר עם כל לקוח	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1088	512	ru	Зарабатывайте больше с каждым клиентом	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1089	513	en	Commission Structure	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1090	513	he	מבנה עמלות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1091	513	ru	Структура комиссий	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1092	514	en	Competitive commission rates for every successful transaction	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1093	514	he	שיעורי עמלה תחרותיים עבור כל עסקה מוצלחת	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1094	514	ru	Конкурентные комиссионные ставки за каждую успешную сделку	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1095	515	en	Partnership Advantages	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1096	515	he	יתרונות השותפות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1097	515	ru	Преимущества партнерства	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1098	516	en	What We Provide	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1099	516	he	מה אנחנו מספקים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1100	516	ru	Что мы предоставляем	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1101	517	en	Advanced digital platform	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1102	517	he	פלטפורמה דיגיטלית מתקדמת	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1103	517	ru	Продвинутая цифровая платформа	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1104	518	en	Marketing and lead generation	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1105	518	he	שיווק וייצור לידים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1106	518	ru	Маркетинг и генерация лидов	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1107	519	en	Professional CRM system	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1108	519	he	מערכת CRM מקצועית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1109	519	ru	Профессиональная CRM-система	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1110	520	en	CRM System	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1111	520	he	מערכת CRM	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1112	520	ru	CRM-система	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1113	521	en	Digital Platform	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1114	521	he	פלטפורמה דיגיטלית	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1115	521	ru	Цифровая платформа	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1116	522	en	Get Free Consultation	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1117	522	he	קבלו ייעוץ חינם	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1118	522	ru	Получить бесплатную консультацию	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1119	523	en	How Our Partnership Works	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1120	523	he	איך השותפות שלנו עובדת	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1121	523	ru	Как работает наше партнерство	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1122	524	en	Application & Review	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1123	524	he	בקשה ובדיקה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1124	524	ru	Заявка и рассмотрение	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1125	525	en	Submit your application and credentials for review	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1126	525	he	הגישו את הבקשה והאישורים שלכם לבדיקה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1127	525	ru	Подайте заявку и документы для рассмотрения	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1128	526	en	Partnership Agreement	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1129	526	he	הסכם שותפות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1130	526	ru	Партнерское соглашение	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1131	527	en	Sign partnership agreement and set terms	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1132	527	he	חתמו על הסכם שותפות וקבעו תנאים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1133	527	ru	Подпишите партнерское соглашение и установите условия	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1134	528	en	Platform Training	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1135	528	he	הכשרת פלטפורמה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1136	528	ru	Обучение платформе	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1137	529	en	Learn to use our platform and tools	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1138	529	he	למדו להשתמש בפלטפורמה והכלים שלנו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1139	529	ru	Научитесь использовать нашу платформу и инструменты	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1140	530	en	Receive Leads	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1141	530	he	קבלת לידים	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1142	530	ru	Получение лидов	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1143	531	en	Start receiving qualified client leads	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1144	531	he	התחילו לקבל לידים איכותיים של לקוחות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1331	593	ru	До ₪ 300,000	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1145	531	ru	Начните получать квалифицированные лиды клиентов	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1146	532	en	Earn Commissions	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1147	532	he	הרוויחו עמלות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1148	532	ru	Зарабатывайте комиссии	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1149	533	en	Get paid for successful transactions	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1150	533	he	קבלו תשלום עבור עסקאות מוצלחות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1151	533	ru	Получайте оплату за успешные сделки	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1152	534	en	Apply Now	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1153	534	he	הגישו בקשה עכשיו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1154	534	ru	Подать заявку сейчас	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1155	535	en	Start Your Legal Partnership Today	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1156	535	he	התחילו את השותפות המשפטית שלכם היום	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1157	535	ru	Начните ваше юридическое партнерство сегодня	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1158	536	en	Join Now	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1159	536	he	הצטרפו עכשיו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1160	536	ru	Присоединиться сейчас	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1161	537	en	Company	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1162	537	he	חברה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1163	537	ru	Компания	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1164	538	en	About Us	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1165	538	he	אודותינו	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1166	538	ru	О нас	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1167	539	en	Contacts	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1168	539	he	צור קשר	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1169	539	ru	Контакты	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1170	540	en	Careers	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1171	540	he	קריירה	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1172	540	ru	Карьера	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1173	541	en	Partnership	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1174	541	he	שותפות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1175	541	ru	Партнерство	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1176	542	en	Contact Information	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1177	542	he	פרטי התקשרות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1178	542	ru	Контактная информация	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1179	543	en	info@techrealt.com	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1180	543	he	info@techrealt.com	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1181	543	ru	info@techrealt.com	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1182	544	en	+972-3-123-4567	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1183	544	he	+972-3-123-4567	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1184	544	ru	+972-3-123-4567	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1185	545	en	admin@techrealt.com	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1186	545	he	admin@techrealt.com	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1187	545	ru	admin@techrealt.com	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1188	546	en	Legal	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1189	546	he	משפטי	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1190	546	ru	Юридическая информация	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1191	547	en	Terms of Service	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1192	547	he	תנאי שימוש	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1193	547	ru	Пользовательское соглашение	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1194	548	en	Privacy Policy	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1195	548	he	מדיניות פרטיות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1196	548	ru	Политика конфиденциальности	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1197	549	en	Cookie Policy	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1198	549	he	מדיניות עוגיות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1199	549	ru	Политика использования cookie	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1200	550	en	Return Policy	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1201	550	he	מדיניות החזרות	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1202	550	ru	Политика возврата	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1203	551	en	© 2024 TechRealt. All rights reserved.	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1204	551	he	© 2024 טקריאלט. כל הזכויות שמורות.	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
1205	551	ru	© 2024 TechRealt. Все права защищены.	f	approved	2025-07-21 12:29:44.878698	2025-07-21 12:29:44.878698	\N	\N	\N
2330	924	he	חישוב משכנתא	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
1209	553	en	Bankimonline is the leading platform for comparing mortgages and financial products in Israel.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1210	553	he	בנקימאונליין היא הפלטפורמה המובילה להשוואת משכנתאות ומוצרים פיננסיים בישראל.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1211	553	ru	Bankimonline - ведущая платформа для сравнения ипотек и финансовых продуктов в Израиле.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1212	554	en	We help clients find the best mortgage for them, saving time and money.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1327	592	he	הכנסה שנתית	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1328	592	ru	Годовой доход	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1206	552	en	About us	f	approved	2025-07-21 12:29:45.098412	2025-07-22 12:08:42.91988	\N	\N	\N
1213	554	he	אנחנו עוזרים ללקוחות למצוא את המשכנתא הטובה ביותר עבורם, וחוסכים זמן וכסף.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1214	554	ru	Мы помогаем клиентам найти лучшую ипотеку для них, экономя время и деньги.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1215	555	en	Join our partner network and be part of the financial revolution in Israel.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1216	555	he	הצטרפו לרשת השותפים שלנו והיו חלק מהמהפכה הפיננסית בישראל.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1217	555	ru	Присоединяйтесь к нашей партнерской сети и станьте частью финансовой революции в Израиле.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1218	556	en	How will you earn?	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1219	556	he	איך תרוויחו?	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1220	556	ru	Как вы будете зарабатывать?	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1221	557	en	Attractive commissions	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1222	557	he	עמלות אטרקטיביות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1223	557	ru	Привлекательные комиссии	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1224	558	en	Receive commission for every client who makes a transaction through you. Commission rates vary by transaction type and volume.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1225	558	he	קבלו עמלה על כל לקוח שמבצע עסקה דרככם. שיעורי העמלה משתנים לפי סוג העסקה והיקפה.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1226	558	ru	Получайте комиссию за каждого клиента, который совершает сделку через вас. Размеры комиссии варьируются в зависимости от типа и объема сделки.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1227	559	en	Special bonuses	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1228	559	he	בונוסים מיוחדים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1229	559	ru	Специальные бонусы	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1230	560	en	Earn additional bonuses for achieving monthly and quarterly goals.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1231	560	he	הרוויחו בונוסים נוספים על השגת יעדים חודשיים ורבעוניים.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1232	560	ru	Зарабатывайте дополнительные бонусы за достижение месячных и квартальных целей.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1233	561	en	Achievable goals	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1234	561	he	יעדים ברי השגה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1235	561	ru	Достижимые цели	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1236	562	en	Set personal goals and receive full support to achieve them from our professional team.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1237	562	he	הציבו יעדים אישיים וקבלו תמיכה מלאה להשגתם מהצוות המקצועי שלנו.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1238	562	ru	Ставьте личные цели и получайте полную поддержку для их достижения от нашей профессиональной команды.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1239	563	en	5 simple steps to partnership	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1240	563	he	5 צעדים פשוטים לשותפות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1241	563	ru	5 простых шагов к партнерству	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1242	564	en	Fill out the form	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1243	564	he	מלאו את הטופס	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1244	564	ru	Заполните форму	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1245	565	en	Submit an application for the partner program through our website	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1246	565	he	הגישו בקשה לתוכנית השותפים דרך האתר שלנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1247	565	ru	Подайте заявку на партнерскую программу через наш сайт	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1248	566	en	Representative will contact	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1249	566	he	נציג יצור קשר	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1250	566	ru	Представитель свяжется	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1251	567	en	A representative from our team will contact you to schedule a meeting	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1252	567	he	נציג מהצוות שלנו יצור איתכם קשר לתיאום פגישה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1253	567	ru	Представитель нашей команды свяжется с вами для назначения встречи	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1254	568	en	Sign agreement	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1255	568	he	חתימה על הסכם	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1256	568	ru	Подписание договора	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1257	569	en	We'll sign a partnership agreement defining terms and commissions	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1258	569	he	נחתום על הסכם שותפות המגדיר תנאים ועמלות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1259	569	ru	Мы подпишем партнерское соглашение, определяющее условия и комиссии	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1260	570	en	Start referring clients	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1261	570	he	התחילו להפנות לקוחות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1262	570	ru	Начните направлять клиентов	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1263	571	en	You'll receive tools and support for efficient client referrals	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1264	571	he	תקבלו כלים ותמיכה להפניית לקוחות יעילה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1329	593	en	Up to ₪ 300,000	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1265	571	ru	Вы получите инструменты и поддержку для эффективного направления клиентов	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1266	572	en	Receive payments	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1267	572	he	קבלת תשלומים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1268	572	ru	Получение платежей	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1269	573	en	You'll receive monthly payments for clients you referred	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1270	573	he	תקבלו תשלומים חודשיים עבור לקוחות שהפניתם	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1271	573	ru	Вы будете получать ежемесячные платежи за клиентов, которых вы направили	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
2331	924	ru	Рассчитать ипотеку	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2332	925	en	Mortgage calculator	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
1275	575	en	Join our partner program today and start earning	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1276	575	he	הצטרפו לתוכנית השותפים שלנו היום והתחילו להרוויח	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1277	575	ru	Присоединяйтесь к нашей партнерской программе сегодня и начните зарабатывать	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1278	576	en	cooperation@bankimonline.com	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1279	576	he	cooperation@bankimonline.com	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1280	576	ru	cooperation@bankimonline.com	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1281	577	en	03-5371622	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1282	577	he	03-5371622	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1283	577	ru	03-5371622	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1284	578	en	Partner login	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1285	578	he	כניסת שותפים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1286	578	ru	Вход для партнеров	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1287	579	en	Register for partner program	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1288	579	he	הרשמה לתוכנית שותפים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1289	579	ru	Регистрация в партнерской программе	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1290	580	en	Franchise for Brokers	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1291	580	he	זיכיון למתווכים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1292	580	ru	Франшиза для брокеров	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1293	581	en	Open your own profitable mortgage brokerage with Bankimonline support	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1294	581	he	פתחו משרד תיווך משכנתאות רווחי משלכם עם תמיכת בנקימאונליין	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1295	581	ru	Откройте собственное прибыльное ипотечное агентство с поддержкой Bankimonline	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1296	582	en	Mortgage calculation	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1297	582	he	חישוב משכנתא	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1298	582	ru	Расчет ипотеки	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1299	583	en	Loan refinancing	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1300	583	he	מיחזור הלוואות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1301	583	ru	Рефинансирование кредитов	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1302	584	en	We bring clients – you get commissions on mortgage deals	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1303	584	he	אנחנו מביאים לקוחות – אתם מקבלים עמלות על עסקאות משכנתא	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1304	584	ru	Мы приводим клиентов – вы получаете комиссии за ипотечные сделки	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1305	585	en	Fill out the form on the website	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1306	585	he	מלאו את הטופס באתר	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1307	585	ru	Заполните форму на сайте	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1308	586	en	Our representative will contact you	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1309	586	he	הנציג שלנו ייצור איתכם קשר	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1310	586	ru	Наш представитель свяжется с вами	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1311	587	en	Sign an agency agreement	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1312	587	he	חתמו על הסכם סוכנות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1313	587	ru	Подпишите агентский договор	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1314	588	en	We equip and train your office	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1315	588	he	אנחנו מצייד ומכשירים את המשרד שלכם	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1316	588	ru	Мы оборудуем и обучаем ваш офис	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1317	589	en	Start earning stable income	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1318	589	he	התחילו להרוויח הכנסה יציבה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1319	589	ru	Начните зарабатывать стабильный доход	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1320	590	en	Investment	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1321	590	he	השקעה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1322	590	ru	Инвестиции	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1323	591	en	₪ 90,000	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1324	591	he	₪ 90,000	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1325	591	ru	₪ 90,000	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1326	592	en	Annual income	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1272	574	en	Our banking partners	f	approved	2025-07-21 12:29:45.098412	2025-07-22 08:00:21.031309	\N	\N	\N
2693	1047	en	Israel	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
1332	594	en	Payback	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1333	594	he	החזר השקעה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1334	594	ru	Окупаемость	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1335	595	en	12 months	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1336	595	he	12 חודשים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1337	595	ru	12 месяцев	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1338	596	en	Pre-qualified clients with substantiated legal requirements	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1339	596	he	לקוחות מוכנים עם דרישות משפטיות מבוססות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1340	596	ru	Предварительно квалифицированные клиенты с обоснованными юридическими требованиями	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1341	597	en	Stable cooperation framework with mutually beneficial terms	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1342	597	he	מסגרת שיתוף פעולה יציבה עם תנאים משתלמים הדדית	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1343	597	ru	Стабильная структура сотрудничества с взаимовыгодными условиями	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1344	598	en	Access to new clients through our professional platform	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1345	598	he	גישה ללקוחות חדשים דרך הפלטפורמה המקצועית שלנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1346	598	ru	Доступ к новым клиентам через нашу профессиональную платформу	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1347	599	en	How Will You Earn?	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1348	599	he	איך תרוויחו?	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1349	599	ru	Как вы будете зарабатывать?	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1350	600	en	Exclusive clients, earn without risks: Our partnership - your success!	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1351	600	he	לקוחות בלעדיים, הרוויחו ללא סיכונים: השותפות שלנו - ההצלחה שלכם!	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1352	600	ru	Эксклюзивные клиенты, зарабатывайте без рисков: Наше партнерство - ваш успех!	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1353	601	en	Be confident in your success with TechRealt! We provide exclusive clients so you can focus on your professional work. At the end of the month, we invoice you based on the number of successful cases. Minimum risks - maximum earning opportunities.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1354	601	he	היו בטוחים בהצלחה שלכם עם טקריאלט! אנו מספקים לקוחות בלעדיים כדי שתוכלו להתמקד בעבודה המקצועית שלכם. בסוף החודש, אנו מחייבים אתכם על סמך מספר המקרים המוצלחים. סיכונים מינימליים - הזדמנויות רווח מקסימליות.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1355	601	ru	Будьте уверены в своем успехе с TechRealt! Мы предоставляем эксклюзивных клиентов, чтобы вы могли сосредоточиться на профессиональной работе. В конце месяца мы выставляем вам счет на основе количества успешных дел. Минимальные риски - максимальные возможности заработка.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1356	602	en	Become Our Partner and Earn Together with Us	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1357	602	he	הפכו לשותפים שלנו והרוויחו יחד איתנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1358	602	ru	Станьте нашим партнером и зарабатывайте вместе с нами	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1359	603	en	How It Works	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1360	603	he	איך זה עובד	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1361	603	ru	Как это работает	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1362	604	en	Fill Out Form on Our Website	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1363	604	he	מלאו טופס באתר שלנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1364	604	ru	Заполните форму на нашем сайте	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1365	605	en	Simply fill out a short form on our website to join our referral program	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1366	605	he	פשוט מלאו טופס קצר באתר שלנו כדי להצטרף לתוכנית ההפניות שלנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1367	605	ru	Просто заполните короткую форму на нашем сайте, чтобы присоединиться к нашей реферальной программе	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1368	606	en	Our Representative Will Contact You	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1369	606	he	הנציג שלנו ייצור איתכם קשר	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1370	606	ru	Наш представитель свяжется с вами	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1371	607	en	After filling out the form, our representative will contact you to discuss details and answer your questions. We will review your application and make a decision about cooperation.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1372	607	he	לאחר מילוי הטופס, הנציג שלנו ייצור איתכם קשר כדי לדון בפרטים ולענות על שאלותיכם. נבדוק את הבקשה שלכם ונקבל החלטה לגבי שיתוף הפעולה.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1373	607	ru	После заполнения формы наш представитель свяжется с вами для обсуждения деталей и ответа на ваши вопросы. Мы рассмотрим вашу заявку и примем решение о сотрудничестве.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1374	608	en	We Sign Agency Agreement for Services	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1375	608	he	אנחנו חותמים על הסכם סוכנות לשירותים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1376	608	ru	Мы подписываем агентский договор на услуги	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1377	609	en	We sign an agency agreement for services provision on terms favorable to you.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1378	609	he	אנו חותמים על הסכם סוכנות למתן שירותים בתנאים נוחים לכם.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1379	609	ru	Мы подписываем агентский договор на оказание услуг на выгодных для вас условиях.	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1380	610	en	We Transfer Our Clients Who Need Legal Help	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1381	610	he	אנו מעבירים את הלקוחות שלנו הזקוקים לעזרה משפטית	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1382	610	ru	Мы передаем наших клиентов, нуждающихся в юридической помощи	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1383	611	en	In case of winning the tender, we will transfer clients who need legal help to you. We provide access to upload complete information about you and your activities on the business card website	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1384	611	he	במקרה של זכייה במכרז, נעביר אליכם לקוחות הזקוקים לעזרה משפטית. אנו מספקים גישה להעלאת מידע מלא עליכם ועל פעילותכם באתר כרטיס הביקור	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1385	611	ru	В случае выигрыша тендера мы передадим вам клиентов, нуждающихся в юридической помощи. Мы предоставляем доступ для загрузки полной информации о вас и вашей деятельности на сайте визитной карточки	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1386	612	en	Monthly Payment for Our Services	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1387	612	he	תשלום חודשי עבור השירותים שלנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1388	612	ru	Ежемесячная оплата за наши услуги	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1389	613	en	You receive:\n\nExclusive clients\nAccess to Digital platform and 24/7 support\nSavings on advertising costs\n\nWe bill based on work volume and number of clients provided to you on individual terms	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1390	613	he	אתם מקבלים:\n\nלקוחות בלעדיים\nגישה לפלטפורמה דיגיטלית ותמיכה 24/7\nחיסכון בעלויות פרסום\n\nאנו מחייבים על סמך היקף העבודה ומספר הלקוחות המסופקים לכם בתנאים אישיים	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1391	613	ru	Вы получаете:\n\nЭксклюзивных клиентов\nДоступ к цифровой платформе и поддержку 24/7\nЭкономию на рекламных расходах\n\nМы выставляем счета на основе объема работы и количества предоставленных вам клиентов на индивидуальных условиях	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1392	614	en	Submit Application	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1393	614	he	הגישו בקשה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1394	614	ru	Подать заявку	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1395	615	en	Advantages of Cooperation with Us	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1396	615	he	יתרונות שיתוף הפעולה איתנו	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1397	615	ru	Преимущества сотрудничества с нами	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1398	616	en	Digital Services for Successful Business Development	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1399	616	he	שירותים דיגיטליים לפיתוח עסקי מוצלח	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1400	616	ru	Цифровые услуги для успешного развития бизнеса	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1401	617	en	Access to Digital platform and 24/7 support	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1402	617	he	גישה לפלטפורמה דיגיטלית ותמיכה 24/7	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1403	617	ru	Доступ к цифровой платформе и поддержка 24/7	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1404	618	en	We cover marketing expenses	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1405	618	he	אנו מכסים הוצאות שיווק	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1406	618	ru	Мы покрываем маркетинговые расходы	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1407	619	en	Digital client management through CRM system	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1408	619	he	ניהול לקוחות דיגיטלי דרך מערכת CRM	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1409	619	ru	Цифровое управление клиентами через CRM-систему	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1410	620	en	Platform Access and Support	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1411	620	he	גישה לפלטפורמה ותמיכה	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1412	620	ru	Доступ к платформе и поддержка	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1413	621	en	Digital Client Management through CRM System	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1414	621	he	ניהול לקוחות דיגיטלי דרך מערכת CRM	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1415	621	ru	Цифровое управление клиентами через CRM-систему	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1416	622	en	Get Consultation	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1417	622	he	קבלו ייעוץ	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1418	622	ru	Получить консультацию	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1419	623	en	Begin Partnership	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1420	623	he	התחילו שותפות	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
1421	623	ru	Начать партнерство	f	approved	2025-07-21 12:29:45.098412	2025-07-21 12:29:45.098412	\N	\N	\N
6	2	ru	Рассчитать ипотеку	t	approved	2025-07-17 16:54:29.466467	2025-07-21 14:22:40.090343	1	\N	\N
1424	3	ru	Рефинансирование Ипо...	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
1425	4	ru	Расчет Кредита	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
1426	5	ru	Рефинансирован...	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
2333	925	he	מחשבון משכנתא	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
5	2	he	חישוב משכנתא	f	approved	2025-07-17 16:54:29.466467	2025-07-21 14:22:40.090343	1	\N	\N
1430	3	he	מיחזור משכנתא	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
1431	4	he	חישוב אשראי	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
1432	5	he	שירותי מיחזור	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
4675	1693	he	אזרח ישראלי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2334	925	ru	Ипотечный калькулятор	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4	2	en	Calculate Mortgage	f	approved	2025-07-17 16:54:29.466467	2025-07-21 14:22:40.090343	1	\N	\N
1436	3	en	Refinance Mortgage	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
1437	4	en	Credit Calculator	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
1438	5	en	Refinance Services	f	approved	2025-07-21 14:22:40.090343	2025-07-21 14:22:40.090343	\N	\N	\N
7	6	en	General Pages	f	approved	2025-07-18 06:12:24.818512	2025-07-21 14:22:40.090343	\N	\N	\N
1273	574	he	השותפים הבנקאיים שלנוווו	f	approved	2025-07-21 12:29:45.098412	2025-07-22 08:00:20.874847	\N	\N	\N
1274	574	ru	Наши банковские партнеры	f	approved	2025-07-21 12:29:45.098412	2025-07-22 08:00:20.876212	\N	\N	\N
1440	624	en	Company	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1441	625	en	Our services	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
6406	2401	he	בית	f	approved	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
1443	627	en	Jobs	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1444	628	en	Contact	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1445	629	en	Temporary Franchise for Brokers	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1446	630	en	Franchise for Real Estate Brokers	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1447	624	he	חברה	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1448	625	he	השירותים שלנו	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1450	627	he	משרות	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1451	628	he	צור קשר	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1452	629	he	זכיון זמני למתווכים	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1453	630	he	זיכיון למתווכי נדל"ן	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1455	625	ru	Наши услуги	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1457	627	ru	Вакансии	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1458	628	ru	Связаться с нами	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1459	629	ru	Временная франшиза для брокеров	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1460	630	ru	Франшиза для брокеров недвижимости	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1461	631	en	Business	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1462	632	en	Partner financial institutions	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1463	633	en	Partner program	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1464	634	en	Broker franchise	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1465	635	en	Lawyer partner program	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
4676	1694	he	ארצות הברית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1468	633	he	תכנית שותפים	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1469	634	he	זיכיון למתווכים	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1470	635	he	תכנית שותפים לעורכי דין	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1472	632	ru	Партнерские финансовые учреждения	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1473	633	ru	Партнерская программа	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1474	634	ru	Франшиза для брокеров	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1475	635	ru	Партнерская программа для юристов	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1476	636	en	Secretary	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1477	637	en	03-1234567	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1478	638	en	secretary@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1479	639	en	Contact Secretary	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1480	640	en	03-1234568	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1481	641	en	support@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1482	642	en	Contact Technical Support	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1483	643	en	03-1234569	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1484	644	en	service@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1485	645	en	Contact Customer Service	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1486	636	he	מזכירות	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1487	637	he	03-1234567	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1488	638	he	secretary@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1489	639	he	פנה למזכירות	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1490	640	he	03-1234568	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1491	641	he	support@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1492	642	he	פנה לתמיכה טכנית	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1493	643	he	03-1234569	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1494	644	he	service@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1495	645	he	פנה לשירות לקוחות	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1496	636	ru	Секретариат	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1497	637	ru	03-1234567	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1498	638	ru	secretary@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1499	639	ru	Связаться с секретариатом	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
9	6	ru	Рассчитать ипотеку	f	approved	2025-07-18 06:12:24.818512	2025-07-24 05:45:05.873532	\N	\N	\N
1454	624	ru	Компания22	f	approved	2025-07-22 08:07:06.006194	2025-07-24 21:05:49.222408	\N	\N	\N
1471	631	ru	Тестовое значение	f	approved	2025-07-22 08:07:06.006194	2025-07-24 22:06:42.634434	\N	\N	\N
1466	631	he	עסקים	f	approved	2025-07-22 08:07:06.006194	2025-07-24 21:06:43.057532	\N	\N	\N
1449	626	he	אודות	f	approved	2025-07-22 08:07:06.006194	2025-08-01 06:02:01.749317	\N	\N	\N
1500	640	ru	03-1234568	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1501	641	ru	support@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1502	642	ru	Связаться с технической поддержкой	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1503	643	ru	03-1234569	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1504	644	ru	service@bankimonline.com	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1505	645	ru	Связаться со службой поддержки клиентов	f	approved	2025-07-22 08:07:06.006194	2025-07-22 08:07:06.006194	\N	\N	\N
1506	646	en	Dashboard	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1507	646	he	לוח בקרה	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1508	646	ru	Панель управления	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1509	647	en	Bank Offers	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1510	647	he	הצעות בנקים	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1511	647	ru	Банковские предложения	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1512	648	en	Calculate Mortgage	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1513	648	he	חישוב משכנתא	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1514	648	ru	Расчет ипотеки	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
4677	1695	he	קנדה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4678	1696	he	בריטניה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4679	1697	he	צרפת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1518	650	en	Refinance Mortgage	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1519	650	he	מימון מחדש משכנתא	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1520	650	ru	Рефинансирование ипотеки	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
4680	1698	he	גרמניה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4681	1699	he	רוסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1524	652	en	Personal Cabinet	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1525	652	he	ארון אישי	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1526	652	ru	Личный кабинет	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1527	653	en	About Us	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1528	653	he	אודותינו	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1529	653	ru	О нас	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1530	654	en	Contact	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1531	654	he	צור קשר	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1532	654	ru	Контакты	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1533	655	en	Settings	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1534	655	he	הגדרות	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1535	655	ru	Настройки	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1536	656	en	Support	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1537	656	he	תמיכה	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1538	656	ru	Поддержка	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1539	657	en	Help	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1540	657	he	עזרה	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1541	657	ru	Помощь	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1542	658	en	FAQ	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1543	658	he	שאלות נפוצות	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1544	658	ru	Часто задаваемые вопросы	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1545	659	en	Privacy Policy	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1546	659	he	מדיניות פרטיות	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1547	659	ru	Политика конфиденциальности	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1548	660	en	Terms of Service	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1549	660	he	תנאי שירות	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1550	660	ru	Условия обслуживания	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1551	661	en	Logout	t	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1552	661	he	התנתק	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
1553	661	ru	Выйти	f	approved	2025-07-22 08:23:46.753675	2025-07-22 08:23:46.753675	\N	\N	\N
2	1	he	תפריט ניווט צדדי	f	approved	2025-07-17 16:54:29.466467	2025-07-22 11:59:34.099728	1	\N	\N
1	1	en	Side Navigation Menu	f	approved	2025-07-17 16:54:29.466467	2025-07-22 11:59:34.100155	1	\N	\N
1207	552	he	אודותינו22	f	approved	2025-07-21 12:29:45.098412	2025-07-22 12:08:42.939676	\N	\N	\N
1208	552	ru	О нас22	f	approved	2025-07-21 12:29:45.098412	2025-07-22 12:08:42.945171	\N	\N	\N
769	406	he	מוכנים להיות שותפים?22	f	approved	2025-07-21 12:29:44.878698	2025-07-22 12:09:43.339241	\N	\N	\N
1554	663	en	About us	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1555	663	he	אודותינו	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1556	663	ru	О нас	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1557	664	en	We are leaders in the field of financing offer comparison and help our clients find the best financial solution for them.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1558	664	he	אנחנו מובילים בתחום השוואת הצעות מימון ועוזרים ללקוחותינו למצוא את הפתרון הפיננסי הטוב ביותר עבורם.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1559	664	ru	Мы лидеры в области сравнения предложений финансирования и помогаем нашим клиентам найти лучшее финансовое решение для них.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1560	665	en	How does it work?	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1561	665	he	איך זה עובד?	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1562	665	ru	Как это работает?	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1676	703	ru	03-1234572	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
2335	926	en	Mortgage Filter	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2336	926	he	מסנן משכנתאות	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
3732	1219	ru	Ежемесячная экономия	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3733	1220	ru	Общая экономия	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
1563	666	en	Our platform connects to all major banks and allows you to receive personalized offers without leaving home. Simply register to	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1564	666	he	הפלטפורמה שלנו מתחברת לכל הבנקים הגדולים ומאפשרת לכם לקבל הצעות מותאמות אישית ללא יציאה מהבית. פשוט נרשמים ל	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1565	666	ru	Наша платформа подключается ко всем крупным банкам и позволяет вам получать персонализированные предложения, не выходя из дома. Просто зарегистрируйтесь в 	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1566	667	en	Bankimonline	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1567	667	he	בנקימונליין	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1568	667	ru	Банкимонлайн	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1569	668	en	 and all banks compete to give you the best offer.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1570	668	he	 וכל הבנקים מתחרים בשבילכם לתת לכם את ההצעה הטובה ביותר.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1571	668	ru	 и все банки будут конкурировать, чтобы дать вам лучшее предложение.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1572	669	en	Why choose us?	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1573	669	he	למה לבחור בנו?	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1574	669	ru	Почему выбрать нас?	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1575	670	en	Solve every problem	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1576	670	he	פותרים כל בעיה	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1577	670	ru	Решаем любую проблему	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1578	671	en	Our platform can help all users, even those who think they cannot get a mortgage due to poor credit history.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1579	671	he	הפלטפורמה שלנו יכולה לעזור לכל המשתמשים, אפילו לאלו שלדעתם אינם יכולים לקחת משכנתא בגלל היסטוריה אשראית לא טובה.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1580	671	ru	Наша платформа может помочь всем пользователям, даже тем, кто считает, что не может получить ипотеку из-за плохой кредитной истории.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1581	672	en	Banks compete for you	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1582	672	he	בנקים מתחרים בשבילכם	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1583	672	ru	Банки конкурируют за вас	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1584	673	en	Our platform allows sending applications to all banks and receiving the most profitable offers, without leaving home.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1585	673	he	הפלטפורמה שלנו מאפשרת לשלוח בקשה לכל הבנקים ולקבל את ההצעות הכי משתלמות, ללא יציאה מהבית.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1586	673	ru	Наша платформа позволяет отправить заявку во все банки и получить самые выгодные предложения, не выходя из дома.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1587	674	en	Two days and the mortgage is ready	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1588	674	he	יומיים והמשכנתא מוכנה	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1589	674	ru	Два дня и ипотека готова	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1590	675	en	Our platform provides solutions from our partner banks in a short time.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1591	675	he	הפלטפורמה שלנו מספקת פתרונות מהבנקים השותפים שלנו בזמן קצר.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1592	675	ru	Наша платформа предоставляет решения от наших банков-партнеров в короткие сроки.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1593	676	en	Simple and easy	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1594	676	he	פשוט וקל	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1595	676	ru	Просто и легко	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1596	677	en	Our platform is simple and easy to use.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1597	677	he	הפלטפורמה שלנו פשוטה וקלה לשימוש.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1598	677	ru	Наша платформа проста и удобна в использовании.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
4682	1700	he	אוקראינה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4683	1701	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4684	1692	ru	Гражданство	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4685	1693	ru	Израильский гражданин	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4686	1699	ru	Россия	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4687	1700	ru	Украина	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1605	680	en	Confidentiality and security	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1606	680	he	סודיות ואבטחה	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1607	680	ru	Конфиденциальность и безопасность	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1608	681	en	We will never use your personal information beyond the purpose for which it is intended.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1609	681	he	אנחנו לעולם לא נשתמש במידע האישי שלכם מעבר למטרה שלשמה הוא נועד.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
4688	1701	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4689	1702	en	Number of Children	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4690	1702	he	מספר ילדים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5399	1996	en	Employee	f	approved	2025-08-07 04:02:56.945701	2025-08-07 04:02:56.945701	\N	\N	\N
1610	681	ru	Мы никогда не будем использовать вашу личную информацию сверх цели, для которой она предназначена.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1611	682	en	Fast and accessible	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1612	682	he	מהיר ונגיש	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1613	682	ru	Быстро и доступно	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1614	683	en	We translate complex banking and insurance terms into everyday language and help with advice at every stage.	t	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1615	683	he	אנחנו מתרגמים תנאים בנקאיים וביטוחיים מורכבים לשפה יומיומית ועוזרים בעצה בכל שלב.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1616	683	ru	Мы переводим сложные банковские и страховые условия на повседневный язык и помогаем советом на каждом этапе.	f	approved	2025-07-22 12:30:41.345835	2025-07-22 12:30:41.345835	1	\N	\N
1617	684	en	Contact us	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1618	684	he	צור קשר	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1619	684	ru	Связаться с нами	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1620	685	en	Main office	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1621	685	he	המשרד הראשי	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1622	685	ru	Главный офис	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1623	686	en	46 Herzl Street, Tel Aviv-Yafo, Israel	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1624	686	he	רחוב הרצל 46, תל אביב-יפו, ישראל	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1625	686	ru	ул. Герцля 46, Тель-Авив-Яффо, Израиль	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1626	687	en	03-5371622	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1627	687	he	03-5371622	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1628	687	ru	03-5371622	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1629	688	en	Phone	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1630	688	he	טלפון	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1631	688	ru	Телефон	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1632	689	en	info@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1633	689	he	info@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1634	689	ru	info@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1635	690	en	Email	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1636	690	he	אימייל	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1637	690	ru	Электронная почта	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1638	691	en	General questions	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1639	691	he	שאלות כלליות	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1640	691	ru	Общие вопросы	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1641	692	en	Service questions	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1642	692	he	שאלות לגבי שירותים	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1643	692	ru	Вопросы по услугам	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1644	693	en	Cooperation	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1645	693	he	שיתופי פעולה	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1646	693	ru	Сотрудничество	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1647	694	en	Customer service	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1648	694	he	שירות לקוחות	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1649	694	ru	Служба поддержки клиентов	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1650	695	en	Mortgage Calculator	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1651	695	he	מחשבון משכנתא	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1652	695	ru	Калькулятор ипотеки	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1653	696	en	03-1234570	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1654	696	he	03-1234570	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1655	696	ru	03-1234570	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1656	697	en	mortgage@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1657	697	he	mortgage@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1658	697	ru	mortgage@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
4691	1702	ru	Количество детей	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4692	1703	en	Main Income Source	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4693	1704	en	Employee	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4694	1705	en	Self-employed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4695	1706	en	Unemployed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4696	1707	en	Student	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4697	1708	en	Pension	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4698	1709	en	Unpaid leave	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4699	1710	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1668	701	en	Real Estate Questions	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1669	701	he	שאלות לגבי נדל"ן	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1670	701	ru	Вопросы по недвижимости	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1671	702	en	Buy/Sell Real Estate	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1672	702	he	קנייה ומכירת נדל"ן	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1673	702	ru	Покупка и продажа недвижимости	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1674	703	en	03-1234572	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1675	703	he	03-1234572	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
4700	1703	he	מקור הכנסה עיקרי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
1677	704	en	realestate@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1678	704	he	realestate@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1679	704	ru	realestate@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1680	705	en	Rent Real Estate	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1681	705	he	השכרת נדל"ן	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1682	705	ru	Аренда недвижимости	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1683	706	en	03-1234573	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1684	706	he	03-1234573	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1685	706	ru	03-1234573	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1686	707	en	rent@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1687	707	he	rent@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1688	707	ru	rent@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1689	708	en	Cooperation & Management	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1690	708	he	שיתופי פעולה וניהול	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1691	708	ru	Сотрудничество и управление	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1692	709	en	03-1234574	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1693	709	he	03-1234574	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1694	709	ru	03-1234574	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1695	710	en	cooperation@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1696	710	he	cooperation@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1697	710	ru	cooperation@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1698	711	en	Management	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1699	711	he	הנהלה	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1700	711	ru	Руководство	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1701	712	en	03-1234575	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1702	712	he	03-1234575	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1703	712	ru	03-1234575	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1704	713	en	management@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1705	713	he	management@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1706	713	ru	management@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1707	714	en	Accounting	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1708	714	he	הנהלת חשבונות	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1709	714	ru	Бухгалтерия	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1710	715	en	03-1234576	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1711	715	he	03-1234576	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1712	715	ru	03-1234576	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1713	716	en	accounting@bankimonline.com	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1714	716	he	accounting@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1715	716	ru	accounting@bankimonline.com	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1716	717	en	Fax	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1717	717	he	פקס	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1718	717	ru	Факс	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1719	718	en	03-1234577	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1720	718	he	03-1234577	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1721	718	ru	03-1234577	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1722	719	en	Follow Us	t	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1723	719	he	עקבו אחרינו	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
1724	719	ru	Подписывайтесь на нас	f	approved	2025-07-22 12:31:43.473465	2025-07-22 12:31:43.473465	1	\N	\N
4701	1704	he	עובד שכיר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4702	1705	he	עצמאי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4703	1706	he	מובטל	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4704	1707	he	סטודנט	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4705	1708	he	פנסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4706	1709	he	חופשה ללא תשלום	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4707	1710	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4708	1703	ru	Основной источник дохода	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4709	1704	ru	Наемный работник	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4710	1705	ru	Самозанятый	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4711	1710	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4712	1711	en	Additional Income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
6407	2401	en	Home	f	approved	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
4714	1713	en	Additional salary	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4715	1714	en	Additional work	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4716	1715	en	Investment income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4717	1716	en	Property rental income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4718	1717	en	Pension	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4719	1718	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4720	1711	he	הכנסה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
6408	2402	ru	О нас	t	approved	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
4722	1713	he	משכורת נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4723	1714	he	עבודה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
3776	1278	ru	Детали дохода	f	approved	2025-07-26 08:09:47.359704	2025-07-29 05:57:36.306569	\N	\N	\N
4724	1715	he	הכנסה מהשקעות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4725	1716	he	הכנסה משכירות נכס	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
6409	2402	he	אודות	f	approved	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
4726	1717	he	פנסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4727	1718	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4728	1711	ru	Дополнительный доход	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4729	1719	en	Financial Obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4730	1720	en	No obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4731	1721	en	Credit card debt	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4732	1722	en	Bank loan	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4733	1723	en	Consumer credit	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4734	1724	en	Other obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4735	1719	he	התחייבויות כספיות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4736	1720	he	אין התחייבויות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4737	1721	he	חוב כרטיס אשראי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4738	1722	he	הלוואה בנקאית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4739	1723	he	אשראי צרכני	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4740	1724	he	התחייבויות אחרות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4741	1719	ru	Финансовые обязательства	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4742	1652	en	Loan Amount	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4743	1652	he	סכום ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4744	1652	ru	Сумма кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4745	1654	en	Loan Period	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4746	1727	en	5 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4747	1728	en	10 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4748	1729	en	15 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4749	1730	en	20 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4750	1731	en	25 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4751	1732	en	30 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4752	1654	he	תקופת ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4753	1727	he	5 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4754	1728	he	10 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4755	1729	he	15 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4756	1730	he	20 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4757	1731	he	25 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4758	1732	he	30 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4759	1654	ru	Срок кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4760	1727	ru	5 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4761	1728	ru	10 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4762	1729	ru	15 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4763	1730	ru	20 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4764	1731	ru	25 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4765	1732	ru	30 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4766	1653	en	Loan Purpose	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4767	1734	en	Investment	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4768	1735	en	Personal use	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4769	1736	en	Business	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4770	1737	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4771	1653	he	מטרת ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4772	1734	he	השקעה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4773	1735	he	שימוש אישי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4774	1736	he	עסק	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4775	1737	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4776	1653	ru	Цель кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4777	1734	ru	Инвестиции	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4778	1735	ru	Личное использование	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4779	1736	ru	Бизнес	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4780	1737	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4781	1738	en	City	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4782	1738	he	עיר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4783	1738	ru	Город	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4784	1739	en	When do you need the loan?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4785	1740	en	Within 3 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4786	1741	en	3-6 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2337	926	ru	Фильтр ипотек	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2338	927	en	Mortgage Calculation	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2339	927	he	חישוב משכנתא	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2340	927	ru	Расчет ипотеки	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2341	928	en	Get the most suitable mortgage offers for you	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4787	1742	en	6-12 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4788	1743	en	Over 12 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4789	1739	he	מתי אתה צריך את ההלוואה?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4790	1740	he	תוך 3 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4791	1741	he	3-6 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4792	1742	he	6-12 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4793	1743	he	מעל 12 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
3777	1284	ru	Наемный работник	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4794	1739	ru	Когда вам нужен кредит?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4795	1740	ru	В течение 3 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4796	1741	ru	3-6 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4797	1742	ru	6-12 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4798	1743	ru	Более 12 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2349	930	ru	Базовые данные	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2350	931	en	Personal profile details	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2351	931	he	פרטי הפרופיל האישי	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2352	931	ru	Данные личного профиля	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
6410	2402	en	About	f	approved	2025-08-16 20:10:55.211313	2025-08-16 20:10:55.211313	\N	\N	\N
2362	935	en	Monthly payment	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2363	935	he	תשלום חודשי	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2364	935	ru	Ежемесячный платеж	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4799	1744	en	Education	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4800	1745	en	No high school diploma	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4801	1746	en	Partial high school	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4802	1747	en	High school diploma	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4803	1748	en	Post-secondary education	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4804	1749	en	Bachelor's degree	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4805	1750	en	Master's degree	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4806	1751	en	Doctorate	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4807	1744	he	השכלה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4808	1745	he	ללא תעודת בגרות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4809	1746	he	בגרות חלקית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4810	1747	he	תעודת בגרות מלאה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4811	1748	he	השכלה על-תיכונית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4812	1749	he	תואר ראשון	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4813	1750	he	תואר שני	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4814	1751	he	דוקטורט	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4815	1744	ru	Образование	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4816	1752	en	Family Status	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4817	1753	en	Single	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4818	1754	en	Married	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4819	1755	en	Divorced	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4820	1756	en	Widowed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4821	1757	en	Common-law partner	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4822	1758	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4823	1752	he	מצב משפחתי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4824	1753	he	רווק/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4825	1754	he	נשוי/אה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4826	1755	he	גרוש/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4827	1756	he	אלמן/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4828	1757	he	ידוע/ה בציבור	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4829	1758	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4830	1752	ru	Семейное положение	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4831	1759	en	Citizenship	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4832	1760	en	Israeli citizen	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4833	1761	en	United States	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
3843	1150	he	מיחזור אשראי	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
4834	1762	en	Canada	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4835	1763	en	United Kingdom	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
6411	2403	ru	Результаты рефинансирования ипотеки	f	approved	2025-08-16 21:58:06.508415	2025-08-16 21:58:06.508415	\N	\N	\N
6412	2404	ru	Отображаемые предложения являются предварительными расчетами для рефинансирования ипотеки. Окончательные условия подлежат одобрению банка на основе вашего полного финансового профиля и оценки недвижимости.	f	approved	2025-08-16 21:58:06.639312	2025-08-16 21:58:06.639312	\N	\N	\N
6413	2403	en	Mortgage Refinancing Results	t	approved	2025-08-16 21:58:06.767832	2025-08-16 21:58:06.767832	\N	\N	\N
6414	2404	en	The displayed offers are preliminary estimates for mortgage refinancing. Final terms are subject to bank approval based on your complete financial profile and property valuation.	t	approved	2025-08-16 21:58:06.900006	2025-08-16 21:58:06.900006	\N	\N	\N
4836	1764	en	France	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4837	1765	en	Germany	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4838	1766	en	Russia	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4839	1767	en	Ukraine	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4840	1768	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4841	1759	he	אזרחות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4842	1760	he	אזרח ישראלי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4843	1761	he	ארצות הברית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4844	1762	he	קנדה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4845	1763	he	בריטניה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4846	1764	he	צרפת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4847	1765	he	גרמניה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2437	960	en	Show offers	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2438	960	he	הצג הצעות	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2439	960	ru	Показать предложения	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4848	1766	he	רוסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4849	1767	he	אוקראינה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
6415	2403	he	תוצאות מחזור משכנתא	f	approved	2025-08-16 21:58:07.058975	2025-08-16 21:58:07.058975	\N	\N	\N
6416	2404	he	ההצעות המוצגות הן הערכות ראשוניות למחזור משכנתא. התנאים הסופיים כפופים לאישור הבנק על בסיס הפרופיל הפיננסי המלא שלך והערכת הנכס.	f	approved	2025-08-16 21:58:07.199143	2025-08-16 21:58:07.199143	\N	\N	\N
2446	963	en	Enter first name and last name	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2447	963	he	הזן שם פרטי ושם משפחה	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2448	963	ru	Введите имя и фамилию	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2455	966	en	Select education level	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2456	966	he	בחר רמת השכלה	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2457	966	ru	Выберите уровень образования	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4850	1768	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4851	1759	ru	Гражданство	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4852	1760	ru	Израильский гражданин	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4853	1766	ru	Россия	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4854	1767	ru	Украина	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4855	1768	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4856	1769	en	Number of Children	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4857	1769	he	מספר ילדים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4858	1769	ru	Количество детей	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4859	1770	en	Main Income Source	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4860	1771	en	Employee	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4861	1772	en	Self-employed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4862	1773	en	Unemployed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4863	1774	en	Student	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4864	1775	en	Pension	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4865	1776	en	Unpaid leave	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4866	1777	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4867	1770	he	מקור הכנסה עיקרי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4868	1771	he	עובד שכיר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4869	1772	he	עצמאי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4870	1773	he	מובטל	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2482	975	en	Select marital status	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2483	975	he	בחר מצב משפחתי	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2484	975	ru	Выберите семейное положение	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4871	1774	he	סטודנט	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4872	1775	he	פנסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4873	1776	he	חופשה ללא תשלום	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4874	1777	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4875	1770	ru	Основной источник дохода	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4876	1771	ru	Наемный работник	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4877	1772	ru	Самозанятый	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4878	1777	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4879	1778	en	Additional Income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2440	961	en	Add partner	f	approved	2025-07-23 14:53:40.447288	2025-07-24 13:28:50.591031	\N	\N	\N
4880	1779	en	No additional income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4881	1780	en	Additional salary	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4882	1781	en	Additional work	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4883	1782	en	Investment income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4884	1783	en	Property rental income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4885	1784	en	Pension	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4886	1785	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4887	1778	he	הכנסה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4888	1779	he	אין הכנסה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4889	1780	he	משכורת נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4890	1781	he	עבודה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4891	1782	he	הכנסה מהשקעות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4892	1783	he	הכנסה משכירות נכס	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4893	1784	he	פנסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4894	1785	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4107	1465	ru	Город расположения недвижимости	f	approved	2025-07-29 21:29:29.162912	2025-08-16 22:32:10.33284	1	\N	\N
2509	984	en	Your current position at workplace	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2510	984	he	תפקידכם הנוכחי במקום העבודה	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2511	984	ru	Ваша текущая должность на рабочем месте	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2518	987	en	Enter monthly net income	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2519	987	he	הזן הכנסה חודשית נטו	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2520	987	ru	Введите чистый ежемесячный доход	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2521	988	en	Amount shown after tax deduction as confirmed by accountant	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2522	988	he	הסכום מוצג לאחר ניכוי מיסים כפי שמאושר על ידי רואה חשבון	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2523	988	ru	Сумма указывается после вычета налогов, подтвержденная бухгалтером	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2527	990	en	Select main income source	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2528	990	he	בחר מקור הכנסה עיקרי	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2529	990	ru	Выберите основной источник дохода	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4895	1778	ru	Дополнительный доход	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4896	1786	en	Financial Obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4897	1787	en	No obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4898	1788	en	Credit card debt	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4899	1789	en	Bank loan	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4900	1790	en	Consumer credit	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4901	1791	en	Other obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4902	1786	he	התחייבויות כספיות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4903	1787	he	אין התחייבויות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4904	1788	he	חוב כרטיס אשראי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4905	1789	he	הלוואה בנקאית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4906	1790	he	אשראי צרכני	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4907	1791	he	התחייבויות אחרות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4908	1786	ru	Финансовые обязательства	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4909	1655	en	Loan Amount	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4910	1655	he	סכום ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4911	1655	ru	Сумма кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4912	1657	en	Loan Period	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4913	1794	en	5 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4914	1795	en	10 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4915	1796	en	15 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4916	1797	en	20 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4917	1798	en	25 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4918	1799	en	30 years	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4919	1657	he	תקופת ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4920	1794	he	5 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4921	1795	he	10 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4922	1796	he	15 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4923	1797	he	20 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4924	1798	he	25 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4925	1799	he	30 שנים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4926	1657	ru	Срок кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4927	1794	ru	5 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4928	1795	ru	10 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4929	1796	ru	15 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4930	1797	ru	20 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4931	1798	ru	25 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4932	1799	ru	30 лет	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4933	1656	en	Loan Purpose	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4934	1801	en	Investment	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4935	1802	en	Personal use	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4936	1803	en	Business	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4937	1804	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4938	1656	he	מטרת ההלוואה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4939	1801	he	השקעה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4940	1802	he	שימוש אישי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4941	1803	he	עסק	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4942	1804	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4943	1656	ru	Цель кредита	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4944	1801	ru	Инвестиции	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4945	1802	ru	Личное использование	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4946	1803	ru	Бизнес	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4947	1804	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2587	1010	en	Select additional income type	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2588	1010	he	בחר סוג הכנסה נוספת	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2589	1010	ru	Выберите тип дополнительного дохода	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4948	1805	en	City	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4949	1805	he	עיר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4950	1805	ru	Город	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4951	1806	en	When do you need the loan?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4952	1807	en	Within 3 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4953	1808	en	3-6 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4954	1809	en	6-12 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4955	1810	en	Over 12 months	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4956	1806	he	מתי אתה צריך את ההלוואה?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4957	1807	he	תוך 3 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4958	1808	he	3-6 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4959	1809	he	6-12 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4960	1810	he	מעל 12 חודשים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4961	1806	ru	Когда вам нужен кредит?	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4962	1807	ru	В течение 3 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4963	1808	ru	3-6 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4964	1809	ru	6-12 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4965	1810	ru	Более 12 месяцев	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4966	1811	en	Education	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4967	1812	en	No high school diploma	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4968	1813	en	Partial high school	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2614	1019	en	Select obligation type	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2615	1019	he	בחר סוג התחייבות	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2616	1019	ru	Выберите тип обязательства	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4969	1814	en	High school diploma	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4970	1815	en	Post-secondary education	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4971	1816	en	Bachelor's degree	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4972	1817	en	Master's degree	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4973	1818	en	Doctorate	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4974	1811	he	השכלה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4975	1812	he	ללא תעודת בגרות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4976	1813	he	בגרות חלקית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4977	1814	he	תעודת בגרות מלאה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4978	1815	he	השכלה על-תיכונית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4979	1816	he	תואר ראשון	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4980	1817	he	תואר שני	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4981	1818	he	דוקטורט	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4982	1811	ru	Образование	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4983	1819	en	Family Status	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4984	1820	en	Single	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4985	1821	en	Married	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4986	1822	en	Divorced	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4987	1823	en	Widowed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4988	1824	en	Common-law partner	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2635	1026	en	Select citizenship	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2636	1026	he	בחר אזרחות	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2637	1026	ru	Выберите гражданство	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4989	1825	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
2662	1035	en	years	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2663	1035	he	שנים	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2664	1035	ru	лет	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2665	1036	en	years	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2666	1036	he	שנים	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2667	1036	ru	лет	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2668	1037	en	months	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2669	1037	he	חודשים	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2670	1037	ru	месяцев	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2671	1038	en	Mortgage cost	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2672	1038	he	עלות המשכנתא	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2673	1038	ru	Стоимость ипотеки	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2674	1039	en	Monthly Income	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2675	1039	he	הכנסה חודשית	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2676	1039	ru	Ежемесячный доход	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2677	1040	en	If you have been working at your current workplace for less than 3 months, specify your previous workplace	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2678	1040	he	אם אתה עובד פחות מ-3 חודשים במקום העבודה הנוכחי, ציין את מקום העבודה הקודם	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2679	1040	ru	Если вы работаете менее 3 месяцев на текущем месте работы, укажите предыдущее место работы	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2680	1041	en	For application approval, it is mandatory to detail all stakeholders and partners	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2681	1041	he	לשם אישור הבקשה, חובה לפרט את פרטי כלל בעלי העניין והשותפים	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2682	1041	ru	Для подтверждения заявки необходимо предоставить данные всех заинтересованных лиц и партнеров	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2683	1042	en	Increase the monthly payment and pay less interest	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2684	1042	he	הגדילו את התשלום החודשי ותשלמו פחות ריבית	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
2685	1042	ru	Увеличьте ежемесячный платеж и платите меньше процентов	f	approved	2025-07-23 14:53:40.447288	2025-07-23 14:53:40.447288	\N	\N	\N
4990	1819	he	מצב משפחתי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
3846	1153	he	למחוק פרטי הלוואה?	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
4991	1820	he	רווק/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4992	1821	he	נשוי/אה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4993	1822	he	גרוש/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4994	1823	he	אלמן/ה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4995	1824	he	ידוע/ה בציבור	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4996	1825	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4997	1819	ru	Семейное положение	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4998	1826	en	Citizenship	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
4999	1827	en	Israeli citizen	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5000	1828	en	United States	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5001	1829	en	Canada	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5002	1830	en	United Kingdom	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5003	1831	en	France	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5004	1832	en	Germany	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5005	1833	en	Russia	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5006	1834	en	Ukraine	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5007	1835	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5008	1826	he	אזרחות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5009	1827	he	אזרח ישראלי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5010	1828	he	ארצות הברית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
8	6	he	חישוב משכנתא	f	approved	2025-07-18 06:12:24.818512	2025-07-24 05:45:00.250767	\N	\N	\N
2442	961	ru	Добавить партнера	f	approved	2025-07-23 14:53:40.447288	2025-07-24 13:28:50.077244	\N	\N	\N
2441	961	he	הוסף שותף	f	approved	2025-07-23 14:53:40.447288	2025-07-24 13:28:50.807431	\N	\N	\N
5011	1829	he	קנדה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5012	1830	he	בריטניה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5013	1831	he	צרפת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5014	1832	he	גרמניה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5015	1833	he	רוסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5016	1834	he	אוקראינה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5017	1835	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
68	39	he	חישוב משכנתא	f	approved	2025-07-20 08:30:50.248187	2025-07-27 06:27:34.514243	1	\N	\N
5018	1826	ru	Гражданство	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5019	1827	ru	Израильский гражданин	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5020	1833	ru	Россия	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5021	1834	ru	Украина	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5022	1835	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5023	1836	en	Number of Children	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5024	1836	he	מספר ילדים	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5025	1836	ru	Количество детей	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5026	1837	en	Main Income Source	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5027	1838	en	Employee	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5028	1839	en	Self-employed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5029	1840	en	Unemployed	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5030	1841	en	Student	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5031	1842	en	Pension	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5032	1843	en	Unpaid leave	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5033	1844	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5034	1837	he	מקור הכנסה עיקרי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5035	1838	he	עובד שכיר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5036	1839	he	עצמאי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5037	1840	he	מובטל	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5038	1841	he	סטודנט	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5039	1842	he	פנסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5040	1843	he	חופשה ללא תשלום	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5041	1844	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5042	1837	ru	Основной источник дохода	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5043	1838	ru	Наемный работник	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5044	1839	ru	Самозанятый	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5045	1844	ru	Другое	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5046	1845	en	Additional Income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5047	1846	en	No additional income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5048	1847	en	Additional salary	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5049	1848	en	Additional work	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5050	1849	en	Investment income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5051	1850	en	Property rental income	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5052	1851	en	Pension	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5053	1852	en	Other	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
3847	1154	he	בלחיצה על אישור כל פרטי הלוואה זו ימחקו	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3848	1155	he	מחק	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3849	1156	he	שנים	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3850	1157	he	שנים	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3851	1215	he	תוצאות מחזור אשראי	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3852	1216	he	התוצאות המפורטות לעיל הן הערכה בלבד למחזור אשראי קיים ואינן מהוות התחייבות. לקבלת הצעות מחייבות מהבנקים, נדרש להשלים את תהליך הרישום.	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3853	1217	he	סכום ההלוואה החדש	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3854	1218	he	תשלום חודשי חדש	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3855	1219	he	חיסכון חודשי	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3856	1220	he	חיסכון כולל	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3899	1278	he	פרטי הכנסה	f	approved	2025-07-26 08:09:47.359704	2025-07-29 05:57:36.306569	\N	\N	\N
3900	1284	he	שכיר	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3901	1285	he	עצמאי	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3902	1286	he	פנסיונר	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3903	1287	he	סטודנט	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3904	1288	he	חופשה ללא תשלום	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3905	1289	he	לא עובד	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3906	1290	he	אחר	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3907	1297	he	אין	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3908	1298	he	משכורת נוספת	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3909	1299	he	עבודה נוספת	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3910	1300	he	השכרת נכס	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
2694	1047	he	ישראל	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2695	1047	ru	Израиль	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2696	1048	en	United States	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2697	1048	he	ארצות הברית	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2698	1048	ru	США	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2699	1049	en	Russia	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2700	1049	he	רוסיה	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2701	1049	ru	Россия	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2702	1050	en	Germany	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2703	1050	he	גרמניה	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2704	1050	ru	Германия	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2705	1051	en	France	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2706	1051	he	צרפת	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2707	1051	ru	Франция	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2708	1052	en	United Kingdom	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2709	1052	he	בריטניה	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2710	1052	ru	Великобритания	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2711	1053	en	Canada	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2712	1053	he	קנדה	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2713	1053	ru	Канада	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2714	1054	en	Ukraine	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2715	1054	he	אוקראינה	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2716	1054	ru	Украина	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2717	1055	en	Other	t	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2718	1055	he	אחר	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
2719	1055	ru	Другое	f	approved	2025-07-24 14:52:11.709577	2025-07-24 14:52:11.709577	\N	\N	\N
1467	632	he	מוסדות פיננסיים שותפים	f	approved	2025-07-22 08:07:06.006194	2025-07-24 21:07:09.137076	\N	\N	\N
64	38	en	Personal details	t	approved	2025-07-20 08:30:35.292403	2025-07-24 22:42:35.490832	1	\N	\N
5054	1845	he	הכנסה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5055	1846	he	אין הכנסה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5056	1847	he	משכורת נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5057	1848	he	עבודה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5058	1849	he	הכנסה מהשקעות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5059	1850	he	הכנסה משכירות נכס	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5060	1851	he	פנסיה	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5061	1852	he	אחר	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5062	1845	ru	Дополнительный доход	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5063	1853	en	Financial Obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5064	1854	en	No obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5065	1855	en	Credit card debt	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5066	1856	en	Bank loan	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5067	1857	en	Consumer credit	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5068	1858	en	Other obligations	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5069	1853	he	התחייבויות כספיות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5070	1854	he	אין התחייבויות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5071	1855	he	חוב כרטיס אשראי	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5072	1856	he	הלוואה בנקאית	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5073	1857	he	אשראי צרכני	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5074	1858	he	התחייבויות אחרות	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5075	1853	ru	Финансовые обязательства	f	approved	2025-07-31 23:01:48.304569	2025-07-31 23:01:48.304569	\N	\N	\N
5160	1900	en	Add Place to Work	t	approved	2025-08-02 12:15:35.926133	2025-08-02 12:15:35.926133	1	\N	\N
5161	1900	he	הוסף מקום עבודה	f	approved	2025-08-02 12:15:35.926133	2025-08-02 12:15:35.926133	1	\N	\N
5162	1900	ru	Добавить место работы	f	approved	2025-08-02 12:15:35.926133	2025-08-02 12:15:35.926133	1	\N	\N
5163	1901	en	Add Additional Source of Income	t	approved	2025-08-02 12:15:41.397146	2025-08-02 12:15:41.397146	1	\N	\N
5164	1901	he	הוסף מקור הכנסה נוסף	f	approved	2025-08-02 12:15:41.397146	2025-08-02 12:15:41.397146	1	\N	\N
5165	1901	ru	Добавить дополнительный источник дохода	f	approved	2025-08-02 12:15:41.397146	2025-08-02 12:15:41.397146	1	\N	\N
5166	1902	en	Add Obligation	t	approved	2025-08-02 12:15:48.303598	2025-08-02 12:15:48.303598	1	\N	\N
5167	1902	he	הוסף התחייבות	f	approved	2025-08-02 12:15:48.303598	2025-08-02 12:15:48.303598	1	\N	\N
5168	1902	ru	Добавить обязательство	f	approved	2025-08-02 12:15:48.303598	2025-08-02 12:15:48.303598	1	\N	\N
5218	1919	he	בנק מסד	f	approved	2025-08-02 13:33:54.519091	2025-08-02 13:33:54.519091	1	\N	\N
5219	1919	ru	Банк Масад	f	approved	2025-08-02 13:33:54.519091	2025-08-02 13:33:54.519091	1	\N	\N
5235	1925	en	Main source of income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5236	1926	en	Select your main source of income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5237	1927	en	Employee	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5238	1928	en	Self-employed	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5239	1929	en	Business owner	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5240	1930	en	Pension	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5241	1931	en	Student	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5242	1932	en	Unemployed	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5243	1933	en	Other	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5244	1934	en	Additional income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5245	1935	en	Do you have additional income?	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5246	1936	en	No additional income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5247	1937	en	Additional salary	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5248	1938	en	Freelance work	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5249	1939	en	Investment income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
3911	1301	he	השקעות	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
5169	1903	en	Obligation	t	approved	2025-08-02 12:16:11.642803	2025-08-02 12:16:11.642803	1	\N	\N
3980	1221	en	Personal Details	f	approved	2025-07-26 08:09:45.254772	2025-07-29 05:57:14.908692	\N	\N	\N
3981	1222	en	Full name	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3982	1223	en	Enter full name	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3964	1148	en	List of existing credits	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3966	1150	en	Credit Refinancing	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3967	1151	en	Select property status	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3968	1152	en	Select date	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3969	1153	en	Delete loan details?	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3970	1154	en	By clicking confirm, all details of this loan will be deleted	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3971	1155	en	Delete	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3972	1156	en	years	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3973	1157	en	years	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3974	1215	en	Credit Refinancing Results	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3975	1216	en	The results above are estimates only for refinancing existing credit and do not constitute a commitment. To receive binding offers from banks, you must complete the registration process.	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3976	1217	en	New loan amount	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3977	1218	en	New monthly payment	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3978	1219	en	Monthly savings	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3979	1220	en	Total savings	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
4022	1278	en	Income Details	f	approved	2025-07-26 08:09:47.359704	2025-07-29 05:57:36.306569	\N	\N	\N
4023	1284	en	Employee	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4024	1285	en	Self-employed	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4025	1286	en	Pensioner	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4026	1287	en	Student	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4027	1288	en	Unpaid leave	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4028	1289	en	Unemployed	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4029	1290	en	Other	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
4030	1297	en	None	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4031	1298	en	Additional Salary	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4032	1299	en	Additional Work	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4033	1300	en	Property Rental	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4034	1301	en	Investments	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4035	1302	en	Pension	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4036	1303	en	Other	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
4037	1314	en	No obligations	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
4038	1315	en	Bank loan	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
4039	1316	en	Consumer credit	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
4040	1317	en	Credit card debt	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
4041	1318	en	Other	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3965	1149	en	Add credit	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
4094	1463	en	Commercial Property	t	approved	2025-07-29 10:51:09.445201	2025-07-29 10:58:41.815385	\N	\N	\N
4095	1464	en	Land	t	approved	2025-07-29 10:51:09.445201	2025-07-29 10:58:42.366549	\N	\N	\N
4183	1495	en	No high school diploma	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4184	1495	he	ללא תעודת בגרות	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4185	1495	ru	Без аттестата о среднем образовании	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4186	1496	en	Partial high school diploma	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4187	1496	he	תעודת בגרות חלקית	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4188	1496	ru	Частичный аттестат о среднем образовании	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4189	1497	en	Full high school diploma	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4190	1497	he	תעודת בגרות מלאה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4191	1497	ru	Полный аттестат о среднем образовании	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4192	1498	en	Post-secondary education	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4193	1498	he	השכלה על-תיכונית	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4194	1498	ru	Послесреднее образование	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4195	1499	en	Bachelor's degree	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4196	1499	he	תואר ראשון	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4197	1499	ru	Высшее образование (бакалавриат)	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4198	1500	en	Master's degree	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4199	1500	he	תואר שני	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4200	1500	ru	Высшее образование (магистратура)	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4201	1501	en	Doctoral degree	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4202	1501	he	תואר שלישי	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4203	1501	ru	Высшее образование (докторантура)	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4204	1503	en	Select marital status	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4205	1503	he	בחר מצב משפחתי	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4206	1503	ru	Выберите семейное положение	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4207	1504	en	Single	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4208	1504	he	רווק/רווקה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
78	79	ru	Рассчитать ипотеку 	f	approved	2025-07-20 08:50:47.502796	2025-07-28 07:44:36.170824	1	\N	\N
1456	626	ru	О нас	f	approved	2025-07-22 08:07:06.006194	2025-08-01 06:02:01.349222	\N	\N	\N
4209	1504	ru	Холост/не замужем	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4210	1505	en	Married	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4211	1505	he	נשוי/נשואה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4212	1505	ru	Женат/замужем	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4213	1506	en	Divorced	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4214	1506	he	גרוש/גרושה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4215	1506	ru	Разведен/разведена	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4216	1507	en	Widowed	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4217	1507	he	אלמן/אלמנה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4218	1507	ru	Вдовец/вдова	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4219	1508	en	Common-law partner	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4220	1508	he	ידוע/ידועה בציבור	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4221	1508	ru	Гражданский брак	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4222	1509	en	Other	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4223	1509	he	אחר	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4224	1509	ru	Другое	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4225	1492	en	Select citizenship	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4226	1492	he	בחר אזרחות	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4227	1492	ru	Выберите гражданство	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4228	1491	en	Do you have additional citizenship?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4231	1518	en	Are you considered a foreign resident according to income tax law?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4232	1518	he	 האם אתם נחשבים לתושבי חוץ על פי חוק מס הכנסה?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4233	1518	ru	Считаетесь ли вы иностранным резидентом согласно закону подоходного налога?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4234	1511	en	Are you insured with valid health insurance and covered by medical insurance rights?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4235	1511	he	האם אתם מבוטחים בביטוח בריאות תקף וחלים עליכם זכויות ביטוח רפואי?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4236	1511	ru	Имеете ли вы действующее медицинское страхование и распространяются ли на вас права медицинского страхования?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4237	1512	en	Do you hold a senior public position or are you among close family/business partners of a public position holder?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4238	1512	he	האם אתם מכהנים בתפקיד ציבורי בכיר או נמנים עם קרובי המשפחה/השותפים העסקיים של נושא תפקיד ציבורי?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4239	1512	ru	Занимаете ли вы высокую государственную должность или являетесь родственником/деловым партнером лица, занимающего государственную должность?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4240	1510	en	Are you liable to pay tax in foreign countries or additional jurisdictions?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4241	1510	he	האם אתם חייבים במס במדינות זרות או בתחומי שיפוט נוספים??	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4242	1510	ru	Обязаны ли вы платить налоги в зарубежных странах или других юрисдикциях?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4243	1513	en	Will the partner participate in mortgage payments?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4244	1513	he	האם השותף ישתתף בתשלומי המשכנתא?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4245	1513	ru	Будет ли партнер участвовать в платежах по ипотеке?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4246	1517	en	How many mortgage borrowers will there be in total, including you?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4247	1517	he	 כמה חייבים במשכנתא יהיו בסך הכול, כולל אתכם?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4248	1517	ru	Сколько всего заемщиков будет по ипотеке, включая вас?	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4249	1489	en	Children under 18	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4250	1489	he	ילדים מתחת לגיל 18	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4251	1489	ru	Дети до 18 лет	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4252	1490	en	Number of children under 18	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4253	1490	he	כמות ילדים מתחת לגיל 18	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4254	1490	ru	Количество детей до 18 лет	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4255	1515	en	Full name	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4256	1515	he	שם מלא	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4257	1515	ru	Полное имя	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4258	1488	en	Date of birth	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4259	1488	he	תאריך לידה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
1442	626	en	About	f	approved	2025-07-22 08:07:06.006194	2025-08-01 06:02:02.321838	\N	\N	\N
5170	1903	he	התחייבות	f	approved	2025-08-02 12:16:11.642803	2025-08-02 12:16:11.642803	1	\N	\N
5171	1903	ru	Обязательство	f	approved	2025-08-02 12:16:11.642803	2025-08-02 12:16:11.642803	1	\N	\N
4229	1491	he	האם יש לך אזרחות נוספת?	f	approved	2025-07-29 21:47:57.020657	2025-08-02 13:50:18.296538	1	\N	\N
3842	1149	he	הוסף אשראי1	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
4093	1462	he	בית פרטי	t	approved	2025-07-29 10:51:09.445201	2025-07-29 10:58:41.418642	\N	\N	\N
4260	1488	ru	Дата рождения	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4261	1493	en	Education	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4262	1493	he	 השכלה	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4263	1493	ru	Образование	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4264	1502	en	Marital status	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4265	1502	he	מצב משפחתי	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4266	1502	ru	Семейное положение	f	approved	2025-07-29 21:47:57.020657	2025-07-29 21:47:57.020657	1	\N	\N
4308	1557	en	Select Bank from List	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4309	1558	en	Current Bank	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4310	1559	en	Remaining Mortgage Balance	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4311	1560	en	Current Property Value	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4312	1561	en	Step 1 - Existing mortgage details	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4313	1562	en	Current Interest Type	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4314	1563	en	Select Interest Type	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4315	1564	en	Current Interest Type	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4316	1565	en	Is the Mortgage Registered?	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4317	1566	en	Yes, Registered in Land Registry	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4318	1567	en	No, Not Registered	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4319	1568	en	Select Registration Status	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4320	1569	en	Is the Mortgage Registered?	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4321	1570	en	Purpose of Mortgage Refinance	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4322	1571	en	Lower Interest Rate	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4323	1572	en	Reduce Monthly Payment	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4324	1573	en	Shorten Mortgage Term	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4325	1574	en	Cash Out Refinance	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4326	1575	en	Consolidate Debts	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4327	1576	en	Select Refinance Purpose	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4328	1577	en	Purpose of Mortgage Refinance	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4329	1578	en	Step 2 - Personal details	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4330	1579	en	Step 3 - Income details	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4331	1580	en	Step 4 - Application summary	f	approved	2025-07-30 06:18:36.09823	2025-07-30 06:18:36.09823	\N	\N	\N
4355	1575	he	איחוד חובות	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4356	1576	he	בחר מטרת מחזור	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4357	1577	he	מטרת מחזור המשכנתא	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4358	1578	he	שלב 2 - פרטים אישיים	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4359	1579	he	שלב 3 - פרטי הכנסה	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4360	1580	he	שלב 4 - סיכום הבקשה	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4361	1552	ru	Банк текущей ипотеки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4362	1553	ru	Банк Апоалим	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4363	1554	ru	Банк Леуми	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4364	1555	ru	Банк Дисконт	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4365	1556	ru	Банк Масад	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4366	1557	ru	Выберите банк из списка	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4367	1558	ru	Банк текущей ипотеки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4368	1559	ru	Остаток по ипотеке	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4369	1560	ru	Текущая стоимость недвижимости	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4370	1561	ru	Шаг 1 - Данные существующей ипотеки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4371	1562	ru	Тип недвижимости	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4372	1563	ru	Выберите тип недвижимости	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4373	1564	ru	Тип недвижимости	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4374	1565	ru	Зарегистрирована ли ипотека в земельном реестре?	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4375	1566	ru	Да, зарегистрирована в реестре	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4376	1567	ru	Нет, не зарегистрирована	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4377	1568	ru	Выберите вариант регистрации	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4378	1569	ru	Зарегистрирована ли ипотека в земельном реестре?	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4379	1570	ru	Цель рефинансирования ипотеки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4380	1571	ru	Снижение процентной ставки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4381	1572	ru	Снижение ежемесячного платежа	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4382	1573	ru	Сокращение срока ипотеки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4383	1574	ru	Получение дополнительных наличных	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4384	1575	ru	Консолидация долгов	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4385	1576	ru	Выберите цель рефинансирования	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4386	1577	ru	Цель рефинансирования ипотеки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4387	1578	ru	Шаг 2 - Личные данные	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4390	1531	en	Current Bank	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4391	1532	en	Refinance Reason	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4283	1524	he	המשך	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
3696	744	ru	Личные данные	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:14.908692	\N	\N	\N
3734	1221	ru	Личные данные	f	approved	2025-07-26 08:09:45.254772	2025-07-29 05:57:14.908692	\N	\N	\N
3735	1222	ru	Полное имя	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3736	1223	ru	Введите полное имя	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3737	1224	ru	Дата рождения	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3738	1225	ru	Выберите дату	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3739	1226	ru	Уровень образования	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3740	1227	ru	Выберите уровень образования	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3741	1228	ru	Дополнительные гражданства	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3742	1229	ru	Выберите гражданства	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3743	1230	ru	Выберите страны	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3744	1231	ru	Платите ли вы налоги за границей?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3745	1232	ru	Страны, где вы платите налоги	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3746	1233	ru	Выберите страны	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3747	1234	ru	Есть ли у вас дети?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3748	1235	ru	Количество детей	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3749	1236	ru	Есть ли у вас медицинская страховка?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3750	1237	ru	Вы иностранный резидент?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3751	1238	ru	Вы публичная личность?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3752	1239	ru	Есть ли другие заемщики?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3753	1240	ru	Семейное положение	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3754	1241	ru	Выберите семейное положение	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3755	1242	ru	Будет ли ваш партнер участвовать в выплатах по кредиту?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3756	1243	ru	Добавить партнера как заемщика?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3757	1244	ru	Выберите опцию	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3758	1245	ru	Да	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3759	1246	ru	Нет	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3760	1247	ru	Без аттестата о среднем образовании	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3761	1248	ru	Неполное среднее образование	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3762	1249	ru	Полное среднее образование	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3763	1250	ru	Среднее специальное образование	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3764	1251	ru	Степень бакалавра	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3765	1252	ru	Степень магистра	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3766	1253	ru	Докторская степень	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3767	1254	ru	Холост/Не замужем	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3768	1255	ru	Женат/Замужем	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3769	1256	ru	Разведен/а	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3770	1257	ru	Вдовец/Вдова	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3771	1258	ru	Гражданский брак	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3772	1259	ru	Другое	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3773	1269	ru	Как основной заемщик	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
3774	1270	ru	Как второстепенный заемщик	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
3775	1271	ru	Нет	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
3819	744	he	פרטים אישיים	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:14.908692	\N	\N	\N
3857	1221	he	פרטים אישיים	f	approved	2025-07-26 08:09:45.254772	2025-07-29 05:57:14.908692	\N	\N	\N
3858	1222	he	שם מלא	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3859	1223	he	הזן שם מלא	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3860	1224	he	תאריך לידה	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3861	1225	he	בחר תאריך	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3862	1226	he	רמת השכלה	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3863	1227	he	בחר רמת השכלה	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3864	1228	he	אזרחויות נוספות	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3865	1229	he	בחר אזרחויות	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3866	1230	he	בחר מדינות	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3867	1231	he	האם אתה משלם מסים בחו"ל?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3868	1232	he	מדינות בהן אתה משלם מסים	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3869	1233	he	בחר מדינות	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3870	1234	he	האם יש לך ילדים?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3871	1235	he	מספר ילדים	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3872	1236	he	האם יש לך ביטוח רפואי?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3873	1237	he	האם אתה תושב חוץ?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3874	1238	he	האם אתה איש ציבור?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3875	1239	he	האם יש לווים נוספים?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3876	1240	he	מצב משפחתי	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3877	1241	he	בחר מצב משפחתי	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3878	1242	he	האם בן/בת הזוג ישתתף בהחזרי ההלוואה?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3879	1243	he	להוסיף את בן/בת הזוג כלווה?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3880	1244	he	בחר אפשרות	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3881	1245	he	כן	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3882	1246	he	לא	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3883	1247	he	ללא תעודת בגרות	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3884	1248	he	תעודת בגרות חלקית	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3885	1249	he	תעודת בגרות מלאה	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3886	1250	he	השכלה על-תיכונית	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3887	1251	he	תואר ראשון	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3888	1252	he	תואר שני	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3889	1253	he	תואר שלישי	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
3890	1254	he	רווק/ה	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3891	1255	he	נשוי/אה	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3892	1256	he	גרוש/ה	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3893	1257	he	אלמן/ה	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3894	1258	he	ידוע/ה בציבור	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3895	1259	he	אחר	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
3896	1269	he	כלווה ראשי	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
3897	1270	he	כלווה משני	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
3898	1271	he	לא	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
3942	744	en	Personal details	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:14.908692	\N	\N	\N
3983	1224	en	Date of birth	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3984	1225	en	Select date	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3985	1226	en	Education level	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3986	1227	en	Select education level	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3987	1228	en	Additional citizenships	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3988	1229	en	Select citizenships	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3989	1230	en	Select countries	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3990	1231	en	Do you pay taxes abroad?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3991	1232	en	Countries where you pay taxes	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3992	1233	en	Select countries	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3993	1234	en	Do you have children?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3994	1235	en	Number of children	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3995	1236	en	Do you have medical insurance?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3996	1237	en	Are you a foreign resident?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3997	1238	en	Are you a public figure?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3998	1239	en	Are there other borrowers?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
3999	1240	en	Marital status	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4000	1241	en	Select marital status	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4001	1242	en	Will your partner participate in loan payments?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4002	1243	en	Add partner as borrower?	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4003	1244	en	Select option	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4004	1245	en	Yes	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4005	1246	en	No	f	approved	2025-07-26 08:09:45.433233	2025-07-29 05:57:14.908692	\N	\N	\N
4006	1247	en	No high school diploma	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4007	1248	en	Partial high school diploma	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4008	1249	en	Full high school diploma	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4009	1250	en	Post-secondary education	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4010	1251	en	Bachelor's degree	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4011	1252	en	Master's degree	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4012	1253	en	Doctoral degree	f	approved	2025-07-26 08:09:45.518535	2025-07-29 05:57:14.908692	\N	\N	\N
4013	1254	en	Single	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
4014	1255	en	Married	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
4015	1256	en	Divorced	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
4016	1257	en	Widowed	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
4017	1258	en	Common-law partner	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
4018	1259	en	Other	f	approved	2025-07-26 08:09:45.604887	2025-07-29 05:57:14.908692	\N	\N	\N
4019	1269	en	As primary borrower	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
4020	1270	en	As secondary borrower	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
4021	1271	en	No	f	approved	2025-07-26 08:09:45.776923	2025-07-29 05:57:14.908692	\N	\N	\N
4097	1461	en	Apartment	f	approved	2025-07-29 10:58:40.696109	2025-07-29 10:58:40.696109	\N	\N	\N
4098	1461	ru	Квартира	f	approved	2025-07-29 10:58:41.021284	2025-07-29 10:58:41.021284	\N	\N	\N
4099	1462	en	Private House	f	approved	2025-07-29 10:58:41.259691	2025-07-29 10:58:41.259691	\N	\N	\N
4100	1462	ru	Частный дом	f	approved	2025-07-29 10:58:41.579667	2025-07-29 10:58:41.579667	\N	\N	\N
4101	1463	he	נכס מסחרי	f	approved	2025-07-29 10:58:41.981232	2025-07-29 10:58:41.981232	\N	\N	\N
4102	1463	ru	Коммерческая недвижимость	f	approved	2025-07-29 10:58:42.135019	2025-07-29 10:58:42.135019	\N	\N	\N
4103	1464	he	מגרש	f	approved	2025-07-29 10:58:42.523366	2025-07-29 10:58:42.523366	\N	\N	\N
4104	1464	ru	Земельный участок	f	approved	2025-07-29 10:58:42.690864	2025-07-29 10:58:42.690864	\N	\N	\N
568	309	en	Other	t	approved	2025-07-20 14:43:23.506324	2025-07-29 10:58:43.059269	1	\N	\N
5076	1859	en	Do you have additional income?	f	approved	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
5077	1859	he	האם קיימות הכנסות נוספות?	f	approved	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
5078	1859	ru	Есть ли дополнительные доходы?	f	approved	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
5079	1860	en	Select additional income type	f	approved	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
5080	1860	he	בחר סוג הכנסה נוספת	f	approved	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
5081	1860	ru	Выберите тип дополнительного дохода	f	approved	2025-08-01 06:20:32.276542	2025-08-01 06:20:32.276542	\N	\N	\N
4274	1521	he	נתוני הכנסה	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4277	1522	he	בחירת תוכנית	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4271	1520	he	בנק המשכנתא הנוכחית	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
3673	720	ru	Рефинансирование кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3674	721	ru	Мы найдем и представим вам наиболее выгодные предложения, существующие на финансовом рынке	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3675	722	ru	Цель рефинансирования кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3676	723	ru	Выберите цель	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3678	725	ru	Уменьшить сумму кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3680	727	ru	Увеличить платеж, чтобы уменьшить срок	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3681	728	ru	Существующие кредитные обязательства	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3682	729	ru	Банк-кредитор	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3683	730	ru	Выберите статус недвижимости	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3684	731	ru	Сумма кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3685	732	ru	Ежемесячный платеж	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3686	733	ru	Дата начала кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3687	734	ru	Дата окончания кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3688	735	ru	Выберите дату	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3689	736	ru	Сумма досрочного погашения	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3690	737	ru	Желаемый ежемесячный платеж	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3691	738	ru	Желаемый срок кредита	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3692	739	ru	Добавить кредит	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3693	741	ru	Удалить данные займа?	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3694	742	ru	Нажав подтвердить, все данные этого займа будут удалены	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3695	743	ru	Калькулятор	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3697	745	ru	Доходы	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3698	746	ru	Программы	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
5082	1877	en	Field of Activity	f	approved	2025-08-01 06:47:33.737283	2025-08-01 06:47:33.737283	\N	\N	\N
5083	1877	he	תחום פעילות	f	approved	2025-08-01 06:47:33.996953	2025-08-01 06:47:33.996953	\N	\N	\N
5084	1877	ru	Сфера деятельности	f	approved	2025-08-01 06:47:34.207178	2025-08-01 06:47:34.207178	\N	\N	\N
5085	1876	en	Select field of activity	f	approved	2025-08-01 06:47:34.367395	2025-08-01 06:47:34.367395	\N	\N	\N
3703	1133	ru	Банк Апоалим	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3704	1134	ru	Банк Леуми	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3705	1135	ru	Дисконт Банк	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3706	1136	ru	Банк Масад	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3707	1137	ru	Банк Израиля	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3708	1138	ru	Цель рефинансирования кредита	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3709	1139	ru	Выберите цель	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3710	1140	ru	Банк	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3711	1141	ru	Сумма кредита	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3712	1142	ru	Ежемесячный платеж	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3713	1143	ru	Дата начала	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3714	1144	ru	Дата окончания	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3715	1145	ru	Сумма досрочного погашения	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3716	1146	ru	Желаемый ежемесячный платеж	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3717	1147	ru	Желаемый срок кредита	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3721	1151	ru	Выберите статус недвижимости	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3722	1152	ru	Выберите дату	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3723	1153	ru	Удалить данные кредита?	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3724	1154	ru	При нажатии на подтверждение все данные этого кредита будут удалены	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3725	1155	ru	Удалить	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3726	1156	ru	лет	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3727	1157	ru	лет	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3728	1215	ru	Результаты рефинансирования кредита	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3719	1149	ru	Добавить кредит	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3729	1216	ru	Приведенные выше результаты являются только оценкой рефинансирования существующего кредита и не являются обязательством. Для получения обязывающих предложений от банков необходимо завершить процесс регистрации.	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3731	1218	ru	Новый ежемесячный платеж	f	approved	2025-07-26 08:07:58.402071	2025-07-29 05:57:36.306569	\N	\N	\N
3778	1285	ru	Самозанятый	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3779	1286	ru	Пенсионер	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3780	1287	ru	Студент	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3781	1288	ru	Неоплачиваемый отпуск	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3782	1289	ru	Безработный	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3783	1290	ru	Другое	f	approved	2025-07-26 08:09:47.947037	2025-07-29 05:57:36.306569	\N	\N	\N
3784	1297	ru	Нет	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3785	1298	ru	Дополнительная зарплата	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3786	1299	ru	Дополнительная работа	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
5086	1876	he	בחר תחום פעילות	f	approved	2025-08-01 06:47:34.519599	2025-08-01 06:47:34.519599	\N	\N	\N
3787	1300	ru	Аренда недвижимости	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3788	1301	ru	Инвестиции	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3789	1302	ru	Пенсия	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3790	1303	ru	Другое	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3791	1314	ru	Нет обязательств	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3792	1315	ru	Банковский кредит	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3793	1316	ru	Потребительский кредит	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3794	1317	ru	Долг по кредитной карте	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3795	1318	ru	Другое	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3796	720	he	מחזור אשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3797	721	he	נאתר ונציג בפניכם את ההצעות המשתלמות ביותר הקיימות בשוק הפיננסי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3798	722	he	מטרת מחזור האשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3799	723	he	בחר מטרה	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3800	724	he	שיפור הריבית	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3801	725	he	הפחתת סכום האשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3802	726	he	הגדלת התקופה כדי להפחית את התשלום	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3803	727	he	הגדלת התשלום כדי לקצר את התקופה	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3804	728	he	התחייבויות אשראי עומדות	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3805	729	he	בנק מלווה	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3806	730	he	בחר סטטוס הנכס	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3807	731	he	סכום האשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3808	732	he	תשלום חודשי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3809	733	he	תאריך תחילת האשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3810	734	he	תאריך סיום האשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3811	735	he	בחר תאריך	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3812	736	he	סכום פירעון מוקדם	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3813	737	he	תשלום חודשי רצוי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3814	738	he	תקופת חודשים רצויה	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3815	739	he	הוסף אשראי	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3816	741	he	למחוק פרטי הלוואה?	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3817	742	he	בלחיצה על אישור כל פרטי הלוואה זו ימחקו	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3818	743	he	מחשבון	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3820	745	he	הכנסות	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3821	746	he	תוכניות	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
5087	1876	ru	Выберите сферу деятельности	f	approved	2025-08-01 06:47:34.651733	2025-08-01 06:47:34.651733	\N	\N	\N
5088	1862	en	Agriculture, Forestry, Fishing	f	approved	2025-08-01 06:47:35.071848	2025-08-01 06:47:35.071848	\N	\N	\N
5089	1863	en	Technology and Communications	f	approved	2025-08-01 06:47:35.249218	2025-08-01 06:47:35.249218	\N	\N	\N
5090	1864	en	Healthcare and Social Services	f	approved	2025-08-01 06:47:35.558862	2025-08-01 06:47:35.558862	\N	\N	\N
3826	1133	he	בנק הפועלים	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3827	1134	he	בנק לאומי	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3828	1135	he	בנק דיסקונט	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3829	1136	he	בנק מסד	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3830	1137	he	בנק ישראל	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3831	1138	he	מטרת מחזור האשראי	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3832	1139	he	בחר מטרה	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3833	1140	he	בנק מלווה	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3834	1141	he	סכום אשראי	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3835	1142	he	תשלום חודשי	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3836	1143	he	תאריך התחלה	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3837	1144	he	תאריך סיום	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3838	1145	he	סכום לפירעון מוקדם	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3839	1146	he	תשלום חודשי רצוי	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3840	1147	he	תקופת הלוואה רצויה	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3841	1148	he	רשימת אשראים קיימים	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3844	1151	he	בחר סטטוס הנכס	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3845	1152	he	בחר תאריך	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3912	1302	he	פנסיה	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3913	1303	he	אחר	f	approved	2025-07-26 08:09:48.459482	2025-07-29 05:57:36.306569	\N	\N	\N
3914	1314	he	אין התחייבויות	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3915	1315	he	הלוואה בנקאית	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3916	1316	he	אשראי צרכני	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3917	1317	he	חוב כרטיס אשראי	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3918	1318	he	אחר	f	approved	2025-07-26 08:09:48.961735	2025-07-29 05:57:36.306569	\N	\N	\N
3919	720	en	Credit Refinance	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3920	721	en	We will select the best market offers for you	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3921	722	en	Goal of credit refinancing	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3922	723	en	Select goal	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3923	724	en	Improve interest rate	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3924	725	en	Reduce credit amount	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3925	726	en	Increase term to reduce payment	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3926	727	en	Increase payment to reduce term	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3927	728	en	Credit List	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3928	729	en	Which bank issued the credit?	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3929	730	en	Select property status	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3930	731	en	Full credit amount	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3931	732	en	Monthly payment	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3932	733	en	Credit start date	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3933	734	en	Credit end date	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3934	735	en	Select date	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3935	736	en	Early repayment amount	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3936	737	en	Desired monthly payment	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3937	738	en	Desired loan period	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3938	739	en	Add Credit	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3939	741	en	Delete loan details?	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3940	742	en	By clicking confirm, all details of this loan will be deleted	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3941	743	en	Calculator	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3943	745	en	Income	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
3944	746	en	Programs	f	approved	2025-07-22 19:49:55.392095	2025-07-29 05:57:36.306569	\N	\N	\N
5091	1865	en	Education and Training	f	approved	2025-08-01 06:47:35.678732	2025-08-01 06:47:35.678732	\N	\N	\N
5092	1866	en	Finance and Banking	f	approved	2025-08-01 06:47:35.946484	2025-08-01 06:47:35.946484	\N	\N	\N
5093	1867	en	Real Estate	f	approved	2025-08-01 06:47:36.05386	2025-08-01 06:47:36.05386	\N	\N	\N
5094	1868	en	Construction	f	approved	2025-08-01 06:47:36.248747	2025-08-01 06:47:36.248747	\N	\N	\N
3949	1133	en	Bank Hapoalim	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3950	1134	en	Bank Leumi	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3951	1135	en	Discount Bank	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3952	1136	en	Massad Bank	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3953	1137	en	Bank of Israel	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3954	1138	en	Goal of credit refinancing	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3955	1139	en	Select goal	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3956	1140	en	Bank	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3957	1141	en	Credit amount	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3958	1142	en	Monthly payment	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3959	1143	en	Start date	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3960	1144	en	End date	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3961	1145	en	Early repayment amount	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3962	1146	en	Desired monthly payment	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
3963	1147	en	Desired loan period	f	approved	2025-07-26 08:07:56.940543	2025-07-29 05:57:36.306569	\N	\N	\N
4105	1465	en	City	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4108	1466	en	When do you need the mortgage?	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4109	1466	he	מתי תזדקק למשכנתא?	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4110	1466	ru	Когда вам нужна ипотека?	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4111	1467	en	Select timeframe	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4112	1467	he	בחר מסגרת זמן	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4113	1467	ru	Выберите период	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4114	1468	en	Within 3 months	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4115	1468	he	תוך 3 חודשים	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4116	1468	ru	До 3 месяцев	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4117	1469	en	Within 3-6 months	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4118	1469	he	תוך 3-6 חודשים	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4119	1469	ru	3-6 месяцев	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4120	1470	en	Within 6-12 months	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4121	1470	he	תוך 6-12 חודשים	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4122	1470	ru	6-12 месяцев	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4123	1471	en	Over 12 months	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4124	1471	he	מעל 12 חודשים	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4125	1471	ru	Более 12 месяцев	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4126	1472	en	Mortgage type	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4127	1472	he	סוג משכנתא	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4128	1472	ru	Тип ипотеки	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4129	1473	en	Select mortgage type	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4130	1473	he	בחר סוג משכנתא	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4131	1473	ru	Выберите тип ипотеки	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
5095	1869	en	Retail and Trade	f	approved	2025-08-01 06:47:36.503662	2025-08-01 06:47:36.503662	\N	\N	\N
5096	1870	en	Manufacturing and Industry	f	approved	2025-08-01 06:47:36.793864	2025-08-01 06:47:36.793864	\N	\N	\N
4106	1465	he	עיר בא נמצא הנכס?	f	approved	2025-07-29 21:29:29.162912	2025-08-16 22:32:11.032776	1	\N	\N
3372	1327	en	Borrower's Income	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3373	1327	he	הכנסת הלווה	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3374	1327	ru	Доход заемщика	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3375	1328	en	Source of Income	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3376	1328	he	מקור הכנסה	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3377	1328	ru	Источник дохода	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3378	1329	en	Personal Data of Borrower	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3379	1329	he	פרטים אישיים של הלווה	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3380	1329	ru	Личные данные заемщика	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3381	1330	en	What is your relationship to the borrowers?	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3382	1330	he	מה הקשר שלך ללווים?	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3383	1330	ru	Какая у вас связь с заемщиками?	f	approved	2025-07-26 14:49:11.790859	2025-07-26 14:49:11.790859	\N	\N	\N
3384	1332	en	Education	f	approved	2025-07-26 14:56:17.93122	2025-07-26 14:56:17.93122	\N	\N	\N
3385	1332	he	השכלה	f	approved	2025-07-26 14:56:17.93122	2025-07-26 14:56:17.93122	\N	\N	\N
3386	1332	ru	Образование	f	approved	2025-07-26 14:56:17.93122	2025-07-26 14:56:17.93122	\N	\N	\N
3387	1333	en	Select education level	f	approved	2025-07-26 14:56:17.93122	2025-07-26 14:56:17.93122	\N	\N	\N
3388	1333	he	בחר רמת השכלה	f	approved	2025-07-26 14:56:17.93122	2025-07-26 14:56:17.93122	\N	\N	\N
3389	1333	ru	Выберите уровень образования	f	approved	2025-07-26 14:56:17.93122	2025-07-26 14:56:17.93122	\N	\N	\N
5097	1871	en	Government and Public Service	f	approved	2025-08-01 06:47:36.921238	2025-08-01 06:47:36.921238	\N	\N	\N
5098	1872	en	Transport and Logistics	f	approved	2025-08-01 06:47:37.203852	2025-08-01 06:47:37.203852	\N	\N	\N
5099	1873	en	Consulting and Professional Services	f	approved	2025-08-01 06:47:37.406287	2025-08-01 06:47:37.406287	\N	\N	\N
5100	1874	en	Entertainment and Media	f	approved	2025-08-01 06:47:37.571459	2025-08-01 06:47:37.571459	\N	\N	\N
5101	1875	en	Other	f	approved	2025-08-01 06:47:37.788972	2025-08-01 06:47:37.788972	\N	\N	\N
5102	1862	he	חקלאות, יערנות ודיג	f	approved	2025-08-01 06:47:37.948834	2025-08-01 06:47:37.948834	\N	\N	\N
5103	1863	he	טכנולוגיה ותקשורת	f	approved	2025-08-01 06:47:38.093725	2025-08-01 06:47:38.093725	\N	\N	\N
5104	1864	he	בריאות ושירותים חברתיים	f	approved	2025-08-01 06:47:38.346353	2025-08-01 06:47:38.346353	\N	\N	\N
5105	1865	he	חינוך והכשרה	f	approved	2025-08-01 06:47:38.533786	2025-08-01 06:47:38.533786	\N	\N	\N
5106	1866	he	פיננסים ובנקאות	f	approved	2025-08-01 06:47:38.73902	2025-08-01 06:47:38.73902	\N	\N	\N
5107	1867	he	נדל"ן	f	approved	2025-08-01 06:47:38.938783	2025-08-01 06:47:38.938783	\N	\N	\N
5108	1868	he	בנייה	f	approved	2025-08-01 06:47:39.239109	2025-08-01 06:47:39.239109	\N	\N	\N
5109	1869	he	מסחר קמעונאי	f	approved	2025-08-01 06:47:39.353744	2025-08-01 06:47:39.353744	\N	\N	\N
5110	1870	he	תעשייה וייצור	f	approved	2025-08-01 06:47:39.548793	2025-08-01 06:47:39.548793	\N	\N	\N
5111	1871	he	ממשלה ושירות ציבורי	f	approved	2025-08-01 06:47:39.731239	2025-08-01 06:47:39.731239	\N	\N	\N
5112	1872	he	תחבורה ולוגיסטיקה	f	approved	2025-08-01 06:47:39.881422	2025-08-01 06:47:39.881422	\N	\N	\N
5113	1873	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-01 06:47:40.041401	2025-08-01 06:47:40.041401	\N	\N	\N
5114	1874	he	בידור ומדיה	f	approved	2025-08-01 06:47:40.196253	2025-08-01 06:47:40.196253	\N	\N	\N
5115	1875	he	אחר	f	approved	2025-08-01 06:47:40.473946	2025-08-01 06:47:40.473946	\N	\N	\N
5116	1862	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-01 06:47:40.676125	2025-08-01 06:47:40.676125	\N	\N	\N
5117	1863	ru	Технологии и коммуникации	f	approved	2025-08-01 06:47:40.793884	2025-08-01 06:47:40.793884	\N	\N	\N
4042	1446	en	Gender	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4043	1447	en	Select gender	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4044	1448	en	Male	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4045	1449	en	Female	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4046	1450	en	Residential Address	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4047	1451	en	Enter full residential address	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4048	1452	en	Document Issue Date	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4049	1453	en	Select document issue date	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4050	1454	en	ID Document Number	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4051	1455	en	Enter ID document number	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4052	1456	en	Do you own real estate property?	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4053	1457	en	Select property ownership status	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4054	1458	en	Yes	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4055	1459	en	No	f	approved	2025-07-29 10:02:48.947268	2025-07-29 10:02:48.947268	\N	\N	\N
4056	1446	ru	Пол	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4057	1447	ru	Выберите пол	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4058	1448	ru	Мужской	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4059	1449	ru	Женский	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4060	1450	ru	Адрес проживания	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4061	1451	ru	Введите полный адрес проживания	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4062	1452	ru	Дата выдачи документа	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4063	1453	ru	Выберите дату выдачи документа	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4064	1454	ru	Номер документа	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4065	1455	ru	Введите номер документа	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4066	1456	ru	У вас есть недвижимость?	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4067	1457	ru	Выберите статус владения недвижимостью	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4068	1458	ru	Да	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4069	1459	ru	Нет	f	approved	2025-07-29 10:02:49.052277	2025-07-29 10:02:49.052277	\N	\N	\N
4070	1446	he	מגדר	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4071	1447	he	בחר מגדר	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4072	1448	he	זכר	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4073	1449	he	נקבה	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4074	1450	he	כתובת מגורים	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4075	1451	he	הזן כתובת מגורים מלאה	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4076	1452	he	תאריך הנפקת מסמך	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
3447	1355	en	Calculation	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3448	1355	he	חישוב	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3449	1355	ru	Расчет	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3450	1356	en	Personal Details	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3451	1356	he	פרטים אישיים	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3452	1356	ru	Личные данные	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3453	1357	en	Income & Employment	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3454	1357	he	הכנסה ותעסוקה	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3455	1357	ru	Доходы и занятость	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3456	1358	en	Results	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3457	1358	he	תוצאות	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3458	1358	ru	Результаты	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3459	1359	en	Mortgage Calculator Video	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3460	1359	he	וידאו מחשבון משכנתה	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3461	1359	ru	Видео калькулятора ипотеки	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3462	1360	en	Show Offers	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3463	1360	he	הצג הצעות	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3464	1360	ru	Показать предложения	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3465	1361	en	Personal Details	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3466	1361	he	פרטים אישיים	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3467	1361	ru	Личные данные	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3468	1362	en	Income & Employment Information	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3469	1362	he	מידע על הכנסה ותעסוקה	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3470	1362	ru	Информация о доходах и занятости	f	approved	2025-07-26 14:58:28.243008	2025-07-26 14:58:28.243008	\N	\N	\N
3471	1363	en	Source of Income	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3472	1363	he	מקור הכנסה	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3473	1363	ru	Источник дохода	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3474	1364	en	Add Workplace	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3475	1364	he	הוסף מקום עבודה	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3476	1364	ru	Добавить место работы	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3477	1365	en	Additional Source of Income	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3478	1365	he	מקור הכנסה נוסף	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3479	1365	ru	Дополнительный источник дохода	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3480	1366	en	Add Additional Income Source	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3481	1366	he	הוסף מקור הכנסה נוסף	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3482	1366	ru	Добавить дополнительный источник дохода	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3483	1367	en	Obligation	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3484	1367	he	התחייבות	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3485	1367	ru	Обязательство	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3486	1368	en	Add Obligation	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3487	1368	he	הוסף התחייבות	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3488	1368	ru	Добавить обязательство	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3489	1369	en	Borrower	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3490	1369	he	לווה	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3491	1369	ru	Заемщик	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3492	1370	en	Add Borrower	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3493	1370	he	הוסף לווה	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3494	1370	ru	Добавить заемщика	f	approved	2025-07-26 14:59:32.05034	2025-07-26 14:59:32.05034	\N	\N	\N
3495	1371	en	Please specify your relationship	f	approved	2025-07-26 15:00:18.027861	2025-07-26 15:00:18.027861	\N	\N	\N
3496	1371	he	אנא פרט את הקשר שלך	f	approved	2025-07-26 15:00:18.027861	2025-07-26 15:00:18.027861	\N	\N	\N
3497	1371	ru	Пожалуйста, укажите ваше отношение	f	approved	2025-07-26 15:00:18.027861	2025-07-26 15:00:18.027861	\N	\N	\N
3498	1372	en	Please select an answer	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3499	1372	he	אנא בחר תשובה	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3500	1372	ru	Пожалуйста, выберите ответ	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3501	1373	en	Please fill this field	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3502	1373	he	אנא מלא שדה זה	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3503	1373	ru	Пожалуйста, заполните это поле	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3504	1374	en	Please enter a valid date	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3505	1374	he	אנא הזן תאריך תקין	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3506	1374	ru	Пожалуйста, введите корректную дату	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3507	1375	en	Please enter your name and surname	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3508	1375	he	אנא הזן שם ושם משפחה	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3509	1375	ru	Пожалуйста, введите имя и фамилию	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3510	1376	en	Please select field of activity	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3511	1376	he	אנא בחר תחום פעילות	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3512	1376	ru	Пожалуйста, выберите сферу деятельности	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3513	1377	en	Please select one of the options	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3514	1377	he	אנא בחר אחת מהאפשרויות	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3515	1377	ru	Пожалуйста, выберите один из вариантов	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3516	1378	en	Please select a bank	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3517	1378	he	אנא בחר בנק	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3518	1378	ru	Пожалуйста, выберите банк	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3519	1379	en	Maximum property value is 10,000,000 NIS	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3520	1379	he	ערך הנכס המקסימלי הוא 10,000,000 ש"ח	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3521	1379	ru	Максимальная стоимость недвижимости 10,000,000 шекелей	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3522	1380	en	Property value is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3523	1380	he	ערך הנכס נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3524	1380	ru	Стоимость недвижимости обязательна	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3525	1381	en	City is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3526	1381	he	עיר נדרשת	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3527	1381	ru	Город обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3528	1382	en	Please specify when you need the mortgage	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3529	1382	he	אנא ציין מתי אתה צריך את המשכנתה	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3530	1382	ru	Пожалуйста, укажите, когда вам нужна ипотека	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3531	1383	en	Initial payment cannot exceed 75% of property value	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3532	1383	he	תשלום ראשוני לא יכול לעלות על 75% מערך הנכס	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3533	1383	ru	Первоначальный взнос не может превышать 75% стоимости недвижимости	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3534	1384	en	Initial payment is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3535	1384	he	תשלום ראשוני נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3536	1384	ru	Первоначальный взнос обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3537	1385	en	Mortgage type is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3538	1385	he	סוג משכנתה נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3539	1385	ru	Тип ипотеки обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3540	1386	en	Please specify if this is your first home	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3541	1386	he	אנא ציין אם זה הבית הראשון שלך	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3542	1386	ru	Пожалуйста, укажите, является ли это вашим первым домом	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3543	1387	en	Property ownership status is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3544	1387	he	סטטוס בעלות על נכס נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3545	1387	ru	Статус владения недвижимостью обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3546	1388	en	Minimum period is 4 years	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3547	1388	he	תקופה מינימלית היא 4 שנים	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3548	1388	ru	Минимальный период 4 года	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3549	1389	en	Maximum period is 30 years	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3550	1389	he	תקופה מקסימלית היא 30 שנה	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3551	1389	ru	Максимальный период 30 лет	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3552	1390	en	Mortgage period is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3553	1390	he	תקופת המשכנתה נדרשת	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3554	1390	ru	Срок ипотеки обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3555	1391	en	Minimum monthly payment is 2,664 NIS	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3556	1391	he	תשלום חודשי מינימלי הוא 2,664 ש"ח	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3557	1391	ru	Минимальный ежемесячный платеж 2,664 шекеля	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3558	1392	en	Monthly payment is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3559	1392	he	תשלום חודשי נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3560	1392	ru	Ежемесячный платеж обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3561	1393	en	Education level is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3562	1393	he	רמת השכלה נדרשת	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3563	1393	ru	Уровень образования обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3564	1394	en	Citizenship is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3565	1394	he	אזרחות נדרשת	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3566	1394	ru	Гражданство обязательно	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3567	1395	en	Please select citizenship countries	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3568	1395	he	אנא בחר מדינות אזרחות	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3569	1395	ru	Пожалуйста, выберите страны гражданства	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3570	1396	en	Tax information is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3571	1396	he	מידע על מיסים נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3572	1396	ru	Информация о налогах обязательна	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3573	1397	en	Please select tax countries	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3574	1397	he	אנא בחר מדינות מס	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3575	1397	ru	Пожалуйста, выберите страны налогообложения	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3576	1398	en	Children information is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3577	1398	he	מידע על ילדים נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3578	1398	ru	Информация о детях обязательна	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3579	1399	en	Number of children is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3580	1399	he	מספר ילדים נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3581	1399	ru	Количество детей обязательно	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3582	1400	en	Medical insurance information is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3583	1400	he	מידע על ביטוח רפואי נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3584	1400	ru	Информация о медицинском страховании обязательна	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3585	1401	en	Foreign resident status is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3586	1401	he	סטטוס תושב חוץ נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3587	1401	ru	Статус иностранного резидента обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3588	1402	en	Public person status is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3589	1402	he	סטטוס איש ציבור נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3590	1402	ru	Статус публичного лица обязателен	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3591	1403	en	Please select number of borrowers	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3592	1403	he	אנא בחר מספר לווים	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3593	1403	ru	Пожалуйста, выберите количество заемщиков	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3594	1404	en	Family status is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3595	1404	he	מצב משפחתי נדרש	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3596	1404	ru	Семейное положение обязательно	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3597	1405	en	Partner mortgage participation is required	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3598	1405	he	השתתפות בן הזוג במשכנתה נדרשת	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3599	1405	ru	Участие партнера в ипотеке обязательно	f	approved	2025-07-26 15:28:33.522572	2025-07-26 15:28:33.522572	\N	\N	\N
3600	1406	en	Field of Activity	f	approved	2025-07-26 15:29:42.647525	2025-07-26 15:29:42.647525	\N	\N	\N
3601	1406	he	תחום פעילות	f	approved	2025-07-26 15:29:42.647525	2025-07-26 15:29:42.647525	\N	\N	\N
3602	1406	ru	Сфера деятельности	f	approved	2025-07-26 15:29:42.647525	2025-07-26 15:29:42.647525	\N	\N	\N
5118	1864	ru	Здравоохранение и социальные услуги	f	approved	2025-08-01 06:47:40.981259	2025-08-01 06:47:40.981259	\N	\N	\N
5119	1865	ru	Образование и обучение	f	approved	2025-08-01 06:47:41.286319	2025-08-01 06:47:41.286319	\N	\N	\N
5120	1866	ru	Финансы и банковское дело	f	approved	2025-08-01 06:47:41.471378	2025-08-01 06:47:41.471378	\N	\N	\N
5121	1867	ru	Недвижимость	f	approved	2025-08-01 06:47:41.626022	2025-08-01 06:47:41.626022	\N	\N	\N
5122	1868	ru	Строительство	f	approved	2025-08-01 06:47:41.883649	2025-08-01 06:47:41.883649	\N	\N	\N
5123	1869	ru	Розничная торговля	f	approved	2025-08-01 06:47:42.11886	2025-08-01 06:47:42.11886	\N	\N	\N
5124	1870	ru	Производство и промышленность	f	approved	2025-08-01 06:47:42.316221	2025-08-01 06:47:42.316221	\N	\N	\N
5125	1871	ru	Государственная служба	f	approved	2025-08-01 06:47:42.523849	2025-08-01 06:47:42.523849	\N	\N	\N
5126	1872	ru	Транспорт и логистика	f	approved	2025-08-01 06:47:42.92629	2025-08-01 06:47:42.92629	\N	\N	\N
5127	1873	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-01 06:47:43.161137	2025-08-01 06:47:43.161137	\N	\N	\N
5128	1874	ru	Развлечения и медиа	f	approved	2025-08-01 06:47:43.313848	2025-08-01 06:47:43.313848	\N	\N	\N
5129	1875	ru	Другое	f	approved	2025-08-01 06:47:43.514089	2025-08-01 06:47:43.514089	\N	\N	\N
3615	1411	en	Search	f	approved	2025-07-26 15:29:42.647525	2025-07-26 15:29:42.647525	\N	\N	\N
3616	1411	he	חיפוש	f	approved	2025-07-26 15:29:42.647525	2025-07-26 15:29:42.647525	\N	\N	\N
3617	1411	ru	Поиск	f	approved	2025-07-26 15:29:42.647525	2025-07-26 15:29:42.647525	\N	\N	\N
3618	1412	he	משכנתא בריבית פריים	f	approved	2025-07-27 05:49:14.091106	2025-07-27 05:49:14.091106	\N	\N	\N
3619	1413	he	משכנתא בריבית קבועה	f	approved	2025-07-27 05:49:14.091106	2025-07-27 05:49:14.091106	\N	\N	\N
3620	1414	he	משכנתא בריבית משתנה	f	approved	2025-07-27 05:49:14.091106	2025-07-27 05:49:14.091106	\N	\N	\N
3621	1415	he	רישום משכנתא	f	approved	2025-07-27 05:49:14.091106	2025-07-27 05:49:14.091106	\N	\N	\N
4077	1453	he	בחר תאריך הנפקת מסמך	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4078	1454	he	מספר מסמך זהות	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4079	1455	he	הזן מספר מסמך זהות	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4080	1456	he	האם יש לך נכסי נדל"ן?	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4081	1457	he	בחר סטטוס בעלות על נכסי נדל"ן	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4082	1458	he	כן	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
4083	1459	he	לא	f	approved	2025-07-29 10:02:49.137105	2025-07-29 10:02:49.137105	\N	\N	\N
5172	1904	en	Bank Obligations	t	approved	2025-08-02 13:25:50.015184	2025-08-02 13:25:50.015184	1	\N	\N
5173	1904	he	התחייבויות בנקאיות	f	approved	2025-08-02 13:25:50.015184	2025-08-02 13:25:50.015184	1	\N	\N
5174	1904	ru	Банковские обязательства	f	approved	2025-08-02 13:25:50.015184	2025-08-02 13:25:50.015184	1	\N	\N
5175	1905	en	Bank Hapoalim	t	approved	2025-08-02 13:25:58.878791	2025-08-02 13:25:58.878791	1	\N	\N
5176	1905	he	בנק הפועלים	f	approved	2025-08-02 13:25:58.878791	2025-08-02 13:25:58.878791	1	\N	\N
5177	1905	ru	Банк Апоалим	f	approved	2025-08-02 13:25:58.878791	2025-08-02 13:25:58.878791	1	\N	\N
5178	1906	en	Bank Leumi	t	approved	2025-08-02 13:26:06.746973	2025-08-02 13:26:06.746973	1	\N	\N
5179	1906	he	בנק לאומי	f	approved	2025-08-02 13:26:06.746973	2025-08-02 13:26:06.746973	1	\N	\N
5250	1940	en	Rental income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5251	1941	en	Pension benefits	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
4144	1478	en	Is this a first home?	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4145	1478	he	האם מדובר בדירה ראשונה?	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4146	1478	ru	Это ваша первая квартира?	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4147	1479	en	Select property status	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4148	1479	he	בחר סטטוס הנכס	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4149	1479	ru	Выберите статус недвижимости	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4150	1480	en	Yes, first home	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4151	1480	he	כן, דירה ראשונה	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4152	1480	ru	Да, первая квартира	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4153	1481	en	No, additional property	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4154	1481	he	לא, נכס נוסף	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4155	1481	ru	Нет, дополнительная недвижимость	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4156	1482	en	Investment property	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4157	1482	he	נכס ל השקעה	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
5252	1942	en	Other income	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5130	1878	en	Please specify why you want to refinance	t	approved	2025-08-02 11:24:27.705859	2025-08-02 11:24:27.705859	1	\N	\N
5131	1878	he	אנא ציין מדוע אתה רוצה למחזר משכנתא	f	approved	2025-08-02 11:24:27.705859	2025-08-02 11:24:27.705859	1	\N	\N
5132	1878	ru	Пожалуйста, укажите причину рефинансирования	f	approved	2025-08-02 11:24:27.705859	2025-08-02 11:24:27.705859	1	\N	\N
5180	1906	ru	Банк Леуми	f	approved	2025-08-02 13:26:06.746973	2025-08-02 13:26:06.746973	1	\N	\N
5181	1907	en	Bank Discount	t	approved	2025-08-02 13:26:16.50604	2025-08-02 13:26:16.50604	1	\N	\N
4158	1482	ru	Инвестиционная недвижимость	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4159	1483	en	Property Ownership Status	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4160	1483	he	סטטוס בעלות על נכס	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4161	1483	ru	Статус владения недвижимостью	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4162	1484	en	Select your property ownership status	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4163	1484	he	בחר את סטטוס הבעלות על הנכס שלך	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4164	1484	ru	Выберите статус владения недвижимостью	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4165	1485	en	I don't own any property	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4166	1485	he	אני לא בעלים של נכס	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4167	1485	ru	Я не владею недвижимостью	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4168	1486	en	I own a property	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4169	1486	he	אני בעלים של נכס	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4170	1486	ru	Я владею недвижимостью	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4171	1487	en	I'm selling a property	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4172	1487	he	אני מוכר נכס	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
4173	1487	ru	Я продаю недвижимость	f	approved	2025-07-29 21:29:29.162912	2025-07-29 21:29:29.162912	1	\N	\N
5182	1907	he	בנק דיסקונט	f	approved	2025-08-02 13:26:16.50604	2025-08-02 13:26:16.50604	1	\N	\N
5183	1907	ru	Банк Дисконт	f	approved	2025-08-02 13:26:16.50604	2025-08-02 13:26:16.50604	1	\N	\N
5220	1920	en	Monthly Payment	t	approved	2025-08-02 13:45:47.230112	2025-08-02 13:45:47.230112	1	\N	\N
5221	1920	he	תשלום חודשי	f	approved	2025-08-02 13:45:47.230112	2025-08-02 13:45:47.230112	1	\N	\N
5222	1920	ru	Ежемесячный платеж	f	approved	2025-08-02 13:45:47.230112	2025-08-02 13:45:47.230112	1	\N	\N
5223	1921	en	Enter monthly payment amount	t	approved	2025-08-02 13:45:53.980308	2025-08-02 13:45:53.980308	1	\N	\N
5224	1921	he	הזן סכום תשלום חודשי	f	approved	2025-08-02 13:45:53.980308	2025-08-02 13:45:53.980308	1	\N	\N
5225	1921	ru	Введите сумму ежемесячного платежа	f	approved	2025-08-02 13:45:53.980308	2025-08-02 13:45:53.980308	1	\N	\N
5253	1943	en	Existing obligations	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5254	1944	en	Do you have existing debts or obligations?	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5255	1945	en	No obligations	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5256	1946	en	Credit card debt	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5257	1947	en	Bank loan	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
4332	1552	he	בנק המשכנתא הנוכחית	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4333	1553	he	בנק הפועלים	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4334	1554	he	בנק לאומי	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4335	1555	he	בנק דיסקונט	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4336	1556	he	בנק מסד	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4337	1557	he	בחר בנק מהרשימה	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4338	1558	he	בנק המשכנתא הנוכחית	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4339	1559	he	יתרת המשכנתא	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4340	1560	he	שווי הנכס הנוכחי	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4341	1561	he	שלב 1 - פרטי המשכנתא הקיימת	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4342	1562	he	סוג הנכס	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4343	1563	he	בחר סוג נכס	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4344	1564	he	סוג הנכס	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4345	1565	he	האם המשכנתא רשומה בטאבו?	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4346	1566	he	כן, רשומה בטאבו	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4347	1567	he	לא, לא רשומה	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4348	1568	he	בחר אפשרות רישום	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4349	1569	he	האם המשכנתא רשומה בטאבו?	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4350	1570	he	מטרת מחזור המשכנתא	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4351	1571	he	הפחתת הריבית	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4352	1572	he	הפחתת התשלום החודשי	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4353	1573	he	קיצור תקופת המשכנתא	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4354	1574	he	משיכת מזומן נוסף	f	approved	2025-07-30 06:19:37.988578	2025-07-30 06:19:37.988578	\N	\N	\N
4289	1526	he	הבא	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4295	1528	he	חשב	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4301	1530	he	סיים	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4286	1525	he	בחר את הבנק שבו יש לך משכנתא נוכחית	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4292	1527	he	ציין את הכנסותיך לחישוב	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4298	1529	he	בחר תוכנית מחזור משכנתא מתאימה	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4290	1526	en	Next	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4296	1528	en	Calculate	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4302	1530	en	Complete	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4287	1525	en	Select the bank where you have your current mortgage	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4388	1579	ru	Шаг 3 - Сведения о доходах	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
4389	1580	ru	Шаг 4 - Итоги заявки	f	approved	2025-07-30 06:20:37.001749	2025-07-30 06:20:37.001749	\N	\N	\N
5133	1879	en	Current bank is required	t	approved	2025-08-02 11:24:34.356438	2025-08-02 11:24:34.356438	1	\N	\N
5134	1879	he	בנק נוכחי נדרש	f	approved	2025-08-02 11:24:34.356438	2025-08-02 11:24:34.356438	1	\N	\N
5135	1879	ru	Требуется указать текущий банк	f	approved	2025-08-02 11:24:34.356438	2025-08-02 11:24:34.356438	1	\N	\N
5136	1880	en	Property type is required	t	approved	2025-08-02 11:24:41.298374	2025-08-02 11:24:41.298374	1	\N	\N
5137	1880	he	סוג נכס נדרש	f	approved	2025-08-02 11:24:41.298374	2025-08-02 11:24:41.298374	1	\N	\N
5138	1880	ru	Требуется указать тип недвижимости	f	approved	2025-08-02 11:24:41.298374	2025-08-02 11:24:41.298374	1	\N	\N
5184	1908	en	Bank Mizrahi Tefahot	t	approved	2025-08-02 13:26:27.414904	2025-08-02 13:26:27.414904	1	\N	\N
5185	1908	he	בנק מזרחי טפחות	f	approved	2025-08-02 13:26:27.414904	2025-08-02 13:26:27.414904	1	\N	\N
5186	1908	ru	Банк Мизрахи Тефахот	f	approved	2025-08-02 13:26:27.414904	2025-08-02 13:26:27.414904	1	\N	\N
5187	1909	en	Other Bank	t	approved	2025-08-02 13:26:36.457001	2025-08-02 13:26:36.457001	1	\N	\N
5188	1909	he	בנק אחר	f	approved	2025-08-02 13:26:36.457001	2025-08-02 13:26:36.457001	1	\N	\N
5189	1909	ru	Другой банк	f	approved	2025-08-02 13:26:36.457001	2025-08-02 13:26:36.457001	1	\N	\N
5226	1922	en	Obligation End Date	t	approved	2025-08-02 13:46:19.169074	2025-08-02 13:46:19.169074	1	\N	\N
5227	1922	he	תאריך סיום ההתחייבות	f	approved	2025-08-02 13:46:19.169074	2025-08-02 13:46:19.169074	1	\N	\N
5228	1922	ru	Дата окончания обязательства	f	approved	2025-08-02 13:46:19.169074	2025-08-02 13:46:19.169074	1	\N	\N
5258	1948	en	Consumer credit	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5259	1949	en	Other obligations	f	approved	2025-08-04 11:34:37.257501	2025-08-04 11:34:37.257501	\N	\N	\N
5270	1953	he	אנחנו לא כופים שירותים נסתרים או עמלות. הכל שקוף וברור.	f	approved	2025-08-05 13:28:12.377282	2025-08-05 13:28:12.377282	\N	\N	\N
5271	1953	ru	Мы не навязываем скрытые услуги или комиссии. Все прозрачно и понятно.	f	approved	2025-08-05 13:28:12.482011	2025-08-05 13:28:12.482011	\N	\N	\N
5300	1963	he	הכשרה ותמיכה לצוות מקצועי	f	approved	2025-08-05 14:15:31.971712	2025-08-05 14:15:31.971712	\N	\N	\N
5301	1963	ru	Обучение и поддержка профессиональной команды	f	approved	2025-08-05 14:15:32.089226	2025-08-05 14:15:32.089226	\N	\N	\N
5302	1964	en	Established brand recognition and marketing materials	f	approved	2025-08-05 14:15:32.388862	2025-08-05 14:15:32.388862	\N	\N	\N
5303	1964	he	זיהוי מותג מבוסס וחומרי שיווק	f	approved	2025-08-05 14:15:32.523881	2025-08-05 14:15:32.523881	\N	\N	\N
5304	1964	ru	Узнаваемость бренда и маркетинговые материалы	f	approved	2025-08-05 14:15:32.791578	2025-08-05 14:15:32.791578	\N	\N	\N
5305	1965	en	Complete marketing strategy and campaign support	f	approved	2025-08-05 14:15:33.0712	2025-08-05 14:15:33.0712	\N	\N	\N
5306	1965	he	אסטרטגיית שיווק מלאה ותמיכה בקמפיינים	f	approved	2025-08-05 14:15:33.229111	2025-08-05 14:15:33.229111	\N	\N	\N
5307	1965	ru	Полная маркетинговая стратегия и поддержка кампаний	f	approved	2025-08-05 14:15:33.374019	2025-08-05 14:15:33.374019	\N	\N	\N
5308	1966	en	Digital Solutions	f	approved	2025-08-05 14:15:33.63395	2025-08-05 14:15:33.63395	\N	\N	\N
5309	1966	he	פתרונות דיגיטליים	f	approved	2025-08-05 14:15:33.781866	2025-08-05 14:15:33.781866	\N	\N	\N
5310	1966	ru	Цифровые решения	f	approved	2025-08-05 14:15:34.026436	2025-08-05 14:15:34.026436	\N	\N	\N
5311	1967	en	Advanced digital platform with all necessary tools	f	approved	2025-08-05 14:15:34.328927	2025-08-05 14:15:34.328927	\N	\N	\N
5312	1967	he	פלטפורמה דיגיטלית מתקדמת עם כל הכלים הנדרשים	f	approved	2025-08-05 14:15:34.438788	2025-08-05 14:15:34.438788	\N	\N	\N
5313	1967	ru	Продвинутая цифровая платформа со всеми необходимыми инструментами	f	approved	2025-08-05 14:15:34.548995	2025-08-05 14:15:34.548995	\N	\N	\N
5314	1968	en	Professional analytics and reporting tools	f	approved	2025-08-05 14:15:34.82883	2025-08-05 14:15:34.82883	\N	\N	\N
5315	1968	he	כלי אנליטיקה ודיווח מקצועיים	f	approved	2025-08-05 14:15:34.956611	2025-08-05 14:15:34.956611	\N	\N	\N
5316	1968	ru	Профессиональные инструменты аналитики и отчетности	f	approved	2025-08-05 14:15:35.136986	2025-08-05 14:15:35.136986	\N	\N	\N
5317	1969	en	24/7 technical support and system maintenance	f	approved	2025-08-05 14:15:35.436732	2025-08-05 14:15:35.436732	\N	\N	\N
5318	1969	he	תמיכה טכנית ותחזוקת מערכת 24/7	f	approved	2025-08-05 14:15:35.56387	2025-08-05 14:15:35.56387	\N	\N	\N
5319	1969	ru	Техническая поддержка и обслуживание системы 24/7	f	approved	2025-08-05 14:15:35.671545	2025-08-05 14:15:35.671545	\N	\N	\N
5320	1970	en	Ongoing Support	f	approved	2025-08-05 14:15:35.959143	2025-08-05 14:15:35.959143	\N	\N	\N
5321	1970	he	תמיכה שוטפת	f	approved	2025-08-05 14:15:36.161752	2025-08-05 14:15:36.161752	\N	\N	\N
5322	1970	ru	Постоянная поддержка	f	approved	2025-08-05 14:15:36.506632	2025-08-05 14:15:36.506632	\N	\N	\N
5323	1971	en	Comprehensive training programs for all staff	f	approved	2025-08-05 14:15:36.811554	2025-08-05 14:15:36.811554	\N	\N	\N
5324	1971	he	תוכניות הכשרה מקיפות לכל הצוות	f	approved	2025-08-05 14:15:36.914046	2025-08-05 14:15:36.914046	\N	\N	\N
5325	1971	ru	Комплексные программы обучения для всего персонала	f	approved	2025-08-05 14:15:37.056445	2025-08-05 14:15:37.056445	\N	\N	\N
5326	1972	en	Dedicated phone support and consultation hotline	f	approved	2025-08-05 14:15:37.30144	2025-08-05 14:15:37.30144	\N	\N	\N
5327	1972	he	קו תמיכה טלפוני ייעוץ ייעודי	f	approved	2025-08-05 14:15:37.444027	2025-08-05 14:15:37.444027	\N	\N	\N
5328	1972	ru	Выделенная телефонная поддержка и консультационная горячая линия	f	approved	2025-08-05 14:15:37.604283	2025-08-05 14:15:37.604283	\N	\N	\N
5329	1973	en	Regular business consultation and strategy sessions	f	approved	2025-08-05 14:15:38.07684	2025-08-05 14:15:38.07684	\N	\N	\N
5330	1973	he	ייעוץ עסקי קבוע ומפגשי אסטרטגיה	f	approved	2025-08-05 14:15:38.22382	2025-08-05 14:15:38.22382	\N	\N	\N
5331	1973	ru	Регулярные бизнес-консультации и стратегические сессии	f	approved	2025-08-05 14:15:38.359329	2025-08-05 14:15:38.359329	\N	\N	\N
5332	1974	en	Established Brand	f	approved	2025-08-05 14:15:38.616734	2025-08-05 14:15:38.616734	\N	\N	\N
5333	1974	he	מותג מבוסס	f	approved	2025-08-05 14:15:38.749049	2025-08-05 14:15:38.749049	\N	\N	\N
5334	1974	ru	Зарекомендовавший себя бренд	f	approved	2025-08-05 14:15:38.899028	2025-08-05 14:15:38.899028	\N	\N	\N
5335	1975	en	Ready Office	f	approved	2025-08-05 14:15:39.179343	2025-08-05 14:15:39.179343	\N	\N	\N
5336	1975	he	משרד מוכן	f	approved	2025-08-05 14:15:39.353929	2025-08-05 14:15:39.353929	\N	\N	\N
5337	1975	ru	Готовый офис	f	approved	2025-08-05 14:15:39.548787	2025-08-05 14:15:39.548787	\N	\N	\N
5338	1976	en	Dedicated Manager	f	approved	2025-08-05 14:15:39.777422	2025-08-05 14:15:39.777422	\N	\N	\N
4392	1534	en	Additional Income Sources	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4393	1533	en	Types of Debts	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4394	1535	en	Main Income Source	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4395	1531	he	בנק נוכחי	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4396	1532	he	סיבת המיחזור	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4397	1534	he	מקורות הכנסה נוספים	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4398	1533	he	סוגי חובות	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4399	1535	he	מקור הכנסה עיקרי	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4400	1531	ru	Текущий банк	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4401	1532	ru	Причина рефинансирования	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4402	1534	ru	Дополнительные источники дохода	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4403	1533	ru	Типы долгов	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
4404	1535	ru	Основной источник дохода	f	approved	2025-07-30 06:31:26.546937	2025-07-30 06:31:26.546937	\N	\N	\N
5139	1881	en	Property registration status is required	t	approved	2025-08-02 11:24:48.477392	2025-08-02 11:24:48.477392	1	\N	\N
5140	1881	he	סטטוס רישום הנכס נדרש	f	approved	2025-08-02 11:24:48.477392	2025-08-02 11:24:48.477392	1	\N	\N
5141	1881	ru	Требуется указать статус регистрации недвижимости	f	approved	2025-08-02 11:24:48.477392	2025-08-02 11:24:48.477392	1	\N	\N
5142	1882	en	Mortgage start date is required	t	approved	2025-08-02 11:24:55.190406	2025-08-02 11:24:55.190406	1	\N	\N
5143	1882	he	תאריך תחילת המשכנתא נדרש	f	approved	2025-08-02 11:24:55.190406	2025-08-02 11:24:55.190406	1	\N	\N
5144	1882	ru	Требуется указать дату начала ипотеки	f	approved	2025-08-02 11:24:55.190406	2025-08-02 11:24:55.190406	1	\N	\N
5190	1910	en	Bank	t	approved	2025-08-02 13:31:24.533111	2025-08-02 13:31:24.533111	1	\N	\N
5191	1910	he	בנק מלווה	f	approved	2025-08-02 13:31:24.533111	2025-08-02 13:31:24.533111	1	\N	\N
5192	1910	ru	Банк	f	approved	2025-08-02 13:31:24.533111	2025-08-02 13:31:24.533111	1	\N	\N
5193	1911	en	Bank Hapoalim	t	approved	2025-08-02 13:31:32.995797	2025-08-02 13:31:32.995797	1	\N	\N
5194	1911	he	בנק הפועלים	f	approved	2025-08-02 13:31:32.995797	2025-08-02 13:31:32.995797	1	\N	\N
5195	1911	ru	Банк Апоалим	f	approved	2025-08-02 13:31:32.995797	2025-08-02 13:31:32.995797	1	\N	\N
5229	1923	en	Bank Lender	t	approved	2025-08-02 13:47:00.735855	2025-08-02 13:47:00.735855	1	\N	\N
5230	1923	he	בנק מלווה	f	approved	2025-08-02 13:47:00.735855	2025-08-02 13:47:00.735855	1	\N	\N
5231	1923	ru	Банк-кредитор	f	approved	2025-08-02 13:47:00.735855	2025-08-02 13:47:00.735855	1	\N	\N
5232	1924	en	Select bank	t	approved	2025-08-02 13:47:06.673608	2025-08-02 13:47:06.673608	1	\N	\N
5233	1924	he	בחר בנק	f	approved	2025-08-02 13:47:06.673608	2025-08-02 13:47:06.673608	1	\N	\N
5234	1924	ru	Выберите банк	f	approved	2025-08-02 13:47:06.673608	2025-08-02 13:47:06.673608	1	\N	\N
5260	1950	en	Privacy Policy	f	approved	2025-08-05 13:03:39.319612	2025-08-05 13:03:39.319612	\N	\N	\N
5261	1950	he	מדיניות פרטיות	f	approved	2025-08-05 13:03:39.432309	2025-08-05 13:03:39.432309	\N	\N	\N
5262	1950	ru	Политика конфиденциальности	f	approved	2025-08-05 13:03:39.599171	2025-08-05 13:03:39.599171	\N	\N	\N
5263	1951	en	<div>\n<p><strong>Bankimonline Privacy Policy</strong></p>\n<p>Bankimonline is committed to protecting your privacy and safeguarding your personal information. This privacy policy explains how we collect, use, and protect your information.</p>\n\n<h2><strong>1. Information We Collect</strong></h2>\n<p><strong>1.1 Personal Information:</strong> We collect personal information that you provide to us voluntarily, such as full name, phone number, email address, date of birth, and ID number.</p>\n<p><strong>1.2 Financial Information:</strong> As part of mortgage or credit applications, we may collect information about your financial situation, including income, expenses, assets, and liabilities.</p>\n<p><strong>1.3 Technical Information:</strong> We automatically collect information about your use of the website, including IP address, browser type, operating system, and pages visited.</p>\n<p><strong>1.4 Cookies:</strong> We use cookies and similar technologies to improve website experience and for analytical purposes.</p>\n<p><strong>1.5 Information from External Sources:</strong> We may receive information about you from partner banks, credit reporting agencies, and other entities as part of credit risk assessment.</p>\n\n<h2><strong>2. Use of Information</strong></h2>\n<p><strong>2.1 Service Purpose:</strong> We use your information to provide mortgage and credit comparison services, process your applications, and present suitable offers from partner banks.</p>\n<p><strong>2.2 Service Improvement:</strong> We use information to improve our website and services, develop new products, and conduct statistical research.</p>\n\n<h2><strong>3. Information Sharing</strong></h2>\n<p><strong>3.1 Partner Banks:</strong> We may share your information with partner banks to obtain mortgage or credit offers, only after receiving your explicit consent.</p>\n<p><strong>3.2 Service Providers:</strong> We may share information with external service providers who assist us in operating the website and providing services.</p>\n\n<h2><strong>4. Information Security</strong></h2>\n<p><strong>4.1 Encryption:</strong> We use advanced encryption technologies (SSL/TLS) to protect your information during transmission over the internet.</p>\n<p><strong>4.2 Limited Access:</strong> Access to your personal information is limited to authorized employees who need the information to perform their duties.</p>\n\n<h2><strong>5. Your Rights</strong></h2>\n<p><strong>5.1 Right of Access:</strong> You have the right to request access to the personal information we hold about you.</p>\n<p><strong>5.2 Right of Correction:</strong> You have the right to request correction or updating of incorrect or inaccurate information.</p>\n<p><strong>5.3 Right of Deletion:</strong> You have the right to request deletion of your personal information, subject to legal limitations.</p>\n\n<h2><strong>6. Contact Us</strong></h2>\n<p>For any questions or requests related to our privacy policy, please contact us:</p>\n<p><strong>Address:</strong> Habankaim Street 15, Tel Aviv 6812345</p>\n<p><strong>Phone:</strong> 03-5371622</p>\n<p><strong>Email:</strong> privacy@bankimonline.com | <strong>Data Protection Officer:</strong> dpo@bankimonline.com</p>\n</div>	f	approved	2025-08-05 13:03:39.719276	2025-08-05 13:03:39.719276	\N	\N	\N
5264	1951	he	<div>\n<p><strong>Bankimonline Privacy Policy</strong></p>\n<p>Bankimonline is committed to protecting your privacy and safeguarding your personal information. This privacy policy explains how we collect, use, and protect your information.</p>\n\n<h2><strong>1. Information We Collect</strong></h2>\n<p><strong>1.1 Personal Information:</strong> We collect personal information that you provide to us voluntarily, such as full name, phone number, email address, date of birth, and ID number.</p>\n<p><strong>1.2 Financial Information:</strong> As part of mortgage or credit applications, we may collect information about your financial situation, including income, expenses, assets, and liabilities.</p>\n<p><strong>1.3 Technical Information:</strong> We automatically collect information about your use of the website, including IP address, browser type, operating system, and pages visited.</p>\n<p><strong>1.4 Cookies:</strong> We use cookies and similar technologies to improve website experience and for analytical purposes.</p>\n<p><strong>1.5 Information from External Sources:</strong> We may receive information about you from partner banks, credit reporting agencies, and other entities as part of credit risk assessment.</p>\n\n<h2><strong>2. Use of Information</strong></h2>\n<p><strong>2.1 Service Purpose:</strong> We use your information to provide mortgage and credit comparison services, process your applications, and present suitable offers from partner banks.</p>\n<p><strong>2.2 Service Improvement:</strong> We use information to improve our website and services, develop new products, and conduct statistical research.</p>\n\n<h2><strong>3. Information Sharing</strong></h2>\n<p><strong>3.1 Partner Banks:</strong> We may share your information with partner banks to obtain mortgage or credit offers, only after receiving your explicit consent.</p>\n<p><strong>3.2 Service Providers:</strong> We may share information with external service providers who assist us in operating the website and providing services.</p>\n\n<h2><strong>4. Information Security</strong></h2>\n<p><strong>4.1 Encryption:</strong> We use advanced encryption technologies (SSL/TLS) to protect your information during transmission over the internet.</p>\n<p><strong>4.2 Limited Access:</strong> Access to your personal information is limited to authorized employees who need the information to perform their duties.</p>\n\n<h2><strong>5. Your Rights</strong></h2>\n<p><strong>5.1 Right of Access:</strong> You have the right to request access to the personal information we hold about you.</p>\n<p><strong>5.2 Right of Correction:</strong> You have the right to request correction or updating of incorrect or inaccurate information.</p>\n<p><strong>5.3 Right of Deletion:</strong> You have the right to request deletion of your personal information, subject to legal limitations.</p>\n\n<h2><strong>6. Contact Us</strong></h2>\n<p>For any questions or requests related to our privacy policy, please contact us:</p>\n<p><strong>Address:</strong> Habankaim Street 15, Tel Aviv 6812345</p>\n<p><strong>Phone:</strong> 03-5371622</p>\n<p><strong>Email:</strong> privacy@bankimonline.com | <strong>Data Protection Officer:</strong> dpo@bankimonline.com</p>\n</div>	f	approved	2025-08-05 13:03:39.827536	2025-08-05 13:03:39.827536	\N	\N	\N
5272	1954	en	Professional business meeting	f	approved	2025-08-05 14:15:25.841549	2025-08-05 14:15:25.841549	\N	\N	\N
5273	1954	he	פגישה עסקית מקצועית	f	approved	2025-08-05 14:15:26.167228	2025-08-05 14:15:26.167228	\N	\N	\N
5274	1954	ru	Профессиональная деловая встреча	f	approved	2025-08-05 14:15:26.627446	2025-08-05 14:15:26.627446	\N	\N	\N
5275	1955	en	TechRealt company logo	f	approved	2025-08-05 14:15:26.976685	2025-08-05 14:15:26.976685	\N	\N	\N
5276	1955	he	לוגו של חברת TechRealt	f	approved	2025-08-05 14:15:27.117115	2025-08-05 14:15:27.117115	\N	\N	\N
5371	1987	en	Credit Calculation	f	approved	2025-08-05 16:17:21.050256	2025-08-05 16:17:21.050256	\N	\N	\N
4280	1523	he	הזן נתונים לחישוב מחזור משכנתא	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4268	1519	he	מחזור משכנתא	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4284	1524	en	Continue	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4281	1523	en	Enter data to calculate mortgage refinancing	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4269	1519	en	Mortgage Refinance	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4282	1524	ru	Продолжить	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4279	1523	ru	Введите данные для расчета рефинансирования ипотеки	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4267	1519	ru	Рефинансирование ипотеки	f	approved	2025-07-29 21:55:13.676689	2025-07-30 12:59:40.648667	\N	\N	\N
4293	1527	en	Specify your income for calculation	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4299	1529	en	Select a suitable mortgage refinancing program	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4275	1521	en	Income Data	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4278	1522	en	Program Selection	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4272	1520	en	Current Bank	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4288	1526	ru	Далее	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4294	1528	ru	Рассчитать	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4300	1530	ru	Завершить	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4285	1525	ru	Выберите банк, в котором у вас текущая ипотека	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4291	1527	ru	Укажите ваши доходы для расчета	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4297	1529	ru	Выберите подходящую программу рефинансирования	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4273	1521	ru	Данные о доходах	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4276	1522	ru	Выбор программы	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4270	1520	ru	Банк текущей ипотеки	f	approved	2025-07-29 21:55:13.676689	2025-07-30 13:00:22.103026	\N	\N	\N
4405	1583	en	Is the mortgage registered in Tabu?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4406	1584	en	Purpose of Mortgage Refinance	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4407	1585	en	Property Type	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
5145	1889	en	Source of Income	t	approved	2025-08-02 11:53:24.081196	2025-08-02 11:53:24.081196	1	\N	\N
5146	1889	he	מקור הכנסה	f	approved	2025-08-02 11:53:24.081196	2025-08-02 11:53:24.081196	1	\N	\N
4410	1588	en	Lower Interest Rate	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4411	1589	en	Extend Loan Term	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4412	1590	en	Change Bank	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4413	1591	en	Increase Loan Amount	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4414	1592	en	Other	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4415	1593	en	Apartment	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4416	1594	en	House	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4417	1595	en	Commercial	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4418	1596	en	Is the mortgage registered in Tabu?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4419	1597	en	Is the mortgage registered in Tabu?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4420	1598	en	Purpose of Mortgage Refinance	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4421	1599	en	Select from list	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4422	1600	en	Property Type	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4423	1601	en	Select from list	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4424	1583	he	האם המשכנתא רשומה בטאבו?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4425	1584	he	מטרת מחזור המשכנתא	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4426	1585	he	סוג הנכס	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
5147	1889	ru	Источник дохода	f	approved	2025-08-02 11:53:24.081196	2025-08-02 11:53:24.081196	1	\N	\N
5196	1912	en	Bank Leumi	t	approved	2025-08-02 13:31:44.593857	2025-08-02 13:31:44.593857	1	\N	\N
4429	1588	he	הורדת ריבית	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4430	1589	he	הארכת תקופת ההלוואה	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4431	1590	he	החלפת בנק	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4432	1591	he	הגדלת סכום ההלוואה	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4433	1592	he	אחר	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4434	1593	he	דירה	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4435	1594	he	בית	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4436	1595	he	מסחרי	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4437	1596	he	האם המשכנתא רשומה בטאבו?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4438	1597	he	האם המשכנתא רשומה בטאבו?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4439	1598	he	מטרת מחזור המשכנתא	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4440	1599	he	בחר מהרשימה	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4441	1600	he	סוג הנכס	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4442	1601	he	בחר מהרשימה	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4443	1583	ru	Зарегистрирована ли ипотека в Табу?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4444	1584	ru	Цель рефинансирования ипотеки	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4445	1585	ru	Тип недвижимости	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
5197	1912	he	בנק לאומי	f	approved	2025-08-02 13:31:44.593857	2025-08-02 13:31:44.593857	1	\N	\N
5198	1912	ru	Банк Леуми	f	approved	2025-08-02 13:31:44.593857	2025-08-02 13:31:44.593857	1	\N	\N
4448	1588	ru	Снижение процентной ставки	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4449	1589	ru	Увеличение срока кредита	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4450	1590	ru	Смена банка	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4451	1591	ru	Увеличение суммы кредита	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4452	1592	ru	Другое	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
5199	1913	en	Bank Discount	t	approved	2025-08-02 13:31:45.149313	2025-08-02 13:31:45.149313	1	\N	\N
4453	1593	ru	Квартира	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4454	1594	ru	Дом	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4455	1595	ru	Коммерческая	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4456	1596	ru	Зарегистрирована ли ипотека в Табу?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4457	1597	ru	Зарегистрирована ли ипотека в Табу?	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4458	1598	ru	Цель рефинансирования ипотеки	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4459	1599	ru	Выберите из списка	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4460	1600	ru	Тип недвижимости	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4461	1601	ru	Выберите из списка	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:05:10.321126	\N	\N	\N
4427	1586	he	כן	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:06:01.191302	\N	\N	\N
4428	1587	he	לא	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:06:01.191302	\N	\N	\N
4408	1586	en	Yes	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:06:01.191302	\N	\N	\N
4409	1587	en	No	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:06:01.191302	\N	\N	\N
4446	1586	ru	Да	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:06:01.191302	\N	\N	\N
4447	1587	ru	Нет	f	approved	2025-07-30 13:05:10.321126	2025-07-30 13:06:01.191302	\N	\N	\N
4462	1602	en	Education	t	approved	2025-07-30 13:39:52.142633	2025-07-30 13:39:52.142633	1	\N	\N
4463	1602	he	השכלה	f	approved	2025-07-30 13:39:52.142633	2025-07-30 13:39:52.142633	1	\N	\N
4464	1602	ru	Образование	f	approved	2025-07-30 13:39:52.142633	2025-07-30 13:39:52.142633	1	\N	\N
4465	1603	en	Select education level	t	approved	2025-07-30 13:39:52.858016	2025-07-30 13:39:52.858016	1	\N	\N
4466	1603	he	בחר רמת השכלה	f	approved	2025-07-30 13:39:52.858016	2025-07-30 13:39:52.858016	1	\N	\N
4467	1603	ru	Выберите уровень образования	f	approved	2025-07-30 13:39:52.858016	2025-07-30 13:39:52.858016	1	\N	\N
4468	1604	en	No high school certificate	t	approved	2025-07-30 13:39:53.606522	2025-07-30 13:39:53.606522	1	\N	\N
4469	1604	he	ללא תעודת בגרות	f	approved	2025-07-30 13:39:53.606522	2025-07-30 13:39:53.606522	1	\N	\N
4470	1604	ru	Без аттестата средней школы	f	approved	2025-07-30 13:39:53.606522	2025-07-30 13:39:53.606522	1	\N	\N
4471	1605	en	Partial high school certificate	t	approved	2025-07-30 13:39:54.502106	2025-07-30 13:39:54.502106	1	\N	\N
4472	1605	he	תעודת בגרות חלקית	f	approved	2025-07-30 13:39:54.502106	2025-07-30 13:39:54.502106	1	\N	\N
4473	1605	ru	Частичный аттестат средней школы	f	approved	2025-07-30 13:39:54.502106	2025-07-30 13:39:54.502106	1	\N	\N
4474	1606	en	Full high school certificate	t	approved	2025-07-30 13:39:55.272292	2025-07-30 13:39:55.272292	1	\N	\N
4475	1606	he	תעודת בגרות מלאה	f	approved	2025-07-30 13:39:55.272292	2025-07-30 13:39:55.272292	1	\N	\N
4476	1606	ru	Полный аттестат средней школы	f	approved	2025-07-30 13:39:55.272292	2025-07-30 13:39:55.272292	1	\N	\N
4477	1607	en	Post-secondary education	t	approved	2025-07-30 13:39:56.317523	2025-07-30 13:39:56.317523	1	\N	\N
4478	1607	he	השכלה על-תיכונית	f	approved	2025-07-30 13:39:56.317523	2025-07-30 13:39:56.317523	1	\N	\N
4479	1607	ru	Послешкольное образование	f	approved	2025-07-30 13:39:56.317523	2025-07-30 13:39:56.317523	1	\N	\N
4480	1608	en	Bachelor's degree	t	approved	2025-07-30 13:39:57.096403	2025-07-30 13:39:57.096403	1	\N	\N
4481	1608	he	תואר ראשון	f	approved	2025-07-30 13:39:57.096403	2025-07-30 13:39:57.096403	1	\N	\N
4482	1608	ru	Степень бакалавра	f	approved	2025-07-30 13:39:57.096403	2025-07-30 13:39:57.096403	1	\N	\N
4483	1609	en	Master's degree	t	approved	2025-07-30 13:39:58.086847	2025-07-30 13:39:58.086847	1	\N	\N
4484	1609	he	תואר שני	f	approved	2025-07-30 13:39:58.086847	2025-07-30 13:39:58.086847	1	\N	\N
4485	1609	ru	Степень магистра	f	approved	2025-07-30 13:39:58.086847	2025-07-30 13:39:58.086847	1	\N	\N
4486	1610	en	Doctoral degree	t	approved	2025-07-30 13:39:59.0341	2025-07-30 13:39:59.0341	1	\N	\N
4487	1610	he	תואר שלישי	f	approved	2025-07-30 13:39:59.0341	2025-07-30 13:39:59.0341	1	\N	\N
4488	1610	ru	Докторская степень	f	approved	2025-07-30 13:39:59.0341	2025-07-30 13:39:59.0341	1	\N	\N
4489	1612	en	Education	t	approved	2025-07-30 13:44:54.458942	2025-07-30 13:44:54.458942	1	\N	\N
4490	1612	he	השכלה	f	approved	2025-07-30 13:44:54.458942	2025-07-30 13:44:54.458942	1	\N	\N
4491	1612	ru	Образование	f	approved	2025-07-30 13:44:54.458942	2025-07-30 13:44:54.458942	1	\N	\N
4492	1614	en	No high school certificate	t	approved	2025-07-30 13:44:55.748943	2025-07-30 13:44:55.748943	1	\N	\N
4493	1614	he	ללא תעודת בגרות	f	approved	2025-07-30 13:44:55.748943	2025-07-30 13:44:55.748943	1	\N	\N
4494	1614	ru	Без аттестата средней школы	f	approved	2025-07-30 13:44:55.748943	2025-07-30 13:44:55.748943	1	\N	\N
4495	1615	en	Partial high school certificate	t	approved	2025-07-30 13:44:56.709286	2025-07-30 13:44:56.709286	1	\N	\N
4496	1615	he	תעודת בגרות חלקית	f	approved	2025-07-30 13:44:56.709286	2025-07-30 13:44:56.709286	1	\N	\N
4497	1615	ru	Частичный аттестат средней школы	f	approved	2025-07-30 13:44:56.709286	2025-07-30 13:44:56.709286	1	\N	\N
4498	1616	en	Full high school certificate	t	approved	2025-07-30 13:44:57.594909	2025-07-30 13:44:57.594909	1	\N	\N
4499	1616	he	תעודת בגרות מלאה	f	approved	2025-07-30 13:44:57.594909	2025-07-30 13:44:57.594909	1	\N	\N
4500	1616	ru	Полный аттестат средней школы	f	approved	2025-07-30 13:44:57.594909	2025-07-30 13:44:57.594909	1	\N	\N
4501	1617	en	Post-secondary education	t	approved	2025-07-30 13:44:58.368741	2025-07-30 13:44:58.368741	1	\N	\N
4502	1617	he	השכלה על-תיכונית	f	approved	2025-07-30 13:44:58.368741	2025-07-30 13:44:58.368741	1	\N	\N
4503	1617	ru	Послешкольное образование	f	approved	2025-07-30 13:44:58.368741	2025-07-30 13:44:58.368741	1	\N	\N
4504	1621	en	Select city	t	approved	2025-07-30 20:33:27.016672	2025-07-30 20:33:27.016672	1	\N	\N
4505	1621	he	בחר עיר	f	approved	2025-07-30 20:33:27.016672	2025-07-30 20:33:27.016672	1	\N	\N
4506	1621	ru	Выберите город	f	approved	2025-07-30 20:33:27.016672	2025-07-30 20:33:27.016672	1	\N	\N
4507	1625	ru	Главная страница - Навигация	f	approved	2025-07-30 23:35:39.715434	2025-07-30 23:35:39.715434	\N	\N	\N
4508	1625	he	עמוד ראשי - ניווט	f	approved	2025-07-30 23:35:39.829331	2025-07-30 23:35:39.829331	\N	\N	\N
4509	1625	en	Main Page - Navigation	f	approved	2025-07-30 23:35:39.924413	2025-07-30 23:35:39.924413	\N	\N	\N
4510	1626	ru	Главная страница - Настройки	f	approved	2025-07-30 23:35:40.137219	2025-07-30 23:35:40.137219	\N	\N	\N
4511	1626	he	עמוד ראשי - הגדרות	f	approved	2025-07-30 23:35:40.230326	2025-07-30 23:35:40.230326	\N	\N	\N
4512	1626	en	Main Page - Settings	f	approved	2025-07-30 23:35:40.32379	2025-07-30 23:35:40.32379	\N	\N	\N
4513	1627	ru	Добро пожаловать в систему управления BankIM	f	approved	2025-07-30 23:35:40.512148	2025-07-30 23:35:40.512148	\N	\N	\N
5377	1989	en	Technical Support	f	approved	2025-08-05 16:29:13.119639	2025-08-05 16:29:13.119639	\N	\N	\N
4514	1627	he	ברוכים הבאים למערכת ניהול BankIM	f	approved	2025-07-30 23:35:40.616203	2025-07-30 23:35:40.616203	\N	\N	\N
4515	1627	en	Welcome to BankIM Management System	f	approved	2025-07-30 23:35:40.712258	2025-07-30 23:35:40.712258	\N	\N	\N
4516	1628	ru	Выберите раздел для редактирования контента	f	approved	2025-07-30 23:35:40.894454	2025-07-30 23:35:40.894454	\N	\N	\N
4517	1628	he	בחר סעיף לעריכת תוכן	f	approved	2025-07-30 23:35:40.982466	2025-07-30 23:35:40.982466	\N	\N	\N
4518	1628	en	Select a section to edit content	f	approved	2025-07-30 23:35:41.076584	2025-07-30 23:35:41.076584	\N	\N	\N
4519	1629	ru	Навигация по разделам	f	approved	2025-07-30 23:35:41.252413	2025-07-30 23:35:41.252413	\N	\N	\N
4520	1629	he	ניווט בין הסעיפים	f	approved	2025-07-30 23:35:41.338379	2025-07-30 23:35:41.338379	\N	\N	\N
4521	1629	en	Section Navigation	f	approved	2025-07-30 23:35:41.425488	2025-07-30 23:35:41.425488	\N	\N	\N
4522	1630	ru	Настройки системы	f	approved	2025-07-30 23:35:41.597231	2025-07-30 23:35:41.597231	\N	\N	\N
4523	1630	he	הגדרות המערכת	f	approved	2025-07-30 23:35:41.685177	2025-07-30 23:35:41.685177	\N	\N	\N
4524	1630	en	System Settings	f	approved	2025-07-30 23:35:41.772244	2025-07-30 23:35:41.772244	\N	\N	\N
4525	1631	ru	Административные инструменты	f	approved	2025-07-30 23:35:41.946909	2025-07-30 23:35:41.946909	\N	\N	\N
4526	1631	he	כלי ניהול	f	approved	2025-07-30 23:35:42.033162	2025-07-30 23:35:42.033162	\N	\N	\N
4527	1631	en	Administrative Tools	f	approved	2025-07-30 23:35:42.1221	2025-07-30 23:35:42.1221	\N	\N	\N
4528	1632	he	ריבית קבועה	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4529	1632	en	Fixed Rate	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4530	1633	he	ריבית משתנה	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4531	1633	en	Variable Rate	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4532	1634	he	ריבית משולבת	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4533	1634	en	Mixed Rate	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4534	1635	he	לא בטוח	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
4535	1635	en	Not Sure	f	approved	2025-07-31 19:35:26.314737	2025-07-31 19:35:26.314737	\N	\N	\N
5148	1890	en	Additional Source of Income	t	approved	2025-08-02 11:57:18.701852	2025-08-02 11:57:18.701852	1	\N	\N
5149	1890	he	מקור הכנסה נוסף	f	approved	2025-08-02 11:57:18.701852	2025-08-02 11:57:18.701852	1	\N	\N
5150	1890	ru	Дополнительный источник дохода	f	approved	2025-08-02 11:57:18.701852	2025-08-02 11:57:18.701852	1	\N	\N
5200	1913	he	בנק דיסקונט	f	approved	2025-08-02 13:31:45.149313	2025-08-02 13:31:45.149313	1	\N	\N
5201	1913	ru	Банк Дисконт	f	approved	2025-08-02 13:31:45.149313	2025-08-02 13:31:45.149313	1	\N	\N
5202	1914	en	Bank Massad	t	approved	2025-08-02 13:31:45.680875	2025-08-02 13:31:45.680875	1	\N	\N
5203	1914	he	בנק מסד	f	approved	2025-08-02 13:31:45.680875	2025-08-02 13:31:45.680875	1	\N	\N
5204	1914	ru	Банк Масад	f	approved	2025-08-02 13:31:45.680875	2025-08-02 13:31:45.680875	1	\N	\N
4230	1491	ru	Имеете ли вы дополнительное гражданство?	f	approved	2025-07-29 21:47:57.020657	2025-08-02 13:50:18.103741	1	\N	\N
5265	1951	ru	<div>\n<p><strong>Bankimonline Privacy Policy</strong></p>\n<p>Bankimonline is committed to protecting your privacy and safeguarding your personal information. This privacy policy explains how we collect, use, and protect your information.</p>\n\n<h2><strong>1. Information We Collect</strong></h2>\n<p><strong>1.1 Personal Information:</strong> We collect personal information that you provide to us voluntarily, such as full name, phone number, email address, date of birth, and ID number.</p>\n<p><strong>1.2 Financial Information:</strong> As part of mortgage or credit applications, we may collect information about your financial situation, including income, expenses, assets, and liabilities.</p>\n<p><strong>1.3 Technical Information:</strong> We automatically collect information about your use of the website, including IP address, browser type, operating system, and pages visited.</p>\n<p><strong>1.4 Cookies:</strong> We use cookies and similar technologies to improve website experience and for analytical purposes.</p>\n<p><strong>1.5 Information from External Sources:</strong> We may receive information about you from partner banks, credit reporting agencies, and other entities as part of credit risk assessment.</p>\n\n<h2><strong>2. Use of Information</strong></h2>\n<p><strong>2.1 Service Purpose:</strong> We use your information to provide mortgage and credit comparison services, process your applications, and present suitable offers from partner banks.</p>\n<p><strong>2.2 Service Improvement:</strong> We use information to improve our website and services, develop new products, and conduct statistical research.</p>\n\n<h2><strong>3. Information Sharing</strong></h2>\n<p><strong>3.1 Partner Banks:</strong> We may share your information with partner banks to obtain mortgage or credit offers, only after receiving your explicit consent.</p>\n<p><strong>3.2 Service Providers:</strong> We may share information with external service providers who assist us in operating the website and providing services.</p>\n\n<h2><strong>4. Information Security</strong></h2>\n<p><strong>4.1 Encryption:</strong> We use advanced encryption technologies (SSL/TLS) to protect your information during transmission over the internet.</p>\n<p><strong>4.2 Limited Access:</strong> Access to your personal information is limited to authorized employees who need the information to perform their duties.</p>\n\n<h2><strong>5. Your Rights</strong></h2>\n<p><strong>5.1 Right of Access:</strong> You have the right to request access to the personal information we hold about you.</p>\n<p><strong>5.2 Right of Correction:</strong> You have the right to request correction or updating of incorrect or inaccurate information.</p>\n<p><strong>5.3 Right of Deletion:</strong> You have the right to request deletion of your personal information, subject to legal limitations.</p>\n\n<h2><strong>6. Contact Us</strong></h2>\n<p>For any questions or requests related to our privacy policy, please contact us:</p>\n<p><strong>Address:</strong> Habankaim Street 15, Tel Aviv 6812345</p>\n<p><strong>Phone:</strong> 03-5371622</p>\n<p><strong>Email:</strong> privacy@bankimonline.com | <strong>Data Protection Officer:</strong> dpo@bankimonline.com</p>\n</div>	f	approved	2025-08-05 13:03:39.939728	2025-08-05 13:03:39.939728	\N	\N	\N
5277	1955	ru	Логотип компании TechRealt	f	approved	2025-08-05 14:15:27.251896	2025-08-05 14:15:27.251896	\N	\N	\N
5278	1956	en	Bankimonline platform interface	f	approved	2025-08-05 14:15:27.617618	2025-08-05 14:15:27.617618	\N	\N	\N
5279	1956	he	ממשק פלטפורמת Bankimonline	f	approved	2025-08-05 14:15:27.749302	2025-08-05 14:15:27.749302	\N	\N	\N
5280	1956	ru	Интерфейс платформы Bankimonline	f	approved	2025-08-05 14:15:27.879699	2025-08-05 14:15:27.879699	\N	\N	\N
5281	1957	en	Real estate keys for property transactions	f	approved	2025-08-05 14:15:28.111522	2025-08-05 14:15:28.111522	\N	\N	\N
5282	1957	he	מפתחות נדל"ן לעסקאות נכסים	f	approved	2025-08-05 14:15:28.396917	2025-08-05 14:15:28.396917	\N	\N	\N
5283	1957	ru	Ключи от недвижимости для сделок с недвижимостью	f	approved	2025-08-05 14:15:28.504436	2025-08-05 14:15:28.504436	\N	\N	\N
5284	1958	en	Fully equipped modern office space	f	approved	2025-08-05 14:15:28.781643	2025-08-05 14:15:28.781643	\N	\N	\N
5285	1958	he	משרד מודרני מאובזר במלואו	f	approved	2025-08-05 14:15:28.896461	2025-08-05 14:15:28.896461	\N	\N	\N
5286	1958	ru	Полностью оборудованное современное офисное помещение	f	approved	2025-08-05 14:15:29.012139	2025-08-05 14:15:29.012139	\N	\N	\N
5287	1959	en	Credit calculation	f	approved	2025-08-05 14:15:29.269282	2025-08-05 14:15:29.269282	\N	\N	\N
5288	1959	he	חישוב אשראי	f	approved	2025-08-05 14:15:29.488892	2025-08-05 14:15:29.488892	\N	\N	\N
5289	1959	ru	Расчет кредита	f	approved	2025-08-05 14:15:29.641452	2025-08-05 14:15:29.641452	\N	\N	\N
5290	1960	en	Credit refinancing	f	approved	2025-08-05 14:15:29.921577	2025-08-05 14:15:29.921577	\N	\N	\N
5291	1960	he	מיחזור אשראי	f	approved	2025-08-05 14:15:30.061362	2025-08-05 14:15:30.061362	\N	\N	\N
5292	1960	ru	Рефинансирование кредита	f	approved	2025-08-05 14:15:30.238898	2025-08-05 14:15:30.238898	\N	\N	\N
5293	1961	en	Turnkey Solution	f	approved	2025-08-05 14:15:30.639046	2025-08-05 14:15:30.639046	\N	\N	\N
5294	1961	he	פתרון מפתח בידיים	f	approved	2025-08-05 14:15:30.74898	2025-08-05 14:15:30.74898	\N	\N	\N
5295	1961	ru	Решение под ключ	f	approved	2025-08-05 14:15:30.863744	2025-08-05 14:15:30.863744	\N	\N	\N
5296	1962	en	Fully equipped office space ready for operations	f	approved	2025-08-05 14:15:31.123811	2025-08-05 14:15:31.123811	\N	\N	\N
5297	1962	he	משרד מאובזר במלואו מוכן לפעילות	f	approved	2025-08-05 14:15:31.233966	2025-08-05 14:15:31.233966	\N	\N	\N
5298	1962	ru	Полностью оборудованное офисное помещение готовое к работе	f	approved	2025-08-05 14:15:31.446616	2025-08-05 14:15:31.446616	\N	\N	\N
5339	1976	he	מנהל ייעודי	f	approved	2025-08-05 14:15:39.879649	2025-08-05 14:15:39.879649	\N	\N	\N
5340	1976	ru	Выделенный менеджер	f	approved	2025-08-05 14:15:40.041271	2025-08-05 14:15:40.041271	\N	\N	\N
5341	1977	en	Initial Consultation	f	approved	2025-08-05 14:15:40.281437	2025-08-05 14:15:40.281437	\N	\N	\N
5342	1977	he	ייעוץ ראשוני	f	approved	2025-08-05 14:15:40.434069	2025-08-05 14:15:40.434069	\N	\N	\N
5343	1977	ru	Первичная консультация	f	approved	2025-08-05 14:15:40.551568	2025-08-05 14:15:40.551568	\N	\N	\N
5344	1978	en	Meet with our franchise specialists to discuss your goals and requirements	f	approved	2025-08-05 14:15:40.864148	2025-08-05 14:15:40.864148	\N	\N	\N
5345	1978	he	פגישה עם מומחי הזכיינות שלנו לדיון במטרות ובדרישות שלך	f	approved	2025-08-05 14:15:40.991271	2025-08-05 14:15:40.991271	\N	\N	\N
5346	1978	ru	Встреча с нашими специалистами по франшизе для обсуждения ваших целей и требований	f	approved	2025-08-05 14:15:41.106377	2025-08-05 14:15:41.106377	\N	\N	\N
5347	1979	en	Location Selection	f	approved	2025-08-05 14:15:41.323789	2025-08-05 14:15:41.323789	\N	\N	\N
5348	1979	he	בחירת מיקום	f	approved	2025-08-05 14:15:41.498977	2025-08-05 14:15:41.498977	\N	\N	\N
5349	1979	ru	Выбор местоположения	f	approved	2025-08-05 14:15:41.821754	2025-08-05 14:15:41.821754	\N	\N	\N
5350	1980	en	We help you find the perfect location for your franchise office	f	approved	2025-08-05 14:15:42.07648	2025-08-05 14:15:42.07648	\N	\N	\N
5351	1980	he	אנו עוזרים לך למצוא את המיקום המושלם למשרד הזכיינות שלך	f	approved	2025-08-05 14:15:42.191819	2025-08-05 14:15:42.191819	\N	\N	\N
5352	1980	ru	Мы поможем вам найти идеальное место для вашего франчайзингового офиса	f	approved	2025-08-05 14:15:42.336906	2025-08-05 14:15:42.336906	\N	\N	\N
5353	1981	en	Training Program	f	approved	2025-08-05 14:15:42.634426	2025-08-05 14:15:42.634426	\N	\N	\N
5354	1981	he	תוכנית הכשרה	f	approved	2025-08-05 14:15:42.744051	2025-08-05 14:15:42.744051	\N	\N	\N
5355	1981	ru	Программа обучения	f	approved	2025-08-05 14:15:42.991384	2025-08-05 14:15:42.991384	\N	\N	\N
5356	1982	en	Comprehensive training for you and your team on all systems and processes	f	approved	2025-08-05 14:15:43.404226	2025-08-05 14:15:43.404226	\N	\N	\N
5357	1982	he	הכשרה מקיפה עבורך ועבור הצוות שלך על כל המערכות והתהליכים	f	approved	2025-08-05 14:15:43.55448	2025-08-05 14:15:43.55448	\N	\N	\N
5358	1982	ru	Комплексное обучение для вас и вашей команды по всем системам и процессам	f	approved	2025-08-05 14:15:43.661754	2025-08-05 14:15:43.661754	\N	\N	\N
5359	1983	en	Grand Opening	f	approved	2025-08-05 14:15:43.921247	2025-08-05 14:15:43.921247	\N	\N	\N
5360	1983	he	פתיחה חגיגית	f	approved	2025-08-05 14:15:44.063924	2025-08-05 14:15:44.063924	\N	\N	\N
5361	1983	ru	Торжественное открытие	f	approved	2025-08-05 14:15:44.239315	2025-08-05 14:15:44.239315	\N	\N	\N
5362	1984	en	Launch your franchise with our full support and marketing campaign	f	approved	2025-08-05 14:15:44.46668	2025-08-05 14:15:44.46668	\N	\N	\N
5363	1984	he	השק את הזכיינות שלך עם התמיכה המלאה שלנו וקמפיין שיווקי	f	approved	2025-08-05 14:15:44.6742	2025-08-05 14:15:44.6742	\N	\N	\N
5364	1984	ru	Запустите свою франшизу с нашей полной поддержкой и маркетинговой кампанией	f	approved	2025-08-05 14:15:44.77633	2025-08-05 14:15:44.77633	\N	\N	\N
5365	1985	en	Ongoing Support	f	approved	2025-08-05 14:15:45.041498	2025-08-05 14:15:45.041498	\N	\N	\N
5366	1985	he	תמיכה שוטפת	f	approved	2025-08-05 14:15:45.19382	2025-08-05 14:15:45.19382	\N	\N	\N
5367	1985	ru	Постоянная поддержка	f	approved	2025-08-05 14:15:45.301414	2025-08-05 14:15:45.301414	\N	\N	\N
5368	1986	en	Continuous support, training, and business development assistance	f	approved	2025-08-05 14:15:45.606451	2025-08-05 14:15:45.606451	\N	\N	\N
5369	1986	he	תמיכה רציפה, הכשרה וסיוע בפיתוח עסקי	f	approved	2025-08-05 14:15:45.736868	2025-08-05 14:15:45.736868	\N	\N	\N
5370	1986	ru	Постоянная поддержка, обучение и помощь в развитии бизнеса	f	approved	2025-08-05 14:15:45.911377	2025-08-05 14:15:45.911377	\N	\N	\N
5372	1987	he	חישוב אשראי	f	approved	2025-08-05 16:17:21.159111	2025-08-05 16:17:21.159111	\N	\N	\N
5373	1987	ru	Расчет кредита	f	approved	2025-08-05 16:17:21.262597	2025-08-05 16:17:21.262597	\N	\N	\N
5374	1988	en	Credit Refinancing	f	approved	2025-08-05 16:17:21.452638	2025-08-05 16:17:21.452638	\N	\N	\N
5375	1988	he	מיחזור אשראי	f	approved	2025-08-05 16:17:21.577911	2025-08-05 16:17:21.577911	\N	\N	\N
5376	1988	ru	Рефинансирование кредита	f	approved	2025-08-05 16:17:21.684749	2025-08-05 16:17:21.684749	\N	\N	\N
5378	1989	he	תמיכה טכנית	f	approved	2025-08-05 16:29:13.23762	2025-08-05 16:29:13.23762	\N	\N	\N
5379	1989	ru	Техническая поддержка	f	approved	2025-08-05 16:29:13.346337	2025-08-05 16:29:13.346337	\N	\N	\N
5380	1990	en	Credit Calculator	f	approved	2025-08-05 16:29:13.552373	2025-08-05 16:29:13.552373	\N	\N	\N
5381	1990	he	מחשבון אשראי	f	approved	2025-08-05 16:29:13.663487	2025-08-05 16:29:13.663487	\N	\N	\N
5382	1990	ru	Калькулятор кредита	f	approved	2025-08-05 16:29:13.764209	2025-08-05 16:29:13.764209	\N	\N	\N
5383	1991	en	053-716-2235	f	approved	2025-08-05 16:29:14.023037	2025-08-05 16:29:14.023037	\N	\N	\N
5384	1991	he	053-716-2235	f	approved	2025-08-05 16:29:14.127492	2025-08-05 16:29:14.127492	\N	\N	\N
5385	1991	ru	053-716-2235	f	approved	2025-08-05 16:29:14.234808	2025-08-05 16:29:14.234808	\N	\N	\N
5386	1992	en	credit@bankimonline.com	f	approved	2025-08-05 16:29:14.437629	2025-08-05 16:29:14.437629	\N	\N	\N
5387	1992	he	credit@bankimonline.com	f	approved	2025-08-05 16:29:14.545977	2025-08-05 16:29:14.545977	\N	\N	\N
5388	1992	ru	credit@bankimonline.com	f	approved	2025-08-05 16:29:14.647374	2025-08-05 16:29:14.647374	\N	\N	\N
5389	1993	en	Compare banks and get mortgage	f	approved	2025-08-05 16:58:37.561294	2025-08-05 16:58:37.561294	\N	\N	\N
5390	1993	he	השווה בנקים וקבל משכנתה	f	approved	2025-08-05 16:58:37.707336	2025-08-05 16:58:37.707336	\N	\N	\N
5391	1993	ru	Сравните банки и получите ипотеку	f	approved	2025-08-05 16:58:37.826048	2025-08-05 16:58:37.826048	\N	\N	\N
5392	1994	en	in 5 minutes	f	approved	2025-08-05 16:58:38.039312	2025-08-05 16:58:38.039312	\N	\N	\N
5393	1994	he	תוך 5 דקות	f	approved	2025-08-05 16:58:38.136935	2025-08-05 16:58:38.136935	\N	\N	\N
5394	1994	ru	за 5 минут	f	approved	2025-08-05 16:58:38.249421	2025-08-05 16:58:38.249421	\N	\N	\N
5396	1995	en	This field is required	f	approved	2025-08-06 23:40:35.682634	2025-08-06 23:40:35.682634	\N	\N	\N
5397	1995	ru	Это поле обязательно	f	approved	2025-08-06 23:40:36.208554	2025-08-06 23:40:36.208554	\N	\N	\N
5400	1996	ru	Employee	f	approved	2025-08-07 04:02:57.033528	2025-08-07 04:02:57.033528	\N	\N	\N
5401	1997	he	עצמאי	f	approved	2025-08-07 04:02:57.291579	2025-08-07 04:02:57.291579	\N	\N	\N
5402	1997	en	Self-employed	f	approved	2025-08-07 04:02:57.377631	2025-08-07 04:02:57.377631	\N	\N	\N
5403	1997	ru	Self-employed	f	approved	2025-08-07 04:02:57.483769	2025-08-07 04:02:57.483769	\N	\N	\N
5404	1998	he	בעל עסק	f	approved	2025-08-07 04:02:57.738388	2025-08-07 04:02:57.738388	\N	\N	\N
5405	1998	en	Business owner	f	approved	2025-08-07 04:02:57.829551	2025-08-07 04:02:57.829551	\N	\N	\N
5406	1998	ru	Business owner	f	approved	2025-08-07 04:02:57.912602	2025-08-07 04:02:57.912602	\N	\N	\N
5407	1999	he	פנסיונר	f	approved	2025-08-07 04:02:58.157547	2025-08-07 04:02:58.157547	\N	\N	\N
5408	1999	en	Pension	f	approved	2025-08-07 04:02:58.239548	2025-08-07 04:02:58.239548	\N	\N	\N
5409	1999	ru	Pension	f	approved	2025-08-07 04:02:58.326808	2025-08-07 04:02:58.326808	\N	\N	\N
5410	2000	he	סטודנט	f	approved	2025-08-07 04:02:58.589919	2025-08-07 04:02:58.589919	\N	\N	\N
5411	2000	en	Student	f	approved	2025-08-07 04:02:58.678698	2025-08-07 04:02:58.678698	\N	\N	\N
5412	2000	ru	Student	f	approved	2025-08-07 04:02:58.762652	2025-08-07 04:02:58.762652	\N	\N	\N
5413	2001	he	מובטל	f	approved	2025-08-07 04:02:59.031517	2025-08-07 04:02:59.031517	\N	\N	\N
5414	2001	en	Unemployed	f	approved	2025-08-07 04:02:59.148462	2025-08-07 04:02:59.148462	\N	\N	\N
5415	2001	ru	Unemployed	f	approved	2025-08-07 04:02:59.233449	2025-08-07 04:02:59.233449	\N	\N	\N
5416	2002	he	אחר	f	approved	2025-08-07 04:02:59.481446	2025-08-07 04:02:59.481446	\N	\N	\N
5417	2002	en	Other	f	approved	2025-08-07 04:02:59.833476	2025-08-07 04:02:59.833476	\N	\N	\N
5418	2002	ru	Other	f	approved	2025-08-07 04:02:59.926299	2025-08-07 04:02:59.926299	\N	\N	\N
5419	2003	he	אין הכנסה נוספת	f	approved	2025-08-07 04:03:00.17438	2025-08-07 04:03:00.17438	\N	\N	\N
5420	2003	en	No additional income	f	approved	2025-08-07 04:03:00.258246	2025-08-07 04:03:00.258246	\N	\N	\N
5421	2003	ru	No additional income	f	approved	2025-08-07 04:03:00.344299	2025-08-07 04:03:00.344299	\N	\N	\N
5422	2004	he	משכורת נוספת	f	approved	2025-08-07 04:03:00.596514	2025-08-07 04:03:00.596514	\N	\N	\N
5423	2004	en	Additional salary	f	approved	2025-08-07 04:03:00.678688	2025-08-07 04:03:00.678688	\N	\N	\N
5424	2004	ru	Additional salary	f	approved	2025-08-07 04:03:00.760389	2025-08-07 04:03:00.760389	\N	\N	\N
5425	2005	he	עבודה עצמאית	f	approved	2025-08-07 04:03:01.002594	2025-08-07 04:03:01.002594	\N	\N	\N
5426	2005	en	Freelance work	f	approved	2025-08-07 04:03:01.08859	2025-08-07 04:03:01.08859	\N	\N	\N
5427	2005	ru	Freelance work	f	approved	2025-08-07 04:03:01.173478	2025-08-07 04:03:01.173478	\N	\N	\N
5428	2006	he	הכנסה מהשקעות	f	approved	2025-08-07 04:03:01.424436	2025-08-07 04:03:01.424436	\N	\N	\N
5429	2006	en	Investment income	f	approved	2025-08-07 04:03:01.507498	2025-08-07 04:03:01.507498	\N	\N	\N
5430	2006	ru	Investment income	f	approved	2025-08-07 04:03:01.589305	2025-08-07 04:03:01.589305	\N	\N	\N
5431	2007	he	הכנסה משכירות	f	approved	2025-08-07 04:03:01.833483	2025-08-07 04:03:01.833483	\N	\N	\N
5432	2007	en	Rental income	f	approved	2025-08-07 04:03:01.917372	2025-08-07 04:03:01.917372	\N	\N	\N
5433	2007	ru	Rental income	f	approved	2025-08-07 04:03:02.000581	2025-08-07 04:03:02.000581	\N	\N	\N
5434	2008	he	קצבה	f	approved	2025-08-07 04:03:02.252312	2025-08-07 04:03:02.252312	\N	\N	\N
5435	2008	en	Pension benefits	f	approved	2025-08-07 04:03:02.344401	2025-08-07 04:03:02.344401	\N	\N	\N
5436	2008	ru	Pension benefits	f	approved	2025-08-07 04:03:02.426457	2025-08-07 04:03:02.426457	\N	\N	\N
5437	2009	he	הכנסה אחרת	f	approved	2025-08-07 04:03:02.676317	2025-08-07 04:03:02.676317	\N	\N	\N
5438	2009	en	Other income	f	approved	2025-08-07 04:03:02.760376	2025-08-07 04:03:02.760376	\N	\N	\N
5439	2009	ru	Other income	f	approved	2025-08-07 04:03:02.843355	2025-08-07 04:03:02.843355	\N	\N	\N
5440	2010	he	אין התחייבויות	f	approved	2025-08-07 04:03:03.092345	2025-08-07 04:03:03.092345	\N	\N	\N
5441	2010	en	No obligations	f	approved	2025-08-07 04:03:03.175374	2025-08-07 04:03:03.175374	\N	\N	\N
5442	2010	ru	No obligations	f	approved	2025-08-07 04:03:03.264439	2025-08-07 04:03:03.264439	\N	\N	\N
5443	2011	he	חוב כרטיס אשראי	f	approved	2025-08-07 04:03:03.509363	2025-08-07 04:03:03.509363	\N	\N	\N
5444	2011	en	Credit card debt	f	approved	2025-08-07 04:03:03.595397	2025-08-07 04:03:03.595397	\N	\N	\N
5445	2011	ru	Credit card debt	f	approved	2025-08-07 04:03:03.681678	2025-08-07 04:03:03.681678	\N	\N	\N
5446	2012	he	הלוואה בנקאית	f	approved	2025-08-07 04:03:03.93641	2025-08-07 04:03:03.93641	\N	\N	\N
5447	2012	en	Bank loan	f	approved	2025-08-07 04:03:04.020523	2025-08-07 04:03:04.020523	\N	\N	\N
5448	2012	ru	Bank loan	f	approved	2025-08-07 04:03:04.104363	2025-08-07 04:03:04.104363	\N	\N	\N
5449	2013	he	אשראי צרכני	f	approved	2025-08-07 04:03:04.354417	2025-08-07 04:03:04.354417	\N	\N	\N
5450	2013	en	Consumer credit	f	approved	2025-08-07 04:03:04.436268	2025-08-07 04:03:04.436268	\N	\N	\N
5451	2013	ru	Consumer credit	f	approved	2025-08-07 04:03:04.518371	2025-08-07 04:03:04.518371	\N	\N	\N
5452	2014	he	התחייבויות אחרות	f	approved	2025-08-07 04:03:04.766128	2025-08-07 04:03:04.766128	\N	\N	\N
5453	2014	en	Other obligations	f	approved	2025-08-07 04:03:04.848647	2025-08-07 04:03:04.848647	\N	\N	\N
5454	2014	ru	Other obligations	f	approved	2025-08-07 04:03:04.934384	2025-08-07 04:03:04.934384	\N	\N	\N
5455	2015	he	מקור הכנסה עיקרי	f	approved	2025-08-07 04:03:05.182429	2025-08-07 04:03:05.182429	\N	\N	\N
5456	2015	en	Main source of income	f	approved	2025-08-07 04:03:05.26644	2025-08-07 04:03:05.26644	\N	\N	\N
5457	2015	ru	Main source of income	f	approved	2025-08-07 04:03:05.349526	2025-08-07 04:03:05.349526	\N	\N	\N
5458	2016	he	בחר את מקור ההכנסה העיקרי שלך	f	approved	2025-08-07 04:03:05.595452	2025-08-07 04:03:05.595452	\N	\N	\N
5459	2016	en	Select your main source of income	f	approved	2025-08-07 04:03:05.67822	2025-08-07 04:03:05.67822	\N	\N	\N
5460	2016	ru	Select your main source of income	f	approved	2025-08-07 04:03:05.762599	2025-08-07 04:03:05.762599	\N	\N	\N
5461	2017	he	הכנסה נוספת	f	approved	2025-08-07 04:03:06.010324	2025-08-07 04:03:06.010324	\N	\N	\N
5462	2017	en	Additional income	f	approved	2025-08-07 04:03:06.092377	2025-08-07 04:03:06.092377	\N	\N	\N
5463	2017	ru	Additional income	f	approved	2025-08-07 04:03:06.176445	2025-08-07 04:03:06.176445	\N	\N	\N
5464	2018	he	האם יש לך הכנסה נוספת?	f	approved	2025-08-07 04:03:06.424298	2025-08-07 04:03:06.424298	\N	\N	\N
5465	2018	en	Do you have additional income?	f	approved	2025-08-07 04:03:06.506387	2025-08-07 04:03:06.506387	\N	\N	\N
5466	2018	ru	Do you have additional income?	f	approved	2025-08-07 04:03:06.59036	2025-08-07 04:03:06.59036	\N	\N	\N
5467	2019	he	התחייבויות קיימות	f	approved	2025-08-07 04:03:06.839442	2025-08-07 04:03:06.839442	\N	\N	\N
5468	2019	en	Existing obligations	f	approved	2025-08-07 04:03:06.923192	2025-08-07 04:03:06.923192	\N	\N	\N
5469	2019	ru	Existing obligations	f	approved	2025-08-07 04:03:07.007379	2025-08-07 04:03:07.007379	\N	\N	\N
5470	2020	he	האם יש לך חובות או התחייבויות קיימות?	f	approved	2025-08-07 04:03:07.265529	2025-08-07 04:03:07.265529	\N	\N	\N
5471	2020	en	Do you have existing debts or obligations?	f	approved	2025-08-07 04:03:07.349404	2025-08-07 04:03:07.349404	\N	\N	\N
5472	2020	ru	Do you have existing debts or obligations?	f	approved	2025-08-07 04:03:07.431462	2025-08-07 04:03:07.431462	\N	\N	\N
5473	2021	he	שלב 3 - פרטי הכנסה והתחייבויות	f	approved	2025-08-07 04:03:07.680439	2025-08-07 04:03:07.680439	\N	\N	\N
5474	2021	en	Step 3 - Income and Obligations Details	f	approved	2025-08-07 04:03:07.767417	2025-08-07 04:03:07.767417	\N	\N	\N
5475	2021	ru	Step 3 - Income and Obligations Details	f	approved	2025-08-07 04:03:07.852443	2025-08-07 04:03:07.852443	\N	\N	\N
5491	2037	en	Field of Activity	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5492	2038	en	Select your field of activity	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5493	2039	en	Technology / High-tech	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5494	2040	en	Healthcare & Medicine	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5495	2041	en	Education & Training	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5496	2042	en	Finance & Banking	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5497	2043	en	Real Estate	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5498	2044	en	Construction & Engineering	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5499	2045	en	Retail & Commerce	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5500	2046	en	Manufacturing & Industry	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5501	2047	en	Government & Public Sector	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5502	2048	en	Transportation & Logistics	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5503	2049	en	Consulting & Professional Services	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5504	2050	en	Entertainment & Media	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5505	2051	en	Other	t	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5506	2037	he	תחום פעילות	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5507	2038	he	בחר את תחום הפעילות שלך	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5508	2039	he	טכנולוגיה / היי-טק	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5509	2040	he	בריאות ורפואה	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5510	2041	he	חינוך והדרכה	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5511	2042	he	פיננסים ובנקאות	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5512	2043	he	נדלן	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5513	2044	he	בנייה והנדסה	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5514	2045	he	קמעונאות ומסחר	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5515	2046	he	ייצור ותעשייה	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5516	2047	he	ממשלה ומגזר ציבורי	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5517	2048	he	תחבורה ולוגיסטיקה	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5518	2049	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5519	2050	he	בידור ותקשורת	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5520	2051	he	אחר	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5521	2037	ru	Сфера деятельности	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5522	2038	ru	Выберите вашу сферу деятельности	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5523	2039	ru	Технологии / Хай-тек	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5524	2040	ru	Здравоохранение и медицина	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5525	2041	ru	Образование и обучение	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5526	2042	ru	Финансы и банковское дело	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5527	2043	ru	Недвижимость	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5528	2044	ru	Строительство и инжиниринг	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5529	2045	ru	Розничная торговля	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5530	2046	ru	Производство и промышленность	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5531	2047	ru	Правительство и госсектор	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5532	2048	ru	Транспорт и логистика	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5533	2049	ru	Консалтинг и профуслуги	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5534	2050	ru	Развлечения и СМИ	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5535	2051	ru	Другое	f	approved	2025-08-07 04:24:57.772949	2025-08-07 04:24:57.772949	\N	\N	\N
5536	2052	en	Existing obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5537	2053	en	Do you have existing debts or obligations?	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5538	2054	en	No obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5539	2055	en	Credit card debt	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5540	2056	en	Bank loan	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5541	2057	en	Consumer credit	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5542	2058	en	Other obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5543	2059	he	התחייבויות קיימות	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5544	2059	en	Existing obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5545	2059	ru	Existing obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5546	2060	he	האם יש לך חובות או התחייבויות קיימות?	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5547	2060	en	Do you have existing debts or obligations?	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5548	2060	ru	Do you have existing debts or obligations?	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5549	2061	he	אין התחייבויות	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5550	2061	en	No obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5551	2061	ru	No obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5552	2062	he	חוב כרטיס אשראי	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5553	2062	en	Credit card debt	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5554	2062	ru	Credit card debt	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5555	2063	he	הלוואה בנקאית	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5556	2063	en	Bank loan	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5557	2063	ru	Bank loan	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5558	2064	he	אשראי צרכני	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5559	2064	en	Consumer credit	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5560	2064	ru	Consumer credit	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5561	2065	he	התחייבויות אחרות	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5562	2065	en	Other obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5563	2065	ru	Other obligations	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5564	2066	en	Field of Activity	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5565	2066	he	תחום פעילות	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5566	2066	ru	Сфера деятельности	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5567	2067	en	Select your field of activity	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5568	2067	he	בחר את תחום הפעילות שלך	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5569	2067	ru	Выберите вашу сферу деятельности	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5570	2068	en	Technology / High-tech	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5571	2068	he	טכנולוגיה / היי-טק	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5572	2068	ru	Технологии / Хай-тек	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5573	2069	en	Healthcare & Medicine	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5574	2069	he	בריאות ורפואה	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5575	2069	ru	Здравоохранение и медицина	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5576	2070	en	Education & Training	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5577	2070	he	חינוך והדרכה	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5578	2070	ru	Образование и обучение	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5579	2071	en	Finance & Banking	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5580	2071	he	פיננסים ובנקאות	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5581	2071	ru	Финансы и банковское дело	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5582	2072	en	Real Estate	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5583	2072	he	נדלן	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5584	2072	ru	Недвижимость	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5585	2073	en	Construction & Engineering	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5586	2073	he	בנייה והנדסה	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5587	2073	ru	Строительство и инжиниринг	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5588	2074	en	Retail & Commerce	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5589	2074	he	קמעונאות ומסחר	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5590	2074	ru	Розничная торговля	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5591	2075	en	Manufacturing & Industry	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5592	2075	he	ייצור ותעשייה	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5593	2075	ru	Производство и промышленность	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5594	2076	en	Government & Public Sector	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5595	2076	he	ממשלה ומגזר ציבורי	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5596	2076	ru	Правительство и госсектор	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5597	2077	en	Transportation & Logistics	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5598	2077	he	תחבורה ולוגיסטיקה	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5599	2077	ru	Транспорт и логистика	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5600	2078	en	Consulting & Professional Services	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5601	2078	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5602	2078	ru	Консалтинг и профуслуги	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5603	2079	en	Entertainment & Media	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5604	2079	he	בידור ותקשורת	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5605	2079	ru	Развлечения и СМИ	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5606	2080	en	Other	t	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5607	2080	he	אחר	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5608	2080	ru	Другое	f	approved	2025-08-07 04:26:23.378562	2025-08-07 04:26:23.378562	\N	\N	\N
5609	2081	he	בנק הפועלים	f	approved	2025-08-07 08:15:51.741847	2025-08-07 08:15:51.741847	\N	\N	\N
5610	2081	ru	Банк Апоалим	f	approved	2025-08-07 08:15:51.916956	2025-08-07 08:15:51.916956	\N	\N	\N
5611	2081	en	Bank Hapoalim	f	approved	2025-08-07 08:15:52.029606	2025-08-07 08:15:52.029606	\N	\N	\N
5612	2082	he	בנק לאומי	f	approved	2025-08-07 08:15:52.317075	2025-08-07 08:15:52.317075	\N	\N	\N
5613	2082	ru	Банк Леуми	f	approved	2025-08-07 08:15:52.437316	2025-08-07 08:15:52.437316	\N	\N	\N
5614	2082	en	Bank Leumi	f	approved	2025-08-07 08:15:52.557334	2025-08-07 08:15:52.557334	\N	\N	\N
5615	2083	he	בנק דיסקונט	f	approved	2025-08-07 08:15:52.816645	2025-08-07 08:15:52.816645	\N	\N	\N
5616	2083	ru	Банк Дисконт	f	approved	2025-08-07 08:15:52.969365	2025-08-07 08:15:52.969365	\N	\N	\N
5617	2083	en	Bank Discount	f	approved	2025-08-07 08:15:53.136449	2025-08-07 08:15:53.136449	\N	\N	\N
5618	2084	he	בנק מזרחי טפחות	f	approved	2025-08-07 08:15:53.378083	2025-08-07 08:15:53.378083	\N	\N	\N
5619	2084	ru	Банк Мизрахи	f	approved	2025-08-07 08:15:53.556419	2025-08-07 08:15:53.556419	\N	\N	\N
5620	2084	en	Bank Mizrahi	f	approved	2025-08-07 08:15:53.75908	2025-08-07 08:15:53.75908	\N	\N	\N
5621	2085	he	בנק אחר	f	approved	2025-08-07 08:15:54.076845	2025-08-07 08:15:54.076845	\N	\N	\N
5622	2085	ru	Другой банк	f	approved	2025-08-07 08:15:54.236522	2025-08-07 08:15:54.236522	\N	\N	\N
5623	2085	en	Other Bank	f	approved	2025-08-07 08:15:54.37672	2025-08-07 08:15:54.37672	\N	\N	\N
5624	2087	en	Do you have existing financial obligations?	f	approved	2025-08-07 13:28:56.532536	2025-08-07 13:40:39.126664	\N	\N	\N
5627	2088	en	Select your financial obligations	f	approved	2025-08-07 13:28:57.385841	2025-08-07 13:40:39.786603	\N	\N	\N
5625	2087	he	האם יש לכם התחייבות כספית קיימת?	f	approved	2025-08-07 13:28:56.729471	2025-08-07 13:40:40.372906	\N	\N	\N
5628	2088	he	בחרו את ההתחייבויות הכספיות שלכם	f	approved	2025-08-07 13:28:57.537464	2025-08-07 13:40:40.772746	\N	\N	\N
5626	2087	ru	Есть ли у вас существующие финансовые обязательства?	f	approved	2025-08-07 13:28:57.058916	2025-08-07 13:40:41.173912	\N	\N	\N
5629	2088	ru	Выберите ваши финансовые обязательства	f	approved	2025-08-07 13:28:57.677705	2025-08-07 13:40:41.573573	\N	\N	\N
5630	2090	en	No financial obligations	f	approved	2025-08-07 13:43:38.895545	2025-08-07 13:43:38.895545	\N	\N	\N
5631	2090	he	אין התחייבויות כספיות	f	approved	2025-08-07 13:43:39.413402	2025-08-07 13:43:39.413402	\N	\N	\N
5632	2090	ru	Нет финансовых обязательств	f	approved	2025-08-07 13:43:39.987105	2025-08-07 13:43:39.987105	\N	\N	\N
5633	2091	en	Bank loan	f	approved	2025-08-07 13:43:40.483021	2025-08-07 13:43:40.483021	\N	\N	\N
5634	2091	he	הלוואה בנקאית	f	approved	2025-08-07 13:43:40.967697	2025-08-07 13:43:40.967697	\N	\N	\N
5635	2091	ru	Банковский кредит	f	approved	2025-08-07 13:43:41.386841	2025-08-07 13:43:41.386841	\N	\N	\N
5636	2092	en	Consumer credit	f	approved	2025-08-07 13:43:42.016944	2025-08-07 13:43:42.016944	\N	\N	\N
5637	2092	he	אשראי צרכני	f	approved	2025-08-07 13:43:42.453824	2025-08-07 13:43:42.453824	\N	\N	\N
5638	2092	ru	Потребительский кредит	f	approved	2025-08-07 13:43:43.028658	2025-08-07 13:43:43.028658	\N	\N	\N
5639	2093	en	Credit card debt	f	approved	2025-08-07 13:43:43.580845	2025-08-07 13:43:43.580845	\N	\N	\N
5640	2093	he	חובות כרטיסי אשראי	f	approved	2025-08-07 13:43:44.174951	2025-08-07 13:43:44.174951	\N	\N	\N
5641	2093	ru	Долг по кредитной карте	f	approved	2025-08-07 13:43:44.700793	2025-08-07 13:43:44.700793	\N	\N	\N
5642	2094	en	Financial Obligations	f	approved	2025-08-07 13:45:18.807723	2025-08-07 13:45:18.807723	\N	\N	\N
5643	2094	he	התחייבויות כספיות	f	approved	2025-08-07 13:45:19.181994	2025-08-07 13:45:19.181994	\N	\N	\N
5644	2094	ru	Финансовые обязательства	f	approved	2025-08-07 13:45:19.617544	2025-08-07 13:45:19.617544	\N	\N	\N
5645	2095	he	מתי תזדקק למשכנתא?	f	approved	2025-08-08 08:42:30.799023	2025-08-08 08:42:30.799023	\N	\N	\N
5646	2096	he	בחר מסגרת זמן	f	approved	2025-08-08 08:42:30.891789	2025-08-08 08:42:30.891789	\N	\N	\N
5647	2097	he	תוך 3 חודשים	f	approved	2025-08-08 08:42:30.977789	2025-08-08 08:42:30.977789	\N	\N	\N
5648	2098	he	3-6 חודשים	f	approved	2025-08-08 08:42:31.06069	2025-08-08 08:42:31.06069	\N	\N	\N
5649	2099	he	6-12 חודשים	f	approved	2025-08-08 08:42:31.166684	2025-08-08 08:42:31.166684	\N	\N	\N
5650	2100	he	מעל 12 חודשים	f	approved	2025-08-08 08:42:31.268796	2025-08-08 08:42:31.268796	\N	\N	\N
5651	2095	en	When do you need the mortgage?	f	approved	2025-08-08 08:42:31.36478	2025-08-08 08:42:31.36478	\N	\N	\N
5652	2096	en	Select timeframe	f	approved	2025-08-08 08:42:31.500845	2025-08-08 08:42:31.500845	\N	\N	\N
5653	2097	en	Within 3 months	f	approved	2025-08-08 08:42:31.634699	2025-08-08 08:42:31.634699	\N	\N	\N
5654	2098	en	3-6 months	f	approved	2025-08-08 08:42:31.736784	2025-08-08 08:42:31.736784	\N	\N	\N
5655	2099	en	6-12 months	f	approved	2025-08-08 08:42:31.846827	2025-08-08 08:42:31.846827	\N	\N	\N
5656	2100	en	Over 12 months	f	approved	2025-08-08 08:42:32.122001	2025-08-08 08:42:32.122001	\N	\N	\N
5657	2095	ru	Когда вам нужна ипотека?	f	approved	2025-08-08 08:42:32.243802	2025-08-08 08:42:32.243802	\N	\N	\N
5658	2096	ru	Выберите временные рамки	f	approved	2025-08-08 08:42:32.335802	2025-08-08 08:42:32.335802	\N	\N	\N
5659	2097	ru	В течение 3 месяцев	f	approved	2025-08-08 08:42:32.417932	2025-08-08 08:42:32.417932	\N	\N	\N
5660	2098	ru	3-6 месяцев	f	approved	2025-08-08 08:42:32.537885	2025-08-08 08:42:32.537885	\N	\N	\N
5661	2099	ru	6-12 месяцев	f	approved	2025-08-08 08:42:32.637933	2025-08-08 08:42:32.637933	\N	\N	\N
5662	2100	ru	Более 12 месяцев	f	approved	2025-08-08 08:42:33.289664	2025-08-08 08:42:33.289664	\N	\N	\N
5663	2101	he	האם מדובר בדירה ראשונה?	f	approved	2025-08-08 08:42:33.394881	2025-08-08 08:42:33.394881	\N	\N	\N
5664	2102	he	בחר סטטוס הנכס	f	approved	2025-08-08 08:42:33.493647	2025-08-08 08:42:33.493647	\N	\N	\N
5665	2103	he	כן, דירה ראשונה	f	approved	2025-08-08 08:42:33.580807	2025-08-08 08:42:33.580807	\N	\N	\N
5666	2104	he	לא, יש לי נכס נוסף	f	approved	2025-08-08 08:42:33.708646	2025-08-08 08:42:33.708646	\N	\N	\N
5667	2105	he	השקעה	f	approved	2025-08-08 08:42:33.810081	2025-08-08 08:42:33.810081	\N	\N	\N
5668	2101	en	Is this a first home?	f	approved	2025-08-08 08:42:33.90677	2025-08-08 08:42:33.90677	\N	\N	\N
5669	2102	en	Select property status	f	approved	2025-08-08 08:42:34.034836	2025-08-08 08:42:34.034836	\N	\N	\N
5670	2103	en	Yes, first home	f	approved	2025-08-08 08:42:34.186837	2025-08-08 08:42:34.186837	\N	\N	\N
5671	2104	en	No, I have additional property	f	approved	2025-08-08 08:42:34.319727	2025-08-08 08:42:34.319727	\N	\N	\N
5672	2105	en	Investment	f	approved	2025-08-08 08:42:34.437759	2025-08-08 08:42:34.437759	\N	\N	\N
5673	2101	ru	Это первый дом?	f	approved	2025-08-08 08:42:34.54374	2025-08-08 08:42:34.54374	\N	\N	\N
5674	2102	ru	Выберите статус недвижимости	f	approved	2025-08-08 08:42:34.644733	2025-08-08 08:42:34.644733	\N	\N	\N
5675	2103	ru	Да, первый дом	f	approved	2025-08-08 08:42:34.74173	2025-08-08 08:42:34.74173	\N	\N	\N
5676	2104	ru	Нет, у меня есть дополнительная недвижимость	f	approved	2025-08-08 08:42:34.831848	2025-08-08 08:42:34.831848	\N	\N	\N
5677	2105	ru	Инвестиция	f	approved	2025-08-08 08:42:34.917988	2025-08-08 08:42:34.917988	\N	\N	\N
350	236	he	אין התחייבויות	f	approved	2025-07-20 11:58:55.22593	2025-08-12 06:16:52.212939	1	\N	\N
353	237	he	הלוואת בנק	f	approved	2025-07-20 11:58:55.752477	2025-08-12 06:16:52.212939	1	\N	\N
359	239	he	כרטיס אשראי	f	approved	2025-07-20 11:58:56.94863	2025-08-12 06:16:52.212939	1	\N	\N
356	238	he	הלוואה פרטית	f	approved	2025-07-20 11:58:56.459901	2025-08-12 06:16:52.212939	1	\N	\N
5682	2117	he	התחייבויות	f	draft	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5683	2117	en	Obligations	f	draft	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5684	2117	ru	Обязательства	f	draft	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5685	2118	en	Other	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5686	2118	he	אחר	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5687	2118	ru	Другое	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5688	2119	en	Bank loan	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5689	2119	ru	Банковский кредит	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5690	2119	he	הלוואת בנק	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5691	2120	en	Consumer credit	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5692	2120	ru	Потребительский кредит	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5693	2120	he	הלוואה פרטית	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5694	2121	en	Credit card debt	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5695	2121	ru	Долг по кредитной карте	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5696	2121	he	כרטיס אשראי	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5697	2122	en	No obligations	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5698	2122	ru	Нет обязательств	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5699	2122	he	אין התחייבויות	f	approved	2025-08-12 06:23:07.743564	2025-08-12 06:23:07.743564	\N	\N	\N
5700	2123	en	Do you have existing bank debts or financial obligations?	f	approved	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
5701	2123	he	האם יש לכם חובות בנקאיים או התחייבויות פיננסיות קיימות?	f	approved	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
5702	2123	ru	Есть ли банковские долги или финансовые обязательства?	f	approved	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
5703	2124	en	Select obligation type	f	approved	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
5704	2124	he	בחר סוג התחייבות	f	approved	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
5705	2124	ru	Выберите тип обязательства	f	approved	2025-08-12 06:23:45.914089	2025-08-12 06:23:45.914089	\N	\N	\N
5706	2125	he	אין התחייבויות	f	approved	2025-08-12 06:27:21.39955	2025-08-12 06:33:13.001358	\N	\N	\N
5707	2126	he	הלוואת בנק	f	approved	2025-08-12 06:27:21.39955	2025-08-12 06:33:13.001358	\N	\N	\N
5708	2127	he	כרטיס אשראי	f	approved	2025-08-12 06:27:21.39955	2025-08-12 06:33:13.001358	\N	\N	\N
5709	2128	he	הלוואה פרטית	f	approved	2025-08-12 06:27:21.39955	2025-08-12 06:33:13.001358	\N	\N	\N
5714	2135	en	Agriculture, Forestry, Fishing	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5715	2135	he	חקלאות, יערנות ודיג	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5716	2135	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5717	2149	en	Technology and Communications	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5718	2149	he	טכנולוגיה ותקשורת	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5719	2149	ru	Технологии и коммуникации	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5720	2142	en	Healthcare and Social Services	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5721	2142	he	בריאות ושירותים חברתיים	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5722	2142	ru	Здравоохранение и социальные услуги	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5723	2138	en	Education and Training	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5724	2138	he	חינוך והכשרה	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5725	2138	ru	Образование и обучение	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5726	2140	en	Finance and Banking	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5727	2140	he	פיננסים ובנקאות	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5728	2140	ru	Финансы и банковское дело	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5729	2147	en	Real Estate	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5730	2147	he	נדל"ן	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5731	2147	ru	Недвижимость	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5732	2146	en	Select field of activity	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5733	2146	he	בחר תחום פעילות	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5734	2146	ru	Выберите сферу деятельности	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5735	2143	en	Field of Activity	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5736	2143	he	תחום פעילות	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5737	2143	ru	Сфера деятельности	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5738	2136	en	Construction	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5739	2136	he	בנייה	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5740	2136	ru	Строительство	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5741	2148	en	Retail and Trade	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5742	2148	he	מסחר קמעונאי	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5743	2148	ru	Розничная торговля	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5744	2144	en	Manufacturing and Industry	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5745	2144	he	תעשייה וייצור	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5746	2144	ru	Производство и промышленность	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5747	2141	en	Government and Public Service	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5748	2141	he	ממשלה ושירות ציבורי	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5749	2141	ru	Государственная служба	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5750	2150	en	Transport and Logistics	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5751	2150	he	תחבורה ולוגיסטיקה	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5752	2150	ru	Транспорт и логистика	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5753	2137	en	Consulting and Professional Services	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5754	2137	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5755	2137	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5756	2139	en	Entertainment and Media	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5757	2139	he	בידור ומדיה	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5758	2139	ru	Развлечения и медиа	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5759	2145	en	Other	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5760	2145	he	אחר	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5761	2145	ru	Другое	f	approved	2025-08-12 06:57:00.759503	2025-08-12 06:57:00.759503	\N	\N	\N
5762	2156	en	Financial Obligations	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5763	2156	he	התחייבויות כספיות	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5764	2156	ru	Финансовые обязательства	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5765	2157	en	No financial obligations	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5766	2157	he	אין התחייבויות כספיות	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5767	2157	ru	Нет финансовых обязательств	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5768	2158	en	Bank loan	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5769	2158	he	הלוואה בנקאית	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5770	2158	ru	Банковский кредит	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5771	2159	en	Consumer credit	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5772	2159	he	אשראי צרכני	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5773	2159	ru	Потребительский кредит	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5774	2160	en	Credit card debt	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5775	2160	he	חובות כרטיסי אשראי	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5776	2160	ru	Долг по кредитной карте	f	approved	2025-08-12 07:14:40.440723	2025-08-12 07:14:40.440723	\N	\N	\N
5777	2161	he	בחר סוג התחייבות	f	approved	2025-08-12 07:27:36.390155	2025-08-12 07:27:36.390155	\N	\N	\N
5778	2162	en	Main source of income	f	approved	2025-08-13 06:13:32.37513	2025-08-13 06:14:21.624928	\N	\N	\N
5779	2162	he	מקור הכנסה עיקרי	f	approved	2025-08-13 06:13:32.482643	2025-08-13 06:14:21.755037	\N	\N	\N
5780	2162	ru	Основной источник дохода	f	approved	2025-08-13 06:13:32.664887	2025-08-13 06:14:21.897612	\N	\N	\N
5784	2171	en	Select main source of income	f	approved	2025-08-13 06:14:22.157547	2025-08-13 06:14:22.157547	\N	\N	\N
5785	2171	he	בחר מקור הכנסה עיקרי	f	approved	2025-08-13 06:14:22.337128	2025-08-13 06:14:22.337128	\N	\N	\N
5786	2171	ru	Выберите основной источник дохода	f	approved	2025-08-13 06:14:22.449654	2025-08-13 06:14:22.449654	\N	\N	\N
5787	2163	en	Employee	f	approved	2025-08-13 06:14:22.684858	2025-08-13 06:14:22.684858	\N	\N	\N
5788	2163	he	שכיר	f	approved	2025-08-13 06:14:22.852511	2025-08-13 06:14:22.852511	\N	\N	\N
5789	2163	ru	Работник по найму	f	approved	2025-08-13 06:14:22.952251	2025-08-13 06:14:22.952251	\N	\N	\N
5790	2164	en	Self-employed	f	approved	2025-08-13 06:14:23.164906	2025-08-13 06:14:23.164906	\N	\N	\N
5791	2164	he	עצמאי	f	approved	2025-08-13 06:14:23.267231	2025-08-13 06:14:23.267231	\N	\N	\N
5792	2164	ru	Самозанятый	f	approved	2025-08-13 06:14:23.370175	2025-08-13 06:14:23.370175	\N	\N	\N
5793	2165	en	Pension	f	approved	2025-08-13 06:14:23.579295	2025-08-13 06:14:23.579295	\N	\N	\N
5794	2165	he	פנסיה	f	approved	2025-08-13 06:14:23.687269	2025-08-13 06:14:23.687269	\N	\N	\N
5795	2165	ru	Пенсия	f	approved	2025-08-13 06:14:23.804414	2025-08-13 06:14:23.804414	\N	\N	\N
5796	2166	en	Unemployed	f	approved	2025-08-13 06:14:24.049523	2025-08-13 06:14:24.049523	\N	\N	\N
5797	2166	he	ללא הכנסה	f	approved	2025-08-13 06:14:24.166883	2025-08-13 06:14:24.166883	\N	\N	\N
5798	2166	ru	Безработный	f	approved	2025-08-13 06:14:24.289674	2025-08-13 06:14:24.289674	\N	\N	\N
5799	2167	en	Unpaid leave	f	approved	2025-08-13 06:14:24.502094	2025-08-13 06:14:24.502094	\N	\N	\N
5800	2167	he	חופשה ללא תשלום	f	approved	2025-08-13 06:14:24.609317	2025-08-13 06:14:24.609317	\N	\N	\N
5801	2167	ru	Отпуск без содержания	f	approved	2025-08-13 06:14:24.711957	2025-08-13 06:14:24.711957	\N	\N	\N
5802	2168	en	Student	f	approved	2025-08-13 06:14:24.994241	2025-08-13 06:14:24.994241	\N	\N	\N
5803	2168	he	סטודנט	f	approved	2025-08-13 06:14:25.102011	2025-08-13 06:14:25.102011	\N	\N	\N
5804	2168	ru	Студент	f	approved	2025-08-13 06:14:25.214339	2025-08-13 06:14:25.214339	\N	\N	\N
5805	2169	en	Other	f	approved	2025-08-13 06:14:25.484176	2025-08-13 06:14:25.484176	\N	\N	\N
5806	2169	he	אחר	f	approved	2025-08-13 06:14:25.632075	2025-08-13 06:14:25.632075	\N	\N	\N
5807	2169	ru	Другое	f	approved	2025-08-13 06:14:25.737008	2025-08-13 06:14:25.737008	\N	\N	\N
5811	2180	en	Employee	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5812	2180	he	עובד שכיר	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5813	2180	ru	Наемный работник	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5814	2181	ru	Самозанятый	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5815	2181	en	Self-employed	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5816	2181	he	עצמאי	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5817	2182	en	Pensioner	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5818	2182	he	פנסיונר	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5819	2182	ru	Пенсионер	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5820	2183	en	Student	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5821	2183	he	סטודנט	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5822	2183	ru	Студент	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5823	2184	en	Unpaid leave	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5824	2184	he	חופשה ללא תשלום	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5825	2184	ru	Неоплачиваемый отпуск	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5826	2185	en	Unemployed	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5827	2185	he	מובטל	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5828	2185	ru	Безработный	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5829	2186	en	Other	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5830	2186	he	אחר	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5831	2186	ru	Другое	f	approved	2025-08-13 06:58:00.576698	2025-08-13 06:58:00.576698	\N	\N	\N
5832	2187	he	הכנסה נוספת	f	draft	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5833	2187	en	Additional income	f	draft	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5834	2187	ru	Дополнительный доход	f	draft	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5835	2188	en	Additional salary	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5836	2188	he	שכר נוסף	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5837	2188	ru	Дополнительная зарплата	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5838	2189	en	Additional work	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5839	2189	he	עבודה נוספת	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5840	2189	ru	Дополнительная работа	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5841	2190	en	Property rental income	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5808	2179	he	מקור הכנסה עיקרי	f	draft	2025-08-13 06:58:00.576698	2025-08-13 08:57:17.937209	\N	\N	\N
5809	2179	en	Main Source of Income	f	draft	2025-08-13 06:58:00.576698	2025-08-13 08:57:18.237443	\N	\N	\N
5810	2179	ru	Основной источник дохода	f	draft	2025-08-13 06:58:00.576698	2025-08-13 08:57:18.463688	\N	\N	\N
5842	2190	he	הכנסה מהשכרת נכסים	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5843	2190	ru	Доход от аренды недвижимости	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5844	2191	en	Investment income	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5845	2191	he	הכנסה מהשקעות	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5846	2191	ru	Доход от инвестиций	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5847	2192	en	No additional income	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5848	2192	he	אין הכנסות נוספות	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5849	2192	ru	Нет дополнительных доходов	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5850	2193	en	Pension income	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5851	2193	he	קצבת פנסיה	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5852	2193	ru	Пенсионный доход	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5853	2194	en	Other	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5854	2194	he	אחר	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5855	2194	ru	Другое	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5856	2195	en	Do you have additional income?	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5857	2195	he	האם קיימות הכנסות נוספות?	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5858	2195	ru	Есть ли дополнительные доходы?	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5859	2196	en	Select additional income type	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5860	2196	he	בחר סוג הכנסה נוספת	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5861	2196	ru	Выберите тип дополнительного дохода	f	approved	2025-08-13 07:00:41.207307	2025-08-13 07:00:41.207307	\N	\N	\N
5862	2197	en	No obligations	f	approved	2025-08-13 07:07:15.688505	2025-08-13 07:07:15.688505	\N	\N	\N
5863	2197	he	אין התחייבויות	f	approved	2025-08-13 07:07:15.803843	2025-08-13 07:07:15.803843	\N	\N	\N
5864	2197	ru	Нет обязательств	f	approved	2025-08-13 07:07:16.006773	2025-08-13 07:07:16.006773	\N	\N	\N
5865	2198	en	Bank loan	f	approved	2025-08-13 07:07:16.233571	2025-08-13 07:07:16.233571	\N	\N	\N
5866	2198	he	הלוואת בנק	f	approved	2025-08-13 07:07:16.384241	2025-08-13 07:07:16.384241	\N	\N	\N
5867	2198	ru	Банковский кредит	f	approved	2025-08-13 07:07:16.496304	2025-08-13 07:07:16.496304	\N	\N	\N
5868	2199	en	Credit card debt	f	approved	2025-08-13 07:07:16.729558	2025-08-13 07:07:16.729558	\N	\N	\N
5869	2199	he	כרטיס אשראי	f	approved	2025-08-13 07:07:16.906326	2025-08-13 07:07:16.906326	\N	\N	\N
5870	2199	ru	Долг по кредитной карте	f	approved	2025-08-13 07:07:17.003656	2025-08-13 07:07:17.003656	\N	\N	\N
5871	2200	en	Consumer credit	f	approved	2025-08-13 07:07:17.211174	2025-08-13 07:07:17.211174	\N	\N	\N
5872	2200	he	הלוואה פרטית	f	approved	2025-08-13 07:07:17.336195	2025-08-13 07:07:17.336195	\N	\N	\N
5873	2200	ru	Потребительский кредит	f	approved	2025-08-13 07:07:17.453665	2025-08-13 07:07:17.453665	\N	\N	\N
5874	2201	en	Other	f	approved	2025-08-13 07:07:17.731438	2025-08-13 07:07:17.731438	\N	\N	\N
5875	2201	he	אחר	f	approved	2025-08-13 07:07:17.828977	2025-08-13 07:07:17.828977	\N	\N	\N
5876	2201	ru	Другое	f	approved	2025-08-13 07:07:17.936543	2025-08-13 07:07:17.936543	\N	\N	\N
5880	2217	en	Field of Activity	f	approved	2025-08-13 08:28:39.76934	2025-08-13 08:28:39.76934	\N	\N	\N
5881	2217	he	תחום פעילות	f	approved	2025-08-13 08:28:39.871945	2025-08-13 08:28:39.871945	\N	\N	\N
5882	2217	ru	Сфера деятельности	f	approved	2025-08-13 08:28:39.989591	2025-08-13 08:28:39.989591	\N	\N	\N
5883	2218	en	Technology and Communications	f	approved	2025-08-13 08:28:40.337349	2025-08-13 08:28:40.337349	\N	\N	\N
5884	2218	he	טכנולוגיה ותקשורת	f	approved	2025-08-13 08:28:40.454989	2025-08-13 08:28:40.454989	\N	\N	\N
5885	2218	ru	Технологии и коммуникации	f	approved	2025-08-13 08:28:40.594643	2025-08-13 08:28:40.594643	\N	\N	\N
5886	2219	en	Healthcare and Social Services	f	approved	2025-08-13 08:28:40.894522	2025-08-13 08:28:40.894522	\N	\N	\N
5887	2219	he	בריאות ושירותים חברתיים	f	approved	2025-08-13 08:28:40.994434	2025-08-13 08:28:40.994434	\N	\N	\N
5888	2219	ru	Здравоохранение и социальные услуги	f	approved	2025-08-13 08:28:41.089744	2025-08-13 08:28:41.089744	\N	\N	\N
5889	2220	en	Education and Training	f	approved	2025-08-13 08:28:41.384629	2025-08-13 08:28:41.384629	\N	\N	\N
5890	2220	he	חינוך והכשרה	f	approved	2025-08-13 08:28:41.484382	2025-08-13 08:28:41.484382	\N	\N	\N
5891	2220	ru	Образование и обучение	f	approved	2025-08-13 08:28:41.579516	2025-08-13 08:28:41.579516	\N	\N	\N
5892	2221	en	Finance and Banking	f	approved	2025-08-13 08:28:41.875145	2025-08-13 08:28:41.875145	\N	\N	\N
5893	2221	he	פיננסים ובנקאות	f	approved	2025-08-13 08:28:41.979631	2025-08-13 08:28:41.979631	\N	\N	\N
5894	2221	ru	Финансы и банковское дело	f	approved	2025-08-13 08:28:42.077119	2025-08-13 08:28:42.077119	\N	\N	\N
5895	2222	en	Real Estate	f	approved	2025-08-13 08:28:42.406815	2025-08-13 08:28:42.406815	\N	\N	\N
5896	2222	he	נדל"ן	f	approved	2025-08-13 08:28:42.499408	2025-08-13 08:28:42.499408	\N	\N	\N
5897	2222	ru	Недвижимость	f	approved	2025-08-13 08:28:42.62272	2025-08-13 08:28:42.62272	\N	\N	\N
5898	2223	en	Construction	f	approved	2025-08-13 08:28:42.923932	2025-08-13 08:28:42.923932	\N	\N	\N
5899	2223	he	בנייה	f	approved	2025-08-13 08:28:43.02414	2025-08-13 08:28:43.02414	\N	\N	\N
5900	2223	ru	Строительство	f	approved	2025-08-13 08:28:43.151791	2025-08-13 08:28:43.151791	\N	\N	\N
5901	2224	en	Retail and Trade	f	approved	2025-08-13 08:28:43.516696	2025-08-13 08:28:43.516696	\N	\N	\N
5902	2224	he	מסחר קמעונאי	f	approved	2025-08-13 08:28:43.649256	2025-08-13 08:28:43.649256	\N	\N	\N
5903	2224	ru	Розничная торговля	f	approved	2025-08-13 08:28:43.741964	2025-08-13 08:28:43.741964	\N	\N	\N
5904	2225	en	Manufacturing and Industry	f	approved	2025-08-13 08:28:44.049342	2025-08-13 08:28:44.049342	\N	\N	\N
5905	2225	he	תעשייה וייצור	f	approved	2025-08-13 08:28:44.145426	2025-08-13 08:28:44.145426	\N	\N	\N
5906	2225	ru	Производство и промышленность	f	approved	2025-08-13 08:28:44.26157	2025-08-13 08:28:44.26157	\N	\N	\N
5907	2226	en	Government and Public Service	f	approved	2025-08-13 08:28:44.561725	2025-08-13 08:28:44.561725	\N	\N	\N
5908	2226	he	ממשלה ושירות ציבורי	f	approved	2025-08-13 08:28:44.684245	2025-08-13 08:28:44.684245	\N	\N	\N
5909	2226	ru	Государственная служба	f	approved	2025-08-13 08:28:44.789173	2025-08-13 08:28:44.789173	\N	\N	\N
5910	2227	en	Transport and Logistics	f	approved	2025-08-13 08:28:45.089227	2025-08-13 08:28:45.089227	\N	\N	\N
5911	2227	he	תחבורה ולוגיסטיקה	f	approved	2025-08-13 08:28:45.204347	2025-08-13 08:28:45.204347	\N	\N	\N
5912	2227	ru	Транспорт и логистика	f	approved	2025-08-13 08:28:45.301815	2025-08-13 08:28:45.301815	\N	\N	\N
5913	2228	en	Consulting and Professional Services	f	approved	2025-08-13 08:28:45.589268	2025-08-13 08:28:45.589268	\N	\N	\N
5914	2228	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-13 08:28:45.706753	2025-08-13 08:28:45.706753	\N	\N	\N
5915	2228	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-13 08:28:45.864287	2025-08-13 08:28:45.864287	\N	\N	\N
5916	2229	en	Entertainment and Media	f	approved	2025-08-13 08:28:46.17922	2025-08-13 08:28:46.17922	\N	\N	\N
5917	2229	he	בידור ומדיה	f	approved	2025-08-13 08:28:46.284142	2025-08-13 08:28:46.284142	\N	\N	\N
5918	2229	ru	Развлечения и медиа	f	approved	2025-08-13 08:28:46.384397	2025-08-13 08:28:46.384397	\N	\N	\N
5919	2230	en	Agriculture, Forestry, Fishing	f	approved	2025-08-13 08:28:46.711689	2025-08-13 08:28:46.711689	\N	\N	\N
5920	2230	he	חקלאות, יערנות ודיג	f	approved	2025-08-13 08:28:46.811564	2025-08-13 08:28:46.811564	\N	\N	\N
5921	2230	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-13 08:28:46.914438	2025-08-13 08:28:46.914438	\N	\N	\N
5922	2231	en	Other	f	approved	2025-08-13 08:28:47.194209	2025-08-13 08:28:47.194209	\N	\N	\N
5923	2231	he	אחר	f	approved	2025-08-13 08:28:47.289202	2025-08-13 08:28:47.289202	\N	\N	\N
5924	2231	ru	Другое	f	approved	2025-08-13 08:28:47.384215	2025-08-13 08:28:47.384215	\N	\N	\N
5925	2232	en	Select field of activity	f	approved	2025-08-13 08:28:47.834189	2025-08-13 08:28:47.834189	\N	\N	\N
5926	2232	he	בחר תחום פעילות	f	approved	2025-08-13 08:28:47.934347	2025-08-13 08:28:47.934347	\N	\N	\N
5927	2232	ru	Выберите сферу деятельности	f	approved	2025-08-13 08:28:48.049445	2025-08-13 08:28:48.049445	\N	\N	\N
5928	2233	he	מקור הכנסה עיקרי	f	approved	2025-08-13 08:56:39.263035	2025-08-13 08:56:39.263035	\N	\N	\N
5929	2233	en	Main Source of Income	f	approved	2025-08-13 08:56:39.394934	2025-08-13 08:56:39.394934	\N	\N	\N
5930	2233	ru	Основной источник дохода	f	approved	2025-08-13 08:56:39.509634	2025-08-13 08:56:39.509634	\N	\N	\N
5931	2234	he	בחר מקור הכנסה עיקרי	f	approved	2025-08-13 08:56:51.547695	2025-08-13 08:57:18.77228	\N	\N	\N
5932	2234	en	Select main source of income	f	approved	2025-08-13 08:56:51.742994	2025-08-13 08:57:18.914501	\N	\N	\N
5933	2234	ru	Выберите основной источник дохода	f	approved	2025-08-13 08:56:51.927321	2025-08-13 08:57:19.072423	\N	\N	\N
5940	2237	he	מקור הכנסה עיקרי	f	approved	2025-08-13 08:58:16.954627	2025-08-13 08:58:16.954627	\N	\N	\N
5941	2237	en	Main Source of Income	f	approved	2025-08-13 08:58:17.090089	2025-08-13 08:58:17.090089	\N	\N	\N
5942	2237	ru	Основной источник дохода	f	approved	2025-08-13 08:58:17.212241	2025-08-13 08:58:17.212241	\N	\N	\N
5943	2238	en	Increase Loan Amount	f	approved	2025-08-13 09:24:59.149658	2025-08-13 09:24:59.149658	\N	\N	\N
5944	2238	he	הגדלת סכום ההלוואה	f	approved	2025-08-13 09:24:59.281755	2025-08-13 09:24:59.281755	\N	\N	\N
5945	2238	ru	Увеличить сумму кредита	f	approved	2025-08-13 09:24:59.403611	2025-08-13 09:24:59.403611	\N	\N	\N
5946	2239	en	The sum of balances in programs ({{sumBalance}}) must equal the total mortgage balance ({{fullBalance}}). Missing: {{notEnoughBalance}}	f	approved	2025-08-13 09:46:44.644089	2025-08-13 09:46:44.644089	\N	\N	\N
5947	2239	he	סכום היתרות בתוכניות ({{sumBalance}}) חייב להיות שווה ליתרת המשכנתא הכוללת ({{fullBalance}}). חסרים: {{notEnoughBalance}}	f	approved	2025-08-13 09:46:44.741565	2025-08-13 09:46:44.741565	\N	\N	\N
5948	2239	ru	Сумма остатков в программах ({{sumBalance}}) должна равняться общему остатку по ипотеке ({{fullBalance}}). Не хватает: {{notEnoughBalance}}	f	approved	2025-08-13 09:46:44.866874	2025-08-13 09:46:44.866874	\N	\N	\N
5949	2240	en	No additional income	f	approved	2025-08-13 09:56:03.536995	2025-08-13 09:56:03.536995	\N	\N	\N
5950	2240	he	אין הכנסות נוספות	f	approved	2025-08-13 09:56:03.659553	2025-08-13 09:56:03.659553	\N	\N	\N
5951	2240	ru	Нет дополнительного дохода	f	approved	2025-08-13 09:56:03.764644	2025-08-13 09:56:03.764644	\N	\N	\N
5952	2241	en	Additional salary	f	approved	2025-08-13 09:56:04.034709	2025-08-13 09:56:04.034709	\N	\N	\N
5953	2241	he	שכר נוסף	f	approved	2025-08-13 09:56:04.164614	2025-08-13 09:56:04.164614	\N	\N	\N
5954	2241	ru	Дополнительная зарплата	f	approved	2025-08-13 09:56:04.264483	2025-08-13 09:56:04.264483	\N	\N	\N
5955	2242	en	Additional work	f	approved	2025-08-13 09:56:04.492116	2025-08-13 09:56:04.492116	\N	\N	\N
5956	2242	he	עבודה נוספת	f	approved	2025-08-13 09:56:04.622303	2025-08-13 09:56:04.622303	\N	\N	\N
5957	2242	ru	Дополнительная работа	f	approved	2025-08-13 09:56:04.729193	2025-08-13 09:56:04.729193	\N	\N	\N
5958	2243	en	Investment income	f	approved	2025-08-13 09:56:04.951813	2025-08-13 09:56:04.951813	\N	\N	\N
5959	2243	he	הכנסה מהשקעות	f	approved	2025-08-13 09:56:05.066785	2025-08-13 09:56:05.066785	\N	\N	\N
5960	2243	ru	Доход от инвестиций	f	approved	2025-08-13 09:56:05.209261	2025-08-13 09:56:05.209261	\N	\N	\N
5961	2244	en	Pension	f	approved	2025-08-13 09:56:05.479417	2025-08-13 09:56:05.479417	\N	\N	\N
5962	2244	he	קצבת פנסיה	f	approved	2025-08-13 09:56:05.584313	2025-08-13 09:56:05.584313	\N	\N	\N
5963	2244	ru	Пенсия	f	approved	2025-08-13 09:56:05.684362	2025-08-13 09:56:05.684362	\N	\N	\N
5964	2245	en	Property rental income	f	approved	2025-08-13 09:56:05.90928	2025-08-13 09:56:05.90928	\N	\N	\N
5965	2245	he	הכנסה מהשכרת נכסים	f	approved	2025-08-13 09:56:06.019274	2025-08-13 09:56:06.019274	\N	\N	\N
5966	2245	ru	Доход от аренды недвижимости	f	approved	2025-08-13 09:56:06.129759	2025-08-13 09:56:06.129759	\N	\N	\N
5967	2246	en	Other	f	approved	2025-08-13 09:56:06.38261	2025-08-13 09:56:06.38261	\N	\N	\N
5968	2246	he	אחר	f	approved	2025-08-13 09:56:06.554248	2025-08-13 09:56:06.554248	\N	\N	\N
5969	2246	ru	Другое	f	approved	2025-08-13 09:56:06.666957	2025-08-13 09:56:06.666957	\N	\N	\N
5970	2247	en	Do you have additional income sources?	f	approved	2025-08-13 09:56:06.919292	2025-08-13 09:56:06.919292	\N	\N	\N
5971	2247	he	האם קיימות הכנסות נוספות?	f	approved	2025-08-13 09:56:07.036806	2025-08-13 09:56:07.036806	\N	\N	\N
5972	2247	ru	Есть ли у вас дополнительные источники дохода?	f	approved	2025-08-13 09:56:07.156941	2025-08-13 09:56:07.156941	\N	\N	\N
5973	2248	en	Select additional income type	f	approved	2025-08-13 09:56:07.459382	2025-08-13 09:56:07.459382	\N	\N	\N
5974	2248	he	בחר סוג הכנסה נוספת	f	approved	2025-08-13 09:56:07.586828	2025-08-13 09:56:07.586828	\N	\N	\N
5975	2248	ru	Выберите тип дополнительного дохода	f	approved	2025-08-13 09:56:07.702054	2025-08-13 09:56:07.702054	\N	\N	\N
5976	2249	en	DD / MM / YY	f	approved	2025-08-13 09:57:11.446231	2025-08-13 09:57:11.446231	\N	\N	\N
5977	2249	he	יי / חח / שש	f	approved	2025-08-13 09:57:11.66867	2025-08-13 09:57:11.66867	\N	\N	\N
5978	2249	ru	ДД / ММ / ГГ	f	approved	2025-08-13 09:57:11.813872	2025-08-13 09:57:11.813872	\N	\N	\N
6123	2302	en	Agriculture, Forestry, Fishing	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6124	2302	he	חקלאות, יערנות ודיג	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6125	2302	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6126	2303	en	Technology and Communications	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6127	2303	he	טכנולוגיה ותקשורת	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6128	2303	ru	Технологии и коммуникации	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6129	2304	en	Healthcare and Social Services	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6130	2304	he	בריאות ושירותים חברתיים	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6131	2304	ru	Здравоохранение и социальные услуги	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6132	2305	en	Education and Training	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6133	2305	he	חינוך והכשרה	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6134	2305	ru	Образование и обучение	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6135	2306	en	Finance and Banking	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6136	2306	he	פיננסים ובנקאות	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6137	2306	ru	Финансы и банковское дело	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6138	2307	en	Real Estate	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6139	2307	he	נדל"ן	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6140	2307	ru	Недвижимость	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6141	2308	en	Select field of activity	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6142	2308	he	בחר תחום פעילות	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6143	2308	ru	Выберите сферу деятельности	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6144	2309	en	Field of Activity	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6145	2309	he	תחום פעילות	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6146	2309	ru	Сфера деятельности	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6147	2310	en	Construction	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6148	2310	he	בנייה	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6149	2310	ru	Строительство	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6150	2311	en	Retail and Trade	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6151	2311	he	מסחר קמעונאי	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6152	2311	ru	Розничная торговля	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6153	2312	en	Manufacturing and Industry	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6154	2312	he	תעשייה וייצור	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6155	2312	ru	Производство и промышленность	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6156	2313	en	Government and Public Service	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6157	2313	he	ממשלה ושירות ציבורי	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6158	2313	ru	Государственная служба	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6159	2314	en	Transport and Logistics	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6160	2314	he	תחבורה ולוגיסטיקה	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6161	2314	ru	Транспорт и логистика	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6162	2315	en	Consulting and Professional Services	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6163	2315	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6164	2315	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6165	2316	en	Entertainment and Media	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6166	2316	he	בידור ומדיה	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6167	2316	ru	Развлечения и медиа	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6168	2317	en	Other	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6169	2317	he	אחר	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6170	2317	ru	Другое	f	approved	2025-08-13 11:40:01.360528	2025-08-13 11:40:01.360528	\N	\N	\N
6171	2319	en	Agriculture, Forestry, Fishing	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6172	2319	he	חקלאות, יערנות ודיג	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6173	2319	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6174	2320	en	Technology and Communications	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6175	2320	he	טכנולוגיה ותקשורת	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6176	2320	ru	Технологии и коммуникации	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6177	2321	en	Healthcare and Social Services	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6178	2321	he	בריאות ושירותים חברתיים	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6179	2321	ru	Здравоохранение и социальные услуги	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6180	2322	en	Education and Training	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6181	2322	he	חינוך והכשרה	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6182	2322	ru	Образование и обучение	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6183	2323	en	Finance and Banking	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6184	2323	he	פיננסים ובנקאות	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6185	2323	ru	Финансы и банковское дело	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6186	2324	en	Real Estate	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6187	2324	he	נדל"ן	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6188	2324	ru	Недвижимость	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6189	2325	en	Select field of activity	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6190	2325	he	בחר תחום פעילות	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
4713	1712	en	No additional income	f	approved	2025-07-31 23:01:48.304569	2025-08-13 11:42:16.648252	\N	\N	\N
6191	2325	ru	Выберите сферу деятельности	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6192	2326	en	Field of Activity	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6193	2326	he	תחום פעילות	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6194	2326	ru	Сфера деятельности	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6195	2327	en	Construction	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6196	2327	he	בנייה	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6197	2327	ru	Строительство	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6198	2328	en	Retail and Trade	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6199	2328	he	מסחר קמעונאי	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6200	2328	ru	Розничная торговля	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6201	2329	en	Manufacturing and Industry	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6202	2329	he	תעשייה וייצור	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6203	2329	ru	Производство и промышленность	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6204	2330	en	Government and Public Service	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6205	2330	he	ממשלה ושירות ציבורי	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6206	2330	ru	Государственная служба	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6207	2331	en	Transport and Logistics	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6208	2331	he	תחבורה ולוגיסטיקה	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6209	2331	ru	Транспорт и логистика	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6210	2332	en	Consulting and Professional Services	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6211	2332	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6212	2332	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6213	2333	en	Entertainment and Media	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6214	2333	he	בידור ומדיה	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6215	2333	ru	Развлечения и медиа	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6216	2334	en	Other	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6217	2334	he	אחר	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6218	2334	ru	Другое	f	approved	2025-08-13 11:40:01.637296	2025-08-13 11:40:01.637296	\N	\N	\N
6219	2335	en	Agriculture, Forestry, Fishing	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6220	2335	he	חקלאות, יערנות ודיג	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6221	2335	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6222	2336	en	Technology and Communications	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6223	2336	he	טכנולוגיה ותקשורת	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6224	2336	ru	Технологии и коммуникации	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6225	2337	en	Healthcare and Social Services	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6226	2337	he	בריאות ושירותים חברתיים	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6227	2337	ru	Здравоохранение и социальные услуги	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6228	2338	en	Education and Training	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6229	2338	he	חינוך והכשרה	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6230	2338	ru	Образование и обучение	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6231	2339	en	Finance and Banking	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6232	2339	he	פיננסים ובנקאות	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6233	2339	ru	Финансы и банковское дело	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6234	2340	en	Real Estate	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6235	2340	he	נדל"ן	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6236	2340	ru	Недвижимость	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6237	2341	en	Construction	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6238	2341	he	בנייה	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6239	2341	ru	Строительство	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6240	2342	en	Retail and Trade	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6241	2342	he	מסחר קמעונאי	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6242	2342	ru	Розничная торговля	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6243	2343	en	Manufacturing and Industry	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6244	2343	he	תעשייה וייצור	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6245	2343	ru	Производство и промышленность	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6246	2344	en	Government and Public Service	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6247	2344	he	ממשלה ושירות ציבורי	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6248	2344	ru	Государственная служба	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6249	2345	en	Transport and Logistics	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6250	2345	he	תחבורה ולוגיסטיקה	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6251	2345	ru	Транспорт и логистика	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6252	2346	en	Consulting and Professional Services	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6253	2346	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6254	2346	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6255	2347	en	Entertainment and Media	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6256	2347	he	בידור ומדיה	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6257	2347	ru	Развлечения и медиа	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6258	2348	en	Other	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6259	2348	he	אחר	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
6260	2348	ru	Другое	f	approved	2025-08-13 11:40:48.988653	2025-08-13 11:40:48.988653	\N	\N	\N
4721	1712	he	אין הכנסה נוספת	f	approved	2025-07-31 23:01:48.304569	2025-08-13 11:42:16.648252	\N	\N	\N
6357	2385	en	Agriculture, Forestry, Fishing	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6358	2385	he	חקלאות, יערנות ודיג	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6359	2385	ru	Сельское хозяйство, лесное хозяйство и рыболовство	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6360	2386	en	Construction	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6361	2386	he	בנייה	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6362	2386	ru	Строительство	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6363	2387	en	Consulting and Professional Services	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6364	2387	he	ייעוץ ושירותים מקצועיים	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6365	2387	ru	Консалтинг и профессиональные услуги	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6366	2388	en	Education and Training	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6367	2388	he	חינוך והכשרה	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6368	2388	ru	Образование и обучение	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6369	2389	en	Entertainment and Media	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6370	2389	he	בידור ומדיה	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6371	2389	ru	Развлечения и медиа	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6372	2390	en	Finance and Banking	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6373	2390	he	פיננסים ובנקאות	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6374	2390	ru	Финансы и банковское дело	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6375	2391	en	Government and Public Service	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6376	2391	he	ממשלה ושירות ציבורי	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6377	2391	ru	Государственная служба	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6378	2392	en	Healthcare and Social Services	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6379	2392	he	בריאות ושירותים חברתיים	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6380	2392	ru	Здравоохранение и социальные услуги	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6381	2393	en	Field of Activity	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6382	2393	he	תחום פעילות	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6383	2393	ru	Сфера деятельности	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6384	2394	en	Manufacturing and Industry	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6385	2394	he	תעשייה וייצור	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6386	2394	ru	Производство и промышленность	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6387	2395	en	Other	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6388	2395	he	אחר	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6389	2395	ru	Другое	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6390	2396	en	Select field of activity	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6391	2396	he	בחר תחום פעילות	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6392	2396	ru	Выберите сферу деятельности	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6393	2397	en	Real Estate	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6394	2397	he	נדל"ן	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6395	2397	ru	Недвижимость	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6396	2398	en	Retail and Trade	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6397	2398	he	מסחר קמעונאי	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6398	2398	ru	Розничная торговля	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6399	2399	en	Technology and Communications	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6400	2399	he	טכנולוגיה ותקשורת	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6401	2399	ru	Технологии и коммуникации	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6402	2400	en	Transport and Logistics	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6403	2400	he	תחבורה ולוגיסטיקה	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
6404	2400	ru	Транспорт и логистика	f	approved	2025-08-13 11:57:35.667313	2025-08-13 11:57:35.667313	\N	\N	\N
\.


--
-- Data for Name: credit_data_backup_20250127; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_data_backup_20250127 (id, content_key, content_type, category, screen_location, component_type, description, is_active, legacy_translation_key, migration_status, created_at, updated_at, created_by, updated_by, page_number, content_ru, content_he, content_en) FROM stdin;
336	calculate_credit_target_option_1	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Покупка автомобиля	רכישת רכב	Vehicle purchase
337	calculate_credit_target_option_2	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Ремонт дома	שיפוץ בית	Home renovation
338	calculate_credit_target_option_3	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Свадьба и мероприятия	חתונה ואירועים	Wedding and events
339	calculate_credit_target_option_4	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Бизнес-инвестиции	השקעה עסקית	Business investment
340	calculate_credit_target_option_5	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Улучшение будущей кредитоспособности	שיפור זכאות אשראי עתידית	Improve future credit eligibility
341	calculate_credit_target_option_6	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Другое	אחר	Other
342	calculate_credit_prolong_option_1	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	До года	עד שנה	Up to one year
343	calculate_credit_prolong_option_2	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	До двух лет	עד שנתיים	Up to two years
344	calculate_credit_prolong_option_3	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	До 3 лет	עד 3 שנים	Up to 3 years
345	calculate_credit_prolong_option_4	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	До 5 лет	עד 5 שנים	Up to 5 years
346	calculate_credit_prolong_option_5	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Более 5 лет	מעל 5 שנים	Over 5 years
347	calculate_credit_prolong_option_6	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Более 7 лет	מעל 7 שנים	Over 7 years
348	calculate_credit_prolong_option_7	text	dropdown	calculate_credit_1	option	\N	t	\N	completed	2025-07-21 07:07:35.879622	2025-07-22 19:36:26.900342	\N	\N	\N	Более 10 лет	מעל 10 שנים	Over 10 years
349	calculate_mortgage_when_options_1	text	dropdown	calculate_credit_1	option	\N	t	calculate_mortgage_when_options_1	completed	2025-07-21 07:28:31.541722	2025-07-22 19:36:26.900342	\N	\N	\N	До 3 месяцев	תוך 3 חודשים	Within 3 months
350	calculate_mortgage_when_options_2	text	dropdown	calculate_credit_1	option	\N	t	calculate_mortgage_when_options_2	completed	2025-07-21 07:28:31.541722	2025-07-22 19:36:26.900342	\N	\N	\N	3-6 месяцев	תוך 3-6 חודשים	Within 3-6 months
351	calculate_mortgage_when_options_3	text	dropdown	calculate_credit_1	option	\N	t	calculate_mortgage_when_options_3	completed	2025-07-21 07:28:31.541722	2025-07-22 19:36:26.900342	\N	\N	\N	6-12 месяцев	תוך 6-12 חודשים	Within 6-12 months
352	calculate_mortgage_when_options_4	text	dropdown	calculate_credit_1	option	\N	t	calculate_mortgage_when_options_4	completed	2025-07-21 07:28:31.541722	2025-07-22 19:36:26.900342	\N	\N	\N	Более 12 месяцев	מעל 12 חודשים	Over 12 months
720	app.refinance_credit.step1.title	text	form	refinance_credit_1	title	Credit refinance page title	t	credit_refinance_title	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Рефинансирование кредита	מחזור אשראי	Credit Refinance
721	app.refinance_credit.step1.subtitle	text	form	refinance_credit_1	subtitle	Credit refinance banner subtitle	t	credit_refinance_banner_subtext	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Мы найдем и представим вам наиболее выгодные предложения, существующие на финансовом рынке	נאתר ונציג בפניכם את ההצעות המשתלמות ביותר הקיימות בשוק הפיננסי	We will select the best market offers for you
722	app.refinance_credit.step1.why_label	text	form	refinance_credit_1	label	Purpose of credit refinance field label	t	mortgage_credit_why	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Цель рефинансирования кредита	מטרת מחזור האשראי	Goal of credit refinancing
723	app.refinance_credit.step1.why_placeholder	text	form	refinance_credit_1	placeholder	Purpose of credit refinance placeholder	t	credit_refinance_why_ph	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Выберите цель	בחר מטרה	Select goal
724	app.refinance_credit.step1.why_option_1	text	form	refinance_credit_1	dropdown_option	Improve interest rate option	t	calculate_credit_why_option_1	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Улучшить процентную ставку	שיפור הריבית	Improve interest rate
725	app.refinance_credit.step1.why_option_2	text	form	refinance_credit_1	dropdown_option	Reduce credit amount option	t	calculate_credit_why_option_2	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Уменьшить сумму кредита	הפחתת סכום האשראי	Reduce credit amount
726	app.refinance_credit.step1.why_option_3	text	form	refinance_credit_1	dropdown_option	Increase term to reduce payment option	t	calculate_credit_why_option_3	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Увеличить срок, чтобы уменьшить платеж	הגדלת התקופה כדי להפחית את התשלום	Increase term to reduce payment
727	app.refinance_credit.step1.why_option_4	text	form	refinance_credit_1	dropdown_option	Increase payment to reduce term option	t	calculate_credit_why_option_4	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Увеличить платеж, чтобы уменьшить срок	הגדלת התשלום כדי לקצר את התקופה	Increase payment to reduce term
728	app.refinance_credit.step1.credit_list_title	text	form	refinance_credit_1	section_title	Credit list section title	t	list_credits_title	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Существующие кредитные обязательства	התחייבויות אשראי עומדות	Credit List
729	app.refinance_credit.step1.bank_label	text	form	refinance_credit_1	label	Bank field label	t	bank_apply_credit	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Банк-кредитор	בנק מלווה	Which bank issued the credit?
730	app.refinance_credit.step1.bank_placeholder	text	form	refinance_credit_1	placeholder	Bank field placeholder	t	calculate_mortgage_first_ph	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Выберите статус недвижимости	בחר סטטוס הנכס	Select property status
731	app.refinance_credit.step1.amount_label	text	form	refinance_credit_1	label	Credit amount field label	t	amount_credit_title	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Сумма кредита	סכום האשראי	Full credit amount
732	app.refinance_credit.step1.monthly_payment_label	text	form	refinance_credit_1	label	Monthly payment field label	t	calculate_mortgage_initial_payment	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Ежемесячный платеж	תשלום חודשי	Monthly payment
733	app.refinance_credit.step1.start_date_label	text	form	refinance_credit_1	label	Credit start date field label	t	refinance_credit_start_date	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Дата начала кредита	תאריך תחילת האשראי	Credit start date
734	app.refinance_credit.step1.end_date_label	text	form	refinance_credit_1	label	Credit end date field label	t	refinance_credit_end_date	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Дата окончания кредита	תאריך סיום האשראי	Credit end date
735	app.refinance_credit.step1.date_placeholder	text	form	refinance_credit_1	placeholder	Date field placeholder	t	date_ph	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Выберите дату	בחר תאריך	Select date
736	app.refinance_credit.step1.early_repayment_label	text	form	refinance_credit_1	label	Early repayment field label	t	early_repayment	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Сумма досрочного погашения	סכום פירעון מוקדם	Early repayment amount
737	app.refinance_credit.step1.desired_payment_label	text	form	refinance_credit_1	label	Desired monthly payment field label	t	desired_monthly_payment	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Желаемый ежемесячный платеж	תשלום חודשי רצוי	Desired monthly payment
738	app.refinance_credit.step1.desired_term_label	text	form	refinance_credit_1	label	Desired term field label	t	credit_loan_period	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Желаемый срок кредита	תקופת חודשים רצויה	Desired loan period
739	app.refinance_credit.step1.add_credit_button	text	buttons	refinance_credit_1	button	Add credit button text	t	add_credit	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Добавить кредит	הוסף אשראי	Add Credit
741	app.refinance_credit.step1.remove_modal_title	text	modals	refinance_credit_1	modal_title	Remove credit modal title	t	remove_credit	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Удалить данные займа?	למחוק פרטי הלוואה?	Delete loan details?
742	app.refinance_credit.step1.remove_modal_subtitle	text	modals	refinance_credit_1	modal_subtitle	Remove credit modal subtitle	t	remove_credit_subtitle	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Нажав подтвердить, все данные этого займа будут удалены	בלחיצה על אישור כל פרטי הלוואה זו ימחקו	By clicking confirm, all details of this loan will be deleted
743	app.refinance_credit.progress.step1	text	progress	refinance_credit_1	progress_label	Progress bar step 1 label	t	mobile_step_1	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	Калькулятор	מחשבון	Calculator
744	app.refinance_credit.progress.step2	text	progress	refinance_credit_2	progress_label	Progress bar step 2 label	t	mobile_step_2	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.965004	1	\N	4.0	Личные данные	פרטים אישיים	Personal details
745	app.refinance_credit.progress.step3	text	progress	refinance_credit_3	progress_label	Progress bar step 3 label	t	mobile_step_3	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:53.166756	1	\N	7.0	Доходы	הכנסות	Income
746	app.refinance_credit.progress.step4	text	progress	refinance_credit_4	progress_label	Progress bar step 4 label	t	mobile_step_4	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:53.485099	1	\N	11.0	Программы	תוכניות	Programs
1056	calculate_credit_step2_title	text	navigation	calculate_credit_2	title	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Личные данные	פרטים אישיים	Personal Details
1057	calculate_credit_education	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Уровень образования	רמת השכלה	Education Level
1058	calculate_credit_education_ph	text	personal_details	calculate_credit_2	placeholder	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Пожалуйста, выберите ваш уровень образования	אנא בחר את רמת השכלתך	Please select your education level
1059	calculate_credit_education_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Начальная школа	בית ספר יסודי	Elementary School
1060	calculate_credit_education_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Средняя школа	תיכון	High School
1061	calculate_credit_education_option_3	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Профессиональный сертификат	תعודה מקצועית	Professional Certificate
1062	calculate_credit_education_option_4	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Степень бакалавра	תואר ראשון	Bachelor's Degree
1063	calculate_credit_education_option_5	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Степень магистра	תואר שני	Master's Degree
1064	calculate_credit_education_option_6	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Докторская степень	דוקטורט	Doctorate
1065	calculate_credit_education_option_7	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Другое	אחר	Other
1066	calculate_credit_family_status	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Семейное положение	מצב משפחתי	Family Status
1067	calculate_credit_family_status_ph	text	personal_details	calculate_credit_2	placeholder	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Пожалуйста, выберите ваше семейное положение	אנא בחר את מצבך המשפחתי	Please select your family status
1068	calculate_credit_family_status_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Холост/не замужем	רווק/ה	Single
1069	calculate_credit_family_status_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Женат/замужем	נשוי/אה	Married
1070	calculate_credit_family_status_option_3	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Разведен/а	גרוש/ה	Divorced
1071	calculate_credit_family_status_option_4	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Вдовец/вдова	אלמן/ה	Widowed
1072	calculate_credit_family_status_option_5	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Гражданский брак	זוגיות ללא נישואין	Common Law Marriage
1073	calculate_credit_family_status_option_6	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Другое	אחר	Other
1074	calculate_credit_citizenship	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Статус гражданства	סטטוס אזרחות	Citizenship Status
1075	calculate_credit_citizenship_ph	text	personal_details	calculate_credit_2	placeholder	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Пожалуйста, выберите ваш статус гражданства	אנא בחר את סטטוס האזרחות שלך	Please select your citizenship status
1076	calculate_credit_citizenship_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Гражданин Израиля	אזרח ישראלי	Israeli Citizen
1077	calculate_credit_citizenship_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Новый иммигрант	עולה חדש	New Immigrant
1078	calculate_credit_citizenship_option_3	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Иностранный резидент	תושב זר	Foreign Resident
1079	calculate_credit_medical_insurance	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Есть ли у вас медицинская страховка?	האם יש לך ביטוח רפואי?	Do you have medical insurance?
1080	calculate_credit_medical_insurance_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Да	כן	Yes
1081	calculate_credit_medical_insurance_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Нет	לא	No
1082	calculate_credit_foreigner	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Являетесь ли вы иностранным резидентом?	האם אתה תושב זר?	Are you a foreign resident?
1083	calculate_credit_foreigner_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Да	כן	Yes
1084	calculate_credit_foreigner_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Нет	לא	No
1085	calculate_credit_public_person	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Являетесл>ы вы публичным лицом или PEP?	האם אתה איש ציבור או PEP?	Are you a public person or PEP?
1086	calculate_credit_public_person_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Да	כן	Yes
1087	calculate_credit_public_person_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Нет	לא	No
1088	calculate_credit_us_tax_reporting	text	personal_details	calculate_credit_2	field_label	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Отчитываетесь ли вы перед налоговыми органами США?	האם אתה מדווח לרשויות המס האמריקניות?	Do you report to US tax authorities?
1089	calculate_credit_us_tax_reporting_option_1	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Да	כן	Yes
1090	calculate_credit_us_tax_reporting_option_2	text	personal_details	calculate_credit_2	option	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Нет	לא	No
1091	calculate_credit_step2_next_button	text	navigation	calculate_credit_2	button	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Продолжить	המשך	Continue
1092	calculate_credit_step2_back_button	text	navigation	calculate_credit_2	button	\N	t	\N	pending	2025-07-24 23:28:34.215147	2025-07-24 23:28:34.215147	\N	\N	\N	Назад	חזרה	Back
1093	calculate_credit_step3_title	text	credit_calculator_step3	calculate_credit_3_header	heading	Step 3 title for credit calculator	t	calculate_credit_step3_title	migrated	2025-07-24 23:35:26.851357	2025-07-24 23:49:16.897264	\N	\N	\N	Данные заемщика	פרטי הלווה	Borrower Details
1095	calculate_credit_step3_private_name	text	credit_calculator_step3	calculate_credit_3_personal_info	field_label	First name field label	t	calculate_credit_step3_private_name	migrated	2025-07-24 23:35:27.602619	2025-07-24 23:49:16.897264	\N	\N	\N	Имя	שם פרטי	First Name
1096	calculate_credit_step3_private_name_ph	text	credit_calculator_step3	calculate_credit_3_personal_info	placeholder	First name field placeholder	t	calculate_credit_step3_private_name_ph	migrated	2025-07-24 23:35:27.964559	2025-07-24 23:49:16.897264	\N	\N	\N	Введите имя	הזן שם פרטי	Enter first name
1097	calculate_credit_step3_family_name	text	credit_calculator_step3	calculate_credit_3_personal_info	field_label	Last name field label	t	calculate_credit_step3_family_name	migrated	2025-07-24 23:35:28.322455	2025-07-24 23:49:16.897264	\N	\N	\N	Фамилия	שם משפחה	Last Name
1098	calculate_credit_step3_family_name_ph	text	credit_calculator_step3	calculate_credit_3_personal_info	placeholder	Last name field placeholder	t	calculate_credit_step3_family_name_ph	migrated	2025-07-24 23:35:28.672151	2025-07-24 23:49:16.897264	\N	\N	\N	Введите фамилию	הזן שם משפחה	Enter last name
1099	calculate_credit_step3_id	text	credit_calculator_step3	calculate_credit_3_personal_info	field_label	ID number field label	t	calculate_credit_step3_id	migrated	2025-07-24 23:35:29.029609	2025-07-24 23:49:16.897264	\N	\N	\N	Номер удостоверения	תעודת זהות	ID Number
1100	calculate_credit_step3_id_ph	text	credit_calculator_step3	calculate_credit_3_personal_info	placeholder	ID number field placeholder	t	calculate_credit_step3_id_ph	migrated	2025-07-24 23:35:29.379081	2025-07-24 23:49:16.897264	\N	\N	\N	Введите номер удостоверения	הזן תעודת זהות	Enter ID number
1101	calculate_credit_step3_birthday	text	credit_calculator_step3	calculate_credit_3_personal_info	field_label	Birthday field label	t	calculate_credit_step3_birthday	migrated	2025-07-24 23:35:29.732269	2025-07-24 23:49:16.897264	\N	\N	\N	Дата рождения	תאריך לידה	Date of Birth
1102	calculate_credit_step3_birthday_ph	text	credit_calculator_step3	calculate_credit_3_personal_info	placeholder	Birthday field placeholder	t	calculate_credit_step3_birthday_ph	migrated	2025-07-24 23:35:30.096176	2025-07-24 23:49:16.897264	\N	\N	\N	Выберите дату рождения	בחר תאריך לידה	Select date of birth
1103	calculate_credit_step3_city	text	credit_calculator_step3	calculate_credit_3_personal_info	field_label	City field label	t	calculate_credit_step3_city	migrated	2025-07-24 23:35:30.475427	2025-07-24 23:49:16.897264	\N	\N	\N	Город проживания	עיר מגורים	City of Residence
1104	calculate_credit_step3_city_ph	text	credit_calculator_step3	calculate_credit_3_personal_info	placeholder	City field placeholder	t	calculate_credit_step3_city_ph	migrated	2025-07-24 23:35:30.880326	2025-07-24 23:49:16.897264	\N	\N	\N	Выберите город проживания	בחר עיר מגורים	Select city of residence
1105	calculate_credit_step3_street	text	credit_calculator_step3	calculate_credit_3_personal_info	field_label	Street field label	t	calculate_credit_step3_street	migrated	2025-07-24 23:35:31.240372	2025-07-24 23:49:16.897264	\N	\N	\N	Улица	רחוב	Street
1106	calculate_credit_step3_street_ph	text	credit_calculator_step3	calculate_credit_3_personal_info	placeholder	Street field placeholder	t	calculate_credit_step3_street_ph	migrated	2025-07-24 23:35:31.596146	2025-07-24 23:49:16.897264	\N	\N	\N	Введите улицу	הזן רחוב	Enter street
1109	calculate_credit_step4_title	text	credit_calculator_step4	calculate_credit_4_header	heading	Step 4 title for credit calculator	t	calculate_credit_step4_title	migrated	2025-07-24 23:35:40.762797	2025-07-24 23:49:16.897264	\N	\N	\N	Данные о доходах и занятости	פרטי הכנסה ותעסוקה	Income and Employment Details
1110	calculate_credit_step4_employment_type	text	credit_calculator_step4	calculate_credit_4_employment	field_label	Employment type field label	t	calculate_credit_step4_employment_type	migrated	2025-07-24 23:35:41.449719	2025-07-24 23:49:16.897264	\N	\N	\N	Тип занятости	סוג תעסוקה	Employment Type
1111	calculate_credit_step4_employment_type_ph	text	credit_calculator_step4	calculate_credit_4_employment	placeholder	Employment type field placeholder	t	calculate_credit_step4_employment_type_ph	migrated	2025-07-24 23:35:41.826889	2025-07-24 23:49:16.897264	\N	\N	\N	Выберите тип занятости	בחר סוג תעסוקה	Select employment type
1112	calculate_credit_step4_employment_type_option_1	text	credit_calculator_step4	calculate_credit_4_employment	option	Employee option	t	calculate_credit_step4_employment_type_option_1	migrated	2025-07-24 23:35:42.193259	2025-07-24 23:49:16.897264	\N	\N	\N	Наемный работник	שכיר	Employee
1113	calculate_credit_step4_employment_type_option_2	text	credit_calculator_step4	calculate_credit_4_employment	option	Self-employed option	t	calculate_credit_step4_employment_type_option_2	migrated	2025-07-24 23:35:42.581877	2025-07-24 23:49:16.897264	\N	\N	\N	Индивидуальный предприниматель	עצמאי	Self-Employed
1114	calculate_credit_step4_employment_type_option_3	text	credit_calculator_step4	calculate_credit_4_employment	option	Pensioner option	t	calculate_credit_step4_employment_type_option_3	migrated	2025-07-24 23:35:42.943515	2025-07-24 23:49:16.897264	\N	\N	\N	Пенсионер	פנסיונר	Pensioner
1115	calculate_credit_step4_employment_type_option_4	text	credit_calculator_step4	calculate_credit_4_employment	option	Unemployed option	t	calculate_credit_step4_employment_type_option_4	migrated	2025-07-24 23:35:43.313885	2025-07-24 23:49:16.897264	\N	\N	\N	Безработный	לא עובד	Unemployed
1116	calculate_credit_step4_monthly_salary	text	credit_calculator_step4	calculate_credit_4_income	field_label	Monthly salary field label	t	calculate_credit_step4_monthly_salary	migrated	2025-07-24 23:35:43.682402	2025-07-24 23:49:16.897264	\N	\N	\N	Ежемесячная зарплата нетто (шек.)	משכורת חודשית נטו (ש"ח)	Monthly Net Salary (ILS)
1117	calculate_credit_step4_monthly_salary_ph	text	credit_calculator_step4	calculate_credit_4_income	placeholder	Monthly salary field placeholder	t	calculate_credit_step4_monthly_salary_ph	migrated	2025-07-24 23:35:44.147635	2025-07-24 23:49:16.897264	\N	\N	\N	Введите ежемесячную зарплату	הזן משכורת חודשית	Enter monthly salary
1118	calculate_credit_step4_additional_income	text	credit_calculator_step4	calculate_credit_4_income	field_label	Additional income field label	t	calculate_credit_step4_additional_income	migrated	2025-07-24 23:35:44.530354	2025-07-24 23:49:16.897264	\N	\N	\N	Дополнительный ежемесячный доход (шек.)	הכנסה נוספת חודשית (ש"ח)	Additional Monthly Income (ILS)
1119	calculate_credit_step4_additional_income_ph	text	credit_calculator_step4	calculate_credit_4_income	placeholder	Additional income field placeholder	t	calculate_credit_step4_additional_income_ph	migrated	2025-07-24 23:35:44.908335	2025-07-24 23:49:16.897264	\N	\N	\N	Введите дополнительный доход	הזן הכנסה נוספת	Enter additional income
1120	calculate_credit_step4_monthly_expenses	text	credit_calculator_step4	calculate_credit_4_income	field_label	Monthly expenses field label	t	calculate_credit_step4_monthly_expenses	migrated	2025-07-24 23:35:45.284096	2025-07-24 23:49:16.897264	\N	\N	\N	Ежемесячные расходы (шек.)	הוצאות חודשיות (ש"ח)	Monthly Expenses (ILS)
1121	calculate_credit_step4_monthly_expenses_ph	text	credit_calculator_step4	calculate_credit_4_income	placeholder	Monthly expenses field placeholder	t	calculate_credit_step4_monthly_expenses_ph	migrated	2025-07-24 23:35:45.692345	2025-07-24 23:49:16.897264	\N	\N	\N	Введите ежемесячные расходы	הזן הוצאות חודשיות	Enter monthly expenses
1129	calculate_credit_why_option_1	text	refinance_reason	refinance_credit_1	option	Improve interest rate	t	calculate_credit_why_option_1	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Улучшить процентную ставку	שיפור הריבית	Improve interest rate
1130	calculate_credit_why_option_2	text	refinance_reason	refinance_credit_1	option	Reduce credit amount	t	calculate_credit_why_option_2	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Уменьшить сумму кредита	הפחתת סכום האשראי	Reduce credit amount
1131	calculate_credit_why_option_3	text	refinance_reason	refinance_credit_1	option	Increase term to reduce payment	t	calculate_credit_why_option_3	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Увеличить срок для уменьшения платежа	הגדלת התקופה כדי להפחית את התשלום	Increase term to reduce payment
1132	calculate_credit_why_option_4	text	refinance_reason	refinance_credit_1	option	Increase payment to reduce term	t	calculate_credit_why_option_4	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Увеличить платеж для сокращения срока	הגדלת התשלום כדי לקצר את התקופה	Increase payment to reduce term
1133	bank_hapoalim	text	bank	refinance_credit_1	option	Bank Hapoalim	t	bank_hapoalim	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Банк Апоалим	בנק הפועלים	Bank Hapoalim
1134	bank_leumi	text	bank	refinance_credit_1	option	Bank Leumi	t	bank_leumi	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Банк Леуми	בנק לאומי	Bank Leumi
1135	bank_discount	text	bank	refinance_credit_1	option	Discount Bank	t	bank_discount	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Дисконт Банк	בנק דיסקונט	Discount Bank
1136	bank_massad	text	bank	refinance_credit_1	option	Massad Bank	t	bank_massad	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Банк Масад	בנק מסד	Massad Bank
1137	bank_israel	text	bank	refinance_credit_1	option	Bank of Israel	t	bank_israel	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Банк Израиля	בנק ישראל	Bank of Israel
1138	mortgage_credit_why	text	form_field	refinance_credit_1	text	Goal of credit refinancing	t	mortgage_credit_why	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Цель рефинансирования кредита	מטרת מחזור האשראי	Goal of credit refinancing
1139	credit_refinance_why_ph	text	form_field	refinance_credit_1	text	Select goal	t	credit_refinance_why_ph	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Выберите цель	בחר מטרה	Select goal
1140	bank_apply_credit	text	form_field	refinance_credit_1	text	Bank	t	bank_apply_credit	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Банк	בנק מלווה	Bank
1141	amount_credit_title	text	form_field	refinance_credit_1	text	Credit amount	t	amount_credit_title	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Сумма кредита	סכום אשראי	Credit amount
1142	calculate_mortgage_initial_payment	text	form_field	refinance_credit_1	text	Monthly payment	t	calculate_mortgage_initial_payment	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Ежемесячный платеж	תשלום חודשי	Monthly payment
1143	refinance_credit_start_date	text	form_field	refinance_credit_1	text	Start date	t	refinance_credit_start_date	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Дата начала	תאריך התחלה	Start date
1144	refinance_credit_end_date	text	form_field	refinance_credit_1	text	End date	t	refinance_credit_end_date	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Дата окончания	תאריך סיום	End date
1145	early_repayment	text	form_field	refinance_credit_1	text	Early repayment amount	t	early_repayment	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Сумма досрочного погашения	סכום לפירעון מוקדם	Early repayment amount
1146	desired_monthly_payment	text	form_field	refinance_credit_1	text	Desired monthly payment	t	desired_monthly_payment	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Желаемый ежемесячный платеж	תשלום חודשי רצוי	Desired monthly payment
1147	credit_loan_period	text	form_field	refinance_credit_1	text	Desired loan period	t	credit_loan_period	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Желаемый срок кредита	תקופת הלוואה רצויה	Desired loan period
1148	list_credits_title	text	section	refinance_credit_1	text	List of existing credits	t	list_credits_title	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Список существующих кредитов	רשימת אשראים קיימים	List of existing credits
1149	add_credit	text	action	refinance_credit_1	text	Add credit	t	add_credit	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Добавить кредит	הוסף אשראי	Add credit
1150	credit_refinance_title	text	page	refinance_credit_1	text	Credit Refinancing	t	credit_refinance_title	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Рефинансирование кредита	מיחזור אשראי	Credit Refinancing
1151	calculate_mortgage_first_ph	text	form_field	refinance_credit_1	text	Select property status	t	calculate_mortgage_first_ph	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Выберите статус недвижимости	בחר סטטוס הנכס	Select property status
1152	date_ph	text	form_field	refinance_credit_1	text	Select date	t	date_ph	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Выберите дату	בחר תאריך	Select date
1153	remove_credit	text	text	refinance_credit_1	text	Delete loan details?	t	remove_credit	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Удалить данные кредита?	למחוק פרטי הלוואה?	Delete loan details?
1154	remove_credit_subtitle	text	text	refinance_credit_1	text	By clicking confirm, all details of this loan will be deleted	t	remove_credit_subtitle	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	При нажатии на подтверждение все данные этого кредита будут удалены	בלחיצה על אישור כל פרטי הלוואה זו ימחקו	By clicking confirm, all details of this loan will be deleted
1155	delete	text	action	refinance_credit_1	text	Delete	t	delete	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	Удалить	מחק	Delete
1156	calculate_mortgage_period_units_min	text	text	refinance_credit_1	text	years	t	calculate_mortgage_period_units_min	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	лет	שנים	years
1157	calculate_mortgage_period_units_max	text	text	refinance_credit_1	text	years	t	calculate_mortgage_period_units_max	pending	2025-07-26 08:07:56.940543	2025-07-27 11:49:52.765176	\N	\N	2.0	лет	שנים	years
1215	refinance_credit_final	text	page	refinance_credit_4	text	Credit Refinancing Results	t	refinance_credit_final	pending	2025-07-26 08:07:58.402071	2025-07-27 11:49:53.485099	\N	\N	11.0	Результаты рефинансирования кредита	תוצאות מחזור אשראי	Credit Refinancing Results
1216	refinance_credit_warning	text	warning	refinance_credit_4	text	The results above are estimates only for refinancing existing credit and do not constitute a commitment. To receive binding offers from banks, you must complete the registration process.	t	refinance_credit_warning	pending	2025-07-26 08:07:58.402071	2025-07-27 11:49:53.485099	\N	\N	11.0	Приведенные выше результаты являются только оценкой рефинансирования существующего кредита и не являются обязательством. Для получения обязывающих предложений от банков необходимо завершить процесс регистрации.	התוצאות המפורטות לעיל הן הערכה בלבד למחזור אשראי קיים ואינן מהוות התחייבות. לקבלת הצעות מחייבות מהבנקים, נדרש להשלים את תהליך הרישום.	The results above are estimates only for refinancing existing credit and do not constitute a commitment. To receive binding offers from banks, you must complete the registration process.
1217	refinance_credit_new_amount	text	result_field	refinance_credit_4	text	New loan amount	t	refinance_credit_new_amount	pending	2025-07-26 08:07:58.402071	2025-07-27 11:49:53.485099	\N	\N	11.0	Новая сумма кредита	סכום ההלוואה החדש	New loan amount
1218	refinance_credit_new_monthly	text	result_field	refinance_credit_4	text	New monthly payment	t	refinance_credit_new_monthly	pending	2025-07-26 08:07:58.402071	2025-07-27 11:49:53.485099	\N	\N	11.0	Новый ежемесячный платеж	תשלום חודשי חדש	New monthly payment
1219	refinance_credit_monthly_saving	text	result_field	refinance_credit_4	text	Monthly savings	t	refinance_credit_monthly_saving	pending	2025-07-26 08:07:58.402071	2025-07-27 11:49:53.485099	\N	\N	11.0	Ежемесячная экономия	חיסכון חודשי	Monthly savings
1220	refinance_credit_total_saving	text	result_field	refinance_credit_4	text	Total savings	t	refinance_credit_total_saving	pending	2025-07-26 08:07:58.402071	2025-07-27 11:49:53.485099	\N	\N	11.0	Общая экономия	חיסכון כולל	Total savings
1221	calculate_mortgage_step2_title	text	page	refinance_credit_2	text	Personal Details	t	calculate_mortgage_step2_title	pending	2025-07-26 08:09:45.254772	2025-07-27 11:49:52.965004	\N	\N	4.0	Личные данные	פרטים אישיים	Personal Details
1222	calculate_mortgage_name	text	form_field	refinance_credit_2	text	Full name	t	calculate_mortgage_name	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Полное имя	שם מלא	Full name
1223	calculate_mortgage_name_ph	text	form_field	refinance_credit_2	text	Enter full name	t	calculate_mortgage_name_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Введите полное имя	הזן שם מלא	Enter full name
1224	calculate_mortgage_birthday	text	form_field	refinance_credit_2	text	Date of birth	t	calculate_mortgage_birthday	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Дата рождения	תאריך לידה	Date of birth
1225	calculate_mortgage_birthday_ph	text	form_field	refinance_credit_2	text	Select date	t	calculate_mortgage_birthday_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите дату	בחר תאריך	Select date
1226	calculate_mortgage_education	text	form_field	refinance_credit_2	text	Education level	t	calculate_mortgage_education	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Уровень образования	רמת השכלה	Education level
1227	calculate_mortgage_education_ph	text	form_field	refinance_credit_2	text	Select education level	t	calculate_mortgage_education_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите уровень образования	בחר רמת השכלה	Select education level
1228	calculate_mortgage_additional_citizenships	text	form_field	refinance_credit_2	text	Additional citizenships	t	calculate_mortgage_additional_citizenships	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Дополнительные гражданства	אזרחויות נוספות	Additional citizenships
1229	calculate_mortgage_citizenships_dropdown	text	form_field	refinance_credit_2	text	Select citizenships	t	calculate_mortgage_citizenships_dropdown	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите гражданства	בחר אזרחויות	Select citizenships
1230	calculate_mortgage_citizenships_dropdown_ph	text	form_field	refinance_credit_2	text	Select countries	t	calculate_mortgage_citizenships_dropdown_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите страны	בחר מדינות	Select countries
1231	calculate_mortgage_taxes	text	form_field	refinance_credit_2	text	Do you pay taxes abroad?	t	calculate_mortgage_taxes	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Платите ли вы налоги за границей?	האם אתה משלם מסים בחו"ל?	Do you pay taxes abroad?
1232	calculate_mortgage_countries_pay_taxes	text	form_field	refinance_credit_2	text	Countries where you pay taxes	t	calculate_mortgage_countries_pay_taxes	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Страны, где вы платите налоги	מדינות בהן אתה משלם מסים	Countries where you pay taxes
1233	calculate_mortgage_countries_pay_taxes_ph	text	form_field	refinance_credit_2	text	Select countries	t	calculate_mortgage_countries_pay_taxes_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите страны	בחר מדינות	Select countries
1234	calculate_mortgage_childrens	text	form_field	refinance_credit_2	text	Do you have children?	t	calculate_mortgage_childrens	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Есть ли у вас дети?	האם יש לך ילדים?	Do you have children?
1235	calculate_mortgage_how_much_childrens	text	form_field	refinance_credit_2	text	Number of children	t	calculate_mortgage_how_much_childrens	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Количество детей	מספר ילדים	Number of children
1236	calculate_mortgage_medical_insurance	text	form_field	refinance_credit_2	text	Do you have medical insurance?	t	calculate_mortgage_medical_insurance	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Есть ли у вас медицинская страховка?	האם יש לך ביטוח רפואי?	Do you have medical insurance?
1237	calculate_mortgage_is_foreigner	text	form_field	refinance_credit_2	text	Are you a foreign resident?	t	calculate_mortgage_is_foreigner	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Вы иностранный резидент?	האם אתה תושב חוץ?	Are you a foreign resident?
1238	calculate_mortgage_public_person	text	form_field	refinance_credit_2	text	Are you a public figure?	t	calculate_mortgage_public_person	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Вы публичная личность?	האם אתה איש ציבור?	Are you a public figure?
1239	calculate_mortgage_borrowers	text	form_field	refinance_credit_2	text	Are there other borrowers?	t	calculate_mortgage_borrowers	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Есть ли другие заемщики?	האם יש לווים נוספים?	Are there other borrowers?
1240	calculate_mortgage_family_status	text	form_field	refinance_credit_2	text	Marital status	t	calculate_mortgage_family_status	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Семейное положение	מצב משפחתי	Marital status
1241	calculate_mortgage_family_status_ph	text	form_field	refinance_credit_2	text	Select marital status	t	calculate_mortgage_family_status_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите семейное положение	בחר מצב משפחתי	Select marital status
1242	calculate_mortgage_partner_pay_mortgage	text	form_field	refinance_credit_2	text	Will your partner participate in loan payments?	t	calculate_mortgage_partner_pay_mortgage	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Будет ли ваш партнер участвовать в выплатах по кредиту?	האם בן/בת הזוג ישתתף בהחזרי ההלוואה?	Will your partner participate in loan payments?
1243	calculate_mortgage_add_partner	text	form_field	refinance_credit_2	text	Add partner as borrower?	t	calculate_mortgage_add_partner	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Добавить партнера как заемщика?	להוסיף את בן/בת הזוג כלווה?	Add partner as borrower?
1244	calculate_mortgage_add_partner_ph	text	form_field	refinance_credit_2	text	Select option	t	calculate_mortgage_add_partner_ph	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Выберите опцию	בחר אפשרות	Select option
1245	calculate_mortgage_yes	text	text	refinance_credit_2	text	Yes	t	calculate_mortgage_yes	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Да	כן	Yes
1246	calculate_mortgage_no	text	text	refinance_credit_2	text	No	t	calculate_mortgage_no	pending	2025-07-26 08:09:45.433233	2025-07-27 11:49:52.965004	\N	\N	4.0	Нет	לא	No
1247	calculate_mortgage_education_option_1	text	education	refinance_credit_2	text	No high school diploma	t	calculate_mortgage_education_option_1	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Без аттестата о среднем образовании	ללא תעודת בגרות	No high school diploma
1248	calculate_mortgage_education_option_2	text	education	refinance_credit_2	text	Partial high school diploma	t	calculate_mortgage_education_option_2	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Неполное среднее образование	תעודת בגרות חלקית	Partial high school diploma
1249	calculate_mortgage_education_option_3	text	education	refinance_credit_2	text	Full high school diploma	t	calculate_mortgage_education_option_3	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Полное среднее образование	תעודת בגרות מלאה	Full high school diploma
1250	calculate_mortgage_education_option_4	text	education	refinance_credit_2	text	Post-secondary education	t	calculate_mortgage_education_option_4	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Среднее специальное образование	השכלה על-תיכונית	Post-secondary education
1251	calculate_mortgage_education_option_5	text	education	refinance_credit_2	text	Bachelor's degree	t	calculate_mortgage_education_option_5	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Степень бакалавра	תואר ראשון	Bachelor's degree
1252	calculate_mortgage_education_option_6	text	education	refinance_credit_2	text	Master's degree	t	calculate_mortgage_education_option_6	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Степень магистра	תואר שני	Master's degree
1253	calculate_mortgage_education_option_7	text	education	refinance_credit_2	text	Doctoral degree	t	calculate_mortgage_education_option_7	pending	2025-07-26 08:09:45.518535	2025-07-27 11:49:52.965004	\N	\N	4.0	Докторская степень	תואר שלישי	Doctoral degree
1254	calculate_mortgage_family_status_option_1	text	family_status	refinance_credit_2	text	Single	t	calculate_mortgage_family_status_option_1	pending	2025-07-26 08:09:45.604887	2025-07-27 11:49:52.965004	\N	\N	4.0	Холост/Не замужем	רווק/ה	Single
1255	calculate_mortgage_family_status_option_2	text	family_status	refinance_credit_2	text	Married	t	calculate_mortgage_family_status_option_2	pending	2025-07-26 08:09:45.604887	2025-07-27 11:49:52.965004	\N	\N	4.0	Женат/Замужем	נשוי/אה	Married
1256	calculate_mortgage_family_status_option_3	text	family_status	refinance_credit_2	text	Divorced	t	calculate_mortgage_family_status_option_3	pending	2025-07-26 08:09:45.604887	2025-07-27 11:49:52.965004	\N	\N	4.0	Разведен/а	גרוש/ה	Divorced
1257	calculate_mortgage_family_status_option_4	text	family_status	refinance_credit_2	text	Widowed	t	calculate_mortgage_family_status_option_4	pending	2025-07-26 08:09:45.604887	2025-07-27 11:49:52.965004	\N	\N	4.0	Вдовец/Вдова	אלמן/ה	Widowed
1258	calculate_mortgage_family_status_option_5	text	family_status	refinance_credit_2	text	Common-law partner	t	calculate_mortgage_family_status_option_5	pending	2025-07-26 08:09:45.604887	2025-07-27 11:49:52.965004	\N	\N	4.0	Гражданский брак	ידוע/ה בציבור	Common-law partner
1259	calculate_mortgage_family_status_option_6	text	family_status	refinance_credit_2	text	Other	t	calculate_mortgage_family_status_option_6	pending	2025-07-26 08:09:45.604887	2025-07-27 11:49:52.965004	\N	\N	4.0	Другое	אחר	Other
1269	calculate_mortgage_add_partner_option_1	text	add_partner	refinance_credit_2	text	As primary borrower	t	calculate_mortgage_add_partner_option_1	pending	2025-07-26 08:09:45.776923	2025-07-27 11:49:52.965004	\N	\N	4.0	Как основной заемщик	כלווה ראשי	As primary borrower
1270	calculate_mortgage_add_partner_option_2	text	add_partner	refinance_credit_2	text	As secondary borrower	t	calculate_mortgage_add_partner_option_2	pending	2025-07-26 08:09:45.776923	2025-07-27 11:49:52.965004	\N	\N	4.0	Как второстепенный заемщик	כלווה משני	As secondary borrower
1271	calculate_mortgage_add_partner_option_3	text	add_partner	refinance_credit_2	text	No	t	calculate_mortgage_add_partner_option_3	pending	2025-07-26 08:09:45.776923	2025-07-27 11:49:52.965004	\N	\N	4.0	Нет	לא	No
1278	calculate_mortgage_step3_title	text	page	refinance_credit_3	text	Income Details	t	calculate_mortgage_step3_title	pending	2025-07-26 08:09:47.359704	2025-07-27 11:49:53.166756	\N	\N	7.0	Детали дохода	פרטי הכנסה	Income Details
1284	calculate_mortgage_main_source_option_1	text	income_source	refinance_credit_3	option	Employee	t	calculate_mortgage_main_source_option_1	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Наемный работник	שכיר	Employee
1285	calculate_mortgage_main_source_option_2	text	income_source	refinance_credit_3	option	Self-employed	t	calculate_mortgage_main_source_option_2	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Самозанятый	עצמאי	Self-employed
1286	calculate_mortgage_main_source_option_3	text	income_source	refinance_credit_3	option	Pensioner	t	calculate_mortgage_main_source_option_3	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Пенсионер	פנסיונר	Pensioner
1287	calculate_mortgage_main_source_option_4	text	income_source	refinance_credit_3	option	Student	t	calculate_mortgage_main_source_option_4	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Студент	סטודנט	Student
1288	calculate_mortgage_main_source_option_5	text	income_source	refinance_credit_3	option	Unpaid leave	t	calculate_mortgage_main_source_option_5	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Неоплачиваемый отпуск	חופשה ללא תשלום	Unpaid leave
1289	calculate_mortgage_main_source_option_6	text	income_source	refinance_credit_3	option	Unemployed	t	calculate_mortgage_main_source_option_6	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Безработный	לא עובד	Unemployed
1290	calculate_mortgage_main_source_option_7	text	income_source	refinance_credit_3	option	Other	t	calculate_mortgage_main_source_option_7	pending	2025-07-26 08:09:47.947037	2025-07-27 11:49:53.166756	\N	\N	7.0	Другое	אחר	Other
1297	calculate_mortgage_has_additional_option_1	text	additional_income	refinance_credit_3	option	None	t	calculate_mortgage_has_additional_option_1	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Нет	אין	None
1298	calculate_mortgage_has_additional_option_2	text	additional_income	refinance_credit_3	option	Additional Salary	t	calculate_mortgage_has_additional_option_2	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Дополнительная зарплата	משכורת נוספת	Additional Salary
1299	calculate_mortgage_has_additional_option_3	text	additional_income	refinance_credit_3	option	Additional Work	t	calculate_mortgage_has_additional_option_3	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Дополнительная работа	עבודה נוספת	Additional Work
1300	calculate_mortgage_has_additional_option_4	text	additional_income	refinance_credit_3	option	Property Rental	t	calculate_mortgage_has_additional_option_4	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Аренда недвижимости	השכרת נכס	Property Rental
1301	calculate_mortgage_has_additional_option_5	text	additional_income	refinance_credit_3	option	Investments	t	calculate_mortgage_has_additional_option_5	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Инвестиции	השקעות	Investments
1302	calculate_mortgage_has_additional_option_6	text	additional_income	refinance_credit_3	option	Pension	t	calculate_mortgage_has_additional_option_6	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Пенсия	פנסיה	Pension
1303	calculate_mortgage_has_additional_option_7	text	additional_income	refinance_credit_3	option	Other	t	calculate_mortgage_has_additional_option_7	pending	2025-07-26 08:09:48.459482	2025-07-27 11:49:53.166756	\N	\N	7.0	Другое	אחר	Other
1314	calculate_mortgage_debt_types_option_1	text	obligation_type	refinance_credit_3	option	No obligations	t	calculate_mortgage_debt_types_option_1	pending	2025-07-26 08:09:48.961735	2025-07-27 11:49:53.166756	\N	\N	7.0	Нет обязательств	אין התחייבויות	No obligations
1315	calculate_mortgage_debt_types_option_2	text	obligation_type	refinance_credit_3	option	Bank loan	t	calculate_mortgage_debt_types_option_2	pending	2025-07-26 08:09:48.961735	2025-07-27 11:49:53.166756	\N	\N	7.0	Банковский кредит	הלוואה בנקאית	Bank loan
1316	calculate_mortgage_debt_types_option_3	text	obligation_type	refinance_credit_3	option	Consumer credit	t	calculate_mortgage_debt_types_option_3	pending	2025-07-26 08:09:48.961735	2025-07-27 11:49:53.166756	\N	\N	7.0	Потребительский кредит	אשראי צרכני	Consumer credit
1317	calculate_mortgage_debt_types_option_4	text	obligation_type	refinance_credit_3	option	Credit card debt	t	calculate_mortgage_debt_types_option_4	pending	2025-07-26 08:09:48.961735	2025-07-27 11:49:53.166756	\N	\N	7.0	Долг по кредитной карте	חוב כרטיס אשראי	Credit card debt
1318	calculate_mortgage_debt_types_option_5	text	obligation_type	refinance_credit_3	option	Other	t	calculate_mortgage_debt_types_option_5	pending	2025-07-26 08:09:48.961735	2025-07-27 11:49:53.166756	\N	\N	7.0	Другое	אחר	Other
1416	calculate_why	text	loan_parameters	calculate_credit_1	field_label	\N	t	calculate_why	pending	2025-07-27 10:50:57.767941	2025-07-27 10:50:57.767941	\N	\N	\N	Зачем вам нужен кредит?	למה אתה צריך את האשראי?	Why do you need the credit?
1417	calculate_amount	text	loan_parameters	calculate_credit_1	field_label	\N	t	calculate_amount	pending	2025-07-27 10:50:57.767941	2025-07-27 10:50:57.767941	\N	\N	\N	Сумма кредита	סכום האשראי	Credit amount
1418	calculate_when	text	loan_parameters	calculate_credit_1	field_label	\N	t	calculate_when	pending	2025-07-27 10:50:57.767941	2025-07-27 10:50:57.767941	\N	\N	\N	Когда вы планируете взять кредит?	מתי אתה מתכנן לקחת את האשראי?	When are you planning to take the credit?
1419	calculate_prolong	text	loan_parameters	calculate_credit_1	field_label	\N	t	calculate_prolong	pending	2025-07-27 10:50:57.767941	2025-07-27 10:50:57.767941	\N	\N	\N	На какой период?	לאיזו תקופה?	For what period?
1420	calculate_credit_target_ph	text	loan_parameters	calculate_credit_1	placeholder	\N	t	calculate_credit_target_ph	pending	2025-07-27 10:50:58.176779	2025-07-27 10:50:58.176779	\N	\N	\N	Выберите цель кредита	בחר מטרת אשראי	Select credit purpose
1421	calculate_credit_prolong_ph	text	loan_parameters	calculate_credit_1	placeholder	\N	t	calculate_credit_prolong_ph	pending	2025-07-27 10:50:58.176779	2025-07-27 10:50:58.176779	\N	\N	\N	Выберите период погашения	בחר תקופת החזר	Select repayment period
1422	calculate_mortgage_when_options_Time	text	loan_parameters	calculate_credit_1	placeholder	\N	t	calculate_mortgage_when_options_Time	pending	2025-07-27 10:50:58.176779	2025-07-27 10:50:58.176779	\N	\N	\N	Выберите временные рамки	בחר מסגרת זמן	Select time frame
740	app.refinance_credit.step1.delete_button	text	buttons	refinance_credit_1	button	Delete button text	t	delete	migrated	2025-07-22 19:49:55.392095	2025-07-27 11:49:52.765176	1	\N	2.0	\N	\N	\N
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.languages (id, code, name, native_name, direction, is_active, is_default, created_at) FROM stdin;
1	en	English	English	ltr	t	f	2025-07-17 16:53:42.284005
2	he	Hebrew	עברית	rtl	t	f	2025-07-17 16:53:42.284005
3	ru	Russian	Русский	ltr	t	t	2025-07-17 16:53:42.284005
\.


--
-- Data for Name: login_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_audit_log (id, email, user_id, session_id, success, failure_reason, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
1xL2OZB4qX1VJxq_JJKb3_9NFlLVepSW	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-16T09:09:32.620Z","secure":false,"httpOnly":true,"path":"/"},"user":{"id":1,"email":"admin@bankim.com","name":"Admin User","role":"administrator"}}	2025-09-16 20:40:52
\.


--
-- Data for Name: test11; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test11 (id, name) FROM stdin;
\.


--
-- Name: 11111_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."11111_id_seq"', 1, false);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 2, true);


--
-- Name: bank_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_configurations_id_seq', 8, true);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 5, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cities_id_seq', 31, true);


--
-- Name: client_form_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_form_sessions_id_seq', 69, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 20, true);


--
-- Name: content_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_audit_log_id_seq', 1, false);


--
-- Name: content_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_categories_id_seq', 28, true);


--
-- Name: content_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_items_id_seq', 2404, true);


--
-- Name: content_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_test_id_seq', 1, true);


--
-- Name: content_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_translations_id_seq', 6416, true);


--
-- Name: languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.languages_id_seq', 12, true);


--
-- Name: login_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_audit_log_id_seq', 1, false);


--
-- Name: test11_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test11_id_seq', 1, false);


--
-- Name: 11111 11111_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."11111"
    ADD CONSTRAINT "11111_pkey" PRIMARY KEY (id);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- Name: bank_configurations bank_configurations_bank_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_bank_id_key UNIQUE (bank_id);


--
-- Name: bank_configurations bank_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_pkey PRIMARY KEY (id);


--
-- Name: banks banks_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_code_key UNIQUE (code);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: cities cities_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_key_key UNIQUE (key);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: client_form_sessions client_form_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_form_sessions
    ADD CONSTRAINT client_form_sessions_pkey PRIMARY KEY (id);


--
-- Name: client_form_sessions client_form_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_form_sessions
    ADD CONSTRAINT client_form_sessions_session_id_key UNIQUE (session_id);


--
-- Name: clients clients_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_phone_key UNIQUE (phone);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: content_audit_log content_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_audit_log
    ADD CONSTRAINT content_audit_log_pkey PRIMARY KEY (id);


--
-- Name: content_categories content_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_name_key UNIQUE (name);


--
-- Name: content_categories content_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_pkey PRIMARY KEY (id);


--
-- Name: content_items content_items_content_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_content_key_key UNIQUE (content_key);


--
-- Name: content_items content_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_pkey PRIMARY KEY (id);


--
-- Name: content_test content_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_test
    ADD CONSTRAINT content_test_pkey PRIMARY KEY (id);


--
-- Name: content_translations content_translations_content_item_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_content_item_id_language_code_key UNIQUE (content_item_id, language_code);


--
-- Name: content_translations content_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_pkey PRIMARY KEY (id);


--
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_code_key UNIQUE (code);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: login_audit_log login_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_audit_log
    ADD CONSTRAINT login_audit_log_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: test11 test11_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test11
    ADD CONSTRAINT test11_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_active ON public.admin_users USING btree (is_active);


--
-- Name: idx_admin_users_last_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_last_login ON public.admin_users USING btree (last_login);


--
-- Name: idx_admin_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_role ON public.admin_users USING btree (role);


--
-- Name: idx_bank_config_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_bank_config_unique ON public.bank_configurations USING btree (bank_id, product_type);


--
-- Name: idx_cities_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cities_active ON public.cities USING btree (is_active);


--
-- Name: idx_cities_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cities_key ON public.cities USING btree (key);


--
-- Name: idx_cities_sort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cities_sort ON public.cities USING btree (sort_order);


--
-- Name: idx_client_form_sessions_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_form_sessions_client_id ON public.client_form_sessions USING btree (client_id);


--
-- Name: idx_client_form_sessions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_form_sessions_created_at ON public.client_form_sessions USING btree (created_at);


--
-- Name: idx_client_form_sessions_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_form_sessions_session_id ON public.client_form_sessions USING btree (session_id);


--
-- Name: idx_component_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_type ON public.content_items USING btree (component_type);


--
-- Name: idx_content_active_approved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_active_approved ON public.content_items USING btree (is_active, id) WHERE (is_active = true);


--
-- Name: idx_content_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_categories_active ON public.content_categories USING btree (is_active);


--
-- Name: idx_content_categories_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_categories_parent ON public.content_categories USING btree (parent_id);


--
-- Name: idx_content_categories_sort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_categories_sort ON public.content_categories USING btree (sort_order);


--
-- Name: idx_content_items_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_active ON public.content_items USING btree (is_active);


--
-- Name: idx_content_items_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_category ON public.content_items USING btree (category);


--
-- Name: idx_content_items_component_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_component_type ON public.content_items USING btree (component_type);


--
-- Name: idx_content_items_content_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_content_key ON public.content_items USING btree (content_key);


--
-- Name: idx_content_items_legacy_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_legacy_key ON public.content_items USING btree (legacy_translation_key);


--
-- Name: idx_content_items_migration_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_migration_status ON public.content_items USING btree (migration_status);


--
-- Name: idx_content_items_page_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_page_number ON public.content_items USING btree (page_number);


--
-- Name: idx_content_items_screen_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_screen_location ON public.content_items USING btree (screen_location);


--
-- Name: idx_content_items_screen_location_page_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_screen_location_page_number ON public.content_items USING btree (screen_location, page_number);


--
-- Name: idx_content_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_key ON public.content_items USING btree (content_key);


--
-- Name: idx_content_screen_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_screen_lang ON public.content_translations USING btree (language_code, content_item_id) WHERE ((status)::text = 'approved'::text);


--
-- Name: idx_content_translations_approved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_approved ON public.content_translations USING btree (approved_at);


--
-- Name: idx_content_translations_content_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_content_item ON public.content_translations USING btree (content_item_id);


--
-- Name: idx_content_translations_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_item_id ON public.content_translations USING btree (content_item_id);


--
-- Name: idx_content_translations_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_language ON public.content_translations USING btree (language_code);


--
-- Name: idx_content_translations_single_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_content_translations_single_default ON public.content_translations USING btree (content_item_id) WHERE (is_default = true);


--
-- Name: idx_content_translations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_status ON public.content_translations USING btree (status);


--
-- Name: idx_languages_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_languages_active ON public.languages USING btree (is_active);


--
-- Name: idx_languages_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_languages_default ON public.languages USING btree (is_default);


--
-- Name: idx_languages_single_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_languages_single_default ON public.languages USING btree (is_default) WHERE (is_default = true);


--
-- Name: idx_screen_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_screen_category ON public.content_items USING btree (screen_location, category);


--
-- Name: idx_screen_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_screen_type ON public.content_items USING btree (screen_location, component_type);


--
-- Name: cities trigger_cities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_cities_updated_at();


--
-- Name: bank_configurations update_bank_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_bank_configurations_updated_at BEFORE UPDATE ON public.bank_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: banks update_banks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON public.banks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_categories update_content_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON public.content_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_items update_content_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_translations update_content_translations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON public.content_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: languages update_languages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bank_configurations bank_configurations_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: content_audit_log content_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_audit_log
    ADD CONSTRAINT content_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id);


--
-- Name: content_categories content_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.content_categories(id) ON DELETE SET NULL;


--
-- Name: content_items content_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: content_items content_items_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: content_translations content_translations_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: content_translations content_translations_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_translations content_translations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: login_audit_log login_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_audit_log
    ADD CONSTRAINT login_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id);


--
-- PostgreSQL database dump complete
--

