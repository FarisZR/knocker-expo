package com.fariszr.knocker.ui.settings

import androidx.lifecycle.ViewModel
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.fariszr.knocker.data.local.SettingsDataStore
import com.fariszr.knocker.services.WhitelistWorker
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val workManager: WorkManager,
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    val workRequest = PeriodicWorkRequestBuilder<WhitelistWorker>(15, TimeUnit.MINUTES)
        .setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        )
        .build()

    fun toggleBackgroundService(enable: Boolean) {
        if (enable) {
            workManager.enqueue(workRequest)
        } else {
            workManager.cancelAllWork()
        }
    }
}