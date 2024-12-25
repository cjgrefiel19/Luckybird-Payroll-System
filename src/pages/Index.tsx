import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/TeamSchedule";
import { DailyAttendance } from "@/components/DailyAttendance";
import { Dashboard } from "@/components/Dashboard";
import { PayrollRecords } from "@/components/PayrollRecords";
import { AgentInvoice } from "@/components/AgentInvoice";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 bg-background z-50 border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-start mb-8 gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png" 
                alt="LuckyBird Logo" 
                className="w-24 h-24 object-contain self-center"
              />
              <div className="text-left flex flex-col justify-center h-24">
                <h1 className="text-2xl font-bold text-primary">LuckyBird</h1>
                <address className="not-italic text-muted-foreground">
                  732 N. Madelia St.<br />
                  Spokane, WA 99202<br />
                  +1 (509) 508-2229
                </address>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="dashboard">
            <TabsList className="flex flex-wrap gap-2 w-full justify-start p-0">
              <TabsTrigger 
                value="dashboard" 
                className="text-xl font-bold px-6 py-3 bg-[#8B5CF6] text-black hover:bg-[#7C3AED] transition-colors duration-300 data-[state=active]:bg-[#8B5CF6] flex-1"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="text-xl font-bold px-6 py-3 bg-[#F97316] text-black hover:bg-[#EA580C] transition-colors duration-300 data-[state=active]:bg-[#F97316] flex-1"
              >
                Team Schedule
              </TabsTrigger>
              <TabsTrigger 
                value="attendance" 
                className="text-xl font-bold px-6 py-3 bg-[#22C55E] text-black hover:bg-[#16A34A] transition-colors duration-300 data-[state=active]:bg-[#22C55E] flex-1"
              >
                Daily Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="records" 
                className="text-xl font-bold px-6 py-3 bg-[#8E9196] text-black hover:bg-[#7A7D82] transition-colors duration-300 data-[state=active]:bg-[#8E9196] flex-1"
              >
                Payroll Records
              </TabsTrigger>
              <TabsTrigger 
                value="agent-invoice" 
                className="text-xl font-bold px-6 py-3 bg-[#0EA5E9] text-black hover:bg-[#0284C7] transition-colors duration-300 data-[state=active]:bg-[#0EA5E9] flex-1"
              >
                Agent Invoice
              </TabsTrigger>
            </TabsList>

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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;