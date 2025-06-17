import { ITabs } from '@src/components/ui/Tabs/Tabs.tsx'
import { Tab } from '@src/store/slices/authSlice.ts'

export const tabsMockRU: ITabs<Tab>[] = [
  {
    label: 'По номеру телефона',
    value: 'phone',
  },
  {
    label: 'По Email',
    value: 'email',
  },
]
export const tabsMockHE: ITabs<Tab>[] = [
  {
    label: 'מספר טלפון',
    value: 'phone',
  },
  {
    label: 'בדוא"ל',
    value: 'email',
  },
]
