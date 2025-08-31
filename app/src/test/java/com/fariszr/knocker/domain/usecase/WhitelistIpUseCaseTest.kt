package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.local.SettingsDataStore
import com.fariszr.knocker.data.remote.KnockRequest
import com.fariszr.knocker.data.remote.KnockResponse
import com.fariszr.knocker.data.remote.KnockerApiService
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

class WhitelistIpUseCaseTest {

    @Mock
    private lateinit var knockerApiService: KnockerApiService

    @Mock
    private lateinit var settingsDataStore: SettingsDataStore

    private lateinit var whitelistIpUseCase: WhitelistIpUseCase

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        whitelistIpUseCase = WhitelistIpUseCase(knockerApiService, settingsDataStore)
    }

    @Test
    fun `invoke success`() = runBlocking {
        val token = "test-token"
        val ipAddress = "127.0.0.1"
        val ttl = 60
        val knockRequest = KnockRequest(ipAddress, ttl)
        val knockResponse = KnockResponse("127.0.0.1", 12345, 60)

        `when`(settingsDataStore.getKnockerToken()).thenReturn(flowOf(token))
        `when`(knockerApiService.knock(token, ipAddress, knockRequest)).thenReturn(knockResponse)

        val result = whitelistIpUseCase(ipAddress, ttl).first()

        assertEquals(knockResponse, result)
    }
}