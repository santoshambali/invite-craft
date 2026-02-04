"use client";
import styles from "./Spinner.module.css";

/**
 * A consistent, premium loading spinner.
 * 
 * @param {Object} props
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Size of the spinner
 * @param {string} [props.text] - Optional loading text
 * @param {string} [props.className] - Additional classes for the container
 * @param {boolean} [props.fullPage] - If true, occupies full page (absolute or flex-grow)
 * @param {Object} [props.style] - Inline styles for the spinner element (e.g. for custom colors)
 */
export default function Spinner({
    size = "medium",
    text,
    className = "",
    fullPage = false,
    style = {}
}) {
    const containerClasses = [
        styles.spinnerWrapper,
        fullPage ? styles.fullPage : "",
        className
    ].join(" ");

    return (
        <div className={containerClasses} style={fullPage ? { flex: 1, minHeight: '200px' } : {}}>
            <div
                className={`${styles.spinner} ${styles[size]}`}
                style={style}
            />
            {text && <p className={styles.loadingText}>{text}</p>}
        </div>
    );
}
