#region Imports

using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Workflow;
using Yagasoft.Libraries.Common;

#endregion

namespace Yagasoft.NotificationCentre.Steps
{
	/// <summary>
	///     Get the list of messages for the given user.<br />
	///     Version: 1.1.1
	/// </summary>
	public class GetMessages : CodeActivity
	{
		#region Arguments

		[Input("User")]
		[ReferenceTarget(User.EntityLogicalName)]
		public InArgument<EntityReference> UserRefArg { get; set; }

		[Input("Message ID")]
		public InArgument<string> MessageIdArg { get; set; }

		[Input("Count")]
		public InArgument<int> CountArg { get; set; }

		[Input("Page")]
		public InArgument<int> PageArg { get; set; }

		[Output("Messages")]
		public OutArgument<string> MessagesArg { get; set; }

		[Input("Cookie")]
		[Output("New Cookie")]
		public InOutArgument<string> CookieArg { get; set; }

		[Output("Read End")]
		public OutArgument<bool> IsReadEndArg { get; set; }

		#endregion

		protected override void Execute(CodeActivityContext executionContext)
		{
			new GetMessagesLogic().Execute(this, executionContext, false);
		}
	}

	internal class GetMessagesLogic : StepLogic<GetMessages>
	{
		protected override void ExecuteLogic()
		{
			var messageId = ExecutionContext.GetValue(codeActivity.MessageIdArg);

			var result = RetrieveMessages(messageId);
			var messagesString = ParseMessages(result);

			ExecutionContext.SetValue(codeActivity.MessagesArg, messagesString);
			ExecutionContext.SetValue(codeActivity.IsReadEndArg, !result.MoreRecords);
			ExecutionContext.SetValue(codeActivity.CookieArg, result.PagingCookie ?? "");
		}

		private EntityCollection RetrieveMessages(string messageId)
		{
			EntityCollection result;

			if (messageId == null)
			{
				var user = ExecutionContext.GetValue(codeActivity.UserRefArg);

				if (user == null)
				{
					throw new ArgumentNullException("User", "Must pass either a user or message ID to the 'GetMessages' custom step.");
				}

				var count = ExecutionContext.GetValue(codeActivity.CountArg);
				count = count <= 0 ? 10 : count;
				var page = ExecutionContext.GetValue(codeActivity.PageArg);
				page = page <= 0 ? 1 : page;
				var cookie = page <= 1 ? null : ExecutionContext.GetValue(codeActivity.CookieArg);

				var fetchXml =
					"<fetch " + "count='" + count + "'" + " page='" + page + "'" +
						(string.IsNullOrEmpty(cookie)
							? ""
							: " paging-cookie='" + SecurityElement.Escape(cookie) + "'") +
						" no-lock='true'>" +
						"  <entity name='ldv_notificationmessage' >" +
						"    <attribute name='activityid' />" +
						"    <attribute name='subject' />" +
						"    <attribute name='description' />" +
						"    <attribute name='modifiedon' />" +
						"    <attribute name='regardingobjectid' />" +
						"    <attribute name='ldv_regardingtypecode' />" +
						"    <attribute name='ldv_regardingid' />" +
						"    <attribute name='ldv_notificationsource' />" +
						"    <filter type='and' >" +
						"      <filter type='or' >" +
						"        <condition attribute='ldv_isglobalmessage' operator='eq' value='1' />" +
						"        <condition entityname='roleUser' attribute='systemuserid' operator='eq' value='" + user.Id + "' />" +
						"        <condition entityname='teamUser' attribute='systemuserid' operator='eq' value='" + user.Id + "' />" +
						"        <condition entityname='userMessage' attribute='ldv_userid' operator='eq' value='" + user.Id + "' />" +
						"      </filter>" +
						"      <condition attribute='statuscode' operator='eq' value='1' />" +
						"    </filter>" +
						"    <order attribute='modifiedon' descending='true' />" +
						"    <link-entity name='ldv_notificationmessagerole' from='ldv_notificationmessageid' to='activityid'" +
						"        alias='roleMessage' link-type='outer' >" +
						"      <link-entity name='role' from='roleid' to='ldv_roleid' link-type='outer' >" +
						"        <link-entity name='systemuserroles' from='roleid' to='roleid'" +
						"            link-type='outer' alias='roleUser' intersect='true' />" +
						"      </link-entity>" +
						"    </link-entity>" +
						"    <link-entity name='ldv_notificationmessageteam' from='ldv_notificationmessageid' to='activityid'" +
						"        alias='teamMessage' link-type='outer' >" +
						"      <link-entity name='team' from='teamid' to='ldv_teamid' link-type='outer' >" +
						"        <link-entity name='teammembership' from='teamid' to='teamid'" +
						"            link-type='outer' alias='teamUser' intersect='true' />" +
						"      </link-entity>" +
						"    </link-entity>" +
						"    <link-entity name='ldv_notificationmessageuser' from='ldv_notificationmessageid' to='activityid'" +
						"        link-type='outer' alias='userMessage' />" +
						"  </entity>" +
						"</fetch>";

				var query = new FetchExpression(fetchXml);
				result = Service.RetrieveMultiple(query);
			}
			else
			{
				result = new EntityCollection(
					new List<Entity>
					{
						Service.Retrieve(NotificationMessage.EntityLogicalName, Guid.Parse(messageId),
							new ColumnSet(NotificationMessage.Fields.ActivityId, NotificationMessage.Fields.Title,
							NotificationMessage.Fields.Message, NotificationMessage.Fields.LastUpdated,
							NotificationMessage.Fields.Regarding, NotificationMessage.Fields.RegardingTypeCode,
							NotificationMessage.Fields.RegardingID, NotificationMessage.Fields.NotificationSource))
					});
			}

			log.Log($"{result.Entities.Count} messages retrieved.");

			return result;
		}

