import LoadingShimmer from "@/components/loading-shimmer";

interface PowerBIEmbedProps {
  title: string;
  subtitle: string;
  height: string;
  dashboardUrl?: string;
  "data-testid"?: string;
}

export default function PowerBIEmbed({ 
  title, 
  subtitle, 
  height, 
  dashboardUrl,
  "data-testid": testId 
}: PowerBIEmbedProps) {
  if (dashboardUrl) {
    return (
      <div className={`${height} rounded-xl overflow-hidden`} data-testid={testId}>
        <iframe
          src={dashboardUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          title={title}
          data-testid="powerbi-iframe"
        />
      </div>
    );
  }

  // Placeholder for Power BI embed
  return (
    <div 
      className={`${height} bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center`}
      data-testid={testId || "powerbi-placeholder"}
    >
      <div className="text-center">
        <LoadingShimmer className="w-16 h-16 rounded-xl mx-auto mb-4" />
        <p className="text-gray-500 font-medium" data-testid="embed-title">
          {title}
        </p>
        <p className="text-sm text-gray-400" data-testid="embed-subtitle">
          {subtitle}
        </p>
        {/* TODO: Replace with actual Power BI embed iframe */}
        {/* <iframe src="POWER_BI_DASHBOARD_URL" width="100%" height="100%" frameborder="0"></iframe> */}
      </div>
    </div>
  );
}
