import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { Container } from '@components/ui/Container';
import { VideoPoster } from '@src/components/ui/VideoPoster';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { LoginModal } from '@src/pages/Services/pages/Modals/LoginModal';
import { updateCreditData } from '@src/pages/Services/slices/calculateCreditSlice';
import { openLoginModal } from '@src/pages/Services/slices/modalSlice';
import { SingleButton } from '../../../../components/SingleButton';
import { FirstStepForm } from './FirstStepForm/FirstStepForm';
export const validationSchema = Yup.object().shape({
    purposeOfLoan: Yup.string().required('Выберите ответ'),
    loanAmount: Yup.number()
        .when('purposeOfLoan', {
        is: i18next.t('calculate_credit_target_option_6'),
        then: (shema) => shema.max(1000000, i18next.t('error_loan_of_amount_credit_max_1000000')),
        otherwise: (shema) => shema.max(200000, i18next.t('error_loan_of_amount_credit_max_200000')),
    })
        .required(i18next.t('error_required_to_fill_out')),
    whenDoYouNeedMoney: Yup.string().required(i18next.t('error_select_answer')),
    loanDeferral: Yup.string().required(i18next.t('error_select_answer')),
    period: Yup.number()
        .min(1, i18next.t('error_min__credit_period'))
        .max(30, i18next.t('error_max_credit_period'))
        .required(i18next.t('error_required_to_fill_out')),
    monthlyPayment: Yup.number().required(i18next.t('error_required_to_fill_out')),
});
const FirstStep = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const savedValue = useAppSelector((state) => state.credit);
    const isLogin = useAppSelector((state) => state.login.isLogin);
    const initialValues = {
        purposeOfLoan: savedValue.purposeOfLoan || '',
        loanAmount: savedValue.loanAmount || 200000,
        whenDoYouNeedMoney: savedValue.whenDoYouNeedMoney || '',
        loanDeferral: savedValue.loanDeferral || '',
        priceOfEstate: savedValue.priceOfEstate || null,
        cityWhereYouBuy: savedValue.cityWhereYouBuy || '',
        haveMortgage: savedValue.haveMortgage || null,
        period: savedValue.period || 30,
        monthlyPayment: savedValue.monthlyPayment || 5368,
    };
    return (_jsxs(_Fragment, { children: [_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                    dispatch(updateCreditData(values));
                    {
                        isLogin
                            ? navigate('/services/calculate-credit/2')
                            : dispatch(openLoginModal());
                    }
                }, children: _jsxs(Form, { children: [_jsxs(Container, { children: [_jsx(VideoPoster, { title: t('sidebar_sub_calculate_credit'), text: t('calculate_mortgage_banner_subtext'), size: "small" }), _jsx(FirstStepForm, {})] }), _jsx(SingleButton, {})] }) }), _jsx(LoginModal, {})] }));
};
export default FirstStep;
