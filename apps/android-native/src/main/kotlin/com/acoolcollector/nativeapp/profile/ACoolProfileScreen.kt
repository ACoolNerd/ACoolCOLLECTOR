package com.acoolcollector.nativeapp.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

/**
 * Native adaptive profile surface for Android phones, tablets, foldables,
 * ChromeOS, Wear-compatible companion flows, and XR-compatible 2D panels.
 *
 * Restricted actions remain callbacks so the application shell can require
 * authorization, step-up authentication, and audit logging before execution.
 */
@Composable
fun ACoolProfileScreen(
    profile: ACoolProfile,
    modifier: Modifier = Modifier,
    onEditProfile: () -> Unit,
    onManagePrivacy: () -> Unit,
    onManageSecurity: () -> Unit,
    onOpenInterest: (String) -> Unit
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = profile.displayName ?: profile.username,
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.semantics { heading() }
                )
                Text(
                    text = "@${profile.username}",
                    style = MaterialTheme.typography.bodyMedium
                )
                profile.bio?.takeIf { it.isNotBlank() }?.let {
                    Text(text = it, style = MaterialTheme.typography.bodyLarge)
                }
                Text(
                    text = profile.profileTypes
                        .map { it.name.lowercase().replace('_', ' ') }
                        .sorted()
                        .joinToString(" • "),
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(onClick = onEditProfile) {
                    Text("Edit profile")
                }
                OutlinedButton(onClick = onManagePrivacy) {
                    Text("Privacy")
                }
            }
        }

        item {
            SecuritySummaryCard(
                profile = profile,
                onManageSecurity = onManageSecurity
            )
        }

        item {
            Text(
                text = "Collector interests",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.semantics { heading() }
            )
        }

        val interests = buildList {
            addAll(profile.interests.franchises)
            addAll(profile.interests.sports)
            addAll(profile.interests.games)
            addAll(profile.interests.players)
            addAll(profile.interests.characters)
            addAll(profile.interests.teams)
            addAll(profile.interests.sets)
        }.distinct().sorted()

        if (interests.isEmpty()) {
            item {
                Text(
                    text = "Add franchises, players, characters, teams, games, or sets to personalize recommendations.",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        } else {
            items(interests, key = { it }) { interest ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onOpenInterest(interest) }
                ) {
                    Text(
                        text = interest,
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
        }

        item {
            PrivacySummaryCard(profile = profile)
        }
    }
}

@Composable
private fun SecuritySummaryCard(
    profile: ACoolProfile,
    onManageSecurity: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Account security",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.semantics { heading() }
            )
            Text("Email verified: ${yesNo(profile.trust.emailVerified)}")
            Text("MFA enrolled: ${yesNo(profile.trust.mfaEnrolled)}")
            Text("Passkeys: ${profile.trust.passkeyCount}")
            Text("Standing: ${profile.trust.accountStanding}")
            if (profile.requiresStepUpAuthentication()) {
                Text(
                    text = "Step-up verification is required for protected actions.",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            OutlinedButton(onClick = onManageSecurity) {
                Text("Manage security")
            }
        }
    }
}

@Composable
private fun PrivacySummaryCard(profile: ACoolProfile) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Privacy summary",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.semantics { heading() }
            )
            Text("Profile: ${profile.privacy.profileVisibility.label()}")
            Text("Collection: ${profile.privacy.collectionVisibility.label()}")
            Text("Values: ${profile.privacy.valueVisibility.label()}")
            Text("Wishlist: ${profile.privacy.wishlistVisibility.label()}")
            Text("Show attendance: ${profile.privacy.eventAttendanceVisibility.label()}")
            Text("Vendor notes: private")
        }
    }
}

private fun yesNo(value: Boolean): String = if (value) "Yes" else "No"

private fun Visibility.label(): String = name.lowercase().replace('_', ' ')
