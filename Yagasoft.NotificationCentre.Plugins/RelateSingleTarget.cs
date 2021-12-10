#region Imports

using System;
using Microsoft.Xrm.Sdk;
using Yagasoft.Libraries.Common;

#endregion

namespace Yagasoft.NotificationCentre.Plugins
{
	/// <summary>
	///     Convert the lookup of user, team, and role into a record in the respective grid.<br />
	///     Version: 1.1.1
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
		{ }

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = Target.ToEntity<NotificationMessage>();

			if (target.Role != null)
			{
				Service.Create(
					new NotificationMessageRole
					{
						NotificationMessage = target.Id,
						Role = target.Role
					});
			}

			if (target.Team != null)
			{
				Service.Create(
					new NotificationMessageTeam
					{
						NotificationMessage = target.Id,
						Team = target.Team
					});
			}

			if (target.User != null)
			{
				Service.Create(
					new NotificationMessageUser
					{
						NotificationMessage = target.Id,
						User = target.User
					});
			}

			if (target.Role != null || target.Team != null || target.User != null)
			{
				Service.Update(
					new NotificationMessage
					{
						Id = target.Id,
						Role = null,
						Team = null,
						User = null
					});
			}
		}
	}
}
