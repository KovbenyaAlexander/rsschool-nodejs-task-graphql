import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { graphqlBodySchema } from "./schema";
import { graphql } from "graphql";
import { schema } from "./graphqlSchema";

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
          const id = String(request.body.variables!.userId);

          const user = await fastify.db.users.findOne({
            key: "id",
            equals: id,
          });

          const posts = await fastify.db.posts.findMany({
            key: "userId",
            equals: id,
          });

          return {
            ...user,
            posts,
          };
        },

        getUsersWithSubs: async () => {
          const users = await fastify.db.users.findMany();

          const response = users.map(async (user) => {
            const userSubscribedTo = await fastify.db.users.findMany({
              key: "subscribedToUserIds",
              inArray: user.id,
            });

            return {
              ...user,
              userSubscribedTo,
            };
          });

          return response;
        },

        createUser: async () => {
          const { firstName, lastName, email }: any =
            request.body.variables!.input;
          const user = await fastify.db.users.create({
            email,
            firstName,
            lastName,
          });

          return user;
        },

        createProfile: async () => {
          const {
            avatar,
            birthday,
            city,
            country,
            memberTypeId,
            sex,
            street,
            userId,
          }: any = request.body.variables!.input;

          const profile = await fastify.db.profiles.create({
            avatar,
            birthday,
            city,
            country,
            memberTypeId,
            sex,
            street,
            userId,
          });

          return profile;
        },

        createPost: async () => {
          const { title, content, userId }: any = request.body.variables!.input;

          const post = await fastify.db.posts.create({
            content,
            title,
            userId,
          });

          return post;
        },

        updateUser: async () => {
          const { id, firstName, lastName, email }: any =
            request.body.variables!.input;
          const user = await fastify.db.users.change(id, {
            firstName,
            lastName,
            email,
          });
          return user;
        },

        updateProfile: async () => {
          const input: any = request.body.variables!.input;

          const profile = await fastify.db.profiles.change(input.id, input);
          return profile;
        },

        updatePost: async () => {
          const input: any = request.body.variables!.input;

          const post = await fastify.db.posts.change(input.id, input);
          return post;
        },

        updateMemberType: async () => {
          const input: any = request.body.variables!.input;

          const memberType = await fastify.db.memberTypes.change(
            input.id,
            input
          );

          return memberType;
        },

        subscribeTo: async () => {
          const { subscribingUserId, subscribedUserId }: any =
            request.body.variables!.input;

          const user = await fastify.db.users.findOne({
            key: "id",
            equals: subscribedUserId,
          });

          if (!user) {
            throw new Error(`User doesn't exist`);
          }
          if (user.subscribedToUserIds.includes(subscribingUserId)) {
            throw new Error(`User already subscribed`);
          }

          const newUser = await fastify.db.users.change(subscribedUserId, {
            ...user,
            subscribedToUserIds: [
              ...user!.subscribedToUserIds,
              subscribingUserId,
            ],
          });

          return newUser;
        },

        unSubscribeFrom: async () => {
          const { unSubscribingUserId, unSubscribedUserId }: any =
            request.body.variables!.input;

          const user = await fastify.db.users.findOne({
            key: "id",
            equals: unSubscribedUserId,
          });
          if (!user) {
            throw new Error(`User doesn't exist`);
          }

          if (!user.subscribedToUserIds.includes(unSubscribingUserId)) {
            throw new Error(`User doesn't subscribed`);
          }

          const newSubscribers = user.subscribedToUserIds.filter(
            (id) => id !== unSubscribingUserId
          );

          const newUser = await fastify.db.users.change(unSubscribedUserId, {
            ...user,
            subscribedToUserIds: newSubscribers,
          });
          return newUser;
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
