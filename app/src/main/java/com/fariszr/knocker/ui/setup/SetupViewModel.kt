package com.fariszr.knocker.ui.setup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fariszr.knocker.domain.usecase.CheckHealthUseCase
import com.fariszr.knocker.domain.usecase.SaveSettingsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SetupViewModel @Inject constructor(
    private val checkHealthUseCase: CheckHealthUseCase,
    private val saveSettingsUseCase: SaveSettingsUseCase
) : ViewModel() {

    fun saveSettings(endpoint: String, token: String) {
        viewModelScope.launch {
            saveSettingsUseCase(endpoint, token)
            checkHealthUseCase()
        }
    }
}