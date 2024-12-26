import { useState, useEffect } from "react";
import { AttendanceEntry, DirectoryEntry, PayPeriod } from "@/lib/types";
import { TEAM_MEMBERS } from "@/lib/constants";

export function useAttendanceState() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<AttendanceEntry | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);

  // Load directory data and team members
  useEffect(() => {
    const savedDirectory = localStorage.getItem('directoryData');
    if (savedDirectory) {
      const parsedDirectory = JSON.parse(savedDirectory);
      setDirectoryData(parsedDirectory);
    }

    // Add team members to directory if they don't exist
    const teamMemberNames = TEAM_MEMBERS.map(member => ({
      name: member.name,
      position: member.position || 'Agent'
    }));
    setDirectoryData(prevData => {
      const existingNames = new Set(prevData.map(d => d.name));
      const newMembers = teamMemberNames.filter(member => !existingNames.has(member.name));
      return [...prevData, ...newMembers];
    });
  }, []);

  // Load pay periods from localStorage
  useEffect(() => {
    const savedPayPeriods = localStorage.getItem('payPeriods');
    if (savedPayPeriods) {
      try {
        const parsed = JSON.parse(savedPayPeriods).map((period: any) => ({
          ...period,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
        }));
        setPayPeriods(parsed);
        
        // If there's no selected period but we have pay periods, select the last one
        if (!selectedPayPeriod && parsed.length > 0) {
          const lastPeriod = parsed[parsed.length - 1];
          setSelectedPayPeriod(lastPeriod.id);
          setStartDate(lastPeriod.startDate);
          setEndDate(lastPeriod.endDate);
        }
      } catch (error) {
        console.error('Error parsing pay periods:', error);
      }
    }
  }, []);

  return {
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
    setDirectoryData,
    payPeriods,
    setPayPeriods,
    selectedPayPeriod,
    setSelectedPayPeriod,
  };
}