# Knocker App: Design & UI/UX

## 1. Design Philosophy

The design of the Knocker app is guided by the principles of **simplicity, clarity, and efficiency**. The primary goal is to allow the user to perform the "knock" action with the minimum number of taps and the least amount of cognitive load. The UI is clean, uncluttered, and follows the modern **Material You (Material 3)** design language to ensure a native and familiar experience on Android.

## 2. Color Palette & Typography

The app will use a simple, high-contrast color scheme that is easy to read in various lighting conditions. The typography will be based on the standard system fonts to maintain a consistent look and feel with the underlying operating system.

-   **Primary Color:** A clear, accessible blue to indicate interactive elements and success states.
-   **Secondary Color:** A neutral gray for text and borders.
-   **Error Color:** A distinct red for displaying error messages.
-   **Typography:** System default (Roboto on most Android devices).

## 3. UI Components & Screens

### 3.1. Setup Screen (`SetupScreen.tsx`)

-   **Purpose:** To configure the application for the first time.
-   **Layout:** A single-column form with clearly labeled text inputs for the server endpoint, API token, and optional TTL/IP address.
-   **Components:**
    -   `TextInput`: Standard Material Design text fields with clear placeholder text. The token field will have `secureTextEntry` enabled.
    -   `Button`: A prominent "Save" button at the bottom of the screen.
    -   `Switch`: A toggle switch to enable or disable the optional background service.
-   **User Experience:** The flow is designed to be straightforward. The user fills in the required fields and taps "Save." There is no complex navigation or hidden functionality.

### 3.2. Main Screen (`MainScreen.tsx`)

-   **Purpose:** To perform the "knock" and view the current whitelist status.
-   **Layout:** A minimalist screen centered around the primary action.
-   **Components:**
    -   `Button`: A large, easily tappable "Knock" button is the central focus of the screen.
    -   `Text`: A status display area below the button shows the result of the last knock (e.g., "Whitelisted: 1.2.3.4", "Error: Network Failed", "Knocking...").
-   **User Experience:**
    -   On app load, a knock is performed automatically, and the status is updated, providing immediate feedback.
    -   The user can manually trigger a new knock at any time by pressing the button.
    -   The status text is designed to be clear and concise, providing all the necessary information at a glance.

## 4. Material You (Material 3) Implementation

While the app's UI is simple, it will adhere to Material 3 guidelines:

-   **Dynamic Color:** Where possible, the app will adapt its color scheme to the user's wallpaper and system theme. (Note: This is an advanced feature that may be implemented in a later stage).
-   **Component Styling:** Buttons, text inputs, and switches will use the updated Material 3 styles for a modern look.
-   **Layout & Spacing:** The layout will follow Material Design's 8dp grid system for consistent spacing and alignment.