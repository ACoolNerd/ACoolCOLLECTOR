package com.acoolcollector.nativeapp.profile

import java.time.Instant
import java.util.UUID

enum class ProfileType {
    COLLECTOR,
    DEALER,
    VENDOR,
    BREAKER,
    CONSIGNOR,
    SHOP,
    SUBMISSION_CENTER,
    EVENT_ORGANIZER,
    CONTENT_CREATOR,
    ADMINISTRATOR
}

enum class Visibility {
    PRIVATE,
    CONNECTIONS,
    MEMBERS,
    PUBLIC
}

enum class ColorVisionMode {
    STANDARD,
    PROTANOPIA,
    DEUTERANOPIA,
    TRITANOPIA,
    MONOCHROME
}

enum class NativePlatform {
    ANDROID,
    WEAR_OS,
    ANDROID_XR,
    META_QUEST,
    IOS,
    IPADOS,
    MACOS,
    WATCHOS,
    VISIONOS,
    WEB
}

data class ACoolPrivacy(
    val profileVisibility: Visibility = Visibility.PRIVATE,
    val collectionVisibility: Visibility = Visibility.PRIVATE,
    val valueVisibility: Visibility = Visibility.PRIVATE,
    val wishlistVisibility: Visibility = Visibility.PRIVATE,
    val eventAttendanceVisibility: Visibility = Visibility.PRIVATE,
    val allowSearchIndexing: Boolean = false,
    val allowProfileRecommendations: Boolean = true,
    val allowResearchAnalytics: Boolean = false
)

data class ACoolAccessibility(
    val textScale: Float = 1.0f,
    val reduceMotion: Boolean = false,
    val highContrast: Boolean = false,
    val screenReaderOptimized: Boolean = false,
    val colorVisionMode: ColorVisionMode = ColorVisionMode.STANDARD,
    val hapticsEnabled: Boolean = true,
    val speechRate: Float = 1.0f,
    val captionsEnabled: Boolean = true
) {
    init {
        require(textScale in 0.8f..2.0f) { "textScale must be between 0.8 and 2.0" }
        require(speechRate in 0.5f..2.0f) { "speechRate must be between 0.5 and 2.0" }
    }
}

data class ACoolInterests(
    val categories: Set<String> = emptySet(),
    val franchises: Set<String> = emptySet(),
    val sports: Set<String> = emptySet(),
    val games: Set<String> = emptySet(),
    val players: Set<String> = emptySet(),
    val characters: Set<String> = emptySet(),
    val teams: Set<String> = emptySet(),
    val sets: Set<String> = emptySet(),
    val artists: Set<String> = emptySet(),
    val eras: Set<String> = emptySet(),
    val cardTypes: Set<String> = emptySet()
)

data class ACoolTrust(
    val emailVerified: Boolean,
    val phoneVerified: Boolean = false,
    val mfaEnrolled: Boolean,
    val passkeyCount: Int,
    val businessVerificationStatus: String,
    val accountStanding: String = "good"
) {
    init {
        require(passkeyCount >= 0) { "passkeyCount cannot be negative" }
    }
}

data class ACoolDeviceLink(
    val deviceId: UUID,
    val platform: NativePlatform,
    val trusted: Boolean,
    val lastSeenAt: Instant,
    val pushEnabled: Boolean = false
)

data class ACoolProfile(
    val profileId: UUID,
    val userId: UUID,
    val organizationId: UUID? = null,
    val username: String,
    val displayName: String? = null,
    val bio: String? = null,
    val avatarAssetId: UUID? = null,
    val homeRegion: String? = null,
    val preferredCurrency: String = "USD",
    val profileTypes: Set<ProfileType>,
    val interests: ACoolInterests = ACoolInterests(),
    val privacy: ACoolPrivacy = ACoolPrivacy(),
    val accessibility: ACoolAccessibility = ACoolAccessibility(),
    val trust: ACoolTrust,
    val deviceLinks: List<ACoolDeviceLink> = emptyList(),
    val createdAt: Instant,
    val updatedAt: Instant,
    val schemaVersion: Int = 1
) {
    init {
        require(username.matches(Regex("^[A-Za-z0-9._-]{3,40}$"))) {
            "username must be 3-40 characters and contain only letters, numbers, dot, underscore, or hyphen"
        }
        require(displayName == null || displayName.length <= 100)
        require(bio == null || bio.length <= 500)
        require(preferredCurrency.matches(Regex("^[A-Z]{3}$")))
        require(profileTypes.isNotEmpty())
        require(schemaVersion >= 1)
    }

    fun canExposeCollectionValue(): Boolean = privacy.valueVisibility == Visibility.PUBLIC

    fun requiresStepUpAuthentication(): Boolean =
        !trust.mfaEnrolled || trust.passkeyCount == 0 || trust.accountStanding != "good"
}
