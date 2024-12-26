import { supabase } from "@/integrations/supabase/client";

export const generateShareableLink = async (agentName: string, startDate: Date, endDate: Date) => {
  try {
    // Check if user has admin role
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Only admins can generate shareable links');
    }

    // Create a unique identifier for this share
    const encodedData = btoa(`${agentName}|${startDate.toISOString()}|${endDate.toISOString()}`);
    const shareUrl = `/shared/agent/${encodedData}`;
    
    return {
      success: true,
      url: window.location.origin + shareUrl
    };
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return {
      success: false,
      error: 'Failed to generate shareable link'
    };
  }
};

export const decodeShareableLink = (encodedData: string) => {
  try {
    const decoded = atob(encodedData);
    const [agentName, startDate, endDate] = decoded.split('|');
    return {
      agentName,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
  } catch (error) {
    console.error('Error decoding shareable link:', error);
    return null;
  }
};