module.exports = {
    apiConfig: {
        port: process.env.PORT || 8080,
    },
    dbConfig: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        //  "operatorsAliases": false,}
    },
}
