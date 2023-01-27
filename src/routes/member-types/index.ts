import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { changeMemberTypeBodySchema } from "./schema";
import type { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<MemberTypeEntity[]> {
    return await fastify.db.memberTypes.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberTypeId = request.params.id;
      const memberType = await fastify.db.memberTypes.findOne({ key: "id", equals: memberTypeId });
      if (!memberType) {
        throw reply.code(404);
      }
      return memberType;
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberTypeId = request.params.id;
      const memberTypeUpdate = request.body;

      const user = await fastify.db.memberTypes.findOne({ key: "id", equals: memberTypeId });

      if (!user) {
        throw reply.code(400);
      }

      const newmemberType = await fastify.db.memberTypes.change(memberTypeId, memberTypeUpdate);
      return newmemberType;
    }
  );
};

export default plugin;
