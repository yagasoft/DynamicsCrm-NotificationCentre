/// <reference path="../Refs/Xrm.Page.js" />
var NcIsParentParent = parent && parent.parent && !parent.parent.$('#TabHome').length;
var NcParent = NcIsParentParent ? parent.parent : parent;

var NcIsProcessing = false;

var IsNcLoaded = window.IsNcLoaded || false;
var NcSliderLastCheckList = window.NcSliderLastCheckList || [];
var NcUnreadCount = window.NcUnreadCount || 0;
var NcIsRegister = false;

var NcSettings = window.NcSettings;
var NcColours = window.NcColours;

var NcSliderLastCheckList = window.NcSliderLastCheckList || [];
var NcUnreadCount = window.NcUnreadCount || 0;
var NcLatestMinUnreadDate;
var NcLatestMenuOpenDate;

var NcSource =
{
	1: '/_imgs/ico_16_4402.gif',
	2: '/_imgs/ico_16_4202.gif',
	3: '/_imgs/ico_16_4212.gif',
	999: '/_imgs/ico_16_1152.gif'
};

var NcOutsideClickHandlers = [];

async function InitNotificationsMenu()
{
	try
	{
		if (NcIsProcessing || IsNcLoaded)
		{
			return false;
		}

		NcIsProcessing = true;

		const isIconLoaded = NcParent.$('#ncMainContainer').length;

		if (isIconLoaded)
		{
			NcIsProcessing = false;
			return false;
		}

		if (!NcSettings)
		{
			NcSettings =
			{
				IsEnabled: false,
				CountPerPage: 10,
				RefreshInterval: 5,
				CounterLimit: 10,
				IsPopupEnabled: true,
				PopupTimeout: 5
			};

			NcColours =
			{
				Main: '#BAE3FF',
				Links: '#0000FF'
			};

			const coloursPromise = FetchColours();

			for (let i = 0; i < 20; i++)
			{
				if (window.IsCommonGenericLibraryLoaded)
				{
					break;
				}

				console.warn('[NC] Waiting 100ms for the Common Library to load ...');
				await new Promise(resolve => setTimeout(resolve, 100));
			}

			await Promise.all([FetchConfiguration(), coloursPromise]);
		}

		if (!NcSettings.IsEnabled)
		{
			return false;
		}

		AddNotificationsIcon();
		NcIsRegister = true;

		NcIsProcessing = false;

		InitNc();

		LoadWebResourceCss('ldv_NotificationsCentreCss', NcParent);
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

async function FetchConfiguration()
{
	try
	{
		const a1 = NcParent.$.ajax({
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
			}
		});

		const userId = GetUserId(true);

		const a2 = NcParent.$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_notificationscentreconfigs" +
				"?$select=ldv_notificationscentreconfigid,ldv_counterlimit,ldv_countperpage,ldv_isdefault,ldv_ispopupenabled,ldv_popuptimeout"
				+
				",ldv_refreshinterval,_ownerid_value" +
				"&$filter=_ownerid_value eq " + userId + " or ldv_isdefault eq true",
			beforeSend: function(xmlHttpRequest)
			{
				xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
				xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
				xmlHttpRequest.setRequestHeader("Accept", "application/json");
			}
		});

		const [modConfigResult, userConfigResult] = await Promise.all([a1, a2]);

		const modConfig = modConfigResult.value;
		NcSettings.IsEnabled = (modConfig[0] ?? {})["ldv_isnotificationscentreenabled"] ?? false;

		const userConfig = userConfigResult.value;
		const config = (Search(userConfig, 'ldv_isdefault', false, 1, true) ?? [])[0] ?? {};
		const defaultConfig = (Search(userConfig, 'ldv_isdefault', true, 1, true) ?? [])[0] ?? {};

		NcSettings.Id = config["ldv_notificationscentreconfigid"];
		NcSettings.CountPerPage = config["ldv_countperpage"] ?? defaultConfig["ldv_countperpage"]
			?? NcSettings.CountPerPage;
		NcSettings.RefreshInterval = config["ldv_refreshinterval"] ?? defaultConfig["ldv_refreshinterval"]
			?? NcSettings.RefreshInterval;
		NcSettings.CounterLimit = config["ldv_counterlimit"] ?? defaultConfig["ldv_counterlimit"]
			?? NcSettings.CounterLimit;
		NcSettings.IsPopupEnabled = config["ldv_ispopupenabled"] ?? defaultConfig["ldv_ispopupenabled"]
			?? NcSettings.IsPopupEnabled;
		NcSettings.PopupTimeout = config["ldv_popuptimeout"] ?? defaultConfig["ldv_popuptimeout"]
			?? NcSettings.PopupTimeout;

		if (!NcSettings.Id)
		{
			NcSettings.Id = (await Xrm.WebApi.online
				.createRecord("ldv_notificationscentreconfig",
					{
						"ownerid@odata.bind": `/systemusers(${userId})`
					})).id;
		}
	}
	catch (e)
	{
		console.error('Notifications Centre => FetchConfiguration => Config Fetch');
		console.error(e);
	}
}

