import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSegmentSchema } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";
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
