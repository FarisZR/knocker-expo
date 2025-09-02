# Knocker: A Secure IP Whitelisting App

Knocker-EXPO is a client for Knocker written in Expo (React Native) that provides a secure and convenient way to whitelist your device's IP address with a compatible server. It is designed for users who need temporary access to protected networks or services and want a simple, reliable tool to manage it.

## ✨ Features

- **Simple Setup:** A one-time setup screen to configure your server endpoint and secret token.
- **One-Tap Whitelisting:** A prominent "Knock" button to instantly whitelist your current IP address.
- **Automatic Knock:** The app automatically knocks on launch to streamline your workflow.
- **Background Service:** An optional background service that re-knocks every 15 minutes to ensure your access doesn't expire.
- **Secure Storage:** All sensitive credentials (endpoint, token) are stored securely on your device using `expo-secure-store`.
- **Modern UI:** A clean and intuitive interface built with Material You (Material 3) design principles.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A compatible [Knocker server](https://github.com/faris/knocker-server) instance.

### Installation & Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/knocker-expo.git
    cd knocker-expo
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run the application:**

    ```bash
    npm start
    ```

    This will start the Metro bundler. You can then run the app on an Android emulator or a physical device using the Expo Go app.

4. **Configure the App:**
    - On the first launch, you will be directed to the **Setup** screen.
    - Enter the full URL of your Knocker server endpoint (e.g., `http://your-server.com/knock`).
    - Enter the secret API token for your server.
    - Optionally, enable the background service.
    - Tap **Save**.

## 🛠️ Development

This project follows a strict **Test-Driven Development (TDD)** methodology. All code is thoroughly tested using Jest and React Native Testing Library.

- **Run all tests:**

    ```bash
    npm test
    ```

- **Run tests for a specific file:**

    ```bash
    npm test src/path/to/your/file.test.ts
    ```

## 📄 Documentation

Detailed documentation for the project can be found in the `/docs` directory:

- [`project-overview.md`](./docs/project-overview.md): High-level summary of the project.
- [`architecture.md`](./docs/architecture.md): Explanation of the software architecture and data flow.
- [`design.md`](./docs/design.md): Overview of the UI/UX design and Material You implementation.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
