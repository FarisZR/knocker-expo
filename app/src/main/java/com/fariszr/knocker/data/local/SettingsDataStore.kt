package com.fariszr.knocker.data.local

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class SettingsDataStore @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {

    private val knockerEndpointKey = stringPreferencesKey("knocker_endpoint")
    private val knockerTokenKey = stringPreferencesKey("knocker_token")

    fun getKnockerEndpoint(): Flow<String?> {
        return dataStore.data.map { preferences ->
            preferences[knockerEndpointKey]
        }
    }

    suspend fun setKnockerEndpoint(endpoint: String) {
        dataStore.edit { preferences ->
            preferences[knockerEndpointKey] = endpoint
        }
    }

    fun getKnockerToken(): Flow<String?> {
        return dataStore.data.map { preferences ->
            preferences[knockerTokenKey]
        }
    }

    suspend fun setKnockerToken(token: String) {
        dataStore.edit { preferences ->
            preferences[knockerTokenKey] = token
        }
    }
}