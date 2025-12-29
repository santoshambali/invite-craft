// components/Input.js
import styles from './Input.module.css';

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    required = false,
    autoComplete,
    disabled = false,
    error = false,
    success = false,
    icon,
    className = ''
}) {
    const inputClasses = [
        styles.input,
        error ? styles.error : '',
        success ? styles.success : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.group}>
            {label && (
                <label className={styles.label} htmlFor={name}>
                    {label}
                    {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                </label>
            )}
            <div style={{ position: 'relative', width: '100%' }}>
                {icon && (
                    <span style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(0, 0, 0, 0.4)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}>
                        {icon}
                    </span>
                )}
                <input
                    id={name}
                    className={inputClasses}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    style={icon ? { paddingLeft: '2.75rem' } : {}}
                />
            </div>
        </div>
    );
}
