import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormFields } from "@/components/attendance/AttendanceFormFields";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceEntry, ShiftType } from "@/lib/types";
import { calculateTotalHours } from "@/lib/calculations";

interface UseAttendanceFormProps {
  onSubmit: (data: AttendanceEntry) => void;
  editingEntry?: AttendanceEntry | null;
}

export const useAttendanceForm = ({ onSubmit, editingEntry }: UseAttendanceFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeIn: "",
      timeOut: "",
      shiftType: "Regular Shift",
    }
  });

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
      
      const entry: AttendanceEntry = {
        date: values.date,
        agentName: values.agentName,
        timeIn: values.timeIn,
        timeOut: values.timeOut,
        totalHours,
        hourlyRate,
        shiftType: values.shiftType as ShiftType,
        otRate: 0,
        otPay: 0,
        dailyEarnings: totalHours * hourlyRate,
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

  return { form, handleSubmit };
};