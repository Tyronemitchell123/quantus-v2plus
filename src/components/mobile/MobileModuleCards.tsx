import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plane, Heart, Users, Palmtree, Truck, Handshake,
  MapPin, Clock, Shield, Star, ChevronRight, Eye,
} from "lucide-react";

/* ── category data ── */
const categories = [
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: Palmtree,
    gradient: "from-[hsl(46_66%_52%/0.15)] to-transparent",
    cards: [
      { title: "Lake Como Villa", sub: "Private estate · 8 bed", avail: "Available", privacy: "Ultra-Private", img: "🏡" },
      { title: "Aman Tokyo Suite", sub: "Penthouse · 3 nights", avail: "Waitlist", privacy: "Discreet", img: "🏯" },
      { title: "Mykonos Yacht", sub: "40m · Full crew", avail: "Available", privacy: "Obsidian", img: "🛥️" },
    ],
  },
  {
    id: "logistics",
    label: "Logistics",
    icon: Truck,
    gradient: "from-[hsl(220_15%_15%/0.3)] to-transparent",
    cards: [
      { title: "Dubai → London Transfer", sub: "Time-critical cargo", eta: "4h 22m", status: "In Transit", operator: "SecureLog" },
      { title: "Vehicle Recovery — Monaco", sub: "Classic car relocation", eta: "12h", status: "Dispatched", operator: "EliteMove" },
      { title: "Medical Equipment Relay", sub: "Priority shipment", eta: "2h 10m", status: "En Route", operator: "MedEx" },
    ],
  },
  {
    id: "partnerships",
    label: "Partners",
    icon: Handshake,
    gradient: "from-[hsl(46_66%_52%/0.08)] to-transparent",
    cards: [
      { name: "Falcon Aviation Group", rating: 9.8, speed: "< 2h", deals: 14, category: "Aviation" },
      { name: "Lanserhof Medical", rating: 9.5, speed: "< 4h", deals: 8, category: "Medical" },
      { name: "Quintessentially", rating: 9.2, speed: "< 1h", deals: 22, category: "Lifestyle" },
    ],
  },
  {
    id: "aviation",
    label: "Aviation",
    icon: Plane,
    gradient: "from-[hsl(46_66%_52%/0.12)] to-transparent",
    cards: [
      { title: "Gulfstream G700", sub: "Ultra-long range · 19 pax", avail: "Available", privacy: "Obsidian", img: "✈️" },
      { title: "Bombardier Global 7500", sub: "Long range · 17 pax", avail: "48h Notice", privacy: "Discreet", img: "🛩️" },
    ],
  },
  {
    id: "medical",
    label: "Medical",
    icon: Heart,
    gradient: "from-[hsl(200_50%_20%/0.15)] to-transparent",
    cards: [
      { title: "Executive Health Screen", sub: "Mayo Clinic · 2 days", avail: "Available", privacy: "Ultra-Private", img: "🏥" },
      { title: "Longevity Protocol", sub: "Lanserhof · 7 days", avail: "Waitlist", privacy: "Obsidian", img: "💉" },
    ],
  },
  {
    id: "staffing",
    label: "Staffing",
    icon: Users,
    gradient: "from-[hsl(30_30%_15%/0.2)] to-transparent",
    cards: [
      { title: "Private Chef", sub: "Michelin-trained · London", avail: "Shortlisted", privacy: "Discreet", img: "👨‍🍳" },
      { title: "Estate Manager", sub: "Trilingual · 10yr exp", avail: "Available", privacy: "Ultra-Private", img: "🏛️" },
    ],
  },
];

/* ── swipe threshold ── */
const SWIPE_THRESHOLD = 60;

