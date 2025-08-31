package com.fariszr.knocker.services

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.test.core.app.ApplicationProvider
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.N])
class QuickSettingsServiceTest {

    private lateinit var context: Context

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
    }

    @Test
    fun `service starts and sends broadcast`() {
        val intent = Intent(context, QuickSettingsService::class.java)
        val service = QuickSettingsService()
        service.onStartCommand(intent, 0, 0)

        val shadowApp = Shadows.shadowOf(context)
        val broadcast = shadowApp.latestBroadcastIntent
        assertEquals(QuickSettingsService.ACTION_WHITELIST, broadcast.action)
    }
}