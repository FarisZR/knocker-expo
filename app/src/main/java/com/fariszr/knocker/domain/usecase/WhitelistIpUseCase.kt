package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.local.SettingsDataStore
import com.fariszr.knocker.data.remote.KnockRequest
import com.fariszr.knocker.data.remote.KnockResponse
import com.fariszr.knocker.data.remote.KnockerApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class WhitelistIpUseCase @Inject constructor(
    private val knockerApiService: KnockerApiService,
    private val settingsDataStore: SettingsDataStore
) {
    operator fun invoke(ipAddress: String?, ttl: Int?): Flow<KnockResponse> = flow {
        val token = settingsDataStore.getKnockerToken().first()
        require(!token.isNullOrBlank()) { "API token is not set" }
        val request = KnockRequest(ipAddress, ttl)
        emit(knockerApiService.knock(token, ipAddress ?: "", request))
    }
}