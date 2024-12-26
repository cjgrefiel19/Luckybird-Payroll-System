import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useScheduleFetch = () => {
  const { toast } = useToast();

  const fetchSchedule = async (selectedAgentName: string | undefined) => {
    if (!selectedAgentName) return null;

    try {
      console.log("Fetching schedule for:", selectedAgentName);
      
      const { data, error } = await supabase
        .from('team_schedules')
        .select('time_in, time_out, hourly_rate')
        .eq('agent_name', selectedAgentName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team schedule:', error);
        throw error;
      }

      console.log("Schedule data received:", data);

      if (!data) {
        console.log("No schedule found for agent:", selectedAgentName);
        // Only show toast once
        toast({
          title: "No Schedule Found",
          description: `No schedule found for ${selectedAgentName}. Please set up their schedule in the Team Schedule tab first.`,
          variant: "default",
        }, {
          // This prevents multiple toasts from appearing
          id: `no-schedule-${selectedAgentName}`
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchSchedule:', error);
      // Only show error toast once
      toast({
        title: "Error",
        description: "Failed to fetch agent schedule. Please try again.",
        variant: "destructive",
      }, {
        id: 'fetch-schedule-error'
      });
      return null;
    }
  };

  return { fetchSchedule };
};