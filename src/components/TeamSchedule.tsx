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
import { useState, useEffect } from "react";
import { TeamMember } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function TeamSchedule() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  // Load team members from Supabase on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_schedules')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          const transformedMembers = data.map(member => ({
            name: member.agent_name,
            timeIn: member.time_in,
            timeOut: member.time_out,
            workdays: member.workdays,
            restDays: member.restdays,
            monthlyRate: member.monthly_rate,
            hourlyRate: member.hourly_rate
          }));
          setMembers(transformedMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive"
        });
      }
    };

    fetchMembers();
  }, [toast]);

  const handleAdd = async (newMember: TeamMember) => {
    try {
      const { error } = await supabase
        .from('team_schedules')
        .insert({
          agent_name: newMember.name,
          time_in: newMember.timeIn,
          time_out: newMember.timeOut,
          workdays: newMember.workdays,
          restdays: newMember.restDays,
          monthly_rate: newMember.monthlyRate,
          hourly_rate: newMember.hourlyRate
        });

      if (error) throw error;

      setMembers([...members, newMember]);
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (editedMember: TeamMember, index: number) => {
    try {
      const { error } = await supabase
        .from('team_schedules')
        .update({
          agent_name: editedMember.name,
          time_in: editedMember.timeIn,
          time_out: editedMember.timeOut,
          workdays: editedMember.workdays,
          restdays: editedMember.restDays,
          monthly_rate: editedMember.monthlyRate,
          hourly_rate: editedMember.hourlyRate
        })
        .eq('agent_name', editedMember.name);

      if (error) throw error;

      const newMembers = [...members];
      newMembers[index] = editedMember;
      setMembers(newMembers);
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (index: number) => {
    const memberToDelete = members[index];
    try {
      const { error } = await supabase
        .from('team_schedules')
        .delete()
        .eq('agent_name', memberToDelete.name);

      if (error) throw error;

      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive"
      });
    }
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