import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useScheduleFetch = () => {
  const { toast } = useToast();

  const fetchSchedule = async (selectedAgentName: string | undefined) => {
    if (!selectedAgentName) return null;

    try {
      console.log("Fetching schedule for:", selectedAgentName);
      
      const { data, error } = await supabase
        .from('team_schedules')
        .select('*')
        .eq('agent_name', selectedAgentName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team schedule:', error);
        throw error;
      }

      console.log("Schedule data received:", data);

      if (!data) {
        console.log("No schedule found for agent:", selectedAgentName);
        toast({
          title: "No Schedule Found",
          description: `No schedule found for ${selectedAgentName}. Please set up their schedule in the Team Schedule tab first.`,
          variant: "default",
        });
        return null;
      }

      // Map database fields to camelCase for frontend
      return {
        time_in: data.time_in,
        time_out: data.time_out,
        hourly_rate: data.hourly_rate,
        workdays: data.workdays,
        restdays: data.restdays,
        monthly_rate: data.monthly_rate
      };

    } catch (error) {
      console.error('Error in fetchSchedule:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agent schedule. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { fetchSchedule };
};