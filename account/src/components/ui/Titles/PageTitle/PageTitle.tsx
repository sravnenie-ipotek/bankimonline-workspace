import classNames from 'classnames/bind'

import styles from './pageTitle.module.scss'

const cx = classNames.bind(styles)

interface PageTitleProps {
  title: string
}

const PageTitle: React.FC<PageTitleProps> = ({ title }: PageTitleProps) => {
  return (
    <div className={cx(styles.pageTopLine)}>
      <p className={cx(styles.pageTitle)}>{title}</p>
    </div>
  )
}

export default PageTitle
