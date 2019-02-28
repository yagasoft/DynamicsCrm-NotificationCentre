#region Imports

using System;
using Yagasoft.Libraries.Common;
using Microsoft.Xrm.Sdk;

#endregion

namespace Yagasoft.NotificationCentre.Plugins
{
	/// <summary>
	///     This plugin ... .<br />
	///     Version: 0.0.1
	/// </summary>
	public class RelateSingleTarget : IPlugin
	{
		public void Execute(IServiceProvider serviceProvider)
		{
			new RelateSingleTargetLogic().Execute(this, serviceProvider);
		}
	}

	internal class RelateSingleTargetLogic : PluginLogic<RelateSingleTarget>
	{
		public RelateSingleTargetLogic() : base(null, PluginStage.PostOperation, NotificationMessage.EntityLogicalName)
		{}

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = (Entity) context.InputParameters["Target"];
			var message = target.ToEntity<NotificationMessage>();

			if (message.Role != null)
			{
				service.Create(new NotificationMessageRole
							   {
								   NotificationMessage = target.Id,
								   Role = message.Role
							   });
			}

			if (message.Team != null)
			{
				service.Create(new NotificationMessageTeam
							   {
								   NotificationMessage = target.Id,
								   Team = message.Team
							   });
			}

			if (message.User != null)
			{
				service.Create(new NotificationMessageUser
							   {
								   NotificationMessage = target.Id,
								   User = message.User
							   });
			}

			if (message.Role != null || message.Team != null || message.User != null)
			{
				service.Update(new NotificationMessage
							   {
								   Id = target.Id,
								   [NotificationMessage.Fields.Role] = null,
								   [NotificationMessage.Fields.Team] = null,
								   [NotificationMessage.Fields.User] = null
							   });
			}
		}
	}
}
