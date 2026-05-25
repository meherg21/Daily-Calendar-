import React, { useState } from "react";
import { DateData } from "../types";
import { Copy, Check, Palette, Smartphone, Sparkles } from "lucide-react";

interface SharePosterProps {
  dateData: DateData;
  quoteText: string;
  quoteAuthor: string;
}

export default function SharePoster({ dateData, quoteText, quoteAuthor }: SharePosterProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [posterTheme, setPosterTheme] = useState<"emerald" | "amber" | "indigo">("emerald");

  const { gregorian, hijri, bikarmi } = dateData;

  // Formatting standard rich text message for WhatsApp/Social sharing
  const rawWhatsAppText = `*اَلسَّلَامُ عَلَیْکُم وَرَحْمَةُ اللهِ وَبَرَكَاتُه* 🌹

*✨ آج کی خوبصورت بات (Aaj Ki Baat):*
"${quoteText}"
— _${quoteAuthor}_

*📅 آج کا روزانہ کیلنڈر (Daily Calendar):*
- *عیسوی تاریخ:* ${gregorian.dayNameUrdu}، ${gregorian.dayUrdu} ${gregorian.monthNameUrdu} ${gregorian.yearUrdu}
- *ہجری تاریخ:* ${hijri.dayUrdu} ${hijri.monthNameUrdu} ${hijri.yearUrdu} ھ
- *بکرمی تاریخ:* ${bikarmi.dayUrdu} ${bikarmi.monthNameUrdu} ${bikarmi.yearUrdu} بکرمی

*🌐 Civil Format:*
- Gregorian: ${gregorian.dayName}, ${gregorian.day} ${gregorian.monthName} ${gregorian.year}
- Hijri: ${hijri.day} ${hijri.monthName} ${hijri.year} AH
- Bikarmi: ${bikarmi.day} ${bikarmi.monthName} ${bikarmi.year} BK

Have a blessed day! ✨

*📢 Follow for more:*
🔵 *Facebook:* @SirSufyian
🎵 *TikTok:* @SirSufyian

_Created with Daily Calendar_`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(rawWhatsAppText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const themes = {
    emerald: {
      bg: "from-emerald-900 via-emerald-950 to-teal-950",
      accent: "border-emerald-200/20 bg-emerald-950/40",
      textUrdu: "text-emerald-50",
      quoteBox: "bg-emerald-800/20 border-emerald-500/25",
      goldBorder: "border-amber-400/30",
      label: "text-emerald-300",
    },
    amber: {
      bg: "from-amber-850 via-amber-900 to-orange-950",
      accent: "border-amber-200/20 bg-amber-950/40",
      textUrdu: "text-amber-50",
      quoteBox: "bg-amber-800/25 border-amber-500/25",
      goldBorder: "border-amber-300/40",
      label: "text-amber-300",
    },
    indigo: {
      bg: "from-slate-900 via-indigo-950 to-indigo-950",
      accent: "border-slate-300/10 bg-indigo-950/50",
      textUrdu: "text-indigo-50",
      quoteBox: "bg-indigo-800/20 border-indigo-500/15",
      goldBorder: "border-amber-400/25",
      label: "text-indigo-300",
    },
  };

  const activeTheme = themes[posterTheme] || themes.emerald;

  return (
    <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/30 border border-slate-100/80 p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        
        {/* Left Side: Visual Card Poster Mockup */}
        <div className="w-full lg:w-3/5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="text-xl font-black text-slate-900 flex items-center gap-1.5 tracking-tight">
                <Palette className="w-6 h-6 text-indigo-600 animate-spin-slow" />
                <span>Greeting Card Poster Mock (ڈیجیٹل کارڈ)</span>
              </h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Visualize or share a custom everyday digest poster</p>
            </div>

            {/* Change poster theme presets */}
            <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shrink-0">
              {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
                <button
                  id={`theme-select-${t}`}
                  key={t}
                  onClick={() => setPosterTheme(t)}
                  className={`w-6 h-6 rounded-full border border-white/20 transition-all cursor-pointer ${
                    t === "emerald"
                      ? "bg-emerald-700"
                      : t === "amber"
                      ? "bg-amber-500"
                      : "bg-indigo-700"
                  } ${posterTheme === t ? "ring-2 ring-indigo-505 ring-indigo-500 ring-offset-2 scale-110" : "opacity-70 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>

          {/* Render Actual Visual Post Card */}
          <div
            id="greeting-card-element"
            className={`w-full bg-gradient-to-b ${activeTheme.bg} rounded-[40px] p-6 sm:p-8 text-white border-4 ${activeTheme.goldBorder} shadow-2xl relative overflow-hidden font-calligraphy transition-all duration-300`}
          >
            {/* Dynamic visual framing rings */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center font-sans tracking-widest text-[10px] text-amber-300 uppercase font-black mb-1">
              🕌 Daily Spiritual Reflections • روزانہ پیغام
            </div>

            <div className="text-center font-calligraphy text-2xl sm:text-3xl font-black text-amber-200 tracking-wide my-4 leading-relaxed">
              *اَلسَّلَامُ عَلَیْکُم وَرَحْمَةُ اللهِ وَبَرَكَاتُه*
            </div>

            {/* Highlighted Quote section */}
            <div className={`p-5 sm:p-6 rounded-3xl border ${activeTheme.quoteBox} text-center my-6 relative shadow-inner`}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-400/30 px-4 py-0.5 rounded-full text-[9px] uppercase font-sans text-amber-300 tracking-widest font-black">
                ✨ Aaj Ki Baat ✨
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-100 min-h-[44px] flex items-center justify-center leading-relaxed">
                "{quoteText}"
              </p>
              <p className="text-right text-xs text-amber-300/80 italic mt-3 font-sans pr-4">
                — {quoteAuthor}
              </p>
            </div>

            {/* Three Calendars horizontal representation */}
            <div className="grid grid-cols-1 gap-3 mt-6">
              <div className={`py-3 px-4 rounded-2xl border ${activeTheme.accent} flex justify-between items-center transition-all`}>
                <span className={`text-[10px] uppercase tracking-widest font-sans font-black ${activeTheme.label}`}>Gregorian</span>
                <span className="text-xs font-sans font-bold text-white/70 hidden sm:inline">
                  {gregorian.dayName}, {gregorian.day} {gregorian.monthName}
                </span>
                <span className="text-lg font-black text-right text-amber-100">
                  {gregorian.dayNameUrdu}، {gregorian.dayUrdu} {gregorian.monthNameUrdu}
                </span>
              </div>

              <div className={`py-3 px-4 rounded-2xl border ${activeTheme.accent} flex justify-between items-center transition-all`}>
                <span className={`text-[10px] uppercase tracking-widest font-sans font-black ${activeTheme.label}`}>Hijri</span>
                <span className="text-xs font-sans font-bold text-white/70 hidden sm:inline">
                  {hijri.day} {hijri.monthName} {hijri.year} AH
                </span>
                <span className="text-lg font-black text-right text-amber-100">
                  {hijri.dayUrdu} {hijri.monthNameUrdu} {hijri.yearUrdu}ھ
                </span>
              </div>

              <div className={`py-3 px-4 rounded-2xl border ${activeTheme.accent} flex justify-between items-center transition-all`}>
                <span className={`text-[10px] uppercase tracking-widest font-sans font-black ${activeTheme.label}`}>Bikarmi</span>
                <span className="text-xs font-sans font-bold text-white/70 hidden sm:inline">
                  {bikarmi.day} {bikarmi.monthName} {bikarmi.year} BK
                </span>
                <span className="text-lg font-black text-right text-amber-100">
                  {bikarmi.dayUrdu} {bikarmi.monthNameUrdu} {bikarmi.yearUrdu} بکرمی
                </span>
              </div>
            </div>

            <div className="text-center font-sans text-[8px] text-white/40 mt-5 tracking-widest uppercase font-bold">
              Faith • Season • Tradition • computed dynamically using solar & lunar orbits
            </div>

            {/* Social handles visual branding */}
            <div className="mt-4 pt-4 border-t border-white/15 flex justify-center items-center gap-6 text-white/70 font-sans text-xs">
              <span className="text-[9px] text-amber-300 font-black tracking-widest uppercase">Follow for more:</span>
              <div className="flex items-center gap-1.5 transition-colors">
                <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
                <span className="font-black text-[11px] tracking-tight">@SirSufyian</span>
              </div>
              <div className="flex items-center gap-1.5 transition-colors">
                <svg className="w-3.5 h-3.5 fill-current text-teal-400" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.12a7.21 7.21 0 0 0-1-.07 6.39 6.39 0 0 0-6.39 6.39 6.39 6.39 0 0 0 10.15 5.12 6.39 6.39 0 0 0 2.65-5.12V8.33a8.38 8.38 0 0 0 4.38 1.25V6.13c-.16-.01-.33-.03-.52-.05z" />
                </svg>
                <span className="font-black text-[11px] tracking-tight">@SirSufyian</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Copy & Sharing triggers */}
        <div className="w-full lg:w-2/5 flex flex-col justify-between self-stretch">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex-1 mb-6">
            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Smartphone className="w-4 h-4 text-slate-400" />
              WhatsApp Message Preview
            </h5>
            <div className="text-xs font-mono text-slate-600 space-y-1 select-all h-[240px] overflow-y-auto whitespace-pre-wrap bg-white/70 p-4 rounded-2xl border border-slate-100/80">
              {rawWhatsAppText}
            </div>
          </div>

          <div className="space-y-3">
            <button
              id="copy-whatsapp-btn"
              onClick={handleCopyText}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-700/15 cursor-pointer hover:scale-[1.01]"
            >
              {copiedText ? (
                <>
                  <Check className="w-5 h-5 text-emerald-100" />
                  <span>Copied successfully (کاپی ہو گیا!)</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy WhatsApp Text Layout (کاپی اردو ٹیکسٹ)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
              Ready-to-paste stars, emojis, and daily indices
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
