export interface VoiceProfileData {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  education: string;
  location: string;
  religion: string;
  caste: string;
  bio: string;
}


export interface VoiceStep {
  id: string;
  question: string;
  field: keyof VoiceProfileData;
  type: "text" | "number" | "select";
  options?: string[];
  validation?: (value: string) => boolean;
}


export const VOICE_STEPS: VoiceStep[] = [
  {
    id: "name",
    question: "What is your full name?",
    field: "name",
    type: "text",
    validation: (v) => v.length >= 2 && v.length <= 50,
  },
  {
    id: "age",
    question: "What is your age?",
    field: "age",
    type: "number",
    validation: (v) => {
      const n = parseInt(v);
      return n >= 18 && n <= 70;
    },
  },
  {
    id: "gender",
    question: "What is your gender?",
    field: "gender",
    type: "select",
    options: ["Male", "Female"],
  },
  {
    id: "location",
    question: "Which city do you live in?",
    field: "location",
    type: "text",
  },
  {
    id: "religion",
    question: "What is your religion?",
    field: "religion",
    type: "select",
    options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Other"],
  },
  {
    id: "caste",
    question: "What is your caste or community?",
    field: "caste",
    type: "text",
  },
  {
    id: "education",
    question: "What is your highest education?",
    field: "education",
    type: "select",
    options: ["10th Pass", "12th Pass", "Graduate", "Post Graduate", "Doctorate", "Professional"],
  },
  {
    id: "occupation",
    question: "What is your occupation?",
    field: "occupation",
    type: "text",
  },
  {
    id: "bio",
    question: "Tell us about yourself in a few words",
    field: "bio",
    type: "text",
  },
];


export function getStepProgress(currentStep: number): number {
  return Math.round((currentStep / VOICE_STEPS.length) * 100);
}


export function validateStep(step: VoiceStep, value: string): boolean {
  if (!value.trim()) return false;
  if (step.validation) return step.validation(value);
  if (step.type === "select" && step.options) return step.options.includes(value);
  return true;
}


// Speech recognition wrapper
export function startListening(
  onResult: (text: string) => void,
  onError: (error: string) => void,
  lang = "hi-IN"
): { stop: () => void } | null {
  if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    onError("Speech recognition not supported");
    return null;
  }


  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;


  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };


  recognition.onerror = (event: any) => {
    onError(event.error);
  };


  recognition.start();
  return { stop: () => recognition.stop() };
}


// Text-to-speech wrapper
export function speak(text: string, lang = "hi-IN"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

