# Knocker Android App

This is the official Android app for [Knocker](https://github.com/FarisZR/Knocker), a secure, configurable, and self-hosted service that provides a "knock-knock" single-packet authorization (SPA) gateway for your Caddy v2 reverse proxy.

## Features

*   **Manual Whitelisting:** Quickly and easily whitelist your device's IP address with the tap of a button.
*   **Automatic Whitelisting:** Enable the background service to automatically whitelist your IP address when it changes or when the current whitelist is about to expire.
*   **Quick Settings Toggle:** Add a tile to your Quick Settings panel for even faster access to the whitelisting feature.
*   **Secure:** The app uses the Knocker API to securely whitelist your IP address.
*   **Modern UI:** The app is built with Jetpack Compose and Material 3, providing a clean and modern user experience.

## Architecture

The app is built using a modern, layered architecture that separates concerns and promotes testability, scalability, and maintainability. For more details, see the [architecture documentation](docs/architecture.md).

## Design

The app is designed with a clean, modern, and user-friendly interface, following the Material You (Material 3) design guidelines. For more details, see the [design documentation](docs/design.md).

## Building the App

To build the app, you will need to have Android Studio installed.

1.  Clone the repository:
    ```bash
    git clone https://github.com/FarisZR/Knocker-android.git
    ```
2.  Open the project in Android Studio.
3.  Run the app on an emulator or a physical device.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.