const AME_API_BASE = "https://ame-api.nattapat2871.me";
// Author/creator: nattapat2871 (https://nattapat2871.me)
const DEVELOPER_USER_ID = "1007237437627572275";
const DEVELOPER_WS_URL = `wss://ame-api.nattapat2871.me/ws/v1/user/${DEVELOPER_USER_ID}`;
const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const LEGAL_DOCUMENT_URL = "/legal.json";
const CHANGELOG_URL = "/api/changelog";
const OFFICIAL_CHANGELOG_COMMIT_PREFIX = "https://github.com/Nattapat2871/NamLauncher/commit/";
const fallbackSite = "namlauncher.nattapat2871.me";
const currentHost = window.location.hostname || fallbackSite;
const pageStatsSite = ["localhost", "127.0.0.1", ""].includes(currentHost) ? fallbackSite : currentHost;

let latestDownloadUrl = "/download/";
let latestRelease = null;
let legalDocument = null;
let changelogEntries = [];
let activeStatusKey = "";
let activeStatusIsError = false;
let currentDeveloperProfile = null;
let developerActivityConnection = null;
let motionObserver = null;
let layoutMotionFrame = 0;
let layoutMotionTimer = null;
let resizeMotionTimer = null;
const layoutMotionRects = new Map();
const layoutMotionAnimations = new WeakMap();
const FORCE_RICH_MOTION = true;
const translations = {
  en: {
    "meta.home.title": "NamLauncher 1.2.3 Stable - Minecraft Launcher by Nattapat2871",
    "meta.home.description": "Keep Minecraft instances separate, choose Vanilla, Fabric, Forge, NeoForge, or Quilt, and install compatible content from Modrinth or CurseForge with NamLauncher 1.2.3.",
    "meta.legal.title": "NamLauncher Legal - Terms and Privacy",
    "meta.legal.description": "Terms of Service and Privacy Policy for the NamLauncher stable Minecraft launcher.",
    "meta.history.title": "NamLauncher Changelog - Complete Release History",
    "meta.history.description": "Read every published NamLauncher update from the first beta to the current stable version.",
    "brand.beta": "Stable",
    "nav.aria": "Primary navigation",
    "nav.open": "Open navigation",
    "nav.close": "Close navigation",
    "language.aria": "Language",
    "language.english": "English",
    "language.thai": "Thai",
    "theme.toLight": "Switch to light mode",
    "theme.toDark": "Switch to dark mode",
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.loaders": "Loaders",
    "nav.latest": "New in 1.2.3",
    "nav.compare": "Compare",
    "nav.changelog": "Updates",
    "nav.instances": "Instances",
    "nav.developer": "Developer",
    "nav.download": "Download",
    "nav.legal": "Legal",
    "nav.mainSite": "Main Site",
    "hero.eyebrow": "Windows 1.2.3 stable · Linux 1.2.3 stable · macOS 1.2.3 stable",
    "hero.text": "Keep every Minecraft setup separate. Pick a version, choose a loader, add mods, and play without moving folders by hand.",
    "actions.download": "Download Windows stable",
    "actions.showDownloads": "All downloads",
    "actions.downloadMenuTooltip": "Choose a platform and package",
    "actions.loadingDownloads": "Loading downloads...",
    "actions.chooseDownload": "Choose a download",
    "actions.downloadWindows": "Download for Windows",
    "actions.downloadLinux": "Download AppImage for Linux",
    "actions.downloadMacos": "Download unsigned DMG for macOS",
    "actions.macosUnavailable": "macOS download unavailable",
    "actions.mainSite": "Visit Nattapat2871.me",
    "stats.aria": "NamLauncher live numbers",
    "stats.downloads": "Downloads",
    "stats.online": "Online now",
    "stats.version": "Current stable",
    "features.eyebrow": "What you can do",
    "features.title": "Set up Minecraft once, then keep each profile under control.",
    "features.accounts.title": "Microsoft and offline accounts",
    "features.accounts.body": "Use your Microsoft account for online play, or keep a local profile for offline worlds and testing.",
    "features.instances.title": "A separate home for every setup",
    "features.instances.body": "Mods, worlds, settings, screenshots, logs, Java, memory, and playtime stay with the instance they belong to.",
    "features.runtime.title": "The right Java for the game",
    "features.runtime.body": "NamLauncher downloads a compatible runtime per Minecraft version, without replacing Java used by other programs.",
    "features.discord.title": "Discord Rich Presence",
    "features.discord.body": "Link Discord once and show the current instance or server in Rich Presence when you choose to enable it.",
    "features.skins.title": "Skins you can check before playing",
    "features.skins.body": "Import and preview a skin in 3D, save presets, and apply it to the profile you selected.",
    "features.skins.source": "Browse community skins from NameMC",
    "features.content.title": "Two mod sites in one library",
    "features.content.body": "Search Modrinth or CurseForge, filter by game version and loader, then install into the selected instance.",
    "loaders.eyebrow": "Supported game types",
    "loaders.title": "Choose the loader that fits the instance.",
    "loaders.intro": "NamLauncher keeps the Minecraft version, loader build, Java runtime, and installed files together, so changing one instance does not rewrite another.",
    "loaders.vanilla": "Minecraft without a mod loader",
    "loaders.fabric": "Lightweight loader with a large mod ecosystem",
    "loaders.forge": "Long-running loader for many established modpacks",
    "loaders.neoforge": "Modern Forge-family loader for newer releases",
    "loaders.quilt": "Fabric-compatible ecosystem with Quilt tooling",
    "loaders.note": "Loader versions are filtered against the selected Minecraft version before installation.",
    "java.eyebrow": "Managed Java runtime",
    "java.title": "Java is selected from the Minecraft version.",
    "java.intro": "NamLauncher follows Mojang's version metadata first. If that service is temporarily unavailable, it uses this tested fallback map.",
    "java.vendor": "Managed runtimes are Eclipse Temurin OpenJDK with the HotSpot JVM, downloaded from the official Eclipse Adoptium API and verified with SHA-256.",
    "java.grid.aria": "Minecraft and Java compatibility",
    "java.range.8": "Minecraft 1.16.5 and older",
    "java.range.16": "Minecraft 1.17.x",
    "java.range.17": "Minecraft 1.18–1.20.4",
    "java.range.21": "Minecraft 1.20.5–1.21.11",
    "java.range.25": "Minecraft 26.x and newer",
    "latest.eyebrow": "New in 1.2.3",
    "latest.title": "Instance setup, updates, and managed components now stay in sync.",
    "latest.intro": "Version 1.2.3 adds accessible dark selectors, preserves the Windows install scope, and protects the verified NamLauncher game companion.",
    "latest.library.title": "Create an instance without a bright native menu.",
    "latest.library.body": "Minecraft, loader, and loader-build choices now use icon-led dark menus with keyboard control, type-ahead, ARIA, and unclipped portal positioning.",
    "latest.tags.aria": "Release capabilities",
    "latest.tags.dependencies": "Keyboard accessible",
    "latest.tags.hashes": "Install scope preserved",
    "latest.tags.compatible": "Managed mod protected",
    "latest.preview.search": "Create Instance choices",
    "latest.preview.mod": "NamLauncher 1.2.3",
    "latest.preview.install": "Ready",
    "latest.toggle.title": "Windows updates keep their install scope",
    "latest.toggle.body": "Current User updates stay silent. All Users updates show the normal UAC confirmation, install to the existing folder, and reopen the launcher.",
    "latest.version.title": "Official loader artwork keeps its shape",
    "latest.version.body": "Transparent Fabric, Forge, NeoForge, and Quilt marks are shown without an artificial CSS frame.",
    "latest.pages.title": "NamLauncher companion is managed automatically",
    "latest.pages.body": "The companion is hidden from the mod list and restored from a SHA-256 verified bundle before launch if it was removed from the folder.",
    "latest.tooltip.title": "Public product details match the launcher",
    "latest.tooltip.body": "The website now identifies Eclipse Temurin and shows current launcher, in-game, and comparison artwork.",
    "difference.eyebrow": "Why NamLauncher",
    "difference.title": "The useful difference is in the whole workflow.",
    "difference.intro": "No single checkbox makes a launcher special. NamLauncher connects setup, content, launch, in-game identity, updates, and support around the same instance.",
    "difference.instance.title": "An instance is more than a game version",
    "difference.instance.body": "Its files, mods, worlds, servers, screenshots, logs, Java runtime, memory limit, and playtime stay together.",
    "difference.library.title": "Modrinth and CurseForge share one screen",
    "difference.library.body": "Switch the source, compare compatible files, and install into the current instance without rebuilding the setup.",
    "difference.badge.title": "Recognize NamLauncher players in game",
    "difference.badge.body": "Supported companions add the launcher mark to nametags, the tab list, and chat, plus a local /namlauncher player list.",
    "comparison.eyebrow": "A fair comparison",
    "comparison.title": "Different launchers are built for different jobs.",
    "comparison.intro": "The notes below use each project's own feature pages. They describe focus and workflow, not a winner.",
    "comparison.source": "Official feature page",
    "comparison.tlauncher.title": "TL MODS and its own modpack flow",
    "comparison.tlauncher.body": "TLauncher already supports modpacks, dependency installs, manual files, and backups. NamLauncher differs by making the full instance—Java, memory, worlds, logs, servers, and both public content providers—the center of the app.",
    "comparison.modrinth.title": "A polished home for Modrinth content",
    "comparison.modrinth.body": "Modrinth App manages instances, updates, imports, skins, and Modrinth-hosted projects. NamLauncher adds a CurseForge choice beside Modrinth and keeps its own server, log, Java, and launcher tools in the same instance view.",
    "comparison.curseforge.title": "Deep access to the CurseForge catalog",
    "comparison.curseforge.body": "CurseForge provides profiles, loader filters, mod and modpack installs, and automatic addon updates. NamLauncher keeps CurseForge available while also letting the same instance browse Modrinth.",
    "comparison.lunar.title": "A bundled client with built-in game mods",
    "comparison.lunar.body": "Lunar focuses on an all-in-one client, built-in performance and PvP mods, plus custom Fabric mods on supported versions. NamLauncher focuses on ordinary Vanilla, Fabric, Forge, NeoForge, and Quilt instances where you choose the content.",
    "comparison.prism.title": "The closest match for instances and two providers",
    "comparison.prism.body": "Prism already manages instances and installs from both Modrinth and CurseForge. NamLauncher's added focus is Thai-first guidance, managed in-game identity, Discord linking, guided troubleshooting, and a launcher update flow designed for its community.",
    "comparison.note": "Checked against official public pages on 12 September 2026. Features may change. Product names, screenshots, and trademarks belong to their respective owners; no endorsement is implied.",
    "changelog.eyebrow": "All updates",
    "changelog.title": "See what changed in every NamLauncher version.",
    "changelog.intro": "Choose a version to read about new features, fixes, and improvements included in that update.",
    "changelog.aria": "NamLauncher release history",
    "changelog.home.eyebrow": "Release notes",
    "changelog.home.title": "Read what actually changed before updating.",
    "changelog.home.intro": "Each entry lists the features and fixes shipped in that version, with a link to the matching source changes when available.",
    "changelog.home.aria": "Recent NamLauncher updates",
    "changelog.viewAll": "Open the full release history",
    "changelog.loading": "Loading release history…",
    "changelog.error": "Release history is temporarily unavailable.",
    "changelog.latest": "Latest release",
    "changelog.previous": "Previous release",
    "changelog.first": "First beta",
    "changelog.updatedRelative": "Updated {relative}",
    "changelog.updatedToday": "Updated today",
    "changelog.commit": "View changes on GitHub",
    "changelog.commitAria": "View the GitHub changes for {version}",
    "history.back": "Back to NamLauncher home",
    "history.loadingCount": "Loading available versions…",
    "history.count": "{count} published versions",
    "history.board.aria": "All published NamLauncher updates",
    "changelog.beta57.date": "August 1, 2026",
    "changelog.beta57.one": "Loads cached skins immediately, then refreshes Microsoft profiles in the background.",
    "changelog.beta57.two": "Prevents same-file Modrinth downloads from racing and corrupting dependencies.",
    "changelog.beta57.three": "Verifies and repairs the vanilla client before NeoForge installation.",
    "changelog.beta57.four": "Recovers real game state when an Electron launch reply is lost.",
    "changelog.beta56.date": "July 30, 2026",
    "changelog.beta56.one": "Added trusted Windows certificate-store support for launcher network requests.",
    "changelog.beta56.two": "Made Modrinth search direct-first with cancellation, caching, and fewer scans.",
    "changelog.beta56.three": "Synchronized submitted Discord reports and securely removed resolved report data.",
    "changelog.beta56.four": "Added bounded 30-day operational audit logs without storing credentials.",
    "changelog.beta55.date": "July 28, 2026",
    "changelog.beta55.one": "Repaired stale Thai font resource packs that could crash Minecraft.",
    "changelog.beta55.two": "Improved selectable error reports with device and player diagnostics.",
    "changelog.beta55.three": "Kept report submission available in packaged launcher builds.",
    "changelog.beta55.four": "Completed CurseForge browser-download modpacks now become ready to play.",
    "changelog.beta53.date": "July 16, 2026",
    "changelog.beta53.one": "Verified report configuration before packaging the launcher.",
    "changelog.beta53.two": "Retried reports when Discord delivery was temporarily unavailable.",
    "changelog.beta53.three": "Added retries and bounded concurrency to improve first-launch downloads.",
    "changelog.beta53.four": "Loaded operating-system certificates for trusted HTTPS requests.",
    "instances.eyebrow": "Instances",
    "instances.title": "Open one instance and everything for that game is there.",
    "preview.instance": "Slime Adventure",
    "preview.ready": "Ready",
    "screenshots.eyebrow": "Actual launcher screens",
    "screenshots.title": "See the pages you will use, not a mock-up.",
    "screenshots.intro": "These screenshots come from the launcher itself: Home, instance content, worlds and servers, skins, the mod library, and instance creation.",
    "screenshots.viewFull": "View full size",
    "screenshots.home.title": "Continue from Home",
    "screenshots.home.body": "Open a recent instance, world, or server without digging through menus.",
    "screenshots.home.open": "Open the full-size NamLauncher Home screenshot (opens in a new tab)",
    "screenshots.instanceContent.title": "The instance page",
    "screenshots.instanceContent.body": "Manage mods, files, resource packs, shaders, worlds, servers, screenshots, and logs from here.",
    "screenshots.instanceContent.open": "Open the full-size NamLauncher instance content screenshot (opens in a new tab)",
    "screenshots.worldsServers.title": "Worlds & Servers",
    "screenshots.worldsServers.body": "See saved worlds and live server status, read the MOTD, then launch the selected place.",
    "screenshots.worldsServers.open": "Open the full-size NamLauncher Worlds and Servers screenshot (opens in a new tab)",
    "screenshots.skins.title": "Skins and capes",
    "screenshots.skins.body": "Preview the character in 3D, save skin presets, and choose an owned cape.",
    "screenshots.skins.open": "Open the full-size NamLauncher Skins screenshot (opens in a new tab)",
    "screenshots.libraryMods.title": "Find a mod from either provider",
    "screenshots.libraryMods.body": "Search Modrinth or CurseForge and check the provider, game version, loader, and file before installing.",
    "screenshots.libraryMods.open": "Open the full-size NamLauncher mod library screenshot (opens in a new tab)",
    "screenshots.libraryModpacks.title": "Browse complete modpacks",
    "screenshots.libraryModpacks.body": "Review the pack, supported versions, loader, and download details before creating an instance.",
    "screenshots.libraryModpacks.open": "Open the full-size NamLauncher modpack library screenshot (opens in a new tab)",
    "screenshots.aboutPartners.title": "About and partner servers",
    "screenshots.aboutPartners.body": "Find the developer links and the current MiniSand, NamCraft, and TeddyBlock addresses.",
    "screenshots.aboutPartners.open": "Open the full-size NamLauncher About and partners screenshot (opens in a new tab)",
    "screenshots.createInstance.title": "Create an instance",
    "screenshots.createInstance.body": "Name the instance, choose Minecraft and a loader, set its folder, and create it.",
    "screenshots.createInstance.open": "Open the full-size NamLauncher Create Instance screenshot (opens in a new tab)",
    "developer.eyebrow": "Built by Nattapat2871",
    "developer.title": "One developer, one project, and public release notes.",
    "developer.role": "Creator and lead developer",
    "developer.body": "Nattapat2871 designs the launcher, writes the desktop and website code, prepares releases, and follows up on reports from players.",
    "developer.responsibilities.aria": "Project responsibilities",
    "developer.responsibilities.product": "Product decisions",
    "developer.responsibilities.engineering": "Launcher and server code",
    "developer.responsibilities.design": "Interface and website",
    "developer.website": "Open personal website",
    "developer.github": "GitHub",
    "partner.eyebrow": "Partner server",
    "partner.ownedEyebrow": "NamLauncher server",
    "partner.aria": "NamLauncher server partners",
    "partner.address": "Server address",
    "partner.minisand.title": "MiniSand Online",
    "partner.minisand.body": "A NamLauncher partner server with its address ready in the launcher.",
    "partner.minisand.linkLabel": "Visit the MiniSand Online website (opens in a new tab)",
    "partner.namcraft.title": "NamCraft",
    "partner.namcraft.body": "The Minecraft server operated for the NamLauncher project by Nattapat2871.",
    "partner.namcraft.linkLabel": "Visit the NamCraft website (opens in a new tab)",
    "partner.teddyblock.title": "TeddyBlock",
    "partner.teddyblock.body": "A NamLauncher partner server available from the launcher server list.",
    "partner.teddyblock.linkLabel": "Visit the TeddyBlock website (opens in a new tab)",
    "partner.open": "Visit server",
    "developer.activity.eyebrow": "Live activity",
    "developer.activity.title": "What Nattapat2871 is doing now",
    "developer.activity.source": "AME API",
    "developer.activity.empty": "No public activity is being shared right now.",
    "developer.activity.unavailable": "Live activity is temporarily unavailable.",
    "developer.activity.connecting": "Connecting to live activity…",
    "developer.activity.platform.desktop": "Desktop",
    "developer.activity.platform.web": "Web",
    "developer.activity.platform.mobile": "Mobile",
    "developer.activity.type.playing": "Playing",
    "developer.activity.type.streaming": "Streaming",
    "developer.activity.type.listening": "Listening",
    "developer.activity.type.watching": "Watching",
    "developer.activity.type.status": "Status",
    "developer.activity.type.competing": "Competing",
    "developer.activity.elapsed": "Active for {time}",
    "developer.loading": "Loading",
    "developer.status.online": "Online",
    "developer.status.idle": "Idle",
    "developer.status.dnd": "Do not disturb",
    "developer.status.offline": "Offline",
    "developer.status.unavailable": "Unavailable",
    "developer.status.connecting": "Connecting",
    "download.eyebrow": "Windows 1.2.3 stable · Linux 1.2.3 stable · macOS 1.2.3 stable",
    "download.title": "Download NamLauncher 1.2.3 for your computer.",
    "download.body": "Choose Windows, macOS, or a Linux package. Windows and macOS builds are not code-signed yet, so compare the SHA-256 checksum with the value published beside the file before opening it.",
    "download.windows.detail": "Installer · x64",
    "download.macos.detail": "Universal · Unsigned DMG",
    "download.macos.unavailable": "Not published yet",
    "download.macos.warning": "Unsigned app: verify SHA-256 before opening. Gatekeeper requires per-app approval.",
    "download.linux.appimage.detail": "Portable · Recommended",
    "download.linux.deb.detail": "Debian / Ubuntu · x64",
    "download.linux.rpm.detail": "Fedora / RHEL · x64",
    "download.linux.flatpak.detail": "Sandboxed bundle · x64",
    "download.linux.arch.detail": "Arch / Manjaro / AUR · x64",
    "download.linux.heading": "Linux 1.2.3 stable",
    "download.unavailable": "Not published yet",
    "download.detected": "Detected: {platform}",
    "status.startingDownload": "Starting download...",
    "status.openingInstaller": "Opening installer...",
    "status.openingUnsignedDmg": "Downloading an unsigned DMG. Verify SHA-256 before opening and approve only this app in Gatekeeper.",
    "status.noInstaller": "Installer link is not published yet.",
    "status.downloadUnavailable": "Download is unavailable right now.",
    "status.statsOffline": "Live stats are offline.",
    "viewBadge.label": "views",
    "viewBadge.title": "Page views",
    "backToTop.label": "Back to top",
    "footer.product": "NamLauncher Stable",
    "footer.links": "Main site: nattapat2871.me / Installation guide / Discord community / Terms & Privacy",
    "footer.mainOnly": "Main site: nattapat2871.me",
    "footer.mainSite": "Main site",
    "footer.installationGuide": "Installation guide",
    "footer.discord": "Discord community",
    "footer.termsPrivacy": "Terms & Privacy",
    "legal.eyebrow": "NamLauncher legal",
    "legal.title": "Terms of Use and Privacy Notice",
    "legal.intro": "These rules apply to the NamLauncher website, installer, desktop launcher, accounts, instances, downloads, and connected services.",
    "legal.updated": "Last updated: August 23, 2026",
    "legal.tos.title": "Terms of Use",
    "legal.tos.acceptance.title": "1. Acceptance and eligibility",
    "legal.tos.acceptance.body": "Use NamLauncher only if you can legally accept these terms. If you are below the age required in your country, a parent or legal guardian must review and accept them for you.",
    "legal.tos.services.title": "2. Minecraft and third-party services",
    "legal.tos.services.body": "NamLauncher is an independent launcher and is not affiliated with Mojang, Microsoft, Discord, Modrinth, or CurseForge. You must follow Minecraft's EULA and Usage Guidelines and each connected service's terms.",
    "legal.tos.accounts.title": "3. Microsoft and Cracked accounts",
    "legal.tos.accounts.body": "A Microsoft account must belong to you and have a valid Minecraft entitlement where required. A Cracked account is only a local/offline identity; it does not provide a Minecraft license, verify ownership, or authorize bypassing authentication or joining servers without permission.",
    "legal.tos.conduct.title": "4. Player conduct and server rules",
    "legal.tos.conduct.body": "Follow applicable law and every server's rules. Do not use NamLauncher for harassment, threats, fraud, unauthorized access, service disruption, malware, credential theft, ban evasion, or cheats where the server prohibits them.",
    "legal.tos.content.title": "5. Mods and intellectual property",
    "legal.tos.content.body": "Mods, modpacks, resource packs, shaders, skins, and other files belong to their respective authors. You are responsible for checking licenses, permissions, compatibility, and security before downloading, sharing, or modifying them.",
    "legal.tos.security.title": "6. Security and account responsibility",
    "legal.tos.security.body": "Keep your device and accounts secure. Do not share tokens or credentials. Report suspected compromise and remove accounts from the launcher when using a shared device.",
    "legal.tos.beta.title": "7. Stable community build and backups",
    "legal.tos.beta.body": "NamLauncher 1.2.3 is distributed without Windows or macOS code-signing certificates and may still contain defects. Verify official downloads and back up saves, instances, screenshots, mods, and other important data before updates or migrations.",
    "legal.tos.network.title": "8. Downloads, updates, and network use",
    "legal.tos.network.body": "The launcher may download Minecraft files, Java runtimes, loaders, metadata, and selected third-party content. You are responsible for network charges, storage space, and reviewing requested downloads.",
    "legal.tos.changes.title": "9. Changes and access",
    "legal.tos.changes.body": "Features, integrations, and these terms may change to address security, legal, or service requirements. Materially updated terms require acceptance again before continuing.",
    "legal.tos.warranty.title": "10. Warranty and liability",
    "legal.tos.warranty.body": "To the extent permitted by applicable law, NamLauncher is provided as-is without warranties. The developer is not responsible for third-party services, incompatible content, server actions, lost data, or indirect damage. Rights that cannot legally be excluded remain unaffected.",
    "legal.references.aria": "External references",
    "legal.references.title": "References",
    "legal.privacy.title": "Privacy Notice",
    "legal.privacy.local.title": "1. Data stored on your device",
    "legal.privacy.local.body": "Launcher settings, account summaries, encrypted authentication data, instances, content records, Java runtimes, image caches, skins, and logs are stored locally in the selected NamLauncher data folder.",
    "legal.privacy.microsoft.title": "2. Microsoft authentication",
    "legal.privacy.microsoft.body": "Microsoft authentication uses the launcher sign-in flow. Authentication material is stored locally and encrypted when the operating system supports secure storage. NamLauncher does not ask you to send your Microsoft password to the NamLauncher website.",
    "legal.privacy.stats.title": "3. Required anonymous launcher heartbeat",
    "legal.privacy.stats.body": "While NamLauncher is running, the required online heartbeat cannot be disabled and continues while the launcher is minimized or hidden in the system tray. Discord IPC is a separate setting and, when enabled, also continues while the window is hidden. The heartbeat sends a random client identifier, launcher version, platform, and whether a game is running, but not Microsoft tokens, installed file lists, chat, or server addresses.",
    "legal.privacy.sessions.title": "4. Required gameplay session analytics",
    "legal.privacy.sessions.body": "While a launched game is running, required session analytics sends player profile name, account type, versions, loader, session start, periodic heartbeat, and session end so server receipt times can calculate real play time. During an active multiplayer connection it also sends the normalized server address and port for owner-only endpoint analytics; private or local addresses are retained only for that access-controlled purpose. Installation identifiers are stored as peppered hashes, stale sessions close at the last heartbeat, and rows are deleted after 365 days by default. It does not send tokens, passwords, chat, game logs, worlds, or installed-file lists.",
    "legal.privacy.modSignals.title": "4A. Required active-instance mod policy signals",
    "legal.privacy.modSignals.body": "Each game launch scans only bounded JAR metadata directly inside the active instance mods folder and sends matched metadata. It never uploads JAR files, local paths, tokens, worlds, chat, logs, or server addresses. A match is not proof of cheating, and a scan failure does not by itself block launch.",
    "legal.privacy.providers.title": "5. Content providers and downloads",
    "legal.privacy.providers.body": "Searches and downloads may contact third-party providers and NamLauncher services. For Discord launch presence, a verified public Minecraft texture ID may be placed in a mc-heads.net player-head URL passed to Discord; legacy callers of the head-image helper may use a profile UUID or name instead. A provider contacted directly from your device receives ordinary network data, and providers may receive identifiers needed for the request. NamLauncher keeps 30-day operational audit records for content installs and service or download requests, but does not record passwords, tokens, chat, or server addresses.",
    "legal.privacy.discord.title": "5. Discord activity",
    "legal.privacy.discord.body": "When Discord IPC is enabled and NamLauncher is running, including while hidden in the system tray, activity details and image references are sent to the Discord desktop application on your device. If NamLauncher cannot verify that a texture ID exactly matches the selected skin file, the launch path omits the small player image rather than risk showing the wrong head. Discord and image providers control their own processing, display, and retention.",
    "legal.privacy.logs.title": "6. Logs and error reports",
    "legal.privacy.logs.body": "Detected launcher and Minecraft errors are submitted automatically after best-effort sanitization. The existing button separately confirms that the player experienced the error; copying remains local. Marking a report fixed deletes its server log file and sensitive report content while retaining minimal resolution, confirmation-count, and Discord synchronization metadata.",
    "legal.privacy.developer.title": "Developer profile (website only)",
    "legal.privacy.developer.body": "The website home page may read public developer profile and activity data from <a href=\"https://ame-api.nattapat2871.me/\" rel=\"noopener\" target=\"_blank\">AME API</a> to display live status widgets.",
    "legal.privacy.contact.title": "6. Contact",
    "legal.privacy.contact.body": "For support, privacy questions, or problem reports, contact the developer through <a href=\"https://nattapat2871.me\" rel=\"me\">nattapat2871.me</a>."
  },
  th: {
    "meta.home.title": "NamLauncher 1.2.3 Stable - ลันเชอร์ Minecraft โดย Nattapat2871",
    "meta.home.description": "NamLauncher 1.2.3 แยกอินสแตนซ์ Minecraft รองรับ Vanilla, Fabric, Forge, NeoForge และ Quilt พร้อมค้นหาม็อดจาก Modrinth หรือ CurseForge",
    "meta.legal.title": "NamLauncher Legal - ข้อกำหนดและนโยบายความเป็นส่วนตัว",
    "meta.legal.description": "ข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวของ NamLauncher รุ่นเสถียร",
    "meta.history.title": "ประวัติ NamLauncher - การอัปเดตทั้งหมด",
    "meta.history.description": "อ่านประวัติการอัปเดต NamLauncher ทั้งหมด ตั้งแต่ beta รุ่นแรกจนถึงรุ่นเสถียรปัจจุบัน",
    "brand.beta": "เสถียร",
    "nav.aria": "เมนูหลัก",
    "nav.open": "เปิดเมนูนำทาง",
    "nav.close": "ปิดเมนูนำทาง",
    "language.aria": "ภาษา",
    "language.english": "ภาษาอังกฤษ",
    "language.thai": "ภาษาไทย",
    "theme.toLight": "เปลี่ยนเป็นโหมดสว่าง",
    "theme.toDark": "เปลี่ยนเป็นโหมดมืด",
    "nav.home": "หน้าแรก",
    "nav.features": "ฟีเจอร์",
    "nav.loaders": "ตัวโหลด",
    "nav.latest": "ใหม่ใน 1.2.3",
    "nav.compare": "เปรียบเทียบ",
    "nav.changelog": "รายการอัปเดต",
    "nav.instances": "อินสแตนซ์",
    "nav.developer": "ผู้พัฒนา",
    "nav.download": "ดาวน์โหลด",
    "nav.legal": "กฎหมาย",
    "nav.mainSite": "เว็บหลัก",
    "hero.eyebrow": "Windows 1.2.3 stable · Linux 1.2.3 stable · macOS 1.2.3 stable",
    "hero.text": "แยก Minecraft แต่ละชุดให้เป็นสัดส่วน เลือกเวอร์ชัน เลือกตัวโหลด ลงม็อด แล้วกดเล่นได้เลย ไม่ต้องคอยย้ายไฟล์เอง",
    "actions.download": "ดาวน์โหลด Windows รุ่นเสถียร",
    "actions.showDownloads": "แพลตฟอร์มทั้งหมด",
    "actions.downloadMenuTooltip": "เลือกแพลตฟอร์มและรูปแบบไฟล์",
    "actions.loadingDownloads": "กำลังโหลดตัวเลือกดาวน์โหลด...",
    "actions.chooseDownload": "เลือกไฟล์ดาวน์โหลด",
    "actions.downloadWindows": "ดาวน์โหลดสำหรับ Windows",
    "actions.downloadLinux": "ดาวน์โหลด AppImage สำหรับ Linux",
    "actions.downloadMacos": "ดาวน์โหลด DMG แบบ unsigned สำหรับ macOS",
    "actions.macosUnavailable": "ดาวน์โหลด macOS ยังไม่พร้อมใช้งาน",
    "actions.mainSite": "ไปที่ Nattapat2871.me",
    "stats.aria": "ตัวเลขสดของ NamLauncher",
    "stats.downloads": "ยอดดาวน์โหลด",
    "stats.online": "ออนไลน์ตอนนี้",
    "stats.version": "รุ่นเสถียรปัจจุบัน",
    "features.eyebrow": "ทำอะไรได้บ้าง",
    "features.title": "ตั้งค่าเกมให้เสร็จครั้งเดียว แล้วดูแลแต่ละโปรไฟล์ได้ง่าย ๆ",
    "features.accounts.title": "บัญชี Microsoft และออฟไลน์",
    "features.accounts.body": "ใช้บัญชี Microsoft สำหรับเล่นออนไลน์ หรือสร้างโปรไฟล์ออฟไลน์ไว้เล่นโลกส่วนตัวและทดสอบม็อด",
    "features.instances.title": "แยกพื้นที่ให้เกมแต่ละชุด",
    "features.instances.body": "ม็อด โลก การตั้งค่า ภาพหน้าจอ ล็อก Java แรม และเวลาเล่น จะอยู่กับอินสแตนซ์ของตัวเอง",
    "features.runtime.title": "เลือก Java ให้ตรงกับเกม",
    "features.runtime.body": "NamLauncher ดาวน์โหลด Java ที่เหมาะกับ Minecraft เวอร์ชันนั้น โดยไม่ไปเปลี่ยน Java ที่โปรแกรมอื่นใช้อยู่",
    "features.discord.title": "Discord Rich Presence",
    "features.discord.body": "เชื่อม Discord ครั้งเดียว แล้วเลือกแสดงอินสแตนซ์หรือเซิร์ฟเวอร์ที่กำลังเล่นบน Rich Presence ได้",
    "features.skins.title": "ดูสกินก่อนเข้าเกม",
    "features.skins.body": "นำเข้าสกิน หมุนดูตัวละครแบบ 3D เก็บสกินไว้หลายชุด แล้วใช้กับโปรไฟล์ที่เลือก",
    "features.skins.source": "เลือกดูสกินชุมชนจาก NameMC",
    "features.content.title": "ม็อดสองเว็บในไลบรารีเดียว",
    "features.content.body": "ค้นหาจาก Modrinth หรือ CurseForge กรองตามเวอร์ชันเกมและตัวโหลด แล้วติดตั้งลงอินสแตนซ์ที่เลือก",
    "loaders.eyebrow": "รูปแบบเกมที่รองรับ",
    "loaders.title": "เลือกตัวโหลดให้เหมาะกับอินสแตนซ์",
    "loaders.intro": "NamLauncher เก็บเวอร์ชัน Minecraft รุ่นของตัวโหลด Java และไฟล์ที่ติดตั้งไว้ด้วยกัน การแก้อินสแตนซ์หนึ่งจึงไม่ไปทับอีกอินสแตนซ์",
    "loaders.vanilla": "Minecraft ปกติ ไม่ติดตั้งตัวโหลดม็อด",
    "loaders.fabric": "ตัวโหลดขนาดเบา มีม็อดให้เลือกจำนวนมาก",
    "loaders.forge": "ตัวโหลดที่ใช้กับม็อดแพ็กและม็อดรุ่นเก่าจำนวนมาก",
    "loaders.neoforge": "ตัวโหลดสาย Forge สำหรับ Minecraft รุ่นใหม่",
    "loaders.quilt": "ใช้งานร่วมกับระบบนิเวศของ Fabric และเครื่องมือ Quilt",
    "loaders.note": "ก่อนติดตั้ง ระบบจะกรองรุ่นของตัวโหลดให้ตรงกับ Minecraft ที่เลือกไว้",
    "java.eyebrow": "Java ที่ลันเชอร์จัดการให้",
    "java.title": "เวอร์ชันเกมเป็นตัวกำหนด Java ที่ใช้",
    "java.intro": "NamLauncher อ่านข้อมูลเวอร์ชันจาก Mojang ก่อน หากบริการนั้นใช้งานไม่ได้ชั่วคราว ระบบจะใช้ตารางสำรองที่ทดสอบไว้ดังนี้",
    "java.vendor": "Java ที่ลันเชอร์จัดการให้คือ Eclipse Temurin OpenJDK พร้อม HotSpot JVM ดาวน์โหลดจาก API ทางการของ Eclipse Adoptium และตรวจสอบ SHA-256 ก่อนใช้งาน",
    "java.grid.aria": "เวอร์ชัน Minecraft และ Java ที่ใช้ร่วมกัน",
    "java.range.8": "Minecraft 1.16.5 และเก่ากว่า",
    "java.range.16": "Minecraft 1.17.x",
    "java.range.17": "Minecraft 1.18–1.20.4",
    "java.range.21": "Minecraft 1.20.5–1.21.11",
    "java.range.25": "Minecraft 26.x และใหม่กว่า",
    "latest.eyebrow": "ใหม่ใน 1.2.3",
    "latest.title": "หน้าสร้างอินสแตนซ์ การอัปเดต และมอดที่ดูแลทำงานตรงกันยิ่งขึ้น",
    "latest.intro": "เวอร์ชัน 1.2.3 เพิ่มช่องเลือกสีเข้มที่เข้าถึงได้ รักษาขอบเขตติดตั้ง Windows และป้องกันมอดเสริม NamLauncher ที่ตรวจสอบแล้ว",
    "latest.library.title": "สร้างอินสแตนซ์โดยไม่มีเมนูพื้นขาว",
    "latest.library.body": "ช่อง Minecraft, Loader และรุ่น Loader ใช้เมนูสีเข้มพร้อมไอคอน รองรับคีย์บอร์ด การพิมพ์ค้นหา ARIA และไม่ถูกกรอบหน้าต่างตัด",
    "latest.tags.aria": "ความสามารถของรุ่นนี้",
    "latest.tags.dependencies": "ใช้คีย์บอร์ดได้",
    "latest.tags.hashes": "รักษาโหมดติดตั้ง",
    "latest.tags.compatible": "ป้องกันมอดที่ดูแล",
    "latest.preview.search": "ตัวเลือกสร้างอินสแตนซ์",
    "latest.preview.mod": "NamLauncher 1.2.3",
    "latest.preview.install": "พร้อม",
    "latest.toggle.title": "อัปเดต Windows โดยคงโหมดติดตั้งเดิม",
    "latest.toggle.body": "Current User ติดตั้งเงียบ ส่วน All Users แสดง UAC ตามปกติ ติดตั้งลงโฟลเดอร์เดิม และเปิดลันเชอร์กลับให้",
    "latest.version.title": "โลโก้ Loader คงรูปทรงตามต้นฉบับ",
    "latest.version.body": "ภาพโปร่งใสของ Fabric, Forge, NeoForge และ Quilt แสดงโดยไม่มีกรอบ CSS ครอบ",
    "latest.pages.title": "NamLauncher ดูแลมอดเสริมให้อัตโนมัติ",
    "latest.pages.body": "มอดเสริมจะถูกซ่อนจากรายการ และนำไฟล์จากชุดที่ตรวจ SHA-256 กลับมาก่อนเปิดเกมหากถูกลบจากโฟลเดอร์",
    "latest.tooltip.title": "ข้อมูลหน้าเว็บตรงกับลันเชอร์",
    "latest.tooltip.body": "เว็บไซต์ระบุ Eclipse Temurin พร้อมภาพลันเชอร์ ภาพในเกม และโลโก้เปรียบเทียบรุ่นปัจจุบัน",
    "difference.eyebrow": "ทำไมถึงเป็น NamLauncher",
    "difference.title": "ความต่างอยู่ที่ขั้นตอนทั้งหมดทำงานต่อกัน",
    "difference.intro": "ลันเชอร์ที่ดีไม่ได้วัดจากฟีเจอร์ข้อเดียว NamLauncher จึงเชื่อมการตั้งค่า การลงม็อด การเปิดเกม ตัวตนในเกม การอัปเดต และการช่วยแก้ปัญหาไว้กับอินสแตนซ์เดียวกัน",
    "difference.instance.title": "อินสแตนซ์ไม่ได้มีแค่เวอร์ชันเกม",
    "difference.instance.body": "ไฟล์ ม็อด โลก เซิร์ฟเวอร์ ภาพหน้าจอ ล็อก Java ขีดจำกัดแรม และเวลาเล่น จะอยู่รวมกันเป็นชุด",
    "difference.library.title": "Modrinth และ CurseForge อยู่หน้าเดียวกัน",
    "difference.library.body": "สลับแหล่งค้นหา เทียบไฟล์ที่รองรับ แล้วติดตั้งลงอินสแตนซ์เดิมได้เลย ไม่ต้องสร้างชุดเกมใหม่",
    "difference.badge.title": "เห็นผู้เล่น NamLauncher ภายในเกม",
    "difference.badge.body": "ตัวเสริมที่รองรับจะแสดงโลโก้ในชื่อบนหัว Tab List และแชท พร้อมคำสั่ง /namlauncher สำหรับดูผู้เล่นที่ตรวจพบ",
    "comparison.eyebrow": "เปรียบเทียบตามข้อมูลจริง",
    "comparison.title": "แต่ละลันเชอร์ออกแบบมาสำหรับงานคนละแบบ",
    "comparison.intro": "ข้อมูลด้านล่างอ้างอิงหน้าฟีเจอร์ทางการของแต่ละโปรเจกต์ เพื่ออธิบายแนวทางใช้งาน ไม่ได้จัดอันดับว่าใครชนะ",
    "comparison.source": "ดูข้อมูลจากเว็บทางการ",
    "comparison.tlauncher.title": "TL MODS และระบบม็อดแพ็กของตัวเอง",
    "comparison.tlauncher.body": "TLauncher รองรับม็อดแพ็ก การลงไลบรารีที่จำเป็น ไฟล์ติดตั้งเอง และการสำรองข้อมูลอยู่แล้ว ส่วน NamLauncher วางอินสแตนซ์ทั้งชุด—Java แรม โลก ล็อก เซิร์ฟเวอร์ และแหล่งม็อดสาธารณะสองราย—ไว้เป็นศูนย์กลางของโปรแกรม",
    "comparison.modrinth.title": "โปรแกรมที่ทำมาเพื่อคอนเทนต์บน Modrinth",
    "comparison.modrinth.body": "Modrinth App จัดการอินสแตนซ์ อัปเดต นำเข้า สกิน และโปรเจกต์ที่โฮสต์บน Modrinth ส่วน NamLauncher เพิ่ม CurseForge ไว้ข้างกัน และรวมเครื่องมือเซิร์ฟเวอร์ ล็อก Java และการเปิดเกมไว้ในหน้าอินสแตนซ์",
    "comparison.curseforge.title": "เข้าถึงคลัง CurseForge ได้เต็มรูปแบบ",
    "comparison.curseforge.body": "CurseForge มีโปรไฟล์ ตัวกรอง Loader การลงม็อดและม็อดแพ็ก รวมถึงอัปเดตส่วนเสริมอัตโนมัติ ส่วน NamLauncher เปิด CurseForge ไว้พร้อมกับการค้นหา Modrinth ในอินสแตนซ์เดียวกัน",
    "comparison.lunar.title": "ไคลเอนต์สำเร็จรูปพร้อมม็อดในเกม",
    "comparison.lunar.body": "Lunar เน้นไคลเอนต์ชุดเดียว มีม็อดเพิ่มประสิทธิภาพและ PvP ในตัว พร้อมม็อด Fabric เพิ่มเองบนเวอร์ชันที่รองรับ ส่วน NamLauncher เน้นอินสแตนซ์ Vanilla, Fabric, Forge, NeoForge และ Quilt ที่ผู้เล่นเลือกคอนเทนต์เอง",
    "comparison.prism.title": "ใกล้เคียงที่สุดด้านอินสแตนซ์และสองแหล่งม็อด",
    "comparison.prism.body": "Prism จัดการหลายอินสแตนซ์และติดตั้งจาก Modrinth กับ CurseForge ได้อยู่แล้ว จุดที่ NamLauncher เพิ่มเข้ามาคือคำแนะนำภาษาไทย ตัวตน NamLauncher ในเกม การเชื่อม Discord แนวทางแก้ปัญหาที่อ่านง่าย และขั้นตอนอัปเดตที่ทำมาเพื่อชุมชนของลันเชอร์",
    "comparison.note": "ตรวจสอบจากหน้าเว็บทางการเมื่อ 12 กันยายน 2026 ฟีเจอร์อาจเปลี่ยนแปลงได้ ชื่อสินค้า ภาพหน้าจอ และเครื่องหมายการค้าเป็นของเจ้าของแต่ละราย การแสดงข้อมูลนี้ไม่ได้หมายถึงการรับรอง NamLauncher",
    "changelog.eyebrow": "การอัปเดตทั้งหมด",
    "changelog.title": "ดูว่า NamLauncher เปลี่ยนแปลงอะไรในแต่ละเวอร์ชัน",
    "changelog.intro": "เลือกเวอร์ชันเพื่ออ่านฟีเจอร์ใหม่ การแก้ไขข้อผิดพลาด และสิ่งที่ได้รับการปรับปรุงในการอัปเดตนั้น",
    "changelog.aria": "ประวัติการเผยแพร่ NamLauncher",
    "changelog.home.eyebrow": "บันทึกการอัปเดต",
    "changelog.home.title": "อ่านสิ่งที่เปลี่ยนจริงก่อนกดอัปเดต",
    "changelog.home.intro": "แต่ละรายการบอกฟีเจอร์และบัคที่แก้ในเวอร์ชันนั้น พร้อมลิงก์ไปยังซอร์สที่ตรงกันเมื่อมีข้อมูล",
    "changelog.home.aria": "การอัปเดตล่าสุดของ NamLauncher",
    "changelog.viewAll": "เปิดประวัติทุกเวอร์ชัน",
    "changelog.loading": "กำลังโหลดประวัติการอัปเดต…",
    "changelog.error": "ไม่สามารถโหลดประวัติการอัปเดตได้ชั่วคราว",
    "changelog.latest": "เวอร์ชันล่าสุด",
    "changelog.previous": "เวอร์ชันก่อนหน้า",
    "changelog.first": "เบต้าเวอร์ชันแรก",
    "changelog.updatedRelative": "อัปเดตเมื่อ {relative}",
    "changelog.updatedToday": "อัปเดตวันนี้",
    "changelog.commit": "ดูการเปลี่ยนแปลงบน GitHub",
    "changelog.commitAria": "ดูการเปลี่ยนแปลงของ {version} บน GitHub",
    "history.back": "กลับหน้าแรก NamLauncher",
    "history.loadingCount": "กำลังโหลดเวอร์ชันที่พร้อมแสดง…",
    "history.count": "รวม {count} เวอร์ชันที่เผยแพร่แล้ว",
    "history.board.aria": "การอัปเดต NamLauncher ทุกเวอร์ชันที่เผยแพร่แล้ว",
    "changelog.beta57.date": "1 สิงหาคม 2026",
    "changelog.beta57.one": "เปิดสกินจาก cache ทันที แล้วอัปเดตโปรไฟล์ Microsoft ต่อในพื้นหลัง",
    "changelog.beta57.two": "ป้องกันการดาวน์โหลดไฟล์ Modrinth ปลายทางเดียวกันชนกันจน dependency เสียหาย",
    "changelog.beta57.three": "ตรวจสอบและซ่อมไฟล์ vanilla client ก่อนติดตั้ง NeoForge",
    "changelog.beta57.four": "กู้สถานะเกมจริงเมื่อ Electron ทำ reply สำหรับการเปิดเกมสูญหาย",
    "changelog.beta56.date": "30 กรกฎาคม 2026",
    "changelog.beta56.one": "รองรับคลัง certificate ที่เชื่อถือได้ของ Windows สำหรับคำขอเครือข่ายของลันเชอร์",
    "changelog.beta56.two": "ปรับการค้นหา Modrinth ให้เชื่อมต่อตรงก่อน พร้อมยกเลิกคำขอเก่า ใช้ cache และลดการสแกนที่ไม่จำเป็น",
    "changelog.beta56.three": "ซิงก์รายงาน Discord ที่ส่งแล้วและลบข้อมูลละเอียดอ่อนอย่างปลอดภัยเมื่อแก้ไขเสร็จ",
    "changelog.beta56.four": "เพิ่ม audit log การทำงานแบบจำกัดเวลา 30 วัน โดยไม่เก็บข้อมูลรับรอง",
    "changelog.beta55.date": "28 กรกฎาคม 2026",
    "changelog.beta55.one": "ซ่อม resource pack ฟอนต์ไทยรุ่นเก่าที่อาจทำให้ Minecraft หยุดทำงาน",
    "changelog.beta55.two": "ปรับรายงานข้อผิดพลาดให้เลือกข้อความได้ พร้อมข้อมูลผู้เล่นและอุปกรณ์สำหรับวิเคราะห์",
    "changelog.beta55.three": "ทำให้การส่งรายงานยังใช้งานได้ใน launcher build ที่แพ็กแล้ว",
    "changelog.beta55.four": "modpack ของ CurseForge ที่ดาวน์โหลดผ่านเบราว์เซอร์เสร็จแล้วจะเปลี่ยนเป็นพร้อมเล่น",
    "changelog.beta53.date": "16 กรกฎาคม 2026",
    "changelog.beta53.one": "ตรวจสอบการตั้งค่ารายงานก่อนแพ็ก launcher",
    "changelog.beta53.two": "ลองส่งรายงานใหม่เมื่อ Discord ไม่พร้อมใช้งานชั่วคราว",
    "changelog.beta53.three": "เพิ่ม retry และจำกัดงานพร้อมกันเพื่อให้การดาวน์โหลดครั้งแรกเสถียรขึ้น",
    "changelog.beta53.four": "โหลด certificate ของระบบปฏิบัติการสำหรับการเชื่อมต่อ HTTPS ที่เชื่อถือได้",
    "instances.eyebrow": "อินสแตนซ์",
    "instances.title": "เปิดอินสแตนซ์เดียว แล้วเจอทุกอย่างของเกมชุดนั้น",
    "preview.instance": "Slime Adventure",
    "preview.ready": "พร้อมเล่น",
    "screenshots.eyebrow": "ภาพจากลันเชอร์จริง",
    "screenshots.title": "ดูหน้าที่จะได้ใช้จริง ไม่ใช่ภาพจำลอง",
    "screenshots.intro": "ภาพชุดนี้มาจากตัวลันเชอร์ ทั้งหน้าแรก เนื้อหาอินสแตนซ์ โลกและเซิร์ฟเวอร์ สกิน ไลบรารีม็อด และหน้าสร้างอินสแตนซ์",
    "screenshots.viewFull": "ดูภาพขนาดเต็ม",
    "screenshots.home.title": "เล่นต่อจากหน้าแรก",
    "screenshots.home.body": "เปิดอินสแตนซ์ โลก หรือเซิร์ฟเวอร์ล่าสุดได้ทันที โดยไม่ต้องไล่หาในหลายเมนู",
    "screenshots.home.open": "เปิดภาพหน้าจอ Home ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.instanceContent.title": "หน้าจัดการอินสแตนซ์",
    "screenshots.instanceContent.body": "จัดการม็อด ไฟล์ รีซอร์ซแพ็ก เชดเดอร์ โลก เซิร์ฟเวอร์ ภาพหน้าจอ และล็อกได้จากหน้านี้",
    "screenshots.instanceContent.open": "เปิดภาพหน้าจอคอนเทนต์ภายในอินสแตนซ์ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.worldsServers.title": "Worlds & Servers",
    "screenshots.worldsServers.body": "ดูโลกที่บันทึกไว้และสถานะเซิร์ฟเวอร์ อ่าน MOTD แล้วกดเข้าเล่นจุดที่เลือก",
    "screenshots.worldsServers.open": "เปิดภาพหน้าจอ Worlds และ Servers ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.skins.title": "สกินและผ้าคลุม",
    "screenshots.skins.body": "หมุนดูตัวละครแบบ 3D เก็บสกินไว้หลายชุด และเลือกผ้าคลุมที่บัญชีมีอยู่",
    "screenshots.skins.open": "เปิดภาพหน้าจอ Skins ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.libraryMods.title": "หาม็อดจากสองแหล่ง",
    "screenshots.libraryMods.body": "ค้นหา Modrinth หรือ CurseForge แล้วตรวจแหล่งที่มา เวอร์ชันเกม ตัวโหลด และไฟล์ก่อนติดตั้ง",
    "screenshots.libraryMods.open": "เปิดภาพหน้าจอไลบรารีม็อดของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.libraryModpacks.title": "เลือกม็อดแพ็กสำเร็จรูป",
    "screenshots.libraryModpacks.body": "อ่านรายละเอียด เวอร์ชันที่รองรับ ตัวโหลด และข้อมูลดาวน์โหลด ก่อนสร้างเป็นอินสแตนซ์",
    "screenshots.libraryModpacks.open": "เปิดภาพหน้าจอไลบรารี modpack ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.aboutPartners.title": "ผู้พัฒนาและเซิร์ฟเวอร์พาร์ทเนอร์",
    "screenshots.aboutPartners.body": "ดูช่องทางของผู้พัฒนาและที่อยู่ปัจจุบันของ MiniSand, NamCraft และ TeddyBlock",
    "screenshots.aboutPartners.open": "เปิดภาพหน้าจอเกี่ยวกับและพาร์ทเนอร์ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "screenshots.createInstance.title": "สร้างอินสแตนซ์",
    "screenshots.createInstance.body": "ตั้งชื่อ เลือก Minecraft และตัวโหลด กำหนดโฟลเดอร์ แล้วสร้างอินสแตนซ์ได้เลย",
    "screenshots.createInstance.open": "เปิดภาพหน้าจอสร้างอินสแตนซ์ของ NamLauncher แบบเต็มขนาด (เปิดในแท็บใหม่)",
    "developer.eyebrow": "สร้างโดย Nattapat2871",
    "developer.title": "ผู้พัฒนาคนเดียว ดูแลโปรเจกต์เดียว พร้อมบันทึกการอัปเดตที่ตรวจสอบได้",
    "developer.role": "ผู้สร้างและนักพัฒนาหลัก",
    "developer.body": "Nattapat2871 ออกแบบลันเชอร์ เขียนระบบเดสก์ท็อปและเว็บไซต์ เตรียมไฟล์แต่ละรุ่น และติดตามปัญหาที่ผู้เล่นแจ้งเข้ามา",
    "developer.responsibilities.aria": "หน้าที่ในโปรเจกต์",
    "developer.responsibilities.product": "ตัดสินใจด้านผลิตภัณฑ์",
    "developer.responsibilities.engineering": "โค้ดลันเชอร์และเซิร์ฟเวอร์",
    "developer.responsibilities.design": "หน้าตาโปรแกรมและเว็บไซต์",
    "developer.website": "เปิดเว็บไซต์ส่วนตัว",
    "developer.github": "GitHub",
    "partner.eyebrow": "เซิร์ฟเวอร์พาร์ทเนอร์",
    "partner.ownedEyebrow": "เซิร์ฟเวอร์ของ NamLauncher",
    "partner.aria": "รายชื่อเซิร์ฟเวอร์พาร์ทเนอร์ของ NamLauncher",
    "partner.address": "ที่อยู่เซิร์ฟเวอร์",
    "partner.minisand.title": "MiniSand Online",
    "partner.minisand.body": "เซิร์ฟเวอร์พาร์ทเนอร์ที่มีที่อยู่เตรียมไว้ให้ใน NamLauncher",
    "partner.minisand.linkLabel": "ไปยังเว็บไซต์ MiniSand Online (เปิดในแท็บใหม่)",
    "partner.namcraft.title": "NamCraft",
    "partner.namcraft.body": "เซิร์ฟเวอร์ Minecraft ของโปรเจกต์ NamLauncher ที่ดูแลโดย Nattapat2871",
    "partner.namcraft.linkLabel": "ไปยังเว็บไซต์ NamCraft (เปิดในแท็บใหม่)",
    "partner.teddyblock.title": "TeddyBlock",
    "partner.teddyblock.body": "เซิร์ฟเวอร์พาร์ทเนอร์ที่เปิดได้จากรายชื่อเซิร์ฟเวอร์ในลันเชอร์",
    "partner.teddyblock.linkLabel": "ไปยังเว็บไซต์ TeddyBlock (เปิดในแท็บใหม่)",
    "partner.open": "เข้าเว็บเซิร์ฟเวอร์",
    "developer.activity.eyebrow": "กิจกรรมสด",
    "developer.activity.title": "ตอนนี้ Nattapat2871 กำลังทำอะไร",
    "developer.activity.source": "ข้อมูลสดจาก AME API",
    "developer.activity.empty": "ขณะนี้ยังไม่มีกิจกรรมสาธารณะที่กำลังแชร์",
    "developer.activity.unavailable": "กิจกรรมสดไม่พร้อมใช้งานชั่วคราว",
    "developer.activity.connecting": "กำลังเชื่อมต่อกิจกรรมสด…",
    "developer.activity.platform.desktop": "เดสก์ท็อป",
    "developer.activity.platform.web": "เว็บ",
    "developer.activity.platform.mobile": "มือถือ",
    "developer.activity.type.playing": "กำลังเล่น",
    "developer.activity.type.streaming": "กำลังสตรีม",
    "developer.activity.type.listening": "กำลังฟัง",
    "developer.activity.type.watching": "กำลังดู",
    "developer.activity.type.status": "สถานะ",
    "developer.activity.type.competing": "กำลังแข่งขัน",
    "developer.activity.elapsed": "ใช้งานมาแล้ว {time}",
    "developer.loading": "กำลังโหลด",
    "developer.status.online": "ออนไลน์",
    "developer.status.idle": "พักอยู่",
    "developer.status.dnd": "ห้ามรบกวน",
    "developer.status.offline": "ออฟไลน์",
    "developer.status.unavailable": "ยังไม่พร้อมใช้งาน",
    "developer.status.connecting": "กำลังเชื่อมต่อ",
    "download.eyebrow": "Windows 1.2.3 stable · Linux 1.2.3 stable · macOS 1.2.3 stable",
    "download.title": "ดาวน์โหลด NamLauncher 1.2.3 ให้ตรงกับเครื่องของคุณ",
    "download.body": "เลือกไฟล์สำหรับ Windows, macOS หรือแพ็กเกจ Linux ที่ใช้ รุ่น Windows และ macOS ยังไม่มีลายเซ็นโค้ด จึงควรเทียบค่า SHA-256 กับค่าที่ประกาศไว้ข้างไฟล์ก่อนเปิด",
    "download.windows.detail": "ตัวติดตั้ง · x64",
    "download.macos.detail": "Universal · DMG แบบ unsigned",
    "download.macos.unavailable": "ยังไม่ได้เผยแพร่",
    "download.macos.warning": "แอป unsigned: ตรวจ SHA-256 ก่อนเปิด และอนุญาตเฉพาะแอปนี้ใน Gatekeeper",
    "download.linux.appimage.detail": "พกพาได้ · แนะนำ",
    "download.linux.deb.detail": "Debian / Ubuntu · x64",
    "download.linux.rpm.detail": "Fedora / RHEL · x64",
    "download.linux.flatpak.detail": "แพ็กเกจ sandbox · x64",
    "download.linux.arch.detail": "Arch / Manjaro / AUR · x64",
    "download.linux.heading": "Linux 1.2.3 stable",
    "download.unavailable": "ยังไม่ได้เผยแพร่",
    "download.detected": "ตรวจพบ: {platform}",
    "status.startingDownload": "กำลังเริ่มดาวน์โหลด...",
    "status.openingInstaller": "กำลังเปิดตัวติดตั้ง...",
    "status.openingUnsignedDmg": "กำลังดาวน์โหลด DMG แบบ unsigned โปรดตรวจ SHA-256 ก่อนเปิด และอนุญาตเฉพาะแอปนี้ใน Gatekeeper",
    "status.noInstaller": "ยังไม่มีลิงก์ตัวติดตั้ง",
    "status.downloadUnavailable": "ดาวน์โหลดไม่ได้ในตอนนี้",
    "status.statsOffline": "สถิติสดออฟไลน์อยู่",
    "viewBadge.label": "วิว",
    "viewBadge.title": "ยอดเข้าชมหน้าเว็บ",
    "backToTop.label": "กลับขึ้นด้านบน",
    "footer.product": "NamLauncher Stable",
    "footer.links": "เว็บหลัก: nattapat2871.me / คู่มือติดตั้ง / ชุมชน Discord / ข้อกำหนดและความเป็นส่วนตัว",
    "footer.mainOnly": "เว็บหลัก: nattapat2871.me",
    "footer.mainSite": "เว็บหลัก",
    "footer.installationGuide": "คู่มือติดตั้ง",
    "footer.discord": "ชุมชน Discord",
    "footer.termsPrivacy": "ข้อกำหนดและความเป็นส่วนตัว",
    "legal.eyebrow": "กฎของ NamLauncher",
    "legal.title": "ข้อกำหนดการใช้งานและประกาศความเป็นส่วนตัว",
    "legal.intro": "กฎเหล่านี้ใช้กับเว็บไซต์ ตัวติดตั้ง ลันเชอร์เดสก์ท็อป บัญชี อินสแตนซ์ การดาวน์โหลด และบริการที่เชื่อมต่อกับ NamLauncher",
    "legal.updated": "อัปเดตล่าสุด: 23 สิงหาคม 2026",
    "legal.tos.title": "ข้อกำหนดการใช้งาน",
    "legal.tos.acceptance.title": "1. การยอมรับและคุณสมบัติผู้ใช้",
    "legal.tos.acceptance.body": "ใช้ NamLauncher ได้เมื่อคุณมีสิทธิตามกฎหมายในการยอมรับข้อกำหนดนี้ หากอายุยังไม่ถึงเกณฑ์ในประเทศของคุณ ผู้ปกครองตามกฎหมายต้องอ่านและยอมรับแทนหรือร่วมกับคุณ",
    "legal.tos.services.title": "2. Minecraft และบริการบุคคลที่สาม",
    "legal.tos.services.body": "NamLauncher เป็นลันเชอร์อิสระและไม่เกี่ยวข้องกับ Mojang, Microsoft, Discord, Modrinth หรือ CurseForge ผู้ใช้ต้องปฏิบัติตาม Minecraft EULA, Usage Guidelines และข้อกำหนดของบริการที่เชื่อมต่อแต่ละราย",
    "legal.tos.accounts.title": "3. Microsoft account และ Cracked account",
    "legal.tos.accounts.body": "Microsoft account ต้องเป็นบัญชีของคุณและมีสิทธิ์ใช้งาน Minecraft ที่ถูกต้องเมื่อบริการกำหนด ส่วน Cracked account เป็นเพียงตัวตนในเครื่องหรือออฟไลน์ ไม่ได้มอบลิขสิทธิ์ Minecraft ไม่ได้ยืนยันความเป็นเจ้าของ และไม่อนุญาตให้ข้ามระบบยืนยันตัวตนหรือเข้าเซิร์ฟเวอร์โดยไม่ได้รับอนุญาต",
    "legal.tos.conduct.title": "4. พฤติกรรมผู้เล่นและกฎเซิร์ฟเวอร์",
    "legal.tos.conduct.body": "ต้องปฏิบัติตามกฎหมายและกฎของแต่ละเซิร์ฟเวอร์ ห้ามใช้ NamLauncher เพื่อคุกคาม ข่มขู่ ฉ้อโกง เข้าถึงระบบโดยไม่ได้รับอนุญาต รบกวนบริการ แจกมัลแวร์ ขโมยข้อมูลบัญชี หลบเลี่ยงการแบน หรือใช้โปรแกรมโกงเมื่อเซิร์ฟเวอร์ห้าม",
    "legal.tos.content.title": "5. Mods และทรัพย์สินทางปัญญา",
    "legal.tos.content.body": "Mods, modpacks, resource packs, shaders, skins และไฟล์อื่นเป็นของผู้สร้างแต่ละราย ผู้ใช้ต้องตรวจ license สิทธิ์การใช้งาน ความเข้ากันได้ และความปลอดภัยก่อนดาวน์โหลด แจกจ่าย หรือแก้ไข",
    "legal.tos.security.title": "6. ความปลอดภัยและความรับผิดชอบต่อบัญชี",
    "legal.tos.security.body": "ดูแลอุปกรณ์และบัญชีของตนเองให้ปลอดภัย ห้ามแบ่งปัน token หรือข้อมูลรับรอง หากสงสัยว่าบัญชีถูกเข้าถึงให้ดำเนินการแก้ไขทันที และควรลบบัญชีออกจากลันเชอร์เมื่อใช้เครื่องร่วมกับผู้อื่น",
    "legal.tos.beta.title": "7. รุ่นเสถียรแบบ community build และการสำรองข้อมูล",
    "legal.tos.beta.body": "NamLauncher 1.2.3 เผยแพร่โดยยังไม่มี certificate สำหรับลงลายเซ็นโค้ดบน Windows หรือ macOS และยังอาจมีข้อผิดพลาด โปรดตรวจไฟล์จากเว็บไซต์ทางการและสำรอง saves, instances, screenshots, mods และข้อมูลสำคัญก่อนอัปเดตหรือย้ายโฟลเดอร์",
    "legal.tos.network.title": "8. การดาวน์โหลด อัปเดต และเครือข่าย",
    "legal.tos.network.body": "ลันเชอร์อาจดาวน์โหลดไฟล์ Minecraft, Java runtime, loaders, metadata และคอนเทนต์ที่ผู้ใช้เลือก ผู้ใช้รับผิดชอบค่าเครือข่าย พื้นที่จัดเก็บ และการตรวจสอบไฟล์ที่เลือกดาวน์โหลด",
    "legal.tos.changes.title": "9. การเปลี่ยนแปลงและการเข้าถึง",
    "legal.tos.changes.body": "ฟีเจอร์ การเชื่อมต่อ และข้อกำหนดอาจเปลี่ยนเพื่อความปลอดภัย กฎหมาย หรือข้อกำหนดของบริการ หากมีการเปลี่ยนสาระสำคัญ ลันเชอร์จะขอให้ยอมรับฉบับใหม่ก่อนใช้งานต่อ",
    "legal.tos.warranty.title": "10. การรับประกันและความรับผิด",
    "legal.tos.warranty.body": "ภายใต้ขอบเขตที่กฎหมายอนุญาต NamLauncher ให้บริการตามสภาพจริงโดยไม่มีการรับประกัน ผู้พัฒนาไม่รับผิดชอบบริการบุคคลที่สาม คอนเทนต์ไม่เข้ากัน การลงโทษจากเซิร์ฟเวอร์ ข้อมูลสูญหาย หรือความเสียหายทางอ้อม ทั้งนี้สิทธิ์ที่กฎหมายห้ามยกเว้นยังคงมีผล",
    "legal.references.aria": "การอ้างอิงภายนอก",
    "legal.references.title": "อ้างอิง",
    "legal.privacy.title": "ประกาศความเป็นส่วนตัว",
    "legal.privacy.local.title": "1. ข้อมูลที่เก็บบนอุปกรณ์",
    "legal.privacy.local.body": "การตั้งค่าลันเชอร์ สรุปบัญชี ข้อมูลยืนยันตัวตนที่เข้ารหัส อินสแตนซ์ รายการคอนเทนต์ Java runtime cache รูปภาพ skins และ logs จะเก็บในโฟลเดอร์ข้อมูล NamLauncher ที่ผู้ใช้เลือก",
    "legal.privacy.microsoft.title": "2. การยืนยันตัวตน Microsoft",
    "legal.privacy.microsoft.body": "การยืนยันตัวตน Microsoft ใช้ขั้นตอนลงชื่อเข้าใช้ของลันเชอร์ ข้อมูลที่จำเป็นจะเก็บในเครื่องและเข้ารหัสเมื่อระบบปฏิบัติการรองรับ secure storage โดยเว็บไซต์ NamLauncher จะไม่ขอให้คุณส่งรหัสผ่าน Microsoft",
    "legal.privacy.stats.title": "3. Heartbeat ลันเชอร์แบบไม่ระบุตัวตนที่จำเป็น",
    "legal.privacy.stats.body": "ระหว่างที่ NamLauncher ทำงาน heartbeat ออนไลน์ที่จำเป็นจะปิดไม่ได้และยังส่งต่อเมื่อย่อหรือซ่อนในถาดระบบ Discord IPC เป็นการตั้งค่าแยกและเมื่อเปิดจะทำงานต่อระหว่างซ่อนหน้าต่าง ส่วน heartbeat ส่งรหัสไคลเอนต์แบบสุ่ม เวอร์ชัน แพลตฟอร์ม และสถานะเกม แต่ไม่ส่ง Microsoft token รายการไฟล์ แชต หรือที่อยู่เซิร์ฟเวอร์",
    "legal.privacy.sessions.title": "4. สถิติ session การเล่นเกมที่จำเป็น",
    "legal.privacy.sessions.body": "ระหว่างเกมทำงาน ระบบจำเป็นต้องส่งชื่อโปรไฟล์ ประเภทบัญชี version, loader, session start, heartbeat และ session end เพื่อคำนวณเวลาเล่นจริง และเมื่อเชื่อมต่อเซิร์ฟเวอร์หลายผู้เล่นจะส่งที่อยู่กับพอร์ตแบบ normalized เพื่อวิเคราะห์ endpoint ในแดชบอร์ดเจ้าของเท่านั้น โดยที่อยู่ private หรือ local จะเก็บเพื่อวัตถุประสงค์นี้ในระบบที่จำกัดสิทธิ์ รหัสติดตั้งเก็บเป็น hash, session ที่ขาด heartbeat ปิด ณ ครั้งล่าสุด และลบหลัง 365 วันโดยค่าเริ่มต้น โดยไม่ส่ง token รหัสผ่าน แชต log เกม world หรือรายการไฟล์",
    "legal.privacy.modSignals.title": "4A. การรายงานสัญญาณมอดของอินสแตนซ์ที่เปิดแบบจำเป็น",
    "legal.privacy.modSignals.body": "ทุกครั้งที่เปิดเกม ระบบตรวจเฉพาะ metadata ของไฟล์ JAR โดยตรงในโฟลเดอร์ mods ของอินสแตนซ์ที่กำลังเปิดและส่งเฉพาะ metadata ที่ตรง โดยไม่อัปโหลดไฟล์ JAR พาธ token world แชต log หรือที่อยู่เซิร์ฟเวอร์ ผลที่พบไม่ใช่หลักฐานยืนยันการโกง และการตรวจล้มเหลวไม่บล็อกการเปิดเกมเพียงเพราะเหตุนี้",
    "legal.privacy.providers.title": "5. ผู้ให้บริการคอนเทนต์และการดาวน์โหลด",
    "legal.privacy.providers.body": "การค้นหาและดาวน์โหลดอาจติดต่อผู้ให้บริการภายนอกและบริการ NamLauncher สำหรับ Discord launch presence ระบบอาจใส่ Minecraft texture ID สาธารณะที่ตรวจสอบแล้วใน URL ภาพหัวของ mc-heads.net ที่ส่งให้ Discord ส่วน caller รุ่นเก่าของตัวช่วยรูปหัวอาจใช้ UUID หรือชื่อโปรไฟล์แทน ผู้ให้บริการที่อุปกรณ์ติดต่อโดยตรงได้รับข้อมูลเครือข่าย และผู้ให้บริการอาจได้รับรหัสที่จำเป็นต่อคำขอ NamLauncher เก็บบันทึกการทำงาน 30 วันสำหรับการติดตั้งคอนเทนต์และคำขอบริการหรือดาวน์โหลด แต่ไม่เก็บรหัสผ่าน token แชต หรือที่อยู่เซิร์ฟเวอร์",
    "legal.privacy.discord.title": "5. กิจกรรม Discord",
    "legal.privacy.discord.body": "เมื่อเปิด Discord IPC และ process ของ NamLauncher ยังทำงานอยู่ รวมถึงตอนซ่อนใน system tray ข้อมูลกิจกรรมและข้อมูลอ้างอิงรูปจะถูกส่งไปยังแอป Discord desktop บนอุปกรณ์ หาก NamLauncher ยืนยันไม่ได้ว่า texture ID ตรงกับไฟล์สกินที่เลือก ระบบ launch จะไม่ส่งภาพผู้เล่นขนาดเล็ก แทนการเสี่ยงแสดงหัวผิด โดย Discord และผู้ให้บริการรูปเป็นผู้ควบคุมการประมวลผล การแสดง และการเก็บข้อมูลของตน",
    "legal.privacy.logs.title": "6. Logs และรายงานข้อผิดพลาด",
    "legal.privacy.logs.body": "เมื่อระบบตรวจพบ error ของลันเชอร์หรือ Minecraft จะส่งรายงานที่ลดข้อมูลอ่อนไหวให้อัตโนมัติ ปุ่มเดิมใช้ยืนยันแยกว่าผู้เล่นพบเหตุการณ์จริง ส่วนการคัดลอกอยู่ในเครื่อง และเมื่อกดว่าแก้แล้วระบบจะลบไฟล์ log กับเนื้อหารายงานละเอียดอ่อน โดยเก็บเฉพาะสถานะ จำนวนคำยืนยัน และข้อมูลขั้นต่ำสำหรับซิงก์ Discord",
    "legal.privacy.contact.title": "7. ตัวเลือก การลบข้อมูล และการติดต่อ",
    "legal.privacy.contact.body": "Heartbeat สถิติ session การตรวจนโยบายมอด และรายงาน error อัตโนมัติเป็นฟังก์ชันบริการที่จำเป็น ส่วน Discord IPC และไอคอนข้ามผู้เล่นปิดได้ ผู้ใช้ยังออกจากโปรแกรม ถอนการติดตั้ง ลบบัญชี ลบอินสแตนซ์ หรือลบโฟลเดอร์ข้อมูลได้ หากมีคำถาม ติดต่อผู้พัฒนาผ่าน <a href=\"https://nattapat2871.me\" rel=\"me\">nattapat2871.me</a>"
  }
};

