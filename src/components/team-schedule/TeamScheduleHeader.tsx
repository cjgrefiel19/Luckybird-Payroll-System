import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamScheduleForm } from "../TeamScheduleForm";

export function TeamScheduleHeader() {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Team Schedule</h2>
      <TeamScheduleForm
        onSubmit={() => {}}
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