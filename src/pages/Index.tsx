import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/TeamSchedule";
import { DailyAttendance } from "@/components/DailyAttendance";
import { Dashboard } from "@/components/Dashboard";
import { PayrollRecords } from "@/components/PayrollRecords";
import { Directory } from "@/components/Directory";

const Index = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Payroll Tracker</h1>
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Team Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Index;