		private string ParseMessages(EntityCollection result)
		{
			var messages =
				result.Entities.Select(
					e =>
					{
						var regarding = e.GetAttributeValue<EntityReference>("regardingobjectid");
						var regardingId = regarding?.Id.ToString() ?? e.GetAttributeValue<string>("ldv_regardingid");

						var serialisedRegarding = regarding == null
							? (string.IsNullOrEmpty(regardingId)
								? null
								: SerialiserHelpers.SerialiseSimpleJson(
									new Dictionary<string, string>
									{
										["id"] = regardingId,
										["typecode"] = e.GetAttributeValue<int>("ldv_regardingtypecode").ToString(),
										["name"] = e.GetAttributeValue<string>("subject")
									}, true))
							: SerialiserHelpers.SerialiseSimpleJson(
								new Dictionary<string, string>
								{
									["id"] = regardingId,
									["typecode"] = e.GetAttributeValue<int>("ldv_regardingtypecode").ToString(),
									["name"] = regarding.Name
								}, true);

						var serialisedMessage = SerialiserHelpers.SerialiseSimpleJson(
							new Dictionary<string, string>
							{
								["id"] = e.GetAttributeValue<Guid>("activityid").ToString(),
								["title"] = e.GetAttributeValue<string>("subject"),
								["message"] = e.GetAttributeValue<string>("description"),
								["modifiedon"] = e.GetAttributeValue<DateTime>("modifiedon").ToString("yyyy-MM-ddTHH:mm:ssZ"),
								["modifiedonString"] = e.GetAttributeValue<DateTime>("modifiedon").ToString(),
								["source"] = (e.GetAttributeValue<OptionSetValue>("ldv_notificationsource")?.Value ?? 1).ToString()
							}, true);

						if (serialisedRegarding != null)
						{
							serialisedMessage = serialisedMessage
								.Insert(serialisedMessage.Length - 1, ",\"regarding\":" + serialisedRegarding);
						}

						return serialisedMessage;
					}).ToArray();

			var messagesString = "[";

			if (messages.Any())
			{
				messagesString += messages.Aggregate((m1, m2) => m1 + ", " + m2);
			}

			messagesString += "]";

			return messagesString;
		}
	}
}
