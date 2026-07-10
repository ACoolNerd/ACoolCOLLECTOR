package com.acoolcollector.nativeapp.media

enum class ACoolAudioSourceMode {
    ACOOL_OWNED,
    USER_OWNED,
    LICENSED_PROVIDER,
    EXTERNAL_DEEP_LINK,
    NONE,
}

data class ACoolAudioPolicy(
    val sourceMode: ACoolAudioSourceMode = ACoolAudioSourceMode.NONE,
    val musicEnabled: Boolean = false,
    val duckForNavigation: Boolean = true,
    val pauseForSafetyAlerts: Boolean = true,
    val rightsVerified: Boolean = false,
    val providerApproved: Boolean = false,
) {
    fun canStartInAppPlayback(): Boolean {
        if (!musicEnabled) return false
        return when (sourceMode) {
            ACoolAudioSourceMode.ACOOL_OWNED,
            ACoolAudioSourceMode.USER_OWNED -> rightsVerified
            ACoolAudioSourceMode.LICENSED_PROVIDER -> rightsVerified && providerApproved
            ACoolAudioSourceMode.EXTERNAL_DEEP_LINK,
            ACoolAudioSourceMode.NONE -> false
        }
    }

    fun shouldDuckForGuidance(isNavigationActive: Boolean): Boolean =
        isNavigationActive && duckForNavigation

    fun shouldPauseForAlert(isSafetyAlert: Boolean): Boolean =
        isSafetyAlert && pauseForSafetyAlerts
}
