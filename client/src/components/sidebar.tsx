import { Home, TrendingUp, Wrench, Users, Building, Leaf, FileText, User } from "lucide-react";
import type { DashboardPage } from "@/pages/dashboard";

interface SidebarProps {
  currentPage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
  "data-testid"?: string;
}

const navigationItems = [
  { id: "overview", label: "Oversigt", icon: Home },
  { id: "economy", label: "Økonomi", icon: TrendingUp },
  { id: "maintenance", label: "Vedligeholdelse", icon: Wrench },
  { id: "tenants", label: "Beboere", icon: Users },
  { id: "properties", label: "Ejendomme", icon: Building },
  { id: "sustainability", label: "Bæredygtighed", icon: Leaf },
  { id: "reports", label: "Rapporter", icon: FileText },
] as const;

export default function Sidebar({ currentPage, onPageChange, "data-testid": testId }: SidebarProps) {
  return (
    <nav 
      className="w-80 bg-white/70 backdrop-blur-xl border-r border-gray-200/50 shadow-xl sticky top-0 h-screen overflow-y-auto"
      data-testid={testId}
    >
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-8" data-testid="logo-section">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Home className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">al2bolig</h1>
            <p className="text-sm text-gray-500">Dashboard Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2" data-testid="navigation-menu">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <div
                key={item.id}
                className={`nav-item px-4 py-3 cursor-pointer ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(item.id as DashboardPage)}
                data-testid={`nav-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Section */}
        <div className="mt-8 pt-6 border-t border-gray-200" data-testid="user-section">
          <div className="flex items-center space-x-3 p-3 rounded-xl glass-card">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-secondary-600 rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Ledelse</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
