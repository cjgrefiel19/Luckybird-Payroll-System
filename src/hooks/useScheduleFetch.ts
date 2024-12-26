import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useScheduleFetch = () => {
  const { toast } = useToast();

  const fetchSchedule = async (selectedAgentName: string | undefined) => {
    if (!selectedAgentName) return;

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

      if (!data) {
        console.log("No schedule found for agent:", selectedAgentName);
        toast({
          title: "No Schedule Found",
          description: `No schedule found for ${selectedAgentName}. Please set up their schedule in the Team Schedule tab first.`,
          variant: "default",
        });
      }

      return data;
    } catch (error) {
      console.error('Detailed error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agent schedule. Please try again or contact support.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { fetchSchedule };
};