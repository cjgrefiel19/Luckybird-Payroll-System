import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { AgentSummaryCards } from "./agent-invoice/AgentSummaryCards";
import { InvoiceHeader } from "./agent-invoice/InvoiceHeader";
import { InvoiceActions } from "./agent-invoice/InvoiceActions";
import html2pdf from 'html2pdf.js';
import { supabase } from "@/integrations/supabase/client";

export function SharedAgentHours() {
  const { agentId } = useParams();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [agentName, setAgentName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!agentId) return;

    const loadData = async () => {
      try {
        // Decode agent info from ID
        const [name, start, end] = atob(agentId).split('|');
        setAgentName(name);
        setStartDate(new Date(start));
        setEndDate(new Date(end));

        // Fetch time entries from Supabase
        const { data: timeEntries, error: entriesError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('agent_name', name)
          .gte('date', start)
          .lte('date', end);

        if (entriesError) throw entriesError;

        // Transform the data to match AttendanceEntry type
        const transformedEntries = timeEntries.map(entry => ({
          ...entry,
          date: new Date(entry.date),
        }));

        setEntries(transformedEntries);

        // Check acceptance status
        const { data: acceptanceData, error: acceptanceError } = await supabase
          .from('invoice_acceptance')
          .select('*')
          .eq('agent_name', name)
          .single();

        if (acceptanceError && acceptanceError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is fine
          throw acceptanceError;
        }

        setAccepted(!!acceptanceData?.accepted_at);

      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [agentId, toast]);

  const handleAccept = async () => {
    if (!agentId || !agentName) return;
    
    try {
      const { error } = await supabase
        .from('invoice_acceptance')
        .upsert({
          agent_name: agentName,
          accepted_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setAccepted(true);
      toast({
        title: "Invoice Accepted",
        description: "You have successfully accepted this invoice.",
      });
    } catch (error) {
      console.error('Error accepting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to accept invoice",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `invoice-${agentName}-${format(startDate!, "yyyy-MM-dd")}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    
    toast({
      title: "Success",
      description: "Invoice downloaded successfully",
    });
  };

  if (!agentId || !startDate || !endDate) {
    return <div>Invalid link</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6 space-y-6" id="invoice-content">
          <InvoiceHeader logo="/lovable-uploads/721bca4a-5642-4aa3-b371-870b16bf31fb.png" />
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{agentName}</h2>
              <p className="text-sm text-muted-foreground">
                Pay Period: {format(startDate, "PPP")} - {format(endDate, "PPP")}
              </p>
            </div>
            {accepted && (
              <span className="text-green-500 font-semibold">Invoice Accepted</span>
            )}
          </div>

          <AgentSummaryCards filteredEntries={entries} />
          
          <div className="overflow-x-auto">
            <AgentAttendanceTable entries={entries} />
          </div>
        </CardContent>
      </Card>

      <InvoiceActions
        onAccept={handleAccept}
        onDownload={handleDownloadPDF}
        accepted={accepted}
      />
    </div>
  );
}