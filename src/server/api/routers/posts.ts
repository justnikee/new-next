
import { z } from "zod";
import { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server"
import { PrivateProcedures, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        username: user.firstName,
        profileImageUrl: user.profileImageUrl
    }
}

// Create a new ratelimiter, that allows 3 requests per 1 Minutes
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true
});

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
            content: z.string().min(1).max(280),
        })
    ).mutation(async ({ ctx, input }) => {
        const autherId = ctx.userId;
        const { success } = await ratelimit.limit(autherId);

        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

        const post = await ctx.prisma.post.create({
            data: {
                autherId,
                content: input.content
            }
        });
        return post;
    })
});
