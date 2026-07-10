import Foundation

enum ACoolProfileType: String, Codable, CaseIterable, Sendable {
    case collector
    case dealer
    case vendor
    case breaker
    case consignor
    case shop
    case submissionCenter = "submission_center"
    case eventOrganizer = "event_organizer"
    case contentCreator = "content_creator"
    case administrator
}

enum ACoolVisibility: String, Codable, CaseIterable, Sendable {
    case `private`
    case connections
    case members
    case `public`
}

enum ACoolColorVisionMode: String, Codable, CaseIterable, Sendable {
    case standard
    case protanopia
    case deuteranopia
    case tritanopia
    case monochrome
}

enum ACoolNativePlatform: String, Codable, CaseIterable, Sendable {
    case android
    case wearOS = "wear_os"
    case androidXR = "android_xr"
    case metaQuest = "meta_quest"
    case iOS = "ios"
    case iPadOS = "ipados"
    case macOS = "macos"
    case watchOS = "watchos"
    case visionOS = "visionos"
    case web
}

struct ACoolPrivacy: Codable, Hashable, Sendable {
    var profileVisibility: ACoolVisibility = .private
    var collectionVisibility: ACoolVisibility = .private
    var valueVisibility: ACoolVisibility = .private
    var wishlistVisibility: ACoolVisibility = .private
    var eventAttendanceVisibility: ACoolVisibility = .private
    var allowSearchIndexing = false
    var allowProfileRecommendations = true
    var allowResearchAnalytics = false
}

struct ACoolAccessibility: Codable, Hashable, Sendable {
    var textScale: Double = 1.0
    var reduceMotion = false
    var highContrast = false
    var screenReaderOptimized = false
    var colorVisionMode: ACoolColorVisionMode = .standard
    var hapticsEnabled = true
    var speechRate: Double = 1.0
    var captionsEnabled = true

    func validated() throws -> Self {
        guard (0.8...2.0).contains(textScale) else {
            throw ValidationError.invalidTextScale
        }
        guard (0.5...2.0).contains(speechRate) else {
            throw ValidationError.invalidSpeechRate
        }
        return self
    }

    enum ValidationError: Error {
        case invalidTextScale
        case invalidSpeechRate
    }
}

struct ACoolInterests: Codable, Hashable, Sendable {
    var categories: Set<String> = []
    var franchises: Set<String> = []
    var sports: Set<String> = []
    var games: Set<String> = []
    var players: Set<String> = []
    var characters: Set<String> = []
    var teams: Set<String> = []
    var sets: Set<String> = []
    var artists: Set<String> = []
    var eras: Set<String> = []
    var cardTypes: Set<String> = []

    var allDisplayValues: [String] {
        Array(
            franchises
                .union(sports)
                .union(games)
                .union(players)
                .union(characters)
                .union(teams)
                .union(sets)
        ).sorted()
    }
}

struct ACoolTrust: Codable, Hashable, Sendable {
    var emailVerified: Bool
    var phoneVerified = false
    var mfaEnrolled: Bool
    var passkeyCount: Int
    var businessVerificationStatus: String
    var accountStanding = "good"

    var requiresStepUpAuthentication: Bool {
        !mfaEnrolled || passkeyCount == 0 || accountStanding != "good"
    }
}

struct ACoolDeviceLink: Codable, Hashable, Identifiable, Sendable {
    let id: UUID
    var platform: ACoolNativePlatform
    var trusted: Bool
    var lastSeenAt: Date
    var pushEnabled = false

    enum CodingKeys: String, CodingKey {
        case id = "deviceId"
        case platform
        case trusted
        case lastSeenAt
        case pushEnabled
    }
}

struct ACoolProfile: Codable, Hashable, Identifiable, Sendable {
    let id: UUID
    let userId: UUID
    var organizationId: UUID?
    var username: String
    var displayName: String?
    var bio: String?
    var avatarAssetId: UUID?
    var homeRegion: String?
    var preferredCurrency = "USD"
    var profileTypes: Set<ACoolProfileType>
    var interests = ACoolInterests()
    var privacy = ACoolPrivacy()
    var accessibility = ACoolAccessibility()
    var trust: ACoolTrust
    var deviceLinks: [ACoolDeviceLink] = []
    let createdAt: Date
    var updatedAt: Date
    var schemaVersion = 1

    enum CodingKeys: String, CodingKey {
        case id = "profileId"
        case userId
        case organizationId
        case username
        case displayName
        case bio
        case avatarAssetId
        case homeRegion
        case preferredCurrency
        case profileTypes = "profileType"
        case interests
        case privacy
        case accessibility
        case trust
        case deviceLinks
        case createdAt
        case updatedAt
        case schemaVersion
    }

    func validated() throws -> Self {
        let usernameExpression = try NSRegularExpression(pattern: "^[A-Za-z0-9._-]{3,40}$")
        let range = NSRange(username.startIndex..<username.endIndex, in: username)
        guard usernameExpression.firstMatch(in: username, range: range) != nil else {
            throw ValidationError.invalidUsername
        }
        guard displayName?.count ?? 0 <= 100 else {
            throw ValidationError.displayNameTooLong
        }
        guard bio?.count ?? 0 <= 500 else {
            throw ValidationError.bioTooLong
        }
        guard preferredCurrency.range(of: "^[A-Z]{3}$", options: .regularExpression) != nil else {
            throw ValidationError.invalidCurrency
        }
        guard !profileTypes.isEmpty else {
            throw ValidationError.missingProfileType
        }
        _ = try accessibility.validated()
        return self
    }

    enum ValidationError: Error {
        case invalidUsername
        case displayNameTooLong
        case bioTooLong
        case invalidCurrency
        case missingProfileType
    }
}
