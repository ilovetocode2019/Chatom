import logo from '../logo.svg';
import styles from '../App.module.css';

function Home() {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt='logo' />
        <p>
          Welcome to the new SolidJS frontend (in development)
        </p>
      </header>
    </div>
  );
}

export default Home;
