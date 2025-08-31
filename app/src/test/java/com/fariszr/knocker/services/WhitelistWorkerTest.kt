package com.fariszr.knocker.services

import android.content.Context
import androidx.work.ListenableWorker
import androidx.work.WorkerFactory
import androidx.work.WorkerParameters
import androidx.work.testing.TestListenableWorkerBuilder
import com.fariszr.knocker.domain.usecase.WhitelistIpUseCase
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class WhitelistWorkerTest {

    @Mock
    private lateinit var whitelistIpUseCase: WhitelistIpUseCase

    private lateinit var context: Context

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        context = androidx.test.core.app.ApplicationProvider.getApplicationContext()
    }

    @Test
    fun `worker success`() = runBlocking {
        val worker = TestListenableWorkerBuilder<WhitelistWorker>(context)
            .setWorkerFactory(object : WorkerFactory() {
                override fun createWorker(
                    appContext: Context,
                    workerClassName: String,
                    workerParameters: WorkerParameters
                ): ListenableWorker {
                    return WhitelistWorker(
                        appContext,
                        workerParameters,
                        whitelistIpUseCase
                    )
                }
            })
            .build()

        val result = worker.doWork()
        assertEquals(ListenableWorker.Result.success(), result)
    }
}