import Foundation

public enum ACoolAudioSourceMode: String, Codable, Sendable {
    case acoolOwned = "acool_owned"
    case userOwned = "user_owned"
    case licensedProvider = "licensed_provider"
    case externalDeepLink = "external_deep_link"
    case none
}

public struct ACoolAudioPolicy: Codable, Equatable, Sendable {
    public var sourceMode: ACoolAudioSourceMode
    public var musicEnabled: Bool
    public var duckForNavigation: Bool
    public var pauseForSafetyAlerts: Bool
    public var rightsVerified: Bool
    public var providerApproved: Bool

    public init(
        sourceMode: ACoolAudioSourceMode = .none,
        musicEnabled: Bool = false,
        duckForNavigation: Bool = true,
        pauseForSafetyAlerts: Bool = true,
        rightsVerified: Bool = false,
        providerApproved: Bool = false
    ) {
        self.sourceMode = sourceMode
        self.musicEnabled = musicEnabled
        self.duckForNavigation = duckForNavigation
        self.pauseForSafetyAlerts = pauseForSafetyAlerts
        self.rightsVerified = rightsVerified
        self.providerApproved = providerApproved
    }

    public var canStartInAppPlayback: Bool {
        guard musicEnabled else { return false }
        switch sourceMode {
        case .acoolOwned, .userOwned:
            return rightsVerified
        case .licensedProvider:
            return rightsVerified && providerApproved
        case .externalDeepLink, .none:
            return false
        }
    }

    public func shouldDuckForGuidance(isNavigationActive: Bool) -> Bool {
        isNavigationActive && duckForNavigation
    }

    public func shouldPauseForAlert(isSafetyAlert: Bool) -> Bool {
        isSafetyAlert && pauseForSafetyAlerts
    }
}
