package com.fariszr.knocker.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fariszr.knocker.domain.usecase.WhitelistIpUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val whitelistIpUseCase: WhitelistIpUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow("Ready")
    val uiState = _uiState.asStateFlow()

    fun whitelistIp(ipAddress: String?, ttl: Int?) {
        viewModelScope.launch {
            whitelistIpUseCase(ipAddress, ttl)
                .catch { _uiState.value = "Error: ${it.message}" }
                .collect { _uiState.value = "Whitelisted!" }
        }
    }
}