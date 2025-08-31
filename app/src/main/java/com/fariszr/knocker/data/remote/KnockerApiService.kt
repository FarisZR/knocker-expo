package com.fariszr.knocker.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface KnockerApiService {

    @POST("knock")
    suspend fun knock(
        @Header("X-Api-Key") apiKey: String,
        @Header("X-Forwarded-For") clientIp: String,
        @Body knockRequest: KnockRequest
    ): KnockResponse

    @GET("health")
    suspend fun health(): HealthResponse
}