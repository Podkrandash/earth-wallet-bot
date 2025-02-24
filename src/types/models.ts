import { Model } from 'sequelize';

export interface WalletAttributes {
  id: number;
  userId: number;
  address: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletInstance extends Model<WalletAttributes>, WalletAttributes {}

export interface UserAttributes {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {} 