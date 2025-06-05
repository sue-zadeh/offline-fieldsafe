/*staff */
CREATE TABLE IF NOT EXISTS staffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role ENUM('Field Staff', 'Team Leader', 'Group Admin') NOT NULL
    
);
/*activity_staff */
CREATE TABLE IF NOT EXISTS project_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    staff_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
);
/*activity_staff*/
CREATE TABLE IF NOT EXISTS activity_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  staff_id INT NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
);
/*volunteer*/
CREATE TABLE volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    emergencyContact VARCHAR(50) NOT NULL,
    emergencyContactNumber VARCHAR(15) NOT NULL,
    role ENUM('Volunteer') DEFAULT 'Volunteer'
);
/*activity_volunteer*/
CREATE TABLE IF NOT EXISTS activity_volunteer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);
/*project_volunteer*/
CREATE TABLE IF NOT EXISTS project_volunteer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);
/*projects*/
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  status ENUM('inprogress', 'completed', 'onhold', 'archived') NOT NULL DEFAULT 'inprogress',
  createdBy INT,
  emergencyServices VARCHAR(255) DEFAULT '111 will contact all emergency services',
  localMedicalCenterAddress VARCHAR(255),
  localMedicalCenterPhone VARCHAR(20),
  localHospital VARCHAR(255),
  primaryContactName VARCHAR(100),
  primaryContactPhone VARCHAR(20),
  imageUrl VARCHAR(255),
  inductionFileUrl VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (createdBy) REFERENCES login(id)
);
/*objectives*/
CREATE TABLE IF NOT EXISTS objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  measurement VARCHAR(255),
  dateStart DATE,
  dateEnd DATE,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
/*activity_objectives*/
CREATE TABLE IF NOT EXISTS activity_objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  objective_id INT NOT NULL,
  amount INT DEFAULT NULL,
  dateStart DATE NULL,
  dateEnd DATE NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);
/*project_objectives */
CREATE TABLE IF NOT EXISTS project_objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  objective_id INT NOT NULL,
  amount INT NOT NULL DEFAULT NULL,
  dateStart DATE NULL,
  dateEnd   DATE NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);
/*predator */
CREATE TABLE IF NOT EXISTS predator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sub_type VARCHAR(100) NOT NULL
);
/* activity_predator */
CREATE TABLE IF NOT EXISTS activity_predator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  predator_id INT NOT NULL,
  measurement INT NULL,
  dateStart DATE NULL,
  dateEnd DATE NULL,
  rats INT DEFAULT 0,
  possums INT DEFAULT 0,
  mustelids INT DEFAULT 0,
  hedgehogs INT DEFAULT 0,
  others INT DEFAULT 0,
  others_description VARCHAR(255) NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (predator_id) REFERENCES predator(id) ON DELETE CASCADE
);
/* project_predator */
CREATE TABLE IF NOT EXISTS project_predator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  predator_id INT NOT NULL,
  measurement INT NULL,
  dateStart DATE NULL,
  dateEnd DATE NULL,
  rats INT DEFAULT 0,
  possums INT DEFAULT 0,
  mustelids INT DEFAULT 0,
  hedgehogs INT DEFAULT 0,
  others INT DEFAULT 0,
  others_description VARCHAR(255) NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (predator_id) REFERENCES predator(id) ON DELETE CASCADE
);
/*---------------------------------*/

/* site_hazards */
CREATE TABLE site_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hazard_description VARCHAR(255) NOT NULL
);
/* activity_people_hazards */
CREATE TABLE activity_people_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hazard_description VARCHAR(255) NOT NULL
);
/* project_site_hazards */
CREATE TABLE project_site_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    site_hazard_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (site_hazard_id) REFERENCES site_hazards(id) ON DELETE CASCADE
);
/* activity_site_hazards */
CREATE TABLE IF NOT EXISTS activity_site_hazards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  site_hazard_id INT NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (site_hazard_id) REFERENCES site_hazards(id) ON DELETE CASCADE
);
/* project_activity_people_hazards */
CREATE TABLE project_activity_people_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    activity_people_hazard_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_people_hazard_id) REFERENCES activity_people_hazards(id) ON DELETE CASCADE
);
/* activity_activity_people_hazards */
CREATE TABLE IF NOT EXISTS activity_activity_people_hazards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  activity_people_hazard_id INT NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_people_hazard_id) REFERENCES activity_people_hazards(id) ON DELETE CASCADE
);

/*
DROP TABLE IF EXISTS project_risk_controls;
DROP TABLE IF EXISTS project_risks;
DROP TABLE IF EXISTS risk_controls;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS risk_titles;
=======================================*/

