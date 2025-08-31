package com.fariszr.knocker.domain.usecase

import com.fariszr.knocker.data.local.SettingsDataStore
import javax.inject.Inject

class SaveSettingsUseCase @Inject constructor(
    private val settingsDataStore: SettingsDataStore
) {
    suspend operator fun invoke(endpoint: String, token: String) {
        settingsDataStore.setKnockerEndpoint(endpoint)
        settingsDataStore.setKnockerToken(token)
    }
}