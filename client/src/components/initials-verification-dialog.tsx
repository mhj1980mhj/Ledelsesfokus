import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface InitialsVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (verified: boolean, initials?: string) => void;
  expectedInitials: string;
  action: "edit" | "delete";
  projectName: string;
}

export default function InitialsVerificationDialog({
  open,
  onOpenChange,
  onVerify,
  expectedInitials,
  action,
  projectName,
}: InitialsVerificationDialogProps) {
  const [initials, setInitials] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initials.toLowerCase() === expectedInitials.toLowerCase()) {
      onVerify(true, initials);
      setInitials("");
      setError("");
    } else {
      setError("Forkerte initialer. Prøv igen.");
      onVerify(false);
    }
  };

  const handleCancel = () => {
    setInitials("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-initials-verification">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {action === "edit" ? "Bekræft redigering" : "Bekræft sletning"}
          </DialogTitle>
          <DialogDescription>
            For at {action === "edit" ? "redigere" : "slette"} projektet "{projectName}", skal du indtaste initialerne på den person, der oprettede projektet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initials">Opretterens initialer</Label>
            <Input
              id="initials"
              value={initials}
              onChange={(e) => {
                setInitials(e.target.value);
                setError("");
              }}
              placeholder="Indtast initialer"
              maxLength={4}
              autoFocus
              data-testid="input-initials"
            />
            {error && (
              <p className="text-sm text-red-500" data-testid="text-error">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              Annuller
            </Button>
            <Button
              type="submit"
              variant={action === "delete" ? "destructive" : "default"}
              data-testid="button-verify"
            >
              {action === "edit" ? "Bekræft" : "Slet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
