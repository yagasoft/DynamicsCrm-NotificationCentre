/// <reference path="../../../../Yagasoft.Libraries/Yagasoft.Libraries.Common/Scripts/ldv_CommonGeneric.js" />
/// <reference path="../Refs/Xrm.Page.js" />

var NcIsParentParent = parent && !parent.$('#TabHome').length;
var NcParent = NcIsParentParent ? parent.parent : parent;
var NcIsProcessing = false;

NcParent.IsNcLoaded = NcParent.IsNcLoaded || false;
NcParent.NcSliderLastCheckList = NcParent.NcSliderLastCheckList || [];
NcParent.NcUnreadCount = NcParent.NcUnreadCount || 0;
NcParent.IsRegister = false;

var NcLoadingCounter = 3;

function InitNotificationsMenu()
{
	try
	{
		var isIconLoaded = NcParent.$('#ncMainContainer').length;

		if (NcIsProcessing || isIconLoaded)
		{
			return false;
		}

		NcIsProcessing = true;

		var postConfigActions =
			function()
			{
				if (!NcParent.NcSettings.IsEnabled)
				{
					return;
				}

				if (NcLoadingCounter > 0)
				{
					return;
				}

				if (!isIconLoaded)
				{
					AddNotificationsIcon();
					NcParent.IsRegister = true;
				}

				NcIsProcessing = false;

				if (NcParent.IsNcLoaded)
				{
					LoadWebResources('ldv_NotificationsCentreInitTriggerJs', null, NcParent);
					return;
				}

				var libraries = ['ldv_NotificationsCentreLibsJs', 'ldv_NotificationsCentreJs',
					'ldv_NotificationsCentreInitTriggerJs'];

				if (NcParent.IsCommonGenericLibraryLoaded)
				{}
				else
				{
					libraries.unshift('ldv_CommonGenericJs');
				}

				LoadWebResources(libraries, null, NcParent);

				LoadWebResourceCss('ldv_NotificationsCentreCss', NcParent);
				LoadWebResourceCss('ldv_NotificationsCentreLibsCss', NcParent);
			};

		if (NcParent.NcSettings)
		{
			NcLoadingCounter = 0;
			postConfigActions();
		}
		else
		{
			NcParent.NcSettings =
			{
				IsEnabled: false,
				CountPerPage: 10,
				RefreshInterval: 5,
				CounterLimit: 10,
				IsPopupEnabled: false,
				PopupTimeout: 10
			};

			NcParent.NcColours =
			{
				Main: '#BAE3FF',
				Links: '#0000FF'
			};

			var libraryLoadCallback =
				function()
				{
					FetchConfiguration(postConfigActions);
					FetchColours(postConfigActions);
				}

			if (window.IsCommonGenericLibraryLoaded)
			{
				libraryLoadCallback();
			}
			else
			{
				LoadWebResources('ldv_CommonGenericJs', libraryLoadCallback);
			}
		}

		return false;
	}
	catch (e)
	{
		console.error('Notifications Centre => InitNotificationsMenu');
		console.error(e);
	}

	return false;
}

