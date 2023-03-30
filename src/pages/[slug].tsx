import { type NextPage } from "next";
import Head from "next/head";
import { api } from '~/utils/api'
const ProfilePage: NextPage = () => {

  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "nikhil"
  })

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>404</div>

  console.log(data.username)

  return (
    <>
      <Head>
        <title>Created with T3 Stack</title>
      </Head>
      <div className="flex justify-center h-screen">
        {data.username}
      </div>
    </>
  );
};





export default ProfilePage;
