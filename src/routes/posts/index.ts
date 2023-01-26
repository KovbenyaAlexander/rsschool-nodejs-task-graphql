import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createPostBodySchema, changePostBodySchema } from "./schema";
import type { PostEntity } from "../../utils/DB/entities/DBPosts";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;

      const post = await fastify.db.posts.findOne({ key: "id", equals: postId });

      if (!post) {
        throw fastify.httpErrors.badRequest("post not found");
      }

      return post;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const newPost = await fastify.db.posts.create(request.body);
      return newPost;
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const post = await fastify.db.posts.findOne({ key: "id", equals: postId });

      if (!post) {
        throw fastify.httpErrors.badRequest("post not found");
      }

      return await fastify.db.posts.delete(postId);
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const post = await fastify.db.posts.findOne({ key: "id", equals: postId });
      const postUpdate = request.body;

      if (!post) {
        throw fastify.httpErrors.badRequest("post not found");
      }

      const newPost = await fastify.db.posts.change(postId, postUpdate);
      return newPost;
    }
  );
};

export default plugin;
