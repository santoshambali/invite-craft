// components/Button.js
import styles from './Button.module.css';

export default function Button({ children, onClick, variant = 'primary', type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`${styles.button} ${variant === 'secondary' ? styles.secondary : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
