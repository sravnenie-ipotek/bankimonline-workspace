import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '@src/app/Errors/NotFound/NotFound.tsx';
import { Loader } from '@src/components/layout/Loader';
import { ProgressBar } from '@src/components/ui/ProgressBar';
import { useAppSelector } from '@src/hooks/store';
const BorrowersPersonalData = () => {
    const { stepNumber } = useParams();
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const navigate = useNavigate();
    const isLogin = useAppSelector((state) => state.login.isLogin);
    if (!isLogin) {
        navigate('/');
        return;
    }
    const data = [t('calculate_mortgage_anketa'), t('calculate_mortgage_income')];
    let stepComponent;
    const FirstStep = lazy(() => import('./FirstStep').then((module) => ({
        default: module.FirstStep,
    })));
    const SecondStep = lazy(() => import('./SecondStep/SecondStep'));
    switch (stepNumber) {
        case '1':
            stepComponent = _jsx(FirstStep, {});
            break;
        case '2':
            stepComponent = _jsx(SecondStep, {});
            break;
        default:
            stepComponent = _jsx(NotFound, { type: 'NOT_FOUND' });
            break;
    }
    return (_jsxs(_Fragment, { children: [_jsx(ProgressBar, { progress: stepNumber, data: data }), _jsx(Suspense, { fallback: _jsx(Loader, {}), children: stepComponent })] }));
};
export default BorrowersPersonalData;
