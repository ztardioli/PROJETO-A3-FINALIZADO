const mysql = require("mysql");

function createDatabaseConnection() {
	const conn = mysql.createConnection({
		host: '127.0.0.1:3306',
		user: 'root',
		password: 'root',
		database: 'backend_db'
	});

	conn.connect();

	return conn;
}

function createRecord(name, email, password, phone_number) {
	return new Promise((resolve, reject) => {

		const conn = createDatabaseConnection();

		conn.query({
			sql: "INSERT INTO users (name, email, password, phone_number) VALUES(?, ?, ?, ?)",
			values: [name, email, password, phone_number]
		}, function(error, results, fields) {
			if (error) {
				reject(new Error("Error creating record!"))
			} else {
				resolve("Record created successfully");
			};

		});

		conn.end();
	})
}

module.exports = { createRecord };
