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
      <div className="bg-[#B0BEC5] p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-black text-center">
          {totalHours.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Total Hours</p>
      </div>
      <div className="bg-[#90A4AE] p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-black text-center">
          {totalOTHours.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Total OT Hours</p>
      </div>
      <div className="bg-[#78909C] p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-black text-center">
          {holidayHours.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Holiday Hours</p>
      </div>
      <div className="bg-[#607D8B] p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-black text-center">
          {leaveDays}
        </div>
        <p className="text-sm text-black text-center">Leave Days</p>
      </div>
      <div className="bg-[#546E7A] p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-black text-center">
          ${totalEarnings.toFixed(2)}
        </div>
        <p className="text-sm text-black text-center">Total Earnings</p>
      </div>
    </div>
  );
}