/// <reference path="../../../../Yagasoft.Libraries/Yagasoft.Libraries.Common/Scripts/ldv_CommonGeneric.js" />
/// <reference path="../Refs/Xrm.Page.js" />
/// <reference path="../../../../Yagasoft.Libraries/Yagasoft.Libraries.Common/CrmSchemaJs.js" />

function OnLoad()
{
	if (GetFormType() === FormType.Create || GetFormType() === FormType.QuickCreate)
	{
		SetFieldValue(Sdk.NotificationMessage.NotificationSource,
			Sdk.NotificationMessage.NotificationSourceEnum.Manual);
	}

	// quick create because owner is not on form
	if (!GetField(Sdk.NotificationMessage.Owner))
	{
		SetFieldValue(Sdk.NotificationMessage.StatusReason,
            Sdk.NotificationMessage.StatusReasonEnum.Open);
	}
	else
	{
		if (GetFieldValue(Sdk.NotificationMessage.StatusReason)
            === Sdk.NotificationMessage.StatusReasonEnum.Open)
		{
			SetMessageFieldsLocked(true);
		}
		else if (GetFieldValue(Sdk.NotificationMessage.StatusReason)
            === Sdk.NotificationMessage.StatusReasonEnum.Draft)
		{
			SetMessageFieldsLocked(false);
		}
	}

	IsGlobal_OnChange();
}

function IsGlobal_OnChange()
{
	var isGlobal = GetFieldValue(Sdk.NotificationMessage.GlobalMessage);

	SetFieldsVisible([Sdk.NotificationMessage.Role, Sdk.NotificationMessage.Team,
		Sdk.NotificationMessage.User], !isGlobal);
	
	if (GetFormType() !== FormType.QuickCreate && GetTab('RolesTab'))
	{
		SetTabsVisible(['RolesTab', 'TeamsTab', 'UsersTab'], !isGlobal);
	}

	if (isGlobal)
	{
		SetFieldValue(Sdk.NotificationMessage.Role, null);
		SetFieldValue(Sdk.NotificationMessage.Team, null);
		SetFieldValue(Sdk.NotificationMessage.User, null);
	}
}

function SetMessageFieldsLocked(isLocked)
{
	SetFieldsLocked([Sdk.NotificationMessage.Title, Sdk.NotificationMessage.Message,
		Sdk.NotificationMessage.Regarding], isLocked);
}
