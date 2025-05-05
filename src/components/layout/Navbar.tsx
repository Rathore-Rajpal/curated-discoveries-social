
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusSquare, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, userProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  // Get first letter of name for avatar fallback
  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.charAt(0).toUpperCase();
    } else if (userProfile?.username) {
      return userProfile.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-purple flex items-center justify-center">
              <span className="text-white font-bold">CD</span>
            </div>
            <span className="font-semibold text-lg hidden md:block">CuratedDiscoveries</span>
          </Link>

          <div className="hidden md:flex items-center relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search curations..." 
              className="pl-10 rounded-full bg-muted border-none" 
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Link to="/create">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <PlusSquare className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={userProfile?.avatar_url || undefined} 
                        alt={userProfile?.full_name || userProfile?.username || "User"} 
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userProfile?.full_name || userProfile?.username || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuItem disabled={loading} className="text-muted-foreground text-sm">
                    @{userProfile?.username || "..."}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${userProfile?.username || 'me'}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
