package com.fariszr.knocker.services

import android.content.Intent
import android.os.Build
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi

@RequiresApi(Build.VERSION_CODES.N)
class QuickSettingsService : TileService() {

    override fun onClick() {
        super.onClick()
        val intent = Intent(this, WhitelistReceiver::class.java)
        intent.action = ACTION_WHITELIST
        sendBroadcast(intent)
    }

    companion object {
        const val ACTION_WHITELIST = "com.fariszr.knocker.WHITELIST_IP"
    }
}