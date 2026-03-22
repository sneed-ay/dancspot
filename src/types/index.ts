export interface Studio {
  id: string;
  name: string;
  prefecture: string; // prefecture code e.g. "tokyo"
  prefectureName: string; // 東京都
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
}

export interface Prefecture {
  slug: string;
  name: string;
  region: string;
}

export interface Region {
  name: string;
  prefectures: Prefecture[];
}
