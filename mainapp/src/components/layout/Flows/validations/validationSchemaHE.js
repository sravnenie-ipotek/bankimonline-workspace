import * as Yup from 'yup';
const validationName = Yup.string().required('מלא את השדה');
const validationPhone = Yup.string()
    .test({
    name: 'check-email',
    exclusive: false,
    params: {},
    message: '',
    test: function (value) {
        const { email } = this.parent;
        if (!email) {
            if (value)
                return true;
            return this.createError({
                message: `מלא את השדה`,
            });
        }
        return true;
    },
})
    .nullable();
const validationEmail = Yup.string()
    .email('דואר שגוי')
    .test({
    name: 'check-phone',
    exclusive: false,
    params: {},
    message: '',
    test: function (value) {
        const { phone } = this.parent;
        if (!phone) {
            if (value)
                return true;
            return this.createError({
                message: `מלא את השדה`,
            });
        }
        return true;
    },
})
    .nullable();
const validationPassword = Yup.string()
    .test({
    test: (value) => {
        if (!value)
            return;
        const errors = [];
        if (!/^(?=.{8,})/.test(value)) {
            errors.push('מינימום 8 תווים');
        }
        if (!/^(?=.*[!@#\$%\^&\*])/.test(value)) {
            errors.push('חייבות להיות תווים מיוחדים');
        }
        if (!/^(?=.*[0-9])/.test(value)) {
            errors.push('חייבים להיות מספרים');
        }
        if (!/^(?=.*[A-Z, А-Я])/.test(value)) {
            errors.push('חייב להיות אותיות רישיות וקטנות');
        }
        if (errors.length > 0) {
            //TODO: разобраться с типизацией (хотя все работатет)
            throw new Yup.ValidationError({
                errors: errors,
                inner: true,
                path: 'password',
                message: errors,
                value: value,
                name: 'ValidationError',
            });
        }
        return true;
    },
})
    .required('מלא את השדה');
export const validationSchemaHE = {
    AuthFlow: {
        AuthForm: Yup.object().shape({
            phone: validationPhone,
            email: validationEmail,
            password: validationPassword,
        }),
        CodeVerify: Yup.object().shape({
            code: Yup.string().length(4, '').required('מלא את השדה'),
        }),
    },
    RestorePasswordFlow: {
        TypeVerify: Yup.object().shape({
            phone: validationPhone,
            email: validationEmail,
        }),
        RestorePassword: Yup.object().shape({
            password: validationPassword,
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), ''], 'סיסמה לא תואמת')
                .nullable()
                .required('מלא את השדה'),
        }),
    },
    SignUpFlow: {
        SignUpForm: Yup.object().shape({
            name: validationName,
            phone: validationPhone,
            email: validationEmail,
            password: validationPassword,
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), ''], 'סיסמה לא תואמת')
                .nullable()
                .required('מלא את השדה'),
        }),
    },
};
