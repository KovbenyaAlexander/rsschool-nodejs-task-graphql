import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { graphqlBodySchema } from "./schema";
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`

  type MemberType {
    id: String
    discount: Int
    monthPostsLimit: Int
  }

  type User{
    id: String
    firstName: String
    lastName: String
    email: String
  }

  type Profile{
    id: String
    avatar: String
    sex: String
    birthday: Int
    country: String
    street: String
    city: String
    memberTypeId: String
    userId: String
  }

  type Post{
    id: String
    title: String
    content: String
    userId: String
  }

  type Query {
    users: [User]
    memberTypes: [MemberType]
    posts: [Post]
    profiles: [Profile]
  }

`);

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    "/",
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const resolver = {
        memberTypes: async () => {
          return await fastify.db.memberTypes.findMany();
        },
        users: async () => {
          return await fastify.db.users.findMany();
        },
        posts: async () => {
          return await fastify.db.posts.findMany();
        },
        profiles: async () => {
          return await fastify.db.profiles.findMany();
        },
      };

      return await graphql({
        schema: schema,
        source: String(request.body.query),
        contextValue: fastify,
        rootValue: resolver,
      });
    }
  );
};

export default plugin;
