import type { AppUser } from '@/types/user';

interface Props {
  user: AppUser;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DIMS = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export default function UserAvatar({ user, size = 'md', className = '' }: Props) {
  const initials = user.profile.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      className={`${DIMS[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
      style={{ backgroundColor: user.avatarColor }}
    >
      {initials}
    </div>
  );
}
