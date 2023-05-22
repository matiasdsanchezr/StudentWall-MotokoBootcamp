import React from 'react'
import styles from './Loader..module.css'

function Loader ({ className }: { className?: string }) {
  return <span className={`${styles.loader} ${className}`} />
}

export default Loader
