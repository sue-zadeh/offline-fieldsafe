
-- Populate the login table
INSERT INTO login (firstname, lastname, username, password, role) VALUES
('Sue', 'zadeh', 'raisianz@gmil.com', '$2b$10$QDmiuOEG.MHyjP4h0KR2Uewon1a6UL68uAh0zKiy6Vvn2gH98weGG', 'admin')
('Dave', 'Sharp', 'dsharp@cvnz.org.nz', '$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO', 'Admin'),
('Sue', 'Zadeh', 'suezadeh.a@gmail.com', '$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe', 'Admin'),
('john', 'Doe', 'admin1@example.com', '$2b$10$rwIEU2qP2HIWYqcEkOLBQeUvjT0fKKRHu7RSOBbQwvqrzc1nGemFu', 'Admin'),
('Helen', 'voly', 'admin2@example.com', '$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2', 'Admin'),
('Bill', 'Hey', 'admin3@example.com', '$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG', 'Admin');

-- Populate the staffs table
INSERT INTO staffs (firstname, lastname, email, phone, password, role) VALUES
('Dave', 'Sharp', 'dsharp.unique@example.com', '0987654321', '$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO', ' '),
('Sue', 'Zadeh', 'suezadeh.a@gmail.com', '5678901234', '$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe', 'Group Admin'),
('Helen', 'voly', 'admin2@example.com', '7890123456', '$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2', 'Team Leader'),
('Bill', 'Hey', 'admin3@example.com', '4567890123', '$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG', 'Field Staff');

