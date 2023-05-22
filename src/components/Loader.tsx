import styles from './Loader..module.css';

interface Props {
  className?: string;
}

function Loader({ className }: Props): JSX.Element {
  return <span className={`${styles.loader} ${className ?? ''}`} />;
}

export default Loader;
