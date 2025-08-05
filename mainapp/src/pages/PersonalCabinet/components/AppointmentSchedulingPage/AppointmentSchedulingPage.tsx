import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import classNames from 'classnames/bind'

import DropdownMenu from '@src/components/ui/DropdownMenu/DropdownMenu'
import Calendar from '@src/components/ui/Calendar/Calendar'
import { useGetCitiesQuery } from '@src/pages/Services/api/api'
import { InteractiveMap } from './components/InteractiveMap/InteractiveMap'

import styles from './appointmentSchedulingPage.module.scss'

const cx = classNames.bind(styles)

// Mock branch data - in real app would come from API
const mockBranches = [
  { value: 'tel-aviv-center', label: 'Tel Aviv Center', city: 'tel-aviv', lat: 32.0853, lng: 34.7818 },
  { value: 'tel-aviv-dizengoff', label: 'Tel Aviv Dizengoff', city: 'tel-aviv', lat: 32.0749, lng: 34.7747 },
  { value: 'jerusalem-center', label: 'Jerusalem Center', city: 'jerusalem', lat: 31.7683, lng: 35.2137 },
  { value: 'jerusalem-malha', label: 'Jerusalem Malha', city: 'jerusalem', lat: 31.7308, lng: 35.1911 },
  { value: 'haifa-carmel', label: 'Haifa Carmel', city: 'haifa', lat: 32.7940, lng: 34.9896 },
  { value: 'haifa-port', label: 'Haifa Port', city: 'haifa', lat: 32.8156, lng: 34.9822 },
  { value: 'beer-sheva-center', label: 'Beer Sheva Center', city: 'beer-sheva', lat: 31.2518, lng: 34.7915 },
  { value: 'netanya-center', label: 'Netanya Center', city: 'netanya', lat: 32.3215, lng: 34.8532 }
]

// Mock time slots - in real app would come from API based on branch and date
const mockTimeSlots = [
  { value: '09:00', label: '09:00' },
  { value: '09:30', label: '09:30' },
  { value: '10:00', label: '10:00' },
  { value: '10:30', label: '10:30' },
  { value: '11:00', label: '11:00' },
  { value: '11:30', label: '11:30' },
  { value: '12:00', label: '12:00' },
  { value: '13:00', label: '13:00' },
  { value: '13:30', label: '13:30' },
  { value: '14:00', label: '14:00' },
  { value: '14:30', label: '14:30' },
  { value: '15:00', label: '15:00' },
  { value: '15:30', label: '15:30' },
  { value: '16:00', label: '16:00' },
  { value: '16:30', label: '16:30' },
  { value: '17:00', label: '17:00' }
]

interface AppointmentFormValues {
  city: string
  branch: string
  date: string
  time: string
}

const validationSchema = Yup.object({
  city: Yup.string().required('City is required'),
  branch: Yup.string().required('Branch is required'),
  date: Yup.string().required('Date is required'),
  time: Yup.string().required('Time is required')
})

