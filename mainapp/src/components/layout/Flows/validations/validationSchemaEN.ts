import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

const validationName = Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field'))

const validationPhone = Yup.string()
  .test({
    name: 'check-email',
    exclusive: false,
    params: {},
    message: '',
    test: function (value) {
      const { email } = this.parent
      if (!email) {
        if (value) return true
        return this.createError({
          message: getValidationErrorSync('error_fill_field', 'Please fill this field'),
        })
      }
      return true
    },
  })
  .nullable()

const validationEmail = Yup.string()
  .email(getValidationErrorSync('error_invalid_email', 'Invalid email address'))
  .test({
    name: 'check-phone',
    exclusive: false,
    params: {},
    message: '',
    test: function (value) {
      const { phone } = this.parent
      if (!phone) {
        if (value) return true
        return this.createError({
          message: getValidationErrorSync('error_fill_field', 'Please fill this field'),
        })
      }
      return true
    },
  })
  .nullable()

const validationPassword = Yup.string()
  .test({
    test: (value) => {
      if (!value) return
      const errors = []

      if (!/^(?=.{8,})/.test(value)) {
        errors.push(getValidationErrorSync('error_password_min_length', 'Minimum 8 characters required'))
      }

      if (!/^(?=.*[!@#\$%\^&\*])/.test(value)) {
        errors.push(getValidationErrorSync('error_password_special_chars', 'Must contain special characters'))
      }

      if (!/^(?=.*[0-9])/.test(value)) {
        errors.push(getValidationErrorSync('error_password_numbers', 'Must contain numbers'))
      }

      if (!/^(?=.*[A-Z, А-Я])/.test(value)) {
        errors.push(getValidationErrorSync('error_password_case', 'Must contain uppercase and lowercase letters'))
      }

      if (errors.length > 0) {
        // Fixed typing: Properly construct ValidationError with correct types
        throw new Yup.ValidationError(
          errors,
          value,
          'password'
        )
      }

      return true
    },
  })
  .required(getValidationErrorSync('error_fill_field', 'Please fill this field'))

export const validationSchemaEN = {
  AuthFlow: {
    AuthForm: Yup.object().shape({
      phone: validationPhone,
      email: validationEmail,
      password: validationPassword,
    }),
    CodeVerify: Yup.object().shape({
      code: Yup.string().length(4, '').required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    }),
  },
  RestorePasswordFlow: {
    TypeVerify: Yup.object().shape({
      phone: validationPhone,
      email: validationEmail,
    }),
    RestorePassword: Yup.object().shape({
      password: validationPassword,
    }),
    CodeVerify: Yup.object().shape({
      code: Yup.string().length(4, '').required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    }),
  },
  RegistrationFlow: {
    PersonalDataForm: Yup.object().shape({
      name: validationName,
      citizenship: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      additionalCitizenship: Yup.array().nullable(),
      dateBirth: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      sex: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      familyStatus: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      children18: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      children18Number: Yup.string().nullable(),
      education: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      payTax: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      payTaxCountries: Yup.array().nullable(),
      isPublic: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    }),
    PartnerPersonalDataForm: Yup.object().shape({
      name: validationName,
      citizenship: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      additionalCitizenship: Yup.array().nullable(),
      dateBirth: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      sex: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      education: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      payTax: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      payTaxCountries: Yup.array().nullable(),
      isPublic: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
    }),
    IncomeForm: Yup.object().shape({
      yearsWork: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      sphere: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      monthlyIncomeNet: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      monthlyIncomeGross: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      additionalIncome: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      additionalIncomeAmount: Yup.string().nullable(),
      monthlyOutgoings: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      assets: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      assetsAmount: Yup.string().nullable(),
      existingLoans: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      existingLoansBankName: Yup.string().nullable(),
      existingLoansAmount: Yup.string().nullable(),
      existingLoansType: Yup.string().nullable(),
      existingLoansMonthlyPayments: Yup.string().nullable(),
      existingLoansTermEnd: Yup.string().nullable(),
      creditCards: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      creditCardsAmount: Yup.string().nullable(),
      creditCardsMonthlyPayments: Yup.string().nullable(),
    }),
    PartnerIncomeForm: Yup.object().shape({
      yearsWork: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      sphere: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      monthlyIncomeNet: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      monthlyIncomeGross: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      additionalIncome: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      additionalIncomeAmount: Yup.string().nullable(),
      monthlyOutgoings: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      assets: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      assetsAmount: Yup.string().nullable(),
      existingLoans: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      existingLoansBankName: Yup.string().nullable(),
      existingLoansAmount: Yup.string().nullable(),
      existingLoansType: Yup.string().nullable(),
      existingLoansMonthlyPayments: Yup.string().nullable(),
      existingLoansTermEnd: Yup.string().nullable(),
      creditCards: Yup.string().required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      creditCardsAmount: Yup.string().nullable(),
      creditCardsMonthlyPayments: Yup.string().nullable(),
    }),
  },
}