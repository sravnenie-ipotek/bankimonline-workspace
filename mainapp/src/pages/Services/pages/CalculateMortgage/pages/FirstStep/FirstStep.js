import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Form, Formik } from 'formik';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { Container } from '@src/components/ui/Container';
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts';
import { openLoginModal } from '@src/pages/Services/slices/modalSlice';
import { SingleButton } from '../../../../components/SingleButton';
import { LoginModal } from '../../../Modals/LoginModal';
import FirstStepForm from './FirstStepForm/FirstStepForm';
export const validationSchema = Yup.object().shape({
    priceOfEstate: Yup.number()
        .max(10000000, i18next.t('error_max_price'))
        .required(i18next.t('error_required_to_fill_out')),
    cityWhereYouBuy: Yup.string().required(i18next.t('error_select_answer')),
    whenDoYouNeedMoney: Yup.string().required(i18next.t('error_select_answer')),
    initialFee: Yup.number()
        .test('initial-payment-percentage', i18next.t('error_initial_fee'), function (value) {
        const priceOfEstate = this.parent.priceOfEstate || 0;
        return validateInitialPayment(priceOfEstate, value);
    })
        .required(i18next.t('error_required_to_fill_out')),
    typeSelect: Yup.string().required(i18next.t('error_select_answer')),
    willBeYourFirst: Yup.string().required(i18next.t('error_select_answer')),
    period: Yup.number()
        .min(4, i18next.t('error_min_period'))
        .max(30, i18next.t('error_max_period'))
        .required(i18next.t('error_required_to_fill_out')),
    monthlyPayment: Yup.number()
        .min(2654, 'Размер ежемесячного платежа не может быть меньше 2,654 иначе срок будет больше 30 лет')
        .required(i18next.t('error_required_to_fill_out')),
});
export function validateInitialPayment(priceOfEstate, value) {
    const minInitialPayment = priceOfEstate * 0.25;
    if (typeof value === 'undefined') {
        return false;
    }
    return value >= minInitialPayment;
}
const FirstStep = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const savedValue = useAppSelector((state) => state.mortgage);
    const isLogin = useAppSelector((state) => state.login.isLogin);
    const initialValues = {
        priceOfEstate: savedValue.priceOfEstate || 1000000,
        cityWhereYouBuy: savedValue.cityWhereYouBuy || '',
        whenDoYouNeedMoney: savedValue.whenDoYouNeedMoney || '',
        initialFee: savedValue.initialFee || 500000,
        typeSelect: savedValue.typeSelect || '',
        willBeYourFirst: savedValue.willBeYourFirst || '',
        period: savedValue.period || 4,
        monthlyPayment: savedValue.monthlyPayment || 11514,
    };
    return (_jsxs(_Fragment, { children: [_jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => {
                    dispatch(updateMortgageData(values));
                    {
                        isLogin
                            ? navigate('/services/calculate-mortgage/2')
                            : dispatch(openLoginModal());
                    }
                }, children: _jsxs(Form, { children: [_jsxs(Container, { children: [_jsx(VideoPoster, { title: t('video_calculate_mortgage_title'), text: t('show_offers'), size: "small" }), _jsx(FirstStepForm, {})] }), _jsx(SingleButton, {})] }) }), _jsx(LoginModal, {})] }));
};
export default FirstStep;
