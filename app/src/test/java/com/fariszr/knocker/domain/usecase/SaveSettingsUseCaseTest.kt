package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.local.SettingsDataStore
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.MockitoAnnotations

class SaveSettingsUseCaseTest {

    @Mock
    private lateinit var settingsDataStore: SettingsDataStore

    private lateinit var saveSettingsUseCase: SaveSettingsUseCase

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        saveSettingsUseCase = SaveSettingsUseCase(settingsDataStore)
    }

    @Test
    fun `invoke saves settings`() = runBlocking {
        val endpoint = "http://127.0.0.1:8080"
        val token = "test-token"

        saveSettingsUseCase(endpoint, token)

        verify(settingsDataStore).setKnockerEndpoint(endpoint)
        verify(settingsDataStore).setKnockerToken(token)
    }
}