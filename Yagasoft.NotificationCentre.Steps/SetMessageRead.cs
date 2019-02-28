#region Imports

using System;
using System.Activities;
using Yagasoft.Libraries.Common;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;

#endregion

namespace Yagasoft.NotificationCentre.Steps
{
	/// <summary>
	///     This custom workflow step ... .<br />
	///     Version: 0.0.1
	/// </summary>
	public class SetMessageRead : CodeActivity
	{
		#region Arguments

		[RequiredArgument]
		[Input("Message ID")]
		public InArgument<string> MessageIdArg { get; set; }

		[RequiredArgument]
		[Input("User")]
		[ReferenceTarget(User.EntityLogicalName)]
		public InArgument<EntityReference> UserRefArg { get; set; }

		#endregion

		protected override void Execute(CodeActivityContext executionContext)
		{
			new SetMessageReadLogic().Execute(this, executionContext);
		}
	}

	internal class SetMessageReadLogic : StepLogic<SetMessageRead>
	{
		protected override void ExecuteLogic()
		{
			var messageId = executionContext.GetValue(codeActivity.MessageIdArg);
			var userRef = executionContext.GetValue(codeActivity.UserRefArg);

			service.Create(
				new NotificationRead
				{
					NotificationMessage = Guid.Parse(messageId),
					User = userRef.Id
				});
		}
	}
}
