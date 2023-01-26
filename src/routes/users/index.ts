import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createUserBodySchema, changeUserBodySchema, subscribeBodySchema } from "./schemas";
import type { UserEntity } from "../../utils/DB/entities/DBUsers";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const userId = request.params.id;
      const user = await fastify.db.users.findOne({ key: "id", equals: userId });
      if (!user) {
        throw fastify.httpErrors.badRequest("user not found");
      }
      return user;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const newUSer = await fastify.db.users.create(request.body);
      return newUSer;
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const user = await fastify.db.users.findOne({ key: "id", equals: userId });

      if (!user) {
        throw fastify.httpErrors.badRequest("user not found");
      }

      return await fastify.db.users.delete(userId);
    }
  );

  fastify.post(
    "/:id/subscribeTo",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.body.userId;
      const usersIdForSubscribe = request.params.id;

      const user = await fastify.db.users.findOne({ key: "id", equals: userId });

      if (!user) {
        throw fastify.httpErrors.badRequest("user not found");
      }

      const newUser = await fastify.db.users.change(userId, {
        subscribedToUserIds: [...user.subscribedToUserIds, usersIdForSubscribe],
      });

      return newUser;
    }
  );

  fastify.post(
    "/:id/unsubscribeFrom",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.body.userId;
      const usersIdForUnsubscribe = request.params.id;
      const user = await fastify.db.users.findOne({ key: "id", equals: userId });

      if (!user) {
        throw fastify.httpErrors.badRequest("user not found");
      }

      const newSubscribedIds = user.subscribedToUserIds.filter(
        (id) => id !== usersIdForUnsubscribe
      );

      const newUser = await fastify.db.users.change(userId, {
        subscribedToUserIds: [...newSubscribedIds],
      });

      return newUser;
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const userUpdate = request.body;

      const user = await fastify.db.users.findOne({ key: "id", equals: userId });

      if (!user) {
        throw fastify.httpErrors.badRequest("user not found");
      }

      const newUser = await fastify.db.users.change(userId, userUpdate);
      return newUser;
    }
  );
};

export default plugin;
