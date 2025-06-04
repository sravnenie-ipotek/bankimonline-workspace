import classNames from 'classnames/bind'
import { Form, Formik } from 'formik'
import { TFunction } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { Close } from '@assets/icons/Close'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import { Button } from '../Button'
import { Input } from '../Input'
import {
  formattingCardCVV,
  unformattingCardCVV,
} from '../Input/formatting/cardCVV'
import {
  formattingCardDate,
  unformattingCardDate,
} from '../Input/formatting/cardDate'
import {
  formattingCardNumber,
  unformattingCardNumber,
} from '../Input/formatting/cardNumber'
import { Modal } from '../Modal'
import styles from './addCreditCard.module.scss'

const cx = classNames.bind(styles)

interface AddCreditCardProps {
  visibleAddCreditCard: boolean
  setVisibleAddCreditCard: (isVisible: boolean) => void
}

const getAddCreditCardSchema = (isRussian: boolean, t: TFunction) => {
  return Yup.object().shape({
    cardNumber: Yup.string()
      .min(16, t('addCreditCardProps.yup.cardNumberMin'))
      .max(16, t('addCreditCardProps.yup.cardNumberMax'))
      .required(t('addCreditCardProps.yup.cardNumberRequired')),

    cardDate: Yup.string()
      .min(4, t('addCreditCardProps.yup.cardDateMin'))
      .max(4, t('addCreditCardProps.yup.cardDateMax'))
      .required(t('addCreditCardProps.yup.cardDateRequired')),

    cardCVV: Yup.string()
      .min(3, t('addCreditCardProps.yup.cardCVVMin'))
      .max(3, t('addCreditCardProps.yup.cardCVVMax'))
      .required(t('addCreditCardProps.yup.cardCVVRequired')),

    cardName: Yup.string().required(t('addCreditCardProps.yup.cardName')),
  })
}

const AddCreditCard: React.FC<AddCreditCardProps> = ({
  visibleAddCreditCard,
  setVisibleAddCreditCard,
}) => {
  const theme = useTheme()
  const closeIconColor = theme?.colors?.base.white

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  const validationAddCreditCardSchema = getAddCreditCardSchema(isRussian, t)

  return (
    <Modal
      visibleModal={visibleAddCreditCard}
      setVisibleModal={setVisibleAddCreditCard}
    >
      <div className="flex flex-row-reverse">
        <div
          onClick={() => setVisibleAddCreditCard(false)}
          className="cursor-pointer"
        >
          <Close color={closeIconColor} />
        </div>
      </div>
      <p className={cx('addCreditTitle')}>
        {t('addCreditCardProps.addCreditTitle')}
      </p>
      <Formik
        initialValues={{
          cardNumber: '',
          cardDate: '',
          cardCVV: '',
          cardName: '',
        }}
        validationSchema={validationAddCreditCardSchema}
        onSubmit={(values) => {
          console.log(JSON.stringify(values, null, 2))
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <div className={cx('addCreditInputsPlate')}>
              <Input
                placeholder={
                  isRussian ? '1234 1234 1234 1234' : '1234 1234 1234 1234'
                }
                title={t('addCreditCardProps.addCreditCardNumberTitle')}
                className={'w-full'}
                name="cardNumber"
                error={errors.cardNumber}
                touched={touched.cardNumber}
                formatting={formattingCardNumber}
                unformatting={unformattingCardNumber}
              />
              <div className={cx('inputPlateRow')}>
                <Input
                  placeholder={t(
                    'addCreditCardProps.addCreditCardDateTitlePlaceholder'
                  )}
                  title={t('addCreditCardProps.addCreditCardDateTitle')}
                  className={cx(
                    isRussian ? 'inputPlateRowInputMr' : 'inputPlateRowInputMl'
                  )}
                  name="cardDate"
                  error={errors.cardDate}
                  touched={touched.cardDate}
                  max={257}
                  formatting={formattingCardDate}
                  unformatting={unformattingCardDate}
                />
                <Input
                  placeholder={isRussian ? '432' : '432'}
                  title={isRussian ? 'CVC/CVV' : 'CVC/CVV'}
                  className={cx('inputPlateRowInput')}
                  type="number"
                  name="cardCVV"
                  error={errors.cardCVV}
                  touched={touched.cardCVV}
                  max={257}
                  formatting={formattingCardCVV}
                  unformatting={unformattingCardCVV}
                />
              </div>
              <Input
                placeholder={t('addCreditCardProps.addCreditCardNameTitle')}
                title={t(
                  'addCreditCardProps.addCreditCardNameTitlePlaceholder'
                )}
                className={'w-full'}
                name="cardName"
                error={errors.cardName}
                touched={touched.cardName}
              />
            </div>
            <Button view="flex" type="submit">
              {t('addCreditCardProps.addCreditCardNameButton')}
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default AddCreditCard
