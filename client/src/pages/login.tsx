import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logoImage from "@assets/ChatGPT Image 24. aug. 2025, 16.38.56_1756046355129.png";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple delay to make it feel more authentic
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === "AL2bolig" && password === "AL2bedst") {
      // Store login status in localStorage
      localStorage.setItem("al2bolig_authenticated", "true");
      toast({
        title: "Velkommen!",
        description: "Du er nu logget ind."
      });
      onLogin();
    } else {
      toast({
        title: "Login fejlede",
        description: "Forkert brugernavn eller password.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logoImage} alt="AL2bolig Logo" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              AL2bolig Portal
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ledelsesoverblik og dataanalyse
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Brugernavn
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Indtast brugernavn"
                required
                data-testid="input-username"
                className="bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Indtast password"
                  required
                  data-testid="input-password"
                  className="bg-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#9c9387] hover:bg-[#8a816d] text-white h-10"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logger ind..." : "Log ind"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}