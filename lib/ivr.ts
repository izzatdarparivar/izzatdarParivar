export type IVRState =
  | "welcome"
  | "language"
  | "main_menu"
  | "search"
  | "search_input"
  | "results"
  | "profile_detail"
  | "express_interest"
  | "check_status"
  | "help"
  | "goodbye";


export interface IVRSession {
  callerId: string;
  state: IVRState;
  language: "hi" | "en";
  data: Record<string, any>;
}


export interface IVRResponse {
  speech: string;
  language: "hi-IN" | "en-IN";
  expectInput: boolean;
  inputType: "dtmf" | "speech" | "none";
  maxDigits?: number;
  nextState: IVRState;
  hangup?: boolean;
}


const IVR_PROMPTS = {
  en: {
    welcome: "Welcome to Izzatdar Parivar, India's trusted matrimonial service. Press 1 for English. Press 2 for Hindi.",
    main_menu: "Press 1 to search profiles. Press 2 to check interest status. Press 3 for help. Press 9 to exit.",
    search: "To search, press 1 for bride profiles. Press 2 for groom profiles.",
    search_input: "Please enter the age range. Press the minimum age followed by star, then maximum age followed by hash. For example, 2 5 star 3 0 hash.",
    results: "We found profiles matching your criteria. Press 1 to hear the first profile. Press 0 to go back.",
    no_results: "Sorry, no matching profiles found. Press 0 to try again or 9 to exit.",
    profile_detail: "Profile details: {name}, age {age}, {education}, {occupation}, from {city}. Press 1 to express interest. Press 2 for next profile. Press 0 for menu.",
    interest_sent: "Your interest has been sent. The family will be notified. Press 0 for menu.",
    check_status: "You have {pending} pending interests and {accepted} accepted interests. Press 0 for menu.",
    help: "For help, call our support line at our toll-free number or visit izzatdarparivar dot com. Press 0 for menu.",
    goodbye: "Thank you for using Izzatdar Parivar. We wish you the best in your search. Goodbye.",
  },
  hi: {
    welcome: "इज़्ज़तदार परिवार में आपका स्वागत है, भारत की विश्वसनीय वैवाहिक सेवा। अंग्रेजी के लिए 1 दबाएं। हिंदी के लिए 2 दबाएं।",
    main_menu: "प्रोफाइल खोजने के लिए 1 दबाएं। रुचि स्थिति जांचने के लिए 2 दबाएं। मदद के लिए 3 दबाएं। बाहर निकलने के लिए 9 दबाएं।",
    search: "खोजने के लिए, वधू प्रोफाइल के लिए 1 दबाएं। वर प्रोफाइल के लिए 2 दबाएं।",
    search_input: "कृपया उम्र सीमा दर्ज करें। न्यूनतम उम्र दर्ज करें फिर स्टार, फिर अधिकतम उम्र दर्ज करें फिर हैश।",
    results: "आपकी खोज से मेल खाती प्रोफाइल मिलीं। पहली प्रोफाइल सुनने के लिए 1 दबाएं। वापस जाने के लिए 0 दबाएं।",
    no_results: "क्षमा करें, कोई मेल खाती प्रोफाइल नहीं मिली। फिर से कोशिश करने के लिए 0 दबाएं या बाहर निकलने के लिए 9 दबाएं।",
    profile_detail: "प्रोफाइल: {name}, उम्र {age}, {education}, {occupation}, {city} से। रुचि भेजने के लिए 1 दबाएं। अगली प्रोफाइल के लिए 2 दबाएं। मेनू के लिए 0 दबाएं।",
    interest_sent: "आपकी रुचि भेज दी गई है। परिवार को सूचित किया जाएगा। मेनू के लिए 0 दबाएं।",
    check_status: "आपकी {pending} लंबित रुचियां और {accepted} स्वीकृत रुचियां हैं। मेनू के लिए 0 दबाएं।",
    help: "मदद के लिए, हमारे टोल-फ्री नंबर पर कॉल करें या izzatdarparivar.com पर जाएं। मेनू के लिए 0 दबाएं।",
    goodbye: "इज़्ज़तदार परिवार का उपयोग करने के लिए धन्यवाद। आपकी खोज में शुभकामनाएं। अलविदा।",
  },
};


export function processIVRInput(session: IVRSession, input: string): IVRResponse {
  const lang = session.language;
  const prompts = IVR_PROMPTS[lang];
  const speechLang = lang === "hi" ? "hi-IN" : "en-IN";


  switch (session.state) {
    case "welcome":
    case "language":
      if (input === "1") {
        return { speech: IVR_PROMPTS.en.main_menu, language: "en-IN", expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      }
      if (input === "2") {
        return { speech: IVR_PROMPTS.hi.main_menu, language: "hi-IN", expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      }
      return { speech: prompts.welcome, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "language" };


    case "main_menu":
      if (input === "1") return { speech: prompts.search, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "search" };
      if (input === "2") return { speech: prompts.check_status.replace("{pending}", "0").replace("{accepted}", "0"), language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      if (input === "3") return { speech: prompts.help, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      if (input === "9") return { speech: prompts.goodbye, language: speechLang, expectInput: false, inputType: "none", nextState: "goodbye", hangup: true };
      return { speech: prompts.main_menu, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };


    case "search":
      if (input === "1" || input === "2") {
        return { speech: prompts.search_input, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 6, nextState: "search_input" };
      }
      return { speech: prompts.search, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "search" };


    case "search_input":
      return { speech: prompts.results, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "results" };


    case "results":
      if (input === "1") {
        const detail = prompts.profile_detail
          .replace("{name}", "Sample")
          .replace("{age}", "25")
          .replace("{education}", "Graduate")
          .replace("{occupation}", "Engineer")
          .replace("{city}", "Mumbai");
        return { speech: detail, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "profile_detail" };
      }
      if (input === "0") return { speech: prompts.main_menu, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      return { speech: prompts.results, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "results" };


    case "profile_detail":
      if (input === "1") return { speech: prompts.interest_sent, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      if (input === "0") return { speech: prompts.main_menu, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
      return { speech: prompts.profile_detail, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "profile_detail" };


    default:
      return { speech: prompts.main_menu, language: speechLang, expectInput: true, inputType: "dtmf", maxDigits: 1, nextState: "main_menu" };
  }
}


export function createIVRSession(callerId: string): IVRSession {
  return {
    callerId,
    state: "welcome",
    language: "hi",
    data: {},
  };
}


export function getWelcomeResponse(): IVRResponse {
  return {
    speech: IVR_PROMPTS.hi.welcome,
    language: "hi-IN",
    expectInput: true,
    inputType: "dtmf",
    maxDigits: 1,
    nextState: "language",
  };
}

