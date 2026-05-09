interface Props {
  size?: number;
}

export default function LogoMark({ size = 24 }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="20" fill="var(--paper)" stroke="var(--line)" strokeWidth="2.5" />
      <path d="M12 32C18 27 20 21 24 16C28 11 33 13 36 18" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 18C16 14 21 15 24 19C27 23 30 30 36 32" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.3" fill="var(--accent)" />
      <circle cx="32" cy="32" r="2.3" fill="var(--accent-2)" />
    </svg>
  );
}
