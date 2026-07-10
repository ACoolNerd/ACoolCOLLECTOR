package com.acoolcollector.nativeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color
import com.acoolcollector.nativeapp.profile.ACoolAccessibility
import com.acoolcollector.nativeapp.profile.ACoolInterests
import com.acoolcollector.nativeapp.profile.ACoolPrivacy
import com.acoolcollector.nativeapp.profile.ACoolProfile
import com.acoolcollector.nativeapp.profile.ACoolProfileScreen
import com.acoolcollector.nativeapp.profile.ACoolTrust
import com.acoolcollector.nativeapp.profile.ProfileType
import java.time.Instant
import java.util.UUID

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFFE8520F),
                    secondary = Color(0xFFFFB18C)
                )
            ) {
                ACoolProfileScreen(
                    profile = previewProfile(),
                    onEditProfile = {},
                    onManagePrivacy = {},
                    onManageSecurity = {},
                    onOpenInterest = {}
                )
            }
        }
    }
}

private fun previewProfile(): ACoolProfile = ACoolProfile(
    profileId = UUID.fromString("5c6716cc-bbdb-46a4-ae74-8d639f57392a"),
    userId = UUID.fromString("72556984-7294-43bd-a4ad-a3cc72519662"),
    username = "acoolcollector",
    displayName = "ACoolCOLLECTOR",
    bio = "Cards today. Legacy tomorrow.",
    preferredCurrency = "USD",
    profileTypes = setOf(ProfileType.COLLECTOR),
    interests = ACoolInterests(
        franchises = setOf("ONE PIECE CARD GAME", "Disney Lorcana"),
        games = setOf("Pokémon"),
        cardTypes = setOf("Rookie", "Manga", "Serialized")
    ),
    privacy = ACoolPrivacy(),
    accessibility = ACoolAccessibility(),
    trust = ACoolTrust(
        emailVerified = true,
        mfaEnrolled = true,
        passkeyCount = 1,
        businessVerificationStatus = "not_applicable"
    ),
    createdAt = Instant.parse("2026-07-10T00:00:00Z"),
    updatedAt = Instant.parse("2026-07-10T00:00:00Z")
)
