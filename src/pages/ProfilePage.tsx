
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { CurationCard } from "@/components/curations/CurationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock user data
const mockUser = {
  id: "1",
  name: "Alex Johnson",
  username: "alexj",
  bio: "Curator of culture. I love books, movies, and discovering hidden gems.",
  avatarUrl: "",
  isCurrentUser: false,
  isFollowing: true,
};

const mockStats = {
  followersCount: 583,
  followingCount: 247,
  curationsCount: 12,
};

// Mock curations
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
  }
];

const ProfilePage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <UserProfileHeader user={mockUser} stats={mockStats} />
        
        <Tabs defaultValue="curations" className="w-full">
          <TabsList className="w-full border-b rounded-none">
            <TabsTrigger value="curations" className="flex-1">Curations</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curations" className="animate-enter pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCurations.map((curation) => (
                <CurationCard key={curation.id} {...curation} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="animate-enter pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>No saved curations yet.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="liked" className="animate-enter pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>No liked curations yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
