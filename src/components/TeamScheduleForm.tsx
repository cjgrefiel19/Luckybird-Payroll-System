import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { TeamMember } from "@/lib/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TeamScheduleFormFields } from "./team-schedule/TeamScheduleFormFields";
import { useTeamScheduleForm } from "./team-schedule/useTeamScheduleForm";

interface TeamScheduleFormProps {
  member?: TeamMember;
  onSubmit: (data: TeamMember) => Promise<void>;
  trigger?: React.ReactNode;
}

export function TeamScheduleForm({ member, onSubmit, trigger }: TeamScheduleFormProps) {
  const [open, setOpen] = useState(false);
  const { form, isSubmitting, handleSubmit } = useTeamScheduleForm({
    member,
    onSubmit,
    onClose: () => setOpen(false),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit" : "Add"} Team Member</DialogTitle>
          <DialogDescription>
            Enter the team member's details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TeamScheduleFormFields form={form} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {member ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{member ? "Update" : "Add"} Team Member</>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}