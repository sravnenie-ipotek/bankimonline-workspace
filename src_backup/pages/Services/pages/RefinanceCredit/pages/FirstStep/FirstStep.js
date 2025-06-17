import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { Container } from '@components/ui/Container';
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { openLoginModal } from '@src/pages/Services/slices/modalSlice';
import { fetchRefinanceCredit, updateRefinanceCreditData, } from '@src/pages/Services/slices/refinanceCredit';
import { SingleButton } from '../../../../components/SingleButton';
import { LoginModal } from '../../../Modals/LoginModal';
import FirstStepForm from './FirstStepForm/FirstStepForm';
export const validationSchema = Yup.object().shape({
    refinancingCredit: Yup.string().required(i18next.t('error_select_answer')),
    period: Yup.number()
        .min(4, i18next.t('error_min_period'))
        .max(30, i18next.t('error_max_period'))
        .required(i18next.t('error_required_to_fill_out')),
    monthlyPayment: Yup.number().required(i18next.t('error_required_to_fill_out')),
});
const FirstStep = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const savedValue = useAppSelector((state) => state.refinanceCredit);
    const isLogin = useAppSelector((state) => state.login.isLogin);
    const initialValues = {
        refinancingCredit: savedValue.refinancingCredit || '',
        period: savedValue.period || 30,
        monthlyPayment: savedValue.monthlyPayment || 1000000,
        creditData: savedValue.creditData || [
            {
                id: 1,
                bank: '',
                amount: null,
                monthlyPayment: '',
                startDate: '',
                endDate: '',
                earlyRepayment: '',
            },
        ],
    };
    return (_jsxs(_Fragment, { children: [_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                    dispatch(updateRefinanceCreditData(values));
                    dispatch(fetchRefinanceCredit({ data: values }));
                    {
                        isLogin
                            ? navigate('/services/refinance-credit/2')
                            : dispatch(openLoginModal());
                    }
                }, children: _jsxs(Form, { children: [_jsxs(Container, { children: [_jsx(VideoPoster, { title: t('credit_refinance_title'), text: t('calculate_mortgage_banner_subtext'), size: "small" }), _jsx(FirstStepForm, {})] }), _jsx(SingleButton, {})] }) }), _jsx(LoginModal, {})] }));
};
export default FirstStep;
