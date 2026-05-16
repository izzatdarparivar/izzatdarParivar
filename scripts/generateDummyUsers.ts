export type BotState =
  | "welcome"
  | "language_select"
  | "main_menu"
  | "search"
  | "search_gender"
  | "search_age"
  | "search_religion"
  | "search_results"
  | "view_profile"
  | "send_interest"
  | "check_interests"
  | "my_profile"
  | "help";


export interface BotSession {
  userId: string;
  phone: string;
  state: BotState;
  language: "en" | "hi";
  searchCriteria: {
    gender?: string;
    ageMin?: number;
    ageMax?: number;
    religion?: string;
  };
  lastInteraction: Date;
}


export interface BotMessage {
  text: string;
  buttons?: { id: string; title: string }[];
  list?: { title: string; rows: { id: string; title: string; description?: string }[] };
}


const MESSAGES = {
  en: {
    welcome: "Welcome to Izzatdar Parivar! 🙏\nIndia's most trusted matrimonial service.\n\nType 1 for English\nType 2 for Hindi",
    main_menu: "What would you like to do?\n\n1. Search Profiles\n2. Check Interests\n3. My Profile\n4. Help",
    search_gender: "Looking for:\n1. Bride (Female)\n2. Groom (Male)",
    search_age: "Enter age range (e.g., 25-30):",
    search_religion: "Religion preference:\n1. Hindu\n2. Muslim\n3. Sikh\n4. Christian\n5. Any",
    no_results: "No matching profiles found. Try different criteria.",
    interest_sent: "Interest sent successfully! ✓",
    help: "Need help? Contact us:\nEmail: support@izzatdarparivar.com\nPhone: +91-XXXXXXXXXX\n\nType 0 to go back to menu.",
    invalid: "Sorry, I didn't understand. Please try again.",
  },
  hi: {
    welcome: "इज़्ज़तदार परिवार में आपका स्वागत है! 🙏\nभारत की सबसे विश्वसनीय वैवाहिक सेवा।\n\n1 टाइप करें अंग्रेजी के लिए\n2 टाइप करें हिंदी के लिए",
    main_menu: "आप क्या करना चाहेंगे?\n\n1. प्रोफाइल खोजें\n2. रुचि देखें\n3. मेरी प्रोफाइल\n4. मदद",
    search_gender: "किसकी तलाश है:\n1. वधू (महिला)\n2. वर (पुरुष)",
    search_age: "उम्र सीमा दर्ज करें (जैसे 25-30):",
    search_religion: "धर्म प्राथमिकता:\n1. हिंदू\n2. मुस्लिम\n3. सिख\n4. ईसाई\n5. कोई भी",
    no_results: "कोई मेल खाने वाली प्रोफाइल नहीं मिली। अलग मापदंड आज़माएं।",
    interest_sent: "रुचि सफलतापूर्वक भेजी गई! ✓",
    help: "मदद चाहिए? संपर्क करें:\nईमेल: support@izzatdarparivar.com\nफोन: +91-XXXXXXXXXX\n\n0 टाइप करें मेनू पर वापस जाने के लिए।",
    invalid: "क्षमा करें, समझ नहीं आया। कृपया फिर से प्रयास करें।",
  },
};


export function getMessage(state: BotState, language: "en" | "hi"): string {
  const msgs = MESSAGES[language];
  switch (state) {
    case "welcome":
    case "language_select":
      return msgs.welcome;
    case "main_menu":
      return msgs.main_menu;
    case "search_gender":
      return msgs.search_gender;
    case "search_age":
      return msgs.search_age;
    case "search_religion":
      return msgs.search_religion;
    case "help":
      return msgs.help;
    default:
      return msgs.main_menu;
  }
}


export function processInput(session: BotSession, input: string): { newState: BotState; response: string } {
  const lang = session.language;
  const msgs = MESSAGES[lang];
  const trimmed = input.trim().toLowerCase();


  // Back to menu
  if (trimmed === "0" || trimmed === "menu") {
    return { newState: "main_menu", response: msgs.main_menu };
  }


  switch (session.state) {
    case "welcome":
    case "language_select":
      if (trimmed === "1") return { newState: "main_menu", response: MESSAGES.en.main_menu };
      if (trimmed === "2") return { newState: "main_menu", response: MESSAGES.hi.main_menu };
      return { newState: "language_select", response: msgs.welcome };


    case "main_menu":
      if (trimmed === "1") return { newState: "search_gender", response: msgs.search_gender };
      if (trimmed === "2") return { newState: "check_interests", response: "Checking your interests..." };
      if (trimmed === "3") return { newState: "my_profile", response: "Loading your profile..." };
      if (trimmed === "4") return { newState: "help", response: msgs.help };
      return { newState: "main_menu", response: msgs.invalid + "\n\n" + msgs.main_menu };


    case "search_gender":
      if (trimmed === "1" || trimmed === "2") {
        return { newState: "search_age", response: msgs.search_age };
      }
      return { newState: "search_gender", response: msgs.invalid + "\n\n" + msgs.search_gender };


    case "search_age":
      const ageMatch = input.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (ageMatch) {
        return { newState: "search_religion", response: msgs.search_religion };
      }
      return { newState: "search_age", response: msgs.invalid + "\n\n" + msgs.search_age };


    case "search_religion":
      if (["1", "2", "3", "4", "5"].includes(trimmed)) {
        return { newState: "search_results", response: "Searching profiles..." };
      }
      return { newState: "search_religion", response: msgs.invalid + "\n\n" + msgs.search_religion };


    default:
      return { newState: "main_menu", response: msgs.main_menu };
  }
}


export function createSession(phone: string): BotSession {
  return {
    userId: "",
    phone,
    state: "welcome",
    language: "hi",
    searchCriteria: {},
    lastInteraction: new Date(),
  };
}

