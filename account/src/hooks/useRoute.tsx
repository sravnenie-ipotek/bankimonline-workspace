const useRoute = () => {
  const routePaths: { [key: string]: string } = {
    chat: '/chat', // страница чата
    documents: '/documents', // страница документов
    home: '/', // главная
    payments: '/payments', // страница платежей
    questionnaire: '/questionnaire', // страница анкеты
    services: '/services', // страница услуг
    settings: '/settings', // страница настроек
    support: 'https://www.google.kz/?hl=ru', // поддержка
    completeSurvey: '/', // статус анкеты: звершить анкету
    documentsNotAccepted: '/', // статус анкеты: документ не принят
    questionnaireNotAccepted: '/', // статус анкеты: анкета не принята
    sendApplicationBank: '/', // статус анкеты: отправьте заявку в банк
    viewOffers: '/', // статус анкеты: посмотрети предложения
    editService: '/', // редактировать услугу
    calculateMortgage: '/', // рассчитать ипотеку
    refinanceMortgage: '/', // рефинансировать ипотеки
    calculateLoan: '/', // рассчитать кредит
    refinanceLoan: '/', // рефинансировать кредит
    personalDataUser: '/', // редактировать данные пользоватея
    personalDataIncome: '/', // редактировать доходы пользователя
  }

  const nav = (route: string): string => {
    const path = routePaths[route]
    if (!path) {
      console.error(`No path found: ${route}`)
      return '/'
    }
    return path
  }

  return {
    nav,
  }
}
export default useRoute

// Пример использования

/*

const MyComponent: React.FC = () => {
  const { nav } = useRoute()

  return (
    <Button to={nav('support')}>Поддержка</Button>
  )
}

*/
