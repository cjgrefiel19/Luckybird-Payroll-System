import { Card } from "../ui/card";

interface SummaryCardsProps {
  totalHours: number;
  totalOTHours: number;
  holidayHours: number;
  leaveDays: number;
  totalEarnings: number;
}

export function SummaryCards({
  totalHours,
  totalOTHours,
  holidayHours,
  leaveDays,
  totalEarnings
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-[#8E9196] p-4 rounded-lg">
        <div className="text-2xl font-bold text-black text-center">
          {totalHours.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Total Hours</p>
      </div>
      <div className="bg-[#8A898C] p-4 rounded-lg">
        <div className="text-2xl font-bold text-black text-center">
          {totalOTHours.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Total OT Hours</p>
      </div>
      <div className="bg-[#999999] p-4 rounded-lg">
        <div className="text-2xl font-bold text-black text-center">
          {holidayHours.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Holiday Hours</p>
      </div>
      <div className="bg-[#8E9196] p-4 rounded-lg">
        <div className="text-2xl font-bold text-black text-center">
          {leaveDays}
        </div>
        <p className="text-sm text-black text-center">Leave Days</p>
      </div>
      <div className="bg-[#8A898C] p-4 rounded-lg">
        <div className="text-2xl font-bold text-black text-center">
          ${totalEarnings.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Total Earnings</p>
      </div>
    </div>
  );
}