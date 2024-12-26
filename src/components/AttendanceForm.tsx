import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AttendanceEntry, TeamMember, ShiftType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { calculateTotalHours } from "@/lib/calculations";
import { AttendanceFormFields, formSchema, FormFields } from "./attendance/AttendanceFormFields";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TEAM_MEMBERS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

export function AttendanceForm({ onSubmit, editingEntry }: AttendanceFormProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const { toast } = useToast();
  
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeIn: "",
      timeOut: "",
      shiftType: "Regular Shift",
    }
  });

  // Watch for changes in the selected agent
  const selectedAgentName = form.watch("agentName");

  // Auto-populate time fields when agent is selected
  useEffect(() => {
    const fetchTeamSchedule = async () => {
      if (selectedAgentName) {
        try {
          console.log("Fetching schedule for:", selectedAgentName);
          const { data, error } = await supabase
            .from('team_schedules')
            .select('*')
            .eq('agent_name', selectedAgentName)
            .single();

          if (error) {
            console.error('Error fetching team schedule:', error);
            throw error;
          }

          if (data) {
            console.log("Found schedule:", data);
            form.setValue("timeIn", data.time_in);
            form.setValue("timeOut", data.time_out);
          } else {
            console.log("No schedule found for agent");
          }
        } catch (error) {
          console.error('Error fetching team schedule:', error);
          toast({
            title: "Error",
            description: "Failed to fetch agent schedule",
            variant: "destructive",
          });
        }
      }
    };

    fetchTeamSchedule();
  }, [selectedAgentName, form]);

  useEffect(() => {
    if (editingEntry) {
      form.reset({
        date: editingEntry.date,
        agentName: editingEntry.agentName,
        timeIn: editingEntry.timeIn,
        timeOut: editingEntry.timeOut,
        shiftType: editingEntry.shiftType,
      });
    }
  }, [editingEntry, form]);

  const handleSubmit = async (values: FormFields) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('team_schedules')
        .select('hourly_rate')
        .eq('agent_name', values.agentName)
        .single();

      if (memberError) throw memberError;

      const hourlyRate = memberData.hourly_rate;
      const totalHours = calculateTotalHours(values.timeIn, values.timeOut);
      
      // Ensure shiftType is cast to ShiftType
      const shiftType = values.shiftType as ShiftType;
      
      const entry: AttendanceEntry = {
        date: values.date,
        agentName: values.agentName,
        timeIn: values.timeIn,
        timeOut: values.timeOut,
        totalHours,
        hourlyRate,
        shiftType,
        otRate: 0,
        otPay: 0,
        dailyEarnings: 0,
      };

      // Format date for Supabase
      const formattedDate = entry.date.toISOString().split('T')[0];

      // Save to Supabase
      const { error } = await supabase
        .from('time_entries')
        .insert({
          date: formattedDate,
          agent_name: entry.agentName,
          time_in: entry.timeIn,
          time_out: entry.timeOut,
          total_working_hours: entry.totalHours,
          hourly_rate: entry.hourlyRate,
          shift_type: entry.shiftType,
          ot_pay: entry.otPay,
          daily_earnings: entry.dailyEarnings
        });

      if (error) throw error;

      onSubmit(entry);
      if (!editingEntry) {
        form.reset();
      }

      toast({
        title: "Success",
        description: "Attendance entry saved successfully",
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance entry",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 border rounded-lg p-4 bg-white"
      >
        <AttendanceFormFields form={form} teamMembers={teamMembers} />
        <Button type="submit" className="w-full">
          {editingEntry ? "Update Entry" : "Add Entry"}
        </Button>
      </form>
    </Form>
  );
}