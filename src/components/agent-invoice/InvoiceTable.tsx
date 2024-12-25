import { format } from "date-fns";
import { AttendanceEntry } from "@/lib/types";
import { calculateDailyEarnings } from "@/utils/invoiceCalculations";

interface InvoiceTableProps {
  entries: AttendanceEntry[];
}

export function InvoiceTable({ entries }: InvoiceTableProps) {
  // Array of pastel colors for alternating rows
  const rowColors = [
    'bg-[#F2FCE2]', // Soft Green
    'bg-[#FEF7CD]', // Soft Yellow
    'bg-[#FEC6A1]', // Soft Orange
    'bg-[#E5DEFF]', // Soft Purple
    'bg-[#FFDEE2]', // Soft Pink
    'bg-[#FDE1D3]', // Soft Peach
    'bg-[#D3E4FD]', // Soft Blue
  ];

  return (
    <div className="mt-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
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
              className={`${rowColors[index % rowColors.length]} hover:bg-gray-50/50 transition-colors`}
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