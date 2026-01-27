import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoom1769521021730 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE rooms (
            id UUID PRIMARY KEY,
            short_id VARCHAR(255) UNIQUE NOT NULL,
            code TEXT NOT NULL
        )`);

        await queryRunner.query(`CREATE UNIQUE INDEX idx_rooms_short_id ON rooms (short_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE rooms`);

        await queryRunner.query(`DROP INDEX idx_rooms_short_id`);
    }

}
