// Stroke icons drawn in currentColor. All decorative: the link or button they
// sit in carries the accessible name.

type IconProps = { size?: number; className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const ArrowRight = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} className={className} {...base}>
    <path d='M5 12h14' />
    <path d='M13 6l6 6-6 6' />
  </svg>
);

export const ArrowUpRight = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} {...base}>
    <path d='M7 17L17 7' />
    <path d='M9 7h8v8' />
  </svg>
);

export const Plus = ({ size = 20, className }: IconProps) => (
  <svg width={size} height={size} className={className} {...base}>
    <path d='M12 5v14' />
    <path d='M5 12h14' />
  </svg>
);

export const Pause = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} {...base}>
    <path d='M9 6v12' />
    <path d='M15 6v12' />
  </svg>
);

export const Play = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} {...base}>
    <path d='M8 5.5v13l10-6.5z' />
  </svg>
);
