import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Loader2, Pencil, Image, Upload, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EditProfileFormValues {
  full_name: string;
  username: string;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  cover_url: string | null;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  
  const form = useForm<EditProfileFormValues>({
    defaultValues: {
      full_name: userProfile?.full_name || "",
      username: userProfile?.username || "",
      bio: userProfile?.bio || "",
      website: userProfile?.website || "",
      avatar_url: userProfile?.avatar_url || "",
      cover_url: userProfile?.cover_url || "",
    }
  });

  const handleImageUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (!user) return;
    
    try {
      if (type === 'avatar') setUploadingAvatar(true);
      else setUploadingCover(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Math.random()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // First, try to delete any existing image for this user and type
      try {
        const { data: existingFiles } = await supabase.storage
          .from('profile-images')
          .list(`${type}s`, {
            search: user.id
          });

        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(file => `${type}s/${file.name}`);
          await supabase.storage
            .from('profile-images')
            .remove(filesToDelete);
        }
      } catch (error) {
        console.error('Error deleting existing files:', error);
        // Continue with upload even if delete fails
      }

      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        form.setValue('avatar_url', publicUrl);
      } else {
        form.setValue('cover_url', publicUrl);
      }

      toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} picture updated successfully`);
    } catch (error: any) {
      console.error(`Error uploading ${type} image:`, error);
      toast.error(`Failed to upload ${type} image: ${error.message}`);
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleRemoveImage = async (type: 'avatar' | 'cover') => {
    if (!user) return;
    
    try {
      if (type === 'avatar') setRemovingAvatar(true);
      else setRemovingCover(true);

      // Get the current image path
      const currentImage = type === 'avatar' ? form.watch('avatar_url') : form.watch('cover_url');
      if (!currentImage) {
        toast.error(`No ${type} image to remove`);
        return;
      }

      // Extract the file path from the URL
      const filePath = currentImage.split('/').pop();
      if (!filePath) {
        toast.error('Invalid image path');
        return;
      }

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([`${type}s/${filePath}`]);

      if (deleteError) throw deleteError;

      // Update the form and database
      if (type === 'avatar') {
        form.setValue('avatar_url', null);
      } else {
        form.setValue('cover_url', null);
      }

      // Update the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          [`${type}_url`]: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} picture removed successfully`);
    } catch (error: any) {
      console.error(`Error removing ${type} image:`, error);
      toast.error(`Failed to remove ${type} image: ${error.message}`);
    } finally {
      if (type === 'avatar') setRemovingAvatar(false);
      else setRemovingCover(false);
    }
  };

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Check if username is already taken (if changed)
      if (data.username !== userProfile?.username) {
        const { data: existingUser, error: usernameCheckError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', data.username.toLowerCase())
          .neq('id', user.id)
          .single();
        
        if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
          toast.error('Error checking username availability');
          return;
        }

        if (existingUser) {
          form.setError('username', { 
            type: 'manual',
            message: 'This username is already taken'
          });
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          username: data.username.toLowerCase(),
          bio: data.bio,
          website: data.website,
          avatar_url: data.avatar_url,
          cover_url: data.cover_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    {form.watch('avatar_url') ? (
                      <AvatarImage src={form.watch('avatar_url')} alt="Profile" />
                    ) : (
                      <AvatarFallback>
                        {userProfile?.full_name?.charAt(0) || userProfile?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <label className="bg-background rounded-full p-1 border cursor-pointer hover:bg-accent">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'avatar');
                        }}
                      />
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                    </label>
                    {form.watch('avatar_url') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background rounded-full p-1 border hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveImage('avatar')}
                        disabled={removingAvatar}
                      >
                        {removingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="relative w-full aspect-[3/1] bg-muted rounded-lg overflow-hidden group">
                  {form.watch('cover_url') && (
                    <img
                      src={form.watch('cover_url')}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <label className="bg-background rounded-full p-1 border cursor-pointer hover:bg-accent">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'cover');
                        }}
                      />
                      {uploadingCover ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </label>
                    {form.watch('cover_url') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background rounded-full p-1 border hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveImage('cover')}
                        disabled={removingCover}
                      >
                        {removingCover ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
