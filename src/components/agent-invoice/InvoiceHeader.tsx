import { format } from "date-fns";

interface InvoiceHeaderProps {
  agentName: string;
  startDate: Date;
  endDate: Date;
  position?: string;
  logo?: string;
}

export function InvoiceHeader({ agentName, startDate, endDate, position, logo }: InvoiceHeaderProps) {
  return (
    <div 
      className="absolute top-0 w-screen bg-[#B3E5FC]/40" 
      style={{ 
        left: '50%',
        right: '50%',
        transform: 'translateX(-50%)',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        paddingBottom: '2rem'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-primary">
          Payroll Invoice - {agentName}
        </h1>
        
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            <img 
              src={logo || "/lovable-uploads/91427171-914b-45a1-bfb1-e79ea0029866.png"}
              alt="LuckyBird Logo"
              className="w-24 h-24 object-contain mix-blend-multiply"
            />
            <div>
              <h1 className="text-3xl font-bold text-primary">LuckyBird</h1>
              <address className="not-italic text-muted-foreground mt-2">
                732 N. Madelia St.<br />
                Spokane, WA 99202<br />
                +1 (509) 508-2229
              </address>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-semibold mb-2">Pay Period:</h2>
            <p className="text-muted-foreground">
              {format(startDate, "PP")} - {format(endDate, "PP")}
            </p>
            {position && (
              <div className="mt-4 text-muted-foreground">
                {position}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}