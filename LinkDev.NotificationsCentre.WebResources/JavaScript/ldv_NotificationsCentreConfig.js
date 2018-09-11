/// <reference path="../../../../LinkDev.Libraries/LinkDev.Libraries.Common/Scripts/ldv_CommonGeneric.js" />
/// <reference path="../Refs/Xrm.Page.js" />
/// <reference path="../../../../LinkDev.Libraries/LinkDev.Libraries.Common/CrmSchemaJs.js" />

function OnLoad()
{
	if (!GetFieldValue(Sdk.NotificationsCentreConfig.Name))
	{
		SetFieldValue(Sdk.NotificationsCentreConfig.Name,
			GetLookupValue(Sdk.NotificationsCentreConfig.Owner).name);
	}

	IsPopupEnabled_OnChange();

	if (UserHasRole('Notifications Centre Admin') || UserHasRole('System Administrator'))
	{
		IsDefault_OnChange();
	}
	else
	{
		SetFieldRequired(Sdk.NotificationsCentreConfig.Default, false);
		SetFieldVisible(Sdk.NotificationsCentreConfig.Default, false);
	}
}

function IsDefault_OnChange()
{
	var isDefault = GetFieldValue(Sdk.NotificationsCentreConfig.Default);

	if (isDefault)
	{
		IsValueUnique(Sdk.NotificationsCentreConfig.EntityLogicalName + 's',
			Sdk.NotificationsCentreConfig.EntityLogicalName + 'id',
			Sdk.NotificationsCentreConfig.Default, isDefault);
	}
	else
	{
		ClearControlError(Sdk.NotificationsCentreConfig.Default);
	}
}

function IsPopupEnabled_OnChange()
{
	var isPopupEnabled = GetFieldValue(Sdk.NotificationsCentreConfig.PopupEnabled);
	SetFieldRequired(Sdk.NotificationsCentreConfig.PopupTimeout, isPopupEnabled);
	SetFieldVisible(Sdk.NotificationsCentreConfig.PopupTimeout, isPopupEnabled);
}