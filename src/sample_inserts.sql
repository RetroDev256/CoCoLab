-- Contains fake data that can be used to test the database. This file is not meant to be run in production.
-- Run this file after running the tables.sql file to populate the database with sample data.

-- USERS inserts
INSERT INTO public.users (user_name, pw_hash, email) VALUES
('dev_alice', '', 'alice@example.com'),
('coder_bob', '', 'bob@test.com'),
('charlie_pro', '', 'charlie@dev.org'),
('dana_d', '', 'dana@cocolab.io'),
('evan_sharp', '', 'evan@domain.com'),
('fiona_f', '', 'fiona@web.com'),
('george_v', '', 'george@it.com'),
('hannah_b', '', 'hannah@code.com'),
('ian_tech', '', 'ian@startup.com'),
('julia_m', '', 'julia@ai.com');

-- PROJECT inserts
INSERT INTO public.project (project_name, completed, details, owner_id, color) VALUES
('Retro Game Engine', false, 'A 2D engine for pixel art games.', 1, '#f396fc'),
('AI Chatbot', false, 'Natural language processor for support.', 2, '#f396fc'),
('Crypto Wallet', false, 'Secure mobile wallet for assets.', 3, '#f396fc'),
('Social Map', false, 'Geo-location social media app.', 4, '#f396fc'),
('Fitness Tracker', false, 'Track workouts and calories.', 5, '#f396fc'),
('Recipe Finder', false, 'Search meals by ingredients.', 6, '#f396fc'),
('Code Linter', false, 'Automated tool for clean code.', 7, '#f396fc'),
('Portfolio Builder', false, 'Drag and drop site builder.', 8, '#f396fc'),
('Eco Monitor', false, 'IoT app for tracking home energy.', 9, '#f396fc'),
('Music Streamer', false, 'Peer-to-peer audio platform.', 10, '#f396fc');

-- CATEGORY_TAGS inserts
INSERT INTO public.category_tags (name) VALUES
('Rust'), ('Python'), ('React'), ('C++'), ('Machine Learning'),
('Blockchain'), ('Mobile'), ('Open Source'), ('Database'), ('UI/UX');

-- PROJECTS_TAGS inserts (associating projects with category tags)
INSERT INTO public.projects_tags (project_id, tag_id) VALUES
(1, 4), (1, 8), (2, 2), (2, 5), (3, 6), (4, 7), (5, 7), (6, 3), (9, 9), (10, 10);

-- PROJECT_MEMBERS inserts (associating users with projects)
INSERT INTO public.project_members (role, user_id, project_id) VALUES
('Lead Developer', 1, 1),
('Contributor', 2, 1),
('UI Designer', 3, 2),
('Backend Dev', 4, 2),
('Security Lead', 5, 3),
('Beta Tester', 6, 4),
('QA Engineer', 7, 5),
('Product Manager', 8, 6),
('DevOps', 9, 9),
('Researcher', 10, 10);

-- PROJECT_REQUESTS inserts (associating users with project requests)
INSERT INTO public.project_requests (role, user_id, project_id) VALUES
('Frontend', 10, 1),
('Documentation', 9, 2),
('Analyst', 8, 3),
('Illustrator', 7, 4),
('DevOps', 6, 5),
('Tester', 5, 6),
('Fullstack', NULL, 7),
('Intern', 3, 8),
('Scrum Master', 2, 9),
('Support', NULL, 10);