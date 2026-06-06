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

export const ROOT_PATH = process.cwd();
export const SECRET = getConfig('JWT_SECRET');
export const JWT_LIFETIME = getConfig('JWT_LIFETIME', '1d');
export const PORT = parseInt(getConfig('PORT', '3000'), 10);
export const MYSQL_HOST = getConfig('MYSQL_HOST', '127.0.0.1');
export const MYSQL_PORT = parseInt(getConfig('MYSQL_PORT', '3306'), 10) ;
export const MYSQL_DATABASE = getConfig('MYSQL_DATABASE');
export const MYSQL_USER = getConfig('MYSQL_USER');
export const MYSQL_PASSWORD = getConfig('MYSQL_PASSWORD');
export const TYPE_ORM_CONFIG: TypeOrmModuleOptions = {
  type: 'mysql',
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  username: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
};