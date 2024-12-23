import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/TeamSchedule";
import { DailyAttendance } from "@/components/DailyAttendance";
import { Dashboard } from "@/components/Dashboard";
import { PayrollRecords } from "@/components/PayrollRecords";
import { Directory } from "@/components/Directory";
import { AgentInvoice } from "@/components/AgentInvoice";

const Index = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-start mb-8 gap-4">
        <div className="flex items-start gap-4">
          <img 
            src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png" 
            alt="LuckyBird Logo" 
            className="w-16 h-16 object-contain"
          />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-primary">LuckyBird's Payroll</h1>
            <address className="not-italic text-muted-foreground">
              732 N. Madelia St.<br />
              Spokane, WA 99202<br />
              +1 (509) 508-9440
            </address>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="schedule">Team Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="agent-invoice">Agent Invoice</TabsTrigger>
        </TabsList>
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
        <TabsContent value="directory">
          <Directory />
        </TabsContent>
        <TabsContent value="agent-invoice">
          <AgentInvoice />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;