import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { AgentAttendanceTable } from "./agent-invoice/AgentAttendanceTable";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { AgentSummaryCards } from "./agent-invoice/AgentSummaryCards";
import { InvoiceHeader } from "./agent-invoice/InvoiceHeader";
import { InvoiceActions } from "./agent-invoice/InvoiceActions";
import { decodeShareableLink } from "@/utils/shareLinks";
import html2pdf from 'html2pdf.js';
import { supabase } from "@/integrations/supabase/client";

export function SharedAgentHours() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      if (!agentId) {
        navigate('/');
        return;
      }

      try {
        // Get user role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          setUserRole(profile?.role || null);
        }

        const decodedData = decodeShareableLink(agentId);
        if (!decodedData) {
          toast({
            title: "Error",
            description: "Invalid link format",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        const { agentName, startDate, endDate } = decodedData;

        // Verify access rights
        if (userRole !== 'admin') {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user?.id)
            .single();

          if (userProfile?.full_name !== agentName) {
            toast({
              title: "Access Denied",
              description: "You can only view your own records",
              variant: "destructive",
            });
            navigate('/');
            return;
          }
        }

        // Fetch time entries
        const { data: timeEntries, error: entriesError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('agent_name', agentName)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);

        if (entriesError) throw entriesError;

        const transformedEntries = timeEntries.map(entry => ({
          date: new Date(entry.date),
          agentName: entry.agent_name,
          timeIn: entry.time_in,
          timeOut: entry.time_out,
          totalHours: entry.total_working_hours,
          hourlyRate: entry.hourly_rate,
          shiftType: entry.shift_type,
          otRate: 0,
          otPay: entry.ot_pay,
          dailyEarnings: entry.daily_earnings,
        }));

        setEntries(transformedEntries);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [agentId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6 space-y-6" id="invoice-content">
          <InvoiceHeader logo="/lovable-uploads/721bca4a-5642-4aa3-b371-870b16bf31fb.png" />
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{entries[0]?.agentName}</h2>
              {entries.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Pay Period: {format(entries[0].date, "PPP")} - {format(entries[entries.length - 1].date, "PPP")}
                </p>
              )}
            </div>
          </div>

          <AgentSummaryCards filteredEntries={entries} />
          
          <div className="overflow-x-auto">
            <AgentAttendanceTable entries={entries} />
          </div>
        </CardContent>
      </Card>

      <InvoiceActions
        onAccept={() => {
          toast({
            title: "Success",
            description: "Time entries accepted successfully",
          });
        }}
        onDownload={() => {
          const element = document.getElementById('invoice-content');
          if (!element) return;

          const opt = {
            margin: 1,
            filename: `timesheet-${entries[0]?.agentName}-${format(new Date(), "yyyy-MM-dd")}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          html2pdf().set(opt).from(element).save();
          
          toast({
            title: "Success",
            description: "PDF downloaded successfully",
          });
        }}
        accepted={false}
      />
    </div>
  );
}