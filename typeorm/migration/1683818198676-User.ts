import { query } from 'express';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class User1683818198676 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'persons',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '250',
            isNullable: false,
          },
          {
            name: 'birthAt',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '16',
            isNullable: true,
          },
          {
            name: 'document',
            type: 'varchar',
            length: '14',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updateAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '250',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '250',
            isNullable: false,
          },
          {
            name: 'photo',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'personId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'dateTime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
    // A TABELA USERS É LIGADA A TABELA PERSONS ATRAVÉS DO FOREIGNKEY
    // NÃO ESQUECER DE NOMEAR O FORIGNKEY SENÃO VC NÃO VAI CONSEGUIR APAGAR DEPOIS
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['personId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'persons',
        name: 'FK_users_persons',
        onDelete: 'CASCADE',
      }),
    );
  }
  // O DOWN É SEMPRE NA ORDEM INVERSA DO UP -> P/ NÃO DAR ERRO NA HORA DE DELETAR
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'FK_users_persons');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('persons');
  }
}
