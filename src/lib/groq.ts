import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const INTENSITY_PROMPTS = {
  1: "부드럽고 응원하는 느낌으로 리마인더를 해주세요. 압박하지 말고 격려하는 톤으로.",
  2: "친한 친구처럼 적당히 채찍질하는 톤으로. 약간의 압박과 걱정이 담긴 느낌으로.",
  3: "매우 직설적이고 강하게 압박하는 톤으로. 돌려 말하지 않고 현실을 직시하게.",
};

export async function generateJansori(
  goal: string,
  intensity: 1 | 2 | 3 = 2
): Promise<string> {
  const systemPrompt = `당신은 사용자의 친한 친구입니다. 사용자가 목표를 달성하도록 잔소리를 해줍니다.
${INTENSITY_PROMPTS[intensity]}
반드시 반말로 말하고, 자연스러운 한국어로 한 문장만 말해주세요.
이모지는 사용하지 마세요.
무조건 한글과 아라비아 숫자(1, 2, 3)만 사용하세요. 한자, 일본어, 영어, 중국어 등 다른 언어는 절대 사용하지 마세요.`;

  // 현재 시간 (KST)
  const now = new Date();
  const kstTime = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(now);

  const userPrompt = `현재 시간: ${kstTime}
사용자의 목표: "${goal}"

이 목표에 대해 잔소리를 한 문장으로 해주세요.`;

  try {
    const response = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    let content = response.choices[0]?.message?.content?.trim() ||
      "오늘 목표 달성했어? 안 했으면 지금이라도 해.";

    // Qwen3의 <think> 태그 제거
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return content;
  } catch (error) {
    console.error("Groq API error:", error);
    return "오늘 목표 달성했어? 안 했으면 지금이라도 해.";
  }
}
