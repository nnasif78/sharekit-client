"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, BadgeCheck, Camera, CircleDollarSign, Drill, HeartHandshake, ShieldCheck, Sparkles, Truck, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Equipment = {
  _id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  rentalType: string;
  image: string;
  condition?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const categories = [
  { title: "Tools & DIY", description: "Make the weekend project happen", icon: Wrench, query: "Tools" },
  { title: "Photography", description: "Capture the moments that matter", icon: Camera, query: "Photography Equipment" },
  { title: "Construction", description: "Get the job done, without the buy", icon: Drill, query: "Construction Equipment" },
  { title: "Transport", description: "Move more with the right gear", icon: Truck, query: "Vehicles & Transportation" },
];
const reviews = [
  { quote: "Found exactly what I needed for a one-day project. Pickup was easy, and I didn’t have to buy something I’d use once.", name: "Maya R.", detail: "Rented a power washer" },
  { quote: "My camera kit paid for itself in a weekend. The booking and handoff were both refreshingly simple.", name: "Ethan L.", detail: "Local equipment owner" },
  { quote: "A friendly local owner, fair price, and gear ready when promised. I’ll rent again before I buy again.", name: "Samira K.", detail: "Rented a camera kit" },
  { quote: "Listing my tools took minutes. It’s great knowing useful equipment gets used instead of sitting on a shelf.", name: "Oliver D.", detail: "Local equipment owner" },
];

const enter = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

function EquipmentCard({ item, index }: { item: Equipment; index: number }) {
  const slug = item.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "equipment";
  return (
    <motion.article
      variants={enter}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.07 }}
      className="home-equipment-card"
    >
      <Link href={`/equipment/${encodeURIComponent(slug)}`} aria-label={`View ${item.name}`} className="home-card-image">
        {item.image ? <Image src={item.image} alt={item.name} width={640} height={440} unoptimized /> : <div className="home-image-fallback"><Wrench size={34} /></div>}
        <span className="home-card-tag"><BadgeCheck size={14} /> Approved</span>
      </Link>
      <div className="home-card-body">
        <div className="home-card-kicker"><span>{item.category}</span><span>{item.location}</span></div>
        <Link href={`/equipment/${encodeURIComponent(slug)}`} className="home-card-title">{item.name}</Link>
        <div className="home-card-price"><strong>৳{item.price.toLocaleString()}</strong><span> / {item.rentalType}</span><ArrowRight size={18} /></div>
      </div>
    </motion.article>
  );
}

