import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Necessary for client-side use in this environment
});

export interface AIResponse {
  content: string;
  usage?: any;
}

export const getSmartSuggestions = async (context: any): Promise<string> => {
  if (!apiKey) return "AI Study Assistant is not configured. Please add your GROQ_API_KEY.";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an elite AI Study Architect. Analyze the user's study context (XP, habits, subjects, tasks) and provide a single, punchy, high-impact study suggestion in 1-2 sentences. Focus on immediate actionable advice for an engineering student."
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "Focus on your core engineering fundamentals today.";
  } catch (error) {
    console.error("Groq AI Error:", error);
    return "Keep pushing! Consistent effort leads to mastery.";
  }
};

export const chatWithAssistant = async (messages: any[], studyContext: any): Promise<string> => {
  if (!apiKey) return "AI Assistant is offline. Please configure the GROQ_API_KEY.";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI Study Architect. You help engineering students stay consistent and master their subjects. 
          Use the following study context to personalize your advice: ${JSON.stringify(studyContext)}.
          Be professional, encouraging, and highly technical when needed.`
        },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "I'm here to help you study more effectively.";
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return "I encountered an error. Please try again or check your connectivity.";
  }
};

export const generateSyllabusBreakdown = async (subjectTitle: string): Promise<any[]> => {
  if (!apiKey) return [];

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an academic expert. Break down a given engineering subject into 4-5 core modules. For each module, provide 2-3 key topics. Return ONLY a JSON array of sections. Format: [ { title: 'Module Name', topics: [ { title: 'Topic Name', completed: false } ] } ]"
        },
        {
          role: "user",
          content: `Subject: ${subjectTitle}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || "[]");
    return response.sections || response;
  } catch (error) {
    console.error("Syllabus Generation Error:", error);
    return [];
  }
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const generateQuizFromNotes = async (subjectTitle: string, topicTitle: string, notes: string): Promise<QuizQuestion[]> => {
  if (!apiKey || !notes) return [];

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert tutor. Generate a 5-question multiple-choice quiz based on the provided engineering study notes. 
          Return ONLY a JSON object with a 'questions' array. 
          Each question should have: 'question', 'options' (array of 4), 'correctAnswer' (string exactly matching one option), and 'explanation'.`
        },
        {
          role: "user",
          content: `Subject: ${subjectTitle}\nTopic: ${topicTitle}\nNotes: ${notes}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return response.questions || [];
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [];
  }
};

export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Try to find a nice male or female voice
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) || voices[0];
  
  window.speechSynthesis.speak(utterance);
};

export const generateTopicsFromMaterial = async (content: string) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic strategist. Analyze the provided study material and return a structured syllabus breakdown in JSON format. The JSON should include a 'subject' name, and a list of 'sections', each with 'topics'. Focus on identifying the core concepts that need to be mastered."
        },
        {
          role: "user",
          content: `Study Material Content:\n\n${content.substring(0, 10000)}` // Limit content to fit context
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Material Analysis Error:", error);
    return null;
  }
};
