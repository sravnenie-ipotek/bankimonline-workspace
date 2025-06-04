import classNames from 'classnames/bind'

import styles from './serviceLine.module.scss'

const cx = classNames.bind(styles)

interface ServiceLineProps {
  title: string
}

const ServiceLine: React.FC<ServiceLineProps> = ({
  title,
}: ServiceLineProps) => {
  return (
    <div className={cx(styles.pageServiceLine)}>
      <p className={cx(styles.pageFormTitle)}>{title}</p>
    </div>
  )
}

export default ServiceLine
