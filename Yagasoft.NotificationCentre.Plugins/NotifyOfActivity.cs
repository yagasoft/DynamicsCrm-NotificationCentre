#region Imports

using System;
using System.Linq;
using System.Xml;
using Yagasoft.Libraries.Common;
using Microsoft.Xrm.Sdk;

#endregion

namespace Yagasoft.NotificationCentre.Plugins
{
	/// <summary>
	///     Creates a notification message for users if an email or task was received for them.<br />
	///     Version: 1.1.1
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
			var target = Target;
			NotificationMessage message = null;

			var isEnabled = CrmHelpers
				.GetGenericConfig(Service, Context.OrganizationId).ToEntity<CommonConfiguration>()?
					.NotificationsCentreEnabled == true;

			if (!isEnabled)
			{
				return;
			}

			switch (target.LogicalName)
			{
				case Email.EntityLogicalName:
					var email = target.ToEntity<Email>();
					var body = email.Description;

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

					var users = email.To
						.Select(e => e.Party)
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
							Title = email.Subject,
							Message = body,
							RegardingTypeCode = Email.EntityTypeCode,
							RegardingID = target.Id.ToString(),
							MessageUsers = users,
							NotificationSource = GlobalEnums.NotificationSource.Email
						};

					break;

				case Task.EntityLogicalName:
					var task = target.ToEntity<Task>();
					message =
						new NotificationMessage
						{
							Title = task.Subject,
							Message = task.Description,
							RegardingTypeCode = Task.EntityTypeCode,
							RegardingID = target.Id.ToString()
						};

					var owner = task.Owner;

					switch (owner.LogicalName)
					{
						case User.EntityLogicalName:
							message.MessageUsers =
								new[]
								{
									new NotificationMessageUser
									{
										User = owner.Id
									}
								};
							break;

						case Team.EntityLogicalName:
							message.MessageTeams =
								new[]
								{
									new NotificationMessageTeam
									{
										Team = owner.Id
									}
								};
							break;
					}

					message.NotificationSource = GlobalEnums.NotificationSource.Task;

					break;
			}

			if (message != null)
			{
				message.StatusReason = NotificationMessage.StatusReasonEnum.Open;
				Service.Create(message);
			}
		}
	}
}