export const AppointmentSchedulingPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery()
  
  const [availableBranches, setAvailableBranches] = useState<Array<{ value: string; label: string }>>([])
  const [selectedBranchLocation, setSelectedBranchLocation] = useState<{ lat: number; lng: number } | null>(null)

  const initialValues: AppointmentFormValues = {
    city: '',
    branch: '',
    date: '',
    time: ''
  }

  // Transform cities data for dropdown
  const cityOptions = citiesData?.map((city: any) => ({
    value: city.value || city.name?.toLowerCase().replace(/\s+/g, '-'),
    label: city.label || city.name
  })) || []

  // Filter branches based on selected city
  const filterBranchesByCity = (cityValue: string) => {
    const filtered = mockBranches
      .filter(branch => branch.city === cityValue)
      .map(branch => ({ value: branch.value, label: branch.label }))
    setAvailableBranches(filtered)
  }

  // Handle city change
  const handleCityChange = (cityValue: string, setFieldValue: any) => {
    setFieldValue('city', cityValue)
    setFieldValue('branch', '') // Reset branch when city changes
    setFieldValue('time', '') // Reset time when city changes
    filterBranchesByCity(cityValue)
    setSelectedBranchLocation(null)
  }

  // Handle branch change
  const handleBranchChange = (branchValue: string, setFieldValue: any) => {
    setFieldValue('branch', branchValue)
    setFieldValue('time', '') // Reset time when branch changes
    
    // Update map location
    const branch = mockBranches.find(b => b.value === branchValue)
    if (branch) {
      setSelectedBranchLocation({ lat: branch.lat, lng: branch.lng })
    }
  }

  // Handle map marker click
  const handleMapBranchSelect = (branchValue: string, setFieldValue: any) => {
    const branch = mockBranches.find(b => b.value === branchValue)
    if (branch) {
      // Set city if not already selected
      if (!setFieldValue) return
      setFieldValue('branch', branchValue)
      setSelectedBranchLocation({ lat: branch.lat, lng: branch.lng })
      
      // Update available branches for the city
      filterBranchesByCity(branch.city)
    }
  }

  // Handle date change
  const handleDateChange = (dateString: string | null, setFieldValue: any) => {
    if (dateString) {
      setFieldValue('date', dateString) // Calendar now returns YYYY-MM-DD format directly
      setFieldValue('time', '') // Reset time when date changes
    }
  }

  // Action #7: Back button navigation
  const handleBackClick = () => {
    navigate(-1) // Go to previous page
  }

  // Action #2: Return to Personal Cabinet
  const handleReturnToPersonalCabinet = () => {
    navigate('/personal-cabinet')
  }

  // Action #8: Schedule meeting
  const handleScheduleMeeting = async (values: AppointmentFormValues) => {
    try {
      // In real app, this would call the appointment API
      console.log('Scheduling appointment:', values)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to confirmation page (LK-150)
      navigate('/personal-cabinet/appointment-confirmation', {
        state: { appointmentData: values }
      })
    } catch (error) {
      console.error('Error scheduling appointment:', error)
    }
  }

  // Get branches for current city to show on map
  const getBranchesForMap = (cityValue: string) => {
    return mockBranches.filter(branch => branch.city === cityValue)
  }

  return (
    <div className={cx('appointment-scheduling-page')}>
      {/* Header with Logo and Return Button */}
      <div className={cx('header')}>
        {/* Action #1: Logo - handled by PersonalCabinetLayout */}
        
        {/* Action #2: Return to Personal Cabinet Button */}
        <button 
          type="button"
          onClick={handleReturnToPersonalCabinet}
          className={cx('return-button')}
        >
          {t('return_to_personal_cabinet', 'Вернуться в личный кабинет')}
        </button>
      </div>

      {/* Page Title */}
      <h1 className={cx('page-title')}>
        {t('schedule_meeting_title', 'Назначьте встречу с банком')}
      </h1>

      {/* Appointment Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleScheduleMeeting}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form className={cx('appointment-form')}>
            <div className={cx('form-section')}>
              {/* Action #3: City Selection Dropdown */}
              <div className={cx('form-field')}>
                <DropdownMenu
                  title={t('city', 'Город')}
                  data={cityOptions}
                  placeholder={t('select_city', 'Выберите город')}
                  value={values.city}
                  onChange={(value) => handleCityChange(value, setFieldValue)}
                  searchable
                  searchPlaceholder={t('search_city', 'Поиск города')}
                  nothingFoundText={t('no_cities_found', 'Города не найдены')}
                  error={touched.city && errors.city}
                />
              </div>

              {/* Action #4: Bank Branch Selection Dropdown */}
              <div className={cx('form-field')}>
                <DropdownMenu
                  title={t('bank_branch', 'Филиал банка')}
                  data={availableBranches}
                  placeholder={t('select_branch', 'Выберите филиал банка')}
                  value={values.branch}
                  onChange={(value) => handleBranchChange(value, setFieldValue)}
                  searchable
                  searchPlaceholder={t('search_branch', 'Поиск филиала')}
                  nothingFoundText={t('no_branches_found', 'Филиалы не найдены')}
                  error={touched.branch && errors.branch}
                />
              </div>

              {/* Action #5: Meeting Date Picker */}
              <div className={cx('form-field')}>
                <Calendar
                  title={t('meeting_date', 'Дата встречи')}
                  placeholder={t('date_format', 'ДД / ММ / ГГ')}
                  value={values.date}
                  onChange={(dateString) => handleDateChange(dateString, setFieldValue)}
                  error={touched.date && errors.date}
                />
              </div>

              {/* Action #6: Meeting Time Dropdown */}
              <div className={cx('form-field')}>
                <DropdownMenu
                  title={t('meeting_time', 'Время встречи')}
                  data={mockTimeSlots}
                  placeholder={t('select_time', 'Выберите время встречи')}
                  value={values.time}
                  onChange={(value) => setFieldValue('time', value)}
                  error={touched.time && errors.time}
                />
              </div>
            </div>

            {/* Action #9: Interactive Map */}
            <div className={cx('map-section')}>
              <InteractiveMap
                branches={values.city ? getBranchesForMap(values.city) : mockBranches}
                selectedBranch={values.branch}
                selectedLocation={selectedBranchLocation}
                onBranchSelect={(branchValue) => handleMapBranchSelect(branchValue, setFieldValue)}
                city={values.city}
              />
            </div>

            {/* Action Buttons */}
            <div className={cx('action-buttons')}>
              {/* Action #7: Back Button */}
              <button
                type="button"
                onClick={handleBackClick}
                className={cx('back-button')}
              >
                {t('back', 'Назад')}
              </button>

              {/* Action #8: Schedule Meeting Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cx('schedule-button')}
              >
                {isSubmitting 
                  ? t('scheduling', 'Назначение...')
                  : t('schedule_meeting', 'Назначить встречу')
                }
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default AppointmentSchedulingPage 