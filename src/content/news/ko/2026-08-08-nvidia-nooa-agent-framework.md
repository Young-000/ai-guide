---
title: "NVIDIA, AI 에이전트를 파이썬 클래스 하나로 — NOOA 프레임워크 오픈소스 공개"
lang: ko
date: 2026-08-08
slug: nvidia-nooa-agent-framework
summary: "NVIDIA가 AI 에이전트를 단일 파이썬 클래스로 정의하는 객체지향 프레임워크 NOOA를 오픈소스로 공개했다. SWE-bench Verified에서 82.2%를 기록하며 GPT-5.5 대비 토큰 절반으로 최고 성능을 달성했다고 밝혔다."
tags: ["NVIDIA", "에이전트", "오픈소스", "Python", "SWE-bench"]
sources:
  - title: "NVIDIA AI Releases NOOA: An Object-Oriented Python Framework"
    url: "https://www.marktechpost.com/2026/08/07/nvidia-ai-releases-nooa-an-object-oriented-python-framework/"
  - title: "Nvidia's NOOA makes an agent one Python class"
    url: "https://thenewstack.io/nvidia-nooa-agent-framework/"
  - title: "NVIDIA Forms 37-Member Open Secure AI Alliance and Open-Sources NOOA Framework"
    url: "https://thehackernews.com/2026/07/nvidia-forms-37-member-open-secure-ai.html"
---

**한 줄 요약**: NVIDIA가 에이전트를 파이썬 클래스 하나로 표현하는 NOOA 프레임워크를 Apache 2.0으로 공개하고, 37개 파트너와 함께 'Open Secure AI Alliance'를 발족했다.

### 핵심
- **핵심 아이디어**: 에이전트 = 파이썬 클래스 1개. 필드가 상태, 메서드가 기능, 독스트링이 프롬프트, 타입 어노테이션이 모델 계약을 담당
- **성능**: GPT-5.5 기준 SWE-bench Verified 82.2% 달성, 기존 대비 토큰 사용 절반·컨텍스트 압축 불필요
- **오픈소스**: Apache 2.0, `pip install nooa`(v0.0.8), Python 3.12–3.13 지원 — 현재 리서치 프리뷰(알파)
- **보안 경고**: NVIDIA 자체 명시 — LLM이 생성한 Python 코드를 실행하므로 데이터 유출·파일 삭제 위험 내포, "컨테인먼트 경계 아님"

### 왜 중요한가
에이전트 개발의 복잡도를 극단적으로 낮추는 접근으로, 모델보다 하네스(실행 환경)가 성능을 좌우할 수 있음을 보여준다. 37개 기업이 참여한 Alliance 출범과 맞물려 NVIDIA가 에이전트 표준화 경쟁에서 주도권을 잡으려는 포석으로 읽힌다.

### 더 보기
- [NVIDIA NOOA 소개 (MarkTechPost)](https://www.marktechpost.com/2026/08/07/nvidia-ai-releases-nooa-an-object-oriented-python-framework/) — MarkTechPost
- [Nvidia's NOOA: 에이전트를 클래스 하나로 (The New Stack)](https://thenewstack.io/nvidia-nooa-agent-framework/) — The New Stack
