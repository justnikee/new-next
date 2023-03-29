import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser, SignOutButton } from '@clerk/nextjs'
import { RouterOutputs, api } from '~/utils/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from "next/image";
import Loadingpage, { LoadingSpinner } from 'src/components/loading'
import { useState } from "react";
import {
  toast
} from "react-hot-toast";
import Link from 'next/link'

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;
  const [input, setInput] = useState("");
  const ctx = api.useContext()

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput(""),
        void ctx.posts.getAll.invalidate();
      toast.success('Ahhh yehhh')
    },
    onError: (e) => {
      const errormsg = e.data?.zodError?.fieldErrors.content;
      if (errormsg && errormsg[0]) {
        toast.error(errormsg[0])
      } else {
        toast.error("Failed to post!! Try again with Emoji.")
      }
    }
  });


  return (
    <div className="flex gap-4 w-full p-8">
      <Image
        height={56}
        width={56} src={user?.profileImageUrl} alt="profile picture" className="w-14 h-14 rounded-full
      "/>
      <input placeholder="Type some emoji's" className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (input !== "") {
              mutate({ content: input })
            }
          }
        }}
        disabled={isPosting}
      />
      {
        input !== "" && !isPosting && (
          <button onClick={() => mutate({ content: input })}>Post</button>
        )
      }

      {isPosting && <div className="flex justify-center items-center"><LoadingSpinner size={20} /></div>}
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
          <Link href={`/@${auther.username}`}><span>{`@${auther.username}`}</span></Link>
          <Link href={`/post/${post.id}`}><span>{` · ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )

}


const Feed = () => {

  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <Loadingpage />;
  if (!data) return <div>something went wrong..</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullpost) => (
        <PostView {...fullpost} key={fullpost.post.id} />
      )
      )}
    </div>
  )
}

const Home: NextPage = () => {

  const { isLoaded: userLoaded, isSignedIn } = useUser()
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Created with T3 Stack</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full border-x border-slate-200 md:max-w-2xl ">
          <div className="border-b border-slate-200 py-4">
            <p className="">
              {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
              {isSignedIn && <CreatePostWizard />}
            </p>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};





export default Home;
