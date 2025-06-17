import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Message } from '../../Message';
const AddInc = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return _jsx(Message, { children: t('add_inc') });
};
export default AddInc;
