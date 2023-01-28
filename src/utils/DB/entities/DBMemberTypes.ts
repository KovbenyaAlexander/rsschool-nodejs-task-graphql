import DBEntity from "./DBEntity";

export type MemberTypeEntity = {
  id: string;
  discount: number;
  monthPostsLimit: number;
};
type CreateMemberTypeDTO = MemberTypeEntity;
type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, "id">>;

export default class DBMemberTypes extends DBEntity<
  MemberTypeEntity,
  ChangeMemberTypeDTO,
  CreateMemberTypeDTO
> {
  constructor() {
    super();

    this.create({
      id: "basic",
      discount: 0,
      monthPostsLimit: 20,
    });
    this.create({
      id: "business",
      discount: 5,
      monthPostsLimit: 100,
    });
    this.create({
      id: "userID_1",
      discount: 555,
      monthPostsLimit: 999,
    });

    const forbidOperationTrap: ProxyHandler<any> = {
      apply(target) {
        throw new Error(
          `forbidden operation: cannot ${target.name} a member type`
        );
      },
    };

    this.delete = new Proxy(this.delete, forbidOperationTrap);
    this.create = new Proxy(this.create, forbidOperationTrap);
  }

  async create(dto: CreateMemberTypeDTO) {
    const created: MemberTypeEntity = {
      ...dto,
    };
    this.entities.push(created);
    return created;
  }
}
