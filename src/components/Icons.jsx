// Small line-art icon set replacing emoji in Chain Link's UI. Matches
// the style the header's stats icon already established (24x24
// viewBox, stroke-based, currentColor, rounded caps). Share text is NOT
// touched by this: generateShareText() in useGameState.js and the
// matching hand-built preview in WinScreen.jsx both build plain text
// sent via SMS/clipboard, a custom icon can't survive that trip, so
// 🔗/⏱/🎯 stay real Unicode there. The "→" arrows inside How To Play's
// prose (FIRE→PLACE, the example caption) are typographic word
// connectors in running text, not UI icons, also left alone.
function base(props) {
  return { viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true, ...props };
}

export function IconDrag({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M9 3v8M9 11l-2.5-2M9 11l2.5-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="12" width="10" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15 15.5c2.2-1 4 .3 4 2.3s-1.8 3.3-4 2.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconLink({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M10 14L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 7.5l1.5-1.5a4 4 0 0 1 5.6 5.6L18.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 16.5L9.5 18a4 4 0 0 1-5.6-5.6L5.5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconDirections({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 3v6M12 21v-6M3 12h6M21 12h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 5.5L12 3l2.5 2.5M9.5 18.5L12 21l2.5-2.5M5.5 9.5L3 12l2.5 2.5M18.5 9.5L21 12l-2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInfinity({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M7.5 9a3.5 3.5 0 1 0 0 7c1.5 0 2.6-1 4.5-3.5C13.9 9.9 15 9 16.5 9a3.5 3.5 0 1 1 0 7c-1.5 0-2.6-1-4.5-3.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheckmark({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShare({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 15V4M12 4l-3.5 3.5M12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Win-screen rating badges, 7 tiers from best to "got there eventually".
export function IconTrophy({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 5 10h2M17 5h2.5A2.5 2.5 0 0 1 19 10h-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 14v3.5M9 21h6M10 17.5h4l.6 3.5H9.4l.6-3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBolt({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M13 3L5 13.5h5.5L10 21l8-10.5h-5.5L13 3Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTarget({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function IconFlame({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 3c1 2.5-.5 3.8-1.6 5.1C9.3 9.3 8.5 10.6 8.5 12.5a3.5 3.5 0 0 0 7 0c0-1.2-.5-1.9-1-2.5.9.4 1.5 1.5 1.5 2.9A4.5 4.5 0 0 1 12 21a5.5 5.5 0 0 1-5.5-5.5C6.5 9.5 9 7.5 12 3Z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheckCircle({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 12.3l2.6 2.6L16.2 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBulb({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.6.45 1 1.17 1 1.95V18h5.6v-1.25c0-.78.4-1.5 1-1.95A6.5 6.5 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.6 21h4.8M10.2 18.6h3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconRibbon({ size = 40, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 12.5L7 21l5-2.5 5 2.5-2-8.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
