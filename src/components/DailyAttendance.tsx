import { useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceHeader } from "./attendance/AttendanceHeader";
import { useAttendanceState } from "./attendance/AttendanceState";
import { useAttendanceActions } from "./attendance/AttendanceActions";
import { supabase } from "@/integrations/supabase/client";
import { isWithinInterval } from "date-fns";
import { useToast } from "./ui/use-toast";

export function DailyAttendance() {
  const {
    entries,
    setEntries,
    editingEntry,
    setEditingEntry,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedAgent,
    setSelectedAgent,
    directoryData,
    payPeriods,
    setPayPeriods,
    selectedPayPeriod,
    setSelectedPayPeriod,
  } = useAttendanceState();

  const { handleSavePayPeriod, handleDeletePayPeriod, handleExport } = useAttendanceActions();
  const { toast } = useToast();

  // Fetch entries from Supabase
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        const transformedEntries = data.map(entry => ({
          date: new Date(entry.date),
          agentName: entry.agent_name,
          timeIn: entry.time_in,
          timeOut: entry.time_out,
          totalHours: entry.total_working_hours,
          hourlyRate: entry.hourly_rate,
          shiftType: entry.shift_type as any,
          otRate: 0,
          otPay: entry.ot_pay,
          dailyEarnings: entry.daily_earnings,
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
  }, []);

  const handleSubmit = async (entry: any) => {
    if (editingEntry) {
      try {
        const { error } = await supabase
          .from('time_entries')
          .update({
            time_in: entry.timeIn,
            time_out: entry.timeOut,
            total_working_hours: entry.totalHours,
            shift_type: entry.shiftType,
            ot_pay: entry.otPay,
            daily_earnings: entry.dailyEarnings,
          })
          .eq('date', entry.date.toISOString().split('T')[0])
          .eq('agent_name', entry.agentName);

        if (error) throw error;

        setEntries((prev) =>
          prev.map((e) => (e === editingEntry ? entry : e))
        );
        setEditingEntry(null);
        toast({
          title: "Entry Updated",
          description: `Attendance entry for ${entry.agentName} has been updated successfully.`,
        });
      } catch (error) {
        console.error('Error updating entry:', error);
        toast({
          title: "Error",
          description: "Failed to update attendance entry",
          variant: "destructive",
        });
      }
    } else {
      setEntries((prev) => [entry, ...prev]);
      toast({
        title: "Entry Added",
        description: `Attendance entry for ${entry.agentName} has been added successfully.`,
      });
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
  };

  const handleDelete = async (entry: any) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('date', entry.date.toISOString().split('T')[0])
        .eq('agent_name', entry.agentName);

      if (error) throw error;

      setEntries((prev) => prev.filter((e) => e !== entry));
      toast({
        title: "Entry Deleted",
        description: `Attendance entry for ${entry.agentName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete attendance entry",
        variant: "destructive",
      });
    }
  };

  const filteredEntries = entries.filter((entry) => {
    let matchesDateRange = true;
    let matchesAgent = true;

    if (startDate && endDate) {
      matchesDateRange = isWithinInterval(new Date(entry.date), {
        start: startDate,
        end: endDate,
      });
    }

    if (selectedAgent !== "all") {
      matchesAgent = entry.agentName === selectedAgent;
    }

    return matchesDateRange && matchesAgent;
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Daily Attendance</h2>
      
      <AttendanceHeader
        startDate={startDate}
        endDate={endDate}
        selectedAgent={selectedAgent}
        payPeriods={payPeriods}
        selectedPayPeriod={selectedPayPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onAgentChange={setSelectedAgent}
        onPayPeriodSelect={setSelectedPayPeriod}
        onSavePayPeriod={(name) => handleSavePayPeriod(name, startDate, endDate, setPayPeriods)}
        onDeletePayPeriod={(id) => handleDeletePayPeriod(id, setPayPeriods, selectedPayPeriod, setSelectedPayPeriod, setStartDate, setEndDate)}
        onExport={handleExport}
        directoryData={directoryData}
        entries={entries}
      />

      <div id="attendance-content">
        <AttendanceForm onSubmit={handleSubmit} editingEntry={editingEntry} />
        <AttendanceTable 
          entries={filteredEntries} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  );
}