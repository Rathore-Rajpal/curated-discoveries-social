
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    isCurrentUser?: boolean;
    isFollowing?: boolean;
  };
  stats: {
    followersCount: number;
    followingCount: number;
    curationsCount: number;
  };
}

export function UserProfileHeader({ user, stats }: UserProfileHeaderProps) {
  return (
    <div className="bg-background rounded-lg overflow-hidden border">
      <div className="h-32 bg-brand-purple-light" />
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
            <Button variant="outline" className="ml-auto">Edit Profile</Button>
          ) : (
            <Button className="ml-auto">
              {user.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        
        {user.bio && (
          <p className="mt-4 text-sm md:text-base">{user.bio}</p>
        )}
        
        <div className="flex mt-6 space-x-6">
          <Link to={`/profile/${user.username}/followers`} className="text-sm">
            <span className="font-semibold">{stats.followersCount}</span>
            <span className="text-muted-foreground ml-1">Followers</span>
          </Link>
          <Link to={`/profile/${user.username}/following`} className="text-sm">
            <span className="font-semibold">{stats.followingCount}</span>
            <span className="text-muted-foreground ml-1">Following</span>
          </Link>
          <div className="text-sm">
            <span className="font-semibold">{stats.curationsCount}</span>
            <span className="text-muted-foreground ml-1">Curations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
