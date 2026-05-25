import React, { useState } from "react";
import { DateData } from "../types";
import { Copy, Check, Info, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface CalendarCardProps {
  dateData: DateData;
  onAskSignificance: (calendarType: "all" | "gregorian" | "hijri" | "bikarmi") => void;
  isLoadingHistory: boolean;
}

export default function CalendarCard({ dateData, onAskSignificance, isLoadingHistory }: CalendarCardProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const { gregorian, hijri, bikarmi } = dateData;

  const cards = [
    {
      id: "gregorian",
      title: "Esvi Calendar (عیسوی تقویم)",
      subtitle: "Civil & Solar Standard",
      headerBg: "from-indigo-600 via-indigo-700 to-indigo-900",
      accentBg: "bg-indigo-50/50 border-indigo-100/50 text-indigo-950",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      shadowStyle: "shadow-2xl shadow-indigo-100/40 hover:shadow-indigo-200/60 hover:scale-[1.01]",
      isDarkText: false,
      emoji: "📅",
      data: [
        { label: "Day", value: gregorian.dayName, labelUrdu: "آج کا دن", valueUrdu: gregorian.dayNameUrdu },
        { label: "Date", value: String(gregorian.day), labelUrdu: "تاریخ", valueUrdu: gregorian.dayUrdu },
        { label: "Month", value: gregorian.monthName, labelUrdu: "مہینہ", valueUrdu: gregorian.monthNameUrdu },
        { label: "Year", value: String(gregorian.year), labelUrdu: "سال", valueUrdu: gregorian.yearUrdu },
      ],
      copyText: `عیسوی تاریخ: ${gregorian.dayNameUrdu}، ${gregorian.dayUrdu} ${gregorian.monthNameUrdu} ${gregorian.yearUrdu} (${gregorian.dayName}, ${gregorian.day} ${gregorian.monthName} ${gregorian.year})`,
    },
    {
      id: "hijri",
      title: "Hijri Calendar (ہجری تقویم)",
      subtitle: "Lunar & Islamic Cycles",
      headerBg: "from-emerald-500 to-emerald-700",
      accentBg: "bg-emerald-50/70 border-emerald-100 text-emerald-900",
      badgeColor: "bg-emerald-100/75 text-emerald-850 border-emerald-250",
      shadowStyle: "shadow-2xl shadow-emerald-100/40 hover:shadow-emerald-200/60 hover:scale-[1.01]",
      isDarkText: false,
      emoji: "🌙",
      data: [
        { label: "Islamic Date", value: String(hijri.day), labelUrdu: "ہجری تاریخ", valueUrdu: hijri.dayUrdu },
        { label: "Holy Month", value: hijri.monthName, labelUrdu: "اسلامی مہینہ", valueUrdu: hijri.monthNameUrdu },
        { label: "Hijri Year", value: `${hijri.year} AH`, labelUrdu: "ہجری سال", valueUrdu: `${hijri.yearUrdu} ھ` },
      ],
      copyText: `ہجری تاریخ: ${hijri.dayUrdu} ${hijri.monthNameUrdu} ${hijri.yearUrdu} ھ (${hijri.day} ${hijri.monthName} ${hijri.year} AH)`,
    },
    {
      id: "bikarmi",
      title: "Bikarmi Calendar (بکرمی تقویم)",
      subtitle: "Traditional Punjab Desi Seasons",
      headerBg: "from-amber-405 from-amber-400 to-amber-500",
      accentBg: "bg-amber-50/70 border-amber-150 text-amber-950",
      badgeColor: "bg-amber-100 text-amber-850 border-amber-300",
      shadowStyle: "shadow-2xl shadow-amber-150/40 hover:shadow-amber-200/60 hover:scale-[1.01]",
      isDarkText: true,
      emoji: "🌾",
      data: [
        { label: "Desi Date", value: String(bikarmi.day), labelUrdu: "بکرمی تاریخ", valueUrdu: bikarmi.dayUrdu },
        { label: "Desi Month", value: bikarmi.monthName, labelUrdu: "دیسی مہینہ", valueUrdu: bikarmi.monthNameUrdu },
        { label: "Bikarmi Year", value: `${bikarmi.year} BK`, labelUrdu: "بکرمی سال", valueUrdu: `${bikarmi.yearUrdu} بکرمی` },
      ],
      copyText: `بکرمی تاریخ: ${bikarmi.dayUrdu} ${bikarmi.monthNameUrdu} ${bikarmi.yearUrdu} بکرمی (${bikarmi.day} ${bikarmi.monthName} ${bikarmi.year} BK)`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          id={`card-${card.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`bg-white rounded-[40px] border border-slate-100 overflow-hidden flex flex-col justify-between transition-all duration-300 ${card.shadowStyle}`}
        >
          {/* Header Panel */}
          <div className={`p-6 bg-gradient-to-r ${card.headerBg} ${card.isDarkText ? "text-amber-950" : "text-white"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-2xl">{card.emoji}</span>
              <button
                id={`copy-btn-${card.id}`}
                onClick={() => handleCopy(card.copyText, card.id)}
                className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
                  card.isDarkText ? "bg-black/10 hover:bg-black/20 text-amber-950" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Copy formatted date to clipboard"
              >
                {copiedType === card.id ? (
                  <Check className={`w-4.5 h-4.5 ${card.isDarkText ? "text-amber-950" : "text-emerald-300"}`} />
                ) : (
                  <Copy className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
            <h3 className="font-sans font-black text-xl tracking-tight">{card.title}</h3>
            <p className={`text-xs mt-0.5 font-bold uppercase tracking-wider ${card.isDarkText ? "text-amber-900/70" : "text-white/70"}`}>
              {card.subtitle}
            </p>
          </div>

          {/* Body List */}
          <div className="p-6 flex-1 space-y-4">
            {card.data.map((row, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-100 last:border-b-0 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                {/* LTR label & value */}
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{row.label}</span>
                  <span className="text-sm font-black text-slate-800">{row.value}</span>
                </div>

                {/* RTL calligraphic Urdu label & value */}
                <div className="text-right dir-rtl font-calligraphy">
                  <span className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider block">{row.labelUrdu}</span>
                  <span className="text-2xl font-black text-slate-900">{row.valueUrdu}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Date Highlight and Historical Action Footer */}
          <div className="px-6 pb-6 pt-2">
            <div className={`p-4 rounded-3xl border ${card.accentBg} flex flex-col items-stretch space-y-2`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                  Season/Significance
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${card.badgeColor} uppercase`}>
                  {card.id === "gregorian"
                    ? `Month #${gregorian.month}`
                    : card.id === "hijri"
                    ? `${hijri.monthName}`
                    : `${bikarmi.monthName} (دیسی)`}
                </span>
              </div>
              <p className="text-xs font-bold font-calligraphy text-right leading-relaxed text-slate-800">
                {card.id === "gregorian" && (
                  <>سال کا {gregorian.monthNameUrdu} کا خوبصورت مہینہ ہے جو عام طور پر اپنے دلفریب درجہ حرارت کی وجہ سے منفرد حیثیت رکھتا ہے۔</>
                )}
                {card.id === "hijri" && (
                  <>اسلامی ماہ {hijri.monthNameUrdu} کی مبارک تاریخ {hijri.dayUrdu} جو کہ دینی روایات اور عبادات کا ایک گراں قدر حصہ ہے۔</>
                )}
                {card.id === "bikarmi" && (
                  <>دیسی موسم کا {bikarmi.monthNameUrdu} کا خوبصورت دیسی دور جو دیہی معیشت اور پنجاب کی زرخیزی کی تصویر پیش کرتا ہے۔</>
                )}
              </p>
            </div>

            <button
              id={`history-btn-${card.id}`}
              onClick={() => onAskSignificance("all")}
              disabled={isLoadingHistory}
              className="mt-3.5 w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-950 rounded-2xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span>تاریخی پس منظر (View Significance)</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
