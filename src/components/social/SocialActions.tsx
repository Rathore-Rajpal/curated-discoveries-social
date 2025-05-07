import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CommentsList } from './CommentsList';
import { formatDistanceToNow } from 'date-fns';

interface SocialActionsProps {
  curationId: string;
  likesCount: number;
  commentsCount: number;
  onLikeChange?: (liked: boolean) => void;
  onCommentAdd?: () => void;
}

export const SocialActions: React.FC<SocialActionsProps> = ({
  curationId,
  likesCount,
  commentsCount,
  onLikeChange,
  onCommentAdd,
}) => {
  const { user } = useAuth();
  const { likeCuration, unlikeCuration, addComment, isLiked, shareCuration } = useSocial();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likesCount);
  const [comments, setComments] = useState(commentsCount);
  const [comment, setComment] = useState('');
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user) {
        try {
          const isLikedByUser = await isLiked(curationId);
          setLiked(isLikedByUser);
        } catch (error) {
          console.error('Error checking like status:', error);
          toast.error('Failed to check like status');
        }
      }
    };
    checkLikeStatus();
  }, [user, curationId, isLiked]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like curations');
      return;
    }

    try {
      setIsLiking(true);
      if (liked) {
        await unlikeCuration(curationId);
        setLikes(prev => prev - 1);
        toast.success('Unliked successfully');
      } else {
        await likeCuration(curationId);
        setLikes(prev => prev + 1);
        toast.success('Liked successfully');
      }
      setLiked(!liked);
      onLikeChange?.(!liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setIsCommenting(true);
      await addComment(curationId, comment);
      setComments(prev => prev + 1);
      setComment('');
      setIsCommentDialogOpen(false);
      onCommentAdd?.();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async (platform: string) => {
    if (!user) {
      toast.error('Please log in to share curations');
      return;
    }

    try {
      setIsSharing(true);
      await shareCuration(curationId, platform);
      setIsShareDialogOpen(false);
      toast.success('Shared successfully');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share curation');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center gap-2 ${liked ? 'text-red-500' : ''}`}
      >
        {isLiking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
        )}
        <span>{likes}</span>
      </Button>

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>{comments}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <CommentsList curationId={curationId} />
            {user && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                  disabled={isCommenting}
                />
                <Button 
                  onClick={handleComment} 
                  disabled={isCommenting || !comment.trim()}
                >
                  {isCommenting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Curation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => handleShare('twitter')} 
              variant="outline"
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Twitter'
              )}
            </Button>
            <Button 
              onClick={() => handleShare('facebook')} 
              variant="outline"
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Facebook'
              )}
            </Button>
            <Button 
              onClick={() => handleShare('linkedin')} 
              variant="outline"
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'LinkedIn'
              )}
            </Button>
            <Button 
              onClick={() => handleShare('copy')} 
              variant="outline"
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Copy Link'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 