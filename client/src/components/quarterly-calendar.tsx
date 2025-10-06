import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import type { Project } from "@shared/schema";

interface QuarterlyCalendarProps {
  projects: Project[];
  onProjectClick?: (project: Project, action?: "edit" | "delete") => void;
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

export default function QuarterlyCalendar({ projects, onProjectClick }: QuarterlyCalendarProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const projectsByYear = projects
    .map((project) => ({
      project,
      position: getProjectPosition(project, currentYear),
    }))
    .filter((item) => item.position !== null);

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

        <div className="space-y-3">
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

              return (
                <div
                  key={project.id}
                  className="grid grid-cols-4 gap-4 group"
                  data-testid={`project-row-${project.id}`}
                >
                  <div
                    className="text-white rounded-lg p-3 relative"
                    style={{
                      gridColumnStart,
                      gridColumnEnd,
                      backgroundColor: project.color,
                    }}
                    data-testid={`project-bar-${project.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
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
