import { Link } from "react-router-dom";
import { Plus, Eye, FileText, MessageSquare } from "lucide-react";

const actions = [
  { icon: Plus, label: "New Request", to: "/intake", accent: true },
  { icon: Eye, label: "View Deals", to: "/deals" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: MessageSquare, label: "Messages", to: "/chat" },
];

const MobileQuickActions = () => (
  <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide lg:hidden">
    {actions.map((a) => (
      <Link
        key={a.label}
        to={a.to}
        className={`flex items-center gap-2 px-4 py-2.5 shrink-0 font-body text-[11px] tracking-wider transition-all duration-300 ${
          a.accent
            ? "bg-primary text-primary-foreground"
            : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
        }`}
      >
        <a.icon size={12} />
        {a.label}
      </Link>
    ))}
  </div>
);

export default MobileQuickActions;
