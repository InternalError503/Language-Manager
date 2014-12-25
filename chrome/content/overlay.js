// Copyright (c) 2014 8pecxstudios

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

//Import Addon Manager
Cu.import("resource://gre/modules/AddonManager.jsm");

//Get & set language manager user preferences.
var ServicesPref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.language_manager.");

//Version detect pref
var versionDetectEnabled = ServicesPref.getBoolPref("versiondetection");

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


removeOld: function(){

	 // Check for old cyberfox Language Manager (Only Temporary)
	AddonManager.getAddonByID('CyberfoxLanguageManager@8pecxstudios.com', function(addon) {
		if(addon) { 
		addon.userDisabled = true;
		
			var clmprefs = Cc["@mozilla.org/preferences-service;1"]
						.getService(Ci.nsIPrefService).getBranch("extensions.cyberfox_language_manager.");							
			clmprefs.clearUserPref("debugMode");
			clmprefs.clearUserPref("versiondetect");
			clmprefs.clearUserPref("firefoxmode");
			addon.uninstall();							
		}
				
	});
	
},

initPane: function(){	

	try{
		
	
	//Get latest language list
	let url = "http://download.8pecxstudios.com/latest/language/LastestLanguage.json";
	let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
					.createInstance(Ci.nsIXMLHttpRequest);
					  
	request.onload = function(aEvent) {
			let text = aEvent.target.responseText;
			let jsObject = JSON.parse(text);
			let myLanguageList = jsObject.languageList;
			let mylanguageItems = jsObject.languageItems;
			
	for (i = 0; mylanguageItems[i]; i++) {

			var menuItemsList = document.getElementById("languageMenu")
								.appendItem( myLanguageList[i], mylanguageItems[i]);			
		
		}
		console.log("Found " + myLanguageList.length + " language packs");	
			
	};
				
	request.onerror = function(aEvent) {
		   window.alert("Error Status: " + aEvent.target.status);
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
	
		
	gLanguageManger.getInstalledLanguages();
	gLanguageManger.ResizeListbox();
	
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
		

//Get list of all installed language packs, Needs a little work very large code block in need of optimization and simplification -> (Single call iteration).
AddonManager.getAllAddons(function(aAddons) {	

try{
   
    items = aAddons;
    datlist = document.getElementById("theList");
	
//Loop through the switch matching id's and printing the found entries to the listbox.
items.forEach(function(item, index, array) {
		
	switch (item.id){

    //Addon id's for language packs consits of langpack-  %locale% @ firefox.mozilla.org | 8pecxstudios.com
    case "langpack-ach@8pecxstudios.com":        		
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-af@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-an@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ar@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-as@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ast@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-be@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bg@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bn-BD@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bn-IN@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-br@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bs@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ca@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-cs@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-csb@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-cy@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-da@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-de@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-dsb@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-el@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-en-GB@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-en-US@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;
    case "langpack-en-ZA@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-eo@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-AR@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-CL@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-ES@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-MX@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-et@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-eu@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fa@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ff@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fi@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fr@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fy-NL@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ga-IE@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-gd@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-gl@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-gu-IN@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-he@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hi-IN@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hr@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hsb@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hu@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hy-AM@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-id@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-is@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-it@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;
    case "langpack-ja@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-kk@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-km@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-kn@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ko@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ku@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-lij@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-lt@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-lv@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-mai@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-mk@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ml@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-mr@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ms@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-nb-NO@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-nl@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-nn-NO@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-or@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pa-IN@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pl@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pt-BR@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pt-PT@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-rm@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ro@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ru@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-si@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sk@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sl@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-son@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sq@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sr@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sv-SE@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ta@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-te@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-th@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-tr@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-uk@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-vi@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-xh@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-zh-CN@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-zh-TW@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-zu@8pecxstudios.com":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ach@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-af@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-an@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ar@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-as@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ast@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-be@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bg@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bn-BD@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bn-IN@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-br@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-bs@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ca@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-cs@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-csb@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-cy@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-da@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-de@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-dsb@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-el@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-en-GB@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-en-US@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;
    case "langpack-en-ZA@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-eo@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-AR@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-CL@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-ES@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-es-MX@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-et@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-eu@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fa@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ff@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fi@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fr@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-fy-NL@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ga-IE@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-gd@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-gl@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-gu-IN@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-he@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hi-IN@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hr@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hsb@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hu@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-hy-AM@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-id@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-is@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-it@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;
    case "langpack-ja@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-kk@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-km@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-kn@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ko@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ku@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-lij@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-lt@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-lv@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-mai@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-mk@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ml@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-mr@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ms@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-nb-NO@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-nl@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-nn-NO@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-or@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pa-IN@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pl@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pt-BR@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-pt-PT@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-rm@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ro@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ru@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-si@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sk@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sl@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-son@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sq@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sr@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-sv-SE@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-ta@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-te@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-th@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-tr@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-uk@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-vi@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-xh@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-zh-CN@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-zh-TW@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;

    case "langpack-zu@firefox.mozilla.org":
			getAllAddons(item.name, item.id,  item.version, item.updateDate, item.isActive, item.isCompatible);
        break;
	}

		});		
	
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
/* 		
			if (installButton.disabled == true){
					installButton.disabled = false;
					closeButton.disabled = true;
			}else{
					installButton.disabled = true;
					closeButton.disabled = false;
			} */
			
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
		
			//Check to make sure browser version detection and firefox mode don't conflict when both are set to "true"
			if (versionDetectEnabled & isFirefoxModeEnabled === true){
			
			prompts.confirm(window, "Error Message", (_bundleDebugError.GetStringFromName("downloadoptionsError")));
						window.close();						
			return;
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
					
			//Request URL Where To Download Language Pack From.		
			var cyberfoxModeURL = "https://8pecxstudios.com/download/latest/language/";
			var firerfoxModeURL = "https://ftp.mozilla.org/pub/firefox/releases/";
			var firefoxBetaModeURL = "https://ftp.mozilla.org/pub/firefox/releases/latest-beta/win32/xpi/";
			
			
			var callPrefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("general.useragent.");
						

		switch (ServicesPref.getCharPref("browser_mode")) {

		    case "cyberfoxmode":
				
					if (versionDetectEnabled){
									
							window.location = cyberfoxModeURL + webBrowserVersion.version + "/" + callPrefService.getCharPref('locale').toString() + ".xpi";
					
					}else{			

							window.location = cyberfoxModeURL + callPrefService.getCharPref('locale').toString() + ".xpi";
					
					}
				
		        break;

		    case "firefoxmode":
				
				window.location = firerfoxModeURL + webBrowserVersion.version + "/win32/xpi/" + callPrefService.getCharPref('locale').toString() + ".xpi";

		        break;

		    case "firefoxbetamode":
				
				window.location = firefoxBetaModeURL + callPrefService.getCharPref('locale').toString() + ".xpi";
				
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
				gLanguageManger.restartBrowser();
				
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
				gLanguageManger.restartBrowser();
				
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
gLanguageManger.removeOld();