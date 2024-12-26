import { TabsContent } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/TeamSchedule";
import { DailyAttendance } from "@/components/DailyAttendance";
import { Dashboard } from "@/components/Dashboard";
import { PayrollRecords } from "@/components/PayrollRecords";
import { AgentInvoice } from "@/components/AgentInvoice";

export function DashboardContent() {
  return (
    <div className="container mx-auto py-6 flex-1">
      <TabsContent value="schedule">
        <TeamSchedule />
      </TabsContent>
      <TabsContent value="attendance">
        <DailyAttendance />
      </TabsContent>
      <TabsContent value="dashboard">
        <Dashboard />
      </TabsContent>
      <TabsContent value="records">
        <PayrollRecords />
      </TabsContent>
      <TabsContent value="agent-invoice">
        <AgentInvoice />
      </TabsContent>
    </div>
  );
}