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
      console.log("Starting form submission with values:", values);
      
      // First, get the current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      // Ensure the agent name matches the user's full name
      if (values.agentName !== profile.full_name) {
        throw new Error('You can only submit time entries for yourself');
      }

      const totalHours = calculateTotalHours(values.timeIn, values.timeOut);
      
      // Validate shift type
      const validShiftTypes: ShiftType[] = [
        "Regular Shift",
        "Regular OT",
        "Rest Day OT",
        "Special Holidays",
        "Regular Holidays",
        "Paid Leave",
        "Paid SL",
        "UnPaid Leave",
        "UnPaid SL"
      ];

      if (!validShiftTypes.includes(values.shiftType as ShiftType)) {
        console.error("Invalid shift type:", values.shiftType);
        throw new Error(`Invalid shift type: ${values.shiftType}`);
      }

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

      console.log("Fetching schedule data for agent:", values.agentName);
      
      // Get the hourly rate from team_schedules
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('team_schedules')
        .select('hourly_rate')
        .eq('agent_name', values.agentName)
        .maybeSingle();

      if (scheduleError) {
        console.error('Schedule fetch error:', scheduleError);
        throw new Error('Failed to fetch schedule data');
      }

      // Update hourly rate and calculate earnings
      if (scheduleData) {
        entry.hourlyRate = scheduleData.hourly_rate;
        entry.dailyEarnings = totalHours * entry.hourlyRate;
      }

      console.log("Saving time entry:", entry);

      // Save to Supabase
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

      console.log("Successfully saved time entry");

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