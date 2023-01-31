import * as crypto from "node:crypto";
import DBEntity from "./DBEntity";

export type UserEntity = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscribedToUserIds: string[];
};
type CreateUserDTO = Omit<UserEntity, "id" | "subscribedToUserIds">;
type ChangeUserDTO = Partial<Omit<UserEntity, "id">>;

export default class DBUsers extends DBEntity<
  UserEntity,
  ChangeUserDTO,
  CreateUserDTO
> {
  constructor() {
    super();

    this.entities.push({
      id: "userID_1",
      email: "qwe@gmail.com",
      firstName: "sanya",
      lastName: "K",
      subscribedToUserIds: [],
    });
  }
  async create(dto: CreateUserDTO) {
    const created: UserEntity = {
      ...dto,
      subscribedToUserIds: [],
      id: crypto.randomUUID(),
    };
    this.entities.push(created);
    return created;
  }
}
