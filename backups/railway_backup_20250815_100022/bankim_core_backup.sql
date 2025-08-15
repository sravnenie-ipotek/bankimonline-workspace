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
-- Name: auto_calculate_ltv(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_calculate_ltv() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.property_ownership IS NOT NULL AND 
       (OLD.property_ownership IS NULL OR OLD.property_ownership != NEW.property_ownership) THEN
        
        NEW.ltv_ratio := get_property_ownership_ltv(NEW.property_ownership);
        NEW.financing_percentage := NEW.ltv_ratio;
        
        -- Recalculate monthly payment if we have enough data
        IF NEW.property_value IS NOT NULL AND NEW.initial_payment IS NOT NULL AND NEW.loan_term_years IS NOT NULL THEN
            DECLARE
                loan_amount DECIMAL(12,2);
                interest_rate DECIMAL(5,3);
            BEGIN
                loan_amount := NEW.property_value - NEW.initial_payment;
                interest_rate := get_current_mortgage_rate();
                
                NEW.calculated_monthly_payment := calculate_annuity_payment(
                    loan_amount, 
                    interest_rate, 
                    NEW.loan_term_years
                );
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.auto_calculate_ltv() OWNER TO postgres;

--
-- Name: auto_generate_invitation_token(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_generate_invitation_token() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.invitation_token IS NULL THEN
        NEW.invitation_token := generate_invitation_token();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.auto_generate_invitation_token() OWNER TO postgres;

--
-- Name: calculate_annuity_payment(numeric, numeric, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_annuity_payment(p_loan_amount numeric, p_annual_rate numeric, p_term_years integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    monthly_rate DECIMAL(10,6);
    total_payments INTEGER;
    monthly_payment DECIMAL(12,2);
BEGIN
    -- Convert annual rate to monthly rate
    monthly_rate := (p_annual_rate / 100.0) / 12.0;
    total_payments := p_term_years * 12;
    
    -- Handle zero interest rate case
    IF monthly_rate = 0 THEN
        RETURN p_loan_amount / total_payments;
    END IF;
    
    -- Standard annuity formula: PMT = PV * [r(1+r)^n] / [(1+r)^n - 1]
    monthly_payment := p_loan_amount * 
        (monthly_rate * POWER(1 + monthly_rate, total_payments)) /
        (POWER(1 + monthly_rate, total_payments) - 1);
    
    RETURN ROUND(monthly_payment, 2);
END;
$$;


ALTER FUNCTION public.calculate_annuity_payment(p_loan_amount numeric, p_annual_rate numeric, p_term_years integer) OWNER TO postgres;

--
-- Name: cleanup_expired_sessions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_sessions() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete expired form sessions
    DELETE FROM client_form_sessions 
    WHERE expires_at < NOW() AND is_completed = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired calculation cache
    DELETE FROM mortgage_calculation_cache 
    WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION public.cleanup_expired_sessions() OWNER TO postgres;

--
-- Name: cleanup_inactive_workers(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_inactive_workers() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    cleanup_count INTEGER;
    six_months_ago DATE;
BEGIN
    six_months_ago := CURRENT_DATE - INTERVAL '6 months';
    
    -- Mark workers for deletion if inactive for 6 months
    UPDATE bank_employees 
    SET status = 'deleted',
        auto_delete_after = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'active'
    AND (last_activity_at IS NULL OR last_activity_at::DATE < six_months_ago)
    AND (auto_delete_after IS NULL OR auto_delete_after > CURRENT_DATE);
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    RETURN cleanup_count;
END;
$$;


ALTER FUNCTION public.cleanup_inactive_workers() OWNER TO postgres;

--
-- Name: expire_old_invitations(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.expire_old_invitations() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired invitations
    UPDATE registration_invitations 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'pending' 
    AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$;


ALTER FUNCTION public.expire_old_invitations() OWNER TO postgres;

--
-- Name: generate_invitation_token(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_invitation_token() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    token VARCHAR(255);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate a secure random token
        token := encode(gen_random_bytes(32), 'hex');
        
        -- Check if token already exists
        SELECT COUNT(*) INTO exists_count 
        FROM registration_invitations 
        WHERE invitation_token = token;
        
        -- If token is unique, exit loop
        IF exists_count = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN token;
END;
$$;


ALTER FUNCTION public.generate_invitation_token() OWNER TO postgres;

--
-- Name: generate_session_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_session_id() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN 'sess_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || 
           LPAD(EXTRACT(epoch FROM NOW())::TEXT, 10, '0') || '_' ||
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;


ALTER FUNCTION public.generate_session_id() OWNER TO postgres;

--
-- Name: get_banking_standard_history(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_banking_standard_history(p_standard_id integer) RETURNS TABLE(change_date timestamp without time zone, change_type character varying, old_value numeric, new_value numeric, changed_by_name text, change_reason text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bsh.changed_at,
        bsh.change_type,
        bsh.old_value,
        bsh.new_value,
        COALESCE(c.first_name || ' ' || c.last_name, 'System')::TEXT as changed_by_name,
        bsh.change_reason
    FROM banking_standards_history bsh
    LEFT JOIN clients c ON bsh.changed_by = c.id
    WHERE bsh.banking_standard_id = p_standard_id
    ORDER BY bsh.changed_at DESC;
END;
$$;


ALTER FUNCTION public.get_banking_standard_history(p_standard_id integer) OWNER TO postgres;

--
-- Name: get_banking_standards(character varying, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_banking_standards(p_business_path character varying, p_bank_id integer DEFAULT NULL::integer) RETURNS TABLE(id integer, business_path character varying, standard_category character varying, standard_name character varying, standard_value numeric, value_type character varying, description text, is_active boolean)
    LANGUAGE plpgsql
    AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    bs.id,
                    bs.business_path,
                    bs.standard_category,
                    bs.standard_name,
                    COALESCE(bso.override_value, bs.standard_value) as standard_value,
                    bs.value_type,
                    bs.description,
                    bs.is_active
                FROM banking_standards bs
                LEFT JOIN bank_standards_overrides bso ON bs.id = bso.banking_standard_id 
                    AND bso.bank_id = p_bank_id 
                    AND bso.is_active = TRUE
                WHERE bs.business_path = p_business_path 
                    AND bs.is_active = TRUE
                ORDER BY bs.standard_category, bs.priority_order;
            END;
            $$;


ALTER FUNCTION public.get_banking_standards(p_business_path character varying, p_bank_id integer) OWNER TO postgres;

--
-- Name: get_current_mortgage_rate(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_current_mortgage_rate() RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_rate DECIMAL(5,3);
BEGIN
    -- Get from banking_standards table (configurable by admin)
    SELECT standard_value INTO current_rate
    FROM banking_standards
    WHERE business_path = 'mortgage' 
    AND standard_category = 'rate'
    AND standard_name = 'base_mortgage_rate'
    AND is_active = true
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    LIMIT 1;
    
    -- Fallback to calculation_parameters if not found in banking_standards
    IF current_rate IS NULL THEN
        SELECT parameter_value INTO current_rate
        FROM calculation_parameters
        WHERE parameter_name = 'base_mortgage_rate'
        AND is_active = true
        LIMIT 1;
    END IF;
    
    -- Final fallback (should never happen with proper data)
    RETURN COALESCE(current_rate, 5.0);
END;
$$;


ALTER FUNCTION public.get_current_mortgage_rate() OWNER TO postgres;

--
-- Name: get_property_ownership_ltv(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_property_ownership_ltv(p_option_key character varying) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    ltv_ratio DECIMAL(5,2);
BEGIN
    SELECT ltv_percentage INTO ltv_ratio
    FROM property_ownership_options
    WHERE option_key = p_option_key AND is_active = true;
    
    -- Default to 50% if not found (safest option)
    RETURN COALESCE(ltv_ratio, 50.00);
END;
$$;


ALTER FUNCTION public.get_property_ownership_ltv(p_option_key character varying) OWNER TO postgres;

--
-- Name: get_recent_banking_standards_changes(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_recent_banking_standards_changes(p_days integer DEFAULT 30) RETURNS TABLE(change_date timestamp without time zone, business_path character varying, standard_name character varying, change_type character varying, old_value numeric, new_value numeric, changed_by_name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bsh.changed_at,
        bsh.business_path,
        bsh.standard_name,
        bsh.change_type,
        bsh.old_value,
        bsh.new_value,
        COALESCE(c.first_name || ' ' || c.last_name, 'System')::TEXT as changed_by_name
    FROM banking_standards_history bsh
    LEFT JOIN clients c ON bsh.changed_by = c.id
    WHERE bsh.changed_at >= NOW() - INTERVAL '1 day' * p_days
    ORDER BY bsh.changed_at DESC
    LIMIT 100;
END;
$$;


ALTER FUNCTION public.get_recent_banking_standards_changes(p_days integer) OWNER TO postgres;

--
-- Name: handle_approval_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_approval_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- When status changes to approved, set approval timestamp
    IF OLD.approval_status != 'approved' AND NEW.approval_status = 'approved' THEN
        NEW.approved_at := CURRENT_TIMESTAMP;
        NEW.status := 'active';
        
        -- Set auto-delete date to 6 months from now
        NEW.auto_delete_after := CURRENT_DATE + INTERVAL '6 months';
    END IF;
    
    -- Update last activity
    NEW.last_activity_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_approval_status_change() OWNER TO postgres;

--
-- Name: log_banking_standards_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_banking_standards_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO banking_standards_history (
            banking_standard_id,
            business_path,
            standard_category,
            standard_name,
            old_value,
            new_value,
            old_description,
            new_description,
            old_is_active,
            new_is_active,
            change_type,
            changed_by,
            changed_at
        ) VALUES (
            NEW.id,
            NEW.business_path,
            NEW.standard_category,
            NEW.standard_name,
            NULL,
            NEW.standard_value,
            NULL,
            NEW.description,
            NULL,
            NEW.is_active,
            'INSERT',
            NEW.created_by,
            NEW.created_at
        );
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Only log if there are actual changes
        IF OLD.standard_value != NEW.standard_value OR 
           OLD.description != NEW.description OR 
           OLD.is_active != NEW.is_active THEN
            
            INSERT INTO banking_standards_history (
                banking_standard_id,
                business_path,
                standard_category,
                standard_name,
                old_value,
                new_value,
                old_description,
                new_description,
                old_is_active,
                new_is_active,
                change_type,
                changed_by,
                changed_at
            ) VALUES (
                NEW.id,
                NEW.business_path,
                NEW.standard_category,
                NEW.standard_name,
                OLD.standard_value,
                NEW.standard_value,
                OLD.description,
                NEW.description,
                OLD.is_active,
                NEW.is_active,
                CASE 
                    WHEN OLD.is_active = FALSE AND NEW.is_active = TRUE THEN 'ACTIVATE'
                    WHEN OLD.is_active = TRUE AND NEW.is_active = FALSE THEN 'DEACTIVATE'
                    ELSE 'UPDATE'
                END,
                COALESCE(NEW.created_by, OLD.created_by), -- Use creator if no updater specified
                NEW.updated_at
            );
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        INSERT INTO banking_standards_history (
            banking_standard_id,
            business_path,
            standard_category,
            standard_name,
            old_value,
            new_value,
            old_description,
            new_description,
            old_is_active,
            new_is_active,
            change_type,
            changed_by,
            changed_at
        ) VALUES (
            OLD.id,
            OLD.business_path,
            OLD.standard_category,
            OLD.standard_name,
            OLD.standard_value,
            NULL,
            OLD.description,
            NULL,
            OLD.is_active,
            NULL,
            'DELETE',
            OLD.created_by,
            NOW()
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION public.log_banking_standards_change() OWNER TO postgres;

--
-- Name: update_application_contexts_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_application_contexts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_application_contexts_updated_at() OWNER TO postgres;

--
-- Name: update_form_session_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_form_session_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_form_session_timestamp() OWNER TO postgres;

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


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: 11111; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."11111" (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."11111" OWNER TO postgres;

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


ALTER SEQUENCE public."11111_id_seq" OWNER TO postgres;

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
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    bank_id integer,
    permissions json DEFAULT '{}'::json,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    created_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admin_users_role_check CHECK (((role)::text = ANY ((ARRAY['business_admin'::character varying, 'bank_admin'::character varying, 'risk_manager'::character varying, 'compliance'::character varying, 'system_admin'::character varying])::text[])))
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: bank_branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_branches (
    id integer NOT NULL,
    bank_id integer NOT NULL,
    name_en text NOT NULL,
    name_he text,
    name_ru text,
    branch_code text,
    address text,
    city text,
    country text DEFAULT 'IL'::text,
    phone text,
    email text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    max_workers integer DEFAULT 50
);


ALTER TABLE public.bank_branches OWNER TO postgres;

--
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    name_en character varying(255),
    name_ru character varying(255),
    name_he character varying(255),
    url character varying(500),
    logo character varying(500),
    tender integer DEFAULT 1,
    priority integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    show_in_fallback boolean DEFAULT true,
    fallback_priority integer DEFAULT 1,
    fallback_interest_rate numeric(5,2) DEFAULT 5.0,
    fallback_approval_rate numeric(5,2) DEFAULT 80.0
);


ALTER TABLE public.banks OWNER TO postgres;

--
-- Name: COLUMN banks.show_in_fallback; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banks.show_in_fallback IS 'Whether this bank should appear in fallback scenarios when no real offers match';


--
-- Name: COLUMN banks.fallback_priority; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banks.fallback_priority IS 'Priority order for fallback display (lower = higher priority)';


--
-- Name: COLUMN banks.fallback_interest_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banks.fallback_interest_rate IS 'Default interest rate to use for fallback calculations';


--
-- Name: COLUMN banks.fallback_approval_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banks.fallback_approval_rate IS 'Simulated approval rate percentage for fallback scenarios';


--
-- Name: registration_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registration_invitations (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    bank_id integer NOT NULL,
    branch_id integer,
    invited_by integer NOT NULL,
    invitation_token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    registration_completed_at timestamp without time zone,
    employee_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_invitation_email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT chk_invitation_expires CHECK ((expires_at > created_at)),
    CONSTRAINT registration_invitations_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'used'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.registration_invitations OWNER TO postgres;

--
-- Name: active_invitations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_invitations AS
 SELECT ri.id,
    ri.email,
    b.name_en AS bank_name,
    bb.name_en AS branch_name,
    au.username AS invited_by_username,
    ri.invitation_token,
    ri.expires_at,
    ri.created_at,
        CASE
            WHEN (ri.expires_at < CURRENT_TIMESTAMP) THEN 'expired'::character varying
            ELSE ri.status
        END AS current_status
   FROM (((public.registration_invitations ri
     JOIN public.banks b ON ((ri.bank_id = b.id)))
     LEFT JOIN public.bank_branches bb ON ((ri.branch_id = bb.id)))
     JOIN public.admin_users au ON ((ri.invited_by = au.id)))
  WHERE (((ri.status)::text = 'pending'::text) AND (ri.expires_at > CURRENT_TIMESTAMP));


ALTER VIEW public.active_invitations OWNER TO postgres;

--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_audit_log (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    table_name character varying(100),
    record_id integer,
    old_values json,
    new_values json,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_audit_log OWNER TO postgres;

--
-- Name: admin_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_audit_log_id_seq OWNER TO postgres;

--
-- Name: admin_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_audit_log_id_seq OWNED BY public.admin_audit_log.id;


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


ALTER SEQUENCE public.admin_users_id_seq OWNER TO postgres;

--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: application_contexts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_contexts (
    id integer NOT NULL,
    context_code character varying(50) NOT NULL,
    context_name character varying(100) NOT NULL,
    description text,
    display_order integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.application_contexts OWNER TO postgres;

--
-- Name: application_contexts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_contexts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_contexts_id_seq OWNER TO postgres;

--
-- Name: application_contexts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_contexts_id_seq OWNED BY public.application_contexts.id;


--
-- Name: approval_matrix; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_matrix (
    id integer NOT NULL,
    business_path character varying(30) NOT NULL,
    approval_level character varying(30) NOT NULL,
    condition_name character varying(100) NOT NULL,
    condition_logic text NOT NULL,
    approval_message text,
    rejection_reason text,
    required_documents text[],
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT approval_matrix_approval_level_check CHECK (((approval_level)::text = ANY ((ARRAY['auto_approve'::character varying, 'manual_review'::character varying, 'conditional'::character varying, 'auto_reject'::character varying])::text[]))),
    CONSTRAINT approval_matrix_business_path_check CHECK (((business_path)::text = ANY ((ARRAY['mortgage'::character varying, 'mortgage_refinance'::character varying, 'credit'::character varying, 'credit_refinance'::character varying])::text[])))
);


ALTER TABLE public.approval_matrix OWNER TO postgres;

--
-- Name: approval_matrix_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.approval_matrix_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.approval_matrix_id_seq OWNER TO postgres;

--
-- Name: approval_matrix_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.approval_matrix_id_seq OWNED BY public.approval_matrix.id;


--
-- Name: bank_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_analytics (
    id integer NOT NULL,
    bank_id integer,
    metric_type character varying(50) NOT NULL,
    metric_value numeric(15,2),
    period_type character varying(20) DEFAULT 'daily'::character varying,
    period_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bank_analytics OWNER TO postgres;

--
-- Name: bank_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_analytics_id_seq OWNER TO postgres;

--
-- Name: bank_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_analytics_id_seq OWNED BY public.bank_analytics.id;


--
-- Name: bank_branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_branches_id_seq OWNER TO postgres;

--
-- Name: bank_branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_branches_id_seq OWNED BY public.bank_branches.id;


--
-- Name: bank_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_config (
    id integer NOT NULL,
    bank_id integer,
    base_rate numeric(5,2),
    min_rate numeric(5,2),
    max_rate numeric(5,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bank_config OWNER TO postgres;

--
-- Name: bank_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_config_id_seq OWNER TO postgres;

--
-- Name: bank_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_config_id_seq OWNED BY public.bank_config.id;


--
-- Name: bank_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_configurations (
    id integer NOT NULL,
    bank_id integer,
    product_type character varying(50) DEFAULT 'mortgage'::character varying,
    base_interest_rate numeric(5,3),
    min_interest_rate numeric(5,3),
    max_interest_rate numeric(5,3),
    risk_premium numeric(5,3),
    processing_fee numeric(10,2),
    max_ltv_ratio numeric(5,2),
    min_credit_score integer,
    max_loan_amount numeric(15,2),
    min_loan_amount numeric(15,2),
    auto_approval_enabled boolean DEFAULT false,
    max_applications_per_day integer DEFAULT 100,
    is_active boolean DEFAULT true,
    effective_from date DEFAULT CURRENT_DATE,
    effective_to date,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bank_configurations OWNER TO postgres;

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


ALTER SEQUENCE public.bank_configurations_id_seq OWNER TO postgres;

--
-- Name: bank_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_configurations_id_seq OWNED BY public.bank_configurations.id;


--
-- Name: bank_employee_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_employee_sessions (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bank_employee_sessions OWNER TO postgres;

--
-- Name: bank_employee_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_employee_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_employee_sessions_id_seq OWNER TO postgres;

--
-- Name: bank_employee_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_employee_sessions_id_seq OWNED BY public.bank_employee_sessions.id;


--
-- Name: bank_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_employees (
    id integer NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    corporate_email text NOT NULL,
    bank_id integer NOT NULL,
    branch_id integer,
    bank_number text,
    status text DEFAULT 'pending'::text,
    terms_accepted boolean DEFAULT false,
    terms_accepted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    password_hash text,
    registration_token text,
    registration_expires timestamp without time zone,
    invitation_token character varying(255),
    invitation_expires_at timestamp without time zone,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    auto_delete_after date,
    last_activity_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    registration_ip inet,
    registration_user_agent text,
    CONSTRAINT bank_employees_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'requires_changes'::character varying])::text[])))
);


ALTER TABLE public.bank_employees OWNER TO postgres;

--
-- Name: bank_employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_employees_id_seq OWNER TO postgres;

--
-- Name: bank_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_employees_id_seq OWNED BY public.bank_employees.id;


--
-- Name: bank_fallback_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_fallback_config (
    id integer NOT NULL,
    enable_fallback boolean DEFAULT true,
    fallback_method character varying(50) DEFAULT 'database_relaxed'::character varying,
    max_fallback_banks integer DEFAULT 3,
    default_term_years integer DEFAULT 25,
    language_preference character varying(10) DEFAULT 'auto'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bank_fallback_config OWNER TO postgres;

--
-- Name: TABLE bank_fallback_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.bank_fallback_config IS 'System-wide configuration for bank fallback behavior';


--
-- Name: bank_fallback_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_fallback_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_fallback_config_id_seq OWNER TO postgres;

--
-- Name: bank_fallback_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_fallback_config_id_seq OWNED BY public.bank_fallback_config.id;


--
-- Name: bank_standards_overrides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_standards_overrides (
    id integer NOT NULL,
    bank_id integer,
    banking_standard_id integer,
    override_value numeric(10,4) NOT NULL,
    override_reason text,
    is_active boolean DEFAULT true,
    effective_from date DEFAULT CURRENT_DATE,
    effective_to date,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bank_standards_overrides OWNER TO postgres;

--
-- Name: bank_standards_overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_standards_overrides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_standards_overrides_id_seq OWNER TO postgres;

--
-- Name: bank_standards_overrides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_standards_overrides_id_seq OWNED BY public.bank_standards_overrides.id;


--
-- Name: bank_worker_statistics; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.bank_worker_statistics AS
SELECT
    NULL::integer AS bank_id,
    NULL::character varying(255) AS bank_name,
    NULL::bigint AS active_workers,
    NULL::bigint AS pending_workers,
    NULL::bigint AS pending_approvals,
    NULL::bigint AS active_invitations,
    NULL::timestamp without time zone AS last_worker_activity;


ALTER VIEW public.bank_worker_statistics OWNER TO postgres;

--
-- Name: banking_standards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banking_standards (
    id integer NOT NULL,
    business_path character varying(30) NOT NULL,
    standard_category character varying(50) NOT NULL,
    standard_name character varying(100) NOT NULL,
    standard_value numeric(10,4) NOT NULL,
    value_type character varying(20) NOT NULL,
    min_value numeric(10,4),
    max_value numeric(10,4),
    description text,
    is_active boolean DEFAULT true,
    is_required boolean DEFAULT true,
    priority_order integer DEFAULT 1,
    effective_from date DEFAULT CURRENT_DATE,
    effective_to date,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT banking_standards_business_path_check CHECK (((business_path)::text = ANY ((ARRAY['mortgage'::character varying, 'mortgage_refinance'::character varying, 'credit'::character varying, 'credit_refinance'::character varying])::text[]))),
    CONSTRAINT banking_standards_value_type_check CHECK (((value_type)::text = ANY ((ARRAY['percentage'::character varying, 'ratio'::character varying, 'amount'::character varying, 'years'::character varying, 'score'::character varying])::text[])))
);


ALTER TABLE public.banking_standards OWNER TO postgres;

--
-- Name: banking_standards_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banking_standards_history (
    id integer NOT NULL,
    banking_standard_id integer NOT NULL,
    business_path character varying(30) NOT NULL,
    standard_category character varying(50) NOT NULL,
    standard_name character varying(100) NOT NULL,
    old_value numeric(10,4),
    new_value numeric(10,4) NOT NULL,
    old_description text,
    new_description text,
    old_is_active boolean,
    new_is_active boolean,
    change_type character varying(20) NOT NULL,
    change_reason text,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    session_id character varying(255),
    CONSTRAINT banking_standards_history_change_type_check CHECK (((change_type)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'ACTIVATE'::character varying, 'DEACTIVATE'::character varying])::text[])))
);


ALTER TABLE public.banking_standards_history OWNER TO postgres;

--
-- Name: TABLE banking_standards_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.banking_standards_history IS 'Comprehensive audit trail for all banking_standards table changes';


--
-- Name: COLUMN banking_standards_history.banking_standard_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banking_standards_history.banking_standard_id IS 'Reference to banking standard (no FK to preserve history even if standard deleted)';


--
-- Name: COLUMN banking_standards_history.change_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banking_standards_history.change_type IS 'Type of change: INSERT, UPDATE, DELETE, ACTIVATE, DEACTIVATE';


--
-- Name: COLUMN banking_standards_history.changed_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banking_standards_history.changed_by IS 'User who made the change';


--
-- Name: COLUMN banking_standards_history.ip_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banking_standards_history.ip_address IS 'IP address of user making change (for future enhancement)';


--
-- Name: COLUMN banking_standards_history.user_agent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.banking_standards_history.user_agent IS 'Browser/client info (for future enhancement)';


--
-- Name: banking_standards_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banking_standards_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banking_standards_history_id_seq OWNER TO postgres;

--
-- Name: banking_standards_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banking_standards_history_id_seq OWNED BY public.banking_standards_history.id;


--
-- Name: banking_standards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banking_standards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banking_standards_id_seq OWNER TO postgres;

--
-- Name: banking_standards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banking_standards_id_seq OWNED BY public.banking_standards.id;


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


ALTER SEQUENCE public.banks_id_seq OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: calculation_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculation_parameters (
    id integer NOT NULL,
    parameter_name character varying(100) NOT NULL,
    parameter_value numeric(10,4) NOT NULL,
    parameter_type character varying(20) NOT NULL,
    description text,
    min_value numeric(10,4),
    max_value numeric(10,4),
    is_active boolean DEFAULT true,
    effective_from date DEFAULT CURRENT_DATE,
    effective_to date,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT calculation_parameters_parameter_type_check CHECK (((parameter_type)::text = ANY ((ARRAY['rate'::character varying, 'ratio'::character varying, 'amount'::character varying, 'percentage'::character varying, 'years'::character varying])::text[])))
);


ALTER TABLE public.calculation_parameters OWNER TO postgres;

--
-- Name: calculation_parameters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculation_parameters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculation_parameters_id_seq OWNER TO postgres;

--
-- Name: calculation_parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculation_parameters_id_seq OWNED BY public.calculation_parameters.id;


--
-- Name: calculation_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculation_rules (
    id integer NOT NULL,
    business_path character varying(30) NOT NULL,
    rule_name character varying(100) NOT NULL,
    rule_type character varying(30) NOT NULL,
    rule_condition text NOT NULL,
    rule_action text NOT NULL,
    rule_priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT calculation_rules_business_path_check CHECK (((business_path)::text = ANY ((ARRAY['mortgage'::character varying, 'mortgage_refinance'::character varying, 'credit'::character varying, 'credit_refinance'::character varying])::text[]))),
    CONSTRAINT calculation_rules_rule_type_check CHECK (((rule_type)::text = ANY ((ARRAY['validation'::character varying, 'calculation'::character varying, 'approval'::character varying, 'rejection'::character varying])::text[])))
);


ALTER TABLE public.calculation_rules OWNER TO postgres;

--
-- Name: calculation_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculation_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculation_rules_id_seq OWNER TO postgres;

--
-- Name: calculation_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculation_rules_id_seq OWNED BY public.calculation_rules.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    name_he character varying(255) NOT NULL,
    name_ru character varying(255) NOT NULL
);


ALTER TABLE public.cities OWNER TO postgres;

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


ALTER SEQUENCE public.cities_id_seq OWNER TO postgres;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: client_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_assets (
    id integer NOT NULL,
    client_id integer,
    asset_type character varying(20) DEFAULT 'bank_account'::character varying,
    bank_name character varying(255),
    account_type character varying(20),
    current_balance numeric(12,2),
    average_balance_6months numeric(12,2),
    asset_description text,
    estimated_value numeric(12,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT client_assets_account_type_check CHECK (((account_type)::text = ANY ((ARRAY['checking'::character varying, 'savings'::character varying, 'investment'::character varying, 'pension'::character varying])::text[]))),
    CONSTRAINT client_assets_asset_type_check CHECK (((asset_type)::text = ANY ((ARRAY['bank_account'::character varying, 'investment'::character varying, 'property'::character varying, 'vehicle'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT client_assets_average_balance_6months_check CHECK ((average_balance_6months >= (0)::numeric)),
    CONSTRAINT client_assets_current_balance_check CHECK ((current_balance >= (0)::numeric)),
    CONSTRAINT client_assets_estimated_value_check CHECK ((estimated_value >= (0)::numeric))
);


ALTER TABLE public.client_assets OWNER TO postgres;

--
-- Name: client_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_assets_id_seq OWNER TO postgres;

--
-- Name: client_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_assets_id_seq OWNED BY public.client_assets.id;


--
-- Name: client_credit_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_credit_history (
    id integer NOT NULL,
    client_id integer,
    credit_score integer,
    credit_history_years integer,
    previous_defaults boolean DEFAULT false,
    bankruptcy_history boolean DEFAULT false,
    current_credit_utilization numeric(5,2),
    total_credit_limit numeric(12,2),
    active_credit_accounts integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT client_credit_history_credit_history_years_check CHECK ((credit_history_years >= 0)),
    CONSTRAINT client_credit_history_credit_score_check CHECK (((credit_score >= 300) AND (credit_score <= 850))),
    CONSTRAINT client_credit_history_current_credit_utilization_check CHECK (((current_credit_utilization >= (0)::numeric) AND (current_credit_utilization <= (100)::numeric)))
);


ALTER TABLE public.client_credit_history OWNER TO postgres;

--
-- Name: client_credit_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_credit_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_credit_history_id_seq OWNER TO postgres;

--
-- Name: client_credit_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_credit_history_id_seq OWNED BY public.client_credit_history.id;


--
-- Name: client_debts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_debts (
    id integer NOT NULL,
    client_id integer,
    bank_name character varying(255) NOT NULL,
    debt_type character varying(20) NOT NULL,
    original_amount numeric(12,2) NOT NULL,
    current_balance numeric(12,2) NOT NULL,
    monthly_payment numeric(12,2) NOT NULL,
    interest_rate numeric(5,2),
    start_date date NOT NULL,
    end_date date,
    remaining_payments integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT client_debts_check CHECK (((end_date IS NULL) OR (end_date >= start_date))),
    CONSTRAINT client_debts_current_balance_check CHECK ((current_balance >= (0)::numeric)),
    CONSTRAINT client_debts_debt_type_check CHECK (((debt_type)::text = ANY ((ARRAY['mortgage'::character varying, 'credit'::character varying, 'credit_card'::character varying, 'personal_loan'::character varying, 'auto_loan'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT client_debts_interest_rate_check CHECK ((interest_rate >= (0)::numeric)),
    CONSTRAINT client_debts_monthly_payment_check CHECK ((monthly_payment >= (0)::numeric)),
    CONSTRAINT client_debts_original_amount_check CHECK ((original_amount > (0)::numeric)),
    CONSTRAINT client_debts_remaining_payments_check CHECK ((remaining_payments >= 0))
);


ALTER TABLE public.client_debts OWNER TO postgres;

--
-- Name: client_debts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_debts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_debts_id_seq OWNER TO postgres;

--
-- Name: client_debts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_debts_id_seq OWNED BY public.client_debts.id;


--
-- Name: client_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_documents (
    id integer NOT NULL,
    client_id integer,
    application_id integer,
    document_type character varying(50) NOT NULL,
    document_category character varying(30) DEFAULT 'other'::character varying,
    file_name character varying(255) NOT NULL,
    original_file_name character varying(255),
    file_path character varying(500),
    file_size integer,
    mime_type character varying(100),
    upload_date timestamp without time zone DEFAULT now(),
    verification_status character varying(20) DEFAULT 'pending'::character varying,
    verified_by integer,
    verification_date timestamp without time zone,
    verification_notes text,
    expiry_date date,
    is_required boolean DEFAULT false,
    CONSTRAINT client_documents_document_category_check CHECK (((document_category)::text = ANY ((ARRAY['identity'::character varying, 'income'::character varying, 'employment'::character varying, 'property'::character varying, 'financial'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT client_documents_file_size_check CHECK ((file_size > 0)),
    CONSTRAINT client_documents_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.client_documents OWNER TO postgres;

--
-- Name: client_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_documents_id_seq OWNER TO postgres;

--
-- Name: client_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_documents_id_seq OWNED BY public.client_documents.id;


--
-- Name: client_employment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_employment (
    id integer NOT NULL,
    client_id integer,
    employment_type character varying(20) DEFAULT 'permanent'::character varying,
    company_name character varying(255),
    profession character varying(255),
    field_of_activity character varying(255),
    monthly_income numeric(12,2),
    additional_income numeric(12,2) DEFAULT 0,
    years_at_current_job numeric(4,2),
    employer_phone character varying(20),
    employer_address text,
    employment_start_date date,
    employment_verified boolean DEFAULT false,
    verification_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT client_employment_additional_income_check CHECK ((additional_income >= (0)::numeric)),
    CONSTRAINT client_employment_employment_type_check CHECK (((employment_type)::text = ANY ((ARRAY['permanent'::character varying, 'temporary'::character varying, 'freelance'::character varying, 'self_employed'::character varying, 'unemployed'::character varying])::text[]))),
    CONSTRAINT client_employment_monthly_income_check CHECK ((monthly_income >= (0)::numeric)),
    CONSTRAINT client_employment_years_at_current_job_check CHECK ((years_at_current_job >= (0)::numeric))
);


ALTER TABLE public.client_employment OWNER TO postgres;

--
-- Name: client_employment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_employment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_employment_id_seq OWNER TO postgres;

--
-- Name: client_employment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_employment_id_seq OWNED BY public.client_employment.id;


--
-- Name: client_form_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_form_sessions (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    client_id integer,
    property_value numeric(12,2),
    property_city character varying(100),
    loan_period_preference character varying(50),
    initial_payment numeric(12,2),
    property_type character varying(50),
    property_ownership character varying(100),
    loan_term_years integer,
    calculated_monthly_payment numeric(12,2),
    personal_data jsonb,
    financial_data jsonb,
    ltv_ratio numeric(5,2),
    financing_percentage numeric(5,2),
    current_step integer DEFAULT 1,
    is_completed boolean DEFAULT false,
    expires_at timestamp without time zone DEFAULT (now() + '24:00:00'::interval),
    ip_address inet,
    country_code character varying(3),
    city_detected character varying(100),
    geolocation_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    step1_completed_at timestamp without time zone,
    step2_completed_at timestamp without time zone,
    step3_completed_at timestamp without time zone,
    CONSTRAINT client_form_sessions_current_step_check CHECK (((current_step >= 1) AND (current_step <= 4)))
);


ALTER TABLE public.client_form_sessions OWNER TO postgres;

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


ALTER SEQUENCE public.client_form_sessions_id_seq OWNER TO postgres;

--
-- Name: client_form_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_form_sessions_id_seq OWNED BY public.client_form_sessions.id;


--
-- Name: client_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_identity (
    id integer NOT NULL,
    client_id integer,
    id_number character varying(20) NOT NULL,
    id_type character varying(20) DEFAULT 'national_id'::character varying,
    id_expiry_date date,
    id_issuing_country character varying(3) DEFAULT 'IL'::character varying,
    verification_status character varying(20) DEFAULT 'pending'::character varying,
    verification_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT client_identity_id_type_check CHECK (((id_type)::text = ANY ((ARRAY['passport'::character varying, 'national_id'::character varying, 'drivers_license'::character varying])::text[]))),
    CONSTRAINT client_identity_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.client_identity OWNER TO postgres;

--
-- Name: client_identity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_identity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_identity_id_seq OWNER TO postgres;

--
-- Name: client_identity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_identity_id_seq OWNED BY public.client_identity.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    phone character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) DEFAULT 'customer'::character varying,
    is_staff boolean DEFAULT false,
    last_login timestamp without time zone,
    password_hash character varying(255),
    CONSTRAINT check_role CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'admin'::character varying, 'manager'::character varying, 'support'::character varying])::text[])))
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: COLUMN clients.role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clients.role IS 'User role: customer, admin, manager, support';


--
-- Name: COLUMN clients.is_staff; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clients.is_staff IS 'True for staff members (admin access)';


--
-- Name: COLUMN clients.last_login; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clients.last_login IS 'Timestamp of last login for audit';


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


ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: content_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_items (
    id integer NOT NULL,
    content_key character varying(255) NOT NULL,
    screen_location character varying(100) NOT NULL,
    component_type character varying(50) DEFAULT 'text'::character varying,
    category character varying(100) DEFAULT 'general'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    app_context_id integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    page_number integer
);


ALTER TABLE public.content_items OWNER TO postgres;

--
-- Name: content_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_items_id_seq OWNER TO postgres;

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


ALTER TABLE public.content_test OWNER TO postgres;

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


ALTER SEQUENCE public.content_test_id_seq OWNER TO postgres;

--
-- Name: content_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_test_id_seq OWNED BY public.content_test.id;


--
-- Name: content_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_translations (
    id integer NOT NULL,
    content_item_id integer,
    language_code character varying(10) NOT NULL,
    content_value text NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_translations OWNER TO postgres;

--
-- Name: content_translations_backup_1753881004876; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_translations_backup_1753881004876 (
    id integer,
    content_item_id integer,
    language_code character varying(10),
    content_value text,
    status character varying(20),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.content_translations_backup_1753881004876 OWNER TO postgres;

--
-- Name: content_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_translations_id_seq OWNER TO postgres;

--
-- Name: content_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_translations_id_seq OWNED BY public.content_translations.id;


--
-- Name: interest_rate_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interest_rate_rules (
    id integer NOT NULL,
    bank_id integer,
    rule_type character varying(50) NOT NULL,
    condition_min numeric(10,2),
    condition_max numeric(10,2),
    rate_adjustment numeric(5,3) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 1,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interest_rate_rules OWNER TO postgres;

--
-- Name: interest_rate_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interest_rate_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interest_rate_rules_id_seq OWNER TO postgres;

--
-- Name: interest_rate_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interest_rate_rules_id_seq OWNED BY public.interest_rate_rules.id;


--
-- Name: israeli_bank_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.israeli_bank_numbers (
    id integer NOT NULL,
    bank_number text NOT NULL,
    bank_name_en text NOT NULL,
    bank_name_he text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.israeli_bank_numbers OWNER TO postgres;

--
-- Name: israeli_bank_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.israeli_bank_numbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.israeli_bank_numbers_id_seq OWNER TO postgres;

--
-- Name: israeli_bank_numbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.israeli_bank_numbers_id_seq OWNED BY public.israeli_bank_numbers.id;


--
-- Name: lawyer_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lawyer_applications (
    id integer NOT NULL,
    contact_name character varying(150) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(150) NOT NULL,
    city character varying(100),
    desired_region character varying(100),
    employment_type character varying(100),
    monthly_income character varying(100),
    work_experience character varying(50),
    client_litigation character varying(50),
    debt_litigation character varying(50),
    comments text,
    source character varying(100),
    referrer text,
    submission_data jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lawyer_applications OWNER TO postgres;

--
-- Name: lawyer_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lawyer_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lawyer_applications_id_seq OWNER TO postgres;

--
-- Name: lawyer_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lawyer_applications_id_seq OWNED BY public.lawyer_applications.id;


--
-- Name: loan_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_applications (
    id integer NOT NULL,
    client_id integer,
    property_id integer,
    application_number character varying(50),
    loan_type character varying(30) NOT NULL,
    loan_purpose text,
    requested_amount numeric(12,2) NOT NULL,
    approved_amount numeric(12,2),
    loan_term_years integer NOT NULL,
    interest_rate numeric(5,2),
    monthly_payment numeric(12,2),
    down_payment numeric(12,2) DEFAULT 0,
    loan_to_value_ratio numeric(5,2),
    debt_to_income_ratio numeric(5,2),
    application_status character varying(20) DEFAULT 'draft'::character varying,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text,
    bank_id integer,
    assigned_to integer,
    submitted_at timestamp without time zone,
    reviewed_at timestamp without time zone,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT loan_applications_application_status_check CHECK (((application_status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'under_review'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT loan_applications_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'pre_approved'::character varying, 'approved'::character varying, 'rejected'::character varying, 'conditional'::character varying])::text[]))),
    CONSTRAINT loan_applications_approved_amount_check CHECK ((approved_amount >= (0)::numeric)),
    CONSTRAINT loan_applications_debt_to_income_ratio_check CHECK ((debt_to_income_ratio >= (0)::numeric)),
    CONSTRAINT loan_applications_down_payment_check CHECK ((down_payment >= (0)::numeric)),
    CONSTRAINT loan_applications_interest_rate_check CHECK ((interest_rate >= (0)::numeric)),
    CONSTRAINT loan_applications_loan_term_years_check CHECK ((loan_term_years > 0)),
    CONSTRAINT loan_applications_loan_to_value_ratio_check CHECK (((loan_to_value_ratio >= (0)::numeric) AND (loan_to_value_ratio <= (100)::numeric))),
    CONSTRAINT loan_applications_loan_type_check CHECK (((loan_type)::text = ANY ((ARRAY['mortgage'::character varying, 'credit'::character varying, 'refinance_mortgage'::character varying, 'refinance_credit'::character varying, 'personal_loan'::character varying])::text[]))),
    CONSTRAINT loan_applications_monthly_payment_check CHECK ((monthly_payment >= (0)::numeric)),
    CONSTRAINT loan_applications_requested_amount_check CHECK ((requested_amount > (0)::numeric))
);


ALTER TABLE public.loan_applications OWNER TO postgres;

--
-- Name: loan_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.loan_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.loan_applications_id_seq OWNER TO postgres;

--
-- Name: loan_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.loan_applications_id_seq OWNED BY public.loan_applications.id;


--
-- Name: loan_calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_calculations (
    id integer NOT NULL,
    client_id integer,
    application_id integer,
    calculation_type character varying(30) NOT NULL,
    input_data jsonb NOT NULL,
    calculation_result jsonb NOT NULL,
    calculated_at timestamp without time zone DEFAULT now(),
    calculated_by integer,
    CONSTRAINT loan_calculations_calculation_type_check CHECK (((calculation_type)::text = ANY ((ARRAY['mortgage'::character varying, 'credit'::character varying, 'refinance'::character varying, 'affordability'::character varying])::text[])))
);


ALTER TABLE public.loan_calculations OWNER TO postgres;

--
-- Name: loan_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.loan_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.loan_calculations_id_seq OWNER TO postgres;

--
-- Name: loan_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.loan_calculations_id_seq OWNED BY public.loan_calculations.id;


--
-- Name: locales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locales (
    id integer NOT NULL,
    active integer NOT NULL,
    page_id bigint NOT NULL,
    key text NOT NULL,
    number integer,
    name_ru text NOT NULL,
    name_en text NOT NULL,
    name_he text NOT NULL,
    created_at date,
    updated_at date
);


ALTER TABLE public.locales OWNER TO postgres;

--
-- Name: locales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locales_id_seq OWNER TO postgres;

--
-- Name: locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locales_id_seq OWNED BY public.locales.id;


--
-- Name: mortgage_calculation_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mortgage_calculation_cache (
    id integer NOT NULL,
    session_id character varying(255),
    calculation_input jsonb NOT NULL,
    calculation_result jsonb NOT NULL,
    interest_rate_used numeric(5,3),
    calculated_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone DEFAULT (now() + '01:00:00'::interval)
);


ALTER TABLE public.mortgage_calculation_cache OWNER TO postgres;

--
-- Name: mortgage_calculation_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mortgage_calculation_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mortgage_calculation_cache_id_seq OWNER TO postgres;

--
-- Name: mortgage_calculation_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mortgage_calculation_cache_id_seq OWNED BY public.mortgage_calculation_cache.id;


--
-- Name: params; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.params (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    name_ru character varying(255),
    name_en character varying(255),
    name_he character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.params OWNER TO postgres;

--
-- Name: params_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.params_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.params_id_seq OWNER TO postgres;

--
-- Name: params_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.params_id_seq OWNED BY public.params.id;


--
-- Name: worker_approval_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_approval_queue (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_at timestamp without time zone,
    reviewed_by integer,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text,
    admin_notes text,
    priority integer DEFAULT 1,
    auto_approve_eligible boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_approval_reviewed CHECK (((((approval_status)::text = 'pending'::text) AND (reviewed_at IS NULL)) OR (((approval_status)::text <> 'pending'::text) AND (reviewed_at IS NOT NULL)))),
    CONSTRAINT chk_approval_reviewer CHECK (((((approval_status)::text = 'pending'::text) AND (reviewed_by IS NULL)) OR (((approval_status)::text <> 'pending'::text) AND (reviewed_by IS NOT NULL)))),
    CONSTRAINT worker_approval_queue_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'requires_changes'::character varying])::text[]))),
    CONSTRAINT worker_approval_queue_priority_check CHECK (((priority >= 1) AND (priority <= 5)))
);


ALTER TABLE public.worker_approval_queue OWNER TO postgres;

--
-- Name: pending_worker_approvals; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.pending_worker_approvals AS
 SELECT waq.id AS queue_id,
    be.id AS employee_id,
    be.name AS employee_name,
    be.corporate_email,
    be."position",
    b.name_en AS bank_name,
    bb.name_en AS branch_name,
    waq.submitted_at,
    waq.priority,
    waq.auto_approve_eligible,
    EXTRACT(days FROM (CURRENT_TIMESTAMP - (waq.submitted_at)::timestamp with time zone)) AS days_pending
   FROM (((public.worker_approval_queue waq
     JOIN public.bank_employees be ON ((waq.employee_id = be.id)))
     JOIN public.banks b ON ((be.bank_id = b.id)))
     LEFT JOIN public.bank_branches bb ON ((be.branch_id = bb.id)))
  WHERE ((waq.approval_status)::text = 'pending'::text)
  ORDER BY waq.priority DESC, waq.submitted_at;


ALTER VIEW public.pending_worker_approvals OWNER TO postgres;

--
-- Name: professions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professions (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_he character varying(100) NOT NULL,
    name_ru character varying(100) NOT NULL,
    category character varying(50) DEFAULT 'general'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.professions OWNER TO postgres;

--
-- Name: TABLE professions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.professions IS 'Professional categories and job types for user classification';


--
-- Name: COLUMN professions.key; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.professions.key IS 'Unique identifier for the profession';


--
-- Name: COLUMN professions.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.professions.category IS 'Category grouping for the profession (legal, finance, business, etc.)';


--
-- Name: professions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professions_id_seq OWNER TO postgres;

--
-- Name: professions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professions_id_seq OWNED BY public.professions.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    client_id integer,
    property_address text NOT NULL,
    property_type character varying(20) DEFAULT 'apartment'::character varying,
    property_age integer,
    property_condition character varying(20) DEFAULT 'good'::character varying,
    property_size_sqm integer,
    purchase_price numeric(12,2),
    current_market_value numeric(12,2),
    appraisal_value numeric(12,2),
    appraisal_date date,
    property_insurance boolean DEFAULT false,
    insurance_value numeric(12,2),
    ownership_percentage numeric(5,2) DEFAULT 100.00,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT properties_appraisal_value_check CHECK ((appraisal_value >= (0)::numeric)),
    CONSTRAINT properties_current_market_value_check CHECK ((current_market_value >= (0)::numeric)),
    CONSTRAINT properties_ownership_percentage_check CHECK (((ownership_percentage > (0)::numeric) AND (ownership_percentage <= (100)::numeric))),
    CONSTRAINT properties_property_age_check CHECK ((property_age >= 0)),
    CONSTRAINT properties_property_condition_check CHECK (((property_condition)::text = ANY ((ARRAY['excellent'::character varying, 'good'::character varying, 'fair'::character varying, 'poor'::character varying])::text[]))),
    CONSTRAINT properties_property_size_sqm_check CHECK ((property_size_sqm > 0)),
    CONSTRAINT properties_property_type_check CHECK (((property_type)::text = ANY ((ARRAY['apartment'::character varying, 'house'::character varying, 'commercial'::character varying, 'land'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT properties_purchase_price_check CHECK ((purchase_price >= (0)::numeric))
);


ALTER TABLE public.properties OWNER TO postgres;

--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.properties_id_seq OWNER TO postgres;

--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: property_ownership_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_ownership_options (
    id integer NOT NULL,
    option_key character varying(50) NOT NULL,
    option_text_ru text NOT NULL,
    option_text_en text,
    option_text_he text,
    ltv_percentage numeric(5,2) NOT NULL,
    financing_percentage numeric(5,2) NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_ownership_options OWNER TO postgres;

--
-- Name: property_ownership_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.property_ownership_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_ownership_options_id_seq OWNER TO postgres;

--
-- Name: property_ownership_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.property_ownership_options_id_seq OWNED BY public.property_ownership_options.id;


--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_he character varying(100) NOT NULL,
    name_ru character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- Name: TABLE regions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.regions IS 'Legal service regions for lawyers and legal professionals';


--
-- Name: COLUMN regions.key; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.regions.key IS 'Unique identifier for the region';


--
-- Name: COLUMN regions.name_en; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.regions.name_en IS 'Region name in English';


--
-- Name: COLUMN regions.name_he; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.regions.name_he IS 'Region name in Hebrew';


--
-- Name: COLUMN regions.name_ru; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.regions.name_ru IS 'Region name in Russian';


--
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regions_id_seq OWNER TO postgres;

--
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.regions_id_seq OWNED BY public.regions.id;


--
-- Name: registration_form_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registration_form_config (
    id integer NOT NULL,
    language text NOT NULL,
    field_name text NOT NULL,
    field_value text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.registration_form_config OWNER TO postgres;

--
-- Name: registration_form_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_form_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registration_form_config_id_seq OWNER TO postgres;

--
-- Name: registration_form_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registration_form_config_id_seq OWNED BY public.registration_form_config.id;


--
-- Name: registration_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registration_invitations_id_seq OWNER TO postgres;

--
-- Name: registration_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registration_invitations_id_seq OWNED BY public.registration_invitations.id;


--
-- Name: registration_validation_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registration_validation_rules (
    id integer NOT NULL,
    country_code character varying(2) NOT NULL,
    language_code character varying(2) NOT NULL,
    field_name character varying(50) NOT NULL,
    validation_type character varying(20) NOT NULL,
    validation_pattern text,
    error_message_key character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT registration_validation_rules_validation_type_check CHECK (((validation_type)::text = ANY ((ARRAY['regex'::character varying, 'length'::character varying, 'required'::character varying, 'format'::character varying])::text[])))
);


ALTER TABLE public.registration_validation_rules OWNER TO postgres;

--
-- Name: registration_validation_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_validation_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registration_validation_rules_id_seq OWNER TO postgres;

--
-- Name: registration_validation_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registration_validation_rules_id_seq OWNED BY public.registration_validation_rules.id;


--
-- Name: risk_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risk_parameters (
    id integer NOT NULL,
    bank_id integer,
    parameter_type character varying(50) NOT NULL,
    parameter_value numeric(10,2) NOT NULL,
    condition_type character varying(50) DEFAULT 'default'::character varying,
    condition_min numeric(10,2),
    condition_max numeric(10,2),
    description text,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.risk_parameters OWNER TO postgres;

--
-- Name: risk_parameters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.risk_parameters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.risk_parameters_id_seq OWNER TO postgres;

--
-- Name: risk_parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.risk_parameters_id_seq OWNED BY public.risk_parameters.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    service_key character varying(100) NOT NULL,
    name_en character varying(255) NOT NULL,
    name_ru character varying(255) NOT NULL,
    name_he character varying(255) NOT NULL,
    description_en text,
    description_ru text,
    description_he text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: test1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test1 (
    id integer NOT NULL,
    name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.test1 OWNER TO postgres;

--
-- Name: test1_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test1_id_seq OWNER TO postgres;

--
-- Name: test1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test1_id_seq OWNED BY public.test1.id;


--
-- Name: test_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.test_users OWNER TO postgres;

--
-- Name: test_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_users_id_seq OWNER TO postgres;

--
-- Name: test_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_users_id_seq OWNED BY public.test_users.id;


--
-- Name: tttt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tttt (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tttt OWNER TO postgres;

--
-- Name: tttt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tttt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tttt_id_seq OWNER TO postgres;

--
-- Name: tttt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tttt_id_seq OWNED BY public.tttt.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    password character varying(255),
    role character varying(50),
    photo character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vacancies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacancies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    subcategory character varying(50),
    location character varying(100) NOT NULL,
    employment_type character varying(30) NOT NULL,
    salary_min numeric(10,2),
    salary_max numeric(10,2),
    salary_currency character varying(3) DEFAULT 'ILS'::character varying,
    description_he text,
    description_en text,
    description_ru text,
    requirements_he text,
    requirements_en text,
    requirements_ru text,
    benefits_he text,
    benefits_en text,
    benefits_ru text,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    posted_date date DEFAULT CURRENT_DATE,
    closing_date date,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    responsibilities_he text,
    responsibilities_en text,
    responsibilities_ru text,
    nice_to_have_he text,
    nice_to_have_en text,
    nice_to_have_ru text,
    CONSTRAINT vacancies_category_check CHECK (((category)::text = ANY ((ARRAY['development'::character varying, 'design'::character varying, 'management'::character varying, 'marketing'::character varying, 'finance'::character varying, 'customer_service'::character varying])::text[]))),
    CONSTRAINT vacancies_check CHECK (((salary_max IS NULL) OR (salary_min IS NULL) OR (salary_max >= salary_min))),
    CONSTRAINT vacancies_check1 CHECK (((closing_date IS NULL) OR (closing_date >= posted_date))),
    CONSTRAINT vacancies_employment_type_check CHECK (((employment_type)::text = ANY ((ARRAY['full_time'::character varying, 'part_time'::character varying, 'contract'::character varying, 'temporary'::character varying])::text[])))
);


ALTER TABLE public.vacancies OWNER TO postgres;

--
-- Name: vacancies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacancies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vacancies_id_seq OWNER TO postgres;

--
-- Name: vacancies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vacancies_id_seq OWNED BY public.vacancies.id;


--
-- Name: vacancy_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacancy_applications (
    id integer NOT NULL,
    vacancy_id integer,
    applicant_name character varying(255) NOT NULL,
    applicant_email character varying(255) NOT NULL,
    applicant_phone character varying(20),
    cover_letter text,
    resume_file_path character varying(500),
    portfolio_url character varying(255),
    application_status character varying(20) DEFAULT 'pending'::character varying,
    applied_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone,
    reviewed_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    applicant_city character varying(100),
    expected_salary integer,
    CONSTRAINT vacancy_applications_application_status_check CHECK (((application_status)::text = ANY ((ARRAY['pending'::character varying, 'reviewing'::character varying, 'shortlisted'::character varying, 'interviewed'::character varying, 'rejected'::character varying, 'hired'::character varying])::text[])))
);


ALTER TABLE public.vacancy_applications OWNER TO postgres;

--
-- Name: vacancy_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacancy_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vacancy_applications_id_seq OWNER TO postgres;

--
-- Name: vacancy_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vacancy_applications_id_seq OWNED BY public.vacancy_applications.id;


--
-- Name: worker_approval_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_approval_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_approval_queue_id_seq OWNER TO postgres;

--
-- Name: worker_approval_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_approval_queue_id_seq OWNED BY public.worker_approval_queue.id;


--
-- Name: 11111 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."11111" ALTER COLUMN id SET DEFAULT nextval('public."11111_id_seq"'::regclass);


--
-- Name: admin_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit_log ALTER COLUMN id SET DEFAULT nextval('public.admin_audit_log_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: application_contexts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_contexts ALTER COLUMN id SET DEFAULT nextval('public.application_contexts_id_seq'::regclass);


--
-- Name: approval_matrix id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_matrix ALTER COLUMN id SET DEFAULT nextval('public.approval_matrix_id_seq'::regclass);


--
-- Name: bank_analytics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_analytics ALTER COLUMN id SET DEFAULT nextval('public.bank_analytics_id_seq'::regclass);


--
-- Name: bank_branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_branches ALTER COLUMN id SET DEFAULT nextval('public.bank_branches_id_seq'::regclass);


--
-- Name: bank_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_config ALTER COLUMN id SET DEFAULT nextval('public.bank_config_id_seq'::regclass);


--
-- Name: bank_configurations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations ALTER COLUMN id SET DEFAULT nextval('public.bank_configurations_id_seq'::regclass);


--
-- Name: bank_employee_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employee_sessions ALTER COLUMN id SET DEFAULT nextval('public.bank_employee_sessions_id_seq'::regclass);


--
-- Name: bank_employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employees ALTER COLUMN id SET DEFAULT nextval('public.bank_employees_id_seq'::regclass);


--
-- Name: bank_fallback_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_fallback_config ALTER COLUMN id SET DEFAULT nextval('public.bank_fallback_config_id_seq'::regclass);


--
-- Name: bank_standards_overrides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_standards_overrides ALTER COLUMN id SET DEFAULT nextval('public.bank_standards_overrides_id_seq'::regclass);


--
-- Name: banking_standards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards ALTER COLUMN id SET DEFAULT nextval('public.banking_standards_id_seq'::regclass);


--
-- Name: banking_standards_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards_history ALTER COLUMN id SET DEFAULT nextval('public.banking_standards_history_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: calculation_parameters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_parameters ALTER COLUMN id SET DEFAULT nextval('public.calculation_parameters_id_seq'::regclass);


--
-- Name: calculation_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_rules ALTER COLUMN id SET DEFAULT nextval('public.calculation_rules_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: client_assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_assets ALTER COLUMN id SET DEFAULT nextval('public.client_assets_id_seq'::regclass);


--
-- Name: client_credit_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_credit_history ALTER COLUMN id SET DEFAULT nextval('public.client_credit_history_id_seq'::regclass);


--
-- Name: client_debts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_debts ALTER COLUMN id SET DEFAULT nextval('public.client_debts_id_seq'::regclass);


--
-- Name: client_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_documents ALTER COLUMN id SET DEFAULT nextval('public.client_documents_id_seq'::regclass);


--
-- Name: client_employment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_employment ALTER COLUMN id SET DEFAULT nextval('public.client_employment_id_seq'::regclass);


--
-- Name: client_form_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_form_sessions ALTER COLUMN id SET DEFAULT nextval('public.client_form_sessions_id_seq'::regclass);


--
-- Name: client_identity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_identity ALTER COLUMN id SET DEFAULT nextval('public.client_identity_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


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
-- Name: interest_rate_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interest_rate_rules ALTER COLUMN id SET DEFAULT nextval('public.interest_rate_rules_id_seq'::regclass);


--
-- Name: israeli_bank_numbers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.israeli_bank_numbers ALTER COLUMN id SET DEFAULT nextval('public.israeli_bank_numbers_id_seq'::regclass);


--
-- Name: lawyer_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lawyer_applications ALTER COLUMN id SET DEFAULT nextval('public.lawyer_applications_id_seq'::regclass);


--
-- Name: loan_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications ALTER COLUMN id SET DEFAULT nextval('public.loan_applications_id_seq'::regclass);


--
-- Name: loan_calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_calculations ALTER COLUMN id SET DEFAULT nextval('public.loan_calculations_id_seq'::regclass);


--
-- Name: locales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locales ALTER COLUMN id SET DEFAULT nextval('public.locales_id_seq'::regclass);


--
-- Name: mortgage_calculation_cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mortgage_calculation_cache ALTER COLUMN id SET DEFAULT nextval('public.mortgage_calculation_cache_id_seq'::regclass);


--
-- Name: params id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.params ALTER COLUMN id SET DEFAULT nextval('public.params_id_seq'::regclass);


--
-- Name: professions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professions ALTER COLUMN id SET DEFAULT nextval('public.professions_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: property_ownership_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_ownership_options ALTER COLUMN id SET DEFAULT nextval('public.property_ownership_options_id_seq'::regclass);


--
-- Name: regions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions ALTER COLUMN id SET DEFAULT nextval('public.regions_id_seq'::regclass);


--
-- Name: registration_form_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_form_config ALTER COLUMN id SET DEFAULT nextval('public.registration_form_config_id_seq'::regclass);


--
-- Name: registration_invitations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations ALTER COLUMN id SET DEFAULT nextval('public.registration_invitations_id_seq'::regclass);


--
-- Name: registration_validation_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_validation_rules ALTER COLUMN id SET DEFAULT nextval('public.registration_validation_rules_id_seq'::regclass);


--
-- Name: risk_parameters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_parameters ALTER COLUMN id SET DEFAULT nextval('public.risk_parameters_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: test1 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test1 ALTER COLUMN id SET DEFAULT nextval('public.test1_id_seq'::regclass);


--
-- Name: test_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_users ALTER COLUMN id SET DEFAULT nextval('public.test_users_id_seq'::regclass);


--
-- Name: tttt id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tttt ALTER COLUMN id SET DEFAULT nextval('public.tttt_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vacancies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancies ALTER COLUMN id SET DEFAULT nextval('public.vacancies_id_seq'::regclass);


--
-- Name: vacancy_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_applications ALTER COLUMN id SET DEFAULT nextval('public.vacancy_applications_id_seq'::regclass);


--
-- Name: worker_approval_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_approval_queue ALTER COLUMN id SET DEFAULT nextval('public.worker_approval_queue_id_seq'::regclass);


--
-- Data for Name: 11111; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."11111" (id, created_at) FROM stdin;
\.


--
-- Data for Name: admin_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_audit_log (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
1	1	migration	system	5	\N	{"migration": "005-multi-role-admin", "status": "completed", "tables_created": ["admin_users", "bank_configurations", "interest_rate_rules", "risk_parameters", "admin_audit_log", "bank_analytics"]}	127.0.0.1	\N	2025-06-14 19:31:39.642894
3	1	MIGRATION_APPLIED	migration_012	\N	{}	{"migration": "012-enhanced-bank-worker-system", "tables_added": 3, "tables_enhanced": 3, "indexes_created": 15, "functions_created": 3, "triggers_created": 4, "views_created": 3}	\N	\N	2025-07-09 15:03:31.985772
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, username, email, password_hash, role, bank_id, permissions, is_active, created_at, last_login, created_by, updated_at) FROM stdin;
1	admin	admin@bankim.com	admin123	business_admin	\N	{"all": true, "can_create_users": true, "can_modify_banks": true, "can_view_audit": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
2	admin_state_bank_of_israel	admin@statebankofisrael.bankim.com	admin123	bank_admin	75	{"bank_id": 75, "can_modify_own_bank": true, "can_view_analytics": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
3	admin_bank_hapoalim	admin@bankhapoalim.bankim.com	admin123	bank_admin	76	{"bank_id": 76, "can_modify_own_bank": true, "can_view_analytics": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
4	admin_discount_bank	admin@discountbank.bankim.com	admin123	bank_admin	77	{"bank_id": 77, "can_modify_own_bank": true, "can_view_analytics": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
5	admin_bank_leumi	admin@bankleumi.bankim.com	admin123	bank_admin	78	{"bank_id": 78, "can_modify_own_bank": true, "can_view_analytics": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
6	admin_bank_beinleumi	admin@bankbeinleumi.bankim.com	admin123	bank_admin	79	{"bank_id": 79, "can_modify_own_bank": true, "can_view_analytics": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
7	risk_manager	risk@bankim.com	admin123	risk_manager	\N	{"can_view_risk_reports": true, "can_modify_risk_parameters": true, "can_view_all_banks": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
8	compliance	compliance@bankim.com	admin123	compliance	\N	{"can_view_audit_logs": true, "can_generate_reports": true, "can_view_all_banks": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
9	system_admin	system@bankim.com	admin123	system_admin	\N	{"all": true, "can_manage_system": true, "can_backup_restore": true}	t	2025-06-14 19:31:39.642894	\N	\N	2025-06-14 19:31:39.642894
\.


--
-- Data for Name: application_contexts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_contexts (id, context_code, context_name, description, display_order, is_active, created_at, updated_at) FROM stdin;
1	public	Public Website	Pre-registration content for anonymous users (До регистрации)	1	t	2025-07-24 23:44:49.009708	2025-07-24 23:44:49.009708
2	user_portal	User Dashboard	Personal cabinet for authenticated users (Личный кабинет)	2	t	2025-07-24 23:44:49.009708	2025-07-24 23:44:49.009708
3	cms	Content Management	Admin panel for website content management (Админ панель для сайтов)	3	t	2025-07-24 23:44:49.009708	2025-07-24 23:44:49.009708
4	bank_ops	Banking Operations	Admin panel for bank employee workflows (Админ панель для банков)	4	t	2025-07-24 23:44:49.009708	2025-07-24 23:44:49.009708
\.


--
-- Data for Name: approval_matrix; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.approval_matrix (id, business_path, approval_level, condition_name, condition_logic, approval_message, rejection_reason, required_documents, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bank_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_analytics (id, bank_id, metric_type, metric_value, period_type, period_date, created_at) FROM stdin;
\.


--
-- Data for Name: bank_branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_branches (id, bank_id, name_en, name_he, name_ru, branch_code, address, city, country, phone, email, created_at, updated_at, is_active, max_workers) FROM stdin;
\.


--
-- Data for Name: bank_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_config (id, bank_id, base_rate, min_rate, max_rate, created_at, updated_at) FROM stdin;
1	77	0.11	0.03	0.30	2025-06-15 20:49:23.758152	2025-06-15 20:49:23.758152
\.


--
-- Data for Name: bank_configurations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_configurations (id, bank_id, product_type, base_interest_rate, min_interest_rate, max_interest_rate, risk_premium, processing_fee, max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, auto_approval_enabled, max_applications_per_day, is_active, effective_from, effective_to, updated_by, updated_at, created_at) FROM stdin;
19	75	mortgage	3.180	2.800	4.500	\N	2500.00	82.00	620	8000000.00	100000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:46.181413	2025-07-15 23:10:46.181413
20	76	mortgage	3.250	2.900	4.600	\N	2800.00	80.00	630	7500000.00	120000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:46.323471	2025-07-15 23:10:46.323471
21	77	mortgage	3.300	2.950	4.650	\N	3000.00	78.00	640	7000000.00	150000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:46.493498	2025-07-15 23:10:46.493498
22	78	mortgage	3.350	3.000	4.700	\N	3200.00	75.00	650	6500000.00	180000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:46.633709	2025-07-15 23:10:46.633709
23	79	mortgage	3.400	3.050	4.750	\N	3500.00	72.00	660	6000000.00	200000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:46.959556	2025-07-15 23:10:46.959556
24	80	mortgage	3.500	3.100	4.800	\N	3800.00	70.00	680	5500000.00	250000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:47.072573	2025-07-15 23:10:47.072573
25	81	mortgage	3.280	2.850	4.550	\N	2700.00	77.00	625	7200000.00	140000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:47.289801	2025-07-15 23:10:47.289801
26	82	mortgage	3.320	2.880	4.580	\N	2900.00	76.00	635	7000000.00	160000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:47.482885	2025-07-15 23:10:47.482885
27	83	mortgage	3.380	2.950	4.680	\N	3100.00	74.00	645	6800000.00	180000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:47.603401	2025-07-15 23:10:47.603401
28	84	mortgage	3.420	3.000	4.720	\N	3300.00	73.00	655	6500000.00	200000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:47.726265	2025-07-15 23:10:47.726265
29	85	mortgage	3.450	3.050	4.750	\N	3400.00	71.00	665	6200000.00	220000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:47.859516	2025-07-15 23:10:47.859516
30	86	mortgage	3.480	3.080	4.780	\N	3600.00	70.00	670	6000000.00	240000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:48.050575	2025-07-15 23:10:48.050575
31	87	mortgage	3.520	3.120	4.820	\N	3700.00	68.00	675	5800000.00	260000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:48.293659	2025-07-15 23:10:48.293659
32	88	mortgage	3.550	3.150	4.850	\N	3800.00	67.00	680	5500000.00	280000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:48.413341	2025-07-15 23:10:48.413341
33	89	mortgage	3.580	3.180	4.880	\N	3900.00	66.00	685	5200000.00	300000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:48.603569	2025-07-15 23:10:48.603569
34	90	mortgage	3.600	3.200	4.900	\N	4000.00	65.00	690	5000000.00	320000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:48.71351	2025-07-15 23:10:48.71351
35	91	mortgage	3.620	3.220	4.920	\N	4100.00	64.00	695	4800000.00	340000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:48.833783	2025-07-15 23:10:48.833783
36	92	mortgage	3.650	3.250	4.950	\N	4200.00	63.00	700	4500000.00	360000.00	f	100	t	2025-07-15	\N	\N	2025-07-15 23:10:49.001502	2025-07-15 23:10:49.001502
\.


--
-- Data for Name: bank_employee_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_employee_sessions (id, employee_id, token, expires_at, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: bank_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_employees (id, name, "position", corporate_email, bank_id, branch_id, bank_number, status, terms_accepted, terms_accepted_at, created_at, updated_at, last_login, password_hash, registration_token, registration_expires, invitation_token, invitation_expires_at, approval_status, approved_by, approved_at, auto_delete_after, last_activity_at, registration_ip, registration_user_agent) FROM stdin;
\.


--
-- Data for Name: bank_fallback_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_fallback_config (id, enable_fallback, fallback_method, max_fallback_banks, default_term_years, language_preference, created_at, updated_at) FROM stdin;
1	t	database_relaxed	3	25	auto	2025-07-20 22:28:26.394345	2025-07-20 22:28:26.394345
\.


--
-- Data for Name: bank_standards_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_standards_overrides (id, bank_id, banking_standard_id, override_value, override_reason, is_active, effective_from, effective_to, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: banking_standards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banking_standards (id, business_path, standard_category, standard_name, standard_value, value_type, min_value, max_value, description, is_active, is_required, priority_order, effective_from, effective_to, created_by, created_at, updated_at) FROM stdin;
2	mortgage	ltv	pmi_ltv_max	97.0000	percentage	80.0100	97.0000	Maximum LTV with PMI insurance	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-13 13:42:02.606201
6	mortgage	age	minimum_age	18.0000	years	18.0000	21.0000	Minimum age for mortgage application	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-13 13:42:02.606201
7	mortgage	age	maximum_age_at_maturity	75.0000	years	70.0000	80.0000	Maximum age at loan maturity	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-13 13:42:02.606201
8	mortgage	income	minimum_monthly_income	3000.0000	amount	2000.0000	5000.0000	Minimum monthly income requirement	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-13 13:42:02.606201
10	mortgage_refinance	ltv	cash_out_ltv_max	80.0000	percentage	70.0000	85.0000	Maximum LTV for cash-out refinance	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.689914	2025-06-13 13:42:02.689914
11	mortgage_refinance	dti	front_end_dti_max	30.0000	percentage	25.0000	35.0000	Maximum front-end DTI ratio for refinance	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.689914	2025-06-13 13:42:02.689914
13	mortgage_refinance	credit_score	minimum_credit_score	640.0000	score	600.0000	680.0000	Minimum credit score for mortgage refinance	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.689914	2025-06-13 13:42:02.689914
14	mortgage_refinance	refinance	minimum_savings_percentage	2.0000	percentage	1.0000	5.0000	Minimum monthly payment savings required	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.689914	2025-06-13 13:42:02.689914
29	credit	dti	maximum_dti_ratio	40.0000	percentage	30.0000	50.0000	Maximum DTI ratio for credit/loans	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.683366	2025-06-13 13:42:18.683366
30	credit	credit_score	minimum_credit_score	600.0000	score	550.0000	650.0000	Minimum credit score for credit approval	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.683366	2025-06-13 13:42:18.683366
31	credit	amount	minimum_loan_amount	5000.0000	amount	1000.0000	10000.0000	Minimum loan amount	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.683366	2025-06-13 13:42:18.683366
32	credit	amount	maximum_loan_amount	100000.0000	amount	50000.0000	500000.0000	Maximum loan amount	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.683366	2025-06-13 13:42:18.683366
33	credit	age	minimum_age	18.0000	years	18.0000	21.0000	Minimum age for credit application	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.683366	2025-06-13 13:42:18.683366
35	credit_refinance	dti	maximum_dti_ratio	42.0000	percentage	35.0000	50.0000	Maximum DTI ratio for credit refinance	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.767046	2025-06-13 13:42:18.767046
36	credit_refinance	credit_score	minimum_credit_score	620.0000	score	580.0000	660.0000	Minimum credit score for credit refinance	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.767046	2025-06-13 13:42:18.767046
37	credit_refinance	refinance	minimum_savings_amount	100.0000	amount	50.0000	200.0000	Minimum monthly savings required	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.767046	2025-06-13 13:42:18.767046
38	credit_refinance	refinance	minimum_rate_reduction	1.0000	percentage	0.5000	2.0000	Minimum interest rate reduction required	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.767046	2025-06-13 13:42:18.767046
3	mortgage	dti	front_end_dti_max	33.0000	percentage	20.0000	35.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-14 21:25:31.727315
39	mortgage	property_ownership_ltv	no_property_max_ltv	75.0000	percentage	60.0000	85.0000	Maximum LTV for borrowers with no existing property - allows 75% financing	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
40	mortgage	property_ownership_ltv	has_property_max_ltv	50.0000	percentage	40.0000	70.0000	Maximum LTV for borrowers who already own property - conservative 50% financing	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
12	mortgage_refinance	dti	back_end_dti_max	45.0000	percentage	40.0000	50.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.689914	2025-06-14 13:35:10.251823
41	mortgage	property_ownership_ltv	selling_property_max_ltv	70.0000	percentage	60.0000	80.0000	Maximum LTV for borrowers selling existing property - 70% financing bridge	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
9	mortgage_refinance	ltv	standard_ltv_max	9.0000	percentage	60.0000	90.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.689914	2025-06-14 13:37:26.872973
42	mortgage	dti	mortgage_max_dti	42.0000	percentage	35.0000	50.0000	Maximum debt-to-income ratio for mortgage approvals	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
43	credit	dti	credit_max_dti	42.0000	percentage	35.0000	50.0000	Maximum debt-to-income ratio for credit approvals	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
44	mortgage_refinance	dti	refinance_max_dti	42.0000	percentage	35.0000	50.0000	Maximum debt-to-income ratio for mortgage refinancing approvals	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
45	credit_refinance	dti	refinance_max_dti	42.0000	percentage	35.0000	50.0000	Maximum debt-to-income ratio for credit refinancing approvals	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
46	mortgage	stress_testing	stress_test_rate	6.5000	percentage	5.0000	8.0000	Stress testing interest rate for affordability calculations	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
47	credit	stress_testing	stress_test_rate	6.5000	percentage	5.0000	8.0000	Stress testing interest rate for credit affordability calculations	t	t	1	2025-07-15	\N	\N	2025-07-15 23:25:38.643498	2025-07-15 23:25:38.643498
48	mortgage	credit_score	warning_credit_score	700.0000	score	650.0000	750.0000	Credit score below this triggers higher interest rate warning	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
49	credit	credit_score	warning_credit_score	700.0000	score	650.0000	750.0000	Credit score below this triggers higher interest rate warning	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
4	mortgage	dti	back_end_dti_max	42.0000	percentage	35.0000	50.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-14 16:28:55.676531
34	credit	income	minimum_monthly_income	2000.0000	amount	1500.0000	3000.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:18.683366	2025-06-14 16:28:57.168713
5	mortgage	credit_score	minimum_credit_score	620.0000	score	580.0000	700.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-14 16:29:06.709624
50	mortgage_refinance	credit_score	warning_credit_score	700.0000	score	650.0000	750.0000	Credit score below this triggers higher interest rate warning	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
51	credit_refinance	credit_score	warning_credit_score	700.0000	score	650.0000	750.0000	Credit score below this triggers higher interest rate warning	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
52	mortgage	credit_score	poor_credit_score	680.0000	score	620.0000	700.0000	Credit score below this considered poor credit	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
53	credit	credit_score	poor_credit_score	680.0000	score	620.0000	700.0000	Credit score below this considered poor credit	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
54	mortgage_refinance	credit_score	poor_credit_score	670.0000	score	620.0000	700.0000	Credit score below this considered poor credit	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
55	credit_refinance	credit_score	poor_credit_score	680.0000	score	620.0000	700.0000	Credit score below this considered poor credit	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
1	mortgage	ltv	standard_ltv_max	50.0100	percentage	50.0000	95.0000	\N	t	t	1	2025-06-13	\N	\N	2025-06-13 13:42:02.606201	2025-06-14 21:24:19.184555
56	mortgage	credit_score	premium_credit_score	750.0000	score	720.0000	800.0000	Credit score for premium rate tiers	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
57	credit	credit_score	premium_credit_score	750.0000	score	720.0000	800.0000	Credit score for premium rate tiers	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
58	mortgage_refinance	credit_score	premium_credit_score	750.0000	score	720.0000	800.0000	Credit score for premium rate tiers	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
59	credit_refinance	credit_score	premium_credit_score	750.0000	score	720.0000	800.0000	Credit score for premium rate tiers	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
60	mortgage	ltv	premium_ltv_max	70.0000	percentage	60.0000	80.0000	LTV threshold for premium rates	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
61	mortgage_refinance	ltv	premium_ltv_max	70.0000	percentage	60.0000	80.0000	LTV threshold for premium rates	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
62	mortgage	dti	warning_dti_max	35.0000	percentage	28.0000	42.0000	DTI above this triggers warnings	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
63	credit	dti	warning_dti_max	35.0000	percentage	28.0000	42.0000	DTI above this triggers warnings	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
64	mortgage_refinance	dti	warning_dti_max	35.0000	percentage	28.0000	42.0000	DTI above this triggers warnings	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
65	credit_refinance	dti	warning_dti_max	35.0000	percentage	28.0000	42.0000	DTI above this triggers warnings	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
66	mortgage	dti	premium_dti_max	30.0000	percentage	25.0000	35.0000	DTI threshold for premium rates	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
67	credit	dti	premium_dti_max	30.0000	percentage	25.0000	35.0000	DTI threshold for premium rates	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
68	mortgage_refinance	dti	premium_dti_max	30.0000	percentage	25.0000	35.0000	DTI threshold for premium rates	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
69	credit_refinance	dti	premium_dti_max	30.0000	percentage	25.0000	35.0000	DTI threshold for premium rates	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
70	mortgage	rates	quick_excellent_rate	3.5000	percentage	3.0000	4.0000	Rate for excellent credit in quick assessment	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
71	mortgage	rates	quick_good_rate	4.0000	percentage	3.5000	4.5000	Rate for good credit in quick assessment	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
72	mortgage	rates	quick_fair_rate	4.5000	percentage	4.0000	5.0000	Rate for fair credit in quick assessment	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
73	credit	rates	quick_excellent_rate	7.5000	percentage	6.0000	8.0000	Rate for excellent credit in quick assessment	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
74	credit	rates	quick_good_rate	8.5000	percentage	7.0000	9.0000	Rate for good credit in quick assessment	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
75	credit	rates	quick_fair_rate	10.0000	percentage	8.0000	12.0000	Rate for fair credit in quick assessment	t	t	1	2025-07-15	\N	\N	2025-07-15 23:48:19.328403	2025-07-15 23:48:19.328403
\.


--
-- Data for Name: banking_standards_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banking_standards_history (id, banking_standard_id, business_path, standard_category, standard_name, old_value, new_value, old_description, new_description, old_is_active, new_is_active, change_type, change_reason, changed_by, changed_at, ip_address, user_agent, session_id) FROM stdin;
1	1	mortgage	ltv	standard_ltv_max	\N	80.0000	\N	Standard maximum LTV ratio for mortgages	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
2	2	mortgage	ltv	pmi_ltv_max	\N	97.0000	\N	Maximum LTV with PMI insurance	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
3	3	mortgage	dti	front_end_dti_max	\N	28.0000	\N	Maximum front-end DTI ratio	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
4	4	mortgage	dti	back_end_dti_max	\N	42.0000	\N	Maximum back-end DTI ratio	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
5	5	mortgage	credit_score	minimum_credit_score	\N	620.0000	\N	Minimum credit score for mortgage approval	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
6	6	mortgage	age	minimum_age	\N	18.0000	\N	Minimum age for mortgage application	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
7	7	mortgage	age	maximum_age_at_maturity	\N	75.0000	\N	Maximum age at loan maturity	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
8	8	mortgage	income	minimum_monthly_income	\N	3000.0000	\N	Minimum monthly income requirement	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.606201	\N	\N	\N
9	9	mortgage_refinance	ltv	standard_ltv_max	\N	85.0000	\N	Standard maximum LTV ratio for mortgage refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.689914	\N	\N	\N
10	10	mortgage_refinance	ltv	cash_out_ltv_max	\N	80.0000	\N	Maximum LTV for cash-out refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.689914	\N	\N	\N
11	11	mortgage_refinance	dti	front_end_dti_max	\N	30.0000	\N	Maximum front-end DTI ratio for refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.689914	\N	\N	\N
12	12	mortgage_refinance	dti	back_end_dti_max	\N	45.0000	\N	Maximum back-end DTI ratio for refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.689914	\N	\N	\N
13	13	mortgage_refinance	credit_score	minimum_credit_score	\N	640.0000	\N	Minimum credit score for mortgage refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.689914	\N	\N	\N
14	14	mortgage_refinance	refinance	minimum_savings_percentage	\N	2.0000	\N	Minimum monthly payment savings required	\N	t	INSERT	\N	\N	2025-06-13 13:42:02.689914	\N	\N	\N
15	29	credit	dti	maximum_dti_ratio	\N	40.0000	\N	Maximum DTI ratio for credit/loans	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.683366	\N	\N	\N
16	30	credit	credit_score	minimum_credit_score	\N	600.0000	\N	Minimum credit score for credit approval	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.683366	\N	\N	\N
17	31	credit	amount	minimum_loan_amount	\N	5000.0000	\N	Minimum loan amount	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.683366	\N	\N	\N
18	32	credit	amount	maximum_loan_amount	\N	100000.0000	\N	Maximum loan amount	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.683366	\N	\N	\N
19	33	credit	age	minimum_age	\N	18.0000	\N	Minimum age for credit application	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.683366	\N	\N	\N
20	34	credit	income	minimum_monthly_income	\N	2000.0000	\N	Minimum monthly income for credit	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.683366	\N	\N	\N
21	35	credit_refinance	dti	maximum_dti_ratio	\N	42.0000	\N	Maximum DTI ratio for credit refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.767046	\N	\N	\N
22	36	credit_refinance	credit_score	minimum_credit_score	\N	620.0000	\N	Minimum credit score for credit refinance	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.767046	\N	\N	\N
23	37	credit_refinance	refinance	minimum_savings_amount	\N	100.0000	\N	Minimum monthly savings required	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.767046	\N	\N	\N
24	38	credit_refinance	refinance	minimum_rate_reduction	\N	1.0000	\N	Minimum interest rate reduction required	\N	t	INSERT	\N	\N	2025-06-13 13:42:18.767046	\N	\N	\N
25	1	mortgage	ltv	standard_ltv_max	80.0000	80.0100	Standard maximum LTV ratio for mortgages	Standard maximum LTV ratio for mortgages	t	t	UPDATE	\N	\N	2025-06-14 13:15:34.227461	\N	\N	\N
26	1	mortgage	ltv	standard_ltv_max	80.0100	80.0000	Standard maximum LTV ratio for mortgages	Standard maximum LTV ratio for mortgages	t	t	UPDATE	\N	\N	2025-06-14 13:15:34.378233	\N	\N	\N
27	1	mortgage	ltv	standard_ltv_max	80.0000	10.0000	Standard maximum LTV ratio for mortgages	\N	t	t	UPDATE	\N	\N	2025-06-14 13:33:49.675254	\N	\N	\N
28	12	mortgage_refinance	dti	back_end_dti_max	45.0000	10.0000	Maximum back-end DTI ratio for refinance	\N	t	t	UPDATE	\N	\N	2025-06-14 13:35:03.501281	\N	\N	\N
29	12	mortgage_refinance	dti	back_end_dti_max	10.0000	45.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 13:35:10.251823	\N	\N	\N
30	9	mortgage_refinance	ltv	standard_ltv_max	85.0000	10.0000	Standard maximum LTV ratio for mortgage refinance	\N	t	t	UPDATE	\N	\N	2025-06-14 13:36:34.924847	\N	\N	\N
31	9	mortgage_refinance	ltv	standard_ltv_max	10.0000	9.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 13:37:26.872973	\N	\N	\N
32	1	mortgage	ltv	standard_ltv_max	10.0000	85.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 13:40:44.75178	\N	\N	\N
33	1	mortgage	ltv	standard_ltv_max	85.0000	50.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 15:57:28.898435	\N	\N	\N
34	1	mortgage	ltv	standard_ltv_max	50.0000	80.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:18:50.304549	\N	\N	\N
35	1	mortgage	ltv	standard_ltv_max	80.0000	20.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:23:23.850036	\N	\N	\N
36	5	mortgage	credit_score	minimum_credit_score	620.0000	400.0000	Minimum credit score for mortgage approval	\N	t	t	UPDATE	\N	\N	2025-06-14 16:23:52.915073	\N	\N	\N
37	34	credit	income	minimum_monthly_income	2000.0000	1000.0000	Minimum monthly income for credit	\N	t	t	UPDATE	\N	\N	2025-06-14 16:24:26.25432	\N	\N	\N
38	3	mortgage	dti	front_end_dti_max	28.0000	80.0000	Maximum front-end DTI ratio	\N	t	t	UPDATE	\N	\N	2025-06-14 16:24:56.093336	\N	\N	\N
39	4	mortgage	dti	back_end_dti_max	42.0000	50.0000	Maximum back-end DTI ratio	\N	t	t	UPDATE	\N	\N	2025-06-14 16:25:08.741543	\N	\N	\N
40	4	mortgage	dti	back_end_dti_max	50.0000	42.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:28:55.676531	\N	\N	\N
41	3	mortgage	dti	front_end_dti_max	80.0000	28.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:28:55.787036	\N	\N	\N
42	34	credit	income	minimum_monthly_income	1000.0000	2000.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:28:57.168713	\N	\N	\N
43	5	mortgage	credit_score	minimum_credit_score	400.0000	620.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:29:06.709624	\N	\N	\N
44	1	mortgage	ltv	standard_ltv_max	20.0000	80.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:29:08.176302	\N	\N	\N
45	1	mortgage	ltv	standard_ltv_max	80.0000	50.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:29:19.169218	\N	\N	\N
46	1	mortgage	ltv	standard_ltv_max	50.0000	30.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:31:41.730919	\N	\N	\N
47	1	mortgage	ltv	standard_ltv_max	30.0000	60.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 16:42:48.873323	\N	\N	\N
48	1	mortgage	ltv	standard_ltv_max	60.0000	48.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 21:13:26.236033	\N	\N	\N
49	1	mortgage	ltv	standard_ltv_max	48.0000	48.0100	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 21:24:12.962671	\N	\N	\N
50	1	mortgage	ltv	standard_ltv_max	48.0100	50.0100	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 21:24:19.184555	\N	\N	\N
51	3	mortgage	dti	front_end_dti_max	28.0000	3.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 21:25:29.825209	\N	\N	\N
52	3	mortgage	dti	front_end_dti_max	3.0000	33.0000	\N	\N	t	t	UPDATE	\N	\N	2025-06-14 21:25:31.727315	\N	\N	\N
53	39	mortgage	property_ownership_ltv	no_property_max_ltv	\N	75.0000	\N	Maximum LTV for borrowers with no existing property - allows 75% financing	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
54	40	mortgage	property_ownership_ltv	has_property_max_ltv	\N	50.0000	\N	Maximum LTV for borrowers who already own property - conservative 50% financing	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
55	41	mortgage	property_ownership_ltv	selling_property_max_ltv	\N	70.0000	\N	Maximum LTV for borrowers selling existing property - 70% financing bridge	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
56	42	mortgage	dti	mortgage_max_dti	\N	42.0000	\N	Maximum debt-to-income ratio for mortgage approvals	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
57	43	credit	dti	credit_max_dti	\N	42.0000	\N	Maximum debt-to-income ratio for credit approvals	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
58	44	mortgage_refinance	dti	refinance_max_dti	\N	42.0000	\N	Maximum debt-to-income ratio for mortgage refinancing approvals	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
59	45	credit_refinance	dti	refinance_max_dti	\N	42.0000	\N	Maximum debt-to-income ratio for credit refinancing approvals	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
60	46	mortgage	stress_testing	stress_test_rate	\N	6.5000	\N	Stress testing interest rate for affordability calculations	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
61	47	credit	stress_testing	stress_test_rate	\N	6.5000	\N	Stress testing interest rate for credit affordability calculations	\N	t	INSERT	\N	\N	2025-07-15 23:25:38.643498	\N	\N	\N
62	48	mortgage	credit_score	warning_credit_score	\N	700.0000	\N	Credit score below this triggers higher interest rate warning	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
63	49	credit	credit_score	warning_credit_score	\N	700.0000	\N	Credit score below this triggers higher interest rate warning	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
64	50	mortgage_refinance	credit_score	warning_credit_score	\N	700.0000	\N	Credit score below this triggers higher interest rate warning	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
65	51	credit_refinance	credit_score	warning_credit_score	\N	700.0000	\N	Credit score below this triggers higher interest rate warning	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
66	52	mortgage	credit_score	poor_credit_score	\N	680.0000	\N	Credit score below this considered poor credit	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
67	53	credit	credit_score	poor_credit_score	\N	680.0000	\N	Credit score below this considered poor credit	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
68	54	mortgage_refinance	credit_score	poor_credit_score	\N	670.0000	\N	Credit score below this considered poor credit	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
69	55	credit_refinance	credit_score	poor_credit_score	\N	680.0000	\N	Credit score below this considered poor credit	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
70	56	mortgage	credit_score	premium_credit_score	\N	750.0000	\N	Credit score for premium rate tiers	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
71	57	credit	credit_score	premium_credit_score	\N	750.0000	\N	Credit score for premium rate tiers	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
72	58	mortgage_refinance	credit_score	premium_credit_score	\N	750.0000	\N	Credit score for premium rate tiers	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
73	59	credit_refinance	credit_score	premium_credit_score	\N	750.0000	\N	Credit score for premium rate tiers	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
74	60	mortgage	ltv	premium_ltv_max	\N	70.0000	\N	LTV threshold for premium rates	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
75	61	mortgage_refinance	ltv	premium_ltv_max	\N	70.0000	\N	LTV threshold for premium rates	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
76	62	mortgage	dti	warning_dti_max	\N	35.0000	\N	DTI above this triggers warnings	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
77	63	credit	dti	warning_dti_max	\N	35.0000	\N	DTI above this triggers warnings	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
78	64	mortgage_refinance	dti	warning_dti_max	\N	35.0000	\N	DTI above this triggers warnings	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
79	65	credit_refinance	dti	warning_dti_max	\N	35.0000	\N	DTI above this triggers warnings	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
80	66	mortgage	dti	premium_dti_max	\N	30.0000	\N	DTI threshold for premium rates	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
81	67	credit	dti	premium_dti_max	\N	30.0000	\N	DTI threshold for premium rates	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
82	68	mortgage_refinance	dti	premium_dti_max	\N	30.0000	\N	DTI threshold for premium rates	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
83	69	credit_refinance	dti	premium_dti_max	\N	30.0000	\N	DTI threshold for premium rates	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
84	70	mortgage	rates	quick_excellent_rate	\N	3.5000	\N	Rate for excellent credit in quick assessment	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
85	71	mortgage	rates	quick_good_rate	\N	4.0000	\N	Rate for good credit in quick assessment	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
86	72	mortgage	rates	quick_fair_rate	\N	4.5000	\N	Rate for fair credit in quick assessment	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
87	73	credit	rates	quick_excellent_rate	\N	7.5000	\N	Rate for excellent credit in quick assessment	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
88	74	credit	rates	quick_good_rate	\N	8.5000	\N	Rate for good credit in quick assessment	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
89	75	credit	rates	quick_fair_rate	\N	10.0000	\N	Rate for fair credit in quick assessment	\N	t	INSERT	\N	\N	2025-07-15 23:48:19.328403	\N	\N	\N
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, name_en, name_ru, name_he, url, logo, tender, priority, created_at, updated_at, display_order, is_active, show_in_fallback, fallback_priority, fallback_interest_rate, fallback_approval_rate) FROM stdin;
75	State Bank of Israel	Государственный банк Израиля	בנק מדינת ישראל	http://www.bankisrael.gov.il/	GE4BxF0M47aNY0eoCLRf2tq8sJxPP1OFitR3mN0y.png	1	1	2025-06-08 22:23:52.315933	2025-06-08 22:23:52.315933	75	t	t	1	5.00	80.00
76	Bank Hapoalim	Банк Хапоалим	בנק הפועלים	https://www.bankhapoalim.co.il/russian/	jnfY8ktqd579eQIREWHmW2W3f0aRMSPwpLriXDBK.png	1	2	2025-06-08 22:23:52.401917	2025-06-08 22:23:52.401917	76	t	t	1	5.00	80.00
77	Discount Bank	Банк Дисконт	בנק דיסקונט	http://www.discountbank.co.il/	lyRVwAnWlDe9SwDaRyMY7tjEAXSuL1zUHpteEcSB.png	1	3	2025-06-08 22:23:52.48968	2025-06-08 22:23:52.48968	77	t	t	1	5.00	80.00
78	Bank Leumi	Банк Леуми	בנק לאומי	http://www.leumi-ru.co.il/	zUkm7VJuC67HOqEiIsYg8w37tO4euHrkkSLQ7UWJ.png	1	4	2025-06-08 22:23:52.575492	2025-06-08 22:23:52.575492	78	t	t	1	5.00	80.00
79	Bank Beinleumi	Банк Бейнлеуми	בנק ביינלאומי	http://www.fibi.co.il/	0Ain6B2LODx5ZXDPqapD8BdE7lmFd04cT2K6Gnlr.png	1	5	2025-06-08 22:23:52.661368	2025-06-08 22:23:52.661368	79	t	t	1	5.00	80.00
80	Bank Mizrahi-Tefahot	Банк Мизрахи-Тфахот	בנק מזרחי-טפחות	https://www.mizrahi-tefahot.co.il/	gnqVgiaxipmrWY93jvYjqsp6JOn4C5tZEIyhR2YQ.png	1	6	2025-06-08 22:23:52.745455	2025-06-08 22:23:52.745455	80	t	t	1	5.00	80.00
81	Bank Igood	Банк Игуд	בנק איגוד	http://www.unionbank.co.il/	vdQLVyr7FOtH5DatLeAOCL817nSstBeqCCY1zTDl.png	1	7	2025-06-08 22:23:52.830526	2025-06-08 22:23:52.830526	81	t	t	1	5.00	80.00
82	Bank Yaav for civil servants	Банк Яав госслужащих	בנק יעב לעובדי מדינה	https://www.bank-yahav.co.il/	4j0tS3gwoUea0ct3wWMxQhSjAPAmNHPyZeyg7QLY.png	1	8	2025-06-08 22:23:52.913478	2025-06-08 22:23:52.913478	82	t	t	1	5.00	80.00
83	Mercantil Discount Bank	Банк Меркантиль Дисконт	בנק דיסקונט מרקנטיל	http://www.mercantile.co.il/	sprQBmD3QhsLuvBmdINe7D9UeKjAnZMsnSENn3fV.png	1	9	2025-06-08 22:23:52.997665	2025-06-08 22:23:52.997665	83	t	t	1	5.00	80.00
84	Bank Yerushalayim	Bank of Jerusalem	בנק ירושלים	http://www.bankjerusalem.co.il/	XLEoP19E8YRqg9nZnFkCMfbQa7UCBYkaBKGyk7qI.png	1	10	2025-06-08 22:23:53.081891	2025-06-08 22:23:53.081891	84	t	t	1	5.00	80.00
85	Postal Bank	Почтовый Банк	בנק הדואר	http://www.israelpost.co.il/	FpQCBEdMspLRT1SLPdxb4NWrFwBdS8zwjcRMd45B.png	1	11	2025-06-08 22:23:53.167617	2025-06-08 22:23:53.167617	85	t	t	1	5.00	80.00
86	Otsar Ahayal Bank	Банк Оцар Ахаяль	בנק אוצר אחייל	http://www.bankotsar.co.il/	82Ypn5JtUZ6zmy8SXEBAfjhfODR05BOl5Hb4G3Qg.png	1	12	2025-06-08 22:23:53.253258	2025-06-08 22:23:53.253258	86	t	t	1	5.00	80.00
87	Bank Massad	Банк Массад	בנק מסד	http://www.bankmassad.co.il/	IvHldvyoGJdkuIpo0prHFzKsUSAEeRXIU2cXYX3y.png	1	13	2025-06-08 22:23:53.338593	2025-06-08 22:23:53.338593	87	t	t	1	5.00	80.00
88	Yu - bank	Ю – банк	יו - בנק	http://www.u-bank.net/	urpBhvsZaJbPYyGOWPL8XfiQ22S9NH6sMv8B8cQH.png	1	14	2025-06-08 22:23:53.423591	2025-06-08 22:23:53.423591	88	t	t	1	5.00	80.00
89	Arab Bank of Israel	Арабский банк Израиля	בנק ישראל הערבי	http://www.aibank.co.il/	j61cvi4SooWmAg0KJJA3VvPkmkWPma8U0hcpBc8A.png	1	15	2025-06-08 22:23:53.507535	2025-06-08 22:23:53.507535	89	t	t	1	5.00	80.00
90	Bank Poaley Agudat Israel	Банк поалей агудат Исраэль	בנק פואה אגודת ישראל	http://www.pagi.co.il/	IKn5jJLV8fOX8kiZlWFBtywsQ7fgmqV7guBPwTfW.png	1	16	2025-06-08 22:23:53.592707	2025-06-08 22:23:53.592707	90	t	t	1	5.00	80.00
91	Discount Bank Lemashkantaot	Банк Дисконт лемашкантаот	בנק דיסקונט למשקנטאות	http://mashkanta.discountbank.co.il/	\N	1	17	2025-06-08 22:23:53.676611	2025-06-08 22:23:53.676611	91	t	t	1	5.00	80.00
92	Bank Leumi Lemashkanta	Банк Леуми лемашкантаот	בנק לאומי למשקנטה	http://www.blms.co.il/	\N	1	18	2025-06-08 22:23:53.760472	2025-06-08 22:23:53.760472	92	t	t	1	5.00	80.00
\.


--
-- Data for Name: calculation_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calculation_parameters (id, parameter_name, parameter_value, parameter_type, description, min_value, max_value, is_active, effective_from, effective_to, created_by, created_at, updated_at) FROM stdin;
1	base_mortgage_rate	3.5000	rate	Base mortgage interest rate (%)	2.0000	8.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
2	base_credit_rate	5.5000	rate	Base credit interest rate (%)	3.0000	12.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
3	max_ltv_ratio	80.0000	percentage	Maximum Loan-to-Value ratio (%)	50.0000	95.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
4	max_dti_ratio	42.0000	percentage	Maximum Debt-to-Income ratio (%)	30.0000	50.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
5	min_credit_score	600.0000	amount	Minimum credit score for approval	500.0000	750.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
6	max_loan_term_years	30.0000	years	Maximum loan term in years	5.0000	35.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
7	processing_fee_rate	1.5000	percentage	Processing fee as % of loan amount	0.5000	3.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
8	appraisal_fee	2500.0000	amount	Property appraisal fee (ILS)	1500.0000	5000.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
9	insurance_rate	0.2500	percentage	Property insurance rate (% of property value)	0.1000	0.5000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
10	stress_test_rate	6.5000	rate	Stress test interest rate (%)	5.0000	9.0000	t	2025-06-13	\N	\N	2025-06-13 11:13:13.197906	2025-06-13 11:13:13.197906
\.


--
-- Data for Name: calculation_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calculation_rules (id, business_path, rule_name, rule_type, rule_condition, rule_action, rule_priority, is_active, description, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, key, name_en, name_he, name_ru) FROM stdin;
1	jerusalem	Jerusalem	ירושלים	Иерусалим
2	tel_aviv	Tel Aviv	תל אביב	Тель-Авив
3	haifa	Haifa	חיפה	Хайфа
4	rishon_lezion	Rishon LeZion	ראשון לציון	Ришон-ле-Цион
5	petah_tikva	Petah Tikva	פתח תקווה	Петах-Тиква
6	ashdod	Ashdod	אשדוד	Ашдод
7	netanya	Netanya	נתניה	Нетания
8	beersheba	Beersheba	באר שבע	Беэр-Шева
9	bnei_brak	Bnei Brak	בני ברק	Бней-Брак
10	holon	Holon	חולון	Холон
11	ramat_gan	Ramat Gan	רמת גן	Рамат-Ган
12	ashkelon	Ashkelon	אשקלון	Ашкелон
13	rehovot	Rehovot	רחובות	Реховот
14	bat_yam	Bat Yam	בת ים	Бат-Ям
15	beit_shemesh	Beit Shemesh	בית שמש	Бейт-Шемеш
16	kfar_saba	Kfar Saba	כפר סבא	Кфар-Саба
17	herzliya	Herzliya	הרצליה	Герцлия
18	hadera	Hadera	חדרה	Хадера
19	lod	Lod	לוד	Лод
20	modiin	Modi'in	מודיעין	Модиин
21	nazareth	Nazareth	נצרת	Назарет
22	ramla	Ramla	רמלה	Рамла
23	raanana	Ra'anana	רעננה	Раанана
24	givatayim	Givatayim	גבעתיים	Гиватаим
25	kiryat_ata	Kiryat Ata	קריית אתא	Кирьят-Ата
26	eilat	Eilat	אילת	Эйлат
27	acre	Acre	עכו	Акко
28	tiberias	Tiberias	טבריה	Тверия
29	kiryat_gat	Kiryat Gat	קריית גת	Кирьят-Гат
30	nahariya	Nahariya	נהריה	Нагария
\.


--
-- Data for Name: client_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_assets (id, client_id, asset_type, bank_name, account_type, current_balance, average_balance_6months, asset_description, estimated_value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_credit_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_credit_history (id, client_id, credit_score, credit_history_years, previous_defaults, bankruptcy_history, current_credit_utilization, total_credit_limit, active_credit_accounts, last_updated, created_at) FROM stdin;
\.


--
-- Data for Name: client_debts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_debts (id, client_id, bank_name, debt_type, original_amount, current_balance, monthly_payment, interest_rate, start_date, end_date, remaining_payments, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_documents (id, client_id, application_id, document_type, document_category, file_name, original_file_name, file_path, file_size, mime_type, upload_date, verification_status, verified_by, verification_date, verification_notes, expiry_date, is_required) FROM stdin;
\.


--
-- Data for Name: client_employment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_employment (id, client_id, employment_type, company_name, profession, field_of_activity, monthly_income, additional_income, years_at_current_job, employer_phone, employer_address, employment_start_date, employment_verified, verification_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_form_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_form_sessions (id, session_id, client_id, property_value, property_city, loan_period_preference, initial_payment, property_type, property_ownership, loan_term_years, calculated_monthly_payment, personal_data, financial_data, ltv_ratio, financing_percentage, current_step, is_completed, expires_at, ip_address, country_code, city_detected, geolocation_data, created_at, updated_at, step1_completed_at, step2_completed_at, step3_completed_at) FROM stdin;
1	sess_1752616556640_ywgbo85aw	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 21:55:57.247781	::1	\N	\N	\N	2025-07-15 21:55:57.247781	2025-07-15 21:55:57.247781	\N	\N	\N
2	sess_1752616556624_oznrb7mqi	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 21:55:57.250374	::1	\N	\N	\N	2025-07-15 21:55:57.250374	2025-07-15 21:55:57.250374	\N	\N	\N
3	sess_1752616556619_6bi4ymypu	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 21:55:57.39033	::1	\N	\N	\N	2025-07-15 21:55:57.39033	2025-07-15 21:55:57.39033	\N	\N	\N
4	test_session_bank_specific	\N	2000000.00	\N	\N	1000000.00	\N	\N	30	\N	{"age": 35}	{"monthly_income": 15000, "employment_years": 5, "monthly_expenses": 3000}	80.00	\N	4	f	2025-07-16 22:06:08.161293	::1	\N	\N	\N	2025-07-15 22:06:08.161293	2025-07-15 22:06:18.086075	\N	\N	\N
6	test_bank_specific	\N	2000000.00	\N	\N	1000000.00	\N	no_property	30	4490.67	{"age": 35}	{"credit_score": 750, "monthly_income": 15000, "employment_years": 5, "monthly_expenses": 3000}	75.00	75.00	4	f	2025-07-16 22:09:05.507518	::1	\N	\N	\N	2025-07-15 22:09:05.507518	2025-07-15 22:09:05.507518	\N	\N	\N
7	final_test	\N	2000000.00	\N	\N	1000000.00	\N	no_property	30	4490.67	{"age": 35}	{"credit_score": 750, "monthly_income": 15000, "employment_years": 5, "monthly_expenses": 3000}	75.00	75.00	4	f	2025-07-16 22:09:53.100759	::1	\N	\N	\N	2025-07-15 22:09:53.100759	2025-07-15 22:09:53.100759	\N	\N	\N
8	sess_1752618172799_emgicqgkh	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:22:53.454583	::1	\N	\N	\N	2025-07-15 22:22:53.454583	2025-07-15 22:22:53.454583	\N	\N	\N
9	sess_1752618172819_vqw2ph2tf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:22:53.467939	::1	\N	\N	\N	2025-07-15 22:22:53.467939	2025-07-15 22:22:53.467939	\N	\N	\N
10	sess_1752618172794_17l5r0fkm	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:22:53.612472	::1	\N	\N	\N	2025-07-15 22:22:53.612472	2025-07-15 22:22:53.612472	\N	\N	\N
11	test_session	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 35}	{"monthly_income": 15000, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:43:09.739521	::1	\N	\N	\N	2025-07-15 22:43:09.739521	2025-07-15 22:43:09.739521	\N	\N	\N
12	sess_1752619418861_m1x12mwpf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:43:39.510961	::1	\N	\N	\N	2025-07-15 22:43:39.510961	2025-07-15 22:43:39.510961	\N	\N	\N
13	sess_1752619418836_qs5fambpv	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:43:39.521699	::1	\N	\N	\N	2025-07-15 22:43:39.521699	2025-07-15 22:43:39.521699	\N	\N	\N
14	sess_1752619418841_sjb63s4iz	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:43:39.655442	::1	\N	\N	\N	2025-07-15 22:43:39.655442	2025-07-15 22:43:39.655442	\N	\N	\N
15	sess_1752619562748_h9ivaetsw	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:03.388024	::1	\N	\N	\N	2025-07-15 22:46:03.388024	2025-07-15 22:46:03.388024	\N	\N	\N
17	sess_1752619563724_x7fohpmid	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:04.690406	::1	\N	\N	\N	2025-07-15 22:46:04.690406	2025-07-15 22:46:04.690406	\N	\N	\N
18	sess_1752619563745_0wgadnkf6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:04.690856	::1	\N	\N	\N	2025-07-15 22:46:04.690856	2025-07-15 22:46:04.690856	\N	\N	\N
16	sess_1752619563731_d1nconjgd	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:04.69058	::1	\N	\N	\N	2025-07-15 22:46:04.69058	2025-07-15 22:46:04.69058	\N	\N	\N
20	sess_1752619564787_e5ldsuvv3	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:05.915737	::1	\N	\N	\N	2025-07-15 22:46:05.915737	2025-07-15 22:46:05.915737	\N	\N	\N
19	sess_1752619564792_kl4ph09el	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:05.915598	::1	\N	\N	\N	2025-07-15 22:46:05.915598	2025-07-15 22:46:05.915598	\N	\N	\N
21	sess_1752619564806_j102rxdz8	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 22:46:05.916016	::1	\N	\N	\N	2025-07-15 22:46:05.916016	2025-07-15 22:46:05.916016	\N	\N	\N
22	sess_1752620827919_c3gsc9c8k	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:07:09.123902	::1	\N	\N	\N	2025-07-15 23:07:09.123902	2025-07-15 23:07:09.123902	\N	\N	\N
23	sess_1752620827891_uoubav7b1	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:07:09.123989	::1	\N	\N	\N	2025-07-15 23:07:09.123989	2025-07-15 23:07:09.123989	\N	\N	\N
24	sess_1752620827903_iqbch1tag	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:07:09.12415	::1	\N	\N	\N	2025-07-15 23:07:09.12415	2025-07-15 23:07:09.12415	\N	\N	\N
25	sess_1752623329782_lq7dw93xr	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:48:50.916719	::1	\N	\N	\N	2025-07-15 23:48:50.916719	2025-07-15 23:48:50.916719	\N	\N	\N
26	sess_1752623329790_q3zlyp061	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:48:50.917391	::1	\N	\N	\N	2025-07-15 23:48:50.917391	2025-07-15 23:48:50.917391	\N	\N	\N
27	sess_1752623329784_w7nngpg5k	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:48:51.082822	::1	\N	\N	\N	2025-07-15 23:48:51.082822	2025-07-15 23:48:51.082822	\N	\N	\N
30	sess_1752623339053_9arz4auyl	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:48:59.490266	::1	\N	\N	\N	2025-07-15 23:48:59.490266	2025-07-15 23:48:59.490266	\N	\N	\N
28	sess_1752623339071_m9slqvhb0	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:48:59.489786	::1	\N	\N	\N	2025-07-15 23:48:59.489786	2025-07-15 23:48:59.489786	\N	\N	\N
29	sess_1752623339058_enuwnazil	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:48:59.490054	::1	\N	\N	\N	2025-07-15 23:48:59.490054	2025-07-15 23:48:59.490054	\N	\N	\N
31	sess_1752623894689_4odoxn8mw	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 35}	{"monthly_income": 50000, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:58:15.614747	::1	\N	\N	\N	2025-07-15 23:58:15.614747	2025-07-15 23:58:15.614747	\N	\N	\N
32	sess_1752623894695_bwlxq8761	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 35}	{"monthly_income": 50000, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:58:15.903021	::1	\N	\N	\N	2025-07-15 23:58:15.903021	2025-07-15 23:58:15.903021	\N	\N	\N
33	sess_1752623894688_dw81onmg2	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 35}	{"monthly_income": 50000, "employment_years": 5}	75.00	75.00	4	f	2025-07-16 23:58:16.111761	::1	\N	\N	\N	2025-07-15 23:58:16.111761	2025-07-15 23:58:16.111761	\N	\N	\N
34	sess_1752662902189_vx89kytvf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:48:22.932217	::1	\N	\N	\N	2025-07-16 10:48:22.932217	2025-07-16 10:48:22.932217	\N	\N	\N
35	sess_1752662902187_tvsk8sygy	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:48:22.935052	::1	\N	\N	\N	2025-07-16 10:48:22.935052	2025-07-16 10:48:22.935052	\N	\N	\N
36	sess_1752662902194_pnqurmc0e	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:48:22.942673	::1	\N	\N	\N	2025-07-16 10:48:22.942673	2025-07-16 10:48:22.942673	\N	\N	\N
37	sess_1752663208183_cmn0xy4vl	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:53:28.792091	::1	\N	\N	\N	2025-07-16 10:53:28.792091	2025-07-16 10:53:28.792091	\N	\N	\N
38	sess_1752663208173_tgab1kpwz	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:53:28.921457	::1	\N	\N	\N	2025-07-16 10:53:28.921457	2025-07-16 10:53:28.921457	\N	\N	\N
39	sess_1752663208175_dsaeaokv6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:53:30.027005	::1	\N	\N	\N	2025-07-16 10:53:30.027005	2025-07-16 10:53:30.027005	\N	\N	\N
40	sess_1752663210431_tab4sozqw	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:53:31.10291	::1	\N	\N	\N	2025-07-16 10:53:31.10291	2025-07-16 10:53:31.10291	\N	\N	\N
41	sess_1752663210430_p4bzo0zcm	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:53:31.269744	::1	\N	\N	\N	2025-07-16 10:53:31.269744	2025-07-16 10:53:31.269744	\N	\N	\N
42	sess_1752663330535_lon29ko08	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:55:31.568617	::1	\N	\N	\N	2025-07-16 10:55:31.568617	2025-07-16 10:55:31.568617	\N	\N	\N
43	sess_1752663330544_4rdd02r59	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:55:31.568481	::1	\N	\N	\N	2025-07-16 10:55:31.568481	2025-07-16 10:55:31.568481	\N	\N	\N
44	sess_1752663330536_8u7kx7g7o	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-17 10:55:31.569259	::1	\N	\N	\N	2025-07-16 10:55:31.569259	2025-07-16 10:55:31.569259	\N	\N	\N
45	test-session-456	407	500000.00	Tel Aviv	3-6 months	100000.00	apartment	no_property	25	2002.58	{"step": 2, "birthday": "1990-01-01", "education": "university", "timestamp": "2025-07-17T09:32:48.163Z", "isForeigner": "no", "nameSurname": "John Doe", "familyStatus": "married", "howMuchChildrens": 2, "medicalInsurance": "yes", "citizenshipsDropdown": ["Israel"]}	{"step": 3, "timestamp": "2025-07-17T09:32:59.490Z", "obligation": "no", "profession": "Software Engineer", "companyName": "Tech Corp", "monthlyIncome": 15000, "additionalIncome": "no", "mainSourceOfIncome": "salary"}	75.00	75.00	3	t	2025-07-18 09:32:39.464532	\N	\N	\N	\N	2025-07-17 09:32:39.464532	2025-07-17 09:34:58.120041	\N	\N	\N
46	sess_1752746094170_lh1vryjma	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-18 09:54:55.010767	::1	\N	\N	\N	2025-07-17 09:54:55.010767	2025-07-17 09:54:55.010767	\N	\N	\N
47	sess_1752746094169_fre2qq6xo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-18 09:54:55.012188	::1	\N	\N	\N	2025-07-17 09:54:55.012188	2025-07-17 09:54:55.012188	\N	\N	\N
48	sess_1752746094177_fhb6cawqq	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-18 09:54:55.099823	::1	\N	\N	\N	2025-07-17 09:54:55.099823	2025-07-17 09:54:55.099823	\N	\N	\N
49	sess_1753020684899_aykzx3i0g	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:11:25.667325	::1	\N	\N	\N	2025-07-20 14:11:25.667325	2025-07-20 14:11:25.667325	\N	\N	\N
50	sess_1753020684897_ycpb7bevp	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:11:25.677244	::1	\N	\N	\N	2025-07-20 14:11:25.677244	2025-07-20 14:11:25.677244	\N	\N	\N
51	sess_1753020684905_cpcl3kaha	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:11:25.677988	::1	\N	\N	\N	2025-07-20 14:11:25.677988	2025-07-20 14:11:25.677988	\N	\N	\N
53	sess_1753021353033_79f57o7gj	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:22:33.247422	::1	\N	\N	\N	2025-07-20 14:22:33.247422	2025-07-20 14:22:33.247422	\N	\N	\N
52	sess_1753021353027_dzonlr7mw	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:22:33.246692	::1	\N	\N	\N	2025-07-20 14:22:33.246692	2025-07-20 14:22:33.246692	\N	\N	\N
54	sess_1753021353025_8ya1n0t30	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:22:33.253953	::1	\N	\N	\N	2025-07-20 14:22:33.253953	2025-07-20 14:22:33.253953	\N	\N	\N
55	sess_1753021914924_5jeg3fsiz	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:31:55.453181	::1	\N	\N	\N	2025-07-20 14:31:55.453181	2025-07-20 14:31:55.453181	\N	\N	\N
56	sess_1753021914928_4m7jjfqgt	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:31:55.474842	::1	\N	\N	\N	2025-07-20 14:31:55.474842	2025-07-20 14:31:55.474842	\N	\N	\N
57	sess_1753021915016_rv9cn7b4l	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 14:31:55.572714	::1	\N	\N	\N	2025-07-20 14:31:55.572714	2025-07-20 14:31:55.572714	\N	\N	\N
58	sess_1753035077135_gsowt3yeh	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 18:11:17.661277	::1	\N	\N	\N	2025-07-20 18:11:17.661277	2025-07-20 18:11:17.661277	\N	\N	\N
59	sess_1753035077133_jw0avlucu	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 18:11:17.764102	::1	\N	\N	\N	2025-07-20 18:11:17.764102	2025-07-20 18:11:17.764102	\N	\N	\N
60	sess_1753035077154_s5gzgjsdo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 18:11:17.807315	::1	\N	\N	\N	2025-07-20 18:11:17.807315	2025-07-20 18:11:17.807315	\N	\N	\N
61	sess_1753036024224_2d9a47qb6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 18:27:04.799886	::1	\N	\N	\N	2025-07-20 18:27:04.799886	2025-07-20 18:27:04.799886	\N	\N	\N
62	sess_1753036024179_vljawrsik	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 18:27:04.802162	::1	\N	\N	\N	2025-07-20 18:27:04.802162	2025-07-20 18:27:04.802162	\N	\N	\N
63	sess_1753036024183_izvvu9orr	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 18:27:04.919496	::1	\N	\N	\N	2025-07-20 18:27:04.919496	2025-07-20 18:27:04.919496	\N	\N	\N
64	sess_1753039664979_ao94a2pj5	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 19:27:45.622119	::1	\N	\N	\N	2025-07-20 19:27:45.622119	2025-07-20 19:27:45.622119	\N	\N	\N
65	sess_1753039664934_vagcoaqn2	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 19:27:45.635237	::1	\N	\N	\N	2025-07-20 19:27:45.635237	2025-07-20 19:27:45.635237	\N	\N	\N
66	sess_1753039664929_kns8vxsmg	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 19:27:45.667053	::1	\N	\N	\N	2025-07-20 19:27:45.667053	2025-07-20 19:27:45.667053	\N	\N	\N
67	sess_1753040216659_qdnei3l10	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 19:36:57.981027	::1	\N	\N	\N	2025-07-20 19:36:57.981027	2025-07-20 19:36:57.981027	\N	\N	\N
68	sess_1753040216669_8idj43ge3	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 19:36:57.980571	::1	\N	\N	\N	2025-07-20 19:36:57.980571	2025-07-20 19:36:57.980571	\N	\N	\N
69	sess_1753040216722_cd335oh07	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 19:36:58.161799	::1	\N	\N	\N	2025-07-20 19:36:58.161799	2025-07-20 19:36:58.161799	\N	\N	\N
70	sess_1753047710955_fdzkp4jak	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:41:51.789683	::1	\N	\N	\N	2025-07-20 21:41:51.789683	2025-07-20 21:41:51.789683	\N	\N	\N
71	sess_1753047710950_4nruhcn3a	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:41:51.800539	::1	\N	\N	\N	2025-07-20 21:41:51.800539	2025-07-20 21:41:51.800539	\N	\N	\N
72	sess_1753047710995_m0qqqkbpv	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:41:51.804345	::1	\N	\N	\N	2025-07-20 21:41:51.804345	2025-07-20 21:41:51.804345	\N	\N	\N
73	sess_1753048121102_z8togdsbh	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:48:42.169647	::1	\N	\N	\N	2025-07-20 21:48:42.169647	2025-07-20 21:48:42.169647	\N	\N	\N
75	sess_1753048121106_9sr6gpkbh	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:48:42.220251	::1	\N	\N	\N	2025-07-20 21:48:42.220251	2025-07-20 21:48:42.220251	\N	\N	\N
74	sess_1753048121146_9wuw0vn32	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:48:42.219851	::1	\N	\N	\N	2025-07-20 21:48:42.219851	2025-07-20 21:48:42.219851	\N	\N	\N
76	sess_1753048722981_prm9t75xq	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:58:44.11836	::1	\N	\N	\N	2025-07-20 21:58:44.11836	2025-07-20 21:58:44.11836	\N	\N	\N
77	sess_1753048723025_qcs9p2jef	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:58:44.168962	::1	\N	\N	\N	2025-07-20 21:58:44.168962	2025-07-20 21:58:44.168962	\N	\N	\N
78	sess_1753048722985_5xesqid33	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:58:44.200875	::1	\N	\N	\N	2025-07-20 21:58:44.200875	2025-07-20 21:58:44.200875	\N	\N	\N
80	sess_1753048730755_gim9aiejz	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:58:51.006683	::1	\N	\N	\N	2025-07-20 21:58:51.006683	2025-07-20 21:58:51.006683	\N	\N	\N
79	sess_1753048730700_ykiyh3rvo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 21:58:50.980339	::1	\N	\N	\N	2025-07-20 21:58:50.980339	2025-07-20 21:58:50.980339	\N	\N	\N
81	sess_1753049627192_062m3bw3i	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:13:47.821461	::1	\N	\N	\N	2025-07-20 22:13:47.821461	2025-07-20 22:13:47.821461	\N	\N	\N
82	sess_1753049850979_gw9sr61o2	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:17:31.640052	::1	\N	\N	\N	2025-07-20 22:17:31.640052	2025-07-20 22:17:31.640052	\N	\N	\N
83	sess_1753049850934_1wm0mbdbr	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:17:31.669026	::1	\N	\N	\N	2025-07-20 22:17:31.669026	2025-07-20 22:17:31.669026	\N	\N	\N
84	sess_1753049850938_bwaacz2kf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:17:31.6735	::1	\N	\N	\N	2025-07-20 22:17:31.6735	2025-07-20 22:17:31.6735	\N	\N	\N
85	sess_1753050714533_17fi3k070	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:31:54.957345	::1	\N	\N	\N	2025-07-20 22:31:54.957345	2025-07-20 22:31:54.957345	\N	\N	\N
86	sess_1753050714520_s89b2i8g2	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:31:54.964507	::1	\N	\N	\N	2025-07-20 22:31:54.964507	2025-07-20 22:31:54.964507	\N	\N	\N
87	sess_1753050714579_cddeqcy5f	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-21 22:31:55.578001	::1	\N	\N	\N	2025-07-20 22:31:55.578001	2025-07-20 22:31:55.578001	\N	\N	\N
88	sess_1753080434888_9nels5as6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:47:15.78805	::1	\N	\N	\N	2025-07-21 06:47:15.78805	2025-07-21 06:47:15.78805	\N	\N	\N
89	sess_1753080434845_ezho8qjij	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:47:15.787283	::1	\N	\N	\N	2025-07-21 06:47:15.787283	2025-07-21 06:47:15.787283	\N	\N	\N
90	sess_1753080434849_ynvnps633	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:47:15.797127	::1	\N	\N	\N	2025-07-21 06:47:15.797127	2025-07-21 06:47:15.797127	\N	\N	\N
91	sess_1753080440117_n2nat9879	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:47:20.567184	::1	\N	\N	\N	2025-07-21 06:47:20.567184	2025-07-21 06:47:20.567184	\N	\N	\N
92	sess_1753080440180_wdnpboelo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:47:20.572564	::1	\N	\N	\N	2025-07-21 06:47:20.572564	2025-07-21 06:47:20.572564	\N	\N	\N
93	sess_1753080608420_z1haybfrr	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:50:08.874149	::1	\N	\N	\N	2025-07-21 06:50:08.874149	2025-07-21 06:50:08.874149	\N	\N	\N
94	sess_1753080608413_8mxt35j2h	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:50:08.88171	::1	\N	\N	\N	2025-07-21 06:50:08.88171	2025-07-21 06:50:08.88171	\N	\N	\N
95	sess_1753080621416_4vhpnz4i6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:50:22.307377	::1	\N	\N	\N	2025-07-21 06:50:22.307377	2025-07-21 06:50:22.307377	\N	\N	\N
96	sess_1753080621410_dye2w1pbe	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:50:22.316764	::1	\N	\N	\N	2025-07-21 06:50:22.316764	2025-07-21 06:50:22.316764	\N	\N	\N
97	sess_1753080637406_k5q0li9qd	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:50:38.506952	::1	\N	\N	\N	2025-07-21 06:50:38.506952	2025-07-21 06:50:38.506952	\N	\N	\N
98	sess_1753080637402_d4ym5whq0	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:50:38.514542	::1	\N	\N	\N	2025-07-21 06:50:38.514542	2025-07-21 06:50:38.514542	\N	\N	\N
99	sess_1753081024342_roymygjjy	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:57:05.374272	::1	\N	\N	\N	2025-07-21 06:57:05.374272	2025-07-21 06:57:05.374272	\N	\N	\N
100	sess_1753081024338_jc0fqrx57	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:57:05.424024	::1	\N	\N	\N	2025-07-21 06:57:05.424024	2025-07-21 06:57:05.424024	\N	\N	\N
101	sess_1753081024380_cadd1pni1	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:57:05.471615	::1	\N	\N	\N	2025-07-21 06:57:05.471615	2025-07-21 06:57:05.471615	\N	\N	\N
102	sess_1753081029272_aey6xllbz	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:57:09.901306	::1	\N	\N	\N	2025-07-21 06:57:09.901306	2025-07-21 06:57:09.901306	\N	\N	\N
103	sess_1753081029218_kfskrtxw9	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1184248794578}	{"monthly_income": 111111111, "employment_years": 0}	75.00	75.00	4	f	2025-07-22 06:57:09.906672	::1	\N	\N	\N	2025-07-21 06:57:09.906672	2025-07-21 06:57:09.906672	\N	\N	\N
104	sess_1753088234066_ygajgz46m	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.0000006362968033057013}	75.00	75.00	4	f	2025-07-22 08:57:15.786459	::1	\N	\N	\N	2025-07-21 08:57:15.786459	2025-07-21 08:57:15.786459	\N	\N	\N
105	sess_1753088234064_va4g33xy2	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.0000006362017390422592}	75.00	75.00	4	f	2025-07-22 08:57:15.806382	::1	\N	\N	\N	2025-07-21 08:57:15.806382	2025-07-21 08:57:15.806382	\N	\N	\N
106	sess_1753088234085_2c7zr6px8	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.0000006368038127107258}	75.00	75.00	4	f	2025-07-22 08:57:17.052408	::1	\N	\N	\N	2025-07-21 08:57:17.052408	2025-07-21 08:57:17.052408	\N	\N	\N
107	sess_1753088687440_ep4gfcse5	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000015002946992166704}	75.00	75.00	4	f	2025-07-22 09:04:48.112243	::1	\N	\N	\N	2025-07-21 09:04:48.112243	2025-07-21 09:04:48.112243	\N	\N	\N
108	sess_1753088687448_8tyi5fvd6	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00001500307374451796}	75.00	75.00	4	f	2025-07-22 09:04:48.127753	::1	\N	\N	\N	2025-07-21 09:04:48.127753	2025-07-21 09:04:48.127753	\N	\N	\N
109	sess_1753088730982_yv7djh3dm	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000016382519583238268}	75.00	75.00	4	f	2025-07-22 09:05:31.571986	::1	\N	\N	\N	2025-07-21 09:05:31.571986	2025-07-21 09:05:31.571986	\N	\N	\N
110	sess_1753088730977_fimno4svz	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000016382456207062643}	75.00	75.00	4	f	2025-07-22 09:05:31.603214	::1	\N	\N	\N	2025-07-21 09:05:31.603214	2025-07-21 09:05:31.603214	\N	\N	\N
111	sess_1753088731020_llavlrrcm	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000016383723730575204}	75.00	75.00	4	f	2025-07-22 09:05:31.670553	::1	\N	\N	\N	2025-07-21 09:05:31.670553	2025-07-21 09:05:31.670553	\N	\N	\N
112	sess_1753088767443_df7a0pkda	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00001753799401728902}	75.00	75.00	4	f	2025-07-22 09:06:08.03039	::1	\N	\N	\N	2025-07-21 09:06:08.03039	2025-07-21 09:06:08.03039	\N	\N	\N
113	sess_1753088767448_vdzu8i13z	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00001753805739346465}	75.00	75.00	4	f	2025-07-22 09:06:08.069952	::1	\N	\N	\N	2025-07-21 09:06:08.069952	2025-07-21 09:06:08.069952	\N	\N	\N
114	sess_1753088772449_b7njauhql	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000017696561208710422}	75.00	75.00	4	f	2025-07-22 09:06:12.731383	::1	\N	\N	\N	2025-07-21 09:06:12.731383	2025-07-21 09:06:12.731383	\N	\N	\N
115	sess_1753088772442_5z2g0ojz6	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00001769646614444698}	75.00	75.00	4	f	2025-07-22 09:06:12.739184	::1	\N	\N	\N	2025-07-21 09:06:12.739184	2025-07-21 09:06:12.739184	\N	\N	\N
116	sess_1753088787287_qjffqpfuc	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00001816671736760717}	75.00	75.00	4	f	2025-07-22 09:06:27.913577	::1	\N	\N	\N	2025-07-21 09:06:27.913577	2025-07-21 09:06:27.913577	\N	\N	\N
117	sess_1753088787283_bbxxd4uk3	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00001816665399143154}	75.00	75.00	4	f	2025-07-22 09:06:27.941623	::1	\N	\N	\N	2025-07-21 09:06:27.941623	2025-07-21 09:06:27.941623	\N	\N	\N
118	sess_1753088787325_qe7g7nyzj	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000018167921514944102}	75.00	75.00	4	f	2025-07-22 09:06:27.979668	::1	\N	\N	\N	2025-07-21 09:06:27.979668	2025-07-21 09:06:27.979668	\N	\N	\N
120	sess_1753088827454_eqe4jtdu5	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000019439564478921083}	75.00	75.00	4	f	2025-07-22 09:07:08.071223	::1	\N	\N	\N	2025-07-21 09:07:08.071223	2025-07-21 09:07:08.071223	\N	\N	\N
119	sess_1753088827445_pgh4x2qgp	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.0000194393743503942}	75.00	75.00	4	f	2025-07-22 09:07:08.071574	::1	\N	\N	\N	2025-07-21 09:07:08.071574	2025-07-21 09:07:08.071574	\N	\N	\N
121	sess_1753089084892_dn3xv64rb	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000027597250741501255}	75.00	75.00	4	f	2025-07-22 09:11:25.678437	::1	\N	\N	\N	2025-07-21 09:11:25.678437	2025-07-21 09:11:25.678437	\N	\N	\N
122	sess_1753089084847_nk2krl57m	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000027595919841813066}	75.00	75.00	4	f	2025-07-22 09:11:25.694972	::1	\N	\N	\N	2025-07-21 09:11:25.694972	2025-07-21 09:11:25.694972	\N	\N	\N
123	sess_1753089084852_8actwu9ba	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000027596014906076507}	75.00	75.00	4	f	2025-07-22 09:11:25.888997	::1	\N	\N	\N	2025-07-21 09:11:25.888997	2025-07-21 09:11:25.888997	\N	\N	\N
124	sess_1753089198444_km8y1tt2d	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003119562324131113}	75.00	75.00	4	f	2025-07-22 09:13:19.069415	::1	\N	\N	\N	2025-07-21 09:13:19.069415	2025-07-21 09:13:19.069415	\N	\N	\N
125	sess_1753089198449_zkye3va5j	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003119571830557457}	75.00	75.00	4	f	2025-07-22 09:13:19.072378	::1	\N	\N	\N	2025-07-21 09:13:19.072378	2025-07-21 09:13:19.072378	\N	\N	\N
126	sess_1753089203445_0uf1cf0l0	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003135406368038127}	75.00	75.00	4	f	2025-07-22 09:13:23.735198	::1	\N	\N	\N	2025-07-21 09:13:23.735198	2025-07-21 09:13:23.735198	\N	\N	\N
127	sess_1753089203448_glilptpsg	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003135409536846909}	75.00	75.00	4	f	2025-07-22 09:13:23.741891	::1	\N	\N	\N	2025-07-21 09:13:23.741891	2025-07-21 09:13:23.741891	\N	\N	\N
128	sess_1753089203453_7q6h2u5i3	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.000031354253808908154}	75.00	75.00	4	f	2025-07-22 09:13:24.048735	::1	\N	\N	\N	2025-07-21 09:13:24.048735	2025-07-21 09:13:24.048735	\N	\N	\N
129	sess_1753089210441_usscv9blu	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003157575354272822}	75.00	75.00	4	f	2025-07-22 09:13:30.758201	::1	\N	\N	\N	2025-07-21 09:13:30.758201	2025-07-21 09:13:30.758201	\N	\N	\N
130	sess_1753089210445_dyzcxnjn7	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003157578523081603}	75.00	75.00	4	f	2025-07-22 09:13:30.760434	::1	\N	\N	\N	2025-07-21 09:13:30.760434	2025-07-21 09:13:30.760434	\N	\N	\N
131	sess_1753089217468_2fs6kafix	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003179836235962177}	75.00	75.00	4	f	2025-07-22 09:13:37.749544	::1	\N	\N	\N	2025-07-21 09:13:37.749544	2025-07-21 09:13:37.749544	\N	\N	\N
132	sess_1753089217465_as6tthq9l	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003179826729535833}	75.00	75.00	4	f	2025-07-22 09:13:37.753327	::1	\N	\N	\N	2025-07-21 09:13:37.753327	2025-07-21 09:13:37.753327	\N	\N	\N
133	sess_1753089225459_ok9a0dld0	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003205155018125586}	75.00	75.00	4	f	2025-07-22 09:13:45.739443	::1	\N	\N	\N	2025-07-21 09:13:45.739443	2025-07-21 09:13:45.739443	\N	\N	\N
134	sess_1753089225456_x589pxcgs	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003205145511699242}	75.00	75.00	4	f	2025-07-22 09:13:45.743338	::1	\N	\N	\N	2025-07-21 09:13:45.743338	2025-07-21 09:13:45.743338	\N	\N	\N
135	sess_1753089237456_vuls40i6m	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003243171217076077}	75.00	75.00	4	f	2025-07-22 09:13:57.743258	::1	\N	\N	\N	2025-07-21 09:13:57.743258	2025-07-21 09:13:57.743258	\N	\N	\N
138	sess_1753089248459_iz14dso6n	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003278040788906634}	75.00	75.00	4	f	2025-07-22 09:14:08.746576	::1	\N	\N	\N	2025-07-21 09:14:08.746576	2025-07-21 09:14:08.746576	\N	\N	\N
136	sess_1753089237461_iw4kr42io	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003243190229928765}	75.00	75.00	4	f	2025-07-22 09:13:57.743485	::1	\N	\N	\N	2025-07-21 09:13:57.743485	2025-07-21 09:13:57.743485	\N	\N	\N
137	sess_1753089248461_0ibusm9v1	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003278047126524197}	75.00	75.00	4	f	2025-07-22 09:14:08.74409	::1	\N	\N	\N	2025-07-21 09:14:08.74409	2025-07-21 09:14:08.74409	\N	\N	\N
139	sess_1753089349725_mm6ylfhf3	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003598958729434431}	75.00	75.00	4	f	2025-07-22 09:15:50.325	::1	\N	\N	\N	2025-07-21 09:15:50.325	2025-07-21 09:15:50.325	\N	\N	\N
140	sess_1753089349730_w14zeqjmv	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003598958729434431}	75.00	75.00	4	f	2025-07-22 09:15:50.325787	::1	\N	\N	\N	2025-07-21 09:15:50.325787	2025-07-21 09:15:50.325787	\N	\N	\N
141	sess_1753089349771_2lv2grwvr	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1185008196518}	{"monthly_income": 10000, "employment_years": 0.00003599075975359343}	75.00	75.00	4	f	2025-07-22 09:15:50.408615	::1	\N	\N	\N	2025-07-21 09:15:50.408615	2025-07-21 09:15:50.408615	\N	\N	\N
142	sess_1753365350538_x22mhipwv	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 13:55:51.521516	::1	\N	\N	\N	2025-07-24 13:55:51.521516	2025-07-24 13:55:51.521516	\N	\N	\N
143	sess_1753365350539_fdyxu55uz	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 13:55:51.527375	::1	\N	\N	\N	2025-07-24 13:55:51.527375	2025-07-24 13:55:51.527375	\N	\N	\N
144	sess_1753365350544_ag3u4i9e8	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 13:55:51.628334	::1	\N	\N	\N	2025-07-24 13:55:51.628334	2025-07-24 13:55:51.628334	\N	\N	\N
145	sess_1753366207825_y0pp3yzx2	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 14:10:08.732033	::1	\N	\N	\N	2025-07-24 14:10:08.732033	2025-07-24 14:10:08.732033	\N	\N	\N
146	sess_1753366207824_ia9frnq1i	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 14:10:08.739335	::1	\N	\N	\N	2025-07-24 14:10:08.739335	2025-07-24 14:10:08.739335	\N	\N	\N
147	sess_1753390695409_waa0s3djb	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 20:58:15.997844	::1	\N	\N	\N	2025-07-24 20:58:15.997844	2025-07-24 20:58:15.997844	\N	\N	\N
148	sess_1753390695403_w0j26t5b2	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 20:58:16.017156	::1	\N	\N	\N	2025-07-24 20:58:16.017156	2025-07-24 20:58:16.017156	\N	\N	\N
149	sess_1753390695402_8xpmf1xtr	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1185285098415}	{"monthly_income": 10000, "employment_years": 0}	50.00	50.00	4	f	2025-07-25 20:58:16.034675	::1	\N	\N	\N	2025-07-24 20:58:16.034675	2025-07-24 20:58:16.034675	\N	\N	\N
150	sess_1753531857267_4pe079vxe	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 12:10:57.871913	::1	\N	\N	\N	2025-07-26 12:10:57.871913	2025-07-26 12:10:57.871913	\N	\N	\N
151	sess_1753531857261_3u2kubd75	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 12:10:57.879392	::1	\N	\N	\N	2025-07-26 12:10:57.879392	2025-07-26 12:10:57.879392	\N	\N	\N
152	sess_1753531857260_8dpdmjjd6	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 12:10:57.907277	::1	\N	\N	\N	2025-07-26 12:10:57.907277	2025-07-26 12:10:57.907277	\N	\N	\N
153	sess_1753535783780_inankqpiq	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 13:16:24.019552	::1	\N	\N	\N	2025-07-26 13:16:24.019552	2025-07-26 13:16:24.019552	\N	\N	\N
154	sess_1753535783782_ld91fxk9k	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 13:16:24.366514	::1	\N	\N	\N	2025-07-26 13:16:24.366514	2025-07-26 13:16:24.366514	\N	\N	\N
155	sess_1753535783793_krju7tkbt	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 13:16:24.387383	::1	\N	\N	\N	2025-07-26 13:16:24.387383	2025-07-26 13:16:24.387383	\N	\N	\N
156	sess_1753562606878_f3ps3fn9p	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 20:43:27.512112	::1	\N	\N	\N	2025-07-26 20:43:27.512112	2025-07-26 20:43:27.512112	\N	\N	\N
157	sess_1753562606887_oj619wcyw	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 20:43:27.542413	::1	\N	\N	\N	2025-07-26 20:43:27.542413	2025-07-26 20:43:27.542413	\N	\N	\N
158	sess_1753562606880_pjet42jon	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 20:43:27.544155	::1	\N	\N	\N	2025-07-26 20:43:27.544155	2025-07-26 20:43:27.544155	\N	\N	\N
159	sess_1753562985325_i8i2lrlrf	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 20:49:46.109868	::1	\N	\N	\N	2025-07-26 20:49:46.109868	2025-07-26 20:49:46.109868	\N	\N	\N
160	sess_1753562985347_9qeuczqjx	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 20:49:46.112042	::1	\N	\N	\N	2025-07-26 20:49:46.112042	2025-07-26 20:49:46.112042	\N	\N	\N
161	sess_1753562985330_03edjdffy	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-27 20:49:46.236367	::1	\N	\N	\N	2025-07-26 20:49:46.236367	2025-07-26 20:49:46.236367	\N	\N	\N
162	sess_1753594070478_q0j2gpel8	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:27:51.434475	::1	\N	\N	\N	2025-07-27 05:27:51.434475	2025-07-27 05:27:51.434475	\N	\N	\N
163	sess_1753594070477_gphmmoz8j	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:27:51.596234	::1	\N	\N	\N	2025-07-27 05:27:51.596234	2025-07-27 05:27:51.596234	\N	\N	\N
164	sess_1753594070484_i7jnai6qd	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:27:51.612418	::1	\N	\N	\N	2025-07-27 05:27:51.612418	2025-07-27 05:27:51.612418	\N	\N	\N
165	sess_1753594499369_k7yc1bzij	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:35:00.56631	::1	\N	\N	\N	2025-07-27 05:35:00.56631	2025-07-27 05:35:00.56631	\N	\N	\N
166	sess_1753594499381_t381tb54s	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:35:00.696257	::1	\N	\N	\N	2025-07-27 05:35:00.696257	2025-07-27 05:35:00.696257	\N	\N	\N
167	sess_1753594499370_18tshfkfv	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:35:00.701575	::1	\N	\N	\N	2025-07-27 05:35:00.701575	2025-07-27 05:35:00.701575	\N	\N	\N
168	sess_1753594512853_0to9mhghg	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:35:13.38482	::1	\N	\N	\N	2025-07-27 05:35:13.38482	2025-07-27 05:35:13.38482	\N	\N	\N
169	sess_1753594512863_cxtesthuo	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:35:13.386554	::1	\N	\N	\N	2025-07-27 05:35:13.386554	2025-07-27 05:35:13.386554	\N	\N	\N
170	sess_1753594512854_uq5ywq3l4	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 05:35:13.393036	::1	\N	\N	\N	2025-07-27 05:35:13.393036	2025-07-27 05:35:13.393036	\N	\N	\N
171	sess_1753605080891_xlepoesn8	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:31:21.447519	::1	\N	\N	\N	2025-07-27 08:31:21.447519	2025-07-27 08:31:21.447519	\N	\N	\N
172	sess_1753605080893_ktt3ygktn	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:31:22.262487	::1	\N	\N	\N	2025-07-27 08:31:22.262487	2025-07-27 08:31:22.262487	\N	\N	\N
173	sess_1753605080907_8yzm6d2h6	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:31:22.263775	::1	\N	\N	\N	2025-07-27 08:31:22.263775	2025-07-27 08:31:22.263775	\N	\N	\N
174	sess_1753605194587_psn5zl4ik	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:33:15.940845	::1	\N	\N	\N	2025-07-27 08:33:15.940845	2025-07-27 08:33:15.940845	\N	\N	\N
175	sess_1753605194604_g0q3ypo3n	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:33:15.940883	::1	\N	\N	\N	2025-07-27 08:33:15.940883	2025-07-27 08:33:15.940883	\N	\N	\N
176	sess_1753605194582_gykbrauo8	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:33:16.370919	::1	\N	\N	\N	2025-07-27 08:33:16.370919	2025-07-27 08:33:16.370919	\N	\N	\N
177	sess_1753605268478_zc0uli6ky	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:34:29.960365	::1	\N	\N	\N	2025-07-27 08:34:29.960365	2025-07-27 08:34:29.960365	\N	\N	\N
178	sess_1753605268467_r1hvdtfud	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:34:30.37524	::1	\N	\N	\N	2025-07-27 08:34:30.37524	2025-07-27 08:34:30.37524	\N	\N	\N
179	sess_1753605268464_0itkcvvqi	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:34:30.380528	::1	\N	\N	\N	2025-07-27 08:34:30.380528	2025-07-27 08:34:30.380528	\N	\N	\N
180	sess_1753605567709_bja22ja6q	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:39:28.886139	::1	\N	\N	\N	2025-07-27 08:39:28.886139	2025-07-27 08:39:28.886139	\N	\N	\N
181	sess_1753605567714_asn252ax7	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:39:29.047025	::1	\N	\N	\N	2025-07-27 08:39:29.047025	2025-07-27 08:39:29.047025	\N	\N	\N
182	sess_1753605567732_8qb0gecxx	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:39:29.189214	::1	\N	\N	\N	2025-07-27 08:39:29.189214	2025-07-27 08:39:29.189214	\N	\N	\N
183	sess_1753606007303_qgzaxv951	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:46:49.982398	::1	\N	\N	\N	2025-07-27 08:46:49.982398	2025-07-27 08:46:49.982398	\N	\N	\N
185	sess_1753606007329_931y2axjk	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:46:49.98752	::1	\N	\N	\N	2025-07-27 08:46:49.98752	2025-07-27 08:46:49.98752	\N	\N	\N
184	sess_1753606007359_pac5q8ali	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 08:46:49.987443	::1	\N	\N	\N	2025-07-27 08:46:49.987443	2025-07-27 08:46:49.987443	\N	\N	\N
186	sess_1753607433723_ndzpd591l	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:34.826878	::1	\N	\N	\N	2025-07-27 09:10:34.826878	2025-07-27 09:10:34.826878	\N	\N	\N
187	sess_1753607433703_4won40axi	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:34.832095	::1	\N	\N	\N	2025-07-27 09:10:34.832095	2025-07-27 09:10:34.832095	\N	\N	\N
188	sess_1753607433697_iz0qrbrz4	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:34.834818	::1	\N	\N	\N	2025-07-27 09:10:34.834818	2025-07-27 09:10:34.834818	\N	\N	\N
189	sess_1753607435712_3sej2u27d	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:36.895939	::1	\N	\N	\N	2025-07-27 09:10:36.895939	2025-07-27 09:10:36.895939	\N	\N	\N
190	sess_1753607435706_jfjsw6ikc	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:36.903251	::1	\N	\N	\N	2025-07-27 09:10:36.903251	2025-07-27 09:10:36.903251	\N	\N	\N
191	sess_1753607436613_ylfesu6s1	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:37.294999	::1	\N	\N	\N	2025-07-27 09:10:37.294999	2025-07-27 09:10:37.294999	\N	\N	\N
192	sess_1753607436618_dx7mbw5p1	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:37.296096	::1	\N	\N	\N	2025-07-27 09:10:37.296096	2025-07-27 09:10:37.296096	\N	\N	\N
193	sess_1753607436637_6pw7xi8g0	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:10:38.321067	::1	\N	\N	\N	2025-07-27 09:10:38.321067	2025-07-27 09:10:38.321067	\N	\N	\N
194	sess_1753607493947_czts4v4j2	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:34.957086	::1	\N	\N	\N	2025-07-27 09:11:34.957086	2025-07-27 09:11:34.957086	\N	\N	\N
195	sess_1753607493971_ugcs693ww	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:34.957178	::1	\N	\N	\N	2025-07-27 09:11:34.957178	2025-07-27 09:11:34.957178	\N	\N	\N
196	sess_1753607493933_in1jdeqnk	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:34.957662	::1	\N	\N	\N	2025-07-27 09:11:34.957662	2025-07-27 09:11:34.957662	\N	\N	\N
197	sess_1753607499788_n9cvpfj3h	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:40.49179	::1	\N	\N	\N	2025-07-27 09:11:40.49179	2025-07-27 09:11:40.49179	\N	\N	\N
198	sess_1753607499812_j129ta9wl	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:41.229222	::1	\N	\N	\N	2025-07-27 09:11:41.229222	2025-07-27 09:11:41.229222	\N	\N	\N
199	sess_1753607499793_1wgcbq63w	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:41.22946	::1	\N	\N	\N	2025-07-27 09:11:41.22946	2025-07-27 09:11:41.22946	\N	\N	\N
200	sess_1753607501875_ld3vanfq4	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:43.291006	::1	\N	\N	\N	2025-07-27 09:11:43.291006	2025-07-27 09:11:43.291006	\N	\N	\N
201	sess_1753607501870_hmr6t08ou	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:43.430568	::1	\N	\N	\N	2025-07-27 09:11:43.430568	2025-07-27 09:11:43.430568	\N	\N	\N
202	sess_1753607501894_2rzud06ko	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:43.431739	::1	\N	\N	\N	2025-07-27 09:11:43.431739	2025-07-27 09:11:43.431739	\N	\N	\N
203	sess_1753607503322_cz35w8tid	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:44.136896	::1	\N	\N	\N	2025-07-27 09:11:44.136896	2025-07-27 09:11:44.136896	\N	\N	\N
204	sess_1753607503306_hsddt3u73	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:44.141845	::1	\N	\N	\N	2025-07-27 09:11:44.141845	2025-07-27 09:11:44.141845	\N	\N	\N
205	sess_1753607503302_kgeu8vdms	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:11:44.686221	::1	\N	\N	\N	2025-07-27 09:11:44.686221	2025-07-27 09:11:44.686221	\N	\N	\N
206	sess_1753608814079_h7r9bd63x	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:33:35.129641	::1	\N	\N	\N	2025-07-27 09:33:35.129641	2025-07-27 09:33:35.129641	\N	\N	\N
207	sess_1753608814080_xgapy8ghn	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:33:35.273562	::1	\N	\N	\N	2025-07-27 09:33:35.273562	2025-07-27 09:33:35.273562	\N	\N	\N
208	sess_1753608814086_qe3gtf59b	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:33:35.380626	::1	\N	\N	\N	2025-07-27 09:33:35.380626	2025-07-27 09:33:35.380626	\N	\N	\N
209	sess_1753608965790_fsrxhwlsr	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:06.885937	::1	\N	\N	\N	2025-07-27 09:36:06.885937	2025-07-27 09:36:06.885937	\N	\N	\N
210	sess_1753608965784_27vbvrgzb	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:06.88986	::1	\N	\N	\N	2025-07-27 09:36:06.88986	2025-07-27 09:36:06.88986	\N	\N	\N
211	sess_1753608996288_dxftd1wyn	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:37.987629	::1	\N	\N	\N	2025-07-27 09:36:37.987629	2025-07-27 09:36:37.987629	\N	\N	\N
212	sess_1753608996292_s9lo6a1ey	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:37.993896	::1	\N	\N	\N	2025-07-27 09:36:37.993896	2025-07-27 09:36:37.993896	\N	\N	\N
213	sess_1753608996309_7m2py23rb	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:38.100764	::1	\N	\N	\N	2025-07-27 09:36:38.100764	2025-07-27 09:36:38.100764	\N	\N	\N
214	sess_1753608998145_h0dmuosbi	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:39.561431	::1	\N	\N	\N	2025-07-27 09:36:39.561431	2025-07-27 09:36:39.561431	\N	\N	\N
215	sess_1753608998144_zi3bkxtc5	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:39.611909	::1	\N	\N	\N	2025-07-27 09:36:39.611909	2025-07-27 09:36:39.611909	\N	\N	\N
216	sess_1753609014585_t44r5rgne	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:55.716007	::1	\N	\N	\N	2025-07-27 09:36:55.716007	2025-07-27 09:36:55.716007	\N	\N	\N
217	sess_1753609014604_iqmb6akvk	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:55.721723	::1	\N	\N	\N	2025-07-27 09:36:55.721723	2025-07-27 09:36:55.721723	\N	\N	\N
218	sess_1753609014581_3vy94capd	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:36:55.721951	::1	\N	\N	\N	2025-07-27 09:36:55.721951	2025-07-27 09:36:55.721951	\N	\N	\N
219	sess_1753609024973_d6tgfa8ou	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:37:05.612877	::1	\N	\N	\N	2025-07-27 09:37:05.612877	2025-07-27 09:37:05.612877	\N	\N	\N
220	sess_1753609024965_xo445qdin	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-28 09:37:05.613636	::1	\N	\N	\N	2025-07-27 09:37:05.613636	2025-07-27 09:37:05.613636	\N	\N	\N
221	sess_1753858626914_bz77eosir	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-31 06:57:07.688097	::1	\N	\N	\N	2025-07-30 06:57:07.688097	2025-07-30 06:57:07.688097	\N	\N	\N
222	sess_1753858626916_ip9dnwq2t	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-31 06:57:07.721166	::1	\N	\N	\N	2025-07-30 06:57:07.721166	2025-07-30 06:57:07.721166	\N	\N	\N
223	sess_1753858626923_oh3a7ruqz	\N	1000000.00	\N	\N	500000.00	\N	selling_property	30	2245.34	{"age": 18, "birth_date": 1185451823387}	{"monthly_income": 20000, "employment_years": 0}	70.00	70.00	4	f	2025-07-31 06:57:07.727545	::1	\N	\N	\N	2025-07-30 06:57:07.727545	2025-07-30 06:57:07.727545	\N	\N	\N
224	sess_1754037880608_psckqtk2e	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1185949524638}	{"monthly_income": 10000, "employment_years": 0}	75.00	75.00	4	f	2025-08-02 08:44:41.870564	::1	\N	\N	\N	2025-08-01 08:44:41.870564	2025-08-01 08:44:41.870564	\N	\N	\N
225	sess_1754037880599_vfgq19v1d	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1185949524638}	{"monthly_income": 10000, "employment_years": 0}	75.00	75.00	4	f	2025-08-02 08:44:41.919919	::1	\N	\N	\N	2025-08-01 08:44:41.919919	2025-08-01 08:44:41.919919	\N	\N	\N
226	sess_1754037880601_npcognkxp	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1185949524638}	{"monthly_income": 10000, "employment_years": 0}	75.00	75.00	4	f	2025-08-02 08:44:41.994791	::1	\N	\N	\N	2025-08-01 08:44:41.994791	2025-08-01 08:44:41.994791	\N	\N	\N
227	sess_1754038071524_pmv59hqq9	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1185949524638}	{"monthly_income": 10000, "employment_years": 0}	75.00	75.00	4	f	2025-08-02 08:47:52.339539	::1	\N	\N	\N	2025-08-01 08:47:52.339539	2025-08-01 08:47:52.339539	\N	\N	\N
228	sess_1754038071552_fjq5sl2qc	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1185949524638}	{"monthly_income": 10000, "employment_years": 0}	75.00	75.00	4	f	2025-08-02 08:47:52.349144	::1	\N	\N	\N	2025-08-01 08:47:52.349144	2025-08-01 08:47:52.349144	\N	\N	\N
229	sess_1754038071531_yvpo1l824	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1185949524638}	{"monthly_income": 10000, "employment_years": 0}	75.00	75.00	4	f	2025-08-02 08:47:52.356173	::1	\N	\N	\N	2025-08-01 08:47:52.356173	2025-08-01 08:47:52.356173	\N	\N	\N
230	sess_1754203843526_5mg9zzuot	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182347050472786}	75.00	75.00	4	f	2025-08-04 06:50:43.750625	::1	\N	\N	\N	2025-08-03 06:50:43.750625	2025-08-03 06:50:43.750625	\N	\N	\N
231	sess_1754203843522_s8fftlewl	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182347050155905}	75.00	75.00	4	f	2025-08-04 06:50:43.760159	::1	\N	\N	\N	2025-08-03 06:50:43.760159	2025-08-03 06:50:43.760159	\N	\N	\N
232	sess_1754203851539_6bdoboi6u	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182349589956143}	75.00	75.00	4	f	2025-08-04 06:50:51.805526	::1	\N	\N	\N	2025-08-03 06:50:51.805526	2025-08-03 06:50:51.805526	\N	\N	\N
233	sess_1754203851544_x0gigkzop	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182349591540548}	75.00	75.00	4	f	2025-08-04 06:50:51.807054	::1	\N	\N	\N	2025-08-03 06:50:51.807054	2025-08-03 06:50:51.807054	\N	\N	\N
234	sess_1754203856544_es6ciac4n	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182351175628058}	75.00	75.00	4	f	2025-08-04 06:50:56.775532	::1	\N	\N	\N	2025-08-03 06:50:56.775532	2025-08-03 06:50:56.775532	\N	\N	\N
235	sess_1754203856540_03sxdslao	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182351174994296}	75.00	75.00	4	f	2025-08-04 06:50:56.77663	::1	\N	\N	\N	2025-08-03 06:50:56.77663	2025-08-03 06:50:56.77663	\N	\N	\N
236	sess_1754203886540_scz8pj25q	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182360680786878}	75.00	75.00	4	f	2025-08-04 06:51:27.22886	::1	\N	\N	\N	2025-08-03 06:51:27.22886	2025-08-03 06:51:27.22886	\N	\N	\N
237	sess_1754203886537_776aiidc8	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182360680153116}	75.00	75.00	4	f	2025-08-04 06:51:27.257233	::1	\N	\N	\N	2025-08-03 06:51:27.257233	2025-08-03 06:51:27.257233	\N	\N	\N
238	sess_1754204016060_echjgk2a6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182401723198216}	75.00	75.00	4	f	2025-08-04 06:53:36.734164	::1	\N	\N	\N	2025-08-03 06:53:36.734164	2025-08-03 06:53:36.734164	\N	\N	\N
239	sess_1754204016044_pq6kezlmu	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182401718128121}	75.00	75.00	4	f	2025-08-04 06:53:36.734463	::1	\N	\N	\N	2025-08-03 06:53:36.734463	2025-08-03 06:53:36.734463	\N	\N	\N
240	sess_1754204016047_nxxptltwi	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182401719078764}	75.00	75.00	4	f	2025-08-04 06:53:36.745586	::1	\N	\N	\N	2025-08-03 06:53:36.745586	2025-08-03 06:53:36.745586	\N	\N	\N
241	sess_1754204162536_f5ore9oa4	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182448138641722}	75.00	75.00	4	f	2025-08-04 06:56:03.320621	::1	\N	\N	\N	2025-08-03 06:56:03.320621	2025-08-03 06:56:03.320621	\N	\N	\N
242	sess_1754204162564_r2eztbqnm	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182448147514387}	75.00	75.00	4	f	2025-08-04 06:56:03.320296	::1	\N	\N	\N	2025-08-03 06:56:03.320296	2025-08-03 06:56:03.320296	\N	\N	\N
243	sess_1754204162541_resrz7pno	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182448140226126}	75.00	75.00	4	f	2025-08-04 06:56:03.321186	::1	\N	\N	\N	2025-08-03 06:56:03.321186	2025-08-03 06:56:03.321186	\N	\N	\N
244	sess_1754204175481_82cp8voq1	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.518245224098157}	75.00	75.00	4	f	2025-08-04 06:56:15.74365	::1	\N	\N	\N	2025-08-03 06:56:15.74365	2025-08-03 06:56:15.74365	\N	\N	\N
245	sess_1754204175486_n77ki44ec	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182452242249094}	75.00	75.00	4	f	2025-08-04 06:56:15.744655	::1	\N	\N	\N	2025-08-03 06:56:15.744655	2025-08-03 06:56:15.744655	\N	\N	\N
246	sess_1754204175504_gxdg49bhs	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.518245224795295}	75.00	75.00	4	f	2025-08-04 06:56:15.765811	::1	\N	\N	\N	2025-08-03 06:56:15.765811	2025-08-03 06:56:15.765811	\N	\N	\N
248	sess_1754204186528_yscbw47gd	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.518245574124775}	75.00	75.00	4	f	2025-08-04 06:56:26.845743	::1	\N	\N	\N	2025-08-03 06:56:26.845743	2025-08-03 06:56:26.845743	\N	\N	\N
247	sess_1754204186524_04ddqc0jc	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182455739980226}	75.00	75.00	4	f	2025-08-04 06:56:26.84532	::1	\N	\N	\N	2025-08-03 06:56:26.84532	2025-08-03 06:56:26.84532	\N	\N	\N
249	sess_1754204186552_r58hp28mf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182455748852891}	75.00	75.00	4	f	2025-08-04 06:56:26.853919	::1	\N	\N	\N	2025-08-03 06:56:26.853919	2025-08-03 06:56:26.853919	\N	\N	\N
250	sess_1754205575565_i7rs9emaq	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.518289590051208}	75.00	75.00	4	f	2025-08-04 07:19:36.881174	::1	\N	\N	\N	2025-08-03 07:19:36.881174	2025-08-03 07:19:36.881174	\N	\N	\N
251	sess_1754205575546_vv0fy0u9s	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182895894491343}	75.00	75.00	4	f	2025-08-04 07:19:36.881372	::1	\N	\N	\N	2025-08-03 07:19:36.881372	2025-08-03 07:19:36.881372	\N	\N	\N
252	sess_1754205575550_vtqv6hvua	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5182895895758867}	75.00	75.00	4	f	2025-08-04 07:19:37.720959	::1	\N	\N	\N	2025-08-03 07:19:37.720959	2025-08-03 07:19:37.720959	\N	\N	\N
253	sess_1754210686002_entbtsm3u	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5184515301543844}	75.00	75.00	4	f	2025-08-04 08:44:46.864468	::1	\N	\N	\N	2025-08-03 08:44:46.864468	2025-08-03 08:44:46.864468	\N	\N	\N
254	sess_1754210685994_r1tsezjmc	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5184515300593201}	75.00	75.00	4	f	2025-08-04 08:44:46.864529	::1	\N	\N	\N	2025-08-03 08:44:46.864529	2025-08-03 08:44:46.864529	\N	\N	\N
255	sess_1754210686016_x0apf4gvj	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5184515304712652}	75.00	75.00	4	f	2025-08-04 08:44:46.96206	::1	\N	\N	\N	2025-08-03 08:44:46.96206	2025-08-03 08:44:46.96206	\N	\N	\N
256	sess_1754223584368_ihiew4t4p	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5188602550574188}	75.00	75.00	4	f	2025-08-04 12:19:45.150933	::1	\N	\N	\N	2025-08-03 12:19:45.150933	2025-08-03 12:19:45.150933	\N	\N	\N
257	sess_1754223584366_klamupa9i	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5188602549306665}	75.00	75.00	4	f	2025-08-04 12:19:45.151765	::1	\N	\N	\N	2025-08-03 12:19:45.151765	2025-08-03 12:19:45.151765	\N	\N	\N
258	sess_1754223584376_s27cetcui	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5188602551524831}	75.00	75.00	4	f	2025-08-04 12:19:45.152089	::1	\N	\N	\N	2025-08-03 12:19:45.152089	2025-08-03 12:19:45.152089	\N	\N	\N
260	sess_1754224067996_pevm2yn16	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5188755800504474}	75.00	75.00	4	f	2025-08-04 12:27:48.869672	::1	\N	\N	\N	2025-08-03 12:27:48.869672	2025-08-03 12:27:48.869672	\N	\N	\N
259	sess_1754224068012_ld8ivclfz	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5188755803356402}	75.00	75.00	4	f	2025-08-04 12:27:48.869456	::1	\N	\N	\N	2025-08-03 12:27:48.869456	2025-08-03 12:27:48.869456	\N	\N	\N
261	sess_1754224067999_e45tw78yo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186122558197}	{"monthly_income": 22222, "employment_years": 0.5188755800821355}	75.00	75.00	4	f	2025-08-04 12:27:48.885221	::1	\N	\N	\N	2025-08-03 12:27:48.885221	2025-08-03 12:27:48.885221	\N	\N	\N
262	sess_1754312231801_y2d8j3xzl	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186232194837}	{"monthly_income": 20000, "employment_years": 2.0137980013689254}	75.00	75.00	4	f	2025-08-05 12:57:12.678408	::1	\N	\N	\N	2025-08-04 12:57:12.678408	2025-08-04 12:57:12.678408	\N	\N	\N
263	sess_1754312231808_ga0os5vtm	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186232194837}	{"monthly_income": 20000, "employment_years": 2.01379800146399}	75.00	75.00	4	f	2025-08-05 12:57:12.773742	::1	\N	\N	\N	2025-08-04 12:57:12.773742	2025-08-04 12:57:12.773742	\N	\N	\N
264	sess_1754312231802_euu591um3	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186232194837}	{"monthly_income": 20000, "employment_years": 2.0137980014323014}	75.00	75.00	4	f	2025-08-05 12:57:12.919487	::1	\N	\N	\N	2025-08-04 12:57:12.919487	2025-08-04 12:57:12.919487	\N	\N	\N
265	sess_1754312234895_jqu048j9x	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186232194837}	{"monthly_income": 20000, "employment_years": 2.013798099316805}	75.00	75.00	4	f	2025-08-05 12:57:15.850264	::1	\N	\N	\N	2025-08-04 12:57:15.850264	2025-08-04 12:57:15.850264	\N	\N	\N
266	sess_1754312234890_si12ev2yo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186232194837}	{"monthly_income": 20000, "employment_years": 2.013798099094988}	75.00	75.00	4	f	2025-08-05 12:57:15.850119	::1	\N	\N	\N	2025-08-04 12:57:15.850119	2025-08-04 12:57:15.850119	\N	\N	\N
267	sess_1754312234890_3p6u8ecfy	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186232194837}	{"monthly_income": 20000, "employment_years": 2.013798099126676}	75.00	75.00	4	f	2025-08-05 12:57:15.854914	::1	\N	\N	\N	2025-08-04 12:57:15.854914	2025-08-04 12:57:15.854914	\N	\N	\N
268	sess_1754916513974_2e1exx1hf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-12 12:48:35.447516	::1	\N	\N	\N	2025-08-11 12:48:35.447516	2025-08-11 12:48:35.447516	\N	\N	\N
269	sess_1754916513971_en6rgj6am	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-12 12:48:35.665764	::1	\N	\N	\N	2025-08-11 12:48:35.665764	2025-08-11 12:48:35.665764	\N	\N	\N
270	sess_1754916513982_eflic1557	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-12 12:48:35.858373	::1	\N	\N	\N	2025-08-11 12:48:35.858373	2025-08-11 12:48:35.858373	\N	\N	\N
271	sess_1755000935511_9hv22hgue	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-13 12:15:36.936962	::1	\N	\N	\N	2025-08-12 12:15:36.936962	2025-08-12 12:15:36.936962	\N	\N	\N
272	sess_1755000935516_6araihdcj	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-13 12:15:36.950311	::1	\N	\N	\N	2025-08-12 12:15:36.950311	2025-08-12 12:15:36.950311	\N	\N	\N
273	sess_1755000935509_5zsginuku	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-13 12:15:36.970947	::1	\N	\N	\N	2025-08-12 12:15:36.970947	2025-08-12 12:15:36.970947	\N	\N	\N
274	sess_1755003943176_o2dt7qxls	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-13 13:05:44.448959	::1	\N	\N	\N	2025-08-12 13:05:44.448959	2025-08-12 13:05:44.448959	\N	\N	\N
275	sess_1755003943179_36ws7lf9j	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-13 13:05:44.454828	::1	\N	\N	\N	2025-08-12 13:05:44.454828	2025-08-12 13:05:44.454828	\N	\N	\N
276	sess_1755003943187_dujsx40fp	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1186835331607}	{"monthly_income": 1111, "employment_years": 0}	75.00	75.00	4	f	2025-08-13 13:05:44.455424	::1	\N	\N	\N	2025-08-12 13:05:44.455424	2025-08-12 13:05:44.455424	\N	\N	\N
277	sess_1755078839018_vb6xcyxgl	\N	1000000.00	\N	\N	800000.00	\N	no_property	30	898.13	{"age": 18, "birth_date": 1186998444826}	{"monthly_income": 2222, "employment_years": 0.06136204977564834}	75.00	75.00	4	f	2025-08-14 09:54:00.226567	::1	\N	\N	\N	2025-08-13 09:54:00.226567	2025-08-13 09:54:00.226567	\N	\N	\N
278	sess_1755078839008_o0duzh5rx	\N	1000000.00	\N	\N	800000.00	\N	no_property	30	898.13	{"age": 18, "birth_date": 1186998444826}	{"monthly_income": 2222, "employment_years": 0.0613620496172079}	75.00	75.00	4	f	2025-08-14 09:54:00.227216	::1	\N	\N	\N	2025-08-13 09:54:00.227216	2025-08-13 09:54:00.227216	\N	\N	\N
279	sess_1755078839011_z7dqfbch3	\N	1000000.00	\N	\N	800000.00	\N	no_property	30	898.13	{"age": 18, "birth_date": 1186998444826}	{"monthly_income": 2222, "employment_years": 0.06136204968058408}	75.00	75.00	4	f	2025-08-14 09:54:00.368228	::1	\N	\N	\N	2025-08-13 09:54:00.368228	2025-08-13 09:54:00.368228	\N	\N	\N
280	sess_1755080058336_qsccsxs3r	\N	1000000.00	\N	\N	800000.00	\N	no_property	30	898.13	{"age": 18, "birth_date": 1186999942307}	{"monthly_income": 121212, "employment_years": 0.02854647828098461}	75.00	75.00	4	f	2025-08-14 10:14:19.126073	::1	\N	\N	\N	2025-08-13 10:14:19.126073	2025-08-13 10:14:19.126073	\N	\N	\N
281	sess_1755080058333_vd413fytb	\N	1000000.00	\N	\N	800000.00	\N	no_property	30	898.13	{"age": 18, "birth_date": 1186999942307}	{"monthly_income": 121212, "employment_years": 0.02854647821760844}	75.00	75.00	4	f	2025-08-14 10:14:19.127053	::1	\N	\N	\N	2025-08-13 10:14:19.127053	2025-08-13 10:14:19.127053	\N	\N	\N
282	sess_1755080058344_2yfpvenk0	\N	1000000.00	\N	\N	800000.00	\N	no_property	30	898.13	{"age": 18, "birth_date": 1186999942307}	{"monthly_income": 121212, "employment_years": 0.028546478502801228}	75.00	75.00	4	f	2025-08-14 10:14:19.170252	::1	\N	\N	\N	2025-08-13 10:14:19.170252	2025-08-13 10:14:19.170252	\N	\N	\N
283	sess_1755090880520_3213j60kr	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.001510905106852232}	75.00	75.00	4	f	2025-08-14 13:14:41.605961	::1	\N	\N	\N	2025-08-13 13:14:41.605961	2025-08-13 13:14:41.605961	\N	\N	\N
284	sess_1755090880518_4qv3d92xf	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0015109049800998808}	75.00	75.00	4	f	2025-08-14 13:14:41.63007	::1	\N	\N	\N	2025-08-13 13:14:41.63007	2025-08-13 13:14:41.63007	\N	\N	\N
285	sess_1755090880528_3bht3hgje	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0015109052019164956}	75.00	75.00	4	f	2025-08-14 13:14:41.690511	::1	\N	\N	\N	2025-08-13 13:14:41.690511	2025-08-13 13:14:41.690511	\N	\N	\N
286	sess_1755097652633_l0ts1tk6k	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0017255001964661444}	75.00	75.00	4	f	2025-08-14 15:07:33.845576	::1	\N	\N	\N	2025-08-13 15:07:33.845576	2025-08-13 15:07:33.845576	\N	\N	\N
287	sess_1755097652665_pcgdtex1t	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.001725500956980252}	75.00	75.00	4	f	2025-08-14 15:07:33.8551	::1	\N	\N	\N	2025-08-13 15:07:33.8551	2025-08-13 15:07:33.8551	\N	\N	\N
288	sess_1755097652646_edyqk76zp	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0017255003549065835}	75.00	75.00	4	f	2025-08-14 15:07:34.124473	::1	\N	\N	\N	2025-08-13 15:07:34.124473	2025-08-13 15:07:34.124473	\N	\N	\N
289	sess_1755150302762_5x40v7ppr	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0033938818224453064}	75.00	75.00	4	f	2025-08-15 05:45:04.238517	::1	\N	\N	\N	2025-08-14 05:45:04.238517	2025-08-14 05:45:04.238517	\N	\N	\N
290	sess_1755150302740_2dyuqwrdt	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0033938811569954623}	75.00	75.00	4	f	2025-08-15 05:45:04.240503	::1	\N	\N	\N	2025-08-14 05:45:04.240503	2025-08-14 05:45:04.240503	\N	\N	\N
291	sess_1755150302745_zpljqcwv0	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0033938813154359014}	75.00	75.00	4	f	2025-08-15 05:45:04.244051	::1	\N	\N	\N	2025-08-14 05:45:04.244051	2025-08-14 05:45:04.244051	\N	\N	\N
292	sess_1755166643536_pjdqbddg3	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.003911690115851649}	75.00	75.00	4	f	2025-08-15 10:17:24.805582	::1	\N	\N	\N	2025-08-14 10:17:24.805582	2025-08-14 10:17:24.805582	\N	\N	\N
293	sess_1755166643549_pepe9v2ik	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.003911690115851649}	75.00	75.00	4	f	2025-08-15 10:17:24.841033	::1	\N	\N	\N	2025-08-14 10:17:24.841033	2025-08-14 10:17:24.841033	\N	\N	\N
294	sess_1755166643533_3zb7htwai	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.003911689830658859}	75.00	75.00	4	f	2025-08-15 10:17:24.926287	::1	\N	\N	\N	2025-08-14 10:17:24.926287	2025-08-14 10:17:24.926287	\N	\N	\N
295	sess_1755166644632_a2agx0tfp	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.003911724370674576}	75.00	75.00	4	f	2025-08-15 10:17:25.760544	::1	\N	\N	\N	2025-08-14 10:17:25.760544	2025-08-14 10:17:25.760544	\N	\N	\N
296	sess_1755166644643_71a9z83u3	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0039117247192435416}	75.00	75.00	4	f	2025-08-15 10:17:25.88634	::1	\N	\N	\N	2025-08-14 10:17:25.88634	2025-08-14 10:17:25.88634	\N	\N	\N
297	sess_1755166644630_sx6d9il7o	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0039117243072984}	75.00	75.00	4	f	2025-08-15 10:17:25.926273	::1	\N	\N	\N	2025-08-14 10:17:25.926273	2025-08-14 10:17:25.926273	\N	\N	\N
298	sess_1755166672896_5oi8yi3hy	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0039126201612289906}	75.00	75.00	4	f	2025-08-15 10:17:53.787089	::1	\N	\N	\N	2025-08-14 10:17:53.787089	2025-08-14 10:17:53.787089	\N	\N	\N
299	sess_1755166672895_yvwcte3h6	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.003912620129540903}	75.00	75.00	4	f	2025-08-15 10:17:53.793801	::1	\N	\N	\N	2025-08-14 10:17:53.793801	2025-08-14 10:17:53.793801	\N	\N	\N
300	sess_1755166672901_kvcsxipp9	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.003912620224605166}	75.00	75.00	4	f	2025-08-15 10:17:53.89705	::1	\N	\N	\N	2025-08-14 10:17:53.89705	2025-08-14 10:17:53.89705	\N	\N	\N
301	sess_1755169050007_gfrbs0y2d	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1187087043061}	{"monthly_income": 6576567, "employment_years": 0}	50.00	50.00	4	f	2025-08-15 10:57:30.829798	::1	\N	\N	\N	2025-08-14 10:57:30.829798	2025-08-14 10:57:30.829798	\N	\N	\N
302	sess_1755169050009_zve6gi44g	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1187087043061}	{"monthly_income": 6576567, "employment_years": 0}	50.00	50.00	4	f	2025-08-15 10:57:30.839927	::1	\N	\N	\N	2025-08-14 10:57:30.839927	2025-08-14 10:57:30.839927	\N	\N	\N
303	sess_1755169050016_js291pw55	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1187087043061}	{"monthly_income": 6576567, "employment_years": 0}	50.00	50.00	4	f	2025-08-15 10:57:31.000894	::1	\N	\N	\N	2025-08-14 10:57:31.000894	2025-08-14 10:57:31.000894	\N	\N	\N
304	sess_1755170000384_rrce05siy	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.004018061829796943}	75.00	75.00	4	f	2025-08-15 11:13:21.356177	::1	\N	\N	\N	2025-08-14 11:13:21.356177	2025-08-14 11:13:21.356177	\N	\N	\N
305	sess_1755170000380_xdwsu7tsm	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.004018061798108855}	75.00	75.00	4	f	2025-08-15 11:13:21.361867	::1	\N	\N	\N	2025-08-14 11:13:21.361867	2025-08-14 11:13:21.361867	\N	\N	\N
307	sess_1755170036552_ayobjosha	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.004019207956245089}	75.00	75.00	4	f	2025-08-15 11:13:57.596226	::1	\N	\N	\N	2025-08-14 11:13:57.596226	2025-08-14 11:13:57.596226	\N	\N	\N
306	sess_1755170036561_wem506fxz	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.004019208273125966}	75.00	75.00	4	f	2025-08-15 11:13:57.596213	::1	\N	\N	\N	2025-08-14 11:13:57.596213	2025-08-14 11:13:57.596213	\N	\N	\N
308	sess_1755170036555_1t3qqujn5	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187009764818}	{"monthly_income": 123123, "employment_years": 0.0040192080513093515}	75.00	75.00	4	f	2025-08-15 11:13:57.832196	::1	\N	\N	\N	2025-08-14 11:13:57.832196	2025-08-14 11:13:57.832196	\N	\N	\N
309	sess_1755170474557_aelhmfllh	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1187087043061}	{"monthly_income": 6576567, "employment_years": 0}	50.00	50.00	4	f	2025-08-15 11:21:14.932716	::1	\N	\N	\N	2025-08-14 11:21:14.932716	2025-08-14 11:21:14.932716	\N	\N	\N
310	sess_1755170474558_5fiwf7r2r	\N	1000000.00	\N	\N	500000.00	\N	has_property	30	2245.34	{"age": 18, "birth_date": 1187087043061}	{"monthly_income": 6576567, "employment_years": 0}	50.00	50.00	4	f	2025-08-15 11:21:15.743443	::1	\N	\N	\N	2025-08-14 11:21:15.743443	2025-08-14 11:21:15.743443	\N	\N	\N
311	sess_1755171389525_hs5yl7ii7	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:36:30.424945	::1	\N	\N	\N	2025-08-14 11:36:30.424945	2025-08-14 11:36:30.424945	\N	\N	\N
312	sess_1755171389536_nmhloi8t7	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:36:30.466396	::1	\N	\N	\N	2025-08-14 11:36:30.466396	2025-08-14 11:36:30.466396	\N	\N	\N
313	sess_1755171389528_na1zt47lj	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:36:30.517995	::1	\N	\N	\N	2025-08-14 11:36:30.517995	2025-08-14 11:36:30.517995	\N	\N	\N
314	sess_1755171685483_y7gzovgzd	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:41:26.522436	::1	\N	\N	\N	2025-08-14 11:41:26.522436	2025-08-14 11:41:26.522436	\N	\N	\N
315	sess_1755171685480_x30mje7uy	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:41:26.523468	::1	\N	\N	\N	2025-08-14 11:41:26.523468	2025-08-14 11:41:26.523468	\N	\N	\N
316	sess_1755171685497_kl3xlwq7d	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:41:26.561823	::1	\N	\N	\N	2025-08-14 11:41:26.561823	2025-08-14 11:41:26.561823	\N	\N	\N
317	sess_1755171827879_yc8dm95kv	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:43:49.157405	::1	\N	\N	\N	2025-08-14 11:43:49.157405	2025-08-14 11:43:49.157405	\N	\N	\N
318	sess_1755171827876_skgno54dh	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:43:49.157306	::1	\N	\N	\N	2025-08-14 11:43:49.157306	2025-08-14 11:43:49.157306	\N	\N	\N
319	sess_1755171827886_jpha091iu	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:43:49.198641	::1	\N	\N	\N	2025-08-14 11:43:49.198641	2025-08-14 11:43:49.198641	\N	\N	\N
320	sess_1755172290345_enxqitww5	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:51:31.478899	::1	\N	\N	\N	2025-08-14 11:51:31.478899	2025-08-14 11:51:31.478899	\N	\N	\N
321	sess_1755172290358_yewbclne9	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:51:31.48505	::1	\N	\N	\N	2025-08-14 11:51:31.48505	2025-08-14 11:51:31.48505	\N	\N	\N
322	sess_1755172290341_jn6z0ck78	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:51:31.491477	::1	\N	\N	\N	2025-08-14 11:51:31.491477	2025-08-14 11:51:31.491477	\N	\N	\N
323	sess_1755172303117_l4l13mr96	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:51:43.576915	::1	\N	\N	\N	2025-08-14 11:51:43.576915	2025-08-14 11:51:43.576915	\N	\N	\N
324	sess_1755172303115_7kpfgzajo	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:51:43.589921	::1	\N	\N	\N	2025-08-14 11:51:43.589921	2025-08-14 11:51:43.589921	\N	\N	\N
325	sess_1755172303125_omby6px1v	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:51:43.590763	::1	\N	\N	\N	2025-08-14 11:51:43.590763	2025-08-14 11:51:43.590763	\N	\N	\N
326	sess_1755172767744_tjk7wczwk	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:59:28.258444	::1	\N	\N	\N	2025-08-14 11:59:28.258444	2025-08-14 11:59:28.258444	\N	\N	\N
327	sess_1755172767746_8lalvlxxk	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:59:28.803871	::1	\N	\N	\N	2025-08-14 11:59:28.803871	2025-08-14 11:59:28.803871	\N	\N	\N
328	sess_1755172767755_rpustrevp	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 11:59:28.803984	::1	\N	\N	\N	2025-08-14 11:59:28.803984	2025-08-14 11:59:28.803984	\N	\N	\N
329	sess_1755172824586_kwypddrtf	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 12:00:25.114937	::1	\N	\N	\N	2025-08-14 12:00:25.114937	2025-08-14 12:00:25.114937	\N	\N	\N
330	sess_1755172824596_8pg0iftgl	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 12:00:25.626518	::1	\N	\N	\N	2025-08-14 12:00:25.626518	2025-08-14 12:00:25.626518	\N	\N	\N
331	sess_1755172824588_xijo8d3vj	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 12:00:25.722055	::1	\N	\N	\N	2025-08-14 12:00:25.722055	2025-08-14 12:00:25.722055	\N	\N	\N
332	sess_1755173078867_6mj0fl3h6	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 12:04:39.347525	::1	\N	\N	\N	2025-08-14 12:04:39.347525	2025-08-14 12:04:39.347525	\N	\N	\N
333	sess_1755173078870_fg5sk3rgv	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 12:04:39.784395	::1	\N	\N	\N	2025-08-14 12:04:39.784395	2025-08-14 12:04:39.784395	\N	\N	\N
334	sess_1755173078880_pnae6s9sd	\N	1000000.00	\N	\N	500000.00	\N	no_property	30	2245.34	{"age": 18, "birth_date": 1187091221528}	{"monthly_income": 13123, "employment_years": 0}	75.00	75.00	4	f	2025-08-15 12:04:39.867336	::1	\N	\N	\N	2025-08-14 12:04:39.867336	2025-08-14 12:04:39.867336	\N	\N	\N
335	sess_1755177515217_nzw4ttsum	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.000005214021345095951}	75.00	75.00	4	f	2025-08-15 13:18:36.128732	::1	\N	\N	\N	2025-08-14 13:18:36.128732	2025-08-14 13:18:36.128732	\N	\N	\N
336	sess_1755177515221_4mbdf9u8o	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.00000521408472127158}	75.00	75.00	4	f	2025-08-15 13:18:36.153663	::1	\N	\N	\N	2025-08-14 13:18:36.153663	2025-08-14 13:18:36.153663	\N	\N	\N
337	sess_1755177524230_lhnuar3y8	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.0000054995627043881665}	75.00	75.00	4	f	2025-08-15 13:18:44.658366	::1	\N	\N	\N	2025-08-14 13:18:44.658366	2025-08-14 13:18:44.658366	\N	\N	\N
338	sess_1755177524233_2dtzsoo23	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.000005499626080563795}	75.00	75.00	4	f	2025-08-15 13:18:44.663449	::1	\N	\N	\N	2025-08-14 13:18:44.663449	2025-08-14 13:18:44.663449	\N	\N	\N
339	sess_1755177548854_y2ubefqlm	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187093814574}	{"monthly_income": 15000, "employment_years": 0.0000459728559839785}	75.00	75.00	4	f	2025-08-15 13:19:09.635537	::1	\N	\N	\N	2025-08-14 13:19:09.635537	2025-08-14 13:19:09.635537	\N	\N	\N
340	sess_1755177548865_iugcn4wtf	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187093814574}	{"monthly_income": 15000, "employment_years": 0.00004597323624103227}	75.00	75.00	4	f	2025-08-15 13:19:09.708791	::1	\N	\N	\N	2025-08-14 13:19:09.708791	2025-08-14 13:19:09.708791	\N	\N	\N
341	sess_1755177548851_u40u3tzkr	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187093814574}	{"monthly_income": 15000, "employment_years": 0.000045972824295890686}	75.00	75.00	4	f	2025-08-15 13:19:09.728907	::1	\N	\N	\N	2025-08-14 13:19:09.728907	2025-08-14 13:19:09.728907	\N	\N	\N
342	sess_1755177692040_lp6m2iust	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.00001081710903237255}	75.00	75.00	4	f	2025-08-15 13:21:33.298709	::1	\N	\N	\N	2025-08-14 13:21:33.298709	2025-08-14 13:21:33.298709	\N	\N	\N
343	sess_1755177692043_mm6l5m8qb	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.000010817235784723807}	75.00	75.00	4	f	2025-08-15 13:21:33.302303	::1	\N	\N	\N	2025-08-14 13:21:33.302303	2025-08-14 13:21:33.302303	\N	\N	\N
344	sess_1755177692059_kd3l4isnl	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187094143083}	{"monthly_income": 21123, "employment_years": 0.000010817711106041017}	75.00	75.00	4	f	2025-08-15 13:21:33.305121	::1	\N	\N	\N	2025-08-14 13:21:33.305121	2025-08-14 13:21:33.305121	\N	\N	\N
345	sess_1755177794706_h0ah8295k	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.0000005527036276522929}	75.00	75.00	4	f	2025-08-15 13:23:16.015732	::1	\N	\N	\N	2025-08-14 13:23:16.015732	2025-08-14 13:23:16.015732	\N	\N	\N
346	sess_1755177794713_u2nasi5aw	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.000000552798691915735}	75.00	75.00	4	f	2025-08-15 13:23:16.021989	::1	\N	\N	\N	2025-08-14 13:23:16.021989	2025-08-14 13:23:16.021989	\N	\N	\N
347	sess_1755177794707_wwq8aoltz	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.000000552735315740107}	75.00	75.00	4	f	2025-08-15 13:23:16.02327	::1	\N	\N	\N	2025-08-14 13:23:16.02327	2025-08-14 13:23:16.02327	\N	\N	\N
348	sess_1755177813798_wj7mvtq6w	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.0000011575975359342915}	75.00	75.00	4	f	2025-08-15 13:23:34.296573	::1	\N	\N	\N	2025-08-14 13:23:34.296573	2025-08-14 13:23:34.296573	\N	\N	\N
349	sess_1755177813798_z8v11rr71	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.0000011576292240221055}	75.00	75.00	4	f	2025-08-15 13:23:34.898289	::1	\N	\N	\N	2025-08-14 13:23:34.898289	2025-08-14 13:23:34.898289	\N	\N	\N
350	sess_1755177813803_jfxftohtt	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.0000011577876644611757}	75.00	75.00	4	f	2025-08-15 13:23:35.101551	::1	\N	\N	\N	2025-08-14 13:23:35.101551	2025-08-14 13:23:35.101551	\N	\N	\N
351	sess_1755179202217_2srh966qx	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.000045153972418688364}	75.00	75.00	4	f	2025-08-15 13:46:42.579503	::1	\N	\N	\N	2025-08-14 13:46:42.579503	2025-08-14 13:46:42.579503	\N	\N	\N
352	sess_1755179202224_4qfupfgup	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.00004515416254721525}	75.00	75.00	4	f	2025-08-15 13:46:43.073646	::1	\N	\N	\N	2025-08-14 13:46:43.073646	2025-08-14 13:46:43.073646	\N	\N	\N
353	sess_1755179202219_wyr9yp5py	\N	0.00	\N	\N	\N	\N	no_property	30	\N	{"age": 18, "birth_date": 1187097763172}	{"monthly_income": 123111, "employment_years": 0.00004515406748295181}	75.00	75.00	4	f	2025-08-15 13:46:43.158708	::1	\N	\N	\N	2025-08-14 13:46:43.158708	2025-08-14 13:46:43.158708	\N	\N	\N
\.


--
-- Data for Name: client_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_identity (id, client_id, id_number, id_type, id_expiry_date, id_issuing_country, verification_status, verification_date, created_at, updated_at) FROM stdin;
1	189	123456789	national_id	\N	IL	pending	\N	2025-06-13 11:13:13.359062	2025-06-13 11:13:13.359062
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, first_name, last_name, email, phone, created_at, updated_at, role, is_staff, last_login, password_hash) FROM stdin;
418	New	Client	972076687678@bankim.com	+972076687678	2025-07-29 21:52:00.660499	2025-07-29 21:52:00.660499	customer	f	\N	\N
424	New	Client	972655654456@bankim.com	+972655654456	2025-07-30 13:23:30.980377	2025-07-30 13:23:30.980377	customer	f	\N	\N
430	New	Client	972544344554@bankim.com	+972544344554	2025-08-02 11:30:11.849262	2025-08-02 11:30:11.849262	customer	f	\N	\N
436	New	Client	972654456654@bankim.com	+972654456654	2025-08-11 12:24:15.189662	2025-08-11 12:24:15.189662	customer	f	\N	\N
442	New	Client	972876876678@bankim.com	+972876876678	2025-08-12 07:02:39.339674	2025-08-12 07:02:39.339674	customer	f	\N	\N
448	New	Client	972876678765@bankim.com	+972876678765	2025-08-12 19:36:18.694529	2025-08-12 19:36:18.694529	customer	f	\N	\N
451	New	Client	972986798769@bankim.com	+972986798769	2025-08-13 06:52:23.569456	2025-08-13 06:52:23.569456	customer	f	\N	\N
454	New	Client	972785765765@bankim.com	+972785765765	2025-08-13 09:23:31.524344	2025-08-13 09:23:31.524344	customer	f	\N	\N
386	New	Client	972123123123@bankim.com	+972123123123	2025-06-24 22:26:20.051275	2025-08-13 10:38:16.242021	customer	f	\N	\N
356	Test	User	test@bankim.com	+972501234567	2025-06-09 21:51:47.890915	2025-06-09 21:51:47.890915	customer	f	\N	\N
358	New	Test User	test1749677642598@example.com	+972507642598	2025-06-11 21:34:05.133107	2025-06-11 21:34:05.133107	customer	f	\N	\N
360	New	Client	972544345215@bankim.com	972544345215	2025-06-12 20:35:39.095753	2025-06-12 20:35:39.095753	customer	f	\N	\N
364	adadasd	Client	asdads@dada.com	+972131231231	2025-06-12 21:13:08.679347	2025-06-12 21:13:08.679347	customer	f	\N	\N
362	Updated Test	User Updated	test@example.com	+1234567890	2025-06-12 20:48:05.280678	2025-06-13 09:08:24.757338	customer	f	\N	\N
366	adasda	Client	asda@adasd.com	+972544345287	2025-06-16 09:45:29.360627	2025-06-16 09:45:29.360627	customer	f	\N	@Qwerty1234
368	New	Client	972544312546@bankim.com	972544312546	2025-06-18 11:45:12.992903	2025-06-18 11:45:12.992903	customer	f	\N	\N
370	test	Client	adfs@dsfs.com	+97254465456	2025-06-18 11:49:57.16809	2025-06-18 11:49:57.16809	customer	f	\N	!Qwerty6262
372	New	Client	9725443452765@bankim.com	9725443452765	2025-06-18 22:20:21.718735	2025-06-18 22:20:21.718735	customer	f	\N	\N
374	TETS	Client	AFS@asdasd.com	+972544345876	2025-06-20 22:14:12.288287	2025-06-20 22:14:12.288287	customer	f	\N	!Qwerty6262
376	New	Client	77771234567@bankim.com	+77771234567	2025-06-20 23:19:12.902192	2025-06-20 23:19:12.902192	customer	f	\N	\N
378	sfdsfd	Client	345287@gmail.com	+972566768887	2025-06-22 17:58:31.050628	2025-06-22 17:58:31.050628	customer	f	\N	!Qwerty6262
380	New	Client	972455345543@bankim.com	972455345543	2025-06-23 14:59:26.117885	2025-06-23 14:59:26.117885	customer	f	\N	\N
382	New	Client	972344432234@bankim.com	972344432234	2025-06-24 21:54:40.622548	2025-06-24 21:54:40.622548	customer	f	\N	\N
384	sadfsas	Client	adfsd@das.com	+9725444567654	2025-06-24 21:59:30.37496	2025-06-24 21:59:30.37496	customer	f	\N	!Qwerty1212
388	wsss	Client	sdgdf@sdfsf.com	+9726576576476	2025-06-25 05:26:44.172992	2025-06-25 05:26:44.172992	customer	f	\N	!Qwerty6262
392	New	Client	9729725667655@bankim.com	9729725667655	2025-06-29 21:37:45.36135	2025-06-29 21:37:45.36135	customer	f	\N	\N
394	New	Client	972544456654@bankim.com	972544456654	2025-06-30 14:43:59.036255	2025-06-30 14:43:59.036255	customer	f	\N	\N
396	New	Client	972544123456@bankim.com	+972544123456	2025-07-05 13:51:27.393235	2025-07-05 13:51:27.393235	customer	f	\N	\N
398	New	Client	972655765576@bankim.com	+972655765576	2025-07-05 13:59:35.821091	2025-07-05 13:59:35.821091	customer	f	\N	\N
400	New	Client	972544654465@bankim.com	+972544654465	2025-07-05 14:27:24.912193	2025-07-05 14:27:24.912193	customer	f	\N	\N
402	New	Client	972544465445@bankim.com	+972544465445	2025-07-05 15:23:54.651675	2025-07-05 15:23:54.651675	customer	f	\N	\N
404	מיכאל	Client	Jjj@hh.fij	+972544345647	2025-07-06 09:23:39.973662	2025-07-06 09:23:39.973662	customer	f	\N	!Qwerty6262
189	Unknown	User	user189@bankim.com	+972000000000	2025-06-08 22:25:20.682636	2025-06-08 22:25:20.682636	customer	f	\N	\N
190	Unknown	User	user190@bankim.com	+972000000000	2025-06-08 22:25:20.765435	2025-06-08 22:25:20.765435	customer	f	\N	\N
357	New	Client	972501234567@bankim.com	972501234567	2025-06-11 20:14:57.048448	2025-06-11 20:14:57.048448	customer	f	\N	\N
359	adadads	Client	hagana941977@gmail.com	+97254434564	2025-06-11 22:05:11.689626	2025-06-11 22:05:11.689626	customer	f	\N	\N
361	fsdfd	Client	ads@asd.com	+97254433334	2025-06-12 20:38:17.390685	2025-06-12 20:38:17.390685	customer	f	\N	\N
363	New	Client	972544654456@bankim.com	972544654456	2025-06-12 21:11:43.387147	2025-06-12 21:11:43.387147	customer	f	\N	\N
365	Admin	User	test@test	+972501234567	2025-06-12 22:08:32.663405	2025-06-12 22:08:32.663405	admin	t	\N	\N
367	New	Client	972544345287@bankim.com	972544345287	2025-06-17 23:29:30.112115	2025-06-17 23:29:30.112115	customer	f	\N	\N
369	test	Client	adsfs@asds.com	+972544654456	2025-06-18 11:47:44.014088	2025-06-18 11:47:44.014088	customer	f	\N	@Qwerty6262
371	qqqq	Client	dfd@ad.com	+97265444564	2025-06-18 11:58:06.153404	2025-06-18 11:58:06.153404	customer	f	\N	!Qwerty6262
373	New	Client	972544546678@bankim.com	972544546678	2025-06-20 22:08:23.289779	2025-06-20 22:08:23.289779	customer	f	\N	\N
375	asdf	Client	safa@asdas.cij	+972544556776	2025-06-20 22:17:44.96894	2025-06-20 22:17:44.96894	customer	f	\N	!Qwerty6262
377	New	Client	972544567765@bankim.com	972544567765	2025-06-21 00:14:55.848363	2025-06-21 00:14:55.848363	customer	f	\N	\N
379	New	Client	9725445567765@bankim.com	9725445567765	2025-06-23 11:30:43.029999	2025-06-23 11:30:43.029999	customer	f	\N	\N
381	sdsd	Client	341115287@gmail.com	+972544129992	2025-06-23 20:07:54.626545	2025-06-23 20:07:54.626545	customer	f	\N	!Qwerty6262
383	asdfsfd	Client	adfs@asd.com	+97212332122	2025-06-24 21:57:46.375488	2025-06-24 21:57:46.375488	customer	f	\N	!Qwerty6262
385	asdfgsd	Client	sadf@ad.com	+972544456654	2025-06-24 22:03:12.968452	2025-06-24 22:03:12.968452	customer	f	\N	!Qwerty6262
387	New	Client	9725444654456@bankim.com	9725444654456	2025-06-24 22:32:56.254599	2025-06-24 22:32:56.254599	customer	f	\N	\N
389	New	Client	9725667655676@bankim.com	9725667655676	2025-06-25 05:55:27.886387	2025-06-25 05:55:27.886387	customer	f	\N	\N
391	Test	User	testuser1751229434715@example.com	+972566765567	2025-06-29 20:37:15.596514	2025-06-29 20:37:15.596514	customer	f	\N	$2b$10$AIiDfKQCKWlu7Vw0bs3OQelGTZSbaTn3f8bUJtZnpwsfQk84GvIAy
393	New	Client	972544645654@bankim.com	972544645654	2025-06-30 12:01:41.268844	2025-06-30 12:01:41.268844	customer	f	\N	\N
395	New	Client	972544129992@bankim.com	972544129992	2025-07-02 22:51:48.772486	2025-07-02 22:51:48.772486	customer	f	\N	\N
397	New	Client	972564446544@bankim.com	+972564446544	2025-07-05 13:54:40.059876	2025-07-05 13:54:40.059876	customer	f	\N	\N
399	New	Client	972544465446@bankim.com	+972544465446	2025-07-05 14:03:52.835647	2025-07-05 14:03:52.835647	customer	f	\N	\N
401	New	Client	972565654566@bankim.com	+972565654566	2025-07-05 15:12:11.859309	2025-07-05 15:12:11.859309	customer	f	\N	\N
403	New	Client	972654456789@bankim.com	+972654456789	2025-07-05 18:51:19.241691	2025-07-05 18:51:19.241691	customer	f	\N	\N
405	New	Client	972344234342@bankim.com	+972344234342	2025-07-12 13:59:54.627793	2025-07-12 13:59:54.627793	customer	f	\N	\N
407	John	Doe			2025-07-17 09:34:58.120041	2025-07-17 09:34:58.120041	customer	f	\N	\N
416	New	Client	972544764456@bankim.com	+972544764456	2025-07-24 20:57:58.233168	2025-07-24 20:57:58.233168	customer	f	\N	\N
191	Unknown	User	user191@bankim.com	+972000000000	2025-06-08 22:25:20.84947	2025-06-08 22:25:20.84947	customer	f	\N	\N
192	Unknown	User	user192@bankim.com	+972000000000	2025-06-08 22:25:20.93482	2025-06-08 22:25:20.93482	customer	f	\N	\N
193	Unknown	User	user193@bankim.com	+972000000000	2025-06-08 22:25:21.019559	2025-06-08 22:25:21.019559	customer	f	\N	\N
422	New	Client	972054465443@bankim.com	+972054465443	2025-07-30 13:06:25.340202	2025-07-30 13:06:25.340202	customer	f	\N	\N
434	New	Client	972544644567@bankim.com	+972544644567	2025-08-04 13:11:15.244	2025-08-04 13:11:15.244	customer	f	\N	\N
440	New	Client	972655765678@bankim.com	+972655765678	2025-08-12 06:09:58.813442	2025-08-12 06:09:58.813442	customer	f	\N	\N
446	New	Client	972876678876@bankim.com	+972876678876	2025-08-12 07:31:58.981049	2025-08-12 07:31:58.981049	customer	f	\N	\N
464	New	Client	972500000001@bankim.com	+972500000001	2025-08-13 10:01:59.264394	2025-08-13 10:01:59.264394	customer	f	\N	\N
467	New	Client	972876876876@bankim.com	+972876876876	2025-08-13 10:12:22.392044	2025-08-13 10:12:22.392044	customer	f	\N	\N
473	New	Client	972786876876@bankim.com	+972786876876	2025-08-14 11:33:41.653593	2025-08-14 11:33:41.653593	customer	f	\N	\N
194	Unknown	User	user194@bankim.com	+972000000000	2025-06-08 22:25:21.102399	2025-06-08 22:25:21.102399	customer	f	\N	\N
195	Unknown	User	user195@bankim.com	+972000000000	2025-06-08 22:25:21.189563	2025-06-08 22:25:21.189563	customer	f	\N	\N
196	Unknown	User	user196@bankim.com	+972000000000	2025-06-08 22:25:21.273468	2025-06-08 22:25:21.273468	customer	f	\N	\N
197	Unknown	User	user197@bankim.com	+972000000000	2025-06-08 22:25:21.357377	2025-06-08 22:25:21.357377	customer	f	\N	\N
198	Unknown	User	user198@bankim.com	+972000000000	2025-06-08 22:25:21.443378	2025-06-08 22:25:21.443378	customer	f	\N	\N
199	Unknown	User	user199@bankim.com	+972000000000	2025-06-08 22:25:21.527625	2025-06-08 22:25:21.527625	customer	f	\N	\N
200	Unknown	User	user200@bankim.com	+972000000000	2025-06-08 22:25:21.61166	2025-06-08 22:25:21.61166	customer	f	\N	\N
201	Unknown	User	user201@bankim.com	+972000000000	2025-06-08 22:25:21.696628	2025-06-08 22:25:21.696628	customer	f	\N	\N
202	Unknown	User	user202@bankim.com	+972000000000	2025-06-08 22:25:21.779333	2025-06-08 22:25:21.779333	customer	f	\N	\N
203	Unknown	User	user203@bankim.com	+972000000000	2025-06-08 22:25:21.869478	2025-06-08 22:25:21.869478	customer	f	\N	\N
204	Unknown	User	user204@bankim.com	+972000000000	2025-06-08 22:25:21.951388	2025-06-08 22:25:21.951388	customer	f	\N	\N
205	Unknown	User	user205@bankim.com	+972000000000	2025-06-08 22:25:22.035498	2025-06-08 22:25:22.035498	customer	f	\N	\N
206	Unknown	User	user206@bankim.com	+972000000000	2025-06-08 22:25:22.120426	2025-06-08 22:25:22.120426	customer	f	\N	\N
207	Unknown	User	user207@bankim.com	+972000000000	2025-06-08 22:25:22.208484	2025-06-08 22:25:22.208484	customer	f	\N	\N
208	Unknown	User	user208@bankim.com	+972000000000	2025-06-08 22:25:22.292435	2025-06-08 22:25:22.292435	customer	f	\N	\N
209	Unknown	User	user209@bankim.com	+972000000000	2025-06-08 22:25:22.376551	2025-06-08 22:25:22.376551	customer	f	\N	\N
210	Unknown	User	user210@bankim.com	+972000000000	2025-06-08 22:25:22.461494	2025-06-08 22:25:22.461494	customer	f	\N	\N
211	Unknown	User	user211@bankim.com	+972000000000	2025-06-08 22:25:22.54653	2025-06-08 22:25:22.54653	customer	f	\N	\N
212	Unknown	User	user212@bankim.com	+972000000000	2025-06-08 22:25:22.630431	2025-06-08 22:25:22.630431	customer	f	\N	\N
213	Unknown	User	user213@bankim.com	+972000000000	2025-06-08 22:25:22.714456	2025-06-08 22:25:22.714456	customer	f	\N	\N
214	Unknown	User	user214@bankim.com	+972000000000	2025-06-08 22:25:22.798593	2025-06-08 22:25:22.798593	customer	f	\N	\N
215	Unknown	User	user215@bankim.com	+972000000000	2025-06-08 22:25:22.882678	2025-06-08 22:25:22.882678	customer	f	\N	\N
216	Unknown	User	user216@bankim.com	+972000000000	2025-06-08 22:25:22.967527	2025-06-08 22:25:22.967527	customer	f	\N	\N
217	Unknown	User	user217@bankim.com	+972000000000	2025-06-08 22:25:23.050483	2025-06-08 22:25:23.050483	customer	f	\N	\N
218	Unknown	User	user218@bankim.com	+972000000000	2025-06-08 22:25:23.135765	2025-06-08 22:25:23.135765	customer	f	\N	\N
219	Unknown	User	user219@bankim.com	+972000000000	2025-06-08 22:25:23.218827	2025-06-08 22:25:23.218827	customer	f	\N	\N
220	Unknown	User	user220@bankim.com	+972000000000	2025-06-08 22:25:23.304458	2025-06-08 22:25:23.304458	customer	f	\N	\N
221	Unknown	User	user221@bankim.com	+972000000000	2025-06-08 22:25:23.387541	2025-06-08 22:25:23.387541	customer	f	\N	\N
222	Unknown	User	user222@bankim.com	+972000000000	2025-06-08 22:25:23.472491	2025-06-08 22:25:23.472491	customer	f	\N	\N
223	Unknown	User	user223@bankim.com	+972000000000	2025-06-08 22:25:23.558214	2025-06-08 22:25:23.558214	customer	f	\N	\N
224	Unknown	User	user224@bankim.com	+972000000000	2025-06-08 22:25:23.643543	2025-06-08 22:25:23.643543	customer	f	\N	\N
225	Unknown	User	user225@bankim.com	+972000000000	2025-06-08 22:25:23.72765	2025-06-08 22:25:23.72765	customer	f	\N	\N
226	Unknown	User	user226@bankim.com	+972000000000	2025-06-08 22:25:23.81237	2025-06-08 22:25:23.81237	customer	f	\N	\N
227	Unknown	User	user227@bankim.com	+972000000000	2025-06-08 22:25:23.895331	2025-06-08 22:25:23.895331	customer	f	\N	\N
228	Unknown	User	user228@bankim.com	+972000000000	2025-06-08 22:25:23.985496	2025-06-08 22:25:23.985496	customer	f	\N	\N
229	Unknown	User	user229@bankim.com	+972000000000	2025-06-08 22:25:24.071553	2025-06-08 22:25:24.071553	customer	f	\N	\N
230	Unknown	User	user230@bankim.com	+972000000000	2025-06-08 22:25:24.154374	2025-06-08 22:25:24.154374	customer	f	\N	\N
231	Unknown	User	user231@bankim.com	+972000000000	2025-06-08 22:25:24.238347	2025-06-08 22:25:24.238347	customer	f	\N	\N
232	Unknown	User	user232@bankim.com	+972000000000	2025-06-08 22:25:24.326595	2025-06-08 22:25:24.326595	customer	f	\N	\N
233	Unknown	User	user233@bankim.com	+972000000000	2025-06-08 22:25:24.410459	2025-06-08 22:25:24.410459	customer	f	\N	\N
234	Unknown	User	user234@bankim.com	+972000000000	2025-06-08 22:25:24.494467	2025-06-08 22:25:24.494467	customer	f	\N	\N
235	Unknown	User	user235@bankim.com	+972000000000	2025-06-08 22:25:24.578786	2025-06-08 22:25:24.578786	customer	f	\N	\N
236	Unknown	User	user236@bankim.com	+972000000000	2025-06-08 22:25:24.663622	2025-06-08 22:25:24.663622	customer	f	\N	\N
237	Unknown	User	user237@bankim.com	+972000000000	2025-06-08 22:25:24.746621	2025-06-08 22:25:24.746621	customer	f	\N	\N
238	Unknown	User	user238@bankim.com	+972000000000	2025-06-08 22:25:24.831469	2025-06-08 22:25:24.831469	customer	f	\N	\N
239	Unknown	User	user239@bankim.com	+972000000000	2025-06-08 22:25:24.917458	2025-06-08 22:25:24.917458	customer	f	\N	\N
240	Unknown	User	user240@bankim.com	+972000000000	2025-06-08 22:25:25.000476	2025-06-08 22:25:25.000476	customer	f	\N	\N
241	Unknown	User	user241@bankim.com	+972000000000	2025-06-08 22:25:25.085574	2025-06-08 22:25:25.085574	customer	f	\N	\N
242	Unknown	User	user242@bankim.com	+972000000000	2025-06-08 22:25:25.168609	2025-06-08 22:25:25.168609	customer	f	\N	\N
243	Unknown	User	user243@bankim.com	+972000000000	2025-06-08 22:25:25.252526	2025-06-08 22:25:25.252526	customer	f	\N	\N
244	Unknown	User	user244@bankim.com	+972000000000	2025-06-08 22:25:25.339631	2025-06-08 22:25:25.339631	customer	f	\N	\N
245	Unknown	User	user245@bankim.com	+972000000000	2025-06-08 22:25:25.427455	2025-06-08 22:25:25.427455	customer	f	\N	\N
246	Unknown	User	user246@bankim.com	+972000000000	2025-06-08 22:25:25.51261	2025-06-08 22:25:25.51261	customer	f	\N	\N
247	Unknown	User	user247@bankim.com	+972000000000	2025-06-08 22:25:25.595924	2025-06-08 22:25:25.595924	customer	f	\N	\N
248	Unknown	User	user248@bankim.com	+972000000000	2025-06-08 22:25:25.681537	2025-06-08 22:25:25.681537	customer	f	\N	\N
249	Unknown	User	user249@bankim.com	+972000000000	2025-06-08 22:25:25.767402	2025-06-08 22:25:25.767402	customer	f	\N	\N
250	Unknown	User	user250@bankim.com	+972000000000	2025-06-08 22:25:25.850449	2025-06-08 22:25:25.850449	customer	f	\N	\N
251	Unknown	User	user251@bankim.com	+972000000000	2025-06-08 22:25:25.934815	2025-06-08 22:25:25.934815	customer	f	\N	\N
252	Unknown	User	user252@bankim.com	+972000000000	2025-06-08 22:25:26.018557	2025-06-08 22:25:26.018557	customer	f	\N	\N
253	Unknown	User	user253@bankim.com	+972000000000	2025-06-08 22:25:26.103633	2025-06-08 22:25:26.103633	customer	f	\N	\N
254	Unknown	User	user254@bankim.com	+972000000000	2025-06-08 22:25:26.186507	2025-06-08 22:25:26.186507	customer	f	\N	\N
255	Unknown	User	user255@bankim.com	+972000000000	2025-06-08 22:25:26.270794	2025-06-08 22:25:26.270794	customer	f	\N	\N
256	Unknown	User	user256@bankim.com	+972000000000	2025-06-08 22:25:26.35452	2025-06-08 22:25:26.35452	customer	f	\N	\N
257	Unknown	User	user257@bankim.com	+972000000000	2025-06-08 22:25:26.439335	2025-06-08 22:25:26.439335	customer	f	\N	\N
258	Unknown	User	user258@bankim.com	+972000000000	2025-06-08 22:25:26.522589	2025-06-08 22:25:26.522589	customer	f	\N	\N
259	Unknown	User	user259@bankim.com	+972000000000	2025-06-08 22:25:26.607535	2025-06-08 22:25:26.607535	customer	f	\N	\N
260	Unknown	User	user260@bankim.com	+972000000000	2025-06-08 22:25:26.690385	2025-06-08 22:25:26.690385	customer	f	\N	\N
261	Unknown	User	user261@bankim.com	+972000000000	2025-06-08 22:25:26.775281	2025-06-08 22:25:26.775281	customer	f	\N	\N
262	Unknown	User	user262@bankim.com	+972000000000	2025-06-08 22:25:26.859523	2025-06-08 22:25:26.859523	customer	f	\N	\N
263	Unknown	User	user263@bankim.com	+972000000000	2025-06-08 22:25:26.943292	2025-06-08 22:25:26.943292	customer	f	\N	\N
264	Unknown	User	user264@bankim.com	+972000000000	2025-06-08 22:25:27.027553	2025-06-08 22:25:27.027553	customer	f	\N	\N
265	Unknown	User	user265@bankim.com	+972000000000	2025-06-08 22:25:27.117442	2025-06-08 22:25:27.117442	customer	f	\N	\N
266	Unknown	User	user266@bankim.com	+972000000000	2025-06-08 22:25:27.202416	2025-06-08 22:25:27.202416	customer	f	\N	\N
267	Unknown	User	user267@bankim.com	+972000000000	2025-06-08 22:25:27.285563	2025-06-08 22:25:27.285563	customer	f	\N	\N
268	Unknown	User	user268@bankim.com	+972000000000	2025-06-08 22:25:27.369384	2025-06-08 22:25:27.369384	customer	f	\N	\N
269	Unknown	User	user269@bankim.com	+972000000000	2025-06-08 22:25:27.453504	2025-06-08 22:25:27.453504	customer	f	\N	\N
270	Unknown	User	user270@bankim.com	+972000000000	2025-06-08 22:25:27.538564	2025-06-08 22:25:27.538564	customer	f	\N	\N
271	Unknown	User	user271@bankim.com	+972000000000	2025-06-08 22:25:27.621448	2025-06-08 22:25:27.621448	customer	f	\N	\N
272	Unknown	User	user272@bankim.com	+972000000000	2025-06-08 22:25:27.705697	2025-06-08 22:25:27.705697	customer	f	\N	\N
273	Unknown	User	user273@bankim.com	+972000000000	2025-06-08 22:25:27.789447	2025-06-08 22:25:27.789447	customer	f	\N	\N
274	Unknown	User	user274@bankim.com	+972000000000	2025-06-08 22:25:27.874515	2025-06-08 22:25:27.874515	customer	f	\N	\N
275	Unknown	User	user275@bankim.com	+972000000000	2025-06-08 22:25:27.958627	2025-06-08 22:25:27.958627	customer	f	\N	\N
276	Unknown	User	user276@bankim.com	+972000000000	2025-06-08 22:25:28.04236	2025-06-08 22:25:28.04236	customer	f	\N	\N
277	Unknown	User	user277@bankim.com	+972000000000	2025-06-08 22:25:28.126531	2025-06-08 22:25:28.126531	customer	f	\N	\N
278	Unknown	User	user278@bankim.com	+972000000000	2025-06-08 22:25:28.210723	2025-06-08 22:25:28.210723	customer	f	\N	\N
279	Unknown	User	user279@bankim.com	+972000000000	2025-06-08 22:25:28.294634	2025-06-08 22:25:28.294634	customer	f	\N	\N
280	Unknown	User	user280@bankim.com	+972000000000	2025-06-08 22:25:28.378913	2025-06-08 22:25:28.378913	customer	f	\N	\N
281	Unknown	User	user281@bankim.com	+972000000000	2025-06-08 22:25:28.463596	2025-06-08 22:25:28.463596	customer	f	\N	\N
282	Unknown	User	user282@bankim.com	+972000000000	2025-06-08 22:25:28.548837	2025-06-08 22:25:28.548837	customer	f	\N	\N
283	Unknown	User	user283@bankim.com	+972000000000	2025-06-08 22:25:28.63259	2025-06-08 22:25:28.63259	customer	f	\N	\N
284	Unknown	User	user284@bankim.com	+972000000000	2025-06-08 22:25:28.717453	2025-06-08 22:25:28.717453	customer	f	\N	\N
285	Unknown	User	user285@bankim.com	+972000000000	2025-06-08 22:25:28.800533	2025-06-08 22:25:28.800533	customer	f	\N	\N
286	Unknown	User	user286@bankim.com	+972000000000	2025-06-08 22:25:28.884555	2025-06-08 22:25:28.884555	customer	f	\N	\N
287	Unknown	User	user287@bankim.com	+972000000000	2025-06-08 22:25:28.968524	2025-06-08 22:25:28.968524	customer	f	\N	\N
288	Unknown	User	user288@bankim.com	+972000000000	2025-06-08 22:25:29.051684	2025-06-08 22:25:29.051684	customer	f	\N	\N
289	Unknown	User	user289@bankim.com	+972000000000	2025-06-08 22:25:29.137453	2025-06-08 22:25:29.137453	customer	f	\N	\N
290	Unknown	User	user290@bankim.com	+972000000000	2025-06-08 22:25:29.221364	2025-06-08 22:25:29.221364	customer	f	\N	\N
291	Unknown	User	user291@bankim.com	+972000000000	2025-06-08 22:25:29.306495	2025-06-08 22:25:29.306495	customer	f	\N	\N
292	Unknown	User	user292@bankim.com	+972000000000	2025-06-08 22:25:29.389459	2025-06-08 22:25:29.389459	customer	f	\N	\N
293	Unknown	User	user293@bankim.com	+972000000000	2025-06-08 22:25:29.478648	2025-06-08 22:25:29.478648	customer	f	\N	\N
294	Unknown	User	user294@bankim.com	+972000000000	2025-06-08 22:25:29.563549	2025-06-08 22:25:29.563549	customer	f	\N	\N
295	Unknown	User	user295@bankim.com	+972000000000	2025-06-08 22:25:29.649654	2025-06-08 22:25:29.649654	customer	f	\N	\N
296	Unknown	User	user296@bankim.com	+972000000000	2025-06-08 22:25:29.731394	2025-06-08 22:25:29.731394	customer	f	\N	\N
297	Unknown	User	user297@bankim.com	+972000000000	2025-06-08 22:25:29.81451	2025-06-08 22:25:29.81451	customer	f	\N	\N
298	Unknown	User	user298@bankim.com	+972000000000	2025-06-08 22:25:29.898476	2025-06-08 22:25:29.898476	customer	f	\N	\N
299	Unknown	User	user299@bankim.com	+972000000000	2025-06-08 22:25:29.982375	2025-06-08 22:25:29.982375	customer	f	\N	\N
300	Unknown	User	user300@bankim.com	+972000000000	2025-06-08 22:25:30.066451	2025-06-08 22:25:30.066451	customer	f	\N	\N
301	Unknown	User	user301@bankim.com	+972000000000	2025-06-08 22:25:30.152486	2025-06-08 22:25:30.152486	customer	f	\N	\N
302	Unknown	User	user302@bankim.com	+972000000000	2025-06-08 22:25:30.236563	2025-06-08 22:25:30.236563	customer	f	\N	\N
303	Unknown	User	user303@bankim.com	+972000000000	2025-06-08 22:25:30.320619	2025-06-08 22:25:30.320619	customer	f	\N	\N
304	Unknown	User	user304@bankim.com	+972000000000	2025-06-08 22:25:30.404714	2025-06-08 22:25:30.404714	customer	f	\N	\N
305	Unknown	User	user305@bankim.com	+972000000000	2025-06-08 22:25:30.490586	2025-06-08 22:25:30.490586	customer	f	\N	\N
306	Unknown	User	user306@bankim.com	+972000000000	2025-06-08 22:25:30.580502	2025-06-08 22:25:30.580502	customer	f	\N	\N
307	Unknown	User	user307@bankim.com	+972000000000	2025-06-08 22:25:30.67171	2025-06-08 22:25:30.67171	customer	f	\N	\N
308	Unknown	User	user308@bankim.com	+972000000000	2025-06-08 22:25:30.75556	2025-06-08 22:25:30.75556	customer	f	\N	\N
309	Unknown	User	user309@bankim.com	+972000000000	2025-06-08 22:25:30.840487	2025-06-08 22:25:30.840487	customer	f	\N	\N
310	Unknown	User	user310@bankim.com	+972000000000	2025-06-08 22:25:30.92571	2025-06-08 22:25:30.92571	customer	f	\N	\N
311	Unknown	User	user311@bankim.com	+972000000000	2025-06-08 22:25:31.009518	2025-06-08 22:25:31.009518	customer	f	\N	\N
312	Unknown	User	user312@bankim.com	+972000000000	2025-06-08 22:25:31.093632	2025-06-08 22:25:31.093632	customer	f	\N	\N
313	Unknown	User	user313@bankim.com	+972000000000	2025-06-08 22:25:31.178484	2025-06-08 22:25:31.178484	customer	f	\N	\N
314	Unknown	User	user314@bankim.com	+972000000000	2025-06-08 22:25:31.262358	2025-06-08 22:25:31.262358	customer	f	\N	\N
315	Unknown	User	user315@bankim.com	+972000000000	2025-06-08 22:25:31.345447	2025-06-08 22:25:31.345447	customer	f	\N	\N
316	Unknown	User	user316@bankim.com	+972000000000	2025-06-08 22:25:31.429607	2025-06-08 22:25:31.429607	customer	f	\N	\N
317	Unknown	User	user317@bankim.com	+972000000000	2025-06-08 22:25:31.514555	2025-06-08 22:25:31.514555	customer	f	\N	\N
318	Unknown	User	user318@bankim.com	+972000000000	2025-06-08 22:25:31.602488	2025-06-08 22:25:31.602488	customer	f	\N	\N
319	Unknown	User	user319@bankim.com	+972000000000	2025-06-08 22:25:31.69256	2025-06-08 22:25:31.69256	customer	f	\N	\N
320	Unknown	User	user320@bankim.com	+972000000000	2025-06-08 22:25:31.776309	2025-06-08 22:25:31.776309	customer	f	\N	\N
321	Unknown	User	user321@bankim.com	+972000000000	2025-06-08 22:25:31.864595	2025-06-08 22:25:31.864595	customer	f	\N	\N
322	Unknown	User	user322@bankim.com	+972000000000	2025-06-08 22:25:31.948782	2025-06-08 22:25:31.948782	customer	f	\N	\N
323	Unknown	User	user323@bankim.com	+972000000000	2025-06-08 22:25:32.032389	2025-06-08 22:25:32.032389	customer	f	\N	\N
324	Unknown	User	user324@bankim.com	+972000000000	2025-06-08 22:25:32.117411	2025-06-08 22:25:32.117411	customer	f	\N	\N
325	Unknown	User	user325@bankim.com	+972000000000	2025-06-08 22:25:32.201518	2025-06-08 22:25:32.201518	customer	f	\N	\N
326	Unknown	User	user326@bankim.com	+972000000000	2025-06-08 22:25:32.285588	2025-06-08 22:25:32.285588	customer	f	\N	\N
327	Unknown	User	user327@bankim.com	+972000000000	2025-06-08 22:25:32.369609	2025-06-08 22:25:32.369609	customer	f	\N	\N
328	Unknown	User	user328@bankim.com	+972000000000	2025-06-08 22:25:32.455505	2025-06-08 22:25:32.455505	customer	f	\N	\N
329	Unknown	User	user329@bankim.com	+972000000000	2025-06-08 22:25:32.55952	2025-06-08 22:25:32.55952	customer	f	\N	\N
330	Unknown	User	user330@bankim.com	+972000000000	2025-06-08 22:25:32.643765	2025-06-08 22:25:32.643765	customer	f	\N	\N
331	Unknown	User	user331@bankim.com	+972000000000	2025-06-08 22:25:32.727659	2025-06-08 22:25:32.727659	customer	f	\N	\N
332	Unknown	User	user332@bankim.com	+972000000000	2025-06-08 22:25:32.811698	2025-06-08 22:25:32.811698	customer	f	\N	\N
333	Unknown	User	user333@bankim.com	+972000000000	2025-06-08 22:25:32.896528	2025-06-08 22:25:32.896528	customer	f	\N	\N
334	Unknown	User	user334@bankim.com	+972000000000	2025-06-08 22:25:32.979357	2025-06-08 22:25:32.979357	customer	f	\N	\N
335	Unknown	User	user335@bankim.com	+972000000000	2025-06-08 22:25:33.064536	2025-06-08 22:25:33.064536	customer	f	\N	\N
336	Unknown	User	user336@bankim.com	+972000000000	2025-06-08 22:25:33.151885	2025-06-08 22:25:33.151885	customer	f	\N	\N
337	Unknown	User	user337@bankim.com	+972000000000	2025-06-08 22:25:33.237496	2025-06-08 22:25:33.237496	customer	f	\N	\N
338	Unknown	User	user338@bankim.com	+972000000000	2025-06-08 22:25:33.321529	2025-06-08 22:25:33.321529	customer	f	\N	\N
339	Unknown	User	user339@bankim.com	+972000000000	2025-06-08 22:25:33.405575	2025-06-08 22:25:33.405575	customer	f	\N	\N
340	Unknown	User	user340@bankim.com	+972000000000	2025-06-08 22:25:33.488368	2025-06-08 22:25:33.488368	customer	f	\N	\N
341	Unknown	User	user341@bankim.com	+972000000000	2025-06-08 22:25:33.57256	2025-06-08 22:25:33.57256	customer	f	\N	\N
342	Unknown	User	user342@bankim.com	+972000000000	2025-06-08 22:25:33.656487	2025-06-08 22:25:33.656487	customer	f	\N	\N
343	Unknown	User	user343@bankim.com	+972000000000	2025-06-08 22:25:33.740302	2025-06-08 22:25:33.740302	customer	f	\N	\N
344	Unknown	User	user344@bankim.com	+972000000000	2025-06-08 22:25:33.824512	2025-06-08 22:25:33.824512	customer	f	\N	\N
345	Unknown	User	user345@bankim.com	+972000000000	2025-06-08 22:25:33.90871	2025-06-08 22:25:33.90871	customer	f	\N	\N
346	Unknown	User	user346@bankim.com	+972000000000	2025-06-08 22:25:34.0038	2025-06-08 22:25:34.0038	customer	f	\N	\N
347	Unknown	User	user347@bankim.com	+972000000000	2025-06-08 22:25:34.089545	2025-06-08 22:25:34.089545	customer	f	\N	\N
348	Unknown	User	user348@bankim.com	+972000000000	2025-06-08 22:25:34.17248	2025-06-08 22:25:34.17248	customer	f	\N	\N
349	Unknown	User	user349@bankim.com	+972000000000	2025-06-08 22:25:34.256831	2025-06-08 22:25:34.256831	customer	f	\N	\N
350	Unknown	User	user350@bankim.com	+972000000000	2025-06-08 22:25:34.341469	2025-06-08 22:25:34.341469	customer	f	\N	\N
351	Unknown	User	user351@bankim.com	+972000000000	2025-06-08 22:25:34.436484	2025-06-08 22:25:34.436484	customer	f	\N	\N
352	Unknown	User	user352@bankim.com	+972000000000	2025-06-08 22:25:34.530444	2025-06-08 22:25:34.530444	customer	f	\N	\N
353	Unknown	User	user353@bankim.com	+972000000000	2025-06-08 22:25:34.624387	2025-06-08 22:25:34.624387	customer	f	\N	\N
354	Unknown	User	user354@bankim.com	+972000000000	2025-06-08 22:25:34.709393	2025-06-08 22:25:34.709393	customer	f	\N	\N
355	Unknown	User	user355@bankim.com	+972000000000	2025-06-08 22:25:34.795614	2025-06-08 22:25:34.795614	customer	f	\N	\N
420	New	Client	972655765567@bankim.com	+972655765567	2025-07-29 22:29:20.373881	2025-07-29 22:29:20.373881	customer	f	\N	\N
426	New	Client	972766567765@bankim.com	+972766567765	2025-07-30 13:39:14.03069	2025-07-30 13:39:14.03069	customer	f	\N	\N
432	New	Client	972544654422@bankim.com	+972544654422	2025-08-03 06:36:48.46659	2025-08-03 06:36:48.46659	customer	f	\N	\N
438	New	Client	972765567687@bankim.com	+972765567687	2025-08-11 12:28:51.807029	2025-08-11 12:28:51.807029	customer	f	\N	\N
444	New	Client	972765567765@bankim.com	+972765567765	2025-08-12 07:26:56.595283	2025-08-12 07:26:56.595283	customer	f	\N	\N
447	New	Client	972987789987@bankim.com	+972987789987	2025-08-12 12:46:15.431584	2025-08-12 12:46:15.431584	customer	f	\N	\N
450	New	Client	972098098098@bankim.com	+972098098098	2025-08-13 06:49:28.369943	2025-08-13 06:49:28.369943	customer	f	\N	\N
453	New	Client	972765765765@bankim.com	+972765765765	2025-08-13 08:21:18.895039	2025-08-13 08:21:18.895039	customer	f	\N	\N
471	New	Client	972876786876@bankim.com	+972876786876	2025-08-13 11:50:56.037863	2025-08-13 11:50:56.037863	customer	f	\N	\N
\.


--
-- Data for Name: content_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_items (id, content_key, screen_location, component_type, category, status, created_at, updated_at, app_context_id, is_active, page_number) FROM stdin;
777	calculate_mortgage_add_partner	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
778	calculate_mortgage_add_partner_title	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
779	calculate_mortgage_birth_date	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
780	calculate_mortgage_citizenship_title	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
781	calculate_mortgage_citizenship_option_5	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
782	calculate_mortgage_citizenship_option_6	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
783	calculate_mortgage_citizenship_option_7	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
784	calculate_mortgage_citizenship_option_8	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
785	calculate_mortgage_ctx	refinance_credit_2	label	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
786	calculate_mortgage_citizenship_option_9	refinance_credit_2	text	personal_details	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
787	calculate_mortgage_education	refinance_credit_2	label	form	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
788	calculate_mortgage_education_ph	refinance_credit_2	placeholder	form	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
796	calculate_mortgage_borrowers	refinance_credit_2	label	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
797	calculate_mortgage_borrowers_ph	refinance_credit_2	placeholder	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
798	calculate_mortgage_borrowers_option_1	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
799	calculate_mortgage_borrowers_option_2	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
800	calculate_mortgage_borrowers_option_3	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
801	calculate_mortgage_borrowers_option_4	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
802	calculate_mortgage_borrowers_option_5	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
803	calculate_mortgage_children18	refinance_credit_2	label	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
804	calculate_mortgage_children18_ph	refinance_credit_2	placeholder	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
805	calculate_mortgage_children18_option_1	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
806	calculate_mortgage_children18_option_2	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
807	calculate_mortgage_children18_option_3	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
808	calculate_mortgage_children18_option_4	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
809	calculate_mortgage_children18_option_5	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
810	calculate_mortgage_citizenship	refinance_credit_2	label	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
811	calculate_mortgage_citizenship_ph	refinance_credit_2	placeholder	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
812	calculate_mortgage_citizenship_option_1	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
813	calculate_mortgage_citizenship_option_2	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
814	calculate_mortgage_citizenship_option_3	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
815	calculate_mortgage_citizenship_option_4	refinance_credit_2	option	mortgage	active	2025-07-29 05:28:53.782065	2025-07-29 05:28:53.782065	1	t	\N
898	refinance_credit_final	refinance_credit_step4	text	title	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
899	refinance_credit_warning	refinance_credit_step4	text	warning	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
900	refinance_credit_parameters	refinance_credit_step4	text	section_title	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
901	refinance_credit_profile_title	refinance_credit_step4	text	section_title	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
902	refinance_credit_filter_title	refinance_credit_step4	text	section_title	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
903	refinance_credit_parameters_amount	refinance_credit_step4	text	label	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
904	refinance_credit_parameters_period	refinance_credit_step4	text	label	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
905	refinance_credit_parameters_months	refinance_credit_step4	text	label	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
906	refinance_credit_filter_1	refinance_credit_step4	text	filter_option	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
907	refinance_credit_filter_2	refinance_credit_step4	text	filter_option	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
908	refinance_credit_filter_3	refinance_credit_step4	text	filter_option	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
909	refinance_credit_filter_4	refinance_credit_step4	text	filter_option	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
910	refinance_credit_total	refinance_credit_step4	text	label	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
911	refinance_credit_total_return	refinance_credit_step4	text	label	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
912	refinance_credit_monthly	refinance_credit_step4	text	label	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
913	refinance_credit_select_bank	refinance_credit_step4	button	action	active	2025-08-02 20:24:55.301618	2025-08-02 20:24:55.301618	1	t	\N
816	refinance_credit_title	refinance_credit_1	title	page_header	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
817	refinance_credit_banner_subtext	refinance_credit_1	text	page_header	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
818	refinance_credit_goal_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
819	refinance_credit_goal_ph	refinance_credit_1	placeholder	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
820	refinance_credit_goal_option_1	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
821	refinance_credit_goal_option_2	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
822	refinance_credit_goal_option_3	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
823	refinance_credit_goal_option_4	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
824	refinance_credit_list_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
825	refinance_credit_bank_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
826	refinance_credit_bank_option_1	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
827	refinance_credit_bank_option_2	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
828	refinance_credit_bank_option_3	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
829	refinance_credit_bank_option_4	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
830	refinance_credit_bank_option_5	refinance_credit_1	option	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
831	refinance_credit_amount_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
832	refinance_credit_monthly_payment_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
833	refinance_credit_start_date_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
834	refinance_credit_end_date_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
835	refinance_credit_early_repayment_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
836	refinance_credit_add_button	refinance_credit_1	button	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
837	refinance_credit_desired_payment_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
838	refinance_credit_period_title	refinance_credit_1	field_label	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
839	refinance_credit_period_units_max	refinance_credit_1	text	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
840	refinance_credit_period_units_min	refinance_credit_1	text	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
841	refinance_credit_date_ph	refinance_credit_1	placeholder	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
842	refinance_credit_bank_ph	refinance_credit_1	placeholder	form_fields	active	2025-07-29 05:35:00.491537	2025-07-29 05:35:00.491537	1	t	\N
789	calculate_mortgage_education_option_1	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
790	calculate_mortgage_education_option_2	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
791	calculate_mortgage_education_option_3	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
792	calculate_mortgage_education_option_4	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
793	calculate_mortgage_education_option_5	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
794	calculate_mortgage_education_option_6	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
795	calculate_mortgage_education_option_7	refinance_credit_2	option	form	active	2025-07-29 05:28:53.782065	2025-08-02 20:26:51.157636	1	t	\N
28	calculate_mortgage_property_ownership_option_2	mortgage_step1	option	mortgage	approved	2025-07-24 13:59:41.473168	2025-08-02 20:26:51.157636	1	t	1
29	calculate_mortgage_property_ownership_option_3	mortgage_step1	option	mortgage	approved	2025-07-24 13:59:42.093224	2025-08-02 20:26:51.157636	1	t	1
43	calculate_mortgage_sphere_option_1	mortgage_step3	option	mortgage	approved	2025-07-24 13:59:50.321119	2025-08-02 20:26:51.157636	1	t	3
44	calculate_mortgage_sphere_option_2	mortgage_step3	option	mortgage	approved	2025-07-24 13:59:50.911223	2025-08-02 20:26:51.157636	1	t	3
45	calculate_mortgage_sphere_option_3	mortgage_step3	option	mortgage	approved	2025-07-24 13:59:55.961276	2025-08-02 20:26:51.157636	1	t	3
59	calculate_mortgage_education_option_1	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
60	calculate_mortgage_education_option_2	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
61	calculate_mortgage_education_option_3	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
62	calculate_mortgage_education_option_4	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
63	calculate_mortgage_education_option_5	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
64	calculate_mortgage_education_option_6	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
65	calculate_mortgage_education_option_7	mortgage_step2	option	form	approved	2025-07-24 14:32:18.140158	2025-08-02 20:26:51.157636	1	t	2
843	refinance_credit_step_2	refinance_credit_2	title	navigation	active	2025-07-29 05:44:25.888321	2025-07-29 05:44:25.888321	1	t	\N
915	calculate_mortgage_main_source_ph	calculate_credit_3	placeholder	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
916	calculate_mortgage_main_source_option_1	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
917	calculate_mortgage_main_source_option_2	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
918	calculate_mortgage_main_source_option_3	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
919	calculate_mortgage_main_source_option_4	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
920	calculate_mortgage_main_source_option_5	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
921	calculate_mortgage_main_source_option_6	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
922	calculate_mortgage_main_source_option_7	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
924	calculate_mortgage_has_additional_ph	calculate_credit_3	placeholder	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
925	calculate_mortgage_has_additional_option_1	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
926	calculate_mortgage_has_additional_option_2	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
927	calculate_mortgage_has_additional_option_3	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
928	calculate_mortgage_has_additional_option_4	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
929	calculate_mortgage_has_additional_option_5	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
930	calculate_mortgage_has_additional_option_6	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
931	calculate_mortgage_has_additional_option_7	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
933	calculate_mortgage_debt_types_ph	calculate_credit_3	placeholder	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
934	calculate_mortgage_debt_types_option_1	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
935	calculate_mortgage_debt_types_option_2	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
936	calculate_mortgage_debt_types_option_3	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
937	calculate_mortgage_debt_types_option_4	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
938	calculate_mortgage_debt_types_option_5	calculate_credit_3	option	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634	1	t	\N
914	calculate_mortgage_main_source	calculate_credit_3	label	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:15:18.000583	1	t	\N
923	calculate_mortgage_has_additional	calculate_credit_3	label	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:15:18.000583	1	t	\N
932	calculate_mortgage_debt_types	calculate_credit_3	label	income_details	active	2025-08-03 14:12:12.172634	2025-08-03 14:15:18.000583	1	t	\N
418	mortgage_select_bank	mortgage_step4	button	actions	approved	2025-07-27 05:37:15.99225	2025-07-29 09:47:45.134966	1	t	4
844	app.refinance.step1.why_option_1	refinance_step1	option	refinance_reason	active	2025-07-29 11:04:01.441182	2025-07-29 11:04:01.441182	1	t	\N
845	app.refinance.step1.why_option_2	refinance_step1	option	refinance_reason	active	2025-07-29 11:04:01.441182	2025-07-29 11:04:01.441182	1	t	\N
846	app.refinance.step1.why_option_3	refinance_step1	option	refinance_reason	active	2025-07-29 11:04:01.441182	2025-07-29 11:04:01.441182	1	t	\N
847	app.refinance.step1.why_option_4	refinance_step1	option	refinance_reason	active	2025-07-29 11:04:01.441182	2025-07-29 11:04:01.441182	1	t	\N
848	app.refinance.step1.why_option_5	refinance_step1	option	refinance_reason	active	2025-07-29 11:04:01.441182	2025-07-29 11:04:01.441182	1	t	\N
849	app.refinance.step1.registered_option_1	refinance_step1	option	registration_status	active	2025-07-29 11:04:01.671047	2025-07-29 11:04:01.671047	1	t	\N
850	app.refinance.step1.registered_option_2	refinance_step1	option	registration_status	active	2025-07-29 11:04:01.671047	2025-07-29 11:04:01.671047	1	t	\N
851	app.refinance.step1.bank_hapoalim	refinance_step1	option	bank	active	2025-07-29 11:04:01.940346	2025-07-29 11:04:01.940346	1	t	\N
852	app.refinance.step1.bank_leumi	refinance_step1	option	bank	active	2025-07-29 11:04:01.940346	2025-07-29 11:04:01.940346	1	t	\N
853	app.refinance.step1.bank_discount	refinance_step1	option	bank	active	2025-07-29 11:04:01.940346	2025-07-29 11:04:01.940346	1	t	\N
854	app.refinance.step1.bank_massad	refinance_step1	option	bank	active	2025-07-29 11:04:01.940346	2025-07-29 11:04:01.940346	1	t	\N
855	app.refinance.step1.title	refinance_step1	title	form_header	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
856	app.refinance.step1.why_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
857	app.refinance.step1.balance_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
858	app.refinance.step1.property_value_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
859	app.refinance.step1.property_type_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
860	app.refinance.step1.current_bank_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
861	app.refinance.step1.registered_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
862	app.refinance.step1.start_date_label	refinance_step1	label	form_field	active	2025-07-29 11:04:02.192083	2025-07-29 11:04:02.192083	1	t	\N
950	mortgage_step1.field.when_3_to_6_months	mortgage_step1	dropdown_option	mortgage	active	2025-08-04 15:38:51.108649	2025-08-04 15:38:51.108649	1	t	\N
951	mortgage_step1.field.when_6_to_12_months	mortgage_step1	dropdown_option	mortgage	active	2025-08-04 15:38:51.108649	2025-08-04 15:38:51.108649	1	t	\N
952	mortgage_step1.field.when_more_than_12_months	mortgage_step1	dropdown_option	mortgage	active	2025-08-04 15:38:51.108649	2025-08-04 15:38:51.108649	1	t	\N
863	mortgage_refinance_bank_hapoalim	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
864	mortgage_refinance_bank_leumi	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
865	mortgage_refinance_bank_discount	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
866	mortgage_refinance_bank_massad	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
867	mortgage_refinance_bank_israel	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
868	mortgage_refinance_bank_mercantile	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
869	mortgage_refinance_bank_mizrahi	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
870	mortgage_refinance_bank_union	refinance_step1	option	bank_options	active	2025-07-29 11:07:32.185435	2025-07-29 11:07:32.185435	1	t	\N
871	mortgage_refinance_type_apartment	refinance_step1	option	property_type	active	2025-07-29 11:07:32.367069	2025-07-29 11:07:32.367069	1	t	\N
872	mortgage_refinance_type_house	refinance_step1	option	property_type	active	2025-07-29 11:07:32.367069	2025-07-29 11:07:32.367069	1	t	\N
873	mortgage_refinance_type_commercial	refinance_step1	option	property_type	active	2025-07-29 11:07:32.367069	2025-07-29 11:07:32.367069	1	t	\N
874	mortgage_refinance_type_land	refinance_step1	option	property_type	active	2025-07-29 11:07:32.367069	2025-07-29 11:07:32.367069	1	t	\N
875	mortgage_refinance_type_other	refinance_step1	option	property_type	active	2025-07-29 11:07:32.367069	2025-07-29 11:07:32.367069	1	t	\N
50	obligation 2	mortgage_step3	modal_title	mortgage	approved	2025-07-24 13:59:59.123306	2025-07-28 08:31:24.341358	1	t	3
876	mortgage_refinance_bank_option_1	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
877	mortgage_refinance_bank_option_2	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
878	mortgage_refinance_bank_option_3	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
879	mortgage_refinance_bank_option_4	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
880	mortgage_refinance_bank_option_5	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
881	mortgage_refinance_bank_option_6	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
882	mortgage_refinance_bank_option_7	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
883	mortgage_refinance_bank_option_8	refinance_mortgage_1	option	bank_options	active	2025-07-29 11:12:34.38764	2025-07-29 11:12:34.38764	1	t	\N
884	mortgage_refinance_type_option_1	refinance_mortgage_1	option	property_type	active	2025-07-29 11:12:34.566202	2025-07-29 11:12:34.566202	1	t	\N
885	mortgage_refinance_type_option_2	refinance_mortgage_1	option	property_type	active	2025-07-29 11:12:34.566202	2025-07-29 11:12:34.566202	1	t	\N
886	mortgage_refinance_type_option_3	refinance_mortgage_1	option	property_type	active	2025-07-29 11:12:34.566202	2025-07-29 11:12:34.566202	1	t	\N
887	mortgage_refinance_type_option_4	refinance_mortgage_1	option	property_type	active	2025-07-29 11:12:34.566202	2025-07-29 11:12:34.566202	1	t	\N
888	mortgage_refinance_type_option_5	refinance_mortgage_1	option	property_type	active	2025-07-29 11:12:34.566202	2025-07-29 11:12:34.566202	1	t	\N
889	mortgage_refinance_registered_option_1	refinance_mortgage_1	option	registration_status	active	2025-07-29 11:12:34.724462	2025-07-29 11:12:34.724462	1	t	\N
890	mortgage_refinance_registered_option_2	refinance_mortgage_1	option	registration_status	active	2025-07-29 11:12:34.724462	2025-07-29 11:12:34.724462	1	t	\N
7	sidebar_company_5	sidebar	text	general	approved	2025-07-21 10:23:42.608547	2025-07-29 22:05:44.073265	1	t	401
246	calculate_credit_info_calculation_basis	credit_step4	text	information	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
247	calculate_credit_info_rates_subject_change	credit_step4	text	information	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
763	mortgage_refinance_type	refinance_mortgage_1	dropdown	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-29 11:16:59.881129	1	t	\N
757	mortgage_refinance_registered	refinance_mortgage_1	dropdown	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-29 11:16:59.964096	1	t	\N
746	mortgage_refinance_bank	refinance_mortgage_1	dropdown	bank_selection	approved	2025-07-27 13:18:36.407643	2025-07-29 11:17:04.081606	1	t	\N
893	main_page_title	main_page	text	page_header	active	2025-07-30 23:17:44.156169	2025-07-30 23:17:44.156169	1	t	\N
894	main_page_description	main_page	text	page_content	active	2025-07-30 23:17:45.976171	2025-07-30 23:17:45.976171	1	t	\N
895	main_page_welcome	main_page	text	page_content	active	2025-07-30 23:17:46.546255	2025-07-30 23:17:46.546255	1	t	\N
896	main_page_mortgage_button	main_page	button	navigation	active	2025-07-30 23:17:46.948883	2025-07-30 23:17:46.948883	1	t	\N
897	main_page_credit_button	main_page	button	navigation	active	2025-07-30 23:17:47.315902	2025-07-30 23:17:47.315902	1	t	\N
741	calculate_mortgage_when_options_3	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
742	calculate_mortgage_when_options_4	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
743	calculate_mortgage_when_options_Time	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
744	calculate_mortgage_when_options_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
745	mortgage_refinance	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
751	mortgage_refinance_bank_ph	refinance_mortgage_1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
752	mortgage_refinance_decrease	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
753	mortgage_refinance_left	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
754	mortgage_refinance_price	refinance_mortgage_1	text	calculator_params	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
755	mortgage_refinance_reg_option_1	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
756	mortgage_refinance_reg_option_2	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
758	mortgage_refinance_registered_ph	refinance_mortgage_1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
759	mortgage_refinance_step_1	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
760	mortgage_refinance_step_2	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
761	mortgage_refinance_step_3	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
762	mortgage_refinance_step_4	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
628	sidebar_about_us	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-31 19:35:58.373504	1	t	\N
422	calculate_credit_amount	credit_step1	field_label	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
112	calculate_credit_education_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
423	calculate_credit_amount_ph	credit_step1	placeholder	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
424	calculate_credit_target	credit_step1	field_label	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
425	calculate_credit_target_ph	credit_step1	placeholder	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
426	calculate_credit_target_option_1	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
427	calculate_credit_target_option_2	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
428	calculate_credit_target_option_3	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
429	calculate_credit_target_option_4	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
430	calculate_credit_target_option_5	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
431	calculate_credit_target_option_6	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
432	calculate_credit_prolong	credit_step1	field_label	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
433	calculate_credit_prolong_ph	credit_step1	placeholder	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
434	calculate_credit_prolong_option_1	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
435	calculate_credit_prolong_option_2	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
436	calculate_credit_prolong_option_3	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
437	calculate_credit_prolong_option_4	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
438	calculate_credit_prolong_option_5	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
439	calculate_credit_prolong_option_6	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
440	calculate_credit_prolong_option_7	credit_step1	option	loan_parameters	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
441	calculate_credit_banner_title	credit_step1	title	navigation	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
442	calculate_credit_banner_subtitle	credit_step1	subtitle	navigation	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
443	calculate_credit_progress_step_1	credit_step1	text	navigation	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
444	calculate_credit_progress_step_2	credit_step1	text	navigation	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
445	calculate_credit_progress_step_3	credit_step1	text	navigation	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
446	calculate_credit_progress_step_4	credit_step1	text	navigation	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
447	calculate_credit_final	credit_step4	title	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
448	calculate_credit_warning	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
449	calculate_credit_parameters	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
450	calculate_credit_parameters_amount	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
451	calculate_credit_parameters_period	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
452	calculate_credit_parameters_months	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
453	calculate_credit_total_interest	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
454	calculate_credit_total_payment	credit_step4	text	results	approved	2025-07-27 12:12:59.578698	2025-07-28 08:31:24.341358	1	t	\N
541	footer_copyright	footer	copyright	footer_legal	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
542	footer_email	footer	contact_info	footer_contact	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
543	footer_legal	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
544	footer_legal_1	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
545	footer_legal_2	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
546	footer_legal_3	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
547	footer_legal_4	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
548	footer_navigation	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
549	footer_partner	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
550	footer_phone	footer	contact_info	footer_contact	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
551	footer_privacy_policy	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
552	footer_return_policy	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
553	footer_social_follow	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
554	footer_support	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
555	footer_tenders_brokers	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
556	footer_tenders_lawyers	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
557	footer_user_agreement	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
558	footer_vacancies	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
559	footer_vacancy	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
560	footer_writeus	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
648	calculate_mortgage	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
649	calculate_mortgage_add_partner	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
650	calculate_mortgage_add_partner_title	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
651	calculate_mortgage_anketa	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
652	calculate_mortgage_banner_subtext	mortgage_step1	title	ui_titles	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
653	calculate_mortgage_birth_date	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
654	calculate_mortgage_calculator	mortgage_step1	text	calculator_params	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
364	mortgage_mobile_step_1	mortgage_step1	text	progress	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
365	mortgage_mobile_step_2	mortgage_step1	text	progress	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
366	mortgage_mobile_step_3	mortgage_step1	text	progress	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
367	mortgage_mobile_step_4	mortgage_step1	text	progress	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
368	mortgage_video_title	mortgage_step1	title	header	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
370	mortgage_price_of_estate	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
371	mortgage_city_where_you_buy	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
372	mortgage_when_do_you_need_money	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
373	mortgage_initial_fee	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
374	mortgage_property_type	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
375	mortgage_will_be_your_first	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
376	mortgage_property_ownership	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
377	mortgage_property_type_option_1	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
378	mortgage_property_type_option_2	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
379	mortgage_property_type_option_3	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
380	mortgage_first_property_option_1	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
381	mortgage_first_property_option_2	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
382	mortgage_ownership_option_1	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
383	mortgage_ownership_option_2	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
384	mortgage_ownership_option_3	mortgage_step1	option	dropdown	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
385	mortgage_desired_period	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
386	mortgage_monthly_payment	mortgage_step1	field_label	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
387	mortgage_period_years	mortgage_step1	text	form_field	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.341358	1	t	1
455	calculate_credit	credit_step1	text	navigation	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
456	calculate_credit_filter_1	credit_step4	option	filters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
457	calculate_credit_filter_2	credit_step4	option	filters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
458	calculate_credit_filter_3	credit_step4	option	filters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
459	calculate_credit_filter_4	credit_step4	option	filters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
460	calculate_credit_parameters_cost	credit_step4	text	results	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
461	calculate_credit_profile_title	credit_step4	title	results	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
462	calculate_credit_why_option_1	credit_step1	option	loan_parameters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
463	calculate_credit_why_option_2	credit_step1	option	loan_parameters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
464	calculate_credit_why_option_3	credit_step1	option	loan_parameters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
465	calculate_credit_why_option_4	credit_step1	option	loan_parameters	approved	2025-07-27 12:14:33.599819	2025-07-28 08:31:24.341358	1	t	\N
561	error_balance	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
562	error_children_count_required	global_personal_info	error	personal_validation	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
563	error_children_required	global_personal_info	error	personal_validation	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
564	error_citizenship_countries_required	global_personal_info	error	personal_validation	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
565	error_citizenship_required	global_personal_info	error	personal_validation	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
566	error_city_required	global_contact_info	error	contact_validation	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
567	error_credit_amount_maximum	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
568	error_credit_amount_minimum	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
569	error_credit_amount_positive	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
570	error_credit_amount_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
571	error_credit_bank_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
572	error_credit_data_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
573	error_credit_early_payment_positive	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
574	error_credit_early_payment_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
575	error_credit_end_date_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
576	error_credit_end_date_validation	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
577	error_credit_payment_positive	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
578	error_credit_payment_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
579	error_credit_prolong_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
580	error_credit_start_date_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
581	error_credit_target_required	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
582	error_education_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
583	error_family_status_required	global_personal_info	error	personal_validation	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
466	credit_refinance	refinance_credit_1	text	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
467	credit_refinance_title	refinance_credit_1	title	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
468	credit_refinance_banner_subtext	refinance_credit_1	subtitle	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
469	credit_refinance_step_1	refinance_credit_1	text	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
470	credit_refinance_step_2	refinance_credit_2	text	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
471	credit_refinance_step_3	refinance_credit_3	text	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
472	credit_refinance_step_4	refinance_credit_4	text	navigation	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
473	credit_refinance_why_ph	refinance_credit_1	placeholder	loan_parameters	approved	2025-07-27 12:35:52.621758	2025-07-28 08:31:24.341358	1	t	\N
584	error_fill_field	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
585	error_first_home_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
586	error_foreigner_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
587	error_initial_fee	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
588	error_initial_payment_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
589	error_loading_vacancies	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
590	error_loan_of_amount_credit_max_200000	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
591	error_max_credit_period	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
592	error_max_period	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
593	error_max_price	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
594	error_medical_insurance_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
595	error_min__credit_period	credit_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
596	error_min_monthly_payment	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
597	error_min_period	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
598	error_monthly_payment_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
599	error_mortgage_balance_positive	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
600	error_mortgage_balance_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
601	error_mortgage_bid_positive	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
602	error_mortgage_bid_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
603	error_mortgage_end_date_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
604	error_mortgage_payment_positive	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
605	error_mortgage_program_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
606	error_mortgage_type_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
607	error_name_surname	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
608	error_partner_mortgage_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
609	error_period_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
610	error_property_value_required	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
611	error_public_person_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
612	error_quantity_borrowers	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
613	error_refinance_balance_greater_than_property	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
614	error_refinance_bank_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
615	error_refinance_mortgage_balance_mismatch	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
616	error_refinance_property_less_than_balance	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
617	error_refinance_registered_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
618	error_refinance_start_date_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
619	error_refinance_type_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
620	error_refinance_why_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
621	error_required_to_fill_out	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
622	error_select_answer	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
623	error_select_field_of_activity	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
624	error_select_one_of_the_options	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
625	error_tax_countries_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
626	error_taxes_required	global_errors	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
627	error_when_need_mortgage	mortgage_step1	error	validation_errors	approved	2025-07-27 12:50:28.791829	2025-07-28 08:31:24.341358	1	t	\N
655	calculate_mortgage_citizenship_title	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
656	calculate_mortgage_citizenship_option_5	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
657	calculate_mortgage_citizenship_option_6	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
658	calculate_mortgage_citizenship_option_7	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
659	calculate_mortgage_citizenship_option_8	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
772	common_button_next	common_components	button	common_ui	approved	2025-07-27 13:29:15.173536	2025-07-28 08:31:24.341358	1	t	\N
25	calculate_mortgage_property_ownership	mortgage_step1	label	mortgage	approved	2025-07-24 13:59:39.693371	2025-07-28 08:31:24.341358	1	t	1
26	calculate_mortgage_property_ownership_ph	mortgage_step1	placeholder	mortgage	approved	2025-07-24 13:59:40.305351	2025-07-28 08:31:24.341358	1	t	1
630	sidebar_company_6	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
631	sidebar_contacts	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
632	sidebar_franchise_brokers	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
633	sidebar_franchise_realtors	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
635	sidebar_partnership_lawyers	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
636	sidebar_referral_program	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
637	sidebar_sub_bank_apoalim	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
638	sidebar_sub_bank_beinleumi	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
639	sidebar_sub_bank_discount	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
640	sidebar_sub_bank_jerusalem	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
641	sidebar_sub_bank_leumi	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
642	sidebar_sub_bank_mercantile_discount	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
643	sidebar_sub_calculate_credit	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
34	calculate_mortgage_ctx	mortgage_step2	label	mortgage	approved	2025-07-24 13:59:44.913211	2025-07-28 08:31:24.341358	1	t	2
35	calculate_mortgage_step3_ctx	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:45.50309	2025-07-28 08:31:24.341358	1	t	3
36	calculate_mortgage_start_date	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:46.040961	2025-07-28 08:31:24.341358	1	t	3
37	calculate_mortgage_monthly_income	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:46.701137	2025-07-28 08:31:24.341358	1	t	3
38	calculate_mortgage_monthly_income_ph	mortgage_step3	placeholder	mortgage	approved	2025-07-24 13:59:47.310339	2025-07-28 08:31:24.341358	1	t	3
39	calculate_mortgage_monthly_income_hint	mortgage_step3	hint	mortgage	approved	2025-07-24 13:59:47.881356	2025-07-28 08:31:24.341358	1	t	3
40	calculate_mortgage_profession	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:48.57298	2025-07-28 08:31:24.341358	1	t	3
41	calculate_mortgage_profession_ph	mortgage_step3	placeholder	mortgage	approved	2025-07-24 13:59:49.121161	2025-07-28 08:31:24.341358	1	t	3
42	calculate_mortgage_company	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:49.731197	2025-07-28 08:31:24.341358	1	t	3
644	sidebar_sub_calculate_mortgage	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
645	sidebar_sub_refinance_credit	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
646	sidebar_sub_refinance_mortgage	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
647	sidebar_vacancies	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-28 08:31:24.341358	1	t	\N
660	calculate_mortgage_citizenship_option_9	mortgage_step2	text	personal_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
661	calculate_mortgage_ctx_1	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
662	calculate_mortgage_debt_types	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
663	calculate_mortgage_debt_types_option_1	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
664	calculate_mortgage_debt_types_option_2	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
665	calculate_mortgage_debt_types_option_3	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
666	calculate_mortgage_debt_types_option_4	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
667	calculate_mortgage_debt_types_option_5	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
668	calculate_mortgage_debt_types_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
669	calculate_mortgage_family_status	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
670	calculate_mortgage_family_status_option_1	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
671	calculate_mortgage_family_status_option_2	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
672	calculate_mortgage_family_status_option_3	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
673	calculate_mortgage_family_status_option_4	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
634	sidebar_our_services	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-31 20:05:15.425659	1	t	\N
27	calculate_mortgage_property_ownership_option_1	mortgage_step1	option	mortgage	approved	2025-07-24 13:59:40.823088	2025-08-02 20:26:51.157636	1	t	1
629	sidebar_bank_partners	sidebar	link	sidebar_navigation	approved	2025-07-27 12:56:06.958598	2025-07-31 20:41:53.707048	1	t	\N
674	calculate_mortgage_family_status_option_5	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
675	calculate_mortgage_family_status_option_6	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
676	calculate_mortgage_family_status_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
677	calculate_mortgage_filter_title	mortgage_step1	title	ui_titles	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
678	calculate_mortgage_first	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
679	calculate_mortgage_first_options_1	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
680	calculate_mortgage_first_options_2	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
681	calculate_mortgage_first_options_3	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
682	calculate_mortgage_first_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
683	calculate_mortgage_has_additional	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
684	calculate_mortgage_has_additional_option_1	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
773	common_button_back	common_components	button	common_ui	approved	2025-07-27 13:29:15.173536	2025-07-28 08:31:24.341358	1	t	\N
30	error_property_ownership_required	mortgage_step1	error	mortgage	approved	2025-07-24 13:59:42.717089	2025-07-28 08:31:24.341358	1	t	1
31	calculate_mortgage_period	mortgage_step1	label	mortgage	approved	2025-07-24 13:59:43.344137	2025-07-28 08:31:24.341358	1	t	1
32	calculate_mortgage_period_units_max	mortgage_step1	label	mortgage	approved	2025-07-24 13:59:43.84328	2025-07-28 08:31:24.341358	1	t	1
33	calculate_mortgage_period_units_min	mortgage_step1	label	mortgage	approved	2025-07-24 13:59:44.390972	2025-07-28 08:31:24.341358	1	t	1
86	calculate_mortgage_city	mortgage_step1	label	mortgage	approved	2025-07-24 14:37:31.6655	2025-07-28 08:31:24.341358	1	t	1
87	calculate_mortgage_city_ph	mortgage_step1	placeholder	mortgage	approved	2025-07-24 14:37:32.297402	2025-07-28 08:31:24.341358	1	t	1
88	calculate_mortgage_city_option_1	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:33.09536	2025-07-28 08:31:24.341358	1	t	1
89	calculate_mortgage_city_option_2	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:33.787564	2025-07-28 08:31:24.341358	1	t	1
90	calculate_mortgage_city_option_3	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:34.637416	2025-07-28 08:31:24.341358	1	t	1
91	calculate_mortgage_city_option_4	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:35.517575	2025-07-28 08:31:24.341358	1	t	1
92	calculate_mortgage_city_option_5	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:36.261434	2025-07-28 08:31:24.341358	1	t	1
93	calculate_mortgage_city_option_6	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:36.885461	2025-07-28 08:31:24.341358	1	t	1
94	calculate_mortgage_city_option_7	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:37.52763	2025-07-28 08:31:24.341358	1	t	1
95	calculate_mortgage_city_option_8	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:38.185392	2025-07-28 08:31:24.341358	1	t	1
96	calculate_mortgage_city_option_9	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:38.845734	2025-07-28 08:31:24.341358	1	t	1
97	calculate_mortgage_city_option_10	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:39.587357	2025-07-28 08:31:24.341358	1	t	1
98	calculate_mortgage_city_option_11	mortgage_step1	option	mortgage	approved	2025-07-24 14:37:40.269356	2025-07-28 08:31:24.341358	1	t	1
57	calculate_mortgage_education	mortgage_step2	label	form	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.341358	1	t	2
58	calculate_mortgage_education_ph	mortgage_step2	placeholder	form	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.341358	1	t	2
66	calculate_mortgage_borrowers	mortgage_step2	label	mortgage	approved	2025-07-24 14:37:16.797492	2025-07-28 08:31:24.341358	1	t	2
67	calculate_mortgage_borrowers_ph	mortgage_step2	placeholder	mortgage	approved	2025-07-24 14:37:17.537486	2025-07-28 08:31:24.341358	1	t	2
68	calculate_mortgage_borrowers_option_1	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:18.247602	2025-07-28 08:31:24.341358	1	t	2
69	calculate_mortgage_borrowers_option_2	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:18.887907	2025-07-28 08:31:24.341358	1	t	2
70	calculate_mortgage_borrowers_option_3	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:19.692597	2025-07-28 08:31:24.341358	1	t	2
71	calculate_mortgage_borrowers_option_4	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:20.417502	2025-07-28 08:31:24.341358	1	t	2
72	calculate_mortgage_borrowers_option_5	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:21.135387	2025-07-28 08:31:24.341358	1	t	2
73	calculate_mortgage_children18	mortgage_step2	label	mortgage	approved	2025-07-24 14:37:21.83762	2025-07-28 08:31:24.341358	1	t	2
74	calculate_mortgage_children18_ph	mortgage_step2	placeholder	mortgage	approved	2025-07-24 14:37:22.527401	2025-07-28 08:31:24.341358	1	t	2
75	calculate_mortgage_children18_option_1	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:23.287496	2025-07-28 08:31:24.341358	1	t	2
76	calculate_mortgage_children18_option_2	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:24.110665	2025-07-28 08:31:24.341358	1	t	2
77	calculate_mortgage_children18_option_3	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:24.825622	2025-07-28 08:31:24.341358	1	t	2
78	calculate_mortgage_children18_option_4	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:25.626649	2025-07-28 08:31:24.341358	1	t	2
79	calculate_mortgage_children18_option_5	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:26.31741	2025-07-28 08:31:24.341358	1	t	2
80	calculate_mortgage_citizenship	mortgage_step2	label	mortgage	approved	2025-07-24 14:37:27.033418	2025-07-28 08:31:24.341358	1	t	2
81	calculate_mortgage_citizenship_ph	mortgage_step2	placeholder	mortgage	approved	2025-07-24 14:37:27.767388	2025-07-28 08:31:24.341358	1	t	2
82	calculate_mortgage_citizenship_option_1	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:28.793367	2025-07-28 08:31:24.341358	1	t	2
83	calculate_mortgage_citizenship_option_2	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:29.525456	2025-07-28 08:31:24.341358	1	t	2
84	calculate_mortgage_citizenship_option_3	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:30.239469	2025-07-28 08:31:24.341358	1	t	2
85	calculate_mortgage_citizenship_option_4	mortgage_step2	option	mortgage	approved	2025-07-24 14:37:30.947675	2025-07-28 08:31:24.341358	1	t	2
47	calculate_mortgage_monthly_payment	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:57.399232	2025-07-28 08:31:24.341358	1	t	3
48	calculate_mortgage_bank	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:57.904044	2025-07-28 08:31:24.341358	1	t	3
49	calculate_mortgage_end_date	mortgage_step3	label	mortgage	approved	2025-07-24 13:59:58.533298	2025-07-28 08:31:24.341358	1	t	3
51	obligation	mortgage_step3	modal_title	mortgage	approved	2025-07-24 14:02:53.071323	2025-07-28 08:31:24.341358	1	t	3
99	calculate_mortgage_bank_option_1	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:40.987476	2025-07-28 08:31:24.341358	1	t	3
100	calculate_mortgage_bank_option_2	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:41.727221	2025-07-28 08:31:24.341358	1	t	3
101	calculate_mortgage_bank_option_3	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:42.427452	2025-07-28 08:31:24.341358	1	t	3
102	calculate_mortgage_bank_option_4	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:43.147516	2025-07-28 08:31:24.341358	1	t	3
103	calculate_mortgage_bank_option_5	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:43.96733	2025-07-28 08:31:24.341358	1	t	3
104	calculate_mortgage_bank_option_6	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:44.587304	2025-07-28 08:31:24.341358	1	t	3
105	calculate_mortgage_bank_option_7	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:45.307378	2025-07-28 08:31:24.341358	1	t	3
106	calculate_mortgage_bank_option_8	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:46.045379	2025-07-28 08:31:24.341358	1	t	3
107	calculate_mortgage_bank_option_9	mortgage_step3	option	mortgage	approved	2025-07-24 14:37:46.747363	2025-07-28 08:31:24.341358	1	t	3
388	calculate_mortgage_final	mortgage_step4	title	page_titles	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	4
389	calculate_mortgage_warning	mortgage_step4	alert	messages	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	4
417	mortgage_total_return	mortgage_step4	label	field_labels	approved	2025-07-27 05:37:15.99225	2025-07-28 08:31:24.341358	1	t	4
420	mortgage_total	mortgage_step4	label	field_labels	approved	2025-07-27 05:37:15.99225	2025-07-28 08:31:24.341358	1	t	4
421	mortgage_monthly	mortgage_step4	label	field_labels	approved	2025-07-27 05:37:15.99225	2025-07-28 08:31:24.341358	1	t	4
113	calculate_credit_education_option_3	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
114	calculate_credit_education_option_4	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
115	calculate_credit_education_option_5	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
116	calculate_credit_education_option_6	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
117	calculate_credit_education_option_7	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
118	calculate_credit_family_status	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
119	calculate_credit_family_status_ph	credit_step2	placeholder	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
120	calculate_credit_family_status_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
121	calculate_credit_family_status_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
122	calculate_credit_family_status_option_3	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
123	calculate_credit_family_status_option_4	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
124	calculate_credit_family_status_option_5	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
125	calculate_credit_family_status_option_6	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
126	calculate_credit_citizenship	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
127	calculate_credit_citizenship_ph	credit_step2	placeholder	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
128	calculate_credit_citizenship_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
129	calculate_credit_citizenship_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
130	calculate_credit_citizenship_option_3	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
131	calculate_credit_medical_insurance	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
132	calculate_credit_medical_insurance_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
133	calculate_credit_medical_insurance_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
134	calculate_credit_foreigner	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
135	calculate_credit_foreigner_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
136	calculate_credit_foreigner_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
137	calculate_credit_public_person	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
138	calculate_credit_public_person_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
139	calculate_credit_public_person_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
140	calculate_credit_us_tax_reporting	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
141	calculate_credit_us_tax_reporting_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
142	calculate_credit_us_tax_reporting_option_2	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
143	calculate_credit_step2_next_button	credit_step2	button	navigation	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
144	calculate_credit_step2_back_button	credit_step2	button	navigation	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
108	calculate_credit_step2_title	credit_step2	title	navigation	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
109	calculate_credit_education	credit_step2	field_label	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
46	calculate_mortgage_sphere_option_4	mortgage_step3	option	mortgage	approved	2025-07-24 13:59:56.703339	2025-08-02 20:26:51.157636	1	t	3
110	calculate_credit_education_ph	credit_step2	placeholder	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
111	calculate_credit_education_option_1	credit_step2	option	personal_details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.341358	1	t	2
182	calculate_credit_step3_title	credit_step3	title	navigation	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
183	calculate_credit_main_source_income	credit_step3	field_label	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
184	calculate_credit_main_source_income_ph	credit_step3	placeholder	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
185	calculate_credit_main_source_income_option_1	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
186	calculate_credit_main_source_income_option_2	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
187	calculate_credit_main_source_income_option_3	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
188	calculate_credit_main_source_income_option_4	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
189	calculate_credit_main_source_income_option_5	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
532	footer_about	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
533	footer_admin_contact	footer	link	footer_links	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
534	footer_company	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
535	footer_contact_info	footer	link	footer_links	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
190	calculate_credit_main_source_income_option_6	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
191	calculate_credit_main_source_income_option_7	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
192	calculate_credit_additional_income	credit_step3	field_label	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
193	calculate_credit_additional_income_ph	credit_step3	placeholder	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
194	calculate_credit_additional_income_option_1	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
195	calculate_credit_additional_income_option_2	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
196	calculate_credit_additional_income_option_3	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
197	calculate_credit_additional_income_option_4	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
198	calculate_credit_additional_income_option_5	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
199	calculate_credit_additional_income_option_6	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
200	calculate_credit_additional_income_option_7	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
201	calculate_credit_professional_sphere	credit_step3	field_label	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
202	calculate_credit_professional_sphere_ph	credit_step3	placeholder	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
203	calculate_credit_professional_sphere_option_1	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
204	calculate_credit_professional_sphere_option_2	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
205	calculate_credit_professional_sphere_option_3	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
206	calculate_credit_professional_sphere_option_4	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
207	calculate_credit_professional_sphere_option_5	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
208	calculate_credit_professional_sphere_option_6	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
209	calculate_credit_professional_sphere_option_7	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
210	calculate_credit_professional_sphere_option_8	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
211	calculate_credit_professional_sphere_option_9	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
212	calculate_credit_professional_sphere_option_10	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
213	calculate_credit_monthly_income	credit_step3	field_label	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
214	calculate_credit_monthly_income_ph	credit_step3	placeholder	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
215	calculate_credit_existing_debts	credit_step3	field_label	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
216	calculate_credit_existing_debts_ph	credit_step3	placeholder	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
217	calculate_credit_existing_debts_option_1	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
218	calculate_credit_existing_debts_option_2	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
219	calculate_credit_existing_debts_option_3	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
220	calculate_credit_existing_debts_option_4	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
221	calculate_credit_existing_debts_option_5	credit_step3	option	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
222	calculate_credit_monthly_debt_payments	credit_step3	field_label	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
223	calculate_credit_monthly_debt_payments_ph	credit_step3	placeholder	income_details	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
224	calculate_credit_step3_next_button	credit_step3	button	navigation	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
225	calculate_credit_step3_back_button	credit_step3	button	navigation	approved	2025-07-24 23:22:10.588969	2025-07-28 08:31:24.341358	1	t	3
227	calculate_credit_results_title	credit_step4	title	results	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
228	calculate_credit_results_subtitle	credit_step4	text	results	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
229	calculate_credit_filter_title	credit_step4	title	filters	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
230	calculate_credit_filter_option_1	credit_step4	option	filters	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
231	calculate_credit_filter_option_2	credit_step4	option	filters	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
232	calculate_credit_filter_option_3	credit_step4	option	filters	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
233	calculate_credit_filter_option_4	credit_step4	option	filters	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
234	calculate_credit_bank_name	credit_step4	field_label	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
235	calculate_credit_interest_rate	credit_step4	field_label	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
236	calculate_credit_monthly_payment	credit_step4	field_label	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
237	calculate_credit_total_cost	credit_step4	field_label	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
238	calculate_credit_loan_term	credit_step4	field_label	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
239	calculate_credit_processing_fee	credit_step4	field_label	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
240	calculate_credit_apply_button	credit_step4	button	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
241	calculate_credit_details_button	credit_step4	button	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
242	calculate_credit_compare_button	credit_step4	button	bank_offers	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
243	calculate_credit_warning_income	credit_step4	text	warnings	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
244	calculate_credit_warning_debt_ratio	credit_step4	text	warnings	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
245	calculate_credit_warning_credit_history	credit_step4	text	warnings	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
248	calculate_credit_info_approval_requirements	credit_step4	text	information	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
249	calculate_credit_no_results_title	credit_step4	title	no_results	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
250	calculate_credit_no_results_message	credit_step4	text	no_results	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
251	calculate_credit_no_results_suggestions	credit_step4	text	no_results	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
252	calculate_credit_step4_back_button	credit_step4	button	navigation	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
253	calculate_credit_step4_restart_button	credit_step4	button	navigation	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
226	calculate_credit_step4_title	credit_step4	title	navigation	approved	2025-07-24 23:22:10.929946	2025-07-28 08:31:24.341358	1	t	4
13	about_title	about_page	text	general	approved	2025-07-21 10:23:44.724379	2025-07-28 08:31:24.341358	1	t	303
14	about_desc	about_page	text	general	approved	2025-07-21 10:23:45.062937	2025-07-28 08:31:24.341358	1	t	303
15	contacts_title	contacts_page	text	general	approved	2025-07-21 10:23:45.399664	2025-07-28 08:31:24.341358	1	t	304
16	contacts_main_office	contacts_page	text	general	approved	2025-07-21 10:23:45.743859	2025-07-28 08:31:24.341358	1	t	304
10	sidebar_business_2	sidebar	text	general	approved	2025-07-21 10:23:43.716295	2025-07-28 08:31:24.341358	1	t	401
11	sidebar_business_3	sidebar	text	general	approved	2025-07-21 10:23:44.04984	2025-07-28 08:31:24.341358	1	t	401
12	sidebar_business_4	sidebar	text	general	approved	2025-07-21 10:23:44.387496	2025-07-28 08:31:24.341358	1	t	401
2	sidebar_company	sidebar	text	general	approved	2025-07-21 10:23:40.813887	2025-07-28 08:31:24.341358	1	t	401
4	sidebar_company_2	sidebar	text	general	approved	2025-07-21 10:23:41.508165	2025-07-28 08:31:24.341358	1	t	401
5	sidebar_company_3	sidebar	text	general	approved	2025-07-21 10:23:41.844686	2025-07-28 08:31:24.341358	1	t	401
6	sidebar_company_4	sidebar	text	general	approved	2025-07-21 10:23:42.221967	2025-07-28 08:31:24.341358	1	t	401
390	no_bank_offers_available	bank_offers	title	messages	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
391	no_offers_message	bank_offers	text	messages	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
392	bank_name	bank_offers	label	labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
393	mortgage_register	bank_offers	label	labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
394	bank_offers_credit_register	bank_offers	label	labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
395	mortgage_prime_percent	bank_offers	label	program_types	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
396	mortgage_fix_percent	bank_offers	label	program_types	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
397	mortgage_float_percent	bank_offers	label	program_types	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
398	credit_prime_percent	bank_offers	label	program_types	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
399	credit_fix_percent	bank_offers	label	program_types	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
400	credit_float_percent	bank_offers	label	program_types	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
401	mortgage_total	bank_offers	label	field_labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
402	mortgage_monthly	bank_offers	label	field_labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
403	mortgage_percnt	bank_offers	label	field_labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
404	mortgage_term	bank_offers	label	field_labels	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
405	prime_description	bank_offers	text	descriptions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
406	fixed_inflation_description	bank_offers	text	descriptions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
407	variable_inflation_description	bank_offers	text	descriptions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
408	up_to_33_percent	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
409	up_to_70_percent	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
410	up_to_75_percent	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
411	4_to_30_years	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
412	5_to_30_years	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
413	4_to_25_years	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
414	prime_rate_structure	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
415	fixed_rate_structure	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
9	sidebar_business_1	sidebar	text	general	approved	2025-07-21 10:23:43.347848	2025-07-31 19:36:32.589206	1	t	401
8	sidebar_business	sidebar	text	general	approved	2025-07-21 10:23:42.969803	2025-07-31 20:04:37.256933	1	t	401
3	sidebar_company_1	sidebar	text	general	approved	2025-07-21 10:23:41.160043	2025-07-31 20:05:21.335358	1	t	401
416	variable_rate_structure	bank_offers	text	conditions	approved	2025-07-27 05:34:27.249964	2025-07-28 08:31:24.341358	1	t	703
419	mortgage_total_return	bank_offers	label	field_labels	approved	2025-07-27 05:37:15.99225	2025-07-28 08:31:24.341358	1	t	703
54	personal_data_borrowers_title	other_borrowers_step1	title	mortgage	approved	2025-07-24 14:12:51.908111	2025-07-28 08:31:24.341358	1	t	801
55	who_are_you_for_borrowers	other_borrowers_step1	label	mortgage	approved	2025-07-24 14:12:52.688611	2025-07-28 08:31:24.341358	1	t	801
56	who_are_you_for_borrowers_ph	other_borrowers_step1	placeholder	mortgage	approved	2025-07-24 14:12:53.43007	2025-07-28 08:31:24.341358	1	t	801
52	additional_source_of_income	other_borrowers_step2	modal_title	mortgage	approved	2025-07-24 14:12:50.506934	2025-07-28 08:31:24.341358	1	t	802
53	source_of_income	other_borrowers_step2	modal_title	mortgage	approved	2025-07-24 14:12:51.238362	2025-07-28 08:31:24.341358	1	t	802
17	franchise_main_hero_title	temporary_franchise	text	general	approved	2025-07-21 10:23:46.087989	2025-07-28 08:31:24.341358	1	t	901
536	footer_contacts	footer	link	footer_links	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
537	footer_contacts_title	footer	title	footer_titles	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
538	footer_cookie_policy	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
539	footer_cookies	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
540	footer_cooperation	footer	text	footer_navigation	approved	2025-07-27 12:48:43.590425	2025-07-28 08:31:24.341358	1	t	\N
685	calculate_mortgage_has_additional_option_2	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
686	calculate_mortgage_has_additional_option_3	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
687	calculate_mortgage_has_additional_option_4	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
688	calculate_mortgage_has_additional_option_5	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
689	calculate_mortgage_has_additional_option_6	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
690	calculate_mortgage_has_additional_option_7	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
691	calculate_mortgage_has_additional_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
692	calculate_mortgage_how_much_childrens	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
693	calculate_mortgage_income	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
694	calculate_mortgage_initial_fee	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
695	calculate_mortgage_initial_payment	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
696	calculate_mortgage_is_foreigner	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
697	calculate_mortgage_is_medinsurance	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
698	calculate_mortgage_is_public	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
699	calculate_mortgage_main_source	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
700	calculate_mortgage_main_source_option_1	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
701	calculate_mortgage_main_source_option_2	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
702	calculate_mortgage_main_source_option_3	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
703	calculate_mortgage_main_source_option_4	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
704	calculate_mortgage_main_source_option_5	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
705	calculate_mortgage_main_source_option_6	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
706	calculate_mortgage_main_source_option_7	mortgage_step1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
707	calculate_mortgage_main_source_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
708	calculate_mortgage_monthly_income_year_hint	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
709	calculate_mortgage_monthy_income_title	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
710	calculate_mortgage_name_surname	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
711	calculate_mortgage_name_surname_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
712	calculate_mortgage_parameters	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
713	calculate_mortgage_parameters_cost	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
714	calculate_mortgage_parameters_initial	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
715	calculate_mortgage_parameters_months	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
716	calculate_mortgage_parameters_period	mortgage_step1	text	calculator_params	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
717	calculate_mortgage_partner_pay_mortgage	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
718	calculate_mortgage_price	mortgage_step1	text	calculator_params	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
719	calculate_mortgage_profile_title	mortgage_step1	title	ui_titles	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
720	calculate_mortgage_sfere	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
721	calculate_mortgage_sphere	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
722	calculate_mortgage_sphere_option_10	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
723	calculate_mortgage_sphere_option_5	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
724	calculate_mortgage_sphere_option_6	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
725	calculate_mortgage_sphere_option_7	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
726	calculate_mortgage_sphere_option_8	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
727	calculate_mortgage_sphere_option_9	mortgage_step3	text	income_details	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
728	calculate_mortgage_stere	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
729	calculate_mortgage_tax	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
730	calculate_mortgage_title	mortgage_step1	title	ui_titles	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
737	calculate_mortgage_type_ph	mortgage_step1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
738	calculate_mortgage_when	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
739	calculate_mortgage_when_options_1	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
740	calculate_mortgage_when_options_2	mortgage_step1	text	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
764	mortgage_refinance_type_ph	refinance_mortgage_1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
765	mortgage_refinance_why	refinance_mortgage_1	text	refinance_calculator	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
766	mortgage_refinance_why_option_1	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
767	mortgage_refinance_why_option_2	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
768	mortgage_refinance_why_option_3	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
769	mortgage_refinance_why_option_4	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
770	mortgage_refinance_why_option_5	refinance_mortgage_1	option	dropdown_options	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
771	mortgage_refinance_why_ph	refinance_mortgage_1	placeholder	form_placeholders	approved	2025-07-27 13:18:36.407643	2025-07-28 08:31:24.341358	1	t	\N
774	common_button_submit	common_components	button	common_ui	approved	2025-07-27 13:29:15.173536	2025-07-28 08:31:24.341358	1	t	\N
775	common_button_save	common_components	button	common_ui	approved	2025-07-27 13:29:15.173536	2025-07-28 08:31:24.341358	1	t	\N
776	common_button_cancel	common_components	button	common_ui	approved	2025-07-27 13:29:15.173536	2025-07-28 08:31:24.341358	1	t	\N
731	calculate_mortgage_type	mortgage_step1	dropdown	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-29 20:03:45.592253	1	t	\N
732	calculate_mortgage_type_options_1	mortgage_step1	option	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-29 20:03:49.265271	1	t	\N
733	calculate_mortgage_type_options_2	mortgage_step1	option	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-29 20:03:49.265271	1	t	\N
734	calculate_mortgage_type_options_3	mortgage_step1	option	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-29 20:03:49.265271	1	t	\N
735	calculate_mortgage_type_options_4	mortgage_step1	option	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-29 20:03:49.265271	1	t	\N
736	calculate_mortgage_type_options_5	mortgage_step1	option	calculator_ui	approved	2025-07-27 13:18:36.407643	2025-07-29 20:03:49.265271	1	t	\N
369	mortgage_show_offers	mortgage_step1	button	navigation	approved	2025-07-26 19:59:40.506245	2025-07-31 21:33:39.14671	1	t	1
\.


--
-- Data for Name: content_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_test (id, title, content, created_at) FROM stdin;
1	Test Content	This is a test content entry for the content database	2025-08-04 13:13:04.012294
\.


--
-- Data for Name: content_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_translations (id, content_item_id, language_code, content_value, status, created_at, updated_at) FROM stdin;
67	25	en	Property Ownership Status	approved	2025-07-24 13:59:39.861358	2025-07-24 13:59:39.861358
68	25	he	סטטוס בעלות על נכס	approved	2025-07-24 13:59:40.001501	2025-07-24 13:59:40.001501
69	25	ru	Статус владения недвижимостью	approved	2025-07-24 13:59:40.161354	2025-07-24 13:59:40.161354
70	26	en	Select your property ownership status	approved	2025-07-24 13:59:40.483289	2025-07-24 13:59:40.483289
71	26	he	בחר את סטטוס הבעלות	approved	2025-07-24 13:59:40.593319	2025-07-24 13:59:40.593319
72	26	ru	Выберите статус владения недвижимостью	approved	2025-07-24 13:59:40.703422	2025-07-24 13:59:40.703422
73	27	en	I don't own any property	approved	2025-07-24 13:59:40.993401	2025-07-24 13:59:40.993401
74	27	he	אין בבעלותי נכס	approved	2025-07-24 13:59:41.123581	2025-07-24 13:59:41.123581
75	27	ru	У меня нет недвижимости	approved	2025-07-24 13:59:41.303578	2025-07-24 13:59:41.303578
76	28	en	I own a property	approved	2025-07-24 13:59:41.609233	2025-07-24 13:59:41.609233
77	28	he	יש בבעלותי נכס	approved	2025-07-24 13:59:41.733201	2025-07-24 13:59:41.733201
78	28	ru	У меня есть недвижимость	approved	2025-07-24 13:59:41.891127	2025-07-24 13:59:41.891127
79	29	en	I'm selling a property	approved	2025-07-24 13:59:42.243929	2025-07-24 13:59:42.243929
80	29	he	אני מוכר נכס	approved	2025-07-24 13:59:42.433171	2025-07-24 13:59:42.433171
81	29	ru	Я продаю недвижимость	approved	2025-07-24 13:59:42.553146	2025-07-24 13:59:42.553146
82	30	en	Please select your property ownership status	approved	2025-07-24 13:59:42.843128	2025-07-24 13:59:42.843128
83	30	he	אנא בחר את סטטוס הבעלות על הנכס	approved	2025-07-24 13:59:43.043188	2025-07-24 13:59:43.043188
1659	556	ru	Тендеры для юристов	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1660	557	en	User agreement	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1661	557	he	הסכם משתמש	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1662	557	ru	Пользовательское соглашение	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1663	558	en	Vacancies	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1664	558	he	משרות פנויות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1665	558	ru	Вакансии	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1666	559	en	Job vacancies	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1667	559	he	משרות פנויות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1668	559	ru	Открытые вакансии	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1669	560	en	Write to us	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1670	560	he	כתוב לנו	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1671	560	ru	Напишите нам	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1887	632	ru	Франшиза для брокеров	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1888	633	en	Realtor franchise	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1889	633	he	זיכיון למתווכים	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
84	30	ru	Пожалуйста, выберите статус владения недвижимостью	approved	2025-07-24 13:59:43.163315	2025-07-24 13:59:43.163315
85	31	en	Loan Period	approved	2025-07-24 13:59:43.473091	2025-07-24 13:59:43.473091
86	31	he	תקופת ההלוואה	approved	2025-07-24 13:59:43.583069	2025-07-24 13:59:43.583069
87	31	ru	Срок кредита	approved	2025-07-24 13:59:43.733141	2025-07-24 13:59:43.733141
88	32	en	years	approved	2025-07-24 13:59:43.963049	2025-07-24 13:59:43.963049
89	32	he	שנים	approved	2025-07-24 13:59:44.083191	2025-07-24 13:59:44.083191
90	32	ru	лет	approved	2025-07-24 13:59:44.273	2025-07-24 13:59:44.273
91	33	en	years	approved	2025-07-24 13:59:44.533196	2025-07-24 13:59:44.533196
92	33	he	שנים	approved	2025-07-24 13:59:44.683088	2025-07-24 13:59:44.683088
93	33	ru	лет	approved	2025-07-24 13:59:44.803078	2025-07-24 13:59:44.803078
94	34	en	Fill in the details	approved	2025-07-24 13:59:45.06295	2025-07-24 13:59:45.06295
95	34	he	מלא את הפרטים	approved	2025-07-24 13:59:45.191192	2025-07-24 13:59:45.191192
96	34	ru	Заполните данные	approved	2025-07-24 13:59:45.331232	2025-07-24 13:59:45.331232
97	35	en	Additional Information	approved	2025-07-24 13:59:45.631107	2025-07-24 13:59:45.631107
98	35	he	מידע נוסף	approved	2025-07-24 13:59:45.763258	2025-07-24 13:59:45.763258
99	35	ru	Дополнительная информация	approved	2025-07-24 13:59:45.913197	2025-07-24 13:59:45.913197
100	36	en	Start Date	approved	2025-07-24 13:59:46.224358	2025-07-24 13:59:46.224358
101	36	he	תאריך התחלה	approved	2025-07-24 13:59:46.393191	2025-07-24 13:59:46.393191
102	36	ru	Дата начала	approved	2025-07-24 13:59:46.523244	2025-07-24 13:59:46.523244
103	37	en	Monthly Income	approved	2025-07-24 13:59:46.8613	2025-07-24 13:59:46.8613
104	37	he	הכנסה חודשית	approved	2025-07-24 13:59:47.04367	2025-07-24 13:59:47.04367
105	37	ru	Ежемесячный доход	approved	2025-07-24 13:59:47.171109	2025-07-24 13:59:47.171109
106	38	en	Enter your monthly income	approved	2025-07-24 13:59:47.473275	2025-07-24 13:59:47.473275
107	38	he	הזן את ההכנסה החודשית	approved	2025-07-24 13:59:47.621253	2025-07-24 13:59:47.621253
108	38	ru	Введите ежемесячный доход	approved	2025-07-24 13:59:47.756137	2025-07-24 13:59:47.756137
109	39	en	Include all sources of income	approved	2025-07-24 13:59:48.054259	2025-07-24 13:59:48.054259
110	39	he	כלול את כל מקורות ההכנסה	approved	2025-07-24 13:59:48.188108	2025-07-24 13:59:48.188108
111	39	ru	Включите все источники дохода	approved	2025-07-24 13:59:48.390946	2025-07-24 13:59:48.390946
112	40	en	Profession	approved	2025-07-24 13:59:48.703078	2025-07-24 13:59:48.703078
113	40	he	מקצוע	approved	2025-07-24 13:59:48.872884	2025-07-24 13:59:48.872884
114	40	ru	Профессия	approved	2025-07-24 13:59:49.001099	2025-07-24 13:59:49.001099
115	41	en	Enter your profession	approved	2025-07-24 13:59:49.268155	2025-07-24 13:59:49.268155
116	41	he	הזן את המקצוע שלך	approved	2025-07-24 13:59:49.473232	2025-07-24 13:59:49.473232
117	41	ru	Введите вашу профессию	approved	2025-07-24 13:59:49.611009	2025-07-24 13:59:49.611009
118	42	en	Company	approved	2025-07-24 13:59:49.913215	2025-07-24 13:59:49.913215
119	42	he	חברה	approved	2025-07-24 13:59:50.034683	2025-07-24 13:59:50.034683
120	42	ru	Компания	approved	2025-07-24 13:59:50.20706	2025-07-24 13:59:50.20706
121	43	en	High-tech	approved	2025-07-24 13:59:50.439078	2025-07-24 13:59:50.439078
122	43	he	הייטק	approved	2025-07-24 13:59:50.62306	2025-07-24 13:59:50.62306
123	43	ru	Высокие технологии	approved	2025-07-24 13:59:50.759231	2025-07-24 13:59:50.759231
124	44	en	Finance	approved	2025-07-24 13:59:51.221072	2025-07-24 13:59:51.221072
125	44	he	פיננסים	approved	2025-07-24 13:59:54.793104	2025-07-24 13:59:54.793104
126	44	ru	Финансы	approved	2025-07-24 13:59:55.750963	2025-07-24 13:59:55.750963
127	45	en	Education	approved	2025-07-24 13:59:56.1692	2025-07-24 13:59:56.1692
128	45	he	חינוך	approved	2025-07-24 13:59:56.380973	2025-07-24 13:59:56.380973
129	45	ru	Образование	approved	2025-07-24 13:59:56.533204	2025-07-24 13:59:56.533204
130	46	en	Other	approved	2025-07-24 13:59:56.863268	2025-07-24 13:59:56.863268
131	46	he	אחר	approved	2025-07-24 13:59:57.083297	2025-07-24 13:59:57.083297
132	46	ru	Другое	approved	2025-07-24 13:59:57.271293	2025-07-24 13:59:57.271293
133	47	en	Monthly Payment	approved	2025-07-24 13:59:57.553002	2025-07-24 13:59:57.553002
134	47	he	תשלום חודשי	approved	2025-07-24 13:59:57.68318	2025-07-24 13:59:57.68318
135	47	ru	Ежемесячный платеж	approved	2025-07-24 13:59:57.793004	2025-07-24 13:59:57.793004
136	48	en	Bank	approved	2025-07-24 13:59:58.023018	2025-07-24 13:59:58.023018
137	48	he	בנק	approved	2025-07-24 13:59:58.201417	2025-07-24 13:59:58.201417
138	48	ru	Банк	approved	2025-07-24 13:59:58.379224	2025-07-24 13:59:58.379224
139	49	en	End Date	approved	2025-07-24 13:59:58.68322	2025-07-24 13:59:58.68322
140	49	he	תאריך סיום	approved	2025-07-24 13:59:58.843221	2025-07-24 13:59:58.843221
141	49	ru	Дата окончания	approved	2025-07-24 13:59:59.013408	2025-07-24 13:59:59.013408
142	50	en	Additional Obligations	approved	2025-07-24 13:59:59.241372	2025-07-24 13:59:59.241372
143	50	he	התחייבויות נוספות	approved	2025-07-24 13:59:59.411214	2025-07-24 13:59:59.411214
144	50	ru	Дополнительные обязательства	approved	2025-07-24 13:59:59.841175	2025-07-24 13:59:59.841175
145	51	en	Obligation	approved	2025-07-24 14:02:53.251689	2025-07-24 14:02:53.251689
146	51	he	התחייבות	approved	2025-07-24 14:02:53.443347	2025-07-24 14:02:53.443347
147	51	ru	Обязательство	approved	2025-07-24 14:02:53.603787	2025-07-24 14:02:53.603787
148	52	en	Additional Source of Income	approved	2025-07-24 14:12:50.628806	2025-07-24 14:12:50.628806
149	52	he	מקור הכנסה נוסף	approved	2025-07-24 14:12:50.817918	2025-07-24 14:12:50.817918
150	52	ru	Дополнительный источник дохода	approved	2025-07-24 14:12:50.938377	2025-07-24 14:12:50.938377
151	53	en	Source of Income	approved	2025-07-24 14:12:51.418436	2025-07-24 14:12:51.418436
152	53	he	מקור הכנסה	approved	2025-07-24 14:12:51.538528	2025-07-24 14:12:51.538528
153	53	ru	Источник дохода	approved	2025-07-24 14:12:51.658544	2025-07-24 14:12:51.658544
154	54	en	Personal Data - Borrower 	approved	2025-07-24 14:12:52.028388	2025-07-24 14:12:52.028388
155	54	he	נתונים אישיים - לווה 	approved	2025-07-24 14:12:52.196247	2025-07-24 14:12:52.196247
156	54	ru	Личные данные - Заемщик 	approved	2025-07-24 14:12:52.366257	2025-07-24 14:12:52.366257
157	55	en	Relationship to Primary Borrower	approved	2025-07-24 14:12:52.878092	2025-07-24 14:12:52.878092
158	55	he	הקשר ללווה הראשי	approved	2025-07-24 14:12:52.998363	2025-07-24 14:12:52.998363
159	55	ru	Отношение к основному заемщику	approved	2025-07-24 14:12:53.186327	2025-07-24 14:12:53.186327
160	56	en	e.g. Spouse, Parent, Business Partner	approved	2025-07-24 14:12:53.588288	2025-07-24 14:12:53.588288
161	56	he	לדוגמה: בן/בת זוג, הורה, שותף עסקי	approved	2025-07-24 14:12:53.808026	2025-07-24 14:12:53.808026
162	56	ru	Например: Супруг(а), Родитель, Деловой партнер	approved	2025-07-24 14:12:53.93806	2025-07-24 14:12:53.93806
255	87	ru	Выберите город	approved	2025-07-24 14:37:32.805528	2025-07-24 14:37:32.805528
190	66	en	How many borrowers will be on the mortgage, including yourself?	approved	2025-07-24 14:37:16.940562	2025-07-24 14:37:16.940562
191	66	he	כמה לווים יהיו במשכנתא, כולל אותך?	approved	2025-07-24 14:37:17.09835	2025-07-24 14:37:17.09835
192	66	ru	Сколько всего заемщиков будет по ипотеке, включая вас?	approved	2025-07-24 14:37:17.247844	2025-07-24 14:37:17.247844
193	67	en	Select number of borrowers	approved	2025-07-24 14:37:17.705868	2025-07-24 14:37:17.705868
194	67	he	בחר מספר לווים	approved	2025-07-24 14:37:17.83781	2025-07-24 14:37:17.83781
195	67	ru	Выберите количество заемщиков	approved	2025-07-24 14:37:17.957935	2025-07-24 14:37:17.957935
196	68	en	1 borrower	approved	2025-07-24 14:37:18.359122	2025-07-24 14:37:18.359122
197	68	he	לווה אחד	approved	2025-07-24 14:37:18.527737	2025-07-24 14:37:18.527737
198	68	ru	1 заемщик	approved	2025-07-24 14:37:18.645807	2025-07-24 14:37:18.645807
199	69	en	2 borrowers	approved	2025-07-24 14:37:19.034089	2025-07-24 14:37:19.034089
200	69	he	2 לווים	approved	2025-07-24 14:37:19.187705	2025-07-24 14:37:19.187705
201	69	ru	2 заемщика	approved	2025-07-24 14:37:19.377615	2025-07-24 14:37:19.377615
202	70	en	3 borrowers	approved	2025-07-24 14:37:19.881954	2025-07-24 14:37:19.881954
203	70	he	3 לווים	approved	2025-07-24 14:37:19.996789	2025-07-24 14:37:19.996789
204	70	ru	3 заемщика	approved	2025-07-24 14:37:20.147783	2025-07-24 14:37:20.147783
205	71	en	4 borrowers	approved	2025-07-24 14:37:20.577351	2025-07-24 14:37:20.577351
206	71	he	4 לווים	approved	2025-07-24 14:37:20.727501	2025-07-24 14:37:20.727501
207	71	ru	4 заемщика	approved	2025-07-24 14:37:20.837423	2025-07-24 14:37:20.837423
208	72	en	More than 4	approved	2025-07-24 14:37:21.317377	2025-07-24 14:37:21.317377
209	72	he	יותר מ-4	approved	2025-07-24 14:37:21.427637	2025-07-24 14:37:21.427637
210	72	ru	Более 4	approved	2025-07-24 14:37:21.537382	2025-07-24 14:37:21.537382
211	73	en	Do you have children under 18?	approved	2025-07-24 14:37:22.015362	2025-07-24 14:37:22.015362
212	73	he	האם יש לך ילדים מתחת לגיל 18?	approved	2025-07-24 14:37:22.137537	2025-07-24 14:37:22.137537
213	73	ru	Дети до 18 лет	approved	2025-07-24 14:37:22.267281	2025-07-24 14:37:22.267281
214	74	en	Select answer	approved	2025-07-24 14:37:22.677458	2025-07-24 14:37:22.677458
215	74	he	בחר תשובה	approved	2025-07-24 14:37:22.82814	2025-07-24 14:37:22.82814
216	74	ru	Выберите ответ	approved	2025-07-24 14:37:22.987386	2025-07-24 14:37:22.987386
217	75	en	No children	approved	2025-07-24 14:37:23.477404	2025-07-24 14:37:23.477404
218	75	he	אין ילדים	approved	2025-07-24 14:37:23.677501	2025-07-24 14:37:23.677501
219	75	ru	Нет детей	approved	2025-07-24 14:37:23.805445	2025-07-24 14:37:23.805445
220	76	en	Yes, 1 child	approved	2025-07-24 14:37:24.267453	2025-07-24 14:37:24.267453
221	76	he	כן, ילד אחד	approved	2025-07-24 14:37:24.417481	2025-07-24 14:37:24.417481
222	76	ru	Да, 1 ребенок	approved	2025-07-24 14:37:24.577455	2025-07-24 14:37:24.577455
223	77	en	Yes, 2 children	approved	2025-07-24 14:37:25.007472	2025-07-24 14:37:25.007472
224	77	he	כן, 2 ילדים	approved	2025-07-24 14:37:25.207331	2025-07-24 14:37:25.207331
225	77	ru	Да, 2 детей	approved	2025-07-24 14:37:25.335629	2025-07-24 14:37:25.335629
226	78	en	Yes, 3 children	approved	2025-07-24 14:37:25.797571	2025-07-24 14:37:25.797571
227	78	he	כן, 3 ילדים	approved	2025-07-24 14:37:25.937494	2025-07-24 14:37:25.937494
228	78	ru	Да, 3 детей	approved	2025-07-24 14:37:26.09733	2025-07-24 14:37:26.09733
229	79	en	Yes, 4 or more	approved	2025-07-24 14:37:26.465605	2025-07-24 14:37:26.465605
230	79	he	כן, 4 או יותר	approved	2025-07-24 14:37:26.577341	2025-07-24 14:37:26.577341
231	79	ru	Да, 4 и более	approved	2025-07-24 14:37:26.747302	2025-07-24 14:37:26.747302
232	80	en	Do you have additional citizenship?	approved	2025-07-24 14:37:27.175477	2025-07-24 14:37:27.175477
233	80	he	האם יש לך אזרחות נוספת?	approved	2025-07-24 14:37:27.358411	2025-07-24 14:37:27.358411
234	80	ru	Имеете ли вы дополнительное гражданство?	approved	2025-07-24 14:37:27.477435	2025-07-24 14:37:27.477435
235	81	en	Select answer	approved	2025-07-24 14:37:27.892405	2025-07-24 14:37:27.892405
236	81	he	בחר תשובה	approved	2025-07-24 14:37:28.007629	2025-07-24 14:37:28.007629
237	81	ru	Выберите ответ	approved	2025-07-24 14:37:28.155508	2025-07-24 14:37:28.155508
238	82	en	No, only Israeli citizenship	approved	2025-07-24 14:37:28.917508	2025-07-24 14:37:28.917508
239	82	he	לא, רק אזרחות ישראלית	approved	2025-07-24 14:37:29.04521	2025-07-24 14:37:29.04521
240	82	ru	Нет, только израильское гражданство	approved	2025-07-24 14:37:29.205326	2025-07-24 14:37:29.205326
241	83	en	Yes, US citizenship	approved	2025-07-24 14:37:29.647612	2025-07-24 14:37:29.647612
242	83	he	כן, אזרחות אמריקאית	approved	2025-07-24 14:37:29.797483	2025-07-24 14:37:29.797483
243	83	ru	Да, гражданство США	approved	2025-07-24 14:37:29.937444	2025-07-24 14:37:29.937444
244	84	en	Yes, EU citizenship	approved	2025-07-24 14:37:30.355489	2025-07-24 14:37:30.355489
245	84	he	כן, אזרחות אירופית	approved	2025-07-24 14:37:30.52741	2025-07-24 14:37:30.52741
246	84	ru	Да, гражданство ЕС	approved	2025-07-24 14:37:30.647506	2025-07-24 14:37:30.647506
247	85	en	Yes, other citizenship	approved	2025-07-24 14:37:31.057513	2025-07-24 14:37:31.057513
248	85	he	כן, אזרחות אחרת	approved	2025-07-24 14:37:31.177649	2025-07-24 14:37:31.177649
249	85	ru	Да, другое гражданство	approved	2025-07-24 14:37:31.365443	2025-07-24 14:37:31.365443
250	86	en	City of property location	approved	2025-07-24 14:37:31.787472	2025-07-24 14:37:31.787472
251	86	he	עיר מיקום הנכס	approved	2025-07-24 14:37:31.937654	2025-07-24 14:37:31.937654
252	86	ru	Город расположения недвижимости	approved	2025-07-24 14:37:32.067618	2025-07-24 14:37:32.067618
253	87	en	Select city	approved	2025-07-24 14:37:32.477396	2025-07-24 14:37:32.477396
254	87	he	בחר עיר	approved	2025-07-24 14:37:32.597354	2025-07-24 14:37:32.597354
181	63	en	Bachelor's degree	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
256	88	en	Tel Aviv	approved	2025-07-24 14:37:33.217307	2025-07-24 14:37:33.217307
257	88	he	תל אביב	approved	2025-07-24 14:37:33.407506	2025-07-24 14:37:33.407506
258	88	ru	Тель-Авив	approved	2025-07-24 14:37:33.535325	2025-07-24 14:37:33.535325
259	89	en	Jerusalem	approved	2025-07-24 14:37:33.95541	2025-07-24 14:37:33.95541
260	89	he	ירושלים	approved	2025-07-24 14:37:34.145409	2025-07-24 14:37:34.145409
261	89	ru	Иерусалим	approved	2025-07-24 14:37:34.317388	2025-07-24 14:37:34.317388
262	90	en	Haifa	approved	2025-07-24 14:37:34.787241	2025-07-24 14:37:34.787241
263	90	he	חיפה	approved	2025-07-24 14:37:34.997408	2025-07-24 14:37:34.997408
264	90	ru	Хайфа	approved	2025-07-24 14:37:35.207487	2025-07-24 14:37:35.207487
265	91	en	Rishon LeZion	approved	2025-07-24 14:37:35.637573	2025-07-24 14:37:35.637573
266	91	he	ראשון לציון	approved	2025-07-24 14:37:35.781237	2025-07-24 14:37:35.781237
267	91	ru	Ришон-ле-Цион	approved	2025-07-24 14:37:35.947594	2025-07-24 14:37:35.947594
268	92	en	Petah Tikva	approved	2025-07-24 14:37:36.383324	2025-07-24 14:37:36.383324
269	92	he	פתח תקווה	approved	2025-07-24 14:37:36.515351	2025-07-24 14:37:36.515351
270	92	ru	Петах-Тиква	approved	2025-07-24 14:37:36.674665	2025-07-24 14:37:36.674665
271	93	en	Ashdod	approved	2025-07-24 14:37:36.995471	2025-07-24 14:37:36.995471
272	93	he	אשדוד	approved	2025-07-24 14:37:37.125393	2025-07-24 14:37:37.125393
273	93	ru	Ашдод	approved	2025-07-24 14:37:37.274322	2025-07-24 14:37:37.274322
274	94	en	Netanya	approved	2025-07-24 14:37:37.677461	2025-07-24 14:37:37.677461
275	94	he	נתניה	approved	2025-07-24 14:37:37.787499	2025-07-24 14:37:37.787499
276	94	ru	Нетания	approved	2025-07-24 14:37:37.917492	2025-07-24 14:37:37.917492
277	95	en	Beer Sheva	approved	2025-07-24 14:37:38.325544	2025-07-24 14:37:38.325544
278	95	he	באר שבע	approved	2025-07-24 14:37:38.437373	2025-07-24 14:37:38.437373
279	95	ru	Беэр-Шева	approved	2025-07-24 14:37:38.575687	2025-07-24 14:37:38.575687
280	96	en	Holon	approved	2025-07-24 14:37:39.026607	2025-07-24 14:37:39.026607
281	96	he	חולון	approved	2025-07-24 14:37:39.175515	2025-07-24 14:37:39.175515
282	96	ru	Холон	approved	2025-07-24 14:37:39.317473	2025-07-24 14:37:39.317473
283	97	en	Bnei Brak	approved	2025-07-24 14:37:39.74533	2025-07-24 14:37:39.74533
284	97	he	בני ברק	approved	2025-07-24 14:37:39.875326	2025-07-24 14:37:39.875326
285	97	ru	Бней-Брак	approved	2025-07-24 14:37:40.057489	2025-07-24 14:37:40.057489
286	98	en	Other	approved	2025-07-24 14:37:40.457369	2025-07-24 14:37:40.457369
287	98	he	אחר	approved	2025-07-24 14:37:40.577666	2025-07-24 14:37:40.577666
288	98	ru	Другой	approved	2025-07-24 14:37:40.747433	2025-07-24 14:37:40.747433
289	99	en	Bank Hapoalim	approved	2025-07-24 14:37:41.117335	2025-07-24 14:37:41.117335
290	99	he	בנק הפועלים	approved	2025-07-24 14:37:41.267536	2025-07-24 14:37:41.267536
291	99	ru	Банк Апоалим	approved	2025-07-24 14:37:41.4255	2025-07-24 14:37:41.4255
292	100	en	Bank Leumi	approved	2025-07-24 14:37:41.907533	2025-07-24 14:37:41.907533
293	100	he	בנק לאומי	approved	2025-07-24 14:37:42.027381	2025-07-24 14:37:42.027381
294	100	ru	Банк Леуми	approved	2025-07-24 14:37:42.207464	2025-07-24 14:37:42.207464
295	101	en	Israel Discount Bank	approved	2025-07-24 14:37:42.631414	2025-07-24 14:37:42.631414
296	101	he	בנק דיסקונט	approved	2025-07-24 14:37:42.747482	2025-07-24 14:37:42.747482
297	101	ru	Дисконт Банк	approved	2025-07-24 14:37:42.897625	2025-07-24 14:37:42.897625
298	102	en	Mizrahi Tefahot Bank	approved	2025-07-24 14:37:43.25736	2025-07-24 14:37:43.25736
299	102	he	בנק מזרחי טפחות	approved	2025-07-24 14:37:43.467477	2025-07-24 14:37:43.467477
300	102	ru	Банк Мизрахи-Тфахот	approved	2025-07-24 14:37:43.727557	2025-07-24 14:37:43.727557
301	103	en	First International Bank	approved	2025-07-24 14:37:44.123318	2025-07-24 14:37:44.123318
302	103	he	הבנק הבינלאומי	approved	2025-07-24 14:37:44.247317	2025-07-24 14:37:44.247317
303	103	ru	Первый Международный Банк	approved	2025-07-24 14:37:44.357544	2025-07-24 14:37:44.357544
304	104	en	Bank of Jerusalem	approved	2025-07-24 14:37:44.737359	2025-07-24 14:37:44.737359
305	104	he	בנק ירושלים	approved	2025-07-24 14:37:44.85232	2025-07-24 14:37:44.85232
306	104	ru	Банк Иерусалима	approved	2025-07-24 14:37:45.005576	2025-07-24 14:37:45.005576
307	105	en	Mercantile Discount Bank	approved	2025-07-24 14:37:45.49733	2025-07-24 14:37:45.49733
308	105	he	בנק מרכנתיל דיסקונט	approved	2025-07-24 14:37:45.66533	2025-07-24 14:37:45.66533
309	105	ru	Меркантиль Дисконт Банк	approved	2025-07-24 14:37:45.787374	2025-07-24 14:37:45.787374
310	106	en	Union Bank	approved	2025-07-24 14:37:46.225494	2025-07-24 14:37:46.225494
311	106	he	בנק איגוד	approved	2025-07-24 14:37:46.397452	2025-07-24 14:37:46.397452
312	106	ru	Юнион Банк	approved	2025-07-24 14:37:46.528396	2025-07-24 14:37:46.528396
313	107	en	Other	approved	2025-07-24 14:37:46.947633	2025-07-24 14:37:46.947633
314	107	he	אחר	approved	2025-07-24 14:37:47.112467	2025-07-24 14:37:47.112467
315	107	ru	Другой	approved	2025-07-24 14:37:47.227525	2025-07-24 14:37:47.227525
316	108	en	Personal Details	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
538	182	en	Income & Financial Details	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
539	183	en	Main Source of Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
540	184	en	Please select your main source of income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
541	185	en	Salary	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
542	186	en	Self-employed	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
543	187	en	Pension	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
544	188	en	Unemployment Benefits	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
545	189	en	Investment Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
546	190	en	Student Allowance	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
547	191	en	Other	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
548	192	en	Additional Income Sources	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
549	193	en	Select any additional income sources	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
550	194	en	Part-time Work	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
551	195	en	Freelance Work	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
552	196	en	Rental Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
553	197	en	Investment Returns	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
554	198	en	Business Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
555	199	en	Government Benefits	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
556	200	en	None	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
557	201	en	Professional Sphere	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
558	202	en	Please select your professional field	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
559	203	en	Technology/IT	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
560	204	en	Healthcare/Medical	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
561	205	en	Education	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
562	206	en	Finance/Banking	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
563	207	en	Legal Services	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
564	208	en	Manufacturing	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
565	209	en	Sales/Marketing	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
566	210	en	Public Service	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
567	211	en	Construction	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
568	212	en	Other	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
569	213	en	Monthly Income (₪)	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
570	214	en	Enter your total monthly income in NIS	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
571	215	en	Existing Debts	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
572	216	en	Select any existing debt types	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
573	217	en	Mortgage Loan	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
574	218	en	Personal Loan	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
575	219	en	Credit Card Debt	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
576	220	en	Car Loan	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
577	221	en	No Existing Debts	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
578	222	en	Monthly Debt Payments (₪)	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
579	223	en	Enter your total monthly debt payments in NIS	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
580	224	en	Continue	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
581	225	en	Back	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
582	182	he	פרטי הכנסה ופיננסיים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
583	183	he	מקור הכנסה עיקרי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
584	184	he	אנא בחר את מקור ההכנסה העיקרי שלך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
585	185	he	משכורת	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
586	186	he	עצמאי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
587	187	he	פנסיה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
588	188	he	דמי אבטלה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
589	189	he	הכנסה מהשקעות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
590	190	he	מלגת סטודנט	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
591	191	he	אחר	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
592	192	he	מקורות הכנסה נוספים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
593	193	he	בחר מקורות הכנסה נוספים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
594	194	he	עבודה במשרה חלקית	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
595	195	he	עבודה עצמאית	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
596	196	he	הכנסה מהשכרת נכס	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
597	197	he	תשואות השקעות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
598	198	he	הכנסה מעסק	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
599	199	he	הטבות ממשלתיות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
600	200	he	אין	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
601	201	he	תחום מקצועי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
602	202	he	אנא בחר את התחום המקצועי שלך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
603	203	he	טכנולוגיה/מחשבים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
604	204	he	בריאות/רפואה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
605	205	he	חינוך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
606	206	he	פיננסים/בנקאות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
607	207	he	שירותים משפטיים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
608	208	he	תעשייה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
609	209	he	מכירות/שיווק	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
610	210	he	שירות ציבורי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
611	211	he	בנייה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
612	212	he	אחר	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
613	213	he	הכנסה חודשית (₪)	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
614	214	he	הזן את סך ההכנסה החודשית שלך בשקלים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
615	215	he	חובות קיימים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
616	216	he	בחר סוגי חובות קיימים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
617	217	he	משכנתא	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
618	218	he	הלוואה אישית	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
619	219	he	חוב כרטיס אשראי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
620	220	he	הלוואת רכב	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
621	221	he	אין חובות קיימים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
622	222	he	תשלומי חובות חודשיים (₪)	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
623	223	he	הזן את סך התשלומים החודשיים על חובות בשקלים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
624	224	he	המשך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
625	225	he	חזרה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
626	182	ru	Доходы и финансовые данные	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
627	183	ru	Основной источник дохода	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
628	184	ru	Пожалуйста, выберите ваш основной источник дохода	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
629	185	ru	Зарплата	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
630	186	ru	Индивидуальный предприниматель	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
631	187	ru	Пенсия	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
632	188	ru	Пособие по безработице	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
633	189	ru	Доходы от инвестиций	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
634	190	ru	Студенческая стипендия	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
635	191	ru	Другое	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
636	192	ru	Дополнительные источники дохода	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
637	193	ru	Выберите дополнительные источники дохода	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
638	194	ru	Работа на неполный день	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
639	195	ru	Фриланс	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
640	196	ru	Доходы от аренды	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
641	197	ru	Доходы от инвестиций	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
642	198	ru	Доходы от бизнеса	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
643	199	ru	Государственные пособия	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
644	200	ru	Нет	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
645	201	ru	Профессиональная сфера	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
646	202	ru	Пожалуйста, выберите вашу профессиональную сферу	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
647	203	ru	Технологии/IT	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
648	204	ru	Здравоохранение/Медицина	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
649	205	ru	Образование	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
650	206	ru	Финансы/Банковское дело	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
651	207	ru	Юридические услуги	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
652	208	ru	Производство	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
653	209	ru	Продажи/Маркетинг	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
654	210	ru	Государственная служба	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
655	211	ru	Строительство	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
656	212	ru	Другое	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
657	213	ru	Ежемесячный доход (₪)	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
658	214	ru	Введите ваш общий ежемесячный доход в шекелях	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
659	215	ru	Существующие долги	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
660	216	ru	Выберите типы существующих долгов	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
661	217	ru	Ипотечный кредит	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
662	218	ru	Потребительский кредит	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
663	219	ru	Долг по кредитной карте	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
664	220	ru	Автокредит	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
665	221	ru	Нет существующих долгов	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
666	222	ru	Ежемесячные платежи по долгам (₪)	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
667	223	ru	Введите общую сумму ежемесячных платежей по долгам в шекелях	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
668	224	ru	Продолжить	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
669	225	ru	Назад	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
670	226	en	Credit Offers & Results	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
671	227	en	Available Credit Offers	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
672	228	en	Based on your financial profile, here are the best credit options available to you	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
673	229	en	Filter Results	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
674	230	en	Show All Offers	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
675	231	en	Best Interest Rate	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
676	232	en	Lowest Monthly Payment	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
677	233	en	Shortest Repayment Period	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
678	234	en	Bank	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
679	235	en	Interest Rate	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
680	236	en	Monthly Payment	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
681	237	en	Total Cost	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
682	238	en	Loan Term	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
683	239	en	Processing Fee	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
684	240	en	Apply Now	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
685	241	en	View Details	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
686	242	en	Compare Offers	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
687	243	en	Your monthly income may be insufficient for some credit offers. Consider increasing your income or reducing the loan amount.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
688	244	en	Your debt-to-income ratio is high. This may affect your eligibility for certain credit offers.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
689	245	en	Limited credit history may affect available offers. Building credit history can improve future options.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
690	246	en	Calculations are based on the information you provided and current market rates.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
691	247	en	Interest rates are subject to change and final approval by the lending institution.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
692	248	en	Final approval depends on credit check, income verification, and bank-specific criteria.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
693	249	en	No Credit Offers Available	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
694	250	en	Unfortunately, we could not find suitable credit offers based on your current financial profile.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
695	251	en	Consider improving your credit score, increasing your income, or reducing existing debt before reapplying.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
696	252	en	Back	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
697	253	en	Start New Calculation	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
698	226	he	הצעות אשראי ותוצאות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
699	227	he	הצעות אשראי זמינות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
700	228	he	בהתבסס על הפרופיל הפיננסי שלך, אלו הן אפשרויות האשראי הטובות ביותר הזמינות לך	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
701	229	he	סינון תוצאות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
702	230	he	הצג את כל ההצעות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
703	231	he	הריבית הטובה ביותר	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
704	232	he	התשלום החודשי הנמוך ביותר	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
705	233	he	תקופת ההחזר הקצרה ביותר	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
706	234	he	בנק	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
707	235	he	ריבית	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
708	236	he	תשלום חודשי	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
709	237	he	עלות כוללת	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
710	238	he	תקופת ההלוואה	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
711	239	he	עמלת עיבוד	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
712	240	he	הגש בקשה עכשיו	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
713	241	he	צפה בפרטים	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
714	242	he	השווה הצעות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
715	243	he	ההכנסה החודשית שלך עשויה להיות לא מספקת עבור חלק מהצעות האשראי. שקול להגדיל את ההכנסה או לצמצם את סכום ההלוואה.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
716	244	he	יחס החוב להכנסה שלך גבוה. זה עלול להשפיע על הזכאות שלך להצעות אשראי מסוימות.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
717	245	he	היסטוריית אשראי מוגבלת עשויה להשפיע על ההצעות הזמינות. בניית היסטוריית אשראי יכולה לשפר אפשרויות עתידיות.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
718	246	he	החישובים מבוססים על המידע שסיפקת ועל שערי השוק הנוכחיים.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
719	247	he	שיעורי הריבית עשויים להשתנות וכפופים לאישור סופי מהמוסד המלווה.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
720	248	he	האישור הסופי תלוי בבדיקת אשראי, אימות הכנסה וקריטריונים ספציפיים לבנק.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
721	249	he	אין הצעות אשראי זמינות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
722	250	he	למרבה הצער, לא הצלחנו למצוא הצעות אשראי מתאימות בהתבסס על הפרופיל הפיננסי הנוכחי שלך.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
723	251	he	שקול לשפר את ציון האשראי שלך, להגדיל את ההכנסה או לצמצם חובות קיימים לפני הגשת בקשה מחדש.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
724	252	he	חזרה	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
725	253	he	התחל חישוב חדש	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
726	226	ru	Кредитные предложения и результаты	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
727	227	ru	Доступные кредитные предложения	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
728	228	ru	На основе вашего финансового профиля, вот лучшие кредитные варианты, доступные вам	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
729	229	ru	Фильтр результатов	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
730	230	ru	Показать все предложения	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
731	231	ru	Лучшая процентная ставка	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
732	232	ru	Наименьший ежемесячный платеж	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
733	233	ru	Кратчайший период погашения	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
734	234	ru	Банк	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
735	235	ru	Процентная ставка	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
736	236	ru	Ежемесячный платеж	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
737	237	ru	Общая стоимость	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
738	238	ru	Срок кредита	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
739	239	ru	Комиссия за обработку	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
740	240	ru	Подать заявку сейчас	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
741	241	ru	Посмотреть детали	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
742	242	ru	Сравнить предложения	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
743	243	ru	Ваш ежемесячный доход может быть недостаточным для некоторых кредитных предложений. Рассмотрите возможность увеличения дохода или уменьшения суммы кредита.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
744	244	ru	Ваше отношение долга к доходу высокое. Это может повлиять на вашу правомочность для определенных кредитных предложений.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
745	245	ru	Ограниченная кредитная история может повлиять на доступные предложения. Создание кредитной истории может улучшить будущие возможности.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
746	246	ru	Расчеты основаны на предоставленной вами информации и текущих рыночных ставках.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
747	247	ru	Процентные ставки могут изменяться и подлежат окончательному одобрению кредитным учреждением.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
748	248	ru	Окончательное одобрение зависит от проверки кредитоспособности, подтверждения дохода и специфических критериев банка.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
749	249	ru	Нет доступных кредитных предложений	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
750	250	ru	К сожалению, мы не смогли найти подходящие кредитные предложения на основе вашего текущего финансового профиля.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
751	251	ru	Рассмотрите возможность улучшения вашего кредитного рейтинга, увеличения дохода или уменьшения существующих долгов перед повторной подачей заявки.	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
752	252	ru	Назад	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
753	253	ru	Начать новый расчет	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
1672	561	en	Sum of program balances ({{sumBalance}}) must equal total mortgage balance ({{fullBalance}}). Missing: {{notEnoughBalance}}	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1673	561	he	סכום היתרות בתוכניות ({{sumBalance}}) חייב להיות שווה ליתרת המשכנתא הכוללת ({{fullBalance}}). חסרים: {{notEnoughBalance}}	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1674	561	ru	Сумма остатков по программам ({{sumBalance}}) должна равняться общему остатку по ипотеке ({{fullBalance}}). Не хватает: {{notEnoughBalance}}	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1675	562	en	Please enter number of children	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1676	562	he	יש להזין מספר ילדים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1677	562	ru	Пожалуйста, введите количество детей	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1678	563	en	Please select if you have children under 18	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1679	563	he	יש לבחור האם יש ילדים מתחת לגיל 18	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1680	563	ru	Пожалуйста, выберите есть ли дети до 18 лет	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1681	564	en	Please select additional citizenship countries	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1682	564	he	יש לבחור מדינות אזרחות נוספות	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1683	564	ru	Пожалуйста, выберите страны дополнительного гражданства	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1684	565	en	Please select citizenship status	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1685	565	he	יש לבחור סטטוס אזרחות	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1686	565	ru	Пожалуйста, выберите статус гражданства	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1687	566	en	Please select the city where the property is located	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1688	566	he	יש לבחור את העיר בה נמצא הנכס	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1689	566	ru	Пожалуйста, выберите город, где находится недвижимость	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1690	567	en	Maximum credit amount is ₪500,000	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1691	567	he	סכום האשראי המקסימלי הוא 500,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1692	567	ru	Максимальная сумма кредита - 500,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1153	388	en	Mortgage Offers	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1693	568	en	Minimum credit amount is ₪10,000	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1694	568	he	סכום האשראי המינימלי הוא 10,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1695	568	ru	Минимальная сумма кредита - 10,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1696	569	en	Credit amount must be positive	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1697	569	he	סכום האשראי חייב להיות חיובי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1698	569	ru	Сумма кредита должна быть положительной	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1699	570	en	Please enter credit amount	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1700	570	he	נדרש להזין סכום אשראי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1701	570	ru	Необходимо ввести сумму кредита	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1702	571	en	Please select lending bank	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1703	571	he	יש לבחור בנק מלווה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1704	571	ru	Выберите банк-кредитор	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1705	572	en	Please add at least one credit	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1706	572	he	יש להוסיף לפחות אשראי אחד	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1707	572	ru	Добавьте хотя бы один кредит	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1708	573	en	Early repayment amount must be positive	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1709	573	he	סכום הפירעון המוקדם חייב להיות חיובי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1710	573	ru	Сумма досрочного погашения должна быть положительной	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1711	574	en	Please enter early repayment amount	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1712	574	he	יש למלא סכום פירעון מוקדם	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1713	574	ru	Введите сумму досрочного погашения	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1714	575	en	Please select end date	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1715	575	he	יש לבחור תאריך סיום	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1716	575	ru	Выберите дату окончания	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1717	576	en	End date must be later than start date	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1718	576	he	תאריך הסיום חייב להיות מאוחר יותר מתאריך ההתחלה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1719	576	ru	Дата окончания должна быть позже даты начала	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1720	577	en	Monthly payment must be positive	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1721	577	he	התשלום החודשי חייב להיות חיובי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1722	577	ru	Ежемесячный платеж должен быть положительным	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1723	578	en	Please enter monthly payment	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1724	578	he	יש למלא תשלום חודשי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1725	578	ru	Введите ежемесячный платеж	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1726	579	en	Required to select repayment period	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1727	579	he	נדרש לבחור תקופת החזר	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1728	579	ru	Необходимо выбрать период погашения	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1729	580	en	Please select start date	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1730	580	he	יש לבחור תאריך התחלה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1731	580	ru	Выберите дату начала	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1732	581	en	Required to select credit purpose	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1733	581	he	נדרש לבחור מטרת אשראי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1734	581	ru	Необходимо выбрать цель кредита	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1735	582	en	Please select education level	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1736	582	he	יש לבחור רמת השכלה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1737	582	ru	Пожалуйста, выберите уровень образования	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1738	583	en	Please select marital status	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1739	583	he	יש לבחור מצב משפחתי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1740	583	ru	Пожалуйста, выберите семейное положение	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1741	584	en	Please complete this field	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1742	584	he	אנא השלם שדה זה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1743	584	ru	Пожалуйста, заполните это поле	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1744	585	en	Please specify if this is your first home	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1745	585	he	יש לציין האם מדובר בדירה ראשונה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1746	585	ru	Пожалуйста, укажите, является ли это вашим первым жильем	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1747	586	en	Please select foreign resident status	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1748	586	he	יש לבחור סטטוס תושב חוץ	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1749	586	ru	Пожалуйста, выберите статус иностранного резидента	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1750	587	en	Down payment must be at least 25% of property value	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1751	587	he	ההון העצמי חייב להיות לפחות 25% משווי הנכס	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1752	587	ru	Первоначальный взнос должен составлять не менее 25% от стоимости недвижимости	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1753	588	en	Please enter down payment	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1154	388	he	הצעות משכנתאות	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1155	388	ru	Предложения по ипотеке	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1156	389	en	The offers presented are initial and subject to bank approval and credit check.	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1157	389	he	ההצעות המוצגות הן ראשוניות וכפופות לאישור הבנק ובדיקת אשראי.	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1158	389	ru	Представленные предложения являются предварительными и подлежат утверждению банком и проверке кредитоспособности.	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1159	390	en	No Bank Offers Available	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1160	390	he	אין הצעות זמינות מהבנקים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1161	390	ru	Нет доступных предложений от банков	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1162	391	en	No bank offers match your profile. Try adjusting your parameters.	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1163	391	he	אין הצעות בנק התואמות את הפרופיל שלך. נסה להתאים את הפרמטרים.	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1164	391	ru	Нет банковских предложений, соответствующих вашему профилю. Попробуйте изменить параметры.	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1165	392	en	Bank	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1166	392	he	בנק	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1167	392	ru	Банк	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1168	393	en	Mortgage Registration	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1169	393	he	רישום משכנתא	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1170	393	ru	Регистрация ипотеки	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1171	394	en	Credit Registration	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1172	394	he	רישום אשראי	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1173	394	ru	Регистрация кредита	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1174	395	en	Prime Rate Mortgage	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1175	395	he	משכנתא בריבית פריים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1176	395	ru	Ипотека по прайм-ставке	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1177	396	en	Fixed Rate Mortgage	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1178	396	he	משכנתא בריבית קבועה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1179	396	ru	Ипотека с фиксированной ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1180	397	en	Variable Rate Mortgage	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1181	397	he	משכנתא בריבית משתנה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1182	397	ru	Ипотека с плавающей ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1183	398	en	Prime Rate Credit	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1184	398	he	אשראי בריבית פריים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1185	398	ru	Кредит по прайм-ставке	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1186	399	en	Fixed Rate Credit	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1187	399	he	אשראי בריבית קבועה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1188	399	ru	Кредит с фиксированной ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1189	400	en	Variable Rate Credit	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1190	400	he	אשראי בריבית משתנה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1191	400	ru	Кредит с плавающей ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1192	401	en	Total amount	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1193	401	he	סכום כולל	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1194	401	ru	Общая сумма	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1195	402	en	Monthly payment	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1196	402	he	תשלום חודשי	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1197	402	ru	Ежемесячный платеж	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1198	403	en	Interest rate	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1199	403	he	שיעור ריבית	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1200	403	ru	Процентная ставка	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1201	404	en	Repayment period	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1202	404	he	תקופת החזר	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1203	404	ru	Период погашения	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1204	405	en	Variable rate based on Bank of Israel prime rate	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1205	405	he	ריבית משתנה המבוססת על ריבית הפריים של בנק ישראל	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1206	405	ru	Переменная ставка на основе прайм-ставки Банка Израиля	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1207	406	en	Fixed interest rate linked to inflation index	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1208	406	he	ריבית קבועה צמודה למדד המחירים לצרכן	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1209	406	ru	Фиксированная процентная ставка, привязанная к индексу инфляции	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1210	407	en	Variable interest rate linked to inflation index	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1211	407	he	ריבית משתנה צמודה למדד המחירים לצרכן	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1212	407	ru	Переменная процентная ставка, привязанная к индексу инфляции	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1213	408	en	Up to 33%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1214	408	he	עד 33%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1215	408	ru	До 33%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1216	409	en	Up to 70%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1217	409	he	עד 70%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1218	409	ru	До 70%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1219	410	en	Up to 75%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1220	410	he	עד 75%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1221	410	ru	До 75%	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1222	411	en	4-30 years	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1223	411	he	4-30 שנים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1224	411	ru	4-30 лет	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1225	412	en	5-30 years	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1226	412	he	5-30 שנים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1227	412	ru	5-30 лет	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1228	413	en	4-25 years	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1229	413	he	4-25 שנים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1230	413	ru	4-25 лет	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1231	414	en	Prime + Bank margin	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1232	414	he	פריים + מרווח בנק	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1233	414	ru	Прайм + банковская маржа	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1234	415	en	Fixed rate + CPI	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1235	415	he	ריבית קבועה + מדד	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1236	415	ru	Фиксированная ставка + ИПЦ	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1237	416	en	Variable rate + CPI	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1238	416	he	ריבית משתנה + מדד	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1239	416	ru	Переменная ставка + ИПЦ	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1240	417	en	Total repayment	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1241	417	he	סה"כ החזר	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1242	417	ru	Общая сумма возврата	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1243	418	en	Select this bank	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1246	419	en	Total repayment	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1247	419	he	סה"כ החזר	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1248	419	ru	Общая сумма возврата	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1249	420	en	Total amount	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1250	420	he	סכום כולל	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1251	420	ru	Общая сумма	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1252	421	en	Monthly payment	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1253	421	he	תשלום חודשי	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1254	421	ru	Ежемесячный платеж	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1255	422	en	Desired credit amount	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1256	422	he	סכום האשראי הרצויה	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1257	422	ru	Желаемая сумма кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1258	423	en	Enter credit amount	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1259	423	he	הזן סכום האשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1260	423	ru	Введите сумму кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1261	424	en	Credit purpose	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1262	424	he	מטרת האשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1263	424	ru	Цель кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1264	425	en	Select credit purpose	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1265	425	he	בחר מטרת אשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1266	425	ru	Выберите цель кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1267	426	en	Vehicle purchase	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1268	426	he	רכישת רכב	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1269	426	ru	Покупка автомобиля	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1270	427	en	Home renovation	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1271	427	he	שיפוץ בית	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1272	427	ru	Ремонт дома	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1273	428	en	Wedding and events	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1274	428	he	חתונה ואירועים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1275	428	ru	Свадьба и мероприятия	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1276	429	en	Business investment	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1277	429	he	השקעה עסקית	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1278	429	ru	Бизнес-инвестиции	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1279	430	en	Improve future credit eligibility	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1280	430	he	שיפור זכאות אשראי עתידית	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1281	430	ru	Улучшение кредитной истории	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1282	431	en	Other	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1283	431	he	אחר	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1284	431	ru	Другое	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1285	432	en	Desired repayment period	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1286	432	he	תקופת פירעון רצויה	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1287	432	ru	Желаемый период погашения	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1288	433	en	Select repayment period	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1289	433	he	בחר תקופת פירעון	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1290	433	ru	Выберите период погашения	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1291	434	en	Up to one year	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1292	434	he	עד שנה אחת	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1293	434	ru	До одного года	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1294	435	en	Up to two years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1295	435	he	עד שנתיים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1296	435	ru	До двух лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1297	436	en	Up to 3 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1298	436	he	עד 3 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1299	436	ru	До 3 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1300	437	en	Up to 5 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1301	437	he	עד 5 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1302	437	ru	До 5 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1303	438	en	Over 5 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1304	438	he	מעל 5 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1305	438	ru	Свыше 5 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1306	439	en	Over 7 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1307	439	he	מעל 7 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1308	439	ru	Свыше 7 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1309	440	en	Over 10 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1310	440	he	מעל 10 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1311	440	ru	Свыше 10 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1312	441	en	Credit calculator	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1313	441	he	מחשבון אשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1314	441	ru	Кредитный калькулятор	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1315	442	en	Get the best credit offers for you	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1316	442	he	קבל את הצעות האשראי הטובות ביותר עבורך	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1317	442	ru	Получите лучшие кредитные предложения для вас	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1318	443	en	Credit details	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1319	443	he	פרטי האשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1320	443	ru	Детали кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1321	444	en	Personal details	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1322	444	he	פרטים אישיים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1323	444	ru	Личные данные	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1324	445	en	Income details	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1325	445	he	פרטי הכנסה	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1326	445	ru	Детали дохода	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1327	446	en	Summary and results	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1244	418	he	בחר בנק זה	approved	2025-07-27 05:37:15.99225	2025-07-29 09:47:44.993108
1328	446	he	סיכום ותוצאות	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1329	446	ru	Сводка и результаты	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1330	447	en	Credit Calculation Results	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1331	447	he	תוצאות חישוב האשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1332	447	ru	Результаты расчета кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1333	448	en	The displayed offers are preliminary and subject to final bank approval. Actual terms may vary based on your complete financial profile.	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1334	448	he	ההצעות המוצגות הן ראשוניות וכפופות לאישור סופי של הבנק. התנאים בפועל עשויים להשתנות בהתבסס על הפרופיל הפיננסי המלא שלך.	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1335	448	ru	Отображаемые предложения являются предварительными и подлежат окончательному одобрению банка. Фактические условия могут отличаться в зависимости от вашего полного финансового профиля.	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1336	449	en	Your Credit Parameters	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1337	449	he	פרמטרי האשראי שלך	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1338	449	ru	Параметры вашего кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1339	450	en	Loan Amount	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1340	450	he	סכום ההלוואה	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1341	450	ru	Сумма займа	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1342	451	en	Credit Term	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1343	451	he	תקופת האשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1344	451	ru	Срок кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1345	452	en	months	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1346	452	he	חודשים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1347	452	ru	месяцев	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1348	453	en	Total expected interest	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1349	453	he	סך הריבית הצפויה	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1350	453	ru	Общие ожидаемые проценты	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1351	454	en	Total payment amount	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1352	454	he	סכום התשלום הכולל	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1353	454	ru	Общая сумма платежа	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1354	455	en	Calculate Credit	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1355	455	he	חישוב אשראי	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1356	455	ru	Расчет кредита	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1357	456	en	Best Rate	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1358	456	he	הריבית הטובה ביותר	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1359	456	ru	Лучшая ставка	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1360	457	en	Lowest Monthly Payment	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1361	457	he	התשלום החודשי הנמוך ביותר	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1362	457	ru	Самый низкий ежемесячный платеж	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1363	458	en	Fastest Approval	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1364	458	he	האישור המהיר ביותר	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1365	458	ru	Самое быстрое одобрение	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1366	459	en	My Bank	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1367	459	he	הבנק שלי	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1368	459	ru	Мой банк	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1369	460	en	Property Value	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1370	460	he	שווי הנכס	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1371	460	ru	Стоимость недвижимости	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1372	461	en	Your Profile	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1373	461	he	הפרופיל שלך	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1374	461	ru	Ваш профиль	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1375	462	en	Improve interest rate	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1376	462	he	שיפור הריבית	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1377	462	ru	Улучшить процентную ставку	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1378	463	en	Reduce credit amount	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1379	463	he	הקטנת סכום האשראי	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1380	463	ru	Уменьшить сумму кредита	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1381	464	en	Increase term to reduce payment	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1382	464	he	הארכת התקופה להקטנת התשלום	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1383	464	ru	Увеличить срок для снижения платежа	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1384	465	en	Increase payment to reduce term	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1385	465	he	הגדלת התשלום להקטנת התקופה	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1386	465	ru	Увеличить платеж для сокращения срока	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1387	466	en	Credit Refinance	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1388	466	he	מחזור אשראי	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1389	466	ru	Рефинансирование кредита	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1390	467	en	Credit Refinance	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1391	467	he	מחזור אשראי	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1392	467	ru	Рефинансирование кредита	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1393	468	en	We will select the best market offers for you	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1394	468	he	נאתר ונציג בפניכם את ההצעות המשתלמות ביותר הקיימות בשוק הפיננסי	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1395	468	ru	Мы найдем и представим вам наиболее выгодные предложения, существующие на финансовом рынке	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1396	469	en	Step 1 - Credit Refinancing	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1397	469	he	שלב 1 - מחזור אשראי	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1398	469	ru	Шаг 1 - Рефинансирование кредита	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1399	470	en	Step 2 - Personal Details	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1400	470	he	שלב 2 - פרטים אישיים	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1401	470	ru	Шаг 2 - Личные данные	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1402	471	en	Step 3 - Income Details	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1403	471	he	שלב 3 - פרטי הכנסה	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1404	471	ru	Шаг 3 - Данные о доходах	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1405	472	en	Step 4 - Application Summary	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1406	472	he	שלב 4 - סיכום הבקשה	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1407	472	ru	Шаг 4 - Итоги заявки	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1408	473	en	Select goal	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1409	473	he	בחר מטרה	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1410	473	ru	Выберите цель	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1754	588	he	יש להזין את ההון העצמי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1755	588	ru	Пожалуйста, введите первоначальный взнос	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1756	589	en	Failed to load vacancies. Please try again later.	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1757	589	he	שגיאה בטעינת המשרות. אנא נסו שוב מאוחר יותר.	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1758	589	ru	Ошибка загрузки вакансий. Пожалуйста, попробуйте позже.	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1759	590	en	Maximum credit amount is ₪200,000	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1760	590	he	סכום האשראי המקסימלי הינו 200,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1761	590	ru	Максимальная сумма кредита составляет 200,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1762	591	en	Maximum repayment period is 60 months	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1763	591	he	תקופת החזר המקסימלית הינה 60 חודשים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1764	591	ru	Максимальный период погашения - 60 месяцев	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1765	592	en	Maximum mortgage period is 30 years	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1766	592	he	תקופת המשכנתא המקסימלית היא 30 שנים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1767	592	ru	Максимальный срок ипотеки 30 лет	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1768	593	en	Maximum price is 10,000,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1769	593	he	המחיר המקסימלי הוא 10,000,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1770	593	ru	Максимальная цена 10,000,000 ₪	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1771	594	en	Please select health insurance status	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1772	594	he	יש לבחור סטטוס ביטוח בריאות	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1773	594	ru	Пожалуйста, выберите статус медицинского страхования	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1774	595	en	Minimum repayment period is 12 months	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1775	595	he	תקופת החזר המינימלית הינה 12 חודשים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1776	595	ru	Минимальный период погашения - 12 месяцев	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1777	596	en	Minimum monthly payment is 2,654 ₪, otherwise the repayment period will exceed 30 years	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1778	596	he	התשלום החודשי המינימלי הוא 2,654 ₪, אחרת תקופת ההחזר תעלה על 30 שנים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1779	596	ru	Минимальный ежемесячный платеж составляет 2,654 ₪, иначе срок погашения превысит 30 лет	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1780	597	en	Minimum mortgage period is 4 years	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1781	597	he	תקופת המשכנתא המינימלית היא 4 שנים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1782	597	ru	Минимальный срок ипотеки 4 года	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1783	598	en	Please enter monthly payment	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1784	598	he	יש להזין את התשלום החודשי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1785	598	ru	Пожалуйста, введите ежемесячный платеж	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1786	599	en	Balance must be positive	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1787	599	he	היתרה חייבת להיות חיובית	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1788	599	ru	Остаток должен быть положительным	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1789	600	en	Please fill in balance	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1790	600	he	יש למלא יתרה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1791	600	ru	Пожалуйста, укажите остаток	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1792	601	en	Interest rate must be positive	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1793	601	he	הריבית חייבת להיות חיובית	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1794	601	ru	Процентная ставка должна быть положительной	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1795	602	en	Please fill in interest rate	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1796	602	he	יש למלא ריבית	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1797	602	ru	Пожалуйста, укажите процентную ставку	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1798	603	en	Please select end date	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1799	603	he	יש לבחור תאריך סיום	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1800	603	ru	Пожалуйста, выберите дату окончания	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1801	604	en	Monthly payment must be positive	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1802	604	he	התשלום החודשי חייב להיות חיובי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1803	604	ru	Ежемесячный платеж должен быть положительным	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1804	605	en	Please select mortgage program	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1805	605	he	יש לבחור תוכנית משכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1806	605	ru	Пожалуйста, выберите программу ипотеки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1807	606	en	Please select mortgage type	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1808	606	he	יש לבחור סוג משכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1809	606	ru	Пожалуйста, выберите тип ипотеки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1810	607	en	Must enter name in Hebrew	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1811	607	he	חובה להזין שם בשפה העברית	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1812	607	ru	Обязательно введите имя на русском языке	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1813	608	en	Please select if your partner will participate in the mortgage	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1814	608	he	יש לבחור האם בן/ת הזוג ישתתף במשכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1815	608	ru	Пожалуйста, выберите будет ли ваш партнер участвовать в ипотеке	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1816	609	en	Please enter mortgage period	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1817	609	he	יש להזין את תקופת המשכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1818	609	ru	Пожалуйста, введите срок ипотеки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1819	610	en	Please enter property value	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1820	610	he	יש להזין את שווי הנכס	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1821	610	ru	Пожалуйста, введите стоимость недвижимости	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1822	611	en	Please select public person status	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1823	611	he	יש לבחור סטטוס נבחר ציבור	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1824	611	ru	Пожалуйста, выберите статус публичного лица	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1825	612	en	Required to enter number of borrowers	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1826	612	he	נדרש להזין מספר לווים	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1827	612	ru	Необходимо указать количество заемщиков	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1828	613	en	Mortgage balance cannot be greater than property value	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1829	613	he	יתרת המשכנתא לא יכולה להיות גדולה מערך הנכס	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1830	613	ru	Остаток по ипотеке не может быть больше чем стоимость недвижимости	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1831	614	en	Please select your current bank	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1832	614	he	יש לבחור בנק בה נמצאת המשכנתא שלכם כרגע	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1833	614	ru	Пожалуйста, выберите ваш текущий банк	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1834	615	en	The sum of mortgage balances does not match the specified value	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1835	615	he	סכום יתרות המשכנתאות לא תואם לערך שהוזן	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1836	615	ru	Сумма балансов ипотек не соответствует заданному значению	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1837	616	en	Full property value cannot be less than mortgage balance	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1838	616	he	ערך הנכס המלא לא יכול להיות קטן מיתרת המשכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1839	616	ru	Полная стоимость недвижимости не может быть меньше чем остаток ипотеки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1840	617	en	Please specify if the mortgage is registered	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1841	617	he	יש לציין האם המשכנתא רשומה בטאבו	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1842	617	ru	Пожалуйста, укажите, зарегистрирована ли ипотека	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1843	618	en	Please select mortgage start date	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1844	618	he	יש לבחור תאריך תחילת המשכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1845	618	ru	Пожалуйста, выберите дату начала ипотеки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1846	619	en	Please select current interest type	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1847	619	he	יש לבחור סוג ריבית נוכחית	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1848	619	ru	Пожалуйста, выберите тип текущей процентной ставки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1849	620	en	Please select the purpose of mortgage refinancing	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1850	620	he	יש לבחור מטרת מחזור המשכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1851	620	ru	Пожалуйста, выберите цель рефинансирования ипотеки	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1852	621	en	Required field	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1853	621	he	שדה חובה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1854	621	ru	Обязательное поле	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1855	622	en	Please select an option	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1856	622	he	יש לבחור אפשרות	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1857	622	ru	Пожалуйста, выберите вариант	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1858	623	en	Must enter professional field of activity	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1859	623	he	חובה להזין תחום פעילות מקצועי	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1860	623	ru	Обязательно укажите профессиональную сферу деятельности	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1861	624	en	Please select one of the displayed options	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1862	624	he	יש לבחור אחד מהאפשרויות המוצגות	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1863	624	ru	Выберите один из представленных вариантов	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1864	625	en	Please select tax payment countries	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1865	625	he	יש לבחור מדינות תשלום מס	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1866	625	ru	Пожалуйста, выберите страны уплаты налогов	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1867	626	en	Please select income tax status	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1868	626	he	יש לבחור סטטוס מס הכנסה	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1869	626	ru	Пожалуйста, выберите статус подоходного налога	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1870	627	en	Please select when you need the mortgage	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1871	627	he	יש לבחור מתי תזדקק למשכנתא	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1872	627	ru	Пожалуйста, выберите когда вам нужна ипотека	approved	2025-07-27 12:50:28.791829	2025-07-27 12:50:28.791829
1890	633	ru	Франшиза для риэлторов	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1891	634	en	Our services	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1893	634	ru	Наши услуги	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1894	635	en	Lawyer partnership program	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1873	628	en	About us	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1876	629	en	Partner financial institutions	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1878	629	ru	Финансовые учреждения-партнеры	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1585	532	en	About us	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1586	532	he	אודותינו	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1587	532	ru	О нас	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1588	533	en	Contact administration	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1589	533	he	פנייה להנהלה	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1590	533	ru	Обратиться к администрации	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1591	534	en	Company	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1592	534	he	החברה	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1593	534	ru	Компания	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1594	535	en	Contact information	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1595	535	he	פרטי התקשרות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1596	535	ru	Контактная информация	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1597	536	en	Contacts	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1598	536	he	יצירת קשר	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1599	536	ru	Контакты	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1600	537	en	Contacts	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1601	537	he	יצירת קשר	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1602	537	ru	Контакты	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1603	538	en	Cookie policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1604	538	he	מדיניות עוגיות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1605	538	ru	Политика файлов cookie	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1606	539	en	Cookie policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1607	539	he	מדיניות עוגיות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1608	539	ru	Политика файлов cookie	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1609	540	en	Cooperation	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1610	540	he	שיתוף פעולה	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1611	540	ru	Сотрудничество	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1612	541	en	2023 All rights reserved Bankimonline Inc ©	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1613	541	he	2023 כל הזכויות שמורות Bankimonline Inc ©	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1614	541	ru	2023 Все права защищены Bankimonline Inc ©	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1615	542	en	info@bankimonline.com	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1616	542	he	info@bankimonline.com	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1617	542	ru	info@bankimonline.com	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1618	543	en	Legal matters	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1619	543	he	סוגיות משפטיות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1620	543	ru	Правовые вопросы	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1621	544	en	Terms of use	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1622	544	he	תנאי שימוש	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1623	544	ru	Условия использования	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1624	545	en	Privacy policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1625	545	he	מדיניות פרטיות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1626	545	ru	Политика конфиденциальности	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1627	546	en	Cookie policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1628	546	he	מדיניות עוגיות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1629	546	ru	Политика файлов cookie	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1630	547	en	Refund policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1631	547	he	מדיניות החזרים	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1632	547	ru	Политика возвратов	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1633	548	en	Navigation	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1634	548	he	ניווט	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1635	548	ru	Навигация	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1636	549	en	Partnership	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1637	549	he	שותפות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1638	549	ru	Партнерство	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1639	550	en	+972 04-623-2280	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1640	550	he	+972 04-623-2280	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1641	550	ru	+972 04-623-2280	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1642	551	en	Privacy policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1643	551	he	מדיניות פרטיות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1644	551	ru	Политика конфиденциальности	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1645	552	en	Return policy	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1646	552	he	מדיניות החזרות	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1647	552	ru	Политика возвратов	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1648	553	en	Follow us	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1649	553	he	עקבו אחרינו	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1650	553	ru	Следите за нами	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1651	554	en	Technical support	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1652	554	he	תמיכה טכנית	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1653	554	ru	Техническая поддержка	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1654	555	en	Broker tenders	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1655	555	he	מכרזים לברוקרים	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1656	555	ru	Тендеры для брокеров	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1657	556	en	Lawyer tenders	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1658	556	he	מכרזים לעורכי דין	approved	2025-07-27 12:48:43.590425	2025-07-27 12:48:43.590425
1879	630	en	Franchise for Real Estate Brokers	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1880	630	he	זיכיון למתווכי נדל"ן	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1881	630	ru	Франшиза для брокеров недвижимости	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1882	631	en	Contact us	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1883	631	he	צור קשר	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1884	631	ru	Связаться с нами	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1885	632	en	Broker franchise	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1886	632	he	זיכיון לברוקרים	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1874	628	he	אודותינו2	approved	2025-07-27 12:56:06.958598	2025-07-31 19:35:58.276888
1895	635	he	תוכנית שותפים לעורכי דין	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1896	635	ru	Партнерская программа для юристов	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1897	636	en	Referral program	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1898	636	he	תכנית הפניות	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1899	636	ru	Реферальная программа	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1900	637	en	Bank Hapoalim	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1901	637	he	בנק הפועלים	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1902	637	ru	Банк Апоалим	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1903	638	en	International Bank	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1904	638	he	בנק בינלאומי	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1905	638	ru	Банк Бейнлеуми	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1906	639	en	Discount Bank	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1907	639	he	בנק דיסקונט	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1908	639	ru	Банк Дисконт	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1909	640	en	Bank of Jerusalem	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1910	640	he	בנק ירושלים	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1911	640	ru	Банк Иерусалим	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1912	641	en	Bank Leumi	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1913	641	he	בנק לאומי	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1914	641	ru	Банк Леуми	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1915	642	en	Mercantile Discount Bank	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1916	642	he	בנק מרכנתיל דיסקונט	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1917	642	ru	Банк Меркантиль Дисконт	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1918	643	en	Credit Calculation	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1919	643	he	חישוב אשראי	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1920	643	ru	Расчет кредита	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1921	644	en	Mortgage calculation	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1922	644	he	חישוב משכנתא	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1923	644	ru	Расчет ипотеки	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1924	645	en	Credit Refinancing	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1925	645	he	מחזור אשראי	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1926	645	ru	Рефинансирование кредита	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1927	646	en	Mortgage Refinancing	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1928	646	he	מחזור משכנתא	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1929	646	ru	Рефинансирование ипотеки	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1930	647	en	Job vacancies	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1931	647	he	משרות פנויות	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1932	647	ru	Открытые вакансии	approved	2025-07-27 12:56:06.958598	2025-07-27 12:56:06.958598
1933	648	en	Calculate Mortgage	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1934	648	he	חישוב משכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1935	648	ru	Рассчитать ипотеку	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1936	649	en	Add partner	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1937	649	he	הוסף שותף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1938	649	ru	Добавить партнера	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1939	650	en	Add	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1940	650	he	הוסף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1941	650	ru	Добавить	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1942	651	en	__MIGRATED_Personal information	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1943	651	he	מידע אישי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1944	651	ru	Личная информация	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1945	652	en	Get the most suitable mortgage offers for you	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1946	652	he	קבל את הצעות המשכנתא המתאימות ביותר עבורך	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1947	652	ru	Получите наиболее подходящие предложения по ипотеке для вас	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1948	653	en	Date of birth	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1949	653	he	תאריך לידה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1950	653	ru	Дата рождения	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1951	654	en	Mortgage calculator	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1952	654	he	מחשבון משכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1953	654	ru	Ипотечный калькулятор	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1954	655	en	Citizenship	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1955	655	he	אזרחות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1956	655	ru	Гражданство	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1957	656	en	France	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1958	656	he	צרפת	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1959	656	ru	Франция	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1960	657	en	United Kingdom	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1961	657	he	בריטניה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1962	657	ru	Великобритания	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1963	658	en	Canada	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1964	658	he	קנדה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1965	658	ru	Канада	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1966	659	en	Ukraine	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1967	659	he	אוקראינה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1968	659	ru	Украина	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1969	660	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1970	660	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1971	660	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1972	661	en	Increase the monthly payment and pay less interest	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1973	661	he	הגדילו את התשלום החודשי ותשלמו פחות ריבית	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1974	661	ru	Увеличьте ежемесячный платеж и платите меньше процентов	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1975	662	en	Do you have bank debts or existing financial obligations?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1976	662	he	 האם יש לכם חובות בנקאיים או התחייבויות פיננסיות קיימות?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1977	662	ru	Имеете ли вы банковские долги или существующие финансовые обязательства?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1978	663	en	No obligations	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1979	663	he	אין התחייבות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1980	663	ru	Нет обязательств	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1981	664	en	Bank loan	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1982	664	he	הלוואה בנקאית	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1983	664	ru	Банковский кредит	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1984	665	en	Consumer credit	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1985	665	he	אשראי צרכני	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1986	665	ru	Потребительский кредит	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1987	666	en	Credit card debt	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1988	666	he	חוב כרטיס אשראי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1989	666	ru	Долг по кредитной карте	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1990	667	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1991	667	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1992	667	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1993	668	en	Select obligation type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1994	668	he	בחר סוג התחייבות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1995	668	ru	Выберите тип обязательства	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1996	669	en	Marital status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1997	669	he	מצב משפחתי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1998	669	ru	Семейное положение	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1999	670	en	Single	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2000	670	he	רווק/רווקה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2001	670	ru	Холост/не замужем	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2002	671	en	Married	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2003	671	he	נשוי/נשואה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2004	671	ru	Женат/замужем	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2005	672	en	Divorced	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2006	672	he	גרוש/גרושה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2007	672	ru	Разведен/разведена	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2008	673	en	Widowed	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2009	673	he	אלמן/אלמנה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2010	673	ru	Вдовец/вдова	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2011	674	en	Common-law partner	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2012	674	he	ידוע/ידועה בציבור	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2013	674	ru	Гражданский брак	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2014	675	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2015	675	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2016	675	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2017	676	en	Select marital status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2018	676	he	בחר מצב משפחתי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2019	676	ru	Выберите семейное положение	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2020	677	en	Mortgage Filter	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2021	677	he	מסנן משכנתאות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2022	677	ru	Фильтр ипотек	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2023	678	en	Is this a first home?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2024	678	he	האם מדובר בדירה ראשונה?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2025	678	ru	Это ваша первая квартира?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2026	679	en	Yes, first home	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2027	679	he	כן, דירה ראשונה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2028	679	ru	Да, первая квартира	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2029	680	en	No, additional property	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2030	680	he	לא, נכס נוסף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2031	680	ru	Нет, дополнительная недвижимость	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2032	681	en	Investment property	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2033	681	he	נכס ל השקעה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2034	681	ru	Инвестиционная недвижимость	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2035	682	en	Select property status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2036	682	he	בחר סטטוס הנכס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2037	682	ru	Выберите статус недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2038	683	en	Do you have additional income?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2039	683	he	האם קיימות הכנסות נוספות?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2040	683	ru	Имеются ли дополнительные доходы?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2041	684	en	None	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2042	684	he	אין הכנסות נוספות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2043	684	ru	Нет дополнительных доходов	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2044	685	en	Additional Salary	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2045	685	he	שכר נוסף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2046	685	ru	Дополнительная зарплата	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2047	686	en	Additional Work	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2048	686	he	עבודה נוספת	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2049	686	ru	Дополнительная работа	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2050	687	en	Property Rental	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2051	687	he	הכנסה מהשכרת נכסים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2052	687	ru	Доход от аренды недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2053	688	en	Investments	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2054	688	he	הכנסה מהשקעות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2055	688	ru	Доход от инвестиций	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2056	689	en	Pension	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2057	689	he	קצבת פנסיה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2058	689	ru	Пенсия	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2059	690	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2060	690	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2061	690	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2062	691	en	Select additional income type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2063	691	he	בחר סוג הכנסה נוספת	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2064	691	ru	Выберите тип дополнительного дохода	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2065	692	en	Number of children under 18	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2066	692	he	כמות ילדים מתחת לגיל 18	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2067	692	ru	Количество детей до 18 лет	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2068	693	en	__MIGRATED_Income details	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2069	693	he	פרטי הכנסה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2070	693	ru	Сведения о доходах	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2071	694	en	Down payment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2072	694	he	הון עצמי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2073	694	ru	Первоначальный взнос	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2074	695	en	Monthly payment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2075	695	he	תשלום חודשי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2076	695	ru	Ежемесячный платеж	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2077	696	en	Are you considered a foreign resident according to income tax law?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2078	696	he	 האם אתם נחשבים לתושבי חוץ על פי חוק מס הכנסה?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2079	696	ru	Считаетесь ли вы иностранным резидентом согласно закону подоходного налога?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2080	697	en	Are you insured with valid health insurance and covered by medical insurance rights?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2081	697	he	האם אתם מבוטחים בביטוח בריאות תקף וחלים עליכם זכויות ביטוח רפואי?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2082	697	ru	Имеете ли вы действующее медицинское страхование и распространяются ли на вас права медицинского страхования?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2083	698	en	Do you hold a senior public position or are you among close family/business partners of a public position holder?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2084	698	he	האם אתם מכהנים בתפקיד ציבורי בכיר או נמנים עם קרובי המשפחה/השותפים העסקיים של נושא תפקיד ציבורי?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2085	698	ru	Занимаете ли вы высокую государственную должность или являетесь родственником/деловым партнером лица, занимающего государственную должность?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2086	699	en	Main income source	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2087	699	he	מקור הכנסה עיקרי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2088	699	ru	Основной источник дохода	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2089	700	en	Employee	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2090	700	he	עובד שכיר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2091	700	ru	Наемный работник	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2092	701	en	Self-employed	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2093	701	he	עצמאי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2094	701	ru	Самозанятый	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2095	702	en	Pensioner	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2096	702	he	פנסיונר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2097	702	ru	Пенсионер	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2098	703	en	Student	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2099	703	he	סטודנט	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2100	703	ru	Студент	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2101	704	en	Unpaid leave	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2102	704	he	חופשה ללא תשלום	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2103	704	ru	Отпуск без содержания	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2104	705	en	Unemployed	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2105	705	he	מובטל	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2106	705	ru	Безработный	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2107	706	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2108	706	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2109	706	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2110	707	en	Select main income source	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2111	707	he	בחר מקור הכנסה עיקרי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2112	707	ru	Выберите основной источник дохода	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2113	708	en	Enter gross annual income	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2114	708	he	הזן את ההכנסה השנתית הברוטו	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2115	708	ru	Введите валовой годовой доход	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2116	709	en	Monthly Income	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2117	709	he	הכנסה חודשית	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2118	709	ru	Ежемесячный доход	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2119	710	en	Full name	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2120	710	he	שם מלא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2121	710	ru	Полное имя	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2122	711	en	Enter first name and last name	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2123	711	he	הזן שם פרטי ושם משפחה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2124	711	ru	Введите имя и фамилию	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2125	712	en	Calculation Parameters	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2126	712	he	פרמטרי החישוב	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2127	712	ru	Параметры расчета	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2128	713	en	Mortgage cost	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2129	713	he	עלות המשכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2130	713	ru	Стоимость ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2131	714	en	Basic parameters	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2132	714	he	נתוני בסיס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2133	714	ru	Базовые данные	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2134	715	en	months	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2135	715	he	חודשים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2136	715	ru	месяцев	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2137	716	en	Mortgage period	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2138	716	he	תקופת המשכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2139	716	ru	Период ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2140	717	en	Will the partner participate in mortgage payments?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2141	717	he	האם השותף ישתתף בתשלומי המשכנתא?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2142	717	ru	Будет ли партнер участвовать в платежах по ипотеке?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2143	718	en	Property price	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2144	718	he	שווי הנכס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2145	718	ru	Стоимость недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2146	719	en	Personal profile details	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2147	719	he	פרטי הפרופיל האישי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2148	719	ru	Данные личного профиля	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2149	720	en	Professional field of activity	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2150	720	he	תחום פעילות מקצועי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2151	720	ru	Профессиональная сфера деятельности	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2152	721	en	Field of Activity	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2153	721	he	תחום פעילות מקצועי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2154	721	ru	Профессиональная сфера деятельности	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2155	722	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2156	722	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2157	722	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2158	723	en	Law and Consulting	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2159	723	he	משפטים ויעוץ עסקי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2160	723	ru	Юриспруденция и бизнес-консалтинг	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2161	724	en	Engineering and Construction	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2162	724	he	הנדסה ובנייה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2163	724	ru	Инженерия и строительство	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2164	725	en	Sales and Marketing	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2165	725	he	מכירות ושיווק	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2166	725	ru	Продажи и маркетинг	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2167	726	en	Services and Hospitality	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2168	726	he	שירותים ואירוח	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2169	726	ru	Услуги и гостеприимство	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2170	727	en	Manufacturing and Logistics	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2171	727	he	ייצור ולוגיסטיקה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2172	727	ru	Производство и логистика	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2173	728	en	Field of activity	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2174	728	he	תחום פעילות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2175	728	ru	Сфера деятельности	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2176	729	en	Are you liable to pay tax in foreign countries or additional jurisdictions?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2177	729	he	האם אתם חייבים במס במדינות זרות או בתחומי שיפוט נוספים?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2178	729	ru	Обязаны ли вы платить налоги в зарубежных странах или других юрисдикциях?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2179	730	en	Calculate Mortgage	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2180	730	he	חישוב משכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2181	730	ru	Рассчитать ипотеку	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2185	732	en	Apartment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2186	732	he	דירה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2187	732	ru	Квартира	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2188	733	en	Private house	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2189	733	he	בית פרטי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2190	733	ru	Частный дом	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2191	734	en	Garden apartment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2192	734	he	דירת גן	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2193	734	ru	Квартира с садом	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2194	735	en	Penthouse	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2195	735	he	פנטהאוס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2196	735	ru	Пентхаус	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2197	736	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2198	736	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2199	736	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2200	737	en	Select mortgage type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2201	737	he	בחר סוג משכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2202	737	ru	Выберите тип ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2203	738	en	When do you need the mortgage?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2204	738	he	מתי תזדקק למשכנתא?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2205	738	ru	Когда вам нужна ипотека?	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2206	739	en	Within 3 months	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2207	739	he	תוך 3 חודשים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2208	739	ru	До 3 месяцев	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2209	740	en	Within 3-6 months	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2210	740	he	תוך 3-6 חודשים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2211	740	ru	3-6 месяцев	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2212	741	en	Within 6-12 months	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2213	741	he	תוך 6-12 חודשים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2214	741	ru	6-12 месяцев	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2215	742	en	Over 12 months	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2216	742	he	מעל 12 חודשים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2217	742	ru	Более 12 месяцев	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2218	743	en	Select period	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2219	743	he	בחר תקופה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2220	743	ru	Выберите временной период	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2221	744	en	Select timeframe	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2222	744	he	בחר מסגרת זמן	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2223	744	ru	Выберите период	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2224	745	en	Mortgage Refinance	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2225	745	he	מחזור משכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2226	745	ru	Рефинансирование ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2242	751	en	Select Bank from List	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2243	751	he	בחר בנק מהרשימה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2244	751	ru	Выберите банк из списка	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2245	752	en	Reduce monthly payment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2246	752	he	הפחתת התשלום החודשי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2247	752	ru	Снижение ежемесячного платежа	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2248	753	en	Remaining Mortgage Balance	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2249	753	he	יתרת המשכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2250	753	ru	Остаток по ипотеке	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2251	754	en	Current Property Value	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2252	754	he	שווי הנכס הנוכחי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2253	754	ru	Текущая стоимость недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2254	755	en	Yes, Registered in Land Registry	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2255	755	he	כן, רשומה בטאבו	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2256	755	ru	Да, зарегистрирована в реестре	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2257	756	en	No, Not Registered	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2258	756	he	לא, לא רשומה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2259	756	ru	Нет, не зарегистрирована	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2263	758	en	Select Registration Status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2264	758	he	בחר אפשרות רישום	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2265	758	ru	Выберите вариант регистрации	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2266	759	en	Step 1 - Existing mortgage details	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2267	759	he	שלב 1 - פרטי המשכנתא הקיימת	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2268	759	ru	Шаг 1 - Данные существующей ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2269	760	en	Step 2 - Personal details	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2270	760	he	שלב 2 - פרטים אישיים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2271	760	ru	Шаг 2 - Личные данные	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2272	761	en	Step 3 - Income details	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2273	761	he	שלב 3 - פרטי הכנסה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2274	761	ru	Шаг 3 - Сведения о доходах	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2275	762	en	Step 4 - Application summary	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2276	762	he	שלב 4 - סיכום הבקשה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2277	762	ru	Шаг 4 - Итоги заявки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2281	764	en	Select Interest Type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2282	764	he	בחר סוג נכס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2283	764	ru	Выберите тип недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2284	765	en	Purpose of Mortgage Refinance	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2285	765	he	מטרת מחזור המשכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2286	765	ru	Цель рефинансирования ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2287	766	en	Lower Interest Rate	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2288	766	he	הפחתת הריבית	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2289	766	ru	Снижение процентной ставки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2290	767	en	Reduce Monthly Payment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2291	767	he	הפחתת התשלום החודשי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2292	767	ru	Снижение ежемесячного платежа	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2293	768	en	Shorten Mortgage Term	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2294	768	he	קיצור תקופת המשכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2295	768	ru	Сокращение срока ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2296	769	en	Cash Out Refinance	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2297	769	he	משיכת מזומן נוסף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2298	769	ru	Получение дополнительных наличных	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2299	770	en	Consolidate Debts	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2300	770	he	איחוד חובות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2301	770	ru	Консолидация долгов	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2302	771	en	Select Refinance Purpose	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2303	771	he	בחר מטרת מחזור	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2304	771	ru	Выберите цель рефинансирования	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2305	772	en	Next	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2306	772	he	הבא	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2229	746	ru	[\n                {"value": "bank_hapoalim", "label": "Банк Апоалим"},\n                {"value": "bank_leumi", "label": "Банк Леуми"},\n                {"value": "bank_discount", "label": "Банк Дисконт"},\n                {"value": "mizrahi_tefahot", "label": "Мизрахи Тфахот"},\n                {"value": "first_international", "label": "Первый международный банк"},\n                {"value": "other", "label": "Другой банк"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.966742
2227	746	en	[\n                {"value": "bank_hapoalim", "label": "Bank Hapoalim"},\n                {"value": "bank_leumi", "label": "Bank Leumi"},\n                {"value": "bank_discount", "label": "Bank Discount"},\n                {"value": "mizrahi_tefahot", "label": "Mizrahi Tefahot Bank"},\n                {"value": "first_international", "label": "First International Bank"},\n                {"value": "other", "label": "Other Bank"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.219524
2261	757	he	[\n                {"value": "yes", "label": "כן, רשומה בטאבו"},\n                {"value": "no", "label": "לא, לא רשומה בטאבו"},\n                {"value": "unknown", "label": "לא יודע"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.495779
2278	763	en	[\n                {"value": "fixed", "label": "Fixed Interest Rate"},\n                {"value": "variable", "label": "Variable Interest Rate"},\n                {"value": "mixed", "label": "Mixed Interest Rate"},\n                {"value": "prime", "label": "Prime Interest Rate"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.989851
2307	772	ru	Далее	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2308	773	en	Back	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2309	773	he	חזור	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2310	773	ru	Назад	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2311	774	en	Submit	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2312	774	he	שלח	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2313	774	ru	Отправить	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2314	775	en	Save	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2315	775	he	Save	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2316	775	ru	Save	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2317	776	en	Cancel	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2318	776	he	Cancel	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
2319	776	ru	Cancel	approved	2025-07-27 13:29:15.173536	2025-07-27 13:29:15.173536
25	10	en	Partner program	approved	2025-07-21 10:23:43.79867	2025-07-28 08:31:24.540467
26	10	he	תוכנית שותפים	approved	2025-07-21 10:23:43.882538	2025-07-28 08:31:24.540467
27	10	ru	Партнерская программа	approved	2025-07-21 10:23:43.966542	2025-07-28 08:31:24.540467
28	11	en	Broker franchise	approved	2025-07-21 10:23:44.134594	2025-07-28 08:31:24.540467
29	11	he	זכיון מתווכים	approved	2025-07-21 10:23:44.218144	2025-07-28 08:31:24.540467
30	11	ru	Брокерская франшиза	approved	2025-07-21 10:23:44.301886	2025-07-28 08:31:24.540467
31	12	en	Lawyer partner program	approved	2025-07-21 10:23:44.471023	2025-07-28 08:31:24.540467
32	12	he	תוכנית שותפים עורכי דין	approved	2025-07-21 10:23:44.555481	2025-07-28 08:31:24.540467
33	12	ru	Партнерская программа юристов	approved	2025-07-21 10:23:44.640978	2025-07-28 08:31:24.540467
34	13	en	About us	approved	2025-07-21 10:23:44.808138	2025-07-28 08:31:24.540467
35	13	he	אודותינו	approved	2025-07-21 10:23:44.892497	2025-07-28 08:31:24.540467
36	13	ru	О нас	approved	2025-07-21 10:23:44.978803	2025-07-28 08:31:24.540467
37	14	en	We are leaders in the field of financing offer comparison and help our clients find the best financial solution for them.	approved	2025-07-21 10:23:45.147215	2025-07-28 08:31:24.540467
38	14	he	אנחנו מובילים בתחום השוואת הצעות מימון ועוזרים ללקוחותינו למצוא את הפתרון הפיננסי הטוב ביותר עבורם.	approved	2025-07-21 10:23:45.230857	2025-07-28 08:31:24.540467
39	14	ru	Мы лидеры в области сравнения финансовых предложений и помогаем нашим клиентам найти лучшее финансовое решение для них.	approved	2025-07-21 10:23:45.316122	2025-07-28 08:31:24.540467
40	15	en	Contact us	approved	2025-07-21 10:23:45.483172	2025-07-28 08:31:24.540467
41	15	he	צור קשר	approved	2025-07-21 10:23:45.566772	2025-07-28 08:31:24.540467
42	15	ru	Связаться с нами	approved	2025-07-21 10:23:45.652124	2025-07-28 08:31:24.540467
43	16	en	Main office	approved	2025-07-21 10:23:45.82926	2025-07-28 08:31:24.540467
44	16	he	משרד ראשי	approved	2025-07-21 10:23:45.915665	2025-07-28 08:31:24.540467
45	16	ru	Главный офис	approved	2025-07-21 10:23:45.999626	2025-07-28 08:31:24.540467
46	17	en	Strategic Business Opportunity in Real Estate	approved	2025-07-21 10:23:46.171748	2025-07-28 08:31:24.540467
47	17	he	הזדמנות עסקית אסטרטגית בנדלן	approved	2025-07-21 10:23:46.257835	2025-07-28 08:31:24.540467
48	17	ru	Стратегическая бизнес возможность в недвижимости	approved	2025-07-21 10:23:46.341923	2025-07-28 08:31:24.540467
7	4	en	About	approved	2025-07-21 10:23:41.59332	2025-07-28 08:31:24.540467
8	4	he	אודות	approved	2025-07-21 10:23:41.677099	2025-07-28 08:31:24.540467
9	4	ru	О нас	approved	2025-07-21 10:23:41.760675	2025-07-28 08:31:24.540467
10	5	en	Jobs	approved	2025-07-21 10:23:41.928001	2025-07-28 08:31:24.540467
11	5	he	משרות	approved	2025-07-21 10:23:42.048378	2025-07-28 08:31:24.540467
12	5	ru	Вакансии	approved	2025-07-21 10:23:42.131936	2025-07-28 08:31:24.540467
13	6	en	Contact	approved	2025-07-21 10:23:42.30821	2025-07-28 08:31:24.540467
14	6	he	צור קשר	approved	2025-07-21 10:23:42.434225	2025-07-28 08:31:24.540467
15	6	ru	Контакты	approved	2025-07-21 10:23:42.519552	2025-07-28 08:31:24.540467
163	57	en	Education	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
164	57	he	השכלה	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
165	57	ru	Образование	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
166	58	en	Select your education level	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
167	58	he	בחר את רמת ההשכלה שלך	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
168	58	ru	Выберите уровень образования	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
169	59	en	No high school diploma	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
170	59	he	ללא תעודת בגרות	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
171	59	ru	Без аттестата о среднем образовании	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
172	60	en	Partial high school diploma	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
173	60	he	תעודת בגרות חלקית	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
174	60	ru	Частичный аттестат о среднем образовании	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
175	61	en	Full high school diploma	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
176	61	he	תעודת בגרות מלאה	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
177	61	ru	Полный аттестат о среднем образовании	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
178	62	en	Post-secondary education	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
179	62	he	השכלה על-תיכונית	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
180	62	ru	Послесреднее образование	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
182	63	he	תואר ראשון	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
183	63	ru	Высшее образование (бакалавриат)	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
184	64	en	Master's degree	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
185	64	he	תואר שני	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
17	7	he	זכיון זמני למתווכים 	approved	2025-07-21 10:23:42.780936	2025-07-29 22:05:43.505309
16	7	en	Temporary Franchise for Brokers	approved	2025-07-21 10:23:42.696386	2025-07-29 22:05:43.986213
1	2	en	Company	rejected	2025-07-21 10:23:40.898747	2025-07-30 13:33:22.631166
24	9	ru	Партнерские финансовые учреждения	approved	2025-07-21 10:23:43.62339	2025-07-31 19:36:31.832077
23	9	he	מוסדות פיננסיים שותפים 2	approved	2025-07-21 10:23:43.531976	2025-07-31 19:36:32.310027
22	9	en	Partner financial institutions	approved	2025-07-21 10:23:43.439587	2025-07-31 19:36:32.498502
21	8	ru	Бизнес	approved	2025-07-21 10:23:43.251762	2025-07-31 20:04:36.777637
20	8	he	עסקים 2	approved	2025-07-21 10:23:43.163954	2025-07-31 20:04:36.964286
19	8	en	Business	approved	2025-07-21 10:23:43.06714	2025-07-31 20:04:37.152284
6	3	ru	Наши услуги	approved	2025-07-21 10:23:41.421807	2025-07-31 20:05:20.84542
5	3	he	השירותים שלנו2	approved	2025-07-21 10:23:41.32845	2025-07-31 20:05:21.04329
4	3	en	Our services	approved	2025-07-21 10:23:41.243821	2025-07-31 20:05:21.241174
186	64	ru	Высшее образование (магистратура)	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
187	65	en	Doctoral degree	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
188	65	he	תואר שלישי	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
189	65	ru	Высшее образование (докторантура)	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
317	109	en	Education Level	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
318	110	en	Please select your education level	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
319	111	en	Elementary School	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
320	112	en	High School	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
321	113	en	Professional Certificate	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
322	114	en	Bachelor's Degree	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
323	115	en	Master's Degree	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
324	116	en	Doctorate	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
325	117	en	Other	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
326	118	en	Family Status	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
327	119	en	Please select your family status	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
328	120	en	Single	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
329	121	en	Married	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
330	122	en	Divorced	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
331	123	en	Widowed	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
332	124	en	Common Law Marriage	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
333	125	en	Other	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
334	126	en	Citizenship Status	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
335	127	en	Please select your citizenship status	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
336	128	en	Israeli Citizen	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
337	129	en	New Immigrant	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
338	130	en	Foreign Resident	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
339	131	en	Do you have medical insurance?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
340	132	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
341	133	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
342	134	en	Are you a foreign resident?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
343	135	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
344	136	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
345	137	en	Are you a public person or PEP?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
346	138	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
347	139	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
348	140	en	Do you report to US tax authorities?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
349	141	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
350	142	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
351	143	en	Continue	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
352	144	en	Back	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
353	108	he	פרטים אישיים	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
354	109	he	רמת השכלה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
355	110	he	אנא בחר את רמת השכלתך	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
356	111	he	בית ספר יסודי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
357	112	he	תיכון	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
358	113	he	תעודה מקצועית	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
359	114	he	תואר ראשון	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
360	115	he	תואר שני	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
361	116	he	דוקטורט	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
362	117	he	אחר	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
363	118	he	מצב משפחתי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
364	119	he	אנא בחר את מצבך המשפחתי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
365	120	he	רווק/ה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
366	121	he	נשוי/אה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
367	122	he	גרוש/ה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
368	123	he	אלמן/ה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
369	124	he	זוגיות ללא נישואין	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
370	125	he	אחר	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
371	126	he	סטטוס אזרחות	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
372	127	he	אנא בחר את סטטוס האזרחות שלך	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
373	128	he	אזרח ישראלי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
374	129	he	עולה חדש	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
375	130	he	תושב זר	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
376	131	he	האם יש לך ביטוח רפואי?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
377	132	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
378	133	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
379	134	he	האם אתה תושב זר?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
380	135	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
381	136	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
382	137	he	האם אתה איש ציבור או PEP?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
383	138	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
384	139	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
385	140	he	האם אתה מדווח לרשויות המס האמריקניות?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
386	141	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
387	142	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
388	143	he	המשך	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
389	144	he	חזרה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
390	108	ru	Личные данные	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
391	109	ru	Уровень образования	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
392	110	ru	Пожалуйста, выберите ваш уровень образования	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
393	111	ru	Начальная школа	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
394	112	ru	Средняя школа	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
395	113	ru	Профессиональный сертификат	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
396	114	ru	Степень бакалавра	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
397	115	ru	Степень магистра	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
398	116	ru	Докторская степень	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
399	117	ru	Другое	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
400	118	ru	Семейное положение	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
401	119	ru	Пожалуйста, выберите ваше семейное положение	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
402	120	ru	Холост/не замужем	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
403	121	ru	Женат/замужем	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
404	122	ru	Разведен/а	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
405	123	ru	Вдовец/вдова	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
406	124	ru	Гражданский брак	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
407	125	ru	Другое	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
408	126	ru	Статус гражданства	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
409	127	ru	Пожалуйста, выберите ваш статус гражданства	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
410	128	ru	Гражданин Израиля	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
411	129	ru	Новый иммигрант	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
412	130	ru	Иностранный резидент	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
413	131	ru	Есть ли у вас медицинская страховка?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
414	132	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
415	133	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
416	134	ru	Являетесь ли вы иностранным резидентом?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
417	135	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
418	136	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
419	137	ru	Являетесь ли вы публичным лицом или PEP?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
420	138	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
421	139	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
422	140	ru	Отчитываетесь ли вы перед налоговыми органами США?	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
423	141	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
424	142	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
425	143	ru	Продолжить	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
426	144	ru	Назад	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
1081	364	en	Calculator	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1082	364	he	מחשבון	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1083	364	ru	Калькулятор	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1084	365	en	Personal details	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1085	365	he	פרטים אישיים	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1086	365	ru	Личные данные	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1087	366	en	Income	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1088	366	he	הכנסות	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1089	366	ru	Доходы	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1090	367	en	Programs	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1091	367	he	תוכניות	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1092	367	ru	Программы	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1093	368	en	Mortgage Calculator	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1094	368	he	מחשבון משכנתא	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1095	368	ru	Калькулятор ипотеки	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1096	369	en	Show offers	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1098	369	ru	Показать предложения	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1099	370	en	Property value	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1100	370	he	שווי הנכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1101	370	ru	Стоимость недвижимости	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1102	371	en	City where you buy	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1103	371	he	עיר בה אתה קונה	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1104	371	ru	Город покупки	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1105	372	en	When do you need the money?	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1106	372	he	מתי אתה זקוק לכסף?	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1107	372	ru	Когда вам нужны деньги?	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1108	373	en	Down payment	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1109	373	he	מקדמה	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1110	373	ru	Первоначальный взнос	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1111	374	en	Property type	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1112	374	he	סוג הנכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1113	374	ru	Тип недвижимости	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1114	375	en	Is this your first property?	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1115	375	he	האם זה הנכס הראשון שלך?	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1116	375	ru	Это ваша первая недвижимость?	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1117	376	en	Property ownership status	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1118	376	he	סטטוס בעלות על נכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1119	376	ru	Статус владения недвижимостью	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1120	377	en	Apartment	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1121	377	he	דירה	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1122	377	ru	Квартира	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1123	378	en	House	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1124	378	he	בית	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1125	378	ru	Дом	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1126	379	en	Commercial	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1127	379	he	מסחרי	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1128	379	ru	Коммерческая	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1129	380	en	Yes, first property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1130	380	he	כן, נכס ראשון	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1131	380	ru	Да, первая недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1132	381	en	No, additional property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1133	381	he	לא, נכס נוסף	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1134	381	ru	Нет, дополнительная недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1135	382	en	I don't own property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1136	382	he	אני לא מחזיק בנכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1137	382	ru	У меня нет недвижимости	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1138	383	en	I own a property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1139	383	he	אני מחזיק בנכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1140	383	ru	У меня есть недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1141	384	en	I'm selling a property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1142	384	he	אני מוכר נכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1143	384	ru	Я продаю недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1144	385	en	Desired mortgage period	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1145	385	he	תקופת משכנתא רצויה	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1146	385	ru	Желаемый срок ипотеки	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1147	386	en	Monthly payment	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1148	386	he	תשלום חודשי	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1149	386	ru	Ежемесячный платеж	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1150	387	en	years	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1151	387	he	שנים	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1152	387	ru	лет	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
2320	816	en	Credit Refinance	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2321	817	en	We will select the best market offers for you	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2322	818	en	Goal of credit refinancing	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2323	819	en	Select goal	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2324	820	en	Improve interest rate	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2325	821	en	Reduce credit amount	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2326	822	en	Increase term to reduce payment	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2327	823	en	Increase payment to reduce term	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2328	824	en	Credit List	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2329	825	en	Which bank issued the credit?	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2330	826	en	Bank Hapoalim	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2331	827	en	Bank Leumi	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2332	828	en	Discount Bank	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2333	829	en	Massad Bank	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2334	830	en	Bank of Israel	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2335	831	en	Full credit amount	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2336	832	en	Monthly payment	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2337	833	en	Credit start date	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2338	834	en	Credit end date	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2339	835	en	Early repayment amount	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2340	836	en	Add Credit	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2341	837	en	Desired monthly payment	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2342	838	en	Credit loan period	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2343	839	en	years	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2344	840	en	years	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2345	841	en	Select date	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2346	842	en	Select bank	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2347	816	he	מחזור אשראי	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2348	817	he	נאתר ונציג בפניכם את ההצעות המשתלמות ביותר הקיימות בשוק הפיננסי	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2349	818	he	מטרת מחזור האשראי	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2350	819	he	בחר מטרה	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2351	820	he	שיפור הריבית	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2352	821	he	הפחתת סכום האשראי	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2353	822	he	הגדלת התקופה כדי להפחית את התשלום	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2354	823	he	הגדלת התשלום כדי לקצר את התקופה	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2355	824	he	התחייבויות אשראי עומדות	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2356	825	he	בנק מלווה	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2357	826	he	בנק הפועלים	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2358	827	he	בנק לאומי	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2359	828	he	בנק דיסקונט	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2360	829	he	בנק מסד	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2361	830	he	בנק ישראל	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2362	831	he	סכום האשראי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2363	832	he	תשלום חודשי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2364	833	he	תאריך תחילת האשראי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2365	834	he	תאריך סיום האשראי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2366	835	he	סכום פירעון מוקדם	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2367	836	he	הוסף אשראי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2368	837	he	תשלום חודשי רצוי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2369	838	he	תקופת האשראי	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2370	839	he	שנים	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2371	840	he	שנים	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2372	841	he	בחר תאריך	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2373	842	he	בחר בנק	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2374	816	ru	Рефинансирование кредита	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2375	817	ru	Мы найдем и представим вам наиболее выгодные предложения, существующие на финансовом рынке	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2376	818	ru	Цель рефинансирования кредита	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2377	819	ru	Выберите цель	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2378	820	ru	Улучшить процентную ставку	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2379	821	ru	Уменьшить сумму кредита	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2380	822	ru	Увеличить срок, чтобы уменьшить платеж	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2381	823	ru	Увеличить платеж, чтобы уменьшить срок	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2382	824	ru	Существующие кредитные обязательства	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2383	825	ru	Банк-кредитор	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2384	826	ru	Банк Апоалим	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2385	827	ru	Банк Леуми	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2386	828	ru	Банк Дисконт	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2387	829	ru	Банк Масад	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2388	830	ru	Банк Израиля	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2389	831	ru	Сумма кредита	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2390	832	ru	Ежемесячный платеж	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2391	833	ru	Дата начала кредита	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2392	834	ru	Дата окончания кредита	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2393	835	ru	Сумма досрочного погашения	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2394	836	ru	Добавить кредит	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2395	837	ru	Желаемый ежемесячный платеж	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2396	838	ru	Срок кредита	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2397	839	ru	лет	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2398	840	ru	лет	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2399	841	ru	Выберите дату	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2400	842	ru	Выберите банк	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2401	843	en	Step 2 - Personal Details	approved	2025-07-29 05:44:35.343641	2025-07-29 05:44:35.343641
2402	843	he	שלב 2 - פרטים אישיים	approved	2025-07-29 05:44:35.343641	2025-07-29 05:44:35.343641
2403	843	ru	Шаг 2 - Персональные данные	approved	2025-07-29 05:44:35.343641	2025-07-29 05:44:35.343641
2404	777	en	Add partner	approved	2025-07-29 06:14:04.639539	2025-07-29 06:14:04.639539
2405	777	he	הוסף שותף	approved	2025-07-29 06:14:04.77722	2025-07-29 06:14:04.77722
2406	777	ru	Добавить партнера	approved	2025-07-29 06:14:04.889268	2025-07-29 06:14:04.889268
2407	778	en	Add	approved	2025-07-29 06:14:05.05557	2025-07-29 06:14:05.05557
2408	778	he	הוסף	approved	2025-07-29 06:14:05.167259	2025-07-29 06:14:05.167259
2409	778	ru	Добавить	approved	2025-07-29 06:14:05.308192	2025-07-29 06:14:05.308192
2410	779	en	Date of birth	approved	2025-07-29 06:14:05.423371	2025-07-29 06:14:05.423371
2411	779	he	תאריך לידה	approved	2025-07-29 06:14:05.577481	2025-07-29 06:14:05.577481
2412	779	ru	Дата рождения	approved	2025-07-29 06:14:05.765462	2025-07-29 06:14:05.765462
2413	796	en	How many mortgage borrowers will there be in total, including you?	approved	2025-07-29 06:14:05.897489	2025-07-29 06:14:05.897489
2414	796	he	 כמה חייבים במשכנתא יהיו בסך הכול, כולל אתכם?	approved	2025-07-29 06:14:06.025757	2025-07-29 06:14:06.025757
2415	796	ru	Сколько всего заемщиков будет по ипотеке, включая вас?	approved	2025-07-29 06:14:06.165269	2025-07-29 06:14:06.165269
2416	803	en	Children under 18	approved	2025-07-29 06:14:06.295392	2025-07-29 06:14:06.295392
2417	803	he	ילדים מתחת לגיל 18	approved	2025-07-29 06:14:06.425275	2025-07-29 06:14:06.425275
2418	803	ru	Дети до 18 лет	approved	2025-07-29 06:14:06.583513	2025-07-29 06:14:06.583513
2419	810	en	Do you have additional citizenship?	approved	2025-07-29 06:14:06.705511	2025-07-29 06:14:06.705511
2420	810	he	האם יש לך אזרחות נוספת?	approved	2025-07-29 06:14:06.837525	2025-07-29 06:14:06.837525
2421	810	ru	Имеете ли вы дополнительное гражданство?	approved	2025-07-29 06:14:06.988041	2025-07-29 06:14:06.988041
2422	812	en	Israel	approved	2025-07-29 06:14:07.147343	2025-07-29 06:14:07.147343
2423	812	he	ישראל	approved	2025-07-29 06:14:07.325245	2025-07-29 06:14:07.325245
2424	812	ru	Израиль	approved	2025-07-29 06:14:07.466896	2025-07-29 06:14:07.466896
2425	813	en	United States	approved	2025-07-29 06:14:07.597329	2025-07-29 06:14:07.597329
2426	813	he	ארצות הברית	approved	2025-07-29 06:14:07.707435	2025-07-29 06:14:07.707435
2427	813	ru	США	approved	2025-07-29 06:14:07.851068	2025-07-29 06:14:07.851068
2428	814	en	Russia	approved	2025-07-29 06:14:08.010852	2025-07-29 06:14:08.010852
2429	814	he	רוסיה	approved	2025-07-29 06:14:08.564839	2025-07-29 06:14:08.564839
2430	814	ru	Россия	approved	2025-07-29 06:14:08.697004	2025-07-29 06:14:08.697004
2431	815	en	Germany	approved	2025-07-29 06:14:08.887132	2025-07-29 06:14:08.887132
2432	815	he	גרמניה	approved	2025-07-29 06:14:09.008179	2025-07-29 06:14:09.008179
2433	815	ru	Германия	approved	2025-07-29 06:14:09.16732	2025-07-29 06:14:09.16732
2434	781	en	France	approved	2025-07-29 06:14:09.446877	2025-07-29 06:14:09.446877
2435	781	he	צרפת	approved	2025-07-29 06:14:09.596824	2025-07-29 06:14:09.596824
2436	781	ru	Франция	approved	2025-07-29 06:14:09.727325	2025-07-29 06:14:09.727325
2437	782	en	United Kingdom	approved	2025-07-29 06:14:09.868579	2025-07-29 06:14:09.868579
2438	782	he	בריטניה	approved	2025-07-29 06:14:10.004913	2025-07-29 06:14:10.004913
2439	782	ru	Великобритания	approved	2025-07-29 06:14:10.127097	2025-07-29 06:14:10.127097
2440	783	en	Canada	approved	2025-07-29 06:14:10.237065	2025-07-29 06:14:10.237065
2441	783	he	קנדה	approved	2025-07-29 06:14:10.346909	2025-07-29 06:14:10.346909
2442	783	ru	Канада	approved	2025-07-29 06:14:10.496818	2025-07-29 06:14:10.496818
2443	784	en	Ukraine	approved	2025-07-29 06:14:10.617317	2025-07-29 06:14:10.617317
2444	784	he	אוקראינה	approved	2025-07-29 06:14:10.727143	2025-07-29 06:14:10.727143
2445	784	ru	Украина	approved	2025-07-29 06:14:10.847041	2025-07-29 06:14:10.847041
2446	786	en	Other	approved	2025-07-29 06:14:10.977161	2025-07-29 06:14:10.977161
2447	786	he	אחר	approved	2025-07-29 06:14:11.147019	2025-07-29 06:14:11.147019
2448	786	ru	Другое	approved	2025-07-29 06:14:11.325236	2025-07-29 06:14:11.325236
2449	811	en	Select citizenship	approved	2025-07-29 06:14:11.442317	2025-07-29 06:14:11.442317
2450	811	he	בחר אזרחות	approved	2025-07-29 06:14:11.564951	2025-07-29 06:14:11.564951
2451	811	ru	Выберите гражданство	approved	2025-07-29 06:14:11.679526	2025-07-29 06:14:11.679526
2452	780	en	Citizenship	approved	2025-07-29 06:14:11.809505	2025-07-29 06:14:11.809505
2453	780	he	אזרחות	approved	2025-07-29 06:14:11.946995	2025-07-29 06:14:11.946995
2454	780	ru	Гражданство	approved	2025-07-29 06:14:12.0869	2025-07-29 06:14:12.0869
2455	785	en	For application approval, it is mandatory to detail all stakeholders and partners	approved	2025-07-29 06:14:12.22515	2025-07-29 06:14:12.22515
2456	785	he	לשם אישור הבקשה, חובה לפרט את פרטי כלל בעלי העניין והשותפים	approved	2025-07-29 06:14:12.344946	2025-07-29 06:14:12.344946
2457	785	ru	Для подтверждения заявки необходимо предоставить данные всех заинтересованных лиц и партнеров	approved	2025-07-29 06:14:12.467054	2025-07-29 06:14:12.467054
2458	787	en	Education	approved	2025-07-29 06:14:12.577088	2025-07-29 06:14:12.577088
2459	787	he	 השכלה	approved	2025-07-29 06:14:12.716788	2025-07-29 06:14:12.716788
2460	787	ru	Образование	approved	2025-07-29 06:14:12.844043	2025-07-29 06:14:12.844043
2461	789	en	No high school diploma	approved	2025-07-29 06:14:12.996963	2025-07-29 06:14:12.996963
2462	789	he	ללא תעודת בגרות	approved	2025-07-29 06:14:13.164914	2025-07-29 06:14:13.164914
2463	789	ru	Без аттестата о среднем образовании	approved	2025-07-29 06:14:13.302195	2025-07-29 06:14:13.302195
2464	790	en	Partial high school diploma	approved	2025-07-29 06:14:13.446877	2025-07-29 06:14:13.446877
2465	790	he	תעודת בגרות חלקית	approved	2025-07-29 06:14:13.58759	2025-07-29 06:14:13.58759
2466	790	ru	Частичный аттестат о среднем образовании	approved	2025-07-29 06:14:13.707174	2025-07-29 06:14:13.707174
2467	791	en	Full high school diploma	approved	2025-07-29 06:14:13.836907	2025-07-29 06:14:13.836907
2468	791	he	תעודת בגרות מלאה	approved	2025-07-29 06:14:13.997241	2025-07-29 06:14:13.997241
2469	791	ru	Полный аттестат о среднем образовании	approved	2025-07-29 06:14:14.177163	2025-07-29 06:14:14.177163
2470	792	en	Post-secondary education	approved	2025-07-29 06:14:14.317078	2025-07-29 06:14:14.317078
2471	792	he	השכלה על-תיכונית	approved	2025-07-29 06:14:14.466983	2025-07-29 06:14:14.466983
2472	792	ru	Послесреднее образование	approved	2025-07-29 06:14:14.616968	2025-07-29 06:14:14.616968
2473	793	en	Bachelor's degree	approved	2025-07-29 06:14:14.755159	2025-07-29 06:14:14.755159
2474	793	he	תואר ראשון	approved	2025-07-29 06:14:14.906917	2025-07-29 06:14:14.906917
2475	793	ru	Высшее образование (бакалавриат)	approved	2025-07-29 06:14:15.01686	2025-07-29 06:14:15.01686
2476	794	en	Master's degree	approved	2025-07-29 06:14:15.155012	2025-07-29 06:14:15.155012
2477	794	he	תואר שני	approved	2025-07-29 06:14:15.267342	2025-07-29 06:14:15.267342
2478	794	ru	Высшее образование (магистратура)	approved	2025-07-29 06:14:15.404903	2025-07-29 06:14:15.404903
2479	795	en	Doctoral degree	approved	2025-07-29 06:14:15.526942	2025-07-29 06:14:15.526942
2480	795	he	תואר שלישי	approved	2025-07-29 06:14:15.656906	2025-07-29 06:14:15.656906
2481	795	ru	Высшее образование (докторантура)	approved	2025-07-29 06:14:15.807122	2025-07-29 06:14:15.807122
2482	788	en	Select education level	approved	2025-07-29 06:14:15.927787	2025-07-29 06:14:15.927787
2483	788	he	בחר רמת השכלה	approved	2025-07-29 06:14:16.055883	2025-07-29 06:14:16.055883
2484	788	ru	Выберите уровень образования	approved	2025-07-29 06:14:16.187095	2025-07-29 06:14:16.187095
2485	797	en	Select number of borrowers	approved	2025-07-29 06:15:51.398715	2025-07-29 06:15:51.398715
2486	797	he	בחר מספר לווים	approved	2025-07-29 06:15:51.546081	2025-07-29 06:15:51.546081
2487	797	ru	Выберите количество заемщиков	approved	2025-07-29 06:15:51.74937	2025-07-29 06:15:51.74937
2488	798	en	1 borrower	approved	2025-07-29 06:15:52.236577	2025-07-29 06:15:52.236577
2489	798	he	לווה אחד	approved	2025-07-29 06:15:52.622372	2025-07-29 06:15:52.622372
2490	798	ru	1 заемщик	approved	2025-07-29 06:15:52.779447	2025-07-29 06:15:52.779447
2491	799	en	2 borrowers	approved	2025-07-29 06:15:53.128648	2025-07-29 06:15:53.128648
2492	799	he	2 לווים	approved	2025-07-29 06:15:53.27814	2025-07-29 06:15:53.27814
2493	799	ru	2 заемщика	approved	2025-07-29 06:15:53.658169	2025-07-29 06:15:53.658169
2494	800	en	3 borrowers	approved	2025-07-29 06:15:54.147958	2025-07-29 06:15:54.147958
2495	800	he	3 לווים	approved	2025-07-29 06:15:54.318289	2025-07-29 06:15:54.318289
2496	800	ru	3 заемщика	approved	2025-07-29 06:15:54.508132	2025-07-29 06:15:54.508132
2497	801	en	4 borrowers	approved	2025-07-29 06:15:54.788016	2025-07-29 06:15:54.788016
2498	801	he	4 לווים	approved	2025-07-29 06:15:54.938106	2025-07-29 06:15:54.938106
2499	801	ru	4 заемщика	approved	2025-07-29 06:15:55.128101	2025-07-29 06:15:55.128101
2500	802	en	5 or more borrowers	approved	2025-07-29 06:15:55.386415	2025-07-29 06:15:55.386415
2501	802	he	5 לווים או יותר	approved	2025-07-29 06:15:55.566117	2025-07-29 06:15:55.566117
2502	802	ru	5 или более заемщиков	approved	2025-07-29 06:15:55.735824	2025-07-29 06:15:55.735824
2503	804	en	Select number of children	approved	2025-07-29 06:15:56.067996	2025-07-29 06:15:56.067996
2504	804	he	בחר מספר ילדים	approved	2025-07-29 06:15:56.207007	2025-07-29 06:15:56.207007
2505	804	ru	Выберите количество детей	approved	2025-07-29 06:15:56.328096	2025-07-29 06:15:56.328096
2506	805	en	No children	approved	2025-07-29 06:15:56.586054	2025-07-29 06:15:56.586054
2507	805	he	אין ילדים	approved	2025-07-29 06:15:56.777083	2025-07-29 06:15:56.777083
2508	805	ru	Нет детей	approved	2025-07-29 06:15:56.915206	2025-07-29 06:15:56.915206
2509	806	en	1 child	approved	2025-07-29 06:15:57.325152	2025-07-29 06:15:57.325152
2510	806	he	ילד אחד	approved	2025-07-29 06:15:57.507945	2025-07-29 06:15:57.507945
2511	806	ru	1 ребенок	approved	2025-07-29 06:15:57.628211	2025-07-29 06:15:57.628211
2512	807	en	2 children	approved	2025-07-29 06:15:59.787938	2025-07-29 06:15:59.787938
2513	807	he	2 ילדים	approved	2025-07-29 06:15:59.931039	2025-07-29 06:15:59.931039
2514	807	ru	2 детей	approved	2025-07-29 06:16:00.126004	2025-07-29 06:16:00.126004
2515	808	en	3 children	approved	2025-07-29 06:16:00.427054	2025-07-29 06:16:00.427054
2516	808	he	3 ילדים	approved	2025-07-29 06:16:00.556967	2025-07-29 06:16:00.556967
2517	808	ru	3 детей	approved	2025-07-29 06:16:00.748269	2025-07-29 06:16:00.748269
2518	809	en	4 or more children	approved	2025-07-29 06:16:01.047984	2025-07-29 06:16:01.047984
2519	809	he	4 ילדים או יותר	approved	2025-07-29 06:16:01.258058	2025-07-29 06:16:01.258058
2520	809	ru	4 или более детей	approved	2025-07-29 06:16:01.466159	2025-07-29 06:16:01.466159
1245	418	ru	Выбрать этот банк 	approved	2025-07-27 05:37:15.99225	2025-07-29 09:47:44.798225
2594	863	ru	Банк Апоалим	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
18	7	ru	Временная франшиза для брокеров	approved	2025-07-21 10:23:42.872892	2025-07-29 22:05:43.314364
2184	731	ru	[\n                {"value": "standard", "label": "Стандартная ипотека"},\n                {"value": "refinance", "label": "Рефинансирование"},\n                {"value": "commercial", "label": "Коммерческая ипотека"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.549637
2183	731	he	[\n                {"value": "standard", "label": "משכנתא רגילה"},\n                {"value": "refinance", "label": "מיחזור משכנתא"},\n                {"value": "commercial", "label": "משכנתא מסחרית"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.709818
2182	731	en	[\n                {"value": "standard", "label": "Standard Mortgage"},\n                {"value": "refinance", "label": "Mortgage Refinance"},\n                {"value": "commercial", "label": "Commercial Mortgage"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.839518
2228	746	he	[\n                {"value": "bank_hapoalim", "label": "בנק הפועלים"},\n                {"value": "bank_leumi", "label": "בנק לאומי"},\n                {"value": "bank_discount", "label": "בנק דיסקונט"},\n                {"value": "mizrahi_tefahot", "label": "מזרחי טפחות"},\n                {"value": "first_international", "label": "הבנק הבינלאומי הראשון"},\n                {"value": "other", "label": "בנק אחר"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.087959
2262	757	ru	[\n                {"value": "yes", "label": "Да, зарегистрирована"},\n                {"value": "no", "label": "Нет, не зарегистрирована"},\n                {"value": "unknown", "label": "Не знаю"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.375717
2260	757	en	[\n                {"value": "yes", "label": "Yes, registered in land registry"},\n                {"value": "no", "label": "No, not registered"},\n                {"value": "unknown", "label": "I dont know"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.606769
2280	763	ru	[\n                {"value": "fixed", "label": "Фиксированная ставка"},\n                {"value": "variable", "label": "Переменная ставка"},\n                {"value": "mixed", "label": "Смешанная ставка"},\n                {"value": "prime", "label": "Прайм ставка"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.724457
2279	763	he	[\n                {"value": "fixed", "label": "ריבית קבועה"},\n                {"value": "variable", "label": "ריבית משתנה"},\n                {"value": "mixed", "label": "ריבית מעורבת"},\n                {"value": "prime", "label": "ריבית פריים"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.829304
2531	844	ru	Снижение процентной ставки	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2526	844	he	הורדת ריבית	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2521	844	en	Lower Interest Rate	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2532	845	ru	Уменьшение ежемесячного платежа	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2527	845	he	הפחתת תשלום חודשי	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2522	845	en	Reduce Monthly Payment	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2533	846	ru	Сокращение срока ипотеки	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2528	846	he	קיצור תקופת המשכנתא	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2523	846	en	Shorten Mortgage Term	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2534	847	ru	Рефинансирование с извлечением средств	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2529	847	he	מחזור עם משיכת כספים	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2524	847	en	Cash Out Refinance	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2535	848	ru	Консолидация долгов	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2530	848	he	איחוד חובות	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2525	848	en	Consolidate Debts	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2540	849	ru	Да, зарегистрировано в земельном кадастре	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2538	849	he	כן, רשום בטאבו	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2536	849	en	Yes, Registered in Land Registry	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2541	850	ru	Нет, не зарегистрировано	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2539	850	he	לא, לא רשום	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2537	850	en	No, Not Registered	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2550	851	ru	Банк Хапоалим	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2546	851	he	בנק הפועלים	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2542	851	en	Bank Hapoalim	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2551	852	ru	Банк Леуми	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2547	852	he	בנק לאומי	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2543	852	en	Bank Leumi	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2552	853	ru	Дисконт Банк	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2548	853	he	בנק דיסקונט	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2544	853	en	Discount Bank	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2553	854	ru	Банк Масад	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2549	854	he	בנק המסד	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2545	854	en	Massad Bank	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2570	855	ru	Рефинансирование ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2562	855	he	מחזור משכנתא	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2554	855	en	Mortgage Refinancing	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2571	856	ru	Цель рефинансирования ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2563	856	he	מטרת מחזור המשכנתא	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2555	856	en	Purpose of Mortgage Refinance	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2572	857	ru	Остаток по ипотеке	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2564	857	he	יתרת המשכנתא הנוכחית	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2556	857	en	Remaining Mortgage Balance	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2573	858	ru	Текущая стоимость недвижимости	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2565	858	he	שווי הנכס הנוכחי	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2557	858	en	Current Property Value	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2574	859	ru	Тип недвижимости	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2566	859	he	סוג הנכס	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2558	859	en	Property Type	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2575	860	ru	Текущий банк ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2567	860	he	בנק המשכנתא הנוכחי	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2559	860	en	Current Mortgage Bank	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2576	861	ru	Зарегистрирована ли ипотека в земельном кадастре?	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2568	861	he	האם המשכנתא רשומה בטאבו?	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2560	861	en	Is the Mortgage Registered in Land Registry?	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2577	862	ru	Дата начала ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2569	862	he	תאריך תחילת המשכנתא	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2561	862	en	Mortgage Start Date	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2586	863	he	בנק הפועלים	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2578	863	en	Bank Hapoalim	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2595	864	ru	Банк Леуми	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2587	864	he	בנק לאומי	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2579	864	en	Bank Leumi	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2596	865	ru	Банк Дисконт	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2588	865	he	בנק דיסקונט	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2580	865	en	Discount Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2597	866	ru	Банк Масад	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2589	866	he	בנק מסד	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2581	866	en	Massad Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2598	867	ru	Банк Израиль	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2590	867	he	בנק ישראל	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2582	867	en	Israel Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2599	868	ru	Банк Меркантайл	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2591	868	he	בנק מרכנתיל	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2583	868	en	Mercantile Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2600	869	ru	Банк Мизрахи	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2592	869	he	בנק מזרחי	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2584	869	en	Mizrahi Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2601	870	ru	Банк Юнион	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2593	870	he	בנק איגוד	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2585	870	en	Union Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2612	871	ru	Квартира	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2607	871	he	דירה	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2602	871	en	Apartment	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2613	872	ru	Частный дом	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2608	872	he	בית פרטי	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2603	872	en	Private House	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2614	873	ru	Коммерческая недвижимость	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2609	873	he	נכס מסחרי	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2604	873	en	Commercial Property	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2615	874	ru	Земельный участок	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2610	874	he	קרקע	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2605	874	en	Land	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2616	875	ru	Другое	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2611	875	he	אחר	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2606	875	en	Other	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2633	876	ru	Банк Апоалим	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2625	876	he	בנק הפועלים	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2617	876	en	Bank Hapoalim	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2634	877	ru	Банк Леуми	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2626	877	he	בנק לאומי	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2618	877	en	Bank Leumi	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2635	878	ru	Банк Дисконт	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2627	878	he	בנק דיסקונט	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2619	878	en	Discount Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2636	879	ru	Банк Масад	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2628	879	he	בנק מסד	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2620	879	en	Massad Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2637	880	ru	Банк Израиль	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2629	880	he	בנק ישראל	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2621	880	en	Israel Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2638	881	ru	Банк Меркантайл	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2630	881	he	בנק מרכנתיל	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2622	881	en	Mercantile Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2639	882	ru	Банк Мизрахи	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2631	882	he	בנק מזרחי	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2623	882	en	Mizrahi Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2640	883	ru	Банк Юнион	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2632	883	he	בנק איגוד	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2624	883	en	Union Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2651	884	ru	Квартира	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2646	884	he	דירה	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2641	884	en	Apartment	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2652	885	ru	Частный дом	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2647	885	he	בית פרטי	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2642	885	en	Private House	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2653	886	ru	Коммерческая недвижимость	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2648	886	he	נכס מסחרי	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2643	886	en	Commercial Property	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2654	887	ru	Земельный участок	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2649	887	he	קרקע	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2644	887	en	Land	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2655	888	ru	Другое	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2650	888	he	אחר	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2645	888	en	Other	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2660	889	ru	Да, зарегистрирована в земельном кадастре	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2658	889	he	כן, רשומה בטאבו	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2656	889	en	Yes, Registered in Land Registry	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2661	890	ru	Нет, не зарегистрирована	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2659	890	he	לא, לא רשומה	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2657	890	en	No, Not Registered	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2	2	he	חברה	rejected	2025-07-21 10:23:40.986436	2025-07-30 13:33:22.631166
3	2	ru	Компания	rejected	2025-07-21 10:23:41.069988	2025-07-30 13:33:22.631166
2662	893	ru	Главная страница	approved	2025-07-30 23:17:45.286158	2025-07-30 23:18:09.401787
2663	893	he	עמוד ראשי	approved	2025-07-30 23:17:45.637861	2025-07-30 23:18:09.401787
2664	893	en	Main Page	approved	2025-07-30 23:17:45.811585	2025-07-30 23:18:09.401787
2665	894	ru	Добро пожаловать в систему управления контентом BankIM	approved	2025-07-30 23:17:46.132192	2025-07-30 23:18:09.401787
2666	894	he	ברוכים הבאים למערכת ניהול התוכן של BankIM	approved	2025-07-30 23:17:46.276256	2025-07-30 23:18:09.401787
2667	894	en	Welcome to BankIM Content Management System	approved	2025-07-30 23:17:46.414307	2025-07-30 23:18:09.401787
2668	895	ru	Выберите раздел для редактирования контента	approved	2025-07-30 23:17:46.674906	2025-07-30 23:18:09.401787
2669	895	he	בחר סעיף לעריכת תוכן	approved	2025-07-30 23:17:46.767012	2025-07-30 23:18:09.401787
2670	895	en	Select a section to edit content	approved	2025-07-30 23:17:46.858405	2025-07-30 23:18:09.401787
2671	896	ru	Рассчитать ипотеку	approved	2025-07-30 23:17:47.040974	2025-07-30 23:18:09.401787
2672	896	he	חישוב משכנתא	approved	2025-07-30 23:17:47.132884	2025-07-30 23:18:09.401787
2673	896	en	Calculate Mortgage	approved	2025-07-30 23:17:47.224771	2025-07-30 23:18:09.401787
2674	897	ru	Рассчитать кредит	approved	2025-07-30 23:17:47.406864	2025-07-30 23:18:09.401787
2675	897	he	חישוב אשראי	approved	2025-07-30 23:17:47.496806	2025-07-30 23:18:09.401787
2676	897	en	Calculate Credit	approved	2025-07-30 23:17:48.571071	2025-07-30 23:18:09.401787
1875	628	ru	О нас2	approved	2025-07-27 12:56:06.958598	2025-07-31 19:34:46.085585
1892	634	he	השירותים שלנו2	approved	2025-07-27 12:56:06.958598	2025-07-31 20:05:15.308394
1877	629	he	מוסדות פיננסיים שותפים2	approved	2025-07-27 12:56:06.958598	2025-07-31 20:41:53.570933
1097	369	he	הצג הצעות2	approved	2025-07-26 19:59:40.506245	2025-07-31 21:33:39.049847
2677	898	en	Credit Refinancing Results	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2678	899	en	These refinancing offers are preliminary. Final terms depend on your current credit status and bank approval. You may save on interest or monthly payments.	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2679	900	en	Your Refinancing Parameters	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2680	901	en	Your Profile	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2681	902	en	Filter Banks	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2682	903	en	Refinancing Amount	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2683	904	en	New Loan Period	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2684	905	en	months	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2685	906	en	Maximum Savings	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2686	907	en	Lower Monthly Payment	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2687	908	en	Quick Processing	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2688	909	en	My Current Bank	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2689	910	en	Total Refinancing Amount	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2690	911	en	New Total to Repay	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2691	912	en	New Monthly Payment	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2692	913	en	Select for Refinancing	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2693	898	he	תוצאות מיחזור אשראי	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2694	899	he	הצעות המיחזור הללו הינן ראשוניות. התנאים הסופיים תלויים במצב האשראי הנוכחי שלך ובאישור הבנק. ייתכן שתחסוך בריבית או בתשלומים החודשיים.	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2695	900	he	פרמטרי המיחזור שלך	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2696	901	he	הפרופיל שלך	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2697	902	he	סנן בנקים	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2698	903	he	סכום למיחזור	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2699	904	he	תקופת הלוואה חדשה	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2700	905	he	חודשים	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2701	906	he	חיסכון מקסימלי	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2702	907	he	החזר חודשי נמוך יותר	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2703	908	he	טיפול מהיר	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2704	909	he	הבנק הנוכחי שלי	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2705	910	he	סכום כולל למיחזור	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2706	911	he	סה"כ חדש להחזר	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2707	912	he	החזר חודשי חדש	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2708	913	he	בחר למיחזור	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2709	898	ru	Результаты рефинансирования кредита	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2710	899	ru	Эти предложения по рефинансированию являются предварительными. Окончательные условия зависят от вашего текущего кредитного статуса и одобрения банка. Вы можете сэкономить на процентах или ежемесячных платежах.	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2711	900	ru	Параметры рефинансирования	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2712	901	ru	Ваш профиль	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2713	902	ru	Фильтр банков	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2714	903	ru	Сумма рефинансирования	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2715	904	ru	Новый срок кредита	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2716	905	ru	месяцев	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2717	906	ru	Максимальная экономия	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2718	907	ru	Меньший платеж	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2719	908	ru	Быстрая обработка	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2720	909	ru	Мой текущий банк	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2721	910	ru	Общая сумма рефинансирования	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2722	911	ru	Новая сумма к возврату	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2723	912	ru	Новый ежемесячный платеж	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2724	913	ru	Выбрать для рефинансирования	approved	2025-08-02 20:24:55.402944	2025-08-02 20:24:55.402944
2725	914	en	Main source of income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2726	915	en	Select your main source of income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2727	916	en	Employee	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2728	917	en	Self-employed	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2729	918	en	Business owner	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2730	919	en	Pension	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2731	920	en	Student	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2732	921	en	Unemployed	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2733	922	en	Other	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2734	923	en	Additional income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2735	924	en	Do you have additional income?	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2736	925	en	No additional income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2737	926	en	Additional salary	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2738	927	en	Freelance work	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2739	928	en	Investment income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2740	929	en	Rental income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2741	930	en	Pension benefits	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2742	931	en	Other income	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2743	932	en	Existing obligations	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2744	933	en	Do you have existing debts or obligations?	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2745	934	en	No obligations	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2746	935	en	Credit card debt	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2747	936	en	Bank loan	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2748	937	en	Consumer credit	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
2749	938	en	Other obligations	approved	2025-08-03 14:12:12.172634	2025-08-03 14:12:12.172634
\.


--
-- Data for Name: content_translations_backup_1753881004876; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_translations_backup_1753881004876 (id, content_item_id, language_code, content_value, status, created_at, updated_at) FROM stdin;
67	25	en	Property Ownership Status	approved	2025-07-24 13:59:39.861358	2025-07-24 13:59:39.861358
68	25	he	סטטוס בעלות על נכס	approved	2025-07-24 13:59:40.001501	2025-07-24 13:59:40.001501
69	25	ru	Статус владения недвижимостью	approved	2025-07-24 13:59:40.161354	2025-07-24 13:59:40.161354
70	26	en	Select your property ownership status	approved	2025-07-24 13:59:40.483289	2025-07-24 13:59:40.483289
71	26	he	בחר את סטטוס הבעלות	approved	2025-07-24 13:59:40.593319	2025-07-24 13:59:40.593319
72	26	ru	Выберите статус владения недвижимостью	approved	2025-07-24 13:59:40.703422	2025-07-24 13:59:40.703422
73	27	en	I don't own any property	approved	2025-07-24 13:59:40.993401	2025-07-24 13:59:40.993401
74	27	he	אין בבעלותי נכס	approved	2025-07-24 13:59:41.123581	2025-07-24 13:59:41.123581
75	27	ru	У меня нет недвижимости	approved	2025-07-24 13:59:41.303578	2025-07-24 13:59:41.303578
76	28	en	I own a property	approved	2025-07-24 13:59:41.609233	2025-07-24 13:59:41.609233
77	28	he	יש בבעלותי נכס	approved	2025-07-24 13:59:41.733201	2025-07-24 13:59:41.733201
78	28	ru	У меня есть недвижимость	approved	2025-07-24 13:59:41.891127	2025-07-24 13:59:41.891127
79	29	en	I'm selling a property	approved	2025-07-24 13:59:42.243929	2025-07-24 13:59:42.243929
80	29	he	אני מוכר נכס	approved	2025-07-24 13:59:42.433171	2025-07-24 13:59:42.433171
81	29	ru	Я продаю недвижимость	approved	2025-07-24 13:59:42.553146	2025-07-24 13:59:42.553146
85	31	en	Loan Period	approved	2025-07-24 13:59:43.473091	2025-07-24 13:59:43.473091
86	31	he	תקופת ההלוואה	approved	2025-07-24 13:59:43.583069	2025-07-24 13:59:43.583069
87	31	ru	Срок кредита	approved	2025-07-24 13:59:43.733141	2025-07-24 13:59:43.733141
88	32	en	years	approved	2025-07-24 13:59:43.963049	2025-07-24 13:59:43.963049
89	32	he	שנים	approved	2025-07-24 13:59:44.083191	2025-07-24 13:59:44.083191
90	32	ru	лет	approved	2025-07-24 13:59:44.273	2025-07-24 13:59:44.273
91	33	en	years	approved	2025-07-24 13:59:44.533196	2025-07-24 13:59:44.533196
92	33	he	שנים	approved	2025-07-24 13:59:44.683088	2025-07-24 13:59:44.683088
93	33	ru	лет	approved	2025-07-24 13:59:44.803078	2025-07-24 13:59:44.803078
94	34	en	Fill in the details	approved	2025-07-24 13:59:45.06295	2025-07-24 13:59:45.06295
95	34	he	מלא את הפרטים	approved	2025-07-24 13:59:45.191192	2025-07-24 13:59:45.191192
96	34	ru	Заполните данные	approved	2025-07-24 13:59:45.331232	2025-07-24 13:59:45.331232
97	35	en	Additional Information	approved	2025-07-24 13:59:45.631107	2025-07-24 13:59:45.631107
98	35	he	מידע נוסף	approved	2025-07-24 13:59:45.763258	2025-07-24 13:59:45.763258
99	35	ru	Дополнительная информация	approved	2025-07-24 13:59:45.913197	2025-07-24 13:59:45.913197
100	36	en	Start Date	approved	2025-07-24 13:59:46.224358	2025-07-24 13:59:46.224358
101	36	he	תאריך התחלה	approved	2025-07-24 13:59:46.393191	2025-07-24 13:59:46.393191
102	36	ru	Дата начала	approved	2025-07-24 13:59:46.523244	2025-07-24 13:59:46.523244
103	37	en	Monthly Income	approved	2025-07-24 13:59:46.8613	2025-07-24 13:59:46.8613
104	37	he	הכנסה חודשית	approved	2025-07-24 13:59:47.04367	2025-07-24 13:59:47.04367
105	37	ru	Ежемесячный доход	approved	2025-07-24 13:59:47.171109	2025-07-24 13:59:47.171109
106	38	en	Enter your monthly income	approved	2025-07-24 13:59:47.473275	2025-07-24 13:59:47.473275
107	38	he	הזן את ההכנסה החודשית	approved	2025-07-24 13:59:47.621253	2025-07-24 13:59:47.621253
108	38	ru	Введите ежемесячный доход	approved	2025-07-24 13:59:47.756137	2025-07-24 13:59:47.756137
112	40	en	Profession	approved	2025-07-24 13:59:48.703078	2025-07-24 13:59:48.703078
113	40	he	מקצוע	approved	2025-07-24 13:59:48.872884	2025-07-24 13:59:48.872884
114	40	ru	Профессия	approved	2025-07-24 13:59:49.001099	2025-07-24 13:59:49.001099
115	41	en	Enter your profession	approved	2025-07-24 13:59:49.268155	2025-07-24 13:59:49.268155
116	41	he	הזן את המקצוע שלך	approved	2025-07-24 13:59:49.473232	2025-07-24 13:59:49.473232
117	41	ru	Введите вашу профессию	approved	2025-07-24 13:59:49.611009	2025-07-24 13:59:49.611009
118	42	en	Company	approved	2025-07-24 13:59:49.913215	2025-07-24 13:59:49.913215
119	42	he	חברה	approved	2025-07-24 13:59:50.034683	2025-07-24 13:59:50.034683
120	42	ru	Компания	approved	2025-07-24 13:59:50.20706	2025-07-24 13:59:50.20706
121	43	en	High-tech	approved	2025-07-24 13:59:50.439078	2025-07-24 13:59:50.439078
122	43	he	הייטק	approved	2025-07-24 13:59:50.62306	2025-07-24 13:59:50.62306
123	43	ru	Высокие технологии	approved	2025-07-24 13:59:50.759231	2025-07-24 13:59:50.759231
124	44	en	Finance	approved	2025-07-24 13:59:51.221072	2025-07-24 13:59:51.221072
125	44	he	פיננסים	approved	2025-07-24 13:59:54.793104	2025-07-24 13:59:54.793104
126	44	ru	Финансы	approved	2025-07-24 13:59:55.750963	2025-07-24 13:59:55.750963
127	45	en	Education	approved	2025-07-24 13:59:56.1692	2025-07-24 13:59:56.1692
128	45	he	חינוך	approved	2025-07-24 13:59:56.380973	2025-07-24 13:59:56.380973
129	45	ru	Образование	approved	2025-07-24 13:59:56.533204	2025-07-24 13:59:56.533204
130	46	en	Other	approved	2025-07-24 13:59:56.863268	2025-07-24 13:59:56.863268
131	46	he	אחר	approved	2025-07-24 13:59:57.083297	2025-07-24 13:59:57.083297
132	46	ru	Другое	approved	2025-07-24 13:59:57.271293	2025-07-24 13:59:57.271293
133	47	en	Monthly Payment	approved	2025-07-24 13:59:57.553002	2025-07-24 13:59:57.553002
134	47	he	תשלום חודשי	approved	2025-07-24 13:59:57.68318	2025-07-24 13:59:57.68318
135	47	ru	Ежемесячный платеж	approved	2025-07-24 13:59:57.793004	2025-07-24 13:59:57.793004
136	48	en	Bank	approved	2025-07-24 13:59:58.023018	2025-07-24 13:59:58.023018
137	48	he	בנק	approved	2025-07-24 13:59:58.201417	2025-07-24 13:59:58.201417
138	48	ru	Банк	approved	2025-07-24 13:59:58.379224	2025-07-24 13:59:58.379224
139	49	en	End Date	approved	2025-07-24 13:59:58.68322	2025-07-24 13:59:58.68322
140	49	he	תאריך סיום	approved	2025-07-24 13:59:58.843221	2025-07-24 13:59:58.843221
141	49	ru	Дата окончания	approved	2025-07-24 13:59:59.013408	2025-07-24 13:59:59.013408
157	55	en	Relationship to Primary Borrower	approved	2025-07-24 14:12:52.878092	2025-07-24 14:12:52.878092
158	55	he	הקשר ללווה הראשי	approved	2025-07-24 14:12:52.998363	2025-07-24 14:12:52.998363
159	55	ru	Отношение к основному заемщику	approved	2025-07-24 14:12:53.186327	2025-07-24 14:12:53.186327
160	56	en	e.g. Spouse, Parent, Business Partner	approved	2025-07-24 14:12:53.588288	2025-07-24 14:12:53.588288
161	56	he	לדוגמה: בן/בת זוג, הורה, שותף עסקי	approved	2025-07-24 14:12:53.808026	2025-07-24 14:12:53.808026
162	56	ru	Например: Супруг(а), Родитель, Деловой партнер	approved	2025-07-24 14:12:53.93806	2025-07-24 14:12:53.93806
255	87	ru	Выберите город	approved	2025-07-24 14:37:32.805528	2025-07-24 14:37:32.805528
190	66	en	How many borrowers will be on the mortgage, including yourself?	approved	2025-07-24 14:37:16.940562	2025-07-24 14:37:16.940562
191	66	he	כמה לווים יהיו במשכנתא, כולל אותך?	approved	2025-07-24 14:37:17.09835	2025-07-24 14:37:17.09835
192	66	ru	Сколько всего заемщиков будет по ипотеке, включая вас?	approved	2025-07-24 14:37:17.247844	2025-07-24 14:37:17.247844
193	67	en	Select number of borrowers	approved	2025-07-24 14:37:17.705868	2025-07-24 14:37:17.705868
194	67	he	בחר מספר לווים	approved	2025-07-24 14:37:17.83781	2025-07-24 14:37:17.83781
195	67	ru	Выберите количество заемщиков	approved	2025-07-24 14:37:17.957935	2025-07-24 14:37:17.957935
196	68	en	1 borrower	approved	2025-07-24 14:37:18.359122	2025-07-24 14:37:18.359122
197	68	he	לווה אחד	approved	2025-07-24 14:37:18.527737	2025-07-24 14:37:18.527737
198	68	ru	1 заемщик	approved	2025-07-24 14:37:18.645807	2025-07-24 14:37:18.645807
199	69	en	2 borrowers	approved	2025-07-24 14:37:19.034089	2025-07-24 14:37:19.034089
200	69	he	2 לווים	approved	2025-07-24 14:37:19.187705	2025-07-24 14:37:19.187705
201	69	ru	2 заемщика	approved	2025-07-24 14:37:19.377615	2025-07-24 14:37:19.377615
202	70	en	3 borrowers	approved	2025-07-24 14:37:19.881954	2025-07-24 14:37:19.881954
203	70	he	3 לווים	approved	2025-07-24 14:37:19.996789	2025-07-24 14:37:19.996789
204	70	ru	3 заемщика	approved	2025-07-24 14:37:20.147783	2025-07-24 14:37:20.147783
205	71	en	4 borrowers	approved	2025-07-24 14:37:20.577351	2025-07-24 14:37:20.577351
206	71	he	4 לווים	approved	2025-07-24 14:37:20.727501	2025-07-24 14:37:20.727501
207	71	ru	4 заемщика	approved	2025-07-24 14:37:20.837423	2025-07-24 14:37:20.837423
208	72	en	More than 4	approved	2025-07-24 14:37:21.317377	2025-07-24 14:37:21.317377
209	72	he	יותר מ-4	approved	2025-07-24 14:37:21.427637	2025-07-24 14:37:21.427637
210	72	ru	Более 4	approved	2025-07-24 14:37:21.537382	2025-07-24 14:37:21.537382
211	73	en	Do you have children under 18?	approved	2025-07-24 14:37:22.015362	2025-07-24 14:37:22.015362
212	73	he	האם יש לך ילדים מתחת לגיל 18?	approved	2025-07-24 14:37:22.137537	2025-07-24 14:37:22.137537
213	73	ru	Дети до 18 лет	approved	2025-07-24 14:37:22.267281	2025-07-24 14:37:22.267281
214	74	en	Select answer	approved	2025-07-24 14:37:22.677458	2025-07-24 14:37:22.677458
215	74	he	בחר תשובה	approved	2025-07-24 14:37:22.82814	2025-07-24 14:37:22.82814
216	74	ru	Выберите ответ	approved	2025-07-24 14:37:22.987386	2025-07-24 14:37:22.987386
217	75	en	No children	approved	2025-07-24 14:37:23.477404	2025-07-24 14:37:23.477404
218	75	he	אין ילדים	approved	2025-07-24 14:37:23.677501	2025-07-24 14:37:23.677501
219	75	ru	Нет детей	approved	2025-07-24 14:37:23.805445	2025-07-24 14:37:23.805445
220	76	en	Yes, 1 child	approved	2025-07-24 14:37:24.267453	2025-07-24 14:37:24.267453
221	76	he	כן, ילד אחד	approved	2025-07-24 14:37:24.417481	2025-07-24 14:37:24.417481
222	76	ru	Да, 1 ребенок	approved	2025-07-24 14:37:24.577455	2025-07-24 14:37:24.577455
223	77	en	Yes, 2 children	approved	2025-07-24 14:37:25.007472	2025-07-24 14:37:25.007472
224	77	he	כן, 2 ילדים	approved	2025-07-24 14:37:25.207331	2025-07-24 14:37:25.207331
225	77	ru	Да, 2 детей	approved	2025-07-24 14:37:25.335629	2025-07-24 14:37:25.335629
226	78	en	Yes, 3 children	approved	2025-07-24 14:37:25.797571	2025-07-24 14:37:25.797571
227	78	he	כן, 3 ילדים	approved	2025-07-24 14:37:25.937494	2025-07-24 14:37:25.937494
228	78	ru	Да, 3 детей	approved	2025-07-24 14:37:26.09733	2025-07-24 14:37:26.09733
229	79	en	Yes, 4 or more	approved	2025-07-24 14:37:26.465605	2025-07-24 14:37:26.465605
230	79	he	כן, 4 או יותר	approved	2025-07-24 14:37:26.577341	2025-07-24 14:37:26.577341
231	79	ru	Да, 4 и более	approved	2025-07-24 14:37:26.747302	2025-07-24 14:37:26.747302
232	80	en	Do you have additional citizenship?	approved	2025-07-24 14:37:27.175477	2025-07-24 14:37:27.175477
233	80	he	האם יש לך אזרחות נוספת?	approved	2025-07-24 14:37:27.358411	2025-07-24 14:37:27.358411
234	80	ru	Имеете ли вы дополнительное гражданство?	approved	2025-07-24 14:37:27.477435	2025-07-24 14:37:27.477435
235	81	en	Select answer	approved	2025-07-24 14:37:27.892405	2025-07-24 14:37:27.892405
236	81	he	בחר תשובה	approved	2025-07-24 14:37:28.007629	2025-07-24 14:37:28.007629
237	81	ru	Выберите ответ	approved	2025-07-24 14:37:28.155508	2025-07-24 14:37:28.155508
238	82	en	No, only Israeli citizenship	approved	2025-07-24 14:37:28.917508	2025-07-24 14:37:28.917508
239	82	he	לא, רק אזרחות ישראלית	approved	2025-07-24 14:37:29.04521	2025-07-24 14:37:29.04521
240	82	ru	Нет, только израильское гражданство	approved	2025-07-24 14:37:29.205326	2025-07-24 14:37:29.205326
241	83	en	Yes, US citizenship	approved	2025-07-24 14:37:29.647612	2025-07-24 14:37:29.647612
242	83	he	כן, אזרחות אמריקאית	approved	2025-07-24 14:37:29.797483	2025-07-24 14:37:29.797483
243	83	ru	Да, гражданство США	approved	2025-07-24 14:37:29.937444	2025-07-24 14:37:29.937444
244	84	en	Yes, EU citizenship	approved	2025-07-24 14:37:30.355489	2025-07-24 14:37:30.355489
245	84	he	כן, אזרחות אירופית	approved	2025-07-24 14:37:30.52741	2025-07-24 14:37:30.52741
246	84	ru	Да, гражданство ЕС	approved	2025-07-24 14:37:30.647506	2025-07-24 14:37:30.647506
247	85	en	Yes, other citizenship	approved	2025-07-24 14:37:31.057513	2025-07-24 14:37:31.057513
248	85	he	כן, אזרחות אחרת	approved	2025-07-24 14:37:31.177649	2025-07-24 14:37:31.177649
249	85	ru	Да, другое гражданство	approved	2025-07-24 14:37:31.365443	2025-07-24 14:37:31.365443
250	86	en	City of property location	approved	2025-07-24 14:37:31.787472	2025-07-24 14:37:31.787472
251	86	he	עיר מיקום הנכס	approved	2025-07-24 14:37:31.937654	2025-07-24 14:37:31.937654
252	86	ru	Город расположения недвижимости	approved	2025-07-24 14:37:32.067618	2025-07-24 14:37:32.067618
253	87	en	Select city	approved	2025-07-24 14:37:32.477396	2025-07-24 14:37:32.477396
254	87	he	בחר עיר	approved	2025-07-24 14:37:32.597354	2025-07-24 14:37:32.597354
181	63	en	Bachelor's degree	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
256	88	en	Tel Aviv	approved	2025-07-24 14:37:33.217307	2025-07-24 14:37:33.217307
257	88	he	תל אביב	approved	2025-07-24 14:37:33.407506	2025-07-24 14:37:33.407506
258	88	ru	Тель-Авив	approved	2025-07-24 14:37:33.535325	2025-07-24 14:37:33.535325
259	89	en	Jerusalem	approved	2025-07-24 14:37:33.95541	2025-07-24 14:37:33.95541
260	89	he	ירושלים	approved	2025-07-24 14:37:34.145409	2025-07-24 14:37:34.145409
261	89	ru	Иерусалим	approved	2025-07-24 14:37:34.317388	2025-07-24 14:37:34.317388
262	90	en	Haifa	approved	2025-07-24 14:37:34.787241	2025-07-24 14:37:34.787241
263	90	he	חיפה	approved	2025-07-24 14:37:34.997408	2025-07-24 14:37:34.997408
264	90	ru	Хайфа	approved	2025-07-24 14:37:35.207487	2025-07-24 14:37:35.207487
265	91	en	Rishon LeZion	approved	2025-07-24 14:37:35.637573	2025-07-24 14:37:35.637573
266	91	he	ראשון לציון	approved	2025-07-24 14:37:35.781237	2025-07-24 14:37:35.781237
267	91	ru	Ришон-ле-Цион	approved	2025-07-24 14:37:35.947594	2025-07-24 14:37:35.947594
268	92	en	Petah Tikva	approved	2025-07-24 14:37:36.383324	2025-07-24 14:37:36.383324
269	92	he	פתח תקווה	approved	2025-07-24 14:37:36.515351	2025-07-24 14:37:36.515351
270	92	ru	Петах-Тиква	approved	2025-07-24 14:37:36.674665	2025-07-24 14:37:36.674665
271	93	en	Ashdod	approved	2025-07-24 14:37:36.995471	2025-07-24 14:37:36.995471
272	93	he	אשדוד	approved	2025-07-24 14:37:37.125393	2025-07-24 14:37:37.125393
273	93	ru	Ашдод	approved	2025-07-24 14:37:37.274322	2025-07-24 14:37:37.274322
274	94	en	Netanya	approved	2025-07-24 14:37:37.677461	2025-07-24 14:37:37.677461
275	94	he	נתניה	approved	2025-07-24 14:37:37.787499	2025-07-24 14:37:37.787499
276	94	ru	Нетания	approved	2025-07-24 14:37:37.917492	2025-07-24 14:37:37.917492
277	95	en	Beer Sheva	approved	2025-07-24 14:37:38.325544	2025-07-24 14:37:38.325544
278	95	he	באר שבע	approved	2025-07-24 14:37:38.437373	2025-07-24 14:37:38.437373
279	95	ru	Беэр-Шева	approved	2025-07-24 14:37:38.575687	2025-07-24 14:37:38.575687
280	96	en	Holon	approved	2025-07-24 14:37:39.026607	2025-07-24 14:37:39.026607
281	96	he	חולון	approved	2025-07-24 14:37:39.175515	2025-07-24 14:37:39.175515
282	96	ru	Холон	approved	2025-07-24 14:37:39.317473	2025-07-24 14:37:39.317473
283	97	en	Bnei Brak	approved	2025-07-24 14:37:39.74533	2025-07-24 14:37:39.74533
284	97	he	בני ברק	approved	2025-07-24 14:37:39.875326	2025-07-24 14:37:39.875326
285	97	ru	Бней-Брак	approved	2025-07-24 14:37:40.057489	2025-07-24 14:37:40.057489
286	98	en	Other	approved	2025-07-24 14:37:40.457369	2025-07-24 14:37:40.457369
287	98	he	אחר	approved	2025-07-24 14:37:40.577666	2025-07-24 14:37:40.577666
288	98	ru	Другой	approved	2025-07-24 14:37:40.747433	2025-07-24 14:37:40.747433
289	99	en	Bank Hapoalim	approved	2025-07-24 14:37:41.117335	2025-07-24 14:37:41.117335
290	99	he	בנק הפועלים	approved	2025-07-24 14:37:41.267536	2025-07-24 14:37:41.267536
291	99	ru	Банк Апоалим	approved	2025-07-24 14:37:41.4255	2025-07-24 14:37:41.4255
292	100	en	Bank Leumi	approved	2025-07-24 14:37:41.907533	2025-07-24 14:37:41.907533
293	100	he	בנק לאומי	approved	2025-07-24 14:37:42.027381	2025-07-24 14:37:42.027381
294	100	ru	Банк Леуми	approved	2025-07-24 14:37:42.207464	2025-07-24 14:37:42.207464
295	101	en	Israel Discount Bank	approved	2025-07-24 14:37:42.631414	2025-07-24 14:37:42.631414
296	101	he	בנק דיסקונט	approved	2025-07-24 14:37:42.747482	2025-07-24 14:37:42.747482
297	101	ru	Дисконт Банк	approved	2025-07-24 14:37:42.897625	2025-07-24 14:37:42.897625
298	102	en	Mizrahi Tefahot Bank	approved	2025-07-24 14:37:43.25736	2025-07-24 14:37:43.25736
299	102	he	בנק מזרחי טפחות	approved	2025-07-24 14:37:43.467477	2025-07-24 14:37:43.467477
300	102	ru	Банк Мизрахи-Тфахот	approved	2025-07-24 14:37:43.727557	2025-07-24 14:37:43.727557
301	103	en	First International Bank	approved	2025-07-24 14:37:44.123318	2025-07-24 14:37:44.123318
302	103	he	הבנק הבינלאומי	approved	2025-07-24 14:37:44.247317	2025-07-24 14:37:44.247317
303	103	ru	Первый Международный Банк	approved	2025-07-24 14:37:44.357544	2025-07-24 14:37:44.357544
304	104	en	Bank of Jerusalem	approved	2025-07-24 14:37:44.737359	2025-07-24 14:37:44.737359
305	104	he	בנק ירושלים	approved	2025-07-24 14:37:44.85232	2025-07-24 14:37:44.85232
306	104	ru	Банк Иерусалима	approved	2025-07-24 14:37:45.005576	2025-07-24 14:37:45.005576
307	105	en	Mercantile Discount Bank	approved	2025-07-24 14:37:45.49733	2025-07-24 14:37:45.49733
308	105	he	בנק מרכנתיל דיסקונט	approved	2025-07-24 14:37:45.66533	2025-07-24 14:37:45.66533
309	105	ru	Меркантиль Дисконт Банк	approved	2025-07-24 14:37:45.787374	2025-07-24 14:37:45.787374
310	106	en	Union Bank	approved	2025-07-24 14:37:46.225494	2025-07-24 14:37:46.225494
311	106	he	בנק איגוד	approved	2025-07-24 14:37:46.397452	2025-07-24 14:37:46.397452
312	106	ru	Юнион Банк	approved	2025-07-24 14:37:46.528396	2025-07-24 14:37:46.528396
313	107	en	Other	approved	2025-07-24 14:37:46.947633	2025-07-24 14:37:46.947633
314	107	he	אחר	approved	2025-07-24 14:37:47.112467	2025-07-24 14:37:47.112467
315	107	ru	Другой	approved	2025-07-24 14:37:47.227525	2025-07-24 14:37:47.227525
540	184	en	Please select your main source of income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
541	185	en	Salary	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
542	186	en	Self-employed	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
543	187	en	Pension	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
544	188	en	Unemployment Benefits	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
545	189	en	Investment Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
546	190	en	Student Allowance	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
547	191	en	Other	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
549	193	en	Select any additional income sources	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
550	194	en	Part-time Work	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
551	195	en	Freelance Work	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
552	196	en	Rental Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
553	197	en	Investment Returns	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
554	198	en	Business Income	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
555	199	en	Government Benefits	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
556	200	en	None	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
558	202	en	Please select your professional field	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
559	203	en	Technology/IT	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
560	204	en	Healthcare/Medical	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
561	205	en	Education	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
562	206	en	Finance/Banking	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
563	207	en	Legal Services	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
564	208	en	Manufacturing	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
565	209	en	Sales/Marketing	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
566	210	en	Public Service	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
567	211	en	Construction	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
568	212	en	Other	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
570	214	en	Enter your total monthly income in NIS	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
572	216	en	Select any existing debt types	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
573	217	en	Mortgage Loan	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
574	218	en	Personal Loan	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
575	219	en	Credit Card Debt	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
576	220	en	Car Loan	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
577	221	en	No Existing Debts	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
579	223	en	Enter your total monthly debt payments in NIS	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
584	184	he	אנא בחר את מקור ההכנסה העיקרי שלך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
585	185	he	משכורת	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
586	186	he	עצמאי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
587	187	he	פנסיה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
588	188	he	דמי אבטלה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
589	189	he	הכנסה מהשקעות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
590	190	he	מלגת סטודנט	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
591	191	he	אחר	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
593	193	he	בחר מקורות הכנסה נוספים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
594	194	he	עבודה במשרה חלקית	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
595	195	he	עבודה עצמאית	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
596	196	he	הכנסה מהשכרת נכס	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
597	197	he	תשואות השקעות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
598	198	he	הכנסה מעסק	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
599	199	he	הטבות ממשלתיות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
600	200	he	אין	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
602	202	he	אנא בחר את התחום המקצועי שלך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
603	203	he	טכנולוגיה/מחשבים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
604	204	he	בריאות/רפואה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
605	205	he	חינוך	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
606	206	he	פיננסים/בנקאות	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
607	207	he	שירותים משפטיים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
608	208	he	תעשייה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
609	209	he	מכירות/שיווק	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
610	210	he	שירות ציבורי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
611	211	he	בנייה	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
612	212	he	אחר	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
614	214	he	הזן את סך ההכנסה החודשית שלך בשקלים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
616	216	he	בחר סוגי חובות קיימים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
617	217	he	משכנתא	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
618	218	he	הלוואה אישית	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
619	219	he	חוב כרטיס אשראי	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
620	220	he	הלוואת רכב	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
621	221	he	אין חובות קיימים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
623	223	he	הזן את סך התשלומים החודשיים על חובות בשקלים	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
628	184	ru	Пожалуйста, выберите ваш основной источник дохода	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
629	185	ru	Зарплата	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
630	186	ru	Индивидуальный предприниматель	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
631	187	ru	Пенсия	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
632	188	ru	Пособие по безработице	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
633	189	ru	Доходы от инвестиций	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
634	190	ru	Студенческая стипендия	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
635	191	ru	Другое	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
637	193	ru	Выберите дополнительные источники дохода	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
638	194	ru	Работа на неполный день	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
639	195	ru	Фриланс	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
640	196	ru	Доходы от аренды	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
641	197	ru	Доходы от инвестиций	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
642	198	ru	Доходы от бизнеса	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
643	199	ru	Государственные пособия	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
644	200	ru	Нет	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
646	202	ru	Пожалуйста, выберите вашу профессиональную сферу	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
647	203	ru	Технологии/IT	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
648	204	ru	Здравоохранение/Медицина	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
649	205	ru	Образование	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
650	206	ru	Финансы/Банковское дело	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
651	207	ru	Юридические услуги	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
652	208	ru	Производство	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
653	209	ru	Продажи/Маркетинг	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
654	210	ru	Государственная служба	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
655	211	ru	Строительство	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
656	212	ru	Другое	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
658	214	ru	Введите ваш общий ежемесячный доход в шекелях	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
660	216	ru	Выберите типы существующих долгов	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
661	217	ru	Ипотечный кредит	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
662	218	ru	Потребительский кредит	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
663	219	ru	Долг по кредитной карте	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
664	220	ru	Автокредит	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
665	221	ru	Нет существующих долгов	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
667	223	ru	Введите общую сумму ежемесячных платежей по долгам в шекелях	approved	2025-07-24 23:22:10.588969	2025-07-24 23:22:10.588969
674	230	en	Show All Offers	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
675	231	en	Best Interest Rate	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
676	232	en	Lowest Monthly Payment	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
677	233	en	Shortest Repayment Period	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
702	230	he	הצג את כל ההצעות	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
703	231	he	הריבית הטובה ביותר	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
704	232	he	התשלום החודשי הנמוך ביותר	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
705	233	he	תקופת ההחזר הקצרה ביותר	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
730	230	ru	Показать все предложения	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
731	231	ru	Лучшая процентная ставка	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
732	232	ru	Наименьший ежемесячный платеж	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
733	233	ru	Кратчайший период погашения	approved	2025-07-24 23:22:10.929946	2025-07-24 23:22:10.929946
1165	392	en	Bank	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1166	392	he	בנק	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1167	392	ru	Банк	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1168	393	en	Mortgage Registration	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1169	393	he	רישום משכנתא	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1170	393	ru	Регистрация ипотеки	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1171	394	en	Credit Registration	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1172	394	he	רישום אשראי	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1173	394	ru	Регистрация кредита	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1174	395	en	Prime Rate Mortgage	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1175	395	he	משכנתא בריבית פריים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1176	395	ru	Ипотека по прайм-ставке	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1177	396	en	Fixed Rate Mortgage	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1178	396	he	משכנתא בריבית קבועה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1179	396	ru	Ипотека с фиксированной ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1180	397	en	Variable Rate Mortgage	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1181	397	he	משכנתא בריבית משתנה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1182	397	ru	Ипотека с плавающей ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1183	398	en	Prime Rate Credit	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1184	398	he	אשראי בריבית פריים	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1185	398	ru	Кредит по прайм-ставке	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1186	399	en	Fixed Rate Credit	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1187	399	he	אשראי בריבית קבועה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1188	399	ru	Кредит с фиксированной ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1189	400	en	Variable Rate Credit	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1190	400	he	אשראי בריבית משתנה	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1191	400	ru	Кредит с плавающей ставкой	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1192	401	en	Total amount	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1193	401	he	סכום כולל	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1194	401	ru	Общая сумма	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1195	402	en	Monthly payment	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1196	402	he	תשלום חודשי	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1197	402	ru	Ежемесячный платеж	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1198	403	en	Interest rate	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1199	403	he	שיעור ריבית	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1200	403	ru	Процентная ставка	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1201	404	en	Repayment period	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1202	404	he	תקופת החזר	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1203	404	ru	Период погашения	approved	2025-07-27 05:34:27.249964	2025-07-27 05:40:36.370473
1240	417	en	Total repayment	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1241	417	he	סה"כ החזר	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1242	417	ru	Общая сумма возврата	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1246	419	en	Total repayment	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1247	419	he	סה"כ החזר	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1248	419	ru	Общая сумма возврата	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1249	420	en	Total amount	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1250	420	he	סכום כולל	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1251	420	ru	Общая сумма	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1252	421	en	Monthly payment	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1253	421	he	תשלום חודשי	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1254	421	ru	Ежемесячный платеж	approved	2025-07-27 05:37:15.99225	2025-07-27 05:40:36.370473
1258	423	en	Enter credit amount	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1259	423	he	הזן סכום האשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1260	423	ru	Введите сумму кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1264	425	en	Select credit purpose	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1265	425	he	בחר מטרת אשראי	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1266	425	ru	Выберите цель кредита	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1267	426	en	Vehicle purchase	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1268	426	he	רכישת רכב	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1269	426	ru	Покупка автомобиля	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1270	427	en	Home renovation	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1271	427	he	שיפוץ בית	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1272	427	ru	Ремонт дома	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1273	428	en	Wedding and events	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1274	428	he	חתונה ואירועים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1275	428	ru	Свадьба и мероприятия	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1276	429	en	Business investment	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1277	429	he	השקעה עסקית	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1278	429	ru	Бизнес-инвестиции	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1279	430	en	Improve future credit eligibility	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1280	430	he	שיפור זכאות אשראי עתידית	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1281	430	ru	Улучшение кредитной истории	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1282	431	en	Other	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1283	431	he	אחר	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1284	431	ru	Другое	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1288	433	en	Select repayment period	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1289	433	he	בחר תקופת פירעון	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1290	433	ru	Выберите период погашения	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1291	434	en	Up to one year	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1292	434	he	עד שנה אחת	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1293	434	ru	До одного года	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1294	435	en	Up to two years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1295	435	he	עד שנתיים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1296	435	ru	До двух лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1297	436	en	Up to 3 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1298	436	he	עד 3 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1299	436	ru	До 3 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1300	437	en	Up to 5 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1301	437	he	עד 5 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1302	437	ru	До 5 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1303	438	en	Over 5 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1304	438	he	מעל 5 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1305	438	ru	Свыше 5 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1306	439	en	Over 7 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1307	439	he	מעל 7 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1308	439	ru	Свыше 7 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1309	440	en	Over 10 years	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1310	440	he	מעל 10 שנים	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1311	440	ru	Свыше 10 лет	approved	2025-07-27 12:12:59.578698	2025-07-27 12:12:59.578698
1357	456	en	Best Rate	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1358	456	he	הריבית הטובה ביותר	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1359	456	ru	Лучшая ставка	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1360	457	en	Lowest Monthly Payment	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1361	457	he	התשלום החודשי הנמוך ביותר	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1362	457	ru	Самый низкий ежемесячный платеж	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1363	458	en	Fastest Approval	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1364	458	he	האישור המהיר ביותר	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1365	458	ru	Самое быстрое одобрение	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1366	459	en	My Bank	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1367	459	he	הבנק שלי	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1368	459	ru	Мой банк	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1375	462	en	Improve interest rate	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1376	462	he	שיפור הריבית	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1377	462	ru	Улучшить процентную ставку	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1378	463	en	Reduce credit amount	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1379	463	he	הקטנת סכום האשראי	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1380	463	ru	Уменьшить сумму кредита	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1381	464	en	Increase term to reduce payment	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1382	464	he	הארכת התקופה להקטנת התשלום	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1383	464	ru	Увеличить срок для снижения платежа	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1384	465	en	Increase payment to reduce term	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1385	465	he	הגדלת התשלום להקטנת התקופה	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1386	465	ru	Увеличить платеж для сокращения срока	approved	2025-07-27 12:14:33.599819	2025-07-27 12:14:33.599819
1408	473	en	Select goal	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1409	473	he	בחר מטרה	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1410	473	ru	Выберите цель	approved	2025-07-27 12:35:52.621758	2025-07-27 12:35:52.621758
1978	663	en	No obligations	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1979	663	he	אין התחייבות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1980	663	ru	Нет обязательств	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1981	664	en	Bank loan	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1982	664	he	הלוואה בנקאית	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1983	664	ru	Банковский кредит	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1984	665	en	Consumer credit	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1985	665	he	אשראי צרכני	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1986	665	ru	Потребительский кредит	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1987	666	en	Credit card debt	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1988	666	he	חוב כרטיס אשראי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1989	666	ru	Долг по кредитной карте	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1990	667	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1991	667	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1992	667	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1993	668	en	Select obligation type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1994	668	he	בחר סוג התחייבות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1995	668	ru	Выберите тип обязательства	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
1999	670	en	Single	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2000	670	he	רווק/רווקה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2001	670	ru	Холост/не замужем	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2002	671	en	Married	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2003	671	he	נשוי/נשואה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2004	671	ru	Женат/замужем	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2005	672	en	Divorced	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2006	672	he	גרוש/גרושה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2007	672	ru	Разведен/разведена	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2008	673	en	Widowed	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2009	673	he	אלמן/אלמנה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2010	673	ru	Вдовец/вдова	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2011	674	en	Common-law partner	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2012	674	he	ידוע/ידועה בציבור	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2013	674	ru	Гражданский брак	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2014	675	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2015	675	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2016	675	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2017	676	en	Select marital status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2018	676	he	בחר מצב משפחתי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2019	676	ru	Выберите семейное положение	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2035	682	en	Select property status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2036	682	he	בחר סטטוס הנכס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2037	682	ru	Выберите статус недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2041	684	en	None	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2042	684	he	אין הכנסות נוספות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2043	684	ru	Нет дополнительных доходов	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2044	685	en	Additional Salary	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2045	685	he	שכר נוסף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2046	685	ru	Дополнительная зарплата	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2047	686	en	Additional Work	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2048	686	he	עבודה נוספת	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2049	686	ru	Дополнительная работа	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2050	687	en	Property Rental	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2051	687	he	הכנסה מהשכרת נכסים	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2052	687	ru	Доход от аренды недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2053	688	en	Investments	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2054	688	he	הכנסה מהשקעות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2055	688	ru	Доход от инвестиций	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2056	689	en	Pension	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2057	689	he	קצבת פנסיה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2058	689	ru	Пенсия	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2059	690	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2060	690	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2061	690	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2062	691	en	Select additional income type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2063	691	he	בחר סוג הכנסה נוספת	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2064	691	ru	Выберите тип дополнительного дохода	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2089	700	en	Employee	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2090	700	he	עובד שכיר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2091	700	ru	Наемный работник	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2092	701	en	Self-employed	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2093	701	he	עצמאי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2094	701	ru	Самозанятый	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2095	702	en	Pensioner	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2096	702	he	פנסיונר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2097	702	ru	Пенсионер	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2098	703	en	Student	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2099	703	he	סטודנט	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2100	703	ru	Студент	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2101	704	en	Unpaid leave	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2102	704	he	חופשה ללא תשלום	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2103	704	ru	Отпуск без содержания	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2104	705	en	Unemployed	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2105	705	he	מובטל	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2106	705	ru	Безработный	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2107	706	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2108	706	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2109	706	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2110	707	en	Select main income source	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2111	707	he	בחר מקור הכנסה עיקרי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2112	707	ru	Выберите основной источник дохода	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2122	711	en	Enter first name and last name	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2123	711	he	הזן שם פרטי ושם משפחה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2124	711	ru	Введите имя и фамилию	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2185	732	en	Apartment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2186	732	he	דירה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2187	732	ru	Квартира	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2188	733	en	Private house	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2189	733	he	בית פרטי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2190	733	ru	Частный дом	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2191	734	en	Garden apartment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2192	734	he	דירת גן	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2193	734	ru	Квартира с садом	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2194	735	en	Penthouse	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2195	735	he	פנטהאוס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2196	735	ru	Пентхаус	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2197	736	en	Other	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2198	736	he	אחר	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2199	736	ru	Другое	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2200	737	en	Select mortgage type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2201	737	he	בחר סוג משכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2202	737	ru	Выберите тип ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2221	744	en	Select timeframe	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2222	744	he	בחר מסגרת זמן	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2223	744	ru	Выберите период	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2242	751	en	Select Bank from List	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2243	751	he	בחר בנק מהרשימה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2244	751	ru	Выберите банк из списка	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2254	755	en	Yes, Registered in Land Registry	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2255	755	he	כן, רשומה בטאבו	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2256	755	ru	Да, зарегистрирована в реестре	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2257	756	en	No, Not Registered	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2258	756	he	לא, לא רשומה	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2259	756	ru	Нет, не зарегистрирована	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2263	758	en	Select Registration Status	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2264	758	he	בחר אפשרות רישום	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2265	758	ru	Выберите вариант регистрации	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2281	764	en	Select Interest Type	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2282	764	he	בחר סוג נכס	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2283	764	ru	Выберите тип недвижимости	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2287	766	en	Lower Interest Rate	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2288	766	he	הפחתת הריבית	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2289	766	ru	Снижение процентной ставки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2290	767	en	Reduce Monthly Payment	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2291	767	he	הפחתת התשלום החודשי	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2292	767	ru	Снижение ежемесячного платежа	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2293	768	en	Shorten Mortgage Term	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2294	768	he	קיצור תקופת המשכנתא	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2295	768	ru	Сокращение срока ипотеки	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2296	769	en	Cash Out Refinance	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2297	769	he	משיכת מזומן נוסף	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2298	769	ru	Получение дополнительных наличных	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2299	770	en	Consolidate Debts	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2300	770	he	איחוד חובות	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2301	770	ru	Консолидация долгов	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2302	771	en	Select Refinance Purpose	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2303	771	he	בחר מטרת מחזור	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2304	771	ru	Выберите цель рефинансирования	approved	2025-07-27 13:18:36.407643	2025-07-27 13:18:36.407643
2229	746	ru	[\n                {"value": "bank_hapoalim", "label": "Банк Апоалим"},\n                {"value": "bank_leumi", "label": "Банк Леуми"},\n                {"value": "bank_discount", "label": "Банк Дисконт"},\n                {"value": "mizrahi_tefahot", "label": "Мизрахи Тфахот"},\n                {"value": "first_international", "label": "Первый международный банк"},\n                {"value": "other", "label": "Другой банк"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.966742
2227	746	en	[\n                {"value": "bank_hapoalim", "label": "Bank Hapoalim"},\n                {"value": "bank_leumi", "label": "Bank Leumi"},\n                {"value": "bank_discount", "label": "Bank Discount"},\n                {"value": "mizrahi_tefahot", "label": "Mizrahi Tefahot Bank"},\n                {"value": "first_international", "label": "First International Bank"},\n                {"value": "other", "label": "Other Bank"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.219524
2261	757	he	[\n                {"value": "yes", "label": "כן, רשומה בטאבו"},\n                {"value": "no", "label": "לא, לא רשומה בטאבו"},\n                {"value": "unknown", "label": "לא יודע"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.495779
2278	763	en	[\n                {"value": "fixed", "label": "Fixed Interest Rate"},\n                {"value": "variable", "label": "Variable Interest Rate"},\n                {"value": "mixed", "label": "Mixed Interest Rate"},\n                {"value": "prime", "label": "Prime Interest Rate"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.989851
163	57	en	Education	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
164	57	he	השכלה	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
165	57	ru	Образование	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
166	58	en	Select your education level	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
167	58	he	בחר את רמת ההשכלה שלך	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
168	58	ru	Выберите уровень образования	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
169	59	en	No high school diploma	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
170	59	he	ללא תעודת בגרות	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
171	59	ru	Без аттестата о среднем образовании	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
172	60	en	Partial high school diploma	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
173	60	he	תעודת בגרות חלקית	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
174	60	ru	Частичный аттестат о среднем образовании	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
175	61	en	Full high school diploma	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
176	61	he	תעודת בגרות מלאה	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
177	61	ru	Полный аттестат о среднем образовании	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
178	62	en	Post-secondary education	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
179	62	he	השכלה על-תיכונית	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
180	62	ru	Послесреднее образование	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
182	63	he	תואר ראשון	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
183	63	ru	Высшее образование (бакалавриат)	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
184	64	en	Master's degree	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
185	64	he	תואר שני	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
186	64	ru	Высшее образование (магистратура)	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
187	65	en	Doctoral degree	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
188	65	he	תואר שלישי	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
189	65	ru	Высшее образование (докторантура)	approved	2025-07-24 14:32:18.140158	2025-07-28 08:31:24.540467
318	110	en	Please select your education level	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
319	111	en	Elementary School	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
320	112	en	High School	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
321	113	en	Professional Certificate	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
322	114	en	Bachelor's Degree	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
323	115	en	Master's Degree	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
324	116	en	Doctorate	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
325	117	en	Other	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
327	119	en	Please select your family status	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
328	120	en	Single	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
329	121	en	Married	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
330	122	en	Divorced	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
331	123	en	Widowed	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
332	124	en	Common Law Marriage	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
333	125	en	Other	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
335	127	en	Please select your citizenship status	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
336	128	en	Israeli Citizen	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
337	129	en	New Immigrant	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
338	130	en	Foreign Resident	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
340	132	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
341	133	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
343	135	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
344	136	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
346	138	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
347	139	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
349	141	en	Yes	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
350	142	en	No	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
355	110	he	אנא בחר את רמת השכלתך	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
356	111	he	בית ספר יסודי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
357	112	he	תיכון	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
358	113	he	תעודה מקצועית	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
359	114	he	תואר ראשון	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
360	115	he	תואר שני	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
361	116	he	דוקטורט	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
362	117	he	אחר	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
364	119	he	אנא בחר את מצבך המשפחתי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
365	120	he	רווק/ה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
366	121	he	נשוי/אה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
367	122	he	גרוש/ה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
368	123	he	אלמן/ה	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
369	124	he	זוגיות ללא נישואין	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
370	125	he	אחר	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
372	127	he	אנא בחר את סטטוס האזרחות שלך	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
373	128	he	אזרח ישראלי	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
374	129	he	עולה חדש	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
375	130	he	תושב זר	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
377	132	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
378	133	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
380	135	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
381	136	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
383	138	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
384	139	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
386	141	he	כן	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
387	142	he	לא	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
392	110	ru	Пожалуйста, выберите ваш уровень образования	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
393	111	ru	Начальная школа	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
394	112	ru	Средняя школа	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
395	113	ru	Профессиональный сертификат	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
396	114	ru	Степень бакалавра	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
397	115	ru	Степень магистра	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
398	116	ru	Докторская степень	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
399	117	ru	Другое	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
401	119	ru	Пожалуйста, выберите ваше семейное положение	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
402	120	ru	Холост/не замужем	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
403	121	ru	Женат/замужем	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
404	122	ru	Разведен/а	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
405	123	ru	Вдовец/вдова	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
406	124	ru	Гражданский брак	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
407	125	ru	Другое	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
409	127	ru	Пожалуйста, выберите ваш статус гражданства	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
410	128	ru	Гражданин Израиля	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
411	129	ru	Новый иммигрант	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
412	130	ru	Иностранный резидент	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
414	132	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
415	133	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
417	135	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
418	136	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
420	138	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
421	139	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
423	141	ru	Да	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
424	142	ru	Нет	approved	2025-07-24 23:21:10.616639	2025-07-28 08:31:24.540467
1120	377	en	Apartment	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1121	377	he	דירה	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1122	377	ru	Квартира	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1123	378	en	House	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1124	378	he	בית	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1125	378	ru	Дом	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1126	379	en	Commercial	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1127	379	he	מסחרי	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1128	379	ru	Коммерческая	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1129	380	en	Yes, first property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1130	380	he	כן, נכס ראשון	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1131	380	ru	Да, первая недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1132	381	en	No, additional property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1133	381	he	לא, נכס נוסף	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1134	381	ru	Нет, дополнительная недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1135	382	en	I don't own property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1136	382	he	אני לא מחזיק בנכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1137	382	ru	У меня нет недвижимости	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1138	383	en	I own a property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1139	383	he	אני מחזיק בנכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1140	383	ru	У меня есть недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1141	384	en	I'm selling a property	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1142	384	he	אני מוכר נכס	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
1143	384	ru	Я продаю недвижимость	approved	2025-07-26 19:59:40.506245	2025-07-28 08:31:24.540467
2323	819	en	Select goal	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2324	820	en	Improve interest rate	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2325	821	en	Reduce credit amount	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2326	822	en	Increase term to reduce payment	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2327	823	en	Increase payment to reduce term	approved	2025-07-29 05:35:16.371763	2025-07-29 05:35:16.371763
2330	826	en	Bank Hapoalim	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2331	827	en	Bank Leumi	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2332	828	en	Discount Bank	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2333	829	en	Massad Bank	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2334	830	en	Bank of Israel	approved	2025-07-29 05:35:27.650921	2025-07-29 05:35:27.650921
2345	841	en	Select date	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2346	842	en	Select bank	approved	2025-07-29 05:35:44.12139	2025-07-29 05:35:44.12139
2350	819	he	בחר מטרה	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2351	820	he	שיפור הריבית	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2352	821	he	הפחתת סכום האשראי	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2353	822	he	הגדלת התקופה כדי להפחית את התשלום	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2354	823	he	הגדלת התשלום כדי לקצר את התקופה	approved	2025-07-29 05:36:14.132908	2025-07-29 05:36:14.132908
2357	826	he	בנק הפועלים	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2358	827	he	בנק לאומי	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2359	828	he	בנק דיסקונט	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2360	829	he	בנק מסד	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2361	830	he	בנק ישראל	approved	2025-07-29 05:36:26.182414	2025-07-29 05:36:26.182414
2372	841	he	בחר תאריך	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2373	842	he	בחר בנק	approved	2025-07-29 05:36:45.393205	2025-07-29 05:36:45.393205
2377	819	ru	Выберите цель	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2378	820	ru	Улучшить процентную ставку	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2379	821	ru	Уменьшить сумму кредита	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2380	822	ru	Увеличить срок, чтобы уменьшить платеж	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2381	823	ru	Увеличить платеж, чтобы уменьшить срок	approved	2025-07-29 05:36:58.281026	2025-07-29 05:36:58.281026
2384	826	ru	Банк Апоалим	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2385	827	ru	Банк Леуми	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2386	828	ru	Банк Дисконт	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2387	829	ru	Банк Масад	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2388	830	ru	Банк Израиля	approved	2025-07-29 05:37:09.25225	2025-07-29 05:37:09.25225
2399	841	ru	Выберите дату	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2400	842	ru	Выберите банк	approved	2025-07-29 05:37:26.151575	2025-07-29 05:37:26.151575
2413	796	en	How many mortgage borrowers will there be in total, including you?	approved	2025-07-29 06:14:05.897489	2025-07-29 06:14:05.897489
2414	796	he	 כמה חייבים במשכנתא יהיו בסך הכול, כולל אתכם?	approved	2025-07-29 06:14:06.025757	2025-07-29 06:14:06.025757
2415	796	ru	Сколько всего заемщиков будет по ипотеке, включая вас?	approved	2025-07-29 06:14:06.165269	2025-07-29 06:14:06.165269
2416	803	en	Children under 18	approved	2025-07-29 06:14:06.295392	2025-07-29 06:14:06.295392
2417	803	he	ילדים מתחת לגיל 18	approved	2025-07-29 06:14:06.425275	2025-07-29 06:14:06.425275
2418	803	ru	Дети до 18 лет	approved	2025-07-29 06:14:06.583513	2025-07-29 06:14:06.583513
2419	810	en	Do you have additional citizenship?	approved	2025-07-29 06:14:06.705511	2025-07-29 06:14:06.705511
2420	810	he	האם יש לך אזרחות נוספת?	approved	2025-07-29 06:14:06.837525	2025-07-29 06:14:06.837525
2421	810	ru	Имеете ли вы дополнительное гражданство?	approved	2025-07-29 06:14:06.988041	2025-07-29 06:14:06.988041
2422	812	en	Israel	approved	2025-07-29 06:14:07.147343	2025-07-29 06:14:07.147343
2423	812	he	ישראל	approved	2025-07-29 06:14:07.325245	2025-07-29 06:14:07.325245
2424	812	ru	Израиль	approved	2025-07-29 06:14:07.466896	2025-07-29 06:14:07.466896
2425	813	en	United States	approved	2025-07-29 06:14:07.597329	2025-07-29 06:14:07.597329
2426	813	he	ארצות הברית	approved	2025-07-29 06:14:07.707435	2025-07-29 06:14:07.707435
2427	813	ru	США	approved	2025-07-29 06:14:07.851068	2025-07-29 06:14:07.851068
2428	814	en	Russia	approved	2025-07-29 06:14:08.010852	2025-07-29 06:14:08.010852
2429	814	he	רוסיה	approved	2025-07-29 06:14:08.564839	2025-07-29 06:14:08.564839
2430	814	ru	Россия	approved	2025-07-29 06:14:08.697004	2025-07-29 06:14:08.697004
2431	815	en	Germany	approved	2025-07-29 06:14:08.887132	2025-07-29 06:14:08.887132
2432	815	he	גרמניה	approved	2025-07-29 06:14:09.008179	2025-07-29 06:14:09.008179
2433	815	ru	Германия	approved	2025-07-29 06:14:09.16732	2025-07-29 06:14:09.16732
2449	811	en	Select citizenship	approved	2025-07-29 06:14:11.442317	2025-07-29 06:14:11.442317
2450	811	he	בחר אזרחות	approved	2025-07-29 06:14:11.564951	2025-07-29 06:14:11.564951
2451	811	ru	Выберите гражданство	approved	2025-07-29 06:14:11.679526	2025-07-29 06:14:11.679526
2455	785	en	For application approval, it is mandatory to detail all stakeholders and partners	approved	2025-07-29 06:14:12.22515	2025-07-29 06:14:12.22515
2456	785	he	לשם אישור הבקשה, חובה לפרט את פרטי כלל בעלי העניין והשותפים	approved	2025-07-29 06:14:12.344946	2025-07-29 06:14:12.344946
2457	785	ru	Для подтверждения заявки необходимо предоставить данные всех заинтересованных лиц и партнеров	approved	2025-07-29 06:14:12.467054	2025-07-29 06:14:12.467054
2458	787	en	Education	approved	2025-07-29 06:14:12.577088	2025-07-29 06:14:12.577088
2459	787	he	 השכלה	approved	2025-07-29 06:14:12.716788	2025-07-29 06:14:12.716788
2460	787	ru	Образование	approved	2025-07-29 06:14:12.844043	2025-07-29 06:14:12.844043
2461	789	en	No high school diploma	approved	2025-07-29 06:14:12.996963	2025-07-29 06:14:12.996963
2462	789	he	ללא תעודת בגרות	approved	2025-07-29 06:14:13.164914	2025-07-29 06:14:13.164914
2463	789	ru	Без аттестата о среднем образовании	approved	2025-07-29 06:14:13.302195	2025-07-29 06:14:13.302195
2464	790	en	Partial high school diploma	approved	2025-07-29 06:14:13.446877	2025-07-29 06:14:13.446877
2465	790	he	תעודת בגרות חלקית	approved	2025-07-29 06:14:13.58759	2025-07-29 06:14:13.58759
2466	790	ru	Частичный аттестат о среднем образовании	approved	2025-07-29 06:14:13.707174	2025-07-29 06:14:13.707174
2467	791	en	Full high school diploma	approved	2025-07-29 06:14:13.836907	2025-07-29 06:14:13.836907
2468	791	he	תעודת בגרות מלאה	approved	2025-07-29 06:14:13.997241	2025-07-29 06:14:13.997241
2469	791	ru	Полный аттестат о среднем образовании	approved	2025-07-29 06:14:14.177163	2025-07-29 06:14:14.177163
2470	792	en	Post-secondary education	approved	2025-07-29 06:14:14.317078	2025-07-29 06:14:14.317078
2471	792	he	השכלה על-תיכונית	approved	2025-07-29 06:14:14.466983	2025-07-29 06:14:14.466983
2472	792	ru	Послесреднее образование	approved	2025-07-29 06:14:14.616968	2025-07-29 06:14:14.616968
2473	793	en	Bachelor's degree	approved	2025-07-29 06:14:14.755159	2025-07-29 06:14:14.755159
2474	793	he	תואר ראשון	approved	2025-07-29 06:14:14.906917	2025-07-29 06:14:14.906917
2475	793	ru	Высшее образование (бакалавриат)	approved	2025-07-29 06:14:15.01686	2025-07-29 06:14:15.01686
2476	794	en	Master's degree	approved	2025-07-29 06:14:15.155012	2025-07-29 06:14:15.155012
2477	794	he	תואר שני	approved	2025-07-29 06:14:15.267342	2025-07-29 06:14:15.267342
2478	794	ru	Высшее образование (магистратура)	approved	2025-07-29 06:14:15.404903	2025-07-29 06:14:15.404903
2479	795	en	Doctoral degree	approved	2025-07-29 06:14:15.526942	2025-07-29 06:14:15.526942
2480	795	he	תואר שלישי	approved	2025-07-29 06:14:15.656906	2025-07-29 06:14:15.656906
2481	795	ru	Высшее образование (докторантура)	approved	2025-07-29 06:14:15.807122	2025-07-29 06:14:15.807122
2482	788	en	Select education level	approved	2025-07-29 06:14:15.927787	2025-07-29 06:14:15.927787
2483	788	he	בחר רמת השכלה	approved	2025-07-29 06:14:16.055883	2025-07-29 06:14:16.055883
2484	788	ru	Выберите уровень образования	approved	2025-07-29 06:14:16.187095	2025-07-29 06:14:16.187095
2485	797	en	Select number of borrowers	approved	2025-07-29 06:15:51.398715	2025-07-29 06:15:51.398715
2486	797	he	בחר מספר לווים	approved	2025-07-29 06:15:51.546081	2025-07-29 06:15:51.546081
2487	797	ru	Выберите количество заемщиков	approved	2025-07-29 06:15:51.74937	2025-07-29 06:15:51.74937
2488	798	en	1 borrower	approved	2025-07-29 06:15:52.236577	2025-07-29 06:15:52.236577
2489	798	he	לווה אחד	approved	2025-07-29 06:15:52.622372	2025-07-29 06:15:52.622372
2490	798	ru	1 заемщик	approved	2025-07-29 06:15:52.779447	2025-07-29 06:15:52.779447
2491	799	en	2 borrowers	approved	2025-07-29 06:15:53.128648	2025-07-29 06:15:53.128648
2492	799	he	2 לווים	approved	2025-07-29 06:15:53.27814	2025-07-29 06:15:53.27814
2493	799	ru	2 заемщика	approved	2025-07-29 06:15:53.658169	2025-07-29 06:15:53.658169
2494	800	en	3 borrowers	approved	2025-07-29 06:15:54.147958	2025-07-29 06:15:54.147958
2495	800	he	3 לווים	approved	2025-07-29 06:15:54.318289	2025-07-29 06:15:54.318289
2496	800	ru	3 заемщика	approved	2025-07-29 06:15:54.508132	2025-07-29 06:15:54.508132
2497	801	en	4 borrowers	approved	2025-07-29 06:15:54.788016	2025-07-29 06:15:54.788016
2498	801	he	4 לווים	approved	2025-07-29 06:15:54.938106	2025-07-29 06:15:54.938106
2499	801	ru	4 заемщика	approved	2025-07-29 06:15:55.128101	2025-07-29 06:15:55.128101
2500	802	en	5 or more borrowers	approved	2025-07-29 06:15:55.386415	2025-07-29 06:15:55.386415
2501	802	he	5 לווים או יותר	approved	2025-07-29 06:15:55.566117	2025-07-29 06:15:55.566117
2502	802	ru	5 или более заемщиков	approved	2025-07-29 06:15:55.735824	2025-07-29 06:15:55.735824
2503	804	en	Select number of children	approved	2025-07-29 06:15:56.067996	2025-07-29 06:15:56.067996
2504	804	he	בחר מספר ילדים	approved	2025-07-29 06:15:56.207007	2025-07-29 06:15:56.207007
2505	804	ru	Выберите количество детей	approved	2025-07-29 06:15:56.328096	2025-07-29 06:15:56.328096
2506	805	en	No children	approved	2025-07-29 06:15:56.586054	2025-07-29 06:15:56.586054
2507	805	he	אין ילדים	approved	2025-07-29 06:15:56.777083	2025-07-29 06:15:56.777083
2508	805	ru	Нет детей	approved	2025-07-29 06:15:56.915206	2025-07-29 06:15:56.915206
2509	806	en	1 child	approved	2025-07-29 06:15:57.325152	2025-07-29 06:15:57.325152
2510	806	he	ילד אחד	approved	2025-07-29 06:15:57.507945	2025-07-29 06:15:57.507945
2511	806	ru	1 ребенок	approved	2025-07-29 06:15:57.628211	2025-07-29 06:15:57.628211
2512	807	en	2 children	approved	2025-07-29 06:15:59.787938	2025-07-29 06:15:59.787938
2513	807	he	2 ילדים	approved	2025-07-29 06:15:59.931039	2025-07-29 06:15:59.931039
2514	807	ru	2 детей	approved	2025-07-29 06:16:00.126004	2025-07-29 06:16:00.126004
2515	808	en	3 children	approved	2025-07-29 06:16:00.427054	2025-07-29 06:16:00.427054
2516	808	he	3 ילדים	approved	2025-07-29 06:16:00.556967	2025-07-29 06:16:00.556967
2517	808	ru	3 детей	approved	2025-07-29 06:16:00.748269	2025-07-29 06:16:00.748269
2518	809	en	4 or more children	approved	2025-07-29 06:16:01.047984	2025-07-29 06:16:01.047984
2519	809	he	4 ילדים או יותר	approved	2025-07-29 06:16:01.258058	2025-07-29 06:16:01.258058
2520	809	ru	4 или более детей	approved	2025-07-29 06:16:01.466159	2025-07-29 06:16:01.466159
2594	863	ru	Банк Апоалим	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2184	731	ru	[\n                {"value": "standard", "label": "Стандартная ипотека"},\n                {"value": "refinance", "label": "Рефинансирование"},\n                {"value": "commercial", "label": "Коммерческая ипотека"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.549637
2183	731	he	[\n                {"value": "standard", "label": "משכנתא רגילה"},\n                {"value": "refinance", "label": "מיחזור משכנתא"},\n                {"value": "commercial", "label": "משכנתא מסחרית"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.709818
2182	731	en	[\n                {"value": "standard", "label": "Standard Mortgage"},\n                {"value": "refinance", "label": "Mortgage Refinance"},\n                {"value": "commercial", "label": "Commercial Mortgage"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:05.839518
2228	746	he	[\n                {"value": "bank_hapoalim", "label": "בנק הפועלים"},\n                {"value": "bank_leumi", "label": "בנק לאומי"},\n                {"value": "bank_discount", "label": "בנק דיסקונט"},\n                {"value": "mizrahi_tefahot", "label": "מזרחי טפחות"},\n                {"value": "first_international", "label": "הבנק הבינלאומי הראשון"},\n                {"value": "other", "label": "בנק אחר"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.087959
2262	757	ru	[\n                {"value": "yes", "label": "Да, зарегистрирована"},\n                {"value": "no", "label": "Нет, не зарегистрирована"},\n                {"value": "unknown", "label": "Не знаю"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.375717
2260	757	en	[\n                {"value": "yes", "label": "Yes, registered in land registry"},\n                {"value": "no", "label": "No, not registered"},\n                {"value": "unknown", "label": "I dont know"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.606769
2280	763	ru	[\n                {"value": "fixed", "label": "Фиксированная ставка"},\n                {"value": "variable", "label": "Переменная ставка"},\n                {"value": "mixed", "label": "Смешанная ставка"},\n                {"value": "prime", "label": "Прайм ставка"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.724457
2279	763	he	[\n                {"value": "fixed", "label": "ריבית קבועה"},\n                {"value": "variable", "label": "ריבית משתנה"},\n                {"value": "mixed", "label": "ריבית מעורבת"},\n                {"value": "prime", "label": "ריבית פריים"}\n              ]	approved	2025-07-27 13:18:36.407643	2025-07-30 06:22:06.829304
2531	844	ru	Снижение процентной ставки	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2526	844	he	הורדת ריבית	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2521	844	en	Lower Interest Rate	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2532	845	ru	Уменьшение ежемесячного платежа	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2527	845	he	הפחתת תשלום חודשי	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2522	845	en	Reduce Monthly Payment	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2533	846	ru	Сокращение срока ипотеки	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2528	846	he	קיצור תקופת המשכנתא	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2523	846	en	Shorten Mortgage Term	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2534	847	ru	Рефинансирование с извлечением средств	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2529	847	he	מחזור עם משיכת כספים	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2524	847	en	Cash Out Refinance	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2535	848	ru	Консолидация долгов	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2530	848	he	איחוד חובות	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2525	848	en	Consolidate Debts	approved	2025-07-29 11:04:01.578356	2025-07-30 13:07:59.251411
2540	849	ru	Да, зарегистрировано в земельном кадастре	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2538	849	he	כן, רשום בטאבו	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2536	849	en	Yes, Registered in Land Registry	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2541	850	ru	Нет, не зарегистрировано	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2539	850	he	לא, לא רשום	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2537	850	en	No, Not Registered	approved	2025-07-29 11:04:01.852705	2025-07-30 13:07:59.251411
2550	851	ru	Банк Хапоалим	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2546	851	he	בנק הפועלים	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2542	851	en	Bank Hapoalim	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2551	852	ru	Банк Леуми	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2547	852	he	בנק לאומי	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2543	852	en	Bank Leumi	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2552	853	ru	Дисконт Банк	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2548	853	he	בנק דיסקונט	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2544	853	en	Discount Bank	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2553	854	ru	Банк Масад	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2549	854	he	בנק המסד	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2545	854	en	Massad Bank	approved	2025-07-29 11:04:02.098589	2025-07-30 13:07:59.251411
2571	856	ru	Цель рефинансирования ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2563	856	he	מטרת מחזור המשכנתא	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2555	856	en	Purpose of Mortgage Refinance	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2572	857	ru	Остаток по ипотеке	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2564	857	he	יתרת המשכנתא הנוכחית	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2556	857	en	Remaining Mortgage Balance	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2573	858	ru	Текущая стоимость недвижимости	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2565	858	he	שווי הנכס הנוכחי	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2557	858	en	Current Property Value	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2574	859	ru	Тип недвижимости	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2566	859	he	סוג הנכס	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2558	859	en	Property Type	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2575	860	ru	Текущий банк ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2567	860	he	בנק המשכנתא הנוכחי	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2559	860	en	Current Mortgage Bank	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2576	861	ru	Зарегистрирована ли ипотека в земельном кадастре?	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2568	861	he	האם המשכנתא רשומה בטאבו?	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2560	861	en	Is the Mortgage Registered in Land Registry?	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2577	862	ru	Дата начала ипотеки	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2569	862	he	תאריך תחילת המשכנתא	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2561	862	en	Mortgage Start Date	approved	2025-07-29 11:04:02.279289	2025-07-30 13:07:59.251411
2586	863	he	בנק הפועלים	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2578	863	en	Bank Hapoalim	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2595	864	ru	Банк Леуми	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2587	864	he	בנק לאומי	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2579	864	en	Bank Leumi	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2596	865	ru	Банк Дисконт	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2588	865	he	בנק דיסקונט	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2580	865	en	Discount Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2597	866	ru	Банк Масад	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2589	866	he	בנק מסד	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2581	866	en	Massad Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2598	867	ru	Банк Израиль	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2590	867	he	בנק ישראל	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2582	867	en	Israel Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2599	868	ru	Банк Меркантайл	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2591	868	he	בנק מרכנתיל	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2583	868	en	Mercantile Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2600	869	ru	Банк Мизрахи	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2592	869	he	בנק מזרחי	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2584	869	en	Mizrahi Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2601	870	ru	Банк Юнион	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2593	870	he	בנק איגוד	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2585	870	en	Union Bank	approved	2025-07-29 11:07:32.277245	2025-07-30 13:07:59.251411
2612	871	ru	Квартира	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2607	871	he	דירה	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2602	871	en	Apartment	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2613	872	ru	Частный дом	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2608	872	he	בית פרטי	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2603	872	en	Private House	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2614	873	ru	Коммерческая недвижимость	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2609	873	he	נכס מסחרי	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2604	873	en	Commercial Property	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2615	874	ru	Земельный участок	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2610	874	he	קרקע	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2605	874	en	Land	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2616	875	ru	Другое	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2611	875	he	אחר	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2606	875	en	Other	approved	2025-07-29 11:07:32.453868	2025-07-30 13:07:59.251411
2633	876	ru	Банк Апоалим	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2625	876	he	בנק הפועלים	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2617	876	en	Bank Hapoalim	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2634	877	ru	Банк Леуми	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2626	877	he	בנק לאומי	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2618	877	en	Bank Leumi	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2635	878	ru	Банк Дисконт	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2627	878	he	בנק דיסקונט	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2619	878	en	Discount Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2636	879	ru	Банк Масад	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2628	879	he	בנק מסד	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2620	879	en	Massad Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2637	880	ru	Банк Израиль	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2629	880	he	בנק ישראל	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2621	880	en	Israel Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2638	881	ru	Банк Меркантайл	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2630	881	he	בנק מרכנתיל	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2622	881	en	Mercantile Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2639	882	ru	Банк Мизрахи	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2631	882	he	בנק מזרחי	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2623	882	en	Mizrahi Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2640	883	ru	Банк Юнион	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2632	883	he	בנק איגוד	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2624	883	en	Union Bank	approved	2025-07-29 11:12:34.474237	2025-07-30 13:07:59.251411
2651	884	ru	Квартира	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2646	884	he	דירה	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2641	884	en	Apartment	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2652	885	ru	Частный дом	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2647	885	he	בית פרטי	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2642	885	en	Private House	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2653	886	ru	Коммерческая недвижимость	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2648	886	he	נכס מסחרי	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2643	886	en	Commercial Property	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2654	887	ru	Земельный участок	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2649	887	he	קרקע	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2644	887	en	Land	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2655	888	ru	Другое	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2650	888	he	אחר	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2645	888	en	Other	approved	2025-07-29 11:12:34.646007	2025-07-30 13:07:59.251411
2660	889	ru	Да, зарегистрирована в земельном кадастре	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2658	889	he	כן, רשומה בטאבו	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2656	889	en	Yes, Registered in Land Registry	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2661	890	ru	Нет, не зарегистрирована	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2659	890	he	לא, לא רשומה	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
2657	890	en	No, Not Registered	approved	2025-07-29 11:12:34.81599	2025-07-30 13:07:59.251411
\.


--
-- Data for Name: interest_rate_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interest_rate_rules (id, bank_id, rule_type, condition_min, condition_max, rate_adjustment, description, is_active, priority, created_by, created_at, updated_at) FROM stdin;
11	85	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
12	86	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
13	87	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
14	88	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
15	89	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
16	90	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
17	91	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
18	92	credit_score	750.00	850.00	-0.300	Excellent credit score discount	t	1	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
29	85	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
30	86	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
31	87	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
32	88	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
33	89	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
34	90	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
35	91	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
36	92	credit_score	700.00	749.00	-0.100	Good credit score discount	t	2	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
47	85	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
48	86	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
49	87	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
50	88	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
51	89	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
52	90	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
53	91	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
54	92	credit_score	600.00	699.00	0.500	Lower credit score premium	t	3	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
65	85	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
66	86	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
67	87	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
68	88	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
69	89	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
70	90	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
71	91	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
72	92	ltv	80.01	95.00	0.250	High LTV premium	t	4	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
83	85	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
84	86	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
85	87	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
86	88	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
87	89	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
88	90	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
89	91	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
90	92	loan_amount	2000000.00	50000000.00	-0.150	Large loan amount discount	t	5	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
91	75	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:47.918206	2025-07-15 22:08:47.918206
92	75	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:48.050235	2025-07-15 22:08:48.050235
93	75	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:48.151269	2025-07-15 22:08:48.151269
94	76	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:48.552164	2025-07-15 22:08:48.552164
95	76	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:48.654046	2025-07-15 22:08:48.654046
96	76	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:48.742948	2025-07-15 22:08:48.742948
97	77	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:49.107922	2025-07-15 22:08:49.107922
98	77	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:49.21408	2025-07-15 22:08:49.21408
99	77	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:49.305962	2025-07-15 22:08:49.305962
100	78	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:49.679819	2025-07-15 22:08:49.679819
101	78	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:49.772205	2025-07-15 22:08:49.772205
102	78	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:49.859923	2025-07-15 22:08:49.859923
103	79	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:50.214853	2025-07-15 22:08:50.214853
104	79	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:50.306994	2025-07-15 22:08:50.306994
105	79	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:50.396849	2025-07-15 22:08:50.396849
106	80	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:50.752808	2025-07-15 22:08:50.752808
107	80	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:50.847252	2025-07-15 22:08:50.847252
108	80	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:50.938057	2025-07-15 22:08:50.938057
109	81	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:51.29401	2025-07-15 22:08:51.29401
110	81	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:51.385999	2025-07-15 22:08:51.385999
111	81	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:51.476848	2025-07-15 22:08:51.476848
112	82	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:51.842871	2025-07-15 22:08:51.842871
113	82	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:51.936135	2025-07-15 22:08:51.936135
114	82	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:52.024845	2025-07-15 22:08:52.024845
115	83	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:52.38924	2025-07-15 22:08:52.38924
116	83	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:52.478925	2025-07-15 22:08:52.478925
117	83	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:52.572956	2025-07-15 22:08:52.572956
118	84	credit_score	800.00	850.00	-0.300	Credit Score 800-850	t	1	\N	2025-07-15 22:08:53.105897	2025-07-15 22:08:53.105897
119	84	credit_score	750.00	799.00	-0.100	Credit Score 750-799	t	1	\N	2025-07-15 22:08:53.298785	2025-07-15 22:08:53.298785
120	84	credit_score	300.00	649.00	0.500	Credit Score 300-649	t	1	\N	2025-07-15 22:08:53.460878	2025-07-15 22:08:53.460878
\.


--
-- Data for Name: israeli_bank_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.israeli_bank_numbers (id, bank_number, bank_name_en, bank_name_he, is_active, created_at) FROM stdin;
1	010	Bank Hapoalim	בנק הפועלים	t	2025-07-09 15:03:17.263599
2	011	Discount Bank	בנק דיסקונט	t	2025-07-09 15:03:17.263599
3	012	Bank Leumi	בנק לאומי	t	2025-07-09 15:03:17.263599
4	013	Igud Bank	בנק איגוד	t	2025-07-09 15:03:17.263599
5	014	Bank Otsar Ha-Hayal	בנק אוצר החייל	t	2025-07-09 15:03:17.263599
6	017	Mercantile Discount Bank	בנק מרכנתיל דיסקונט	t	2025-07-09 15:03:17.263599
7	020	Bank Mizrahi-Tefahot	בנק מזרחי טפחות	t	2025-07-09 15:03:17.263599
8	022	Bank Yahav	בנק יהב	t	2025-07-09 15:03:17.263599
9	023	FIBI Bank	בנק פיבי	t	2025-07-09 15:03:17.263599
10	026	UBank	יו בנק	t	2025-07-09 15:03:17.263599
11	031	Bank Massad	בנק מסד	t	2025-07-09 15:03:17.263599
12	034	Bank Jerusalem	בנק ירושלים	t	2025-07-09 15:03:17.263599
13	039	Arab Bank	הבנק הערבי	t	2025-07-09 15:03:17.263599
14	046	Bank Dexia	בנק דקסיה	t	2025-07-09 15:03:17.263599
15	052	Bank Poalei Agudat Israel	בנק פועלי אגודת ישראל	t	2025-07-09 15:03:17.263599
16	054	Bank of Jerusalem	בנק ירושלים	t	2025-07-09 15:03:17.263599
17	065	HSBC Bank	בנק HSBC	t	2025-07-09 15:03:17.263599
18	066	Citibank	סיטיבנק	t	2025-07-09 15:03:17.263599
19	073	JPMorgan Chase Bank	ג׳יי פי מורגן צ׳ייס בנק	t	2025-07-09 15:03:17.263599
\.


--
-- Data for Name: lawyer_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lawyer_applications (id, contact_name, phone, email, city, desired_region, employment_type, monthly_income, work_experience, client_litigation, debt_litigation, comments, source, referrer, submission_data, created_at) FROM stdin;
1	dsdfsdf	0566765576	345287@gmail.com	ashdod	center	other	20000	3-5	some	yes		hero-section	none	{"city": "ashdod", "email": "345287@gmail.com", "phone": "0566765576", "source": "hero-section", "comments": "", "referrer": "none", "contactName": "dsdfsdf", "submittedAt": "2025-07-08T15:19:09.534Z", "desiredRegion": "center", "monthlyIncome": "20000", "termsAccepted": true, "debtLitigation": "yes", "employmentType": "other", "workExperience": "3-5", "clientLitigation": "some"}	2025-07-08 15:19:09.823214
\.


--
-- Data for Name: loan_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_applications (id, client_id, property_id, application_number, loan_type, loan_purpose, requested_amount, approved_amount, loan_term_years, interest_rate, monthly_payment, down_payment, loan_to_value_ratio, debt_to_income_ratio, application_status, approval_status, rejection_reason, bank_id, assigned_to, submitted_at, reviewed_at, approved_at, created_at, updated_at) FROM stdin;
1	407	\N	\N	mortgage	\N	400000.00	\N	25	\N	2002.58	100000.00	\N	\N	submitted	pending	\N	\N	\N	2025-07-17 09:34:58.120041	\N	\N	2025-07-17 09:34:58.120041	2025-07-17 09:34:58.120041
\.


--
-- Data for Name: loan_calculations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_calculations (id, client_id, application_id, calculation_type, input_data, calculation_result, calculated_at, calculated_by) FROM stdin;
\.


--
-- Data for Name: locales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locales (id, active, page_id, key, number, name_ru, name_en, name_he, created_at, updated_at) FROM stdin;
1683	1	1	information	\N	Информация	Information	מידע מקדים	\N	\N
1684	1	2	registration	\N	Регистрация	Registration	הרשמה	\N	\N
1685	1	1	detail	\N	Детали сделки	Details of the deal	מידע מקדים	\N	\N
1686	1	1	mortgage	\N	Ипотека	Mortgage	משכנתא	\N	\N
1687	1	1	credit	\N	Кредит	Credit	הלוואה	\N	\N
1688	1	1	cancel	\N	Отменить	Cancel	ביטול	\N	\N
1689	1	1	select	\N	Выбрать	Select	בחר	\N	\N
1690	1	1	account	\N	Аккаунт №	Account No.	חשבון	\N	\N
1691	1	1	obligation	\N	Обязательство №	Commitment no.	חבות	\N	\N
1692	1	1	add	\N	Добавить	Add	להוסיף	\N	\N
1693	1	1	close	\N	Закрыть	Close	סגור	\N	\N
1694	1	11	sort	\N	Сортировать по:	Sort by:	מיון לפי	\N	\N
1695	1	1	bank	\N	Банк	Bank	בנק	\N	\N
1696	1	1	banks	\N	Банки партнеры	Partner banks	בנקים שותפים	\N	\N
1697	1	1	address	\N	Израиль, Бней Брак, ул. Мацада, д.7	Israel, Bnei Brak, Matsada str., 7	ישראל, בני ברק, רח' מצדה, בניין 7	\N	\N
1698	1	1	email	\N	info@bankimonline.com	info@bankimonline.com	info@bankimonline.com	\N	\N
1699	1	1	phone	\N	+972 53-716-2235	+972 53-716-2235	+972 53-716-2235	\N	\N
1700	1	105	404_title	\N	Ошибка 404	Error 404	שגיאה 404	\N	\N
1701	1	105	404_text	\N	Кажется что-то пошло не так! Страница, которую вы запрашиваете не существует. Возможно она устарела, была удалена, или был введен неверный адрес в адресной строке.	Something seems to have gone wrong! The page you are requesting does not exist. It may be out of date, deleted, or an incorrect address was entered in the address bar.	נראה שמשהו השתבש! הדף שאתה מבקש אינו קיים. ייתכן שהדף מיושן, נמחק או שהוזנה כתובת שגויה בשורת הכתובת.	\N	\N
1702	1	105	go_to_main	\N	Вернуться на главную	Go back to the main page	חזרה לעמוד הבית	\N	\N
1703	1	3	service	\N	Выберите услугу	Select service	איזה שירות תרצו לקבל מאיתנו?	\N	\N
1704	1	1	questionnaire	\N	Финансовая анкета	Financial questionnaire	שאלון פיננסי	\N	\N
1705	1	1	select_banks	\N	Выбор банков	Bank selection	בחר בנקים	\N	\N
1706	1	1	new_credit	\N	Новый кредит	New loan	אשראי חדש	\N	\N
1707	1	1	refinance_credit	\N	Рефинансирование кредита	Loan refinancing	מיחזור הלוואות	\N	\N
1708	1	1	new_mortgage	\N	Новая ипотека	New mortgage	משכנתא חדשה	\N	\N
1709	1	1	refinance_mortgage	\N	Рефинансирование ипотеки	Mortgage refinancing	מיחזור משכנתא	\N	\N
1710	1	1	make_credit	\N	Рассчитай кредит	Calculate your loan	חישוב הלוואה	\N	\N
1711	1	1	make_refinance_credit	\N	Рефинансируй кредиты	Refinance loans	מיחזור הלוואות	\N	\N
1712	1	1	make_mortgage	\N	Рассчитай ипотеку	Calculate your mortgage	חישוב משכנתא	\N	\N
1713	1	1	make_refinance_mortgage	\N	Рефинансируй ипотеку	Refinance your mortgage	מיחזור משכנתא	\N	\N
1714	1	12	capital	\N	Капитал	Capital	סכום המשכנתא	\N	\N
1715	1	12	mortgage_sum	\N	Сумма ипотеки	Mortgage amount	הון עצמי	\N	\N
1716	1	83	credit_sum	\N	Сумма кредита	Credit amount	סכום אשראי	\N	\N
1717	1	12	asset_value	\N	Стоимость активов	Asset value	שווי הנכס	\N	\N
1718	1	12	program	\N	Программа №	Program no.	תוכנית מס '	\N	\N
1719	1	1	sum	\N	Сумма	Sum	סכום	\N	\N
1720	1	1	years	\N	Лет	Years	שנים	\N	\N
1721	1	1	percent	\N	Процент	Percent	ריבית	\N	\N
1722	1	12	monthly_return	\N	Ежемесячный возврат	Monthly return	החזר חודשי התחלתי	\N	\N
1723	1	12	bank_money	\N	Средства банка	Bank funds	כסף בנק	\N	\N
1724	1	12	bank_return	\N	Возврат в банк	Return to bank	כמה מחזירים לבנק	\N	\N
1725	1	1	menu_login	\N	Войти	Log in	התחברות	\N	\N
1726	1	1	menu_service	\N	Услуги	Services	שירותים	\N	\N
1727	1	1	menu_credit	\N	Кредит на все случаи	Credit for all cases	הלוואות לכל המקרים	\N	\N
1728	1	1	menu_settings	\N	Настройки	Settings	הגדרות	\N	\N
1729	1	1	menu_docs	\N	Документы	Documents	מסמכים	\N	\N
1730	1	1	menu_about	\N	О нас	About Us	עלינו	\N	\N
1731	1	1	popup_title	\N	Обслуживание клиентов	Customer service	שירות לקוחות	\N	\N
1732	1	1	popup_write	\N	Написать	Write a message	לכתוב הודעה	\N	\N
1733	1	1	popup_message	\N	сообщение	message		\N	\N
1734	1	1	popup_call	\N	Вызов	Call	שיחה	\N	\N
1735	1	1	popup_clock	\N	Часы работы	Opening hours	שעות פתיחה	\N	\N
1736	1	1	popup_place	\N	Отделения	Departments	ענף	\N	\N
1737	1	1	popup_week_1	\N	вскр - чт	Sun - Thu	ראשון - חמישי	\N	\N
1738	1	1	popup_week_2	\N	пт	Fri	שישי	\N	\N
1739	1	1	popup_phone	\N	Телефон	Phone	טלפון	\N	\N
1740	1	1	popup_content	\N	Кирьят - Шмона 976 Банкомат	Kiryat Shmona 976 ATM	כספומט קריית שמונה 976	\N	\N
1741	1	1	popup_km	\N	1115,8 км	1115.8 km	ק'מ 1115,8	\N	\N
1742	1	1	popup_min	\N	48 мин.	48 minutes	דקה 48	\N	\N
1743	1	1	popup_link	\N	Связь с нами	Contact us	צור קשר	\N	\N
1744	1	7	footer__privacy_policy	\N	Политика конфиденциальности	Privacy Policy	מדיניות פרטיות	\N	\N
1745	1	1	footer__terms_of_use	\N	Условия эксплуатации	Operating conditions	תנאי שימוש	\N	\N
1746	1	112	footer__return_policy	\N	Политика возврата	Return policy	מדיניות החזרים	\N	\N
1747	1	113	footer__use_of_cookies	\N	Использование файлов cookie	Use of cookies	שימוש בעוגיות	\N	\N
1748	1	1	ds	\N	Digital solution	Digital solution	Digital solution	\N	\N
1749	1	1	index_text_1	1	Сравнение	Comparison	תאוושה	\N	\N
1750	1	5	about	\N	О нас	About Us	עלינו	\N	\N
1751	1	5	about_text	\N	Более подробно рассказываем здесь	We will tell you in more detail here.	נספר לכם כאן ביתר פירוט.	\N	\N
1752	1	1	about_client	\N	Данные заемщиков	Borrower data	פרטים על הלווים	\N	\N
1753	1	1	city	\N	Город	Town	עיר	\N	\N
1754	1	1	street	\N	Улица	Street	רחוב	\N	\N
1755	1	1	house	\N	Дом / Квартира	House / Apartment	בית / דירה	\N	\N
1756	1	1	form_phone_number	\N	Номер телефона	Phone number	מספר טלפון	\N	\N
1757	1	1	form_reqiered_number	\N	Введите номер телефона	Enter your phone number	תכניס את מספר הטלפון שלך	\N	\N
1758	1	1	form_wrong_number	\N	Неверный номер	Wrong number	טעות במספר	\N	\N
1759	1	1	form_email	\N	Электронная почта	Email	כתובת מייל	\N	\N
1760	1	1	form_reqiered_email	\N	Введите электронную почту	Enter your email	אנא הזן את הדוא'ל שלך	\N	\N
1761	1	1	form_wrong_email	\N	Неправильная электронная почта	Invalid email	דוא'ל לא חוקי	\N	\N
1762	1	1	form_taken_email	\N	Электронная почта занята, введите другой адрес	Email is busy, please enter a different address	הדוא'ל תפוס, אנא הזן כתובת אחרת	\N	\N
1763	1	1	form_reqiered	\N	Заполните поле	Fill in the field	מלא את השדה	\N	\N
1764	1	1	form_wrong	\N	Некорректное значение	Invalid value	ערך לא תקין	\N	\N
1765	1	1	form_example	\N	Например	For example	לדוגמה	\N	\N
1766	1	1	form_next	\N	Двигаться дальше	Move on	להמשיך	\N	\N
1767	1	1	form_continue	\N	Продолжить	Proceed	המשך	\N	\N
1768	1	1	form_result	\N	Получить результаты	Get results	מעבר לתוצאות	\N	\N
1769	1	12	form_tender	\N	Продолжить оформление	Continue checkout	להמשיך ברישום	\N	\N
1770	1	1	form_add_account	\N	Добавить	Add	להוסיף	\N	\N
1771	1	1	form_add_partner	\N	Добавить ипотечного партнера	Add a mortgage partner	הוסף שותף למשכנתא	\N	\N
1772	1	1	server_error	\N	Ошибка, попробуйте выполнить запрос позже	Error, please try again later	שגיאה, נסה שוב מאוחר יותר	\N	\N
1773	1	2	reg_text	\N	Подпишитесь на услугу и получите лучшие предложения от банков	Subscribe to the service and get the best offers from banks	נרשמים לשירות ומקבלים את ההצעות הטובות ביותר מהבנקים	\N	\N
1774	1	2	reg_checkbox_1_1	\N	Утверждение сроков	Approval of deadlines	אישור תנאים	\N	\N
1775	1	2	reg_checkbox_1_2	\N	разрешение на связь с банками	permission to communicate with banks	אישור לפנות לבנקים	\N	\N
1776	1	2	reg_checkbox_2	\N	Хочу скидку на ипотечное страхование	I want a discount on mortgage insurance	אני רוצה הנחה בביטוח משכנתא	\N	\N
1777	1	14	s2p3_text	\N	Расскажите нам немного о себе	Tell us a little about yourself	ספרו לנו קצת על עצמכם	\N	\N
1778	1	14	s2p3_block_1_title	\N	Первая недвижимость	First property	אנחנו קונים נכס יחיד	\N	\N
1779	1	14	s2p3_block_1_subtitle	\N	У нас нет недвижимости и это будет первая	We do not have real estate and this will be the first	אין לנו כרגע אף נכס וזה יהיה הראשון	\N	\N
1780	1	14	s2p3_block_2_title	\N	Мы застройщики	We are developers	אנחנו משפרי דיור	\N	\N
1781	1	14	s2p3_block_2_subtitle	\N	Мы продаем старую и покупаем новую	We sell the old one and buy the new one	אנחנו מוכרים את הנכס הישן וקונים חדש	\N	\N
1782	1	14	s2p3_block_3_title	\N	Мы инвестируем	We invest	אנחנו משקיעים	\N	\N
1783	1	14	s2p3_block_3_subtitle	\N	У нас есть одна и мы покупаем дополнительно	We have one and we buy additionally	כבר יש לנו נכס אחד או יותר ואנחנו קונים נכס נוסף	\N	\N
1784	1	1	s2p4_text_1	\N	Выберите что вы хотите покупать	Choose what you want to buy	מה אתם רוכשים?	\N	\N
1785	1	9	s2p4_text_2	\N	Cтоимость недвижимости	Property value	מה השווי של הנכס הנרכש?	\N	\N
1786	1	1	s2p4_text_3	\N	В каком районе находится приобретаемая вами недвижимость?	In what area is the property you are purchasing located?	באיזה יישוב נמצא הנכס שאתם רוכשים?	\N	\N
1787	1	9	s2p4_text_4	\N	Ваш капитал	Your capital	מהו ההון העצמי שלכם?	\N	\N
1788	1	9	s2p4_text_5	\N	Тип социальной программы	Social program type	סוג התוכנית החברתית	\N	\N
1789	1	1	s2p4_text_6	\N	Хотите отложить ежемесячный возврат ипотеки на несколько месяцев ? (Кредит Грейс)	Want to postpone your monthly mortgage repayment for several months? (Credit Grace)	רוצים לדחות את החזר המשכנתא החודשי במספר חודשים? (גרייס אשראי)	\N	\N
1790	1	9	s2p4_text_7	\N	% от стоимости	% of the cost	% מהעלות	\N	\N
1791	1	9	info_realty_type	\N	Тип недвижимости	Property type	סוג נכס	\N	\N
1792	1	9	s2p4_placeholder_1	\N	Например 1 500 000	For example 1 500 000	1 500 000 לדוגמה	\N	\N
1793	1	1	s2p4_placeholder_2	\N	Город / Район	City / District	עיר / מחוז	\N	\N
1794	1	9	s2p4_placeholder_3	\N	Например Иерусалим	For example Jerusalem	לדוגמא : תל-אביב	\N	\N
1795	1	9	s2p4_placeholder_4	\N	Например 800 000	For example 800,000	לדוגמה 000 800	\N	\N
1796	1	9	s2p4_select_1_value_1	\N	Квартира от застройщика	Apartment from the developer	דירת מחיר למשתכן	\N	\N
1797	1	9	s2p4_select_1_value_2	\N	Квартира на вторичном рынке	Apartment on the secondary market	דירה מקבלן	\N	\N
1798	1	9	s2p4_select_1_value_3	\N	Частный дом	Private house	בית בבנייה עצמית	\N	\N
1799	1	9	s2p4_select_1_value_4	\N	Земельный участок / строительство	Land / construction	בית פרטי	\N	\N
1800	1	9	s2p4_select_2_value_1	\N	Военная ипотека	Military mortgage	משכנתאות צבאיות עלא	\N	\N
1801	1	9	s2p4_select_2_value_2	\N	Молодая семья	Young family	משפחות צעירות	\N	\N
1802	1	26	s2p5_text	\N	Сколько людей берут ипотеку?	How many people take out a mortgage?	כמה אנשים משתתפים במשכנתא?	\N	\N
1803	1	26	s2p5_block_1_title	\N	Я один	I'm alone	רק אני	\N	\N
1804	1	26	s2p5_block_2_title	\N	Я и мой партнер	Me and my partner	אני ובן/בת זוג	\N	\N
1805	1	26	s2p5_block_3_title	\N	Нас больше двух	There are more than two of us	אני ושותפים	\N	\N
1806	1	17	s2p6_text	\N	Какова сумма продажи старого имущества?	How much is the sale of the old property?	מה סכום המכירה של הנכס הישן?	\N	\N
1807	1	18	s2p7_text_1	\N	Была ли ипотека на эту недвижимость?	Was there a mortgage on this property?	האם הייתה משכנתא על נכס זה?	\N	\N
1808	1	18	s2p7_text_2	\N	Сколько денег от суммы продажи вы хотите оставить на расходы?	How much money from the sale amount do you want to keep for expenses?	כמה כסף מסכום המכירה תרצו לשמור בצד להוצאות נלוות?	\N	\N
1809	1	18	s2p7_text_3	\N	Есть ли дополнительный ликвидный капитал?	Is there additional liquid capital?	האם יש לכם הון נזיל נוסף?	\N	\N
1810	1	18	s2p7_text_4	\N	Сколько осталось платить за ипотеку?	How much is left to pay for the mortgage?	כמה משכנתא נותרה לכם?	\N	\N
1811	1	18	s2p7_text_5	\N	Сколько денег от суммы продажи вы хотите оставить на расходы?	How much money from the sale amount do you want to keep for expenses?	כמה כסף מסכום המכירה תרצו לשמור בצד להוצאות נלוות?	\N	\N
1812	1	18	s2p7_text_6	\N	Сколько у вас осталось от суммы продажи после закрытия ипотеки?	How much do you have left of the sale amount after the mortgage is closed?	כמה נשאר לכם מסכום המכירה לאחר סגירת המשכנתא?	\N	\N
1813	1	18	s2p7_subtext_1	\N	из средств продажи будет выделено на оплату приобретенного имущества	from the sale funds will be allocated to pay for the acquired property	מכספי המכירה יוקצו לתשלום על הנכס הנרכש	\N	\N
1814	1	18	s2p7_subtext_2	\N	всего для оплаты приобретенного имущества	total to pay for the purchased property	לתשלום על הנכס הנרכש	\N	\N
1815	1	18	s2p7_radio_1	\N	Ипотеки не было	There was no mortgage	לא הייתה משכנתא	\N	\N
1816	1	18	s2p7_radio_2	\N	Была но уже выплатили	Was but already paid	הייתה וסגרנו אותה	\N	\N
1817	1	18	s2p7_radio_3	\N	Была и до сих пор не выплатили	Was and still not paid	הייתה ועדיין לא סגרנו אותה	\N	\N
1818	1	19	s2p8_text_1	\N	Как вы думаете, хватит ли вам времени продать старую недвижимость до истечения срока оплаты	Do you think you have enough time to sell your old property before the due date	האם לדעתכם תספיקו למכור את הנכס הישן לפני שיגיע מועד התשלום של הנכס הנרכש	\N	\N
1819	1	19	s2p8_text_2	\N	Оценка имущества	Property appraisal	הערכת שווי נכס	\N	\N
1820	1	19	s2p8_text_3	\N	Имущество под залог	Property secured	רכוש מאובטח	\N	\N
1821	1	19	s2p8_radio_1	\N	Да, мы можем продать воремя	Yes, we can sell on time	כן, נצליח למכור בזמן	\N	\N
1822	1	19	s2p8_radio_2	\N	Трудно сказать	Hard to say	קשה לדעת	\N	\N
1823	1	19	s2p8_radio_3	\N	Честно, не можем продать вовремя	Honestly, we can't sell on time.	כנראה לא נמכור בזמן	\N	\N
1824	1	19	s2p8_radio_4	\N	Оценка проведена	Evaluated	הערכה בוצעה	\N	\N
1825	1	19	s2p8_radio_5	\N	Без оценки	No rating	בלי דירוג	\N	\N
1826	1	19	s2p8_radio_6	\N	Имущество бизнеса	Business property	נכס עסקי	\N	\N
1827	1	19	s2p8_radio_7	\N	Личное имущество	Personal property	רכוש אישי	\N	\N
1828	1	20	s2p9_text_1	\N	Мы постараемся вам помочь!	We will try to help you!	ננסה לעזור לך להחליט!	\N	\N
1829	1	20	s2p9_text_2	\N	Когда окончательная дата оплаты нового актива?	When is the final payment date for the new asset?	מתי מועד התשלום האחרון עבור הנכס החדש?	\N	\N
1830	1	20	s2p9_text_3	\N	Хорошо, теперь посчитайте стоимость старого имущества	Okay, now calculate the value of the old property.	אוקיי, כעת ספרו מה שווי הנכס הישן?	\N	\N
1831	1	20	s2p9_text_4	\N	Нам тоже сложно сказать, но мы советуем ускорить процесс продажи, иначе вам понадобится дополнительный кредит к ипотеке	It is also difficult for us to say, but we advise you to speed up the sale process, otherwise you will need an additional loan to the mortgage.	גם לנו קשה לדעת, אבל אנחנו ממליצים לכם לזרז את הליך המכירה, אחרת תצטרכו הלוואת בלון בנוסף למשכנתא	\N	\N
1832	1	20	s2p9_text_5	\N	У вас есть разумный период времени, чтобы совершить продажу. А теперь посчитайте, какова стоимость старой собственности?	You have a reasonable amount of time to complete the sale. Now calculate, what is the value of the old property?	יש לכם פרק זמן סביר לבצע את המכירה, כעת ספרו מה שווי הנכס הישן?	\N	\N
1833	1	20	s2p9_radio_1	\N	1-2 месяца	1-2 months	1-2 חודשים	\N	\N
1834	1	20	s2p9_radio_2	\N	3-4 месяца	3-4 months	3-4 חודשים	\N	\N
1835	1	20	s2p9_radio_3	\N	5 месяцев и больше	5 months and more	5 חודשים ומעלה	\N	\N
1836	1	20	s2p9_radio_4	\N	Продадим вовремя	We will sell on time	אנחנו נמכור בזמן	\N	\N
1837	1	20	s2p9_radio_5	\N	Пойдем за дополнительным кредитом к ипотеке	Let's go for an additional loan to the mortgage	נלך על הלוואת הבלון בנוסף למשכנתא	\N	\N
1838	1	21	s2p10_text_1	\N	Хорошо, теперь подсчитайте стоимость старого имущества	Okay, now calculate the value of the old property.	מעולה, כעת ספרו מה שווי הנכס הישן?	\N	\N
1839	1	23	s2p12_text_1	\N	Банк, в котором было выдана ипотека	The bank where the mortgage was issued	הבנק בו ניתנה המשכנתא	\N	\N
1840	1	27	s3p6_text_2	\N	Есть ли дополнительные гражданства?	Are there additional citizenships?	האם יש אזרחות נוספת?	\N	\N
1841	1	27	s3p6_text_3	\N	Есть ли страны, в которых вы оплачиваете налоги?	Are there countries where you pay taxes?	האם יש מדינות בהן אתה משלם מיסים?	\N	\N
1842	1	27	s3p6_text_4	\N	Являетесь ли Вы публичным деятелем или связаны с публичным человеком сегодня или были ранее?	Are you a public figure or are you associated with a public person today or have you been before?	האם אתה איש ציבורי או שקשור היום לאדם ציבורי או שהיית בעבר?	\N	\N
1843	1	27	s3p6_text_5	\N	Участник №	Participant no.	משתתף	\N	\N
1844	1	9	s3p6_text_6	\N	Сумма дохода до вычета налога	Amount of income before tax	סכום הכנסה לפני ניכוי מס	\N	\N
1845	1	9	s3p6_text_7	\N	Стаж работы на  последнем месте, месяцев	Work experience in the last place, months	ניסיון בעבודה במקום האחרון	\N	\N
1846	1	9	s3p6_text_8	\N	Сумма дохода партнера до вычета налога	Partner's income before tax	סכום הכנסה של השותף לפני ניכוי מס	\N	\N
1847	1	9	s3p6_text_9	\N	Стаж работы партнера на последнем месте, месяцев	Work experience of the partner in the last place, months	ניסיון בעבודה במקום האחרון של השותף	\N	\N
1848	1	27	s3p6_label_1	\N	Имя Фамилия	First Name Last Name	שם פרטי שם משפחה	\N	\N
1849	1	27	s3p6_label_2	\N	Ваш пол	What's your gender	המגדר שלך	\N	\N
1850	1	27	s3p6_label_3	\N	Дата рождения	Date of Birth	תאריך לידה	\N	\N
1851	1	9	s3p6_label_4	\N	Источник дохода	Source of income	מקור הכנסה	\N	\N
1852	1	27	s3p6_label_5	\N	Адрес проживания	Residence address	כתובת מגורים	\N	\N
1853	1	9	s3p6_label_6	\N	Семейное положение	Family status	מצב משפחתי	\N	\N
1854	1	27	s3p6_label_7	\N	У вас есть страхование жизни?	Do you have life insurance?	האם יש לך ביטוח חיים?	\N	\N
1855	1	27	s3p6_label_8	\N	Связь между вами	The connection between you	הקשר ביניכם	\N	\N
1856	1	9	s3p6_label_9	\N	Место работы	Place of work	מקום העבודה	\N	\N
1857	1	9	s3p6_label_10	\N	Кем вы работаете	Who do you work	במה אתה עובד	\N	\N
1858	1	27	s3p6_label_11	\N	Сколько детей у вас до 18 лет	How many children do you have under 18	כמה ילדים יש לך מתחת לגיל 18	\N	\N
1859	1	27	s3p6_placeholder_1	\N	Маркова Мария Кирилловна	Markova Maria Kirillovna	הזינו	\N	\N
1860	1	9	s3p6_select_1_value_1	\N	Наемный работник	Salaried worker	עובד שכיר	\N	\N
1861	1	9	s3p6_select_1_value_2	\N	Предприниматель	Entrepreneur	עצמאי	\N	\N
1862	1	9	s3p6_select_1_value_3	\N	Наемный работник и предприниматель	Employee and entrepreneur	עובד שכיר ועצמאי	\N	\N
1863	1	9	s3p6_select_1_value_4	\N	Безработный	Unemployed	לא מועסק	\N	\N
1864	1	9	s3p6_select_2_value_1	\N	Женат / Замужем	Married	נשוי/ נשואה	\N	\N
1865	1	9	s3p6_select_2_value_2	\N	Холостой / Холостая	Idle / Idle	רווק/ רווקה	\N	\N
1866	1	9	s3p6_select_2_value_3	\N	Проживаюшие вместе	Living together	חיים ביחד	\N	\N
1867	1	9	s3p6_select_2_value_4	\N	Разведен / Разведена	Divorced / Divorced	גרוש / גרושה	\N	\N
1868	1	9	s3p6_select_2_value_5	\N	Вдовец / Вдова	Widower / Widow	אלמן / אלמנה	\N	\N
1869	1	27	s3p6_select_3_value_1	\N	Мужской	Male	זכר	\N	\N
1870	1	27	s3p6_select_3_value_2	\N	Женский	Female	נקבה	\N	\N
1871	1	27	s3p6_select_4_value_1	\N	Есть	There is	יש לי	\N	\N
1872	1	27	s3p6_select_4_value_2	\N	Нет	No	עדיין לא עשיתי	\N	\N
1873	1	27	s3p6_select_4_value_3	\N	В процессе	During	לא בטוח שאוכל לעשות	\N	\N
1874	1	27	s3p6_select_5_value_1	\N	Семейная пара	Married couple	זוג נשוי	\N	\N
1875	1	27	s3p6_select_5_value_2	\N	Родители - дети	Parents are children	הורים - ילדים	\N	\N
1876	1	27	s3p6_select_5_value_3	\N	Братья - cестры	Brothers - sisters	אחים אחיות	\N	\N
1877	1	27	s3p6_select_5_value_4	\N	Родственники	Relatives	קרובי משפחה	\N	\N
1878	1	27	s3p6_select_5_value_5	\N	Друзья	Friends	חברים	\N	\N
1879	1	27	s3p6_select_5_value_6	\N	Бизнес компаньон	Business companion	בן זוג לעסקים	\N	\N
1880	1	27	s3p6_select_5_value_7	\N	Собственник	Owner	בעלים	\N	\N
1881	1	9	s3p6_select_6_value_1	\N	Менеджер	Manager	מנהל	\N	\N
1882	1	9	s3p6_select_6_value_2	\N	Фрилансер	Freelancer	עצמאי	\N	\N
1883	1	9	s3p6_select_6_value_3	\N	Получает аннуитет	Receives an annuity	מקבל קצבה	\N	\N
1884	1	9	s3p6_select_6_value_4	\N	Стипендия	Scholarship	מילגה	\N	\N
1885	1	9	s3p6_select_6_value_5	\N	Дизайнер	Designer	מעצב	\N	\N
1886	1	9	s3p6_select_6_value_6	\N	Программист	Programmer	מתכנת	\N	\N
1887	1	9	s3p6_select_6_value_7	\N	Безработный	Unemployed	לא מועסק	\N	\N
1888	1	9	s3p6_select_6_value_8	\N	Пенсионер	Retiree	פנסיונר	\N	\N
1889	1	27	s3p6_radio_1	\N	Являюсь / Являлся	Am / Was	כן/ הייתי	\N	\N
1890	1	27	s3p6_radio_2	\N	Связан с таким человеком / Был связан	Associated with such a person / Was associated	קשור לאדם כזה / הייתי קשור	\N	\N
1891	1	28	s3p7_text_1	\N	Реквизиты текущих счетов	Current account details	פירוט של חשבונות העו'ש	\N	\N
1892	1	28	s3p7_text_2	\N	Cчет №	Account No.	חשבון בנק	\N	\N
1893	1	28	s3p7_label_1	\N	Банк, в котором открыт счет	The bank where the account is opened	הבנק בו מתנהל החשבון	\N	\N
1894	1	28	s3p7_label_2	\N	Статус за последние 3 месяца	Status for the last 3 months	מצב החשבון ב-3 חודשים האחרונים	\N	\N
1895	1	28	s3p7_label_3	\N	Кому принадлежит	Who owns	מי הבעלים	\N	\N
1896	1	28	s3p7_placeholder_1	\N	Название банка	Bank's name	שם הבנק	\N	\N
1897	1	28	s3p7_placeholder_2	\N	Выберите режим	Select mode	בצמ רחב	\N	\N
1898	1	28	s3p7_select_1_value_1	\N	Плюс	A plus	פלוס	\N	\N
1899	1	28	s3p7_select_1_value_2	\N	Минус	Minus	מינוס	\N	\N
1900	1	28	s3p7_select_1_value_3	\N	Превышение минусовой рамки	Exceeding the minus frame	חורג ממסגרת המינוס	\N	\N
1901	1	30	s4p9_text_1	\N	Разбивка дополнительных доходов	Breakdown of additional income	פירוט הכנסות נוספות	\N	\N
1902	1	30	s4p9_label_1	\N	Тип дохода	Income type	סוג הכנסה	\N	\N
1903	1	30	s4p9_label_2	\N	Ежемесячный доход	Monthly income	גובה הכנסה חודשית	\N	\N
1904	1	30	s4p9_placeholder_1	\N	Например 2 000	For example 2000	2 000 לדוגמה	\N	\N
1905	1	30	s4p9_select_1_value_1	\N	Дивиденды	Dividend	דיבידנדים	\N	\N
1906	1	30	s4p9_select_1_value_2	\N	Алименты	Alimony	מזונות	\N	\N
1907	1	30	s4p9_select_1_value_3	\N	Стипендия	Scholarship	מילגה	\N	\N
1908	1	30	s4p9_select_1_value_4	\N	Арендная плата	Rent	שכירות	\N	\N
1909	1	30	s4p9_select_1_value_5	\N	Пособия	Benefits	קצבאות	\N	\N
1910	1	32	s4p11_text_1	\N	Разбивка дополнительных расходов	Breakdown of additional costs	פירוט הוצאות נוספות	\N	\N
1911	1	32	s4p11_text_2	\N	Есть что то важное, что вы хотите добавить о ваших расходах	There is something important that you want to add about your expenses.	יש משהו חשוב שאתה רוצה להוסיף לגבי ההוצאות שלך	\N	\N
1912	1	32	s4p11_label_1	\N	Ежемесячный расход	Monthly expense	הוצאה חודשית	\N	\N
1913	1	32	s4p11_label_2	\N	Сумма ежемесячного расхода	Monthly expense amount	ההוצאה החודשית שלך	\N	\N
1914	1	32	s4p11_label_3	\N	Срок	Term	טווח	\N	\N
1915	1	32	s4p11_label_4	\N	В каком банке у вас кредит	Which bank do you have a loan from	מאיזה בנק יש לך הלוואה	\N	\N
1916	1	32	s4p11_placeholder_1	\N	Сколько месяцев осталось	How many months are left	כמה חודשים נותרו	\N	\N
1917	1	32	s4p11_placeholder_2	\N	Выберите банк	Select a bank	בחר בנק	\N	\N
1918	1	32	s4p11_select_1_value_1	\N	Аренда	Rent	השכרה	\N	\N
1919	1	32	s4p11_select_1_value_2	\N	Алименты	Alimony	מזונות	\N	\N
1920	1	32	s4p11_select_1_value_3	\N	Банковские кредиты	Bank loans	הלוואות בנק	\N	\N
1921	1	32	s4p11_select_1_value_4	\N	Автокредит	Car loan	הלוואת רכב	\N	\N
1922	1	32	s4p11_select_1_value_5	\N	Кредиты от страховых компаний	Loans from insurance companies	הלוואות מחברות ביטוח	\N	\N
1923	1	32	s4p11_select_1_value_6	\N	Внебанковские кредиты	Non-bank loans	הלוואות חוץ בנקאיות	\N	\N
1924	1	32	s4p11_select_1_value_7	\N	Ипотека на другое имущество	Mortgage on other property	משכנתא לרכוש אחר	\N	\N
1925	1	32	s4p11_select_1_value_8	\N	Другое	Other	אחר	\N	\N
1926	1	32	s4p11_select_1_value_9	\N	Нет кредитов	No credits	אין זיכויים	\N	\N
1927	1	34	s4p13_text_1	\N	Подробная информация об обязательствах на срок более полутора лет	Details of obligations for more than one and a half years	פירוט התחייבויות במשך יותר משנה וחצי	\N	\N
1928	1	34	s4p13_label_1	\N	Тип обязательства	Obligation type	סוג ההתחיבות	\N	\N
1929	1	34	s4p13_select_1_value_1	\N	Банковский кредит	Bank loan	הלוואה בנקאית	\N	\N
1930	1	34	s4p13_select_1_value_2	\N	Небанковский заем	Non-bank loan	הלוואה חוץ בנקאית	\N	\N
1931	1	34	s4p13_select_1_value_3	\N	Ипотека на другую недвижимость	Mortgage on other real estate	משכנתא על נכס אחר	\N	\N
1932	1	34	s4p13_select_1_value_4	\N	Выплата алиментов	Payment of alimony	תשלום דמי מזונות	\N	\N
1933	1	34	s4p13_select_1_value_5	\N	Оплата аренды	Payment of rent	תשלום שכר דירה	\N	\N
1934	1	36	s4p15_text_1	\N	Разбивка проблем в финансовом поведении	Breakdown of Problems in Financial Behavior	פירוט הבעיות בהתנהלות הפיננסית	\N	\N
1935	1	36	s4p15_label_1	\N	Тип проблемы	Problem type	סוג הבעיה	\N	\N
1936	1	36	s4p15_label_2	\N	Непокрытые чеки за последние 3 года	Uncovered checks in the last 3 years	מספר השיקים ללא כיסוי ב-3 השנים האחרונות	\N	\N
1937	1	36	s4p15_label_3	\N	Kогда вы в последний раз брали займ	When was the last time you took out a loan	מתי בפעם האחרונה פיגרתם בהלוואות	\N	\N
1938	1	36	s4p15_label_4	\N	Дело закрыто	Case is closed	לפני חודש	\N	\N
1939	1	36	s4p15_label_5	\N	Когда в последний раз был ограничен доступ	When was the last time access was restricted	מתי בפעם האחרונה חשבונכם הוגבל	\N	\N
1940	1	36	s4p15_select_1_value_1	\N	Непроверенные чеки	Unverified checks	צ'קים ללא כיסוי	\N	\N
1941	1	36	s4p15_select_1_value_2	\N	Субординированные займы	Subordinated loans	הלוואות בפיגור	\N	\N
1942	1	36	s4p15_select_1_value_3	\N	Исполнение	Execution	הוצאה לפועל	\N	\N
1943	1	36	s4p15_select_1_value_4	\N	Счет ограничен	Account limited	חשבון מוגבל	\N	\N
1944	1	38	s4p17_text_1	\N	На сколько месяцев вы хотели бы отсрочить ежемесячный платеж?	How many months would you like to defer your monthly payment?	בכמה חודשים תרצו לדחות את ההחזר החודשי?	\N	\N
1945	1	10	payment_title	\N	Теперь запишите, сколько вы хотите платить каждый месяц	Now write down how much you want to pay each month.	עכשיו רשמו כמה אתם רוצים לשלם בכל חודש	\N	\N
1946	1	10	s4p18_text_2_1	\N	Минимальный возврат:	Minimum refund:	החזר מינימלי:	\N	\N
1947	1	10	s4p18_text_2_2	\N	Банк не разрешит платить меньше. В этом случае ипотека будет длиться около 30 лет.	The bank will not allow you to pay less. In this case, the mortgage will last for about 30 years.	הבנק לא יאפשר לך לשלם פחות. במקרה זה המשכנתא תימשך כ- 30 שנה.	\N	\N
1948	1	10	s4p18_text_3_1	\N	Рекомендуемый возврат:	Recommended return:	החזר חודשי מומלץ עבורכם:	\N	\N
1949	1	10	s4p18_text_3_2	\N	По вашим данным и аналогичным людям	According to your data and similar people	על פי הנתונים שלך ואנשים דומים	\N	\N
1950	1	10	s4p18_text_4_1	\N	Максимальный возврат:	Maximum return:	החזר מקסימלי:	\N	\N
1951	1	10	s4p18_text_4_2	\N	Банк не разрешит вам платить больше	The bank will not allow you to pay more	הבנק לא יאפשר לך לשלם יותר	\N	\N
1952	1	10	s4p18_label_1	\N	Ежемесячный платеж	Monthly payment	תשלום חודשי	\N	\N
1953	1	10	s4p18_placeholder_1	\N	Например 15 000	For example 15,000	15 000 לדוגמה	\N	\N
1954	1	39	s4p19_text_1	\N	Вы уже подписали контракт на покупку недвижимости?	Have you already signed a contract for the purchase of real estate?	האם כבר חתמתם חוזה רכישה עבור הנכס?	\N	\N
1955	1	39	s4p19_text_2	\N	Что еще вы хотели бы нам сказать?	What else would you like to tell us?	משהו נוסף שתרצו לספר לנו?	\N	\N
1956	1	39	s4p19_placeholder_1	\N	Для меня очень важно, чтобы ...	It is very important for me that ...	מאוד חשוב לי ש...	\N	\N
1957	1	12	s5p20_text_1	\N	Это отправная точка аукциона между банками	This is the starting point of the bank-to-bank auction	זו נקודת הפתיחה של המכרז בין הבנקים	\N	\N
1958	1	12	s5p20_text_2	\N	Выберите начальное предложение, и мы позаботимся о его улучшении	Choose an initial offer and we will take care of improving it.	בחרו הצעה ראשונית ואנחנו נדאג לשפר אותה	\N	\N
1959	1	12	s5p20_text_3	\N	Хотите другое предложение? Первоначальное предложение будет скорректировано после оплаты личным ипотечным консультантом	Want another offer? Initial proposal will be adjusted after payment by personal mortgage advisor	רוצים הצעה אחרת? ההצעה הראשונית תותאם לאחר התשלום ע''י יועץ המשכנתאות האישי של וולטי	\N	\N
1960	1	12	s5p20_text_4	\N	Следующие программы включены в это ипотечное предложение:	The following programs are included in this mortgage offer:	התוכניות הבאות כלולות בהצעת משכנתא זו:	\N	\N
2038	1	1	month_11	\N	11 месяцев	11 months	11 חודשים	\N	\N
2039	1	1	month_12	\N	1 год	1 year	1 שנה	\N	\N
1961	1	12	s5p20_text_5	\N	Сумма выплаты подвержена изменениям:	The amount paid is subject to changes:	סכום התשלום כפוף לשינויים:	\N	\N
1962	1	12	s5p20_text_6	\N	Это означает, что вероятность изменений в ежемесячном возмещении (в зависимости от изменения процентных ставок и индекса в экономике) высока.	This means that the likelihood of changes in monthly compensation (depending on changes in interest rates and the index in the economy) is high.	המשמעות היא שהסבירות לשינויים בפיצוי החודשי גבוהה (תלוי בשינויים בריבית ובמדד במשק).	\N	\N
1963	1	12	s5p20_text_7	\N	Люди, которые похожи на вас, берут ипотеку на том же уровне риска.	People who are like you take out mortgages at the same level of risk.	מהאנשים שדומים לכם לוקחים משמש משכותא ברמת סיכון זהה	\N	\N
1964	1	12	s5p20_text_8	\N	Если за эти годы не будет изменений в процентных ставках и индексах, вы заплатите по ипотеке:	If there are no changes in interest rates and indices over the years, you will pay on the mortgage:	אם לא יהיו שינויים בריבית ובמדד לאורך השנים זה מה שתשלמו על המשכותא:	\N	\N
1965	1	12	s5p20_text_9	\N	Если будут изменения в процентах и индексе по нашему прогнозу, вы заплатите по ипотеке:	If there are changes in the percentage and index according to our forecast, you will pay on the mortgage:	אם יהיו שינויים בריבית ובמדד דפי התחזית שלנו זה מה שתשלמו על המשכנתא:	\N	\N
1966	1	60	c_s1p1_title	\N	Сколько денег вы хотите получить в кредит?	How much money do you want to receive on credit?	כמה כסף אתה רוצה לקבל באשראי?	\N	\N
1967	1	60	c_s1p1_placeholder	\N	Например 500 000	For example 500,000	500 000 לדוגמה	\N	\N
1968	1	61	c_s1p2_title	\N	Когда вам понадобятся кредитные деньги?	When do you need credit money?	מתי אתה צריך כסף אשראי ?	\N	\N
1969	1	62	c_s2p3_title	\N	Какой кредит вы хотите?	What kind of loan do you want?	ספרו לנו קצת על עצמכם	\N	\N
1970	1	62	c_s2p3_text_1	\N	Кредит под залог	Secured loan	הלוואה מאובטחת	\N	\N
1971	1	62	c_s2p3_text_2	\N	Кредит без залога	Loan without collateral	הלוואה ללא בטחונות	\N	\N
1972	1	63	c_s2p4_text_1	\N	Стоимость недвижимости	Property value	מחיר הנכס	\N	\N
1973	1	63	c_s2p4_text_2	\N	Где находится недвижимость?	Where is the property located?	איפה הנכס	\N	\N
1974	1	64	c_s2p5_text	\N	Выберите количество партнеров для оформления кредита или кредит под залог	Select the number of partners to apply for a loan or a secured loan	בחר את מספר השותפים להגיש בקשה להלוואה או הלוואה מאובטחת	\N	\N
1975	1	27	client_title	\N	Заполните реквизиты участников	Fill in the details of the participants	מלאו את פרטי המשתתפים	\N	\N
1976	1	67	c_s4p8_text_1	\N	Когда брали ипотеку?	When did you get the mortgage?	מתי קיבלת את המשכנתא?	\N	\N
1977	1	69	c_s4p10_text_1	\N	Сколько кредитов у вас есть?	How many loans do you have?	כמה הלוואות יש לך?	\N	\N
1978	1	70	c_s4p11_label_1	\N	Сумма кредита	Credit amount	כמה כסף שאלת?	\N	\N
1979	1	70	c_s4p11_label_2	\N	Когда вы брали кредит	When did you take out a loan	מתי לקחת הלוואה	\N	\N
1980	1	85	rc_s2p2_title	\N	Сколько кредитов у вас есть, которые вы хотите рефинансировать?	How many loans do you have that you want to refinance?	כמה הלוואות יש לך שאתה רוצה למחזר?	\N	\N
1981	1	87	rc_s3p4_title	\N	Заполните реквизиты	Fill in the details	מלא את הפרטים	\N	\N
1982	1	98	rc_s4p15_title	\N	Сколько денег Вы хотите получить?	How much money do you want to receive?	כמה כסף אתה רוצה לקבל?	\N	\N
1983	1	98	rc_s4p15_text_1	\N	Для погашения ваших кредитов необходимо	To pay off your loans, you need	כדי לשלם את ההלוואות שלך, אתה צריך	\N	\N
1984	1	98	rc_s4p15_text_2	\N	Хотите получить больше кредит?	Want to get more credit?	רוצה לקבל יותר אשראי?	\N	\N
1985	1	40	rm_s1p1_title	\N	Остаток и условия нынешней ипотеки	Balance and conditions of the current mortgage	איזון ותנאי המשכנתא הנוכחית	\N	\N
1986	1	40	rm_s1p1_label_1	\N	Остаток по ипотеке	Mortgage balance	יתרת משכנתא	\N	\N
1987	1	40	rm_s1p1_label_2	\N	Стоимость существующей недвижимости	The value of the existing property	ערך נכס קיים	\N	\N
1988	1	40	rm_s1p1_label_3	\N	В каком банке рефинансировать ипотеку?	Which bank should you refinance your mortgage with?	איזה בנק יממן מחדש משכנתא?	\N	\N
1989	1	40	rm_s1p1_label_4	\N	Что вы хотите покупать?	What do you want to buy?	מה אתה רוצה לקנות?	\N	\N
1990	1	52	rm_s4p13_title	\N	Введите данные об ипотеке	Enter your mortgage details	הזינו את פרטי המשכנתא שלכם	\N	\N
1991	1	52	rm_s4p13_label_1	\N	Название программы	The name of the program	סוג מסלול	\N	\N
1992	1	52	rm_s4p13_label_2	\N	Остаток средств	Balance	יתרה	\N	\N
1993	1	52	rm_s4p13_label_3	\N	Оставшиеся месяцы	Remaining months	חודשים שנותרו	\N	\N
1994	1	52	rm_s4p13_label_4	\N	Процент	Percent	ריבית	\N	\N
1995	1	52	rm_s4p13_placeholder_1	\N	Например 2.3	For example 2.3	למשל 2.3	\N	\N
1996	1	52	rm_s4p13_placeholder_2	\N	Например 150 000	For example 150,000	למשל 000 150	\N	\N
2040	1	1	month_ago_1	\N	Месяц назад	Month ago	לפני חודש	\N	\N
2041	1	1	month_ago_2	\N	2 месяца назад	2 months ago	לפני 2 חודשים	\N	\N
1997	1	53	rm_s4p14_title	\N	Выберите основую причину рефинансирования	Select the main reason for refinancing	מה הסיבות העיקריות שבגללן אתם רוצים למחזר?	\N	\N
1998	1	53	rm_s4p14_radio_1	\N	Экономия в результате повышения процентной ставки	Savings from higher interest rates	חיסכון כתוצאה משיפור ריביות	\N	\N
1999	1	53	rm_s4p14_radio_2	\N	Сокращение срока ипотеки	Shortening the term of the mortgage	קיצור תקופת המשכנתא	\N	\N
2000	1	53	rm_s4p14_radio_3	\N	Снижение ежемесячной доходности	Decrease in monthly profitability	הקטנת ההחזר החודשי	\N	\N
2001	1	53	rm_s4p14_radio_4	\N	Изменение суммы ипотеки	Change in the amount of the mortgage	שינוי סכום המשכנתא	\N	\N
2002	1	54	rm_s4p15_title	\N	Как бы Вы хотели изменить ипотеку?	How would you like to change the mortgage?	מה תרצו לעשות?	\N	\N
2003	1	54	rm_s4p15_text_1	\N	Увеличить сумму ипотеки	Increase the amount of the mortgage	להגדיל את סכום המשכנתא	\N	\N
2004	1	54	rm_s4p15_text_2	\N	Уменьшить сумму ипотеки	Reduce the amount of the mortgage	להפחית את סכום המשכנתא	\N	\N
2005	1	55	rm_s4p16_text_2	\N	На сколько Вы бы хотели увеличить сумму ипотеки?	How much would you like to increase the mortgage amount?	כמה תרצו להגדיל את סכום המשכנתא?	\N	\N
2006	1	55	rm_s4p16_text_3	\N	Для чего нужны лишние деньги?	What is the extra money for?	לשם איזו מטרה אתם צריכים את הכסף הנוסף?	\N	\N
2007	1	55	rm_s4p16_placeholder_1	\N	Например 100 000	For example 100,000	למשל 000 100	\N	\N
2008	1	55	rm_s4p16_select_1_value_1	\N	Учеба	Studies	לימודים	\N	\N
2009	1	55	rm_s4p16_select_1_value_2	\N	Ремонт	Repair	שיפוצים	\N	\N
2010	1	55	rm_s4p16_select_1_value_3	\N	Покрытие ссуды	Loan coverage	כיסוי הלוואות	\N	\N
2011	1	55	rm_s4p16_select_1_value_4	\N	Начать бизнес	Start a business	פתיחת עסק	\N	\N
2012	1	55	rm_s4p16_select_1_value_5	\N	Другое	Other	אחר	\N	\N
2013	1	56	rm_s4p17_text_1	\N	Отлично, у вас есть свободные деньги, которыми вы хотели бы погасить часть ипотеки, сколько денег вам доступно?	Great, you have free money with which you would like to pay off part of the mortgage, how much money is available to you?	נהדר, יש לכם כסף פנוי שתרצו לפרוע באמצעותו חלק מהמשכנתא ,כמה כסף עומד לרשותכם?	\N	\N
2014	1	11	banks_select_1_value_1	\N	Минимальная сумма возврата	Minimum refund amount	סכום החזר מינימלי	\N	\N
2015	1	11	banks_select_1_value_2	\N	Максимальная сумма возврата	Maximum refund amount	סכום החזר מקסימלי	\N	\N
2016	1	11	banks_select_1_value_3	\N	Минимальный платеж	Minimum payment	תשלום מינימום	\N	\N
2017	1	11	banks_select_1_value_4	\N	Максимальный платеж	Maximum payment	תשלום מקסימלי	\N	\N
2018	1	29	question_1	\N	Есть ли у вас дополнительные доходы?	Do you have additional income?	האם יש לכם הכנסות נוספות?	\N	\N
2019	1	31	question_2	\N	Есть ли у вас дополнительные расходы? К ним относятся: аренда, алименты, кредиты, внебанковские кредиты, ипотека.	Do you have additional expenses? These include: rent, alimony, loans, non-bank loans, mortgages.	האם יש לכם הוצאות נוספות? אלה כוללים: שכר דירה, מזונות, הלוואות, הלוואות חוץ בנקאיות, משכנתא.	\N	\N
2020	1	33	question_3	\N	Есть ли ежемесячные обязательства на срок более полутора лет?	Are there monthly commitments for more than one and a half years?	האם יש התחייבויות חודשיות ליותר משנה וחצי?	\N	\N
2021	1	35	question_4	\N	Были ли проблемы с управлением финансами, например возвраты платежей?	Were there any financial management issues such as chargebacks?	האם היו בעיות בניהול פיננסי, כגון החזר כספי?	\N	\N
2022	1	37	question_5	\N	Хотите отсрочить ежемесячный платеж по ипотеке на несколько месяцев?	Want to defer your monthly mortgage payment by several months?	רוצים לדחות את תשלום המשכנתא החודשי בכמה חודשים?	\N	\N
2023	1	1	question_6	\N	Продаете ли вы старую недвижимость в пользу покупки новой?	Are you selling your old property in favor of buying a new one?	האם אתם מוכרים נכס ישן לטובת הרכישה?	\N	\N
2024	1	16	question_7	\N	Вы уже продали старую недвижимость?	Have you already sold your old property?	האם כבר מכרתם את הנכס הישן?	\N	\N
2025	1	22	question_8	\N	У вас осталась ипотека на эту недвижимость?	Do you have a mortgage on this property?	האם יש לך משכנתא על נכס זה?	\N	\N
2026	1	68	question_9	\N	У вас есть кредит?	Do you have a loan?	יש לך הלוואה?	\N	\N
2027	1	66	question_10	\N	Есть ли ипотека на эту недвижимость?	Is there a mortgage on this property?	האם קיימת משכנתא על נכס זה?	\N	\N
2028	1	1	month_1	\N	Один месяц	One month	חודש אחד	\N	\N
2029	1	1	month_2	\N	2 месяца	2 months	2 חודשים	\N	\N
2030	1	1	month_3	\N	3 месяца	3 months	3 חודשים	\N	\N
2031	1	1	month_4	\N	4 месяца	4 months	4 חודשים	\N	\N
2032	1	1	month_5	\N	5 месяцев	5 months	5 חודשים	\N	\N
2033	1	1	month_6	\N	6 месяцев	6 months	6 חודשים	\N	\N
2034	1	1	month_7	\N	7 месяцев	7 months	7 חודשים	\N	\N
2035	1	1	month_8	\N	8 месяцев	8 months	8 חודשים	\N	\N
2036	1	1	month_9	\N	9 месяцев	9 months	9 חודשים	\N	\N
2037	1	1	month_10	\N	10 месяцев	10 months	10 חודשים	\N	\N
2042	1	1	month_ago_3	\N	3 месяца назад	3 month ago	לפני 3 חודשים	\N	\N
2043	1	1	month_ago_4	\N	4 месяца назад	4 months ago	לפני 4 חודשים	\N	\N
2044	1	1	month_ago_5	\N	5 месяцев назад	5 months ago	לפני 5 חודשים	\N	\N
2045	1	1	month_ago_6	\N	6 месяцев назад	6 months ago	לפני 6 חודשים	\N	\N
2046	1	1	month_ago_7	\N	7 месяцев назад	7 months ago	לפני 7 חודשים	\N	\N
2047	1	1	month_ago_8	\N	8 месяцев назад	8 months ago	לפני 8 חודשים	\N	\N
2048	1	1	month_ago_9	\N	9 месяцев назад	9 months ago	לפני 9 חודשים	\N	\N
2049	1	1	month_ago_10	\N	10 месяцев назад	A year ago	לפני 10 חודשים	\N	\N
2050	1	1	month_ago_11	\N	11 месяцев назад	11 months ago	לפני 11 חודשים	\N	\N
2051	1	1	month_ago_12	\N	1 год назад	1 year ago	לפני שנה	\N	\N
2052	1	8	fail_title	\N	К сожалению, процесс не может быть завершен	Sorry, the process could not be completed.	מצטערים, לא ניתן היה להשלים את התהליך	\N	\N
2053	1	8	fail_text_1	\N	На данный момент ваш доход не соответствует условиям банков, мы будем рады предоставить вам услугу, как только доход изменится	At the moment, your income does not meet the conditions of the banks, we will be happy to provide you with a service as soon as income changes.	כרגע, ההכנסה שלך לא עומדת בתנאי הבנקים, נשמח לספק לך את השירות ברגע שההכנסה תשתנה	\N	\N
2054	1	1	yes	\N	Да	Yes	כן	\N	\N
2055	1	1	no	\N	Нет	No	לא	\N	\N
2056	1	1	on	\N	Вкл.	Incl.	כבוי	\N	\N
2057	1	1	off	\N	Выкл.	Off	כולל	\N	\N
2058	1	2	and	\N	и	and	ו-	\N	\N
2059	1	1	empty	\N	 	 	 	\N	\N
2060	1	1	example_text	\N	Например :text	For example :text	:text לדוגמה	\N	\N
2061	1	2	reg_label_1	\N	Имя Фамилия	First Name Last Name	שם פרטי שם משפחה	\N	\N
2062	1	2	reg_placeholder_1	\N	Маркова Мария Кирилловна	Markova Maria Kirillovna	הזינו	\N	\N
2063	1	2	reg_phone_number	\N	Номер телефона	Phone number	מספר טלפון	\N	\N
2064	1	2	reg_email	\N	Электронная почта	Email	כתובת מייל	\N	\N
2065	1	9	info_title	\N	Для получения услуги введите информацию о недвижимости:	To receive the service, enter information about the property:	לקבלת השירות, הזן מידע על הנכס	\N	\N
2066	1	9	info_city	\N	Город	Town	העיר	\N	\N
2067	1	10	payment_text_1	\N	Расчет является предварительным. Точные условия по ипотеке вам будут предоставлены в отделении банка.	The calculation is preliminary. The exact conditions for the mortgage will be provided to you at the bank branch.	החישוב הוא ראשוני. התנאים המדויקים למשכנתא יסופקו לך בסניף הבנק.	\N	\N
2068	1	11	bank_sum	\N	Сумма	Sum	סכום	\N	\N
2069	1	11	bank_percent	\N	Процент	Percent	ריבית	\N	\N
2070	1	11	bank_month	\N	Срок, месяцев	Term, months	תקופה, חודשים	\N	\N
2071	1	11	bank_payment	\N	Ежемесячный платеж	Monthly payment	תשלום חודשי	\N	\N
2072	1	11	bank_mortgage_sum	\N	Сумма ипотеки	Mortgage amount	הון עצמי	\N	\N
2073	1	11	bank_text_footer	\N	Расчет является предварительным. Точные условия по ипотеке вам будут предоставлены в отделении банка.	The calculation is preliminary. The exact conditions for the mortgage will be provided to you at the bank branch.	החישוב הוא ראשוני. התנאים המדויקים למשכנתא יסופקו לך בסניף הבנק.	\N	\N
2074	1	12	mortgage_offer_no_changes	\N	Ипотека не подвержена изменениям.	The mortgage is not subject to change.	המשכנתא אינה כפופה לשינויים.	\N	\N
2075	1	12	mortgage_offer_no_changes_text	\N	Это означает, что вероятность изменений в ежемесячном возмещении не высока	This means that the likelihood of changes in monthly reimbursement is not high.	משמעות הדבר היא כי הסבירות לשינויים בהחזר החודשי אינה גבוהה.	\N	\N
2076	1	23	s2p12_text_2	\N	Сколько осталось платить за ипотеку?	How much is left to pay for the mortgage?	כמה משכנתא נותרה לכם?	\N	\N
2077	1	57	rm_payment_title	\N	Теперь запишите, сколько вы хотите платить каждый месяц	Now write down how much you want to pay each month.	עכשיו רשמו כמה אתם רוצים לשלם בכל חודש	\N	\N
2078	1	70	about_credits	\N	Информация о текущих кредитах	Information about current loans	מידע על הלוואות שוטפות	\N	\N
2079	1	81	c_payment_title	\N	Теперь запишите, сколько вы хотите платить каждый месяц	Now write down how much you want to pay each month.	עכשיו רשמו כמה אתם רוצים לשלם בכל חודש	\N	\N
2080	1	104	personalInformation	\N	Персональная информация	Personal information	מידע אישי	\N	\N
2081	1	104	services	\N	Услуги	Services	שירותים	\N	\N
2082	1	104	documents	\N	Документы	The documents	מסמכים	\N	\N
2083	1	104	payments	\N	Оплаты	Payment	תשלום	\N	\N
2084	1	104	messages	\N	Сообщения	Posts	פוסטים	\N	\N
2085	1	104	notifications	\N	Уведомления	Notifications	הודעות	\N	\N
2086	1	104	settings	\N	Настройки	Settings	הגדרות	\N	\N
2087	1	104	exit	\N	Выйти	Log off	צא החוצה	\N	\N
2088	1	104	paymentsTitle	\N	Оплата	Payment	תשלום	\N	\N
2089	1	103	addNewCard	\N	Добавить новую карту	Add new card	הוסף כרטיס חדש	\N	\N
2090	1	103	removeCard	\N	Удалить карту	Delete card	מחק כרטיס	\N	\N
2091	1	103	addCard	\N	Добавление карты	Adding a map	הוספת כרטיס	\N	\N
2092	1	102	continue	\N	Продолжить	Proceed	להמשיך	\N	\N
2093	1	102	cardName	\N	Название карты	Card name	שם כרטיס	\N	\N
2094	1	102	cardNamePlaceholder	\N	Например Visa	For example Visa	למשל ויזה	\N	\N
2095	1	102	cardCvv	\N	Например 123	For example 123	לדוגמא 123	\N	\N
2096	1	102	cardholder	\N	Имя фамилия	First Name Last Name	שם פרטי שם משפחה	\N	\N
2097	1	102	cardSave	\N	Сохранить	Save	לשמור	\N	\N
2098	1	102	cardNumber	\N	Номер карты	Card number	מספר כרטיס	\N	\N
2099	1	102	cardHolderName	\N	Имя Фамилия	First Name Last Name	שם פרטי שם משפחה	\N	\N
2100	1	103	titlePayments	\N	Оплата	Payment	תשלום	\N	\N
2101	1	104	personalData	\N	Личные данные	Personal data	מידע אישי	\N	\N
2102	1	104	passportData	\N	Паспортные данные	Passport data	נתוני תעודה מזהה	\N	\N
2103	1	104	residenceAddress	\N	Адрес проживания	Residence address	כתובת מגורים	\N	\N
2104	1	104	name	\N	Имя Фамилия	First Name Last Name	שם פרטי שם משפחה	\N	\N
2105	1	104	lastname	\N	Фамилия	Surname	שֵׁם מִשׁפָּחָה	\N	\N
2106	1	104	surname	\N	Фамилия	Surname	שֵׁם מִשׁפָּחָה	\N	\N
2107	1	104	passport_series-number	\N	Серия/Номер	Serial number	מספר הזהות	\N	\N
2108	1	104	passport_who-issued	\N	Кем выдан	Issued by	הונפק על ידי	\N	\N
2109	1	104	passport_date-of-issue	\N	Дата выдачи	date of issue	תאריך הופקה	\N	\N
2110	1	104	passport_city-of-birth	\N	Город рождения	City of birth	עיר הלידה	\N	\N
2111	1	104	address_city	\N	Город	Town	העיר	\N	\N
2112	1	104	address_street	\N	Улица	Street	הרחוב	\N	\N
2113	1	104	address_house-float	\N	Дом/Квартира	House / Apartment	בית / דירה	\N	\N
2114	1	104	message_for_personal-data	\N	Укажите точно как в паспорте	Indicate exactly as in your passport	ציין בדיוק כמו בתעודה מזהה	\N	\N
2115	1	104	numberPhone	\N	Номер телефона	Phone number	מספר טלפון	\N	\N
2116	1	104	email_address	\N	Электронная почта	Email	אימייל	\N	\N
2117	1	104	passport_seriesNumber	\N	Серия/Номер	Serial number	מספר הזהות	\N	\N
2118	1	103	balance	\N	Баланс	Balance	איזון	\N	\N
2119	1	103	operation_name_mortgage_on_bail	\N	Ипатека под залог	Hypateka on bail	משכנתא מאובטחת	\N	\N
2120	1	103	operation_type	\N	Оплата услуги	Service payment	תשלום עבור השירות	\N	\N
2121	1	103	date_operation_today	\N	Сегодня	Today	היום	\N	\N
2122	1	103	confirm_delete_card	\N	Вы уверены, что хотите удалить карту?	Are you sure you want to delete the card?	האם אתה בטוח שברצונך להסיר את הכרטיס?	\N	\N
2123	1	103	answer_cancel_to_delete_card	\N	Отменить	Cancel	לבטל	\N	\N
2124	1	103	answer_delete_card	\N	Удалить	Delete	להסיר	\N	\N
2125	1	108	notifications_message	\N	Ваша просьба послана в банки. Тем временем загрузите документы в личном кабинете.	Your request has been sent to banks. In the meantime, upload the documents in your personal account.	בקשתך נשלחה לבנקים. בינתיים העלה מסמכים לחשבונך האישי.	\N	\N
2126	1	107	documentation_hint_doc_show	\N	Документы необходимые для получения услуги	Documents required to receive the service	מסמכים הנדרשים לקבלת השירות	\N	\N
2127	1	107	my_documents	\N	Мои документы	My documents	המסמכים שלי	\N	\N
2128	1	107	example_documents	\N	Пример документов	Sample documents	מסמכים לדוגמא	\N	\N
2129	1	104	passport	\N	Паспорт	Passport	הצד האחורי של תעודה מזהה	\N	\N
2130	1	107	documents_delete	\N	Удалить документ	Delete document	מחק מסמך	\N	\N
2131	1	107	documents_download	\N	Загрузить документ	Upload document	העלה מסמך	\N	\N
2132	1	107	documents_status_check	\N	На проверке	On check	בבדיקה	\N	\N
2133	1	107	documents_status_received	\N	Принят	Accepted	קיבלו	\N	\N
2134	1	107	documents_status_rejected	\N	Отклонен	Rejected	נִדחֶה	\N	\N
2135	1	107	documents_filter_all	\N	Все	Everything	את כל	\N	\N
2136	1	107	documents_filter_done	\N	Загруженные	Uploaded	הועלו	\N	\N
2137	1	107	documents_filter_not_done	\N	Незагруженные	Unloaded	לא הועלו	\N	\N
2138	1	107	documents_choose_services	\N	Выберите услугу для отображения необходимых документов	Select a service to display the required documents	בחר שירות להצגת המסמכים הנדרשים	\N	\N
2139	1	107	documents_other_filter	\N	Нет документов для отображения, выберите другой фильтр	There are no documents to display, please select a different filter	אין מסמכים להצגה, אנא בחר מסנן אחר	\N	\N
2140	1	107	documents_sort	\N	Сортировка	Sorting	מיון	\N	\N
2141	1	107	documents_service	\N	Услуга	Service	שרות	\N	\N
2142	1	107	documents_comments_moderator	\N	Комментарий модератора:	Moderator's comment:	הערת מנחה:	\N	\N
2143	1	107	services_documents_download	\N	Загрузить документы	Upload documents	העלה מסמכים	\N	\N
2144	1	106	waiting_docs	\N	Ожидание документов	Waiting for documents	מחכה למסמכים	\N	\N
2184	1	104	placeHolder_email	\N	Eitanmortgage@gmail.com	Eitanmortgage@gmail.com	Eitanmortgage@gmail.com	\N	\N
2145	1	106	mortgage_in_a_new_building	\N	Ипотека в новостройке	Mortgage in a new building	משכנתא בבניין חדש	\N	\N
2146	1	106	Mortgage amount	\N	Сумма ипотеки	Mortgage amount	סכום משכנתא	\N	\N
2147	1	106	monthly_payment	\N	Еж. платеж	Hedgehog. payment	תשלום חודשי	\N	\N
2148	1	106	interest_refund	\N	Возврат процентов	Interest refund	תיביר רזחה	\N	\N
2149	1	106	download_payment_schedule	\N	Скачать график платежа	Download payment schedule	להוריד את לוח התשלומים	\N	\N
2150	1	36	problem	\N	Проблема	Problem	בעיה	\N	\N
2151	1	104	change_password	\N	Изменить пароль	Change Password	שנה סיסמא	\N	\N
2152	1	104	old_password	\N	Старый пароль	Old Password	סיסמה ישנה	\N	\N
2153	1	104	new_password	\N	Новый пароль	New Password	סיסמה חדשה	\N	\N
2154	1	104	new_password_again	\N	Повторить новый пароль	Repeat new password	חזור על סיסמה חדשה	\N	\N
2155	1	109	setting_notification	\N	Настройки уведомлений	Notification settings	הגדרות התראה	\N	\N
2156	1	109	setting_notification_on_phone	\N	На телефон	On the phone	להתקשר	\N	\N
2157	1	109	setting_notification_on_email	\N	На почту	To the post office	דואר	\N	\N
2158	1	106	user_service_not_found	\N	Услуга не найдена. Вернитесь к оформлению услуги.	Service not found. Return to the service registration.	שירות לא נמצא. חזור לרישום השירות.	\N	\N
2159	1	104	passwords_must_match	\N	Пароли должны совпадать	Passwords must match	הססמאות חייבות להיות זהות	\N	\N
2160	1	104	passwords_length	\N	Длина пароля должна быть от 8 до 40 символов	Password length must be between 8 and 40 characters	אורך הסיסמה חייב להיות בין 8 ל -40 תווים	\N	\N
2161	1	104	personal_information	\N	Информация	Information	מידע	\N	\N
2162	1	107	send_documents	\N	Отправить документы в банк	Send documents to the bank	לשלוח מסמכים לבנק	\N	\N
2163	1	104	password_changed	\N	Пароль успешно изменен	Password changed successfully	סיסמה שונתה בהצלחה	\N	\N
2164	1	104	changes	\N	Изменения	Changes	םייוניש	\N	\N
2165	1	104	initials	\N	Имя Фамилия	First Name Last Name	שם פרטי שם משפחה	\N	\N
2166	1	104	on_your	\N	На ваш номер телефона	To your phone number	למספר הטלפון שלך	\N	\N
2167	1	104	was_send_sms	\N	отправлено СМС сообщение с кодом	an SMS message with a code has been sent	נשלח SMS עם קוד	\N	\N
2168	1	104	change_action	\N	Изменить номер телефона	Change phone number	שנה מספר טלפון	\N	\N
2169	1	104	press_code	\N	Если вы не получили СМС с кодом в течении 20 секунд, повторите  запрос.	If you have not received an SMS with a code within 20 seconds, please repeat your request.	אם לא קיבלת SMS עם קוד תוך 20 שניות, חזור על בקשתך.	\N	\N
2170	1	104	send_again	\N	Отправить сообщение еще раз	Send message again	שלח SMS שוב	\N	\N
2171	1	104	change_confirm	\N	Подтвердить	Confirm	לאשר	\N	\N
2172	1	104	dont_came_sms	\N	Не приходит СМС?	Doesn't SMS come?	לא מקבלים SMS ?	\N	\N
2173	1	104	problemWithService_message	\N	Если на указанный вами ранее телефонный номер не приходит СМС с кодом подтверждения, ознакомьтесь внимательно с возможными причинами.	If you do not receive an SMS with a confirmation code to the phone number you specified earlier, please read carefully the possible reasons.	אם אינך מקבל SMS עם קוד אישור למספר הטלפון שציינת קודם, אנא קרא בעיון את הסיבות האפשריות	\N	\N
2174	1	104	problemWithService_radio_one	\N	Проверьте корректность введенного ранее телефонного номера	Check the correctness of the previously entered phone number	בדוק את נכונות מספר הטלפון שהזנת בעבר	\N	\N
2175	1	104	problemWithService_radio_two	\N	Проверьте рабочее состояние сим - карты	Check the working condition of the SIM card	בדוק את מצב העבודה של כרטיס ה- SIM	\N	\N
2176	1	104	problemWithService_radio_three	\N	Технические проблемы сервиса	Service technical problems	בעיות טכניות בשירות	\N	\N
2177	1	104	problemWithService_send	\N	Продолжить	Proceed	להמשיך	\N	\N
2178	1	81	credit_min_payment	\N	Банк не разрешит платить меньше. В этом случае выплаты по кредиту будут длиться около 30 лет.	The bank will not allow you to pay less. In this case, the loan payments will last for about 30 years.	הבנק לא יאפשר לך לשלם פחות. במקרה זה תשלומי ההלוואה יימשכו כ- 30 שנה.	\N	\N
2179	1	81	credit_max_payment	\N	Банк не разрешит вам платить больше.	The bank will not allow you to pay more.	הבנק לא יאפשר לך לשלם יותר.	\N	\N
2180	1	81	credit_payment_text	\N	Расчет является предварительным. Точные условия по кредиту вам будут предоставлены в отделении банка.	The calculation is preliminary. The exact terms of the loan will be provided to you at the bank branch.	החישוב הוא ראשוני. תנאי ההלוואה המדויקים יסופקו לך בסניף הבנק.	\N	\N
2181	1	104	agree_message	\N	Я согласен с условиями обработки и использования моих персональных данных, определенными	I agree with the terms of processing and use of my personal data as defined by	אני מסכים לתנאי העיבוד והשימוש בנתונים האישיים שלי, כהגדרתם	\N	\N
2182	1	104	amount_to_paid	\N	Сумма к оплате:	Amount to pay:	סכום לתשלום:	\N	\N
2183	1	104	percentage_amount	\N	3% от суммы услуги	3% of the service amount	3% מסכום השירות	\N	\N
2185	1	104	placeHolder_for_name	\N	Например : Анна	For example: Anna	לדוגמא: אנה	\N	\N
2186	1	104	placeHolder_for_lastname	\N	Например : Казанова	For example: Casanova	לדוגמא: קזנובה	\N	\N
2187	1	104	registration_text1	\N	Нажимая кнопку “Продолжить” я принимаю условия	By clicking "Continue" I accept the terms	בלחיצה על כפתור להמשיך, אני מקבל את תנאי	\N	\N
2188	1	104	terms_of_use	\N	Пользовательского соглашения	User Agreement	הסכם המשתמש	\N	\N
2189	1	104	registration_text2	\N	и даю свое согласие на обработку моей персональной информации на условиях, определенных	and I give my consent to the processing of my personal information on the terms determined by	ומעניק את הסכמתי לעיבוד המידע האישי שלי בתנאים שנקבעו על פי	\N	\N
2190	1	104	registration_text3	\N	Политикой конфиденциальности.	Privacy Policy.	במדיניות הפרטיות.	\N	\N
2191	1	104	login_entry	\N	Войти	Login	להיכנס	\N	\N
2192	1	104	login	\N	Логин	Login	קוד משתמש	\N	\N
2193	1	104	login_placeholder	\N	Телефон или email	Phone or email	טלפון או email	\N	\N
2194	1	104	password	\N	Пароль	Password	סיסמה	\N	\N
2195	1	104	forget_password	\N	Забыли пароль?	Forgot your password?	שכחת סיסמה?	\N	\N
2196	1	104	noAccounts	\N	У вас еще нет аккаунта?	Don't have an account yet?	עדיין אין לך חשבון?	\N	\N
2197	1	104	login_registration	\N	Зарегистрироваться	Register now	הירשם עכשיו	\N	\N
2198	1	104	placeHolder_phone	\N	0501234567	0501234567	0501234567	\N	\N
2199	1	104	loginBigTitle	\N	ךלש ישיאה ןובשחל רבחתה	ךלש ישיאה ןובשחל רבחתה	0501234567	\N	\N
2200	1	104	login_Big_Title	\N	Вход в личный кабинет	Login to your personal account	כניסה לחשבונך	\N	\N
2201	1	104	passwordRecoveryTitle	\N	Восстановить пароль	Restore password	הפקת סיסמה חדשה	\N	\N
2202	1	104	passwordRecoveryNext	\N	Далее	Further	להיכנס	\N	\N
2203	1	104	newPassportText	\N	Введите новый пароль для входа в личний кабинет	Enter a new password to enter your personal account	הזן סיסמה חדשה להזנת חשבונך האישי	\N	\N
2204	1	109	Unauthenticated	\N	Ошибка авторизации	Authorisation Error	שגיאת הרשאה	\N	\N
2205	1	109	same_passwords	\N	Новый пароль совпадает со старым	The new password is the same as the old one	הסיסמה החדשה זהה לזו הישנה	\N	\N
2206	1	109	wrong_old_password	\N	Старый пароль не верный	Old password is not correct	סיסמה ישנה אינה נכונה	\N	\N
2207	1	106	no_service	\N	Нет активных услуг	No active services	אין שירותים פעילים	\N	\N
2208	1	106	status_payment	\N	Ожидание оплаты	Waiting for payment	מחכה לתשלום	\N	\N
2209	1	106	status_canceled	\N	Отмена	Cancel	ביטול	\N	\N
2210	1	106	status_completed	\N	Завершена	Completed	הושלם	\N	\N
2211	1	106	status_files	\N	Ожидание документов	Waiting for documents	מחכה למסמכים	\N	\N
2212	1	106	status_new	\N	Новая	New	חָדָשׁ	\N	\N
2213	1	106	status_in_progress	\N	В процессе заполнения	In the process of filling	בתהליך מילוי	\N	\N
2214	1	103	service_payment	\N	Оплата услуги	Service payment	תשלום שירות	\N	\N
2215	1	106	status_active	\N	Активна	Active	פעיל	\N	\N
2216	1	106	status_checked	\N	На проверке	On check	בבדיקה	\N	\N
2217	1	106	no_services	\N	Нет активных услуг, перейдите к оформлению услуги	There are no active services, go to the service registration	אין שירותים פעילים, עבור לרישום שירות	\N	\N
2218	1	106	services_continue	\N	Продолжить оформление	Continue checkout	להמשיך ברישום	\N	\N
2219	1	27	common_info	\N	Общая информация	general information	מידע כללי	\N	\N
2220	1	27	education	\N	Образование	Education	חינוך	\N	\N
2221	1	27	education_select_value_1	\N	Без формального образования	No formal education	ללא השכלה פורמאלית	\N	\N
2222	1	27	education_select_value_2	\N	Средняя школа	high school	תיכונית	\N	\N
2223	1	27	education_select_value_3	\N	Высшее образование	Higher education	על תיכונית	\N	\N
2224	1	27	education_select_value_4	\N	Профессиональное обучение	Professional education	הכשרה מקצועית	\N	\N
2225	1	27	education_select_value_5	\N	Практический инженер	Practical engineer	הנדסאי	\N	\N
2226	1	27	education_select_value_6	\N	Студент бакалавриата	Undergraduate student	סטודנט תואר ראשון	\N	\N
2227	1	27	education_select_value_7	\N	Магистрант / аспирант	Undergraduate / postgraduate student	סטודנט תואר שני/שלישי	\N	\N
2228	1	27	education_select_value_8	\N	Степень бакалавра	Bachelors degree	אקדמאי תואר ראשון	\N	\N
2229	1	27	education_select_value_9	\N	Академический магистр / доктор наук	Academic Master / Doctor of Science	אקדמאי תואר שני/שלישי	\N	\N
2230	1	104	edit_photo	\N	Редактировать фото	Edit photo	ערוך תמונה	\N	\N
2231	1	108	no_messages	\N	Для вас пока что нет уведомлений.	There are no notifications for you yet.	אין עדיין הודעות עבורך.	\N	\N
2232	1	104	enter_password	\N	Введите пароль для входа в личный кабинет	Enter the password to enter your personal account	הזן את הסיסמה להכנסה לחשבונך	\N	\N
2289	1	52	pay_select_2	\N	Дифференцированный	Differentiated	קרן שווה	\N	\N
2233	1	104	enter_phone	\N	Введите номер телефона (на ваш номер будет отправлено СМС сообщение для подтверждения)	Enter your phone number (a confirmation SMS will be sent to your number)	הזן את מספר הטלפון שלך (הודעת SMS לאישור תישלח למספר שלך)	\N	\N
2234	1	104	confirmation	\N	Подтверждение	Confirmation	האישור	\N	\N
2235	1	104	wrong_password	\N	Неверный пароль	Wrong password	סיסמה שגויה	\N	\N
2236	1	104	user_not_found	\N	Пользователь не найден	User is not found	המשתמש לא נמצא	\N	\N
2237	1	104	passwordRecoverySubTitle	\N	Введите ваш номер телефона или электронную почту для сброса старого пароля	Enter your phone number or email to reset your old password	הזן את מספר הטלפון או הדוא"ל שלך כדי לאפס את הסיסמה הישנה שלך	\N	\N
2238	1	104	save	\N	Сохранить	Save	לשמור	\N	\N
2239	1	111	accepted	\N	Принять условия покупки	Accept the terms of purchase	לקבל את תנאי רכישה	\N	\N
2240	1	111	accept_contract	\N	Полностью согласен(сна) с условиями покупки	I fully agree (sleep) with the terms of purchase	אני מסכים לחלוטין עם תנאי רכישה	\N	\N
2241	1	111	contract	\N	Условия покупки	Purchase terms	תנאי רכישה	\N	\N
2242	1	103	pay	\N	Оплатить услугу	Pay for the service	שלם עבור השירות	\N	\N
2243	1	103	no_cards	\N	Ни одной карты еще не добавлено	No maps have been added yet	עדיין לא הוסיפו כרטיס	\N	\N
2244	1	103	no_operations	\N	Нет операций по карте	No card transactions	אין עסקאות בכרטיס	\N	\N
2245	1	103	date_operation_yesterday	\N	Вчера	Yesterday	אתמול	\N	\N
2246	1	9	mortgage_error_min_sum	\N	Банки не выдают ипотечные кредиты меньше 50 000	Banks do not issue mortgage loans less than 50,000	הבנקים אינם מנפיקים הלוואות משכנתא פחות מ- 50,000	\N	\N
2247	1	9	mortgage_error_enter	\N	Введите допустимые значения, чтобы получить предложения от банков	Please enter valid values ​​to receive offers from banks	אנא הזן ערכים תקפים כדי לקבל הצעות מבנקים	\N	\N
2248	1	9	mortgage_error_percent	\N	Банки не выдают ипотечные кредиты для финансирования более 75% от стоимости недвижимости	Banks do not issue mortgage loans to finance more than 75% of the value of real estate	הבנקים אינם מנפיקים הלוואות משכנתא למימון של יותר מ 75% מערך הנדל"ן	\N	\N
2249	1	9	fin_percent	\N	Процент финансирования	Funding percentage	אחוז מימון	\N	\N
2250	1	114	contacts	\N	Контакты	Contacts	אנשי קשר	\N	\N
2251	1	12	old_program_payment	\N	Сумма которую вам необходимо заплатить без рефинансирования ипотеки	The amount you need to pay without refinancing your mortgage	הסכום שעליכם לשלם ללא מימון מחדש של המשכנתא	\N	\N
2252	1	1	selection_error_no_banks	\N	Ошибка: не получены банки участвущие в тендере	Error: banks participating in the tender were not received	שגיאה: הבנקים המשתתפים במכרז לא התקבלו	\N	\N
2253	1	1	selection_error_no_programs	\N	Ошибка: не получены ипотечные программы	Error: mortgage programs not received	שגיאה: תוכניות משכנתא לא התקבלו	\N	\N
2254	1	1	selection_error_no_result	\N	Ошибка подбора ипотечных программ	Error in the selection of mortgage programs	שגיאת בחירת תוכנית משכנתא	\N	\N
2255	1	1	error_program_rate	\N	Ошибка подбора процентных ставок программ	Error in the selection of interest rates programs	שגיאה בבחירת תוכניות הריבית	\N	\N
2256	1	1	error_payment	\N	Ошибка расчета платежа	Payment calculation error	שגיאת חישוב תשלום	\N	\N
2257	1	1	error_income	\N	Ошибка: ваш суммарный доход не удовлетворяет условиям получения услуги	Error: your total income does not meet the conditions for receiving the service	שגיאה: ההכנסה הכוללת שלך אינה עומדת בתנאים לקבלת השירות	\N	\N
2258	1	111	contract_amount	\N	Сумма к оплате	Amount to pay	סכום לתשלום	\N	\N
2259	1	111	contract_percent	\N	от стоимости услуги	from the cost of the service	מעלות השירות	\N	\N
2260	1	111	economy	\N	Материальная экономия	Material savings	חסכון מהותי	\N	\N
2261	1	111	return_economy_sum	\N	Экономия суммы возврата	Saving the return amount	שמירת סכום ההחזר	\N	\N
2262	1	1	form_wrong_abc_email	\N	Используйте английскую раскладку клавиатуры	Use an English keyboard layout	השתמש בפריסת מקלדת באנגלית	\N	\N
2263	1	111	wait_bank_decision	\N	Все документы успешно загружены и отправлены в банк, ожидайте решение банка по вашей услуге.	All documents have been successfully uploaded and sent to the bank, await the bank's decision on your service.	כל המסמכים הועלו בהצלחה ונשלחו לבנק, ממתינים להחלטת הבנק על שירותכם.	\N	\N
2264	1	9	realty_city	\N	Город покупки недвижимости	City of real estate purchase	עיר רכישת נדל"ן	\N	\N
2265	1	10	month_payment	\N	Срок платежа, месяцев	Payment term, months	תקופת תשלום, חודשים	\N	\N
2290	1	52	pay_select_1	\N	Аннуитетный	Annuity	שפיצר	\N	\N
2291	1	52	pay_select_3	\N	Буллит	Bullitt	בוליט	\N	\N
2333	1	104	placeHolder_code	\N	Введите код из сообщения	Enter the code from the message	הזן את הקוד מההודעה	\N	\N
2334	1	104	on_your_email	\N	На вашу электронную почту	To your email	למייל שלך	\N	\N
2266	1	108	notify_text	\N	По договору вы должны перейти к оплате услуги. После оплаты вам будет предоставлен доступ к банкам и будет возможность выбрать выгодный банк, назначить дату и время для подписания услуги в ближайшем филиале банка по вашему адресу.	According to the agreement, you must proceed to pay for the service. After payment, you will be given access to banks.	על פי ההסכם, עליכם להמשיך ולשלם עבור השירות. לאחר התשלום תינתן לך גישה לבנקים ותוכל לבחור בנק רווחי, לקבוע תאריך ושעה לחתימת השירות בסניף הקרוב ביותר של הבנק בכתובתך.	\N	\N
2267	1	1	registration_text	\N	Для получения информации от банков необходимо продолжить процедуру после регистрации в личном кабинете	To receive information from banks, you must continue the procedure after registering in your personal account	כדי לקבל מידע מהבנקים עליך להמשיך בהליך לאחר ההרשמה לחשבונך האישי	\N	\N
2268	1	111	contract_sum	\N	Сумма услуги	Service amount	סכום שירות	\N	\N
2269	1	111	info_1	\N	Оплата будет произведена только после разрешения одного из банков, в случае если банки не одобрят услугу оплата = 0 ₪.	Payment will be made only after the permission of one of the banks, if the banks do not approve the service payment = 0 ₪.	התשלום יתבצע רק לאחר אישור של אחד הבנקים, אם הבנקים לא מאשרים את תשלום השירות = ₪0.	\N	\N
2270	1	111	info_2	\N	В случае положительного ответа одного из банков оплата производится по следующему расчету:	In case of a positive answer from one of the banks, payment is made according to the following calculation:	במקרה של תשובה חיובית של אחד הבנקים, התשלום מתבצע על פי החישוב הבא:	\N	\N
2271	1	111	contract_payment	\N	Оплата за услугу	Payment for the service	תשלום עבור השירות	\N	\N
2272	1	1	calculate_mortgage	\N	Расчет ипотеки	Mortgage calculation	חישוב משכנתא	\N	\N
2273	1	52	add_program	\N	Добавить программу	Add a program	הוסף תוכנית	\N	\N
2274	1	54	refmortgage_decrease	\N	Вы бы хотели уменьшить ипотеку если у вас есть материальная возможность уменьшить ипотеку	Would you like to reduce your mortgage if you have the material opportunity to reduce your mortgage	האם תרצה להפחית את המשכנתא אם יש לך הזדמנות מהותית להפחית את המשכנתא	\N	\N
2275	1	54	refmortgage_increase	\N	Вы бы хотели увеличить сумму ипотеки на ремонт или достройку	Would you like to increase the amount of the mortgage for renovation or completion	האם תרצה להגדיל את סכום המשכנתא לצורך שיפוץ או השלמה	\N	\N
2276	1	10	calc_month	\N	по сроку	on time	לפי מועד פירעון	\N	\N
2277	1	10	calc_payment	\N	Расчет по платежу	Settlement for payment	חישוב לפי החזר חודשי	\N	\N
2278	1	10	tt_payment	\N	Если вы хотите сократить срок давности ипотеки то можно увеличить ежемесячный платеж,  что позволит вам быстрее вернуть ипотеку и получить материальную экономию	If you want to shorten the term of the mortgage, you can increase the monthly payment, which will allow you to quickly return the mortgage and get material savings.	אם תרצו לקצר את תקופת המשכנתא תוכלו להגדיל את התשלום החודשי, שיאפשר לכם להחזיר את המשכנתא במהירות ולקבל חסכון מהותי	\N	\N
2279	1	10	tt_month	\N	Увеличение срока ипотеки позволит вам уменьшить ежемесячный платеж	Increasing the term of the mortgage will allow you to reduce the monthly payment	הגדלת תקופת המשכנתא תאפשר לכם להפחית את התשלום החודשי	\N	\N
2280	1	116	continue_new_credit	\N	Продолжить новый кредит	Continue new loan	המשך הלוואה חדשה	\N	\N
2281	1	81	c_tt_payment	\N	Если вы хотите сократить срок давности кредита то можно увеличить ежемесячный платеж, что позволит вам быстрее вернуть кредит и получить материальную экономию	If you want to shorten the term of the loan, you can increase the monthly payment, which will allow you to repay the loan faster and get material savings.	אם תרצו לקצר את תקופת ההלוואה תוכלו להגדיל את התשלום החודשי, שיאפשר לכם להחזיר את ההלוואה מהר יותר ולקבל חסכון מהותי	\N	\N
2282	1	81	c_tt_month	\N	Увеличение срока кредита позволит вам уменьшить ежемесячный платеж	Increasing the loan term will allow you to reduce your monthly payment	הגדלת תקופת ההלוואה תאפשר לך להפחית את התשלום החודשי שלך	\N	\N
2283	1	62	return_sum	\N	Полная сумма выплаты	Full payout amount	סכום תשלום מלא	\N	\N
2284	1	79	credit_delay	\N	Хотите отсрочить ежемесячный платеж по кредиту на несколько месяцев?	Do you want to defer your monthly loan payment by several months?	האם אתה רוצה לדחות את תשלום ההלוואה החודשית שלך למספר חודשים?	\N	\N
2285	1	10	confirm_payment	\N	Подтвердите параметры услуги или поменяйте условия	Confirm service parameters or change conditions	אשר פרמטרים של שירות או שנה תנאים	\N	\N
2286	1	1	social_alert	\N	Вы упустили возможность перейти в соцсеть	You missed the opportunity to go to the social network	פספסת את ההזדמנות להיכנס למדיה החברתית	\N	\N
2287	1	52	programs_not_enough	\N	Сумма остатка средств указанных программ менее общего остатка по ипотеке:	The amount of the balance of these programs is less than the total balance on the mortgage:	סכום יתרת הכספים בתוכניות אלה נמוך מהיתרה הכוללת במשכנתא:	\N	\N
2288	1	52	pay_type	\N	Тип платежа	Payment type	שיטת החזר	\N	\N
2292	1	118	ref_members_text	\N	Выберите количество партнеров для оформления услуги рефинансирования кредита или рефинансирование кредита под залог	Select the number of partners to apply for a loan refinancing service or secured loan refinancing	בחר את מספר השותפים להגיש בקשה לשירות מימון הלוואות או מימון הלוואות מאובטחות מחדש	\N	\N
2293	1	118	ref_credit_deposit	\N	Рефинансирование кредита под залог	Refinancing a secured loan	מימון מחדש של הלוואה מובטחת	\N	\N
2294	1	98	aim_text	\N	На что нужны деньги?	What is the money for?	בשביל מה הכסף?	\N	\N
2295	1	98	aim_label	\N	Цель кредита	Purpose of the loan	מטרת ההלוואה	\N	\N
2296	1	98	aim_select_1	\N	Ремонт недвижимости	Renovation of real estate	שיפוץ מקרקעין	\N	\N
2297	1	98	aim_select_2	\N	Покупка недвижимости	Buying a property	קניית נכס	\N	\N
2298	1	98	aim_select_3	\N	Покупка автомобиля	Buying a car	קניית רכב	\N	\N
2299	1	98	aim_select_4	\N	На все случаи	For all occasions	לכל המקרים	\N	\N
2300	1	98	go_mortgage	\N	Оформить ипотеку	Get a mortgage	קבל משכנתא	\N	\N
2301	1	98	go_mortgage_text	\N	Кредит в целях покупки или ремонта недвижимости выгоднее приобретать в категории приобретение ипотеки.	It is more profitable to purchase a loan for the purpose of purchasing or renovating real estate in the category of purchasing a mortgage.	משתלם יותר לרכוש הלוואה לצורך רכישה או שיפוץ נדל"ן בקטגוריית רכישת משכנתא.	\N	\N
2302	1	101	old_credit_payment	\N	Сумма которую вам необходимо заплатить без рефинансирования кредита	The amount you need to pay without refinancing the loan	הסכום שעליכם לשלם ללא מימון מחדש של ההלוואה	\N	\N
2303	1	111	contract_from_economy	\N	от суммы материальной экономии	from the amount of material savings	מסכום החיסכון החומרי	\N	\N
2304	1	104	select_service	\N	Выберите услугу для продолжения:	Select a service to continue:	בחר שירות להמשך:	\N	\N
2305	1	1	bank_not_found	\N	Банк не найден	Bank not found	הבנק לא נמצא	\N	\N
2306	1	1	bank_not_in_tender	\N	Банк не участвует в тендере. Активируйте участие в панели администрирования.	The bank does not participate in the tender. Activate participation in the administration panel.	הבנק אינו משתתף במכרז. הפעל השתתפות בפאנל הממשל.	\N	\N
2307	1	1	error_min_payment	\N	Суммарный доход не удовлетворяет условиям банков для получения услуги	The total income does not meet the conditions of banks for receiving the service	ההכנסה הכוללת אינה עומדת בתנאי הבנקים לקבלת השירות	\N	\N
2308	1	1	return_text	\N	Вернуться для завершения действия	Return to complete the action	חזור להשלמת הפעולה	\N	\N
2309	1	1	return_subtext	\N	В предыдущем сеансе работы на сайте вы не закончили действие и сейчас можете вернуться для продолжения	In the previous session on the site, you did not complete the action and now you can return to continue	בפגישה הקודמת באתר לא השלמת את הפעולה וכעת תוכל לחזור להמשיך	\N	\N
2310	1	119	bank_offers	\N	Предложения банков	Bank offers	הצעות בנק	\N	\N
2311	1	119	meet_button	\N	Назначить встречу	Make appointment	לקבוע פגישה	\N	\N
2312	1	120	set_meeting_title	\N	Назначить встречу в банке	Make an appointment at the bank	קבע פגישה בבנק	\N	\N
2313	1	120	set_meeting	\N	Назначение встречи в банке	Appointment at the bank	מינוי בבנק	\N	\N
2314	1	120	branch	\N	Филиал банка	Bank branch	סניף בנק	\N	\N
2315	1	120	meet_date	\N	Дата встречи	Date of meeting	תאריך הפגישה	\N	\N
2316	1	120	time	\N	Время	Time	זמן	\N	\N
2317	1	120	comment	\N	Комментарий	A comment	הערות	\N	\N
2318	1	120	meet_complete	\N	Встреча назначена	Appointment	קביעת פגישה	\N	\N
2319	1	120	meet_info	\N	Ожидайте подтверждения встречи банком	Wait for confirmation of the meeting by the bank	המתן לאישור הפגישה על ידי הבנק	\N	\N
2320	1	120	meet_approved	\N	Встреча подтверждена банком!	The meeting is confirmed by the bank!	הפגישה מאושרת על ידי הבנק!	\N	\N
2321	1	1	how_it_works	\N	Как это работает?	How it works?	איך זה עובד?	\N	\N
2322	1	2	field_required	\N	Заполните все поля для продолжения	Please complete all fields to continue	אנא מלא את כל השדות כדי להמשיך	\N	\N
2323	1	1	back	\N	Назад	Back	חזור	\N	\N
2324	1	1	privacy	\N	מדיניות הפרטיות	מדיניות הפרטיות	מדיניות הפרטיות	\N	\N
2325	1	1	terms	\N	תנאי שימוש	תנאי שימוש	תנאי שימוש	\N	\N
2326	1	1	contacts_heb	\N	צור קשר	צור קשר	צור קשר	\N	\N
2327	1	1	next	\N	Вперед	Forward	קדימה	\N	\N
2328	1	1	form_wrong_abc	\N	Используйте русскую раскладку клавиатуры	Use Russian keyboard layout	להשתמש בתווים עבריים	\N	\N
2329	1	104	try	\N	Попробуйте	Try it	נסה זאת	\N	\N
2330	1	104	another_way	\N	другой способ	another way	דרך נוספת	\N	\N
2331	1	104	fixed	\N	Получилось решить проблему?	Did you manage to solve the problem?	האם הצלחת לפתור את הבעיה?	\N	\N
2332	1	104	code_to_email	\N	Запросите код на e-mail.	Request the code by e-mail.	בקש את הקוד בדואר אלקטרוני.	\N	\N
2335	1	104	was_send_email	\N	отправлено сообщение с кодом	sent message with code	נשלחה הודעה עם קוד	\N	\N
2336	1	104	change_action_email	\N	Изменить адрес почты	Change email address	שנה כתובת דואר אלקטרוני	\N	\N
2337	1	104	press_code_email	\N	Если вы не получили сообщение с кодом в течении 20 секунд, повторите запрос	If you have not received a message with a code within 20 seconds, please repeat your request.	אם לא קיבלת הודעה עם קוד תוך 20 שניות, חזור על בקשתך	\N	\N
2338	1	104	no_code	\N	Если вам не удаётся получить код, обратитесь в службу	If you are unable to get the code, please contact the service.	אם אינך מצליח להשיג את הקוד, אנא צור קשר עם השירות.	\N	\N
2339	1	104	support	\N	технической поддержки	technical support	תמיכה טכנית	\N	\N
2340	1	120	date	\N	Дата	date	תאריך	\N	\N
2341	1	120	place	\N	Место	A place	מקום	\N	\N
2342	1	103	service_type	\N	Вид услуги	Type of service	סוג שירות	\N	\N
2343	1	103	payment_sum	\N	Сумма оплаты	Payment amount	סכום לתשלום	\N	\N
2344	1	103	add_card_text	\N	Для добавления карты заполните данные своей карты	To add a card, fill in your card details	כדי להוסיף כרטיס, מלא את פרטי הכרטיס שלך	\N	\N
2345	1	103	card_bank	\N	Universal Bank	Universal bank	בנק אוניברסלי	\N	\N
2346	1	103	selectCard	\N	Выбрать другую карту	Choose another card	בחר כרטיס אחר	\N	\N
2347	1	108	notify_cancel_text	\N	Ваша заявка отменена	Your application has been canceled	בקשתך בוטלה	\N	\N
2348	1	59	not_economy_error	\N	По введенным вами параметрам вы не получите материальную экономию для услуги рефинансирования в данном банке.	According to the parameters you entered, you will not receive material savings for the refinancing service in this bank.	על פי הפרמטרים שהזנת, לא תקבל חיסכון מהותי עבור שירות המיחזור בבנק זה.	\N	\N
2349	1	125	s1p2_date	\N	Например 11 / 2020	For example 11/2020	לדוגמה 2020 / 11	\N	\N
2350	1	125	s1p2_text	\N	Когда вам понадобятся ипотечные деньги?	When do you need mortgage money?	מתי תצטרכו את כספי המשכנתא ?	\N	\N
2351	1	102	form_wrong_abc_eng	\N	Используйте английскую раскладку клавиатуры	Use an English keyboard layout	השתמש בפריסת מקלדת אנגלית	\N	\N
2352	1	106	export_date	\N	Дата платежа	payment date	תאריך תשלום	\N	\N
2353	1	106	export_payment	\N	Сумма платежа, ₪	Payment amount, ₪	סכום תשלום, ₪	\N	\N
2354	1	177	lawyer_tenders	\N	Тендеры для адвокатов	Tenders for lawyers	מכרזים לעורכי דין	\N	\N
2355	1	177	anket	5	Заполнить анкету	Fill out the form	למלא את הטופס	\N	\N
2356	1	180	l_terms	1	Условия юридического сотрудничества	Terms of legal cooperation	יטפשמ הלועפ ףותיש יאנת	\N	\N
2357	1	180	l_how_it_works	2	Как это работает?	How it works?	?דבוע הז ךיא	\N	\N
2358	1	178	l_anket	1	АНКЕТА ДЛЯ ЮРИСТОВ И АДВОКАТОВ	QUESTIONNAIRE FOR LAWYERS AND ATTORNEYS	ןיד יכרועו ןיד יכרוע ינולאש	\N	\N
2359	1	178	l_name	2	ФИО контактного лица	Full name of the contact person	רשקה שיא לש אלמ םש	\N	\N
2360	1	178	l_phone	3	Телефон	Telephone	ןֹופֵלֵט	\N	\N
2361	1	178	l_email	4	E-mail	Email	E-mail	\N	\N
2362	1	178	l_city	5	Город проживания	City of residence	םירוגמ ריע	\N	\N
2363	1	178	l_inn	6	ИНН	INN	םיסמה םלשמ רפסמ	\N	\N
2364	1	178	l_name2	7	Наименование Юр. лица	Name Yur. faces	םינפ .רוי םש	\N	\N
2365	1	178	l_list_1_1	8	ИП	SP	םזי	\N	\N
2366	1	178	l_list_1_2	9	Компания	Company	חֶברָה	\N	\N
2367	1	178	l_list_1_3	10	Партнерство	Partnership	שׁוּתָפוּת	\N	\N
2368	1	178	l_city2	11	Город открытия филиала	Branch opening city	םיפינס תחיתפ ריע	\N	\N
2369	1	178	l_source	12	Источник дохода	Source of income	הסנכה רוקמ	\N	\N
2370	1	178	l_list_2_1	13	Наемный работник	Salaried worker	ריכש דבוע	\N	\N
2371	1	178	l_list_2_2	14	ИП	SP	יזם יחיד	\N	\N
2372	1	178	l_list_2_3	15	Руководитель подразделения	Department manager	מנהל מחלקה	\N	\N
2373	1	178	l_list_2_4	16	Директор	Director	מְנַהֵל	\N	\N
2374	1	178	l_list_2_5	17	Собственник компании	Company owner	בעלי החברה	\N	\N
2375	1	178	l_source2	18	Средний доход	Average income	תעצוממ הסנכה	\N	\N
2376	1	178	l_years	19	Сколько лет на рынке	How many years on the market	קושב םינש המכ	\N	\N
2377	1	178	l_clients	20	Сколько в среднем клиентов с месяц	Average number of clients per month	שדוחב עצוממ תוחוקל רפסמ	\N	\N
2378	1	178	l_clients2	21	Сколько клиентов было по ипотеке за последний год	How many mortgage clients were there in the last year	הנורחאה הנשב ויה אתנכשמ תוחוקל המכ	\N	\N
2379	1	178	l_clients3	22	Сколько клиентов было по рефинансированию ипотеки за последний год?	How many clients have there been to refinance mortgages in the last year?	אתנכשמ רוזחימ ורבע תוחוקל המכ ?הנורחאה הנשב	\N	\N
2380	1	178	l_sourse3	23	Ваш средний заработок за последние 3 года	Your average earnings over the past 3 years	תונורחאה םינשה שולשב ךלש עצוממה חוורה	\N	\N
2381	1	178	l_jud	24	Были ли суды с клиентами?	Were there any courts with clients?	?תוחוקל םע טפשמ יתב ויה םאה	\N	\N
2382	1	178	l_jud2	25	Были ли суды по долговым обязательствам?	Were there debt courts?	?תובוחל טפשמ יתב ויה םאה	\N	\N
2383	1	178	l_yes	26	Да	Yes	ןכ	\N	\N
2384	1	178	l_no	27	Нет	No	אל	\N	\N
2385	1	178	l_else	28	Что вы ещё хотите нам сказать?	What else do you want to tell us?	?ונל רפסל הצור התא דוע המ	\N	\N
2386	1	178	l_send	29	Отправить	send	ַחֹולְׁשִל	\N	\N
2387	1	178	l_requeired	30	Заполните поле	Fill in the field	מלא את השדה	\N	\N
2388	1	177	lawyers_subtitle	2	Приведем клиентов для юристов и адвокатов	We will bring clients for lawyers and attorneys	תוחוקל איבנ ןיד יכרועו ןיד יכרועל	\N	\N
2389	1	177	lawyers_title	1	Адвокатам	Lawyers	ןיד יכרוע	\N	\N
2390	1	181	b_item_6	9	Мы перечисляем вам вознаграждение за привлечение клиентов	We transfer you a reward for attracting customers	סרפ ךל םיריבעמ ונא תוחוקל תכישמל	\N	\N
2391	1	181	b_item_5	8	Покупатель вносит деньги за услуги	The buyer pays money for the services	ףסכ דיקפמ הנוקה םיתוריש רובע	\N	\N
2392	1	181	b_item_4	7	Вы передаете нам клиентов, мы фиксируем их за вами на 3 месяца	You transfer clients to us, we fix them for you for 3 months	ונלש גיצנה רשק םכמע רוציי	\N	\N
2393	1	181	b_item_3	6	Мы заключим агентский договор  на привлечение клиентов	We will conclude an agency agreement to attract clients	תויונכוס םכסה םכסנ תוחוקל ךושמל ידכ	\N	\N
2394	1	181	b_item_2	5	Наш представитель  свяжется с вами	Our representative will contact you	ונלש גיצנה רשק םכמע רוציי	\N	\N
2395	1	181	b_item_1	4	Заполните анкету на нашем сайте	Fill out the form on our website	ספוטה תא אלמ ונלש רתאב	\N	\N
2396	1	181	brokers_subtitle_2	3	КАК ПРОИСХОДИТ СОТРУДНИЧЕСТВО?	HOW DOES THE COOPERATION HAPPEN?	?הלועפה ףותיש שחרתמ דציכ	\N	\N
2397	1	182	b_anket	1	АНКЕТА ДЛЯ БРОКЕРОВ	QUESTIONNAIRE FOR BROKERS	םיכוותמל ןולאש	\N	\N
2398	1	182	b_name	2	ФИО контактного лица	Full name of the contact person	רשקה שיא לש אלמ םש	\N	\N
2399	1	182	b_phone	3	Телефон	Telephone	ןֹופֵלֵט	\N	\N
2400	1	182	b_email	4	E-mail	Email	E-mail	\N	\N
2401	1	182	b_city	5	Город проживания	City of residence	םירוגמ ריע	\N	\N
2402	1	182	b_inn	6	ИНН	INN	םיסמה םלשמ רפסמ	\N	\N
2403	1	182	b_name2	7	Наименование Юр. лица	Name Yur. faces	םינפ .רוי םש	\N	\N
2404	1	182	b_list_1_1	8	ИП	SP	םזי	\N	\N
2405	1	182	b_list_1_2	9	Компания	Company	חֶברָה	\N	\N
2406	1	182	b_list_1_3	10	Партнерство	Partnership	שׁוּתָפוּת	\N	\N
2407	1	182	b_city2	11	Город открытия филиала	Branch opening city	םיפינס תחיתפ ריע	\N	\N
2408	1	182	b_source	12	Источник дохода	Source of income	הסנכה רוקמ	\N	\N
2409	1	182	b_list_2_1	13	Наемный работник	Salaried worker	ריכש דבוע	\N	\N
2410	1	182	b_list_2_2	14	ИП	SP	יזם יחיד	\N	\N
2411	1	182	b_list_2_3	15	Руководитель подразделения	Department manager	מנהל מחלקה	\N	\N
2412	1	182	b_list_2_4	16	Директор	Director	מְנַהֵל	\N	\N
2413	1	182	b_list_2_5	17	Собственник компании	Company owner	בעלי החברה	\N	\N
2414	1	182	b_source2	18	Средний доход	Average income	תעצוממ הסנכה	\N	\N
2415	1	182	b_years	19	Сколько лет на рынке	How many years on the market	קושב םינש המכ	\N	\N
2416	1	182	b_clients	20	Сколько в среднем клиентов с месяц	Average number of clients per month	שדוחב עצוממ תוחוקל רפסמ	\N	\N
2417	1	182	b_clients2	21	Сколько клиентов было по ипотеке за последний год	How many mortgage clients were there in the last year	הנורחאה הנשב ויה אתנכשמ תוחוקל המכ	\N	\N
2418	1	182	b_clients3	22	Сколько клиентов было по рефинансированию ипотеки за последний год?	How many clients have there been to refinance mortgages in the last year?	אתנכשמ רוזחימ ורבע תוחוקל המכ ?הנורחאה הנשב	\N	\N
2419	1	182	b_sourse3	23	Ваш средний заработок за последние 3 года	Your average earnings over the past 3 years	תונורחאה םינשה שולשב ךלש עצוממה חוורה	\N	\N
2420	1	182	b_jud	24	Были ли суды с клиентами?	Were there any courts with clients?	?תוחוקל םע טפשמ יתב ויה םאה	\N	\N
2421	1	182	b_jud2	25	Были ли суды по долговым обязательствам?	Were there debt courts?	?תובוחל טפשמ יתב ויה םאה	\N	\N
2422	1	182	b_yes	26	Да	Yes	ןכ	\N	\N
2423	1	182	b_no	27	Нет	No	אל	\N	\N
2424	1	182	b_else	28	Что вы ещё хотите нам сказать?	What else do you want to tell us?	?ונל רפסל הצור התא דוע המ	\N	\N
2425	1	182	b_send	29	Отправить	send	ַחֹולְׁשִל	\N	\N
2426	1	182	b_requeired	30	Заполните поле	Fill in the field	מלא את השדה	\N	\N
2427	1	184	b_how_it_works	1	Как это работает?	How it works?	?דבוע הז ךיא	\N	\N
2428	1	181	brokers_title	1	ПРИГЛАШАЕМ К СОТРУДНИЧЕСТВУ	WE INVITE TO COOPERATION	הלועפ ףותיש םינימזמ ונא	\N	\N
2429	1	181	brokers_subtitle	2	ПРОФЕССИОНАЛЬНЫХ КРЕДИТНЫХ БРОКЕРОВ	PROFESSIONAL CREDIT BROKERS	םייעוצקמ יארשא יררוב	\N	\N
2430	1	181	broker_tenders	\N	Тендеры для брокеров	Broker tenders	מכרזי תיווך	\N	\N
2431	1	181	br_anket	10	Заполнить анкету	Fill out the form	למלא את הטופס	\N	\N
2432	1	188	v_tooltip2	1	Продожить	Continue	לְהַמשִׁיך	\N	\N
2433	1	186	v_tooltip1	1	Продожить	Continue	לְהַמשִׁיך	\N	\N
2434	1	187	a_requeired	14	Заполните поле	Fill in the field	מלא את השדה	\N	\N
2435	1	187	a_send	13	Отправить	send	לִשְׁלוֹחַ	\N	\N
2436	1	187	a_cv_info	12	Добавьте  ссылку на работы и короткий рассказ о себе.	Add a link to work and a short story about yourself.	הוסף קישור לעבודה וסיפור קצר על עצמך.	\N	\N
2437	1	187	a_cv	11	Сопроводительное письмо и ссылки	Cover letter and links	מכתב מקדים וקישורים	\N	\N
2438	1	187	a_load	10	Загрузить документ	Upload document	העלה מסמך	\N	\N
2439	1	187	a_resume_info	9	резюме принимается в формате PDF или Doc	CV is accepted in PDF or Doc format	קורות חיים מתקבלים בפורמט PDF או דוק	\N	\N
2440	1	187	a_resume	8	Загрузите своё резюме	Upload your resume	תעלה את קורות החיים שלך	\N	\N
2441	1	187	a_city	7	Город проживания	City of residence	עיר מגורים	\N	\N
2442	1	187	a_email	6	E-mail	Email	אימייל	\N	\N
2443	1	187	a_phone	5	Телефон	Telephone	טֵלֵפוֹן	\N	\N
2444	1	187	a_salary	4	Зарплатные ожидания	Salary expectations	ציפיות שכר	\N	\N
2445	1	187	a_post	3	Желаемая должность	Career objective	מטרת קריירה	\N	\N
2446	1	187	a_name	2	ФИО контактного лица	Full name of the contact person	שם מלא של איש הקשר	\N	\N
2447	1	187	a_title	1	Данные соискателя	Applicant data	נתוני המבקש	\N	\N
2448	1	185	v_button	13	Откликнуться	Respond	לְהָגִיב	\N	\N
2449	1	185	v_salary	12	Зарплата	The salary	המשכורת	\N	\N
2450	1	185	v_city2	11	Город	Town	העיר	\N	\N
2451	1	185	v_date	10	Дата публикации	Date of publication	תאריך הפרסום	\N	\N
2452	1	185	v_post	9	Должность	Position	עמדה	\N	\N
2453	1	185	v_hot	8	Горящих вакансий:	Last minute vacancies:	משרות פנויות ברגע האחרון:	\N	\N
2454	1	185	v_found	7	Найдено вакансий:	Found vacancies:	נמצאו משרות פנויות:	\N	\N
2455	1	185	v_not_found	6	Вакансии не найдены	No vacancies found	לא נמצאו משרות פנויות	\N	\N
2456	1	185	v_positions	5	Все должности	All positions	כל העמדות	\N	\N
2457	1	185	v_position	4	Желаемая должность	Career objective	מטרת קריירה	\N	\N
2458	1	185	v_cities	3	Все города	all cities	כל הערים	\N	\N
2459	1	185	v_city	2	Город	Town	העיר	\N	\N
2460	1	185	v_title	1	Вакансии	Vacancies	משרות פנויות	\N	\N
2461	1	185	v_from	14	от	from	מ	\N	\N
2462	1	1	index_text_2	2	ипотек	mortgages	אתנכשמ	\N	\N
2463	1	190	c_success_text	1	Спасибо за Ваш отклик. Ожидайте, наши сотрудники свяжутся с Вами в ближайшее время	Thanks for your feedback. Expect our staff will contact you shortly	תודה על המשוב שלך. צפו שהצוות שלנו ייצור איתך קשר בהקדם	\N	\N
2464	1	189	cooperation	1	Сотрудничество	Cooperation	שיתוף פעולה	\N	\N
2465	1	189	c_subtitle_1	2	Анкета для сотрудничества	Form for cooperation	טופס לשיתוף פעולה	\N	\N
2466	1	189	c_text	3	Для того, чтобы начать работать с нашей компанией, заполните анкету. После отправки анкеты нам, с Вами свяжется менеджер по работе с новыми партнёрами.	To start working with our company, fill out the form. After sending the questionnaire to us, the manager for work with new partners will contact you.	כדי להתחיל לעבוד עם החברה שלנו, מלא את הטופס. לאחר שליחת השאלון אלינו, מנהל העבודה עם שותפים חדשים ייצור עמכם קשר.	\N	\N
2467	1	189	c_subtitle_2	4	Реквизиты юридического лица	Legal entity details	פרטי ישות משפטית	\N	\N
2468	1	189	c_subtitle_3	5	Контактные данные	Contact details	פרטי יצירת קשר	\N	\N
2469	1	189	c_subtitle_4	6	Дополнительная информация	Additional Information	מידע נוסף	\N	\N
2470	1	189	c_company	7	Наименование компании	Company name	שם החברה	\N	\N
2471	1	189	c_company_full	8	Полное название	Full company name	כותרת מלאה	\N	\N
2472	1	189	c_inn	9	ИНН	INN	אכסניה	\N	\N
2473	1	189	c_city	10	Город	City	העיר	\N	\N
2474	1	189	c_address	11	Адрес	Address	הכתובת	\N	\N
2475	1	189	c_name	12	ФИО контактного лица	Full name of the contact person	שם מלא של איש הקשר	\N	\N
2476	1	189	c_post	13	Должность в компании	Position in the company	תפקיד בחברה	\N	\N
2477	1	189	c_phone	14	Телефон	Phone	טֵלֵפוֹן	\N	\N
2478	1	189	c_email	15	E-mail	E-mail	אימייל	\N	\N
2479	1	189	c_link	16	Сайт компании	The site of the company	אתר החברה	\N	\N
2480	1	189	c_text_1	17	Основной вид деятельности	Main activity	פעילות עיקרית	\N	\N
2481	1	189	c_years	18	Сколько лет компания на рынке	How many years has the company been on the market	כמה שנים החברה נמצאת בשוק	\N	\N
2482	1	189	c_text_2	19	Что вы хотите нам предложить?	What do you want to offer us?	מה אתה רוצה להציע לנו?	\N	\N
2483	1	189	c_required	20	Заполните поле	Fill in the field	מלא את השדה	\N	\N
2484	1	189	c_send	21	Отправить	Send	לִשְׁלוֹחַ	\N	\N
2485	1	191	login_text_1	2	Для входа неавторизованных пользователей необходимо выбрать	To log in unauthorized users, you must select	כדי להיכנס למשתמשים לא מורשים, עליך לבחור	\N	\N
2486	1	191	login_text_2	3	услугу	service	שֵׁרוּת	\N	\N
2487	1	193	services_title	1	Выберете интересующую вас услугу	Choose the service you are interested in	בחר את השירות שאתה מעוניין בו	\N	\N
2488	1	1	form_wrong_date	\N	Некорректная дата	Incorrect date	תאריך שגוי	\N	\N
2489	1	120	nearest_branch	12	Ближайший филиал определен по вашему адресу	The nearest branch is determined by your address	הסניף הקרוב נקבע לפי כתובתך	\N	\N
\.


--
-- Data for Name: mortgage_calculation_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mortgage_calculation_cache (id, session_id, calculation_input, calculation_result, interest_rate_used, calculated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: params; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.params (id, key, value, name_ru, name_en, name_he, created_at, updated_at) FROM stdin;
25	version	0.0.1	\N	\N	\N	2025-06-08 22:25:05.382616	2025-06-08 22:25:05.382616
26	name	Bankimonline	\N	\N	\N	2025-06-08 22:25:05.466389	2025-06-08 22:25:05.466389
27	ltd	השוואת משכנתא בע״מ	\N	\N	\N	2025-06-08 22:25:05.550611	2025-06-08 22:25:05.550611
28	phone	03-954522	\N	\N	\N	2025-06-08 22:25:05.636366	2025-06-08 22:25:05.636366
29	time_1	08:00 - 19:00	\N	\N	\N	2025-06-08 22:25:05.720445	2025-06-08 22:25:05.720445
30	time_2	08:00 - 13:00	\N	\N	\N	2025-06-08 22:25:05.804353	2025-06-08 22:25:05.804353
31	how_it_works	https://www.youtube.com/	\N	\N	\N	2025-06-08 22:25:05.887559	2025-06-08 22:25:05.887559
32	digitize	https://www.google.com/	\N	\N	\N	2025-06-08 22:25:05.972777	2025-06-08 22:25:05.972777
33	twitter	https://twitter.com/	\N	\N	\N	2025-06-08 22:25:06.057644	2025-06-08 22:25:06.057644
34	facebook	https://fb.com	\N	\N	\N	2025-06-08 22:25:06.14335	2025-06-08 22:25:06.14335
35	instagram	https://instagram.com	\N	\N	\N	2025-06-08 22:25:06.227365	2025-06-08 22:25:06.227365
36	youtube	https://youtube.com	\N	\N	\N	2025-06-08 22:25:06.313608	2025-06-08 22:25:06.313608
\.


--
-- Data for Name: professions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professions (id, key, name_en, name_he, name_ru, category, is_active, created_at, updated_at) FROM stdin;
1	lawyer	Lawyer	עורך דין	Адвокат	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
2	legal_advisor	Legal Advisor	יועץ משפטי	Юрисконсульт	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
3	notary	Notary	נוטריון	Нотариус	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
4	paralegal	Paralegal	עוזר משפטי	Помощник юриста	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
5	legal_consultant	Legal Consultant	יועץ משפטי עצמאי	Консультант-юрист	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
6	corporate_lawyer	Corporate Lawyer	עורך דין תאגידי	Корпоративный юрист	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
7	real_estate_lawyer	Real Estate Lawyer	עורך דין נדל"ן	Юрист по недвижимости	legal	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
8	tax_advisor	Tax Advisor	יועץ מס	Налоговый консультант	finance	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
9	accountant	Accountant	רואה חשבון	Бухгалтер	finance	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
10	financial_advisor	Financial Advisor	יועץ פיננסי	Финансовый консультант	finance	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
11	business_consultant	Business Consultant	יועץ עסקי	Бизнес-консультант	business	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
12	engineer	Engineer	מהנדס	Инженер	technical	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
13	architect	Architect	אדריכל	Архитектор	technical	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
14	doctor	Doctor	רופא	Врач	medical	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
15	teacher	Teacher	מורה	Учитель	education	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
16	manager	Manager	מנהל	Менеджер	management	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
17	entrepreneur	Entrepreneur	יזם	Предприниматель	business	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
18	freelancer	Freelancer	עצמאי	Фрилансер	general	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
19	retired	Retired	פנסיונר	Пенсионер	general	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
20	student	Student	סטודנט	Студент	education	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
21	other	Other	אחר	Другое	general	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.properties (id, client_id, property_address, property_type, property_age, property_condition, property_size_sqm, purchase_price, current_market_value, appraisal_value, appraisal_date, property_insurance, insurance_value, ownership_percentage, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_ownership_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_ownership_options (id, option_key, option_text_ru, option_text_en, option_text_he, ltv_percentage, financing_percentage, is_active, display_order, created_at) FROM stdin;
1	no_property	Нет, я пока не владею недвижимостью	No, I do not currently own property	לא, אני לא בעלים של נכס כרגע	75.00	75.00	t	1	2025-07-15 21:30:37.073355
2	has_property	Да, у меня уже есть недвижимость	Yes, I already own property	כן, כבר יש לי נכס	50.00	50.00	t	2	2025-07-15 21:30:37.073355
3	selling_property	Я собираюсь продать единственную недвижимость в ближайшие два года, чтобы использовать полученный капитал для приобретения новой	I plan to sell my only property within two years to use the capital for a new purchase	אני מתכנן למכור את הנכס היחיד שלי בתוך שנתיים כדי להשתמש בהון לרכישה חדשה	70.00	70.00	t	3	2025-07-15 21:30:37.073355
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regions (id, key, name_en, name_he, name_ru, is_active, created_at, updated_at) FROM stdin;
1	center	Center District	מחוז המרכז	Центральный округ	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
2	tel_aviv	Tel Aviv District	מחוז תל אביב	Округ Тель-Авив	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
3	jerusalem	Jerusalem District	מחוז ירושלים	Иерусалимский округ	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
4	north	Northern District	מחוז הצפון	Северный округ	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
5	haifa	Haifa District	מחוז חיפה	Округ Хайфа	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
6	south	Southern District	מחוז הדרום	Южный округ	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
7	judea_samaria	Judea and Samaria	יהודה ושומרון	Иудея и Самария	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
8	nationwide	Nationwide Coverage	כלל ארצי	По всей стране	t	2025-07-07 23:56:22.88257	2025-07-07 23:56:22.88257
\.


--
-- Data for Name: registration_form_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registration_form_config (id, language, field_name, field_value, is_active, created_at, updated_at) FROM stdin;
1	en	title	Registration	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
2	en	subtitle	Register and receive clients	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
3	en	step1_title	Basic Information	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
4	en	step2_title	Service Selection	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
5	en	label_name	Full Name	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
6	en	label_position	Position	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
7	en	label_email	Corporate Email	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
8	en	label_bank	Bank	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
9	en	label_branch	Bank Branch	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
10	en	label_bank_number	Bank Number	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
11	en	button_continue	Continue	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
12	en	link_login	Already have an account? Sign in	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
13	en	terms_text	I agree to the platform terms	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
14	en	terms_link	platform terms	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
15	he	title	הרשמה	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
16	he	subtitle	הירשמו וקבלו לקוחות	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
17	he	step1_title	מידע בסיסי	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
18	he	step2_title	בחירת שירות	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
19	he	label_name	שם מלא	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
20	he	label_position	תפקיד	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
21	he	label_email	דוא"ל תאגידי	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
22	he	label_bank	בנק	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
23	he	label_branch	סניף בנק	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
24	he	label_bank_number	מספר בנק	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
25	he	button_continue	המשך	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
26	he	link_login	כבר יש לך חשבון? התחבר	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
27	he	terms_text	אני מסכים לתנאי הפלטפורמה	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
28	he	terms_link	תנאי הפלטפורמה	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
29	ru	title	Регистрация	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
30	ru	subtitle	Зарегистрируйтесь и получайте клиентов	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
31	ru	step1_title	Основная информация	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
32	ru	step2_title	Выбор услуги	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
33	ru	label_name	Имя Фамилия	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
34	ru	label_position	Должность	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
35	ru	label_email	Корпоративный email	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
36	ru	label_bank	Банк	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
37	ru	label_branch	Филиал банка	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
38	ru	label_bank_number	Номер банка	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
39	ru	button_continue	Продолжить	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
40	ru	link_login	Уже есть аккаунт? Войти	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
41	ru	terms_text	Я согласен с правилами платформы	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
42	ru	terms_link	правилами платформы	t	2025-07-09 15:03:17.263599	2025-07-09 15:03:17.263599
\.


--
-- Data for Name: registration_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registration_invitations (id, email, bank_id, branch_id, invited_by, invitation_token, expires_at, status, registration_completed_at, employee_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: registration_validation_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registration_validation_rules (id, country_code, language_code, field_name, validation_type, validation_pattern, error_message_key, is_active, priority, created_at, updated_at) FROM stdin;
1	IL	he	full_name	regex	^[\\u0590-\\u05FFa-zA-Z\\s\\-\\.]{2,100}$	validation.name.hebrew_latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
2	IL	he	position	regex	^[\\u0590-\\u05FFa-zA-Z\\s\\-\\.]{2,100}$	validation.position.hebrew_latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
3	IL	en	full_name	regex	^[a-zA-Z\\s\\-\\.]{2,100}$	validation.name.latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
4	IL	en	position	regex	^[a-zA-Z\\s\\-\\.]{2,100}$	validation.position.latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
5	IL	he	corporate_email	regex	^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$	validation.email.invalid	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
6	IL	en	corporate_email	regex	^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$	validation.email.invalid	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
7	IL	he	bank_number	regex	^[0-9]{3}$	validation.bank_number.three_digits	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
8	IL	en	bank_number	regex	^[0-9]{3}$	validation.bank_number.three_digits	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
9	RU	ru	full_name	regex	^[\\u0400-\\u04FFa-zA-Z\\s\\-\\.]{2,100}$	validation.name.cyrillic_latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
10	RU	ru	position	regex	^[\\u0400-\\u04FFa-zA-Z\\s\\-\\.]{2,100}$	validation.position.cyrillic_latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
11	RU	en	full_name	regex	^[a-zA-Z\\s\\-\\.]{2,100}$	validation.name.latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
12	RU	en	position	regex	^[a-zA-Z\\s\\-\\.]{2,100}$	validation.position.latin_only	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
13	RU	ru	corporate_email	regex	^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$	validation.email.invalid	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
14	RU	en	corporate_email	regex	^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$	validation.email.invalid	t	1	2025-07-09 15:03:31.985772	2025-07-09 15:03:31.985772
\.


--
-- Data for Name: risk_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risk_parameters (id, bank_id, parameter_type, parameter_value, condition_type, condition_min, condition_max, description, is_active, created_by, created_at, updated_at) FROM stdin;
1	75	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
2	76	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
3	77	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
4	78	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
5	79	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
6	80	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
7	81	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
8	82	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
9	83	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
10	84	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
11	85	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
12	86	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
13	87	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
14	88	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
15	89	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
16	90	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
17	91	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
18	92	ltv_limit	80.00	default	0.00	100.00	Standard LTV limit for mortgages	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
19	75	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
20	76	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
21	77	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
22	78	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
23	79	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
24	80	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
25	81	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
26	82	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
27	83	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
28	84	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
29	85	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
30	86	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
31	87	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
32	88	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
33	89	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
34	90	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
35	91	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
36	92	dti_limit	42.00	default	0.00	100.00	Standard DTI limit	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
37	75	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
38	76	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
39	77	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
40	78	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
41	79	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
42	80	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
43	81	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
44	82	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
45	83	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
46	84	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
47	85	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
48	86	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
49	87	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
50	88	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
51	89	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
52	90	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
53	91	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
54	92	min_income	8000.00	default	0.00	1000000.00	Minimum monthly income requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
55	75	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
56	76	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
57	77	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
58	78	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
59	79	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
60	80	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
61	81	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
62	82	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
63	83	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
64	84	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
65	85	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
66	86	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
67	87	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
68	88	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
69	89	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
70	90	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
71	91	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
72	92	employment_years	2.00	default	0.00	50.00	Minimum employment years requirement	t	\N	2025-06-14 19:31:39.642894	2025-06-14 19:31:39.642894
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, service_key, name_en, name_ru, name_he, description_en, description_ru, description_he, is_active, display_order, created_at, updated_at) FROM stdin;
1	mortgage_refinancing	Mortgage & Mortgage Refinancing	Ипотека & Рефинансирование Ипотека	משכנתא ומחזור משכנתא	Complete mortgage services including new mortgages and refinancing options	Полный спектр ипотечных услуг, включая новые ипотеки и рефинансирование	שירותי משכנתא מלאים כולל משכנתאות חדשות ואפשרויות מחזור	t	1	2025-07-10 07:26:45.46883	2025-07-10 07:26:45.46883
2	credit_refinancing	Credit & Credit Refinancing	Кредит & Рефинансирование Кредита	אשראי ומחזור אשראי	Personal and business credit services including loan refinancing	Персональные и бизнес кредитные услуги, включая рефинансирование займов	שירותי אשראי אישיים ועסקיים כולל מחזור הלואות	t	2	2025-07-10 07:26:45.46883	2025-07-10 07:26:45.46883
3	business_banking	Business Banking Services	Банковские услуги для бизнеса	שירותי בנקאות עסקית	Comprehensive banking solutions for businesses and corporations	Комплексные банковские решения для бизнеса и корпораций	פתרונות בנקאיים מקיפים לעסקים ותאגידים	t	3	2025-07-10 07:26:45.46883	2025-07-10 07:26:45.46883
4	investment_services	Investment & Wealth Management	Инвестиции и управление капиталом	השקעות וניהול הון	Professional investment advisory and wealth management services	Профессиональные инвестиционные консультации и услуги управления капиталом	ייעוץ השקעות מקצועי ושירותי ניהול הון	t	4	2025-07-10 07:26:45.46883	2025-07-10 07:26:45.46883
5	insurance_services	Insurance & Protection	Страхование и защита	ביטוח והגנה	Comprehensive insurance products and financial protection services	Комплексные страховые продукты и услуги финансовой защиты	מוצרי ביטוח מקיפים ושירותי הגנה פיננסית	t	5	2025-07-10 07:26:45.46883	2025-07-10 07:26:45.46883
\.


--
-- Data for Name: test1; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test1 (id, name, created_at) FROM stdin;
1	Test Record	2025-07-13 21:15:23.949108
\.


--
-- Data for Name: test_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_users (id, name, email, role, status, created_at, updated_at) FROM stdin;
1	John Doe	john@bankim.com	admin	active	2025-07-29 06:03:29.347425	2025-07-29 06:03:29.347425
2	Jane Smith	jane@bankim.com	manager	active	2025-07-29 06:03:29.47182	2025-07-29 06:03:29.47182
3	Bob Johnson	bob@bankim.com	user	inactive	2025-07-29 06:03:29.608808	2025-07-29 06:03:29.608808
4	Alice Brown	alice@bankim.com	user	active	2025-07-29 06:03:29.747748	2025-07-29 06:03:29.747748
5	Charlie Wilson	charlie@bankim.com	manager	pending	2025-07-29 06:03:29.886885	2025-07-29 06:03:29.886885
\.


--
-- Data for Name: tttt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tttt (id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, photo, created_at, updated_at) FROM stdin;
201	Victor Nemenenok	hagana941977@gmail.com	$2y$10$q1E5Ku4Vq5XeRJC6r09Omu1rssqaIGKm3qJ8sqQWMRasSAb0UKO/y	admin	\N	2025-06-08 22:25:06.483754	2025-06-08 22:25:06.483754
202	admin	ceo@bankimonline.com	$2y$10$5ISfx/BsNY8ZByzVi7J2aeeUuIEs.IHNTAEEU2tqll2SErKLAoUqa	admin	/photo/2/98311c02-0e99-45af-a6d7-5cc3e8b67c07.jpg	2025-06-08 22:25:06.570374	2025-06-08 22:25:06.570374
203	Irina Malysheva	irina.malysheva@eitanmortgage.com	$2y$10$m4c6UbEcjNkdx7JoKe5D5ubFfpB77oD5WMqztS7aUXO/vMwQGblG6	user	\N	2025-06-08 22:25:06.654357	2025-06-08 22:25:06.654357
204	Production Test User	test@test.ru	$2y$10$mlSv4W20WIWuV9TKLwwnj.QnX6M.sLE.l/Th1t3uNodo4OEUJmbmS	user	/photo/11/94570eae-ec6c-46cd-8cdd-448b184085cb.jpg	2025-06-08 22:25:06.741764	2025-06-08 22:25:06.741764
205	sgusg	dfgdf@sdf.dsd	$2y$10$quhdnCqFT6CpVWLAYvPozuFuswUAJuJHeW8PL95ykJzxkHRRLdjbG	user	\N	2025-06-08 22:25:06.825511	2025-06-08 22:25:06.825511
206	Test 1	test@t.re	$2y$10$g7wXLc5PdyqHHUO0srK6zONpNFpTTUZ7/tJDsRTFKkqil3MVCQ8ky	user	/photo/13/933ffc0e-e6f0-4604-baa4-f82199107538.jpg	2025-06-08 22:25:06.910366	2025-06-08 22:25:06.910366
207	test	test@test.ru1	$2y$10$CUkoGzKv3af5yZmcDNXOLuv6XTEl8EPqv9FW63cvqcEYgMA1MQ8FS	user	/photo/14/934ba8d4-95db-47ab-88dd-e09a8ff9c01e.jpg	2025-06-08 22:25:06.994401	2025-06-08 22:25:06.994401
208	na	na@gmail.com	$2y$10$7cwRRHLCpv3XJJKaQqooH.2z54WHQN20CjQp6jFQeTHTAaQplDviC	user	\N	2025-06-08 22:25:07.07875	2025-06-08 22:25:07.07875
209	אייזיק אוסיפוב	hagana1977@gmail.com	$2y$10$5wNyM7Y5tihEGLpvGdheOOnN9QhJoYijhjwVT9Fv897Cdyx3Z42K6	user	\N	2025-06-08 22:25:07.162444	2025-06-08 22:25:07.162444
210	1233	hhvg@ggh.jh	$2y$10$zogfUcz6v5/axGPs8IdxeeTEZLn8IzPNrXtMHdLa4GonUxPmYWOWq	user	\N	2025-06-08 22:25:07.248673	2025-06-08 22:25:07.248673
211	מני כץ	karivc@walla.co.il	$2y$10$AE6ca0TPd5AKVp88STDmZub/jgV0IyNBmFixKlf/Er9NUmHnyDzuC	user	\N	2025-06-08 22:25:07.333481	2025-06-08 22:25:07.333481
212	ספיר	sapir@danielaw.co.il	$2y$10$y.grD40hOct6M4991IU8duYUpS4dRT2LBlBbxkV6.hwSleZKbSS4W	user	\N	2025-06-08 22:25:07.41653	2025-06-08 22:25:07.41653
213	вапрвы	hnfgsndgsevd@gmail.com	$2y$10$PZIxdd7hyVYC9WHQenNXZO92IL6yzjYZOvtKJGZCwgqR5HmYO.tfq	user	\N	2025-06-08 22:25:07.501601	2025-06-08 22:25:07.501601
214	נטלי מגיס בןחיון	nataliemagis10@gmail.com	$2y$10$5XnZTwcU0Q9gekKPZnDwm.1ylCMVPQJWN1QgcHyc.4I/LQ9wv1zcu	user	\N	2025-06-08 22:25:07.587677	2025-06-08 22:25:07.587677
215	ооооо	adasd@ds.uu	$2y$10$23lyLVPKBOIEqgt5y5tE8.MDhxEc6X0TL8jhorKY/DvPWiY.odD86	user	\N	2025-06-08 22:25:07.670446	2025-06-08 22:25:07.670446
216	test@test.ru	test@gmail.com	$2y$10$tGbM9ha5slvSuLoJxkv4LeYa7mQZCbD44OdolfH3sim49gUmpsHAe	user	\N	2025-06-08 22:25:07.758221	2025-06-08 22:25:07.758221
217	рпарварв	cwd538@yandex.ru	$2y$10$6iadAg9u/cXL3ckUHQoSP.rPyby7/5fzVBDUsn4vZiBG1ziG7WlIG	user	\N	2025-06-08 22:25:07.84163	2025-06-08 22:25:07.84163
218	Аладова Екатерина	dasha19052016@gmail.com	$2y$10$SeX3FrREOZWPaHuAc13xYurjTZR4xuE1h.JV3uiCe1PWDz.p.ogVC	user	\N	2025-06-08 22:25:07.927365	2025-06-08 22:25:07.927365
219	Екатерина Аладова	eva.83.0516@gmail.com	$2y$10$79Bbx0zUyzK9Vghcl7c0NumkjZtVnzNKQZM2IdsB1j8/q/VrA.v.y	user	\N	2025-06-08 22:25:08.012632	2025-06-08 22:25:08.012632
220	ывпаыа	ksv538@yandex.ru	$2y$10$FpUtrm/CZXxfS/Hz8qKm8OLs0NlwOX5oSKsToZS0JtipTHZAx6Ezi	user	\N	2025-06-08 22:25:08.097376	2025-06-08 22:25:08.097376
221	Екатерина Аладова	natashap55@mail.ru	$2y$10$c4.fKPsnIyjaJZE7BN3PpOEOzyb0PwXxxwUbdbVOIBoVcSQ4tN50m	user	\N	2025-06-08 22:25:08.185461	2025-06-08 22:25:08.185461
222	Аладова Екатерина	dasha@gmail.com	$2y$10$ZqysDiuauHJI8.VO9c3gUOZbjMpn7hGLRTVF0w8Xn2GvQvL1j89Zy	user	\N	2025-06-08 22:25:08.26944	2025-06-08 22:25:08.26944
223	Екатерина Аладова	alex_hagadol@rambler.ru	$2y$10$sutrVOPW3zNQ/4whtYfwYuYX09m7m8.yzngpeX2fg/NMH0Vh8z7YG	user	\N	2025-06-08 22:25:08.354389	2025-06-08 22:25:08.354389
224	парарар	fghfh@yandex.ru	$2y$10$Apgd8x8q7.wt1GX2J7as8Ou0NAR2g.izILiRlBNlUf2oSf73iU.xS	user	\N	2025-06-08 22:25:08.438713	2025-06-08 22:25:08.438713
225	дап ашрпм	eva@gmail.com	$2y$10$Ly5pAyHUlLzGGXc35Xy4ruehwUEPSZHNriRsAPVxHbx43NzEKRtmq	user	\N	2025-06-08 22:25:08.523448	2025-06-08 22:25:08.523448
226	fdg	jhgkhgk@gmail.com	$2y$10$0QYNbxtd.06wO4UmhmgWguKNhO5JNhqn6oVtfMR5kL18twEGNdT2i	user	\N	2025-06-08 22:25:08.608683	2025-06-08 22:25:08.608683
227	fdg	fhf@gmail.com	$2y$10$Eo9dHTsxD/aqlnhL/miRHe.um5.nSaj8j2QQru67SVoMMvvXeeU6i	user	\N	2025-06-08 22:25:08.691334	2025-06-08 22:25:08.691334
228	цкцкцк	gdfhdhd@yandex.ru	$2y$10$vgALxNtFqstR7RtiE.7ubuDexgqMmDHyk6zeH/9QE7LFeEKUDdKJi	user	\N	2025-06-08 22:25:08.776418	2025-06-08 22:25:08.776418
229	апвв	dhgfjsg@gmail.com	$2y$10$E19V4ttDBME0g.pFpAKzgOabETUV/5SqpiXYsUfT.0l7CVyg88euC	user	\N	2025-06-08 22:25:08.86057	2025-06-08 22:25:08.86057
230	jllkjokjop	jkhkjh@gmail.com	$2y$10$savjKeRf8wNiu3j49SMTp.BS0osuq4yFmQCPorcAljE8j9NLvAI86	user	\N	2025-06-08 22:25:08.947454	2025-06-08 22:25:08.947454
231	аа	kjhds@gmail.com	$2y$10$fCjjXv4yR4p0/aYU2Bus.ec2GKiLAbCh9oDokW7ZS.4WaBpEyrmBK	user	\N	2025-06-08 22:25:09.036579	2025-06-08 22:25:09.036579
232	kjbkb	kgkj@gmail.com	$2y$10$ckMUPUt6G9rEj8SSWt.jt.aCvgBNDxaCWUgoWi6JA1QDSUO.6pP5a	user	\N	2025-06-08 22:25:09.123727	2025-06-08 22:25:09.123727
233	мвпа	khgh@gmail.com	$2y$10$GUSCOGwBale5VvJmVLyxbeNGlbIJkkEbttPsZJXpg7.xGFk1ZiCOW	user	\N	2025-06-08 22:25:09.208514	2025-06-08 22:25:09.208514
234	Ggyfugug	jhghv@gvg.gg	$2y$10$uXF5z4qd9teSAbLDt4H57.UhsKbkkGJCvNdDZSLq9orGzBfJe5Fly	user	\N	2025-06-08 22:25:09.293716	2025-06-08 22:25:09.293716
235	Yzus	gshsj@gmail.com	$2y$10$mw3HOOKgWqjJ7ixkjedj9uJAWUP6434qxgz1HaakcrgqA3JRpavvS	user	\N	2025-06-08 22:25:09.376717	2025-06-08 22:25:09.376717
236	Gehe7	gshd@gmail.com	$2y$10$WpyvMbj4X70WCb0X.NNdweCZc91Y0zaDTwJsVriioGW5oGCNNGdyC	user	\N	2025-06-08 22:25:09.45969	2025-06-08 22:25:09.45969
237	ыпыапы	Khgfhj@gmail.com	$2y$10$F/JKTbLbmIRHxwi.R6omDuB5r4tVqEZ3KBeFAvYPy7cZ7UKNDendC	user	\N	2025-06-08 22:25:09.54355	2025-06-08 22:25:09.54355
238	dfgdfg	jhgj@gmail.com	$2y$10$O8exjwQdKCWIqyDoI04DFOEoMssGQ/VGyZNhqkFuQd4ChDOLBbtSS	user	\N	2025-06-08 22:25:09.628504	2025-06-08 22:25:09.628504
239	папр	hghg@gmail.com	$2y$10$O5uHyetuxVO6ozVj7756IeevDOp5Xo.7nTg7GjSwL0FDM5HofXu2e	user	\N	2025-06-08 22:25:09.71359	2025-06-08 22:25:09.71359
240	Влада вдвда	hagana19@gmail.com	$2y$10$qZm2Cki1NMQrDVrnxeXCyOIwhP2oATpz8k8Fv.b/ob8CbOAizsBdK	user	\N	2025-06-08 22:25:09.797584	2025-06-08 22:25:09.797584
241	арврв	jhg@gmail.com	$2y$10$2xLWnCyS2wJ3U9/dXfZk5escvwV.bDm2lWu2N2jP9GpYg8X7NkQyO	user	\N	2025-06-08 22:25:09.88141	2025-06-08 22:25:09.88141
242	dfgd	khhkjh@gmail.com	$2y$10$6eICEc9F/qUr86o3khQlzuSCUzZH5QbNMWBtA7kn6jyo.EcMGmXj2	user	\N	2025-06-08 22:25:09.967753	2025-06-08 22:25:09.967753
243	jhghk	jhgh@gmal.com	$2y$10$DuOijq4H578hqaWwzKC6de1gT3turhLmnxC4lNZALGWd3o63hyTuO	user	\N	2025-06-08 22:25:10.056174	2025-06-08 22:25:10.056174
244	уе64	kmjdsf@gmail.com	$2y$10$OcQsZVwgqI9qRxbm49sRiOOIB6yGUWKcau91JUq7CniUf6cjJP8uy	user	\N	2025-06-08 22:25:10.141176	2025-06-08 22:25:10.141176
245	cdvgx	fdgf@gmail.com	$2y$10$8IOniHqlk745xC891sp6luX3cMJY4qe1SwOYnudmfzSOeF5AtO6Li	user	\N	2025-06-08 22:25:10.226433	2025-06-08 22:25:10.226433
246	Менеждер банка Дисконт	test@discountbank.co.il	$2y$10$vbodanACFSQbOWXCNckrUOUcqdYEbXr93mVVJ9OMXwWr5ct6vjy1e	bank	\N	2025-06-08 22:25:10.310379	2025-06-08 22:25:10.310379
247	Менеджер контента	test@contentmanager.com	$2y$10$xKRHBUEBV0asClMZ86mXEOmRiXII3tyTO0RFIYkLlauzRcG7t9rT2	manager	\N	2025-06-08 22:25:10.39466	2025-06-08 22:25:10.39466
248	Test	test@gmail.co	$2y$10$J9K/5lv7/6stGkSsYmOmyOwFgMkUnvRTR6naKrOb7shTTAg2VLH9S	user	\N	2025-06-08 22:25:10.479603	2025-06-08 22:25:10.479603
249	Test2	test@gmail.co2	$2y$10$gD8nqni5F1VbIuRQ4p4pSeCT5QBfaOCMeYfK0Gm7eXogVyksvtc.m	user	\N	2025-06-08 22:25:10.564313	2025-06-08 22:25:10.564313
250	test3	test@gmail.co3	$2y$10$i0maAtuydfsEJCfiDojaqe44PgttVqF7eVzScu822TsQR3lAp.wc2	user	\N	2025-06-08 22:25:10.648483	2025-06-08 22:25:10.648483
251	Клаа	fdjd@gmail.com	$2y$10$t9W1zs40Vxg0xy1Yk/XGNuPNjieJxIZ85H1ABWjSuAavicz18HIBy	user	\N	2025-06-08 22:25:10.731767	2025-06-08 22:25:10.731767
252	вапв	dsrfds@gmail.com	$2y$10$vxmbH/nbLnTUd.0A5Von9Ow.sg6oDqSHYK9dxhG7jN.paiPdsiP1W	user	\N	2025-06-08 22:25:10.816317	2025-06-08 22:25:10.816317
253	ерр	dfjlkj@gmail.com	$2y$10$wxPrB/bA/OHji6E523N6fOSEDjx26oH.3mqe/zBFUlroyFlIpYfsa	user	\N	2025-06-08 22:25:10.900558	2025-06-08 22:25:10.900558
254	Рвовл	fshsh@gmail.com	$2y$10$.FxunZcRZri6bTCal.OiZOfU3zeUfVCQ4mwDatWlFMeCxmznGIWzO	user	\N	2025-06-08 22:25:10.984759	2025-06-08 22:25:10.984759
255	вкапв	jhgjhg@gmail.com	$2y$10$OEnrIuGq34DTWPbVdDen4ut/1fWfxzDO0Lrqpq8tfSxFRrh8o7mhi	user	/photo/62/94649f57-d9f2-4537-9681-a61f6e874856.PNG	2025-06-08 22:25:11.068525	2025-06-08 22:25:11.068525
256	drtygdy	ljkldfg@gmail.com	$2y$10$dp9XCm5UUxbhnhbTt0lWQuCDaYSdd9YDUKpdPtUrFa80X1Wx.2D6m	user	\N	2025-06-08 22:25:11.154698	2025-06-08 22:25:11.154698
257	cdvgx	df.kjg@gmail.com	$2y$10$HpdpNLkr9sbO/llneDEY1.6mD.XmBfuomFjlGJ/r/FPdHk/bdKme2	user	\N	2025-06-08 22:25:11.239507	2025-06-08 22:25:11.239507
258	cdvgx	kjhdf@gmail.com	$2y$10$nETODm5GYCWH8PJmp7VuFuIfskNRl0S6tlA7Bemy3yJ/mpqa/o0n2	user	\N	2025-06-08 22:25:11.323415	2025-06-08 22:25:11.323415
259	рологщн	account1@gmail.com	$2y$10$OD7343vT.y9bFygwuT2G/O3DMxY1SrRKoI3DEiPDzUDUKG/BZOhlC	user	\N	2025-06-08 22:25:11.407601	2025-06-08 22:25:11.407601
260	dfgdfg	dxfds@gmail.com	$2y$10$744zS/GOFes3QHWT905oOuGO8TcNmFVB5WAJugLmsmTu4tLkak7ke	user	\N	2025-06-08 22:25:11.491691	2025-06-08 22:25:11.491691
273	Test 5	test5@gmail.com	$2y$10$J4OylEzvCkK3oNKUqxOHX.9Awv.SAM5dkGk6LGmqY2LSD3F7Ak3KG	user	\N	2025-06-08 22:25:12.590601	2025-06-08 22:25:12.590601
274	аччпи	pm@bankimonline.com	$2y$10$aNM9uhawYC5yyynmkAm4LeskShgeEYpszEEsR/eeD8w9mpRErrJGy	user	\N	2025-06-08 22:25:12.676436	2025-06-08 22:25:12.676436
275	Екатерина	dfgs@gmail.com	$2y$10$9/KiZlhovJkeZhe5e3UL.O3LoCQ8jwZsjNxIa4E4nxWDcKkdEJTny	user	\N	2025-06-08 22:25:12.760545	2025-06-08 22:25:12.760545
276	ап мтмр	dfdd@gmail.com	$2y$10$wjO/HapYRwQoEOC1mnwZLebaR9uNVx.CJaafO7vrfBR3yAevkvtS2	user	\N	2025-06-08 22:25:12.846663	2025-06-08 22:25:12.846663
277	Fhcuh h	fhvhh@tfg.gg	$2y$10$aUMnOdZpqYIiICY3Vux7oemaI6CYgD07ODg9czH0X02U9xcd5quFi	user	\N	2025-06-08 22:25:12.932329	2025-06-08 22:25:12.932329
278	Менеджер отдела продаж	sales-manager@gmail.com	$2y$10$cStq.1ZRf0U8BpcFi8FEMOS2za4DfWj.bM/7Rk96eeEREZByjNbRS	sales_manager	\N	2025-06-08 22:25:13.015932	2025-06-08 22:25:13.015932
279	Брокер	broker@gmail.com	$2y$10$dgX6TDHu53lvyLQbEzIehO5S445pNE90r62TqdGGCt2iztvCTH1J2	broker	\N	2025-06-08 22:25:13.100487	2025-06-08 22:25:13.100487
280	HR	hr@gmail.com	$2y$10$gx6qK9kNuCPuoCVxidm4VuHbKG7kfNq.n9gQLypMDovakPXH4rUhe	hr	\N	2025-06-08 22:25:13.184445	2025-06-08 22:25:13.184445
281	טסט ניסיון	kaufmanam@gmail.com	$2y$10$EKVjqHw0oxfkusrbJU1dkOJDEKp/9i3M.Ory/wJs7.6Y6MODK6bz2	user	\N	2025-06-08 22:25:13.267312	2025-06-08 22:25:13.267312
282	חיים	kaufmanadm@gmail.com	$2y$10$O/F9Rt3LDaYvfRQNuAC/xuVf/XcGEcVvMeNUyySilp8qzgsE58GIW	user	\N	2025-06-08 22:25:13.351396	2025-06-08 22:25:13.351396
283	ач аропрл	sdfkj@gmail.com	$2y$10$rEQFNiZiiSjfqNsdUfOqte1A/NZqv6dIRvtsjmDy5oV7GCh8EDvgi	user	\N	2025-06-08 22:25:13.435387	2025-06-08 22:25:13.435387
284	пап арпар	kjbkj@gmail.com	$2y$10$2pXz2cyfzhgvibp4ip3Av.ysGM4bfN0GAsNxEr2wBVeKNLYnKb2PS	user	\N	2025-06-08 22:25:13.519674	2025-06-08 22:25:13.519674
285	123	test@gmail.co4	$2y$10$i.SninCoMMpsW0/hRa6YaupgId/Z7BZsNrM6blHPJqZqjiDpcbWCi	user	\N	2025-06-08 22:25:13.603557	2025-06-08 22:25:13.603557
286	вап ввап	khgkj@gmail.com	$2y$10$74aJUAvSx5k.TTp0doaEF.1KEa7oxwDGWQCHnvTrPX.FI7flc0qM6	user	\N	2025-06-08 22:25:13.687612	2025-06-08 22:25:13.687612
287	рекр керекр	jhghkg@gmail.com	$2y$10$8g4sxKqdqM2D/kZixNuhxOrrZhT/m9wWkWke3kPbddPTGJ2j7jItC	user	\N	2025-06-08 22:25:13.771395	2025-06-08 22:25:13.771395
288	בלה בלה	nisayon@gmail.com	$2y$10$2yWcRlZWjbzrDw2gUrd5wuu7wewZh0ZMlCESVRsS6wxulf20VbvoW	user	\N	2025-06-08 22:25:13.855791	2025-06-08 22:25:13.855791
289	כככג גכג	Barbi@gmail.com	$2y$10$Sj3LiTO42zJgg0E7EQMnnesJCU9Y1OzIab/Qeq87YQ7uCpKwjiH02	user	\N	2025-06-08 22:25:13.94038	2025-06-08 22:25:13.94038
290	ара ере	mhbhm@gmail.com	$2y$10$NtBiV10gvCYSRucwRiPwzeLW594/s9uHDlmfJJycdEqL6GU3KXVtm	user	\N	2025-06-08 22:25:14.024554	2025-06-08 22:25:14.024554
291	test5	test51@gmail.com	$2y$10$XO/geQiohUKecnOviUj5fO8CSmLAh2UOeoxAHV11U0.GYZN3W.epe	user	\N	2025-06-08 22:25:14.109506	2025-06-08 22:25:14.109506
292	прпро ронпо	kjhkh@gmail.com	$2y$10$hqywBSNDCIFWFNrvhMuDvOa4aUVELgL4nLIsY7WBlnlztm2aFkJsy	user	\N	2025-06-08 22:25:14.197355	2025-06-08 22:25:14.197355
293	авп впа	dkhb@gmail.com	$2y$10$4Ux0k5GHf5jaWQg3YyV69.4wh71aFKakAzKFroZPo2OdOPu6PhzJe	user	\N	2025-06-08 22:25:14.279506	2025-06-08 22:25:14.279506
294	кер ерер	jg@gmail.com	$2y$10$J1zo7Z0cbakB.Vc85OBKeua/NxbnLLFVuEIR3Khba90IBtDgAf.Me	user	\N	2025-06-08 22:25:14.370726	2025-06-08 22:25:14.370726
295	ар рер	sf@gmail.com	$2y$10$azMAwzSjO27Z0gCuUXA/aO1Pf/G6JahHWNlkg0nes4KCwqTS3jPva	user	\N	2025-06-08 22:25:14.45846	2025-06-08 22:25:14.45846
296	חחח	naiai@gmail.com	$2y$10$CIgkdc1t7MqyXidLaxcZnumyS9oGSh1E6B4UZzsZnnqMT8QdciVN6	user	\N	2025-06-08 22:25:14.548452	2025-06-08 22:25:14.548452
297	test 3	test32@gmail.com	$2y$10$aTuMIPFUP2MsF0Zro6boJ.f47Lhoxt5KcfMAVpTzp8gCNqKp3sbJ6	user	\N	2025-06-08 22:25:14.632531	2025-06-08 22:25:14.632531
298	1234	test34@gmail.com	$2y$10$2aPJsgul0VSROsEzhrIkmOAwLrBVlwRxblh01iAPlJQOan5DF5WuS	user	\N	2025-06-08 22:25:14.716399	2025-06-08 22:25:14.716399
299	вкп еар ек	dfgfh@gmail.com	$2y$10$M1SVABL5k40VbPiKPUFCv.OQiSjZfcfp9X.fT85cZVJKk37gCd/9i	user	\N	2025-06-08 22:25:14.800628	2025-06-08 22:25:14.800628
300	מיכל מיכאלי	michal@whatever.co.il	$2y$10$geiCt0ZWULnWOmL/PXC0aO7kg4nOk4ZTPLC1mRdNl.DKqDbGdrhqK	user	\N	2025-06-08 22:25:14.88455	2025-06-08 22:25:14.88455
301	מיכל מיכאלי	michal@micharli.com	$2y$10$9B32j/8KfgQhtMSrduNtlOUdnaoylPUEQlNH5snybI7PyMtoJMInq	user	\N	2025-06-08 22:25:14.969422	2025-06-08 22:25:14.969422
302	עמיר ניסיון שני	dfsi@lld.com	$2y$10$1I0.fkubydx5vm64HJXHte9ZkTSYuDW6B9OXv1CvJSoAxn/qutf16	user	\N	2025-06-08 22:25:15.053543	2025-06-08 22:25:15.053543
303	עמיר שלישי	kaufmana3m@gmail.com	$2y$10$FWQPJlc/73orUEkK7RDyzOfsuaCtMPUdOfQ7ETQWDLDrvXpnMCzIW	user	\N	2025-06-08 22:25:15.13673	2025-06-08 22:25:15.13673
304	עמיר 4	kaufman4am@gmail.com	$2y$10$hYq7LiBY6oQoSRhTxppgIOyIMiEwMcRnOU5De1FRNOPMCap9Zb9gC	user	\N	2025-06-08 22:25:15.221143	2025-06-08 22:25:15.221143
305	טל  אשל	yy@gmail.com	$2y$10$89bgoU9GQe87XGk6AU92QekhGu.f2VFu/8SosUPVw30xJOtpceUgC	user	\N	2025-06-08 22:25:15.30535	2025-06-08 22:25:15.30535
306	טל	yy@ccc.con	$2y$10$4Ax7dDNGeEp/HQb0IIxFw.BC0PeqsYKxl3cvsbKDQlHpSP/H0KCmq	user	\N	2025-06-08 22:25:15.390363	2025-06-08 22:25:15.390363
307	gdjgd	test@grmail.com	$2y$10$RzXfi0jepBdcoz6pTFez8uaZ4qNU9q2lrc4N9DHfeh/RNOdyuSkMa	user	\N	2025-06-08 22:25:15.473628	2025-06-08 22:25:15.473628
308	олооорориоио	testff@grmail.com	$2y$10$CkeB7D//0XC7tSqeOrKa8.X0krtfqdmdwAjkmvp3bhSZCZdsGTmjO	user	\N	2025-06-08 22:25:15.557433	2025-06-08 22:25:15.557433
309	fghjkl	wedfgh@fghj.jju	$2y$10$3ZPvZGs3WajB8unPxbyK.OXpEklBpkaQ465i7/9kDkVXQqb3LwgQS	user	\N	2025-06-08 22:25:15.641419	2025-06-08 22:25:15.641419
310	שקכדקעכ	fhdfh@gmail.com	$2y$10$H4pN0o8NmqnvwYYDFKVuaegYdIzk2LcScAL8BidjCb7TrcNxyZosy	user	\N	2025-06-08 22:25:15.728621	2025-06-08 22:25:15.728621
311	Апавв	gddff@gmail.com	$2y$10$VEzxPkxnxKWHdhiXzzntd.YvWTHTjvugwBWen06.20qnvWxvgG86i	user	\N	2025-06-08 22:25:15.813493	2025-06-08 22:25:15.813493
312	hjvhjjh	ghghjgjh@hjkhkj.com	$2y$10$VUr1j6hrAzar1vO/i0qgwe.2h7Gl021xnP6oH/PkhmZ4Rj2BN/p7C	user	\N	2025-06-08 22:25:15.89859	2025-06-08 22:25:15.89859
313	Hjk	hagana@gmail.com	$2y$10$ktFWrhrjWJrRJWDb/oz3m.WQWdBFDKXseJzASZTEaF0QZ1hF26IfO	user	\N	2025-06-08 22:25:15.98177	2025-06-08 22:25:15.98177
314	yjghg	glrglj@gmail.com	$2y$10$p6Kwu46Oj021XRgCaS0.aeqIhC/oGwbbnm76F2.WE3p5JlatML3.e	user	\N	2025-06-08 22:25:16.066375	2025-06-08 22:25:16.066375
315	בדיקה בדקיה	test@test.com	$2y$10$5AJp67yNGs.fEI8QzAJVg.C7IUgkXcClO9WH2CisiK1iiuOhF5GR.	user	\N	2025-06-08 22:25:16.151627	2025-06-08 22:25:16.151627
316	א	gershonioren@gmail.com	$2y$10$2T4EiafOcqgwuGSYRfFv2ea1JdtvSysp58X5GtwU/zzIMg0Mqg7O2	user	\N	2025-06-08 22:25:16.236294	2025-06-08 22:25:16.236294
317	Макарова мария	mbrf1989@gmail.com	$2y$10$qjPsAifxylz3IWZSrcyfwOepI6928V6V4Lc9S0HWILK/xq/zgurFm	user	\N	2025-06-08 22:25:16.319719	2025-06-08 22:25:16.319719
318	Мириев Абидин А	qoobiy@bk.ru	$2y$10$yqgV.x01MyqwGGovxF3re.g4l4L9k28QkfS31xRg/fU4s/TjI/FDS	user	\N	2025-06-08 22:25:16.404418	2025-06-08 22:25:16.404418
319	Прелестнов Прелест	prelest@prelest.ru	$2y$10$xQwqPc7BipQzjvnFWwNPKO/UcItUy.cZk323uVnzNtiMX5FLL55Qu	user	\N	2025-06-08 22:25:16.488715	2025-06-08 22:25:16.488715
320	Oleg Zakharenko	nonwwwluxi@www.wwwwwcom	$2y$10$2R0EAFBntATMX2285s7QL.9qdcI5XIu5cWjTotfAfKRyyELE9suFS	user	\N	2025-06-08 22:25:16.573356	2025-06-08 22:25:16.573356
321	Ddd	fee@ref.crr	$2y$10$KXucQJdDrBmAruC6U/bo5./zCWZjJINhWGFk.KwJkYkPSmjOl1pMa	user	\N	2025-06-08 22:25:16.658616	2025-06-08 22:25:16.658616
322	test test	glendemon+test@gmail.com	$2y$10$Ef3v75PWA2lo3psqX6dwf.jG6GRg.e5Rq3T2ieqVJMj3m.aNqEIVW	user	\N	2025-06-08 22:25:16.764558	2025-06-08 22:25:16.764558
323	ыпы	rgrh@gmail.com	$2y$10$7U/33FCMmkIaCuFVZWdQU.BBRiFfxL3V1YNH658kfCXGdyyejek4W	user	\N	2025-06-08 22:25:16.848487	2025-06-08 22:25:16.848487
324	Test Test Test	testtest@test.ru	$2y$10$6HfGrIhLGOUac2Y0EnawG.TelHvS/fkTLp1OEtx4vblt0woB8IKrS	user	\N	2025-06-08 22:25:16.932475	2025-06-08 22:25:16.932475
325	Test User	test2@gmail.com	$2y$10$ChAkNFVQ/3y4Fth5hyaVbe8XUzWeQ2YbuR/fCjgk9rUw2IFd0wg7G	user	\N	2025-06-08 22:25:17.016821	2025-06-08 22:25:17.016821
326	Test User	test3@gmail.com	$2y$10$1U.FR0R3RD9jBH767sx.LuusXx63Ohp9hHtlikQTe.4jkTW87eAaa	user	\N	2025-06-08 22:25:17.103589	2025-06-08 22:25:17.103589
327	ככעע	hfddff@gmail.com	$2y$10$4HbZcIIRjPwuU4Akbz4USO9OuMn.EhMoI5WiZPUG31OmwEm1DlhXa	user	\N	2025-06-08 22:25:17.187467	2025-06-08 22:25:17.187467
328	Eliran Genasia	gseliran@gmail.com	$2y$10$6NQPEuSUbt.bUdJmyuj6ne/J5BbyWBanbi8ZcNbfbkWf4TEBIZ.kW	user	\N	2025-06-08 22:25:17.301523	2025-06-08 22:25:17.301523
329	Mike	ntellegend@yandex.ru	$2y$10$P9G2dM5OQDeFkV2KFC6X9.Al1VLTom9j0s8PlfhsVmfliw6C6Vddm	admin	\N	2025-06-08 22:25:17.386544	2025-06-08 22:25:17.386544
330	иванов иван	sosca174@gmail.com	$2y$10$bgR7TNrrADPNmLX5.DpZGO1pqHQuTu2OCzDlTk9z7xSkCHpkUuCcS	user	\N	2025-06-08 22:25:17.469997	2025-06-08 22:25:17.469997
331	Kate Tsevan	k.tsewan@gmail.com	$2y$10$m9T8Ed.DEZZzcWmZVvIqZuSxhgVjck1lUZWvE92ck3WGAPhw2RlyW	user	\N	2025-06-08 22:25:17.553319	2025-06-08 22:25:17.553319
332	п	kjsdhnf@mail.ru	$2y$10$gTs/C.q2WIa3fIem7ufmA.BWAjYuiuRwZTGr7oEe9zmdL6FuP5L8G	user	\N	2025-06-08 22:25:17.638265	2025-06-08 22:25:17.638265
333	xzczxczxczxc	kjahdkjas@gmail.com	$2y$10$bUyuhkfpLnPPYfKdXavn1.7847TgnCCfPOaxRSox6GkZ.XPQNlqCa	user	\N	2025-06-08 22:25:17.7216	2025-06-08 22:25:17.7216
334	прпофрыпа фцовро	sjshfga@mail.ru	$2y$10$Vno5qK4o3flRUZ5sWYjHmuu2WZvJQ1ERWrOiFG/zhpK77ErlU4d/S	user	\N	2025-06-08 22:25:17.806704	2025-06-08 22:25:17.806704
335	маргарита попова	krovushk@gmail.com	$2y$10$s6avCRj2Japiq7yQ5ONE6eeiZlaUzvCieqc2kA3UvSKySYwGGKrc2	user	\N	2025-06-08 22:25:17.89154	2025-06-08 22:25:17.89154
336	test	anastasia_lemish@inbox.ru	$2y$10$4czyj821of.O5qpgb3fs3.3xu.INXMvfl2H7wQT4/ZM86Q8JErpeS	user	\N	2025-06-08 22:25:17.976454	2025-06-08 22:25:17.976454
337	еуйцу йуцй	qweqe@test.gmail	$2y$10$JkSV51gmNKJnlof4X7hKQO1dDKGHJhrwDPcLVZ2X7gYeJ15pqwu6K	user	\N	2025-06-08 22:25:18.060706	2025-06-08 22:25:18.060706
338	Lol	omarmansur020@gmail.com	$2y$10$Jjr5ckqqaPIaW3SvEvY66eo3XpJELh8oRFfznK.Nw/YWdd.HUYHNa	user	\N	2025-06-08 22:25:18.146458	2025-06-08 22:25:18.146458
339	Тест	nastasiyaspec@yandex.ru	$2y$10$e842rvbldjm6d9TWeieMS.R1UezTR5FfVp7.MN0sKEDOQidu1Zm1m	user	\N	2025-06-08 22:25:18.229384	2025-06-08 22:25:18.229384
340	я сутулая собака	test@tes.tes	$2y$10$nPdtTLhagwuAcqeM/jY5aex2HihQfp6yqUr.1MlOVw00mOJtRLf5q	user	\N	2025-06-08 22:25:18.31425	2025-06-08 22:25:18.31425
341	ерк	ghgkf@hkljh.ru	$2y$10$/.yQz8Yco.kYy52gTcnLBOAdDmNWC9/61frjejNMiUbGACL4Pk3RO	user	\N	2025-06-08 22:25:18.399635	2025-06-08 22:25:18.399635
342	Маркова Мария Кирилловна	inkognitome@inbox.ru	$2y$10$ebClDCAM9qoTDLc57hT2quhWNmWgYmCztOpp9AXDqaByyBAUtZDri	user	\N	2025-06-08 22:25:18.484613	2025-06-08 22:25:18.484613
343	еееееееееееееееее	test@mail.ru	$2y$10$AfCiciOgk6413wJCpHpqw.4nqZfJNzQpMBCgqKNWe7ZGcPmQqESRm	user	\N	2025-06-08 22:25:18.569475	2025-06-08 22:25:18.569475
344	Тест	test222@mail.ru	$2y$10$AUIqx4h10eZ5eJEuZ85rYeC0zO3q3Y7cyWnyG6pbsILiOUaZlF0ce	user	\N	2025-06-08 22:25:18.652521	2025-06-08 22:25:18.652521
345	еоке	rdhtjh@gmail.com	$2y$10$NQxKtWgVtK.cI5GthUth8ekr4oetn0PL4jDv5CNySdxBvBBgVlS/y	user	\N	2025-06-08 22:25:18.736427	2025-06-08 22:25:18.736427
346	Gennady Belkin	gbe@tuta.io	$2y$10$u/6d0v4J.h1i8UO7.XphjuobJaSjVKY1ZUVG6inmJtRexAUfbtIEy	user	\N	2025-06-08 22:25:18.821501	2025-06-08 22:25:18.821501
347	Bbbj	hhjj@gmail.com	$2y$10$uTCY7WC8JF6wdk8h9pHBGOEObij41qFCFrKV3jzvEWoH7rbDOwY8K	user	\N	2025-06-08 22:25:18.906453	2025-06-08 22:25:18.906453
348	Yolok hadera	thezfinance@gmail.com	$2y$10$YCG.kCKpLCi.P3kOS//hauoDH6rc178K7cFI9J3KyWn0C6Tw7ySaC	bank	\N	2025-06-08 22:25:18.991555	2025-06-08 22:25:18.991555
349	Evs	irte@gmail.com	$2y$10$HGGUvocjjmFLMC/oiEZBROVwcm8AnJqcuH/p1hvYNV6e7eU3HeLta	user	\N	2025-06-08 22:25:19.075593	2025-06-08 22:25:19.075593
350	123	scam@scam.ua	$2y$10$5dB/b9/vuUGSNyB4ef01Mu2.ZfarEWXlxt5V1C5Z9tKnTTInORdM6	user	\N	2025-06-08 22:25:19.159839	2025-06-08 22:25:19.159839
351	ыупцкпку	gtwregter@gmail.com	$2y$10$Ik7/oLdJX682nayUyo7QA.EC6gpwQ7rHq78JZscZsSHQOnFPdjE0e	user	\N	2025-06-08 22:25:19.243385	2025-06-08 22:25:19.243385
352	kasjdlfgajlsdjf	ge@tuta.io	$2y$10$0UYOCVsxqVl3NlsVyXAAlOIpFcUalzov1l.PMNhYqgpJvRUgBBwjm	user	\N	2025-06-08 22:25:19.327705	2025-06-08 22:25:19.327705
353	фвафпафапыавп	bragin@bankimonline.com	$2y$10$xOz7d/L1HfAdJ0smtRx5U.bmkT7frvDXi4xPWGxI9j7CePjIcjUBq	user	\N	2025-06-08 22:25:19.413479	2025-06-08 22:25:19.413479
354	dsfdsfds	dsfdsf@3232.23	$2y$10$.xWPZZ7LQIbniJvtjB4qaufLIA/8kpl..OdYa8dVWmWOf6Q9KgWti	user	\N	2025-06-08 22:25:19.499596	2025-06-08 22:25:19.499596
355	А	a@mail.ru	$2y$10$Qil3MqauBeiH64SRtHB/zu6OiZ/AvB8ctIp2TqJuOjITrl4bY/hSu	user	\N	2025-06-08 22:25:19.58362	2025-06-08 22:25:19.58362
356	Victoria Klausen	klausenvictoria050@gmail.com	$2y$10$r9dpElryR6euXA9gYTv0eesgGaO9t4OR3ppv0eWA4wh4eXRq4EDAy	user	\N	2025-06-08 22:25:19.668358	2025-06-08 22:25:19.668358
357	test	test1@test.com	$2y$10$A66Oju.3D/jy/.681tZDJeTzLP3GW39ftey1mb8Q1beH4mKaeeL9G	user	\N	2025-06-08 22:25:19.75434	2025-06-08 22:25:19.75434
358	фывфывфывфыв	sadasd@gmail.com	$2y$10$ubpBW32wRUipypaTnvbAv.vmU4mVBsv7Dm.NUgazzPt7UVrMoaWQC	user	\N	2025-06-08 22:25:19.838312	2025-06-08 22:25:19.838312
359	fdgfdgfdg	dsfdsf@sdfdsf.com	$2y$10$lGMRihdu9BFR/ykrePlrTewFBXEG0QKOKdaBa.dIU3Y6LjU02vRNC	user	\N	2025-06-08 22:25:19.922293	2025-06-08 22:25:19.922293
360	Sergey	rainupwx@gmail.com	$2y$10$xryjmRTsImaxXnWau6gWFejfWAT1MWo1vegQdxTAF7jnis50Bk0YK	user	\N	2025-06-08 22:25:20.006449	2025-06-08 22:25:20.006449
361	J	romanrogol21@gmail.com	$2y$10$9b4AvuVr0I6KRNym3cE13.LmBMODioV7i4W6tIHGAMII7tDES3XPm	user	\N	2025-06-08 22:25:20.090685	2025-06-08 22:25:20.090685
362	ר א	name@bankim.com	$2y$10$nrMWBnSBqnqqWjxY5433rOc1otWcBVJrxpOiDpbG1aR3ptIpznvXi	user	\N	2025-06-08 22:25:20.174536	2025-06-08 22:25:20.174536
363	כל מי	bank@gmail.com	$2y$10$lHaoHkH/jC/1d3dsQJDvsu9lMnw3rdgBj35BnTY2HOVIHYjfuXd12	user	\N	2025-06-08 22:25:20.25858	2025-06-08 22:25:20.25858
364	גכככע ככאג	hdss@gmail.com	$2y$10$b3g7tdcludCMda0X7ZwBhOIWniBGwcewT9VYJXCRv05F4PnOpFcXG	user	\N	2025-06-08 22:25:20.343496	2025-06-08 22:25:20.343496
365	שעעקגעקע	livedns@gmail.com	$2y$10$mUjbhhYaDfnK/UqyJCIjkudsqzvyf6BJgMUb/GRE9AQ/GG4fbxOu2	user	\N	2025-06-08 22:25:20.428517	2025-06-08 22:25:20.428517
366	gng	gnfgjnf@gmail.com	$2y$10$SfsXNHDKgK3.LdkT2dsjD.g22YZLsU1IS0YqiqwNmDCqibErldACS	user	\N	2025-06-08 22:25:20.513549	2025-06-08 22:25:20.513549
261	огкн	kjhkj@gmai.com	$2y$10$6tK6sbVwrKLTP9PZzwdHFewciZLTDX3FTpCRrumSYo0HbJ9zb4Qqi	user	\N	2025-06-08 22:25:11.575405	2025-06-08 22:25:11.575405
262	fgfh	sfs@gmail.com	$2y$10$/hachp/O1uVtnTtnzstNJ.sFnJHheeh/sUDS6w.1J6FldYcbUvmly	user	\N	2025-06-08 22:25:11.660774	2025-06-08 22:25:11.660774
263	апрпарп	hjgj@gmail.com	$2y$10$8aaFF.tBOdXa5PH5.5sj7eNiPZlrexU5zItu3mTT6nS1T9aIHIUMK	user	\N	2025-06-08 22:25:11.745637	2025-06-08 22:25:11.745637
264	dgd	sfdsf@gmail.com	$2y$10$E9hFg/RS7DFqZawgzKV2dO2p6BOEr9jFG/zfXKU0tKdpVbGkKjSCq	user	\N	2025-06-08 22:25:11.829327	2025-06-08 22:25:11.829327
265	Екатерина	pm@eitanmortgage.com	$2y$10$am7gCSK6QCXxzbAsTIL/Kec5dAYNE0xCW0tcGtUx5UJcRpsydHTp.	user	\N	2025-06-08 22:25:11.913475	2025-06-08 22:25:11.913475
266	htfh	hfs@gmail.com	$2y$10$a0pAWYYDf92vRPtWQEI2Z.LdGnCggJN2rBd7ZRQ4mRI8bBFSJdgX2	user	\N	2025-06-08 22:25:11.997809	2025-06-08 22:25:11.997809
267	fgfg	dfdfd@gmail.com	$2y$10$0wvb6O8PYNS.dzgT42YjmOA9fiDpSQWnxGJRt7YsCpggBXFWY9vWS	user	\N	2025-06-08 22:25:12.081488	2025-06-08 22:25:12.081488
268	сппрпр	erfefkuh@gmail.com	$2y$10$SPR2buZb1p1obc/A1kuBAeqpJ512KBcV6QQ8edKiBz6coWC8vReTK	user	\N	2025-06-08 22:25:12.165417	2025-06-08 22:25:12.165417
269	Опша оала	gsjsid@gmail.com	$2y$10$1fAgC6BdHGq/wfuBcNzkj.IDs3VNzU97qXJqIuPP8EZN9I84R8e1a	user	\N	2025-06-08 22:25:12.251935	2025-06-08 22:25:12.251935
270	fdhsdga	dfsdva@gmaul.com	$2y$10$IOY9uwj6T.VlxXgA5aILM.Xbwp26cRsIF2Nv5V8BRb8bLJpkgHnNa	user	\N	2025-06-08 22:25:12.336394	2025-06-08 22:25:12.336394
271	вап вапвап	ksjdf@gmail.com	$2y$10$w63CcAtos9XO7oc.IJ3lGuwHHEohI1LzmHstqMIA7Ax4/gBivRrPu	user	\N	2025-06-08 22:25:12.420685	2025-06-08 22:25:12.420685
272	Test 4	test4@gmail.com	$2y$10$0bQFte.LAYbyz5HlTgdA7eWo4mVQ4Un8uR3edoRgwZ/urLQWcC0Qq	user	\N	2025-06-08 22:25:12.504566	2025-06-08 22:25:12.504566
367	New Test User	newuser@bankim.com	hashed-password-123	user	\N	2025-06-09 21:51:48.208246	2025-06-09 21:51:48.208246
\.


--
-- Data for Name: vacancies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacancies (id, title, category, subcategory, location, employment_type, salary_min, salary_max, salary_currency, description_he, description_en, description_ru, requirements_he, requirements_en, requirements_ru, benefits_he, benefits_en, benefits_ru, is_active, is_featured, posted_date, closing_date, created_by, created_at, updated_at, responsibilities_he, responsibilities_en, responsibilities_ru, nice_to_have_he, nice_to_have_en, nice_to_have_ru) FROM stdin;
1	Back-end Developer	development	backend	Tel Aviv	full_time	6000.00	12000.00	ILS	אנחנו מחפשים מפתח Back-end מנוסה להצטרף לצוות הסטארט-אפ שלנו בתחום הפינטק. תעבוד עם טכנולוגיות מתקדמות ותשתתף ביצירת פתרונות בנקאיים חדשניים.	We are looking for an experienced Back-end developer to join our fintech startup team. You will work with modern technologies and participate in creating innovative banking solutions.	Мы ищем опытного Back-end разработчика для присоединения к нашей команде финтех-стартапа. Вы будете работать с современными технологиями и участвовать в создании инновационных банковских решений.	- תואר ראשון במדעי המחשב או תחום דומה\n- 3+ שנות ניסיון בפיתוח Backend\n- ניסיון מוכח עם Node.js, Python או Java\n- הכרות עמוקה עם בסיסי נתונים (PostgreSQL, MongoDB)\n- ניסיון עם REST APIs ו-GraphQL\n- הבנה של אדריכלות מערכות וטכנולוגיות ענן\n- יכולת עבודה בצוות ותקשורת מעולה\n- אנגלית ברמה גבוהה	- Bachelor's degree in Computer Science or related field\n- 3+ years of Backend development experience\n- Proven experience with Node.js, Python, or Java\n- Deep knowledge of databases (PostgreSQL, MongoDB)\n- Experience with REST APIs and GraphQL\n- Understanding of system architecture and cloud technologies\n- Strong teamwork and communication skills\n- High level of English proficiency	- Степень бакалавра в области компьютерных наук или смежной области\n- 3+ года опыта Backend разработки\n- Доказанный опыт работы с Node.js, Python или Java\n- Глубокое знание баз данных (PostgreSQL, MongoDB)\n- Опыт работы с REST APIs и GraphQL\n- Понимание архитектуры систем и облачных технологий\n- Отличные навыки командной работы и коммуникации\n- Высокий уровень владения английским языком	- שכר תחרותי ותנאים מעולים\n- ביטוח בריאות פרטי מלא\n- אפשרויות השקעה במניות החברה\n- 25 ימי חופשה בשנה + ימי מחלה\n- תקציב להשתלמויות וכנסים מקצועיים\n- ציוד עבודה מתקדם (MacBook Pro, מסכים כפולים)\n- משרדים מודרניים במרכז תל אביב\n- ארוחות צהריים ונשנושים חינם\n- אירועי צוות וימי כיף חברתיים\n- גמישות בשעות עבודה ואפשרות עבודה מהבית	- Competitive salary and excellent conditions\n- Full private health insurance\n- Company stock investment options\n- 25 vacation days per year + sick days\n- Budget for training and professional conferences\n- Advanced work equipment (MacBook Pro, dual monitors)\n- Modern offices in central Tel Aviv\n- Free lunches and snacks\n- Team events and social activities\n- Flexible working hours and work from home options	- Конкурентная зарплата и отличные условия\n- Полное частное медицинское страхование\n- Возможности инвестирования в акции компании\n- 25 дней отпуска в год + больничные дни\n- Бюджет на обучение и профессиональные конференции\n- Передовое рабочее оборудование (MacBook Pro, два монитора)\n- Современные офисы в центре Тель-Авива\n- Бесплатные обеды и закуски\n- Командные мероприятия и социальная активность\n- Гибкий рабочий график и возможность работы из дома	t	f	2025-07-06	\N	\N	2025-07-06 07:12:32.992002	2025-07-06 08:00:32.867462	- פיתוח וחיזוק API-ים ושירותי רקע\n- עבודה עם בסיסי נתונים ואופטימיזציה של ביצועים\n- אינטגרציה עם שירותי צד שלישי ומערכות תשלומים\n- שיתוף פעולה עם צוותי Frontend ו-DevOps\n- כתיבת קוד נקי ומתועד עם בדיקות יוניט\n- השתתפות בסקירות קוד ותהליכי CI/CD	- Develop and maintain APIs and backend services\n- Work with databases and optimize performance\n- Integrate with third-party services and payment systems\n- Collaborate with Frontend and DevOps teams\n- Write clean, documented code with unit tests\n- Participate in code reviews and CI/CD processes	- Разработка и поддержка API и backend сервисов\n- Работа с базами данных и оптимизация производительности\n- Интеграция с внешними сервисами и платежными системами\n- Сотрудничество с Frontend и DevOps командами\n- Написание чистого, документированного кода с unit-тестами\n- Участие в код-ревью и CI/CD процессах	- ניסיון עם Docker ו-Kubernetes\n- הכרות עם AWS או Azure cloud platforms\n- ניסיון עם microservices architecture\n- הכרות עם GraphQL\n- ניסיון עם Redis ו-caching strategies\n- הכרות עם אבטחת מידע ו-OWASP principles	- Experience with Docker and Kubernetes\n- Familiarity with AWS or Azure cloud platforms\n- Experience with microservices architecture\n- Knowledge of GraphQL\n- Experience with Redis and caching strategies\n- Knowledge of security and OWASP principles	- Опыт работы с Docker и Kubernetes\n- Знание AWS или Azure cloud platforms\n- Опыт работы с microservices architecture\n- Знание GraphQL\n- Опыт работы с Redis и caching strategies\n- Знание безопасности и OWASP principles
2	Product Designer	design	product_design	Tel Aviv	full_time	5000.00	10000.00	ILS	הצטרף לצוות העיצוב שלנו ועזור ליצור ממשקי משתמש אינטואיטיביים עבור אפליקציות בנקאיות. אנחנו מחפשים מעצב יצירתי עם ניסיון בפינטק.	Join our design team and help create intuitive user interfaces for banking applications. We are looking for a creative designer with fintech experience.	Присоединяйтесь к нашей дизайн-команде и помогите создавать интуитивные пользовательские интерфейсы для банковских приложений. Мы ищем креативного дизайнера с опытом в финтех.	- תואר ראשון בעיצוב, HCI או תחום דומה\n- 2+ שנות ניסיון בעיצוב מוצר דיגיטלי\n- שליטה מעולה ב-Figma, Sketch או Adobe XD\n- ניסיון בעיצוב אפליקציות מובייל ווב\n- הבנה עמוקה של UX/UI principles\n- ניסיון במחקר משתמשים ובדיקות שימושיות\n- יכולת עבודה עם צוותי פיתוח ומוצר\n- תיק עבודות מרשים	- Bachelor's degree in Design, HCI, or related field\n- 2+ years of digital product design experience\n- Excellent proficiency in Figma, Sketch, or Adobe XD\n- Experience designing mobile and web applications\n- Deep understanding of UX/UI principles\n- Experience in user research and usability testing\n- Ability to work with development and product teams\n- Impressive portfolio	- Степень бакалавра в области дизайна, HCI или смежной области\n- 2+ года опыта в дизайне цифровых продуктов\n- Отличное владение Figma, Sketch или Adobe XD\n- Опыт дизайна мобильных и веб приложений\n- Глубокое понимание UX/UI принципов\n- Опыт в исследовании пользователей и юзабилити тестировании\n- Способность работать с командами разработки и продукта\n- Впечатляющее портфолио	- שכר תחרותי ואופציות מניות\n- ביטוח בריאות ושיניים מקיף\n- תקציב שנתי למכשירי עיצוב וכלים מקצועיים\n- 22 ימי חופשה + ימי מחלה ללא הגבלה\n- השתתפות בכנסי עיצוב וסדנאות בינלאומיות\n- Studio עיצוב מאובזר במלואו\n- סביבת עבודה יצירתית ומעוררת השראה\n- ארוחות וקפה premium\n- מנוי חדר כושר ופעילויות בריאות\n- אפשרות לעבודה מהבית 2 ימים בשבוע	- Competitive salary and stock options\n- Comprehensive health and dental insurance\n- Annual budget for design devices and professional tools\n- 22 vacation days + unlimited sick days\n- Participation in international design conferences and workshops\n- Fully equipped design studio\n- Creative and inspiring work environment\n- Premium meals and coffee\n- Gym membership and wellness activities\n- Work from home option 2 days per week	- Конкурентная зарплата и опционы на акции\n- Полное медицинское и стоматологическое страхование\n- Годовой бюджет на дизайнерские устройства и профессиональные инструменты\n- 22 дня отпуска + неограниченные больничные\n- Участие в международных дизайнерских конференциях и семинарах\n- Полностью оборудованная дизайн-студия\n- Творческая и вдохновляющая рабочая среда\n- Премиальное питание и кофе\n- Абонемент в спортзал и wellness активности\n- Возможность работы из дома 2 дня в неделю	t	f	2025-07-06	\N	\N	2025-07-06 07:12:32.992002	2025-07-06 08:00:32.867462	- מחקר משתמשים ואנליזה של צרכים\n- יצירת wireframes, mockups ו-prototypes\n- עיצוב ממשקי משתמש עבור אפליקציות בנקאיות\n- שיתוף פעולה עם צוותי פיתוח ומוצר\n- ביצוע בדיקות משתמש ואיטרציה על העיצובים\n- שמירה על consistency בחוויית המשתמש	- User research and needs analysis\n- Create wireframes, mockups and prototypes\n- Design user interfaces for banking applications\n- Collaborate with development and product teams\n- Conduct user testing and iterate on designs\n- Maintain consistency in user experience	- Исследование пользователей и анализ потребностей\n- Создание wireframes, mockups и прототипов\n- Дизайн пользовательских интерфейсов для банковских приложений\n- Сотрудничество с командами разработки и продукта\n- Проведение пользовательского тестирования и итерация дизайнов\n- Поддержание консистентности в пользовательском опыте	- ניסיון עם design systems\n- הכרות עם animation ו-micro-interactions\n- ניסיון עם accessibility standards\n- הכרות עם HTML/CSS/JavaScript\n- ניסיון עם user research tools\n- הכרות עם agile/scrum methodologies	- Experience with design systems\n- Knowledge of animation and micro-interactions\n- Experience with accessibility standards\n- Familiarity with HTML/CSS/JavaScript\n- Experience with user research tools\n- Knowledge of agile/scrum methodologies	- Опыт работы с design systems\n- Знание анимации и micro-interactions\n- Опыт работы с accessibility standards\n- Знание HTML/CSS/JavaScript\n- Опыт работы с user research tools\n- Знание agile/scrum методологий
3	Frontend Developer	development	frontend	Tel Aviv	full_time	5500.00	11000.00	ILS	מחפשים מפתח Frontend מיומן ליצירת חוויות משתמש מרהיבות באפליקציות בנקאיות. ניסיון ב-React ו-TypeScript יתרון.	Looking for a skilled Frontend developer to create amazing user experiences in banking applications. Experience with React and TypeScript is an advantage.	Ищем опытного Frontend разработчика для создания потрясающих пользовательских интерфейсов в банковских приложениях. Опыт работы с React и TypeScript будет преимуществом.	- תואר ראשון במדעי המחשב או תחום דומה\n- 2+ שנות ניסיון בפיתוח Frontend\n- שליטה מעולה ב-React, TypeScript ו-JavaScript ES6+\n- ניסיון עם HTML5, CSS3 ו-SASS/SCSS\n- הכרות עם כלי build מודרניים (Webpack, Vite)\n- ניסיון עם ניהול state (Redux, Context API)\n- הבנה של responsive design ו-mobile-first approach\n- יכולת עבודה בצוות agile	- Bachelor's degree in Computer Science or related field\n- 2+ years of Frontend development experience\n- Excellent proficiency in React, TypeScript, and JavaScript ES6+\n- Experience with HTML5, CSS3, and SASS/SCSS\n- Familiarity with modern build tools (Webpack, Vite)\n- Experience with state management (Redux, Context API)\n- Understanding of responsive design and mobile-first approach\n- Ability to work in agile teams	- Степень бакалавра в области компьютерных наук или смежной области\n- 2+ года опыта Frontend разработки\n- Отличное владение React, TypeScript и JavaScript ES6+\n- Опыт работы с HTML5, CSS3 и SASS/SCSS\n- Знакомство с современными build инструментами (Webpack, Vite)\n- Опыт работы с state management (Redux, Context API)\n- Понимание responsive design и mobile-first подхода\n- Способность работать в agile командах	- שכר אטרקטיבי ובונוסים רבעוניים\n- ביטוח בריאות מקיף למשפחה\n- אופציות מניות בחברה צומחת\n- 23 ימי חופשה + ימי מחלה גמישים\n- תקציב למכשירים ולהכשרות טכנולוגיות\n- עמדת עבודה מתקדמת וכלי פיתוח מקצועיים\n- משרדים מעוצבים עם אזורי נוחות\n- ארוחות חינם ומטבח מאובזר\n- אירועי חברה ופעילויות גיבוש\n- המחלקה גמישות בזמנים ועבודה היברידית	- Attractive salary with quarterly bonuses\n- Comprehensive family health insurance\n- Stock options in a growing company\n- 23 vacation days + flexible sick days\n- Budget for devices and technology training\n- Advanced workstation and professional development tools\n- Designed offices with comfort zones\n- Free meals and fully equipped kitchen\n- Company events and team building activities\n- Flexible schedule and hybrid work arrangements	- Привлекательная зарплата с квартальными бонусами\n- Полное семейное медицинское страхование\n- Опционы на акции в растущей компании\n- 23 дня отпуска + гибкие больничные дни\n- Бюджет на устройства и технологическое обучение\n- Передовое рабочее место и профессиональные инструменты разработки\n- Дизайнерские офисы с зонами комфорта\n- Бесплатное питание и полностью оборудованная кухня\n- Корпоративные мероприятия и team building активности\n- Гибкий график и гибридная работа	t	f	2025-07-06	\N	\N	2025-07-06 07:12:32.992002	2025-07-06 08:00:32.867462	- פיתוח ממשקי משתמש עבור אפליקציות בנקאיות\n- אימפלמנטציה של עיצובים ו-UI/UX\n- אופטימיזציה של ביצועים והרפונסיביות\n- שיתוף פעולה עם צוות הבק-אנד לאינטגרציה\n- כתיבת קוד נקי ומתועד עם בדיקות\n- השתתפות בסקירות קוד ותהליכי פיתוח	- Develop user interfaces for banking applications\n- Implement designs and UI/UX\n- Optimize performance and responsiveness\n- Collaborate with backend team for integration\n- Write clean, documented code with tests\n- Participate in code reviews and development processes	- Разработка пользовательских интерфейсов для банковских приложений\n- Реализация дизайнов и UI/UX\n- Оптимизация производительности и отзывчивости\n- Сотрудничество с backend командой для интеграции\n- Написание чистого, документированного кода с тестами\n- Участие в код-ревью и процессах разработки	- ניסיון עם Next.js או מסגרות React מתקדמות\n- הכרות עם state management (Redux, Zustand)\n- ניסיון עם testing frameworks (Jest, Cypress)\n- הכרות עם build tools (Webpack, Vite)\n- ניסיון עם progressive web apps (PWA)\n- הכרות עם web performance optimization	- Experience with Next.js or advanced React frameworks\n- Knowledge of state management (Redux, Zustand)\n- Experience with testing frameworks (Jest, Cypress)\n- Familiarity with build tools (Webpack, Vite)\n- Experience with progressive web apps (PWA)\n- Knowledge of web performance optimization	- Опыт работы с Next.js или продвинутыми React frameworks\n- Знание state management (Redux, Zustand)\n- Опыт работы с testing frameworks (Jest, Cypress)\n- Знание build tools (Webpack, Vite)\n- Опыт работы с progressive web apps (PWA)\n- Знание web performance optimization
\.


--
-- Data for Name: vacancy_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacancy_applications (id, vacancy_id, applicant_name, applicant_email, applicant_phone, cover_letter, resume_file_path, portfolio_url, application_status, applied_at, reviewed_at, reviewed_by, notes, created_at, updated_at, applicant_city, expected_salary) FROM stdin;
1	1	Test User	test2@example.com	0541234567	Test application	\N	https://portfolio.com	pending	2025-07-06 09:13:26.66591	\N	\N	\N	2025-07-06 09:13:26.66591	2025-07-06 09:13:26.66591	Tel Aviv	15000
2	1	asdasd	345287@gmail.com	0544345287		resume-1751793290308-547952564.pdf		pending	2025-07-06 09:15:06.915685	\N	\N	\N	2025-07-06 09:15:06.915685	2025-07-06 09:15:06.915685	Netanya	8000
3	1	asdasd	34528ddd7@gmail.com	0544345287		resume-1751794070324-364021516.pdf		pending	2025-07-06 09:27:51.561911	\N	\N	\N	2025-07-06 09:27:51.561911	2025-07-06 09:27:51.561911	Netanya	8000
4	1	Michael Mishaev	3452aaaaa87@gmail.com	0544345287		resume-1751794781301-114687701.pdf		pending	2025-07-06 09:39:47.801669	\N	\N	\N	2025-07-06 09:39:47.801669	2025-07-06 09:39:47.801669	Netanya	8000
5	1	asdasd	34528fdfssfsd7@gmail.com	0544345287		resume-1751796413846-733696235.pdf		pending	2025-07-06 10:06:54.82833	\N	\N	\N	2025-07-06 10:06:54.82833	2025-07-06 10:06:54.82833	Netanya	8000
\.


--
-- Data for Name: worker_approval_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_approval_queue (id, employee_id, submitted_at, reviewed_at, reviewed_by, approval_status, rejection_reason, admin_notes, priority, auto_approve_eligible, created_at, updated_at) FROM stdin;
\.


--
-- Name: 11111_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."11111_id_seq"', 1, false);


--
-- Name: admin_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_audit_log_id_seq', 3, true);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 9, true);


--
-- Name: application_contexts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_contexts_id_seq', 4, true);


--
-- Name: approval_matrix_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.approval_matrix_id_seq', 1, false);


--
-- Name: bank_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_analytics_id_seq', 1, false);


--
-- Name: bank_branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_branches_id_seq', 1, false);


--
-- Name: bank_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_config_id_seq', 1, true);


--
-- Name: bank_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_configurations_id_seq', 36, true);


--
-- Name: bank_employee_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_employee_sessions_id_seq', 1, false);


--
-- Name: bank_employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_employees_id_seq', 1, false);


--
-- Name: bank_fallback_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_fallback_config_id_seq', 1, true);


--
-- Name: bank_standards_overrides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_standards_overrides_id_seq', 1, false);


--
-- Name: banking_standards_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banking_standards_history_id_seq', 89, true);


--
-- Name: banking_standards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banking_standards_id_seq', 75, true);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 93, true);


--
-- Name: calculation_parameters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calculation_parameters_id_seq', 10, true);


--
-- Name: calculation_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calculation_rules_id_seq', 1, false);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cities_id_seq', 30, true);


--
-- Name: client_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_assets_id_seq', 1, false);


--
-- Name: client_credit_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_credit_history_id_seq', 1, false);


--
-- Name: client_debts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_debts_id_seq', 1, false);


--
-- Name: client_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_documents_id_seq', 1, false);


--
-- Name: client_employment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_employment_id_seq', 1, false);


--
-- Name: client_form_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_form_sessions_id_seq', 353, true);


--
-- Name: client_identity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_identity_id_seq', 1, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 473, true);


--
-- Name: content_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_items_id_seq', 965, true);


--
-- Name: content_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_test_id_seq', 1, true);


--
-- Name: content_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_translations_id_seq', 2749, true);


--
-- Name: interest_rate_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interest_rate_rules_id_seq', 120, true);


--
-- Name: israeli_bank_numbers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.israeli_bank_numbers_id_seq', 19, true);


--
-- Name: lawyer_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lawyer_applications_id_seq', 1, true);


--
-- Name: loan_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loan_applications_id_seq', 1, true);


--
-- Name: loan_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loan_calculations_id_seq', 1, false);


--
-- Name: locales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locales_id_seq', 2657, true);


--
-- Name: mortgage_calculation_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mortgage_calculation_cache_id_seq', 1, false);


--
-- Name: params_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.params_id_seq', 36, true);


--
-- Name: professions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.professions_id_seq', 21, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.properties_id_seq', 1, false);


--
-- Name: property_ownership_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.property_ownership_options_id_seq', 3, true);


--
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.regions_id_seq', 8, true);


--
-- Name: registration_form_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registration_form_config_id_seq', 42, true);


--
-- Name: registration_invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registration_invitations_id_seq', 1, false);


--
-- Name: registration_validation_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registration_validation_rules_id_seq', 14, true);


--
-- Name: risk_parameters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.risk_parameters_id_seq', 72, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 5, true);


--
-- Name: test1_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test1_id_seq', 1, true);


--
-- Name: test_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_users_id_seq', 5, true);


--
-- Name: tttt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tttt_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 367, true);


--
-- Name: vacancies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacancies_id_seq', 3, true);


--
-- Name: vacancy_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacancy_applications_id_seq', 5, true);


--
-- Name: worker_approval_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.worker_approval_queue_id_seq', 1, false);


--
-- Name: 11111 11111_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."11111"
    ADD CONSTRAINT "11111_pkey" PRIMARY KEY (id);


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


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
-- Name: application_contexts application_contexts_context_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_contexts
    ADD CONSTRAINT application_contexts_context_code_key UNIQUE (context_code);


--
-- Name: application_contexts application_contexts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_contexts
    ADD CONSTRAINT application_contexts_pkey PRIMARY KEY (id);


--
-- Name: approval_matrix approval_matrix_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_matrix
    ADD CONSTRAINT approval_matrix_pkey PRIMARY KEY (id);


--
-- Name: bank_analytics bank_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_analytics
    ADD CONSTRAINT bank_analytics_pkey PRIMARY KEY (id);


--
-- Name: bank_branches bank_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_branches
    ADD CONSTRAINT bank_branches_pkey PRIMARY KEY (id);


--
-- Name: bank_config bank_config_bank_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_config
    ADD CONSTRAINT bank_config_bank_id_key UNIQUE (bank_id);


--
-- Name: bank_config bank_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_config
    ADD CONSTRAINT bank_config_pkey PRIMARY KEY (id);


--
-- Name: bank_configurations bank_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_pkey PRIMARY KEY (id);


--
-- Name: bank_employee_sessions bank_employee_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employee_sessions
    ADD CONSTRAINT bank_employee_sessions_pkey PRIMARY KEY (id);


--
-- Name: bank_employee_sessions bank_employee_sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employee_sessions
    ADD CONSTRAINT bank_employee_sessions_token_key UNIQUE (token);


--
-- Name: bank_employees bank_employees_corporate_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employees
    ADD CONSTRAINT bank_employees_corporate_email_key UNIQUE (corporate_email);


--
-- Name: bank_employees bank_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employees
    ADD CONSTRAINT bank_employees_pkey PRIMARY KEY (id);


--
-- Name: bank_fallback_config bank_fallback_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_fallback_config
    ADD CONSTRAINT bank_fallback_config_pkey PRIMARY KEY (id);


--
-- Name: bank_standards_overrides bank_standards_overrides_bank_id_banking_standard_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_standards_overrides
    ADD CONSTRAINT bank_standards_overrides_bank_id_banking_standard_id_key UNIQUE (bank_id, banking_standard_id);


--
-- Name: bank_standards_overrides bank_standards_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_standards_overrides
    ADD CONSTRAINT bank_standards_overrides_pkey PRIMARY KEY (id);


--
-- Name: banking_standards banking_standards_business_path_standard_category_standard__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards
    ADD CONSTRAINT banking_standards_business_path_standard_category_standard__key UNIQUE (business_path, standard_category, standard_name);


--
-- Name: banking_standards_history banking_standards_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards_history
    ADD CONSTRAINT banking_standards_history_pkey PRIMARY KEY (id);


--
-- Name: banking_standards banking_standards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards
    ADD CONSTRAINT banking_standards_pkey PRIMARY KEY (id);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: calculation_parameters calculation_parameters_parameter_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_parameters
    ADD CONSTRAINT calculation_parameters_parameter_name_key UNIQUE (parameter_name);


--
-- Name: calculation_parameters calculation_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_parameters
    ADD CONSTRAINT calculation_parameters_pkey PRIMARY KEY (id);


--
-- Name: calculation_rules calculation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_rules
    ADD CONSTRAINT calculation_rules_pkey PRIMARY KEY (id);


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
-- Name: client_assets client_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_assets
    ADD CONSTRAINT client_assets_pkey PRIMARY KEY (id);


--
-- Name: client_credit_history client_credit_history_client_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_credit_history
    ADD CONSTRAINT client_credit_history_client_id_key UNIQUE (client_id);


--
-- Name: client_credit_history client_credit_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_credit_history
    ADD CONSTRAINT client_credit_history_pkey PRIMARY KEY (id);


--
-- Name: client_debts client_debts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_debts
    ADD CONSTRAINT client_debts_pkey PRIMARY KEY (id);


--
-- Name: client_documents client_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_pkey PRIMARY KEY (id);


--
-- Name: client_employment client_employment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_employment
    ADD CONSTRAINT client_employment_pkey PRIMARY KEY (id);


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
-- Name: client_identity client_identity_client_id_id_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_identity
    ADD CONSTRAINT client_identity_client_id_id_type_key UNIQUE (client_id, id_type);


--
-- Name: client_identity client_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_identity
    ADD CONSTRAINT client_identity_pkey PRIMARY KEY (id);


--
-- Name: clients clients_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_unique UNIQUE (email);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: content_items content_items_key_screen_location_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_key_screen_location_key UNIQUE (content_key, screen_location);


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
-- Name: interest_rate_rules interest_rate_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interest_rate_rules
    ADD CONSTRAINT interest_rate_rules_pkey PRIMARY KEY (id);


--
-- Name: israeli_bank_numbers israeli_bank_numbers_bank_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.israeli_bank_numbers
    ADD CONSTRAINT israeli_bank_numbers_bank_number_key UNIQUE (bank_number);


--
-- Name: israeli_bank_numbers israeli_bank_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.israeli_bank_numbers
    ADD CONSTRAINT israeli_bank_numbers_pkey PRIMARY KEY (id);


--
-- Name: lawyer_applications lawyer_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lawyer_applications
    ADD CONSTRAINT lawyer_applications_pkey PRIMARY KEY (id);


--
-- Name: loan_applications loan_applications_application_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_application_number_key UNIQUE (application_number);


--
-- Name: loan_applications loan_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_pkey PRIMARY KEY (id);


--
-- Name: loan_calculations loan_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_calculations
    ADD CONSTRAINT loan_calculations_pkey PRIMARY KEY (id);


--
-- Name: locales locales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locales
    ADD CONSTRAINT locales_pkey PRIMARY KEY (id);


--
-- Name: mortgage_calculation_cache mortgage_calculation_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mortgage_calculation_cache
    ADD CONSTRAINT mortgage_calculation_cache_pkey PRIMARY KEY (id);


--
-- Name: params params_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.params
    ADD CONSTRAINT params_key_key UNIQUE (key);


--
-- Name: params params_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.params
    ADD CONSTRAINT params_pkey PRIMARY KEY (id);


--
-- Name: professions professions_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_key_key UNIQUE (key);


--
-- Name: professions professions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_ownership_options property_ownership_options_option_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_ownership_options
    ADD CONSTRAINT property_ownership_options_option_key_key UNIQUE (option_key);


--
-- Name: property_ownership_options property_ownership_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_ownership_options
    ADD CONSTRAINT property_ownership_options_pkey PRIMARY KEY (id);


--
-- Name: regions regions_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_key_key UNIQUE (key);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: registration_form_config registration_form_config_language_field_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_form_config
    ADD CONSTRAINT registration_form_config_language_field_name_key UNIQUE (language, field_name);


--
-- Name: registration_form_config registration_form_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_form_config
    ADD CONSTRAINT registration_form_config_pkey PRIMARY KEY (id);


--
-- Name: registration_invitations registration_invitations_invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations
    ADD CONSTRAINT registration_invitations_invitation_token_key UNIQUE (invitation_token);


--
-- Name: registration_invitations registration_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations
    ADD CONSTRAINT registration_invitations_pkey PRIMARY KEY (id);


--
-- Name: registration_validation_rules registration_validation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_validation_rules
    ADD CONSTRAINT registration_validation_rules_pkey PRIMARY KEY (id);


--
-- Name: risk_parameters risk_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_parameters
    ADD CONSTRAINT risk_parameters_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_service_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_service_key_key UNIQUE (service_key);


--
-- Name: test1 test1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test1
    ADD CONSTRAINT test1_pkey PRIMARY KEY (id);


--
-- Name: test_users test_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_users
    ADD CONSTRAINT test_users_email_key UNIQUE (email);


--
-- Name: test_users test_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_users
    ADD CONSTRAINT test_users_pkey PRIMARY KEY (id);


--
-- Name: tttt tttt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tttt
    ADD CONSTRAINT tttt_pkey PRIMARY KEY (id);


--
-- Name: registration_validation_rules uk_validation_rules; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_validation_rules
    ADD CONSTRAINT uk_validation_rules UNIQUE (country_code, language_code, field_name, validation_type);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vacancies vacancies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancies
    ADD CONSTRAINT vacancies_pkey PRIMARY KEY (id);


--
-- Name: vacancy_applications vacancy_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_applications
    ADD CONSTRAINT vacancy_applications_pkey PRIMARY KEY (id);


--
-- Name: worker_approval_queue worker_approval_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_approval_queue
    ADD CONSTRAINT worker_approval_queue_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_audit_log_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log USING btree (action);


--
-- Name: idx_admin_audit_log_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log USING btree (created_at);


--
-- Name: idx_admin_audit_log_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_log_table ON public.admin_audit_log USING btree (table_name);


--
-- Name: idx_admin_audit_log_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_log_user_id ON public.admin_audit_log USING btree (user_id);


--
-- Name: idx_admin_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_active ON public.admin_users USING btree (is_active);


--
-- Name: idx_admin_users_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_bank_id ON public.admin_users USING btree (bank_id);


--
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);


--
-- Name: idx_admin_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_role ON public.admin_users USING btree (role);


--
-- Name: idx_bank_analytics_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_analytics_bank_id ON public.bank_analytics USING btree (bank_id);


--
-- Name: idx_bank_analytics_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_analytics_date ON public.bank_analytics USING btree (period_date);


--
-- Name: idx_bank_analytics_metric; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_analytics_metric ON public.bank_analytics USING btree (metric_type);


--
-- Name: idx_bank_branches_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_branches_bank_id ON public.bank_branches USING btree (bank_id);


--
-- Name: idx_bank_branches_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_branches_is_active ON public.bank_branches USING btree (is_active);


--
-- Name: idx_bank_configurations_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_configurations_active ON public.bank_configurations USING btree (is_active);


--
-- Name: idx_bank_configurations_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_configurations_bank_id ON public.bank_configurations USING btree (bank_id);


--
-- Name: idx_bank_configurations_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_configurations_product ON public.bank_configurations USING btree (product_type);


--
-- Name: idx_bank_employees_approval_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_approval_status ON public.bank_employees USING btree (approval_status);


--
-- Name: idx_bank_employees_auto_delete; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_auto_delete ON public.bank_employees USING btree (auto_delete_after);


--
-- Name: idx_bank_employees_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_bank_id ON public.bank_employees USING btree (bank_id);


--
-- Name: idx_bank_employees_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_email ON public.bank_employees USING btree (corporate_email);


--
-- Name: idx_bank_employees_invitation_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_invitation_token ON public.bank_employees USING btree (invitation_token);


--
-- Name: idx_bank_employees_last_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_last_activity ON public.bank_employees USING btree (last_activity_at);


--
-- Name: idx_bank_employees_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_employees_status ON public.bank_employees USING btree (status);


--
-- Name: idx_banking_standards_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_active ON public.banking_standards USING btree (is_active);


--
-- Name: idx_banking_standards_business_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_business_path ON public.banking_standards USING btree (business_path);


--
-- Name: idx_banking_standards_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_category ON public.banking_standards USING btree (standard_category);


--
-- Name: idx_banking_standards_dti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_dti ON public.banking_standards USING btree (standard_category) WHERE ((standard_category)::text = 'dti'::text);


--
-- Name: INDEX idx_banking_standards_dti; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_banking_standards_dti IS 'Fast lookup for DTI configuration values';


--
-- Name: idx_banking_standards_history_business_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_history_business_path ON public.banking_standards_history USING btree (business_path);


--
-- Name: idx_banking_standards_history_change_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_history_change_type ON public.banking_standards_history USING btree (change_type);


--
-- Name: idx_banking_standards_history_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_history_changed_at ON public.banking_standards_history USING btree (changed_at);


--
-- Name: idx_banking_standards_history_changed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_history_changed_by ON public.banking_standards_history USING btree (changed_by);


--
-- Name: idx_banking_standards_history_standard_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_history_standard_id ON public.banking_standards_history USING btree (banking_standard_id);


--
-- Name: idx_banking_standards_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_lookup ON public.banking_standards USING btree (business_path, standard_category, standard_name) WHERE (is_active = true);


--
-- Name: idx_banking_standards_property_ownership; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banking_standards_property_ownership ON public.banking_standards USING btree (standard_category) WHERE ((standard_category)::text = 'property_ownership_ltv'::text);


--
-- Name: INDEX idx_banking_standards_property_ownership; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_banking_standards_property_ownership IS 'Fast lookup for property ownership LTV ratios';


--
-- Name: idx_banks_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banks_display_order ON public.banks USING btree (display_order);


--
-- Name: idx_banks_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banks_is_active ON public.banks USING btree (is_active);


--
-- Name: idx_calculation_cache_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calculation_cache_expires_at ON public.mortgage_calculation_cache USING btree (expires_at);


--
-- Name: idx_calculation_cache_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calculation_cache_session_id ON public.mortgage_calculation_cache USING btree (session_id);


--
-- Name: idx_calculation_parameters_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calculation_parameters_name ON public.calculation_parameters USING btree (parameter_name);


--
-- Name: idx_client_assets_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_assets_client_id ON public.client_assets USING btree (client_id);


--
-- Name: idx_client_credit_history_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_credit_history_client_id ON public.client_credit_history USING btree (client_id);


--
-- Name: idx_client_debts_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_debts_client_id ON public.client_debts USING btree (client_id);


--
-- Name: idx_client_documents_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_documents_client_id ON public.client_documents USING btree (client_id);


--
-- Name: idx_client_employment_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_employment_client_id ON public.client_employment USING btree (client_id);


--
-- Name: idx_client_identity_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_identity_client_id ON public.client_identity USING btree (client_id);


--
-- Name: idx_client_identity_id_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_identity_id_number ON public.client_identity USING btree (id_number);


--
-- Name: idx_clients_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_email ON public.clients USING btree (email);


--
-- Name: idx_clients_is_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_is_staff ON public.clients USING btree (is_staff);


--
-- Name: idx_clients_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_role ON public.clients USING btree (role);


--
-- Name: idx_content_items_app_context; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_app_context ON public.content_items USING btree (app_context_id);


--
-- Name: idx_content_items_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_key ON public.content_items USING btree (content_key);


--
-- Name: idx_content_items_screen_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_screen_location ON public.content_items USING btree (screen_location);


--
-- Name: idx_content_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_status ON public.content_items USING btree (status);


--
-- Name: idx_content_translations_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_language ON public.content_translations USING btree (language_code);


--
-- Name: idx_content_translations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_status ON public.content_translations USING btree (status);


--
-- Name: idx_employee_sessions_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_sessions_expires ON public.bank_employee_sessions USING btree (expires_at);


--
-- Name: idx_employee_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_sessions_token ON public.bank_employee_sessions USING btree (token);


--
-- Name: idx_form_sessions_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_sessions_client_id ON public.client_form_sessions USING btree (client_id);


--
-- Name: idx_form_sessions_current_step; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_sessions_current_step ON public.client_form_sessions USING btree (current_step);


--
-- Name: idx_form_sessions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_sessions_expires_at ON public.client_form_sessions USING btree (expires_at);


--
-- Name: idx_form_sessions_ip_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_sessions_ip_address ON public.client_form_sessions USING btree (ip_address);


--
-- Name: idx_form_sessions_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_sessions_session_id ON public.client_form_sessions USING btree (session_id);


--
-- Name: idx_interest_rate_rules_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interest_rate_rules_active ON public.interest_rate_rules USING btree (is_active);


--
-- Name: idx_interest_rate_rules_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interest_rate_rules_bank_id ON public.interest_rate_rules USING btree (bank_id);


--
-- Name: idx_interest_rate_rules_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interest_rate_rules_type ON public.interest_rate_rules USING btree (rule_type);


--
-- Name: idx_loan_applications_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loan_applications_client_id ON public.loan_applications USING btree (client_id);


--
-- Name: idx_loan_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loan_applications_status ON public.loan_applications USING btree (application_status);


--
-- Name: idx_loan_calculations_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loan_calculations_client_id ON public.loan_calculations USING btree (client_id);


--
-- Name: idx_professions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professions_active ON public.professions USING btree (is_active);


--
-- Name: idx_professions_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professions_category ON public.professions USING btree (category);


--
-- Name: idx_professions_name_en; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professions_name_en ON public.professions USING btree (name_en);


--
-- Name: idx_professions_name_he; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professions_name_he ON public.professions USING btree (name_he);


--
-- Name: idx_professions_name_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professions_name_ru ON public.professions USING btree (name_ru);


--
-- Name: idx_properties_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_properties_client_id ON public.properties USING btree (client_id);


--
-- Name: idx_property_ownership_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_property_ownership_key ON public.property_ownership_options USING btree (option_key);


--
-- Name: idx_regions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_active ON public.regions USING btree (is_active);


--
-- Name: idx_regions_name_en; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_name_en ON public.regions USING btree (name_en);


--
-- Name: idx_regions_name_he; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_name_he ON public.regions USING btree (name_he);


--
-- Name: idx_regions_name_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_regions_name_ru ON public.regions USING btree (name_ru);


--
-- Name: idx_registration_invitations_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registration_invitations_bank_id ON public.registration_invitations USING btree (bank_id);


--
-- Name: idx_registration_invitations_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registration_invitations_email ON public.registration_invitations USING btree (email);


--
-- Name: idx_registration_invitations_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registration_invitations_expires ON public.registration_invitations USING btree (expires_at);


--
-- Name: idx_registration_invitations_invited_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registration_invitations_invited_by ON public.registration_invitations USING btree (invited_by);


--
-- Name: idx_registration_invitations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registration_invitations_status ON public.registration_invitations USING btree (status);


--
-- Name: idx_registration_invitations_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registration_invitations_token ON public.registration_invitations USING btree (invitation_token);


--
-- Name: idx_risk_parameters_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_risk_parameters_active ON public.risk_parameters USING btree (is_active);


--
-- Name: idx_risk_parameters_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_risk_parameters_bank_id ON public.risk_parameters USING btree (bank_id);


--
-- Name: idx_risk_parameters_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_risk_parameters_type ON public.risk_parameters USING btree (parameter_type);


--
-- Name: idx_services_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_active ON public.services USING btree (is_active);


--
-- Name: idx_services_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_display_order ON public.services USING btree (display_order);


--
-- Name: idx_services_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_key ON public.services USING btree (service_key);


--
-- Name: idx_vacancies_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancies_active ON public.vacancies USING btree (is_active);


--
-- Name: idx_vacancies_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancies_category ON public.vacancies USING btree (category);


--
-- Name: idx_vacancies_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancies_featured ON public.vacancies USING btree (is_featured);


--
-- Name: idx_vacancies_posted_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancies_posted_date ON public.vacancies USING btree (posted_date);


--
-- Name: idx_vacancy_applications_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancy_applications_email ON public.vacancy_applications USING btree (applicant_email);


--
-- Name: idx_vacancy_applications_resume_file; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancy_applications_resume_file ON public.vacancy_applications USING btree (resume_file_path) WHERE (resume_file_path IS NOT NULL);


--
-- Name: idx_vacancy_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancy_applications_status ON public.vacancy_applications USING btree (application_status);


--
-- Name: idx_vacancy_applications_vacancy_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vacancy_applications_vacancy_id ON public.vacancy_applications USING btree (vacancy_id);


--
-- Name: idx_validation_rules_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_validation_rules_active ON public.registration_validation_rules USING btree (is_active);


--
-- Name: idx_validation_rules_country_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_validation_rules_country_lang ON public.registration_validation_rules USING btree (country_code, language_code);


--
-- Name: idx_validation_rules_field_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_validation_rules_field_name ON public.registration_validation_rules USING btree (field_name);


--
-- Name: idx_worker_approval_queue_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_approval_queue_employee_id ON public.worker_approval_queue USING btree (employee_id);


--
-- Name: idx_worker_approval_queue_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_approval_queue_priority ON public.worker_approval_queue USING btree (priority);


--
-- Name: idx_worker_approval_queue_reviewed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_approval_queue_reviewed_by ON public.worker_approval_queue USING btree (reviewed_by);


--
-- Name: idx_worker_approval_queue_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_approval_queue_status ON public.worker_approval_queue USING btree (approval_status);


--
-- Name: idx_worker_approval_queue_submitted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_approval_queue_submitted ON public.worker_approval_queue USING btree (submitted_at);


--
-- Name: bank_worker_statistics _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW public.bank_worker_statistics AS
 SELECT b.id AS bank_id,
    b.name_en AS bank_name,
    count(
        CASE
            WHEN (be.status = 'active'::text) THEN 1
            ELSE NULL::integer
        END) AS active_workers,
    count(
        CASE
            WHEN (be.status = 'pending'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_workers,
    count(
        CASE
            WHEN ((waq.approval_status)::text = 'pending'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_approvals,
    count(
        CASE
            WHEN (((ri.status)::text = 'pending'::text) AND (ri.expires_at > CURRENT_TIMESTAMP)) THEN 1
            ELSE NULL::integer
        END) AS active_invitations,
    max(be.last_activity_at) AS last_worker_activity
   FROM (((public.banks b
     LEFT JOIN public.bank_employees be ON ((b.id = be.bank_id)))
     LEFT JOIN public.worker_approval_queue waq ON (((be.id = waq.employee_id) AND ((waq.approval_status)::text = 'pending'::text))))
     LEFT JOIN public.registration_invitations ri ON (((b.id = ri.bank_id) AND ((ri.status)::text = 'pending'::text))))
  WHERE (b.is_active = true)
  GROUP BY b.id, b.name_en
  ORDER BY b.display_order, b.name_en;


--
-- Name: banking_standards audit_banking_standards_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_banking_standards_changes AFTER INSERT OR DELETE OR UPDATE ON public.banking_standards FOR EACH ROW EXECUTE FUNCTION public.log_banking_standards_change();


--
-- Name: admin_users trigger_admin_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: application_contexts trigger_application_contexts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_application_contexts_updated_at BEFORE UPDATE ON public.application_contexts FOR EACH ROW EXECUTE FUNCTION public.update_application_contexts_updated_at();


--
-- Name: client_form_sessions trigger_auto_calculate_ltv; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_auto_calculate_ltv BEFORE INSERT OR UPDATE ON public.client_form_sessions FOR EACH ROW EXECUTE FUNCTION public.auto_calculate_ltv();


--
-- Name: bank_configurations trigger_bank_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_bank_configurations_updated_at BEFORE UPDATE ON public.bank_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bank_employees trigger_bank_employees_approval_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_bank_employees_approval_changes BEFORE UPDATE ON public.bank_employees FOR EACH ROW EXECUTE FUNCTION public.handle_approval_status_change();


--
-- Name: interest_rate_rules trigger_interest_rate_rules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_interest_rate_rules_updated_at BEFORE UPDATE ON public.interest_rate_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: registration_invitations trigger_registration_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_registration_invitations_updated_at BEFORE UPDATE ON public.registration_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: risk_parameters trigger_risk_parameters_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_risk_parameters_updated_at BEFORE UPDATE ON public.risk_parameters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_form_sessions trigger_update_form_sessions_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_form_sessions_timestamp BEFORE UPDATE ON public.client_form_sessions FOR EACH ROW EXECUTE FUNCTION public.update_form_session_timestamp();


--
-- Name: professions trigger_update_professions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_professions_updated_at BEFORE UPDATE ON public.professions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: regions trigger_update_regions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vacancies trigger_update_vacancies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_vacancies_updated_at BEFORE UPDATE ON public.vacancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vacancy_applications trigger_update_vacancy_applications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_vacancy_applications_updated_at BEFORE UPDATE ON public.vacancy_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: registration_validation_rules trigger_validation_rules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_validation_rules_updated_at BEFORE UPDATE ON public.registration_validation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worker_approval_queue trigger_worker_approval_queue_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_worker_approval_queue_updated_at BEFORE UPDATE ON public.worker_approval_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_items update_content_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_translations update_content_translations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON public.content_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_audit_log admin_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id);


--
-- Name: admin_users admin_users_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: admin_users admin_users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id);


--
-- Name: bank_analytics bank_analytics_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_analytics
    ADD CONSTRAINT bank_analytics_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: bank_branches bank_branches_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_branches
    ADD CONSTRAINT bank_branches_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: bank_config bank_config_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_config
    ADD CONSTRAINT bank_config_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: bank_configurations bank_configurations_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: bank_configurations bank_configurations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id);


--
-- Name: bank_employee_sessions bank_employee_sessions_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employee_sessions
    ADD CONSTRAINT bank_employee_sessions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.bank_employees(id) ON DELETE CASCADE;


--
-- Name: bank_employees bank_employees_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employees
    ADD CONSTRAINT bank_employees_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: bank_employees bank_employees_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employees
    ADD CONSTRAINT bank_employees_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: bank_employees bank_employees_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_employees
    ADD CONSTRAINT bank_employees_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.bank_branches(id) ON DELETE SET NULL;


--
-- Name: bank_standards_overrides bank_standards_overrides_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_standards_overrides
    ADD CONSTRAINT bank_standards_overrides_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: bank_standards_overrides bank_standards_overrides_banking_standard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_standards_overrides
    ADD CONSTRAINT bank_standards_overrides_banking_standard_id_fkey FOREIGN KEY (banking_standard_id) REFERENCES public.banking_standards(id) ON DELETE CASCADE;


--
-- Name: banking_standards_history banking_standards_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards_history
    ADD CONSTRAINT banking_standards_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: calculation_parameters calculation_parameters_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_parameters
    ADD CONSTRAINT calculation_parameters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: client_assets client_assets_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_assets
    ADD CONSTRAINT client_assets_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_credit_history client_credit_history_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_credit_history
    ADD CONSTRAINT client_credit_history_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_debts client_debts_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_debts
    ADD CONSTRAINT client_debts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_documents client_documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.loan_applications(id) ON DELETE CASCADE;


--
-- Name: client_documents client_documents_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_documents client_documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: client_employment client_employment_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_employment
    ADD CONSTRAINT client_employment_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_form_sessions client_form_sessions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_form_sessions
    ADD CONSTRAINT client_form_sessions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_identity client_identity_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_identity
    ADD CONSTRAINT client_identity_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: content_translations content_translations_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_items fk_content_items_app_context; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT fk_content_items_app_context FOREIGN KEY (app_context_id) REFERENCES public.application_contexts(id);


--
-- Name: interest_rate_rules interest_rate_rules_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interest_rate_rules
    ADD CONSTRAINT interest_rate_rules_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: interest_rate_rules interest_rate_rules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interest_rate_rules
    ADD CONSTRAINT interest_rate_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id);


--
-- Name: loan_applications loan_applications_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: loan_applications loan_applications_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE SET NULL;


--
-- Name: loan_applications loan_applications_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: loan_applications loan_applications_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;


--
-- Name: loan_calculations loan_calculations_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_calculations
    ADD CONSTRAINT loan_calculations_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.loan_applications(id) ON DELETE CASCADE;


--
-- Name: loan_calculations loan_calculations_calculated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_calculations
    ADD CONSTRAINT loan_calculations_calculated_by_fkey FOREIGN KEY (calculated_by) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: loan_calculations loan_calculations_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_calculations
    ADD CONSTRAINT loan_calculations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: mortgage_calculation_cache mortgage_calculation_cache_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mortgage_calculation_cache
    ADD CONSTRAINT mortgage_calculation_cache_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.client_form_sessions(session_id) ON DELETE CASCADE;


--
-- Name: properties properties_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: registration_invitations registration_invitations_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations
    ADD CONSTRAINT registration_invitations_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: registration_invitations registration_invitations_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations
    ADD CONSTRAINT registration_invitations_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.bank_branches(id) ON DELETE SET NULL;


--
-- Name: registration_invitations registration_invitations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations
    ADD CONSTRAINT registration_invitations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.bank_employees(id) ON DELETE SET NULL;


--
-- Name: registration_invitations registration_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_invitations
    ADD CONSTRAINT registration_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.admin_users(id) ON DELETE CASCADE;


--
-- Name: risk_parameters risk_parameters_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_parameters
    ADD CONSTRAINT risk_parameters_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE CASCADE;


--
-- Name: risk_parameters risk_parameters_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_parameters
    ADD CONSTRAINT risk_parameters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id);


--
-- Name: vacancies vacancies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancies
    ADD CONSTRAINT vacancies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: vacancy_applications vacancy_applications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_applications
    ADD CONSTRAINT vacancy_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: vacancy_applications vacancy_applications_vacancy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_applications
    ADD CONSTRAINT vacancy_applications_vacancy_id_fkey FOREIGN KEY (vacancy_id) REFERENCES public.vacancies(id) ON DELETE CASCADE;


--
-- Name: worker_approval_queue worker_approval_queue_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_approval_queue
    ADD CONSTRAINT worker_approval_queue_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.bank_employees(id) ON DELETE CASCADE;


--
-- Name: worker_approval_queue worker_approval_queue_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_approval_queue
    ADD CONSTRAINT worker_approval_queue_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

