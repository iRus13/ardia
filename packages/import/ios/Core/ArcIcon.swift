import Foundation

enum ArcIcon {
  static let symbols = [
    "fileTrayFull": "tray.full.fill",
    "shapes": "drop.triangle.fill",
    "book": "book.fill",
    "video": "video.fill",
    "medical": "asterisk",
    "document": "doc.fill",
    "briefcase": "briefcase.fill",
    "star": "star.fill",
    "heart": "heart.fill",
    "folder": "folder.fill",
    "calendar": "calendar",
    "mail": "envelope.fill",
    "music": "music.note",
    "globe": "globe.americas.fill",
    "lightbulb": "lightbulb.fill",
    "planet": "saturn",
    "campfire": "campfire.fill",
    "pizza": "pizza.fill",
    "skull": "skull.fill",
  ]

  static func value(_ type: [String: Any]?) -> String? {
    if let emoji = ArcSidebar.emoji(type) { return emoji }
    guard let icon = type?["icon"] as? String, let symbol = symbols[icon] else { return nil }
    return "symbol:\(symbol)"
  }
}
