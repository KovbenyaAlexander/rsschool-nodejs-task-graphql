import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createProfileBodySchema, changeProfileBodySchema } from "./schema";
import type { ProfileEntity } from "../../utils/DB/entities/DBProfiles";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<ProfileEntity[]> {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: "id", equals: profileId });

      if (!profile) {
        throw reply.code(404);
      }

      return profile;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const user = await fastify.db.profiles.findOne({
        key: "userId",
        equals: request.body.userId,
      });
      if (user) {
        throw reply.code(400);
      }

      const memberTypeId = request.body.memberTypeId;
      const isMemberTypeExist = await fastify.db.memberTypes.findOne({
        key: "id",
        equals: memberTypeId,
      });
      if (!isMemberTypeExist) {
        throw reply.code(400);
      }

      const newProfile = await fastify.db.profiles.create(request.body);
      return newProfile;
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: "id", equals: profileId });

      if (!profile) {
        throw reply.code(400);
      }

      return await fastify.db.profiles.delete(profileId);
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const profileUpdate = request.body;

      const profile = await fastify.db.profiles.findOne({ key: "id", equals: profileId });
      if (!profile) {
        throw reply.code(400);
      }

      const newProfile = await fastify.db.profiles.change(profileId, profileUpdate);
      return newProfile;
    }
  );
};

export default plugin;
