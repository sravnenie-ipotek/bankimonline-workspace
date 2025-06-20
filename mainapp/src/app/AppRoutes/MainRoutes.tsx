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

const View = lazy(() => import('../../pages/View.tsx'))
const NotFound = lazy(() => import('@src/app/Errors/NotFound/NotFound.tsx'))
const Terms = lazy(() => import('../../pages/Terms/Terms.tsx'))
const About = lazy(() =>
  import('../../pages/About').then((module) => ({ default: module.About }))
)
const Vacancies = lazy(() =>
  import('../../pages/Vacancies').then((module) => ({
    default: module.Vacancies,
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
              <Route path="/vacancies" element={<Vacancies />} />
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
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/cookie" element={<Cookie />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/view/:id" element={<View />} />
              <Route path="/404" element={<NotFound type={'NOT_FOUND'} />} />
              <Route path="/registration" element={<RegistrationPage />} />
              
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
