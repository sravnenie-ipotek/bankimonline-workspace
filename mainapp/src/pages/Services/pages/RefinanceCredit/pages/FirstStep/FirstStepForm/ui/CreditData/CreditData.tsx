import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DeleteIcon } from '@assets/icons/DeleteIcon'
import { AddButton } from '@src/components/ui/AddButton'
import { Calendar } from '@src/components/ui/Calendar'
import { Column } from '@src/components/ui/Column'
import { Row } from '@src/components/ui/Row'
import Divider from '@src/components/ui/Divider/Divider'
import { DropdownMenu } from '@src/components/ui/DropdownMenu'
import { ExitModule } from '@src/components/ui/ExitModule'
import { FormattedInput } from '@src/components/ui/FormattedInput'
import { useContentApi } from '@src/hooks/useContentApi'
import useDisclosure from '@src/hooks/useDisclosure'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RefinanceCreditTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import styles from './creditData.module.scss'

const cx = classNames.bind(styles)

export type CreditDataTypes = {
  id: number
  bank: string
  amount: number | null
  monthlyPayment: number | null
  startDate: string
  endDate: string
  earlyRepayment: number | null
}

const CreditData = () => {
  const [creditData, setCreditData] = useState<CreditDataTypes[]>([])
  const [idToDelete, setIdToDelete] = useState<number | null>(null)
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext<RefinanceCreditTypes>()
  // Extract only string error for creditData to avoid generic 'An error occurred'
  const creditDataError = typeof (errors as any).creditData === 'string' ? (errors as any).creditData as string : undefined
  const [opened, { open, close }] = useDisclosure(false)
  const { isDesktop, isTablet, isMobile } = useWindowResize()

  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('refinance_credit_1')

  // Check if early repayment should be shown based on refinancing goal
  // Only show for option_2 (Reduce credit amount) according to Confluence specification
  const shouldShowEarlyRepayment = values.refinancingCredit === 'option_2'

  useEffect(() => {
    setCreditData(values.creditData)
  }, [values.creditData])

  const addCreditData = () => {
    const newId = generateNewId(creditData)
    const newData: CreditDataTypes = {
      id: newId,
      bank: '',
      amount: null,
      monthlyPayment: null,
      startDate: '',
      endDate: '',
      earlyRepayment: null,
    }

    setFieldValue('creditData', [...creditData, newData])
    // Reset touched state for creditData to prevent immediate validation popups
    setFieldTouched('creditData', false, false)
  }

  const openModalWithId = (id: number) => {
    setIdToDelete(id)
    open()
  }

  const removeCreditData = () => {
    if (idToDelete !== null) {
      const filteredData = creditData.filter((item) => item.id !== idToDelete)
      setFieldValue('creditData', filteredData)
    }
    close()
  }

  const banks = [
    { value: 'hapoalim', label: getContent('bank_hapoalim', t('bank_hapoalim')) },
    { value: 'leumi', label: getContent('bank_leumi', t('bank_leumi')) },
    { value: 'discount', label: getContent('bank_discount', t('bank_discount')) },
    { value: 'massad', label: getContent('bank_massad', t('bank_massad')) },
    { value: 'israel', label: getContent('bank_israel', t('bank_israel')) },
  ]

  return (
    <>
      <div className={cx('mortgage-data')}>
        <div className={cx('mortgage-data-title')}>
          <h4 className={cx('mortgage-data-title__text')}>
            {getContent('list_credits_title', t('list_credits_title'))}
          </h4>
        </div>
        {isDesktop && (
          <div className={cx('mortgage-data-form')}>
            <div className={cx('mortgage-data-form__items')}>
              {creditData.map((item) => (
                <Fragment key={item.id}>
                  <Row>
                    <Column>
                      <DropdownMenu
                        data={banks}
                        title={getContent('bank_apply_credit', t('bank_apply_credit'))}
                        placeholder={getContent('calculate_mortgage_first_ph', t('calculate_mortgage_first_ph'))}
                        value={item.bank}
                        onChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, bank: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <FormattedInput
                        title={getContent('amount_credit_title', t('amount_credit_title'))}
                        handleChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, amount: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        value={item.amount}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <FormattedInput
                        title={getContent('calculate_mortgage_initial_payment', t('calculate_mortgage_initial_payment'))}
                        handleChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, monthlyPayment: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        value={item.monthlyPayment}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                  </Row>
                  <Row>
                    <Column>
                      <Calendar
                        title={getContent('refinance_credit_start_date', t('refinance_credit_start_date'))}
                        placeholder={getContent('date_ph', t('date_ph'))}
                        value={item.startDate}
                        onChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, startDate: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <Calendar
                        title={getContent('refinance_credit_end_date', t('refinance_credit_end_date'))}
                        placeholder={getContent('date_ph', t('date_ph'))}
                        value={item.endDate}
                        onChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, endDate: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                        blockPastDates={true}
                        allowFuture={true}
                      />
                    </Column>
                    {shouldShowEarlyRepayment && (
                      <Column>
                        <FormattedInput
                          title={getContent('early_repayment', t('early_repayment'))}
                          handleChange={(value) => {
                            const updatedData = creditData.map((credit) =>
                              credit.id === item.id ? { ...credit, earlyRepayment: value } : credit
                            )
                            setFieldValue('creditData', updatedData)
                          }}
                          value={item.earlyRepayment}
                          onBlur={() => setFieldTouched('creditData')}
                          error={touched.creditData && creditDataError}
                        />
                      </Column>
                    )}
                    {!shouldShowEarlyRepayment && <Column />}
                  </Row>
                  <div className={cx('mortgage-data-form__item-delete-wrapper')}>
                    <button
                      type="button"
                      className={cx('mortgage-data-form__item-delete-button')}
                      onClick={() => openModalWithId(item.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                  <Divider />
                </Fragment>
              ))}
            </div>
            <div className={cx('mortgage-data-form__add')}>
              <AddButton
                value={getContent('add_credit', t('add_credit'))}
                onClick={addCreditData}
              />
            </div>
          </div>
        )}
        {(isTablet || isMobile) && (
          <div className={cx('mortgage-data-form')}>
            <div className={cx('mortgage-data-form__items')}>
              {creditData.map((item) => (
                <Fragment key={item.id}>
                  <Row>
                    <Column>
                      <DropdownMenu
                        data={banks}
                        title={getContent('bank_apply_credit', t('bank_apply_credit'))}
                        placeholder={getContent('calculate_mortgage_first_ph', t('calculate_mortgage_first_ph'))}
                        value={item.bank}
                        onChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, bank: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <FormattedInput
                        title={getContent('amount_credit_title', t('amount_credit_title'))}
                        handleChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, amount: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        value={item.amount}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <FormattedInput
                        title={getContent('calculate_mortgage_initial_payment', t('calculate_mortgage_initial_payment'))}
                        handleChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, monthlyPayment: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        value={item.monthlyPayment}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <Calendar
                        title={getContent('refinance_credit_start_date', t('refinance_credit_start_date'))}
                        placeholder={getContent('date_ph', t('date_ph'))}
                        value={item.startDate}
                        onChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, startDate: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                      />
                    </Column>
                    <Column>
                      <Calendar
                        title={getContent('refinance_credit_end_date', t('refinance_credit_end_date'))}
                        placeholder={getContent('date_ph', t('date_ph'))}
                        value={item.endDate}
                        onChange={(value) => {
                          const updatedData = creditData.map((credit) =>
                            credit.id === item.id ? { ...credit, endDate: value } : credit
                          )
                          setFieldValue('creditData', updatedData)
                        }}
                        onBlur={() => setFieldTouched('creditData')}
                        error={touched.creditData && creditDataError}
                        blockPastDates={true}
                        allowFuture={true}
                      />
                    </Column>
                    {shouldShowEarlyRepayment && (
                      <Column>
                        <FormattedInput
                          title={getContent('early_repayment', t('early_repayment'))}
                          handleChange={(value) => {
                            const updatedData = creditData.map((credit) =>
                              credit.id === item.id ? { ...credit, earlyRepayment: value } : credit
                            )
                            setFieldValue('creditData', updatedData)
                          }}
                          value={item.earlyRepayment}
                          onBlur={() => setFieldTouched('creditData')}
                          error={touched.creditData && creditDataError}
                        />
                      </Column>
                    )}
                  </Row>
                  <div className={cx('mortgage-data-form__item-delete-wrapper')}>
                    <button
                      type="button"
                      className={cx('mortgage-data-form__item-delete-button')}
                      onClick={() => openModalWithId(item.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                  <Divider />
                </Fragment>
              ))}
            </div>
            <div className={cx('mortgage-data-form__add')}>
              <AddButton
                value={getContent('add_credit', t('add_credit'))}
                onClick={addCreditData}
              />
            </div>
          </div>
        )}
      </div>
      <ExitModule
        opened={opened}
        onClose={close}
        title={getContent('remove_credit', t('remove_credit'))}
        subtitle={getContent('remove_credit_subtitle', t('remove_credit_subtitle'))}
        onConfirm={removeCreditData}
        confirmText={getContent('delete', t('delete'))}
      />
    </>
  )
}

export default CreditData