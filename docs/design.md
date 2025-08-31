# Knocker Android App Design

The Knocker Android app is designed with a clean, modern, and user-friendly interface, following the Material You (Material 3) design guidelines. The design is focused on simplicity and ease of use, allowing users to quickly and easily whitelist their IP address.

## Color Scheme

The app uses a dynamic color scheme that adapts to the user's wallpaper, providing a personalized and immersive experience. The color scheme is implemented using the `dynamicLightColorScheme` and `dynamicDarkColorScheme` from the Material 3 library.

## Typography

The app uses the default Material 3 typography, which is clean, legible, and easy to read. The typography is implemented using the `Typography` object from the Material 3 library.

## UI Components

The app uses a variety of Material 3 UI components to create a consistent and intuitive user experience. These components include:

*   **Buttons:** The app uses `Button` and `OutlinedButton` for primary and secondary actions.
*   **Text Fields:** The app uses `OutlinedTextField` for user input.
*   **Switches:** The app uses `Switch` to allow users to toggle settings.
*   **Top App Bar:** The app uses `TopAppBar` to display the app's title and navigation icons.
*   **Cards:** The app uses `Card` to display information in a structured and organized way.

## Screens

The app is composed of the following screens:

*   **Setup Screen:** This screen is displayed on the first launch of the app and allows the user to enter the Knocker endpoint and API token.
*   **Main Screen:** This screen is the main screen of the app and displays the current status of the whitelist. It also provides a button to manually whitelist the IP address.
*   **Settings Screen:** This screen allows the user to enable or disable the background service.