import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

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

        <LogoutButton />
      </div>

      {/* Checkered border bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-3 bg-checkered" />
    </div>
  );
}
