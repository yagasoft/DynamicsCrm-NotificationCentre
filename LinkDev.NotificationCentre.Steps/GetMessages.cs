#region Imports

using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using LinkDev.Libraries.Common;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Workflow;

#endregion

namespace LinkDev.NotificationCentre.Steps
{
	/// <summary>
	///     This custom workflow step ... .<br />
	///     Version: 0.0.1
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

		[Input("Latest Menu Open Date")]
		public InArgument<string> LatestMenuOpenDateArg { get; set; }

		[Output("Messages")]
		public OutArgument<string> MessagesArg { get; set; }

		[Input("Cookie")]
		[Output("New Cookie")]
		public InOutArgument<string> CookieArg { get; set; }

		[Input("Load Read")]
		public InArgument<bool> IsLoadReadArg { get; set; }

		[Output("Unread End")]
		public OutArgument<bool> IsUnreadEndArg { get; set; }

		[Output("Read End")]
		public OutArgument<bool> IsReadEndArg { get; set; }

		#endregion

		protected override void Execute(CodeActivityContext executionContext)
		{
			new GetMessagesLogic().Execute(this, executionContext, false);
		}
	}

	[Log]
	internal class GetMessagesLogic : StepLogic<GetMessages>
	{
		[NoLog]
		protected override void ExecuteLogic()
		{
			var messageId = executionContext.GetValue(codeActivity.MessageIdArg);
			var isLoadRead = executionContext.GetValue(codeActivity.IsLoadReadArg);

			var result = RetrieveMessages(messageId, isLoadRead);
			var messagesString = ParseMessages(result);

			executionContext.SetValue(codeActivity.MessagesArg, messagesString);
			executionContext.SetValue(codeActivity.IsUnreadEndArg, isLoadRead || !result.MoreRecords);
			executionContext.SetValue(codeActivity.IsReadEndArg, !isLoadRead || !result.MoreRecords);
			executionContext.SetValue(codeActivity.CookieArg, result.PagingCookie ?? "");
		}

		private EntityCollection RetrieveMessages(string messageId, bool isLoadRead)
		{
			EntityCollection result;
			if (messageId == null)
			{
				var user = executionContext.GetValue(codeActivity.UserRefArg);

				if (user == null)
				{
					throw new ArgumentNullException("User", "Must pass either a user or message ID to the 'GetMessages' custom step.");
				}

				var latestMenuOpenDate = executionContext.GetValue(codeActivity.LatestMenuOpenDateArg);

				var count = executionContext.GetValue(codeActivity.CountArg);
				count = count <= 0 ? 10 : count;
				var page = executionContext.GetValue(codeActivity.PageArg);
				var isTop = false;

				if (page <= 0)
				{
					isTop = true;
				}
				else
				{
					page = page <= 0 ? 1 : page;
				}

				var cookie = page <= 1 ? null : executionContext.GetValue(codeActivity.CookieArg);

				var fetchXml =
					"<fetch " + (isTop ? "top='" + count + "'" : ("count='" + count + "'" + " page='" + page + "'")) +
						(string.IsNullOrEmpty(cookie) || isTop
							? ""
							: " paging-cookie='" + SecurityElement.Escape(cookie) + "'") +
						" distinct='true' no-lock='true'>" +
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
						"        <condition entityname='roleUser' attribute='systemuserid' operator='eq' value='" + user.Id + "' />" +
						"        <condition entityname='teamUser' attribute='systemuserid' operator='eq' value='" + user.Id + "' />" +
						"        <condition entityname='userMessage' attribute='ldv_userid' operator='eq' value='" + user.Id + "' />" +
						"        <condition attribute='ldv_isglobalmessage' operator='eq' value='1' />" +
						"      </filter>" +
						"      <condition attribute='statuscode' operator='eq' value='1' />" +
						(isLoadRead
							? "      <condition entityname='readUser' attribute='ldv_userid' operator='eq' value='" + user.Id + "' />"
							: "      <condition entityname='readUser' attribute='ldv_userid' operator='null' />") +
						(string.IsNullOrEmpty(latestMenuOpenDate)
							? ""
							: "      <filter type='or' >" +
								"      <condition attribute='ldv_contentmodifiedon' operator='gt'"
								+ " value='" + latestMenuOpenDate + "' />" +
								"      <condition entityname='roleMessage' attribute='modifiedon' operator='gt'"
								+ " value='" + latestMenuOpenDate + "' />" +
								"      <condition entityname='teamMessage' attribute='modifiedon' operator='gt'"
								+ " value='" + latestMenuOpenDate + "' />" +
								"      <condition entityname='userMessage' attribute='modifiedon' operator='gt'"
								+ " value='" + latestMenuOpenDate + "' />" +
								"      </filter>") +
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
						"    <link-entity name='ldv_notificationread' from='ldv_notificationmessageid' to='activityid'" +
						"        link-type='outer' alias='readUser' >" +
						"      <attribute name='ldv_userid' alias='userReadId' />" +
						"      <filter >" +
						"        <condition attribute='ldv_userid' operator='eq' value='" + user.Id + "' />" +
						"      </filter>" +
						"    </link-entity>" +
						"  </entity>" +
						"</fetch>";

				var query = new FetchExpression(fetchXml);
				result = service.RetrieveMultiple(query);
			}
			else
			{
				result = new EntityCollection(
					new List<Entity>
					{
						service.Retrieve(NotificationMessage.EntityLogicalName, Guid.Parse(messageId),
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
				result.Entities
					.Select(e =>
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
										["source"] = (e.GetAttributeValue<OptionSetValue>("ldv_notificationsource")?.Value ?? 1).ToString(),
										["isRead"] = (e.GetAttributeValue<AliasedValue>("userReadId") != null).ToString().ToLower()
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
