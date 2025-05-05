
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const CreateCurationPage = () => {
  const [items, setItems] = React.useState([
    { id: 1, title: "", description: "" },
    { id: 2, title: "", description: "" },
    { id: 3, title: "", description: "" },
  ]);

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, title: "", description: "" }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const moveItem = (id: number, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Curation</CardTitle>
            <CardDescription>
              Share your knowledge by creating a ranked list of your favorite items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Curation Title</Label>
                  <Input id="title" placeholder="e.g. Top 10 Fantasy Books of All Time" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Tell people what this curation is about..." 
                    className="min-h-24"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Items</h3>
                  <div className="space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addItem}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card key={item.id} className="border border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1 font-medium">Item #{index + 1}</div>
                          <div className="flex items-center gap-1">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveItem(item.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveItem(item.id, 'down')}
                              disabled={index === items.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-title`}>Item Title</Label>
                            <Input id={`item-${item.id}-title`} placeholder="Enter title" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-description`}>Description (Optional)</Label>
                            <Textarea id={`item-${item.id}-description`} placeholder="Why did you rank this item here?" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">Cancel</Button>
                <Button type="submit">Publish Curation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateCurationPage;
