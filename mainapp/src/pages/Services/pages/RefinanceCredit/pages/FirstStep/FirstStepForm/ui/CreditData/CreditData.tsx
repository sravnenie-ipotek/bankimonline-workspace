import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DeleteIcon } from '@assets/icons/DeleteIcon'
import { AddButton } from '@src/components/ui/AddButton'
import { Calendar } from '@src/components/ui/Calendar'
import { Column } from '@src/components/ui/Column'
import Divider from '@src/components/ui/Divider/Divider'
import { DropdownMenu } from '@src/components/ui/DropdownMenu'
import { ExitModule } from '@src/components/ui/ExitModule'
import { FormattedInput } from '@src/components/ui/FormattedInput'
import { Row } from '@src/components/ui/Row'
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
  const [opened, { open, close }] = useDisclosure(false)
  const { isDesktop, isTablet, isMobile } = useWindowResize()

  const { t, i18n } = useTranslation()

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
    { value: 'hapoalim', label: t('bank_hapoalim') },
    { value: 'leumi', label: t('bank_leumi') },
    { value: 'discount', label: t('bank_discount') },
    { value: 'massad', label: t('bank_massad') },
    { value: 'israel', label: t('bank_israel') },
  ]

  return (
    <>
      <div className={cx('mortgage-data')}>
        <div className={cx('mortgage-data-title')}>
          <h4 className={cx('mortgage-data-title__text')}>
            {t('list_credits_title')}
          </h4>
        </div>
        {isDesktop && (
          <div className={cx('mortgage-data-form')}>
            <div className={cx('mortgage-data-form__items')}>
              {creditData.map((item) => (
                <Fragment key={item.id}>
                  <div key={item.id} className={cx('container')}>
                    <div className={cx('col', 'col-1')}>
                      <DropdownMenu
                        title={t('bank_apply_credit')}
                        data={banks}
                        placeholder={t('calculate_mortgage_first_ph')}
                        value={item.bank}
                        onChange={(value) =>
                          setFieldValue(`creditData.${item.id - 1}.bank`, value)
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.bank`)}
                        error={touched.creditData?.[item.id - 1]?.bank && errors.creditData?.[item.id - 1]?.bank}
                      />
                    </div>
                    <div className={cx('col', 'col-2')}>
                      <FormattedInput
                        title={t('amount_credit_title')}
                        placeholder="1,000,000"
                        value={item.amount}
                        handleChange={(value) =>
                          setFieldValue(
                            `creditData.${item.id - 1}.amount`,
                            value
                          )
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.amount`)}
                        error={touched.creditData?.[item.id - 1]?.amount && errors.creditData?.[item.id - 1]?.amount}
                      />
                    </div>
                    <div className={cx('col', 'col-3')}>
                      <FormattedInput
                        title={t('calculate_mortgage_initial_payment')}
                        placeholder="1,000,000"
                        value={item.monthlyPayment}
                        handleChange={(value) =>
                          setFieldValue(
                            `creditData.${item.id - 1}.monthlyPayment`,
                            value
                          )
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.monthlyPayment`)}
                        error={touched.creditData?.[item.id - 1]?.monthlyPayment && errors.creditData?.[item.id - 1]?.monthlyPayment}
                      />
                    </div>
                    <div className={cx('col', 'col-4')}>
                      {item.id !== 1 && (
                        <DeleteIcon onClick={() => openModalWithId(item.id)} />
                      )}
                    </div>
                  </div>
                  <div className={cx('container')}>
                    <div className={cx('col', 'col-1')}>
                      <Calendar
                        title={t('refinance_credit_start_date')}
                        placeholder={t('date_ph')}
                        value={item.startDate}
                        isCreditDate={true}
                        onChange={(value) =>
                          setFieldValue(
                            `creditData.${item.id - 1}.startDate`,
                            value
                          )
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.startDate`)}
                        error={touched.creditData?.[item.id - 1]?.startDate && errors.creditData?.[item.id - 1]?.startDate}
                      />
                    </div>
                    <div className={cx('col', 'col-2')}>
                      <Calendar
                        title={t('refinance_credit_end_date')}
                        placeholder={t('date_ph')}
                        value={item.endDate}
                        allowFuture={true}
                        onChange={(value) =>
                          setFieldValue(
                            `creditData.${item.id - 1}.endDate`,
                            value
                          )
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.endDate`)}
                        error={touched.creditData?.[item.id - 1]?.endDate && errors.creditData?.[item.id - 1]?.endDate}
                      />
                    </div>
                    <div className={cx('col', 'col-3')}>
                      {shouldShowEarlyRepayment && (
                        <FormattedInput
                          title={t('early_repayment')}
                          placeholder="1,000,000"
                          value={item.earlyRepayment}
                          handleChange={(value) =>
                            setFieldValue(
                              `creditData.${item.id - 1}.earlyRepayment`,
                              value
                            )
                          }
                          onBlur={() => setFieldTouched(`creditData.${item.id - 1}.earlyRepayment`)}
                          error={touched.creditData?.[item.id - 1]?.earlyRepayment && errors.creditData?.[item.id - 1]?.earlyRepayment}
                        />
                      )}
                    </div>
                    <div className={cx('col', 'col-4')}></div>
                  </div>
                </Fragment>
              ))}
              <div className={cx('container')}>
                <div className={cx('col', 'col-1')}>
                  <AddButton
                    variant="none"
                    color="#FBE54D"
                    value={t('add_credit')}
                    onClick={addCreditData}
                  />
                </div>
                <div className={cx('col', 'col-2')}></div>
                <div className={cx('col', 'col-3')}></div>
                <div className={cx('col', 'col-4')}></div>
                <div className={cx('col', 'col-5')}></div>
              </div>
            </div>
          </div>
        )}
        {isTablet && (
          <div className={cx('mortgage-data-form')}>
            <Row>
              {creditData.map((item, index) => (
                <Fragment key={item.id}>
                  <Column>
                    <DropdownMenu
                      title={t('bank_apply_credit')}
                      data={banks}
                      placeholder={t('calculate_mortgage_first_ph')}
                      value={item.bank}
                      onChange={(value) =>
                        setFieldValue(`creditData.${item.id - 1}.bank`, value)
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.bank`)}
                      error={touched.creditData?.[item.id - 1]?.bank && errors.creditData?.[item.id - 1]?.bank}
                    />
                  </Column>
                  <Column>
                    <FormattedInput
                      title={t('amount_credit_title')}
                      placeholder="1,000,000"
                      value={item.amount}
                      handleChange={(value) =>
                        setFieldValue(`creditData.${item.id - 1}.amount`, value)
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.amount`)}
                      error={touched.creditData?.[item.id - 1]?.amount && errors.creditData?.[item.id - 1]?.amount}
                    />
                  </Column>
                  <Column>
                    <FormattedInput
                      title={t('calculate_mortgage_initial_payment')}
                      placeholder="1,000,000"
                      value={item.monthlyPayment}
                      handleChange={(value) =>
                        setFieldValue(
                          `creditData.${item.id - 1}.monthlyPayment`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.monthlyPayment`)}
                      error={touched.creditData?.[item.id - 1]?.monthlyPayment && errors.creditData?.[item.id - 1]?.monthlyPayment}
                    />
                  </Column>
                  <Column>
                    <Calendar
                      title={t('refinance_credit_start_date')}
                      placeholder={t('date_ph')}
                      value={item.startDate}
                      isCreditDate={true}
                      onChange={(value) =>
                        setFieldValue(
                          `creditData.${item.id - 1}.startDate`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.startDate`)}
                      error={touched.creditData?.[item.id - 1]?.startDate && errors.creditData?.[item.id - 1]?.startDate}
                    />
                  </Column>
                  <Column>
                    <Calendar
                      title={t('refinance_credit_end_date')}
                      placeholder={t('date_ph')}
                      value={item.endDate}
                      allowFuture={true}
                      onChange={(value) =>
                        setFieldValue(
                          `creditData.${item.id - 1}.endDate`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.endDate`)}
                      error={touched.creditData?.[item.id - 1]?.endDate && errors.creditData?.[item.id - 1]?.endDate}
                    />
                  </Column>
                  <Column>
                    {shouldShowEarlyRepayment && (
                      <FormattedInput
                        title={t('early_repayment')}
                        placeholder="1,000,000"
                        value={item.earlyRepayment}
                        handleChange={(value) =>
                          setFieldValue(
                            `creditData.${item.id - 1}.earlyRepayment`,
                            value
                          )
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.earlyRepayment`)}
                        error={touched.creditData?.[item.id - 1]?.earlyRepayment && errors.creditData?.[item.id - 1]?.earlyRepayment}
                      />
                    )}
                  </Column>
                  {item.id !== 1 && (
                    <Column>
                      <div className={cx('delete-icon')}>
                        <DeleteIcon onClick={() => openModalWithId(item.id)} />
                        {t('delete')}
                      </div>
                    </Column>
                  )}
                  {index !== creditData.length - 1 && <Divider />}
                </Fragment>
              ))}
              <Column>
                <AddButton
                  variant="none"
                  color="#FBE54D"
                  value={t('add_credit')}
                  onClick={addCreditData}
                />
              </Column>
            </Row>
          </div>
        )}
        {isMobile && (
          <div className={cx('mortgage-data-form')}>
            <Row>
              {creditData.map((item, index) => (
                <Fragment key={item.id}>
                  <Column>
                    <DropdownMenu
                      title={t('bank_apply_credit')}
                      data={banks}
                      placeholder={t('calculate_mortgage_first_ph')}
                      value={item.bank}
                      onChange={(value) =>
                        setFieldValue(`creditData.${item.id - 1}.bank`, value)
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.bank`)}
                      error={touched.creditData?.[item.id - 1]?.bank && errors.creditData?.[item.id - 1]?.bank}
                    />
                  </Column>
                  <Column>
                    <FormattedInput
                      title={t('amount_credit_title')}
                      placeholder="1,000,000"
                      value={item.amount}
                      handleChange={(value) =>
                        setFieldValue(`creditData.${item.id - 1}.amount`, value)
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.amount`)}
                      error={touched.creditData?.[item.id - 1]?.amount && errors.creditData?.[item.id - 1]?.amount}
                    />
                  </Column>
                  <Column>
                    <FormattedInput
                      title={t('calculate_mortgage_initial_payment')}
                      placeholder="1,000,000"
                      value={item.monthlyPayment}
                      handleChange={(value) =>
                        setFieldValue(
                          `creditData.${item.id - 1}.monthlyPayment`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.monthlyPayment`)}
                      error={touched.creditData?.[item.id - 1]?.monthlyPayment && errors.creditData?.[item.id - 1]?.monthlyPayment}
                    />
                  </Column>
                  <Column>
                    <Calendar
                      title={t('refinance_credit_start_date')}
                      placeholder={t('date_ph')}
                      value={item.startDate}
                      isCreditDate={true}
                      onChange={(value) =>
                        setFieldValue(
                          `creditData.${item.id - 1}.startDate`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.startDate`)}
                      error={touched.creditData?.[item.id - 1]?.startDate && errors.creditData?.[item.id - 1]?.startDate}
                    />
                  </Column>
                  <Column>
                    <Calendar
                      title={t('refinance_credit_end_date')}
                      placeholder={t('date_ph')}
                      value={item.endDate}
                      allowFuture={true}
                      onChange={(value) =>
                        setFieldValue(
                          `creditData.${item.id - 1}.endDate`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched(`creditData.${item.id - 1}.endDate`)}
                      error={touched.creditData?.[item.id - 1]?.endDate && errors.creditData?.[item.id - 1]?.endDate}
                    />
                  </Column>
                  <Column>
                    {shouldShowEarlyRepayment && (
                      <FormattedInput
                        title={t('early_repayment')}
                        placeholder="1,000,000"
                        value={item.earlyRepayment}
                        handleChange={(value) =>
                          setFieldValue(
                            `creditData.${item.id - 1}.earlyRepayment`,
                            value
                          )
                        }
                        onBlur={() => setFieldTouched(`creditData.${item.id - 1}.earlyRepayment`)}
                        error={touched.creditData?.[item.id - 1]?.earlyRepayment && errors.creditData?.[item.id - 1]?.earlyRepayment}
                      />
                    )}
                  </Column>
                  {item.id !== 1 && (
                    <Column>
                      <div className={cx('delete-icon')}>
                        <DeleteIcon onClick={() => openModalWithId(item.id)} />
                        {t('delete')}
                      </div>
                    </Column>
                  )}
                  {index !== creditData.length - 1 && <Divider />}
                </Fragment>
              ))}
              <Column>
                <AddButton
                  variant="none"
                  color="#FBE54D"
                  value={t('add_credit')}
                  onClick={addCreditData}
                />
              </Column>
            </Row>
          </div>
        )}
      </div>
      <ExitModule
        text={t('remove_credit')}
        subtitle={t('remove_credit_subtitle')}
        isVisible={opened}
        onCancel={close}
        onSubmit={removeCreditData}
      />
    </>
  )
}

export default CreditData
