// import React from 'react'
import { useTranslation } from 'react-i18next'

import './PhoneConfirm.css'

// Компонент окна подтверждения телефона
export default function PhoneConfirm() {
  const { i18n } = useTranslation()

  const handleClosePhone = () => {
    document.getElementsByClassName('phone-confirm')[0].classList.add('hidden')
    document.getElementsByClassName('side-overlay')[0].classList.add('hidden')
  }

  return (
    <div
      className={'phone-confirm hidden'}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: '9999',
      }}
    >
      <div className="frame36-basic-module">
        <div className="frame36-frame1410093408">
          <div className="frame36-frame1410093471">
            <img
              src="/static/phone-confirm/xi114-mlw4.svg"
              alt="XI114"
              className="frame36-x"
              style={{
                cursor: 'pointer',
              }}
              onClick={handleClosePhone}
            />
            <span className="frame36-text076 Russianmain(Roboto)25400-Regular">
              <span>
                <span>Оставьте свой номер телефона</span>
                <br></br>
                <span>чтобы получать лучшиe предложения</span>
              </span>
            </span>
            <span className="frame36-text081 Paragraph(Inter)14400-Regular">
              <span>
                Подтвердите номер телефона, чтобы мы смогли прислать смс с
                решением от банков. Мы гарантируем безопасность и сохранность
                ваших данных
              </span>
            </span>
          </div>
        </div>
        <div className="frame36-frame1410093409">
          <div className="frame36-input7">
            <div className="frame36-title14">
              <div className="frame36-title15">
                <span className="frame36-text083 Paragraph(Inter)16500-Medium">
                  <span>Номер телефона</span>
                </span>
              </div>
            </div>
            <div className="frame36-phone-number">
              <div className="frame36-frame1410093153">
                <div className="frame36-frame1410093150">
                  <div className="frame36-frameisrael">
                    <img
                      src="/static/phone-confirm/artworki114-zdsj.svg"
                      alt="artworkI114"
                      className="frame36-artwork"
                    />
                  </div>
                  <img
                    src="/static/phone-confirm/caretdowni114-rg9.svg"
                    alt="CaretDownI114"
                    className="frame36-caret-down3"
                  />
                </div>
                <img
                  src="/static/phone-confirm/line15i114-m7ro.svg"
                  alt="Line15I114"
                  className="frame36-line15"
                />
              </div>
              <span className="frame36-text085 Paragraph(Inter)16400-Regular">
                <span>+ 935 234 3344</span>
              </span>
            </div>
          </div>
          <div className="frame36-input8">
            <div className="frame36-title16">
              <div className="frame36-title17">
                <span className="frame36-text087 Paragraph(Inter)16500-Medium">
                  <span>Пароль</span>
                </span>
              </div>
            </div>
            <div className="frame36-password">
              <div className="frame36-content">
                <span className="frame36-text089 Paragraph(Inter)16400-Regular">
                  <span>Введите пароль</span>
                </span>
                <div className="frame36-icon-eyes">
                  <img
                    src="/static/phone-confirm/eyeslashi114-6xed.svg"
                    alt="EyeSlashI114"
                    className="frame36-eye-slash"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <span className="frame36-text091 Paragraph(Inter)12400-Regular">
          <span className="frame36-text092">
            Нажимая кнопку “Дальше” я принимаю условия{' '}
          </span>
          <span className="frame36-text093">Пользовательского соглашения</span>
          <span className="frame36-text094">
            {' '}
            и даю свое согласие на обработку моей персональной информации на
            условиях, определенных{' '}
          </span>
          <span>Политикой конфиденциальности.</span>
        </span>
        <div className="frame36-frame1410093410">
          <button className="frame36-button2">
            <div className="frame36-text096">
              <span className="frame36-text097 Russianmain(Roboto)16500-Medium">
                <span>Дальше</span>
              </span>
            </div>
          </button>
          <span className="frame36-text099 Paragraph(Inter)14400-Regular">
            <span className="frame36-text100">
              Уже являетесь нашим клиентом?{' '}
            </span>
            <span>Войдите здесь</span>
          </span>
        </div>
      </div>
    </div>
  )
}
