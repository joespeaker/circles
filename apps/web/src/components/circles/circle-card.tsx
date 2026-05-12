import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface CircleCardProps {
  circle: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatarUrl: string | null;
    memberCount: number;
    isPrivate: boolean;
    inviteOnly: boolean;
    isMember?: boolean;
  };
  onJoin?: (slug: string) => void;
  joining?: boolean;
}

export function CircleCard({ circle, onJoin, joining }: CircleCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4",
        "hover:border-brand-300 hover:shadow-sm transition-all"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar src={circle.avatarUrl} name={circle.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{circle.name}</h3>
            {circle.isPrivate && <Badge variant="warning">Private</Badge>}
            {circle.inviteOnly && <Badge variant="info">Invite Only</Badge>}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <Users className="h-3 w-3" />
            <span>{circle.memberCount.toLocaleString()} members</span>
          </div>
        </div>
      </div>

      {circle.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{circle.description}</p>
      )}

      <div className="flex gap-2 mt-auto">
        {circle.isMember ? (
          <Link href={`/circles/${circle.slug}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Open
            </Button>
          </Link>
        ) : (
          <>
            <Link href={`/circles/${circle.slug}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                View
              </Button>
            </Link>
            {!circle.inviteOnly && onJoin && (
              <Button
                onClick={() => onJoin(circle.slug)}
                loading={joining}
                className="flex-1"
              >
                Join
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
