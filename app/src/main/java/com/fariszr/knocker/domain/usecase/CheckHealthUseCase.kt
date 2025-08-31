package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.remote.HealthResponse
import com.fariszr.knocker.data.remote.KnockerApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class CheckHealthUseCase @Inject constructor(
    private val knockerApiService: KnockerApiService
) {
    operator fun invoke(): Flow<HealthResponse> = flow {
        emit(knockerApiService.health())
    }
}