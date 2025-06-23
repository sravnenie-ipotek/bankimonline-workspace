import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DeleteIcon } from '@assets/icons/DeleteIcon'
import { PercentIcon } from '@assets/icons/PercentIcon'
import { WarningOctagonIcon } from '@assets/icons/warningOctagonIcon'
import { AddButton } from '@src/components/ui/AddButton'
import { AlertWarning } from '@src/components/ui/AlertWarning'
import { Calendar } from '@src/components/ui/Calendar'
import { Column } from '@src/components/ui/Column'
import Divider from '@src/components/ui/Divider/Divider'
import { DropdownMenu } from '@src/components/ui/DropdownMenu'
import { ExitModule } from '@src/components/ui/ExitModule'
import Control from '@src/components/ui/FormattedInput/Control/Control'
import { Row } from '@src/components/ui/Row'
import { TitleElement } from '@src/components/ui/TitleElement'
import useDisclosure from '@src/hooks/useDisclosure'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RefinanceMortgageTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import styles from './mortgageData.module.scss'

const cx = classNames.bind(styles)

export type MortgageDataTypes = {
  id: number
  program: string
  balance: number | null
  endDate: string
  bid: number | null
}

const MortgageData = () => {
  const [mortgageData, setMortgageData] = useState<MortgageDataTypes[]>([])
  const [idToDelete, setIdToDelete] = useState<number | null>(null)
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<RefinanceMortgageTypes & MortgageDataTypes[]>()
  const [opened, { open, close }] = useDisclosure(false)
  const { isDesktop, isTablet, isMobile } = useWindowResize()

  const { t, i18n } = useTranslation()

  useEffect(() => {
    setMortgageData(values.mortgageData)
  }, [values.mortgageData])

  const addMortgageData = () => {
    const newId = generateNewId(mortgageData)
    const newData: MortgageDataTypes = {
      id: newId,
      program: '',
      balance: null,
      endDate: '',
      bid: null,
    }

    setFieldValue('mortgageData', [...mortgageData, newData])
  }

  const openModalWithId = (id: number) => {
    setIdToDelete(id)
    open()
  }

  const removeMortgageData = () => {
    if (idToDelete !== null) {
      const filteredData = mortgageData.filter((item) => item.id !== idToDelete)
      setFieldValue('mortgageData', filteredData)
    }
    close()
  }

  const data = [
    { value: 'option_1', label: t('program_refinance_mortgage_option_1') },
    { value: 'option_2', label: t('program_refinance_mortgage_option_2') },
    { value: 'option_3', label: t('program_refinance_mortgage_option_3') },
    { value: 'option_4', label: t('program_refinance_mortgage_option_4') },
    { value: 'option_5', label: t('program_refinance_mortgage_option_5') },
  ]

  const sumBalance = mortgageData.reduce(
    (total, item) => total + item.balance!,
    0
  )

  return (
    <>
      <div className={cx('mortgage-data')}>
        <div className={cx('mortgage-data-title')}>
          <h4 className={cx('mortgage-data-title__text')}>
            {t('enter_mortgage_info')}
          </h4>
          {touched.mortgageData && errors.mortgageData && (
            <AlertWarning
              filled
              icon={<WarningOctagonIcon size={24} color="#E76143" />}
            >
              <p>
                {t('error_balance', {
                  fullBalance: values?.mortgageBalance?.toLocaleString('en-US'),
                  sumBalance: sumBalance.toLocaleString('en-US'),
                  notEnoughBalance: (
                    values.mortgageBalance! - sumBalance
                  ).toLocaleString('en-US'),
                })}
              </p>
            </AlertWarning>
          )}
        </div>
        {isDesktop && (
          <div className={cx('mortgage-data-form')}>
            <div className={cx('container', 'title')}>
              <p className={cx('col', 'col-1')}>{t('programm')}</p>
              <p className={cx('col', 'col-2')}>{t('balance')}</p>
              <p className={cx('col', 'col-3')}>{t('end_date')}</p>
              <p className={cx('col', 'col-4')}>{t('bid')}</p>
              <div className={cx('col', 'col-5')}></div>
            </div>
            <div className={cx('mortgage-data-form__items')}>
              {mortgageData.map((item) => (
                <div key={item.id} className={cx('container')}>
                  <div className={cx('col', 'col-1')}>
                    <DropdownMenu
                      data={data}
                      placeholder={t('calculate_mortgage_first_ph')}
                      value={item.program}
                      onChange={(value) =>
                        setFieldValue(
                          `mortgageData.${item.id - 1}.program`,
                          value
                        )
                      }
                    />
                  </div>
                  <div className={cx('col', 'col-2')}>
                    <Control
                      placeholder="10,000"
                      value={item.balance}
                      handleChange={(value) =>
                        setFieldValue(
                          `mortgageData.${item.id - 1}.balance`,
                          value
                        )
                      }
                      onBlur={() => setFieldTouched('mortgageData', true)}
                      error={touched.mortgageData && errors.mortgageData}
                    />
                  </div>
                  <div className={cx('col', 'col-3')}>
                    <Calendar
                      placeholder={t('date_ph')}
                      value={item.endDate}
                      onChange={(value) =>
                        setFieldValue(
                          `mortgageData.${item.id - 1}.endDate`,
                          value
                        )
                      }
                    />
                  </div>
                  <div className={cx('col', 'col-4')}>
                    <Control
                      placeholder="1"
                      type="numeric"
                      value={item.bid}
                      handleChange={(value) =>
                        setFieldValue(`mortgageData.${item.id - 1}.bid`, value)
                      }
                      rightSection={<PercentIcon color="#FFF" />}
                    />
                  </div>
                  <div className={cx('col', 'col-5')}>
                    {item.id !== 1 && (
                      <DeleteIcon
                        onClick={() => openModalWithId(item.id)}
                        className={cx('delete')}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div className={cx('container')}>
                <div className={cx('col', 'col-1')}>
                  <AddButton
                    variant="none"
                    color="#FBE54D"
                    value={t('add_programm')}
                    onClick={addMortgageData}
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
            <div className={cx('mortgage-data-form__items')}>
              <Row>
                {mortgageData.map((item, index) => (
                  <Fragment key={item.id}>
                    <Column>
                      <TitleElement title={`${t('programm')} #${item.id}`} />
                      <DropdownMenu
                        data={data}
                        placeholder={t('calculate_mortgage_first_ph')}
                        value={item.program}
                        onChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.program`,
                            value
                          )
                        }
                      />
                    </Column>
                    <Column>
                      <TitleElement title={t('balance')} />
                      <Control
                        placeholder="10,000"
                        value={item.balance}
                        handleChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.balance`,
                            value
                          )
                        }
                      />
                    </Column>
                    <Column>
                      <Calendar
                        title={t('end_date')}
                        placeholder={t('date_ph')}
                        value={item.endDate}
                        onChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.endDate`,
                            value
                          )
                        }
                      />
                    </Column>
                    <Column>
                      <TitleElement title={t('bid')} />
                      <Control
                        placeholder="1"
                        value={item.bid}
                        handleChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.bid`,
                            value
                          )
                        }
                        rightSection={<PercentIcon color="#FFF" />}
                      />
                    </Column>
                    {item.id !== 1 && (
                      <Column>
                        <div className={cx('delete-icon')}>
                          <DeleteIcon
                            onClick={() => openModalWithId(item.id)}
                          />
                          {t('delete')}
                        </div>
                      </Column>
                    )}
                    {index !== mortgageData.length - 1 && <Divider />}
                  </Fragment>
                ))}
                <Column>
                  <AddButton
                    variant="none"
                    color="#FBE54D"
                    value={t('add_programm')}
                    onClick={addMortgageData}
                  />
                </Column>
              </Row>
            </div>
          </div>
        )}
        {isMobile && (
          <div className={cx('mortgage-data-form')}>
            <div className={cx('mortgage-data-form__items')}>
              <Row>
                {mortgageData.map((item, index) => (
                  <Fragment key={item.id}>
                    <Column>
                      <TitleElement title={`${t('programm')} #${item.id}`} />
                      <DropdownMenu
                        data={data}
                        placeholder={t('calculate_mortgage_first_ph')}
                        value={item.program}
                        onChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.program`,
                            value
                          )
                        }
                      />
                    </Column>
                    <Column>
                      <TitleElement title={t('balance')} />
                      <Control
                        placeholder="10,000"
                        value={item.balance}
                        handleChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.balance`,
                            value
                          )
                        }
                      />
                    </Column>
                    <Column>
                      <Calendar
                        title={t('end_date')}
                        placeholder={t('date_ph')}
                        value={item.endDate}
                        onChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.endDate`,
                            value
                          )
                        }
                      />
                    </Column>
                    <Column>
                      <TitleElement title={t('bid')} />
                      <Control
                        placeholder="1"
                        value={item.bid}
                        handleChange={(value) =>
                          setFieldValue(
                            `mortgageData.${item.id - 1}.bid`,
                            value
                          )
                        }
                        rightSection={<PercentIcon color="#FFF" />}
                      />
                    </Column>
                    {item.id !== 1 && (
                      <Column>
                        <div className={cx('delete-icon')}>
                          <DeleteIcon
                            onClick={() => openModalWithId(item.id)}
                          />
                          {t('delete')}
                        </div>
                      </Column>
                    )}
                    {index !== mortgageData.length - 1 && <Divider />}
                  </Fragment>
                ))}
                <Column>
                  <AddButton
                    variant="none"
                    color="#FBE54D"
                    value={t('add_programm')}
                    onClick={addMortgageData}
                  />
                </Column>
              </Row>
            </div>
          </div>
        )}
      </div>
      <ExitModule
        text={t('remove_programm')}
        isVisible={opened}
        onCancel={close}
        onSubmit={removeMortgageData}
      />
    </>
  )
}

export default MortgageData
