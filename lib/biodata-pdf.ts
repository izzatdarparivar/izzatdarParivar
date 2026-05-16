export interface BiodataInput {
  personalInfo: {
    name: string;
    age: number;
    gender: string;
    dateOfBirth: string;
    height: string;
    weight?: string;
    complexion?: string;
    bloodGroup?: string;
    maritalStatus: string;
    disability?: string;
  };
  religiousInfo: {
    religion: string;
    caste: string;
    subCaste?: string;
    gotra?: string;
    nakshatra?: string;
    manglik?: string;
  };
  educationCareer: {
    education: string;
    institution?: string;
    occupation: string;
    company?: string;
    annualIncome?: string;
    workLocation?: string;
  };
  familyInfo: {
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation?: string;
    siblings: string;
    familyType: string;
    familyStatus?: string;
    ancestralOrigin?: string;
  };
  contactInfo: {
    address: string;
    city: string;
    state: string;
    phone: string;
    email?: string;
  };
  preferences: {
    ageRange: string;
    heightRange?: string;
    education?: string;
    occupation?: string;
    location?: string;
    otherPreferences?: string;
  };
  photoUrl?: string;
  bio?: string;
}


// This generates data structure for @react-pdf/renderer
// The actual PDF component is in components/BiodataPDF.tsx
export function formatBiodataForPDF(input: BiodataInput) {
  return {
    sections: [
      {
        title: "Personal Information",
        fields: [
          { label: "Name", value: input.personalInfo.name },
          { label: "Date of Birth", value: input.personalInfo.dateOfBirth },
          { label: "Age", value: `${input.personalInfo.age} years` },
          { label: "Height", value: input.personalInfo.height },
          { label: "Marital Status", value: input.personalInfo.maritalStatus },
          ...(input.personalInfo.complexion ? [{ label: "Complexion", value: input.personalInfo.complexion }] : []),
          ...(input.personalInfo.bloodGroup ? [{ label: "Blood Group", value: input.personalInfo.bloodGroup }] : []),
        ],
      },
      {
        title: "Religious Background",
        fields: [
          { label: "Religion", value: input.religiousInfo.religion },
          { label: "Caste", value: input.religiousInfo.caste },
          ...(input.religiousInfo.subCaste ? [{ label: "Sub-caste", value: input.religiousInfo.subCaste }] : []),
          ...(input.religiousInfo.gotra ? [{ label: "Gotra", value: input.religiousInfo.gotra }] : []),
          ...(input.religiousInfo.nakshatra ? [{ label: "Nakshatra", value: input.religiousInfo.nakshatra }] : []),
          ...(input.religiousInfo.manglik ? [{ label: "Manglik", value: input.religiousInfo.manglik }] : []),
        ],
      },
      {
        title: "Education & Career",
        fields: [
          { label: "Education", value: input.educationCareer.education },
          ...(input.educationCareer.institution ? [{ label: "Institution", value: input.educationCareer.institution }] : []),
          { label: "Occupation", value: input.educationCareer.occupation },
          ...(input.educationCareer.company ? [{ label: "Company", value: input.educationCareer.company }] : []),
          ...(input.educationCareer.annualIncome ? [{ label: "Annual Income", value: input.educationCareer.annualIncome }] : []),
        ],
      },
      {
        title: "Family Details",
        fields: [
          { label: "Father", value: `${input.familyInfo.fatherName} (${input.familyInfo.fatherOccupation})` },
          { label: "Mother", value: `${input.familyInfo.motherName}${input.familyInfo.motherOccupation ? ` (${input.familyInfo.motherOccupation})` : ""}` },
          { label: "Siblings", value: input.familyInfo.siblings },
          { label: "Family Type", value: input.familyInfo.familyType },
          ...(input.familyInfo.ancestralOrigin ? [{ label: "Origin", value: input.familyInfo.ancestralOrigin }] : []),
        ],
      },
      {
        title: "Contact",
        fields: [
          { label: "Address", value: `${input.contactInfo.city}, ${input.contactInfo.state}` },
          { label: "Phone", value: input.contactInfo.phone },
          ...(input.contactInfo.email ? [{ label: "Email", value: input.contactInfo.email }] : []),
        ],
      },
      {
        title: "Partner Preferences",
        fields: [
          { label: "Age", value: input.preferences.ageRange },
          ...(input.preferences.heightRange ? [{ label: "Height", value: input.preferences.heightRange }] : []),
          ...(input.preferences.education ? [{ label: "Education", value: input.preferences.education }] : []),
          ...(input.preferences.location ? [{ label: "Location", value: input.preferences.location }] : []),
          ...(input.preferences.otherPreferences ? [{ label: "Other", value: input.preferences.otherPreferences }] : []),
        ],
      },
    ],
    photo: input.photoUrl,
    bio: input.bio,
  };
}


// Mapper from UserProfile to BiodataInput
export function mapProfileToBiodata(profile: any): BiodataInput {
  const age = profile.age || (profile.dob ? Math.floor((Date.now() - (profile.dob.toDate ? profile.dob.toDate() : new Date(profile.dob)).getTime()) / 31557600000) : 25);
  
  return {
    personalInfo: {
      name: profile.name,
      age: age,
      gender: profile.gender,
      dateOfBirth: profile.dob ? (profile.dob.toDate ? profile.dob.toDate().toLocaleDateString() : new Date(profile.dob).toLocaleDateString()) : "Not specified",
      height: profile.height || "Not specified",
      maritalStatus: profile.maritalStatus || "Never Married",
      complexion: profile.complexion,
      bloodGroup: profile.bloodGroup,
    },
    religiousInfo: {
      religion: profile.religion,
      caste: profile.caste,
      subCaste: profile.subCaste,
      gotra: profile.gotra,
    },
    educationCareer: {
      education: profile.education,
      occupation: profile.occupation,
      annualIncome: profile.annualIncome,
      company: profile.company,
    },
    familyInfo: {
      fatherName: profile.fatherName || "Not specified",
      fatherOccupation: profile.fatherOccupation || "Not specified",
      motherName: profile.motherName || "Not specified",
      siblings: profile.siblings || "Not specified",
      familyType: profile.familyType || "Nuclear",
    },
    contactInfo: {
      address: profile.location,
      city: profile.location.split(",")[0],
      state: profile.location.split(",")[1] || "",
      phone: profile.phone,
      email: profile.email,
    },
    preferences: {
      ageRange: `${profile.preferences?.minAge || 21} - ${profile.preferences?.maxAge || 35} years`,
      location: profile.preferences?.location,
    },
    photoUrl: profile.photoURL,
    bio: profile.bio,
  };
}
