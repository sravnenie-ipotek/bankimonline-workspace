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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bank_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_configurations (
    id integer NOT NULL,
    bank_id integer NOT NULL,
    product_type character varying(50) DEFAULT 'mortgage'::character varying,
    base_interest_rate numeric(5,3) NOT NULL,
    min_interest_rate numeric(5,3),
    max_interest_rate numeric(5,3),
    max_ltv_ratio numeric(5,2) NOT NULL,
    min_credit_score integer NOT NULL,
    max_loan_amount numeric(15,2),
    min_loan_amount numeric(15,2),
    processing_fee numeric(10,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: bank_offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_offers (
    id integer NOT NULL,
    application_id integer NOT NULL,
    bank_id integer NOT NULL,
    interest_rate numeric(5,3) NOT NULL,
    monthly_payment numeric(10,2) NOT NULL,
    total_payment numeric(15,2) NOT NULL,
    loan_term integer NOT NULL,
    approval_status character varying(20) DEFAULT 'approved'::character varying,
    ltv_ratio numeric(5,2) NOT NULL,
    dti_ratio numeric(5,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bank_offers OWNER TO postgres;

--
-- Name: bank_offers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_offers_id_seq OWNER TO postgres;

--
-- Name: bank_offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_offers_id_seq OWNED BY public.bank_offers.id;


--
-- Name: banking_standards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banking_standards (
    id integer NOT NULL,
    business_path character varying(100) NOT NULL,
    standard_category character varying(100) NOT NULL,
    standard_name character varying(100) NOT NULL,
    standard_value character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banking_standards OWNER TO postgres;

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
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    name_en character varying(255) NOT NULL,
    name_he character varying(255) NOT NULL,
    name_ru character varying(255) NOT NULL,
    url character varying(500),
    tender boolean DEFAULT true,
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banks OWNER TO postgres;

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
-- Name: calculation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculation_logs (
    id integer NOT NULL,
    application_id integer NOT NULL,
    bank_id integer NOT NULL,
    calculation_step character varying(100) NOT NULL,
    input_values jsonb,
    output_values jsonb,
    status character varying(20) DEFAULT 'success'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.calculation_logs OWNER TO postgres;

--
-- Name: calculation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculation_logs_id_seq OWNER TO postgres;

--
-- Name: calculation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculation_logs_id_seq OWNED BY public.calculation_logs.id;


--
-- Name: calculator_formula; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculator_formula (
    id integer NOT NULL,
    min_term character varying(10) NOT NULL,
    max_term character varying(10) NOT NULL,
    financing_percentage character varying(10) NOT NULL,
    bank_interest_rate character varying(10) NOT NULL,
    base_interest_rate character varying(10) NOT NULL,
    variable_interest_rate character varying(10) NOT NULL,
    interest_change_period character varying(10) NOT NULL,
    inflation_index character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.calculator_formula OWNER TO postgres;

--
-- Name: calculator_formula_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculator_formula_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculator_formula_id_seq OWNER TO postgres;

--
-- Name: calculator_formula_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculator_formula_id_seq OWNED BY public.calculator_formula.id;


--
-- Name: content_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_items (
    id integer NOT NULL,
    content_key character varying(255) NOT NULL,
    screen_location character varying(100) NOT NULL,
    component_type character varying(100) NOT NULL,
    category character varying(100),
    page_id integer,
    element_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: content_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_translations (
    id integer NOT NULL,
    content_item_id integer NOT NULL,
    language_code character varying(10) NOT NULL,
    field_name character varying(100) NOT NULL,
    content_value text,
    translation_text text,
    status character varying(50) DEFAULT 'approved'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_translations OWNER TO postgres;

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
-- Name: customer_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_applications (
    id integer NOT NULL,
    customer_id integer,
    loan_amount numeric(15,2) NOT NULL,
    down_payment numeric(15,2) NOT NULL,
    property_value numeric(15,2) NOT NULL,
    monthly_income numeric(10,2) NOT NULL,
    monthly_expenses numeric(10,2) NOT NULL,
    credit_score integer NOT NULL,
    employment_type character varying(50) NOT NULL,
    property_ownership character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer_applications OWNER TO postgres;

--
-- Name: customer_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_applications_id_seq OWNER TO postgres;

--
-- Name: customer_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_applications_id_seq OWNED BY public.customer_applications.id;


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
-- Name: ui_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ui_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ui_settings OWNER TO postgres;

--
-- Name: ui_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ui_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ui_settings_id_seq OWNER TO postgres;

--
-- Name: ui_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ui_settings_id_seq OWNED BY public.ui_settings.id;


--
-- Name: bank_configurations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations ALTER COLUMN id SET DEFAULT nextval('public.bank_configurations_id_seq'::regclass);


--
-- Name: bank_offers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_offers ALTER COLUMN id SET DEFAULT nextval('public.bank_offers_id_seq'::regclass);


--
-- Name: banking_standards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards ALTER COLUMN id SET DEFAULT nextval('public.banking_standards_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: calculation_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_logs ALTER COLUMN id SET DEFAULT nextval('public.calculation_logs_id_seq'::regclass);


--
-- Name: calculator_formula id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculator_formula ALTER COLUMN id SET DEFAULT nextval('public.calculator_formula_id_seq'::regclass);


--
-- Name: content_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_items ALTER COLUMN id SET DEFAULT nextval('public.content_items_id_seq'::regclass);


--
-- Name: content_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations ALTER COLUMN id SET DEFAULT nextval('public.content_translations_id_seq'::regclass);


--
-- Name: customer_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_applications ALTER COLUMN id SET DEFAULT nextval('public.customer_applications_id_seq'::regclass);


--
-- Name: test_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_users ALTER COLUMN id SET DEFAULT nextval('public.test_users_id_seq'::regclass);


--
-- Name: ui_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ui_settings ALTER COLUMN id SET DEFAULT nextval('public.ui_settings_id_seq'::regclass);


--
-- Data for Name: bank_configurations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_configurations (id, bank_id, product_type, base_interest_rate, min_interest_rate, max_interest_rate, max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, processing_fee, is_active, created_at, updated_at) FROM stdin;
1	1	mortgage	3.180	2.800	4.000	75.00	620	2000000.00	100000.00	1500.00	t	2025-07-15 23:14:51.445616	2025-07-15 23:14:51.445616
2	2	mortgage	3.250	2.900	4.100	80.00	640	2500000.00	150000.00	1200.00	t	2025-07-15 23:14:51.625367	2025-07-15 23:14:51.625367
4	4	mortgage	3.300	2.950	4.050	75.00	650	2300000.00	130000.00	1400.00	t	2025-07-15 23:14:52.017678	2025-07-15 23:14:52.017678
5	5	mortgage	3.200	2.850	3.950	82.00	620	2400000.00	110000.00	1600.00	t	2025-07-15 23:14:52.215699	2025-07-15 23:14:52.215699
3	3	mortgage	3.200	2.900	4.000	75.00	650	2500000.00	100000.00	1600.00	t	2025-07-15 23:14:51.825284	2025-07-15 23:22:15.651803
6	6	mortgage	8.600	3.100	4.300	70.00	660	1800000.00	80000.00	1700.00	t	2025-07-15 23:22:23.221541	2025-07-15 23:24:14.813034
\.


--
-- Data for Name: bank_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_offers (id, application_id, bank_id, interest_rate, monthly_payment, total_payment, loan_term, approval_status, ltv_ratio, dti_ratio, created_at) FROM stdin;
1	1	2	3.200	2666.67	960000.00	360	approved	76.92	10.67	2025-07-15 23:15:21.997081
2	1	5	3.150	2625.00	945000.00	360	approved	76.92	10.50	2025-07-15 23:15:23.114266
\.


--
-- Data for Name: banking_standards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banking_standards (id, business_path, standard_category, standard_name, standard_value, is_active, created_at, updated_at) FROM stdin;
1	mortgage	ltv	max_ltv_ratio	50.01	t	2025-07-15 23:14:52.507601	2025-07-15 23:14:52.507601
2	mortgage	credit	min_credit_score	620	t	2025-07-15 23:14:52.637316	2025-07-15 23:14:52.637316
3	mortgage	dti	max_front_dti	33.00	t	2025-07-15 23:14:52.837426	2025-07-15 23:14:52.837426
4	mortgage	dti	max_back_dti	42.00	t	2025-07-15 23:14:53.217364	2025-07-15 23:14:53.217364
5	mortgage	rate	base_interest_rate	3.50	t	2025-07-15 23:14:53.355482	2025-07-15 23:14:53.355482
6	mortgage	term	max_loan_term	360	t	2025-07-15 23:14:53.587367	2025-07-15 23:14:53.587367
7	mortgage	amount	min_loan_amount	100000	t	2025-07-15 23:14:53.737384	2025-07-15 23:14:53.737384
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, name_en, name_he, name_ru, url, tender, priority, is_active, created_at, updated_at) FROM stdin;
1	Bank Hapoalim	בנק הפועלים	Банк Апоалим	https://bankhapoalim.co.il	t	1	t	2025-07-15 23:14:49.567521	2025-07-15 23:14:49.567521
2	Bank Leumi	בנק לאומי	Банк Леуми	https://bankleumi.co.il	t	2	t	2025-07-15 23:14:49.687276	2025-07-15 23:14:49.687276
3	Discount Bank	בנק דיסקונט	Дисконт Банк	https://discountbank.co.il	t	3	t	2025-07-15 23:14:49.848589	2025-07-15 23:14:49.848589
4	First International Bank	בנק הבינלאומי הראשון	Первый Международный Банк	https://fibi.co.il	t	4	t	2025-07-15 23:14:49.9975	2025-07-15 23:14:49.9975
5	Mizrahi Tefahot Bank	בנק מזרחי טפחות	Банк Мизрахи Тефахот	https://mizrahi-tefahot.co.il	t	5	t	2025-07-15 23:14:50.187677	2025-07-15 23:14:50.187677
6	Bank Igud	בנק איגוד	Банк Игуд	https://igud.co.il	t	6	t	2025-07-15 23:14:50.377655	2025-07-15 23:14:50.377655
7	Citibank Israel	סיטיבנק ישראל	Ситибанк Израиль	https://citibank.co.il	t	7	t	2025-07-15 23:14:50.499494	2025-07-15 23:14:50.499494
8	Bank Yaav	בנק יהב	Банк Яав	https://bankyahav.co.il	t	8	t	2025-07-15 23:14:50.687533	2025-07-15 23:14:50.687533
9	Mercantil Discount	מרכנתיל דיסקונט	Меркантиль Дисконт	https://mercantile.co.il	t	9	t	2025-07-15 23:14:50.817359	2025-07-15 23:14:50.817359
10	Bank Yerushalayim	בנק ירושלים	Банк Иерусалим	https://bankjerusalem.co.il	t	10	t	2025-07-15 23:14:50.967473	2025-07-15 23:14:50.967473
\.


--
-- Data for Name: calculation_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calculation_logs (id, application_id, bank_id, calculation_step, input_values, output_values, status, created_at) FROM stdin;
1	1	1	eligibility_check	{"dtiRatio": 10.433333333333334, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:21.627037
2	1	2	rate_calculation	{"customerData": {"id": 1, "created_at": "2025-07-15T20:15:20.897Z", "updated_at": "2025-07-15T20:15:20.897Z", "customer_id": 1, "loan_amount": "1000000.00", "credit_score": 720, "down_payment": "300000.00", "monthly_income": "25000.00", "property_value": "1300000.00", "employment_type": "permanent", "monthly_expenses": "8000.00", "property_ownership": "75_percent_financing"}, "bankStandards": {"max_ltv_ratio": 80, "min_credit_score": 640, "max_interest_rate": 4.1, "min_interest_rate": 2.9, "base_interest_rate": 3.25}}	{"dti": 10.666666666666666, "ltv": 76.92307692307693, "rate": 3.2}	success	2025-07-15 23:15:22.147026
3	1	3	eligibility_check	{"dtiRatio": 11.333333333333336, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:22.455112
4	1	4	eligibility_check	{"dtiRatio": 10.833333333333334, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:22.80697
5	1	5	rate_calculation	{"customerData": {"id": 1, "created_at": "2025-07-15T20:15:20.897Z", "updated_at": "2025-07-15T20:15:20.897Z", "customer_id": 1, "loan_amount": "1000000.00", "credit_score": 720, "down_payment": "300000.00", "monthly_income": "25000.00", "property_value": "1300000.00", "employment_type": "permanent", "monthly_expenses": "8000.00", "property_ownership": "75_percent_financing"}, "bankStandards": {"max_ltv_ratio": 82, "min_credit_score": 620, "max_interest_rate": 3.95, "min_interest_rate": 2.85, "base_interest_rate": 3.2}}	{"dti": 10.500000000000002, "ltv": 76.92307692307693, "rate": 3.1500000000000004}	success	2025-07-15 23:15:23.357263
6	1	6	eligibility_check	{"dtiRatio": 11.5, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:23.764967
7	1	7	eligibility_check	{"dtiRatio": 11.5, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:24.077269
8	1	8	eligibility_check	{"dtiRatio": 11.5, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:24.423138
9	1	9	eligibility_check	{"dtiRatio": 11.5, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:24.992192
10	1	10	eligibility_check	{"dtiRatio": 11.5, "ltvRatio": 76.92307692307693, "creditScore": 720}	{"reason": "Failed eligibility criteria", "eligible": false}	rejected	2025-07-15 23:15:25.483211
\.


--
-- Data for Name: calculator_formula; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calculator_formula (id, min_term, max_term, financing_percentage, bank_interest_rate, base_interest_rate, variable_interest_rate, interest_change_period, inflation_index, created_at, updated_at) FROM stdin;
1	101	480	85	4.0	3.2	1.5	6	2.5	2025-07-15 21:50:46.380355	2025-07-15 22:52:53.410566
\.


--
-- Data for Name: content_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_items (id, content_key, screen_location, component_type, category, page_id, element_order, is_active, created_at, updated_at) FROM stdin;
1	validation_required	validation_errors	error_message	validation	\N	1	t	2025-08-06 20:47:56.993015	2025-08-06 20:47:56.993015
2	validation_email	validation_errors	error_message	validation	\N	2	t	2025-08-06 20:47:56.993015	2025-08-06 20:47:56.993015
3	validation_min_length	validation_errors	error_message	validation	\N	3	t	2025-08-06 20:47:56.993015	2025-08-06 20:47:56.993015
4	validation_max_length	validation_errors	error_message	validation	\N	4	t	2025-08-06 20:47:56.993015	2025-08-06 20:47:56.993015
5	validation_numeric	validation_errors	error_message	validation	\N	5	t	2025-08-06 20:47:56.993015	2025-08-06 20:47:56.993015
6	app.credit.step3.title	calculate_credit_3	title	form_headers	\N	0	t	2025-08-06 23:47:19.664883	2025-08-06 23:47:19.664883
7	credit_step3_title	calculate_credit_3	title	form_headers	\N	0	t	2025-08-06 23:47:30.249625	2025-08-06 23:47:30.249625
8	calculate_credit_step3_title	calculate_credit_3	title	form_headers	\N	0	t	2025-08-06 23:47:40.882507	2025-08-06 23:47:40.882507
9	calculate_mortgage_main_source	calculate_credit_3	label	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
10	calculate_mortgage_main_source_ph	calculate_credit_3	placeholder	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
11	calculate_mortgage_main_source_option_1	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
12	calculate_mortgage_main_source_option_2	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
13	calculate_mortgage_main_source_option_3	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
14	calculate_mortgage_main_source_option_4	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
15	calculate_mortgage_main_source_option_5	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
16	calculate_mortgage_main_source_option_6	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
17	calculate_mortgage_main_source_option_7	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:55:55.214533	2025-08-06 23:55:55.214533
18	calculate_mortgage_has_additional	calculate_credit_3	label	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
19	calculate_mortgage_has_additional_ph	calculate_credit_3	placeholder	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
20	calculate_mortgage_has_additional_option_1	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
21	calculate_mortgage_has_additional_option_2	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
22	calculate_mortgage_has_additional_option_3	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
23	calculate_mortgage_has_additional_option_4	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
24	calculate_mortgage_has_additional_option_5	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
25	calculate_mortgage_has_additional_option_6	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
26	calculate_mortgage_has_additional_option_7	calculate_credit_3	option	income_details	\N	0	t	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
39	calculate_mortgage_field_of_activity	calculate_credit_3	label	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
40	calculate_mortgage_field_of_activity_ph	calculate_credit_3	placeholder	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
41	calculate_mortgage_field_of_activity_option_1	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
42	calculate_mortgage_field_of_activity_option_2	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
43	calculate_mortgage_field_of_activity_option_3	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
44	calculate_mortgage_field_of_activity_option_4	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
45	calculate_mortgage_field_of_activity_option_5	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
46	calculate_mortgage_field_of_activity_option_6	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
47	calculate_mortgage_field_of_activity_option_7	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
48	calculate_mortgage_field_of_activity_option_8	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
49	calculate_mortgage_field_of_activity_option_9	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
50	calculate_mortgage_field_of_activity_option_10	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:10:54.011186	2025-08-07 00:10:54.011186
51	calculate_mortgage_obligations	calculate_credit_3	label	\N	\N	0	t	2025-08-07 00:12:49.116924	2025-08-07 00:12:49.116924
52	calculate_mortgage_obligations_ph	calculate_credit_3	placeholder	\N	\N	0	t	2025-08-07 00:12:49.116924	2025-08-07 00:12:49.116924
53	calculate_mortgage_obligations_option_1	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:12:49.116924	2025-08-07 00:12:49.116924
54	calculate_mortgage_obligations_option_2	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:12:49.116924	2025-08-07 00:12:49.116924
55	calculate_mortgage_obligations_option_3	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:12:49.116924	2025-08-07 00:12:49.116924
56	calculate_mortgage_obligations_option_4	calculate_credit_3	dropdown_option	\N	\N	0	t	2025-08-07 00:12:49.116924	2025-08-07 00:12:49.116924
57	calculate_credit_source_of_income	calculate_credit_3	text	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
58	calculate_credit_add_place_to_work	calculate_credit_3	text	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
59	calculate_credit_additional_income	calculate_credit_3	text	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
60	calculate_credit_add_additional_income	calculate_credit_3	text	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
61	calculate_credit_obligation	calculate_credit_3	text	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
62	calculate_credit_add_obligation	calculate_credit_3	text	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
63	calculate_mortgage_monthly_income	calculate_credit_3	label	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
64	calculate_mortgage_monthly_income_ph	calculate_credit_3	placeholder	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
65	calculate_mortgage_start_date	calculate_credit_3	label	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
66	calculate_mortgage_start_date_ph	calculate_credit_3	placeholder	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
67	calculate_mortgage_company_name	calculate_credit_3	label	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
68	calculate_mortgage_company_name_ph	calculate_credit_3	placeholder	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
69	calculate_mortgage_profession	calculate_credit_3	label	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
70	calculate_mortgage_profession_ph	calculate_credit_3	placeholder	\N	\N	0	t	2025-08-07 00:13:16.738084	2025-08-07 00:13:16.738084
71	obligation_modal_title	common	text	\N	\N	0	t	2025-08-07 00:18:40.87116	2025-08-07 00:18:40.87116
72	button_back	common	text	ui	\N	0	t	2025-08-07 00:18:40.87116	2025-08-07 00:18:40.87116
73	button_next_save	common	text	ui	\N	0	t	2025-08-07 00:18:40.87116	2025-08-07 00:18:40.87116
81	bank_title	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
82	bank_placeholder	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
83	bank_option_1	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
84	bank_option_2	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
85	bank_option_3	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
86	bank_option_4	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
87	bank_option_5	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
88	obligation_bank_title	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
89	obligation_bank_placeholder	common	text	ui	\N	0	t	2025-08-07 00:25:24.426699	2025-08-07 00:25:24.426699
\.


--
-- Data for Name: content_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_translations (id, content_item_id, language_code, field_name, content_value, translation_text, status, created_at, updated_at) FROM stdin;
1	1	en	text	This field is required	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
2	2	en	text	Please enter a valid email address	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
3	3	en	text	Minimum length is {min} characters	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
4	4	en	text	Maximum length is {max} characters	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
5	5	en	text	Please enter a valid number	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
6	1	he	text	שדה זה הוא חובה	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
7	2	he	text	אנא הזן כתובת אימייל תקינה	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
8	3	he	text	אורך מינימלי הוא {min} תווים	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
9	4	he	text	אורך מקסימלי הוא {max} תווים	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
10	5	he	text	אנא הזן מספר תקין	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
11	1	ru	text	Это поле обязательно для заполнения	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
12	2	ru	text	Пожалуйста, введите корректный email адрес	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
13	3	ru	text	Минимальная длина {min} символов	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
14	4	ru	text	Максимальная длина {max} символов	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
15	5	ru	text	Пожалуйста, введите корректное число	\N	approved	2025-08-06 20:47:57.197643	2025-08-06 20:47:57.197643
16	6	en	text	Income Details	\N	approved	2025-08-06 23:47:19.664883	2025-08-06 23:47:19.664883
17	6	he	text	פרטי הכנסה	\N	approved	2025-08-06 23:47:19.664883	2025-08-06 23:47:19.664883
18	6	ru	text	Детали дохода	\N	approved	2025-08-06 23:47:19.664883	2025-08-06 23:47:19.664883
19	7	en	text	Income Details	\N	approved	2025-08-06 23:47:30.249625	2025-08-06 23:47:30.249625
20	7	he	text	פרטי הכנסה	\N	approved	2025-08-06 23:47:30.249625	2025-08-06 23:47:30.249625
21	7	ru	text	Детали дохода	\N	approved	2025-08-06 23:47:30.249625	2025-08-06 23:47:30.249625
22	8	en	text	Income Details	\N	approved	2025-08-06 23:47:40.882507	2025-08-06 23:47:40.882507
23	8	he	text	פרטי הכנסה	\N	approved	2025-08-06 23:47:40.882507	2025-08-06 23:47:40.882507
24	8	ru	text	Детали дохода	\N	approved	2025-08-06 23:47:40.882507	2025-08-06 23:47:40.882507
25	9	en	text	Main source of income	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
26	9	he	text	מקור הכנסה עיקרי	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
27	9	ru	text	Основной источник дохода	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
28	10	en	text	Select your main source of income	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
29	10	he	text	בחר את מקור ההכנסה העיקרי שלך	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
30	10	ru	text	Выберите основной источник дохода	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
31	11	en	text	Employee	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
32	11	he	text	עובד שכיר	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
33	11	ru	text	Сотрудник	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
34	12	en	text	Self-employed	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
35	12	he	text	עצמאי	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
36	12	ru	text	Самозанятый	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
37	13	en	text	Business owner	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
38	13	he	text	בעל עסק	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
39	13	ru	text	Владелец бизнеса	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
40	14	en	text	Pension	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
41	14	he	text	פנסיה	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
42	14	ru	text	Пенсия	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
43	15	en	text	Student	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
44	15	he	text	סטודנט	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
45	15	ru	text	Студент	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
46	16	en	text	Unemployed	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
47	16	he	text	מובטל	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
48	16	ru	text	Безработный	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
49	17	en	text	Other	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
50	17	he	text	אחר	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
51	17	ru	text	Другое	\N	approved	2025-08-06 23:56:14.679395	2025-08-06 23:56:14.679395
52	18	en	text	Additional income	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
53	18	he	text	הכנסה נוספת	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
54	18	ru	text	Дополнительный доход	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
55	19	en	text	Do you have additional income?	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
56	19	he	text	האם יש לך הכנסה נוספת?	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
57	19	ru	text	Есть ли у вас дополнительный доход?	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
58	20	en	text	No additional income	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
59	20	he	text	אין הכנסה נוספת	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
60	20	ru	text	Нет дополнительного дохода	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
61	21	en	text	Additional salary	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
62	21	he	text	משכורת נוספת	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
63	21	ru	text	Дополнительная зарплата	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
64	22	en	text	Freelance work	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
65	22	he	text	עבודה עצמאית	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
66	22	ru	text	Фриланс	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
67	23	en	text	Investment income	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
68	23	he	text	הכנסה מהשקעות	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
69	23	ru	text	Доход от инвестиций	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
70	24	en	text	Rental income	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
71	24	he	text	הכנסה משכירות	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
72	24	ru	text	Доход от аренды	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
73	25	en	text	Pension benefits	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
74	25	he	text	קצבאות פנסיה	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
75	25	ru	text	Пенсионные выплаты	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
76	26	en	text	Other income	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
77	26	he	text	הכנסה אחרת	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
78	26	ru	text	Другой доход	\N	approved	2025-08-06 23:56:39.093561	2025-08-06 23:56:39.093561
116	39	en	text	Field of Activity	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
117	40	en	text	Select field of activity	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
118	41	en	text	Technology & IT	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
119	42	en	text	Healthcare & Medicine	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
120	43	en	text	Education & Training	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
121	44	en	text	Finance & Banking	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
122	45	en	text	Real Estate & Construction	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
123	46	en	text	Retail & Sales	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
124	47	en	text	Manufacturing & Industry	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
125	48	en	text	Transportation & Logistics	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
126	49	en	text	Government & Public Service	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
127	50	en	text	Other	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
128	39	he	text	תחום פעילות	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
129	40	he	text	בחר תחום פעילות	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
130	41	he	text	טכנולוגיה ומחשבים	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
131	42	he	text	רפואה ובריאות	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
132	43	he	text	חינוך והוראה	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
133	44	he	text	כספים ובנקאות	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
134	45	he	text	נדלן ובנייה	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
135	46	he	text	קמעונאות ומכירות	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
136	47	he	text	תעשייה וייצור	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
137	48	he	text	תחבורה ולוגיסטיקה	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
138	49	he	text	שירות ציבורי וממשלתי	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
139	50	he	text	אחר	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
140	39	ru	text	Сфера деятельности	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
141	40	ru	text	Выберите сферу деятельности	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
142	41	ru	text	Технологии и IT	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
143	42	ru	text	Здравоохранение и медицина	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
144	43	ru	text	Образование и обучение	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
145	44	ru	text	Финансы и банковское дело	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
146	45	ru	text	Недвижимость и строительство	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
147	46	ru	text	Розничная торговля и продажи	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
148	47	ru	text	Производство и промышленность	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
149	48	ru	text	Транспорт и логистика	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
242	81	en	text	Bank	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
243	82	en	text	Select bank	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
244	83	en	text	Bank Hapoalim	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
245	84	en	text	Bank Leumi	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
246	85	en	text	Bank Discount	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
247	86	en	text	Bank Mizrahi	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
248	87	en	text	Other Bank	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
249	88	en	text	Bank Lender	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
250	89	en	text	Select bank	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
251	81	he	text	בנק	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
252	82	he	text	בחר בנק	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
253	83	he	text	בנק הפועלים	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
254	84	he	text	בנק לאומי	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
255	85	he	text	בנק דיסקונט	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
256	86	he	text	בנק מזרחי	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
257	87	he	text	בנק אחר	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
258	88	he	text	בנק מלווה	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
259	89	he	text	בחר בנק	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
260	81	ru	text	Банк	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
261	82	ru	text	Выберите банк	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
262	83	ru	text	Банк Хапоалим	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
263	84	ru	text	Банк Леуми	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
264	85	ru	text	Банк Дисконт	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
265	86	ru	text	Банк Мизрахи	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
266	87	ru	text	Другой банк	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
267	88	ru	text	Банк-кредитор	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
150	49	ru	text	Государственная служба	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
151	50	ru	text	Другое	\N	approved	2025-08-07 00:11:19.431728	2025-08-07 00:11:19.431728
152	51	en	text	Obligations	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
153	52	en	text	Select obligation type	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
154	53	en	text	No obligations	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
155	54	en	text	Bank loan	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
156	55	en	text	Credit card debt	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
157	56	en	text	Other obligations	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
158	51	he	text	התחייבויות	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
159	52	he	text	בחר סוג התחייבות	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
160	53	he	text	אין התחייבויות	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
161	54	he	text	הלוואה בנקאית	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
162	55	he	text	חוב כרטיס אשראי	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
163	56	he	text	התחייבויות אחרות	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
164	51	ru	text	Обязательства	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
165	52	ru	text	Выберите тип обязательства	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
166	53	ru	text	Нет обязательств	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
167	54	ru	text	Банковский кредит	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
168	55	ru	text	Задолженность по кредитной карте	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
169	56	ru	text	Другие обязательства	\N	approved	2025-08-07 00:13:04.529443	2025-08-07 00:13:04.529443
170	57	en	text	Source of Income	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
171	58	en	text	Add Place of Work	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
172	59	en	text	Additional Income	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
173	60	en	text	Add Additional Income	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
174	61	en	text	Obligation	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
175	62	en	text	Add Obligation	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
176	63	en	text	Monthly Income	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
177	64	en	text	Enter monthly income	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
178	65	en	text	Start Date	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
179	66	en	text	Select start date	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
180	67	en	text	Company Name	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
181	68	en	text	Enter company name	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
182	69	en	text	Profession	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
183	70	en	text	Enter profession	\N	approved	2025-08-07 00:13:29.636272	2025-08-07 00:13:29.636272
184	57	he	text	מקור הכנסה	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
185	58	he	text	הוסף מקום עבודה	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
186	59	he	text	הכנסה נוספת	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
187	60	he	text	הוסף הכנסה נוספת	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
188	61	he	text	התחייבות	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
189	62	he	text	הוסף התחייבות	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
190	63	he	text	הכנסה חודשית	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
191	64	he	text	הזן הכנסה חודשית	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
192	65	he	text	תאריך התחלה	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
193	66	he	text	בחר תאריך התחלה	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
194	67	he	text	שם החברה	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
195	68	he	text	הזן שם החברה	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
196	69	he	text	מקצוע	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
197	70	he	text	הזן מקצוע	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
198	57	ru	text	Источник дохода	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
199	58	ru	text	Добавить место работы	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
200	59	ru	text	Дополнительный доход	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
201	60	ru	text	Добавить дополнительный доход	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
202	61	ru	text	Обязательство	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
203	62	ru	text	Добавить обязательство	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
204	63	ru	text	Ежемесячный доход	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
205	64	ru	text	Введите ежемесячный доход	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
206	65	ru	text	Дата начала	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
207	66	ru	text	Выберите дату начала	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
208	67	ru	text	Название компании	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
209	68	ru	text	Введите название компании	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
210	69	ru	text	Профессия	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
211	70	ru	text	Введите профессию	\N	approved	2025-08-07 00:13:49.816689	2025-08-07 00:13:49.816689
212	71	en	text	Obligation	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
213	72	en	text	Back	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
214	73	en	text	Save and Continue	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
215	71	he	text	התחייבות	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
216	72	he	text	חזור	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
217	73	he	text	שמור והמשך	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
218	71	ru	text	Обязательство	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
219	72	ru	text	Назад	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
220	73	ru	text	Сохранить и продолжить	\N	approved	2025-08-07 00:18:53.070203	2025-08-07 00:18:53.070203
268	89	ru	text	Выберите банк	\N	approved	2025-08-07 00:25:41.91918	2025-08-07 00:25:41.91918
\.


--
-- Data for Name: customer_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_applications (id, customer_id, loan_amount, down_payment, property_value, monthly_income, monthly_expenses, credit_score, employment_type, property_ownership, created_at, updated_at) FROM stdin;
1	1	1000000.00	300000.00	1300000.00	25000.00	8000.00	720	permanent	75_percent_financing	2025-07-15 23:15:20.897066	2025-07-15 23:15:20.897066
\.


--
-- Data for Name: test_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_users (id, name, email, role, status, created_at, updated_at) FROM stdin;
1	John Doe	john@bankim.com	admin	active	2025-07-22 20:53:09.195663	2025-07-22 20:53:09.195663
2	Jane Smith	jane@bankim.com	manager	active	2025-07-22 20:53:09.290567	2025-07-22 20:53:09.290567
3	Bob Johnson	bob@bankim.com	user	inactive	2025-07-22 20:53:09.384512	2025-07-22 20:53:09.384512
4	Alice Brown	alice@bankim.com	user	active	2025-07-22 20:53:09.480363	2025-07-22 20:53:09.480363
5	Charlie Wilson	charlie@bankim.com	manager	pending	2025-07-22 20:53:09.575461	2025-07-22 20:53:09.575461
\.


--
-- Data for Name: ui_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ui_settings (id, setting_key, setting_value, description, created_at, updated_at) FROM stdin;
1	menu_font_family	Arimo	Font family for menu navigation	2025-07-18 06:03:14.149472	2025-07-18 06:03:14.149472
2	menu_main_font_weight	500	Font weight for main navigation items	2025-07-18 06:03:14.149472	2025-07-18 06:03:14.149472
3	menu_sub_font_weight	600	Font weight for sub-navigation items	2025-07-18 06:03:14.149472	2025-07-18 06:03:14.149472
4	menu_main_font_size	16px	Font size for main navigation items	2025-07-18 06:03:14.149472	2025-07-18 06:03:14.149472
5	menu_sub_font_size	14px	Font size for sub-navigation items	2025-07-18 06:03:14.149472	2025-07-18 06:03:14.149472
6	menu_line_height	1.5	Line height for menu items	2025-07-18 06:03:14.149472	2025-07-18 06:03:14.149472
\.


--
-- Name: bank_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_configurations_id_seq', 6, true);


--
-- Name: bank_offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_offers_id_seq', 2, true);


--
-- Name: banking_standards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banking_standards_id_seq', 7, true);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 10, true);


--
-- Name: calculation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calculation_logs_id_seq', 10, true);


--
-- Name: calculator_formula_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calculator_formula_id_seq', 1, true);


--
-- Name: content_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_items_id_seq', 89, true);


--
-- Name: content_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_translations_id_seq', 268, true);


--
-- Name: customer_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_applications_id_seq', 1, true);


--
-- Name: test_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_users_id_seq', 5, true);


--
-- Name: ui_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ui_settings_id_seq', 6, true);


--
-- Name: bank_configurations bank_configurations_bank_id_product_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_bank_id_product_type_key UNIQUE (bank_id, product_type);


--
-- Name: bank_configurations bank_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_pkey PRIMARY KEY (id);


--
-- Name: bank_offers bank_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_offers
    ADD CONSTRAINT bank_offers_pkey PRIMARY KEY (id);


--
-- Name: banking_standards banking_standards_business_path_standard_category_standard__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_standards
    ADD CONSTRAINT banking_standards_business_path_standard_category_standard__key UNIQUE (business_path, standard_category, standard_name);


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
-- Name: calculation_logs calculation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_logs
    ADD CONSTRAINT calculation_logs_pkey PRIMARY KEY (id);


--
-- Name: calculator_formula calculator_formula_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculator_formula
    ADD CONSTRAINT calculator_formula_pkey PRIMARY KEY (id);


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
-- Name: content_translations content_translations_content_item_id_language_code_field_na_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_content_item_id_language_code_field_na_key UNIQUE (content_item_id, language_code, field_name);


--
-- Name: content_translations content_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_pkey PRIMARY KEY (id);


--
-- Name: customer_applications customer_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_applications
    ADD CONSTRAINT customer_applications_pkey PRIMARY KEY (id);


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
-- Name: ui_settings ui_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ui_settings
    ADD CONSTRAINT ui_settings_pkey PRIMARY KEY (id);


--
-- Name: ui_settings ui_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ui_settings
    ADD CONSTRAINT ui_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: idx_content_items_content_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_content_key ON public.content_items USING btree (content_key);


--
-- Name: idx_content_items_screen_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_items_screen_location ON public.content_items USING btree (screen_location);


--
-- Name: idx_content_translations_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_language ON public.content_translations USING btree (language_code);


--
-- Name: idx_content_translations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_translations_status ON public.content_translations USING btree (status);


--
-- Name: bank_configurations bank_configurations_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_configurations
    ADD CONSTRAINT bank_configurations_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: bank_offers bank_offers_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_offers
    ADD CONSTRAINT bank_offers_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.customer_applications(id);


--
-- Name: bank_offers bank_offers_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_offers
    ADD CONSTRAINT bank_offers_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: calculation_logs calculation_logs_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_logs
    ADD CONSTRAINT calculation_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.customer_applications(id);


--
-- Name: calculation_logs calculation_logs_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculation_logs
    ADD CONSTRAINT calculation_logs_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: content_translations content_translations_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_translations
    ADD CONSTRAINT content_translations_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