/* risk_titles */
CREATE TABLE risk_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isReadOnly BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
/* risks */
CREATE TABLE risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    risk_title_id INT NOT NULL,
    likelihood ENUM('highly unlikely', 'unlikely', 'quite possible', 'likely', 'almost certain') NOT NULL,
    consequences ENUM('insignificant', 'minor', 'moderate', 'major', 'catastrophic') NOT NULL,
    risk_rating VARCHAR(30) AS (
        CASE
            WHEN likelihood = 'highly unlikely' AND consequences IN ('insignificant', 'minor', 'moderate') THEN 'Low risk'
            WHEN likelihood = 'highly unlikely' AND consequences = 'major' THEN 'moderate risk'
            WHEN likelihood = 'highly unlikely' AND consequences = 'catastrophic' THEN 'High risk'
            WHEN likelihood = 'unlikely' AND consequences = 'insignificant' THEN 'Low risk'
            WHEN likelihood = 'unlikely' AND consequences IN ('minor', 'moderate') THEN 'moderate risk'
            WHEN likelihood = 'unlikely' AND consequences IN ('major', 'catastrophic') THEN 'High risk'
            WHEN likelihood = 'quite possible' AND consequences = 'insignificant' THEN 'Low risk'
            WHEN likelihood = 'quite possible' AND consequences = 'minor' THEN 'moderate risk'
            WHEN likelihood = 'quite possible' AND consequences IN ('moderate', 'major') THEN 'High risk'
            WHEN likelihood = 'quite possible' AND consequences = 'catastrophic' THEN 'Extreme risk'
            WHEN likelihood = 'likely' AND consequences IN ('minor', 'moderate') THEN 'High risk'
            WHEN likelihood IN ('likely', 'almost certain') AND consequences = 'insignificant' THEN 'moderate risk'
            WHEN likelihood IN ('likely', 'almost certain') AND consequences IN ('major', 'catastrophic') THEN 'Extreme risk'
            WHEN likelihood = 'almost certain' AND consequences = 'minor' THEN 'High risk'
            WHEN likelihood = 'almost certain' AND consequences = 'moderate' THEN 'Extreme risk'
            ELSE 'Unknown'
        END
    ) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);
/* risk_controls */
CREATE TABLE risk_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    risk_title_id INT NOT NULL,
    control_text TEXT NOT NULL,
    isReadOnly BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);
/* activity_risks */
CREATE TABLE IF NOT EXISTS activity_risks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  risk_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);
/* activity_risk_controls */
CREATE TABLE IF NOT EXISTS activity_risk_controls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  risk_control_id INT NOT NULL,
  is_checked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (risk_control_id) REFERENCES risk_controls(id) ON DELETE CASCADE
);
/* activity_risk_titles */
CREATE TABLE IF NOT EXISTS activity_risk_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    risk_title_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);

/* project_risks */
CREATE TABLE project_risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

/* project_risk_controls */
CREATE TABLE IF NOT EXISTS project_risk_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_title_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);

/*project_risk_controls*/
CREATE TABLE project_risk_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_control_id INT NOT NULL,
    is_checked BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_control_id) REFERENCES risk_controls(id) ON DELETE CASCADE
);

/*=======================================
 checklist */
CREATE TABLE checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);
/* activity_checklist */
CREATE TABLE IF NOT EXISTS activity_checklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  checklist_id INT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE
);
/* project_checklist */
CREATE TABLE project_checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    checklist_id INT NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE
);

/*=================================================
 activities */
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  activity_name VARCHAR(255) NOT NULL UNIQUE,
  activity_date DATE NOT NULL,
  notes TEXT,
  createdBy VARCHAR(255),
  status ENUM('', 'InProgress', 'Completed', 'onhold', 'archived') 
    NOT NULL DEFAULT '',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

/*===================================================
activity_incident_reports*/
CREATE TABLE IF NOT EXISTS activity_incident_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  /* Link to the activities table */
  activity_id INT NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  
  /* Link to the projects table */
  project_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

  /* Was an incident reported? */
  any_incident ENUM('No','Yes') DEFAULT 'No',
  
  /* If Yes, collect all relevant details: */
  type_of_incident ENUM('Near Miss','Medical Treatment','Other Significant Event','First Aid') NULL,
  medical_treatment_obtained VARCHAR(255) NULL,
  project_location VARCHAR(255) NULL,
  project_site_manager VARCHAR(255) NULL,
  date_of_incident DATE NULL,
  time_of_incident TIME NULL,
  
  injured_person VARCHAR(255) NULL,
  injured_person_gender ENUM('Male','Female','Other') NULL,
  type_of_injury VARCHAR(255) NULL,
  body_part_injured VARCHAR(255) NULL,
  location_of_accident VARCHAR(255) NULL,
  witnesses VARCHAR(255) NULL,
  task_undertaken VARCHAR(255) NULL,
  safety_instructions TEXT NULL,
  ppe_worn TEXT NULL,
  incident_description TEXT NULL,
  action_taken TEXT NULL,
  date_action_implemented DATE NULL,
  
  pre_existing_injury ENUM('No','Yes') DEFAULT 'No',
  condition_disclosed ENUM('No','Yes') DEFAULT 'No',
  register_of_injuries ENUM('No','Yes') DEFAULT 'No',
  further_action_recommended TEXT NULL,
  
  /* Signatures and approvals */
  injured_person_signature VARCHAR(255) NULL,
  injured_person_signature_date DATE NULL,
  manager_signature VARCHAR(255) NULL,
  manager_signature_date DATE NULL,
  committee_meeting_date DATE NULL,
  committee_meeting_comments TEXT NULL,
  chairperson_signature VARCHAR(255) NULL,
  chairperson_signature_date DATE NULL,

  /* For completeness */
  report_completed ENUM('No','Yes') DEFAULT 'No',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/*reports Table*/
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  objective_id INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  /*  store summary JSON in a text field:*/
  summary_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);
