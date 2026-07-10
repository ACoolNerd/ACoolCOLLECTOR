// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ACoolCOLLECTORApple",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
        .watchOS(.v11),
        .visionOS(.v2)
    ],
    products: [
        .library(
            name: "ACoolProfile",
            targets: ["ACoolProfile"]
        )
    ],
    targets: [
        .target(
            name: "ACoolProfile",
            path: "Sources/ACoolProfile"
        ),
        .testTarget(
            name: "ACoolProfileTests",
            dependencies: ["ACoolProfile"],
            path: "Tests/ACoolProfileTests"
        )
    ],
    swiftLanguageModes: [.v6]
)
