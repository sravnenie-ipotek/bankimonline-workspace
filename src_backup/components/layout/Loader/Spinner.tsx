import styles from './loader.module.scss'

const Spinner = () => {
  const totalBars = 8

  return (
    <div className={styles.spinner}>
      {Array.from({ length: totalBars }).map((_, index) => (
        <div key={index} className={styles['bar' + (index + 1)]}></div>
      ))}
    </div>
  )
}

export default Spinner
