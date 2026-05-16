import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

const MALE_NAMES = ["Rahul Sharma", "Vikram Joshi", "Aditya Iyer", "Karan Mehta", "Rohan Desai"];
const FEMALE_NAMES = ["Priya Patel", "Sneha Rao", "Neha Gupta", "Anjali Verma", "Pooja Singh"];
const GOTRAS = ["Kashyap", "Bharadwaj", "Vatsa", "Shandilya", "Garg"];

const MALE_PICS = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/44.jpg",
  "https://randomuser.me/api/portraits/men/55.jpg",
  "https://randomuser.me/api/portraits/men/66.jpg",
  "https://randomuser.me/api/portraits/men/77.jpg"
];

const FEMALE_PICS = [
  "https://randomuser.me/api/portraits/women/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/women/55.jpg",
  "https://randomuser.me/api/portraits/women/66.jpg",
  "https://randomuser.me/api/portraits/women/77.jpg"
];

async function clearDatabase() {
  console.log("Fetching all users to delete...");
  let pageToken;
  do {
    const listUsersResult = await auth.listUsers(1000, pageToken);
    const uids = listUsersResult.users.map(user => user.uid);
    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      console.log(`Deleted ${uids.length} users from Auth.`);
    }
    pageToken = listUsersResult.pageToken;
  } while (pageToken);

  console.log("Deleting Firestore user documents...");
  const snapshot = await db.collection("users").get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log("Firestore users cleared.");
}

async function createDummyUsers() {
  console.log("Creating 5 highly-compatible men and 5 women...");

  const baseProfile = {
    religion: "Hindu",
    caste: "Brahmin",
    location: "Mumbai, Maharashtra",
    education: "Master's",
    occupation: "Software Engineer",
    annualIncome: "10-20 lpa",
    diet: "Vegetarian",
    lifestyle: "Moderate",
    familyType: "Nuclear",
    motherTongue: "Hindi",
    hobbies: ["🎵 Music", "📚 Reading", "✈️ Traveling"],
    status: "approved",
    is_premium: true,
    preferences: {
      minAge: 23,
      maxAge: 30,
      religion: "Hindu",
      location: "Mumbai",
    },
    bio: "I am a simple and caring person who values family and relationships. I am looking for someone who shares similar values.",
    aboutFamily: "We are a nuclear family based in Mumbai. My father is retired, and my mother is a homemaker.",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  for (let i = 0; i < 5; i++) {
    // Create Male
    const maleRecord = await auth.createUser({
      email: `male${i}@izzatdarparivar.com`,
      password: `password123`,
      displayName: MALE_NAMES[i],
    });
    
    await db.collection("users").doc(maleRecord.uid).set({
      ...baseProfile,
      uid: maleRecord.uid,
      name: MALE_NAMES[i],
      firstName: MALE_NAMES[i].split(" ")[0],
      lastName: MALE_NAMES[i].split(" ")[1],
      gender: "male",
      age: 28,
      dob: admin.firestore.Timestamp.fromDate(new Date("1996-05-15")),
      height: "5'10''",
      maritalStatus: "Never Married",
      phone: `+91 980000001${i}`,
      gotra: GOTRAS[i],
      photoURL: MALE_PICS[i],
      email: maleRecord.email
    });

    // Create Female
    const femaleRecord = await auth.createUser({
      email: `female${i}@izzatdarparivar.com`,
      password: `password123`,
      displayName: FEMALE_NAMES[i],
    });

    await db.collection("users").doc(femaleRecord.uid).set({
      ...baseProfile,
      uid: femaleRecord.uid,
      name: FEMALE_NAMES[i],
      firstName: FEMALE_NAMES[i].split(" ")[0],
      lastName: FEMALE_NAMES[i].split(" ")[1],
      gender: "female",
      age: 25,
      dob: admin.firestore.Timestamp.fromDate(new Date("1999-08-20")),
      height: "5'5''",
      maritalStatus: "Never Married",
      phone: `+91 980000002${i}`,
      gotra: GOTRAS[(i + 1) % GOTRAS.length], // Ensure different gotras
      photoURL: FEMALE_PICS[i],
      email: femaleRecord.email
    });
  }
  
  console.log("Successfully created 10 highly compatible accounts!");
}

async function main() {
  await clearDatabase();
  await createDummyUsers();
  process.exit(0);
}

main().catch(console.error);
