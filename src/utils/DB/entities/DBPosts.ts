import * as crypto from "node:crypto";
import DBEntity from "./DBEntity";

export type PostEntity = {
  id: string;
  title: string;
  content: string;
  userId: string;
};
type CreatePostDTO = Omit<PostEntity, "id">;
type ChangePostDTO = Partial<Omit<PostEntity, "id" | "userId">>;

export default class DBPosts extends DBEntity<
  PostEntity,
  ChangePostDTO,
  CreatePostDTO
> {
  constructor() {
    super();

    this.entities.push({
      id: "11",
      content: "asd",
      title: "ad",
      userId: "userID",
    });
  }
  async create(dto: CreatePostDTO) {
    const created: PostEntity = {
      ...dto,
      id: crypto.randomUUID(),
    };
    this.entities.push(created);
    return created;
  }
}
