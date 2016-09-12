
'use strict'

var db = require('../models')

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('PlayerEvent', {
		action: DataTypes.STRING,
		payload: DataTypes.JSON
	})
}
