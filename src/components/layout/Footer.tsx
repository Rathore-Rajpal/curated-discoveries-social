
import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">CuratedDiscoveries</h3>
            <p className="text-muted-foreground text-sm">
              Share and discover curated lists on your favorite topics.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link to="/explore" className="text-muted-foreground hover:text-foreground">Explore</Link></li>
              <li><Link to="/popular" className="text-muted-foreground hover:text-foreground">Popular</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-muted-foreground hover:text-foreground">Log In</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-foreground">Sign Up</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-foreground">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} CuratedDiscoveries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
