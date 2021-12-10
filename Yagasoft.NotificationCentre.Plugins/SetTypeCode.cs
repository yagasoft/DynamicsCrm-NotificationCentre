#region Imports

using System;
using Microsoft.Xrm.Sdk;
using Yagasoft.Libraries.Common;

#endregion

namespace Yagasoft.NotificationCentre.Plugins
{
	/// <summary>
	///     Sets the entity type code to be used on the UI URL for the record.<br />
	///     Version: 1.1.1
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
		{ }

		protected override void ExecuteLogic()
		{
			// get the triggering record
			var target = Target.ToEntity<NotificationMessage>();

			if (target.Regarding != null)
			{
				target.RegardingTypeCode = MetadataHelpers
					.GetEntityAttribute<int>(Service, target.Regarding.LogicalName,
						MetadataHelpers.EntityAttribute.ObjectTypeCode, Context.OrganizationId);
			}
		}
	}
}
