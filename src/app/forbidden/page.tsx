import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-5 py-14 text-zinc-950 dark:text-zinc-100 sm:px-8">
      <div className="w-full border border-stone-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
          403 / Access control
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
          Access not available
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your account does not have permission to open this page or complete
          this action. Contact an administrator if you believe this is an error.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="border border-zinc-950 bg-zinc-950 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-zinc-800 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
          >
            Return home
          </Link>
          <Link
            href="/login"
            className="border border-stone-300 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-700 hover:border-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
          >
            Switch account
          </Link>
        </div>
      </div>
    </section>
  );
}