Object.assign(translations.en, {
  "meta.install.title": "Install NamLauncher on Windows, Linux & macOS",
  "meta.install.description": "Install NamLauncher safely on Windows, Linux, or macOS with package-specific steps and first-launch security guidance.",
  "nav.install": "Install guide",
  "install.skip": "Skip to installation instructions",
  "install.eyebrow": "Installation guide",
  "install.title": "Install NamLauncher on Windows, Linux, or macOS.",
  "install.intro": "Choose your operating system, download only from the official NamLauncher website, and follow the steps below.",
  "install.download": "Go to official downloads",
  "download.installGuide": "Read installation guide",
  "install.official": "Official domain: namlauncher.nattapat2871.me",
  "install.jump.aria": "Choose installation instructions",
  "install.windows.short": "Windows",
  "install.linux.short": "Linux",
  "install.macos.short": "macOS",
  "install.securityNotice": "Security notice",
  "install.tip": "Tip",
  "install.windows.eyebrow": "Windows · x64 installer",
  "install.windows.title": "Install on Windows 10 or 11",
  "install.windows.intro": "Use the NamLauncher .exe installer. You do not need to turn off Windows Security.",
  "install.windows.step1.title": "Download the Windows installer",
  "install.windows.step1.body": "Open the official download section and select the Windows .exe package.",
  "install.windows.step2.title": "Run the installer",
  "install.windows.step2.body": "Open the downloaded file, approve the standard Windows prompt, and complete Setup.",
  "install.windows.step3.title": "Launch NamLauncher",
  "install.windows.step3.body": "Open NamLauncher from the Start menu. It uses the default launcher data folder automatically; you can move it later in Settings.",
  "install.windows.warning.title": "If Microsoft Defender SmartScreen appears",
  "install.windows.warning.body": "An unsigned or newly published installer can show “Windows protected your PC.” First confirm the download came from the official domain. Then choose More info and Run anyway only if the file is the NamLauncher installer you expected. Keep SmartScreen enabled.",
  "install.windows.warning.link": "Read Microsoft's SmartScreen guidance",
  "install.linux.eyebrow": "Linux · x64 packages",
  "install.linux.title": "Choose the package for your distribution",
  "install.linux.intro": "The download menu shows only packages that are currently published. AppImage is the simplest portable option.",
  "install.linux.appimage.title": "Portable · recommended",
  "install.linux.appimage.body": "Make the downloaded file executable, then run it directly.",
  "install.linux.appimage.commandAria": "AppImage installation commands",
  "install.linux.deb.title": "Debian or Ubuntu",
  "install.linux.deb.body": "Install the local package with APT so required system dependencies can be resolved.",
  "install.linux.deb.commandAria": "Debian and Ubuntu installation command",
  "install.linux.rpm.title": "Fedora or RHEL",
  "install.linux.rpm.body": "Use DNF to install the downloaded RPM and its required dependencies.",
  "install.linux.rpm.commandAria": "Fedora and RHEL installation command",
  "install.linux.flatpak.title": "Flatpak bundle",
  "install.linux.flatpak.body": "Install the local bundle for your user, then open NamLauncher from the application menu.",
  "install.linux.flatpak.commandAria": "Flatpak installation command",
  "install.linux.arch.title": "Arch or Manjaro",
  "install.linux.arch.body": "Install the downloaded package with pacman.",
  "install.linux.arch.commandAria": "Arch and Manjaro installation command",
  "install.linux.note.title": "Commands assume the file is in Downloads",
  "install.linux.note.body": "If your browser saved it elsewhere, open a terminal in that folder or replace ~/Downloads with the correct path.",
  "install.macos.eyebrow": "macOS · universal DMG",
  "install.macos.title": "Install the direct-download macOS build",
  "install.macos.intro": "The free macOS build is distributed from this website without Apple notarization, so macOS will ask you to confirm the first launch.",
  "install.macos.step1.title": "Download the universal DMG",
  "install.macos.step1.body": "Select the macOS package in the official download menu. It supports Apple silicon and Intel Macs.",
  "install.macos.step2.title": "Move NamLauncher to Applications",
  "install.macos.step2.body": "Open the DMG and drag NamLauncher into the Applications folder, then eject the disk image.",
  "install.macos.step3.title": "Try to open the app once",
  "install.macos.step3.body": "In Applications, Control-click NamLauncher and choose Open. If macOS still blocks it, close the warning and continue to the next step.",
  "install.macos.step4.title": "Allow only this app",
  "install.macos.step4.body": "Open System Settings, choose Privacy & Security, scroll to Security, and click Open Anyway for NamLauncher. Confirm Open when macOS asks again.",
  "install.macos.warning.title": "Do not disable Gatekeeper",
  "install.macos.warning.body": "Use Open Anyway only for the NamLauncher copy downloaded from the official domain. This creates an exception for this app; do not run commands that disable macOS security for the whole system.",
  "install.macos.warning.link": "Read Apple's app safety guidance",
  "install.macos.integrity.title": "Verify the DMG before first launch",
  "install.macos.integrity.body": "Download the matching SHA-256 file, keep it beside the DMG in Downloads, then run this command in Terminal. Continue only when it reports OK.",
  "install.macos.integrity.link": "Download the matching SHA-256 checksum",
  "install.macos.integrity.commandAria": "Command to verify the macOS DMG checksum",
  "install.help.eyebrow": "Before you continue",
  "install.help.title": "Download the package first, then keep this guide open.",
  "install.help.body": "If a package is marked unavailable, it has not been published yet. Choose another available format or return after the next release.",
  "footer.links": "Main site: nattapat2871.me / Installation guide / Terms & Privacy"
});

