# Real-Time ISS & News Dashboard

A modern, responsive dashboard built with React, Vite, and Tailwind CSS. It visualizes the International Space Station's current location, speed, and trajectory, tracks astronauts currently in space, displays the latest space news, and includes an AI-powered chatbot assistant.

## Features

- **Live ISS Tracking**: Fetches the ISS position every 15 seconds.
- **Interactive Map**: Displays the current position and recent trajectory using Leaflet.
- **Speed Calculation**: Computes real-time ISS speed using the Haversine formula.
- **People in Space**: Shows the number and names of astronauts currently aboard the ISS.
- **News Dashboard**: Displays top science and space news with search, sorting, and source filtering.
- **Data Visualizations**: Includes interactive charts for ISS speed history and news source distribution using Recharts.
- **AI Chatbot**: An integrated Hugging Face Llama-3 assistant that answers questions based *only* on the current dashboard data.
- **Dark/Light Mode**: User preference saved in localStorage.
- **Responsive UI**: Fully responsive grid layout leveraging Tailwind CSS.
- **Caching**: News and Chat history are cached in localStorage to optimize API usage.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4, Lucide React
- **Mapping**: Leaflet, React Leaflet
- **Charts**: Recharts
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **APIs**:
  - Open Notify (ISS Position, Astros)
  - Nominatim OpenStreetMap (Reverse Geocoding)
  - NewsAPI
  - Hugging Face Inference API

## APIs Used

- `http://api.open-notify.org/iss-now.json`
- `http://api.open-notify.org/astros.json`
- `https://nominatim.openstreetmap.org/reverse`
- `https://newsapi.org/v2/top-headlines`
- `https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct`

## Environment Variable Setup

Create a `.env` file in the root of your project based on the provided `.env.example` file.

```env
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_AI_TOKEN=your_huggingface_token_here
```

*Note: Never hardcode your API keys. The `.env` file is included in `.gitignore`.*

## How to run locally

1. Clone the repository and navigate into the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## How to deploy on Vercel

This application is ready to be deployed to Vercel.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click "Add New" > "Project".
3. Import your GitHub repository.
4. Add the required Environment Variables (`VITE_NEWS_API_KEY` and `VITE_AI_TOKEN`) in the Vercel deployment settings.
5. Click **Deploy**. Vercel will automatically detect Vite and run `npm run build`.

## Assignment Question Answer

**“Which LLM model did you use in this application, and why?”**

I originally intended to use `mistralai/Mistral-7B-Instruct-v0.2` as requested, but it is no longer supported on the free Hugging Face Inference API. Instead, I used `meta-llama/Meta-Llama-3-8B-Instruct` (via the `@huggingface/inference` SDK). It is an incredibly capable instruction-tuned open-source language model available through Hugging Face. It is perfectly suited for chatbot-style responses, follows strict prompts flawlessly, and can be reliably restricted to answer only from the dynamically injected dashboard data.
