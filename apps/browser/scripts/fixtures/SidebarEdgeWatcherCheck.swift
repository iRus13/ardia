import AppKit

final class EdgeCheckWindow: NSWindow {
  var reportsFullScreen = false
  var reportsVisible = true
  var reportsMinimized = false
  override var isVisible: Bool { reportsVisible }
  override var isMiniaturized: Bool { reportsMinimized }
  override var screen: NSScreen? { NSScreen.main }
  override var styleMask: NSWindow.StyleMask {
    get { reportsFullScreen ? super.styleMask.union(.fullScreen) : super.styleMask }
    set { super.styleMask = newValue }
  }
}

final class WindowManager {
  static let shared = WindowManager()
  var testWindow: NSWindow?
  func window(_ id: String) -> NSWindow? { id == "edge-check" ? testWindow : nil }
}

enum EdgeCheckEvent { case window }
enum ShellEvents {
  static var events: [[String: Any]] = []
  static func send(_ kind: EdgeCheckEvent, _ event: [String: Any]) { events.append(event) }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
guard let screen = NSScreen.main else { fatalError("No test screen") }
let window = EdgeCheckWindow(contentRect: screen.frame, styleMask: .borderless, backing: .buffered, defer: true)
window.ignoresMouseEvents = true
WindowManager.shared.testWindow = window
let watcher = SidebarEdgeWatcher.shared
let blocked = CommandLine.arguments.contains("--expect-blocked")
let bounds = window.frame
let y = bounds.midY

func check(_ name: String, fullScreen: Bool, right: Bool, hold: CGFloat, x: CGFloat, expected: Bool) {
  watcher.reset()
  ShellEvents.events = []
  window.reportsFullScreen = fullScreen
  watcher.pointerOverride = NSPoint(x: x, y: y)
  watcher.watch(id: "edge-check", on: true, hold: hold, right: right, whilePressed: false)
  guard let event = ShellEvents.events.last, let over = event["over"] as? Bool else { fatalError("\(name): no edge event") }
  guard over == expected else { fatalError("\(name): over=\(over), expected=\(expected)") }
  print("PASS \(name)")
}

check("windowed left edge", fullScreen: false, right: false, hold: 8, x: bounds.minX + 1, expected: true)
check("fullscreen left edge", fullScreen: true, right: false, hold: 8, x: bounds.minX + 1, expected: !blocked)
check("fullscreen right edge", fullScreen: true, right: true, hold: 8, x: bounds.maxX - 1, expected: !blocked)
check("fullscreen page is outside edge", fullScreen: true, right: false, hold: 8, x: bounds.midX, expected: false)
check("fullscreen expanded left hold", fullScreen: true, right: false, hold: 260, x: bounds.minX + 180, expected: !blocked)
check("fullscreen beyond expanded hold", fullScreen: true, right: false, hold: 260, x: bounds.minX + 300, expected: false)
window.reportsMinimized = true
check("minimized fullscreen remains excluded", fullScreen: true, right: false, hold: 8, x: bounds.minX + 1, expected: false)
window.reportsMinimized = false
window.reportsVisible = false
check("invisible fullscreen remains excluded", fullScreen: true, right: false, hold: 8, x: bounds.minX + 1, expected: false)
watcher.reset()
window.close()
