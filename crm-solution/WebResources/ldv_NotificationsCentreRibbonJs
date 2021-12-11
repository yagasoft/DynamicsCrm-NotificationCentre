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

		NcParent.NcLibrary = window;

		for (let i = 0; i < 100; i++)
		{
			if (window.IsCommonGenericLibraryLoaded)
			{
				break;
			}

			console.warn('[NC] Waiting 50ms for the Common Library to load ...');
			await new Promise(resolve => setTimeout(resolve, 50));
		}

		LoadWebResources(['ldv_NotificationsCentreLibsJs', 'ys_NotificationsCentreCore'], null, NcParent);
		LoadWebResourceCss('ldv_NotificationsCentreCss', NcParent);
	}
	catch (e)
	{
		console.error('Notifications Centre => InitNotificationsMenu');
		console.error(e);
	}

	return false;
}
