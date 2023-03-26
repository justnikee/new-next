import { type NextPage } from "next";
import Head from "next/head";
import { SignIn, SignInButton, useUser, SignOutButton } from '@clerk/nextjs'
import { api } from '~/utils/api'

const Home: NextPage = () => {

  const user = useUser()
  const { data } = api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Created with T3 Stack</title>
      </Head>
      <section className="flex justify-center items-center bg-green-200 h-screen w-screen">
        <div className="text-center">
          <h1 className="text-xl from-stone-900 bold">Sign Up here</h1>
          <p className="bg-blue-300 px-8 py-2 flex items-center justify-center text-center my-4">
            {!user.isSignedIn && <SignInButton />}
            {!!user.isSignedIn && <SignOutButton />}
          </p>
        </div>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        <div>
          <div>
            {data?.map((post) => (<div key={post.id}>{post.content}</div>))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
