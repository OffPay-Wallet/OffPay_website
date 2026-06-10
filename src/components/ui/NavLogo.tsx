import Link from "next/link";

export default function NavLogo() {
  return (
    <Link 
      href="/" 
      aria-label="Go to Homepage" 
      className="z-[55] flex flex-shrink-0 items-center opacity-100 pointer-events-auto transition-opacity duration-300 hover:opacity-80"
    >
      {/* Brand text applied with Migra bold font styling. 
          A small negative translate is used to optically center the serif font 
          which naturally sits a bit low in its bounding box. */}
      <span 
        style={{ fontFamily: "var(--font-migra), serif" }} 
        className="text-[32px] font-bold leading-none tracking-[-0.03em] text-white -translate-y-[2px]"
      >
        OffPay
      </span>
    </Link>
  );
}
