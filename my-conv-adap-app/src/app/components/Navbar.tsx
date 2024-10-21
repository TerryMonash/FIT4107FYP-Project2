import Link from "next/link";
import { useAuth } from "../AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>My App</div>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
