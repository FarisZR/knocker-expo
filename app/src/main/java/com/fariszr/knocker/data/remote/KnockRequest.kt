package com.fariszr.knocker.data.remote

import com.google.gson.annotations.SerializedName

data class KnockRequest(
    @SerializedName("ip_address")
    val ipAddress: String?,
    val ttl: Int?
)