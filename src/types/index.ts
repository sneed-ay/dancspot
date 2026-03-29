export interface StaffMember {
  name: string;
  role?: string;
  photo?: string;
}

export interface Studio {
  id: string;
  name: string;
  prefecture: string;
  prefectureName: string;
  city: string;
  address: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
  danceStyles: string[];
  lessonTypes: string[];
  priceRange?: string;
  hours?: string;
  description?: string;
  staff?: StaffMember[];
}

export interface Prefecture {
  slug: string;
  name: string;
  region?: string;
  studioCount?: number;
}

export interface Region {
  name: string;
  prefectures: Prefecture[];
}

export interface DanceEvent {
  id: string;
  name: string;
  organizer: "JBDF" | "JDC" | "JCF" | "JDSF";
  location: string;
  date: string;
  dateEnd?: string;
  category?: string;
  level?: string;
  entryDeadline?: string;
  year: number;
  month: number;
}
