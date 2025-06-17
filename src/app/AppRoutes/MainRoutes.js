import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@components/layout/Layout.tsx';
import { Loader } from '@components/layout/Loader';
const Home = lazy(() => import('../../pages/Home/Home.tsx'));
const CalculateMortgage = lazy(() => import('../../pages/Services/pages/CalculateMortgage').then((module) => ({
    default: module.CalculateMortgage,
})));
const CalculateCredit = lazy(() => import('../../pages/Services/pages/CalculateCredit/CalculateCredit.tsx'));
const RefinanceMortgage = lazy(() => import('../../pages/Services/pages/RefinanceMortgage').then((module) => ({
    default: module.RefinanceMortgage,
})));
const RefinanceCredit = lazy(() => import('../../pages/Services/pages/RefinanceCredit').then((module) => ({
    default: module.RefinanceCredit,
})));
const BorrowersPersonalData = lazy(() => import('../../pages/Services/pages/BorrowersPersonalData').then((module) => ({
    default: module.BorrowersPersonalData,
})));
const OtherBorrowers = lazy(() => import('../../pages/Services/pages/OtherBorrowers').then((module) => ({
    default: module.OtherBorrowers,
})));
const View = lazy(() => import('../../pages/View.tsx'));
const NotFound = lazy(() => import('@src/app/Errors/NotFound/NotFound.tsx'));
const Terms = lazy(() => import('../../pages/Terms/Terms.tsx'));
const About = lazy(() => import('../../pages/About').then((module) => ({ default: module.About })));
const Vacancies = lazy(() => import('../../pages/Vacancies').then((module) => ({
    default: module.Vacancies,
})));
const Contacts = lazy(() => import('../../pages/Contacts').then((module) => ({
    default: module.Contacts,
})));
const Cooperation = lazy(() => import('../../pages/Cooperation').then((module) => ({
    default: module.Cooperation,
})));
const TendersForBrokers = lazy(() => import('../../pages/TendersForBrokers').then((module) => ({
    default: module.TendersForBrokers,
})));
const TendersForLawyers = lazy(() => import('../../pages/TendersForLawyers').then((module) => ({
    default: module.TendersForLawyers,
})));
const Cookie = lazy(() => import('../../pages/Cookie').then((module) => ({ default: module.Cookie })));
const Refund = lazy(() => import('../../pages/Refund').then((module) => ({ default: module.Refund })));
const PrivacyPolicy = lazy(() => import('../../pages/PrivacyPolicy').then((module) => ({
    default: module.PrivacyPolicy,
})));
const Apoalim = lazy(() => import('../../pages/Banks/pages/Apoalim').then((module) => ({
    default: module.Apoalim,
})));
const Discount = lazy(() => import('../../pages/Banks/pages/Discount').then((module) => ({
    default: module.Discount,
})));
const Leumi = lazy(() => import('../../pages/Banks/pages/Leumi').then((module) => ({
    default: module.Leumi,
})));
const Beinleumi = lazy(() => import('../../pages/Banks/pages/Beinleumi').then((module) => ({
    default: module.Beinleumi,
})));
const MercantileDiscount = lazy(() => import('../../pages/Banks/pages/MercantileDiscount').then((module) => ({
    default: module.MercantileDiscount,
})));
const Jerusalem = lazy(() => import('../../pages/Banks/pages/Jerusalem').then((module) => ({
    default: module.Jerusalem,
})));
// Admin Pages
const AdminLogin = lazy(() => import('../../pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const MainRoutes = () => {
    return (_jsx(_Fragment, { children: _jsxs(BrowserRouter, { children: [_jsx(ToastContainer, {}), _jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsxs(Route, { path: '/services', children: [_jsx(Route, { path: "calculate-mortgage/:stepNumber", element: _jsx(CalculateMortgage, {}) }), _jsx(Route, { path: "refinance-mortgage/:stepNumber", element: _jsx(RefinanceMortgage, {}) }), _jsx(Route, { path: "calculate-credit", element: _jsx(Navigate, { replace: true, to: "/calculate-credit/1" }) }), _jsx(Route, { path: "calculate-credit/:stepNumber", element: _jsx(CalculateCredit, {}) }), _jsx(Route, { path: "borrowers-personal-data/:stepNumber", element: _jsx(BorrowersPersonalData, {}) }), _jsx(Route, { path: "refinance-credit/:stepNumber", element: _jsx(RefinanceCredit, {}) }), _jsx(Route, { path: "other-borrowers/:stepNumber", element: _jsx(OtherBorrowers, {}) })] }), _jsxs(Route, { path: "/banks", children: [_jsx(Route, { path: "apoalim", element: _jsx(Apoalim, {}) }), _jsx(Route, { path: "discount", element: _jsx(Discount, {}) }), _jsx(Route, { path: "leumi", element: _jsx(Leumi, {}) }), _jsx(Route, { path: "beinleumi", element: _jsx(Beinleumi, {}) }), _jsx(Route, { path: "mercantile-discount", element: _jsx(MercantileDiscount, {}) }), _jsx(Route, { path: "jerusalem", element: _jsx(Jerusalem, {}) })] }), _jsx(Route, { path: "/terms", element: _jsx(Terms, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/vacancies", element: _jsx(Vacancies, {}) }), _jsx(Route, { path: "/contacts", element: _jsx(Contacts, {}) }), _jsx(Route, { path: "/cooperation", element: _jsx(Cooperation, {}) }), _jsx(Route, { path: "/tenders-for-brokers", element: _jsx(TendersForBrokers, {}) }), _jsx(Route, { path: "/tenders-for-lawyers", element: _jsx(TendersForLawyers, {}) }), _jsx(Route, { path: "/contacts", element: _jsx(Contacts, {}) }), _jsx(Route, { path: "/cookie", element: _jsx(Cookie, {}) }), _jsx(Route, { path: "/refund", element: _jsx(Refund, {}) }), _jsx(Route, { path: "/privacy-policy", element: _jsx(PrivacyPolicy, {}) }), _jsx(Route, { path: "/view/:id", element: _jsx(View, {}) }), _jsx(Route, { path: "/404", element: _jsx(NotFound, { type: 'NOT_FOUND' }) }), _jsxs(Route, { path: "/admin", children: [_jsx(Route, { path: "login", element: _jsx(AdminLogin, {}) }), _jsx(Route, { path: "dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { index: true, element: _jsx(Navigate, { replace: true, to: "/admin/login" }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { replace: true, to: "/404" }) })] }) }) })] }) }));
};
export default MainRoutes;
