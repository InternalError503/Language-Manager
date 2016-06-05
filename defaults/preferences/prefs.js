/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Browser mode will auto set when language manager is run.
pref("extensions.language_manager.browser_mode", "");
/*
- default
- basic date (basicdate)
- time date (timedate)
*/
pref("extensions.language_manager.time-date_mode", "default");

// Set language manager browser menu items.
pref("extensions.language_manager.showinmenu", true);

// On addon first run.
pref("extensions.language_manager.firstrun", false);

/*
On addon first run add toolbar button to area*
- default (Customize Pallet)
- toolbar (nav-bar)
- panel_menu (panel UI menu)
*/
pref("extensions.language_manager.addbuttontoarea", "default");