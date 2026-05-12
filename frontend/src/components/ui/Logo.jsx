export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 152 152" role="img" aria-label="CalPEC logo">
      <title>CalPEC</title>
      <circle cx="76" cy="10" r="5" fill="#c9a96e"/>
      <circle cx="76" cy="10" r="3" fill="#0f1923"/>
      <rect x="74" y="15" width="4" height="62" rx="2" fill="#c9a96e"/>
      <ellipse cx="76" cy="40" rx="7" ry="5" fill="#c9a96e"/>
      <rect x="64" y="77" width="24" height="6" rx="2" fill="#c9a96e"/>
      <rect x="69" y="83" width="14" height="18" rx="2" fill="#c9a96e"/>
      <rect x="57" y="101" width="38" height="6" rx="2" fill="#c9a96e"/>
      <rect x="48" y="107" width="56" height="7" rx="3" fill="#c9a96e"/>
      <line x1="16" y1="40" x2="136" y2="40" stroke="#c9a96e" strokeWidth="1.5"/>
      <circle cx="16" cy="40" r="3" fill="#c9a96e"/>
      <circle cx="136" cy="40" r="3" fill="#c9a96e"/>
      <line x1="10" y1="43" x2="2" y2="62" stroke="#c9a96e" strokeWidth="1"/>
      <line x1="22" y1="43" x2="30" y2="62" stroke="#c9a96e" strokeWidth="1"/>
      <path d="M0 62 Q16 70 32 62" stroke="#c9a96e" strokeWidth="1.5" fill="rgba(201,169,110,0.08)"/>
      <line x1="130" y1="43" x2="122" y2="65" stroke="#c9a96e" strokeWidth="1"/>
      <line x1="142" y1="43" x2="150" y2="65" stroke="#c9a96e" strokeWidth="1"/>
      <path d="M120 65 Q136 73 152 65" stroke="#c9a96e" strokeWidth="1.5" fill="rgba(201,169,110,0.08)"/>
    </svg>
  )
}
