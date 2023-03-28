
import { z } from "zod";
import { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server"
import { PrivateProcedures, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
    return { id: user.id, username: user.firstName, profileImageUrl: user.profileImageUrl }
}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{ createdAt: "desc" }]
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


    create: PrivateProcedures.input(
        z.object({
            content: z.string().emoji().min(1).max(280),
        })
    ).mutation(async ({ ctx, input }) => {
        const autherId = ctx.userId;

        const post = await ctx.prisma.post.create({
            data: {
                autherId,
                content: input.content
            }
        });
        return post;
    })
});
