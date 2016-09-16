
'use strict'

var db = require('../models')

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Account', {
		display_name: DataTypes.STRING,
		external_urls: DataTypes.JSON,
		followers: DataTypes.JSON,
		href: DataTypes.STRING,
		id: { type: DataTypes.STRING, primaryKey: true },
		images: DataTypes.JSON,
		type: DataTypes.STRING,
		uri: DataTypes.STRING,
		number: DataTypes.STRING,
		display_number: DataTypes.STRING,
		access_token: DataTypes.STRING,
		token_type: DataTypes.ENUM('Bearer'),
		refresh_token: DataTypes.STRING,
		expires_at: DataTypes.DATE
	})
}
