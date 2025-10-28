# Architecture Decision Record: Smart Home AI Dashboard

This document outlines the architecture for the Smart Home AI Dashboard, a web application designed for smart device control and AI-powered content generation.

## 1. High-Level Architecture

The application is a client-side Single Page Application (SPA) built with **React**. It runs entirely in the browser, communicating directly with the Google Gemini API for its AI features. The smart home device control and weather data are currently simulated on the client-side for MVP purposes.

## 2. Technology Stack

- **Frontend Framework:** **React 19** with **TypeScript**. React provides a robust component-based model, while TypeScript adds static typing for improved code quality, maintainability, and developer experience.
- **Styling:** **Tailwind CSS**. A utility-first CSS framework is used for rapid UI development, ensuring a consistent and modern design system without writing custom CSS.
- **AI Integration:** **@google/genai SDK**. The official Google GenAI SDK is used for all interactions with the Gemini family of models (Imagen 4 for images, Veo for video).
- **Build/Setup:** The project is set up to run via a simple `index.html` file that imports React and the main application script as ES modules, leveraging a CDN for dependencies. This simplifies the development setup.

## 3. Project Structure

The codebase is organized into logical directories to promote separation of concerns:

```
/
├── components/       # Reusable React components
│   ├── Dashboard.tsx
│   ├── DeviceCard.tsx
│   ├── ImageGenerator.tsx
│   ├── VideoGenerator.tsx
│   └── icons/
│       └── Icons.tsx # Centralized SVG icons
├── docs/             # Project documentation (Markdown)
├── hooks/            # Custom React hooks for business logic
│   └── useSmartHome.ts
├── services/         # Modules for external API interactions
│   └── geminiService.ts
├── types/            # TypeScript type definitions
│   └── types.ts
├── App.tsx           # Main application component and router
├── index.html        # HTML entry point
├── index.tsx         # React DOM renderer
└── metadata.json     # Application metadata
```

## 4. Key Architectural Decisions

### State Management

- **Client-Side State:** For the MVP, all application state is managed within React components using built-in hooks like `useState`, `useEffect`, and `useRef`.
- **Custom Hooks for Business Logic:** Complex, reusable stateful logic is encapsulated in custom hooks. The `useSmartHome` hook is a prime example, managing all device states, simulated weather, and automation rules. This isolates the core smart home logic from the UI components.

### AI Service Layer

- A dedicated `geminiService.ts` module acts as an abstraction layer for all calls to the Gemini API.
- This service handles API key management, request formatting, and response parsing for image and video generation.
- This design makes it easy to update API calls, add new AI features, or manage error handling in a centralized location without modifying the UI components directly.

### Component-Based UI

- The UI is broken down into small, reusable components.
- **Container Components** (`Dashboard`, `ImageGenerator`, `VideoGenerator`) manage the logic and state for specific application views.
- **Presentational Components** (`DeviceCard`, `WeatherWidget`, `TabButton`) are responsible for rendering UI elements and emitting events, but do not contain business logic themselves. This promotes reusability and easier testing.

### Simulation First

- The core smart home functionality (device control, automation) is simulated. This allows for rapid prototyping and validation of the UI/UX and automation logic without the immediate complexity of integrating with real hardware APIs (e.g., Xiaomi, Matter, Home Assistant).
- The `useSmartHome` hook is the single point of simulation. To connect to real devices, only this hook would need to be modified to fetch and update data from a real backend or API, leaving the rest of the application unchanged.
