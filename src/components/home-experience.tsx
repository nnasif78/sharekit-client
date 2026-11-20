"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Drill,
  Moon,
  Search,
  Sun,
  Truck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { reportError } from "@/lib/notifications";

type Equipment = {
  _id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  rentalType: string;
  image: string;
  condition?: string;
  description?: string;
};

type ThemeMode = "light" | "dark";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = [
  {
    title: "Tools & DIY",
    subtitle: "Rotary hammers, saws, pressure washers",
    icon: Wrench,
    query: "Tools",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Photography",
    subtitle: "Cinema rigs, prime glass, field monitors",
    icon: Camera,
    query: "Photography Equipment",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Construction",
    subtitle: "Site breakers, levels, heavy fasteners",
    icon: Drill,
    query: "Construction Equipment",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Transport",
    subtitle: "Cargo vans, roof racks, haulers",
    icon: Truck,
    query: "Vehicles & Transportation",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  },
];

const reviews = [
  {
    quote:
      "Picked up a rotary hammer two blocks away for a Saturday renovation. Saved me thousands on a tool I only needed for forty-eight hours.",
    name: "Maya R.",
    detail: "Rented Rotary Hammer · Gulshan",
  },
  {
    quote:
      "My camera kit covered its own maintenance in two weekend shoots. Hand-offs are clear and renters treat the optics like their own.",
    name: "Ethan L.",
    detail: "Listed Cinema Kit · Dhanmondi",
  },
  {
    quote:
      "Clean, calibrated gear ready right on schedule. It feels less like a rental counter and more like borrowing from a careful colleague.",
    name: "Samira K.",
    detail: "Rented Mirrorless Kit · Banani",
  },
];

const steps = [
  {
    num: "01",
    title: "Search local inventory",
    description:
      "Filter verified gear by neighborhood, specs, and daily or weekly rates.",
  },
  {
    num: "02",
    title: "Reserve your window",
    description:
      "Lock in your dates, coordinate directly with the owner, and check out cleanly.",
  },
  {
    num: "03",
    title: "Inspect, build, return",
    description:
      "Check the equipment together at handoff, finish the job, and return it on time.",
  },
];

const benefits = [
  {
    num: "01",
    title: "Rent for the job",
    description:
      "Book by the day or week instead of buying equipment you only need occasionally.",
  },
  {
    num: "02",
    title: "Pick up nearby",
    description:
      "Browse gear around Dhaka and coordinate a straightforward handoff with its owner.",
  },
  {
    num: "03",
    title: "Keep equipment in use",
    description:
      "List gear that is sitting idle and make it available to people working nearby.",
  },
];

function getEquipmentHref(name: string) {
  const slug =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "equipment";

  return `/equipment/${encodeURIComponent(slug)}`;
}

