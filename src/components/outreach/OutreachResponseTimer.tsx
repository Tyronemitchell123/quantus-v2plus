import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  createdAt: string;
  status: string;
}

const OutreachResponseTimer = ({ createdAt, status }: Props) => {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (status !== "sent" && status !== "pending") return;

    const update = () => {
      const diff = Date.now() - new Date(createdAt).getTime();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setElapsed(`${days}d ${hours % 24}h`);
      } else {
        setElapsed(`${hours}h ${mins}m`);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (status !== "sent" && status !== "pending") return null;

  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-body text-accent">
      <Clock size={8} className="animate-pulse" />
      Awaiting: {elapsed}
    </span>
  );
};

export default OutreachResponseTimer;