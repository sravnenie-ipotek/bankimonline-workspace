import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import Layout from '@components/layout/Layout.tsx'
import { Loader } from '@components/layout/Loader'

const Home = lazy(() => import('../../pages/Home/Home.tsx'))

const CalculateMortgage = lazy(() =>
  import('../../pages/Services/pages/CalculateMortgage').then((module) => ({
    default: module.CalculateMortgage,
  }))
)

const CalculateCredit = lazy(
  () => import('../../pages/Services/pages/CalculateCredit/CalculateCredit.tsx')
)

const RefinanceMortgage = lazy(() =>
  import('../../pages/Services/pages/RefinanceMortgage').then((module) => ({
    default: module.RefinanceMortgage,
  }))
)

const RefinanceCredit = lazy(() =>
  import('../../pages/Services/pages/RefinanceCredit').then((module) => ({
    default: module.RefinanceCredit,
  }))
)

const BorrowersPersonalData = lazy(() =>
  import('../../pages/Services/pages/BorrowersPersonalData').then((module) => ({
    default: module.BorrowersPersonalData,
  }))
)

const OtherBorrowers = lazy(() =>
  import('../../pages/Services/pages/OtherBorrowers').then((module) => ({
    default: module.OtherBorrowers,
  }))
)

const ApplicationSubmitted = lazy(() =>
  import('../../pages/Services/pages/ApplicationSubmitted').then((module) => ({
    default: module.ApplicationSubmitted,
  }))
)

const View = lazy(() => import('../../pages/View.tsx'))
const NotFound = lazy(() => import('@src/app/Errors/NotFound/NotFound.tsx'))
const Terms = lazy(() => import('../../pages/Terms/Terms.tsx'))
const About = lazy(() =>
  import('../../pages/About').then((module) => ({ default: module.About }))
)
const ServicesOverview = lazy(() => import('../../pages/Services/ServicesOverview'))
const Vacancies = lazy(() =>
  import('../../pages/Vacancies').then((module) => ({
    default: module.Vacancies,
  }))
)
const VacancyDetail = lazy(() =>
  import('../../pages/Vacancies/VacancyDetail').then((module) => ({
    default: module.VacancyDetail,
  }))
)
const Contacts = lazy(() =>
  import('../../pages/Contacts').then((module) => ({
    default: module.Contacts,
  }))
)
const Cooperation = lazy(() =>
  import('../../pages/Cooperation').then((module) => ({
    default: module.Cooperation,
  }))
)
const TendersForBrokers = lazy(() =>
  import('../../pages/TendersForBrokers').then((module) => ({
    default: module.TendersForBrokers,
  }))
)
const TendersForLawyers = lazy(() =>
  import('../../pages/TendersForLawyers').then((module) => ({
    default: module.TendersForLawyers,
  }))
)

const LawyersPage = lazy(() =>
  import('../../pages/TendersForLawyers/LawyersPage').then((module) => ({
    default: module.default,
  }))
)

const LawyerQuestionnaireSuccess = lazy(() =>
  import('../../pages/LawyerQuestionnaireSuccess/LawyerQuestionnaireSuccess').then((module) => ({
    default: module.default,
  }))
)

const TemporaryFranchise = lazy(() =>
  import('../../pages/TemporaryFranchise').then((module) => ({
    default: module.TemporaryFranchise,
  }))
)

const BrokerQuestionnaire = lazy(() =>
  import('../../pages/BrokerQuestionnaire').then((module) => ({
    default: module.BrokerQuestionnaire,
  }))
)

const Cookie = lazy(() =>
  import('../../pages/Cookie').then((module) => ({ default: module.Cookie }))
)
const Refund = lazy(() =>
  import('../../pages/Refund').then((module) => ({ default: module.Refund }))
)
const PrivacyPolicy = lazy(() =>
  import('../../pages/PrivacyPolicy').then((module) => ({
    default: module.PrivacyPolicy,
  }))
)

