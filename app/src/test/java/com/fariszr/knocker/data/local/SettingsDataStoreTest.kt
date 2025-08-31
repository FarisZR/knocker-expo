package com.fariszr.knocker.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStoreFile
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class SettingsDataStoreTest {

    private lateinit var dataStore: DataStore<Preferences>
    private lateinit var settingsDataStore: SettingsDataStore

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        dataStore = PreferenceDataStoreFactory.create(
            produceFile = { context.preferencesDataStoreFile("test_settings") }
        )
        settingsDataStore = SettingsDataStore(dataStore)
    }

    @Test
    fun `save and get knocker endpoint`() = runBlocking {
        val endpoint = "http://127.0.0.1:8080"
        settingsDataStore.setKnockerEndpoint(endpoint)
        val result = settingsDataStore.getKnockerEndpoint().first()
        assertEquals(endpoint, result)
    }

    @Test
    fun `save and get knocker token`() = runBlocking {
        val token = "test-token"
        settingsDataStore.setKnockerToken(token)
        val result = settingsDataStore.getKnockerToken().first()
        assertEquals(token, result)
    }
}