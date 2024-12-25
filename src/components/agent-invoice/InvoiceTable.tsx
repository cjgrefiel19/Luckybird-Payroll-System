import { format } from "date-fns";
import { AttendanceEntry } from "@/lib/types";
import { calculateDailyEarnings } from "@/utils/invoiceCalculations";

interface InvoiceTableProps {
  entries: AttendanceEntry[];
}

export function InvoiceTable({ entries }: InvoiceTableProps) {
  return (
    <div className="mt-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f2f2f2]">
            <th className="p-3 text-left border-b">Date</th>
            <th className="p-3 text-left border-b">Time In</th>
            <th className="p-3 text-left border-b">Time Out</th>
            <th className="p-3 text-left border-b">Total Hours</th>
            <th className="p-3 text-left border-b">Shift Type</th>
            <th className="p-3 text-right border-b">Hourly Rate</th>
            <th className="p-3 text-right border-b">Daily Earnings</th>
          </tr>
        </thead>
        <tbody>
          {entries?.map((entry, index) => (
            <tr 
              key={index}
              className="bg-[rgba(211,211,211,0.1)] border-b hover:bg-gray-50"
            >
              <td className="p-3">{format(new Date(entry.date), "PP")}</td>
              <td className="p-3">{entry.timeIn}</td>
              <td className="p-3">{entry.timeOut}</td>
              <td className="p-3">{entry.totalHours.toFixed(2)}</td>
              <td className="p-3">{entry.shiftType}</td>
              <td className="p-3 text-right">${entry.hourlyRate.toFixed(2)}</td>
              <td className="p-3 text-right">
                ${calculateDailyEarnings(
                  entry.hourlyRate,
                  entry.totalHours,
                  entry.shiftType
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}