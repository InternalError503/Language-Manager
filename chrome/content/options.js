// Copyright (c) 2014 8pecxstudios

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

//Import services
Cu.import("resource://gre/modules/Services.jsm");
//Query nsIPrefBranch see: Bug 1125570 | Bug 1083561
Services.prefs.QueryInterface(Ci.nsIPrefBranch);

//Get string sets to localized content.
var bundleOptionsWindow = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle("chrome://LanguageManager/locale/options.properties");

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
		document.title = bundleOptionsWindow.GetStringFromName("lmOptionsTitle");
		//Top navigation bar
		navBarTitle.textContent = bundleOptionsWindow.GetStringFromName("lmOptionsNavBarTitle");		
		navBarSupport.textContent = bundleOptionsWindow.GetStringFromName("lmOptionsNavBarSupport");
		navBarContact.textContent = bundleOptionsWindow.GetStringFromName("lmOptionsNavBarContact");
		navBarSupport2.textContent = bundleOptionsWindow.GetStringFromName("lmOptionsNavBarSupport");
		navBarContact2.textContent = " " + bundleOptionsWindow.GetStringFromName("lmOptionsNavBarContact");
		
		//Reset language button
		OptionsButtonReset.textContent = bundleOptionsWindow.GetStringFromName("lmCurrentLanguageReset");	
		
		//Options panel label
		OptionsPanelTitle.textContent = bundleOptionsWindow.GetStringFromName("lmOptionsPanelTitle");
		
		//Show browser mode label.
		OptionsBrowserMode.textContent = bundleOptionsWindow.GetStringFromName("lmBrowserMode");

				
		//Copyright message.
		CopyrightLabel.textContent = bundleOptionsWindow.GetStringFromName("lmCopyright");

		//Select time and date format.		
		OptionsSelectTimeDate.textContent = bundleOptionsWindow.GetStringFromName("lmSelectTimeDate");
				OptionsSelectTimeDateMenuDefault.textContent = bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuDefault");
				OptionsSelectTimeDateMenuD.textContent = bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuD");
				OptionsSelectTimeDateMenuB.textContent = bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuB");
				OptionsSelectTimeDateMenuTD.textContent = bundleOptionsWindow.GetStringFromName("lmSelectTimeDateMenuTD");

		
//Browser information			
var browserAppInformation = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo); 	

		//Note: We don't show any values on the first run, Once language_Manager.xul has be initialized and the browser verified then we can display a value here.	
		//Show what browser mode firefox or firefox beta or cyberfox.
		var OptionsBrowser_Mode = document.getElementById("form-browser-mode");
		switch (Services.prefs.getCharPref("extensions.language_manager.browser_mode")) {

		    case "cyberfoxmode":
				OptionsBrowser_Mode.textContent = bundleOptionsWindow.GetStringFromName("lmBrowserModeCF");
			break;

		    case "firefoxmode":
				OptionsBrowser_Mode.textContent = bundleOptionsWindow.GetStringFromName("lmBrowserModeFF");
		    break;

		    case "firefoxbetamode":
				OptionsBrowser_Mode.textContent = bundleOptionsWindow.GetStringFromName("lmBrowserModeFFB");
		    break;

		}
		
		switch (Services.prefs.getCharPref("extensions.language_manager.time-date_mode")) {

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
		
	document.getElementById("current-locale").textContent = bundleOptionsWindow.GetStringFromName("lmCurrentLanguage") +" "+ Services.prefs.getCharPref("general.useragent.locale").toString();	

			}catch (e){
				//Catch any nasty errors and output to dialogue and console
				alert("Were sorry but something has gone wrong! " + e);
		}
	
},

timeDateFormatChanged: function(){

	try{
	
        switch (document.getElementById("form-time-date").value) {
        
            case "default_tnd":
                Services.prefs.setCharPref("extensions.language_manager.time-date_mode", "default");
            break;
 
            case "basic_date":
                Services.prefs.setCharPref("extensions.language_manager.time-date_mode", "basicdate");
            break;

            case "basic_time":
                Services.prefs.setCharPref("extensions.language_manager.time-date_mode", "timedate");
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
		Services.prefs.clearUserPref("general.useragent.locale");

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
	
