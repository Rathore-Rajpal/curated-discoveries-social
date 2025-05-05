
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CurationCard } from "@/components/curations/CurationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration
const mockCurations = [
  {
    id: "1",
    title: "Top 10 Classic Sci-Fi Movies",
    description: "The most influential science fiction films of all time",
    itemCount: 10,
    author: {
      id: "1",
      name: "Alex Johnson",
      username: "alexj",
      avatarUrl: ""
    },
    likesCount: 128,
    commentsCount: 32,
    colorVariant: "blue" as const
  },
  {
    id: "2",
    title: "Best Books of 2023",
    description: "Must-read books from this year covering fiction and non-fiction",
    itemCount: 8,
    author: {
      id: "2",
      name: "Sarah Williams",
      username: "sarah_reads",
      avatarUrl: ""
    },
    likesCount: 87,
    commentsCount: 14,
    colorVariant: "green" as const
  },
  {
    id: "3",
    title: "Hidden Gem Restaurants in NYC",
    description: "Local favorites that tourists don't know about",
    itemCount: 12,
    author: {
      id: "3",
      name: "Mike Chen",
      username: "foodie_mike",
      avatarUrl: ""
    },
    likesCount: 204,
    commentsCount: 56,
    colorVariant: "yellow" as const
  },
  {
    id: "4",
    title: "Essential Productivity Apps",
    description: "Tools that will transform your workflow",
    itemCount: 7,
    author: {
      id: "1",
      name: "Alex Johnson",
      username: "alexj",
      avatarUrl: ""
    },
    likesCount: 145,
    commentsCount: 28,
    colorVariant: "purple" as const
  },
  {
    id: "5",
    title: "Indie Games You Need to Play",
    description: "Creative and innovative games from independent developers",
    itemCount: 15,
    author: {
      id: "4",
      name: "Jamie Lewis",
      username: "gamer_jamie",
      avatarUrl: ""
    },
    likesCount: 176,
    commentsCount: 42,
    colorVariant: "pink" as const
  },
  {
    id: "6",
    title: "Underrated Travel Destinations",
    description: "Beautiful places that aren't overrun with tourists",
    itemCount: 9,
    author: {
      id: "5",
      name: "Emma Rodriguez",
      username: "travel_emma",
      avatarUrl: ""
    },
    likesCount: 231,
    commentsCount: 67,
    colorVariant: "orange" as const
  }
];

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="py-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover and Share Curated Lists</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join a community of curators sharing their favorite collections, rankings, and recommendations.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Sign Up</Button>
            <Button size="lg" variant="outline">Explore Curations</Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trending" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Discover Curations</h2>
            <TabsList>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending" className="animate-enter">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCurations.map((curation) => (
                <CurationCard key={curation.id} {...curation} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="popular" className="animate-enter">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCurations.slice().reverse().map((curation) => (
                <CurationCard key={curation.id} {...curation} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="animate-enter">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCurations.slice(0, 3).map((curation) => (
                <CurationCard key={curation.id} {...curation} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Index;
