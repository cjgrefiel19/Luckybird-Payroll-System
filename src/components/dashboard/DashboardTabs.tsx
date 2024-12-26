import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardTabs() {
  return (
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
  );
}