Object.assign(translations.th, {
  "meta.install.title": "วิธีติดตั้ง NamLauncher บน Windows, Linux และ macOS",
  "meta.install.description": "วิธีติดตั้ง NamLauncher อย่างปลอดภัยบน Windows, Linux และ macOS พร้อมขั้นตอนตามชนิดแพ็กเกจและคำแนะนำเมื่อเปิดครั้งแรก",
  "nav.install": "คู่มือติดตั้ง",
  "install.skip": "ข้ามไปยังวิธีติดตั้ง",
  "install.eyebrow": "คู่มือการติดตั้ง",
  "install.title": "ติดตั้ง NamLauncher บน Windows, Linux หรือ macOS",
  "install.intro": "เลือกระบบปฏิบัติการ ดาวน์โหลดจากเว็บไซต์ NamLauncher ทางการเท่านั้น แล้วทำตามขั้นตอนด้านล่าง",
  "install.download": "ไปยังหน้าดาวน์โหลดทางการ",
  "download.installGuide": "อ่านคู่มือการติดตั้ง",
  "install.official": "โดเมนทางการ: namlauncher.nattapat2871.me",
  "install.jump.aria": "เลือกคำแนะนำการติดตั้ง",
  "install.windows.short": "Windows",
  "install.linux.short": "Linux",
  "install.macos.short": "macOS",
  "install.securityNotice": "ข้อควรระวังด้านความปลอดภัย",
  "install.tip": "คำแนะนำ",
  "install.windows.eyebrow": "Windows · ตัวติดตั้ง x64",
  "install.windows.title": "ติดตั้งบน Windows 10 หรือ 11",
  "install.windows.intro": "ใช้ตัวติดตั้ง NamLauncher นามสกุล .exe โดยไม่ต้องปิด Windows Security",
  "install.windows.step1.title": "ดาวน์โหลดตัวติดตั้ง Windows",
  "install.windows.step1.body": "เปิดส่วนดาวน์โหลดทางการแล้วเลือกแพ็กเกจ Windows นามสกุล .exe",
  "install.windows.step2.title": "เปิดตัวติดตั้ง",
  "install.windows.step2.body": "เปิดไฟล์ที่ดาวน์โหลด ยืนยันหน้าต่างมาตรฐานของ Windows แล้วติดตั้งตามขั้นตอน Setup ให้เสร็จ",
  "install.windows.step3.title": "เปิด NamLauncher",
  "install.windows.step3.body": "เปิด NamLauncher จากเมนู Start โดยแอปจะใช้โฟลเดอร์ข้อมูลเริ่มต้นให้อัตโนมัติ และสามารถย้ายภายหลังได้ใน Settings",
  "install.windows.warning.title": "หาก Microsoft Defender SmartScreen แสดงคำเตือน",
  "install.windows.warning.body": "ตัวติดตั้งที่ยังไม่มีลายเซ็นหรือเพิ่งเผยแพร่อาจขึ้นข้อความ “Windows protected your PC” ให้ตรวจสอบก่อนว่าโหลดจากโดเมนทางการ จากนั้นเลือก More info และ Run anyway เฉพาะเมื่อเป็นไฟล์ NamLauncher ที่คุณตั้งใจโหลด โดยเปิด SmartScreen ไว้ตามเดิม",
  "install.windows.warning.link": "อ่านคำแนะนำ SmartScreen จาก Microsoft",
  "install.linux.eyebrow": "Linux · แพ็กเกจ x64",
  "install.linux.title": "เลือกแพ็กเกจให้ตรงกับดิสทริบิวชัน",
  "install.linux.intro": "เมนูดาวน์โหลดจะแสดงเฉพาะแพ็กเกจที่เผยแพร่แล้ว โดย AppImage เป็นตัวเลือกแบบพกพาที่ติดตั้งง่ายที่สุด",
  "install.linux.appimage.title": "แบบพกพา · แนะนำ",
  "install.linux.appimage.body": "ให้สิทธิ์ไฟล์ที่ดาวน์โหลดให้รันได้ แล้วเปิดไฟล์โดยตรง",
  "install.linux.appimage.commandAria": "คำสั่งติดตั้ง AppImage",
  "install.linux.deb.title": "Debian หรือ Ubuntu",
  "install.linux.deb.body": "ติดตั้งแพ็กเกจในเครื่องด้วย APT เพื่อให้ระบบจัดการ dependency ที่จำเป็น",
  "install.linux.deb.commandAria": "คำสั่งติดตั้งสำหรับ Debian และ Ubuntu",
  "install.linux.rpm.title": "Fedora หรือ RHEL",
  "install.linux.rpm.body": "ใช้ DNF ติดตั้งไฟล์ RPM ที่ดาวน์โหลดพร้อม dependency ที่จำเป็น",
  "install.linux.rpm.commandAria": "คำสั่งติดตั้งสำหรับ Fedora และ RHEL",
  "install.linux.flatpak.title": "แพ็กเกจ Flatpak",
  "install.linux.flatpak.body": "ติดตั้งแพ็กเกจในบัญชีผู้ใช้ แล้วเปิด NamLauncher จากเมนูแอปพลิเคชัน",
  "install.linux.flatpak.commandAria": "คำสั่งติดตั้ง Flatpak",
  "install.linux.arch.title": "Arch หรือ Manjaro",
  "install.linux.arch.body": "ติดตั้งแพ็กเกจที่ดาวน์โหลดด้วย pacman",
  "install.linux.arch.commandAria": "คำสั่งติดตั้งสำหรับ Arch และ Manjaro",
  "install.linux.note.title": "คำสั่งตัวอย่างถือว่าไฟล์อยู่ใน Downloads",
  "install.linux.note.body": "หากเบราว์เซอร์บันทึกไฟล์ไว้ที่อื่น ให้เปิดเทอร์มินัลในโฟลเดอร์นั้นหรือเปลี่ยน ~/Downloads เป็นตำแหน่งจริง",
  "install.macos.eyebrow": "macOS · DMG แบบ universal",
  "install.macos.title": "ติดตั้ง macOS build ที่ดาวน์โหลดตรงจากเว็บ",
  "install.macos.intro": "macOS build แบบฟรีเผยแพร่จากเว็บไซต์นี้โดยยังไม่ได้ notarize กับ Apple ดังนั้น macOS จะขอให้ยืนยันเมื่อเปิดครั้งแรก",
  "install.macos.step1.title": "ดาวน์โหลด DMG แบบ universal",
  "install.macos.step1.body": "เลือกแพ็กเกจ macOS ในเมนูดาวน์โหลดทางการ ซึ่งรองรับทั้ง Mac ชิป Apple และ Intel",
  "install.macos.step2.title": "ย้าย NamLauncher ไปยัง Applications",
  "install.macos.step2.body": "เปิดไฟล์ DMG ลาก NamLauncher ไปยังโฟลเดอร์ Applications แล้ว eject disk image",
  "install.macos.step3.title": "ลองเปิดแอปหนึ่งครั้ง",
  "install.macos.step3.body": "ใน Applications ให้กด Control พร้อมคลิก NamLauncher แล้วเลือก Open หาก macOS ยังบล็อก ให้ปิดคำเตือนแล้วทำขั้นตอนถัดไป",
  "install.macos.step4.title": "อนุญาตเฉพาะแอปนี้",
  "install.macos.step4.body": "เปิด System Settings เลือก Privacy & Security เลื่อนไปยัง Security แล้วกด Open Anyway สำหรับ NamLauncher จากนั้นยืนยัน Open อีกครั้ง",
  "install.macos.warning.title": "อย่าปิด Gatekeeper",
  "install.macos.warning.body": "ใช้ Open Anyway เฉพาะกับ NamLauncher ที่ดาวน์โหลดจากโดเมนทางการและคุณมั่นใจว่าเป็นไฟล์ที่ต้องการ วิธีนี้ยกเว้นเฉพาะแอปนี้ จึงไม่ควรรันคำสั่งที่ปิดระบบความปลอดภัยของ macOS ทั้งเครื่อง",
  "install.macos.warning.link": "อ่านคำแนะนำความปลอดภัยของแอปจาก Apple",
  "install.macos.integrity.title": "ตรวจสอบ DMG ก่อนเปิดครั้งแรก",
  "install.macos.integrity.body": "ดาวน์โหลดไฟล์ SHA-256 ที่ตรงกัน วางไว้ข้างไฟล์ DMG ใน Downloads แล้วรันคำสั่งนี้ใน Terminal ดำเนินการต่อเมื่อผลแสดงว่า OK เท่านั้น",
  "install.macos.integrity.link": "ดาวน์โหลด checksum SHA-256 ที่ตรงกับ DMG",
  "install.macos.integrity.commandAria": "คำสั่งตรวจสอบ checksum ของ DMG สำหรับ macOS",
  "install.help.eyebrow": "ก่อนเริ่มติดตั้ง",
  "install.help.title": "ดาวน์โหลดแพ็กเกจก่อน แล้วเปิดคู่มือนี้ไว้ระหว่างติดตั้ง",
  "install.help.body": "หากแพ็กเกจขึ้นว่ายังไม่พร้อม แปลว่ายังไม่ได้เผยแพร่ ให้เลือกฟอร์แมตอื่นที่มีอยู่หรือกลับมาหลังรีลีสครั้งถัดไป",
  "footer.links": "เว็บหลัก: nattapat2871.me / คู่มือติดตั้ง / ข้อกำหนดและความเป็นส่วนตัว"
});

