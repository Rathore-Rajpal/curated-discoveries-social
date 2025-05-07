import React, { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, isValid } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface CommentsListProps {
  curationId: string;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const CommentsList: React.FC<CommentsListProps> = ({ curationId }) => {
  const { user } = useAuth();
  const { getComments, addComment, updateComment, deleteComment } = useSocial();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, [curationId]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const fetchedComments = await getComments(curationId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setLoading(true);
      await addComment(curationId, newComment.trim());
      setNewComment('');
      await loadComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setLoading(true);
      await updateComment(commentId, editContent.trim());
      setEditingComment(null);
      await loadComments();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      await deleteComment(commentId);
      await loadComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  if (loadingComments) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Post'
            )}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar>
              <AvatarImage src={comment.user.avatar_url} />
              <AvatarFallback>
                {comment.user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.user.username}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              {editingComment === comment.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingComment(null)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  <p>{comment.content}</p>
                  {user && user.id === comment.user.id && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(comment)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 