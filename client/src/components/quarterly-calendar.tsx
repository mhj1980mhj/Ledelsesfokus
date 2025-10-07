import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from "lucide-react";
import type { Project, Segment } from "@shared/schema";

interface QuarterlyCalendarProps {
  projects: Project[];
  onProjectClick?: (project: Project, action?: "edit" | "delete") => void;
  onAddSegment?: (project: Project) => void;
}

const quarters = [
  { id: "Q1", label: "Q1", months: "Jan-Mar", startMonth: 0, endMonth: 2 },
  { id: "Q2", label: "Q2", months: "Apr-Jun", startMonth: 3, endMonth: 5 },
  { id: "Q3", label: "Q3", months: "Jul-Sep", startMonth: 6, endMonth: 8 },
  { id: "Q4", label: "Q4", months: "Oct-Dec", startMonth: 9, endMonth: 11 },
];

const statusLabels: Record<string, string> = {
  planned: "Planlagt",
  active: "Aktiv",
  completed: "Afsluttet",
  onhold: "På hold",
};

function getQuarterFromDate(date: string): number {
  const month = new Date(date).getMonth();
  return Math.floor(month / 3);
}

function getProjectPosition(project: Project, year: number) {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (endYear < year || startYear > year) {
    return null;
  }

  const startQuarter = startYear === year ? getQuarterFromDate(project.startDate) : 0;
  const endQuarter = endYear === year ? getQuarterFromDate(project.endDate) : 3;

  return {
    startQuarter,
    endQuarter,
    span: endQuarter - startQuarter + 1,
  };
}

function getSegmentPosition(segment: Segment, project: Project, year: number) {
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  const segmentStart = new Date(segment.startDate);
  const segmentEnd = new Date(segment.endDate);
  
  const clampedSegmentStart = new Date(Math.max(segmentStart.getTime(), projectStart.getTime()));
  const clampedSegmentEnd = new Date(Math.min(segmentEnd.getTime(), projectEnd.getTime()));
  
  const segmentStartYear = clampedSegmentStart.getFullYear();
  const segmentEndYear = clampedSegmentEnd.getFullYear();
  
  if (segmentEndYear < year || segmentStartYear > year) {
    return null;
  }
  
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  
  const effectiveSegmentStart = segmentStartYear === year ? clampedSegmentStart : yearStart;
  const effectiveSegmentEnd = segmentEndYear === year ? clampedSegmentEnd : yearEnd;
  
  const projectStartInYear = projectStart.getFullYear() === year ? projectStart : yearStart;
  const projectEndInYear = projectEnd.getFullYear() === year ? projectEnd : yearEnd;
  
  const projectDuration = projectEndInYear.getTime() - projectStartInYear.getTime();
  const segmentOffset = effectiveSegmentStart.getTime() - projectStartInYear.getTime();
  const segmentDuration = effectiveSegmentEnd.getTime() - effectiveSegmentStart.getTime();
  
  const leftPercent = (segmentOffset / projectDuration) * 100;
  const widthPercent = (segmentDuration / projectDuration) * 100;
  
  return {
    left: `${Math.max(0, leftPercent)}%`,
    width: `${Math.min(100 - Math.max(0, leftPercent), widthPercent)}%`,
  };
}

export default function QuarterlyCalendar({ projects, onProjectClick, onAddSegment }: QuarterlyCalendarProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const projectsByYear = projects
    .map((project) => ({
      project,
      position: getProjectPosition(project, currentYear),
    }))
    .filter((item) => item.position !== null);

  const { data: allSegments = {} } = useQuery<Record<string, Segment[]>>({
    queryKey: ['/api/segments', projects.map(p => p.id)],
    queryFn: async () => {
      const segmentsByProject: Record<string, Segment[]> = {};
      await Promise.all(
        projects.map(async (project) => {
          const response = await fetch(`/api/projects/${project.id}/segments`);
          if (response.ok) {
            segmentsByProject[project.id] = await response.json();
          } else {
            segmentsByProject[project.id] = [];
          }
        })
      );
      return segmentsByProject;
    },
    enabled: projects.length > 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentYear((y) => y - 1)}
          data-testid="button-prev-year"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentYear - 1}
        </Button>
        <h3 className="text-2xl font-bold text-gray-800" data-testid="calendar-year">
          {currentYear}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentYear((y) => y + 1)}
          data-testid="button-next-year"
        >
          {currentYear + 1}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {quarters.map((quarter) => (
            <div key={quarter.id} className="text-center" data-testid={`quarter-${quarter.id}`}>
              <div className="font-semibold text-lg text-gray-800">{quarter.label}</div>
              <div className="text-xs text-gray-500">{quarter.months}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {projectsByYear.length === 0 ? (
            <div className="text-center py-12 text-gray-500" data-testid="text-no-projects">
              Ingen projekter for {currentYear}
            </div>
          ) : (
            projectsByYear.map(({ project, position }) => {
              if (!position) return null;
              
              const gridColumnStart = position.startQuarter + 1;
              const gridColumnEnd = position.endQuarter + 2;
              const statusLabel = statusLabels[project.status] || "Ukendt";
              const projectSegments = allSegments[project.id] || [];

              return (
                <div
                  key={project.id}
                  className="grid grid-cols-4 gap-4 group"
                  data-testid={`project-row-${project.id}`}
                >
                  <div
                    className="text-white rounded-lg p-2 relative overflow-hidden"
                    style={{
                      gridColumnStart,
                      gridColumnEnd,
                      backgroundColor: project.color,
                    }}
                    data-testid={`project-bar-${project.id}`}
                  >
                    {projectSegments.map((segment, index) => {
                      const segmentPos = getSegmentPosition(segment, project, currentYear);
                      if (!segmentPos) return null;
                      return (
                        <div
                          key={segment.id}
                          className="absolute top-0 bottom-0 bg-white/40 border-r-2 border-white"
                          style={{
                            left: segmentPos.left,
                            width: segmentPos.width,
                            borderLeft: index === 0 ? 'none' : '2px solid white',
                          }}
                          data-testid={`segment-${segment.id}`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold truncate px-1 drop-shadow">
                              {segment.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between gap-2 relative z-10">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" data-testid="project-name">
                          {project.name}
                        </div>
                        <div className="text-xs opacity-90 truncate" data-testid="project-owner">
                          {project.owner}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded" data-testid="project-status">
                          {statusLabel}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSegment?.(project);
                            }}
                            data-testid={`button-add-segment-${project.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onProjectClick?.(project, "edit");
                            }}
                            data-testid={`button-edit-${project.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onProjectClick?.(project, "delete");
                            }}
                            data-testid={`button-delete-${project.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
