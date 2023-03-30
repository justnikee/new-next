
import { string, z } from "zod";
import { User } from '@clerk/nextjs/dist/api'
import { clerkClient } from "@clerk/nextjs/server"
import { PrivateProcedures, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure
        .input(z.object({ username: z.string() }))
        .query(async (input) => {
            const [user] = await clerkClient.users.getUserList({
                username: [input.firstname],
            })
            console.log(user)

            if (!user) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "user not found!"
                })
            }

            return user;
        })
});
