import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

const opts: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'ferrari',
  synchronize: true,
  logging: true,
  entities: [],
  migrations: [`${__dirname}/typeorm/migration/**/*.ts`],
  subscribers: [],
};
export const AppDataSource = new DataSource(opts as DataSourceOptions);
