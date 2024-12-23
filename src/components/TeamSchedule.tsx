import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/constants";
import { formatCurrency } from "@/lib/calculations";
import { TeamScheduleForm } from "./TeamScheduleForm";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { TeamMember } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export function TeamSchedule() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const { toast } = useToast();

  const handleAdd = (newMember: TeamMember) => {
    setMembers([...members, newMember]);
  };

  const handleEdit = (editedMember: TeamMember, index: number) => {
    const newMembers = [...members];
    newMembers[index] = editedMember;
    setMembers(newMembers);
  };

  const handleDelete = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
    toast({
      title: "Deleted successfully",
      description: "Team member has been removed.",
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Team Schedule</h2>
        <TeamScheduleForm
          onSubmit={handleAdd}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          }
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent Name</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>Workdays</TableHead>
              <TableHead>Rest Days</TableHead>
              <TableHead className="text-right">Monthly Rate</TableHead>
              <TableHead className="text-right">Hourly Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={member.name + index}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.timeIn}</TableCell>
                <TableCell>{member.timeOut}</TableCell>
                <TableCell>{member.workdays}</TableCell>
                <TableCell>{member.restDays}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(member.monthlyRate)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(member.hourlyRate)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TeamScheduleForm
                      member={member}
                      onSubmit={(data) => handleEdit(data, index)}
                      trigger={
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}