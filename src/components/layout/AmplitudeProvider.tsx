"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { useEffect } from "react";

// Amplitude 연동. API Key는 .env.local의 NEXT_PUBLIC_AMPLITUDE_API_KEY로 관리한다.
// 키가 없으면(예: 다른 사람이 저장소를 받아 실행) 아무것도 보내지 않는다.
const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let initialized = false;

/** Amplitude 초기화 (브라우저에서 한 번만). 페이지뷰·클릭·폼 입력은 autocapture로 자동 수집한다 */
export function AmplitudeProvider() {
  useEffect(() => {
    if (initialized || !API_KEY) return;
    amplitude.init(API_KEY, {
      autocapture: {
        // 화면 이동(주소 변경)마다 페이지뷰를 남긴다
        pageViews: true,
        formInteractions: true,
        // 클릭 수집은 기본값이 꺼져 있어 직접 켠다
        elementInteractions: true,
      },
    });
    initialized = true;
  }, []);

  return null;
}