const RegistrationPage = lazy(() =>
  import('../../pages/Registration/RegistrationPage').then((module) => ({
    default: module.default,
  }))
)

const Apoalim = lazy(() =>
  import('../../pages/Banks/pages/Apoalim').then((module) => ({
    default: module.Apoalim,
  }))
)
const Discount = lazy(() =>
  import('../../pages/Banks/pages/Discount').then((module) => ({
    default: module.Discount,
  }))
)
const Leumi = lazy(() =>
  import('../../pages/Banks/pages/Leumi').then((module) => ({
    default: module.Leumi,
  }))
)
const Beinleumi = lazy(() =>
  import('../../pages/Banks/pages/Beinleumi').then((module) => ({
    default: module.Beinleumi,
  }))
)
const MercantileDiscount = lazy(() =>
  import('../../pages/Banks/pages/MercantileDiscount').then((module) => ({
    default: module.MercantileDiscount,
  }))
)
const Jerusalem = lazy(() =>
  import('../../pages/Banks/pages/Jerusalem').then((module) => ({
    default: module.Jerusalem,
  }))
)

// Personal Cabinet
const PersonalCabinet = lazy(() =>
  import('../../pages/PersonalCabinet/PersonalCabinet').then((module) => ({
    default: module.PersonalCabinet,
  }))
)

const PartnerPersonalDataPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/PartnerPersonalDataPage').then((module) => ({
    default: module.PartnerPersonalDataPage,
  }))
)

const MainBorrowerPersonalDataPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/MainBorrowerPersonalDataPage').then((module) => ({
    default: module.MainBorrowerPersonalDataPage,
  }))
)

const CoBorrowerPersonalDataPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/CoBorrowerPersonalDataPage').then((module) => ({
    default: module.CoBorrowerPersonalDataPage,
  }))
)

const IncomeDataPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/IncomeDataPage').then((module) => ({
    default: module.default,
  }))
)

const CoBorrowerIncomeDataPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/CoBorrowerIncomeDataPage').then((module) => ({
    default: module.default,
  }))
)

const CreditHistoryPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/CreditHistoryPage').then((module) => ({
    default: module.default,
  }))
)

const DocumentsPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/DocumentsPage').then((module) => ({
    default: module.default,
  }))
)

const CreditHistoryConsentPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/CreditHistoryConsentPage').then((module) => ({
    default: module.default,
  }))
)

const BankAuthorizationPage = lazy(() =>
  import('../../pages/PersonalCabinet/components/BankAuthorizationPage').then((module) => ({
    default: module.default,
  }))
)

// Mobile Upload
const MobileDocumentUploadPage = lazy(() =>
  import('../../pages/MobileDocumentUpload/MobileDocumentUploadPage').then((module) => ({
    default: module.MobileDocumentUploadPage,
  }))
)

