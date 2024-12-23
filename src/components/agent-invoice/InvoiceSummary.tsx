interface InvoiceSummaryProps {
  totalHours: number;
}

export function InvoiceSummary({ totalHours }: InvoiceSummaryProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Summary</h3>
      <p>Total Working Hours: {totalHours.toFixed(2)}</p>
    </div>
  );
}