package com.fariszr.knocker.services

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.fariszr.knocker.domain.usecase.WhitelistIpUseCase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first

@HiltWorker
class WhitelistWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val whitelistIpUseCase: WhitelistIpUseCase
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            whitelistIpUseCase(null, null).first()
            Result.success()
        } catch (e: Exception) {
            Result.failure()
        }
    }
}