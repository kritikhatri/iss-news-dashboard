import { HfInference } from "@huggingface/inference";

export const fallbackISS = {
  latitude: 28.6139,
  longitude: 77.2090,
  velocity: 27600
};

export const fallbackPeople = [
  { name: "Oleg Kononenko", craft: "ISS" },
  { name: "Nikolai Chub", craft: "ISS" },
  { name: "Tracy Caldwell Dyson", craft: "ISS" },
  { name: "Matthew Dominick", craft: "ISS" },
  { name: "Michael Barratt", craft: "ISS" },
  { name: "Jeanette Epps", craft: "ISS" },
  { name: "Alexander Grebenkin", craft: "ISS" }
];

export const fetchISSLocation = async () => {
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!response.ok) throw new Error('Failed to fetch ISS location');
  return response.json();
};

export const fetchPeopleInSpace = async () => {
  const response = await fetch('https://api.wheretheiss.at/v1/astronauts');
  if (!response.ok) throw new Error('Failed to fetch people in space');
  return response.json();
};

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return data.display_name || 'Ocean / Unknown area';
  } catch (error) {
    return 'Ocean / Unknown area';
  }
};

export const fallbackNews = [
  {
    title: "SpaceX launches new satellite into orbit",
    source: { name: "Space News" },
    author: "Jane Doe",
    publishedAt: new Date().toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=400",
    description: "SpaceX successfully launched another batch of satellites from Cape Canaveral.",
    url: "#"
  },
  {
    title: "NASA announces new Artemis mission timeline",
    source: { name: "NASA Updates" },
    author: "John Smith",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
    description: "NASA has updated the timeline for the upcoming Artemis lunar missions.",
    url: "#"
  },
  {
    title: "James Webb Telescope captures stunning new galaxy",
    source: { name: "Astronomy Today" },
    author: "Sarah Jones",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=400",
    description: "The James Webb Space Telescope has captured a stunning new image of a distant spiral galaxy.",
    url: "#"
  }
];

export const fetchNews = async () => {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("No VITE_NEWS_API_KEY found");
  }
  const response = await fetch(`https://newsapi.org/v2/top-headlines?category=science&pageSize=10&apiKey=${apiKey}`);
  if (!response.ok) throw new Error('NewsAPI failed');
  const data = await response.json();
  if (!data.articles || data.articles.length === 0) throw new Error('No articles found');
  return data.articles;
};

export const chatWithHF = async (messages, contextStr) => {
  const token = import.meta.env.VITE_AI_TOKEN;
  if (!token) {
    return "VITE_AI_TOKEN is not configured.";
  }

  const hf = new HfInference(token);

  const systemPrompt = `You are a helpful dashboard assistant. You MUST ONLY answer questions based on the following dashboard data:\n${contextStr}\n\nIf the user asks a question outside of this dashboard data, respond EXACTLY with: "I can only answer questions based on the current ISS and news dashboard data." Do not allow guessing or external knowledge.`;
  
  // Convert messages to HF format
  const hfMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await hf.chatCompletion({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: hfMessages,
      max_tokens: 150,
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
    return response.choices[0]?.message?.content?.trim() || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Chat Error:", error);
    if (error.name === 'AbortError') {
      return "AI service temporarily unavailable.";
    }
    if (error.message) {
      return `API Error: ${error.message}`;
    }
    return "AI service temporarily unavailable.";
  }
};
