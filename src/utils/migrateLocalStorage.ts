import { supabase } from "@/integrations/supabase/client";

export async function migrateLocalStorageToSupabase() {
  try {
    // Migrate attendance entries
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      for (const entry of entries) {
        const formattedDate = new Date(entry.date).toISOString().split('T')[0];
        await supabase
          .from('time_entries')
          .insert({
            date: formattedDate,
            agent_name: entry.agentName,
            time_in: entry.timeIn,
            time_out: entry.timeOut,
            total_working_hours: entry.totalHours,
            hourly_rate: entry.hourlyRate,
            shift_type: entry.shiftType,
            ot_pay: entry.otPay,
            daily_earnings: entry.dailyEarnings
          });
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('attendanceEntries');
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}