translations.en["developer.activity.source"] = "AME API";
translations.th["developer.activity.source"] = "AME API";
translations.th["legal.privacy.developer.title"] = "5. \u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e41\u0e25\u0e30\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21\u0e2a\u0e32\u0e18\u0e32\u0e23\u0e13\u0e30\u0e02\u0e2d\u0e07\u0e1c\u0e39\u0e49\u0e1e\u0e31\u0e12\u0e19\u0e32";
translations.th["legal.privacy.developer.body"] = "\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01\u0e02\u0e2d\u0e07\u0e40\u0e27\u0e47\u0e1a\u0e44\u0e0b\u0e15\u0e4c\u0e2d\u0e32\u0e08\u0e2d\u0e48\u0e32\u0e19\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e41\u0e25\u0e30\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21\u0e2a\u0e32\u0e18\u0e32\u0e23\u0e13\u0e30\u0e02\u0e2d\u0e07\u0e1c\u0e39\u0e49\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e08\u0e32\u0e01 <a href=\"https://ame-api.nattapat2871.me/\" rel=\"noopener\" target=\"_blank\">AME API</a> \u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e41\u0e2a\u0e14\u0e07\u0e27\u0e34\u0e14\u0e40\u0e08\u0e47\u0e15\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e41\u0e1a\u0e1a\u0e2a\u0e14";
translations.th["legal.privacy.contact.title"] = "6. \u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d";

