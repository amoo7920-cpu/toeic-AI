-- ============================================================
-- seed.sql — Ch1~Ch5 시드 문제 (모두 공개 상태)
-- Ch2/Ch5는 CLAUDE.md 6-3의 예시를 그대로 반영, Ch1/Ch3/Ch4는 각 3세트
-- ============================================================

-- Ch1: 지문 읽기(Read a text aloud) 시드 3세트 — 세트마다 공지/안내문(Q1) + 광고·뉴스브리프(Q2)
insert into question_sets
  (chapter_id, difficulty, topic_key, content_hash, stimulus, status, source, published_at)
values
  (1, 'IH', $$ch1:mall-renovation-notice$$, md5($$ch1:mall-renovation-notice$$),
    $${"text": null, "infoTable": null, "scenario": null}$$::jsonb, 'published', 'manual', now()),
  (1, 'AL', $$ch1:museum-tour-announcement$$, md5($$ch1:museum-tour-announcement$$),
    $${"text": null, "infoTable": null, "scenario": null}$$::jsonb, 'published', 'manual', now()),
  (1, 'AM', $$ch1:company-picnic-announcement$$, md5($$ch1:company-picnic-announcement$$),
    $${"text": null, "infoTable": null, "scenario": null}$$::jsonb, 'published', 'manual', now());

-- Ch2: 사진 묘사(Describe a picture) 시드 1세트 — 6-3의 예시(Q3) + 새로 작성한 Q4, 사진은 문항별로 별도 보관
insert into question_sets
  (chapter_id, difficulty, topic_key, content_hash, stimulus, status, source, published_at)
values
  (2, 'AL', $$ch2:office-meeting$$, md5($$ch2:office-meeting$$),
    $${"text": null, "infoTable": null, "scenario": null}$$::jsonb, 'published', 'manual', now());

-- Ch3: 질문에 답하기(Respond to questions) 시드 3세트 — Q5~Q7이 하나의 공통 주제를 공유
insert into question_sets
  (chapter_id, difficulty, topic_key, content_hash, stimulus, status, source, published_at)
values
  (3, 'IH', $$ch3:grocery-shopping$$, md5($$ch3:grocery-shopping$$),
    $${"text": null, "infoTable": null, "scenario": "Imagine that a market research company is conducting a telephone survey about grocery shopping habits."}$$::jsonb,
    'published', 'manual', now()),
  (3, 'AL', $$ch3:public-transportation$$, md5($$ch3:public-transportation$$),
    $${"text": null, "infoTable": null, "scenario": "Imagine that a research company is conducting a telephone survey about public transportation use in your city."}$$::jsonb,
    'published', 'manual', now()),
  (3, 'AM', $$ch3:weekend-activities$$, md5($$ch3:weekend-activities$$),
    $${"text": null, "infoTable": null, "scenario": "Imagine that a radio station is conducting a survey about how people spend their weekends."}$$::jsonb,
    'published', 'manual', now());

-- Ch4: 자료 보고 답하기(Respond using information provided) 시드 3세트 — 세트마다 공유 일정표(infoTable) 하나
insert into question_sets
  (chapter_id, difficulty, topic_key, content_hash, stimulus, status, source, published_at)
