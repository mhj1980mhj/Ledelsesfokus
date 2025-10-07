import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSegmentSchema } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Segment, Project } from "@shared/schema";

interface SegmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof segmentFormSchema>) => void;
  project: Project | null;
  segment?: Segment | null;
  isPending?: boolean;
}

const segmentFormSchema = insertSegmentSchema.omit({ projectId: true }).extend({
  name: z.string().min(1, "Navn er påkrævet"),
  startDate: z.string().min(1, "Start dato er påkrævet"),
  endDate: z.string().min(1, "Slut dato er påkrævet"),
});

export default function SegmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  project,
  segment,
  isPending = false,
}: SegmentFormDialogProps) {
  const { data: existingSegments = [] } = useQuery<Segment[]>({
    queryKey: ['/api/projects', project?.id, 'segments'],
    queryFn: async () => {
      if (!project?.id) return [];
      const response = await fetch(`/api/projects/${project.id}/segments`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!project?.id && open,
  });

  const form = useForm<z.infer<typeof segmentFormSchema>>({
    resolver: zodResolver(segmentFormSchema),
    defaultValues: {
      name: "",
      startDate: project?.startDate || "",
      endDate: project?.endDate || "",
    },
  });

  useEffect(() => {
    if (segment) {
      form.reset({
        name: segment.name,
        startDate: segment.startDate,
        endDate: segment.endDate,
      });
    } else if (project) {
      form.reset({
        name: "",
        startDate: project.startDate,
        endDate: project.endDate,
      });
    }
  }, [segment, project, form]);

  const handleSubmit = (data: z.infer<typeof segmentFormSchema>) => {
    const newStart = new Date(data.startDate).getTime();
    const newEnd = new Date(data.endDate).getTime();
    
    if (newStart >= newEnd) {
      form.setError("startDate", { 
        type: "manual", 
        message: "Start dato skal være før slut dato" 
      });
      form.setError("endDate", { 
        type: "manual", 
        message: "Slut dato skal være efter start dato" 
      });
      return;
    }
    
    const hasOverlap = existingSegments.some(seg => {
      if (segment && seg.id === segment.id) return false;
      const segStart = new Date(seg.startDate).getTime();
      const segEnd = new Date(seg.endDate).getTime();
      // Allow adjacent segments where one ends exactly when another begins
      const overlapsStart = newStart < segEnd && newStart >= segStart;
      const overlapsEnd = newEnd > segStart && newEnd <= segEnd;
      const contains = newStart <= segStart && newEnd >= segEnd;
      return overlapsStart || overlapsEnd || contains;
    });
    
    if (hasOverlap) {
      form.setError("startDate", { 
        type: "manual", 
        message: "Dette segment overlapper med et eksisterende segment" 
      });
      form.setError("endDate", { 
        type: "manual", 
        message: "Dette segment overlapper med et eksisterende segment" 
      });
      return;
    }
    
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-segment-form">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {segment ? "Rediger segment" : `Nyt segment for ${project?.name}`}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segmentnavn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Indtast segmentnavn..."
                      {...field}
                      data-testid="input-segment-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start dato</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-segment-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slut dato</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-segment-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Annuller
              </Button>
              <Button
                type="submit"
                className="bg-[#9c9387] hover:bg-[#8a816d]"
                disabled={isPending}
                data-testid="button-submit"
              >
                {isPending ? "Gemmer..." : segment ? "Opdater segment" : "Opret segment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