const elements = {
  siteHeader: document.querySelector(".site-header"),
  siteNav: document.querySelector("#site-nav"),
  themeToggle: document.querySelector("[data-theme-toggle]"),
  mobileMenuToggle: document.querySelector("[data-mobile-menu-toggle]"),
  backToTop: document.querySelector("[data-back-to-top]"),
  downloadPickers: Array.from(document.querySelectorAll("[data-download-picker]")),
  primaryDownloadButtons: Array.from(document.querySelectorAll("[data-primary-download]")),
  downloadMenuToggles: Array.from(document.querySelectorAll("[data-download-menu-toggle]")),
  downloadMenus: Array.from(document.querySelectorAll("[data-download-menu]")),
  macosIntegrityBlocks: Array.from(document.querySelectorAll("[data-macos-integrity]")),
  macosChecksumLinks: Array.from(document.querySelectorAll("[data-macos-checksum-link]")),
  downloadStatus: document.querySelector("#downloadStatus"),
  downloadsCount: document.querySelector("#downloadsCount"),
  onlineCount: document.querySelector("#onlineCount"),
  releaseVersion: document.querySelector("#releaseVersion"),
  heroVersion: document.querySelector("#heroVersion"),
  pageViewsCount: document.querySelector("#pageViewsCount"),
  creatorBanner: document.querySelector("#creatorBanner"),
  creatorAvatar: document.querySelector("#creatorAvatar"),
  creatorDecoration: document.querySelector("#creatorDecoration"),
  creatorName: document.querySelector("#creatorName"),
  creatorUsername: document.querySelector("#creatorUsername"),
  developerPresence: document.querySelector("#developerPresence"),
  developerPlatforms: document.querySelector("#developerPlatforms"),
  developerActivities: document.querySelector("#developerActivities"),
  activityCard: document.querySelector(".activity-card"),
  changelogList: document.querySelector("[data-changelog-list]"),
  changelogCount: document.querySelector("[data-changelog-count]")
};

