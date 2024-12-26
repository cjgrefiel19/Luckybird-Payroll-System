import { TeamScheduleHeader } from "./team-schedule/TeamScheduleHeader";
import { TeamScheduleTable } from "./team-schedule/TeamScheduleTable";
import { useTeamSchedule } from "./team-schedule/useTeamSchedule";
import { Loader2 } from "lucide-react";

export function TeamSchedule() {
  const { members, isLoading, handleAdd, handleEdit, handleDelete } = useTeamSchedule();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <TeamScheduleHeader onAdd={handleAdd} />
      <TeamScheduleTable 
        members={members}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}