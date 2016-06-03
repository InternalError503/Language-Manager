/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
(function(global) {
const {utils: Cu} = Components;

// Import services
var {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

// Import customize UI
var {CustomizableUI} = Cu.import("resource:///modules/CustomizableUI.jsm", {});
	
// Get string sets to localized content.
var bundleFirstrunWindow = Services.strings.createBundle("chrome://LanguageManager/locale/firstrun.properties");

var gLanguageMangerFirstrun = {

init: function(){

try{

	// Localise Content
	
	// Get all the elements by there id's
	var contentElement = {
		// Top navigation bar
		navBarTitle: document.getElementById("NavTitle"),
		navBarSupport: document.getElementById("NavSupport"),
		navBarContact: document.getElementById("NavContact"),					
		// Panel label
		FirstrunPanelTitle: document.getElementById("FirstrunPanel"),
		// Copyright message.
		CopyrightLabel: document.getElementById("labelCopy"),
		// Select where to add toolbar button to area.
		FirstrunAddToolbarButtonToArea: document.getElementById("AddToolbarButtonToArea"),
		FirstrunAddToolbarButtonToAreaDefault: document.getElementById("defaultFormat"),		
		FirstrunButtonAreaMenuDefault: document.getElementById("ButtonAreaMenuDefault"),
		FirstrunButtonAreaMenuToolbar: document.getElementById("ButtonAreaMenuToolbar"),
		FirstrunButtonAreaMenuPanel: document.getElementById("ButtonAreaMenuPanel"),
		FirstrunImageButtonAreaMenuDefault: document.getElementById("ImageButtonAreaMenuDefault"),
		FirstrunImageButtonAreaMenuToolbar: document.getElementById("ImageButtonAreaMenuToolbar"),
		FirstrunImageButtonAreaMenuPanel: document.getElementById("ImageButtonAreaMenuPanel"),
		FirstrunTextButtonAreaMenuDefault: document.getElementById("TextButtonAreaMenuDefault"),
		FirstrunTextButtonAreaMenuToolbar: document.getElementById("TextButtonAreaMenuToolbar"),
		FirstrunTextButtonAreaMenuPanel: document.getElementById("TextButtonAreaMenuPanel")
	};
	
		// Localize all the elements with the translated text if available.
		// Window title
		document.title = bundleFirstrunWindow.GetStringFromName("lmFirstrunTitle");
		// Top navigation bar
		contentElement.navBarTitle.textContent = bundleFirstrunWindow.GetStringFromName("lmFirstrunNavBarTitle");		
		contentElement.navBarSupport.textContent = bundleFirstrunWindow.GetStringFromName("lmFirstrunNavBarSupport");
		contentElement.navBarContact.textContent = bundleFirstrunWindow.GetStringFromName("lmFirstrunNavBarContact");			
		// Firstrun panel label
		contentElement.FirstrunPanelTitle.textContent = bundleFirstrunWindow.GetStringFromName("lmFirstrunPanelTitle");

		// Copyright message.
		contentElement.CopyrightLabel.textContent = bundleFirstrunWindow.GetStringFromName("lmCopyright");
		// Select toolbar button position.		
		contentElement.FirstrunAddToolbarButtonToArea.textContent = bundleFirstrunWindow.GetStringFromName("lmAddToolbarButtonToArea");
		contentElement.FirstrunAddToolbarButtonToAreaDefault.textContent = bundleFirstrunWindow.GetStringFromName("lmAddToolbarButtonToAreaDefault");
		contentElement.FirstrunButtonAreaMenuDefault.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuDefault");
		contentElement.FirstrunButtonAreaMenuToolbar.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuToolbar");
		contentElement.FirstrunButtonAreaMenuPanel.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuPanel");
		contentElement.FirstrunImageButtonAreaMenuDefault.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuDefault");
		contentElement.FirstrunImageButtonAreaMenuToolbar.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuToolbar");
		contentElement.FirstrunImageButtonAreaMenuPanel.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuPanel");
		contentElement.FirstrunTextButtonAreaMenuDefault.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuDefault");
		contentElement.FirstrunTextButtonAreaMenuToolbar.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuToolbar");
		contentElement.FirstrunTextButtonAreaMenuPanel.textContent = bundleFirstrunWindow.GetStringFromName("lmButtonAreaMenuPanel");
		
		switch (Services.prefs.getCharPref("extensions.language_manager.addbuttontoarea")) {

		    default:
				document.getElementById("AddToolbarButtonToAreaSelect").value = "default";
		    break;
		
		    case "default":
				document.getElementById("AddToolbarButtonToAreaSelect").value = "default";
		    break;

		    case "toolbar":
				document.getElementById("AddToolbarButtonToAreaSelect").value = "toolbar";
		    break;

		    case "panel_menu":
				document.getElementById("AddToolbarButtonToAreaSelect").value = "panel_menu";
		    break;

		}

			}catch (e){
				// Catch any nasty errors and output to dialogue and console
				Services.prompt.alert(null, "oops i did it again!", "Were sorry but something has gone wrong! " + e);
		}
	
},

addToolbarButtonToAreaSelectChanged: function(){

    switch (document.getElementById("AddToolbarButtonToAreaSelect").value) {
        
        case "default":
            Services.prefs.setCharPref("extensions.language_manager.addbuttontoarea", "default");
			try {	
				if (CustomizableUI.getPlacementOfWidget("toolbar_openLangageManager").area == CustomizableUI.AREA_NAVBAR || 
						CustomizableUI.getPlacementOfWidget("toolbar_openLangageManager").area == CustomizableUI.AREA_PANEL) {
					CustomizableUI.removeWidgetFromArea("toolbar_openLangageManager");
				}
			} catch(e){}
       break;
 
        case "toolbar":
            Services.prefs.setCharPref("extensions.language_manager.addbuttontoarea", "toolbar");
			try {	
				if (CustomizableUI.getPlacementOfWidget("search-container").area === "nav-bar"){
					CustomizableUI.addWidgetToArea("toolbar_openLangageManager", CustomizableUI.AREA_NAVBAR, CustomizableUI.getPlacementOfWidget("search-container").position + 1);
				} else {
					CustomizableUI.addWidgetToArea("toolbar_openLangageManager", CustomizableUI.AREA_NAVBAR);
				}
			} catch(e){}
        break;

        case "panel_menu":
			try {	
				Services.prefs.setCharPref("extensions.language_manager.addbuttontoarea", "panel_menu");
				CustomizableUI.addWidgetToArea("toolbar_openLangageManager", CustomizableUI.AREA_PANEL);
			} catch(e){}
        break;

    }
		
}
				
}

window.addEventListener("load", function () { 
	window.removeEventListener("load", gLanguageMangerFirstrun.init(), false);
	gLanguageMangerFirstrun.init(); 
}, false);

  // Make gLanguageMangerFirstrun a global variable
  global.gLanguageMangerFirstrun = gLanguageMangerFirstrun;
}(this));