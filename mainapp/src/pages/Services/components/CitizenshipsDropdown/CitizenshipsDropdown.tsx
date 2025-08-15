import { useFormikContext } from 'formik'
import { useDropdownData } from '@src/hooks/useDropdownData'
import { useState, useEffect } from 'react'

import { Column } from '@components/ui/Column'
import { MultiSelect } from '@components/ui/MultiSelect'
import { TitleElement } from '@components/ui/TitleElement'

import { FormTypes } from '../../types/formTypes.ts'

interface CitizenshipOption {
  value: string
  label: string
}

const CitizenshipsDropdown = () => {
  const { values, setFieldValue, errors, touched, setFieldTouched, validateField } =
    useFormikContext<FormTypes>()

  const [citizenshipOptions, setCitizenshipOptions] = useState<CitizenshipOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all citizenship options from API
  useEffect(() => {
    const fetchCitizenshipOptions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/dropdowns/mortgage_step2/he')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Extract all citizenship options
        const allOptions: CitizenshipOption[] = []
        Object.keys(data.options).forEach(key => {
          if (key.includes('citizenship') && key !== 'mortgage_step2_citizenship') {
            const options = data.options[key]
            if (Array.isArray(options) && options.length > 0) {
              allOptions.push(...options)
            }
          }
        })

        // Remove duplicates based on value
        const uniqueOptions = allOptions.filter((option, index, arr) => 
          arr.findIndex(o => o.value === option.value) === index
        )

        setCitizenshipOptions(uniqueOptions)
      } catch (err) {
        console.error('❌ Error fetching citizenship options:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCitizenshipOptions()
  }, [])

  const handleCitizenshipChange = (selectedLabels: string[]) => {
    // Store labels directly - simpler approach
    setFieldValue('citizenshipsDropdown', selectedLabels, true)
    setFieldTouched('citizenshipsDropdown', true, true)
    
    // Force validation after setting value
    setTimeout(() => {
      if (selectedLabels.includes('option_1')) {
        console.log('Citizenship validation:', selectedLabels)
      }
      validateField('citizenshipsDropdown')
    }, 100)
  }

  if (loading) {
    return (
      <Column gap="16px">
        <TitleElement title="אזרחות" />
        <div>Loading citizenship options...</div>
      </Column>
    )
  }

  if (error) {
    return (
      <Column gap="16px">
        <TitleElement title="אזרחות" />
        <div>Error loading citizenship options: {error}</div>
      </Column>
    )
  }

  // No conversion needed - we're storing labels directly now
  const displayValues = values.citizenshipsDropdown || []
  
  return (
    <Column gap="16px">
      <TitleElement title="אזרחות" />
      <MultiSelect
        data={citizenshipOptions.map(option => option.label)}
        value={displayValues}
        onChange={handleCitizenshipChange}
        onBlur={() => setFieldTouched('citizenshipsDropdown', true)}
        placeholder="בחר אזרחות"
        searchable={true}
        searchPlaceholder="חפש מדינה..."
        searchDescription="בחר אזרחויות נוספות ולחץ על 'החל'"
        nothingFoundText="לא נמצאו תוצאות"
        error={touched.citizenshipsDropdown && errors.citizenshipsDropdown}
      />
    </Column>
  )
}

export default CitizenshipsDropdown
