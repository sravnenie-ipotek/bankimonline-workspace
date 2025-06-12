import React, { Suspense, lazy } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import Loader from '@layout/components/Loader/Loader.tsx'
import { Layout } from '@layout/index.ts'

const Home = lazy<React.FC>(() =>
  import('@pages/Home').then((module) => ({ default: module.Home }))
)

const UserProfile = lazy<React.FC>(() =>
  import('@pages/UserProfile').then((module) => ({
    default: module.UserProfile,
  }))
)

const Questionnaire = lazy<React.FC>(() =>
  import('@pages/Questionnaire').then((module) => ({
    default: module.Questionnaire,
  }))
)

const Documents = lazy<React.FC>(() =>
  import('@pages/Documents').then((module) => ({ default: module.Documents }))
)

const Services = lazy<React.FC>(() =>
  import('@pages/Services').then((module) => ({ default: module.Services }))
)

const Chat = lazy<React.FC>(() =>
  import('@pages/Chat').then((module) => ({ default: module.Chat }))
)

/* ------------ */

const Payments = lazy<React.FC>(() =>
  import('../../components/pages/Payments').then((module) => ({
    default: module.Payments,
  }))
)

const Settings = lazy<React.FC>(() =>
  import('@pages/Settings').then((module) => ({ default: module.Settings }))
)

const AppRoutes: React.FC = () => {
  return (
    <Router basename={'/'}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<Home />} path="/" />
            <Route element={<UserProfile />} path="/user-profile" />
            <Route element={<Questionnaire />} path="/questionnaire" />
            <Route element={<Documents />} path="/documents" />
            <Route element={<Services />} path="/services" />
            <Route element={<Chat />} path="/Chat" />

            <Route element={<Payments />} path="/payments" />
            <Route element={<Settings />} path="/settings" />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRoutes
