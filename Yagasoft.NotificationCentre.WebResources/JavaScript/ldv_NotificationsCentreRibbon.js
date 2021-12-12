/// <reference path="../Refs/Xrm.Page.js" />
var NcIsParentParent = parent && parent.parent && !parent.parent.$('#TabHome').length;
var NcParent = NcIsParentParent ? parent.parent : parent;

var IsNcLoaded = NcParent.IsNcLoaded || false;

async function InitNotificationsMenu()
{
	try
	{
		if (IsNcLoaded)
		{
			return false;
		}

		LoadWebResources('ys_NotificationsCentreCore', null, NcParent);
	}
	catch (e)
	{
		console.error('Notifications Centre => InitNotificationsMenu');
		console.error(e);
	}

	return false;
}

function LoadWebResources(resources, callback, scopeWindow)
{
	/// <summary>
	///     Takes an array of resource names and loads them into the current context using "LoadScript".<br />
	///     The resources param accepts a string as well in case a single resource is needed instead.<br />
	///     Author: Ahmed Elsawalhy
	/// </summary>
	/// <param name="resources" type="String[] | string" optional="false">The resource[s] to load.</param>
	/// <param name="callback" type="Function" optional="true">A function to call after resource[s] has been loaded.</param>
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
	};

	LoadScript(Xrm.Utility.getGlobalContext().getClientUrl() + '/WebResources/' + resources[0], localCallback, scopeWindow);
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

	scopeWindow = scopeWindow || window;
	// Adding the script tag to the head as suggested before
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