values
  (4, 'IH', $$ch4:staff-training-day$$, md5($$ch4:staff-training-day$$),
    $${"text": null, "scenario": null, "infoTable": {"title": "Staff Training Day", "date": "March 14", "location": "Main Conference Room", "items": [
      {"time": "9:00 AM", "person": "HR Team", "activity": "Orientation on new safety policies"},
      {"time": "10:30 AM", "person": "Ms. Carter", "activity": "Workshop on customer service skills"},
      {"time": "1:00 PM", "person": "Mr. Lee", "activity": "Presentation on the new software system"}
    ]}}$$::jsonb,
    'published', 'manual', now()),
  (4, 'AL', $$ch4:sales-conference$$, md5($$ch4:sales-conference$$),
    $${"text": null, "scenario": null, "infoTable": {"title": "Regional Sales Conference", "date": "April 22", "location": "Grandview Hotel, Ballroom B", "items": [
      {"time": "9:30 AM", "person": "Mr. Kim", "activity": "Keynote speech on this year's sales targets"},
      {"time": "11:00 AM", "person": "Sales Team A", "activity": "Panel discussion on client retention strategies"},
      {"time": "2:00 PM", "person": "Ms. Alvarez", "activity": "Product demonstration for the new inventory system"}
    ]}}$$::jsonb,
    'published', 'manual', now()),
  (4, 'AM', $$ch4:new-employee-orientation$$, md5($$ch4:new-employee-orientation$$),
    $${"text": null, "scenario": null, "infoTable": {"title": "New Employee Orientation", "date": "May 5", "location": "Training Center, Room 204", "items": [
      {"time": "9:00 AM", "person": "Mr. Thompson (HR Director)", "activity": "Welcome speech and company overview"},
      {"time": "10:15 AM", "person": "IT Department", "activity": "Setup of laptops and email accounts"},
      {"time": "1:30 PM", "person": "Ms. Nguyen", "activity": "Benefits enrollment session"}
    ]}}$$::jsonb,
    'published', 'manual', now());

-- Ch5: 의견 말하기(Express an opinion) 시드 1세트 — 6-3의 예시 그대로
insert into question_sets
  (chapter_id, difficulty, topic_key, content_hash, stimulus, status, source, published_at)
values
  (5, 'AL', $$ch5:manager-decision$$, md5($$ch5:manager-decision$$),
    $${"text": null, "infoTable": null, "scenario": null}$$::jsonb, 'published', 'manual', now());

-- ------------------------------------------------------------
-- Ch1 questions (no=1: 공지/안내문, no=2: 광고·뉴스브리프)
-- ------------------------------------------------------------

-- ch1:mall-renovation-notice
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 1,
  $$Attention, shoppers. Starting next Monday, the west parking garage will be closed for renovation work. During this period, please use the north or south parking areas instead. The renovation will include new elevators, better lighting, and additional parking spaces. We expect the project to be completed within six weeks. We apologize for any inconvenience and thank you for your patience.$$,
  45, 45,
  $${"templateId": "T1-READ", "slots": {}, "rendered": "Attention, **shoppers**. // Starting next **Monday**, / the west parking garage will be **closed** for renovation work. // During this period, / please use the **north**↗ or **south**↘ parking areas instead. // The renovation will include new **elevators**↗, better **lighting**↗, and additional parking **spaces**↘. // We expect the project to be completed within **six weeks**↘. // We **apologize** for any inconvenience / and thank you for your **patience**↘.", "wordCount": 60}$$::jsonb,
  array[$$closed for renovation$$, $$we apologize for any inconvenience$$, $$use the north or south parking areas$$],
  null