function preferredLanguage() {
  const saved = localStorage.getItem("namlauncher-language");
  if (saved === "en" || saved === "th") return saved;
  return "th";
}

let activeLanguage = preferredLanguage();

function preferredTheme() {
  const saved = localStorage.getItem("namlauncher-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

let activeTheme = preferredTheme();

function numberFormat() {
  return new Intl.NumberFormat(activeLanguage === "th" ? "th-TH" : "en-US");
}

function t(key) {
  return translations[activeLanguage]?.[key] || translations.en[key] || key;
}

function updateThemeToggle() {
  if (!elements.themeToggle) return;
  const label = t(activeTheme === "dark" ? "theme.toLight" : "theme.toDark");
  elements.themeToggle.setAttribute("aria-label", label);
  elements.themeToggle.dataset.tooltip = label;
  elements.themeToggle.setAttribute("aria-pressed", activeTheme === "dark" ? "true" : "false");
}

function applyTheme(theme = activeTheme) {
  activeTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.classList.toggle("dark", activeTheme === "dark");
  document.documentElement.classList.toggle("light", activeTheme === "light");
  setMeta("meta[name='theme-color']", activeTheme === "dark" ? "#07111d" : "#eef6ff");
  updateThemeToggle();
  window.requestAnimationFrame(snapshotLayoutRects);
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function setStatusKey(key, isError = false) {
  activeStatusKey = key;
  activeStatusIsError = isError;
  if (!elements.downloadStatus) return;
  elements.downloadStatus.textContent = key ? t(key) : "";
  elements.downloadStatus.classList.toggle("is-error", isError);
}

function setMeta(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("content", value);
}

function createFooterLink(label, href, rel = "") {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  if (rel) link.rel = rel;
  return link;
}

function renderRichTranslation(element, key) {
  if (!element) return;
  if (key !== "footer.links" && key !== "footer.mainOnly") {
    element.textContent = t(key);
    return;
  }

  const fragment = document.createDocumentFragment();
  fragment.append(
    document.createTextNode(`${t("footer.mainSite")}: `),
    createFooterLink("nattapat2871.me", "https://nattapat2871.me", "me")
  );

  if (key === "footer.links") {
    fragment.append(
      document.createTextNode(" / "),
      createFooterLink(t("footer.installationGuide"), "/how-to-install"),
      document.createTextNode(" / "),
      createFooterLink(t("footer.discord"), "/discord"),
      document.createTextNode(" / "),
      createFooterLink(t("footer.termsPrivacy"), "/legal")
    );
  }

  element.replaceChildren(fragment);
}

function applyTranslations() {
  document.documentElement.lang = activeLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    renderRichTranslation(element, element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-tooltip]").forEach((element) => {
    element.dataset.tooltip = t(element.dataset.i18nTooltip);
  });
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    const selected = button.dataset.langOption === activeLanguage;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.dataset.tooltip = t(button.dataset.langOption === "th" ? "language.thai" : "language.english");
  });
  document.querySelectorAll(".view-badge").forEach((element) => {
    element.dataset.tooltip = t("viewBadge.title");
  });
  document.querySelectorAll("[title]").forEach((element) => {
    element.dataset.tooltip = element.getAttribute("title") || "";
    element.removeAttribute("title");
  });
  updateThemeToggle();
  if (changelogEntries.length) renderChangelog();

  const page = document.body.dataset.page || "home";
  if (page === "legal") {
    document.title = t("meta.legal.title");
    setMeta("meta[name='description']", t("meta.legal.description"));
    renderLegalDocument();
  } else if (page === "history") {
    document.title = t("meta.history.title");
    setMeta("meta[name='description']", t("meta.history.description"));
  } else if (page === "install") {
    document.title = t("meta.install.title");
    setMeta("meta[name='description']", t("meta.install.description"));
  } else {
    document.title = t("meta.home.title");
    setMeta("meta[name='description']", t("meta.home.description"));
  }

  if (currentDeveloperProfile) renderDeveloperActivity(currentDeveloperProfile);
  if (activeStatusKey) setStatusKey(activeStatusKey, activeStatusIsError);
  renderDownloadPickers();
  if (elements.mobileMenuToggle) {
    setMobileNavigation(elements.mobileMenuToggle.getAttribute("aria-expanded") === "true");
  }
}

function changelogStatusLabel(status) {
  if (status === "latest") return t("changelog.latest");
  if (status === "first") return t("changelog.first");
  return t("changelog.previous");
}

function formatChangelogDate(value) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(activeLanguage === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
}

function formatChangelogRelativeDate(value) {
  const publishedAt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(publishedAt.getTime())) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const differenceInDays = Math.round((publishedAt.getTime() - today.getTime()) / 86_400_000);
  if (differenceInDays === 0) return t("changelog.updatedToday");
  const relative = new Intl.RelativeTimeFormat(activeLanguage === "th" ? "th-TH" : "en-US", {
    numeric: "always"
  }).format(differenceInDays, "day");
  return t("changelog.updatedRelative").replace("{relative}", relative);
}

function trustedChangelogCommitUrl(commitValue, urlValue) {
  if (typeof commitValue !== "string" || typeof urlValue !== "string") return null;
  if (!/^[0-9a-f]{7,40}$/.test(commitValue)) return null;

  const expectedUrl = `${OFFICIAL_CHANGELOG_COMMIT_PREFIX}${commitValue}`;
  if (urlValue !== expectedUrl) return null;

  try {
    const parsedUrl = new URL(urlValue);
    if (
      parsedUrl.protocol !== "https:"
      || parsedUrl.hostname !== "github.com"
      || parsedUrl.port !== ""
      || parsedUrl.username !== ""
      || parsedUrl.password !== ""
      || parsedUrl.pathname !== `/Nattapat2871/NamLauncher/commit/${commitValue}`
      || parsedUrl.search !== ""
      || parsedUrl.hash !== ""
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return expectedUrl;
}

function createChangelogCommitIcon() {
  const icon = document.createElementNS(SVG_NAMESPACE, "svg");
  icon.setAttribute("viewBox", "0 0 20 20");
  icon.setAttribute("aria-hidden", "true");

  const start = document.createElementNS(SVG_NAMESPACE, "circle");
  start.setAttribute("cx", "6");
  start.setAttribute("cy", "5");
  start.setAttribute("r", "2.25");

  const end = document.createElementNS(SVG_NAMESPACE, "circle");
  end.setAttribute("cx", "14");
  end.setAttribute("cy", "15");
  end.setAttribute("r", "2.25");

  const route = document.createElementNS(SVG_NAMESPACE, "path");
  route.setAttribute("d", "M6 7.25v2.5c0 2.9 2.1 5.25 5 5.25h.75M14 12.75V10c0-2.75-2-5-4.75-5H8.3");
  icon.append(start, end, route);
  return icon;
}

function createChangelogCommitControl(entry) {
  const commitUrl = trustedChangelogCommitUrl(entry?.commit, entry?.commit_url);
  if (!commitUrl) return null;

  const commit = document.createElement("a");
  commit.className = "button button--ghost button--sm changelog-commit";
  commit.href = commitUrl;
  commit.target = "_blank";
  commit.rel = "noopener noreferrer";
  commit.setAttribute("aria-label", t("changelog.commitAria").replace("{version}", entry.version || ""));

  const label = document.createElement("span");
  label.textContent = t("changelog.commit");
  const commitId = document.createElement("code");
  commitId.textContent = entry.commit;
  commit.append(createChangelogCommitIcon(), label, commitId);
  return commit;
}

function renderChangelogError() {
  if (!elements.changelogList) return;
  elements.changelogList.replaceChildren();
  const message = document.createElement("div");
  message.className = "card card--secondary changelog-loading is-error";
  message.setAttribute("role", "status");
  message.textContent = t("changelog.error");
  elements.changelogList.append(message);
}

function renderChangelog() {
  if (!elements.changelogList || !changelogEntries.length) return;
  const fragment = document.createDocumentFragment();
  const requestedLimit = Number.parseInt(elements.changelogList.dataset.changelogLimit || "", 10);
  const visibleEntries = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? changelogEntries.slice(0, requestedLimit)
    : changelogEntries;

  visibleEntries.forEach((entry, index) => {
    const details = document.createElement("details");
    details.className = `card ${index === 0 ? "card--default" : "card--secondary"} changelog-entry`;
    details.open = index === 0;

    const summary = document.createElement("summary");
    const marker = document.createElement("span");
    marker.className = "changelog-marker";
    marker.setAttribute("aria-hidden", "true");

    const version = document.createElement("span");
    version.className = "changelog-version";
    const versionName = document.createElement("strong");
    versionName.textContent = entry.version;
    const status = document.createElement("span");
    status.textContent = changelogStatusLabel(entry.status);
    version.append(versionName, status);

    const publishedAt = document.createElement("time");
    publishedAt.dateTime = entry.published_at;
    publishedAt.textContent = formatChangelogDate(entry.published_at);

    const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevron.classList.add("changelog-chevron");
    chevron.setAttribute("viewBox", "0 0 20 20");
    chevron.setAttribute("aria-hidden", "true");
    const chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    chevronPath.setAttribute("d", "m5 7.5 5 5 5-5");
    chevron.append(chevronPath);
    summary.append(marker, version, publishedAt, chevron);

    const body = document.createElement("div");
    body.className = "changelog-body";
    const list = document.createElement("ul");
    const localizedNotes = entry.notes?.[activeLanguage] || entry.notes?.en || [];
    localizedNotes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      list.append(item);
    });
    const metadata = document.createElement("div");
    metadata.className = "changelog-metadata";
    const updated = document.createElement("span");
    updated.className = "changelog-relative";
    updated.textContent = formatChangelogRelativeDate(entry.published_at);
    const commit = createChangelogCommitControl(entry);
    metadata.append(updated);
    if (commit) metadata.append(commit);
    body.append(list, metadata);
    details.append(summary, body);
    fragment.append(details);
  });

  elements.changelogList.replaceChildren(fragment);
  if (elements.changelogCount) {
    elements.changelogCount.textContent = t("history.count").replace("{count}", numberFormat().format(changelogEntries.length));
  }
  refreshAosMotion(elements.changelogList);
  window.requestAnimationFrame(snapshotLayoutRects);
}

async function loadChangelog() {
  if (!elements.changelogList) return;
  const response = await fetch(CHANGELOG_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Changelog request failed");
  const payload = await response.json();
  changelogEntries = Array.isArray(payload.entries) ? payload.entries : [];
  if (!changelogEntries.length) throw new Error("Changelog is empty");
  renderChangelog();
}

function createLegalTextBlock(entry) {
  const fragment = document.createDocumentFragment();
  const title = document.createElement("h3");
  title.textContent = entry?.title || "";
  const body = document.createElement("p");
  body.textContent = entry?.body || "";
  fragment.append(title, body);
  return fragment;
}

function createLegalReferences(references) {
  if (!Array.isArray(references) || references.length === 0) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "legal-references";
  wrapper.setAttribute("aria-label", t("legal.references.aria"));

  const heading = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = t("legal.references.title");
  heading.append(strong);

  const list = document.createElement("ul");
  references.forEach((reference) => {
    if (!reference?.label || !reference?.url) return;
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = reference.url;
    link.rel = "noopener";
    link.target = "_blank";
    link.textContent = reference.label;
    item.append(link);
    list.append(item);
  });

  wrapper.append(heading, list);
  return wrapper;
}

function renderLegalCard(card, titleText, entries, references = null) {
  if (!card || !Array.isArray(entries)) return;
  const title = document.createElement("h2");
  title.textContent = titleText;
  const children = [title];
  entries.forEach((entry) => children.push(createLegalTextBlock(entry)));
  const referenceList = createLegalReferences(references);
  if (referenceList) children.push(referenceList);
  card.replaceChildren(...children);
}

function formatLegalUpdatedDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return t("legal.updated");
  if (activeLanguage === "th") return `อัปเดตล่าสุด: ${raw}`;
  return `Last updated: ${raw}`;
}

function renderLegalDocument() {
  if (document.body.dataset.page !== "legal" || !legalDocument?.documents) return;
  const documentForLanguage = legalDocument.documents[activeLanguage] || legalDocument.documents.en;
  if (!documentForLanguage) return;

  setText(document.querySelector("[data-legal-title]"), documentForLanguage.title || t("legal.title"));
  setText(document.querySelector("[data-legal-intro]"), documentForLanguage.intro || t("legal.intro"));
  setText(
    document.querySelector("[data-legal-updated]"),
    formatLegalUpdatedDate(legalDocument.updatedAt || legalDocument.version)
  );

  const cards = document.querySelectorAll("[data-legal-grid] .legal-card");
  renderLegalCard(cards[0], t("legal.tos.title"), documentForLanguage.terms, legalDocument.references);
  renderLegalCard(cards[1], t("legal.privacy.title"), documentForLanguage.privacy);
  refreshAosMotion(document.querySelector("[data-legal-grid]") || document);
}

