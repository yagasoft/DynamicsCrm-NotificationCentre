#region Imports

using System;
using Microsoft.Xrm.Sdk;
using Yagasoft.Libraries.Common;

#endregion

namespace Yagasoft.NotificationCentre.Plugins
{
	/// <summary>
	///     Set the appropriate status based on the source status.<br />
	///     Version: 1.1.1
	/// </summary>
	public class SetClosedStatus : IPlugin
	{
		public void Execute(IServiceProvider serviceProvider)
		{
			new SetClosedStatusLogic().Execute(this, serviceProvider);
		}
	}

	internal class SetClosedStatusLogic : PluginLogic<SetClosedStatus>
	{
		public SetClosedStatusLogic() : base("Update", PluginStage.PreOperation, NotificationMessage.EntityLogicalName)
		{ }

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = Target.ToEntity<NotificationMessage>();

			if (target.ActivityStatus == null || target.ActivityStatus == NotificationMessage.ActivityStatusEnum.Open)
			{
				return;
			}

			var image = PreImage.ToEntity<NotificationMessage>();

			switch (image.StatusReason)
			{
				case NotificationMessage.StatusReasonEnum.Open:
					target.ActivityStatus = NotificationMessage.ActivityStatusEnum.Completed;
					target.StatusReason = NotificationMessage.StatusReasonEnum.Completed;
					break;

				case NotificationMessage.StatusReasonEnum.Draft:
					target.ActivityStatus = NotificationMessage.ActivityStatusEnum.Canceled;
					target.StatusReason = NotificationMessage.StatusReasonEnum.Canceled;
					break;
			}
		}
	}
}
