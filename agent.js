import { config } from "dotenv"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import readline from "node:readline/promises";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";
import axios from "axios";

config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const MODEL_API_KEY = process.env.MODEL_API_KEY;

const addTwoNumbers = new DynamicStructuredTool({
  name: "addTwoNumbers",
  description: "This will add two numbers.",
  schema: z.object({
    num1: z.number().describe("This is first parameter"),
    num2: z.number().describe("This is second parameter"),
  }),
  func: async ({ num1, num2 }) => {
    return (num1 + num2).toFixed(2).toString();
  },
});

const getWeatherDetails = new DynamicStructuredTool({
  name: "getWeatherDetails",
  description: "This will current weather of any city.",
  schema: z.object({
    city: z.string().describe("This is name of city"),
  }),
  func: async ({ city }) => {
    console.log(city);
    try {
      const { data } = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          city
        )}&key=${WEATHER_API_KEY}`
      );
      let cords = {};
      if (data.results) {
        cords = data.results[0].geometry.location;
      }
      const weather = await axios.get(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${WEATHER_API_KEY}&location.latitude=${cords.lat}&location.longitude=${cords.lng}`
      );

      const w = weather.data.temperature;

      return `${w.degrees} ${w.unit}`;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
});

const tools = [addTwoNumbers, getWeatherDetails];
const toolNode = new ToolNode(tools);

const memory = new MemorySaver();

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  apiKey: MODEL_API_KEY,
}).bindTools(tools);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function callModel(state) {
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}

async function shouldContinue({ messages }) {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

const app = workflow.compile({ checkpointer: memory });

const main = async () => {
  while (true) {
    const userInput = await rl.question("You: ");
    if (userInput === "/bye") break;
    const finalState = await app.invoke(
      {
        messages: [{ role: "user", content: userInput }],
      },
      {
        configurable: {
          thread_id: "1",
        },
      }
    );
    const ai_result = finalState.messages[finalState.messages.length - 1];
    console.log("AI: ", ai_result.content);
  }

  rl.close();
};

main();
