export interface DateData {
  gregorian: {
    dayName: string;
    dayNameUrdu: string;
    day: number;
    dayUrdu: string;
    monthName: string;
    monthNameUrdu: string;
    month: number;
    year: number;
    yearUrdu: string;
  };
  hijri: {
    day: number;
    dayUrdu: string;
    monthName: string;
    monthNameUrdu: string;
    year: number;
    yearUrdu: string;
  };
  bikarmi: {
    day: number;
    dayUrdu: string;
    monthName: string;
    monthNameUrdu: string;
    year: number;
    yearUrdu: string;
  };
}

export interface PrayerTime {
  name: string;
  urduName: string;
  time: string;
  icon: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  city: string;
}
