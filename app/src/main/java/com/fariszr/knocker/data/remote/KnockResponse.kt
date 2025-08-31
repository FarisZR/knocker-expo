package com.fariszr.knocker.data.remote

import com.google.gson.annotations.SerializedName

data class KnockResponse(
    @SerializedName("whitelisted_entry")
    val whitelistedEntry: String,
    @SerializedName("expires_at")
    val expiresAt: Long,
    @SerializedName("expires_in_seconds")
    val expiresInSeconds: Int
)