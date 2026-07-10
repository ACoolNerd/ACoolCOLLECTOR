import SwiftUI

struct ACoolProfileView: View {
    let profile: ACoolProfile
    let editProfile: () -> Void
    let managePrivacy: () -> Void
    let manageSecurity: () -> Void
    let openInterest: (String) -> Void

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 20) {
                    identityHeader
                    actionRow
                    securityCard
                    interestsSection
                    privacyCard
                }
                .padding()
                .frame(maxWidth: 900, alignment: .leading)
            }
            .navigationTitle("Profile")
            .background(Color.acoolBackground)
        }
    }

    private var identityHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(profile.displayName ?? profile.username)
                .font(.largeTitle.bold())
                .accessibilityAddTraits(.isHeader)

            Text("@\(profile.username)")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if let bio = profile.bio, !bio.isEmpty {
                Text(bio)
                    .font(.body)
            }

            Text(
                profile.profileTypes
                    .map { $0.rawValue.replacingOccurrences(of: "_", with: " ") }
                    .sorted()
                    .joined(separator: " • ")
            )
            .font(.caption.weight(.semibold))
            .textCase(.uppercase)
            .foregroundStyle(.secondary)
        }
    }

    private var actionRow: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) {
                profileActions
            }
            VStack(alignment: .leading, spacing: 12) {
                profileActions
            }
        }
    }

    @ViewBuilder
    private var profileActions: some View {
        Button("Edit profile", action: editProfile)
            .buttonStyle(.borderedProminent)
        Button("Privacy", action: managePrivacy)
            .buttonStyle(.bordered)
        Button("Security", action: manageSecurity)
            .buttonStyle(.bordered)
    }

    private var securityCard: some View {
        GroupBox("Account security") {
            VStack(alignment: .leading, spacing: 10) {
                ACoolStatusRow(label: "Email verified", value: profile.trust.emailVerified)
                ACoolStatusRow(label: "MFA enrolled", value: profile.trust.mfaEnrolled)
                LabeledContent("Passkeys", value: "\(profile.trust.passkeyCount)")
                LabeledContent("Standing", value: profile.trust.accountStanding.capitalized)

                if profile.trust.requiresStepUpAuthentication {
                    Label(
                        "Step-up verification is required for protected actions.",
                        systemImage: "lock.trianglebadge.exclamationmark"
                    )
                    .foregroundStyle(.orange)
                    .font(.callout)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 6)
        }
    }

    private var interestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Collector interests")
                .font(.title2.bold())
                .accessibilityAddTraits(.isHeader)

            if profile.interests.allDisplayValues.isEmpty {
                Text("Add franchises, players, characters, teams, games, or sets to personalize recommendations.")
                    .foregroundStyle(.secondary)
            } else {
                LazyVGrid(
                    columns: [GridItem(.adaptive(minimum: dynamicTypeSize.isAccessibilitySize ? 220 : 150))],
                    spacing: 12
                ) {
                    ForEach(profile.interests.allDisplayValues, id: \.self) { interest in
                        Button {
                            openInterest(interest)
                        } label: {
                            HStack {
                                Text(interest)
                                    .multilineTextAlignment(.leading)
                                Spacer(minLength: 8)
                                Image(systemName: "chevron.right")
                                    .imageScale(.small)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                        }
                        .buttonStyle(.plain)
                        .accessibilityHint("Opens this collector interest")
                    }
                }
            }
        }
        .animation(reduceMotion ? nil : .snappy, value: profile.interests.allDisplayValues)
    }

    private var privacyCard: some View {
        GroupBox("Privacy summary") {
            VStack(alignment: .leading, spacing: 10) {
                LabeledContent("Profile", value: profile.privacy.profileVisibility.label)
                LabeledContent("Collection", value: profile.privacy.collectionVisibility.label)
                LabeledContent("Values", value: profile.privacy.valueVisibility.label)
                LabeledContent("Wishlist", value: profile.privacy.wishlistVisibility.label)
                LabeledContent("Show attendance", value: profile.privacy.eventAttendanceVisibility.label)
                LabeledContent("Vendor notes", value: "Private")
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 6)
        }
    }
}

private struct ACoolStatusRow: View {
    let label: String
    let value: Bool

    var body: some View {
        LabeledContent {
            Label(value ? "Yes" : "No", systemImage: value ? "checkmark.circle.fill" : "xmark.circle")
                .foregroundStyle(value ? .green : .secondary)
        } label: {
            Text(label)
        }
    }
}

private extension ACoolVisibility {
    var label: String {
        rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

private extension Color {
    static let acoolBackground = Color(
        red: 20 / 255,
        green: 20 / 255,
        blue: 22 / 255
    )
}