async function loadLegalDocument() {
  if (document.body.dataset.page !== "legal") return;
  const response = await fetch(LEGAL_DOCUMENT_URL, {
    cache: "no-store",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Legal document request failed");
  legalDocument = await response.json();
  renderLegalDocument();
}

function cleanDiscordText(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/<t:\d+:[tTdDfFR]>/g, "")
    .replace(/<a?:([a-zA-Z0-9_]+):\d+>/g, ":$1:")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function discordAssetExtension(hash) {
  return String(hash || "").startsWith("a_") ? "gif" : "png";
}

function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return "/assets/namlauncher-icon.png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${discordAssetExtension(user.avatar)}?size=256`;
}

function discordBannerUrl(user, profile) {
  if (!user?.id || !profile?.banner) return "";
  return `https://cdn.discordapp.com/banners/${user.id}/${profile.banner}.${discordAssetExtension(profile.banner)}?size=1024`;
}

function discordDecorationUrl(user) {
  const asset = user?.avatar_decoration_data?.asset;
  return asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=240&passthrough=true` : "";
}

function colorFromDiscordInt(value) {
  if (!Number.isFinite(Number(value))) return "";
  return `#${Number(value).toString(16).padStart(6, "0")}`;
}

function renderCreatorIdentity(profile) {
  if (!elements.creatorName || !profile) return;
  const user = profile.user || {};
  const userProfile = profile.user_profile || {};
  const displayName = cleanDiscordText(user.global_name || user.username || "Nattapat2871");
  const avatarUrl = discordAvatarUrl(user);
  const bannerUrl = discordBannerUrl(user, userProfile);
  const decorationUrl = discordDecorationUrl(user);

  setText(elements.creatorName, displayName);
  setText(elements.creatorUsername, `@${user.username || "nattapat2871"}`);
  if (elements.creatorAvatar) {
    elements.creatorAvatar.src = avatarUrl;
    elements.creatorAvatar.alt = displayName;
  }
  if (elements.creatorDecoration) {
    elements.creatorDecoration.src = decorationUrl;
    elements.creatorDecoration.hidden = !decorationUrl;
  }
  if (elements.creatorBanner) {
    const accent = colorFromDiscordInt(userProfile.accent_color) || "#13233b";
    elements.creatorBanner.style.backgroundColor = accent;
    elements.creatorBanner.style.backgroundImage = bannerUrl
      ? `linear-gradient(180deg, transparent 48%, rgba(7, 16, 29, 0.78)), url("${bannerUrl}")`
      : "";
  }

  const nameColors = (user.display_name_styles?.colors || []).map(colorFromDiscordInt).filter(Boolean);
  elements.creatorName.style.background = "";
  elements.creatorName.style.backgroundClip = "";
  elements.creatorName.style.webkitBackgroundClip = "";
  elements.creatorName.style.color = "";
  if (nameColors.length > 1) {
    elements.creatorName.style.background = `linear-gradient(90deg, ${nameColors.join(", ")})`;
    elements.creatorName.style.backgroundClip = "text";
    elements.creatorName.style.webkitBackgroundClip = "text";
    elements.creatorName.style.color = "transparent";
  } else if (nameColors.length === 1) {
    elements.creatorName.style.color = nameColors[0];
  }
}

function externalActivityAssetUrl(rawAsset) {
  const asset = String(rawAsset || "");
  if (!asset) return "";
  if (/^https?:\/\//i.test(asset)) return asset;
  if (asset.startsWith("spotify:")) return `https://i.scdn.co/image/${asset.slice(8)}`;
  if (asset.startsWith("mp:external/")) {
    const httpsIndex = asset.indexOf("/https/");
    const httpIndex = asset.indexOf("/http/");
    if (httpsIndex >= 0) return `https://${asset.slice(httpsIndex + 7)}`;
    if (httpIndex >= 0) return `http://${asset.slice(httpIndex + 6)}`;
  }
  return "";
}

function activityImageUrl(activity) {
  const asset = activity?.assets?.large_image || activity?.assets?.small_image;
  const external = externalActivityAssetUrl(asset);
  if (external) return external;
  if (asset && activity?.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
  }
  if (String(activity?.name || "").toLowerCase().includes("minecraft")) {
    return "https://cdn.discordapp.com/app-icons/1402418491272986635/166fbad351ecdd02d11a3b464748f66b.png?size=128";
  }
  return "/assets/namlauncher-icon.png";
}

function formatActivityDuration(rawTimestamp) {
  const timestamp = Number(rawTimestamp || 0);
  if (!timestamp) return "";
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 60) return activeLanguage === "th" ? "ไม่ถึง 1 นาที" : "less than a minute";
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  if (hours > 0) return activeLanguage === "th" ? `${hours} ชม. ${minutes} นาที` : `${hours}h ${minutes}m`;
  return activeLanguage === "th" ? `${minutes} นาที` : `${minutes}m`;
}

function activityTypeKey(type) {
  return ["playing", "streaming", "listening", "watching", "status", "competing"][Number(type)] || "status";
}

function activityTypeIcon(type) {
  return ["▶", "↗", "♪", "◉", "●", "★"][Number(type)] || "●";
}

function createActivityItem(activity) {
  const item = document.createElement("article");
  item.className = "activity-item";

  const icon = document.createElement("span");
  icon.className = "activity-icon";
  const iconImage = document.createElement("img");
  iconImage.src = activityImageUrl(activity);
  iconImage.alt = "";
  let usedFallbackIcon = false;
  iconImage.addEventListener("error", () => {
    if (!usedFallbackIcon) {
      usedFallbackIcon = true;
      iconImage.src = "/assets/namlauncher-icon.png";
      return;
    }
    iconImage.remove();
    icon.textContent = activityTypeIcon(activity.type);
  });
  icon.append(iconImage);

  const content = document.createElement("div");
  content.className = "activity-content";

  const type = document.createElement("span");
  type.className = "activity-type";
  type.textContent = t(`developer.activity.type.${activityTypeKey(activity.type)}`);

  const name = document.createElement("strong");
  name.className = "activity-name";
  name.textContent = cleanDiscordText(activity.name) || type.textContent;

  const detailParts = [];
  const details = cleanDiscordText(activity.details);
  const state = cleanDiscordText(activity.state);
  if (details && details !== name.textContent) detailParts.push(details);
  if (state && state !== name.textContent && state !== details) detailParts.push(state);
  const elapsed = formatActivityDuration(activity.timestamps?.start || activity.created_at);
  if (elapsed) detailParts.push(t("developer.activity.elapsed").replace("{time}", elapsed));

  content.append(type, name);
  if (detailParts.length > 0) {
    const detail = document.createElement("span");
    detail.className = "activity-detail";
    detail.textContent = detailParts.join(" · ");
    content.append(detail);
  }

  item.append(icon, content);
  return item;
}

// A presence frame is a complete snapshot, not an activity history. Keep one
// latest entry per application; activity start time is NOT a freshness timeout.
function normalizeDeveloperActivities(profile) {
  if (profile.discord_status === "offline" || !Array.isArray(profile.activities)) return [];
  const latest = new Map();
  const timestamp = (value) => {
    const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
    if (!Number.isFinite(number) || number <= 0) return 0;
    return number < 100_000_000_000 ? number * 1000 : number;
  };
  for (const activity of profile.activities.slice(0, 100)) {
    if (!activity || typeof activity !== "object" || Array.isArray(activity)) continue;
    const type = Number(activity.type);
    if (![0, 1, 2, 3, 5].includes(type) || activity.id === "custom") continue;
    const name = cleanDiscordText(activity.name);
    const state = cleanDiscordText(activity.state);
    if (!name && !state) continue;
    const application = typeof activity.application_id === "string" ? activity.application_id.trim() : "";
    const key = /^\d{1,24}$/.test(application)
      ? `app:${application}`
      : `name:${type}:${(name || state).toLowerCase()}`;
    const started = timestamp(activity.timestamps?.start);
    const created = timestamp(activity.created_at) || started;
    const previous = latest.get(key);
    if (!previous || created > previous.created || (created === previous.created && started >= previous.started)) {
      latest.set(key, { activity, created, started });
    }
  }
  return [...latest.values()].sort((left, right) => right.created - left.created)
    .slice(0, 3).map(({ activity }) => activity);
}

function renderDeveloperActivity(profile) {
  if (!profile || !elements.developerActivities || !elements.developerPresence) return;

  renderCreatorIdentity(profile);
  const rawStatus = profile.discord_status || "offline";
  const status = ["online", "idle", "dnd", "offline"].includes(rawStatus) ? rawStatus : "offline";
  const statusText = t(`developer.status.${status}`);
  elements.developerPresence.className = `presence-pill is-${status}`;
  elements.developerPresence.setAttribute("aria-label", statusText);
  elements.developerPresence.querySelector("span").textContent = statusText;

  const platforms = [
    ["desktop", profile.active_on_discord_desktop],
    ["web", profile.active_on_discord_web],
    ["mobile", profile.active_on_discord_mobile]
  ].filter(([, active]) => active);
  elements.developerPlatforms.replaceChildren();
  platforms.forEach(([platform]) => {
    const badge = document.createElement("span");
    badge.textContent = t(`developer.activity.platform.${platform}`);
    elements.developerPlatforms.append(badge);
  });
  elements.developerPlatforms.hidden = platforms.length === 0;

  const activities = normalizeDeveloperActivities(profile);
  elements.developerActivities.replaceChildren();
  if (activities.length === 0) {
    const empty = document.createElement("div");
    empty.className = "activity-empty";
    empty.textContent = t("developer.activity.empty");
    elements.developerActivities.append(empty);
  } else {
    activities.forEach((activity) => {
      elements.developerActivities.append(createActivityItem(activity));
    });
  }
  elements.activityCard?.setAttribute("aria-busy", "false");
  refreshAosMotion(elements.developerActivities);
}

function renderDeveloperActivityUnavailable(state = "unavailable") {
  if (!elements.developerActivities || !elements.developerPresence) return;
  elements.developerPresence.className = "presence-pill is-offline";
  const statusText = t(`developer.status.${state}`);
  elements.developerPresence.querySelector("span").textContent = statusText;
  elements.developerPresence.setAttribute("aria-label", statusText);
  const empty = document.createElement("div");
  empty.className = "activity-empty";
  empty.textContent = t(`developer.activity.${state}`);
  elements.developerActivities.replaceChildren(empty);
  if (elements.developerPlatforms) {
    elements.developerPlatforms.replaceChildren();
    elements.developerPlatforms.hidden = true;
  }
  elements.activityCard?.setAttribute("aria-busy", "false");
  refreshAosMotion(elements.developerActivities);
}

function detectDesktopPlatform() {
  const platform = String(navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
  const userAgent = String(navigator.userAgent || "").toLowerCase();
  if (/android|iphone|ipad|ipod/.test(userAgent)) return "unknown";
  if (platform.includes("win")) return "windows";
  if (platform.includes("mac")) return "macos";
  if (platform.includes("linux") || platform.includes("x11")) return "linux";
  if (userAgent.includes("windows")) return "windows";
  if (userAgent.includes("macintosh")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return "unknown";
}

function releaseArtifacts() {
  return Array.isArray(latestRelease?.artifacts) ? latestRelease.artifacts : [];
}

function artifactById(id) {
  return releaseArtifacts().find((artifact) => artifact.id === id) || null;
}

function preferredArtifact() {
  const platform = detectDesktopPlatform();
  if (platform === "windows") return artifactById("windows-x64");
  if (platform === "macos") return artifactById("macos-universal");
  if (platform === "linux") {
    return artifactById("linux-appimage-x64")
      || releaseArtifacts().find((artifact) => artifact.platform === "linux" && artifact.available)
      || null;
  }
  return null;
}

function downloadDetailKey(artifact) {
  if (artifact.id === "windows-x64") return "download.windows.detail";
  if (artifact.id === "macos-universal") return "download.macos.detail";
  if (artifact.id === "linux-deb-x64") return "download.linux.deb.detail";
  if (artifact.id === "linux-rpm-x64") return "download.linux.rpm.detail";
  if (artifact.id === "linux-flatpak-x64") return "download.linux.flatpak.detail";
  if (artifact.id === "linux-arch-x64") return "download.linux.arch.detail";
  return "download.linux.appimage.detail";
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function appendSvgNode(svg, name, attributes) {
  const node = document.createElementNS(SVG_NAMESPACE, name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  svg.append(node);
}

function createPlatformSvg(platform) {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.classList.add("platform-svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  if (platform === "windows") {
    appendSvgNode(svg, "path", {
      d: "M3 4.5 10.5 3.5V11H3V4.5Zm8.5-1.15L21 2v9h-9.5V3.35ZM3 12h7.5v7.5L3 18.5V12Zm8.5 0H21v10l-9.5-1.35V12Z",
      fill: "currentColor"
    });
  } else if (platform === "macos") {
    appendSvgNode(svg, "path", {
      d: "M16.8 12.1c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3-1.9-3.7-1.9-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.8 1.3 10.3.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2.1.8 3.5.8c1.5 0 2.4-1.3 3.2-2.6 1-1.5 1.4-3 1.4-3.1-.1 0-3.2-1.2-3.2-4Zm-2.5-7.4c.7-.9 1.2-2.1 1-3.2-1.1 0-2.4.7-3.2 1.6-.7.8-1.3 2-1.1 3.1 1.2.3 2.5-.6 3.3-1.5Z",
      fill: "currentColor"
    });
  } else if (platform === "linux") {
    appendSvgNode(svg, "rect", {
      x: "3", y: "4", width: "18", height: "16", rx: "2.5",
      fill: "none", stroke: "currentColor", "stroke-width": "1.8"
    });
    appendSvgNode(svg, "path", {
      d: "m7 9 3 3-3 3m6 0h4",
      fill: "none", stroke: "currentColor", "stroke-width": "1.8",
      "stroke-linecap": "round", "stroke-linejoin": "round"
    });
  } else {
    appendSvgNode(svg, "path", {
      d: "M12 3v11m0 0 4-4m-4 4-4-4M5 19h14",
      fill: "none", stroke: "currentColor", "stroke-width": "2",
      "stroke-linecap": "round", "stroke-linejoin": "round"
    });
  }

  return svg;
}

function renderPlatformSvg(container, platform) {
  if (container) container.replaceChildren(createPlatformSvg(platform));
}

function createDownloadMenuItem(artifact) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "download-menu-item";
  button.setAttribute("role", "menuitem");
  button.disabled = !artifact.available || !artifact.url;
  button.dataset.artifactId = artifact.id;
  if (artifact.status_message) {
    button.title = artifact.status_message;
  } else if (artifact.platform === "macos" && artifact.available) {
    button.title = t("download.macos.warning");
  }

  const icon = document.createElement("span");
  icon.className = `download-platform-icon is-${artifact.platform}`;
  icon.setAttribute("aria-hidden", "true");
  renderPlatformSvg(icon, artifact.platform);

  const copy = document.createElement("span");
  copy.className = "download-menu-copy";
  const label = document.createElement("strong");
  label.textContent = artifact.label;
  const detail = document.createElement("small");
  detail.textContent = artifact.available
    ? t(downloadDetailKey(artifact))
    : artifact.platform === "macos"
      ? t("download.macos.unavailable")
      : t("download.unavailable");
  copy.append(label, detail);

  button.append(icon, copy);
  if (artifact.recommended && artifact.available) {
    const badge = document.createElement("span");
    badge.className = "download-recommended";
    badge.textContent = activeLanguage === "th" ? "แนะนำ" : "Recommended";
    button.append(badge);
  }
  button.addEventListener("click", () => startArtifactDownload(artifact, button));
  return button;
}

function renderDownloadMenu(menu) {
  if (!latestRelease) {
    const loading = document.createElement("p");
    loading.className = "download-menu-loading";
    loading.textContent = t("actions.loadingDownloads");
    menu.replaceChildren(loading);
    return;
  }

  const order = [
    "windows-x64",
    "macos-universal",
    "linux-appimage-x64",
    "linux-deb-x64",
    "linux-rpm-x64",
    "linux-flatpak-x64",
    "linux-arch-x64"
  ];
  const fragment = document.createDocumentFragment();
  order.forEach((id, index) => {
    const artifact = artifactById(id);
    if (!artifact) return;
    if (index === 2) {
      const heading = document.createElement("p");
      heading.className = "download-menu-heading";
      heading.textContent = t("download.linux.heading");
      fragment.append(heading);
    }
    fragment.append(createDownloadMenuItem(artifact));
  });
  menu.replaceChildren(fragment);
}

function renderDownloadPickers() {
  const platform = detectDesktopPlatform();
  const artifact = preferredArtifact();
  const labelKey = platform === "windows"
    ? "actions.downloadWindows"
    : platform === "linux"
      ? "actions.downloadLinux"
      : platform === "macos"
        ? artifact?.available
          ? "actions.downloadMacos"
          : "actions.macosUnavailable"
        : "actions.chooseDownload";

  elements.primaryDownloadButtons.forEach((button) => {
    const label = button.querySelector("[data-primary-download-label]");
    const icon = button.querySelector(".download-button-icon");
    setText(label, latestRelease ? t(labelKey) : t("actions.loadingDownloads"));
    renderPlatformSvg(icon, ["windows", "macos", "linux"].includes(platform) ? platform : "download");
    button.dataset.artifactId = artifact?.id || "";
    button.disabled = !artifact?.available || !artifact?.url;
    button.title = artifact?.status_message
      || (platform === "macos" && artifact?.available ? t("download.macos.warning") : "");
    button.classList.toggle("is-coming-soon", platform === "macos" && !artifact?.available);
  });
  elements.downloadMenus.forEach(renderDownloadMenu);
  const macosArtifact = artifactById("macos-universal");
  const integrityAvailable = Boolean(
    macosArtifact?.available
      && macosArtifact?.checksum_algorithm === "SHA-256"
      && macosArtifact?.checksum_url
  );
  elements.macosIntegrityBlocks.forEach((block) => {
    block.hidden = !integrityAvailable;
  });
  elements.macosChecksumLinks.forEach((link) => {
    if (integrityAvailable) link.href = macosArtifact.checksum_url;
    else link.href = "/#download";
  });
}

function supportsPopover(menu) {
  return typeof menu?.showPopover === "function" && typeof menu?.hidePopover === "function";
}

function positionDownloadMenu(picker, menu) {
  const anchor = picker?.querySelector("[data-download-menu-toggle]");
  if (!anchor || !menu) return;

  const gutter = 16;
  const gap = 12;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const anchorRect = anchor.getBoundingClientRect();
  const width = Math.min(390, viewportWidth - gutter * 2);
  const below = Math.max(0, viewportHeight - anchorRect.bottom - gap - gutter);
  const above = Math.max(0, anchorRect.top - gap - gutter);
  const naturalHeight = Math.min(menu.scrollHeight, viewportHeight - gutter * 2);
  const openAbove = below < naturalHeight && above > below;
  const availableHeight = Math.max(120, openAbove ? above : below);
  const renderedHeight = Math.min(naturalHeight, availableHeight);
  const left = Math.min(
    Math.max(gutter, anchorRect.right - width),
    viewportWidth - width - gutter
  );
  const top = openAbove
    ? Math.max(gutter, anchorRect.top - gap - renderedHeight)
    : Math.min(anchorRect.bottom + gap, viewportHeight - gutter - renderedHeight);

  menu.style.width = `${width}px`;
  menu.style.maxHeight = `${availableHeight}px`;
  menu.style.left = `${left}px`;
  menu.style.top = `${Math.max(gutter, top)}px`;
}

function showDownloadMenu(picker, menu) {
  menu.hidden = false;
  if (supportsPopover(menu)) {
    try {
      menu.showPopover();
    } catch (error) {
      // The fixed-position fallback below remains usable on partial implementations.
    }
  }
  positionDownloadMenu(picker, menu);
}

function hideDownloadMenu(menu) {
  if (!menu) return;
  if (supportsPopover(menu)) {
    try {
      menu.hidePopover();
    } catch (error) {
      // It is safe to continue when the popover was already closed.
    }
  }
  menu.hidden = true;
}

function closeDownloadMenus(exceptPicker = null) {
  elements.downloadPickers.forEach((picker) => {
    if (picker === exceptPicker) return;
    const toggle = picker.querySelector("[data-download-menu-toggle]");
    const menu = picker.querySelector("[data-download-menu]");
    if (menu?.contains(document.activeElement)) toggle?.focus({ preventScroll: true });
    toggle?.setAttribute("aria-expanded", "false");
    picker.classList.remove("is-open");
    hideDownloadMenu(menu);
  });
}

function renderStats(stats) {
  const format = numberFormat();
  const downloads = Number(stats.downloads || 0);
  const online = Number(stats.online_players || 0);
  const version = stats.launcher_version || "1.2.3";

  setText(elements.downloadsCount, format.format(downloads));
  setText(elements.onlineCount, format.format(online));
  setText(elements.releaseVersion, version);
  setText(elements.heroVersion, version);
  if (stats.download_url) latestDownloadUrl = stats.download_url;
}

function renderPageStats(stats) {
  const format = numberFormat();
  setText(elements.pageViewsCount, format.format(Number(stats.view_count || 0)));
  setText(elements.downloadsCount, format.format(Number(stats.like_count || 0)));
}

async function loadStats() {
  const response = await fetch("/api/stats", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Stats request failed");
  const stats = await response.json();
  renderStats(stats);
}

async function loadRelease() {
  const response = await fetch("/api/releases/latest", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Release request failed");
  latestRelease = await response.json();
  if (latestRelease.download_url) latestDownloadUrl = latestRelease.download_url;
  renderDownloadPickers();
}

async function loadPageStats() {
  const response = await fetch(`${AME_API_BASE}/api/page-stats?site=${encodeURIComponent(pageStatsSite)}`, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Page stats request failed");
  renderPageStats(await response.json());
}

async function recordPageViewOnce() {
  const key = `namlauncher:view:${pageStatsSite}`;
  const lastViewed = Number(localStorage.getItem(key) || 0);
  if (Date.now() - lastViewed < VIEW_COOLDOWN_MS) return;

  const response = await fetch(`${AME_API_BASE}/api/view?site=${encodeURIComponent(pageStatsSite)}`, {
    method: "POST",
    headers: { Accept: "application/json" }
  });
  if (response.ok) {
    localStorage.setItem(key, String(Date.now()));
    renderPageStats(await response.json());
  }
}

async function refreshLiveNumbers({ recordView = false } = {}) {
  const tasks = [
    loadStats(),
    loadPageStats()
  ];
  if (recordView) tasks.push(recordPageViewOnce());
  const [statsResult] = await Promise.allSettled(tasks);
  if (statsResult.status === "rejected") {
    setStatusKey("status.statsOffline", true);
  }
}

function extractDeveloperProfile(payload) {
  const candidates = [payload?.ame, payload?.data?.ame, payload?.data, payload];
  return candidates.find((candidate) => (
    candidate
    && typeof candidate === "object"
    && !Array.isArray(candidate)
    && Array.isArray(candidate.activities)
    && ["online", "idle", "dnd", "offline"].includes(candidate.discord_status)
  )) || null;
}

// AME /ws/v1/user/{id} sends a full JSON snapshot on connect and on changes.
// No invented application heartbeat and no REST polling may overwrite it.
function createDeveloperActivityConnection({
  url, onProfile, onUnavailable, WebSocketImpl = globalThis.WebSocket,
  setTimer = globalThis.setTimeout, clearTimer = globalThis.clearTimeout,
  random = Math.random, isOnline = () => navigator.onLine !== false
}) {
  let socket = null;
  let retry = null;
  let initialSnapshotTimer = null;
  let stopped = true;
  let failures = 0;

  const clearTimers = () => {
    clearTimer(retry);
    clearTimer(initialSnapshotTimer);
    retry = initialSnapshotTimer = null;
  };
  const disconnect = () => {
    const previous = socket;
    socket = null;
    try { previous?.close(); } catch { /* Closing is best-effort; old callbacks are fenced. */ }
  };
  const scheduleRetry = () => {
    if (stopped || !isOnline() || retry !== null) return;
    const delay = Math.min(30_000, 1000 * (2 ** Math.min(failures++, 5))) + Math.floor(random() * 500);
    retry = setTimer(() => { retry = null; connect(); }, delay);
  };
  const unavailable = () => {
    clearTimer(initialSnapshotTimer);
    initialSnapshotTimer = null;
    disconnect();
    onUnavailable("unavailable");
    scheduleRetry();
  };
  const connect = () => {
    if (stopped || socket) return;
    if (!isOnline() || typeof WebSocketImpl !== "function") {
      onUnavailable("unavailable");
      return;
    }
    onUnavailable("connecting");
    let active;
    try { active = socket = new WebSocketImpl(url); }
    catch { unavailable(); return; }
    initialSnapshotTimer = setTimer(() => { if (socket === active) unavailable(); }, 10_000);
    active.addEventListener("message", (event) => {
      if (stopped || socket !== active) return;
      try {
        if (typeof event.data !== "string" || event.data.length > 1024 * 1024) throw new Error("Invalid presence frame");
        const profile = extractDeveloperProfile(JSON.parse(event.data));
        if (!profile) throw new Error("Invalid presence snapshot");
        clearTimer(initialSnapshotTimer);
        initialSnapshotTimer = null;
        failures = 0;
        onProfile(profile);
      } catch { unavailable(); }
    });
    const onDisconnected = () => { if (!stopped && socket === active) unavailable(); };
    active.addEventListener("close", onDisconnected);
    active.addEventListener("error", onDisconnected);
  };
  return {
    start() { stopped = false; if (!socket && retry === null) connect(); },
    stop() { stopped = true; clearTimers(); disconnect(); onUnavailable("unavailable"); },
    reconnect() { stopped = false; clearTimers(); disconnect(); connect(); }
  };
}

function connectDeveloperActivitySocket() {
  if (!elements.developerActivities) return;
  if (!developerActivityConnection) {
    developerActivityConnection = createDeveloperActivityConnection({
      url: DEVELOPER_WS_URL,
      onProfile(profile) { currentDeveloperProfile = profile; renderDeveloperActivity(profile); },
      onUnavailable(state) { currentDeveloperProfile = null; renderDeveloperActivityUnavailable(state); }
    });
  }
  developerActivityConnection.start();
}

async function recordDownload(artifact) {
  const response = await fetch("/api/downloads", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ channel: artifact?.id || artifact?.platform || "unknown" })
  });

  if (!response.ok) {
    throw new Error("Download counter request failed");
  }

  const stats = await response.json();
  renderStats(stats);
}

async function startArtifactDownload(artifact, button) {
  if (!artifact?.available || !artifact?.url) {
    setStatusKey("status.downloadUnavailable", true);
    return;
  }
  closeDownloadMenus();
  const originalDisabled = button.disabled;
  setStatusKey("status.startingDownload");
  button.disabled = true;

  try {
    await recordDownload(artifact).catch(() => undefined);
    if (!artifact.url) throw new Error("Missing download URL");
    setStatusKey(artifact.platform === "macos" ? "status.openingUnsignedDmg" : "status.openingInstaller");
    window.location.href = artifact.url;
  } catch (error) {
    setStatusKey("status.downloadUnavailable", true);
    button.disabled = originalDisabled;
    return;
  }

  window.setTimeout(() => {
    button.disabled = originalDisabled;
  }, 1600);
}

function handlePrimaryDownload(event) {
  const button = event.currentTarget;
  const artifact = artifactById(button.dataset.artifactId);
  if (artifact) startArtifactDownload(artifact, button);
}

function setMobileNavigation(open, restoreFocus = false) {
  const toggle = elements.mobileMenuToggle;
  const header = elements.siteHeader;
  if (!toggle || !header) return;
  header.classList.toggle("is-menu-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", t(open ? "nav.close" : "nav.open"));
  if (!open && restoreFocus) toggle.focus({ preventScroll: true });
}

function updateBackToTop() {
  const button = elements.backToTop;
  if (!button) return;
  const visible = window.scrollY > Math.max(480, window.innerHeight * 0.7);
  button.classList.toggle("is-visible", visible);
  button.setAttribute("aria-hidden", visible ? "false" : "true");
  button.tabIndex = visible ? 0 : -1;
}

function bindEvents() {
  elements.themeToggle?.addEventListener("click", () => {
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    localStorage.setItem("namlauncher-theme", nextTheme);
    applyTheme(nextTheme);
  });

  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.addEventListener("click", () => {
      activeLanguage = button.dataset.langOption || "en";
      localStorage.setItem("namlauncher-language", activeLanguage);
      applyTranslations();
      updateThemeToggle();
      refreshLiveNumbers().catch(() => setStatusKey("status.statsOffline", true));
    });
  });

  elements.primaryDownloadButtons.forEach((button) => {
    button.addEventListener("click", handlePrimaryDownload);
  });

  elements.mobileMenuToggle?.addEventListener("click", () => {
    const open = elements.mobileMenuToggle.getAttribute("aria-expanded") !== "true";
    setMobileNavigation(open);
  });
  elements.siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileNavigation(false));
  });
  elements.backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  elements.downloadMenuToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const picker = toggle.closest("[data-download-picker]");
      const menu = picker?.querySelector("[data-download-menu]");
      if (!picker || !menu) return;
      const opening = toggle.getAttribute("aria-expanded") !== "true";
      closeDownloadMenus(opening ? picker : null);
      toggle.setAttribute("aria-expanded", opening ? "true" : "false");
      picker.classList.toggle("is-open", opening);
      if (opening) {
        showDownloadMenu(picker, menu);
        menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
      } else {
        hideDownloadMenu(menu);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest?.("[data-download-picker]")) closeDownloadMenus();
    if (elements.siteHeader && !elements.siteHeader.contains(event.target)) setMobileNavigation(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDownloadMenus();
      if (elements.mobileMenuToggle?.getAttribute("aria-expanded") === "true") {
        setMobileNavigation(false, true);
      }
    }
  });
  window.addEventListener("resize", () => {
    closeDownloadMenus();
    if (window.innerWidth > 920) setMobileNavigation(false);
    updateBackToTop();
    scheduleResponsiveLayoutMotion();
  });
  let scrollFrame = 0;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      elements.downloadPickers.forEach((picker) => {
        const toggle = picker.querySelector("[data-download-menu-toggle]");
        const menu = picker.querySelector("[data-download-menu]");
        if (toggle?.getAttribute("aria-expanded") === "true" && menu && !menu.hidden) {
          positionDownloadMenu(picker, menu);
        }
      });
      updateBackToTop();
      scrollFrame = 0;
    });
  }, { passive: true });
  updateBackToTop();
}

