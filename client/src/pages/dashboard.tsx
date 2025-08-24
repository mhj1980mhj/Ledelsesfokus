import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import DashboardCard from "@/components/dashboard-card";
import PowerBIEmbed from "@/components/power-bi-embed";
import { Home, TrendingUp, Coins, AlertTriangle } from "lucide-react";

export type DashboardPage = 
  | "overview" 
  | "economy" 
  | "maintenance" 
  | "tenants" 
  | "properties" 
  | "sustainability" 
  | "reports";

interface PageConfig {
  title: string;
  subtitle: string;
}

const pageConfig: Record<DashboardPage, PageConfig> = {
  overview: {
    title: "Dashboard Oversigt",
    subtitle: "Få et komplet overblik over alle nøgletal"
  },
  economy: {
    title: "Økonomi Dashboard",
    subtitle: "Detaljeret finansiel analyse og rapportering"
  },
  maintenance: {
    title: "Vedligeholdelse",
    subtitle: "Planlægning og sporing af vedligeholdelsesopgaver"
  },
  tenants: {
    title: "Beboer Analyse",
    subtitle: "Demografi, tilfredshed og engagement"
  },
  properties: {
    title: "Ejendomme",
    subtitle: "Portfolio oversigt og performance tracking"
  },
  sustainability: {
    title: "Bæredygtighed",
    subtitle: "Miljøpåvirkning og energioptimering"
  },
  reports: {
    title: "Rapporter",
    subtitle: "Komplette rapporter og business intelligence"
  }
};

const statsData = [
  {
    title: "Totale Boliger",
    value: "2,847",
    change: "+2.3% fra sidste måned",
    changeType: "positive" as const,
    icon: Home,
    gradient: "from-primary-500 to-primary-600"
  },
  {
    title: "Udlejningsprocent",
    value: "94.7%",
    change: "+1.2% fra sidste måned",
    changeType: "positive" as const,
    icon: TrendingUp,
    gradient: "from-secondary-500 to-secondary-600"
  },
  {
    title: "Månedlig Indtægt",
    value: "18.4M kr",
    change: "+5.7% fra sidste måned",
    changeType: "positive" as const,
    icon: Coins,
    gradient: "from-accent-500 to-accent-600"
  },
  {
    title: "Aktive Sager",
    value: "127",
    change: "-8.3% fra sidste måned",
    changeType: "negative" as const,
    icon: AlertTriangle,
    gradient: "from-orange-500 to-red-500"
  }
];

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<DashboardPage>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePageChange = (page: DashboardPage) => {
    setCurrentPage(page);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const currentConfig = pageConfig[currentPage];

  const renderOverviewPage = () => (
    <div className="space-y-8">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard
          title="Økonomi Oversigt"
          data-testid="card-economy-overview"
        >
          <PowerBIEmbed
            title="Power BI Dashboard"
            subtitle="Indlæser økonomidata..."
            height="h-96"
          />
        </DashboardCard>

        <DashboardCard
          title="Beboer Statistik"
          data-testid="card-tenant-stats"
        >
          <PowerBIEmbed
            title="Power BI Dashboard"
            subtitle="Indlæser beboerdata..."
            height="h-96"
          />
        </DashboardCard>
      </div>

      {/* Full Width Dashboard */}
      <DashboardCard
        title="Ejendoms Performance"
        showDownload
        showExpand
        data-testid="card-property-performance"
      >
        <PowerBIEmbed
          title="Power BI Dashboard"
          subtitle="Indlæser ejendomsdata og performance metrics..."
          height="h-[500px]"
        />
      </DashboardCard>
    </div>
  );

  const renderSingleDashboardPage = (title: string, subtitle: string) => (
    <DashboardCard title={title} data-testid={`card-${currentPage}-dashboard`}>
      <PowerBIEmbed
        title={`${title} Power BI Dashboard`}
        subtitle={subtitle}
        height="h-[600px]"
      />
    </DashboardCard>
  );

  const renderPageContent = () => {
    switch (currentPage) {
      case "overview":
        return renderOverviewPage();
      case "economy":
        return renderSingleDashboardPage("Økonomi Dashboard", "Detaljeret finansiel rapportering og analyse...");
      case "maintenance":
        return renderSingleDashboardPage("Vedligeholdelse Dashboard", "Sporings- og planlægningsværktøjer for vedligeholdelse...");
      case "tenants":
        return renderSingleDashboardPage("Beboer Dashboard", "Demografi, tilfredshed og engagement...");
      case "properties":
        return renderSingleDashboardPage("Ejendomme Dashboard", "Portfolio oversigt og performance tracking...");
      case "sustainability":
        return renderSingleDashboardPage("Bæredygtighed Dashboard", "Miljøpåvirkning og energiforbrug...");
      case "reports":
        return renderSingleDashboardPage("Rapporter Dashboard", "Komplette rapporter og analyser...");
      default:
        return renderOverviewPage();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen font-sans">
      <div className="flex min-h-screen">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          data-testid="sidebar-navigation"
        />
        
        <main className="flex-1 overflow-auto">
          <Header
            title={currentConfig.title}
            subtitle={currentConfig.subtitle}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            data-testid="dashboard-header"
          />
          
          <div className="p-8 animate-fade-in" data-testid="dashboard-content">
            {renderPageContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
