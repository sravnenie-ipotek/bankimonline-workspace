import React, { useEffect, useState, useMemo } from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

import { FormContainer } from '@components/ui/FormContainer'
import { Button } from '@components/ui/ButtonUI'
import { BankOfferCard } from '@components/ui/BankOfferCard'
import { useAppSelector, useAppDispatch } from '@src/hooks/store.ts'
import { useContentApi } from '@src/hooks/useContentApi'
import { resetFilter } from '@src/pages/Services/slices/filterSlice'

import { MortgageProgram, BankOffer } from '@src/types'
import {
  fetchMortgagePrograms,
  fetchBankOffers,
  generateFallbackOffers
} from '@src/services/bankOffersApi'

import styles from './bankOffers.module.scss'

const cx = classNames.bind(styles)
const BankOffers = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step4')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  
  // Get mortgage type filter from Redux state
  const mortgageTypeFilter = useAppSelector((state) => state.filter.mortgageType)
  
  // Check if we're on credit or mortgage page
  const isCredit = location.pathname.includes('calculate-credit')
  
  const [mortgagePrograms, setMortgagePrograms] = useState<MortgageProgram[]>([])
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset filter when component unmounts or page changes
  useEffect(() => {
    return () => {
      dispatch(resetFilter())
    }
  }, [dispatch, location.pathname])

  useEffect(() => {
    const loadBankData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch mortgage programs
        const programsResult = await fetchMortgagePrograms()
        if (programsResult.success && programsResult.data) {
          setMortgagePrograms(programsResult.data.programs || [])
        }

        // Fetch bank offers
        const offersResult = await fetchBankOffers()
        if (offersResult.success && offersResult.data) {
          setBankOffers(offersResult.data.offers || [])
        } else {
          // Generate fallback offers if API fails
          const fallbackOffers = generateFallbackOffers()
          setBankOffers(fallbackOffers)
        }
      } catch (err) {
        console.error('[BANK-OFFERS] Error loading bank data:', err)
        setError('Failed to load bank offers')
        // Generate fallback offers on error
        const fallbackOffers = generateFallbackOffers()
        setBankOffers(fallbackOffers)
      } finally {
        setIsLoading(false)
      }
    }

    loadBankData()
  }, [])

  // Filter mortgage programs based on selected filter
  const filteredMortgagePrograms = useMemo(() => {
    if (mortgageTypeFilter === 'all') {
      return mortgagePrograms
    }
    
    // Map filter values to program IDs/types
    const filterMap: { [key: string]: string[] } = {
      'prime': ['1', '2'], // Prime rate programs
      'fixed': ['3', '4'], // Fixed rate programs  
      'variable': ['5', '6'] // Variable rate programs
    }
    
    const allowedIds = filterMap[mortgageTypeFilter] || []
    return mortgagePrograms.filter(program => 
      allowedIds.includes(program.id.toString())
    )
  }, [mortgagePrograms, mortgageTypeFilter])

  // Filter bank offers based on selected filter
  const filteredBankOffers = useMemo(() => {
    if (mortgageTypeFilter === 'all') {
      return bankOffers
    }
    
    // Filter offers based on mortgage type
    return bankOffers.filter(offer => {
      // You can add logic here to filter based on offer type
      // For now, return all offers when filtered
      return true
    })
  }, [bankOffers, mortgageTypeFilter])

  const handleBankSelection = (bank: BankOffer) => {
    console.log('[BANK-OFFERS] Bank selected:', bank)
    // Add bank selection logic here
    // Navigate to next step or show modal
  }

  const handleProceed = () => {
    const routeBase = isCredit ? '/services/calculate-credit' : '/services/calculate-mortgage'
    navigate(`${routeBase}/5`)
  }

  const handleGoBack = () => {
    const routeBase = isCredit ? '/services/calculate-credit' : '/services/calculate-mortgage'  
    navigate(`${routeBase}/3`)
  }

  if (isLoading) {
    return (
      <FormContainer>
        <div className={cx('loading')}>
          <p>{getContent('loading_offers', 'Loading bank offers...')}</p>
        </div>
      </FormContainer>
    )
  }

  if (error) {
    return (
      <FormContainer>
        <div className={cx('error')}>
          <p className={cx('error-text')}>{error}</p>
          <Button onClick={() => window.location.reload()}>
            {getContent('retry', 'Try Again')}
          </Button>
        </div>
      </FormContainer>
    )
  }

  return (
    <FormContainer>
      <div className={cx('bank-offers')}>
        
        {/* Mortgage Programs Section */}
        {filteredMortgagePrograms.length > 0 && (
          <div className={cx('programs-section')}>
            <h3 className={cx('section-title')}>
              {getContent('mortgage_programs_title', 'Mortgage Programs')}
            </h3>
            <div className={cx('programs-grid')}>
              {filteredMortgagePrograms.map((program) => (
                <div key={program.id} className={cx('program-card')}>
                  <h4 className={cx('program-title')}>{program.title}</h4>
                  <p className={cx('program-rate')}>
                    {getContent('interest_rate', 'Interest Rate')}: {program.interestRate}%
                  </p>
                  <p className={cx('program-description')}>{program.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bank Offers Section */}
        {filteredBankOffers.length > 0 && (
          <div className={cx('offers-section')}>
            <h3 className={cx('section-title')}>
              {getContent('bank_offers_title', 'Bank Offers')}
            </h3>
            <div className={cx('offers-grid')}>
              {filteredBankOffers.map((bank, index) => (
                <BankOfferCard
                  key={bank.id || index}
                  bank={bank}
                  onSelect={() => handleBankSelection(bank)}
                  isCredit={isCredit}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {filteredMortgagePrograms.length === 0 && filteredBankOffers.length === 0 && (
          <div className={cx('no-results')}>
            <p className={cx('no-results-text')}>
              {getContent('no_programs_found', 'No programs found for the selected filter')}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={cx('navigation')}>
          <Button
            variant="secondary"
            onClick={handleGoBack}
            className={cx('back-button')}
          >
            {getContent('back', 'Back')}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleProceed}
            className={cx('proceed-button')}
            disabled={filteredBankOffers.length === 0}
          >
            {getContent('proceed', 'Proceed')}
          </Button>
        </div>
      </div>
    </FormContainer>
  )
}

export default BankOffers
