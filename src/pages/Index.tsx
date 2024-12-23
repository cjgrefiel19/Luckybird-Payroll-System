import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/TeamSchedule";
import { DailyAttendance } from "@/components/DailyAttendance";
import { Dashboard } from "@/components/Dashboard";
import { PayrollRecords } from "@/components/PayrollRecords";
import { Invoice } from "@/components/Invoice";
import { useParams } from "react-router-dom";

const Index = () => {
  const { recordId } = useParams();

  if (recordId) {
    const savedRecords = localStorage.getItem('payrollRecords');
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const record = records.find((r: any) => r.id === recordId);
      if (record) {
        return (
          <Invoice
            startDate={new Date(record.payPeriod.startDate)}
            endDate={new Date(record.payPeriod.endDate)}
            recordId={recordId}
          />
        );
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Payroll Tracker</h1>
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Team Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Index;