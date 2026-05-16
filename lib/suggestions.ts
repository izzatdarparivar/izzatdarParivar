import { UserProfile } from "./firestore";

export interface Suggestion {
  id: string;
  title: string;
  body: string;
  action: string;
  actionUrl: string;
  priority: number;
  icon: "photo" | "bio" | "hobbies" | "family" | "preferences";
}

export function getProfileSuggestions(profile: UserProfile): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!profile.photoURL && (!profile.photos || profile.photos.length === 0)) {
    suggestions.push({
      id: "add_photo",
      title: "Add a profile photo",
      body: "Profiles with photos get 5× more responses from families.",
      action: "Add Photo",
      actionUrl: "/profile/create",
      priority: 1,
      icon: "photo",
    });
  }

  if (!profile.bio || profile.bio.length < 50) {
    suggestions.push({
      id: "improve_bio",
      title: "Write a longer bio",
      body: "A detailed bio helps families understand you better. Aim for 100+ words.",
      action: "Edit Bio",
      actionUrl: "/profile/create",
      priority: 2,
      icon: "bio",
    });
  }

  if (!profile.hobbies || profile.hobbies.length === 0) {
    suggestions.push({
      id: "add_hobbies",
      title: "Add your hobbies & interests",
      body: "Shared hobbies improve your compatibility score by up to 15%.",
      action: "Add Hobbies",
      actionUrl: "/profile/create",
      priority: 3,
      icon: "hobbies",
    });
  }

  if (!profile.aboutFamily) {
    suggestions.push({
      id: "add_family",
      title: "Describe your family",
      body: "80% of families check this section first. A few sentences go a long way.",
      action: "Add Family Details",
      actionUrl: "/profile/create",
      priority: 4,
      icon: "family",
    });
  }

  if (!profile.preferences?.minAge || !profile.preferences?.maxAge) {
    suggestions.push({
      id: "set_preferences",
      title: "Set your match preferences",
      body: "Defining your age range and location helps us find better matches for you.",
      action: "Set Preferences",
      actionUrl: "/profile/create",
      priority: 5,
      icon: "preferences",
    });
  }

  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
