import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Deprecated tabs layout — project now uses a single-page HomeScreen at "/".
 * Keep a tiny redirect here to avoid routing issues until files are fully removed.
 */
export default function DeprecatedTabsRedirect() {
  return <Redirect href="/" />;
}
