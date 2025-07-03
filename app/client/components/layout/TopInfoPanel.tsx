export default function TopInfoPanel({ settings }) {
  const { contactPhone, workingHours } = settings || {};
  const phoneLink = contactPhone ? `tel:${contactPhone.replace(/\D/g, '')}` : null;

  return (
    <div className="fixed left-0 right-0 z-20 bg-[#FFE1E1] text-center py-1 text-[15px] font-medium border-b border-[#FFD6D6] top-14 sm:top-[112px]">
      {contactPhone && <a href={phoneLink} className="hover:underline">{contactPhone}</a>}
      {contactPhone && workingHours && <>&nbsp;|&nbsp;</>}
      {workingHours && <span>{workingHours}</span>}
    </div>
  );
} 