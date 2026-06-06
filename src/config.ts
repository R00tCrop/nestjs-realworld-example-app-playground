import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config();

const getConfig = (key: string, defaultValue?: string): string => {
  const value = process.env[key];

  if (value !== undefined) {
    return value;
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`Configuration key "${key}" is missing and no default value provided.`);
  }
}

export const ENVIRONMENT = getConfig('NODE_ENV', 'test');
export const ROOT_PATH = process.cwd();
export const SECRET = getConfig('JWT_SECRET');
export const JWT_LIFETIME = getConfig('JWT_LIFETIME', '1d');
export const PORT = parseInt(getConfig('PORT', '3000'), 10);
export const MYSQL_HOST = getConfig('MYSQL_HOST', '127.0.0.1');
export const MYSQL_PORT = parseInt(getConfig('MYSQL_PORT', '3306'), 10) ;
export const MYSQL_DATABASE = getConfig('MYSQL_DATABASE');
export const MYSQL_USER = getConfig('MYSQL_USER');
export const MYSQL_PASSWORD = getConfig('MYSQL_PASSWORD');
export const TEST_MYSQL_DATABASE = getConfig('TEST_MYSQL_DATABASE');
export const TEST_MYSQL_USER = getConfig('TEST_MYSQL_USER');
export const TEST_MYSQL_PASSWORD = getConfig('TEST_MYSQL_PASSWORD');
export const TYPE_ORM_CONFIG: TypeOrmModuleOptions = {
  type: 'mysql',
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  username: ENVIRONMENT === 'test' ? TEST_MYSQL_USER : MYSQL_USER,
  password: ENVIRONMENT === 'test' ? TEST_MYSQL_PASSWORD : MYSQL_PASSWORD,
  database: ENVIRONMENT === 'test' ? TEST_MYSQL_DATABASE : MYSQL_DATABASE,
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
};