function AddNotificationsIcon()
{
	try
	{
		NcParent.$('#navTabGroupDiv')
			.before('<span id="ncMainContainer" class="navTabButton">' +
				'<a href="#" class="navTabButtonLink" onkeypress="return true;" onclick="return false;" unselectable="on">' +
				'<span id="ncIcon" class="navTabButtonImageContainer" unselectable="on">' +
				'<img id="ncIconImage" src="' + Xrm.Page.context.getClientUrl() + '/WebResources/ldv_GlobePng52">' +
				'<span id="ncCounter" class="ncHiddenKeepSpace nc-counter-old"></span>' +
				//'<img id="ncQuickCreate" src="' + Xrm.Page.context.getClientUrl() + '/WebResources/ldv_PlusGreyIconPng25" />' +
				'</a>' +
				'<span id="ncTabDividerContainer" class="navTabButtonImageContainer" unselectable="on">' +
				'<img class="navTabDivider" alt="|" src="/_imgs/NavBar/NavBarDivider.png" unselectable="on">' +
				'</span>' +
				'</span>');

        
        NcParent.$('div[data-id="topBar"]').children(":last").children(":first")
            .prepend('<div id="ncMainContainer" class="navTabButton nc-new">' +
                '<a href="#" class="navTabButtonLink" onkeypress="return true;" onclick="return false;" unselectable="on">' +
                '<span id="ncIcon" class="navTabButtonImageContainer" unselectable="on">' +
                '<img id="ncIconImage" src="' + Xrm.Page.context.getClientUrl() + '/WebResources/ldv_GlobePng52">' +
                '<span id="ncCounter" class="ncHiddenKeepSpace nc-counter"></span>' +
                //'<img id="ncQuickCreate" src="' + Xrm.Page.context.getClientUrl() + '/WebResources/ldv_PlusGreyIconPng25" />' +
                '</a>' +
                '</div>');
        NcParent.$('#ncMainContainer').addClass(NcParent.$('[data-id="searchLauncher"]').attr('class'));
	}
	catch (e)
	{
		console.error('Notifications Centre => AddNotificationsIcon');
		console.error(e);
	}
}

function FetchConfiguration(callback)
{
	$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_genericconfigurations" +
				"?$select=ldv_isnotificationscentreenabled",
			beforeSend: function(xmlHttpRequest)
			{
				xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
				xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
				xmlHttpRequest.setRequestHeader("Accept", "application/json");
			},
			async: true,
			success: function(data, textStatus, xhr)
			{
				try
				{
					var results = data.value;

					for (var i = 0; i < results.length; i++)
					{
						NcParent.NcSettings.IsEnabled = results[i]["ldv_isnotificationscentreenabled"];
					}

					NcLoadingCounter--;
					callback();
				}
				catch (e)
				{
					console.error('Notifications Centre => FetchConfiguration => Generic Config Fetch');
					console.error(e);
				}
			},
			error: function(xhr, textStatus, errorThrown)
			{
				console.error('Notifications Centre => FetchConfiguration => Generic Config Fetch');
				console.error(xhr);
			}
		});

	$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_notificationscentreconfigs" +
				"?$select=ldv_counterlimit,ldv_countperpage,ldv_isdefault,ldv_ispopupenabled,ldv_popuptimeout" +
				",ldv_refreshinterval,_ownerid_value" +
				"&$filter=_ownerid_value eq " + GetUserId(true) + " or ldv_isdefault eq true",
			beforeSend: function(xmlHttpRequest)
			{
				xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
				xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
				xmlHttpRequest.setRequestHeader("Accept", "application/json");
			},
			async: true,
			success: function(data, textStatus, xhr)
			{
				try
				{
					var results = data.value;

					var fillSettings =
						function(config)
						{
							try
							{
								NcParent.NcSettings.CountPerPage = config["ldv_countperpage"] || 10;
								NcParent.NcSettings.RefreshInterval = config["ldv_refreshinterval"] || 5;
								NcParent.NcSettings.CounterLimit = config["ldv_counterlimit"] || 10;
								NcParent.NcSettings.IsPopupEnabled = config["ldv_ispopupenabled"];
								NcParent.NcSettings.PopupTimeout = config["ldv_popuptimeout"] || 5;
							}
							catch (e)
							{
								console.error('Notifications Centre => FetchConfiguration => Config Fetch' +
									' => fillSettings');
								console.error(e);
							}
						};
					
					var config = Search(results, 'ldv_isdefault', false, 1, true);

					if (config.length)
					{
						fillSettings(config[0]);
					}
					else
					{
						var defaultConfig = Search(results, 'ldv_isdefault', true, 1, true);

						if (defaultConfig.length)
						{
							fillSettings(defaultConfig[0]);
						}
					}

					NcLoadingCounter--;
					callback();
				}
				catch (e)
				{
					console.error('Notifications Centre => FetchConfiguration => Config Fetch');
					console.error(e);
				}
			},
			error: function(xhr, textStatus, errorThrown)
			{
				console.error('Notifications Centre => FetchConfiguration => Config Fetch');
				console.error(xhr);
			}
		});
}

