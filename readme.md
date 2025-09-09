# 🌤️ LangChain + Gemini + Google Weather Agent

This project demonstrates how to build an **AI Agent with LangGraph** that can:

- 🧮 Perform basic math operations (`addTwoNumbers` tool)
- 🌍 Fetch live **weather information** for any city (`getWeatherDetails` tool) using **Google Maps Geocoding API** + **Google Weather API**
- 💬 Chat interactively in the terminal

---

## 🚀 Features

- Uses **LangChain.js** with **LangGraph** for stateful agent orchestration.
- Integrates **Gemini (Google Generative AI)** as the LLM.
- Adds **custom tools**:
  - `addTwoNumbers`: Adds two numbers.
  - `getWeatherDetails`: Looks up city → latitude/longitude (via Google Geocoding) → fetches weather (via Google Weather API).
- Runs as a **REPL chatbot** in Node.js.

---
## 🛠️ Tech Stack

- LangChain.js — AI orchestration framework
- LangGraph — State graph execution for agents
- Gemini (Google Generative AI) — LLM for reasoning and conversation
- Google Maps Geocoding API — Convert city name → coordinates
- Google Weather API — Fetch real-time weather
- Axios — For API requests

---

## 📦 Installation

1. Clone this repo:

   ```bash
   git clone https://github.com/abhishek8054/langchain-weather-agent.git
   cd langchain-weather-agent

   ```

2. npm install

3. WEATHER_API_KEY=your_google_api_key_here
   MODEL_API_KEY=your_gemini_api_key_here

4. node agent.js
