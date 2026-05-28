import { Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUsersStore } from '@/stores/usersStore';
import UserAvatar from './UserAvatar';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserSwitcherModal({ open, onClose }: Props) {
  const { users, activeUserId, setActiveUser } = useUsersStore();

  function handleSelect(id: string) {
    setActiveUser(id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs mx-auto">
        <DialogHeader>
          <DialogTitle>¿Quién entrena hoy?</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {users.map((user) => {
            const isActive = user.id === activeUserId;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <UserAvatar user={user} size="lg" />
                <div className="text-center">
                  <p className="text-sm font-semibold leading-tight truncate max-w-[90px]">
                    {user.profile.name || 'Sin nombre'}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {user.role === 'admin' ? (
                      <Shield className="h-3 w-3 text-primary" />
                    ) : (
                      <User className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-[10px] text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </div>
                {isActive && (
                  <span className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    Activo
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
