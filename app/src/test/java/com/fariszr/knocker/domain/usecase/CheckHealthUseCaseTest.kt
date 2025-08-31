package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.remote.HealthResponse
import com.fariszr.knocker.data.remote.KnockerApiService
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

class CheckHealthUseCaseTest {

    @Mock
    private lateinit var knockerApiService: KnockerApiService

    private lateinit var checkHealthUseCase: CheckHealthUseCase

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        checkHealthUseCase = CheckHealthUseCase(knockerApiService)
    }

    @Test
    fun `invoke success`() = runBlocking {
        val healthResponse = HealthResponse("ok")
        `when`(knockerApiService.health()).thenReturn(healthResponse)

        val result = checkHealthUseCase().first()

        assertEquals(healthResponse, result)
    }
}