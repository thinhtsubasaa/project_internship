import { Layout } from "antd";
import Head from "next/head";
import HeaderComponent from "@/components/HeaderComponent";
import FooterComponent from "@/components/FooterComponent";
import { useRouter } from "next/router";
import { useUserState } from "@/recoils/user.state";
const { Content } = Layout;

export function UserWebLayout({ children }) {
  const [user] = useUserState();
  const { pathname, push } = useRouter();

  const role = user?.result?.role;

  if (
    role === "admin" &&
    !(pathname.includes("admin") || pathname.includes("_error"))
  ) {
    push("/admin/dashboard");
  }

  return (
    <Layout className="bg-white min-h-screen">
      <Head>
        <link
          rel="icon"
          href="https://cdn-icons-png.flaticon.com/512/3393/3393370.png"
        />
        <title>CRT- Ứng dụng thuê xe tự lái chất lượng</title>
      </Head>
      <HeaderComponent />
      <Content className="bg-white py-2">{children}</Content>
      <FooterComponent />
    </Layout>
  );
}
