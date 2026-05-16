import { BiodataInput, formatBiodataForPDF } from "@/lib/biodata-pdf";


export interface BookletProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  education: string;
  occupation: string;
  religion: string;
  caste: string;
  city: string;
  state: string;
  familyType: string;
  bio: string;
  photoUrl?: string;
  contactPhone: string;
  shortCode?: string;
}


export interface BookletConfig {
  title: string;
  subtitle: string;
  category: string; // e.g., "Hindu Brides - Maharashtra"
  profiles: BookletProfile[];
  generatedAt: Date;
  pageSize: "A4" | "A5";
  columns: 1 | 2;
  includePhotos: boolean;
  includeQR: boolean;
}


export function generateBookletData(config: BookletConfig) {
  const profilesPerPage = config.columns === 2 ? 4 : 2;
  const pages: BookletProfile[][] = [];


  for (let i = 0; i < config.profiles.length; i += profilesPerPage) {
    pages.push(config.profiles.slice(i, i + profilesPerPage));
  }


  return {
    cover: {
      title: config.title,
      subtitle: config.subtitle,
      category: config.category,
      date: config.generatedAt.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
      }),
      profileCount: config.profiles.length,
    },
    pages,
    settings: {
      pageSize: config.pageSize,
      columns: config.columns,
      includePhotos: config.includePhotos,
      includeQR: config.includeQR,
    },
  };
}


export function profileToBookletEntry(profile: any): BookletProfile {
  return {
    id: profile.uid || profile.id,
    name: profile.displayName || "",
    age: profile.age || 0,
    gender: profile.gender || "",
    education: profile.education || "",
    occupation: profile.occupation || "",
    religion: profile.religion || "",
    caste: profile.caste || "",
    city: profile.location?.city || "",
    state: profile.location?.state || "",
    familyType: profile.familyType || "nuclear",
    bio: (profile.bio || "").slice(0, 100),
    photoUrl: profile.photoURL,
    contactPhone: profile.phone || "",
    shortCode: profile.shortCode,
  };
}


// Generate a simple text-based booklet for SMS/print
export function generateTextBooklet(profiles: BookletProfile[]): string {
  let text = "═══ IZZATDAR PARIVAR ═══\n";
  text += "Matrimonial Profiles\n";
  text += "════════════════════════\n\n";


  profiles.forEach((p, idx) => {
    text += `--- Profile ${idx + 1} ---\n`;
    text += `Name: ${p.name}\n`;
    text += `Age: ${p.age} | ${p.gender}\n`;
    text += `Education: ${p.education}\n`;
    text += `Occupation: ${p.occupation}\n`;
    text += `Religion: ${p.religion} | ${p.caste}\n`;
    text += `Location: ${p.city}, ${p.state}\n`;
    text += `Family: ${p.familyType}\n`;
    if (p.bio) text += `About: ${p.bio}\n`;
    if (p.shortCode) text += `View online: izzatdarparivar.com/p/${p.shortCode}\n`;
    text += `Contact: ${p.contactPhone}\n`;
    text += "\n";
  });


  text += "════════════════════════\n";
  text += "Visit: izzatdarparivar.com\n";
  text += "WhatsApp: +91-XXXXXXXXXX\n";


  return text;
}

