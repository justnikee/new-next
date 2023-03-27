import { type NextPage } from "next";
import Head from "next/head";
import { SignIn, SignInButton, useUser, SignOutButton } from '@clerk/nextjs'
import { RouterOutputs, api } from '~/utils/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from "next/image";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex gap-4 w-full p-8">
      <Image
        height={56}
        width={56} src={user?.profileImageUrl} alt="profile picture" className="w-14 h-14 rounded-full
      "/>
      <input placeholder="type some emoji's" className="bg-transparent grow outline-none" />
    </div>
  )
}
// this comes from api trpc //
type PostWithUser = RouterOutputs['posts']['getAll'][number]
const PostView = (props: PostWithUser) => {
  const { post, auther } = props;
  return (
    <div className="p-8 border-b border-slate-200 flex items-center gap-4" key={post.id}>
      <Image
        height={56}
        width={56}
        src={auther.profileImageUrl} alt={`${auther.username}'s profile Picture`} className="w-14 h-14 rounded-full
      " />
      <div className="flex flex-col">
        <div className="flex text-slate-200 gap-1">
          <span>{`@${auther.username}`}</span>
          <span>{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
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
            {[...data, ...data]?.map((fullpost) => (
              <PostView {...fullpost} key={fullpost.post.id} />
            )
            )}
          </div>
        </div>
      </main>
    </>
  );
};





export default Home;
