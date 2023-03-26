
import { z } from "zod";
import { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return { id: user.id, username: user.username, profileImageUrl: user.profileImageUrl }
}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
        });


        const users = (
            await clerkClient.users.getUserList({
                userId: posts.map((post) => post.autherId),
                limit: 100,
            })
        ).map(filterUserForClient)

        console.log(users)

        return posts.map((post) => ({
            post,
            auther: users.find((user) => user.id === post.autherId),
        }));

    }),
});
