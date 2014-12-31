// Copyright (c) 2014 8pecxstudios

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

var ServicesPrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("general.useragent.");
var ServicesPref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.language_manager.");

//Get string sets to localised content.
var localisedContent = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService); 
var _bundleOptionsWindow = localisedContent.createBundle("chrome://LanguageManager/locale/options.properties");

var gLanguageMangerOptions = {

init: function(){

try{

//Localise Content	
		var navBarTitle = document.getElementById("NavTitle");
		var navBarSupport = document.getElementById("NavSupport");
		var navBarContact = document.getElementById("NavContact");
		var navBarSupport2 = document.getElementById("NavSupport2");
		var navBarContact2 = document.getElementById("NavContact2");		
		var OptionsPanelTitle = document.getElementById("OptionsPanel");
		var OptionsSelectBrowser = document.getElementById("SelectBrowser");
				var OptionsSelectBrowserMenuCF = document.getElementById("form-cyberfox-mode");
				var OptionsSelectBrowserMenuFF = document.getElementById("form-firefox-mode");
				var OptionsSelectBrowserMenuFFB = document.getElementById("form-firefoxbeta-mode");
		var OptionsButtonReset = document.getElementById("resetLanguage");				
		var CopyrightLabel = document.getElementById("labelCopy");
		
		var OptionsSelectTimeDate = document.getElementById("SelectTimeDate");
				var OptionsSelectTimeDateMenuD = document.getElementById("form-time-date-default");
				var OptionsSelectTimeDateMenuB = document.getElementById("form-time-date-basic-d");
				var OptionsSelectTimeDateMenuTD = document.getElementById("form-time-date-basic-td");		
		
		
		document.title = _bundleOptionsWindow.GetStringFromName("lmOptionsTitle");
		navBarTitle.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarTitle");		
		navBarSupport.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarSupport");
		navBarContact.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarContact");
		navBarSupport2.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarSupport");
		navBarContact2.textContent = " " + _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarContact");		
		OptionsPanelTitle.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsPanelTitle");
		OptionsSelectBrowser.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectBrowser");
				OptionsSelectBrowserMenuCF.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectBrowserMenuCF");
				OptionsSelectBrowserMenuFF.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectBrowserMenuFF");
				OptionsSelectBrowserMenuFFB.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectBrowserMenuFFB");
		OptionsButtonReset.textContent = _bundleOptionsWindow.GetStringFromName("lmCurrentLanguageReset");	
		CopyrightLabel.textContent = _bundleOptionsWindow.GetStringFromName("lmCopyright");
		
		OptionsSelectTimeDate.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDate");
				OptionsSelectTimeDateMenuD.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuD");
				OptionsSelectTimeDateMenuB.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuB");
				OptionsSelectTimeDateMenuTD.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuTD");

		
//Firefox mode	
var firefoxModePreference = document.getElementById("form-firefox-mode");

//Browser information			
var browserAppInformation = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo); 	

						
		//Check if browser Cyberfox
		if (browserAppInformation.name.toLowerCase() === "Cyberfox".toLowerCase()) {
		     ServicesPref.setCharPref("browser_mode", "cyberfoxmode");
		     firefoxModePreference.setAttribute('disabled', true);
		}

		//Check if browser Firefox
		if (browserAppInformation.name.toLowerCase() === "Firefox".toLowerCase()) {
			
			if (ServicesPref.getBoolPref("firefoxfirstrun") === false){
					ServicesPref.setCharPref("browser_mode", "firefoxmode");
					ServicesPref.setBoolPref("firefoxfirstrun", true);
				}
				
			document.getElementById("form-cyberfox-mode").setAttribute('disabled', true);		
				
		}

		switch (ServicesPref.getCharPref("browser_mode")) {

		    case "cyberfoxmode":
				document.getElementById("form-browser-select").value = "browser_cyberfox";
				document.getElementById("form-browser-select").setAttribute('disabled', true);
		        document.getElementById("form-firefoxbeta-mode").setAttribute('disabled', true);
		        break;

		    case "firefoxmode":
				document.getElementById("form-browser-select").value = "browser_firefox";
		        break;

		    case "firefoxbetamode":
				document.getElementById("form-browser-select").value = "browser_beta";
		        break;

		}
		
		switch (ServicesPref.getCharPref("time-date_mode")) {

		    default:
				document.getElementById("form-time-date").value = "default_tnd";
		    break;

		    case "basicdate":
				document.getElementById("form-time-date").value = "basic_date";
		    break;

		    case "timedate":
				document.getElementById("form-time-date").value = "basic_time";
		    break;

		}		
		
	document.getElementById("current-locale").textContent = _bundleOptionsWindow.GetStringFromName("lmCurrentLanguage") +" "+ ServicesPrefs.getCharPref("locale").toString();	

			}catch (e){
				//Catch any nasty errors and output to dialogue and console
				alert("Were sorry but something has gone wrong! " + e);
		}
	
},

browserModeChanged: function(){

	try{
	
        switch (document.getElementById("form-browser-select").value) {
        
            case "browser_cyberfox":
                ServicesPref.setCharPref("browser_mode", "cyberfoxmode");
            break;
 
            case "browser_firefox":
                ServicesPref.setCharPref("browser_mode", "firefoxmode");
                break;

            case "browser_beta":
                ServicesPref.setCharPref("browser_mode", "firefoxbetamode");
                break;

        }
		
			}catch (e){
				//Catch any nasty errors and output to dialogue and console
				alert("Were sorry but something has gone wrong! " + e);
		}		

},

timeDateFormatChanged: function(){

	try{
	
        switch (document.getElementById("form-time-date").value) {
        
            case "default_tnd":
                ServicesPref.setCharPref("time-date_mode", "default");
            break;
 
            case "basic_date":
                ServicesPref.setCharPref("time-date_mode", "basicdate");
            break;

            case "basic_time":
                ServicesPref.setCharPref("time-date_mode", "timedate");
             break;

        }
		
			}catch (e){
				//Catch any nasty errors and output to dialogue and console
				alert("Were sorry but something has gone wrong! " + e);
		}		

},

restoreDefaultLanguage: function(){

	try{
		//Clear locale 
		ServicesPrefs.clearUserPref("locale");

		//Refresh preference
		var container = document.getElementById("form-clear-locale");
			var content = container.textContent;
				container.textContent = content;
			
			}catch (e){
				//Catch any nasty errors and output to dialogue and console
				alert("Were sorry but something has gone wrong! " + e);
		}			

	}
				
}

window.addEventListener("load", function () { gLanguageMangerOptions.init(); }, false);
	
