import { jsx as _jsx } from "react/jsx-runtime";
import { Bank } from '../components/Bank';
import { EndDate } from '../components/EndDate';
import { MonthlyPayment } from '../components/MonthlyPayment';
export const componentsByObligation = {
    option_2: [
        _jsx(Bank, {}, "Bank"),
        _jsx(MonthlyPayment, {}, "MonthlyPayment"),
        _jsx(EndDate, {}, "EndDate"),
    ],
    option_3: [
        _jsx(Bank, {}, "Bank"),
        _jsx(MonthlyPayment, {}, "MonthlyPayment"),
        _jsx(EndDate, {}, "EndDate"),
    ],
    option_4: [_jsx(MonthlyPayment, {}, "MonthlyPayment")],
    option_5: [_jsx(MonthlyPayment, {}, "MonthlyPayment")],
};
