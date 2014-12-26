/*
We are removing browser version detection as been optional
We are going to force it by default to prevent users installing a version not
Designed for the browser version there using.

pref("extensions.language_manager.versiondetection", false);
*/

pref("extensions.language_manager.firefoxfirstrun", false);
pref("extensions.language_manager.browser_mode", "cyberfoxmode");