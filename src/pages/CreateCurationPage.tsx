import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Image, Link as LinkIcon, Upload, Plus } from "lucide-react";

interface CreateCurationFormValues {
  title: string;
  description: string;
  cover_image: string;
  items: {
    title: string;
    description: string;
    external_url: string;
    image_url: string;
  }[];
}

const defaultFormValues: CreateCurationFormValues = {
  title: "",
  description: "",
  cover_image: "",
  items: [{
    title: "",
    description: "",
    external_url: "",
    image_url: "",
  }]
};

function CreateCurationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const [itemImageSource, setItemImageSource] = useState<'upload' | 'url'>('upload');
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  const form = useForm<CreateCurationFormValues>({
    defaultValues: defaultFormValues
  });

  const handleImageUpload = useCallback(async (file: File, type: 'curation' | 'item', itemIndex?: number) => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }
    
    try {
      if (type === 'curation') setUploadingImage(true);
      else setUploadingItemImage(true);

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

      if (type === 'curation') {
        form.setValue('cover_image', publicUrl);
      } else if (itemIndex !== undefined) {
        const items = form.getValues('items');
        items[itemIndex].image_url = publicUrl;
        form.setValue('items', items);
      }

      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      if (type === 'curation') setUploadingImage(false);
      else setUploadingItemImage(false);
    }
  }, [user, form]);

  const addItem = useCallback(() => {
    const items = form.getValues('items');
    form.setValue('items', [
      ...items,
      {
        title: "",
        description: "",
        external_url: "",
        image_url: "",
      }
    ]);
  }, [form]);

  const removeItem = useCallback((index: number) => {
    const items = form.getValues('items');
    form.setValue('items', items.filter((_, i) => i !== index));
  }, [form]);

  const onSubmit = useCallback(async (data: CreateCurationFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Create the curation
      const { data: curation, error: curationError } = await supabase
        .from('curations')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          cover_image: data.cover_image,
        })
        .select()
        .single();

      if (curationError) throw curationError;

      // Create items
      const itemsToInsert = data.items.map((item, index) => ({
        curation_id: curation.id,
        title: item.title,
        description: item.description,
        external_url: item.external_url,
        image_url: item.image_url,
        position: index
      }));

      const { error: itemsError } = await supabase
        .from('curation_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Curation created successfully');
      navigate(`/curation/${curation.id}`);
    } catch (error: any) {
      console.error('Error creating curation:', error);
      toast.error(error.message || 'Failed to create curation');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const items = form.watch('items');
  const memoizedItems = useMemo(() => items, [items]);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Create New Curation</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curation Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your curation" {...field} />
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
                      placeholder="Describe your curation" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Curation Image</FormLabel>
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
                        id="curation-image-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'curation');
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={uploadingImage}
                        onClick={() => {
                          const fileInput = document.getElementById('curation-image-upload');
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
                    name="cover_image"
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

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Items</h2>
                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {memoizedItems.map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Item {index + 1}</h3>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
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
                    name={`items.${index}.external_url`}
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
                          variant={itemImageSource === 'upload' ? 'default' : 'outline'}
                          onClick={() => {
                            setItemImageSource('upload');
                            setCurrentItemIndex(index);
                          }}
                        >
                          Upload Image
                        </Button>
                        <Button
                          type="button"
                          variant={itemImageSource === 'url' ? 'default' : 'outline'}
                          onClick={() => {
                            setItemImageSource('url');
                            setCurrentItemIndex(index);
                          }}
                        >
                          Paste URL
                        </Button>
                      </div>
                      {itemImageSource === 'upload' && currentItemIndex === index ? (
                        <div className="flex items-center gap-2">
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`item-image-upload-${index}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'item', index);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              disabled={uploadingItemImage}
                              onClick={() => {
                                const fileInput = document.getElementById(`item-image-upload-${index}`);
                                if (fileInput) fileInput.click();
                              }}
                            >
                              {uploadingItemImage ? (
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
                          name={`items.${index}.image_url`}
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
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Curation
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}

export default React.memo(CreateCurationPage);
