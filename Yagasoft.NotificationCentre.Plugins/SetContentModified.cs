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
	///     This plugin sets the 'content modified' field when content is modified.<br />
	///     Version: 0.0.1
	/// </summary>
	public class SetContentModified : IPlugin
	{
		public void Execute(IServiceProvider serviceProvider)
		{
			new SetContentModifiedLogic().Execute(this, serviceProvider);
		}
	}

	internal class SetContentModifiedLogic : PluginLogic<SetContentModified>
	{
		public SetContentModifiedLogic() : base(null, PluginStage.PreOperation, NotificationMessage.EntityLogicalName)
		{}

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = (Entity) context.InputParameters["Target"];

			log.Log("Setting 'content modified' to now.");
			target[NotificationMessage.Fields.ContentModifiedOn] = DateTime.UtcNow;
		}
	}
}
