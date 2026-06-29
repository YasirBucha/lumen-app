type NavIconName = 'home' | 'list' | 'spark' | 'chart' | 'gear';

const paths: Record<NavIconName, JSX.Element> = {
  home: <path d="M2 6l5-4 5 4v6H2V6z" />,
  list: (
    <>
      <path d="M2 4h10M2 7h10M2 10h7" />
    </>
  ),
  spark: <path d="M7 1l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />,
  chart: (
    <>
      <path d="M2 12V4M5 12V7M8 12V2M11 12V9" />
    </>
  ),
  gear: (
    <>
      <circle cx="7" cy="7" r="2" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M2.7 11.3l1-1M10.3 3.7l1-1" />
    </>
  ),
};

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
