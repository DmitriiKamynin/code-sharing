import { Column, Entity, PrimaryColumn, Generated } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'short_id' })
  shortId: string;

  @Column()
  code: string;
}
