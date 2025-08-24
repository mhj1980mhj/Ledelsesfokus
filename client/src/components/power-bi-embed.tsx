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
      <div className={`${height} rounded-xl overflow-hidden border border-gray-200`} data-testid={testId}>
        <iframe
          src={dashboardUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          title={title}
          allowFullScreen
          data-testid="powerbi-iframe"
        />
      </div>
    );
  }

  // Placeholder for Power BI embed
  return (
    <div 
      className={`${height} bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center transition-all duration-300 hover:border-gray-400`}
      data-testid={testId || "powerbi-placeholder"}
    >
      <div className="text-center p-4">
        <LoadingShimmer className="w-16 h-16 rounded-xl mx-auto mb-4" />
        <p className="text-gray-500 font-medium mb-2" data-testid="embed-title">
          {title}
        </p>
        <p className="text-sm text-gray-400" data-testid="embed-subtitle">
          {subtitle}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Power BI URL mangler - klik tandhjulet for at opdatere
        </p>
      </div>
    </div>
  );
}