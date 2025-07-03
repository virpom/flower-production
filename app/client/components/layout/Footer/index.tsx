import Image from "next/image";

export default function Footer({ settings }) {
    const { address, contactPhone, workingHours } = settings || {};
    const phoneLink = contactPhone ? `tel:${contactPhone.replace(/\D/g, '')}` : null;

    return (
        <footer className="bg-[#F0D2D2] grid justify-center py-10 items-center">
            <div className="">
                <div className=" flex justify-center gap-x-2 items-center mb-8">
                    <Image src="/image/logo.svg" alt="logo" width={40} height={40} />
                    <h1 className="text-[30px] font-bold">Floramix</h1>
                </div>
                <div className="grid grid-cols-1 grid-rows-3 items-center gap-y-4 text-center">
                    {address && <h3 className="">Адрес: {address}</h3>}
                    {contactPhone && <h3 className=""><a href={phoneLink} className="hover:underline">Телефон: {contactPhone}</a></h3>}
                    {workingHours && <h3 className="">Время работы: {workingHours}</h3>}
                </div>
            </div>
        </footer>
    )
}
