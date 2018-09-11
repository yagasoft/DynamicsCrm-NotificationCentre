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
	///     This plugin ... .<br />
	///     Version: 0.0.1
	/// </summary>
	public class SetTypeCode : IPlugin
	{
		public void Execute(IServiceProvider serviceProvider)
		{
			new SetTypeCodeLogic().Execute(this, serviceProvider);
		}
	}

	internal class SetTypeCodeLogic : PluginLogic<SetTypeCode>
	{
		public SetTypeCodeLogic() : base(null, PluginStage.PreOperation, NotificationMessage.EntityLogicalName)
		{}

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = (Entity) context.InputParameters["Target"];
			var message = target.ToEntity<NotificationMessage>();

			if (message.Regarding != null)
			{
				target[NotificationMessage.Fields.RegardingTypeCode] = MetadataHelpers
					.GetEntityAttribute<int>(service, message.Regarding.LogicalName,
						MetadataHelpers.EntityAttribute.ObjectTypeCode, context.OrganizationId.ToString());
			}
		}
	}
}
