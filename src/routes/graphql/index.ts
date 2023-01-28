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

  type UsersInfo{
    id: String
    firstName: String
    lastName: String
    email: String
    posts: [Post]
    profile: Profile
    memberType: MemberType
  }

  type Query {
    users: [User]
    memberTypes: [MemberType]
    posts: [Post]
    profiles: [Profile]

    memberType(memberId: String): MemberType
    user(userId: String): User
    profile(profileId: String): Profile
    post(postId: String): Post

    getUsersInfo: [UsersInfo]
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

        memberType: async () => {
          const id = String(request.body.variables!.memberId);
          return await fastify.db.memberTypes.findOne({
            key: "id",
            equals: id,
          });
        },
        user: async () => {
          const id = String(request.body.variables!.userId);
          return await fastify.db.users.findOne({
            key: "id",
            equals: id,
          });
        },
        post: async () => {
          const id = String(request.body.variables!.postId);
          return await fastify.db.posts.findOne({
            key: "id",
            equals: id,
          });
        },
        profile: async () => {
          const id = String(request.body.variables!.profileId);
          return await fastify.db.profiles.findOne({
            key: "id",
            equals: id,
          });
        },

        getUsersInfo: async () => {
          const users = await fastify.db.users.findMany();

          return users.map(async (user) => {
            const posts = await fastify.db.posts.findMany({
              key: "userId",
              equals: user.id,
            });

            const profile = await fastify.db.profiles.findOne({
              key: "userId",
              equals: user.id,
            });

            const memberType = await fastify.db.memberTypes.findOne({
              key: "id",
              equals: String(profile?.userId),
            });

            console.log({
              ...user,
              posts,
              profile,
              memberType,
            });

            return {
              ...user,
              posts,
              profile,
              memberType,
            };
          });
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
