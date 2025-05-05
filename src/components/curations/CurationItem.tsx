
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface CurationItemProps {
  rank: number;
  title: string;
  description?: string;
  imageUrl?: string;
}

export function CurationItem({ rank, title, description, imageUrl }: CurationItemProps) {
  return (
    <Card className="overflow-hidden border-2 hover:border-brand-purple transition-colors">
      <div className="flex">
        <div className="bg-muted flex items-center justify-center w-12 md:w-16 text-lg md:text-xl font-bold text-muted-foreground">
          {rank}
        </div>
        <CardContent className="p-4 flex-1">
          {imageUrl && (
            <div className="float-right ml-4 mb-2">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden bg-muted">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <h4 className="font-medium text-base md:text-lg">{title}</h4>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </CardContent>
      </div>
    </Card>
  );
}