const MOTION_TARGET_SELECTOR = [
  ".site-header", ".release-line", ".hero-logo", ".hero h1", ".hero-text", ".hero-actions", ".hero-metrics",
  ".section-heading", ".feature-card", ".latest-copy", ".library-demo", ".upgrade-card", ".instance-showcase",
  ".screenshot-frame", ".creator-card", ".activity-card", ".partner-card", ".changelog-entry", ".history-hero > *", ".download-section > *", ".legal-card",
  ".install-hero > *", ".platform-jump", ".install-platform", ".linux-package", ".install-help"
].join(",");

const MOTION_RULES = [
  [".site-header, .release-line", "fade-down"],
  [".history-back, .history-hero .eyebrow, .install-hero .eyebrow, .platform-jump", "fade-down"],
  [".latest-copy, .creator-card, .legal-card:first-child", "fade-right"],
  [".library-demo, .activity-card, .legal-card:last-child", "fade-left"],
  [".hero-logo", "zoom-in"],
  [".hero h1, .hero-text, .hero-actions, .hero-metrics", "zoom-in-up"]
];

const CRITICAL_MOTION_SELECTOR = ".site-header, .release-line, .hero-logo, .hero h1, .hero-text, .hero-actions, .hero-metrics, .install-hero > *, .platform-jump";
const LAYOUT_MOTION_SELECTOR = [
  ".site-header", ".site-nav", ".hero-inner", ".hero-metrics", ".feature-grid", ".latest-showcase",
  ".upgrade-grid", ".changelog-timeline", ".instance-showcase", ".screenshot-grid", ".creator-layout", ".partner-grid",
  ".download-section", ".legal-grid", ".history-board", ".platform-jump", ".install-platform", ".linux-package-grid", ".install-help"
].join(",");

function motionFor(element) {
  return MOTION_RULES.find(([selector]) => element.matches(selector))?.[1] || "fade-up";
}

function motionDelayFor(element) {
  const parent = element.parentElement;
  if (!parent || element.matches(".site-header")) return 0;
  const peers = Array.from(parent.children).filter((child) => child.matches?.(MOTION_TARGET_SELECTOR));
  return Math.min(Math.max(peers.indexOf(element), 0), 4) * 70;
}

function decorateMotionElements(root = document) {
  const targets = [];
  if (root instanceof Element && root.matches(MOTION_TARGET_SELECTOR)) targets.push(root);
  targets.push(...root.querySelectorAll(MOTION_TARGET_SELECTOR));
  targets.forEach((target) => {
    if (target.dataset.motion) return;
    target.dataset.motion = motionFor(target);
    if (target.matches(CRITICAL_MOTION_SELECTOR)) target.dataset.motionCritical = "true";
    target.style.setProperty("--motion-delay", `${motionDelayFor(target)}ms`);
  });
  return targets;
}

function refreshAosMotion(root = document) {
  decorateMotionElements(root).forEach((target) => {
    if (motionObserver) motionObserver.observe(target);
    else target.classList.add("is-visible");
  });
}

function isNearViewport(element, margin = 48) {
  const rect = element.getBoundingClientRect();
  return rect.bottom >= -margin && rect.top <= window.innerHeight + margin;
}

function snapshotLayoutRects() {
  document.querySelectorAll(LAYOUT_MOTION_SELECTOR).forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      layoutMotionRects.set(element, {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      });
    }
  });
}

function animateResponsiveLayout() {
  layoutMotionFrame = 0;
  document.querySelectorAll(LAYOUT_MOTION_SELECTOR).forEach((element) => {
    const previous = layoutMotionRects.get(element);
    layoutMotionAnimations.get(element)?.cancel();
    const currentRect = element.getBoundingClientRect();
    const current = {
      left: currentRect.left + window.scrollX,
      top: currentRect.top + window.scrollY,
      width: currentRect.width,
      height: currentRect.height
    };
    layoutMotionRects.set(element, current);
    if (!previous || !isNearViewport(element, 180) || current.width <= 0 || current.height <= 0) return;

    const deltaX = previous.left - current.left;
    const deltaY = previous.top - current.top;
    const scaleX = previous.width / current.width;
    const scaleY = previous.height / current.height;
    const changed = Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5 || Math.abs(1 - scaleX) > 0.01 || Math.abs(1 - scaleY) > 0.01;
    if (!changed || typeof element.animate !== "function") return;

    const animation = element.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left"
        },
        { transform: "translate3d(0, 0, 0) scale(1, 1)", transformOrigin: "top left" }
      ],
      { duration: 440, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
    layoutMotionAnimations.set(element, animation);
  });

  window.clearTimeout(layoutMotionTimer);
  layoutMotionTimer = window.setTimeout(snapshotLayoutRects, 480);
}

function scheduleResponsiveLayoutMotion() {
  window.clearTimeout(resizeMotionTimer);
  resizeMotionTimer = window.setTimeout(() => {
    if (layoutMotionFrame) window.cancelAnimationFrame(layoutMotionFrame);
    layoutMotionFrame = window.requestAnimationFrame(animateResponsiveLayout);
  }, 72);
}

function setupMotion() {
  const targets = decorateMotionElements();
  const reduceMotion = !FORCE_RICH_MOTION && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion-ready");
  if (FORCE_RICH_MOTION) document.documentElement.classList.add("motion-force");
  if (reduceMotion) document.documentElement.classList.add("motion-reduced");

  const reveal = (target) => {
    target.classList.add("is-visible");
    if (reduceMotion && typeof target.animate === "function") {
      target.animate(
        [
          { opacity: 0, transform: "translate3d(0, 8px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" }
        ],
        { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }
  };

  if (typeof IntersectionObserver === "undefined") {
    window.requestAnimationFrame(() => targets.forEach(reveal));
    return;
  }

  const revealInitialViewport = () => {
    targets.forEach((target) => {
      if (isNearViewport(target)) reveal(target);
    });
  };

  const revealCriticalTargets = () => {
    targets.forEach((target) => {
      if (target.matches(CRITICAL_MOTION_SELECTOR)) reveal(target);
    });
  };

  motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      motionObserver?.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
  targets.forEach((target) => motionObserver.observe(target));
  window.requestAnimationFrame(revealInitialViewport);
  window.setTimeout(revealInitialViewport, 350);
  window.setTimeout(revealCriticalTargets, 900);
  window.requestAnimationFrame(snapshotLayoutRects);
}

function init() {
  applyTheme();
  applyTranslations();
  refreshLiveNumbers({ recordView: true }).catch(() => setStatusKey("status.statsOffline", true));
  bindEvents();
  setupMotion();

  loadRelease().catch(() => {
    latestRelease = { artifacts: [] };
    renderDownloadPickers();
  });
  loadChangelog().catch(renderChangelogError);
  loadLegalDocument().catch(() => {});
  connectDeveloperActivitySocket();
}

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("pagehide", () => {
  motionObserver?.disconnect();
  window.cancelAnimationFrame(layoutMotionFrame);
  window.clearTimeout(layoutMotionTimer);
  window.clearTimeout(resizeMotionTimer);
  developerActivityConnection?.stop();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) connectDeveloperActivitySocket();
});
window.addEventListener("offline", () => developerActivityConnection?.stop());
window.addEventListener("online", () => developerActivityConnection?.reconnect());
