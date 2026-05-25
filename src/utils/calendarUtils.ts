import { DateData } from "../types";

// Helper to convert English digits to Urdu digits
export function toUrduDigits(num: number | string): string {
  const urduDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/[0-9]/g, (w) => urduDigits[parseInt(w)]);
}

// English and Urdu arrays for Gregorian calendar
const GREGORIAN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const GREGORIAN_DAYS_URDU = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

const GREGORIAN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const GREGORIAN_MONTHS_URDU = [
  "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
  "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسامبر"
];

// Calculation of Hijri Date using the browser's Intl calendar API
export function getHijriCalendar(date: Date, offsetDays: number) {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + offsetDays);

  try {
    // Format English
    const enFormatter = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const enParts = enFormatter.formatToParts(adjustedDate);
    const day = parseInt(enParts.find((p) => p.type === "day")?.value || "1", 10);
    const monthName = enParts.find((p) => p.type === "month")?.value || "Muharram";
    const year = parseInt(enParts.find((p) => p.type === "year")?.value.replace(/\D/g, "") || "1445", 10);

    // Format Urdu
    const urFormatter = new Intl.DateTimeFormat("ur-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const urParts = urFormatter.formatToParts(adjustedDate);
    const dayUrdu = urParts.find((p) => p.type === "day")?.value || toUrduDigits(day);
    const monthNameUrdu = urParts.find((p) => p.type === "month")?.value || "محرم";
    const yearUrdu = urParts.find((p) => p.type === "year")?.value.replace(/\D/g, "") || toUrduDigits(year);

    return {
      day,
      dayUrdu,
      monthName,
      monthNameUrdu,
      year,
      yearUrdu: toUrduDigits(year), // Using robust formatter for year digits
    };
  } catch (error) {
    console.error("Hijri calculation fallback triggered", error);
    // Simple fallback calculation
    return {
      day: 1,
      dayUrdu: "۱",
      monthName: "Muharram",
      monthNameUrdu: "محرم",
      year: 1447,
      yearUrdu: "۱۴۴۷",
    };
  }
}

// Bikarmi/Punjabi Desi Calendar Conversion
export function getBikarmiCalendar(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Bikarmi/Punjabi months with approximate Gregorian start dates
  const bikarmiMonthStarts = [
    { name: "Chet", urdu: "چیت", start: { m: 2, d: 14 } }, // Mar 14
    { name: "Vaisakh", urdu: "بیساکھ", start: { m: 3, d: 14 } }, // Apr 14
    { name: "Jeth", urdu: "جیٹھ", start: { m: 4, d: 15 } }, // May 15
    { name: "Harh", urdu: "ہاڑھ", start: { m: 5, d: 15 } }, // Jun 15
    { name: "Sawan", urdu: "ساون", start: { m: 6, d: 16 } }, // Jul 16
    { name: "Bhadon", urdu: "بھادوں", start: { m: 7, d: 16 } }, // Aug 16
    { name: "Assu", urdu: "اسو", start: { m: 8, d: 15 } }, // Sep 15
    { name: "Katak", urdu: "کاتک", start: { m: 9, d: 15 } }, // Oct 15
    { name: "Maghar", urdu: "مگھر", start: { m: 10, d: 14 } }, // Nov 14
    { name: "Poh", urdu: "پوہ", start: { m: 11, d: 14 } }, // Dec 14
    { name: "Magh", urdu: "ماگھ", start: { m: 0, d: 13 } }, // Jan 13
    { name: "Phagan", urdu: "پھاگن", start: { m: 1, d: 12 } }, // Feb 12
  ];

  let bikarmiYear = year + 57;
  let bikarmiDateVal = 1;
  const todayUTC = Date.UTC(year, month, day);

  let monthIndex = -1;
  for (let i = 0; i < 12; i++) {
    const start = bikarmiMonthStarts[i].start;
    const nextIndex = (i + 1) % 12;
    const nextStart = bikarmiMonthStarts[nextIndex].start;

    const startDateUTC = Date.UTC(year, start.m, start.d);
    
    // If next start month is earlier, it wraps to next year
    const nextYearVal = nextStart.m < start.m ? year + 1 : year;
    const nextStartDateUTC = Date.UTC(nextYearVal, nextStart.m, nextStart.d);

    if (todayUTC >= startDateUTC && todayUTC < nextStartDateUTC) {
      monthIndex = i;
      const timeDiff = todayUTC - startDateUTC;
      bikarmiDateVal = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      break;
    }
  }

  // Handle wraps / boundary dates where monthIndex might still be -1 due to edge conditions
  if (monthIndex === -1) {
    // If before Jan 13
    if (month === 0 && day < 13) {
      monthIndex = 9; // Poh of the previous year
      const startDateUTC = Date.UTC(year - 1, bikarmiMonthStarts[9].start.m, bikarmiMonthStarts[9].start.d);
      const timeDiff = todayUTC - startDateUTC;
      bikarmiDateVal = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    } else {
      // Default to Chet
      monthIndex = 0;
    }
  }

  const currentBikarmiMonth = bikarmiMonthStarts[monthIndex];

  // Adjust bikarmi year for early months
  if (month < 2 || (month === 2 && day < 14)) {
    bikarmiYear = year + 56;
  }

  return {
    day: bikarmiDateVal,
    dayUrdu: toUrduDigits(bikarmiDateVal),
    monthName: currentBikarmiMonth.name,
    monthNameUrdu: currentBikarmiMonth.urdu,
    year: bikarmiYear,
    yearUrdu: toUrduDigits(bikarmiYear),
  };
}

// Generate full dates data for a selected date
export function computeAllCalendars(date: Date, hijriOffset: number): DateData {
  const gDay = date.getDay();
  const gDate = date.getDate();
  const gMonth = date.getMonth();
  const gYear = date.getFullYear();

  const hijri = getHijriCalendar(date, hijriOffset);
  const bikarmi = getBikarmiCalendar(date);

  return {
    gregorian: {
      dayName: GREGORIAN_DAYS[gDay],
      dayNameUrdu: GREGORIAN_DAYS_URDU[gDay],
      day: gDate,
      dayUrdu: toUrduDigits(gDate),
      monthName: GREGORIAN_MONTHS[gMonth],
      monthNameUrdu: GREGORIAN_MONTHS_URDU[gMonth],
      month: gMonth + 1,
      year: gYear,
      yearUrdu: toUrduDigits(gYear),
    },
    hijri,
    bikarmi,
  };
}
