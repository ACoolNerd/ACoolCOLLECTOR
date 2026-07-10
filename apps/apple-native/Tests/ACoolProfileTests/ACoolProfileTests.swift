import Foundation
import Testing
@testable import ACoolProfile

struct ACoolProfileTests {
    @Test
    func privateVisibilityIsTheDefault() throws {
        let profile = try makeProfile().validated()

        #expect(profile.privacy.collectionVisibility == .private)
        #expect(profile.privacy.valueVisibility == .private)
        #expect(profile.privacy.eventAttendanceVisibility == .private)
    }

    @Test
    func passkeyAndMFAAllowProtectedActionEvaluation() throws {
        let profile = try makeProfile().validated()
        #expect(profile.trust.requiresStepUpAuthentication == false)
    }

    @Test
    func invalidUsernameFailsValidation() {
        var profile = makeProfile()
        profile.username = "not valid!"

        #expect(throws: ACoolProfile.ValidationError.self) {
            try profile.validated()
        }
    }

    private func makeProfile() -> ACoolProfile {
        ACoolProfile(
            id: UUID(uuidString: "5c6716cc-bbdb-46a4-ae74-8d639f57392a")!,
            userId: UUID(uuidString: "72556984-7294-43bd-a4ad-a3cc72519662")!,
            username: "collector.one",
            profileTypes: [.collector],
            trust: ACoolTrust(
                emailVerified: true,
                mfaEnrolled: true,
                passkeyCount: 1,
                businessVerificationStatus: "not_applicable"
            ),
            createdAt: Date(timeIntervalSince1970: 0),
            updatedAt: Date(timeIntervalSince1970: 0)
        )
    }
}
