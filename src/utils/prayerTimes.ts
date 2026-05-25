import { PrayerTime } from "../types";

// Pre-defined coordinates for major cities
export const PRESETS = [
  { name: "Lahore", urduName: "لاہور", latitude: 31.5204, longitude: 74.3587, timezone: 5 },
  { name: "Karachi", urduName: "کراچی", latitude: 24.8607, longitude: 67.0011, timezone: 5 },
  { name: "Islamabad", urduName: "اسلام آباد", latitude: 33.6844, longitude: 73.0479, timezone: 5 },
  { name: "Peshawar", urduName: "پشاور", latitude: 34.0151, longitude: 71.5249, timezone: 5 },
  { name: "Quetta", urduName: "کوئٹہ", latitude: 30.1798, longitude: 66.9750, timezone: 5 },
  { name: "Multan", urduName: "ملتان", latitude: 30.1575, longitude: 71.5249, timezone: 5 },
  { name: "Faisalabad", urduName: "فیصل آباد", latitude: 31.4504, longitude: 73.1350, timezone: 5 },
  { name: "Mecca", urduName: "مکہ مکرمہ", latitude: 21.3891, longitude: 39.8579, timezone: 3 },
  { name: "Medina", urduName: "مدینہ منورہ", latitude: 24.4672, longitude: 39.6111, timezone: 3 },
  { name: "Dubai", urduName: "دبئی", latitude: 25.2048, longitude: 55.2708, timezone: 4 },
  { name: "London", urduName: "لندن", latitude: 51.5074, longitude: -0.1278, timezone: 1 },
  { name: "New York", urduName: "نیویارک", latitude: 40.7128, longitude: -74.0060, timezone: -4 },
];

// Mathematical Helper Functions for Astronomy Calculation
function dtr(d: number) { return (d * Math.PI) / 180.0; }
function rtd(r: number) { return (r * 180.0) / Math.PI; }

interface CalculationConfig {
  fajrAngle: number;
  ishaAngle: number;
  asrMethod: "shafi" | "hanafi"; // 1 for Shafi, 2 for Hanafi shadow
}

export function computePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone: number,
  config: CalculationConfig = { fajrAngle: 18, ishaAngle: 18, asrMethod: "hanafi" }
): PrayerTime[] {
  // 1. Calculate Day of the Year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // 2. Simple Astronomical Equations for Solar Declination and Equation of time
  // Earth's mean anomaly
  const g = 357.5291 + 0.98560028 * dayOfYear;
  // Ecliptic longitude
  const q = 280.459 + 0.98564736 * dayOfYear;
  const L = q + 1.915 * Math.sin(dtr(g)) + 0.020 * Math.sin(dtr(2 * g));
  
  // Sun's declination
  const e = 23.439 - 0.00000036 * dayOfYear;
  const declination = rtd(Math.asin(Math.sin(dtr(e)) * Math.sin(dtr(L))));

  // Equation of time (in minutes)
  const RA = rtd(Math.atan2(Math.cos(dtr(e)) * Math.sin(dtr(L)), Math.cos(dtr(L))));
  const RA_mod = (RA + 360) % 360;
  // Solar transit / mid day
  const L_mod = (L + 360) % 360;
  const eqt = (L_mod - RA_mod) * 4; // roughly minutes difference

  // 3. Solar Noon (Dhuhr)
  // Noon is 12:00 in solar time. Convert to local time:
  const baseNoon = 12.0 - lng / 15.0 + timezone - eqt / 60.0;
  
  // Adjust boundary times (wrapping hours)
  const dhuhrTime = (baseNoon + 24) % 24;

  // 4. Sunrise and Sunset
  // Angle for sunrise/sunset (under horizon, -0.833 degrees is standard)
  const sunsetAngle = -0.833;
  const cosH_sunset = (Math.sin(dtr(sunsetAngle)) - Math.sin(dtr(lat)) * Math.sin(dtr(declination))) /
                       (Math.cos(dtr(lat)) * Math.cos(dtr(declination)));
  
  let sunsetOffset = 6.0; // Fallback
  if (cosH_sunset >= -1 && cosH_sunset <= 1) {
    sunsetOffset = rtd(Math.acos(cosH_sunset)) / 15.0;
  }
  const sunsetTime = (dhuhrTime + sunsetOffset + 24) % 24;
  const sunriseTime = (dhuhrTime - sunsetOffset + 24) % 24;

  // 5. Fajr
  const cosH_fajr = (Math.sin(dtr(-config.fajrAngle)) - Math.sin(dtr(lat)) * Math.sin(dtr(declination))) /
                    (Math.cos(dtr(lat)) * Math.cos(dtr(declination)));
  let fajrOffset = sunsetOffset + 1.2; // Fallback if sun never goes below angle
  if (cosH_fajr >= -1 && cosH_fajr <= 1) {
    fajrOffset = rtd(Math.acos(cosH_fajr)) / 15.0;
  }
  const fajrTime = (dhuhrTime - fajrOffset + 24) % 24;

  // 6. Isha
  const cosH_isha = (Math.sin(dtr(-config.ishaAngle)) - Math.sin(dtr(lat)) * Math.sin(dtr(declination))) /
                     (Math.cos(dtr(lat)) * Math.cos(dtr(declination)));
  let ishaOffset = sunsetOffset + 1.2; // Fallback
  if (cosH_isha >= -1 && cosH_isha <= 1) {
    ishaOffset = rtd(Math.acos(cosH_isha)) / 15.0;
  }
  const ishaTime = (dhuhrTime + ishaOffset + 24) % 24;

  // 7. Asr (Shafi/Hanafi shadow calculation)
  const shadowFactor = config.asrMethod === "hanafi" ? 2 : 1;
  const lat_decl_diff = Math.abs(lat - declination);
  const cot_altitude = shadowFactor + Math.tan(dtr(lat_decl_diff));
  const asr_altitude = rtd(Math.atan(1.0 / cot_altitude));
  
  const cosH_asr = (Math.sin(dtr(asr_altitude)) - Math.sin(dtr(lat)) * Math.sin(dtr(declination))) /
                   (Math.cos(dtr(lat)) * Math.cos(dtr(declination)));
  let asrOffset = 3.5; // Fallback
  if (cosH_asr >= -1 && cosH_asr <= 1) {
    asrOffset = rtd(Math.acos(cosH_asr)) / 15.0;
  }
  const asrTime = (dhuhrTime + asrOffset + 24) % 24;

  // Formatter to trigger standard string (e.g. 13.52 -> "01:31 PM")
  const formatTimeStr = (hourFract: number): string => {
    const totalMinutes = Math.round(hourFract * 60);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const hrStr = hours12 < 10 ? `0${hours12}` : `${hours12}`;
    return `${hrStr}:${minStr} ${ampm}`;
  };

  return [
    { name: "Fajr", urduName: "فجر", time: formatTimeStr(fajrTime), icon: "Sunset" },
    { name: "Sunrise", urduName: "طلوعِ آفتاب", time: formatTimeStr(sunriseTime), icon: "Sun" },
    { name: "Dhuhr", urduName: "ظہر", time: formatTimeStr(dhuhrTime), icon: "SunDim" },
    { name: "Asr", urduName: "عصر", time: formatTimeStr(asrTime), icon: "Sun" },
    { name: "Maghrib", urduName: "مغرب", time: formatTimeStr(sunsetTime), icon: "Sunset" },
    { name: "Isha", urduName: "عشاء", time: formatTimeStr(ishaTime), icon: "Moon" },
  ];
}
