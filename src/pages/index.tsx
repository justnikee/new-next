import { type NextPage } from "next";
import Head from "next/head";
import { SignIn, SignInButton, useUser, SignOutButton } from '@clerk/nextjs'
import { api } from '~/utils/api'

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  console.log(user)
  return (
    <div className="flex gap-4 w-full">
      <img src={user?.profileImageUrl} alt="profile image" className="w-14 h-14 rounded-full
      "/>
      <input placeholder="type some emoji's" className="bg-transparent grow outline-none" />
    </div>
  )
}

const Home: NextPage = () => {

  const user = useUser()
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Something Went Wrong.</div>

  return (
    <>
      <Head>
        <title>Created with T3 Stack</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full border-x border-slate-200 md:max-w-2xl ">
          <div className="border-b border-slate-200 py-4">
            <p className="">
              {!user.isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
              {user.isSignedIn && <CreatePostWizard />}
            </p>
          </div>
          <div className="flex flex-col">
            {/* {[...data, ...data]?.map((post) => (<div className="p-8 border-b border-slate-200" key={post.id}>{post.content}</div>))} */}
          </div>
        </div>
      </main>
    </>
  );
};





export default Home;
