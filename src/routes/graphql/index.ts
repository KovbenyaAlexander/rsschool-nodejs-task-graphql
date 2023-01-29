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
    subscribedToUserIds: [String]
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

  type UserInfo{
    id: String
    firstName: String
    lastName: String
    email: String
    posts: [Post]
    profile: Profile
    memberType: MemberType
  }

  type UserSubscribedTo{
    id: String
    firstName: String
    lastName: String
    email: String
    userSubscribedTo: [String]
    profile: Profile
  }

  type SubscribedToUser{
    id: String
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
    posts: [Post]
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

    getUserInfoById(userId: String): UserInfo

    getUserSubscribedTo: [UserSubscribedTo]

    getSubscribedToUser: [SubscribedToUser]
  
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
            key: "userId",
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
              equals: String(profile?.memberTypeId),
            });

            return {
              ...user,
              posts,
              profile,
              memberType,
            };
          });
        },

        getUserInfoById: async () => {
          const id = String(request.body.variables!.userId);
          const user = await fastify.db.users.findOne({
            key: "id",
            equals: id,
          });

          if (!user) return [];

          const posts = await fastify.db.posts.findMany({
            key: "userId",
            equals: id,
          });

          const profile = await fastify.db.profiles.findOne({
            key: "userId",
            equals: id,
          });

          const memberType = await fastify.db.memberTypes.findOne({
            key: "id",
            equals: String(profile?.memberTypeId),
          });

          return {
            ...user,
            posts,
            profile,
            memberType,
          };
        },

        getUserSubscribedTo: async () => {
          const users = await fastify.db.users.findMany();

          const response = users.map(async (user) => {
            const userSubscribedTo = await fastify.db.users.findMany({
              key: "subscribedToUserIds",
              inArray: user.id,
            });

            const userProfile = await fastify.db.profiles.findOne({
              key: "userId",
              equals: user.id,
            });

            return {
              ...user,
              profile: userProfile,
              userSubscribedTo,
            };
          });

          return response;
        },

        getSubscribedToUser: async () => {
          const users = await fastify.db.users.findMany();

          const response = users.map(async (user) => {
            const posts = await fastify.db.posts.findMany({
              key: "userId",
              equals: user.id,
            });

            return {
              ...user,
              posts,
            };
          });

          return response;
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
