package com.acoolcollector.nativeapp.profile

import java.time.Instant
import java.util.UUID
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ACoolProfileTest {
    @Test
    fun privateProfileDoesNotExposeCollectionValue() {
        val profile = profile(ACoolPrivacy())
        assertFalse(profile.canExposeCollectionValue())
    }

    @Test
    fun publicValueVisibilityMustBeExplicit() {
        val profile = profile(
            ACoolPrivacy(valueVisibility = Visibility.PUBLIC)
        )
        assertTrue(profile.canExposeCollectionValue())
    }

    @Test
    fun missingPasskeyRequiresStepUpAuthentication() {
        val profile = profile(
            privacy = ACoolPrivacy(),
            trust = ACoolTrust(
                emailVerified = true,
                mfaEnrolled = true,
                passkeyCount = 0,
                businessVerificationStatus = "not_applicable"
            )
        )
        assertTrue(profile.requiresStepUpAuthentication())
    }

    private fun profile(
        privacy: ACoolPrivacy,
        trust: ACoolTrust = ACoolTrust(
            emailVerified = true,
            mfaEnrolled = true,
            passkeyCount = 1,
            businessVerificationStatus = "not_applicable"
        )
    ): ACoolProfile = ACoolProfile(
        profileId = UUID.fromString("5c6716cc-bbdb-46a4-ae74-8d639f57392a"),
        userId = UUID.fromString("72556984-7294-43bd-a4ad-a3cc72519662"),
        username = "collector.one",
        profileTypes = setOf(ProfileType.COLLECTOR),
        privacy = privacy,
        trust = trust,
        createdAt = Instant.parse("2026-07-10T00:00:00Z"),
        updatedAt = Instant.parse("2026-07-10T00:00:00Z")
    )
}