export default function HomeExperience() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentError, setEquipmentError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/equipment?page=1&pageSize=6`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load featured equipment.");
        return result.data as Equipment[];
      })
      .then((items) => { if (active) setEquipment(items); })
      .catch((error: unknown) => { if (active) setEquipmentError(error instanceof Error ? error.message : "Could not load featured equipment."); });
    return () => { active = false; };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/equipment?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-photo" aria-hidden="true" />
        <div className="home-hero-inner">
          <motion.div initial="hidden" animate="visible" variants={enter} className="home-hero-copy">
            <span className="home-eyebrow"><Sparkles size={15} /> A little more shared, a lot more possible</span>
            <h1>Good gear.<br /><em>Good neighbors.</em></h1>
            <p>Rent what you need from people nearby. Share what you own. Make more of every project, trip, and idea.</p>
            <form className="home-search" onSubmit={submitSearch}>
              <label htmlFor="home-search">What are you looking for?</label>
              <div><input id="home-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try a camera, drill, or tent" /><button type="submit" aria-label="Search equipment"><ArrowRight size={20} /></button></div>
            </form>
            <div className="home-hero-note"><ShieldCheck size={16} /> Every listing is reviewed before it goes live</div>
          </motion.div>
          <motion.div className="home-hero-note-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
            <span className="home-note-icon"><HeartHandshake size={20} /></span>
            <div><strong>Better together</strong><span>Local gear, shared with care.</span></div>
          </motion.div>
        </div>
        <a className="home-scroll" href="#featured">Scroll to explore <ArrowDown size={14} /></a>
      </section>

      <section className="home-section home-featured" id="featured">
        <div className="home-section-heading">
          <div><span className="home-eyebrow home-eyebrow-dark">Ready when you are</span><h2>Good finds, close by.</h2><p>Hand-picked from approved listings in the ShareKit community.</p></div>
          <Link className="home-text-link" href="/equipment">Browse all equipment <ArrowRight size={17} /></Link>
        </div>
        {equipmentError ? <p className="home-feedback" role="alert">{equipmentError}</p> : equipment.length > 0 ? (
          <div className="home-equipment-grid">{equipment.slice(0, 6).map((item, index) => <EquipmentCard key={item._id} item={item} index={index} />)}</div>
        ) : (
          <div className="home-empty"><div className="home-empty-icon"><Wrench size={24} /></div><h3>Great gear is on its way.</h3><p>There aren’t any approved listings to feature yet. Check back soon or explore the categories.</p><Link className="home-text-link" href="/equipment">Explore equipment <ArrowRight size={16} /></Link></div>
        )}
      </section>

      <section className="home-section home-categories">
        <div className="home-section-heading">
          <div><span className="home-eyebrow home-eyebrow-dark">Find your next thing</span><h2>What are we making?</h2><p>From small fixes to big plans, start with the right equipment.</p></div>
        </div>
        <div className="home-category-grid">
          {categories.map(({ title, description, icon: Icon, query }, index) => (
            <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={enter} transition={{ delay: index * 0.09 }}>
              <Link href={`/equipment?category=${encodeURIComponent(query)}`} className="home-category-card"><span className="home-category-icon"><Icon size={22} /></span><span className="home-category-copy"><strong>{title}</strong><span>{description}</span></span><ArrowRight className="home-category-arrow" size={18} /></Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="home-benefits">
        <div className="home-benefits-inner">
          <div><span className="home-eyebrow">Sharing feels good</span><h2>Less stuff to store.<br /><em>More life to live.</em></h2><p>ShareKit makes it easier to get the gear you need, earn from the things you own, and keep useful equipment in use.</p><Link className="home-button home-button-light" href="/register">Join the neighborhood <ArrowRight size={17} /></Link></div>
          <div className="home-benefit-list">
            <article><span><ShieldCheck size={21} /></span><div><h3>Reviewed with care</h3><p>Listings are reviewed before they’re approved for the community.</p></div></article>
            <article><span><HeartHandshake size={21} /></span><div><h3>Neighbors, not warehouses</h3><p>Find useful gear from people and small businesses close to home.</p></div></article>
            <article><span><CircleDollarSign size={21} /></span><div><h3>Value that goes both ways</h3><p>Rent affordably or earn from the equipment you already own.</p></div></article>
          </div>
        </div>
      </section>

      <section className="home-section home-how" id="how-it-works">
        <div className="home-section-heading"><div><span className="home-eyebrow home-eyebrow-dark">Easy as it should be</span><h2>From “need it” to “got it.”</h2><p>A simpler way to get equipped and get going.</p></div></div>
        <div className="home-steps">
          {[["01", "Find your fit", "Browse reviewed equipment and choose what works for your plans."], ["02", "Book with confidence", "Pick your dates, arrange the details, and check out securely."], ["03", "Make something happen", "Meet your local owner, get equipped, and enjoy the project."]].map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="home-section home-reviews">
        <div className="home-section-heading"><div><span className="home-eyebrow home-eyebrow-dark">A little neighborly love</span><h2>Better gear, better stories.</h2><p>People are getting more out of the things already around them.</p></div></div>
        <div className="home-review-grid">{reviews.map((review) => <figure key={review.name} className="home-review-card"><div className="home-stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>“{review.quote}”</blockquote><figcaption><span className="home-avatar">{review.name.charAt(0)}</span><span><strong>{review.name}</strong><small>{review.detail}</small></span></figcaption></figure>)}</div>
      </section>

      <section className="home-final-cta"><div><span className="home-eyebrow">A good thing starts nearby</span><h2>Ready to share a little more?</h2><p>Find the gear that gets you moving—or give your own equipment a new purpose.</p><div className="home-cta-actions"><Link href="/equipment" className="home-button home-button-light">Explore equipment <ArrowRight size={17} /></Link><Link href="/register" className="home-cta-secondary">Create your free account</Link></div></div><div className="home-cta-mark" aria-hidden="true">sk<span>.</span></div></section>
      <footer className="home-footer">
        <Link href="/" className="site-brand"><span className="site-brand-mark">s<span>k</span></span><span>sharekit<span className="site-brand-period">.</span></span></Link>
        <p>Good gear, shared with care.</p>
        <div><Link href="/equipment">Explore equipment</Link><Link href="/register">Join the community</Link></div>
        <small>© {new Date().getFullYear()} ShareKit. Made for sharing.</small>
      </footer>
    </div>
  );
}
