import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { AgentAttendanceTable } from "./AgentAttendanceTable";
import { AgentSummaryCards } from "./AgentSummaryCards";
import { AttendanceEntry } from "@/lib/types";
import { Input } from "../ui/input";
import { Link, Copy } from "lucide-react";
import { generateShareableLink } from "@/utils/shareLinks";
import { supabase } from "@/integrations/supabase/client";

interface AgentDetailsProps {
  agentName: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      if (!startDate || !endDate || !agentName) return;

      try {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('agent_name', agentName)
          .gte('date', formattedStartDate)
          .lte('date', formattedEndDate);

        if (error) throw error;

        const transformedEntries: AttendanceEntry[] = (data || []).map(entry => ({
          date: new Date(entry.date),
          agentName: entry.agent_name,
          timeIn: entry.time_in,
          timeOut: entry.time_out,
          totalHours: entry.total_working_hours,
          hourlyRate: entry.hourly_rate,
          shiftType: entry.shift_type as any,
          otRate: 0,
          otPay: entry.ot_pay,
          dailyEarnings: entry.daily_earnings
        }));

        setEntries(transformedEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance entries",
          variant: "destructive",
        });
      }
    };

    fetchEntries();
  }, [agentName, startDate, endDate, toast]);

  const handleGenerateLink = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
        variant: "destructive",
      });
      return;
    }

    const result = await generateShareableLink(agentName, startDate, endDate);
    
    if (result.success) {
      setGeneratedLink(result.url);
      toast({
        title: "Success",
        description: "Shareable link generated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to generate link",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    }
  };

  const handleViewInvoice = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{agentName}</h3>
          <div className="flex items-center gap-4">
            <Button onClick={handleGenerateLink} className="gap-2">
              <Link className="h-4 w-4" />
              Generate Shareable Link
            </Button>
          </div>
        </div>

        {generatedLink && (
          <div className="flex gap-2 items-center">
            <Input
              value={generatedLink}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              onClick={handleViewInvoice}
            >
              View Invoice
            </Button>
          </div>
        )}

        <AgentSummaryCards filteredEntries={entries} />
        
        <div className="overflow-x-auto">
          <AgentAttendanceTable entries={entries} />
        </div>
      </CardContent>
    </Card>
  );
}