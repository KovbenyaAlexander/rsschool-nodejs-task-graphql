import { buildSchema } from "graphql";

export const schema = buildSchema(`

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
    subscribedToUserIds: [String]
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

  type UsersWithSubs{
    id: String
    firstName: String
    lastName: String
    email: String
    subscribedToUserIds: [String]
    userSubscribedTo: [String]
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

    getSubscribedToUser(userId: String): SubscribedToUser
  
    getUsersWithSubs: [UsersWithSubs]
  }

  input UserInput{
    firstName: String!,
    lastName: String!,
    email: String!
  }

  input ProfileInput{
    avatar: String
    sex: String
    birthday: Int
    country: String
    street: String
    city: String
    memberTypeId: String
    userId: String
  }

  input PostInput{
    title: String
    content: String
    userId: String
  }

  input UpdateUserInput{
    id: String!
    firstName: String
    lastName: String
    email: String
  }

  input UpdateProfileInput{
    id: String!
    avatar: String
    sex: String
    birthday: Int
    country: String
    street: String
    city: String
    memberTypeId: String
    userId: String
  }

  input UpdatePostInput{
    id: String!
    title: String
    content: String
    userId: String
  }

  input UpdateMemberTypeInput{
    id: String!
    discount: Int
    monthPostsLimit: Int
  }

  input SubscribeToInput{
    subscribingUserId: String!
    subscribedUserId: String!
  }

  input UnSubscribeFromInput{
    unSubscribingUserId: String!
    unSubscribedUserId: String!
  }

  type Mutation{
    createUser(input: UserInput): User
    createProfile(input: ProfileInput):Profile
    createPost(input: PostInput):Post

    updateUser(input: UpdateUserInput): User
    updateProfile(input: UpdateProfileInput): Profile
    updatePost(input: UpdatePostInput): Post
    updateMemberType(input: UpdateMemberTypeInput): MemberType

    subscribeTo(input: SubscribeToInput): User
    unSubscribeFrom(input: UnSubscribeFromInput): User
  }
`);
