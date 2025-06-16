import { jsx as _jsx } from "react/jsx-runtime";
import { Column } from '@src/components/ui/Column';
import { AmountIncomeCurrentYear } from '../components/AmountIncomeCurrentYear';
import { CompanyName } from '../components/CompanyName';
import { FieldOfActivity } from '../components/FieldOfActivity';
import { MonthlyIncome } from '../components/MonthlyIncome';
import { NoIncome } from '../components/NoIncome';
import { Profession } from '../components/Profession';
import { StartDate } from '../components/StartDate';
export const componentsByIncomeSource = {
    option_1: [
        _jsx(MonthlyIncome, {}, "MonthlyIncome1"),
        _jsx(StartDate, {}, "StartDate1"),
        _jsx(FieldOfActivity, {}, "FieldOfActivity1"),
        _jsx(CompanyName, {}, "CompanyName1"),
        _jsx(Profession, {}, "Profession1"),
    ],
    option_2: [
        _jsx(MonthlyIncome, {}, "MonthlyIncome2"),
        _jsx(AmountIncomeCurrentYear, {}, "AmountIncomeCurrentYear2"),
        _jsx(StartDate, {}, "StartDate2"),
        _jsx(FieldOfActivity, {}, "FieldOfActivity2"),
        _jsx(CompanyName, {}, "CompanyName2"),
        _jsx(Profession, {}, "Profession2"),
    ],
    option_3: [
        _jsx(MonthlyIncome, {}, "MonthlyIncome3"),
        _jsx(AmountIncomeCurrentYear, {}, "AmountIncomeCurrentYear3"),
        _jsx(StartDate, {}, "StartDate3"),
        _jsx(FieldOfActivity, {}, "FieldOfActivity3"),
        _jsx(CompanyName, {}, "CompanyName3"),
        _jsx(Profession, {}, "Profession3"),
    ],
    option_4: [
        _jsx(MonthlyIncome, {}, "MonthlyIncome4"),
        _jsx(AmountIncomeCurrentYear, {}, "AmountIncomeCurrentYear4"),
        _jsx(StartDate, {}, "StartDate4"),
        _jsx(FieldOfActivity, {}, "FieldOfActivity4"),
        _jsx(CompanyName, {}, "CompanyName4"),
        _jsx(Profession, {}, "Profession4"),
    ],
    option_5: [_jsx(NoIncome, {}, "NoIncome5"), _jsx(Column, {}, "column")],
    option_6: [_jsx(MonthlyIncome, {}, "MonthlyIncome6"), _jsx(Column, {}, "column")],
    option_7: [_jsx(MonthlyIncome, {}, "MonthlyIncome7"), _jsx(Column, {}, "column")],
};
