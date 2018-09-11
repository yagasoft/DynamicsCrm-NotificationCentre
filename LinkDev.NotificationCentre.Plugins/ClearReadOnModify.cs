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
using LinkDev.Libraries.Common;

#endregion

namespace LinkDev.NotificationCentre.Plugins
{
	/// <summary>
	///     Resets message 'read' status for all users.<br />
	///     Version: 0.0.1
	/// </summary>
	public class ClearReadOnModify : IPlugin
	{
		public void Execute(IServiceProvider serviceProvider)
		{
			new ClearReadOnModifyLogic().Execute(this, serviceProvider);
		}
	}

	internal class ClearReadOnModifyLogic : PluginLogic<ClearReadOnModify>
	{
		public ClearReadOnModifyLogic() : base("Update", PluginStage.PostOperation, NotificationMessage.EntityLogicalName)
		{ }

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = (Entity)context.InputParameters["Target"];
			var message = target.ToEntity<NotificationMessage>();

			var image = context.PreEntityImages.FirstOrDefault().Value?.ToEntity<NotificationMessage>();

			if (image == null)
			{
				throw new InvalidPluginExecutionException("A full pre-image must be register for this step.");
			}

			var isActivating = image.ActivityStatus != NotificationMessage.ActivityStatusEnum.Open
				&& message.ActivityStatus == NotificationMessage.ActivityStatusEnum.Open;
			var isEditingMessage =
				new[]
				{
					NotificationMessage.Fields.Title, NotificationMessage.Fields.Message,
					NotificationMessage.Fields.Regarding, NotificationMessage.Fields.RegardingID
				}.Intersect(target.Attributes.Keys).Any();

			if (isActivating || isEditingMessage)
			{
				var relatedLoader = new NotificationMessage {Id = target.Id};
				relatedLoader.LoadRelation(NotificationMessage.RelationNames.NotificationReadsOfNotificationMessage, service);

				if (relatedLoader.NotificationReadsOfNotificationMessage != null)
				{
					foreach (var read in relatedLoader.NotificationReadsOfNotificationMessage)
					{
						service.Delete(read.LogicalName, read.Id);
					}
				}
			}
		}
	}
}
