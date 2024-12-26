import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamScheduleForm } from "../TeamScheduleForm";
import { TeamMember } from "@/lib/types";

interface TeamScheduleHeaderProps {
  onAdd: (data: TeamMember) => Promise<void>;
}

export function TeamScheduleHeader({ onAdd }: TeamScheduleHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Team Schedule</h2>
      <TeamScheduleForm
        onSubmit={onAdd}
        trigger={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        }
      />
    </div>
  );
}