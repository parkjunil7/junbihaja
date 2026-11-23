# 준비하자 · 고양이 웨딩 투어

[웨딩 투어 열기](https://parkjunil7.github.io/junbihaja/)

모아보자 아이디와 비밀번호로 로그인하면 두 멤버가 같은 웨딩 후보를 보고 기록할 수 있습니다. 사진이나 링크로 후보를 담고, 같은 항목의 후보 최대 세 개를 견적 대조표에서 비교합니다. 방문일과 금액은 선택 사항입니다.

## 실행과 배포

Node.js 22.12 이상에서 `npm ci`, `npm run dev`를 실행합니다. `npm run build`는 타입과 배포 빌드를 검사합니다. GitHub Actions가 main 브랜치를 GitHub Pages에 배포합니다.

## 데이터와 GPT

기존 모아보자 Supabase Auth의 member-login과 회원 권한을 사용합니다. 준비하자의 브라우저 로그인 세션은 별도 키로 관리합니다. 두 멤버만 wedding_candidates 테이블에서 후보와 축소 사진을 읽고 편집할 수 있습니다. 동시 수정 시 먼저 저장한 버전을 보호합니다.

비교 메모는 사용자가 요청할 때만 실행합니다. wedding-compare 함수가 멤버 권한과 후보를 확인하고 선택한 기록에서 비교에 필요한 텍스트만 OpenAI에 보냅니다. 함수가 사용하는 OPENAI_API_KEY는 모아보자 Supabase의 서버 비밀 값입니다. 웨딩 메모 한도는 한국 시간 기준 1인 하루 10회입니다. 브라우저에 포함된 Supabase publishable key는 공개용이며, 읽기·쓰기 권한은 DB의 RLS 정책이 결정합니다.

스키마 이력은 supabase/migrations에, 서버 함수 소스는 supabase/functions에 있습니다. 별도 Sites 버전에서 저장한 기록은 이 DB로 자동 동기화되지 않습니다.
