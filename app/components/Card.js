// components/Card.js
import styles from './Card.module.css';

export default function Card({ children, className = '', interactive = false, onClick }) {
    return (
        <div
            className={`${styles.card} ${interactive ? styles.interactive : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
