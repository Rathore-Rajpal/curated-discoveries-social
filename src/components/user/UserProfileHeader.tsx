import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { EditProfileDialog } from "./EditProfileDialog";
import { Pencil } from "lucide-react";
import { FollowButton } from "@/components/social/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    isCurrentUser?: boolean;
  };
  stats: {
    followersCount: number;
    followingCount: number;
    curationsCount: number;
  };
}

export function UserProfileHeader({ user, stats }: UserProfileHeaderProps) {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { user: currentUser } = useAuth();

  return (
    <div className="bg-background rounded-lg overflow-hidden border">
      <div 
        className="h-32 bg-brand-purple-light relative"
        style={{
          backgroundImage: user.coverUrl ? `url(${user.coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
          <Avatar className="h-24 w-24 border-4 border-background">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 md:pb-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
          
          {user.isCurrentUser ? (
            <Button variant="outline" className="ml-auto flex gap-2" onClick={() => setEditProfileOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : currentUser && (
            <div className="ml-auto">
              <FollowButton 
                userId={user.id} 
                onFollowChange={(following) => {
                  // Update stats when follow status changes
                  if (following) {
                    stats.followersCount++;
                  } else {
                    stats.followersCount--;
                  }
                }}
              />
            </div>
          )}
        </div>
        
        {user.bio && (
          <p className="mt-4 text-sm md:text-base">{user.bio}</p>
        )}
        
        <div className="flex gap-6 mt-4">
          <Link to={`/profile/${user.username}/followers`} className="text-sm hover:underline">
            <span className="font-semibold">{stats.followersCount}</span>
            <span className="text-muted-foreground ml-1">Followers</span>
          </Link>
          <Link to={`/profile/${user.username}/following`} className="text-sm hover:underline">
            <span className="font-semibold">{stats.followingCount}</span>
            <span className="text-muted-foreground ml-1">Following</span>
          </Link>
          <div className="text-sm">
            <span className="font-semibold">{stats.curationsCount}</span>
            <span className="text-muted-foreground ml-1">Curations</span>
          </div>
        </div>

        <EditProfileDialog 
          open={editProfileOpen} 
          onOpenChange={setEditProfileOpen} 
        />
      </div>
    </div>
  );
}