// Admin Pages
const AdminLogin = lazy(() => import('../../pages/Admin/AdminLogin'))
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'))
const MainRoutes: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route element={<Layout />}>
              {/*Главная*/}
              <Route path="/" element={<Home />} />

              {/*Рассчитать ипотеку*/}
              <Route path={'/services'}>
                <Route index element={<ServicesOverview />} />
                <Route
                  path="calculate-mortgage/:stepNumber"
                  element={<CalculateMortgage />}
                />

                {/*Рефинансировать ипотеку*/}

                <Route
                  path="refinance-mortgage/:stepNumber"
                  element={<RefinanceMortgage />}
                />

                {/*Рассчитать кредит*/}

                <Route
                  path="calculate-credit"
                  element={<Navigate replace to="/calculate-credit/1" />}
                />
                <Route
                  path="calculate-credit/:stepNumber"
                  element={<CalculateCredit />}
                />

                {/*Личные данные созаёмщика*/}

                <Route
                  path="borrowers-personal-data/:stepNumber"
                  element={<BorrowersPersonalData />}
                />

                <Route
                  path="refinance-credit/:stepNumber"
                  element={<RefinanceCredit />}
                />

                {/*Другие заёмщики*/}

                <Route
                  path="other-borrowers/:stepNumber"
                  element={<OtherBorrowers />}
                />

                {/*Application Submitted Confirmation*/}
                <Route
                  path="application-submitted"
                  element={<ApplicationSubmitted />}
                />
              </Route>
              {/*<Route path='/services/calculate-mortgage/step-4' element={<CalculateMortgage4 />} />*/}

              {/*Саб меню банков*/}
              <Route path="/banks">
                <Route path="apoalim" element={<Apoalim />} />
                <Route path="discount" element={<Discount />} />
                <Route path="leumi" element={<Leumi />} />
                <Route path="beinleumi" element={<Beinleumi />} />
                <Route
                  path="mercantile-discount"
                  element={<MercantileDiscount />}
                />
                <Route path="jerusalem" element={<Jerusalem />} />
              </Route>

              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/Real-Estate-Brokerage" element={<TemporaryFranchise />} />
              <Route path="/vacancies" element={<Vacancies />} />
              <Route path="/vacancies/:id" element={<VacancyDetail />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/cooperation" element={<Cooperation />} />
              <Route
                path="/tenders-for-brokers"
                element={<TendersForBrokers />}
              />
              <Route
                path="/tenders-for-lawyers"
                element={<TendersForLawyers />}
              />
              <Route
                path="/lawyers"
                element={<LawyersPage />}
              />
              <Route
                path="/lawyer-success"
                element={<LawyerQuestionnaireSuccess />}
              />
              <Route
                path="/broker-questionnaire"
                element={<BrokerQuestionnaire />}
              />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/cookie" element={<Cookie />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/view/:id" element={<View />} />
              <Route path="/404" element={<NotFound type={'NOT_FOUND'} />} />
              <Route path="/registration" element={<RegistrationPage />} />
              
              {/* Personal Cabinet */}
              <Route path="/personal-cabinet" element={<PersonalCabinet />} />
              <Route path="/personal-cabinet/settings" element={<PersonalCabinet />} />
              <Route path="/personal-cabinet/questionnaire" element={<PersonalCabinet />} />
              <Route path="/personal-cabinet/questionnaire-overview" element={<PersonalCabinet />} />
              <Route path="/personal-cabinet/notifications" element={<PersonalCabinet />} />
              <Route path="/personal-cabinet/partner-personal-data" element={<PartnerPersonalDataPage />} />
              <Route path="/personal-cabinet/main-borrower-personal-data" element={<MainBorrowerPersonalDataPage />} />
              <Route path="/personal-cabinet/co-borrower-personal-data" element={<CoBorrowerPersonalDataPage />} />
              <Route path="/personal-cabinet/income-data" element={<IncomeDataPage />} />
              <Route path="/personal-cabinet/co-borrower-income-data" element={<CoBorrowerIncomeDataPage />} />
              <Route path="/personal-cabinet/credit-history" element={<CreditHistoryPage />} />
              <Route path="/personal-cabinet/documents" element={<DocumentsPage />} />
              <Route path="/personal-cabinet/credit-history-consent" element={<CreditHistoryConsentPage />} />
              <Route path="/personal-cabinet/bank-authorization" element={<BankAuthorizationPage />} />
              <Route path="/payments" element={<PersonalCabinet />} />
              <Route path="/payments/history" element={<PersonalCabinet />} />
              
              {/* Mobile Upload Route - Outside Layout for full mobile experience */}
            </Route>
            
            {/* Mobile Upload - Standalone page without main layout */}
            <Route path="/mobile-upload/:uploadId" element={<MobileDocumentUploadPage />} />
            
            <Route element={<Layout />}>
              {/* Admin Routes */}
              <Route path="/admin">
                <Route path="login" element={<AdminLogin />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route index element={<Navigate replace to="/admin/login" />} />
              </Route>
              
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default MainRoutes
