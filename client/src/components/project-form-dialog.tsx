import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project } from "@shared/schema";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof projectFormSchema>) => void;
  project?: Project | null;
  isPending?: boolean;
}

const projectFormSchema = insertProjectSchema.extend({
  startDate: z.string().min(1, "Start dato er påkrævet"),
  endDate: z.string().min(1, "Slut dato er påkrævet"),
  creatorInitials: z.string().min(1, "Initialer er påkrævet").max(4, "Max 4 tegn"),
  color: z.string().min(1, "Farve er påkrævet"),
});

export default function ProjectFormDialog({
  open,
  onOpenChange,
  onSubmit,
  project,
  isPending = false,
}: ProjectFormDialogProps) {
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "planned",
      owner: "",
      creatorInitials: "",
      color: "#3b82f6",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        owner: project.owner,
        creatorInitials: project.creatorInitials,
        color: project.color,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "planned",
        owner: "",
        creatorInitials: "",
        color: "#3b82f6",
      });
    }
  }, [project, form]);

  const handleSubmit = (data: z.infer<typeof projectFormSchema>) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-project-form">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {project ? "Rediger projekt" : "Nyt projekt"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projektnavn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Indtast projektnavn..."
                      {...field}
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Indtast beskrivelse..."
                      {...field}
                      value={field.value || ""}
                      data-testid="input-description"
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
                      <Input type="date" {...field} data-testid="input-start-date" />
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
                      <Input type="date" {...field} data-testid="input-end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Vælg status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planlagt</SelectItem>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="completed">Afsluttet</SelectItem>
                      <SelectItem value="onhold">På hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projektansvarlig</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Indtast navn..."
                      {...field}
                      data-testid="input-owner"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="creatorInitials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oprettet af (initialer)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="fx. AB"
                        {...field}
                        maxLength={4}
                        disabled={!!project}
                        data-testid="input-creator-initials"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projektfarve</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          {...field}
                          className="w-16 h-10 p-1 cursor-pointer"
                          data-testid="input-color"
                        />
                        <Input
                          type="text"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#3b82f6"
                          className="flex-1"
                          data-testid="input-color-text"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Annuller
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending ? "Gemmer..." : project ? "Gem ændringer" : "Opret projekt"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
