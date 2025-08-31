package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.local.SettingsDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import javax.inject.Inject

class GetSettingsUseCase @Inject constructor(
    private val settingsDataStore: SettingsDataStore
) {
    operator fun invoke(): Flow<Pair<String?, String?>> {
        return settingsDataStore.getKnockerEndpoint().combine(settingsDataStore.getKnockerToken()) { endpoint, token ->
            Pair(endpoint, token)
        }
    }
}