import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface AddItemFormProps {
  curationId: string;
  onItemAdded: () => void;
}

interface AddItemFormValues {
  title: string;
  description: string;
  external_url: string;
  image_url: string;
}

export function AddItemForm({ curationId, onItemAdded }: AddItemFormProps) {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');

  const form = useForm<AddItemFormValues>({
    defaultValues: {
      title: "",
      description: "",
      external_url: "",
      image_url: "",
    }
  });

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }
    
    try {
      setUploadingImage(true);

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
      const fileName = `${user.id}-item-${Math.random()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size });

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('curation-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('curation-images')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      form.setValue('image_url', publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: AddItemFormValues) => {
    if (!user) return;
    
    try {
      // Get the current highest position
      const { data: items, error: positionError } = await supabase
        .from('curation_items')
        .select('position')
        .eq('curation_id', curationId)
        .order('position', { ascending: false })
        .limit(1);

      if (positionError) throw positionError;

      const nextPosition = items && items.length > 0 ? items[0].position + 1 : 0;

      // Create the item
      const { error: itemError } = await supabase
        .from('curation_items')
        .insert({
          curation_id: curationId,
          title: data.title,
          description: data.description,
          external_url: data.external_url,
          image_url: data.image_url,
          position: nextPosition
        });

      if (itemError) throw itemError;

      toast.success('Item added successfully');
      form.reset();
      onItemAdded();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter item title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this item" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="external_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Item Image</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={imageSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setImageSource('upload')}
              >
                Upload Image
              </Button>
              <Button
                type="button"
                variant={imageSource === 'url' ? 'default' : 'outline'}
                onClick={() => setImageSource('url')}
              >
                Paste URL
              </Button>
            </div>
            {imageSource === 'upload' ? (
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="item-image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingImage}
                    onClick={() => {
                      const fileInput = document.getElementById('item-image-upload');
                      if (fileInput) fileInput.click();
                    }}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </>
                    )}
                  </Button>
                </label>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormControl>
                    <Input placeholder="Paste image URL" {...field} />
                  </FormControl>
                )}
              />
            )}
          </div>
          <FormMessage />
        </FormItem>

        <Button type="submit" className="w-full">
          Add Item
        </Button>
      </form>
    </Form>
  );
} 