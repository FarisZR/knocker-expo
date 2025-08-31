# Knocker App: Project Overview

## 1. Introduction

The Knocker app is a simple utility for Android that allows a user to "knock" on a self-hosted server endpoint. This action whitelists the device's current IP address, granting it temporary access to a protected network or service. The app is built with security and ease of use in mind, leveraging modern technologies like Expo and React Native.

## 2. Core Functionality

The primary function of the app is to send a secure `POST` request to a user-defined server URL. This request includes a secret token for authentication.

-   **Initial Setup:** On first launch, the user is presented with a setup screen to configure the server endpoint and the secret API token. These are stored securely on the device.
-   **Manual Knock:** The main screen provides a simple "Knock" button. Pressing this button triggers the API call and displays the result (success or failure) to the user, including the expiration time of the whitelist.
-   **Automatic Knock on App Open:** To streamline the process, the app automatically performs a knock every time it is opened.
-   **Background Service (Optional):** Users can enable a background service that will automatically re-knock at regular intervals (every 15 minutes), ensuring the IP address remains whitelisted even when the app is not in the foreground.

## 3. Technical Stack

-   **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **HTTP Requests:** [Axios](https://axios-http.com/)
-   **Secure Storage:** [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)
-   **Background Tasks:** [expo-background-fetch](https://docs.expo.dev/versions/latest/sdk/background-fetch/) & [expo-task-manager](https://docs.expo.dev/versions/latest/sdk/task-manager/)
-   **Testing:** [Jest](https://jestjs.io/) with [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
-   **Design:** Material You (Material 3) principles.

## 4. Development Methodology

This project strictly follows a **Test-Driven Development (TDD)** approach. Every feature, from core logic to UI components, is developed by first writing a comprehensive suite of tests that define the expected behavior. The implementation code is then written to make these tests pass. This ensures a high level of code quality, maintainability, and reliability.