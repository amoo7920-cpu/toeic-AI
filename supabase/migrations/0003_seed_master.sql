-- 2장 시험 구조 표 그대로
insert into chapters (id, code, name, question_nos, prep_secs, response_secs) values
  (1, 'CH1', 'Read a text aloud',                    '{1,2}',     '{45,45}',    '{45,45}'),
  (2, 'CH2', 'Describe a picture',                   '{3,4}',     '{45,45}',    '{30,30}'),
  (3, 'CH3', 'Respond to questions',                 '{5,6,7}',   '{3,3,3}',    '{15,15,30}'),
  (4, 'CH4', 'Respond using information provided',   '{8,9,10}',  '{45,3,3}',   '{15,15,30}'),
  (5, 'CH5', 'Express an opinion',                   '{11}',      '{45}',       '{60}');

-- 6장 챕터별 답변 템플릿 (뼈대는 절대 바뀌지 않고, 렌더링 시 {SLOT}만 채운다)
insert into answer_templates (id, chapter_id, label, skeleton, slot_keys, logic, min_words, max_words) values
(
  'T1-READ', 1, 'Read a text aloud — 읽기 기호 표기',
  $sk$없음. 원문 위에 끊어읽기(/, //)와 강세(굵게), 억양(↗ ↘) 기호를 표기하는 것 자체가 모범답안이다.$sk$,
  '{}', '없음 — 발음/억양/강세 기호 표기가 모범답안', null, null
),
(
  'T2-PICTURE', 2, 'Describe a picture',
  $sk$This picture was taken {at/in} {PLACE}. The first thing I notice is {MAIN_PERSON}, who is {ACTION_1}. Next to {him/her}, {PERSON_2} is {ACTION_2}. On the {left/right} side of the picture, I can see {DETAIL}. In the background, there {is/are} {BACKGROUND}. Overall, it looks like a {busy/relaxing/productive} {moment/day} {CONTEXT}.$sk$,
  '{PLACE,MAIN_PERSON,ACTION_1,PERSON_2,ACTION_2,DETAIL,BACKGROUND,CONTEXT}',
  '장소 → 핵심 인물 → 주변 → 배경 → 전체 느낌', 50, 70
),
(
  'T3-SHORT', 3, 'Respond to questions (Q5-Q6)',
  $sk$ {DIRECT_ANSWER}. That's because {REASON}. {ONE_EXTRA_DETAIL}.$sk$,
  '{DIRECT_ANSWER,REASON,ONE_EXTRA_DETAIL}',
  '결론 먼저 → 이유 → 재강조', null, null
),
(
  'T3-LONG', 3, 'Respond to questions (Q7)',
  $sk$I think {OPINION}. There are two reasons. First, {REASON_1}. Second, {REASON_2}. For example, {SHORT_EXAMPLE}. So, {RESTATE_OPINION}.$sk$,
  '{OPINION,REASON_1,REASON_2,SHORT_EXAMPLE,RESTATE_OPINION}',
  '결론 먼저 → 이유 두 개 → 예시 → 재강조', 55, 75
),
(
  'T4-Q8', 4, 'Respond using information (Q8)',
  $sk$Sure. {EVENT} will {start/be held} on {DATE} at {TIME}, {at PLACE}.$sk$,
  '{EVENT,DATE,TIME,PLACE}',
  '정보 그대로 전달', null, null
),
(
  'T4-Q9', 4, 'Respond using information (Q9)',
  $sk$Actually, I'm afraid you have the wrong information. {ITEM} was {cancelled/moved/changed}. Instead, {CORRECT_INFO}.$sk$,
  '{ITEM,CORRECT_INFO}',
  '오류 정정', null, null
),
(
  'T4-Q10', 4, 'Respond using information (Q10)',
  $sk$Sure. There are two {sessions/items} about {TOPIC}. First, at {TIME_1}, {PERSON_1} will {ACTIVITY_1}. After that, at {TIME_2}, {PERSON_2} will {ACTIVITY_2}.$sk$,
  '{TOPIC,TIME_1,PERSON_1,ACTIVITY_1,TIME_2,PERSON_2,ACTIVITY_2}',
  '항목 2개 순서대로 요약', 50, 70
),
(
  'T5-OPINION', 5, 'Express an opinion',
  $sk$I {agree/disagree} that {TOPIC}. / I prefer {OPTION}. I have two reasons. First, {REASON_1}. {WHY_1}. Second, {REASON_2}. For example, in my case, {EXAMPLE_SENTENCE_1}. {EXAMPLE_SENTENCE_2}. As a result, {RESULT}. For these reasons, I {agree/disagree / believe} that {RESTATE}.$sk$,
  '{TOPIC,OPTION,REASON_1,WHY_1,REASON_2,EXAMPLE_SENTENCE_1,EXAMPLE_SENTENCE_2,RESULT,RESTATE}',
  '입장 → 이유1 → 이유2 + 개인 경험 예시 → 결론', 110, 140
);
