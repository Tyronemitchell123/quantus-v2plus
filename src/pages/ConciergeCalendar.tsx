import { useState } from "react";
import { motion } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import {
  Calendar, Clock, Plane, Stethoscope, Users, Sparkles, MapPin,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  category: "aviation" | "medical" | "staffing" | "lifestyle";
  location?: string;
  status: "confirmed" | "pending" | "conflict";
  aiSuggested?: boolean;
}

const sampleEvents: Record<number, CalendarEvent[]> = {
  3: [{ id: "1", title: "G700 Departure — Geneva", time: "08:00", category: "aviation", location: "Farnborough", status: "confirmed" }],
  7: [{ id: "2", title: "Full Executive Health Screen", time: "10:00", category: "medical", location: "Harley Street", status: "confirmed" }],
  10: [
    { id: "3", title: "Staff Review — Household", time: "09:00", category: "staffing", status: "pending" },
    { id: "4", title: "Charter Return — London", time: "16:00", category: "aviation", location: "Nice", status: "conflict", aiSuggested: true },
  ],
  15: [{ id: "5", title: "Private Dinner — Chef Matsuhisa", time: "20:00", category: "lifestyle", location: "Mayfair", status: "confirmed" }],
  18: [{ id: "6", title: "Dermatology Follow-up", time: "14:30", category: "medical", location: "Chelsea", status: "pending" }],
  22: [{ id: "7", title: "Yacht Charter Briefing", time: "11:00", category: "lifestyle", status: "confirmed", aiSuggested: true }],
  28: [{ id: "8", title: "Pilot Training Renewal", time: "09:00", category: "aviation", location: "Oxford", status: "pending" }],
};

const categoryConfig: Record<string, { icon: typeof Plane; color: string }> = {
  aviation: { icon: Plane, color: "text-cyan-500 bg-cyan-500/10" },
  medical: { icon: Stethoscope, color: "text-rose-500 bg-rose-500/10" },
  staffing: { icon: Users, color: "text-purple-500 bg-purple-500/10" },
  lifestyle: { icon: Sparkles, color: "text-amber-500 bg-amber-500/10" },
};

const ConciergeCalendar = () => {
  useDocumentHead({ title: "Concierge Calendar — Quantus A.I", description: "AI-powered scheduling across all modules with conflict resolution." });
  const [currentMonth] = useState(2); // March
  const [currentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const selectedEvents = selectedDay ? sampleEvents[selectedDay] || [] : [];

  const aiInsights = [
    { text: "Conflict detected on 10th: Charter return overlaps with staff review. Suggest rescheduling staff review to 11th.", type: "conflict" },
    { text: "Recommended: Schedule quarterly health check before G700 departure on 3rd.", type: "suggestion" },
    { text: "Yacht charter on 22nd auto-scheduled based on weather forecast — optimal conditions.", type: "auto" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-display tracking-tight text-foreground">Concierge Calendar</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-orchestrated scheduling across all modules</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display">{months[currentMonth]} {currentYear}</CardTitle>
                    <div className="flex gap-1">
                      <button className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary/30 transition-colors"><ChevronLeft size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary/30 transition-colors"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-px">
                    {days.map(d => (
                      <div key={d} className="p-2 text-center text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body">{d}</div>
                    ))}
                    {calendarDays.map((day, i) => {
                      const events = day ? sampleEvents[day] : undefined;
                      const isSelected = day === selectedDay;
                      const hasConflict = events?.some(e => e.status === "conflict");
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: day ? 1.05 : 1 }}
                          onClick={() => day && setSelectedDay(day)}
                          className={`aspect-square p-1 border border-transparent flex flex-col items-center justify-start gap-0.5 transition-all ${
                            !day ? "opacity-0 pointer-events-none" :
                            isSelected ? "border-primary bg-primary/5" :
                            "hover:border-border"
                          }`}
                        >
                          {day && (
                            <>
                              <span className={`text-xs font-body ${isSelected ? "text-primary" : "text-foreground"}`}>{day}</span>
                              {events && (
                                <div className="flex gap-0.5 flex-wrap justify-center">
                                  {events.map(e => {
                                    const cfg = categoryConfig[e.category];
                                    return <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${hasConflict && e.status === "conflict" ? "bg-rose-500" : cfg.color.split(" ")[0].replace("text-", "bg-")}`} />;
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Day Events */}
              {selectedDay && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary/70 font-body">
                    {months[currentMonth]} {selectedDay}, {currentYear}
                  </p>
                  {selectedEvents.length === 0 ? (
                    <Card><CardContent className="p-4 text-center text-sm text-muted-foreground font-body">No events scheduled</CardContent></Card>
                  ) : selectedEvents.map(event => {
                    const cfg = categoryConfig[event.category];
                    const Icon = cfg.icon;
                    return (
                      <Card key={event.id} className={`${event.status === "conflict" ? "border-rose-500/30" : "hover:border-primary/20"} transition-colors`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-body text-foreground">{event.title}</p>
                                {event.aiSuggested && <Bot size={10} className="text-primary/50" />}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Clock size={10} />{event.time}</span>
                                {event.location && <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><MapPin size={10} />{event.location}</span>}
                              </div>
                            </div>
                            <Badge variant={event.status === "confirmed" ? "default" : event.status === "conflict" ? "destructive" : "secondary"} className="text-[8px] uppercase tracking-wider">
                              {event.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* AI Insights Panel */}
            <div className="space-y-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-body tracking-wider uppercase flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" /> AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }} className="flex items-start gap-2">
                      {insight.type === "conflict" ? <AlertTriangle size={12} className="text-rose-500 mt-0.5 shrink-0" /> :
                       insight.type === "auto" ? <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" /> :
                       <Bot size={12} className="text-primary mt-0.5 shrink-0" />}
                      <p className="text-[11px] text-muted-foreground font-body leading-relaxed">{insight.text}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-body tracking-wider uppercase">Next 7 Days</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(sampleEvents).slice(0, 4).map(([day, events]) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-xs font-body text-foreground">{events[0].title}</p>
                        <p className="text-[10px] text-muted-foreground font-body">{months[currentMonth]} {day}</p>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${categoryConfig[events[0].category].color}`}>
                        {(() => { const I = categoryConfig[events[0].category].icon; return <I size={10} />; })()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConciergeCalendar;
