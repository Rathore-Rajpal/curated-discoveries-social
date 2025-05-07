import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface CurationItemProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    external_url: string | null;
    image_url: string | null;
    position: number;
    curation_id: string;
  };
  onItemUpdated?: () => void;
}

export function CurationItem({ item, onItemUpdated }: CurationItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [externalUrl, setExternalUrl] = useState(item.external_url || '');
  const [imageUrl, setImageUrl] = useState(item.image_url);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user) {
        setIsOwner(false);
        return;
      }

      const { data: curation, error } = await supabase
        .from('curations')
        .select('user_id')
        .eq('id', item.curation_id)
        .single();

      if (error) {
        console.error('Error checking ownership:', error);
        return;
      }

      setIsOwner(curation?.user_id === user.id);
    };

    checkOwnership();
  }, [user, item.curation_id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `curation-items/${item.id}/${fileName}`;

      // Upload the file with upsert option
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket')) {
          throw new Error('Storage bucket error. Please check your Supabase storage configuration.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for the uploaded image');
      }

      setImageUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('curation_items')
        .update({
          title,
          description: description || null,
          external_url: externalUrl || null,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item updated successfully');
      setIsEditing(false);
      if (onItemUpdated) onItemUpdated();
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast.error(error.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(item.title);
    setDescription(item.description || '');
    setExternalUrl(item.external_url || '');
    setImageUrl(item.image_url);
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-brand-purple transition-colors">
      <div className="flex">
        <div className="bg-muted flex items-center justify-center w-12 md:w-16 text-lg md:text-xl font-bold text-muted-foreground">
          {item.position + 1}
        </div>
        <CardContent className="p-4 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Item title"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item description"
                className="resize-none"
              />
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="External URL"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative"
                    disabled={uploadingImage}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  {imageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageUrl(null)}
                      disabled={uploadingImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imageUrl && (
                  <div className="w-32 h-32 rounded overflow-hidden bg-muted">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading || uploadingImage}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading || uploadingImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-base md:text-lg">{item.title}</h4>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
              {item.external_url && (
                <a 
                  href={item.external_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-brand-purple hover:underline mt-1 block"
                >
                  Visit Link
                </a>
              )}
              {item.image_url && (
                <div className="mt-2">
                  <div className="w-32 h-32 rounded overflow-hidden bg-muted">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
