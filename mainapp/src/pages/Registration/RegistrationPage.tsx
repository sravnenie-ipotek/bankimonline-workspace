import React, { useState, useEffect } from 'react';
import styles from './RegistrationPage.module.scss';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const validateForm = () => {
      const { fullName, phone, password, confirmPassword } = formData;
      const newErrors = {
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
      };

      // Basic validation
      if (!fullName) newErrors.fullName = 'Full name is required.';
      if (!phone) newErrors.phone = 'Phone number is required.';
      if (!password) newErrors.password = 'Password is required.';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

      setErrors(newErrors);
      setIsFormValid(Object.values(newErrors).every(error => error === '') && Object.values(formData).every(field => field !== ''));
    };

    validateForm();
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (phone: string) => {
    setFormData({
      ...formData,
      phone,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.registrationForm}>
        <div className={styles.leftPanel}>
          {/* Content for the left panel */}
          <h2>
            Получайте лучшие условия и позвольте банкам конкурировать за вас
          </h2>
          <p>
            Мы сделали для вас предварительный расчет банковской программы.
            Завершите регистрацию, чтобы мы могли отправить ваши данные Банкам
            партнерам. Они сделают вам эксклюзивные предложения с условиями,
            которые подходят именно вам.
          </p>
          {/* Placeholder for images */}
        </div>
        <div className={styles.rightPanel}>
          <button className={styles.closeButton}>X</button>
          <h3>Регистрация Личного кабинета</h3>
          <p>
            Завершите регистрацию, отправьте единую заявку во все интересующие
            вас банки и получите лучшие индивидуальные предложения
          </p>

          <div className={styles.tabs}>
            <div className={`${styles.tab} ${styles.activeTab}`}>
              По телефону
            </div>
            <div className={styles.tab}>По email</div>
          </div>

          <div className={styles.formContent}>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Имя фамилия (Как в паспорте)</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Имя Фамилия"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
              </div>
              <div className={styles.inputGroup}>
                <label>Номер телефона</label>
                <PhoneInput
                  country={'il'}
                  onlyCountries={['il', 'us', 'ru']}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  containerClass={styles.phoneInputContainer}
                  inputClass={styles.phoneInput}
                  buttonClass={styles.dropdownButton}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
            </div>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Придумайте пароль</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>
              <div className={styles.inputGroup}>
                <label>Подтвердите Пароль</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <div className={styles.policyText}>
            Нажимая кнопку "Зарегистрироваться" я принимаю условия{' '}
            <Link to="/terms" className={styles.link}>
              Пользовательского соглашения
            </Link>{' '}
            и даю свое согласие на обработку моих персональных данныхна
            условиях, определенных{' '}
            <Link to="/privacy-policy" className={styles.link}>
              Политикой конфиденциальности.
            </Link>
          </div>

          <button className={styles.submitButton} disabled={!isFormValid}>
            Зарегистрироваться
          </button>

          <div className={styles.loginLink}>
            Уже являетесь нашим клиентом? Тогда войдите{' '}
            <Link to="/login" className={styles.link}>
              здесь
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage; 