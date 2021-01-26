module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 1998,
  username: 'postgres',
  password: '5454911',
  database: 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
