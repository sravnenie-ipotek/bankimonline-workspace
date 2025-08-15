import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import BackButton from '@src/components/ui/BackButton/BackButton'
import { Button } from '@src/components/ui/ButtonUI'
import { Column } from '@src/components/ui/Column'
import { useAppDispatch } from '@src/hooks/store.ts'
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome'
import { getComponentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { SourceOfIncomeModalTypes } from '@src/pages/Services/types/formTypes'

import styles from './sourceOfIncomeForm.module.scss'

const cx = classNames.bind(styles)

const SourceOfIncomeForm = () => {
  const { t, i18n } = useTranslation()

  const { handleSubmit, isValid, values } =
    useFormikContext<SourceOfIncomeModalTypes>()

  const { mainSourceOfIncome } = values

  const dispatch = useAppDispatch()

  // ✅ FIXED: Use screen-specific components to ensure proper dropdown API calls
  // This ensures FieldOfActivity calls /api/dropdowns/other_borrowers_step2/he instead of /api/dropdowns/auto-detect/he
  const componentsByIncomeSource = getComponentsByIncomeSource('other_borrowers_step2')

  return (
    <>
      <div className={cx('modal')}>
        <div className={cx('container')}>
          <div className={cx('component')}>
            <MainSourceOfIncome />
          </div>
          {componentsByIncomeSource[mainSourceOfIncome] &&
            componentsByIncomeSource[mainSourceOfIncome].map(
              (Component, index) => (
                <div className={cx('component')} key={index}>
                  {Component}
                </div>
              )
            )}
          <Column />
        </div>
        <div className={cx('modal-buttons')}>
          <div className={cx('buttons')}>
            <BackButton
              title={t('button_back')}
              handleClick={() => dispatch(closeModal())}
            />
            <Button
              type="submit"
              isDisabled={!isValid}
              onClick={handleSubmit as () => void}
              size="full"
            >
              {t('button_next_save')}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SourceOfIncomeForm
