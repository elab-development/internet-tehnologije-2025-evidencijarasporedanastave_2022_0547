// src/components/UserAvatar.tsx
export default function UserAvatar({ identifier, size = 64 }: { identifier: string, size?: number }) {
  // 'identifier' može biti email ili ID korisnika iz baze
  // 'pixel-art' je stil, možeš probati i 'avataaars' ili 'bottts'
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