async function FetchColours()
{
	try
	{
		const results = await NcParent.$.ajax({
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
			}
		});

		const colours = (results.value ?? [])[0] ?? {};

		NcColours.Main = colours["navbarbackgroundcolor"] ?? NcColours.Main;
		NcColours.Links = colours["globallinkcolor"] ?? NcColours.Links;
	}
	catch (e)
	{
		console.error('Notifications Centre => FetchConfiguration => Generic Config Fetch');
		console.error(e);
	}
}

function InitNc()
{
	try
	{
		if (NcIsRegister)
		{
			NcIsRegister = false;
			CreatePalette();
			RegisterNcIconClick();
			UpdateCounter();

			if (!IsNcLoaded)
			{
				IsNcLoaded = true;
				InitRefreshInterval();
			}
		}
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function RegisterNcIconClick()
{
	NcParent.$("#ncIcon")
		.click(function()
		{
			try
			{
				NcMenu().OpenMenu(this);
				StoreValueInLocalStorage('NcLatestMenuOpenDate', new Date().toISOString());
			}
			catch (e)
			{
				console.error('Notifications Centre => RegisterNcIconClick => icon click');
				console.error(e);
			}
		});
}

function InitRefreshInterval()
{
	try
	{
		var loop = function()
		{
			setTimeout(function()
			{
				try
				{
					CheckUnread(NcSettings.IsPopupEnabled, loop);
				}
				catch (e)
				{
					console.error('Notifications Centre => InitRefreshInterval => loop timeout');
					console.error(e);
				}
			}, NcSettings.RefreshInterval * 1000);
		};

		loop();
		CheckUnread(false);
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function NcIsNew()
{
	return !!NcParent.$('.nc-new').length;
}

function CreatePalette()
{
	try
	{
		NcColours.Unread = shade(NcColours.Main, IsDarkColour(NcColours.Main) ? 0.8 : 0.4);
		NcColours.Hover = shade(NcColours.Main, IsDarkColour(NcColours.Main) ? 0.95 : 0.65);
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function CheckUnread(isPopup, callback)
{
	try
	{
		GetUnreadMessages(function(unreadMessages)
		{
			try
			{
				NcUnreadCount = unreadMessages.length;
				UpdateCounter();

				if (isPopup)
				{
					PopupUnread(unreadMessages);
				}

				NcSliderLastCheckList = unreadMessages;
			}
			catch (e)
			{
				console.error('Notifications Centre => CheckUnread => GetUnreadMessages');
				console.error(e);
			}

			try
			{
				if (callback)
				{
					callback();
				}
			}
			catch (e)
			{
				console.error('Notifications Centre => CheckUnread => GetUnreadMessages => callback');
				console.error(e);
			}
		});
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);

		try
		{
			if (callback)
			{
				callback();
			}
		}
		catch (e)
		{
			console.error('Notifications Centre => CheckUnread => callback');
			console.error(e);
		}
	}
}

function UpdateCounter()
{
	try
	{
		var counterElement = NcParent.$('#ncCounter');

		if (!counterElement.length)
		{
			return;
		}

		if (!NcUnreadCount)
		{
			counterElement.addClass('ncHiddenKeepSpace');
			return;
		}

		counterElement.removeClass('ncHiddenKeepSpace');

		var counterText = NcUnreadCount > NcSettings.CounterLimit
							  ? NcSettings.CounterLimit + '+'
							  : NcUnreadCount;
		counterElement[0].innerHTML = counterText;
		//NcParent.$('#ncIconImage').css('margin-right', (-10 + (counterText.toString().length * 7)) + 'px');
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function PopupUnread(unreadMessages)
{
	try
	{
		var popupBar = NcParent.$('#ncPopupBar');

		if (!popupBar.length)
		{
			popupBar = NcParent.$(
				'<div id="ncPopupBar" class="mainContainer">' +
				'<div id="ncPopupBarListContainer" style="position:relative;">' +
				'<div id="ncPopupBarList"></div>' +
				'</div>' +
				'</div>');
			NcParent.$('body').append(popupBar);
			popupBar.hide();
		}

		var bar = NcParent.$('#ncPopupBarList');
		var suffix = 'PopupBar';

		for (var i = 0; i < unreadMessages.length; i++)
		{
			if ((!NcLatestMinUnreadDate || new Date(unreadMessages[i].date) > NcLatestMinUnreadDate)
				&& !Contains(NcSliderLastCheckList, null, unreadMessages[i]))
			{
				GetMessage(unreadMessages[i].id, function(message)
				{
					try
					{
						var messageElement = BuildMessageElement(message, bar.width(), suffix);
						var separator = NcParent.$('#dummy');

						if (popupBar.height() > 5)
						{
							separator = NcParent.$('<hr id="separator_' + message.id + '_' + suffix + '" class="ncSeparator">');
						}

						bar.prepend(separator);
						bar.prepend(messageElement);
						messageElement.hide();
						messageElement.fadeIn(1000);
						popupBar.show();

						var timeout =
							setTimeout(function()
							{
								try
								{
									HidePopupMessage(message.id);
								}
								catch (e)
								{
									console.error('Notifications Centre => PopupUnread => GetMessage => timeout');
									console.error(e);
								}
							}, NcSettings.PopupTimeout * 1000);

						messageElement
							.click(function()
							{
								try
								{
									clearTimeout(timeout);
									HidePopupMessage(message.id, true);
								}
								catch (e)
								{
									console.error('Notifications Centre => PopupUnread => GetMessage => messageElement click');
									console.error(e);
								}
							});

						messageElement
							.hover(function()
							{
								try
								{
									clearTimeout(timeout);
								}
								catch (e)
								{
									console.error('Notifications Centre => PopupUnread => GetMessage => messageElement hover');
									console.error(e);
								}
							});
					}
					catch (e)
					{
						console.error('Notifications Centre => PopupUnread => GetMessage');
						console.error(e);
					}
				});
			}
		}

		if (unreadMessages.length)
		{
			NcLatestMinUnreadDate = new Date(unreadMessages[unreadMessages.length - 1].date);
		}
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function HidePopupMessage(messageId, isInstantHide)
{
	try
	{
		var suffix = 'PopupBar';
		var timer = 5000;

		var message = NcParent.$('#' + messageId + '_' + suffix);

		if (!message.length)
		{
			return;
		}

		var hide =
			function()
			{
				try
				{
					message.remove();
					NcParent.$('#' + 'separator_' + messageId + '_' + suffix).remove();
					NcParent.$('#' + 'hover_' + messageId + '_' + suffix).remove();
					NcParent.$('#' + 'hover_undefined_' + suffix).remove();

					var popupBar = NcParent.$('#ncPopupBar');

					if (popupBar.height() < 5)
					{
						popupBar.hide();
					}
				}
				catch (e)
				{
					console.error('Notifications Centre => HidePopupMessage => hide');
					console.error(e);
				}
			};

		if (isInstantHide)
		{
			hide();
			return;
		}

		message
			.hover(
				function()
				{
					try
					{
						NcParent.$(this).stop().animate({ opacity: '1' });
					}
					catch (e)
					{
						console.error('Notifications Centre => HidePopupMessage => message hover');
						console.error(e);
					}
				});

		message.fadeTo(timer, '0.3', hide);
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

var NcMenu = function()
{
	var ncFrame;
	var ncListContainer;
	var ncList;

	var isLoading;
	var isReachedEnd;

	var messagesList = [];
	var pagingInfo =
		{
			NextPage: 1,
			Count: NcSettings.CountPerPage,
			PagingCookie: null
		};

	function openMenu(buttonElement)
	{
		try
		{
			ncFrame = NcParent.$('#ncFrame');

			if (ncFrame.length && NcParent.$('#ncFrame').css('display') !== 'none')
			{
				CloseMenu(ncFrame);
				return;
			}

			drawMenu(buttonElement);
			showNextBatch();

			var image = NcParent.$('#ncIconImage');
			image.stop(true);
			image.fadeTo(100, 0.30, function ()
			{
				try
				{
					image.attr('src', GetOrgUrl() + '/WebResources/ldv_GlobeGlowPng52');
				}
				catch (e)
				{
					console.error('Notifications Centre => NcMenu => openMenu => fadeTo');
					console.error(e);
				}
			}).fadeTo(300, 1);
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function drawMenu(buttonElement)
	{
		try
		{
			// credit: http://stackoverflow.com/a/158176/1919456
			var pos = NcParent.$(buttonElement).position();
			ncFrame = NcParent.$('<div id="ncFrame" class="ncNoLoading mainContainer arrow_box">' +
					'<div id="ncListContainer">' +
					'<div id="ncList"></div>' +
					'</div>' +
					'</div>')
				.css({
						top: pos.top + (NcIsNew() ? 29 : 62) + 'px',
						left: pos.left - 2 + 'px'
					});
			NcParent.$('body').append(ncFrame);
			ncFrame.hide();

			ncListContainer = NcParent.$('#ncListContainer');
			ncListContainer.perfectScrollbar();
			ncList = NcParent.$('#ncList');

			var timeout;

			// on scroll to bottom, load new batch of messages
			// credit: http://stackoverflow.com/a/6271466/1919456
			ncListContainer.bind('scroll', function()
			{
				try
				{
					clearTimeout(timeout);
					var element = NcParent.$(this);

					// use timeout to have the ability to clear others because sometimes this event is triggered twice
					timeout =
						setTimeout(function()
						{
							try
							{
								if (element.scrollTop() + element.innerHeight() + 0.5 >= element[0].scrollHeight)
								{
									showNextBatch();
								}
							}
							catch (e)
							{
								console.error('Notifications Centre => NcMenu => drawMenu => scroll => timeout');
								console.error(e);
							}
						}, 200);
				}
				catch (e)
				{
					console.error('Notifications Centre => NcMenu => drawMenu => scroll');
					console.error(e);
				}
			});

			var outsideClickHideHandler = function(event)
			{
				try
				{
					unregisterOutsideClick();

					if (!NcParent.$(event.target).closest('#ncFrame').length
						&& !NcParent.$(event.target).closest('#ncIcon').length)
					{
						CloseMenu(ncFrame);
					}
				}
				catch (e)
				{
					console.error('Notifications Centre => NcMenu => drawMenu => outsideClickHideHandler');
					console.error(e);
				}
			};

			NcParent.$(NcParent).on('mouseup', outsideClickHideHandler);
			NcOutsideClickHandlers.push({ window: NcParent, handler: outsideClickHideHandler });
			registerOutsideClick(NcParent.$(NcParent.document));

			ncFrame.prepend('<div id="ncTopBar">' +
				'<div id="ncNewIconContainer">' +
				'<a href="#">' +
				'<img id="ncNewIcon" src="' + Xrm.Page.context.getClientUrl() + '/WebResources/ldv_PlusGreyIconPng25" />' +
				'<div id="ncNewIconText"> Create a New Notification</div>' +
				'</a>' +
				'</div>' +
				'</div>');

			registerNcQuickCreateClick();

			ncFrame.fadeIn(600);
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function registerOutsideClick(element)
	{
		try
		{
			var iframes = NcParent.$('iframe', element);
			iframes = iframes.length ? iframes : (element.length ? NcParent.$('iframe', element.contents()) : []);

			var outsideClickHideHandler = function(event)
			{
				try
				{
					unregisterOutsideClick();

					if (!NcParent.$(event.target).closest('#ncFrame').length
						&& !NcParent.$(event.target).closest('#ncIcon').length)
					{
						CloseMenu(ncFrame);
					}
				}
				catch (e)
				{
					console.error('Notifications Centre => NcMenu => registerOutsideClick => outsideClickHideHandler');
					console.error(e);
				}
			};

			for (var i = 0; i < iframes.length; i++)
			{
				var contentWindow = iframes[i].contentWindow;

				if (contentWindow)
				{
					NcParent.$(contentWindow).on('mouseup', outsideClickHideHandler);
					NcOutsideClickHandlers.push({ window: contentWindow, handler: outsideClickHideHandler });
				}

				registerOutsideClick(NcParent.$(iframes[i]));
			}
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function unregisterOutsideClick()
	{
		try
		{
			for (const handlerPair of NcOutsideClickHandlers)
			{
				NcParent.$(handlerPair.window).off('mouseup', handlerPair.handler);
			}

			NcOutsideClickHandlers = [];
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function registerNcQuickCreateClick()
	{
		NcParent.$("#ncNewIconContainer")
			.click(function(event)
			{
				try
				{
					openQuickCreate();
				}
				catch (e)
				{
					console.error('Notifications Centre => RegisterNcIconClick => icon click');
					console.error(e);
				}
			});
	}

	function openQuickCreate()
	{
		CloseMenu(ncFrame);

		Xrm.Utility.openQuickCreate('ldv_notificationmessage', null, null);

		setTimeout(function()
		{
			try
			{
				var formWindow = NcParent.$('#NavBarGloablQuickCreate')[0].contentWindow;
				LoadWebResources(['ldv_CommonGenericJs', 'ldv_CommonGenericSchemaJs', 'ldv_NotificationsCentreFormJs'],
					null, formWindow);
			}
			catch (e)
			{
				console.error('Notifications Centre => NcMenu => openQuickCreate => timeout');
				console.error(e);
			}
		}, 500);
	}

	function showNextBatch()
	{
		try
		{
			fetchMessages(false, function(newMessages)
			{
				try
				{
					updateMessagesList(false, newMessages);

					if (newMessages.length < pagingInfo.Count && !isReachedEnd)
					{
						showNextBatch();
					}
				}
				catch (e)
				{
					console.error('Notifications Centre => NcMenu => openMenu => fetchMessages');
					console.error(e);
				}
			});
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function fetchMessages(isRefresh, callback)
	{
		try
		{
			// reached the end
			if (isLoading || isReachedEnd)
			{
				return;
			}

			setListLoading(true);

			var userId = GetUserId();

			var parameters = {};
			var user = {};
			user.systemuserid = userId;
			user["@odata.type"] = "Microsoft.Dynamics.CRM.systemuser";
			parameters.User = user;
			parameters.Count = pagingInfo.Count;
			parameters.Page = isRefresh ? 1 : pagingInfo.NextPage++;
			parameters.Cookie = pagingInfo.PagingCookie;

			var loadFunction = function()
			{
				NcParent.$.ajax({
						type: "POST",
						contentType: "application/json; charset=utf-8",
						datatype: "json",
						url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ys_NotifyCentreGetMessages",
						data: JSON.stringify(parameters),
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
								pagingInfo.PagingCookie = data.NewCookie;

								var results = JSON.parse((data.Messages).replace(/\\"/g, '\"'));
								var newMessages = [];

								for (var i = 0; i < results.length; i++)
								{
									var messageObject = results[i];
									// TODO
									//messageObject.isRead = messageObject.isRead === 'true';
									messageObject.regarding = messageObject.regarding || {};

									if (!Contains(messagesList, null, messageObject.id))
									{
										newMessages.push(messageObject);
										messagesList.push(messageObject.id);
									}
								}

								isReachedEnd = data.IsReadEnd;

								if (callback)
								{
									callback(newMessages);
								}
							}
							catch (e)
							{
								console.error('Notifications Centre => NcMenu => fetchMessages => ajax');
								console.error(e);
							}
							finally
							{
								setListLoading(false);
							}
						},
						error: function(xhr, textStatus, errorThrown)
						{
							try
							{
								pagingInfo.NextPage--;
								setListLoading(false);
								console.error(xhr);
							}
							catch (e)
							{
								console.error('Notifications Centre => NcMenu => fetchMessages => ajax error');
								console.error(e);
							}
						}
					});
			};

			// delay loading a bit to give the UI a chance to draw
			// start from '2' because it was incremented above
			if (pagingInfo.NextPage === 2)
			{
				setTimeout(loadFunction, 300);
			}
			else
			{
				loadFunction();
			}
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function setListLoading(isLoadingLocal)
	{
		try
		{
			isLoading = isLoadingLocal;

			if (isLoadingLocal)
			{
				ncListContainer.append(
					'<div id="ncLoadingDiv">' +
					'<img src="' + GetOrgUrl() + '/WebResources/ldv_SmoothLoadingGif20" />' +
					'<div>');
				ncListContainer.scrollTop(ncListContainer[0].scrollHeight);
			}
			else
			{
				NcParent.$('#ncLoadingDiv').remove();
			}
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function updateMessagesList(isNew, newMessages)
	{
		try
		{
			for (var i = 0; i < newMessages.length; i++)
			{
				addMessageToList(newMessages[i], isNew);

				var listDimensions = GetElementDimensions(ncList, ncFrame.width(), NcParent.$);
				ncListContainer.height(Math.min(listDimensions[1], 400));
			}

			ncListContainer.perfectScrollbar('update');

			var isAnyUnread =
				Contains(newMessages, function(e)
				{
					return !e.isRead;
				});

			if (isAnyUnread)
			{
				CheckUnread(true);
			}
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function addMessageToList(message, isAddTop)
	{
		try
		{
			var messageElement = BuildMessageElement(message, ncList.width(), '');

			if (isAddTop)
			{
				ncList.prepend(messageElement);
			}
			else
			{
				ncList.append(messageElement);
			}

			messageElement.after('<hr class="ncSeparator">');
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	return { OpenMenu: openMenu };
};

function CloseMenu(ncFrame)
{
	try
	{
		ncFrame.remove();

		var image = NcParent.$('#ncIconImage');
		image.stop(true);
		image.fadeTo(100, 0.30, function ()
		{
			try
			{
				image.attr('src', GetOrgUrl() + '/WebResources/ldv_GlobePng52');
			}
			catch (e)
			{
				console.error('Notifications Centre => CloseMenu => fadeTo');
				console.error(e);
			}
		}).fadeTo(300, 1);
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

//#region Helpers

function GetUnreadMessages(callback)
{
	try
	{
		var userId = GetUserId();

		var parameters = {};
		var user = {};
		user.systemuserid = userId;
		user["@odata.type"] = "Microsoft.Dynamics.CRM.systemuser";
		parameters.User = user;
		parameters.Count = (NcSettings.CounterLimit + 1);

		NcParent.$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				datatype: "json",
				url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ys_NotifyCentreGetMessages",
				data: JSON.stringify(parameters),
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
						var results = JSON.parse((data.Messages).replace(/\\"/g, '\"'));
						var unread = NcParent.$.map(results,
							function(e)
							{
								return { id: e.id, date: e.modifiedon };
							});

						if (callback)
						{
							callback(unread);
						}
					}
					catch (e)
					{
						console.error('Notifications Centre => NcMenu => GetUnreadMessages => ajax');
						console.error(e);

						if (callback)
						{
							callback([]);
						}
					}
				},
				error: function(xhr, textStatus, errorThrown)
				{
					console.error('Notifications Centre => NcMenu => GetUnreadMessages => ajax');
					console.error(xhr);

					if (callback)
					{
						callback([]);
					}
				}
			});
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);

		if (callback)
		{
			callback([]);
		}
	}
}

function GetMessage(id, callback)
{
	try
	{
		var parameters = {};
		parameters.MessageId = id;

		NcParent.$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ys_NotifyCentreGetMessages",
			data: JSON.stringify(parameters),
			beforeSend: function (xmlHttpRequest)
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
					var message = JSON.parse((data.Messages).replace(/\\"/g, '\"'))[0];
					
					if (message)
					{
						if (callback)
						{
							message.regarding = message.regarding || {};
							message.isRead = false;
							callback(message);
						}
					}
				}
				catch (e)
				{
					console.error('Notifications Centre => GetMessage => ajax => success');
					console.error(e);
				}
			},
			error: function (xhr, textStatus, errorThrown)
			{
				console.error('Notifications Centre => GetMessage => ajax => error');
				console.error(xhr);
			}
		});
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function BuildMessageElement(message, width, suffix)
{
	try
	{
		var regardingUrl = message.regarding.id
							   ? (GetOrgUrl() + '/main.aspx?etc=' + message.regarding.typecode +
								   '&id=%7b' + message.regarding.id + '%7d' + '&newWindow=true&pagetype=entityrecord')
							   : '';

		var messageElement = NcParent.$('<div id="' + message.id + '_' + suffix + '" messageRead="' + message.isRead +
			'" class="ncMessageContainer">' +
			'</div>');
		//.toggleClass('ncMessageUnread', !message.isRead);
		messageElement.css('background-color', message.isRead ? '' : NcColours.Unread);
		
		messageElement
			.hover(function()
				{
					//NcParent.$(this).addClass('ncMessageHover');
				NcParent.$(this).css('background-color', NcColours.Hover);
			},
				function()
				{
					try
					{
						// change back the colour of message
						var element = NcParent.$(this);
						//element.removeClass('ncMessageHover');
						element.css('background-color', '');
						//element.toggleClass('ncMessageUnread', element.attr('messageRead') !== 'true');
						element.css('background-color', element.attr('messageRead') === 'true' ? '' : NcColours.Unread);
					}
					catch (e)
					{
						console.error('Notifications Centre => BuildMessageElement => messageElement hover');
						console.error(e);
					}
				});

		var sourceImage = NcSource[message.source];

		var titleElement = NcParent.$('<div style="position:relative;">' +
			(sourceImage ? '<img class="ncSourceIcon" src="' + NcSource[message.source] + '" />' : '') +
			'<div style="width:' + (width - 45) + `px;" class="ncMessageTitle${NcIsNew() ? '' : '-old'} ncEllipsis" ` +
			`title="${message.title}">` +
			message.title +
			'</div>' +
			'</div>');

		var readAnchorElement = NcParent.$('#dummyElement');
		
		if (!message.isRead)
		{
			readAnchorElement = NcParent.$('<div id="read_' + message.id + '_' + suffix + '" class="ncReadIcon">' +
					'<a href="#">' +
					'<img src="' + GetOrgUrl() + '/WebResources/ldv_ReadIconPng15" />' +
					'</a>' +
					'</div>')
				.click(function()
				{
					try
					{
						SetMessageRead(NcParent.$(this), messageElement, message.id);
					}
					catch (e)
					{
						console.error('Notifications Centre => BuildMessageElement => readAnchorElement click');
						console.error(e);
					}
				})
				.hover(function()
					{
						try
						{
							var element = NcParent.$('img:eq(0)', this);
							element.attr('src', GetOrgUrl() + '/WebResources/ldv_ReadHighlightPng15');
						}
						catch (e)
						{
							console.error('Notifications Centre => BuildMessageElement => readAnchorElement hover');
							console.error(e);
						}
					},
					function()
					{
						try
						{
							var element = NcParent.$('img:eq(0)', this);
							element.attr('src', GetOrgUrl() + '/WebResources/ldv_ReadIconPng15');
						}
						catch (e)
						{
							console.error('Notifications Centre => BuildMessageElement => readAnchorElement hover');
							console.error(e);
						}
					});

			titleElement.append(readAnchorElement);
		}

		var bodyElement = NcParent.$(`<div class="${NcIsNew() ? 'nc-message-body ' : ''}ncEllipsis" ` +
			`title="${message.message}">` +
			(IsHtml(message.message)
				 ? '(Message is in HTML format; hover to view)'
				 : message.message) +
			'</div>');

		var urlElement = NcParent.$('<span>&nbsp;</span>');

		if (regardingUrl)
		{

			urlElement = NcParent.$('<div style="width:' + (width / 2) + 'px;" class="ncEllipsis"></div>');
			var url = NcParent.$('<a href="' + regardingUrl + '" target="_blank" style="text-decoration:underline;">'
				+ message.regarding.name + '</a>');
			url.css('color', NcColours.Links);
			urlElement.append(url);

			urlElement
				.click(function()
				{
					try
					{
						if (messageElement.attr('messageRead') === "false")
						{
							SetMessageRead(readAnchorElement, messageElement, message.id);
						}
					}
					catch (e)
					{
						console.error('Notifications Centre => BuildMessageElement => urlElement click');
						console.error(e);
					}
				});
		}

		var footerElement = NcParent.$('<div style="position:relative;">' +
			'<div class="ncDate">' + message.modifiedonString + '</div>' +
			'</div>');

		footerElement.prepend(urlElement);

		messageElement
			.append(titleElement)
			.append(bodyElement)
			.append(footerElement);

		return messageElement;
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
		return NcParent.$('#dummy');
	}
}

function SetMessageRead(readAnchorElement, messageElement, messageid)
{
	try
	{
		readAnchorElement.hide();
		messageElement.css('background-color', '');
		//messageElement.removeClass('ncMessageUnread');
		messageElement.attr('messageRead', 'true');

		var parameters = {};
		parameters.MessageId = messageid;
		var user = {};
		user.systemuserid = GetUserId(true);
		user["@odata.type"] = "Microsoft.Dynamics.CRM.systemuser";
		parameters.User = user;

		NcParent.$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ys_NotifyCentreSetMessageRead",
			data: JSON.stringify(parameters),
			beforeSend: function (xmlHttpRequest)
			{
				xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
				xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
				xmlHttpRequest.setRequestHeader("Accept", "application/json");
			},
			async: true,
			success: function (data, textStatus, xhr)
			{
				try
				{
					CheckUnread(true);
				}
				catch (e)
				{
					console.error('Notifications Centre => SetMessageRead => ajax => success');
					console.error(e);
				}
			},
			error: function (xhr, textStatus, errorThrown)
			{
				try
				{
					console.error(xhr);
					readAnchorElement.show();
					//messageElement.addClass('ncMessageUnread');
					messageElement.css('background-color', NcColours.Unread);
					messageElement.attr('messageRead', 'false');
				}
				catch (e)
				{
					console.error('Notifications Centre => SetMessageRead => ajax error');
					console.error(e);
				}
			}
		});
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
	}
}

function GetValueFromLocalStorage(key)
{
	return JSON.parse((NcParent.localStorage.getItem(key)).replace(/\\"/g, '\"'));
}

function StoreValueInLocalStorage(key, value)
{
	NcParent.localStorage.setItem(key, JSON.stringify(value));
}