('John', 'Dell', 'john.doe@example.com', '1234567890', 'Team Leader'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', 'Field Staff'),
('Alice', 'Brown', 'alice.brown@example.com', '5678901234', 'Team Leader'),
('Mark', 'Taylor', 'mark.taylor@example.com', '4567890123', 'Field Staff'),
('Emily', 'Davis', 'emily.davis@example.com', '7890123456', 'Field Staff');


-- Assign staff to projects in project_staff table
INSERT INTO project_staff (project_id, staff_id) VALUES
(1, 1), -- Alice (Group Admin) works on Conservation Project A
(1, 2), -- Bob (Field Staff) works on Conservation Project A
(2, 3); -- Charlie (Team Leader) works on Training Project B

-- Populate the volunteers table
INSERT INTO volunteers (firstname, lastname, email, phone, emergencyContact, emergencyContactNumber, role)
VALUES
('John', 'Doe', 'johndoe@example.com', '123-456-7890', 'Jane Doe', '987-654-3210', 'Volunteer'),
('Alice', 'Smith', 'alicesmith@example.com', '555-123-4567', 'Bob Smith', '555-765-4321', 'Volunteer'),
('Mark', 'Johnson', 'markjohnson@example.com', '222-333-4444', 'Laura Johnson', '222-999-8888', 'Volunteer'),
('Emily', 'Davis', 'emilydavis@example.com', '111-222-3333', 'Sarah Davis', '111-444-5555', 'Volunteer'),
('Michael', 'Brown', 'michaelbrown@example.com', '444-555-6666', 'Paul Brown', '444-777-8888', 'Volunteer');

-- Populate the projects table
INSERT INTO projects (
  id, name, location, startDate, status,
  createdBy,
  emergencyServices,
  localMedicalCenterAddress, localMedicalCenterPhone,
  localHospital,
  primaryContactName, primaryContactPhone,
  imageUrl, inductionFileUrl
)
VALUES (
  1,'River Restoration',
  '123 River St, Auckland, NZ',
  '2024-07-01',
  'inprogress',
  1,  -- referencing the user with id=1 in login
  '111 will contact all emergency services',
  'Rose Medical Center, 456 Medical Rd', '09-1234567',
  'Auckland City Hospital, 789 Hospital Way',
  'John Manager', '027-999-1234',
  'uploads/river.jpg',
  'uploads/induction_river.docx'
);
-- Populate the objectives table

INSERT INTO objectives (title, measurement, dateStart, dateEnd)
VALUES
('Community Participation', '# of participants', NULL, NULL),
('Weed Treatment', '#m2', NULL, NULL),
('Debris Removal(Weight)', '# tonnes', NULL, NULL),
('Fencing(m)', '# metres', NULL, NULL),
('Plant Propagation(Number)', '# of plants', NULL, NULL),
('Revegetation(Number)', '# of plants', '2024-05-01', '2025-05-01'),
('Seed Collection kg', '# kg', NULL, NULL),
('Debris Removal(Area)', '#(Area)', NULL, NULL),
('Revegetation(Area)', '#(Area)', NULL, NULL),
('Site Preparation(Treatment)', '#(Treatment)', NULL, NULL),
('Establishing Predator Control', '# trap numbers', NULL, NULL),
('Walking track building', 'metres', NULL, NULL),
('Walking track maintenance', 'metres', NULL, NULL),
('Species monitoring', 'number of species', NULL, NULL);


-- Populate the project_objectives table
INSERT INTO project_objectives (project_id, objective_id)
VALUES
 (1, 1),
 (1, 2);

 /* Insert the three defaults for peradator table */
INSERT INTO predator (sub_type)
VALUES ('Traps established'),
       ('Traps checked'),
       ('Catches');

 -- Populate the site_hazards table
INSERT INTO site_hazards (hazard_description) VALUES 
('Slippery Surface'), 
('Bad Weather'), 
('Uneven Terrain');

INSERT INTO activity_people_hazards (hazard_description) VALUES 
('Fatigue'), 
('Lack of Training'), 
('Heavy Lifting');


-- Populate the project_hazards table
INSERT INTO project_hazards (project_id, hazard_id) VALUES
(1, 1), -- Bad Weather for Project 1
(1, 2), -- Muddy Track for Project 1
(2, 3), -- Steep Hill for Project 2
(3, 4); -- Low Visibility for Project 3


----------====RISK TABLES=======-----
/*--Populated the risk_titles table */
 INSERT INTO risk_titles (id, title, isReadOnly, created_at) VALUES
(1, 'Asbestos-containing Materials', 1, '2025-01-13 22:10:50'),
(2, 'Bites & Stings', 1, '2025-01-13 22:10:50'),
(3, 'Boardwalk Construction - impact injuries, strains, manual handling, remote locations', 1, '2025-01-13 22:10:50'),
(4, 'Bushfire', 1, '2025-01-13 22:10:50'),
(5, 'Bushwalking', 1, '2025-01-13 22:10:50'),
(6, 'COVID-19', 1, '2025-01-13 22:10:50'),
(7, 'Chemical use - poisoning (inhalation, ingestion, absorption)', 1, '2025-01-13 22:10:50'),
(8, 'Collecting sharps', 1, '2025-01-13 22:10:50'),
(9, 'Fencing - injuries from wire (failure under strain or coiling), impact injury from picket rammer', 1, '2025-01-13 22:10:50'),
(10, 'Litter collection - laceration/spike injuries, bites/stings, infections', 1, '2025-01-13 22:10:50'),
(11, 'Manual Handling', 1, '2025-01-13 22:10:50'),
(12, 'Mulching - inhalation/eye injury, allergies from dust, soft tissue injuries', 1, '2025-01-13 22:10:50'),
(13, 'Plant Propagation - Strains, soil borne diseases, manual handling', 1, '2025-01-13 22:10:50'),
(14, 'Predator control /checking traps', 1, '2025-01-13 22:10:50'),
(15, 'Seed collection - cuts/scratches, eye injuries, allergic reactions, falls from height', 1, '2025-01-13 22:10:50'),
(16, 'Slips, Trips & Falls', 1, '2025-01-13 22:10:50'),
(17, 'Soil Borne Diseases & Inflections', 1, '2025-01-13 22:10:50'),
(18, 'Surveying & Data Collection', 1, '2025-01-13 22:10:50'),
(19, 'Track Construction and Maintenance - impact injuries, strains, manual handling, remote locations', 1, '2025-01-13 22:10:50'),
(20, 'Tree Planting - impact injuries, muscle strain', 1, '2025-01-13 22:10:50'),
(21, 'Using Machete or cane knife', 1, '2025-01-13 22:10:50'),
(22, 'Using Power Tools - electrocution, impact injuries, strains, manual handling, flying particles', 1, '2025-01-13 22:10:50'),
(23, 'Using Swinging Tools - Impact injuries, blisters, eye injuries', 1, '2025-01-13 22:10:50'),
(24, 'Using Temporary Accommodation', 1, '2025-01-13 22:10:50'),
(25, 'Using picket rammers', 1, '2025-01-13 22:10:50'),
(26, 'Vehicle Travel', 1, '2025-01-13 22:10:50'),
(27, 'Weeding - Scratches, strains, chemical exposure, impact injuries', 1, '2025-01-13 22:10:50'),
(28, 'Working at heights - impact injury from falls or falling objects', 1, '2025-01-13 22:10:50'),
(29, 'Working in Cold Conditions (Hypothermia)', 1, '2025-01-13 22:10:50'),
(30, 'Working in Windy Conditions', 1, '2025-01-13 22:10:50'),
(31, 'Working in the dark', 1, '2025-01-13 22:10:50'),
(32, 'Working in tick habitat - allergic reaction, tick borne diseases', 1, '2025-01-13 22:10:50'),
(33, 'Working near heavy machinery', 1, '2025-01-13 22:10:50'),
(34, 'Working near road sides - impact injuries from vehicles', 1, '2025-01-13 22:10:50'),
(35, 'Working near water - drowning', 1, '2025-01-13 22:10:50'),
(36, 'Working with schools', 1, '2025-01-13 22:10:50'),
(37, 'Working with/ near Power Auger', 1, '2025-01-13 22:10:50'),
(38, 'Working with/ near animals', 1, '2025-01-13 22:10:50'),
(39, 'Working with/ near brush cutters', 1, '2025-01-13 22:10:50'),
(40, 'Working with/ near chainsaws', 1, '2025-01-13 22:10:50'),
(41, 'Working in Snake Habitat', 1, '2025-01-13 22:10:50');

/*--Populate the risks table*/
INSERT INTO risks (id, risk_title_id, likelihood, consequences, created_at) VALUES
(1, 1, 'unlikely', 'moderate', NOW()),
(2, 2, 'likely', 'major', NOW()),
(3, 3, 'almost certain', 'minor', NOW());

-- Populate the project_risk_titles
INSERT INTO project_risk_titles (project_id, risk_title_id)
VALUES
(1, 1), -- Example: Project 1, Risk Title 1
(1, 2), -- Project 1, Risk Title 2
(2, 3); -- Project 2, Risk Title 3


/*-- Populate the risk_controls table
-- ==================================================
-- RISK ID 1:  Asbestos-containing Materials
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isreadonly)VALUES
(1, 'Explain and demonstrate how to use, carry and store tools correctly.', 1),
(1, 'Do not wear jewellery that may become entangled.', 1),
(1, 'Maintain strict supervision.', 1),
(1, 'Use and maintain tools in accordance with manufacturer specifications.', 1),
(1, 'Specify and maintain a safe buffer zone around users.', 1),
(1, 'Ensure all equipment are in a safe working condition.', 1),
(1, 'Check for broken or cracked components or switches.', 1),
(1, 'Emergency shutdown procedures in place.', 1),
(1, 'Check that protective guards on tools are attached and effective.', 1),
(1, 'Clear trip hazards from the work site.', 1),
(1, 'Check team members have hair tied back and clothing tucked in, including drawstrings on jackets, hats, etc.', 1),
(1, 'Wear appropriate PPE as recommended by the manufacturer e.g. eye and ear protection, safety boots.', 1),
(1, 'Work with project partner/landholder to identify and isolate any areas that contain material suspected as being asbestos (before the project starts).', 1),
(1, 'Do not work in areas contaminated by asbestos.', 1),
(1, 'Volunteers to immediately notify supervisor if they find material that may contain asbestos.', 1),
(1, 'Do not remove or handle any material that may contain asbestos.', 1),
(1, 'Do not disturb soil or any other material that may contain asbestos.', 1),
(1, 'If you suspect asbestos, use flagging tape to cordon off the area, record the location (site name, description, !at/longs) and work in a different area.', 1),
(1, 'Team Leader to notify Regional Manager immediately upon finding suspected asbestos containing material.', 1);

/*-- ==================================================
-- RISK ID 2:   Bites & Stings  
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(2, 'ID and redeploy people with known allergies.', 1),
(2, 'Visually inspect site for insect/ spider activity.', 1),
(2, 'Mark and avoid insect nests.', 1),
(2, 'Wear PPE; Long sleeves & pants, gloves, enclosed shoes and hat.', 1),
(2, 'Provide and use insect repellent.', 1);

/*-- ==================================================
-- RISK ID 3:  Boardwalk Construction - impact injuries, strains, manual handling,
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(3, 'Arrange for materials to be delivered as near as possible to the work site to reduce the need for carrying.', 1),
(3, 'Keep the work site tidy and minimise trip hazards such as power cords, tools, timber.', 1),
(3, 'Erect signs that warn the public and restrict access to the work site.', 1),
(3, 'Do not allow team members to walk along bearers and joists.', 1),
(3, 'Specify & maintain a safe working space between team members.', 1),
(3, 'Maintain clear access to the construction site, and in any areas where tools or timber will be carried..', 1),
(3, 'Wear appropriate PPE, e.g. hard hats if working at different levels.', 1);

/*-- ==================================================
-- RISK ID 4:  Bushfire
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(4, 'Ensure that all team members know the boundaries of the survey area and remain within them at all times.', 1),
(4, 'Set times at which teams must return or report to the supervisor.', 1),
(4, 'Anyone lost should find nearest shelter & use distress signal (3 whistle blasts).', 1),
(4, 'Instruct that any team member who becomes lost should find the nearest shelter and remain there while using an agreed distress signal eg. three whistle blasts.', 1),
(4, 'Ensure that all team members have means of communicating an emergency signal (eg: whistle, radios) and fully understand the signals to be used.', 1),
(4, 'If the survey involves collecting seats, ensure that this is done hygienically eg. by using gloves, tongs etc.', 1),
(4, 'Work in pairs as a minimum group size.', 1),
(4,'Wear boots that are suitable for walking, and sufficiently sturdy for the terrain.', 1);
/*-- ==================================================
-- RISK ID 5:   Bushwalking
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(5, 'Check that all participants have the physical capacity to safely complete the planned walk.',1),
(5, 'If unfamiliar with the route, seek local advice and carry a reliable map.',1),
(5, 'Do not proceed, or modify the plan, if extreme weather is likely. (Do not proceed on days of total fire ban.)',1),
(5, 'Advise a reliable person of the proposed route and return time. Advise this person when the group has returned.',1),
(5, 'Remind participants to carry necessary medications eg. Ventolin.',1),
(5, 'Check that all participants have sufficient water.',1),
(5, 'Check that participants have suitable footwear and clothing for the likely weather and terrain.',1),
(5, 'Regulate walk pace. Generally the leader will walk at the front.',1),
(5, 'Appoint a reliable person as "whip" or "tailend Charlie" who remains at the rear of the group and alerts the leader to any problems.',1),
(5, 'Provide each person with a whistle and ensure that each person knows that three long blasts is the standard emergency/distress signal.',1),
(5, 'Carry a first aid kit.', 1);

/*-- ==================================================
-- RISK ID 6:  COVID-19
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(6, 'COVID 19 Management SOP in place.', 1),
(6, 'In-depth screen process for all new employees, volunteers and participants.', 1),
(6, 'COVID-19 specific induction process.', 1),
(6, 'Cleaning and disinfection regimen at all CV managed projects and activities.', 1),
(6, 'Good personal hygiene practices reinforced.', 1),
(6, 'Appropriate hygiene supplies available for each worksite.', 1),
(6, 'All workers to have their own personally labelled items.', 1),
(6, 'All worksites and CV vehicles to have a cleaning register.', 1);

/*-- ==================================================
-- RISK ID 7:  working with the Chemical use / poisoning 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(7, 'Read, retain and comply with the relevant Material Safety Data Sheet (MSDS).', 1),
(7, 'Check that there are no leaks in containers, and that spray equipment is operating correctly.', 1),
(7, 'Rotate tasks to avoid prolonged periods of exposure; specify frequency of rotations.', 1),
(7, 'Explain and demonstrate how to use, carry and store correctly.', 1),
(7, 'Specify and maintain safe working distance to avoid splash or spray drift contamination and take account of wind (spray drift) direction.', 1),
(7, 'Provide adequate washing facilities as directed by the MSDS.', 1),
(7, 'Wear appropriate PPE as advised on the MSDS. (Note that the use of certain PPE may accelerate the onset of heat stress.)', 1);
/*-- ==================================================
-- RISK ID 8:     Collecting sharps
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(8, 'Use tongs to pick up sharps', 1),
(8, 'Determine a search strategy i.e. gain local knowledge of area, conduct a visual inspection of the site and flag any sharps for collection, minimise the number of persons involved in a search.', 1),
(8, 'Rake through known areas of disposal.', 1),
(8, 'Maintain a safe working distance of at least two metres to avoid the inadvertent scratching or spiking of other team members.', 1),
(8, 'Provide soap and water on site.', 1),
(8, 'Withdraw team if necessary to allow for professional removal of sharps.', 1),
(8, 'Put all sharps in approved sharps containers for disposal. Disposal to be in accordance with local health authority/council regulations.', 1),
(8, 'Wear gloves, sturdy footwear and high visibility vest. Eye protection may also be necessary.', 1);
/*-- ==================================================
-- RISK ID 9:  Fencing - injuries from wire 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(9, 'Arrange delivery of materials as near to fencing site as possible ie. minimise the need for carrying.', 1),
(9, 'Use only approved methods of straining wire with a proper fencing strainer. Do not use a vehicle to strain wire.', 1),
(9, 'Keep team members, who are not directly involved, well clear of any unsecured wire under tension.', 1),
(9, 'Demonstrate correct use of picket rammers, with emphasis on head, eye, hearing and hand safety.', 1),
(9, 'Do not raise the barrel of the rammer clear of the picket head.', 1),
(9, 'Specify and maintain safe working space between team members, especially when digging post holes or ramming the base of posts.', 1),
(9, 'Keep the work site clear of trip hazards such as posts, wire off-cuts, stones, tools etc.', 1),
(9, 'Wear gloves and eye protection whenever working with, or in close proximity to, wire that is coiled or under tension. Gloves should have gauntlets that protect the wrists when handling barbed wire.', 1),
(9, 'Wear gloves when handling chemically treated posts.', 1);

/*-- ==================================================
-- RISK ID 10:  Litter collection - laceration/spike injuries, bites/
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(10, 'Ensure adequate washing facilities are available and are used by team members.', 1),
(10, 'Look carefully at litter items or piles that might be a refuge for snakes or spiders.', 1),
(10, 'Check objects for spikes or sharp edges.', 1),
(10, 'Use tongs to pick up any objects that are known, or suspected, to be dangerous eg. syringes.', 1),
(10, 'Place any syringes in a proper sharps container.', 1),
(10, 'Seek assistance when lifting heavy objects.', 1),
(10, 'Wear gloves and eye protection when handling litter.', 1),
(10, 'Place any glass or other small sharp objects on a bucket or other hard sided container.', 1);

/*-- ==================================================
-- RISK ID 11:  Manual Handling
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(11,'Gentle warm up stretches prior to starting task/activity.', 1), 
(11, 'Use mechanical aids.', 1), 
(11, 'Set weight limits based on load terrain and people.', 1), 
(11, 'Eliminate or limit twisting and over-reaching.', 1), 
(11, 'Use 2 person lift where necessary.', 1), 
(11, 'Rotate tasks.', 1), 
(11, 'Maintain and check equipment condition.', 1), 
(11, 'Team Leader/Project Coord to demonstrate correct technique.', 1), 
(11, 'Direct supervision provided by Team Leader/Project Coord.', 1);

/*-- ==================================================
-- RISK ID 12:  Mulching - inhalation/eye injury
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(12, 'Explain and demonstrate wheelbarrow loading and use.', 1), 
(12, 'Explain and demonstrate correct techniques for using a rake.', 1), 
(12, 'Explain and demonstrate correct use of fork/shovel.', 1), 
(12, 'Explain and demonstrate how to carry, put down and store the tools, giving consideration to both the users and the general public.', 1), 
(12, 'Check that all tools are in good repair, and that there are no split handles or loose tool heads.', 1),
(12, 'Redeploy to other tasks (upwind), any person who has disclosed a pre-existing respiratory infection or allergy eg. Asthma.', 1), 
(12, 'Damp down mulch before working with it.', 1), 
(12, 'Maintain safe working distance of at least 3 metres.', 1), 
(12, 'So far as possible, clear the area of any trip hazards.', 1); 

/*-- ==================================================
-- RISK ID 13:  Plant Propagation - Strains, soil borne diseases, 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(13, 'Avoid prolonged standing on hard surfaces.', 1),
(13, 'Rotate tasks, even if team members are not experiencing discomfort.', 1),
(13, 'Take regular breaks for stretching and gentle exercise.', 1),
(13, 'Provide adequate washing facilities.', 1),
(13, 'Open bags of potting mix at arms length. (Avoid breathing the dust that may be released.)', 1),
(13, 'Damp down potting mix before use.', 1),
(13, 'Have eye protection available, and use as required.', 1),
(13, 'Wear gloves when handling soil.', 1),
(13, 'Wear face masks when handling potting mix.', 1);

/*-- ==================================================
-- RISK ID 14:  Predator control /checking traps
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(14, 'must be competent and confident in trap setting',1),
(14, 'check weather before',1),
(14, 'check all kit/tools on hand relevant to length of trap line; eg water',1),
(14, 'advise ‘buddy’ of leaving and return',1),
(14, 'wear disposable or washable gloves when handling traps/disposing of carcases',1),
(14, 'tongs used for clearing /cleaning traps',1),
(14, 'Use setting tools',1), 
(14, 'Carry hand sanitiser',1), 
(14, 'Wear high-vis vest -esp. if traps along road.',1);

/*-- ==================================================
-- RISK ID 15:  Seed collection - cuts/scratches, eye injuries
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(15, 'Rotate tasks to guard against postural overuse injuries.', 1),
(15, 'Specify and maintain a safe working distance between team members.', 1),
(15, 'Explain and demonstrate tool use.', 1),
(15, 'Ensure not team members are working directly under others.', 1),
(15, 'Wear PPE including safety glasses, gloves, high vis vests and if required hard hats.', 1);

/*-- ==================================================
-- RISK ID 16:  Slips, Trips & Falls
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(16, 'Remove trip hazards.', 1),
(16, 'Mark trip hazards.', 1),
(16, 'Ensure appropriate footwear with grip worn.', 1),
(16, 'Establish paths across slopes.', 1),
(16, 'Do not carry loads that limit visibility.', 1),
(16, 'Station vehicle in location with good access.', 1),
(16, 'Direct supervision by Team Leader/Project Coard.', 1);

/*-- ==================================================
-- RISK ID 17:  Soil Borne Diseases & Inflections
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(17, 'ID team members in higher risk categories (diabetes, lung/kidney disease, open cuts) and deploy.', 1),
(17, 'Cover any minor cuts or scratches prior to work.', 1),
(17, 'Suppress dust and modify task to reduce dust.', 1),
(17, 'Provide washing facilities and wash areas of potential soil contact prior to eating and drinking.', 1),
(17, 'Wear PPE; Long sleeves & pant, enclosed shoes, hat (when outside), gloves (impervious if wet), safety glasses, dust masks (if large amounts of dust).', 1);

/*-- ==================================================
-- RISK ID 18:  Surveying & Data Collection
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(18, 'Ensure that all team members know the boundaries of the survey area and remain within them at all times.', 1),  
(18, 'Set times at which teams must return or report to the supervisor.', 1), 
(18, 'Instruct that any team member who becomes lost should find the nearest shelter and remain there while using an agreed distress signal eg. three whistle blasts.', 1),
(18, 'Ensure that all team members have means of communicating an emergency signal (eg: whistle, radios) and fully understand the signals to be used.', 1),
(18, 'If the survey involves collecting seats, ensure that this is done hygienically eg. by using gloves, tongs etc.', 1),  
(18, 'Work in pairs as a minimum group size.', 1),  
(18, 'Wear boots that are suitable for walking, and sufficiently sturdy for the terrain.', 1);

/*-- ==================================================
-- RISK ID 19:  Track Construction and Maintenance - impact 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(19, 'Arrange delivery of tools and materials so as to minimise distance over which things need to be carried.', 1),
(19, 'Encourage gentle warm up stretches before commencement and after breaks.', 1),
(19, 'Maintain tools in good condition.', 1),
(19, 'Maintain safe working distance of at least 3 metres.', 1),
(19, 'Arrange emergency communication and explain this to all team members.', 1),
(19, 'Rotate tasks even if team members are not experiencing discomfort.', 1),
(19, 'Wear appropriate PPE inc. high visibility vests, gloves, safety glasses.', 1),
(19, 'Ensure that boots are suitable for walking, and sufficiently sturdy for the terrain.', 1);

/*-- ==================================================
-- RISK ID 20:  Tree Planting/ impact injuries, muscle strain
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(20, 'Conduct a visual inspection of the site, and remove potential risks such as broken glass, wire etc.', 1),
(20, 'Use kneeling mats or padding if there is a danger of spike injuries from glass, stones etc.', 1),
(20, 'Rotate tasks, even if team members are not experiencing discomfort.', 1),
(20, 'Take regular breaks and encourage gentle stretching.', 1),
(20, 'Provide adequate hand washing facilities.', 1),
(20, 'Specify and maintain a safe working space between team members; usually two metres.', 1),
(20, 'Wear gloves when handling soil, and additional PPE as necessary.', 1);

/*-- ==================================================
-- RISK ID 21:  Using Machete or cane knife
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(21, 'Use only when an alternate tool is not practicable (eg loppers, hand saws, secateurs or similar).', 1),
(21, 'Ensure machetes are kept sharp.', 1),
(21, 'Team leaders only to sharpen (sharpen away from blade).', 1),
(21, 'Ensure handle and wrist strap are securely fastened.', 1),
(21, 'Only assign machetes to volunteers who have previously demonstrated high levels of responsibility.', 1),
(21, 'Allow a maximum of four machetes to be used at any one time.', 1),
(21, 'Team Leader to maintain direct supervision.', 1),
(21, 'Demonstrate correct use, including appropriate cutting angle (to avoid blade bouncing off target) and safe working distance (5 metre buffer zone).', 1),
(21, 'Use only for cutting soft vegetation (small branches, vines, grasses etc) not hard wood.', 1),
(21, 'Ensure appropriate PPE is worn, including gloves, long pants, sturdy boots and shin pads.', 1),
(21, 'Rotate tasks or take regular breaks to maintain concentration and reduce repetitive strain injury.', 1),
(21, 'Cover blade with a sheath or split hose when not in use, and store in an appropriate place.', 1);

/*-- ===============================
-- RISK ID 22: Using Power Tools
-- ===============================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(22, 'Explain and demonstrate how to use, carry and store tools correctly.', 1),
(22, 'Maintain strict supervision.', 1),
(22, 'Use and maintain tools in accordance with manufacturer specifications.', 1),
(22, 'Specify and maintain a safe buffer zone around power tool users.', 1),
(22, 'Ensure all equipment and lead attachments have been tested and tagged and are in a safe working condition and protected from water.', 1),
(22, 'No broken plugs, sockets or switches.', 1),
(22, 'No frayed or damaged leads.', 1),
(22, 'Emergency shutdown procedures in place.', 1),
(22, 'Circuit breaker/safety switch installed and/or RCD used when operating tool.', 1),
(22, 'Start/stop switches clearly marked, in easy reach of operator.', 1),
(22, 'Check that protective guards on tools are attached and effective.', 1),
(22, 'Clear trip hazards from the work site.', 1),
(22, 'Position the generator, if used, in a dry, stable location and prevent access to it by unauthorised people.', 1),
(22, 'Check that the team members have hair tied back and clothing tucked in, including drawstrings on jackets, hats, etc.', 1),
(22, 'Wear appropriate PPE as recommended by the manufacturer eg. eye and ear protection, safety boots.', 1);

/*-- ============================================
-- RISK ID 23: Using Swinging Tools
-- ============================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(23, 'Ensure that suitable work boots, with reinforced toes, are being worn.', 1),
(23, 'Encourage gentle warm up stretches before commencement and after breaks.', 1),
(23, 'Maintain safe working distance of at least 3 metres; for short handled tools (e.g. hammer), 2 metres.', 1),
(23, 'Explain and demonstrate how to use, carry and store tools correctly.', 1),
(23, 'Maintain tools in good condition.', 1),
(23, 'Establish a firm footing before swinging tools.', 1),
(23, 'Raise tools no more than shoulder height on back swing.', 1),
(23, 'Rotate tasks even if team members are not experiencing discomfort; specify rotation frequency.', 1),
(23, 'Adjust the duration of work periods to take account of the physical capacities of the team members.', 1),
(23, 'Wear appropriate PPE eg. high visibility vest, hard hat, glasses and gloves.', 1);

/*-- ==============================================
-- RISK ID 24: Using Temporary Accommodation
-- ==============================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(24, 'Clear all exits so they are uncluttered and readily accessible.', 1),
(24, 'Inspect all gas and electrical appliances to ensure that they are in a safe, operational condition.', 1),
(24, 'Do not overload power points with too many appliances.', 1),
(24, 'Formulate a fire evacuation plan and communicate it to all team members.', 1),
(24, 'Remove any combustible materials that are stored near a possible fire source.', 1),
(24, 'Ensure backup (emergency) lighting is available (e.g. extra torches).', 1),
(24, 'Ensure that the CV "No Smoking" policy is enforced.', 1),
(24, 'Keep food storage and preparation areas, showers and toilets clean and hygienic.', 1),
(24, 'Store all garbage outside the accommodation, and dispose of it at the first practicable opportunity.', 1);

/*-- ===========================================
-- RISK ID 25: Using picket rammers
-- ===========================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(25, 'Use rammers with a minimum length of 1.2 metres.', 1),
(25, 'Explain and demonstrate proper technique for picket ramming.', 1),
(25, 'Encourage gentle warm up stretches before commencing picket ramming.', 1),
(25, 'Only allocate this task to people with the physical capacity to perform it safely.', 1),
(25, 'Rotate tasks, even if team members are not experiencing discomfort; specify rotation frequency.', 1),
(25, 'Only grip the vertical section of the handles when using the rammer.', 1),
(25, 'Rammer not to be lifted off post during operation.', 1);
(25, 'Remove/limit distractions for team members involved in post ramming.', 1),
(25, 'Specify and maintain a safe working distance between team members.', 1),
(25, 'All team members involved in task to wear hard hat, ear and eye protection, high visibility vests and gloves.', 1);


/*-- =============================
-- RISK ID 26: Vehicle Travel
-- =============================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(26, 'Comply with all road laws.', 1),
(26, 'Complete pre-start checklist prior to operation.', 1),
(26, 'Wear seat belts when vehicle is in motion.', 1),
(26, 'All tools and equip secured in cargo area.', 1),
(26, 'Minimise distraction and take breaks on long drives.', 1),
(26, 'Appoint navigator to assist with directions.', 1),
(26, 'Appoint a spotter when reversing.', 1),
(26, 'Ensure all doors and tailgates are closed before vehicle moves. - Maintain vehicle as per manufacturers manual.', 1);

/*-- ============================================
-- RISK ID 27: Weeding (scratches, strains...)
-- ============================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(27, 'Wear gloves whenever hands are at ground level.', 1),
(27, 'Encourage gentle warm up stretches.', 1),
(27, 'Comply with all MSDS directions if using chemicals.', 1),
(27, 'Specify and maintain a safe working space between team members.', 1),
(27, 'Provide adequate washing facilities.', 1),
(27, 'Wear eye protection where potential for eye injury is identified. Chemical splashes and grass or twig spikes to eyes, are common weeding injuries.', 1);

/*-- =========================================================
-- RISK ID 28: Working at heights (falls, falling objects)
-- =========================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(28, 'Safety rails, fall arrest device and helmet must be in place if fall height exceeds 2m.', 1),
(28, 'Complete check for any electrical services in work location.', 1),
(28, 'Maintain exclusion zone beneath elevated worker.', 1),
(28, 'Use well maintained ladder on non-slip surface.', 1),
(28, 'Limit workers at height and only one person permitted on ladder at a time.', 1),
(28, 'Secure tools and equipment being used at height.', 1),
(28, 'Always work facing the ladder.', 1),
(28, 'Appoint spotters.', 1);

/*-- =======================================================================
-- RISK ID 29: Working in Cold Conditions (Hypothermia)
-- =======================================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(29, 'Make food and fluids available, including warm drinks where possible.', 1),
(29, 'Conduct gentle warm up stretches before commencing work, and after breaks.', 1),
(29, 'Rotate tasks to avoid prolonged exposure and specify frequency of rotations.', 1),
(29, 'Identify and Use sheltered area during periods of inactivity e.g.: breaks or extreme conditions.', 1),
(29, 'Structure work to avoid the coldest times of the day.', 1),
(29, 'Encourage team members to wear layered clothing that enables them to adjust their body temperature according to weather conditions and activity level.', 1),
(29, 'Wear a warm hat.', 1);

/*-- =====================================================
-- RISK ID 30: Working in Windy Conditions
-- =====================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(30, 'Check local weather forecast.', 1),
(30, 'Is a severe weather warning current?', 1),
(30, 'Will you be working under trees on the site?', 1),
(30, 'Does the site contain old growth or dead trees?', 1),
(30, 'Are there dead limbs or hanging timber that could fall?', 1),
(30, 'Consider the types of activities being undertaken (e.g. mulching/digging/planting may lead to more dust/debris in the air).', 1),
(30, 'Check local fire warnings (windy weather can often mean bushfire weather).', 1),
(30, 'Do you or any of your team members have a moderate to severe respiratory condition (e.g. asthma)?', 1);


/*-- ==========================================
-- RISK ID 31: Working in the dark
-- ==========================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(31, 'Check that no person has a physical or psychological problem that renders them unsuitable for working in the dark.', 1),
(31, 'Check that each person has a reliable torch.', 1),
(31, 'Advise all participants to have ample, layered clothing.', 1),
(31, 'Check that work area boundaries are understood and meeting point is known.', 1),
(31, 'Work in pairs as a minimum group size; establish a "buddy" system.', 1),
(31, 'If possible, during daylight hours inspect the site and remove or clearly mark trip hazards or other hazardous areas.', 1),
(31, 'Provide each person with a whistle and ensure that each person knows that three long blasts is the standard emergency/distress signal.', 1),
(31, 'Avoid rough or slippery areas.', 1),
(31, 'Minimise the number, weight and bulk of items to be carried.', 1),
(31, 'Wear high visibility vests.', 1);

/*-- ============================================================
-- RISK ID 32: Working in tick habitat (allergic reaction...)
-- ============================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(32, 'Prior to project, seek local advice on presence of ticks. (If in plague proportion, reconsider whether or not to continue.)', 1),
(32, 'Reduce tick access to skin by wearing long trousers (tucked into socks), long sleeved shirt (tucked in), broad-brimmed hat (reduces likelihood of ticks from getting into hair or down the neck of clothing)', 1),
(32, 'If possible, wear light colored clothing so that any ticks on clothing are more readily spotted.', 1),
(32, 'Apply DEET repellent to exposed skin.', 1),
(32, 'Minimise disturbance to vegetation (as this appears to make ticks more active) by working for short periods in one location where ticks are a problem.', 1),
(32, 'After leaving tick area, have team members check each other for ticks hair, behind ears, back of neck etc.', 1),
(32, 'Encourage team members to check themselves fully when showering.', 1),
(32, 'If possible, after working in a high tick population area, place clothing in a hot dryer for 20 minutes.', 1);

/*-- =================================================
-- RISK ID 33: Working near heavy machinery
-- =================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(33, 'Eliminate or minimise the need for team members to work near heavy machinery.', 1),
(33, 'Advise operator of the location and movement patterns of those working nearby.', 1),
(33, 'Maintain direct liaison between the team, supervisor and the plant operator.', 1),
(33, 'Develop and demonstrate a set of signals to be used; these must be clear, unambiguous and understood by all.', 1),
(33, 'Work upwind or out of fume and dust range.', 1),
(33, 'Appoint a "spotter" to provide additional supervision.', 1);
(33, 'Wear high visibility vests.',1),
(33, 'Wear appropriate PPE eg. glasses, respirators, ear protection.', 1);

/*-- =============================================================
-- RISK ID 34: Working near road sides (vehicle impact)
-- =============================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(34, 'Eliminate or minimise the need for team members to work near roadsides.', 1),
(34, 'Arrange for the placement of appropriate signage eg: SLOW DOWN, WORKERS NEAR ROADSIDE, and/or witches hats to indicate to drivers that there are workers ahead. (Note: This must be done by a competent person who has completed the proper training and received authorisation by the appropriate roads management authority.)', 1),
(34, 'Maintain direct and continuous supervision.', 1),
(34, 'Appoint a "spotter" to provide additional supervision.', 1),
(34, 'Check that all team members understand the signals to be used, and that the signals are clear and unambiguous.', 1),
(34, 'Work upwind or out of fume and dust range.', 1),
(34, 'Wear high visibility vests or clothing.', 1);

/*-- =======================================================
-- RISK ID 35: Working near water (drowning)
-- =======================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(35, 'Maintain a safe distance between team members and water that is deemed dangerous because of depth, current, murkiness, turbulence, difficulty of escape etc.', 1),
(35, 'Designate areas on steep, slippery or unstable banks as no-go areas and flag or tape off', 1),
(35, 'Identify non-swimmers and ensure that they are deployed away from higher risk areas.', 1),
(35, 'Where there is an inadvertent possibility of the need to rescue someone from the water, ensure there are rescue aids readily accessible eg. rope, long pole, flotation device. Where there is a current, these aids must be positioned downstream of the most likely entry point.', 1),
(35, 'Formulate an emergency response plan that is based on non-contact rescue strategies.', 1),
(35, 'Maintain strict compliance with Conservation Volunteers\' policy of not facilitating recreational swimming.', 1),
(35, 'Encourage team members to have adequate spare, dry socks.', 1),
(35, 'Provide adequate washing facilities eg. soap and clean water.', 1);


/*-- =========================================
-- RISK ID 36: Working with schools
-- =========================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(36, 'Do not allow yourself or any volunteer to be alone with a school student or young person.', 1),
(36, 'Always try to arrange for the CV team to have access to a toilet that is not used by the students.', 1),
(36, 'Avoid moving a CV vehicle on school property while students are out of class or in close proximity. If the vehicle absolutely must be moved, switch on hazard lights, appoint spotters in high visibility vests and drive at a speed no greater than 10kph.', 1),
(36, 'Where possible coordinate breaks for your team with the meal breaks of the school students, this reduces the need to manage third parties entering your worksite.', 1),
(36, 'Ensure that tools or personal belongings are not left in unsecured, unsupervised areas.', 1),
(36, 'Insist that a teacher remain present if students are to work with or near to a CV team.', 1),
(36, 'Observe the sign in/ sign out procedures required by the school and observe the rules, laws and standards that apply to the school grounds, eg. no smoking or wearing clothes with offensive slogans or images.', 1),
(36, 'Become familiar with the school\'s emergency evacuation plan and muster point.', 1);

/*-- ============================================================
-- RISK ID 37: Working with/ near Power Auger
-- ============================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(37, 'Ensure the operator is properly trained and competent to operate the equipment.', 1),
(37, 'Ensure the operator is of sufficient strength and stature to control the equipment safely.', 1),
(37, 'Ensure the operator knows the proper use of the controls, especially how to engage the brake and how to shut down the auger quickly if necessary.', 1),
(37, 'Complete a pre-operation check of the auger before use; checking the condition of the drill bit, condition of padding and anti-vibration mountings, condition of exhaust (this should direct exhaust fumes away from the operator), ensuring that automatic braking system and switches work and checking for any loose bolts.', 1),
(37, 'Ensure that a 3 meter buffer zone is maintained between the auger and other people.', 1),
(37, 'Adhere to all manufacturer specifications for use and maintenance.', 1),
(37, 'Keep feet and hands well clear of rotating auger bit.', 1),
(37, 'Tuck in loose clothing, keep hat cords behind your neck and tie back long hair or put it down the back of the shirt and remove necklaces to avoid entanglement.', 1),
(37, 'Stop operating the auger if other people move within the buffer zone.', 1),
(37, 'Appoint "spotter" for site surveillance.', 1),
(37, 'Engage auger brake when moving between holes and turn off the auger when not in use.', 1),
(37, 'Only run the auger for short periods of time (eg 20 minutes). This will help prevent muscle strain injuries, heat stress, and also prevents the machine from overheating. Allow auger to cool for a few minutes before refuelling.', 1),
(37, 'Wear appropriate PPE, as advised by the manufacturer eg: safety boots, gloves, ear protection and high visibility vest.', 1);

/*-- ==============================================
-- RISK ID 38: Working with/near animals
-- ==============================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(38, 'Provide appropriate animal handling training.', 1),
(38, 'Stress that all team members must be alert for unpredictable behaviour by animals.', 1),
(38, 'Take into account the physical strength and stature of persons handling particular animals/species.', 1),
(38, 'Wear appropriate PPE eg: glasses, gloves, long sleeves.', 1),
(38, 'Make adequate provision for the maintenance of personal hygiene (eg: clean water and soap).', 1);

/*-- =================================================
-- RISK ID 39: Working with/ near brush cutters
-- =================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(39, 'Ensure the operator is properly trained.', 1),
(39, 'Ensure the operator is of sufficient strength and stature to control the equipment safely.', 1),
(39, 'Check general mechanical condition of brush cutter before use.', 1),
(39, 'Remove all obstacles or potential missiles (eg: stones, wire or timber) from the work area, prior to work commencing.', 1),
(39, 'Ensure no other person is within 20 metres while the brush cutter is running.', 1),
(39, 'Ensure that any other persons working in the general vicinity are wearing eye protection.', 1),
(39, 'Adhere to all manufacturer specifications for use and maintenance.', 1),
(39, 'Keep all feet and hands well clear of moving parts.', 1),
(39, 'Stop operating the brush cutter if other people are close by.', 1),
(39, 'Appoint a "spotter" to provide additional site surveillance.', 1),
(39, 'Turn off the brush cutter when not in use or while removing debris.', 1),
(39, 'Wear appropriate PPE eg: glasses, eye/face protection, safety boots, overalls, ear protection and high visibility vests.', 1);

/*-- ==================================================
-- RISK ID 40: Working with/ near chainsaws
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(40, 'Chainsaws only to be used by licensed operators.', 1),
(40, 'Place warning signs at appropriate boundaries of the work area.', 1),
(40, 'Clear other workers and debris from the immediate area of the operator and the fall zone.', 1),
(40, 'Appoint a "spotter" to guard against any other team member or third party straying into the work area.', 1),
(40, 'All persons on site to wear high visibility vests.', 1),
(40, 'Always engage chain brake when not cutting.', 1),
(40, 'Start the saw with it resting on the ground. DO NOT DROP START.', 1),
(40, 'Wear appropriate PPE eg. hard hat, ear muffs, safety boots, face guardls, tellers trousers/chaps.', 1);
/*-- ==================================================
-- RISK ID 41: Working in Snake Habitat	
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(41, 'Conduct heavy line walk throughout site.',1),
(41, 'Avoid working in circular formation.',1),
(41, 'Use tools to lift object on the ground e.g. logs prior to handling.',1),
(41, 'Wear PPE including long sleeves & pants, boots, thick socks and gloves.',1),
(41, 'If sighted stay clear and alert other workers.',1),
(41, 'Review worksite viability during warmer months.',1);

/*--Populate the project_risks table*/
INSERT INTO project_risks (id, project_id, risk_id, created_at) VALUES
(1, 1, 1, NOW()),
(2, 1, 2, NOW());


/*-- Populate project_risk_controls table*/
INSERT INTO project_risk_controls (id, project_id, risk_control_id, is_checked, created_at) VALUES
(1, 1, 1, 1, NOW()),
(2, 1, 2, 0, NOW());


---====Checklist =====----

-- Insert checklist items
INSERT INTO checklist (description) VALUES
('All vehicle/driver licences/rego current'),
('Pre-existing medical conditions checked'),
('Weather checked, appropriate clothing worn/available'),
('Risk assessment checked and shared completed'),
('Correct PPE available'),
('First Aid kit stocked and on site'),
('First Aider present'),
('Project and safety induction completed');

-- Example project_checklist data (assuming project_id = 1)
INSERT INTO project_checklist (project_id, checklist_id, is_checked) VALUES
(1, 1, 0),
(1, 2, 0),
(1, 3, 0),
(1, 4, 0),
(1, 5, 0),
(1, 6, 0),
(1, 7, 0),
(1, 8, 0);

/* activity_incident_reports */
INSERT INTO activity_incident_reports
(
  activity_id,
  project_id,
  any_incident,
  type_of_incident,
  medical_treatment_obtained,
  project_location,
  project_site_manager,
  date_of_incident,
  time_of_incident,
  injured_person,
  injured_person_gender,
  type_of_injury,
  body_part_injured,
  location_of_accident,
  witnesses,
  task_undertaken,
  safety_instructions,
  ppe_worn,
  incident_description,
  action_taken,
  date_action_implemented,
  pre_existing_injury,
  condition_disclosed,
  register_of_injuries,
  further_action_recommended,
  injured_person_signature,
  injured_person_signature_date,
  manager_signature,
  manager_signature_date,
  committee_meeting_date,
  committee_meeting_comments,
  chairperson_signature,
  chairperson_signature_date,
  report_completed
  -- No created_at here, because it has a default
)
VALUES
(
  11,  -- activity_id
  7,   -- project_id
  'Yes',
  'Medical Treatment',
  NULL,
  'aa',
  'aa',
  '2025-02-15',
  '17:04',
  'qq',
  'Male',
  'w',
  'e',
  'ww',
  'ww',
  'sd',
  'dfed',
  'ss',
  'dd',
  'aa',
  '2025-02-15',
  'Yes',
  'No',
  'No',
  'sdfg',
  'sddfgf',
  '2025-02-15',
  'fds',
  '2025-02-15',
  '2025-02-15',
  'Yes',
  '???',
  '2025-02-15',
  'Yes'
);