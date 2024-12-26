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
      const totalHours = calculateTotalHours(values.timeIn, values.timeOut);
      
      // Create entry with validated shift type
      const entry: AttendanceEntry = {
        date: values.date,
        agentName: values.agentName,
        timeIn: values.timeIn,
        timeOut: values.timeOut,
        totalHours,
        hourlyRate: 0,
        shiftType: values.shiftType as ShiftType,
        otRate: 0,
        otPay: 0,
        dailyEarnings: 0,
      };

      // Get the hourly rate from team_schedules
      const { data: scheduleData } = await supabase
        .from('team_schedules')
        .select('hourly_rate')
        .eq('agent_name', values.agentName)
        .maybeSingle();

      // Update hourly rate and calculate earnings
      if (scheduleData) {
        entry.hourlyRate = scheduleData.hourly_rate;
        entry.dailyEarnings = totalHours * entry.hourlyRate;
      }

      // Save to Supabase without any auth checks
      const { error: insertError } = await supabase
        .from('time_entries')
        .insert({
          date: entry.date.toISOString().split('T')[0],
          agent_name: entry.agentName,
          time_in: entry.timeIn,
          time_out: entry.timeOut,
          total_working_hours: entry.totalHours,
          hourly_rate: entry.hourlyRate,
          shift_type: entry.shiftType,
          ot_pay: entry.otPay,
          daily_earnings: entry.dailyEarnings
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Failed to save attendance entry');
      }

      onSubmit(entry);
      if (!editingEntry) {
        form.reset();
      }

      toast({
        title: "Success",
        description: "Attendance entry saved successfully",
      });
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance entry",
        variant: "destructive",
      });
    }
  };

  return { form, handleSubmit };
};