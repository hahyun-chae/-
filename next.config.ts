import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// 같은 와이파이의 휴대폰·다른 PC에서 http://<내부 IP>:3000 으로 개발 서버에 접속할 수 있도록
// 이 컴퓨터의 현재 내부 IPv4 주소를 허용한다. (와이파이가 바뀌면 서버를 재시작하면 됨)
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n!.address);

const nextConfig: NextConfig = {
  // 상위 폴더(~/)의 package-lock.json을 프로젝트 루트로 오인하지 않도록 고정
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;
