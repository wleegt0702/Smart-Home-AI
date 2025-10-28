# Product Roadmap: Smart Home AI Dashboard

This document outlines the development roadmap for the Smart Home AI Dashboard, from the current Minimum Viable Product (MVP) to future enhancements.

## Phase 1: MVP (Current Implementation)

The goal of the MVP is to establish the core user interface and demonstrate the potential of AI-driven automation and content creation in a simulated environment.

- **[✓] Smart Home Dashboard:** A centralized view to monitor and control simulated smart home devices.
- **[✓] Simulated Devices:** Control for lights (standard and neon), air conditioner, vacuum cleaner, hot water kettle, and window blinds.
- **[✓] Simulated Weather & Automation:**
  - A weather widget displays a simulated temperature from the "myENV app".
  - An "Agentic AI" automation engine with hardcoded rules:
    1.  **Hot Weather:** If temperature > 30°C, automatically turn on the air conditioner and set window blinds to 50%.
    2.  **Evening Lighting:** At 7 PM, automatically turn on all lights.
- **[✓] AI Image Generation:** A dedicated tab using the **Imagen 4** model to generate high-quality images from user text prompts.
- **[✓] AI Video Generation:** A dedicated tab using the **Veo** model to animate a user-uploaded image with an optional text prompt. Includes API key selection flow as required by the model.
- **[✓] Modern UI/UX:** A responsive, visually appealing interface built with Tailwind CSS.

## Phase 2: Next Steps (Short-Term)

This phase focuses on replacing simulations with real-world integrations and giving users more control.

- **[ ] Real Device Integration:**
  - Connect to a smart home hub API like **Home Assistant** or **Google Home**.
  - Explore direct integration with cloud APIs for popular brands (e.g., Xiaomi/Mijia).
  - Goal: Replace the `useSmartHome` hook's simulation logic with actual API calls to control real devices.
- **[ ] Real Weather Data:** Integrate with a real weather API to fetch live weather data for the user's location, replacing the current simulation.
- **[ ] User-Configurable Automation:**
  - Create a UI where users can build their own automation rules ("If This, Then That").
  - Example: "If temperature drops below 20°C, turn off the air conditioner."
  - Example: "When I turn off the living room light, start the vacuum cleaner."
- **[ ] Gemini-Powered Rule Creation:** Allow users to create automation rules using natural language.
  - User types: "At sunset, close the blinds and turn the living room light on to a warm color."
  - Gemini translates this into a structured rule that the system can execute.

## Phase 3: Future Vision (Long-Term)

This phase aims to transform the dashboard into a truly intelligent and proactive home assistant.

- **[ ] Conversational AI Control:**
  - Integrate the **Gemini Live API** for real-time voice control.
  - Allow users to interact with their home conversationally: "Hey Smart Home, it feels a bit warm in here" -> AI adjusts the thermostat.
- **[ ] Proactive AI Agent:**
  - Develop an agent that learns user patterns and preferences over time.
  - The agent could make proactive suggestions: "You usually watch a movie around this time. Should I dim the lights and close the blinds?"
- **[ ] Energy Consumption & Optimization:**
  - Monitor device energy usage and provide insights.
  - The AI agent can suggest optimizations to save energy, such as adjusting thermostat schedules or identifying power-hungry devices.
- **[ ] Multi-User & Room Support:**
  - Add support for multiple users with personalized dashboards and permissions.
  - Organize devices by rooms for more intuitive control.
- **[ ] Advanced AI Scenarios:**
  - Use a camera feed and Gemini's vision capabilities for security (e.g., person detection) or automation (e.g., turn on lights when someone enters a room).
