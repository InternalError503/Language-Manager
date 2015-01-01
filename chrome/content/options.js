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

		//Top navigation bar
		var navBarTitle = document.getElementById("NavTitle");
		var navBarSupport = document.getElementById("NavSupport");
		var navBarContact = document.getElementById("NavContact");
		var navBarSupport2 = document.getElementById("NavSupport2");
		var navBarContact2 = document.getElementById("NavContact2");
		
		//Reset language button
		var OptionsButtonReset = document.getElementById("resetLanguage");				
		
		//Panel label
		var OptionsPanelTitle = document.getElementById("OptionsPanel");		
		
		//Show what browser mode firefox or firefox beta or cyberfox.
		var OptionsBrowserMode = document.getElementById("BrowserMode");	

		
		//Copyright message.
		var CopyrightLabel = document.getElementById("labelCopy");
		
		//Select time and date format.
		var OptionsSelectTimeDate = document.getElementById("SelectTimeDate");
				var OptionsSelectTimeDateMenuDefault = document.getElementById("defaultFormat");		
				var OptionsSelectTimeDateMenuD = document.getElementById("form-time-date-default");
				var OptionsSelectTimeDateMenuB = document.getElementById("form-time-date-basic-d");
				var OptionsSelectTimeDateMenuTD = document.getElementById("form-time-date-basic-td");		
		
		//Window title
		document.title = _bundleOptionsWindow.GetStringFromName("lmOptionsTitle");
		//Top navigation bar
		navBarTitle.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarTitle");		
		navBarSupport.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarSupport");
		navBarContact.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarContact");
		navBarSupport2.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarSupport");
		navBarContact2.textContent = " " + _bundleOptionsWindow.GetStringFromName("lmOptionsNavBarContact");
		
		//Reset language button
		OptionsButtonReset.textContent = _bundleOptionsWindow.GetStringFromName("lmCurrentLanguageReset");	
		
		//Options panel label
		OptionsPanelTitle.textContent = _bundleOptionsWindow.GetStringFromName("lmOptionsPanelTitle");
		
		//Show browser mode label.
		OptionsBrowserMode.textContent = _bundleOptionsWindow.GetStringFromName("lmBrowserMode");

				
		//Copyright message.
		CopyrightLabel.textContent = _bundleOptionsWindow.GetStringFromName("lmCopyright");

		//Select time and date format.		
		OptionsSelectTimeDate.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDate");
				OptionsSelectTimeDateMenuDefault.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuDefault");
				OptionsSelectTimeDateMenuD.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuD");
				OptionsSelectTimeDateMenuB.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuB");
				OptionsSelectTimeDateMenuTD.textContent = _bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuTD");

		
//Browser information			
var browserAppInformation = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo); 	

		//Note: We don't show any values on the first run, Once language_Manager.xul has be initialized and the browser verified then we can display a value here.	
		//Show what browser mode firefox or firefox beta or cyberfox.
		var OptionsBrowser_Mode = document.getElementById("form-browser-mode");
		switch (ServicesPref.getCharPref("browser_mode")) {

		    case "cyberfoxmode":
				OptionsBrowser_Mode.textContent = _bundleOptionsWindow.GetStringFromName("lmBrowserModeCF");
			break;

		    case "firefoxmode":
				OptionsBrowser_Mode.textContent = _bundleOptionsWindow.GetStringFromName("lmBrowserModeFF");
		    break;

		    case "firefoxbetamode":
				OptionsBrowser_Mode.textContent = _bundleOptionsWindow.GetStringFromName("lmBrowserModeFFB");
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
	
