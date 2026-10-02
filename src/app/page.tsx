import { redirect } from "next/navigation";

// 앱의 첫 화면은 재료 시세 탭
export default function Home() {
  redirect("/ingredients");
}
