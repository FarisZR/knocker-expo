# Knocker App: Software Architecture

## 1. Overview

The Knocker app follows a simple, modular architecture designed for clarity, testability, and maintainability. The structure is based on the standard Expo (React Native) project layout, with a clear separation of concerns between UI components, business logic, and services.

## 2. Directory Structure

The key directories and their purposes are outlined below:

```
/
├── src/
│   ├── screens/         # UI components for each application screen (e.g., MainScreen, SetupScreen)
│   └── services/        # Modules for handling business logic and external interactions
│       ├── knocker.ts   # Core logic for making API calls to the Knocker server
│       └── backgroundKnocker.ts # Logic for managing the background fetch task
├── docs/                # Project documentation
└── ... (standard Expo project files)
```

## 3. Core Components

### 3.1. UI Layer (`src/screens/`)

-   **`SetupScreen.tsx`**: This is the first screen the user interacts with. It is a simple form for inputting the server endpoint, API token, and other optional settings. It is responsible for validating and saving these credentials to secure storage.
-   **`MainScreen.tsx`**: This is the primary screen of the application. It displays the current whitelist status and provides a button for manual "knocking." It retrieves credentials from secure storage and uses the `knocker` service to perform the API call. It also orchestrates the automatic knock on app load.

### 3.2. Service Layer (`src/services/`)

-   **`knocker.ts`**: This module encapsulates all the logic related to communicating with the Knocker server. It uses `axios` to make the `POST` request and handles both successful responses and potential errors. It is designed to be completely independent of the UI, making it highly reusable and easy to test.
-   **`backgroundKnocker.ts`**: This module is responsible for all background task functionality. It uses `expo-task-manager` to define the task and `expo-background-fetch` to register and unregister it. The task itself retrieves credentials from `expo-secure-store` and calls the `knocker.ts` service to perform the IP whitelisting.

## 4. Data Flow

1.  **Configuration:**
    -   User enters credentials into `SetupScreen`.
    -   On save, the data is persisted to the device's secure storage using `expo-secure-store`.
    -   If the background service is enabled, `backgroundKnocker.ts` registers the task with the OS.

2.  **Manual Knock:**
    -   User presses the "Knock" button on `MainScreen`.
    -   `MainScreen` retrieves the endpoint and token from `expo-secure-store`.
    -   It calls the `knock()` function from `src/services/knocker.ts`.
    -   The service makes the API call and returns the result (or an error).
    -   `MainScreen` updates its state to display the new status to the user.

3.  **Automatic & Background Knock:**
    -   **On App Open:** The `useEffect` hook in `MainScreen` triggers the same data flow as a manual knock.
    -   **In Background:** The OS executes the task defined in `backgroundKnocker.ts`. The task retrieves credentials and calls the `knock()` service directly. The result is handled internally by the task, with no direct UI update.

## 5. State Management

The application uses simple, local component state managed by React's `useState` and `useEffect` hooks. There is no need for a global state management library (like Redux or MobX) due to the app's focused scope. All persistent data is handled by `expo-secure-store`.