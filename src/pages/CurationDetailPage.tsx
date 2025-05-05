
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { CurationItem } from "@/components/curations/CurationItem";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

// Mock curation data
const mockCuration = {
  id: "1",
  title: "Top 10 Classic Sci-Fi Movies",
  description: "The most influential science fiction films of all time that defined the genre and inspired generations of filmmakers. These movies pushed the boundaries of imagination and special effects.",
  createdAt: "2023-05-15T12:00:00Z",
  likesCount: 128,
  commentsCount: 32,
  author: {
    id: "1",
    name: "Alex Johnson",
    username: "alexj",
    avatarUrl: "",
  },
  items: [
    {
      rank: 1,
      title: "2001: A Space Odyssey",
      description: "Stanley Kubrick's masterpiece that redefined the sci-fi genre",
      imageUrl: "",
    },
    {
      rank: 2,
      title: "Blade Runner",
      description: "Ridley Scott's dystopian vision of the future",
      imageUrl: "",
    },
    {
      rank: 3,
      title: "Alien",
      description: "The perfect blend of sci-fi and horror",
      imageUrl: "",
    },
    {
      rank: 4,
      title: "Star Wars: A New Hope",
      description: "The film that launched the most iconic sci-fi franchise",
      imageUrl: "",
    },
    {
      rank: 5,
      title: "The Matrix",
      description: "Revolutionary visual effects and a mind-bending story",
      imageUrl: "",
    },
    {
      rank: 6,
      title: "E.T. the Extra-Terrestrial",
      description: "Spielberg's heartwarming tale of friendship",
      imageUrl: "",
    },
    {
      rank: 7,
      title: "The Day the Earth Stood Still",
      description: "A cautionary tale about humanity's violence",
      imageUrl: "",
    },
    {
      rank: 8,
      title: "Solaris",
      description: "Tarkovsky's philosophical exploration of memory and grief",
      imageUrl: "",
    },
    {
      rank: 9,
      title: "Metropolis",
      description: "Fritz Lang's visionary silent film about class struggle",
      imageUrl: "",
    },
    {
      rank: 10,
      title: "The Thing",
      description: "John Carpenter's terrifying tale of alien assimilation",
      imageUrl: "",
    },
  ],
};

const CurationDetailPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="h-2 bg-brand-purple"></div>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${mockCuration.author.username}`} className="flex items-center gap-3">
                <Avatar>
                  {mockCuration.author.avatarUrl ? (
                    <AvatarImage src={mockCuration.author.avatarUrl} />
                  ) : (
                    <AvatarFallback>{mockCuration.author.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{mockCuration.author.name}</div>
                  <div className="text-sm text-muted-foreground">@{mockCuration.author.username}</div>
                </div>
              </Link>
              <Button variant="outline">Follow</Button>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{mockCuration.title}</h1>
            <p className="text-muted-foreground">{mockCuration.description}</p>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{mockCuration.likesCount}</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{mockCuration.commentsCount}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              {mockCuration.items.map((item) => (
                <CurationItem key={item.rank} {...item} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Comments</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>Be the first to comment on this curation!</p>
              <Button className="mt-4">Add Comment</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CurationDetailPage;
