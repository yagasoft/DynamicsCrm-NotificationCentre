/// <reference path="../../../../LinkDev.Libraries/LinkDev.Libraries.Common/Scripts/ldv_CommonGeneric.js" />
/// <reference path="../Refs/Xrm.Page.js" />

var IsNcLoaded = window.IsNcLoaded || false;
var IsRegister = window.IsRegister || false;

var NcSettings = NcSettings
	|| {
		IsEnabled: false,
		CountPerPage: 10,
		RefreshInterval: 5,
		CounterLimit: 10,
		IsPopupEnabled: false,
		PopupTimeout: 10
	};
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

var NcColours = NcColours
	|| {
		Main: '#BAE3FF',
		Links: '#0000FF'
	};

function InitNc()
{
	try
	{
		if (IsRegister)
		{
			IsRegister = false;
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
	$("#ncIcon")
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
					loop();
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
		var counterElement = $('#ncCounter');

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
		//$('#ncIconImage').css('margin-right', (-10 + (counterText.toString().length * 7)) + 'px');
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
		var popupBar = $('#ncPopupBar');

		if (!popupBar.length)
		{
			popupBar = $(
				'<div id="ncPopupBar" class="mainContainer">' +
				'<div id="ncPopupBarListContainer" style="position:relative;">' +
				'<div id="ncPopupBarList"></div>' +
				'</div>' +
				'</div>');
			$('body').append(popupBar);
			popupBar.hide();
		}

		var bar = $('#ncPopupBarList');
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
						var messageElement = BuildMessageElement(message, bar.width(), popupBar, suffix, true);
						var separator = $('#dummy');

						if (popupBar.height() > 5)
						{
							separator = $('<hr id="separator_' + message.id + '_' + suffix + '" class="ncSeparator">');
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

		var message = $('#' + messageId + '_' + suffix);

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
					$('#' + 'separator_' + messageId + '_' + suffix).remove();
					$('#' + 'hover_' + messageId + '_' + suffix).remove();
					$('#' + 'hover_undefined_' + suffix).remove();

					var popupBar = $('#ncPopupBar');

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
						$(this).stop().animate({ opacity: '1' });
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
	var isLoadingRead;
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
			ncFrame = $('#ncFrame');

			if (ncFrame.length && $('#ncFrame').css('display') !== 'none')
			{
				CloseMenu(ncFrame);
				return;
			}

			drawMenu(buttonElement);
			showNextBatch();

			var image = $('#ncIconImage');
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
			var pos = $(buttonElement).position();
			ncFrame = $('<div id="ncFrame" class="ncNoLoading mainContainer arrow_box">' +
					'<div id="ncListContainer">' +
					'<div id="ncList"></div>' +
					'</div>' +
					'</div>')
				.css({
						top: pos.top + 62 + 'px',
						left: pos.left - 2 + 'px'
					});
			$('body').append(ncFrame);
			ncFrame.hide();

			ncListContainer = $('#ncListContainer');
			ncListContainer.perfectScrollbar();
			ncList = $('#ncList');

			var timeout;

			// on scroll to bottom, load new batch of messages
			// credit: http://stackoverflow.com/a/6271466/1919456
			ncListContainer.bind('scroll', function()
			{
				try
				{
					clearTimeout(timeout);
					var element = $(this);

					// use timeout to have the ability to clear others because sometimes this event is triggered twice
					timeout =
						setTimeout(function()
						{
							try
							{
								if (element.scrollTop() + element.innerHeight() >= element[0].scrollHeight)
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
					if (!$(event.target).closest('#ncFrame').length
						&& !$(event.target).closest('#ncIcon').length)
					{
						$(window).off('mouseup', outsideClickHideHandler);
						CloseMenu(ncFrame);
					}
				}
				catch (e)
				{
				}
			};

			$(window).on('mouseup', outsideClickHideHandler);
			registerOutsideClick($(document));

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
			var iframes = $('iframe', element);
			iframes = iframes.length ? iframes : (element.length ? $('iframe', element.contents()) : []);

			var outsideClickHideHandler = function(event)
			{
				try
				{
					if (!$(event.target).closest('#ncFrame').length
						&& !$(event.target).closest('#ncIcon').length)
					{
						for (var i = 0; i < iframes.length; i++)
						{
							var contentWindow = iframes[i].contentWindow;

							if (contentWindow)
							{
								$(contentWindow).off('mouseup', outsideClickHideHandler);
							}
						}

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
					$(contentWindow).on('mouseup', outsideClickHideHandler);
				}

				registerOutsideClick($(iframes[i]));
			}
		}
		catch (e)
		{
			console.error('Notifications Centre => ' + GetFunctionName());
			console.error(e);
		}
	}

	function registerNcQuickCreateClick()
	{
		$("#ncNewIconContainer")
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
				var formWindow = $('#NavBarGloablQuickCreate')[0].contentWindow;
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
			parameters.IsLoadRead = isLoadingRead === true;
			parameters.Cookie = pagingInfo.PagingCookie;

			var loadFunction = function()
			{
				$.ajax({
						type: "POST",
						contentType: "application/json; charset=utf-8",
						datatype: "json",
						url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_NotifyCentreGetMessages",
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

								var results = JSON.parse(data.Messages);
								var newMessages = [];

								for (var i = 0; i < results.length; i++)
								{
									var messageObject = results[i];
									messageObject.isRead = messageObject.isRead === 'true';
									messageObject.regarding = messageObject.regarding || {};

									if (!Contains(messagesList, null, messageObject.id))
									{
										newMessages.push(messageObject);
										messagesList.push(messageObject.id);
									}
								}

								pagingInfo.NextPage = !isLoadingRead && data.IsUnreadEnd ? 1 : pagingInfo.NextPage;

								isReachedEnd = isLoadingRead && data.IsReadEnd;
								isLoadingRead = data.IsUnreadEnd;

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
				$('#ncLoadingDiv').remove();
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

				var listDimensions = GetElementDimensions(ncList, ncFrame.width(), $);
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
			var messageElement = BuildMessageElement(message, ncList.width(), ncListContainer, '');

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

		var image = $('#ncIconImage');
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
		parameters.Page = -1;
		parameters.IsLoadRead = false;
		parameters.LatestMenuOpenDate = GetValueFromLocalStorage('NcLatestMenuOpenDate');

		$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				datatype: "json",
				url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_NotifyCentreGetMessages",
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
						var results = JSON.parse(data.Messages);
						var unread = $.map(results,
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

		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_NotifyCentreGetMessages",
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
					var message = JSON.parse(data.Messages)[0];
					
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

function BuildMessageElement(message, width, parentFrameJq, suffix)
{
	try
	{
		var regardingUrl = message.regarding.id
							   ? (GetOrgUrl() + '/main.aspx?etc=' + message.regarding.typecode +
								   '&id=%7b' + message.regarding.id + '%7d' + '&newWindow=true&pagetype=entityrecord')
							   : '';

		var messageElement = $('<div id="' + message.id + '_' + suffix + '" messageRead="' + message.isRead +
			'" class="ncMessageContainer">' +
			'</div>');
		//.toggleClass('ncMessageUnread', !message.isRead);
		messageElement.css('background-color', message.isRead ? '' : NcColours.Unread);
		
		var hoverFrame = null;
		var latestHoverElement = null;

		messageElement
			.hover(function()
				{
					//$(this).addClass('ncMessageHover');
				$(this).css('background-color', NcColours.Hover);
			},
				function()
				{
					try
					{
						// hide the tooltip
						if (hoverFrame)
						{
							hoverFrame.remove();
							hoverFrame = null;
							latestHoverElement = null;
						}

						// change back the colour of message
						var element = $(this);
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

		var titleElement = $('<div style="position:relative;">' +
			(sourceImage ? '<img class="ncSourceIcon" src="' + NcSource[message.source] + '" />' : '') +
			'<div style="width:' + (width - 45) + 'px;" class="ncMessageTitle ncEllipsis">' +
			message.title +
			'</div>' +
			'</div>');

		titleElement.mousemove(function(event)
		{
			try
			{
				hoverFrame = ShowHoverFrame(message.title, event.pageX, event.pageY, parentFrameJq.width(),
					suffix, hoverFrame, latestHoverElement !== titleElement);
				latestHoverElement = titleElement;
			}
			catch (e)
			{
				console.error('Notifications Centre => BuildMessageElement => titleElement mousemove');
				console.error(e);
			}
		});

		var readAnchorElement = $('#dummyElement');
		
		if (!message.isRead)
		{
			readAnchorElement = $('<div id="read_' + message.id + '_' + suffix + '" class="ncReadIcon">' +
					'<a href="#">' +
					'<img src="' + GetOrgUrl() + '/WebResources/ldv_ReadIconPng15" />' +
					'</a>' +
					'</div>')
				.click(function()
				{
					try
					{
						SetMessageRead($(this), messageElement, message.id);
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
							var element = $('img:eq(0)', this);
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
							var element = $('img:eq(0)', this);
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

		var bodyElement = $('<div class="ncEllipsis">' +
			(IsHtml(message.message)
				 ? '(Message is in HTML format; hover to view)'
				 : message.message) +
			'</div>');

		bodyElement.mousemove(function(event)
		{
			try
			{
				hoverFrame = ShowHoverFrame(message.message, event.pageX, event.pageY, parentFrameJq.width(),
					suffix, hoverFrame, latestHoverElement !== bodyElement);
				latestHoverElement = bodyElement;
			}
			catch (e)
			{
				console.error('Notifications Centre => BuildMessageElement => bodyElement mousemove');
				console.error(e);
			}
		});

		var urlElement = $('<span>&nbsp;</span>');

		if (regardingUrl)
		{

			urlElement = $('<div style="width:' + (width / 2) + 'px;" class="ncEllipsis"></div>');
			var url = $('<a href="' + regardingUrl + '" target="_blank" style="text-decoration:underline;">'
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

		var footerElement = $('<div style="position:relative;">' +
			'<div class="ncDate">' + message.modifiedonString + '</div>' +
			'</div>');

		footerElement.prepend(urlElement);

		footerElement.mousemove(function(event)
		{
			try
			{
				if (regardingUrl)
				{
					hoverFrame = ShowHoverFrame(message.regarding.name, event.pageX, event.pageY, parentFrameJq.width(),
						suffix, hoverFrame, latestHoverElement !== footerElement);
				}
				else
				{
					if (hoverFrame)
					{
						hoverFrame.remove();
						hoverFrame = null;
						latestHoverElement = null;
					}
				}

				latestHoverElement = footerElement;
			}
			catch (e)
			{
				console.error('Notifications Centre => BuildMessageElement => footerElement mousemove');
				console.error(e);
			}
		});

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
		return $('#dummy');
	}
}

function ShowHoverFrame(message, x, y, maxWidth, suffix, oldFrame, isRecalcDimensions)
{
	try
	{
		var frame = oldFrame || $('#hover_' + message.id + '_' + suffix);

		if (!frame || frame.length <= 0)
		{
			frame = $('<div id="hover_' + message.id + '_' + suffix + '" class="ncHoverFrame"></div>');
			$('body').append(frame);
		}

		frame.html(message);

		if (isRecalcDimensions)
		{
			var dimensions = GetElementDimensions(frame, maxWidth, $);
			frame.width(dimensions[0]);
			frame.height(dimensions[1]);
		}

		var bottom = window.innerHeight - (y + frame.height()) - 20;
		var right = window.innerWidth - (x + frame.width()) - 30;

		return frame
			.css({
					bottom: (bottom > 0 ? bottom : 0) + 'px',
					right: (right > 0 ? right : 0) + 'px'
				});
	}
	catch (e)
	{
		console.error('Notifications Centre => ' + GetFunctionName());
		console.error(e);
		return $('#dummy');
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

		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			datatype: "json",
			url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_NotifyCentreSetMessageRead",
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
	return JSON.parse(localStorage.getItem(key));
}

function StoreValueInLocalStorage(key, value)
{
	localStorage.setItem(key, JSON.stringify(value));
}

function LoadWebResources(resources, callback, scopeWindow)
{
	/// <summary>
	///     Takes an array of resource names and loads them into the current context using "LoadScript".<br />
	///     The resources param accepts a string as well in case a single resource is needed instead.<br />
	///     Author: Ahmed el-Sawalhy
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
	///     Author: Ahmed el-Sawalhy<br />
	///     credit: http://stackoverflow.com/a/950146/1919456
	/// </summary>
	/// <param name="url" type="String" optional="false">The URL to the script file.</param>
	/// <param name="callback" type="Function" optional="true">The function to call after loading the script.</param>

	// Adding the script tag to the head as suggested before
	try
	{
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

//#endregion