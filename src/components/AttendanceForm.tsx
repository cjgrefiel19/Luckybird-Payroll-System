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
          
          // First, verify the table access
          const { data: testData, error: testError } = await supabase
            .from('team_schedules')
            .select('*')
            .limit(1);
            
          if (testError) {
            console.error('Error accessing team_schedules table:', testError);
            throw new Error('Cannot access team schedules table');
          }
          
          console.log("Successfully accessed team_schedules table");
          
          // Now fetch the specific agent's schedule
          const { data, error } = await supabase
            .from('team_schedules')
            .select('*')
            .eq('agent_name', selectedAgentName)
            .single();

          if (error) {
            console.error('Error fetching team schedule:', error);
            throw error;
          }

          console.log("Schedule data received:", data);

          if (data) {
            console.log("Setting form values with:", {
              timeIn: data.time_in,
              timeOut: data.time_out
            });
            
            form.setValue("timeIn", data.time_in);
            form.setValue("timeOut", data.time_out);
          } else {
            console.log("No schedule found for agent:", selectedAgentName);
            toast({
              title: "No Schedule Found",
              description: `No schedule found for ${selectedAgentName}. Please set up their schedule in the Team Schedule tab first.`,
              variant: "default", // Changed from "warning" to "default"
            });
          }
        } catch (error) {
          console.error('Detailed error:', error);
          toast({
            title: "Error",
            description: "Failed to fetch agent schedule. Please try again or contact support.",
            variant: "destructive",
          });
        }
      }
    };

    fetchTeamSchedule();
  }, [selectedAgentName, form, toast]);

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
      console.log("Submitting form with values:", values);
      
      const { data: memberData, error: memberError } = await supabase
        .from('team_schedules')
        .select('hourly_rate')
        .eq('agent_name', values.agentName)
        .single();

      if (memberError) {
        console.error('Error fetching hourly rate:', memberError);
        throw memberError;
      }

      console.log("Retrieved member data:", memberData);

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
        dailyEarnings: totalHours * hourlyRate, // Calculate daily earnings
      };

      console.log("Prepared entry:", entry);

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

      if (error) {
        console.error('Error saving to time_entries:', error);
        throw error;
      }

      console.log("Successfully saved entry");

      onSubmit(entry);
      if (!editingEntry) {
        form.reset();
      }

      toast({
        title: "Success",
        description: "Attendance entry saved successfully",
      });
    } catch (error) {
      console.error('Detailed submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance entry. Please ensure all fields are filled correctly.",
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