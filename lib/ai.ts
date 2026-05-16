const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama3-70b-8192"; // Fast, reliable Groq model

export interface BioGenerationInput {
  name: string;
  age: number;
  gender: string;
  education: string;
  occupation: string;
  hobbies: string[];
  familyType: string;
  location: string;
  religion?: string;
  values?: string[];
}

export interface IcebreakerInput {
  senderName: string;
  receiverName: string;
  sharedInterests: string[];
  compatibilityScore: number;
  receiverBio?: string;
}

// Reusable Groq Fetch Function
async function fetchGroq(prompt: string, maxTokens: number): Promise<string> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq inference failed:", err);
    return "";
  }
}

export async function generateBio(input: BioGenerationInput): Promise<string> {
  const prompt = `Generate a warm, respectful matrimonial profile bio for an Indian matrimonial platform. Keep it under 200 words, culturally appropriate, and highlight key qualities.

Details:
- Name: ${input.name}
- Age: ${input.age}
- Gender: ${input.gender}
- Education: ${input.education}
- Occupation: ${input.occupation}
- Hobbies: ${input.hobbies.join(", ")}
- Family Type: ${input.familyType}
- Location: ${input.location}
${input.religion ? `- Religion: ${input.religion}` : ""}
${input.values ? `- Values: ${input.values.join(", ")}` : ""}

Write in first person. Be genuine and warm. Don't be overly formal or use cliches. Mention family values, career aspirations, and what they seek in a partner.`;

  return fetchGroq(prompt, 300);
}

export async function generateIcebreakers(input: IcebreakerInput): Promise<string[]> {
  const prompt = `Generate 3 conversation starters for an Indian matrimonial platform. These should be warm, respectful, and help start meaningful conversations.

Context:
- Sender: ${input.senderName}
- Receiver: ${input.receiverName}
- Shared interests: ${input.sharedInterests.join(", ") || "None identified"}
- Compatibility: ${input.compatibilityScore}%
${input.receiverBio ? `- About them: ${input.receiverBio}` : ""}

Rules:
- Be culturally appropriate
- Reference shared interests if possible
- Don't be creepy or overly familiar
- Keep each under 50 words
- Make them feel personal, not generic

Return exactly 3 icebreakers, one per line, without numbering.`;

  const text = await fetchGroq(prompt, 200);
  return text.split("\n").map(l => l.trim()).filter(l => l.length > 0).slice(0, 3);
}

export async function generateSmartSuggestions(
  userProfile: Record<string, any>,
  recentActivity: string[]
): Promise<string[]> {
  const prompt = `Based on this user's matrimonial profile and recent activity, suggest 3 actions they could take to improve their chances of finding a match.

Profile: ${JSON.stringify(userProfile, null, 2)}
Recent activity: ${recentActivity.join(", ")}

Return exactly 3 short suggestions (under 20 words each), one per line. Be specific and actionable. Focus on profile improvement, communication, or search strategy.`;

  const text = await fetchGroq(prompt, 150);
  return text.split("\n").map(l => l.trim()).filter(l => l.length > 0).slice(0, 3);
}

export async function analyzeProfilePhoto(imageUrl: string): Promise<{
  quality: "good" | "fair" | "poor";
  suggestions: string[];
}> {
  const prompt = `Analyze this matrimonial profile photo and rate its quality. Consider: lighting, clarity, background, expression, and appropriateness for a matrimonial platform.
Note: Assume the photo is an average selfie.

Return a JSON object with:
- quality: "good", "fair", or "poor"
- suggestions: array of 1-3 improvement suggestions (empty if good)

Only return the JSON, nothing else.`;

  const text = await fetchGroq(prompt, 150);
  try {
    // Groq might wrap the response in markdown blocks
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson || '{"quality":"fair","suggestions":[]}');
  } catch {
    return { quality: "fair", suggestions: ["Ensure good lighting and a clear background."] };
  }
}

