import viteLogo from '../../assets/vite.svg';
import motokoLogo from '../../assets/motoko_moving.png';
import motokoShadowLogo from '../../assets/motoko_shadow.png';
import reactLogo from '../../assets/react.svg';
import styles from './About.module.css';

const About = (): JSX.Element => {
  return (
    <div className="grid justify-items-center min-h-full content-center gap-3">
      <div className="grid justify-items-center content-center border-b-2 p-5">
        <div className="flex">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img
              src={viteLogo}
              className={`${styles.logo} ${styles.vite}`}
              alt="Vite logo"
            />
          </a>
          <a href="https://reactjs.org" target="_blank" rel="noreferrer">
            <img
              src={reactLogo}
              className={`${styles.logo} ${styles.react}`}
              alt="React logo"
            />
          </a>
          <a
            href="https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/"
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.logoStack}>
              <img
                src={motokoShadowLogo}
                className={`${styles.logo} ${styles.motokoShadow}`}
                alt="Motoko logo"
              />
              <img
                src={motokoLogo}
                className={`${styles.logo} ${styles.motoko}`}
                alt="Motoko logo"
              />
            </span>
          </a>
        </div>
        <h2 className="text-xl">Vite + React + Motoko</h2>
      </div>
      <div className="text-center grid gap-2 content-start border-b-2 p-5">
        <h2 className="text-4xl">Frontend Dependencies</h2>
        <ul>
          <li>Typescript</li>
          <li>Tailwind CSS</li>
          <li>Headless UI</li>
          <li>Tanstack Query V4</li>
          <li>React</li>
          <li>React Icons</li>
          <li>React Router</li>
          <li>React-responsive-pagination</li>
          <li>ESLint</li>
          <li>Dfinity Agent</li>
          <li>Dfinity Auth-client</li>
          <li>Dfinity Candid</li>
          <li>Dfinity Principal</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
