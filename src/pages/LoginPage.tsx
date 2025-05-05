
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const { signIn, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setFormError("Email and password are required");
      return;
    }

    try {
      await signIn(email, password);
      setFormError("");
    } catch (error: any) {
      // Error is handled in the Auth context
      console.error("Login error:", error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // For future implementation
    toast.info(`${provider} login coming soon!`);
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Log in</CardTitle>
            <CardDescription>
              Log in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialLogin('Facebook')}
                  type="button"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                    ></path>
                  </svg>
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialLogin('Google')}
                  type="button"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.36 14.3c-.62 1.25-1.64 2.25-2.9 2.86-2.21 1.08-4.76.95-6.86-.38-2.23-1.41-3.56-4.05-3.32-6.7.16-1.9 1.12-3.7 2.62-4.9 2.31-1.86 5.89-2.13 8.5-.7.28.15.53.32.78.5-.85.77-1.7 1.55-2.58 2.29-.53-.42-1.16-.75-1.84-.8-1.67-.05-3.22 1.42-3.17 3.09.08 1.57 1.6 2.91 3.18 2.62 1.25-.09 2.19-1.16 2.38-2.37h-2.83V10h5.62c.34 2.01-.53 4.26-2.28 5.6z"
                    ></path>
                  </svg>
                  Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {formError && (
                  <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-200">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Log in"}
                </Button>

                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-brand-purple underline">
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
