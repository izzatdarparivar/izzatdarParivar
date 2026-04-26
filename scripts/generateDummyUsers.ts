import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the local env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

const maleNames = ["Rahul", "Vikram", "Arjun", "Karan", "Rohan", "Aditya", "Nikhil", "Aarav", "Ravi", "Suresh", "Kartik", "Amit"];
const femaleNames = ["Pooja", "Neha", "Priya", "Sunita", "Meera", "Anjali", "Riya", "Kavya", "Sneha", "Aditi", "Isha", "Divya"];
const locations = ["Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Chennai", "Jaipur", "Ahmedabad", "Kolkata", "Surat"];
const occupations = ["Software Engineer", "Doctor", "Entrepreneur", "Marketing Head", "Architect", "Data Scientist", "Bank Manager", "Teacher", "CA", "Designer"];
const religions = ["Hindu", "Sikh", "Jain", "Christian", "Muslim", "Buddhist"];

function getRandomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ensure the 3 logins
const manualLogins = [
  {
    email: "boy1@izzatdar.com",
    password: "Password123",
    name: "Aakash Boy",
    gender: "male" as const,
  },
  {
    email: "girl1@izzatdar.com",
    password: "Password123",
    name: "Sneha Girl",
    gender: "female" as const,
  },
  {
    email: "parent1@izzatdar.com",
    password: "Password123",
    name: "Sunil Parent",
    gender: "other" as const, // Parent representation
  }
];

async function run() {
  console.log("Starting Dummy Data Generation...");

  // 1. Create the 3 Manual Accounts
  for (const login of manualLogins) {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(login.email);
      console.log(`User ${login.email} already exists, skipping auth creation.`);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: login.email,
          password: login.password,
          displayName: login.name,
        });
        console.log(`Created auth user ${login.email}`);
      } else {
        throw e;
      }
    }

    // Upsert Firestore doc
    const profileRef = db.collection('users').doc(userRecord.uid);
    await profileRef.set({
      uid: userRecord.uid,
      name: login.name,
      gender: login.gender,
      email: login.email,
      dob: admin.firestore.Timestamp.fromDate(new Date(1990, 1, 1)),
      age: 34,
      location: getRandomItem(locations),
      religion: getRandomItem(religions),
      caste: "Any",
      motherTongue: "Hindi",
      education: "Masters",
      occupation: getRandomItem(occupations),
      annualIncome: "10-15 LPA",
      bio: "Looking for a compatible partner with similar values.",
      photoURL: login.gender === "male" ? `https://randomuser.me/api/portraits/men/10.jpg` : login.gender === "female" ? `https://randomuser.me/api/portraits/women/10.jpg` : `https://randomuser.me/api/portraits/lego/1.jpg`,
      phone: "+919999999999",
      preferences: {
        minAge: 25,
        maxAge: 35,
        religion: "Any",
        location: "Any",
      },
      status: "approved",
      is_premium: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log(`Created Firestore doc for ${login.email}`);
  }

  // 2. Generate 47 Dummy profiles
  console.log("Generating 47 random profiles...");
  for (let i = 0; i < 47; i++) {
    const isMale = Math.random() > 0.5;
    const gender = isMale ? "male" : "female";
    const name = getRandomItem(isMale ? maleNames : femaleNames) + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".";
    const age = getRandomNumber(22, 35);
    const location = getRandomItem(locations);
    const background = isMale ? "f97316" : "800000"; // Saffron or Maroon avatar

    // Generating fake UID for dummy
    const fakeUid = `dummy_usr_${Date.now()}_${i}`;

    await db.collection('users').doc(fakeUid).set({
      uid: fakeUid,
      name: name,
      gender: gender,
      email: `dummy_${i}@test.com`,
      dob: admin.firestore.Timestamp.fromDate(new Date(new Date().getFullYear() - age, 1, 1)),
      age: age,
      location: location,
      religion: getRandomItem(religions),
      caste: "Any",
      motherTongue: "Hindi",
      education: "Bachelors",
      occupation: getRandomItem(occupations),
      annualIncome: "5-10 LPA",
      bio: "A simple and caring person looking for a partner.",
      photoURL: isMale ? `https://randomuser.me/api/portraits/men/${i % 100}.jpg` : `https://randomuser.me/api/portraits/women/${i % 100}.jpg`,
      phone: "+910000000000",
      preferences: {
        minAge: age - 3 > 18 ? age - 3 : 18,
        maxAge: age + 4,
        religion: "Any",
        location: "Any",
      },
      status: "approved",
      is_premium: Math.random() > 0.7,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1} profiles...`);
    }
  }

  console.log("Finished generating 50 users!");
}

run().catch(console.error);
