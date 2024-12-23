import { format } from "date-fns";

interface InvoiceAgentDetailsProps {
  agentName: string;
  position: string;
  payPeriod: { start: Date; end: Date } | null;
}

export function InvoiceAgentDetails({ agentName, position, payPeriod }: InvoiceAgentDetailsProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{agentName}</h2>
      <p className="text-lg text-muted-foreground">{position}</p>
      {payPeriod && (
        <p className="text-sm text-muted-foreground">
          Pay Period: {format(payPeriod.start, "PPP")} - {format(payPeriod.end, "PPP")}
        </p>
      )}
    </div>
  );
}