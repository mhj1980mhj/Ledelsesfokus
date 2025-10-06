import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoImage from "@assets/ChatGPT Image 24. aug. 2025, 16.38.56_1756046355129.png";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
}

export default function PageHeader({ title, subtitle, onLogout }: PageHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoImage} alt="AL2bolig Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                {title}
              </h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900"
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log ud
          </Button>
        </div>
      </div>
    </header>
  );
}
