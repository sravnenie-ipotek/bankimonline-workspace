export interface NotificationItem {
  id: string
  type: 'new_application' | 'client_message' | 'meeting_confirmation' | 'tech_support' | 'client_proposal'
  title: string
  description: string
  timestamp: string
  date: string
  isRead: boolean
  actionUrl?: string
  actionText?: string
  sender?: {
    name: string
    avatar?: string
    initials?: string
  }
}

export interface BankInfo {
  id: string
  name: string
  logo: string
  logoMini?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bankId: string
}

export interface LanguageOption {
  code: 'ru' | 'he' | 'en'
  name: string
  country: string
  flag: string
}

export interface SharedNavigationProps {
  user: UserProfile
  bank: BankInfo
  notifications: NotificationItem[]
  unreadNotificationsCount: number
  onLanguageChange?: (language: string) => void
  onTechSupportClick?: () => void
  onNotificationClick?: (notification: NotificationItem) => void
  onProfileSettingsClick?: () => void
  onProfileNotificationsClick?: () => void
  onLogoutClick?: () => void
  onNotificationViewAll?: () => void
  className?: string
}

export interface DropdownMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  position?: 'left' | 'right' | 'center'
}

export interface IconButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  badge?: number
  className?: string
  title?: string
} 