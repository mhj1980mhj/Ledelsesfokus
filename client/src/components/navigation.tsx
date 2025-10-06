import { Link, useLocation } from "wouter";
import { BarChart3, Settings, Focus } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Ledelsesfokus", icon: Focus },
    { path: "/powerbi", label: "Power BI Rapporter", icon: BarChart3 },
    { path: "/settings", label: "Indstillinger", icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  isActive
                    ? "border-[#9c9387] text-[#9c9387]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
                data-testid={`nav-${item.path.substring(1) || 'home'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
