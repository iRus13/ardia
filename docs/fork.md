# Ѫ browser

Ѫ is a personal fork of [Ardia](https://github.com/ardia-browser/ardia), maintained at [iRus13/ardia](https://github.com/iRus13/ardia).

The initial customization sets the macOS display name and application menu name to **Ѫ**. Internal project, executable, package and engine names remain Ardia so the existing build scripts continue to work.

Automatic updates are disabled, and the upstream update feed and signing key are cleared. This fork has no release feed of its own yet.

## Current status

- The source has been forked and the initial display name has been configured.
- A local Apple Silicon Release app has been built, signature-verified and launched. It uses a separate local bundle identity and its own profile; no public release has been published.
- The app icon uses Helium’s original dark macOS artwork; most in-app Ardia wording remains.
- The bundle identifier, signing configuration, data locations and service endpoints still need review before a usable standalone build. Do not run this fork against an existing Ardia profile.
- Passkeys and saved cards depend on the upstream developer signing identity and are not expected to work in a separately signed build without additional changes.
- Original licenses and attribution remain in LICENSE, LICENSE.Apache-2.0 and NOTICE. The distributed browser is GPL-3.0; Ardia’s own source files are Apache-2.0.

The display name uses the Unicode character U+046A (Ѫ). Repository and internal code identifiers remain ASCII.

## Sidebar material

The sidebar now uses the existing native regular Liquid Glass panel in both docked and hover-revealed states on macOS 26 and later. The lightly tinted material follows the current light or dark appearance and the existing glass tint preferences, with a rounded inset backing when docked. Settings’ Classic interface style retains the original sidebar background. Older macOS versions retain the original profile backdrop and vibrancy.

The glass backing does not receive pointer events, and the existing sidebar resize, tab drag, profile swipe, reveal geometry and reveal shadow are preserved. No extra animations were added. Native system materials adapt to macOS accessibility display settings; a live Reduce Transparency and contrast check remains outstanding.

The web demo was visually checked with the sidebar open and hidden, and the hide control worked. The 24 sidebar motion checks, 7 pane chrome checks, 13 convention checks and changed-file syntax checks passed. The dependency setup was subsequently completed; full typecheck and the local native Release build pass. The web preview approximates the material; Apple’s native rendering still needs a live check.

## App icon

The icon comes from Helium’s original [Icon Composer source](https://github.com/imputnet/helium-macos/tree/main/resources/assets/AppIcon.icon), including the unchanged [logo.svg](https://github.com/imputnet/helium-macos/blob/main/resources/assets/AppIcon.icon/Assets/logo.svg) and original glass layer configuration. It is not a generated recreation.

The default appearance was changed on 2026-11-12 to use the original dark variant’s charcoal gradient and 96% logo opacity, while retaining the source’s dark appearance specialization. The original SVG geometry is unchanged.

Helium’s repository is licensed under [GPL-3.0](https://github.com/imputnet/helium-macos/blob/main/LICENSE). The imported artwork retains that license and The Helium Authors’ attribution in NOTICE; Ardia’s Apache-2.0 license does not replace the artwork’s license. The distributed browser remains GPL-3.0.

Icon Composer exported both Default and Dark renditions successfully for macOS design generation 27. The native Default rendition can have different system lighting from Dark despite the dark default palette; the original Dark rendition is the visual reference. The editable vector layers remain intact.

## Space icons and footer

The profile icon picker opens on an eight-column, seven-row symbol palette matching the requested reference. Existing saved symbol IDs and emoji choices remain supported. Four silhouettes unavailable as native SF Symbols use MIT-licensed Phosphor Icons assets; the original vectors and license are included with the assets.

The footer keeps Library at the left, profile icons in a centered group with a 34-point maximum cadence, and Create Profile at the right. Library opens the existing Bookmarks, History and Downloads commands. The existing download access is included there. Selected profile icons are bright and inactive icons subdued; each icon retains its profile tooltip and context menu. New settings default to showing profile icons, while explicit saved icon/dot preferences remain supported.

## Sidebar layout and motion

The address pill shows the host first, an always-visible Copy URL chain button, then Site Controls. Copy uses the existing clean-link action and toast. Windowed navigation has its own row below the native window controls; fullscreen keeps the compact layout.

Command panels, the New Tab search box, selected and hovered suggestions, ordinary tab rows and tab-list controls use native glass in Glass mode. Classic and older-macOS fallbacks remain. Drag targets and multiselection keep their existing feedback.

Hidden sidebar reveal and hide start immediately and use a 150 ms ease-out, matching the owner’s current Dock timing. Reduce Motion is instant. Focus gates, hold areas and rapid reversal remain; the macOS Dock preferences are unchanged.

## Reference layout polish

The compact hover-revealed sidebar matches the supplied reference geometry in points: navigation center 24, address top 46/height 36, pinned tiles top 90/height 47, profile heading center 163, New Tab center 204. The heading uses each page’s own profile ID, and retains its profile menu. Windowed docked sidebars share the navigation row with the native window controls: the first window control is at x=20 and the sidebar toggle is at x=89. Peeks and native fullscreen use x=29 for the toggle. Compact peeks keep native window controls offscreen so they cannot cover the toggle.

All sidebar transitions now use the same 150 ms positional ease-out, including docked button/keyboard toggles and hover reveal. Pinning an already visible peek does not start a second slide, and repeated hover events do not restart the animation.

Verified in an isolated native Debug instance: edge reveal and hold behavior, the compact layout measurements above, and the chain button copying the exact active URL. Layer snapshots verified geometry; native glass and Metal materials still need an unlocked-screen visual check.

## macOS fullscreen sidebar

The native edge watcher accepts macOS fullscreen windows, allowing the auto-hidden sidebar to reveal and remain interactive from either edge. Existing visibility, minimization, pointer-hit and pressed-button checks remain. HTML/video fullscreen keeps its separate behavior. The sidebar retains the same immediate 150 ms reveal and hide.

## Arc controls and shared spaces

The sidebar address pill and content use an 8 pt inset, with 8 pt gaps between pinned tiles. New Tab text aligns with the space heading. The copy icon follows the shipped Arc spring/clip transitions and a one-second confirmation dwell, with repeated presses extending the confirmation. Reduce Motion uses immediate feedback.

The original Library glyph is used for the bottom-left control, inside the recovered 32 × 32 pt frame. The footer centers its controls 24 pt above the bottom edge while retaining the 34 pt space-icon cadence. Its hover preview shows recent downloads; clicking opens the full Downloads page, and the context menu retains other Library navigation. The preview uses native glass and hover retention between the button and preview. The copy and Library press motion constants were recovered from the installed Arc build. Ordinary Library hover changes the backing and foreground; pressing uses a 0.95 scale with the recovered spring. Native interaction and geometry checks passed; frame-by-frame visual comparison remains limited by window capture.

Arc imports preserve custom symbols and emoji on spaces and pinned websites, and preserve favorites shared by spaces using the same browser profile. Local profile alignment is separate from repository source and does not publish browsing data.
