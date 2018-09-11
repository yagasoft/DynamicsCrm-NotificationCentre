#region Imports

using System;
using System.Linq;
using System.Xml;
using LinkDev.Libraries.Common;
using Microsoft.Xrm.Sdk;

#endregion

namespace LinkDev.NotificationCentre.Plugins
{
	/// <summary>
	///     Creates a notification message for users if an email or task was received for them.<br />
	///     Version: 0.0.1
	/// </summary>
	public class NotifyOfActivity : IPlugin
	{
		public void Execute(IServiceProvider serviceProvider)
		{
			new NotifyOfActivityLogic().Execute(this, serviceProvider);
		}
	}

	internal class NotifyOfActivityLogic : PluginLogic<NotifyOfActivity>
	{
		public NotifyOfActivityLogic() : base("Create", PluginStage.PostOperation)
		{ }

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = (Entity)context.InputParameters["Target"];
			NotificationMessage message = null;

			var isEnabled =
				CrmHelpers.GetGenericConfig(service, context.OrganizationId.ToString()).ToEntity<GenericConfiguration>()?
					.NotificationsCentreEnabled == true;

			if (!isEnabled)
			{
				return;
			}

			switch (target.LogicalName)
			{
				case Email.EntityLogicalName:
					var body = target.GetAttributeValue<string>(Email.Fields.Description);

					// no message
					if (string.IsNullOrEmpty(body))
					{
						return;
					}

					if (body.Contains("<html>"))
					{
						var doc = new XmlDocument();
						doc.LoadXml(body);
						body = doc.SelectSingleNode("body")?.InnerXml;
					}

					// html has no body to display
					if (string.IsNullOrEmpty(body))
					{
						return;
					}

					var users = target.GetAttributeValue<EntityCollection>(Email.Fields.To).Entities
						.Select(e => e.ToEntity<ActivityParty>().Party)
						.Where(a => a.LogicalName == User.EntityLogicalName)
						.Select(a =>
							new NotificationMessageUser
							{
								User = a.Id
							}).ToArray();

					// no users to notify
					if (!users.Any())
					{
						return;
					}

					message =
						new NotificationMessage
						{
							Title = target.GetAttributeValue<string>(Email.Fields.Subject),
							Message = body,
							RegardingTypeCode = Email.EntityTypeCode,
							RegardingID = target.Id.ToString(),
							NotificationMessageUsersOfNotificationMessage = users
						};

					message.NotificationSource = NotificationMessage.NotificationSourceEnum.Email;

					break;

				case Task.EntityLogicalName:
					message =
						new NotificationMessage
						{
							Title = target.GetAttributeValue<string>(Task.Fields.Subject),
							Message = target.GetAttributeValue<string>(Task.Fields.Description),
							RegardingTypeCode = Task.EntityTypeCode,
							RegardingID = target.Id.ToString(),
						};

					var owner = target.GetAttributeValue<EntityReference>(Email.Fields.Owner);

					switch (owner.LogicalName)
					{
						case User.EntityLogicalName:
							message.NotificationMessageUsersOfNotificationMessage =
								new[]
								{
									new NotificationMessageUser
									{
										User = owner.Id
									}
								};
							break;

						case Team.EntityLogicalName:
							message.NotificationMessageTeamsOfNotificationMessage =
								new[]
								{
									new NotificationMessageTeam
									{
										Team = owner.Id
									}
								};
							break;
					}

					message.NotificationSource = NotificationMessage.NotificationSourceEnum.Task;

					break;
			}

			if (message != null)
			{
				message.StatusReason = NotificationMessage.StatusReasonEnum.Open;
				service.Create(message);
			}
		}
	}
}
