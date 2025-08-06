export interface NavigationItem {
  id: string
  label: string
  icon: React.FC<{size?: number, color?: string}>
  path: string
  isActive: boolean
  onClick?: () => void
}

export interface SharedSideNavigationProps {
  currentPath: string
  onNavigate: (path: string, id: string) => void
  onLogout: () => void
  className?: string
  isCollapsed?: boolean
  bankLogo?: {
    src: string
    alt: string
    name?: string
  }
}

export interface SideNavItemProps {
  item: NavigationItem
  isCollapsed?: boolean
}

export interface LogoSectionProps {
  logo?: {
    src: string
    alt: string
    name?: string
  }
  isCollapsed?: boolean
} 