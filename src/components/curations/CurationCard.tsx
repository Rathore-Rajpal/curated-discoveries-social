
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";

// Color variants for curations
const colorVariants = {
  blue: "bg-curations-blue",
  green: "bg-curations-green",
  yellow: "bg-curations-yellow",
  orange: "bg-curations-orange",
  pink: "bg-curations-pink",
  purple: "bg-curations-purple",
};

type ColorVariant = keyof typeof colorVariants;

export interface CurationCardProps {
  id: string;
  title: string;
  description: string;
  itemCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  colorVariant?: ColorVariant;
}

export function CurationCard({
  id,
  title,
  description,
  itemCount,
  author,
  likesCount,
  commentsCount,
  colorVariant = "purple",
}: CurationCardProps) {
  return (
    <Card className="overflow-hidden hover-scale">
      <div className={`h-3 ${colorVariants[colorVariant]}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link to={`/profile/${author.username}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {author.avatarUrl ? (
                <AvatarImage src={author.avatarUrl} alt={author.name} />
              ) : (
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div className="text-sm">
              <span className="font-medium">{author.name}</span>
              <p className="text-xs text-muted-foreground">@{author.username}</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <Link to={`/curation/${id}`}>
          <h3 className="font-semibold text-lg mb-1 curation-link inline">{title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-2">{description}</p>
        <div className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex items-center justify-between w-full text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{commentsCount}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