from question_sets where topic_key = $$ch1:mall-renovation-notice$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 2,
  $$Looking for a great deal on electronics? Visit TechWorld this weekend for our biggest sale of the year. All laptops, tablets, and headphones are up to forty percent off. We also offer free setup and a one-year warranty on every purchase. Hurry in before Sunday, because these amazing prices won't last long.$$,
  45, 45,
  $${"templateId": "T1-READ", "slots": {}, "rendered": "Looking for a great **deal** on electronics? // Visit **TechWorld** this weekend / for our **biggest sale**↘ of the year. // All **laptops**↗, **tablets**↗, and **headphones**↘ are up to **forty percent**↘ off. // We also offer free **setup** / and a **one-year warranty**↘ on every purchase. // **Hurry in** before **Sunday**, / because these amazing prices **won't last long**↘.", "wordCount": 52}$$::jsonb,
  array[$$up to forty percent off$$, $$free setup and a one-year warranty$$, $$won't last long$$],
  null
from question_sets where topic_key = $$ch1:mall-renovation-notice$$;

-- ch1:museum-tour-announcement
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 1,
  $$Welcome to the City History Museum. Our next guided tour will begin in fifteen minutes at the main entrance. The tour will take you through three centuries of local history, including our newly opened photography exhibit. Please turn off your phones and refrain from using flash photography. The tour lasts about forty-five minutes.$$,
  45, 45,
  $${"templateId": "T1-READ", "slots": {}, "rendered": "Welcome to the **City History Museum**. // Our next guided **tour** will begin / in **fifteen minutes**↘ at the main entrance. // The tour will take you through **three centuries**↗ of local **history**↘, / including our newly opened **photography exhibit**↘. // Please **turn off** your phones / and refrain from using **flash photography**↘. // The tour lasts about **forty-five minutes**↘.", "wordCount": 53}$$::jsonb,
  array[$$guided tour$$, $$refrain from using flash photography$$, $$newly opened photography exhibit$$],
  null
from question_sets where topic_key = $$ch1:museum-tour-announcement$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 2,
  $$In local news, heavy snow overnight has caused delays across the city. Route 9 near the downtown bridge remains closed until crews finish clearing the road. Commuters are advised to use public transportation or allow extra travel time this morning. City officials expect conditions to improve by early afternoon. Stay tuned for further updates.$$,
  45, 45,
  $${"templateId": "T1-READ", "slots": {}, "rendered": "In local news, / **heavy snow**↗ overnight has caused **delays**↘ across the city. // **Route nine**, near the downtown **bridge**, / remains **closed**↘ until crews finish clearing the road. // Commuters are advised to use **public transportation**↗ / or allow **extra travel time**↘ this morning. // City officials expect conditions to **improve**↗ / by early **afternoon**↘. // Stay tuned for further **updates**↘.", "wordCount": 54}$$::jsonb,
  array[$$remains closed$$, $$allow extra travel time$$, $$stay tuned for further updates$$],
  null
from question_sets where topic_key = $$ch1:museum-tour-announcement$$;

-- ch1:company-picnic-announcement
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 1,
  $$Attention, all staff. This year's company picnic will take place on Saturday, October the seventeenth, at Riverside Park. Activities will include a barbecue lunch, team games, and a raffle with great prizes. Please sign up at the front desk by this Friday so we can arrange enough food and transportation. Family members are welcome to join.$$,
  45, 45,
  $${"templateId": "T1-READ", "slots": {}, "rendered": "Attention, all **staff**. // This year's company **picnic** will take place / on **Saturday**↗, **October the seventeenth**↘, / at **Riverside Park**↘. // Activities will include a **barbecue lunch**↗, **team games**↗, and a **raffle**↘ with great prizes. // Please **sign up** at the front desk / by **this Friday**↘ / so we can arrange enough food and transportation. // **Family members**↗ are welcome to **join**↘.", "wordCount": 56}$$::jsonb,
  array[$$sign up at the front desk$$, $$raffle with great prizes$$, $$family members are welcome$$],
  null
from question_sets where topic_key = $$ch1:company-picnic-announcement$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 2,
  $$Sweet Corner Bakery is opening its doors in downtown Millbrook this Friday. Come celebrate with us and enjoy a free pastry with any coffee purchase all weekend long. Our menu features fresh bread, cakes, and pastries baked daily using local ingredients. Follow us online for updates on new flavors and weekly specials.$$,
  45, 45,
  $${"templateId": "T1-READ", "slots": {}, "rendered": "**Sweet Corner Bakery**↗ is opening its doors / in downtown **Millbrook**↘ this **Friday**↘. // Come **celebrate** with us / and enjoy a **free pastry**↗ with any coffee purchase / all **weekend long**↘. // Our menu features fresh **bread**↗, **cakes**↗, and **pastries**↘, / baked daily using **local ingredients**↘. // **Follow us online**↗ / for updates on new flavors and **weekly specials**↘.", "wordCount": 52}$$::jsonb,
  array[$$opening its doors$$, $$free pastry with any coffee purchase$$, $$baked daily using local ingredients$$],
  null
from question_sets where topic_key = $$ch1:company-picnic-announcement$$;

-- ------------------------------------------------------------
-- Ch3 questions (no=5, no=6: 15초 단답 / no=7: 30초 장문)
-- ------------------------------------------------------------

-- ch3:grocery-shopping
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 5,
  $$How often do you go grocery shopping?$$,
  3, 15,
  $${"templateId": "T3-SHORT", "slots": {"DIRECT_ANSWER": "I usually go grocery shopping twice a week", "REASON": "I don't like keeping too much food at home", "ONE_EXTRA_DETAIL": "I just buy what I need"}, "rendered": "I usually go grocery shopping twice a week. That's because I don't like keeping too much food at home. I just buy what I need.", "wordCount": 25}$$::jsonb,
  array[$$twice a week$$, $$keeping too much food at home$$],
  null
from question_sets where topic_key = $$ch3:grocery-shopping$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 6,
  $$Do you prefer shopping at large supermarkets or small local stores?$$,
  3, 15,
  $${"templateId": "T3-SHORT", "slots": {"DIRECT_ANSWER": "I prefer large supermarkets", "REASON": "they have a wider selection and better prices", "ONE_EXTRA_DETAIL": "I can find everything I need in one trip"}, "rendered": "I prefer large supermarkets. That's because they have a wider selection and better prices. I can find everything I need in one trip.", "wordCount": 23}$$::jsonb,
  array[$$wider selection and better prices$$, $$everything I need in one trip$$],
  null
from question_sets where topic_key = $$ch3:grocery-shopping$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 7,
  $$Some people prefer to shop for groceries online, while others prefer to visit a store in person. Which do you prefer? Why?$$,
  3, 30,
  $${"templateId": "T3-LONG", "slots": {"OPINION": "shopping for groceries in person is better", "REASON_1": "I can check the freshness and quality of items myself", "REASON_2": "it's easier to make quick decisions when I can see all the options in front of me", "SHORT_EXAMPLE": "I often notice good deals or new products just by walking through the aisles", "RESTATE_OPINION": "I'll keep shopping for groceries in person"}, "rendered": "I think shopping for groceries in person is better. There are two reasons. First, I can check the freshness and quality of items myself. Second, it's easier to make quick decisions when I can see all the options in front of me. For example, I often notice good deals or new products just by walking through the aisles. So, I'll keep shopping for groceries in person.", "wordCount": 66}$$::jsonb,
  array[$$freshness and quality$$, $$walking through the aisles$$, $$make quick decisions$$],
  $$AL 답변이 되려면 예시 문장(walking through the aisles)을 구체적으로 유지할 것$$
from question_sets where topic_key = $$ch3:grocery-shopping$$;

-- ch3:public-transportation
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 5,
  $$How often do you use public transportation?$$,
  3, 15,
  $${"templateId": "T3-SHORT", "slots": {"DIRECT_ANSWER": "I use public transportation almost every day", "REASON": "I commute to work by subway", "ONE_EXTRA_DETAIL": "it's faster than driving during rush hour"}, "rendered": "I use public transportation almost every day. That's because I commute to work by subway. It's faster than driving during rush hour.", "wordCount": 22}$$::jsonb,
  array[$$commute to work$$, $$faster than driving during rush hour$$],
  null
from question_sets where topic_key = $$ch3:public-transportation$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 6,
  $$Do you think public transportation in your city is convenient?$$,
  3, 15,
  $${"templateId": "T3-SHORT", "slots": {"DIRECT_ANSWER": "Yes, I think it's quite convenient", "REASON": "the subway system covers most parts of the city", "ONE_EXTRA_DETAIL": "trains also run frequently, even late at night"}, "rendered": "Yes, I think it's quite convenient. That's because the subway system covers most parts of the city. Trains also run frequently, even late at night.", "wordCount": 25}$$::jsonb,
  array[$$covers most parts of the city$$, $$run frequently$$],
  null
from question_sets where topic_key = $$ch3:public-transportation$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 7,
  $$Some people think cities should invest more money in public transportation, while others think the money should be spent on roads for cars. Which do you think is better? Why?$$,
  3, 30,
  $${"templateId": "T3-LONG", "slots": {"OPINION": "cities should invest more in public transportation", "REASON_1": "it reduces traffic congestion and air pollution", "REASON_2": "it also gives people who can't afford a car an affordable way to get around", "SHORT_EXAMPLE": "in my city, adding more subway lines has made my daily commute much shorter", "RESTATE_OPINION": "spending more on public transportation is a smarter long-term choice"}, "rendered": "I think cities should invest more in public transportation. There are two reasons. First, it reduces traffic congestion and air pollution. Second, it also gives people who can't afford a car an affordable way to get around. For example, in my city, adding more subway lines has made my daily commute much shorter. So, spending more on public transportation is a smarter long-term choice.", "wordCount": 64}$$::jsonb,
  array[$$reduces traffic congestion$$, $$affordable way to get around$$, $$long-term choice$$],
  $$AL 답변이 되려면 REASON_2에서 구체적 대상(사람들)을 언급해 근거를 명확히 할 것$$
from question_sets where topic_key = $$ch3:public-transportation$$;

-- ch3:weekend-activities
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 5,
  $$What do you usually do on weekends?$$,
  3, 15,
  $${"templateId": "T3-SHORT", "slots": {"DIRECT_ANSWER": "I usually relax at home and catch up on reading", "REASON": "I'm busy with work all week", "ONE_EXTRA_DETAIL": "weekends are my only time to rest"}, "rendered": "I usually relax at home and catch up on reading. That's because I'm busy with work all week. Weekends are my only time to rest.", "wordCount": 25}$$::jsonb,
  array[$$catch up on reading$$, $$only time to rest$$],
  null
from question_sets where topic_key = $$ch3:weekend-activities$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 6,
  $$Do you prefer spending weekends at home or going out?$$,
  3, 15,
  $${"templateId": "T3-SHORT", "slots": {"DIRECT_ANSWER": "I prefer going out", "REASON": "I like trying new restaurants and meeting friends", "ONE_EXTRA_DETAIL": "staying home all weekend makes me feel a bit bored"}, "rendered": "I prefer going out. That's because I like trying new restaurants and meeting friends. Staying home all weekend makes me feel a bit bored.", "wordCount": 24}$$::jsonb,
  array[$$trying new restaurants$$, $$feel a bit bored$$],
  null
from question_sets where topic_key = $$ch3:weekend-activities$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 7,
  $$Some people think weekends should be spent relaxing at home, while others think it's better to travel or go out. Which do you think is better? Why?$$,
  3, 30,
  $${"templateId": "T3-LONG", "slots": {"OPINION": "it's better to go out and try new activities", "REASON_1": "staying home every weekend can get boring and doesn't help you recharge", "REASON_2": "going out gives you new experiences and helps you meet new people", "SHORT_EXAMPLE": "last weekend I went hiking with some coworkers and came back to work feeling much more energetic", "RESTATE_OPINION": "going out on weekends is a better way to refresh yourself"}, "rendered": "I think it's better to go out and try new activities. There are two reasons. First, staying home every weekend can get boring and doesn't help you recharge. Second, going out gives you new experiences and helps you meet new people. For example, last weekend I went hiking with some coworkers and came back to work feeling much more energetic. So, going out on weekends is a better way to refresh yourself.", "wordCount": 72}$$::jsonb,
  array[$$doesn't help you recharge$$, $$meet new people$$, $$refresh yourself$$],
  $$AM 수준 예시: 구체적 활동(hiking)과 결과(feeling more energetic)를 모두 포함해 완성도 확보$$
from question_sets where topic_key = $$ch3:weekend-activities$$;

-- ------------------------------------------------------------
-- Ch4 questions (no=8: 기본 사실, no=9: 잘못된 정보 정정, no=10: 두 항목 순서대로 요약)
-- ------------------------------------------------------------

-- ch4:staff-training-day
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 8,
  $$Hi, this is calling about the staff training day. Can you tell me what time it starts and where it will be held?$$,
  45, 15,
  $${"templateId": "T4-Q8", "slots": {"EVENT": "The staff training day", "DATE": "March 14", "TIME": "9:00 AM", "PLACE": "at the Main Conference Room"}, "rendered": "Sure. The staff training day will be held on March 14 at 9:00 AM, at the Main Conference Room.", "wordCount": 19}$$::jsonb,
  array[$$will be held on$$, $$Main Conference Room$$],
  null
from question_sets where topic_key = $$ch4:staff-training-day$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 9,
  $$Hi, this is Daniel calling about the training day. I heard Ms. Carter's workshop starts at 9:00 AM. Is that correct?$$,
  3, 15,
  $${"templateId": "T4-Q9", "slots": {"ITEM": "Ms. Carter's workshop time", "CHANGE": "changed", "CORRECT_INFO": "it now starts at 10:30 AM"}, "rendered": "Actually, I'm afraid you have the wrong information. Ms. Carter's workshop time was changed. Instead, it now starts at 10:30 AM.", "wordCount": 21}$$::jsonb,
  array[$$you have the wrong information$$, $$instead, it now starts at$$],
  null
from question_sets where topic_key = $$ch4:staff-training-day$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 10,
  $$Can you tell me about the two morning sessions on the training day, in the order they'll take place?$$,
  3, 30,
  $${"templateId": "T4-Q10", "slots": {"TOPIC": "employee training", "TIME_1": "9:00 AM", "PERSON_1": "the HR team", "ACTIVITY_1": "lead an orientation session covering the company's new safety policies and answer any questions employees have", "TIME_2": "10:30 AM", "PERSON_2": "Ms. Carter", "ACTIVITY_2": "run a workshop focused on building stronger customer service skills, including hands-on role-playing exercises"}, "rendered": "Sure. There are two sessions about employee training. First, at 9:00 AM, the HR team will lead an orientation session covering the company's new safety policies and answer any questions employees have. After that, at 10:30 AM, Ms. Carter will run a workshop focused on building stronger customer service skills, including hands-on role-playing exercises.", "wordCount": 54}$$::jsonb,
  array[$$orientation session$$, $$customer service skills$$, $$role-playing exercises$$],
  $$AM 수준: 두 세션 사이 연결어(After that)와 구체적 활동 묘사를 유지할 것$$
from question_sets where topic_key = $$ch4:staff-training-day$$;

-- ch4:sales-conference
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 8,
  $$Hi, this is calling about the sales conference. Can you tell me when it starts and where it will be held?$$,
  45, 15,
  $${"templateId": "T4-Q8", "slots": {"EVENT": "The regional sales conference", "DATE": "April 22", "TIME": "9:30 AM", "PLACE": "at the Grandview Hotel"}, "rendered": "Sure. The regional sales conference will start on April 22 at 9:30 AM, at the Grandview Hotel.", "wordCount": 17}$$::jsonb,
  array[$$will start on$$, $$Grandview Hotel$$],
  null
from question_sets where topic_key = $$ch4:sales-conference$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 9,
  $$Hi, I heard Ms. Alvarez's product demonstration is scheduled for 11:00 AM. Is that correct?$$,
  3, 15,
  $${"templateId": "T4-Q9", "slots": {"ITEM": "Ms. Alvarez's demonstration", "CHANGE": "moved", "CORRECT_INFO": "it's now scheduled for 2:00 PM"}, "rendered": "Actually, I'm afraid you have the wrong information. Ms. Alvarez's demonstration was moved. Instead, it's now scheduled for 2:00 PM.", "wordCount": 20}$$::jsonb,
  array[$$you have the wrong information$$, $$now scheduled for$$],
  null
from question_sets where topic_key = $$ch4:sales-conference$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 10,
  $$Could you go over the first two sessions of the sales conference in order?$$,
  3, 30,
  $${"templateId": "T4-Q10", "slots": {"TOPIC": "sales strategy", "TIME_1": "9:30 AM", "PERSON_1": "Mr. Kim", "ACTIVITY_1": "deliver a keynote speech reviewing this year's sales targets and outlining the company's strategy for the next quarter", "TIME_2": "11:00 AM", "PERSON_2": "Sales Team A", "ACTIVITY_2": "host a panel discussion on client retention strategies, sharing tips from their most successful accounts"}, "rendered": "Sure. There are two sessions about sales strategy. First, at 9:30 AM, Mr. Kim will deliver a keynote speech reviewing this year's sales targets and outlining the company's strategy for the next quarter. After that, at 11:00 AM, Sales Team A will host a panel discussion on client retention strategies, sharing tips from their most successful accounts.", "wordCount": 57}$$::jsonb,
  array[$$keynote speech$$, $$client retention strategies$$, $$panel discussion$$],
  $$AL 수준: 두 세션의 시간과 발표자를 정확히 순서대로 전달하는 것이 핵심$$
from question_sets where topic_key = $$ch4:sales-conference$$;

-- ch4:new-employee-orientation
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 8,
  $$Hi, I'm calling about new employee orientation. What time does it begin, and where should I go?$$,
  45, 15,
  $${"templateId": "T4-Q8", "slots": {"EVENT": "New employee orientation", "DATE": "May 5", "TIME": "9:00 AM", "PLACE": "at the Training Center"}, "rendered": "Sure. New employee orientation will start on May 5 at 9:00 AM, at the Training Center.", "wordCount": 16}$$::jsonb,
  array[$$will start on$$, $$Training Center$$],
  null
from question_sets where topic_key = $$ch4:new-employee-orientation$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 9,
  $$I heard Ms. Nguyen's benefits enrollment session is at 10:15 AM. Is that correct?$$,
  3, 15,
  $${"templateId": "T4-Q9", "slots": {"ITEM": "Ms. Nguyen's session", "CHANGE": "changed", "CORRECT_INFO": "it's now scheduled for 1:30 PM"}, "rendered": "Actually, I'm afraid you have the wrong information. Ms. Nguyen's session was changed. Instead, it's now scheduled for 1:30 PM.", "wordCount": 20}$$::jsonb,
  array[$$you have the wrong information$$, $$now scheduled for$$],
  null
from question_sets where topic_key = $$ch4:new-employee-orientation$$;

insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 10,
  $$Could you walk me through the first two parts of the orientation schedule, in order?$$,
  3, 30,
  $${"templateId": "T4-Q10", "slots": {"TOPIC": "getting started", "TIME_1": "9:00 AM", "PERSON_1": "Mr. Thompson, the HR director", "ACTIVITY_1": "give a welcome speech and walk new hires through a brief overview of the company's history and values", "TIME_2": "10:15 AM", "PERSON_2": "the IT department", "ACTIVITY_2": "help each new employee set up their laptop and email account before the afternoon sessions begin"}, "rendered": "Sure. There are two sessions about getting started. First, at 9:00 AM, Mr. Thompson, the HR director, will give a welcome speech and walk new hires through a brief overview of the company's history and values. After that, at 10:15 AM, the IT department will help each new employee set up their laptop and email account before the afternoon sessions begin.", "wordCount": 61}$$::jsonb,
  array[$$welcome speech$$, $$company's history and values$$, $$set up their laptop and email account$$],
  $$AM 수준: HR 디렉터의 직함(the HR director)까지 자연스럽게 포함해 정보 정확성을 높일 것$$
from question_sets where topic_key = $$ch4:new-employee-orientation$$;

-- ------------------------------------------------------------
-- Ch2 questions (no=3, no=4: 사진마다 별도 image_url/image_credit)
-- ------------------------------------------------------------

-- ch2:office-meeting — Q3: CLAUDE.md 6-3 예시 그대로
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes, image_url, image_credit)
select id, 3,
  $$Describe the picture in as much detail as you can.$$,
  45, 30,
  $${"templateId": "T2-PICTURE", "slots": {"PLACE": "an office meeting room", "MAIN_PERSON": "a woman in a white blouse", "ACTION_1": "pointing at a chart on the screen", "PERSON_2": "a man with glasses", "ACTION_2": "taking notes on his laptop", "DETAIL": "two people looking at some documents", "BACKGROUND": "a large window with a city view", "CONTEXT": "during a business meeting"}, "rendered": "This picture was taken in an office meeting room. The first thing I notice is a woman in a white blouse, who is pointing at a chart on the screen. Next to her, a man with glasses is taking notes on his laptop. On the right side of the picture, I can see two people looking at some documents. In the background, there is a large window with a city view. Overall, it looks like a productive moment during a business meeting.", "wordCount": 82}$$::jsonb,
  array[$$pointing at a chart$$, $$taking notes on his laptop$$, $$a productive moment$$],
  null,
  $$https://picsum.photos/seed/toeic-office-meeting/800/600$$,
  $$Placeholder image (Lorem Picsum) — 관리자 콘솔에서 Pexels 사진으로 교체 가능$$
from question_sets where topic_key = $$ch2:office-meeting$$;

-- ch2:office-meeting — Q4: 같은 세트의 두 번째 사진(신규 작성)
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes, image_url, image_credit)
select id, 4,
  $$Describe the picture in as much detail as you can.$$,
  45, 30,
  $${"templateId": "T2-PICTURE", "slots": {"PLACE": "a training room", "MAIN_PERSON": "a man in a blue shirt", "ACTION_1": "pointing at a whiteboard with several charts", "PERSON_2": "another colleague", "ACTION_2": "taking notes at a round table", "DETAIL": "an open laptop on the table", "BACKGROUND": "a coffee cart near the door", "CONTEXT": "during a training session"}, "rendered": "This picture was taken in a training room. The first thing I notice is a man in a blue shirt, who is pointing at a whiteboard with several charts. Next to him, another colleague is taking notes at a round table. On the left side of the picture, I can see an open laptop on the table. In the background, there is a coffee cart near the door. Overall, it looks like a productive training session.", "wordCount": 76}$$::jsonb,
  array[$$pointing at a whiteboard$$, $$taking notes$$, $$a training session$$],
  null,
  $$https://picsum.photos/seed/toeic-training-room/800/600$$,
  $$Placeholder image (Lorem Picsum) — 관리자 콘솔에서 Pexels 사진으로 교체 가능$$
from question_sets where topic_key = $$ch2:office-meeting$$;

-- ------------------------------------------------------------
-- Ch5 question (no=11) — CLAUDE.md 6-3 예시 그대로
-- ------------------------------------------------------------
insert into questions (set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes)
select id, 11,
  $$Do you agree or disagree with the following statement? Managers should make important decisions on their own rather than with their team. Use specific reasons and examples to support your opinion.$$,
  45, 60,
  $${"templateId": "T5-OPINION", "slots": {"TOPIC": "managers should make important decisions alone", "REASON_1": "team members often have more detailed information", "WHY_1": "They deal with the actual work every day, so they can spot problems early.", "REASON_2": "people follow a decision better when they are part of it", "EXAMPLE_SENTENCE_1": "in my case, I am leading a large system project at my company", "EXAMPLE_SENTENCE_2": "When we chose a new process, I gathered opinions from the finance, sales, and supply chain teams.", "RESULT": "the teams accepted the change quickly and the project stayed on schedule", "RESTATE": "managers should involve their teams in important decisions"}, "rendered": "I disagree that managers should make important decisions alone. I have two reasons. First, team members often have more detailed information. They deal with the actual work every day, so they can spot problems early. Second, people follow a decision better when they are part of it. For example, in my case, I am leading a large system project at my company. When we chose a new process, I gathered opinions from the finance, sales, and supply chain teams. As a result, the teams accepted the change quickly and the project stayed on schedule. For these reasons, I believe that managers should involve their teams in important decisions.", "wordCount": 108}$$::jsonb,
  array[$$spot problems early$$, $$gathered opinions from$$, $$stayed on schedule$$],
  $$AL 답변 예시 — ERP 프로젝트 리드 경험을 구체적 예시로 활용$$
from question_sets where topic_key = $$ch5:manager-decision$$;
