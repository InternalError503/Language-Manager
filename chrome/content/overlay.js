// Copyright (c) 2014 8pecxstudios

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

//Import Addon Manager
Cu.import("resource://gre/modules/AddonManager.jsm");

//Get & set language manager user preferences.
var ServicesPref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.language_manager.");

//Version firefox-mode
var isFirefoxModeEnabled; 

//For browser version detection.
var webBrowserVersion = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

//Get string sets to localise internal messages.
var localiseJavascript = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService); 
var _bundleDialogue = localiseJavascript.createBundle("chrome://LanguageManager/locale/dialogue.properties");
var _bundleDebugError = localiseJavascript.createBundle("chrome://LanguageManager/locale/debug.properties");

//Setup Prompts Service.
var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);

//Browser Information			
var browserAppInformation = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);

var gLanguageManger = {

initPane: function(){	

	try{
		
	
	//Get latest language list
	let url = "http://download.8pecxstudios.com/latest/language/language_manager/LastestLanguage.json";
	let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
					.createInstance(Ci.nsIXMLHttpRequest);
	var menuItemsList = document.getElementById("languageMenu");				
					  
	request.onload = function(aEvent) {
	
		//Since we have json elements hosted on our server, We need to check if the url is valid
		//If the url is not valid then we need to alert the user and stop the addon from continuing.	
		if ((request.status >= 200 && 
			request.status < 300) || 
			request.status == 304){
		
				let text = aEvent.target.responseText;
				let jsObject = text;
				
				//Need to check if json is valid, If json not valid don't continue and show error.
				function IsJsonValid(jsObject) {
						try {
							JSON.parse(jsObject);
						} catch (e) {
							return false;
						}
					return true;
				}			
							
				if(!IsJsonValid(jsObject)){
					//Need to throw error message and exit if not valid json.
					menuItemsList.disabled = true;	
					alert(_bundleDebugError.GetStringFromName("jsonnotvalid"));	
					return;
				} else { 
					jsObject = JSON.parse(text);
				}			
				
				let myLanguageList = jsObject.languageList[0].packs;
				
		for (i = 0; myLanguageList[i]; i++) {
		
				if (myLanguageList[i].version_min > webBrowserVersion.version){}else{
					menuItemsList = document.getElementById("languageMenu")
								.appendItem( myLanguageList[i].name, myLanguageList[i].value);	
				}
			
			}
			console.log("Found " + myLanguageList.length + " language packs");	
		}else{
			//Disable the list and show error
			menuItemsList.disabled = true;	
			alert("http response did not succeed, URL does not exist or maybe unavailable");				
		}	
	};
				
	request.onerror = function(aEvent) {
			//Disable the list and show error
			menuItemsList.disabled = true;	
			window.alert("Loading URL timed out, server may not exist or maybe unavailable " + aEvent.target.status);
	};
	
	request.open("GET", url, true);
	request.send(null);
		
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("initPaneErrorAlert") + " " + e);	
		}


//Quick toggle of language packs (merge from 1.0.5A)		
    var listbox= document.getElementById("theList");
			listbox.addEventListener("dblclick", function(event){

try{			
			
			var target = event.target.childNodes[0];
			if (!target){
				return; 
			}
		
		var localeServices = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("general.useragent.");
		var splitElement = target.getAttribute("value");
		var splitElementStart = splitElement.indexOf('-') + 1;
		var splitElementEnd = splitElement.indexOf('@',  splitElementStart);
		
		var elementData = splitElement.substring(splitElementStart, splitElementEnd);
		
		AddonManager.getAddonByID(target.getAttribute("value"), function(addon) {
		if (addon.isActive === false && addon.isCompatible){
			addon.userDisabled = false;			
		}
		
	if (addon.isCompatible){
	
		if (elementData.match(localeServices.getCharPref("locale"))){
			return;			
	}else{
			localeServices.setCharPref("locale", elementData);
			gLanguageManger.activateComplete();	
			
		}	
	}
		
		
		});
		
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}		

    }, false);	
	
		
	this.getInstalledLanguages();
	this.ResizeListbox();
	
},


	getInstalledLanguages: function() {
	
		function getAllAddons(name, id, version, updateDate, isActive, isCompatible){
		
		try{
	
			var row = document.createElement('listitem');
			row.setAttribute('tooltip', 'listEnableMessage');
			// Create and attach 1st cell (Name)
			var cell = document.createElement('listcell');
			cell.setAttribute('label', name );
			cell.setAttribute('value', id );
			row.appendChild( cell );
			// Create and attach 2nd cell (Version)
			cell = document.createElement('listcell');
			cell.setAttribute('label', version );
			cell.setAttribute('value', version );
			row.appendChild( cell );
			// Create and attach 3rd cell (Installed)
			cell = document.createElement('listcell');
			cell.setAttribute('label',  updateDate );
			cell.setAttribute('value', updateDate );
			row.appendChild( cell );
			// Create and attach 4th cell (Enabled)
			cell = document.createElement('listcell');
			cell.setAttribute('label', isActive );
			cell.setAttribute('value', isActive );
			row.appendChild( cell );
			// Create and attach 5th cell (Compatible)
			cell = document.createElement('listcell');
			cell.setAttribute('label', isCompatible );
			cell.setAttribute('value', isCompatible );
			row.appendChild( cell );
			// Attach row
			datlist.appendChild( row );
			
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	
	}
		

//Get list of all installed language packs, Needs a little work in need of optimization -> (Single call iteration).
AddonManager.getAllAddons(function(aAddons) {	

try{
  
	datlist = document.getElementById("theList");
  
	//Get latest support GUID list
	let url = "http://download.8pecxstudios.com/latest/language/language_manager/supportedidlist.json";
	let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
					.createInstance(Ci.nsIXMLHttpRequest);
					  
	request.onload = function(aEvent) {

		//Since we have json elements hosted on our server, We need to check if the url is valid
		//If the url is not valid then we need to alert the user and stop the addon from continuing.	
		if ((request.status >= 200 && 
			request.status < 300) || 
			request.status == 304){
			
				let text = aEvent.target.responseText;
				let jsObject = text;
				items = aAddons;
				
			//Need to check if json is valid, If json not valid don't continue and show error.
			function IsJsonValid(jsObject) {
			try {
						JSON.parse(jsObject);
					} catch (e) {
						return false;
					}
				return true;
			}

			if(!IsJsonValid(jsObject)){
				//Need to throw error message and exit if not valid json.
				datlist.disabled = true;	
				alert(_bundleDebugError.GetStringFromName("jsonnotvalid"));	
				return;
			} else { 
				jsObject = JSON.parse(text);
			}
			
		let guidList = jsObject.SUPPORTEDIDS[0].GUIDS;	
			
			/*
				We take a small performance hit as the switch case was less intensive, But now we have a controllable list of supported GUIDs
				This means we no longer have to edit the very large select case to add\remove items its all controlled by supportedidlist.json	
			*/
			
			for (i = 0; guidList[i]; i++) {
				items.forEach(function(item, index, array) {	
					if (item.id === guidList[i].ID){
						getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
					}
				});
			}
			
		}else{
			//Disable the table and show error
			datlist.disabled = true;
			alert("http response did not succeed, URL does not exist or maybe unavailable");				
		}					
	};
				
	request.onerror = function(aEvent) {
			//Disable the table and show error
			datlist.disabled = true;
			window.alert("Loading URL timed out, server may not exist or maybe unavailable " + aEvent.target.status);
	};
	
	request.open("GET", url, true);
	request.send(null);		
	
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	
	});
	
	
	
	},

	ResizeListbox: function(){
	
				
(function() {

  window.addEventListener("resize", resizeThrottler, false);

  var resizeTimeout;
  function resizeThrottler() {
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if ( !resizeTimeout ) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        actualResizeHandler();
     
       // The actualResizeHandler will execute at a rate of 15fps
       }, 66);
    }
  }

  function actualResizeHandler() {
			//Note: textContent does not seem to work here, Looking for a better way in future updates.
			var container = document.getElementById("theList");
            var content = container.innerHTML;
					container.innerHTML= content;
		//Need to resize the listbox so the elements don't get dragged offscreen, This appears to be the best solution at this time.
  }

}());
	
	},

	//Reference: https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Tabbed_browser#Reusing_by_other_criteria
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
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
			  
	},
	
	
	ShowLanguageManager : function() {
	
	try{
	

		gLanguageManger.ReuseTab("A7E24DF418823798B540DF75FC347898", "chrome://LanguageManager/content/language_Manager.xul");

		//Check If Firefox (Seems we need to find better solution)
		if (ServicesPref.getCharPref("browser_mode") === "firefoxmode"){
				isFirefoxModeEnabled = true;
		}		
		
		//Check if browser Firefox
		if (browserAppInformation.name.toLowerCase() === "Firefox".toLowerCase()) {
			ServicesPref.setCharPref("browser_mode", "firefoxmode");
			isFirefoxModeEnabled = true;
			ServicesPref.setBoolPref("versiondetection", false);		
				
		}	
		
				
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	ShowLanguageManagerOptions : function(){
	try{	
			gLanguageManger.ReuseTab("C974F35CA066A280F094DDE616EDD176", "chrome://languagemanager/content/options.html");
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}	
	},
	
	ShowHelpPage : function() {
	
	try{
	

		openUILinkIn('https://8pecxstudios.com/Forums/viewtopic.php?f=11&t=645', 'tab');
	    		
				
		}catch (e){
			//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);	
		}
	},
	
	Buttonenabled: function(){
		
		try{
			var installButton = document.getElementById("installButton");
			var closeButton = document.getElementById("closeButton");
			installButton.disabled = false
			closeButton.disabled = true;	
			
	}catch (e){
				//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);
	}
},

	ButtonDisabled: function(){
		
		try{
			var installButton = document.getElementById("installButton");
			var closeButton = document.getElementById("closeButton");
			
				installButton.disabled = true;
				closeButton.disabled = false;	
			
	}catch (e){
				//Catch any nasty errors and output to dialogue
			alert(_bundleDebugError.GetStringFromName("wereSorry") + " " + e);
	}
},
	
	SetPrefValue: function(){
		
		try{
		
			if(ServicesPref.getCharPref("browser_mode") === "firefoxmode"){
				isFirefoxModeEnabled = true;
			}		
		
		//Check if browser Firefox
		if (browserAppInformation.name.toLowerCase() === "Firefox".toLowerCase()) {
			ServicesPref.setCharPref("browser_mode", "firefoxmode");
			isFirefoxModeEnabled = true;
			ServicesPref.setBoolPref("versiondetection", false);		
				
		}		
		
		var callPrefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("general.useragent.");
		var newPref = document.getElementById("languageMenu").value;		
		
				callPrefService.setCharPref("locale", newPref);	

			}catch (e){
				//Catch any nasty errors and output to dialogue
				alert(_bundleDebugError.GetStringFromName("setPrefValueError") + " " + e);

	}
},
	
	//Complex Member
	downloadPack: function() {

		try{			
			var installButton = document.getElementById("installButton");
			var closeButton = document.getElementById("closeButton");

					//Change Button Attributes. 
					installButton.disabled = true;
					closeButton.disabled = false;
					
			//Request URL where to download language pack from.		
			var cyberfoxModeURL = "https://8pecxstudios.com/download/latest/language/";
			var firerfoxModeURL = "https://ftp.mozilla.org/pub/firefox/releases/";
			var firefoxBetaModeURL = "https://ftp.mozilla.org/pub/firefox/releases/latest-beta/win32/xpi/";
			
			
			var callPrefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("general.useragent.");
						

		switch (ServicesPref.getCharPref("browser_mode")) {

		    case "cyberfoxmode":
												
							document.location.href = cyberfoxModeURL + webBrowserVersion.version + "/" + callPrefService.getCharPref('locale').toString() + ".xpi";				
		        break;

		    case "firefoxmode":
				
				document.location.href = firerfoxModeURL + webBrowserVersion.version + "/win32/xpi/" + callPrefService.getCharPref('locale').toString() + ".xpi";

		        break;

		    case "firefoxbetamode":
				
				document.location.href = firefoxBetaModeURL + callPrefService.getCharPref('locale').toString() + ".xpi";
				
		        break;

		}
						
			}catch (e){
				//Catch any nasty errors and output to dialogue
				alert(_bundleDebugError.GetStringFromName("downloadPackError") + " " + e);

		}	
},

    //Important part of the process to enable download packs, Full logic implementation was removed for an easy one line.
	restartBrowser: function () {	
			
		try{
			const nsIAppStartup = Ci.nsIAppStartup;
    Cc["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(nsIAppStartup.eRestart | nsIAppStartup.eAttemptQuit);
	
			}catch (e){
				//Catch any nasty errors and output to dialogue
				alert(_bundleDebugError.GetStringFromName("restartBrowserError") + " " + e);

		}
        
	},	

//Language pack install complete.
		complete: function() {

		try{		

			
			//Prompt restart to apply changes
			if (prompts.confirm(window, _bundleDialogue.GetStringFromName("restartMessageTitle"), browserAppInformation.name +" "+  _bundleDialogue.GetStringFromName("restartMessage"))) {
			
				//Call browser restart function
				this.restartBrowser();
				
				window.close();
			}else{
				window.close();
				} 
						
			}catch (e){
				//Catch any nasty errors and output to dialogue
				alert(_bundleDebugError.GetStringFromName("completeError") + " " + e);

		}			
		
},

//Language pack activate.
		activateComplete: function() {

		try{		

			
			//Prompt restart to apply changes
			if (prompts.confirm(window, _bundleDialogue.GetStringFromName("restartMessageTitle"), browserAppInformation.name +" "+ _bundleDialogue.GetStringFromName("restartMessageActivate"))) {
			
				//Call browser restart function
				this.restartBrowser();
				
				window.close();
			}else{
				window.close();
				} 
						
			}catch (e){
				//Catch any nasty errors and output to dialogue
				alert(_bundleDebugError.GetStringFromName("completeError") + " " + e);

		}			
		
}

			  	
	
}