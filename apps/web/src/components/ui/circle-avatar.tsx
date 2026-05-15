interface CircleAvatarProps {
  name: string;
  gradient?: [string, string];
  size?: number;
  square?: boolean;
}

export function CircleAvatar({
  name,
  gradient = ["#1a9deb", "#1abf7a"],
  size = 52,
  square = false,
}: CircleAvatarProps) {
  const strokeWidth = size * 0.09;
  const borderRadius = square ? size * 0.28 : size / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 8a8 8 0 1 0 0 8"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
