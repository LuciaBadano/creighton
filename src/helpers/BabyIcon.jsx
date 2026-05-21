import styles from "../components/CalCell.module.css";

export default function BabyIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.babyIcon}
    >
      <circle cx="12" cy="5" r="3" fill="currentColor" opacity="0.7" />
      <path
        d="M7 13c0-2.76 2.24-5 5-5s5 2.24 5 5v2H7v-2z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M9 18c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-1H9v1z"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="9" cy="13.5" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="15" cy="13.5" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
