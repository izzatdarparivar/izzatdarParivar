import Anthropic from "@anthropic-ai/sdk";


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});


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


  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });


  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.text || "";
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


  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });


  const textBlock = message.content.find((block) => block.type === "text");
  const lines = (textBlock?.text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.slice(0, 3);
}


export async function generateSmartSuggestions(
  userProfile: Record<string, any>,
  recentActivity: string[]
): Promise<string[]> {
  const prompt = `Based on this user's matrimonial profile and recent activity, suggest 3 actions they could take to improve their chances of finding a match.


Profile: ${JSON.stringify(userProfile, null, 2)}
Recent activity: ${recentActivity.join(", ")}


Return exactly 3 short suggestions (under 20 words each), one per line. Be specific and actionable. Focus on profile improvement, communication, or search strategy.`;


  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });


  const textBlock = message.content.find((block) => block.type === "text");
  const lines = (textBlock?.text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.slice(0, 3);
}


export async function analyzeProfilePhoto(imageUrl: string): Promise<{
  quality: "good" | "fair" | "poor";
  suggestions: string[];
}> {
  const prompt = `Analyze this matrimonial profile photo and rate its quality. Consider: lighting, clarity, background, expression, and appropriateness for a matrimonial platform.


Return a JSON object with:
- quality: "good", "fair", or "poor"
- suggestions: array of 1-3 improvement suggestions (empty if good)


Only return the JSON, nothing else.`;


  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: prompt },
        ],
      },
    ],
  });


  const textBlock = message.content.find((block) => block.type === "text");
  try {
    return JSON.parse(textBlock?.text || '{"quality":"fair","suggestions":[]}');
  } catch {
    return { quality: "fair", suggestions: ["Unable to analyze photo"] };
  }
}

