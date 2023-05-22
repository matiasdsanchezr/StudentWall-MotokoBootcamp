import React from 'react'
import viteLogo from '../../assets/vite.svg'
import motokoLogo from '../../assets/motoko_moving.png'
import motokoShadowLogo from '../../assets/motoko_shadow.png'
import reactLogo from '../../assets/react.svg'
import styles from './Home.module.css'

const About = () => {
  return (
    <div className='mx-auto my-auto grid justify-items-center'>
      <div className='flex'>
        <a href='https://vitejs.dev' target='_blank' rel='noreferrer'>
          <img
            src={viteLogo}
            className={`${styles.logo} ${styles.vite}`}
            alt='Vite logo'
          />
        </a>
        <a href='https://reactjs.org' target='_blank' rel='noreferrer'>
          <img
            src={reactLogo}
            className={`${styles.logo} ${styles.react}`}
            alt='React logo'
          />
        </a>
        <a
          href='https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/'
          target='_blank' rel='noreferrer'
        >
          <span className={styles.logoStack}>
            <img
              src={motokoShadowLogo}
              className={`${styles.logo} ${styles.motokoShadow}`}
              alt='Motoko logo'
            />
            <img
              src={motokoLogo}
              className={`${styles.logo} ${styles.motoko}`}
              alt='Motoko logo'
            />
          </span>
        </a>
      </div>
      <h2>Vite + React + Motoko</h2>
    </div>
  )
}

export default About