function EquipmentCard({
  item,
  dark,
}: {
  item: Equipment;
  dark: boolean;
}) {
  const details = item.description
    ?.replace(`${item.name}.`, "")
    .trim()
    .split(".")[0]
    .trim();
  const equipmentHref = getEquipmentHref(item.name);

  return (
    <article
      className={`group flex flex-col justify-between border transition-colors duration-300 ${
        dark
          ? "border-zinc-800 bg-zinc-900/70 hover:border-zinc-500"
          : "border-stone-200 bg-white hover:border-zinc-950"
      }`}
    >
      <div>
        <Link
          href={equipmentHref}
          aria-label={`View ${item.name}`}
          className={`relative block aspect-[4/3] w-full overflow-hidden ${
            dark ? "bg-zinc-950" : "bg-stone-100"
          }`}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={640}
              height={480}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src="/images/hero-gear.jpg"
              alt={item.name}
              width={640}
              height={480}
              unoptimized
              className="h-full w-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span
              className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${
                dark
                  ? "border-zinc-700 bg-zinc-950/90 text-zinc-200"
                  : "border-stone-200/90 bg-white/95 text-zinc-900"
              }`}
            >
              Verified
            </span>
            {item.condition && (
              <span
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${
                  dark
                    ? "border-amber-300/40 bg-zinc-950/90 text-amber-200"
                    : "border-stone-200/90 bg-white/95 text-zinc-800"
                }`}
              >
                {item.condition}
              </span>
            )}
          </div>
        </Link>

        <div className="p-5">
          <div
            className={`mb-2 flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider ${
              dark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            <span className="truncate">{item.category}</span>
            <span className="shrink-0">{item.location}</span>
          </div>

          <Link
            href={equipmentHref}
            className={`line-clamp-1 text-lg font-medium tracking-tight transition-colors ${
              dark
                ? "text-zinc-100 group-hover:text-amber-300"
                : "text-zinc-950 group-hover:text-zinc-600"
            }`}
          >
            {item.name}
          </Link>
          {details && (
            <p
              className={`mt-2 line-clamp-2 text-sm leading-relaxed ${
                dark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              {details}
            </p>
          )}
        </div>
      </div>

      <div
        className={`flex items-center justify-between border-t px-5 py-3.5 ${
          dark
            ? "border-zinc-800 bg-zinc-950/60"
            : "border-stone-100 bg-[#F7F6F2]/70"
        }`}
      >
        <div className="flex items-baseline gap-1">
          <span
            className={`font-mono text-sm font-medium tracking-tight ${
              dark ? "text-white" : "text-zinc-950"
            }`}
          >
            ৳{item.price.toLocaleString()}
          </span>
          <span
            className={`font-mono text-[10px] uppercase tracking-wider ${dark ? "text-zinc-400" : "text-zinc-500"}`}
          >
            / {item.rentalType}
          </span>
        </div>
        <Link
          href={equipmentHref}
          aria-label={`Rent ${item.name}`}
          className={`inline-flex h-8 w-8 items-center justify-center border transition-colors ${
            dark
              ? "border-zinc-700 text-zinc-200 hover:border-amber-300 hover:bg-amber-300 hover:text-zinc-950"
              : "border-stone-200 text-zinc-900 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          }`}
        >
          <ArrowUpRight size={18} strokeWidth={1.75} />
        </Link>
      </div>
    </article>
  );
}