function FetchColours(callback)
{
	$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/themes" +
				"?$select=globallinkcolor,navbarbackgroundcolor" +
				"&$filter=isdefaulttheme eq true",
			beforeSend: function(xmlHttpRequest)
			{
				xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
				xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
				xmlHttpRequest.setRequestHeader("Accept", "application/json");
			},
			async: true,
			success: function(data, textStatus, xhr)
			{
				try
				{
					var results = data.value;

					for (var i = 0; i < results.length; i++)
					{
						NcParent.NcColours.Main = results[i]["navbarbackgroundcolor"];
						NcParent.NcColours.Links = results[i]["globallinkcolor"];
					}

					NcLoadingCounter--;
					callback();
				}
				catch (e)
				{
					console.error('Notifications Centre => FetchConfiguration => Generic Config Fetch');
					console.error(e);
				}
			},
			error: function(xhr, textStatus, errorThrown)
			{
				console.error('Notifications Centre => FetchConfiguration => Generic Config Fetch');
				console.error(xhr);
			}
		});
}

//#region Helpers

function LoadWebResources(resources, callback, scopeWindow)
{
	/// <summary>
	///     Takes an array of resource names and loads them into the current context using "LoadScript".<br />
	///     The resources param accepts a string as well in case a single resource is needed instead.<br />
	///     Author: Ahmed Elsawalhy
	/// </summary>
	/// <param name="resources" type="String[] | string" optional="false">The resource[s] to load.</param>
	/// <param name="callback" type="Function" optional="true">A function to call after resource[s] has been loaded.</param>
	try
	{
		if (resources.length <= 0)
		{
			if (callback)
			{
				callback();
			}

			return;
		}

		if (typeof resources === 'string')
		{
			resources = [resources];
		}

		var localCallback = function()
		{
			try
			{
				if (resources.length > 1)
				{
					LoadWebResources(resources.slice(1, resources.length), callback, scopeWindow);
				}
				else
				{
					if (callback)
					{
						callback();
					}
				}
			}
			catch (e)
			{
				console.error('Notifications Centre => LoadWebResources => localCallback');
				console.error(e);
			}
		};

		LoadScript(Xrm.Page.context.getClientUrl() + '/WebResources/' + resources[0], localCallback, scopeWindow);
	}
	catch (e)
	{
		console.error('Notifications Centre => LoadWebResources');
		console.error(e);
	}
}

function LoadScript(url, callback, scopeWindow)
{
	/// <summary>
	///     Takes a URL of a script file and loads it into the current context, and then calls the function passed.<br />
	///     Author: Ahmed Elsawalhy<br />
	///     credit: http://stackoverflow.com/a/950146/1919456
	/// </summary>
	/// <param name="url" type="String" optional="false">The URL to the script file.</param>
	/// <param name="callback" type="Function" optional="true">The function to call after loading the script.</param>

	// Adding the script tag to the head as suggested before
	try
	{
		scopeWindow = scopeWindow || window;
		var head = scopeWindow.document.getElementsByTagName('head')[0];
		var script = scopeWindow.document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.

		if (callback)
		{
			//script.onreadystatechange = callback;
			script.onload = callback;
		}

		// Fire the loading
		head.appendChild(script);
	}
	catch (e)
	{
		console.error('Notifications Centre => LoadScript');
		console.error(e);
	}
}

function LoadWebResourceCss(fileName, scopeWindow)
{
	try
	{
		// modified it to be generic -- Sawalhy
		LoadCss(Xrm.Page.context.getClientUrl() + '/WebResources/' + fileName, scopeWindow);
	}
	catch (e)
	{
		console.error('Notifications Centre => LoadWebResourceCss');
		console.error(e);
	}
}

function LoadCss(path, scopeWindow)
{
	try
	{
		scopeWindow = scopeWindow || window;
		var head = scopeWindow.document.getElementsByTagName('head')[0];
		var link = scopeWindow.document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = path;
		link.media = 'all';
		head.appendChild(link);
	}
	catch (e)
	{
		console.error('Notifications Centre => LoadCss');
		console.error(e);
	}
}

//#endregion
