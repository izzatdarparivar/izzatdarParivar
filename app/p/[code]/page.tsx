import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";


interface Props {
  params: Promise<{ code: string }>;
}


export default async function ShortCodePage({ params }: Props) {
  const { code } = await params;


  // Look up short code
  const codeDoc = await adminDb.collection("qr_codes").doc(code).get();


  if (!codeDoc.exists) {
    redirect("/");
  }


  const { userId } = codeDoc.data()!;


  // Increment scan count
  const qrRef = adminDb.collection("qr_profiles").doc(userId);
  const qrDoc = await qrRef.get();
  if (qrDoc.exists) {
    await qrRef.update({ scanCount: (qrDoc.data()!.scanCount || 0) + 1 });
  }


  // Redirect to profile
  redirect(`/profile/${userId}`);
}

