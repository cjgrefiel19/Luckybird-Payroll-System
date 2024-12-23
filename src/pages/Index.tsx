import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/TeamSchedule";
import { DailyAttendance } from "@/components/DailyAttendance";

const Index = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Payroll Tracker</h1>
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Team Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <TeamSchedule />
        </TabsContent>
        <TabsContent value="attendance">
          <DailyAttendance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;