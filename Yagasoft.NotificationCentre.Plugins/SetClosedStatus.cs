#region Imports

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata.Query;
using Microsoft.Xrm.Sdk.Query;
using Yagasoft.Libraries.Common;

#endregion

namespace Yagasoft.NotificationCentre.Plugins
{
	/// <summary>
	///     This plugin ... .<br />
	///     Version: 0.0.1
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
		{}

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = (Entity)context.InputParameters["Target"];
			var message = target.ToEntity<NotificationMessage>();
			
			if (message.ActivityStatus != null && message.ActivityStatus != NotificationMessage.ActivityStatusEnum.Open)
			{
				var image = context.PreEntityImages.FirstOrDefault().Value?.ToEntity<NotificationMessage>();

				if (image?.StatusReason == null)
				{
					throw new InvalidPluginExecutionException("A full pre-image must be register for this step.");
				}

				if (image.StatusReason == NotificationMessage.StatusReasonEnum.Open)
				{
					target[NotificationMessage.Fields.ActivityStatus] = NotificationMessage.ActivityStatusEnum.Completed.ToOptionSetValue();
					target[NotificationMessage.Fields.StatusReason] = NotificationMessage.StatusReasonEnum.Completed.ToOptionSetValue();
				}
				else if (image.StatusReason == NotificationMessage.StatusReasonEnum.Draft)
				{
					target[NotificationMessage.Fields.ActivityStatus] = NotificationMessage.ActivityStatusEnum.Canceled.ToOptionSetValue();
					target[NotificationMessage.Fields.StatusReason] = NotificationMessage.StatusReasonEnum.Canceled.ToOptionSetValue();
				}
			}
		}
	}
}
