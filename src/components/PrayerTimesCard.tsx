import React from "react";
import { computePrayerTimes, PRESETS } from "../utils/prayerTimes";
import { MapPin, Clock, Map } from "lucide-react";

interface PrayerTimesCardProps {
  selectedDate: Date;
  activeCity: string;
  setActiveCity: (cityName: string) => void;
  asrMethod: "shafi" | "hanafi";
  setAsrMethod: (method: "shafi" | "hanafi") => void;
}

export default function PrayerTimesCard({
  selectedDate,
  activeCity,
  setActiveCity,
  asrMethod,
  setAsrMethod
}: PrayerTimesCardProps) {
  // Find current active city presets
  const currentPreset = PRESETS.find((p) => p.name === activeCity) || PRESETS[0];

  // Calculate prayer times
  const prayerTimes = computePrayerTimes(
    selectedDate,
    currentPreset.latitude,
    currentPreset.longitude,
    currentPreset.timezone,
    { fajrAngle: 18, ishaAngle: 18, asrMethod }
  );

  return (
    <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/30 border border-slate-100/80 p-6 sm:p-8">
      {/* Header section with Location Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-6 mb-6 gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Clock className="w-6 h-6 text-indigo-600 animate-pulse" />
            <span>Prayer Times Schedule (اوقاتِ نماز)</span>
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
            Astronomically computed timings for {currentPreset.name} (GMT+{currentPreset.timezone})
          </p>
        </div>

        {/* Preset Select & Method Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selective dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-black text-slate-705">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <select
              id="city-select"
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="bg-transparent border-none font-bold outline-none cursor-pointer text-slate-800 focus:ring-0"
            >
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} — {p.urduName}
                </option>
              ))}
            </select>
          </div>

          {/* Jurisprudence Method Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
            <button
              id="shafi-btn"
              onClick={() => setAsrMethod("shafi")}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                asrMethod === "shafi"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-150"
                  : "text-slate-404 text-slate-500 hover:text-slate-800"
              }`}
              title="Standard Shafi/Maliki/Hanbali/Ja'fari Asr shadow method"
            >
              Shafi / دیگر
            </button>
            <button
              id="hanafi-btn"
              onClick={() => setAsrMethod("hanafi")}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                asrMethod === "hanafi"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-150"
                  : "text-slate-404 text-slate-500 hover:text-slate-800"
              }`}
              title="Hanafi Asr shadow method (South Asia standard)"
            >
              Hanafi / حنفی
            </button>
          </div>
        </div>
      </div>

      {/* Grid listing prayer times with Vibrant sunset-matching themes */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {prayerTimes.map((prayer, idx) => {
          // Define beautiful colored styles for prayer times corresponding to solar cycles
          let colorScheme = {
            bg: "bg-indigo-50/50 border-indigo-100 hover:border-indigo-200 hover:shadow-indigo-50",
            label: "text-indigo-500",
            badge: "bg-indigo-100/50 text-indigo-800 font-black",
          };

          if (prayer.name === "Fajr") {
            colorScheme = {
              bg: "bg-sky-50/50 border-sky-100 hover:border-sky-200 hover:shadow-sky-50",
              label: "text-sky-550 text-sky-600",
              badge: "bg-sky-100/50 text-sky-800 font-extrabold",
            };
          } else if (prayer.name === "Sunrise") {
            colorScheme = {
              bg: "bg-amber-50/70 border-amber-200/50 hover:border-amber-300 hover:shadow-amber-50",
              label: "text-amber-600",
              badge: "bg-amber-100 text-amber-900 font-black",
            };
          } else if (prayer.name === "Dhuhr") {
            colorScheme = {
              bg: "bg-cyan-50/40 border-cyan-100 hover:border-cyan-200 hover:shadow-cyan-50",
              label: "text-cyan-600",
              badge: "bg-cyan-100/50 text-cyan-800 font-extrabold",
            };
          } else if (prayer.name === "Asr") {
            colorScheme = {
              bg: "bg-orange-50/40 border-orange-100 hover:border-orange-200 hover:shadow-orange-50",
              label: "text-orange-600",
              badge: "bg-orange-100/50 text-orange-850 font-black",
            };
          } else if (prayer.name === "Maghrib") {
            colorScheme = {
              bg: "bg-rose-50/60 border-rose-100 hover:border-rose-200 hover:shadow-rose-100/30",
              label: "text-rose-600",
              badge: "bg-rose-100/60 text-rose-800 font-black",
            };
          } else if (prayer.name === "Isha") {
            colorScheme = {
              bg: "bg-violet-50/40 border-violet-100 hover:border-violet-200 hover:shadow-violet-50",
              label: "text-violet-600",
              badge: "bg-violet-100/50 text-violet-850 font-black",
            };
          }

          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg flex flex-col justify-between ${colorScheme.bg}`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest block ${colorScheme.label}`}>
                  {prayer.name}
                </span>
                <span className="font-calligraphy text-2xl font-black text-slate-900 block mt-1.5 leading-tight">
                  {prayer.urduName}
                </span>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-black font-mono px-3 py-1.5 rounded-xl block text-center ${colorScheme.badge}`}>
                  {prayer.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coordinates details */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider p-4 rounded-2xl border border-slate-100/80 gap-2">
        <span className="flex items-center gap-1.5">
          <Map className="w-4 h-4 text-slate-400" />
          Coordinates: {currentPreset.latitude}° N, {currentPreset.longitude}° E
        </span>
        <span className="text-center sm:text-right">
          Astronomical angles: 18° Fajr / 18° Isha • standard high-precision formulae
        </span>
      </div>
    </div>
  );
}
