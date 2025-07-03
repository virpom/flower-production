"use client";
import dynamic from "next/dynamic";
import Header from "../layout/Header";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const HeaderMobile = dynamic(() => import("../layout/Header/HeaderMobile"), { ssr: false });

export default function HeaderSwitcher() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {isMobile ? <HeaderMobile /> : <Header />}
    </div>
  );
} 