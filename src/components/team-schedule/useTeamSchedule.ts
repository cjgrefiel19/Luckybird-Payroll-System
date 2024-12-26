import { useState, useEffect } from "react";
import { TeamMember } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useTeamSchedule() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
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
        description: "Failed to load team members. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        description: "Failed to add team member. Please try again.",
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
        description: "Failed to update team member. Please try again.",
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
        description: "Failed to delete team member. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    members,
    isLoading,
    handleAdd,
    handleEdit,
    handleDelete
  };
}