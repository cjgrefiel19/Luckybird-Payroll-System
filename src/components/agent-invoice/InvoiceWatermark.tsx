interface InvoiceWatermarkProps {
  show: boolean;
}

export function InvoiceWatermark({ show }: InvoiceWatermarkProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
      <div className="transform rotate-[-35deg] text-red-500/20 text-[80vw] font-black whitespace-nowrap select-none">
        PAID
      </div>
    </div>
  );
}