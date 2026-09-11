import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const userId = defineSecret("BHASHINI_USER_ID");
const apiKey = defineSecret("BHASHINI_ULCA_API_KEY");
const pipelineId = defineSecret("BHASHINI_PIPELINE_ID");
const CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
const ALLOWED_LANGUAGES = new Set(["en", "as", "bn", "brx", "mni", "kha", "lus", "ne"]);

export const translate = onRequest({ cors: true, secrets: [userId, apiKey, pipelineId], timeoutSeconds: 60 }, async (request, response) => {
  if (request.method !== "POST") return response.status(405).json({ error: "POST required" });
  const { text, sourceLanguage = "en", targetLanguage } = request.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > 5000) return response.status(400).json({ error: "Text must contain 1–5000 characters." });
  if (!ALLOWED_LANGUAGES.has(sourceLanguage) || !ALLOWED_LANGUAGES.has(targetLanguage)) return response.status(400).json({ error: "Unsupported language." });
  if (sourceLanguage === targetLanguage) return response.json({ translation: text });

  try {
    const task = { taskType: "translation", config: { language: { sourceLanguage, targetLanguage } } };
    const configResponse = await fetch(CONFIG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", userID: userId.value(), ulcaApiKey: apiKey.value() },
      body: JSON.stringify({ pipelineTasks: [task], pipelineRequestConfig: { pipelineId: pipelineId.value() } }),
    });
    if (!configResponse.ok) throw new Error(`Bhashini configuration failed (${configResponse.status})`);
    const config = await configResponse.json();
    const endpoint = config.pipelineInferenceAPIEndPoint || config.pipelineInferenceAPIEnfPoint;
    const translationTask = config.pipelineResponseConfig?.find((item) => item.taskType === "translation");
    const serviceId = translationTask?.config?.[0]?.serviceId || translationTask?.config?.serviceId;
    if (!endpoint?.callbackURL || !endpoint?.inferenceApiKey?.name || !serviceId) throw new Error("Bhashini did not return a usable translation pipeline.");

    task.config.serviceId = serviceId;
    const computeResponse = await fetch(endpoint.callbackURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", [endpoint.inferenceApiKey.name]: endpoint.inferenceApiKey.value },
      body: JSON.stringify({ pipelineTasks: [task], inputData: { input: [{ source: text }] } }),
    });
    if (!computeResponse.ok) throw new Error(`Bhashini translation failed (${computeResponse.status})`);
    const result = await computeResponse.json();
    const translation = result.pipelineResponse?.find((item) => item.taskType === "translation")?.output?.[0]?.target;
    if (!translation) throw new Error("Bhashini returned no translated text.");
    return response.json({ translation });
  } catch (error) {
    console.error("Bhashini proxy error", error);
    return response.status(502).json({ error: "Translation is temporarily unavailable." });
  }
});
