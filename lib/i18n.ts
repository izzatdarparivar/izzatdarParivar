export type Locale = "en" | "hi" | "mr" | "gu" | "pa" | "bn" | "ta" | "te" | "kn" | "ml";


export const SUPPORTED_LOCALES: { code: Locale; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
];


type TranslationKeys = {
  "nav.home": string;
  "nav.matches": string;
  "nav.chat": string;
  "nav.profile": string;
  "nav.premium": string;
  "auth.login": string;
  "auth.signup": string;
  "auth.logout": string;
  "profile.edit": string;
  "profile.save": string;
  "profile.cancel": string;
  "match.sendInterest": string;
  "match.accepted": string;
  "match.declined": string;
  "match.compatibility": string;
  "chat.typeMessage": string;
  "chat.send": string;
  "premium.upgrade": string;
  "premium.currentPlan": string;
  "common.loading": string;
  "common.error": string;
  "common.success": string;
  "common.noResults": string;
};


const translations: Record<Locale, TranslationKeys> = {
  en: {
    "nav.home": "Home",
    "nav.matches": "Matches",
    "nav.chat": "Chat",
    "nav.profile": "Profile",
    "nav.premium": "Premium",
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.logout": "Logout",
    "profile.edit": "Edit Profile",
    "profile.save": "Save",
    "profile.cancel": "Cancel",
    "match.sendInterest": "Send Interest",
    "match.accepted": "Accepted",
    "match.declined": "Declined",
    "match.compatibility": "Compatibility",
    "chat.typeMessage": "Type a message...",
    "chat.send": "Send",
    "premium.upgrade": "Upgrade Now",
    "premium.currentPlan": "Current Plan",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.success": "Success!",
    "common.noResults": "No results found",
  },
  hi: {
    "nav.home": "होम",
    "nav.matches": "मैच",
    "nav.chat": "चैट",
    "nav.profile": "प्रोफ़ाइल",
    "nav.premium": "प्रीमियम",
    "auth.login": "लॉग इन",
    "auth.signup": "साइन अप",
    "auth.logout": "लॉग आउट",
    "profile.edit": "प्रोफ़ाइल संपादित करें",
    "profile.save": "सहेजें",
    "profile.cancel": "रद्द करें",
    "match.sendInterest": "रुचि भेजें",
    "match.accepted": "स्वीकृत",
    "match.declined": "अस्वीकृत",
    "match.compatibility": "अनुकूलता",
    "chat.typeMessage": "संदेश लिखें...",
    "chat.send": "भेजें",
    "premium.upgrade": "अपग्रेड करें",
    "premium.currentPlan": "वर्तमान योजना",
    "common.loading": "लोड हो रहा है...",
    "common.error": "कुछ गलत हो गया",
    "common.success": "सफल!",
    "common.noResults": "कोई परिणाम नहीं",
  },
  mr: {
    "nav.home": "होम",
    "nav.matches": "जुळणी",
    "nav.chat": "चॅट",
    "nav.profile": "प्रोफाइल",
    "nav.premium": "प्रीमियम",
    "auth.login": "लॉग इन",
    "auth.signup": "साइन अप",
    "auth.logout": "लॉग आउट",
    "profile.edit": "प्रोफाइल संपादित करा",
    "profile.save": "जतन करा",
    "profile.cancel": "रद्द करा",
    "match.sendInterest": "स्वारस्य पाठवा",
    "match.accepted": "स्वीकारले",
    "match.declined": "नाकारले",
    "match.compatibility": "सुसंगतता",
    "chat.typeMessage": "संदेश लिहा...",
    "chat.send": "पाठवा",
    "premium.upgrade": "अपग्रेड करा",
    "premium.currentPlan": "सध्याची योजना",
    "common.loading": "लोड होत आहे...",
    "common.error": "काहीतरी चूक झाली",
    "common.success": "यशस्वी!",
    "common.noResults": "कोणतेही परिणाम नाहीत",
  },
  gu: { "nav.home": "હોમ", "nav.matches": "મેચ", "nav.chat": "ચેટ", "nav.profile": "પ્રોફાઇલ", "nav.premium": "પ્રીમિયમ", "auth.login": "લૉગ ઇન", "auth.signup": "સાઇન અપ", "auth.logout": "લૉગ આઉટ", "profile.edit": "પ્રોફાઇલ સંપાદિત કરો", "profile.save": "સાચવો", "profile.cancel": "રદ કરો", "match.sendInterest": "રસ મોકલો", "match.accepted": "સ્વીકૃત", "match.declined": "નકાર્યું", "match.compatibility": "સુસંગતતા", "chat.typeMessage": "સંદેશ લખો...", "chat.send": "મોકલો", "premium.upgrade": "અપગ્રેડ કરો", "premium.currentPlan": "વર્તમાન યોજના", "common.loading": "લોડ થઈ રહ્યું છે...", "common.error": "કંઈક ખોટું થયું", "common.success": "સફળ!", "common.noResults": "કોઈ પરિણામ નથી" },
  pa: { "nav.home": "ਹੋਮ", "nav.matches": "ਮੈਚ", "nav.chat": "ਚੈਟ", "nav.profile": "ਪ੍ਰੋਫ਼ਾਈਲ", "nav.premium": "ਪ੍ਰੀਮੀਅਮ", "auth.login": "ਲੌਗ ਇਨ", "auth.signup": "ਸਾਈਨ ਅੱਪ", "auth.logout": "ਲੌਗ ਆਊਟ", "profile.edit": "ਪ੍ਰੋਫ਼ਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ", "profile.save": "ਸੰਭਾਲੋ", "profile.cancel": "ਰੱਦ ਕਰੋ", "match.sendInterest": "ਦਿਲਚਸਪੀ ਭੇਜੋ", "match.accepted": "ਸਵੀਕਾਰ", "match.declined": "ਅਸਵੀਕਾਰ", "match.compatibility": "ਅਨੁਕੂਲਤਾ", "chat.typeMessage": "ਸੁਨੇਹਾ ਲਿਖੋ...", "chat.send": "ਭੇਜੋ", "premium.upgrade": "ਅੱਪਗ੍ਰੇਡ ਕਰੋ", "premium.currentPlan": "ਮੌਜੂਦਾ ਯੋਜਨਾ", "common.loading": "ਲੋਡ ਹੋ ਰਿਹਾ...", "common.error": "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ", "common.success": "ਸਫ਼ਲ!", "common.noResults": "ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ" },
  bn: { "nav.home": "হোম", "nav.matches": "ম্যাচ", "nav.chat": "চ্যাট", "nav.profile": "প্রোফাইল", "nav.premium": "প্রিমিয়াম", "auth.login": "লগ ইন", "auth.signup": "সাইন আপ", "auth.logout": "লগ আউট", "profile.edit": "প্রোফাইল সম্পাদনা", "profile.save": "সংরক্ষণ", "profile.cancel": "বাতিল", "match.sendInterest": "আগ্রহ পাঠান", "match.accepted": "গৃহীত", "match.declined": "প্রত্যাখ্যাত", "match.compatibility": "সামঞ্জস্য", "chat.typeMessage": "বার্তা লিখুন...", "chat.send": "পাঠান", "premium.upgrade": "আপগ্রেড করুন", "premium.currentPlan": "বর্তমান পরিকল্পনা", "common.loading": "লোড হচ্ছে...", "common.error": "কিছু ভুল হয়েছে", "common.success": "সফল!", "common.noResults": "কোনো ফলাফল নেই" },
  ta: { "nav.home": "முகப்பு", "nav.matches": "பொருத்தம்", "nav.chat": "அரட்டை", "nav.profile": "சுயவிவரம்", "nav.premium": "பிரீமியம்", "auth.login": "உள்நுழை", "auth.signup": "பதிவு", "auth.logout": "வெளியேறு", "profile.edit": "தொகு", "profile.save": "சேமி", "profile.cancel": "ரத்து", "match.sendInterest": "ஆர்வம் அனுப்பு", "match.accepted": "ஏற்றுக்கொண்டது", "match.declined": "நிராகரிக்கப்பட்டது", "match.compatibility": "பொருத்தம்", "chat.typeMessage": "செய்தி...", "chat.send": "அனுப்பு", "premium.upgrade": "மேம்படுத்து", "premium.currentPlan": "தற்போதைய திட்டம்", "common.loading": "ஏற்றுகிறது...", "common.error": "பிழை", "common.success": "வெற்றி!", "common.noResults": "முடிவுகள் இல்லை" },
  te: { "nav.home": "హోమ్", "nav.matches": "మ్యాచ్‌లు", "nav.chat": "చాట్", "nav.profile": "ప్రొఫైల్", "nav.premium": "ప్రీమియం", "auth.login": "లాగిన్", "auth.signup": "సైన్ అప్", "auth.logout": "లాగౌట్", "profile.edit": "సవరించు", "profile.save": "సేవ్", "profile.cancel": "రద్దు", "match.sendInterest": "ఆసక్తి పంపు", "match.accepted": "ఆమోదించబడింది", "match.declined": "తిరస్కరించబడింది", "match.compatibility": "అనుకూలత", "chat.typeMessage": "సందేశం...", "chat.send": "పంపు", "premium.upgrade": "అప్‌గ్రేడ్", "premium.currentPlan": "ప్రస్తుత ప్లాన్", "common.loading": "లోడ్...", "common.error": "లోపం", "common.success": "విజయం!", "common.noResults": "ఫలితాలు లేవు" },
  kn: { "nav.home": "ಮುಖಪುಟ", "nav.matches": "ಹೊಂದಾಣಿಕೆ", "nav.chat": "ಚಾಟ್", "nav.profile": "ಪ್ರೊಫೈಲ್", "nav.premium": "ಪ್ರೀಮಿಯಂ", "auth.login": "ಲಾಗಿನ್", "auth.signup": "ಸೈನ್ ಅಪ್", "auth.logout": "ಲಾಗೌಟ್", "profile.edit": "ಸಂಪಾದಿಸಿ", "profile.save": "ಉಳಿಸಿ", "profile.cancel": "ರದ್ದು", "match.sendInterest": "ಆಸಕ್ತಿ ಕಳುಹಿಸಿ", "match.accepted": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ", "match.declined": "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ", "match.compatibility": "ಹೊಂದಾಣಿಕೆ", "chat.typeMessage": "ಸಂದೇಶ...", "chat.send": "ಕಳುಹಿಸಿ", "premium.upgrade": "ಅಪ್‌ಗ್ರೇಡ್", "premium.currentPlan": "ಪ್ರಸ್ತುತ ಯೋಜನೆ", "common.loading": "ಲೋಡ್...", "common.error": "ದೋಷ", "common.success": "ಯಶಸ್ಸು!", "common.noResults": "ಫಲಿತಾಂಶಗಳಿಲ್ಲ" },
  ml: { "nav.home": "ഹോം", "nav.matches": "മാച്ചുകൾ", "nav.chat": "ചാറ്റ്", "nav.profile": "പ്രൊഫൈൽ", "nav.premium": "പ്രീമിയം", "auth.login": "ലോഗിൻ", "auth.signup": "സൈൻ അപ്പ്", "auth.logout": "ലോഗൗട്ട്", "profile.edit": "എഡിറ്റ്", "profile.save": "സേവ്", "profile.cancel": "റദ്ദാക്കുക", "match.sendInterest": "താൽപര്യം അയയ്ക്കുക", "match.accepted": "സ്വീകരിച്ചു", "match.declined": "നിരസിച്ചു", "match.compatibility": "അനുയോജ്യത", "chat.typeMessage": "സന്ദേശം...", "chat.send": "അയയ്ക്കുക", "premium.upgrade": "അപ്‌ഗ്രേഡ്", "premium.currentPlan": "നിലവിലെ പ്ലാൻ", "common.loading": "ലോഡ്...", "common.error": "പിശക്", "common.success": "വിജയം!", "common.noResults": "ഫലങ്ങളില്ല" },
};


let currentLocale: Locale = "en";


export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale);
  }
}


export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && translations[saved]) {
      currentLocale = saved;
    }
  }
  return currentLocale;
}


export function t(key: keyof TranslationKeys): string {
  return translations[currentLocale]?.[key] || translations.en[key] || key;
}


export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const browserLang = navigator.language.split("-")[0] as Locale;
  return translations[browserLang] ? browserLang : "en";
}

