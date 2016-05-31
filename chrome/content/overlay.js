/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
(function(global) {
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

// Import addon manager
var {AddonManager} = Cu.import("resource://gre/modules/AddonManager.jsm", {});
// Import services
var {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

var gLMangerHandler = {
	// Get string sets to localise internal messages.
	bundleDialogue: Services.strings.createBundle("chrome://LanguageManager/locale/dialogue.properties"),
	bundleDebugError: Services.strings.createBundle("chrome://LanguageManager/locale/debug.properties"),
	// Setup prompts service.	
	prompts: Services.prompt,
	// Browser information	
	browserAppInformation: Services.appinfo,
	defaultfirefoxtheme:		Services.prefs.getCharPref("general.skins.selectedSkin") == 'classic/1.0',
	// Get browser name from branding
	brandName: Services.strings.createBundle("chrome://branding/locale/brand.properties").GetStringFromName("brandShortName"),
	// Store json data to save on multiple requests.
	jsObject: [],
};

var gLanguageManger = {

initPane: function(){	
		// Add attribute to provide theme specific css to resolve any issues with styling on non default themes.
	try{
		if (gLMangerHandler.defaultfirefoxtheme){
			document.getElementById("Language-Manager").setAttribute('defaultfxtheme',true);
		}else {
			document.getElementById("Language-Manager").setAttribute('themename', Services.prefs.getCharPref("general.skins.selectedSkin"));
		}
	}catch(e){
		// Catch any nasty errors and output to dialogue
		gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);		
	}
	try {
		if (Services.appinfo.OS=="WINNT"){
			// Lets add version number to language manager window on windows.
			AddonManager.getAddonByID('LanguageManager@8pecxstudios.com', function(addon) {
				document.title = document.title + " " + addon.version;
			});
		}
	}catch(e){
		// We don't want errors to affect language manager if setting the addon version  fails
	}
	try{
		// Get latest language list
		document.getElementById("lm-overlay").hidden = false;
		// Use list locally
		gLanguageManger.validateURL("chrome://LanguageManager/content/LanguageList.json", false);
		
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("initPaneErrorAlert") + " " + e);	
		}
		
		// Quick toggle of language packs	
		var listbox= document.getElementById("theList");
		listbox.addEventListener("dblclick", function(aEvent){
		try{	
				// Prevent right or middle mouse event activation.
				var aEvent = aEvent || window.event;				
				if ('object' === typeof aEvent) {
					if (aEvent.button === 0){
							gLanguageManger.TogglePack();
					}
				}
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
			}
    }, false);
	// If the pack is the active pack we don't want to show toggle context menu item.
	document.getElementById("lm-pack-context-menu")
			.addEventListener("popupshowing", function(){
		try{
				if (gLanguageManger.getSelectedPackInfo(false, true).match(Services.prefs.getCharPref("general.useragent.locale"))){
					document.getElementById("context_LanguageManager_toggle").hidden = true;
				}else{
					document.getElementById("context_LanguageManager_toggle").hidden = false;
				}
					
				AddonManager.getAddonByID(gLanguageManger.getSelectedPackInfo(true, false), function(addon) {
					if (addon.version != gLMangerHandler.browserAppInformation.version){
						document.getElementById("context_LanguageManager_update").hidden = false;
					}else{
						document.getElementById("context_LanguageManager_update").hidden = true;
					}
				});
				}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
			}
    }, false);
	
	try{
		if (Services.prefs.prefHasUserValue("general.useragent.locale")){
			document.getElementById("restoreDefaultLocale").hidden = false;	
			document.getElementById("restoreDefaultSeparator").hidden = false;			
		}else{
			document.getElementById("restoreDefaultLocale").hidden = true;
			document.getElementById("restoreDefaultSeparator").hidden = true;
		}	
	}catch(e){}
	
},

	getInstalledLanguages: function() {
		function getAllAddons(name, id, locale, version, updateDate, isActive, isCompatible){
		try{
			var row = document.createElement('listitem');
			row.setAttribute('tooltip', 'listEnableMessage');
			row.setAttribute('context', "lm-pack-context-menu");			
			// Create and attach 1st cell (Name)
			var cell = document.createElement('listcell');
			cell.setAttribute('label', name );
			cell.setAttribute('value', id );
			row.appendChild( cell );
			// Create and attach 2nd cell (Locale)
			cell = document.createElement('listcell');
			/*
			   Here we chop the source URI to get the locale value, In cases where the pack was updated automatically
			   we need to trim the query with the file hash value, This locale value will look different to the standard.
			*/
			var showLocale = locale.substring(locale.lastIndexOf("/") + 1).replace(".xpi", "").split('?')[0];			
			cell.setAttribute('label', showLocale );
			cell.setAttribute('value', showLocale );
			row.appendChild( cell );
			// Create and attach 3rd cell (Version)
			cell = document.createElement('listcell');
			cell.setAttribute('label', version );
			cell.setAttribute('value', version );
			row.appendChild( cell );
			// Create and attach 4th cell (Installed)
			cell = document.createElement('listcell');
			// Some users might like a different time - date readout.			
			switch (Services.prefs.getCharPref("extensions.language_manager.time-date_mode")){

				case "basicdate":
					cell.setAttribute('label',  updateDate.toLocaleDateString());
					cell.setAttribute('value', updateDate.toLocaleDateString() );			
				break;		

				case "timedate":
					cell.setAttribute('label',  updateDate.toLocaleTimeString() + " " + updateDate.toLocaleDateString());
					cell.setAttribute('value', updateDate.toLocaleTimeString() + " " + updateDate.toLocaleDateString() );			
				break;	
				
				default:
					/*
					   If English  local Monday, May 11, 2015 6:23:32 PM
					   If German local Montag, 11, Mai 2015 6:23:32 PM
					*/		
					var set_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
					cell.setAttribute('label',  updateDate.toLocaleDateString(Services.prefs.getCharPref("general.useragent.locale"), set_options) + " " + updateDate.toLocaleTimeString());
					cell.setAttribute('value', updateDate.toLocaleDateString(Services.prefs.getCharPref("general.useragent.locale"), set_options));	
				break;				
			}
			row.appendChild( cell );
			// Create and attach 5th cell (Enabled)
			cell = document.createElement('listcell');
			cell.setAttribute('label', isActive );
			cell.setAttribute('value', isActive );
			row.appendChild( cell );
			// Create and attach 6th cell (Compatible)
			cell = document.createElement('listcell');
			cell.setAttribute('label', isCompatible );
			cell.setAttribute('value', isCompatible );
			row.appendChild( cell );
			// Attach row
			datlist.appendChild( row );
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	}
	// Get list of all installed language packs, Needs a little work in need of optimization -> (Single call iteration).
	AddonManager.getAllAddons(function(aAddons) {	
	try{
		datlist = document.getElementById("theList");	
		// Get latest support GUID list
		var guidList = gLMangerHandler.jsObject.SUPPORTEDIDS[0].GUIDS;	
		items = aAddons;			
		/*
			We take a small performance hit as the switch case was less intensive, But now we have a controllable list of supported GUIDs
			This means we no longer have to edit the very large select case to add\remove items its all controlled by LastestLanguage.json	
		*/
			for (i = 0; guidList[i]; i++) {
				items.forEach(function(item, index, array) {	
					if (item.id === guidList[i].ID){
						getAllAddons(item.name, item.id, item.sourceURI.spec, item.version, item.updateDate, item.isActive, item.isCompatible);						
					}
				});
			}
			// Release JSON data from memory.
			gLMangerHandler.jsObject = [];
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
			}
		});
	},

	ResizeListbox: function(){
		(function() {
		  window.addEventListener("resize", resizeThrottler, false);
		  var resizeTimeout;
		  function resizeThrottler() {
			// Ignore resize events as long as an actualResizeHandler execution is in the queue
			if ( !resizeTimeout ) {
			  resizeTimeout = setTimeout(function() {
				resizeTimeout = null;
				actualResizeHandler();
			   // The actualResizeHandler will execute at a rate of 15fps
			   }, 66);
			}
		  }
		  // Need to resize the listbox so the elements don't get dragged offscreen.
		  function actualResizeHandler() {
					// Note: Resolved issue with use of innerHTML as textContent did not work in this case.
					var container = document.getElementById("theList");
					var newList = document.createTextNode(container);
					container.appendChild(newList);
		  }
		}());
	},
	// Reference: https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Tabbed_browser#Reusing_by_other_criteria
	ReuseTab: function (attrName, url) {
	try{
			  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
								 .getService(Components.interfaces.nsIWindowMediator);
			  for (var found = false, index = 0, tabbrowser = wm.getEnumerator('navigator:browser').getNext().gBrowser;
				   index < tabbrowser.tabContainer.childNodes.length && !found;
				   index++) {
				// Get the next tab
				var currentTab = tabbrowser.tabContainer.childNodes[index];  
				// Does this tab contain our custom attribute?
				if (currentTab.hasAttribute(attrName)) {
				  // Yes--select and focus it.
				  tabbrowser.selectedTab = currentTab;
				  // Focus *this* browser window in case another one is currently focused
				  tabbrowser.ownerDocument.defaultView.focus();
				  found = true;
				}
			  }
			  if (!found) {
				// Our tab isn't open. Open it now.
				var browserEnumerator = wm.getEnumerator("navigator:browser");
				var tabbrowser = browserEnumerator.getNext().gBrowser;		  
				// Create tab
				var newTab = tabbrowser.addTab(url);
				newTab.setAttribute(attrName, "xyz");			  
				// Focus tab
				tabbrowser.selectedTab = newTab;
				// Focus *this* browser window in case another one is currently focused
				tabbrowser.ownerDocument.defaultView.focus();
			  }
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);
		}
	},

	/* 
	   We attempt to validate our json urls, But what about the language pack urls.
	   Since we have json elements hosted on our server, We need to check if the url is valid
	   If the url is not valid then we need to alert the user and stop the addon from continuing.
	*/
	validateURL : function(aUrl, aBoolean){
		var menuItemsList = document.getElementById("languageMenu");
		var request = new XMLHttpRequest();
			request.addEventListener("progress", requestProgress, false);
			request.addEventListener("load", requestComplete, false);		
		// Since there can be a delay resolve the address lets show the user a visual indicator that stuff is happening.
		function requestProgress (oEvent) {
		  if (oEvent.lengthComputable) {
			var percentComplete = Math.floor((oEvent.loaded / oEvent.total) * 100);
			document.getElementById("lm-percent").textContent = percentComplete + " %";
		  }
		}
		// On request completion hide the progress-bar
		function requestComplete(evt) {
		  document.getElementById("lm-percent").textContent = 0 + " %";
		 document.getElementById("lm-overlay").hidden = true;
		}
				
		request.onload = function(aEvent){
			if ((request.status >= 200 && 
				  request.status < 300) || 
				  request.status == 304){
					 if(aBoolean === true){ 
						  // Download Pack	
						  document.location.href = aUrl;
						  gLanguageManger.changeButtonStates("closeButton", false);	
					 }else{
						 // Load lanugage manager information.
						var text = aEvent.target.responseText;
						gLMangerHandler.jsObject = text;		
						// Need to check if json is valid, If json not valid don't continue and show error.
						function IsJsonValid(jsObject) {
								try {
									JSON.parse(jsObject);
								} catch (e) {
									return false;
								}
							return true;
						}	
						if(!IsJsonValid(gLMangerHandler.jsObject)){
							// Need to throw error message and exit if not valid json.
							gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("jsonnotvalid"));
							document.getElementById("lm-overlay").hidden = true;		
							menuItemsList.disabled = true;						
							return;
						} else { 
							gLMangerHandler.jsObject = JSON.parse(text);
						}		
						var myLanguageList = gLMangerHandler.jsObject.languageList[0].packs;	
						for (i = 0; myLanguageList[i]; i++) {		
								if (myLanguageList[i].version_min > gLMangerHandler.browserAppInformation.version){}else{			
									if (gLMangerHandler.browserAppInformation.version > myLanguageList[i].version_max 
											&& !myLanguageList[i].version_max == ""){}else{
												menuItemsList.appendItem( myLanguageList[i].name, myLanguageList[i].value);						
									}									
								}
							}
					gLanguageManger.checkBrowser();		
					gLanguageManger.getInstalledLanguages();
					gLanguageManger.ResizeListbox();
					 }				  			  
			}else{
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("httpdNotsuccess"));
				document.getElementById("lm-overlay").hidden = true;
			}	
		};
		
		request.onerror = function(aEvent){
			// Disable the list and show error
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("httpdNotExist") + " " + aEvent.target.status);
			document.getElementById("lm-overlay").hidden = true;
			menuItemsList.disabled = true;	
		};
		// Add pramas true for async
		request.timeout = 5000;
		request.open("GET", aUrl, true);
		request.send(null);
	},	
	
	/*
	   Here we are making sure only the mode for the browser can be enabled on that browser.
	   Example: Firefoxmode can only be enabled in firefox etc.
	*/
	checkBrowser : function(){
	try{
			// Check if browser Firefox
			if (gLMangerHandler.browserAppInformation.name.toLowerCase() === "Firefox".toLowerCase()) {
				/*
				   Check if running firefox beta.
				   Since we target the releases/latest-beta we only support the latest firefox beta release.
				*/
				if (Services.prefs.getCharPref("app.update.channel") === "beta"){
					Services.prefs.setCharPref("extensions.language_manager.browser_mode", "firefoxbetamode");
				}else{
					Services.prefs.setCharPref("extensions.language_manager.browser_mode", "firefoxmode");
				}
			}
			// Check if browser Cyberfox (Additional fallback)
			if (gLMangerHandler.browserAppInformation.name.toLowerCase() === "Cyberfox".toLowerCase()) {
				Services.prefs.setCharPref("extensions.language_manager.browser_mode", "cyberfoxmode");				
			}
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	ShowLanguageManager : function() {
	try{
		gLanguageManger.ReuseTab("A7E24DF418823798B540DF75FC347898", "chrome://LanguageManager/content/language_Manager.xul");
		this.checkBrowser();
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	ShowLanguageManagerOptions : function(){
	try{
			gLanguageManger.ReuseTab("C974F35CA066A280F094DDE616EDD176", "chrome://languagemanager/content/options.html");
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	// Enabled Help button, This will show the informational post for detailed instructions on how to use language manager if needed.
	ShowHelpPage : function() {
	try{
		openUILinkIn('https://8pecxstudios.com/Forums/viewtopic.php?f=11&t=645', 'tab');
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	changeButtonStates: function (element, state){
		try{		
			document.getElementById(element).disabled = state;
		}catch (e){
					// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);
		}
	},
	
	Buttonenabled: function(){		
	try{
		this.changeButtonStates("installButton", false);
		this.changeButtonStates("closeButton", true);			
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);
	}
},
	
	SetPrefValue: function(){	
		try{		
			this.checkBrowser();		
			var newPref = document.getElementById("languageMenu").value;	
				Services.prefs.setCharPref("general.useragent.locale", newPref);	
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("setPrefValueError") + " " + e);
	}
},
	// Complex member
	downloadPack: function() {
		try{			
			// Change button attributes.	
			this.changeButtonStates("installButton", true);				  
			// Request URL where to download language pack from.		
			var cyberfoxModeURL = "https://download.8pecxstudios.com/latest/language/" + gLMangerHandler.browserAppInformation.version + "/";
			var firerfoxModeURL = "https://ftp.mozilla.org/pub/firefox/releases/" + gLMangerHandler.browserAppInformation.version + "/win32/xpi/";
			var firefoxBetaModeURL = "https://ftp.mozilla.org/pub/firefox/releases/latest-beta/win32/xpi/";					
				switch (Services.prefs.getCharPref("extensions.language_manager.browser_mode")) {
					case "cyberfoxmode":
						document.getElementById("lm-overlay").hidden = false;
						gLanguageManger.validateURL(cyberfoxModeURL + document.getElementById("languageMenu").value + ".xpi", true);	
						break;
					case "firefoxmode":
						document.getElementById("lm-overlay").hidden = false;
						gLanguageManger.validateURL(firerfoxModeURL + document.getElementById("languageMenu").value + ".xpi", true);
						break;
					case "firefoxbetamode":
						document.getElementById("lm-overlay").hidden = false;
						gLanguageManger.validateURL(firefoxBetaModeURL + document.getElementById("languageMenu").value + ".xpi", true);				
						break;
				}						
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("downloadPackError") + " " + e);
		}	
},
    // Important part of the process to enable download packs, Full logic implementation was removed for an easy one line.
	restartBrowser: function () {		
		try{
				Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit);
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("restartBrowserError") + " " + e);
		}
	},
		// Language pack install complete.
		complete: function() {
		try{		
				this.changeButtonStates("closeButton", true);
				// Prompt restart to apply changes
				if (gLMangerHandler.prompts.confirm(window, gLMangerHandler.bundleDialogue.GetStringFromName("restartMessageTitle"), 
						gLMangerHandler.bundleDialogue.formatStringFromName("restartMessage", [gLMangerHandler.brandName], 1))) {
					this.SetPrefValue();			
					// Call browser restart function
					this.restartBrowser();
				}				
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("completeError") + " " + e);
		}	
},
		// Language pack activate.
		activateComplete: function(elementData) {
		try{
				// Prompt restart to apply changes
				if (gLMangerHandler.prompts.confirm(window, gLMangerHandler.bundleDialogue.GetStringFromName("restartMessageTitle"), gLMangerHandler.bundleDialogue.formatStringFromName("restartMessageActivate", [gLMangerHandler.brandName], 1))) {	
					Services.prefs.setCharPref("general.useragent.locale", elementData);				
					// Call browser restart function
					this.restartBrowser();
				}		
			}catch (e){
				// Catch any nasty errors and output to dialogue
				gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("completeError") + " " + e);
		}
},
	/*
	  To prevent use of duplicate code we now can call this function by passing the element.childNodes 
	  So for example you have the listitem and you get its childnode listcell
	*/ 
	getSelectedPackInfo : function(aID, aLocale){
		try{
			var target = document.getElementById("theList").selectedItem.childNodes[0];
				if (!target){
					return; 
				}
				var splitElement = target.getAttribute("value");
				var splitElementStart = splitElement.indexOf('-') + 1;
				var splitElementEnd = splitElement.indexOf('@',  splitElementStart);				
				var elementData = splitElement.substring(splitElementStart, splitElementEnd);
				// If both set return as array.
				if (aID && aLocale){
					return [splitElement, elementData];
				}	
				if (aID){
					return splitElement;
				}	
				if (aLocale){
					return elementData;
				}	
		}catch (e){}
	},
	
	UpdatePack : function(){	
	try{
				document.getElementById("languageMenu").value = gLanguageManger.getSelectedPackInfo(false, true);
				gLanguageManger.downloadPack();
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	TogglePack : function(e){	
	try{			
			// Here we toggle the pack when the user selects toggle pack from right click context menu.
			var addonID = gLanguageManger.getSelectedPackInfo(true, false);
			if (addonID &&  typeof(addonID)  != "undefined" || addonID  != null){
				AddonManager.getAddonByID(addonID, function(addon) {
					if (addon.isActive === false && addon.isCompatible){
						addon.userDisabled = false;			
					}					
					if (addon.isCompatible){					
						if (gLanguageManger.getSelectedPackInfo(false, true).match(Services.prefs.getCharPref("general.useragent.locale"))){
							return;			
					}else{
							gLanguageManger.activateComplete(gLanguageManger.getSelectedPackInfo(false, true));	
						}	
					}
				});
			}
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	/*
		Here we uninstall the selected language pack, Only if users accepts the confirmation message, A restart is required for an active pack, Non active can simply just be uninstalled.
	*/
	RemovePack : function(e){	
	try{	
			// Prompt inform user they are about to uninstall a language pack and ask if that is what they want to do.
			if (gLMangerHandler.prompts.confirm(window, gLMangerHandler.bundleDialogue.GetStringFromName("removeWarningTitle"), gLMangerHandler.bundleDialogue.GetStringFromName("removeWarningMessage"))) {
			AddonManager.getAddonByID(gLanguageManger.getSelectedPackInfo(true, false), function(addon) {			
				// Check if addon
				if (addon){				
					// Check if the addon is the current active addon, Then need to reset the changed (general.useragent.locale) back to its original state before pack was enabled.
					if (gLanguageManger.getSelectedPackInfo(false, true).match(Services.prefs.getCharPref("general.useragent.locale"))){
						// Clear locale 
						Services.prefs.clearUserPref("general.useragent.locale");
						addon.uninstall();
						/*
						   Since the addon was active there are still parts of the localization loaded, So prompt user to restart the browser to unload these elements.
						   Prompt restart to unload any localized elements.
						*/
						if (gLMangerHandler.prompts.confirm(window, gLMangerHandler.bundleDialogue.GetStringFromName("restartMessageTitle"), gLMangerHandler.bundleDialogue.formatStringFromName("restartRemoveMessage", [gLMangerHandler.brandName], 1))) {
							// Call browser restart function
							gLanguageManger.restartBrowser();
						}
					}else{			
						// If pack is not the current active we can just uninstall it.
						addon.uninstall();						
						// Trigger a update on the installed addons table.
						document.location.reload(false);
					}
				}					
			});
		} 								
		}catch (e){
			// Catch any nasty errors and output to dialogue
			gLMangerHandler.prompts.alert(gLMangerHandler.bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}		
	},

	restoreDefaultLanguage: function(){	
		try{
				// Prompt restart to apply changes
				if (gLMangerHandler.prompts.confirm(window, gLMangerHandler.bundleDialogue.GetStringFromName("restartMessageTitle"), 
						gLMangerHandler.bundleDialogue.formatStringFromName("restartMessageRestoreDefault", [gLMangerHandler.brandName], 1))) {
						// Clear locale 
						Services.prefs.clearUserPref("general.useragent.locale");
						// Call browser restart function
						this.restartBrowser();
					}
				}catch (e){
					// Catch any nasty errors and output to dialogue and console
					gLMangerHandler.prompts.alert("Were sorry but something has gone wrong! " + e);
			}			

		}
}
  // Make gLanguageManger a global variable
  global.gLanguageManger = gLanguageManger;
}(this));