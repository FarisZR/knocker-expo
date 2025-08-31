package com.fariszr.knocker.services

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.fariszr.knocker.domain.usecase.WhitelistIpUseCase
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class WhitelistReceiver : BroadcastReceiver() {

    @Inject
    lateinit var whitelistIpUseCase: WhitelistIpUseCase

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == QuickSettingsService.ACTION_WHITELIST) {
            GlobalScope.launch {
                whitelistIpUseCase(null, null)
            }
        }
    }
}