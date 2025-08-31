package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.local.SettingsDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

class GetSettingsUseCaseTest {

    @Mock
    private lateinit var settingsDataStore: SettingsDataStore

    private lateinit var getSettingsUseCase: GetSettingsUseCase

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        getSettingsUseCase = GetSettingsUseCase(settingsDataStore)
    }

    @Test
    fun `invoke returns settings`() = runBlocking {
        val endpoint = "http://127.0.0.1:8080"
        val token = "test-token"

        `when`(settingsDataStore.getKnockerEndpoint()).thenReturn(flowOf(endpoint))
        `when`(settingsDataStore.getKnockerToken()).thenReturn(flowOf(token))

        val result = getSettingsUseCase().first()

        assertEquals(endpoint, result.first)
        assertEquals(token, result.second)
    }
}