import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import InfoButton from '@components/ui/InfoButton.tsx';
import { UserProfileCard } from '@components/ui/UserProfileCard';
import { RowTwo } from '@src/components/ui/RowTwo';
const PhoneEdit = () => {
    const { i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return (_jsxs(RowTwo, { children: [_jsx(InfoButton, {}), _jsx(UserProfileCard, { name: "\u0410\u043B\u0435\u043A\u0441\u0430\u043D\u0434\u0440 \u043F\u0443\u0448\u043A\u0438\u043D", phone: "+ 935 234 3344" })] }));
};
export default PhoneEdit;
