interface InvoiceHeaderProps {
  logo: string;
}

export function InvoiceHeader({ logo }: InvoiceHeaderProps) {
  return (
    <div 
      className="flex items-start justify-between border-b pb-6 w-full" 
      style={{ 
        backgroundColor: 'rgba(135, 206, 235, 0.4)',
        margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
        padding: '1.5rem'
      }}
    >
      <div className="flex flex-col items-start">
        <img 
          src={logo}
          alt="LuckyBird Logo" 
          className="h-24 w-24 object-contain mb-4 mix-blend-multiply"
        />
        <h1 className="text-2xl font-bold">LuckyBird</h1>
        <div className="text-muted-foreground mt-2">
          <p>732 N. Madelia St.</p>
          <p>Spokane, WA 99202</p>
          <p>+1 (509) 508-2229</p>
        </div>
      </div>
    </div>
  );
}