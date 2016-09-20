'use strict';

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Message', {
		type: DataTypes.ENUM('fb', 'sms', 'chatter'),
		sender: DataTypes.STRING,
		text: DataTypes.STRING,
		raw_message: DataTypes.JSON,
		track_id: DataTypes.STRING

		// accountSid: DataTypes.STRING,
		// messageSid: DataTypes.STRING,
		// smsMessageSid: DataTypes.STRING,
		// smsSid: DataTypes.STRING,
		// from:	DataTypes.STRING,
		// fromCity:	DataTypes.STRING,
		// fromCountry: DataTypes.STRING,
		// fromState: DataTypes.STRING,
		// fromZip: DataTypes.STRING,
		// to:  DataTypes.STRING,
		// toCity:  DataTypes.STRING,
		// toCountry:  DataTypes.STRING,
		// toState:  DataTypes.STRING,
		// toZip:  DataTypes.STRING,
		// body: DataTypes.TEXT,
		// trackId: DataTypes.STRING
	})
}