export default function HomeExperience() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentError, setEquipmentError] = useState("");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Initialize theme from localStorage or system preference and sync <html> class
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem("sharekit-theme") as ThemeMode | null)
        : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial: ThemeMode =
      saved === "light" || saved === "dark"
        ? saved
        : prefersDark
          ? "dark"
          : "light";

    // Theme preferences are browser-only and must be reconciled after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncs the rendered theme with persisted preferences.
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
    };
    window.addEventListener("sharekit-theme-change", syncTheme);
    return () => window.removeEventListener("sharekit-theme-change", syncTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem("sharekit-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/equipment?page=1&pageSize=6`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load featured equipment.");
        }
        return result.data as Equipment[];
      })
      .then((items) => {
        if (active) setEquipment(items);
      })
      .catch((error: unknown) => {
        if (active) {
          setEquipmentError(reportError(error, "Could not load featured equipment."));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/equipment?search=${encodeURIComponent(search.trim())}`);
  };

  const dark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-zinc-950 text-zinc-100 selection:bg-amber-300 selection:text-zinc-950"
          : "bg-[#F7F6F2] text-zinc-950 selection:bg-zinc-950 selection:text-white"
      }`}
    >

      {/* HERO WITH PHOTOGRAPHIC SHOWCASE */}
      <section
        className={`border-b ${
          dark ? "border-zinc-800/90" : "border-stone-200/90"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="lg:col-span-6"
            >
              <p
                className={`mb-5 font-mono text-xs uppercase tracking-[0.18em] ${
                  dark ? "text-amber-300/90" : "text-zinc-500"
                }`}
              >
                Local equipment for work, travel, and creative projects
              </p>
              <h1 className="text-4xl font-medium leading-[1.03] tracking-[-0.035em] sm:text-5xl xl:text-6xl">
                Rent the right gear.
                <br />
                <span className={dark ? "text-zinc-500" : "text-zinc-400"}>
                  Skip the purchase.
                </span>
              </h1>
              <p
                className={`mt-5 max-w-lg text-base leading-relaxed ${
                  dark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Book tools, cameras, and transport from verified owners nearby.
                Pick it up, finish the job, and return it.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={submitSearch}
                className={`mt-8 flex flex-col border sm:flex-row ${
                  dark
                    ? "border-zinc-700 bg-zinc-900"
                    : "border-zinc-950 bg-white"
                }`}
              >
                <label htmlFor="home-search" className="sr-only">
                  What are you looking for?
                </label>
                <div className="flex flex-1 items-center px-4 py-3.5">
                  <Search
                    size={18}
                    strokeWidth={1.75}
                    className={`mr-3 shrink-0 ${
                      dark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  />
                  <input
                    id="home-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Camera lens, hammer drill, cargo van..."
                    className={`w-full bg-transparent text-sm focus:outline-none sm:text-base ${
                      dark
                        ? "text-white placeholder:text-zinc-500"
                        : "text-zinc-950 placeholder:text-zinc-400"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Search equipment"
                  className={`inline-flex items-center justify-center gap-2 border px-6 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    dark
                      ? "border-amber-300 bg-amber-300 text-zinc-950 hover:bg-amber-200"
                      : "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                  }`}
                >
                  <span>Search</span>
                  <ArrowRight size={16} strokeWidth={1.75} />
                </button>
              </form>

              <div
                className={`mt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs ${
                  dark ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                <span>
                  Reviewed listings <span aria-hidden="true">·</span> Daily and
                  weekly rates <span aria-hidden="true">·</span> Local pickup
                </span>
                <Link
                  href="/equipment"
                  className={`underline underline-offset-4 ${
                    dark
                      ? "text-zinc-300 decoration-zinc-700 hover:text-white"
                      : "text-zinc-800 decoration-zinc-300 hover:text-zinc-950"
                  }`}
                >
                  Browse full catalog →
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-6"
            >
              <div className="relative mb-12">
                <div
                  className={`relative aspect-[16/10] w-full overflow-hidden border ${
                    dark
                      ? "border-zinc-800 bg-zinc-900"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <Image
                    src="/images/hero-gear.jpg"
                    alt="Camera rig, cordless drills, and workshop tools laid out for a project"
                    width={1200}
                    height={750}
                    unoptimized
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/10 to-zinc-950/20" />
                  <div className="absolute left-4 top-4 border border-white/40 bg-zinc-950/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:left-6 sm:top-6">
                    SHAREKIT FIELD NOTES / 01
                  </div>
                  <div className="absolute bottom-28 left-5 right-5 hidden text-white sm:left-7 sm:block">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                      Tools / optics / transport
                    </p>
                    <p className="mt-2 max-w-sm text-xl font-medium leading-tight tracking-tight sm:text-2xl">
                      Equipment for the work in front of you.
                    </p>
                  </div>
                </div>
                <Link
                  href={
                    equipment[0]
                      ? getEquipmentHref(equipment[0].name)
                      : "/equipment"
                  }
                  aria-label={
                    equipment[0]
                      ? `View featured equipment: ${equipment[0].name}`
                      : "Browse available equipment"
                  }
                  className={`absolute -bottom-8 left-4 right-4 flex min-w-0 items-center gap-3 border p-3 transition-colors sm:left-7 sm:right-auto sm:w-5/6 sm:gap-4 sm:p-4 ${
                    dark
                      ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-amber-300"
                      : "border-stone-200 bg-white text-zinc-950 hover:border-zinc-950"
                  }`}
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-stone-200 dark:border-zinc-700 sm:h-20 sm:w-20">
                    <Image
                      src={equipment[0]?.image || categories[1].image}
                      alt={equipment[0]?.name || "Camera equipment available to rent"}
                      width={160}
                      height={160}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        dark ? "text-amber-300" : "text-amber-700"
                      }`}
                    >
                      Featured nearby
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug sm:text-base">
                      {equipment[0]?.name || "Browse available equipment"}
                    </p>
                    <p
                      className={`mt-1 truncate font-mono text-[10px] uppercase tracking-wider ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {equipment[0]
                        ? `${equipment[0].condition || "Ready to rent"} · ${equipment[0].location}`
                        : "Tools · Photography · Transport"}
                    </p>
                  </div>
                  <div className="shrink-0 border-l border-stone-200 pl-3 text-right font-mono dark:border-zinc-700 sm:pl-4">
                    {equipment[0] ? (
                      <>
                        <span className="block text-sm font-medium sm:text-base">
                          ৳{equipment[0].price.toLocaleString()}
                        </span>
                        <span
                          className={`mt-1 block text-[10px] uppercase tracking-wider ${
                            dark ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          / {equipment[0].rentalType}
                        </span>
                      </>
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES WITH REAL PHOTOGRAPHY */}
      <section
        className={`border-b ${
          dark ? "border-zinc-800/90" : "border-stone-200/90"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-2xl font-medium tracking-tight">
              Browse by category
            </h2>
            <span
              className={`font-mono text-xs ${
                dark ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              01 — 04
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map(({ title, subtitle, icon: Icon, query, image }) => (
              <Link
                key={title}
                href={`/equipment?category=${encodeURIComponent(query)}`}
                className={`group flex flex-col justify-between overflow-hidden border transition-colors ${
                  dark
                    ? "border-zinc-800 bg-zinc-900/60 hover:border-zinc-500"
                    : "border-stone-200 bg-white hover:border-zinc-950"
                }`}
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      width={640}
                      height={480}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <Icon
                        size={19}
                        strokeWidth={1.6}
                        className={dark ? "text-amber-300" : "text-zinc-800"}
                      />
                      <ArrowUpRight
                        size={17}
                        strokeWidth={1.6}
                        className={`${
                          dark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      />
                    </div>
                    <h3 className="text-lg font-medium tracking-tight">
                      {title}
                    </h3>
                    <p
                      className={`mt-1 text-sm ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EQUIPMENT */}
      <section
        id="featured"
        className={`border-b ${
          dark ? "border-zinc-800/90" : "border-stone-200/90"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p
                className={`mb-2 font-mono text-xs uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Featured Listings
              </p>
              <h2 className="text-3xl font-medium tracking-tight">
                Available in your area
              </h2>
            </div>
            <Link
              href="/equipment"
              className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider underline underline-offset-4 ${
                dark
                  ? "text-zinc-200 decoration-zinc-700 hover:text-white"
                  : "text-zinc-950 decoration-zinc-300 hover:decoration-zinc-950"
              }`}
            >
              See all equipment
              <ArrowRight size={15} />
            </Link>
          </div>

          {equipmentError ? (
            <div
              role="alert"
              className={`border p-6 text-sm ${
                dark
                  ? "border-red-900/70 bg-red-950/40 text-red-200"
                  : "border-red-200 bg-red-50/70 text-red-900"
              }`}
            >
              {equipmentError}
            </div>
          ) : equipment.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {equipment.slice(0, 6).map((item) => (
                <EquipmentCard key={item._id} item={item} dark={dark} />
              ))}
            </div>
          ) : (
            <div
              className={`flex flex-col items-start justify-between gap-6 border p-10 sm:flex-row sm:items-center ${
                dark
                  ? "border-zinc-800 bg-zinc-900/60"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div>
                <h3 className="text-lg font-medium">
                  No approved listings to show right now
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Check the full catalog or create an account to list your own
                  equipment.
                </p>
              </div>
              <Link
                href="/equipment"
                className={`inline-flex shrink-0 items-center gap-2 border px-5 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  dark
                      ? "border-amber-300 bg-amber-300 text-zinc-950 hover:bg-amber-200"
                      : "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                }`}
              >
                Explore equipment
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* BENEFITS */}
      <section
        className={`border-b ${
          dark
            ? "border-zinc-800/90 bg-zinc-900/40"
            : "border-stone-200/90 bg-white"
        }`}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden border border-stone-200 dark:border-zinc-800">
              <Image
                src={categories[2].image}
                alt="Construction crew working with equipment on a building site"
                width={960}
                height={720}
                unoptimized
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                  Local inventory / shared use
                </p>
                <p className="mt-2 text-xl font-medium leading-tight tracking-tight text-white">
                  Get access without adding to storage.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p
              className={`mb-3 font-mono text-xs uppercase tracking-widest ${
                dark ? "text-amber-300" : "text-amber-700"
              }`}
            >
              Why rent locally
            </p>
            <h2 className="max-w-xl text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              More capability. Less equipment sitting idle.
            </h2>
            <p
              className={`mt-4 max-w-xl text-base leading-relaxed ${
                dark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Find a useful tool nearby, or let someone else put your gear to
              work when you are not using it.
            </p>

            <div
              className={`mt-8 divide-y border-t ${
                dark
                  ? "divide-zinc-800 border-zinc-800"
                  : "divide-stone-200 border-stone-200"
              }`}
            >
              {benefits.map((benefit) => (
                <article
                  key={benefit.num}
                  className="grid gap-3 py-5 sm:grid-cols-12 sm:gap-4"
                >
                  <span
                    className={`font-mono text-xs sm:col-span-2 ${
                      dark ? "text-amber-300" : "text-amber-700"
                    }`}
                  >
                    /{benefit.num}
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="text-lg font-medium tracking-tight">
                      {benefit.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        dark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {benefit.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className={`border-b ${
          dark
            ? "border-zinc-800/90 bg-zinc-900/40"
            : "border-stone-200/90 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p
                className={`mb-3 font-mono text-xs uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                How It Works
              </p>
              <h2 className="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                Straightforward hand-offs from start to finish.
              </h2>
              <p
                className={`mt-4 text-base leading-relaxed ${
                  dark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Skip buying single-project tools or paying commercial markups.
                Borrow what you need locally, or earn steady returns on gear you
                already own.
              </p>
              <div className="mt-8">
                <Link
                  href="/register"
                  className={`inline-flex items-center gap-2.5 border px-6 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    dark
                      ? "border-amber-300 bg-amber-300 text-zinc-950 hover:bg-transparent hover:text-amber-300"
                      : "border-zinc-950 bg-zinc-950 text-white hover:bg-transparent hover:text-zinc-950"
                  }`}
                >
                  Create an account
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div
              className={`divide-y border-t lg:col-span-7 lg:border-t-0 ${
                dark ? "divide-zinc-800 border-zinc-800" : "divide-stone-200 border-stone-200"
              }`}
            >
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="grid gap-4 py-7 first:pt-0 sm:grid-cols-12"
                >
                  <span
                    className={`font-mono text-xs sm:col-span-2 ${
                      dark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    /{step.num}
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="text-lg font-medium tracking-tight">
                      {step.title}
                    </h3>
                    <p
                      className={`mt-1.5 text-sm leading-relaxed ${
                        dark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        className={`border-b ${
          dark ? "border-zinc-800/90" : "border-stone-200/90"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="mb-12">
            <p
              className={`mb-2 font-mono text-xs uppercase tracking-widest ${
                dark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Recent Rentals
            </p>
            <h2 className="text-3xl font-medium tracking-tight">
              Notes from owners and renters
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <figure
                key={review.name}
                className={`flex flex-col justify-between border p-8 ${
                  dark
                    ? "border-zinc-800 bg-zinc-900/60"
                    : "border-stone-200 bg-white"
                }`}
              >
                <blockquote
                  className={`text-base leading-relaxed ${
                    dark ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  “{review.quote}”
                </blockquote>
                <figcaption
                  className={`mt-8 border-t pt-4 ${
                    dark ? "border-zinc-800" : "border-stone-100"
                  }`}
                >
                  <div className="text-sm font-medium">{review.name}</div>
                  <div
                    className={`mt-0.5 font-mono text-xs ${
                      dark ? "text-zinc-500" : "text-zinc-500"
                    }`}
                  >
                    {review.detail}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={dark ? "bg-zinc-900" : "bg-zinc-950 text-white"}>
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl">
                Put idle equipment to work.
              </h2>
              <p className="mt-4 text-base text-zinc-400">
                Rent what your project needs today, or list your own tools and
                cameras to earn locally.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/equipment"
                className="inline-flex items-center gap-2 border border-white bg-white px-7 py-4 font-mono text-xs uppercase tracking-wider text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Explore equipment
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 border border-zinc-700 px-7 py-4 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:border-white"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`border-t ${
          dark
            ? "border-zinc-800 bg-zinc-950 text-zinc-400"
            : "border-zinc-800/90 bg-zinc-950 text-zinc-400"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center md:px-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-medium tracking-tight text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center border border-stone-700 bg-white">
              <Image
                src="/sharekit-icon.png"
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-5 w-5 object-contain"
              />
            </span>
            <span>sharekit.</span>
          </Link>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs uppercase tracking-wider">
            <Link href="/equipment" className="hover:text-white">
              Explore equipment
            </Link>
            <Link href="/register" className="hover:text-white">
              Join the community
            </Link>
            <span className="font-mono text-xs text-zinc-600">
              © {new Date().getFullYear()} ShareKit
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}