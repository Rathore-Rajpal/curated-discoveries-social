import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CommentsList } from '@/components/social/CommentsList';

interface SocialActionsProps {
  curationId: string;
  likesCount: number;
  commentsCount: number;
}

export function SocialActions({ curationId, likesCount: initialLikesCount, commentsCount: initialCommentsCount }: SocialActionsProps) {
  const { user } = useAuth();
  const { likeCuration, unlikeCuration, shareCuration, isLiked, saveCuration, unsaveCuration, isSaved } = useSocial();
  const [likes, setLikes] = useState(initialLikesCount);
  const [comments, setComments] = useState(initialCommentsCount);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [isSavedByUser, setIsSavedByUser] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user) {
        try {
          const liked = await isLiked(curationId);
          setIsLikedByUser(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    const checkSaveStatus = async () => {
      if (user) {
        try {
          const saved = await isSaved(curationId);
          setIsSavedByUser(saved);
        } catch (error) {
          console.error('Error checking save status:', error);
        }
      }
    };

    checkLikeStatus();
    checkSaveStatus();
  }, [user, curationId, isLiked, isSaved]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like curations');
      return;
    }

    try {
      setIsLiking(true);
      if (isLikedByUser) {
        await unlikeCuration(curationId);
        setLikes(prev => Math.max(0, prev - 1));
        setIsLikedByUser(false);
        toast.success('Curation unliked');
      } else {
        await likeCuration(curationId);
        setLikes(prev => prev + 1);
        setIsLikedByUser(true);
        toast.success('Curation liked');
      }
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error('Please log in to share curations');
      return;
    }

    try {
      setIsSharing(true);
      await shareCuration(curationId, 'copy');
      toast.success('Curation shared successfully');
    } catch (error) {
      toast.error('Failed to share curation');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please log in to save curations');
      return;
    }

    try {
      setIsSaving(true);
      if (isSavedByUser) {
        await unsaveCuration(curationId);
        setIsSavedByUser(false);
        toast.success('Removed from saved');
      } else {
        await saveCuration(curationId);
        setIsSavedByUser(true);
        toast.success('Added to saved');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full ${isLikedByUser ? 'text-red-500 hover:text-red-600' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart className={`h-4 w-4 ${isLikedByUser ? 'fill-current' : ''}`} />
        </Button>
        <span className="text-sm text-muted-foreground">{likes}</span>

        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-2">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            <CommentsList curationId={curationId} />
          </DialogContent>
        </Dialog>
        <span className="text-sm text-muted-foreground">{comments}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        {user && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${isSavedByUser ? 'text-brand-purple hover:text-brand-purple/90' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            <Bookmark className={`h-4 w-4 ${isSavedByUser ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
} 