const MobileModuleCards = () => {
  const [activeCat, setActiveCat] = useState("lifestyle");
  const navigate = useNavigate();
  const cat = categories.find((c) => c.id === activeCat)!;

  const handleSwipe = (_: never, info: PanInfo) => {
    const idx = categories.findIndex((c) => c.id === activeCat);
    if (info.offset.x < -SWIPE_THRESHOLD && idx < categories.length - 1) {
      setActiveCat(categories[idx + 1].id);
    } else if (info.offset.x > SWIPE_THRESHOLD && idx > 0) {
      setActiveCat(categories[idx - 1].id);
    }
  };

  return (
    <div className="lg:hidden space-y-4">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`flex items-center gap-1.5 px-3 py-2 shrink-0 font-body text-[10px] tracking-[0.15em] uppercase transition-all duration-300 border ${
              activeCat === c.id
                ? "border-primary/40 text-primary bg-primary/[0.06]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <c.icon size={11} strokeWidth={1.5} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Cards area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCat}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleSwipe as any}
          className="space-y-3"
        >
          {/* Module-specific cards */}
          {activeCat === "partnerships"
            ? (cat.cards as any[]).map((v, i) => (
                <VendorCard key={i} vendor={v} />
              ))
            : activeCat === "logistics"
            ? (cat.cards as any[]).map((op, i) => (
                <LogisticsCard key={i} op={op} />
              ))
            : (cat.cards as any[]).map((item, i) => (
                <PropertyCard key={i} item={item} gradient={cat.gradient} />
              ))}

          {/* CTA */}
          <button
            onClick={() => navigate("/intake")}
            className="w-full py-3.5 bg-primary text-primary-foreground font-body text-[11px] tracking-[0.2em] uppercase transition-all active:scale-[0.98]"
          >
            Start Deal
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ── Property / Lifestyle card ── */
const PropertyCard = ({ item, gradient }: { item: any; gradient: string }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="relative overflow-hidden border border-border bg-card"
  >
    {/* Full-bleed image area */}
    <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <span className="text-4xl">{item.img}</span>
    </div>

    {/* Gold overlay gradient */}
    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-t from-card via-transparent to-transparent" />

    {/* Badges */}
    <div className="absolute top-3 right-3 flex gap-1.5">
      {item.avail && (
        <span className={`px-2 py-0.5 font-body text-[8px] tracking-wider uppercase border ${
          item.avail === "Available"
            ? "border-[hsl(var(--success))]/30 text-[hsl(var(--success))]"
            : "border-primary/30 text-primary"
        }`}>
          {item.avail}
        </span>
      )}
      {item.privacy && (
        <span className="px-2 py-0.5 font-body text-[8px] tracking-wider uppercase border border-primary/20 text-primary/70 flex items-center gap-1">
          <Shield size={7} />
          {item.privacy}
        </span>
      )}
    </div>

    {/* Content */}
    <div className="p-4 space-y-1">
      <h4 className="font-display text-sm text-foreground">{item.title}</h4>
      <p className="font-body text-[11px] text-muted-foreground">{item.sub}</p>
    </div>

    {/* Swipe hint */}
    <div className="absolute bottom-3 right-3">
      <ChevronRight size={14} className="text-muted-foreground/30" />
    </div>
  </motion.div>
);

/* ── Logistics card ── */
const LogisticsCard = ({ op }: { op: any }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="border border-border bg-card p-4 space-y-3"
  >
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-display text-sm text-foreground">{op.title}</h4>
        <p className="font-body text-[11px] text-muted-foreground mt-0.5">{op.sub}</p>
      </div>
      <span className={`px-2 py-0.5 font-body text-[8px] tracking-wider uppercase border ${
        op.status === "In Transit"
          ? "border-primary/30 text-primary"
          : "border-[hsl(var(--success))]/30 text-[hsl(var(--success))]"
      }`}>
        {op.status}
      </span>
    </div>

    {/* Route line */}
    <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: "65%" }}
        transition={{ duration: 1.5 }}
      />
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Clock size={10} className="text-primary/70" />
        <span className="font-body text-[10px] text-muted-foreground">ETA: {op.eta}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <MapPin size={10} className="text-muted-foreground/50" />
        <span className="font-body text-[10px] text-muted-foreground">{op.operator}</span>
      </div>
    </div>
  </motion.div>
);

/* ── Vendor card ── */
const VendorCard = ({ vendor }: { vendor: any }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="border border-border bg-card p-4 space-y-3"
  >
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-display text-sm text-foreground">{vendor.name}</h4>
        <p className="font-body text-[10px] text-muted-foreground mt-0.5">{vendor.category}</p>
      </div>
      <div className="flex items-center gap-1">
        <Star size={10} className="text-primary fill-primary" />
        <span className="font-body text-xs text-primary">{vendor.rating}</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Clock size={10} className="text-muted-foreground/50" />
        <span className="font-body text-[10px] text-muted-foreground">{vendor.speed} response</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Eye size={10} className="text-muted-foreground/50" />
        <span className="font-body text-[10px] text-muted-foreground">{vendor.deals} deals</span>
      </div>
    </div>

    {/* Rating bar */}
    <div className="h-1 bg-secondary rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${vendor.rating * 10}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  </motion.div>
);

export default MobileModuleCards;
