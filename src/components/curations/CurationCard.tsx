import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { SocialActions } from '@/components/social/SocialActions';

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
  description: string | null;
  imageUrl: string | null;
  author: {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  colorVariant?: ColorVariant;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export function CurationCard({
  id,
  title,
  description,
  imageUrl,
  author,
  createdAt,
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
                <AvatarImage src={author.avatarUrl} alt={author.fullName || author.username} />
              ) : (
                <AvatarFallback>{author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div className="text-sm">
              <span className="font-medium">{author.fullName || author.username}</span>
              <p className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <Link to={`/curation/${id}`}>
          {imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h3 className="font-semibold text-lg mb-1 curation-link inline">{title}</h3>
        </Link>
        {description && (
          <p className="text-muted-foreground text-sm mb-2">{description}</p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        <SocialActions
          curationId={id}
          likesCount={likesCount}
          commentsCount={commentsCount}
        />
      </CardFooter>
    </Card>
  );
}
