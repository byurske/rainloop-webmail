
(function () {

	'use strict';

	var
		ko = require('ko'),

		Enums = require('Common/Enums'),
		Globals = require('Common/Globals'),
		Utils = require('Common/Utils'),

		Remote = require('Storage/User/Remote')
	;

	/**
	 * @constructor
	 */
	function SecurityUserSetting()
	{
		this.processing = ko.observable(false);
		this.clearing = ko.observable(false);
		this.secreting = ko.observable(false);

		this.viewUser = ko.observable('');
		this.viewEnable = ko.observable(false);
		this.viewEnable.subs = true;
		this.twoFactorStatus = ko.observable(false);

		this.viewSecret = ko.observable('');
		this.viewBackupCodes = ko.observable('');
		this.viewUrl = ko.observable('');

		this.bFirst = true;

		this.viewTwoFactorStatus = ko.computed(function () {
			Globals.langChangeTrigger();
			return Utils.i18n(
				this.twoFactorStatus() ?
					'SETTINGS_SECURITY/TWO_FACTOR_SECRET_CONFIGURED_DESC' :
					'SETTINGS_SECURITY/TWO_FACTOR_SECRET_NOT_CONFIGURED_DESC'
			);
		}, this);

		this.onResult = _.bind(this.onResult, this);
		this.onSecretResult = _.bind(this.onSecretResult, this);
	}

	SecurityUserSetting.prototype.showSecret = function ()
	{
		this.secreting(true);
		Remote.showTwoFactorSecret(this.onSecretResult);
	};

	SecurityUserSetting.prototype.hideSecret = function ()
	{
		this.viewSecret('');
		this.viewBackupCodes('');
		this.viewUrl('');
	};

	SecurityUserSetting.prototype.createTwoFactor = function ()
	{
		this.processing(true);
		Remote.createTwoFactor(this.onResult);
	};

	SecurityUserSetting.prototype.enableTwoFactor = function ()
	{
		this.processing(true);
		Remote.enableTwoFactor(this.onResult, this.viewEnable());
	};

	SecurityUserSetting.prototype.testTwoFactor = function ()
	{
		require('Knoin/Knoin').showScreenPopup(require('View/Popup/TwoFactorTest'));
	};

	SecurityUserSetting.prototype.clearTwoFactor = function ()
	{
		this.viewSecret('');
		this.viewBackupCodes('');
		this.viewUrl('');

		this.clearing(true);
		Remote.clearTwoFactor(this.onResult);
	};

	SecurityUserSetting.prototype.onShow = function ()
	{
		this.viewSecret('');
		this.viewBackupCodes('');
		this.viewUrl('');
	};

	SecurityUserSetting.prototype.onResult = function (sResult, oData)
	{
		this.processing(false);
		this.clearing(false);

		if (Enums.StorageResultType.Success === sResult && oData && oData.Result)
		{
			this.viewUser(Utils.pString(oData.Result.User));
			this.viewEnable(!!oData.Result.Enable);
			this.twoFactorStatus(!!oData.Result.IsSet);

			this.viewSecret(Utils.pString(oData.Result.Secret));
			this.viewBackupCodes(Utils.pString(oData.Result.BackupCodes).replace(/[\s]+/g, '  '));
			this.viewUrl(Utils.pString(oData.Result.Url));
		}
		else
		{
			this.viewUser('');
			this.viewEnable(false);
			this.twoFactorStatus(false);

			this.viewSecret('');
			this.viewBackupCodes('');
			this.viewUrl('');
		}

		if (this.bFirst)
		{
			this.bFirst = false;
			var self = this;
			this.viewEnable.subscribe(function (bValue) {
				if (this.viewEnable.subs)
				{
					Remote.enableTwoFactor(function (sResult, oData) {
						if (Enums.StorageResultType.Success !== sResult || !oData || !oData.Result)
						{
							self.viewEnable.subs = false;
							self.viewEnable(false);
							self.viewEnable.subs = true;
						}
					}, bValue);
				}
			}, this);
		}
	};

	SecurityUserSetting.prototype.onSecretResult = function (sResult, oData)
	{
		this.secreting(false);

		if (Enums.StorageResultType.Success === sResult && oData && oData.Result)
		{
			this.viewSecret(Utils.pString(oData.Result.Secret));
			this.viewUrl(Utils.pString(oData.Result.Url));
		}
		else
		{
			this.viewSecret('');
			this.viewUrl('');
		}
	};

	SecurityUserSetting.prototype.onBuild = function ()
	{
		this.processing(true);
		Remote.getTwoFactor(this.onResult);
	};

	module.exports = SecurityUserSetting;

}());