import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@shared/schema";

interface QuarterlyCalendarProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

const quarters = [
  { id: "Q1", label: "Q1", months: "Jan-Mar", startMonth: 0, endMonth: 2 },
  { id: "Q2", label: "Q2", months: "Apr-Jun", startMonth: 3, endMonth: 5 },
  { id: "Q3", label: "Q3", months: "Jul-Sep", startMonth: 6, endMonth: 8 },
  { id: "Q4", label: "Q4", months: "Oct-Dec", startMonth: 9, endMonth: 11 },
];

const statusColors: Record<string, string> = {
  planned: "bg-gray-400",
  active: "bg-blue-500",
  completed: "bg-green-500",
  onhold: "bg-yellow-500",
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
              
              const color = statusColors[project.status] || "bg-gray-400";
              const gridColumnStart = position.startQuarter + 1;
              const gridColumnEnd = position.endQuarter + 2;

              return (
                <div
                  key={project.id}
                  className="grid grid-cols-4 gap-4"
                  data-testid={`project-row-${project.id}`}
                >
                  <div
                    className={`col-span-${position.span} ${color} text-white rounded-lg p-3 cursor-pointer hover:opacity-90 transition-opacity`}
                    style={{
                      gridColumnStart,
                      gridColumnEnd,
                    }}
                    onClick={() => onProjectClick?.(project)}
                    data-testid={`project-bar-${project.id}`}
                  >
                    <div className="font-medium truncate" data-testid="project-name">
                      {project.name}
                    </div>
                    <div className="text-xs opacity-90 truncate" data-testid="project-owner">
                      {project.owner}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600 font-medium">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400" />
          <span className="text-gray-600">Planlagt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-gray-600">Aktiv</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-600">Afsluttet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-gray-600">På hold</span>
        </div>
      </div>
    </div>
  );
}
