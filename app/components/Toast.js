// components/Toast.js
import styles from './Toast.module.css';

export default function Toast({ message, visible, type = 'success' }) {
    return (
        <div className={`${styles.toast} ${visible ? styles.visible : ''} ${type === 'error' ? styles.error : ''}`}>
            {type === 'success' ? '✅' : '❌'} {message}
        </div>
    );
}
