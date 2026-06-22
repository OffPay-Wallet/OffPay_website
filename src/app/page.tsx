import Hero from "@/components/sections/Hero";
import { getWaitlistCount } from "@/lib/waitlist-count";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const waitlistCount = await getWaitlistCount();

  return (
    <main>
      <Hero initialWaitlistCount={waitlistCount} />
    </main>
  );
}
