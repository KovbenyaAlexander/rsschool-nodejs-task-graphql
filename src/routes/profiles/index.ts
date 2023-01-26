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
        throw fastify.httpErrors.badRequest("profile not found");
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
        throw fastify.httpErrors.badRequest("profile not found");
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
        throw fastify.httpErrors.badRequest("profile not found");
      }

      const newProfile = await fastify.db.profiles.change(profileId, profileUpdate);
      return newProfile;
    }
  );
};

export default plugin;
