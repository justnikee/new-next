
import { z } from "zod";
import { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";

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

        return posts.map((post) => {
            const auther = users.find((user) => user.id === post.autherId)

            if (!auther) throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Auther for post not found'
            });

            return {
                post,
                auther: {
                    ...auther,
                    username: auther.username
                }
            };
        });

    }),
});
