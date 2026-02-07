import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("crew-authenticated");

  if (!auth || auth.value !== "true") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0d0d0d] px-4 font-mono text-white">
      {/* Checkered border top */}
      <div className="fixed top-0 left-0 right-0 h-3 bg-checkered" />

      <div className="flex flex-col items-center gap-6">
        {/* Checkered flag icon */}
        <div className="grid grid-cols-4 grid-rows-4 w-24 h-24">
          {Array.from({ length: 16 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const isBlack = (row + col) % 2 === 0;
            return (
              <div
                key={i}
                className={isBlack ? "bg-white" : "bg-neutral-800"}
              />
            );
          })}
        </div>

        <h1 className="text-5xl font-bold tracking-widest uppercase text-emerald-400">
          You&apos;re in.
        </h1>

        <p className="text-neutral-500 text-lg">
          The whole crew came through.
        </p>

        <div className="max-w-lg text-left text-white text-base leading-relaxed mt-4">
          <p className="mb-4">Crew,</p>
          <p className="mb-4">
            I knew you could work together to make it happen. You&apos;re probably a better crew than Andretti had back in &apos;69 when he was the last one to achieve what we were after.
          </p>
          <p className="mb-4">
            One more lock to keep the coppers off our track. Of those famous 5 we admire the one who was closest to perfect. Shame Mario wasn&apos;t car 5.
          </p>
          <p className="mb-4">
            The year of the winner we admire most will get you the plug. Stash it if you can. We need to reverse engineer this thing.
          </p>
          <p className="mb-4">Your Leader,</p>
          <p>Driver Eight</p>
        </div>
      </div>

      {/* Checkered border bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-3 bg-checkered" />
    </div>
  );
}
