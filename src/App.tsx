import React, { useState, useEffect } from "react";
import { computeAllCalendars } from "./utils/calendarUtils";
import { FALLBACK_QUOTES } from "./data/quotes";
import { DateData } from "./types";
import CalendarCard from "./components/CalendarCard";
import PrayerTimesCard from "./components/PrayerTimesCard";
import SharePoster from "./components/SharePoster";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Sliders,
  X,
  MapPin,
  Heart,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hijriOffset, setHijriOffset] = useState<number>(-1);
  const [activeCity, setActiveCity] = useState<string>("Lahore");
  const [asrMethod, setAsrMethod] = useState<"shafi" | "hanafi">("hanafi");

  // Gemini state attributes
  const [currentQuote, setCurrentQuote] = useState({
    quote: FALLBACK_QUOTES[0].quote,
    author: FALLBACK_QUOTES[0].author,
    isLoading: false,
  });

  const [dateSignificance, setDateSignificance] = useState<{
    significance: string;
    englishSummary: string;
    isOpen: boolean;
    isLoading: boolean;
  }>({
    significance: "",
    englishSummary: "",
    isOpen: false,
    isLoading: false,
  });

  // Re-compute all three calendars every time date or Hijri offset changes
  const computedDateData: DateData = computeAllCalendars(selectedDate, hijriOffset);

  // Auto-load fallback quote based on selected day of month
  useEffect(() => {
    const dayOfMonth = selectedDate.getDate();
    const index = (dayOfMonth - 1) % FALLBACK_QUOTES.length;
    setCurrentQuote({
      quote: FALLBACK_QUOTES[index].quote,
      author: FALLBACK_QUOTES[index].author,
      isLoading: false,
    });
  }, [selectedDate]);

  // Handle changing selected date
  const adjustDays = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  // 1. Fetch AI-powered Daily Quote (Aaj Ki Baat) using Gemini API
  const handleFetchAiQuote = async () => {
    setCurrentQuote((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("/api/gemini/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateStr: selectedDate.toDateString(),
          gregorianInfo: `${computedDateData.gregorian.day} ${computedDateData.gregorian.monthName} ${computedDateData.gregorian.year}`,
          hijriInfo: `${computedDateData.hijri.day} ${computedDateData.hijri.monthName} ${computedDateData.hijri.year}`,
          bikarmiInfo: `${computedDateData.bikarmi.day} ${computedDateData.bikarmi.monthName} ${computedDateData.bikarmi.year}`,
        }),
      });
      const data = await response.json();
      if (data && data.quote) {
        setCurrentQuote({
          quote: data.quote,
          author: data.author || "Gemini Wisdom",
          isLoading: false,
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Gemini quote fetch failed, falling back to local list:", err);
      const randomSecIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      setCurrentQuote({
        quote: FALLBACK_QUOTES[randomSecIndex].quote,
        author: FALLBACK_QUOTES[randomSecIndex].author,
        isLoading: false,
      });
    }
  };

  // 2. Fetch Historical & Seasonal Significance for the Date
  const handleFetchDateSignificance = async () => {
    setDateSignificance((prev) => ({ ...prev, isOpen: true, isLoading: true }));
    try {
      const response = await fetch("/api/gemini/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gregorian: computedDateData.gregorian,
          hijri: computedDateData.hijri,
          bikarmi: computedDateData.bikarmi,
        }),
      });
      const data = await response.json();
      if (data && data.significance) {
        setDateSignificance({
          significance: data.significance,
          englishSummary: data.englishSummary || "",
          isOpen: true,
          isLoading: false,
        });
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error("Gemini history explanation failed:", err);
      setDateSignificance({
        significance: "ہجری مہینہ قمری گردش اور اسلامی روایات کا آئینہ دار ہے جبکہ بکرمی مہینہ زمین اور پنجاب کے موسموں کی عکاسی کرتا ہے۔ دونوں تقویم مل کر ہماری زرخیز ثقافت کی خوبصورت تصویر پیش کرتے ہیں۔",
        englishSummary: "A beautiful intersection of seasons and faith. Hijri tracks lunar rotations, while Bikarmi anchors the agricultural seasons of Punjab.",
        isOpen: true,
        isLoading: false,
      });
    }
  };

  const handleCloseSignificance = () => {
    setDateSignificance((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper routine to scroll smoothly of sidebar items
  const navigateToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800 select-none">
      
      {/* 1. LEFT SIDEBAR PANEL (Exact Vibrant layout hierarchy) - Hidden on mobile, visible on lg screens */}
      <aside className="w-64 bg-white border-r border-slate-200 lg:flex flex-col p-6 h-screen shrink-0 sticky top-0 hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <div className="w-5 h-5 border-4 border-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-black tracking-tight text-indigo-950 uppercase italic font-mono">Taqweem</span>
        </div>

        {/* Local Links mapped dynamically */}
        <nav className="flex-grow space-y-1">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full flex items-center gap-3 bg-indigo-600 text-white px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wide transition-all shadow-md shadow-indigo-100"
          >
            <Compass className="w-4 h-4 text-white/90" />
            Dashboard — ہوم
          </button>

          <button
            onClick={() => navigateToSection("navigation-section")}
            className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all"
          >
            <div className="w-2.5 h-2.5 bg-slate-350 bg-slate-200 rounded-full" />
            Calendar Settings
          </button>

          <button
            onClick={() => navigateToSection("quote-section")}
            className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all"
          >
            <div className="w-2.5 h-2.5 bg-indigo-200 rounded-full" />
            Daily Thought
          </button>

          <button
            onClick={() => navigateToSection("prayer-section")}
            className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all"
          >
            <div className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
            Prayers
          </button>

          <button
            onClick={() => navigateToSection("poster-section")}
            className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all"
          >
            <div className="w-2.5 h-2.5 bg-amber-200 rounded-full" />
            Greeting Poster
          </button>
        </nav>

        {/* Upgraded Cherry-Rose Call To Action Area */}
        <div className="bg-rose-50 p-5 rounded-3xl mt-auto border border-rose-100/80">
          <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Date Significance
          </div>
          <p className="text-xs text-rose-900 leading-relaxed font-bold mb-4">
            Derive Islamic history and traditional seasons with Gemini Intelligence.
          </p>
          <button 
            onClick={handleFetchDateSignificance}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl text-[10px] font-black tracking-wide shadow-md shadow-rose-200 transition-all uppercase cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            Analyze Significance
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT COLUMN (Full scroll height, clean layout alignment) */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full select-text">
        
        {/* Sticky Professional Top Header */}
        <header className="h-24 bg-white border-b border-slate-200 px-6 sm:px-10 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Assalamu Alaikum, SirSufyian!</span>
              <span className="hidden sm:inline-block font-calligraphy text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-0.5 rounded-full">
                السلام علیکم
              </span>
            </h1>
            <p className="text-[10px] text-indigo-650 text-indigo-600 font-extrabold uppercase tracking-widest">
              Selected: {computedDateData.gregorian.dayName}, {computedDateData.gregorian.day} {computedDateData.gregorian.monthName} {computedDateData.gregorian.year}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Visual alert dot */}
            <div className="relative items-center hidden sm:flex">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute right-0 top-0 animate-ping"></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute right-0 top-0"></div>
              <div className="w-10 h-10 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center text-slate-600 font-extrabold text-xs">
                SS
              </div>
            </div>

            <button
              onClick={handleSetToday}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-xs tracking-wider shadow-lg shadow-indigo-100 hover:scale-[1.03] active:scale-95 transition-transform uppercase cursor-pointer"
            >
              Today — آج
            </button>
          </div>
        </header>

        {/* Workspace Panels Containers */}
        <div className="p-5 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Section: Mobile Header (Logo & Intro for compact list) */}
          <div className="lg:hidden block bg-white rounded-[32px] p-6 border border-slate-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
              </div>
              <span className="text-xl font-black tracking-tight text-indigo-950 uppercase italic font-mono">Taqweem</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              Three Calendars with Real-time Coordinates prayer computing & AI insights
            </p>
          </div>

          {/* Section: Dynamic Config Slide controls */}
          <section id="navigation-section" className="bg-white rounded-[40px] shadow-2xl shadow-slate-100/60 border border-slate-100/80 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              
              {/* Yesterday/Reset/Tomorrow button sets */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <button
                  id="btn-day-prev"
                  onClick={() => adjustDays(-1)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-black rounded-2xl text-slate-700 transition-all cursor-pointer"
                  title="Yesterday"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                  <span>گزشتہ کل</span>
                </button>

                <button
                  id="btn-day-today"
                  onClick={handleSetToday}
                  className="flex-1 sm:flex-initial py-3 px-5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-black rounded-2xl transition-all shadow-md cursor-pointer"
                  title="Reset to today"
                >
                  آج (Today)
                </button>

                <button
                  id="btn-day-next"
                  onClick={() => adjustDays(1)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-black rounded-2xl text-slate-700 transition-all cursor-pointer"
                  title="Tomorrow"
                >
                  <span>اگلا دن</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Custom Date Pick form */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <label htmlFor="gregorian-picker" className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Select Custom Date:
                </label>
                
                <div className="relative">
                  <input
                    id="gregorian-picker"
                    type="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(new Date(e.target.value));
                      }
                    }}
                    className="w-full sm:w-56 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-850 font-black font-mono text-xs py-3 px-4 rounded-2xl outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Hijri Lunar Offset slide adjustments */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto border-t border-slate-100 pt-5 lg:pt-0 lg:border-t-0">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Hijri Adapt ({hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}d)
                    </span>
                  </div>
                  <span className="font-calligraphy text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    چاند موافقت
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
                  {[-2, -1, 0, 1].map((offset) => (
                    <button
                      id={`offset-adjust-${offset}`}
                      key={offset}
                      onClick={() => setHijriOffset(offset)}
                      className={`py-1.5 px-3.5 text-xs font-black font-mono rounded-xl transition-all cursor-pointer ${
                        hijriOffset === offset
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {offset > 0 ? `+${offset}` : offset}d
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Section: "AAJ KI BAAT" Dark Indigo Card (Similar to active project card in Design HTML) */}
          <section id="quote-section">
            <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 border border-indigo-500/10">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Text Side */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 text-[10px] font-black uppercase tracking-widest bg-white/20 text-white rounded-full flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse animate-spin-slow" />
                      Aaj Ki Baat — آج کی بات
                    </span>
                    <span className="px-3 py-0.5 text-[9px] font-black uppercase tracking-widest bg-yellow-400 text-indigo-950 rounded-full">
                      AI Daily Guide
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuote.quote}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <blockquote className="font-calligraphy text-2xl sm:text-3xl md:text-4xl font-black leading-relaxed text-amber-100">
                        "{currentQuote.quote}"
                      </blockquote>
                      <p className="text-xs sm:text-sm text-indigo-200/80 italic font-medium mt-3 pr-10 text-right">
                        — {currentQuote.author}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Generator Button */}
                <div className="shrink-0 w-full md:w-auto">
                  <button
                    id="btn-ai-quote-generate"
                    onClick={handleFetchAiQuote}
                    disabled={currentQuote.isLoading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-white hover:bg-amber-100 text-indigo-950 text-xs font-black rounded-2xl shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${currentQuote.isLoading ? "animate-spin" : ""}`} />
                    <span>{currentQuote.isLoading ? "تلاش جاری ہے..." : "تبدیل کریں (Ask AI)"}</span>
                  </button>
                </div>

              </div>

              {/* Absolute circles matching Design HTML */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-30 pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-indigo-400 rounded-full opacity-25 pointer-events-none" />
            </div>
          </section>

          {/* Section: Three Calendar Cards wrapper (Using our super rounded elements) */}
          <section id="card-section">
            <CalendarCard 
              dateData={computedDateData} 
              onAskSignificance={handleFetchDateSignificance}
              isLoadingHistory={dateSignificance.isLoading}
            />
          </section>

          {/* Section: Prayers Schedules with color highlights */}
          <section id="prayer-section">
            <PrayerTimesCard
              selectedDate={selectedDate}
              activeCity={activeCity}
              setActiveCity={setActiveCity}
              asrMethod={asrMethod}
              setAsrMethod={setAsrMethod}
            />
          </section>

          {/* Section: Share poster social panels */}
          <section id="poster-section">
            <SharePoster
              dateData={computedDateData}
              quoteText={currentQuote.quote}
              quoteAuthor={currentQuote.author}
            />
          </section>

        </div>

        {/* Footer info blocks */}
        <footer className="mt-auto py-10 text-center text-xs text-slate-400 border-t border-slate-200 bg-white w-full px-6">
          <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400 leading-relaxed">
            Taqweem Daily Calendar — Astronomic, Traditional, Seasonal Indices
          </p>
          <p className="mt-1 font-medium">
            sirsufyian@gmail.com • Crafted using astronomical matrices and Gemini Intelligence
          </p>
        </footer>

      </main>

      {/* 3. GEMINI SIGNIFICANCE OVERLAY SHEET PANEL (Animated popup card inside dynamic screen shadow) */}
      <AnimatePresence>
        {dateSignificance.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-100 shadow-2xl relative"
            >
              <button
                id="close-overlay-btn"
                onClick={handleCloseSignificance}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-6 h-6 text-indigo-600 animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Date Significance & History (تاریخی پس منظر)
                </h3>
              </div>

              {/* Three quick badges */}
              <div className="border border-indigo-100 bg-indigo-50/30 rounded-3xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold uppercase tracking-wider">
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-100/80 shadow-xs">
                    <p className="text-slate-400 text-[10px]">Gregorian</p>
                    <p className="font-black text-slate-800 text-xs mt-0.5">{computedDateData.gregorian.day} {computedDateData.gregorian.monthName}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-100/80 shadow-xs">
                    <p className="text-slate-400 text-[10px]">Hijri</p>
                    <p className="font-black text-emerald-800 text-xs mt-0.5">{computedDateData.hijri.day} {computedDateData.hijri.monthName}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-100/80 shadow-xs">
                    <p className="text-slate-400 text-[10px]">Bikarmi</p>
                    <p className="font-black text-amber-800 text-xs mt-0.5">{computedDateData.bikarmi.day} {computedDateData.bikarmi.monthName}</p>
                  </div>
                </div>
              </div>

              {dateSignificance.isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="font-calligraphy text-2xl font-black text-slate-800">علم و حکمت کے خزانے تلاش کیے جا رہے ہیں...</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Querying historical significance with Gemini...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Urdu calligraphic block */}
                  <div className="p-6 bg-slate-50 border border-slate-150 rounded-3xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">تفصیلی جائزہ (Commentary)</span>
                    <p className="font-calligraphy text-xl leading-relaxed text-slate-800 font-medium text-right font-semibold">
                      {dateSignificance.significance}
                    </p>
                  </div>

                  {/* English block */}
                  <div className="p-6 border border-slate-150 rounded-3xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">English Summary</span>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bold">
                      {dateSignificance.englishSummary}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      id="overlay-okay-btn"
                      onClick={handleCloseSignificance}
                      className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-950 text-white font-black rounded-2xl text-xs uppercase tracking-wide transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                      شکریہ — Okay, Got It
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
