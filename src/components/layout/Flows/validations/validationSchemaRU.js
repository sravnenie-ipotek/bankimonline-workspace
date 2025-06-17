import * as Yup from 'yup';
const validationName = Yup.string().required('Заполните поле');
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
                message: `Заполните поле`,
            });
        }
        return true;
    },
})
    .nullable();
const validationEmail = Yup.string()
    .email('Неправильная почта')
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
                message: `Заполните поле`,
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
            errors.push('Минимум 8 символов');
        }
        if (!/^(?=.*[!@#\$%\^&\*])/.test(value)) {
            errors.push('Обязательно должны быть специальные символы');
        }
        if (!/^(?=.*[0-9])/.test(value)) {
            errors.push('Обязательно должны быть цифры');
        }
        if (!/^(?=.*[A-Z, А-Я])/.test(value)) {
            errors.push('Обязательно должны быть заглавные и строчные буквы');
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
    .required('Заполните поле');
export const validationSchemaRU = {
    AuthFlow: {
        AuthForm: Yup.object().shape({
            phone: validationPhone,
            email: validationEmail,
            password: validationPassword,
        }),
        CodeVerify: Yup.object().shape({
            code: Yup.string().length(4, '').required('Заполните поле'),
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
                .oneOf([Yup.ref('password'), ''], 'Пароли не совпадают')
                .nullable()
                .required('Заполните поле'),
        }),
    },
    SignUpFlow: {
        SignUpForm: Yup.object().shape({
            name: validationName,
            phone: validationPhone,
            email: validationEmail,
            password: validationPassword,
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), ''], 'Пароли не совпадают')
                .nullable()
                .required('Заполните поле'),
        }),
    },
};
