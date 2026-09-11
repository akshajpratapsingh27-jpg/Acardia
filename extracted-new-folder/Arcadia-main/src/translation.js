export const BHASHINI_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "as", label: "অসমীয়া · Assamese" },
  { code: "bn", label: "বাংলা · Bengali" },
  { code: "brx", label: "बड़ो · Bodo" },
  { code: "mni", label: "মৈতৈলোন্ · Manipuri" },
  { code: "kha", label: "Khasi" },
  { code: "lus", label: "Mizo" },
  { code: "ne", label: "नेपाली · Nepali" },
];

export const bhashiniConfigured = Boolean(import.meta.env.VITE_BHASHINI_PROXY_URL);

const CORE_UI = {
  en: { home: "Home", activities: "Activities", memory: "Memory", chatbot: "Chatbot", settings: "Settings", sos: "I need help", synced: "Synced", offline: "Offline" },
  as: { home: "ঘৰ", activities: "কাৰ্যকলাপ", memory: "স্মৃতি", chatbot: "কথোপকথন", settings: "ছেটিংছ", sos: "মোক সহায় লাগে", synced: "সংযোগ হৈছে", offline: "অফলাইন" },
  bn: { home: "বাড়ি", activities: "কার্যকলাপ", memory: "স্মৃতি", chatbot: "কথোপকথন", settings: "সেটিংস", sos: "আমার সাহায্য চাই", synced: "সংযুক্ত", offline: "অফলাইন" },
  ne: { home: "गृहपृष्ठ", activities: "गतिविधिहरू", memory: "स्मृति", chatbot: "कुराकानी", settings: "सेटिङ", sos: "मलाई सहयोग चाहियो", synced: "जोडिएको", offline: "अफलाइन" },
};

export function coreUi(language) { return CORE_UI[language] || CORE_UI.en; }

export async function translateWithBhashini(text, targetLanguage, sourceLanguage = "en") {
  if (!text || targetLanguage === sourceLanguage) return text;
  const endpoint = import.meta.env.VITE_BHASHINI_PROXY_URL;
  if (!endpoint) return text;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  });
  if (!response.ok) throw new Error("Translation is temporarily unavailable.");
  const payload = await response.json();
  return payload.translation || payload.translatedText || text;
}
