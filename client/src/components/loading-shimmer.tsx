import { cn } from "@/lib/utils";

interface LoadingShimmerProps {
  className?: string;
  "data-testid"?: string;
}

export default function LoadingShimmer({ className, "data-testid": testId }: LoadingShimmerProps) {
  return (
    <div 
      className={cn("loading-shimmer rounded", className)}
      data-testid={testId || "loading-shimmer"}
    />
  );
}