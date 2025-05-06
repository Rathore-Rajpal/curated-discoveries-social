import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface CurationItemProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    external_url: string | null;
    image_url: string | null;
    position: number;
  };
}

export function CurationItem({ item }: CurationItemProps) {
  return (
    <Card className="overflow-hidden border-2 hover:border-brand-purple transition-colors">
      <div className="flex">
        <div className="bg-muted flex items-center justify-center w-12 md:w-16 text-lg md:text-xl font-bold text-muted-foreground">
          {item.position + 1}
        </div>
        <CardContent className="p-4 flex-1">
          {item.image_url && (
            <div className="float-right ml-4 mb-2">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden bg-muted">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <h4 className="font-medium text-base md:text-lg">{item.title}</h4>
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
        </CardContent>
      </div>
    </Card>
  );
}
