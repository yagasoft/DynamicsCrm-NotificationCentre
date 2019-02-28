/// <reference path="../../../../Yagasoft.Libraries/Yagasoft.Libraries.Common/Scripts/ldv_CommonGeneric.js" />
/// <reference path="../Refs/Xrm.Page.js" />

function SetToOpen()
{
	ShowBusyIndicator('Publishing message ...', 'SetToOpen');

	var entity = {};
	entity.statecode = 0;
	entity.statuscode = 1;

	$.ajax({
		type: "PATCH",
		contentType: "application/json; charset=utf-8",
		datatype: "json",
		url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_notificationmessages(" + GetRecordId(true) + ")",
		data: JSON.stringify(entity),
		beforeSend: function (xmlHttpRequest)
		{
			xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
			xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
			xmlHttpRequest.setRequestHeader("Accept", "application/json");
		},
		async: true,
		success: function (data, textStatus, xhr)
		{
			RefreshOnNotDirty();
		},
		error: function (xhr, textStatus, errorThrown)
		{
			HideBusyIndicator('SetToOpen');
			alert('Failed to publish message.');
			console.error("Function: SetToOpen");
			console.error(xhr);
		}
	});
}

function SetToDraft()
{
	ShowBusyIndicator('Switching to edit mode ...', 'SetToDraft');

	var entity = {};
	entity.statecode = 0;
	entity.statuscode = 753240000;

	$.ajax({
		type: "PATCH",
		contentType: "application/json; charset=utf-8",
		datatype: "json",
		url: Xrm.Page.context.getClientUrl() + "/api/data/v8.1/ldv_notificationmessages(" + GetRecordId(true) + ")",
		data: JSON.stringify(entity),
		beforeSend: function (xmlHttpRequest)
		{
			xmlHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
			xmlHttpRequest.setRequestHeader("OData-Version", "4.0");
			xmlHttpRequest.setRequestHeader("Accept", "application/json");
		},
		async: true,
		success: function (data, textStatus, xhr)
		{
			RefreshOnNotDirty();
		},
		error: function (xhr, textStatus, errorThrown)
		{
			HideBusyIndicator('SetToDraft');
			alert('Failed to switching to edit mode.');
			console.error("Function: SetToDraft");
			console.error(xhr);
		}
	});
}
