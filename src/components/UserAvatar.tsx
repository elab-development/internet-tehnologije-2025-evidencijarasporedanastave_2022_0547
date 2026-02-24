export default function UserAvatar({ identifier, size = 64 }: { identifier: string, size?: number }) {
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(identifier)}`;

  return (
    <img
      src={avatarUrl}
      alt="User Avatar"
      width={size}
      height={size}
      className="rounded-full bg-gray-100 border border-gray-200"
    />
  );
}