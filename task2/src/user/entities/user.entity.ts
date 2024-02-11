import { Column, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'user',
})
export class User extends Model {
  @Column
  email: string;

  @Column
  password: string;

  @Column
  lastName: string;

  @Column
  phoneNumber: string;

  @Column
  shirtSize: string;

  @Column
  preferredTechnology: string;
}
