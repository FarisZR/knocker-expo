package com.fariszr.knocker.data.remote

import com.google.gson.Gson
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class KnockerApiServiceTest {

    private lateinit var server: MockWebServer
    private lateinit var apiService: KnockerApiService

    @Before
    fun setUp() {
        server = MockWebServer()
        apiService = Retrofit.Builder()
            .baseUrl(server.url(""))
            .addConverterFactory(GsonConverterFactory.create(Gson()))
            .build()
            .create(KnockerApiService::class.java)
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `knock success`() = runBlocking {
        val responseBody = KnockResponse("127.0.0.1", 12345, 60)
        val mockResponse = MockResponse()
            .setBody(Gson().toJson(responseBody))
            .setResponseCode(200)
        server.enqueue(mockResponse)

        val response = apiService.knock("api-key", "127.0.0.1", KnockRequest(null, null))
        assertEquals(responseBody, response)
    }

    @Test
    fun `knock unauthorized`() = runBlocking {
        val mockResponse = MockResponse()
            .setBody("{\"error\":\"Unauthorized\"}")
            .setResponseCode(401)
        server.enqueue(mockResponse)

        try {
            apiService.knock("wrong-api-key", "127.0.0.1", KnockRequest(null, null))
        } catch (e: Exception) {
            assertEquals("HTTP 401 Client Error", e.message)
        }
    }

    @Test
    fun `health success`() = runBlocking {
        val responseBody = HealthResponse("ok")
        val mockResponse = MockResponse()
            .setBody(Gson().toJson(responseBody))
            .setResponseCode(200)
        server.enqueue(mockResponse)

        val response = apiService.health()
        assertEquals(responseBody, response)
    }
}