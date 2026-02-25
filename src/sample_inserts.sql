-- Contains fake data that can be used to test the database. This file is not meant to be run in production.
-- Run this file after running the tables.sql file to populate the database with sample data.

-- USERS inserts
INSERT INTO public.users (user_name, pw_salt, pw_hash, email, profile_url, phone_number) VALUES
('dev_alice', '\x1a', '\x2b', 'alice@example.com', 'https://github.com/alice', '555-0101'),
('coder_bob', '\x3c', '\x4d', 'bob@test.com', 'https://github.com/bob', '555-0102'),
('charlie_pro', '\x5e', '\x6f', 'charlie@dev.org', NULL, '555-0103'),
('dana_d', '\x7g', '\x8h', 'dana@cocolab.io', 'https://dana.me', NULL),
('evan_sharp', '\x9i', '\x0j', 'evan@domain.com', NULL, '555-0105'),
('fiona_f', '\x1k', '\x2l', 'fiona@web.com', 'https://fiona.dev', '555-0106'),
('george_v', '\x3m', '\x4n', 'george@it.com', NULL, NULL),
('hannah_b', '\x5o', '\x6p', 'hannah@code.com', 'https://hannah.io', '555-0108'),
('ian_tech', '\x7q', '\x8r', 'ian@startup.com', NULL, '555-0109'),
('julia_m', '\x9s', '\x0t', 'julia@ai.com', 'https://github.com/julia', '555-0110');

-- PROJECT inserts
INSERT INTO public.project (project_name, max_people, details, owner_id) VALUES
('Retro Game Engine', 4, 'A 2D engine for pixel art games.', 1),
('AI Chatbot', 3, 'Natural language processor for support.', 2),
('Crypto Wallet', 2, 'Secure mobile wallet for assets.', 3),
('Social Map', 10, 'Geo-location social media app.', 4),
('Fitness Tracker', 5, 'Track workouts and calories.', 5),
('Recipe Finder', 4, 'Search meals by ingredients.', 6),
('Code Linter', 3, 'Automated tool for clean code.', 7),
('Portfolio Builder', 2, 'Drag and drop site builder.', 8),
('Eco Monitor', 6, 'IoT app for tracking home energy.', 9),
('Music Streamer', 8, 'Peer-to-peer audio platform.', 10);

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
('Fullstack', 4, 7),
('Intern', 3, 8),
('Scrum Master', 2, 9),
('Support', 1, 10);