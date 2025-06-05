-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: fieldsafe
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `activity_date` date NOT NULL,
  `notes` text,
  `createdBy` varchar(255) DEFAULT NULL,
  `status` enum('','InProgress','Completed','onhold','archived') NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_name` (`activity_name`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,3,'activity 1','2025-02-01','sdfghjklhgfdsaSDGFHGJKLHGFDSADFHGJHKJKLKJTREQWQRETRYTUYIUYIXZCVBNM,','Saba','InProgress','2025-01-28 20:01:15'),(2,3,'activity 2','2025-01-24','esrthyjuilolikujythgrefd','Sue','InProgress','2025-01-28 20:10:21'),(3,5,'activity3','2025-01-28','errorr tyuiopoiuyt','Sori','onhold','2025-01-28 22:41:44'),(4,4,'activity5','2025-01-31','dsfhj,hk,jmhghgfdh','Sue','onhold','2025-01-29 16:40:59'),(5,7,'activity 6','2025-01-24','objectives done. my arm injured','Aryana','Completed','2025-01-30 14:46:53'),(6,7,'activity 7','2025-01-30','aswedrftghgfdsaswedfghvgcds','zizi','onhold','2025-01-31 00:09:35'),(7,7,'activity4','2025-01-22','sdfghgfdsaasdfgfds','tina','InProgress','2025-01-31 02:36:37'),(8,6,'new activity','2025-01-21','dfghjkljkhjghfgdfsdasadfghgjhj,hmgnfbdvcsx','hey','onhold','2025-01-31 13:19:47'),(9,7,'activity done','2025-01-30','asdfgnhgbfvdcs','ww','archived','2025-01-31 17:59:37'),(10,7,'active pro','2025-01-29','ewrtyujujyhtgrfe','willy','archived','2025-01-31 18:00:46'),(11,7,'activity4-1','2025-01-17','sdfghgfdsafghjklkjhg','tina','Completed','2025-01-31 20:21:21'),(12,8,'activity4-3','2025-01-17','','tina','Completed','2025-01-31 20:23:41'),(13,5,'activity4-2','2025-01-17','sdfghgfdsafghjklkjhgbfvasdfgfds','tina','Completed','2025-01-31 20:29:06'),(14,5,'activity4-2-1','2025-01-15','eeenew ','tina','Completed','2025-01-31 21:17:42'),(15,5,'activity3-1','2025-01-28','errorr tyuio','Sori','Completed','2025-02-01 18:37:00'),(16,5,'activity3-2','2025-01-28','','Sori','Completed','2025-02-01 18:38:14'),(17,5,'activity3-2-1','2025-01-28','important','Sori','Completed','2025-02-02 14:52:37');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_activity_people_hazards`
--

DROP TABLE IF EXISTS `activity_activity_people_hazards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_activity_people_hazards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `activity_people_hazard_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `activity_people_hazard_id` (`activity_people_hazard_id`),
  CONSTRAINT `activity_activity_people_hazards_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_activity_people_hazards_ibfk_2` FOREIGN KEY (`activity_people_hazard_id`) REFERENCES `activity_people_hazards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_activity_people_hazards`
--

LOCK TABLES `activity_activity_people_hazards` WRITE;
/*!40000 ALTER TABLE `activity_activity_people_hazards` DISABLE KEYS */;
INSERT INTO `activity_activity_people_hazards` VALUES (1,1,3),(3,2,2),(4,2,3),(6,4,3),(7,8,3),(11,14,3),(12,14,2),(13,5,1),(15,5,2),(17,16,3);
/*!40000 ALTER TABLE `activity_activity_people_hazards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_checklist`
--

DROP TABLE IF EXISTS `activity_checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_checklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `checklist_id` int NOT NULL,
  `is_checked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `checklist_id` (`checklist_id`),
  CONSTRAINT `activity_checklist_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_checklist_ibfk_2` FOREIGN KEY (`checklist_id`) REFERENCES `checklist` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_checklist`
--

LOCK TABLES `activity_checklist` WRITE;
/*!40000 ALTER TABLE `activity_checklist` DISABLE KEYS */;
INSERT INTO `activity_checklist` VALUES (1,1,2,0),(2,1,3,0),(3,1,4,0),(5,3,3,0),(6,14,2,0),(7,14,4,0),(8,16,2,0),(9,16,3,0),(10,16,4,0);
/*!40000 ALTER TABLE `activity_checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_incident_reports`
--

DROP TABLE IF EXISTS `activity_incident_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_incident_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `project_id` int NOT NULL,
  `any_incident` enum('No','Yes') DEFAULT 'No',
  `type_of_incident` enum('Near Miss','Medical Treatment','Other Significant Event','First Aid') DEFAULT NULL,
  `medical_treatment_obtained` varchar(255) DEFAULT NULL,
  `project_location` varchar(255) DEFAULT NULL,
  `project_site_manager` varchar(255) DEFAULT NULL,
  `date_of_incident` date DEFAULT NULL,
  `time_of_incident` time DEFAULT NULL,
  `injured_person` varchar(255) DEFAULT NULL,
  `injured_person_gender` enum('Male','Female','Other') DEFAULT NULL,
  `type_of_injury` varchar(255) DEFAULT NULL,
  `body_part_injured` varchar(255) DEFAULT NULL,
  `location_of_accident` varchar(255) DEFAULT NULL,
  `witnesses` varchar(255) DEFAULT NULL,
  `task_undertaken` varchar(255) DEFAULT NULL,
  `safety_instructions` text,
  `ppe_worn` text,
  `incident_description` text,
  `action_taken` text,
  `date_action_implemented` date DEFAULT NULL,
  `pre_existing_injury` enum('No','Yes') DEFAULT 'No',
  `condition_disclosed` enum('No','Yes') DEFAULT 'No',
  `register_of_injuries` enum('No','Yes') DEFAULT 'No',
  `further_action_recommended` text,
  `injured_person_signature` varchar(255) DEFAULT NULL,
  `injured_person_signature_date` date DEFAULT NULL,
  `manager_signature` varchar(255) DEFAULT NULL,
  `manager_signature_date` date DEFAULT NULL,
  `committee_meeting_date` date DEFAULT NULL,
  `committee_meeting_comments` text,
  `chairperson_signature` varchar(255) DEFAULT NULL,
  `chairperson_signature_date` date DEFAULT NULL,
  `report_completed` enum('No','Yes') DEFAULT 'No',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `activity_incident_reports_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_incident_reports_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_incident_reports`
--

LOCK TABLES `activity_incident_reports` WRITE;
/*!40000 ALTER TABLE `activity_incident_reports` DISABLE KEYS */;
INSERT INTO `activity_incident_reports` VALUES (1,11,7,'Yes','Medical Treatment',NULL,'aa','aa','2025-02-15','17:04:00','qq','Male','w','e','ww','ww','sd','dfed','ss','dd','aa','2025-02-15','Yes','No','No','sdfg','sddfgf','2025-02-15','fds','2025-02-15','2025-02-15','Yes','???','2025-02-15','Yes','2025-02-02 16:43:34'),(2,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-08','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-08','Yes','Yes','Yes','sdf','a','2025-02-08','a','2025-02-08','2025-02-08','az','a','2025-02-08','Yes','2025-02-02 17:21:52'),(3,11,7,'Yes','Medical Treatment',NULL,'aa','aa','2025-02-14','17:04:00','qq','Male','w','e','ww','ww','sd','dfed','ss','dd','aa','2025-02-14','Yes','No','No','sdfg','sddfgf','2025-02-14','fds','2025-02-14','2025-02-14','Yes','???','2025-02-14','Yes','2025-02-02 18:34:40'),(4,11,7,'Yes','Medical Treatment',NULL,'aa','aa','2025-02-13','17:04:00','qq','Male','w','e','ww','ww','sd','dfed','ss','dd','aa','2025-02-13','Yes','No','No','sdfg','sddfgf','2025-02-13','fds','2025-02-13','2025-02-13','Yes','???','2025-02-13','Yes','2025-02-02 18:51:53'),(5,11,7,'Yes','Medical Treatment',NULL,'aa','aa','2025-02-12','17:04:00','qq','Male','w','e','ww','ww','sd','dfed','ss','dd','aa','2025-02-12','Yes','No','No','sdfg','sddfgf','2025-02-12','fds','2025-02-12','2025-02-12','Yes','???','2025-02-12','Yes','2025-02-02 18:58:06'),(6,11,7,'Yes','Medical Treatment',NULL,'aa','aa','2025-02-11','17:04:00','qq','Male','w','e','ww','ww','sd','dfed','ss','dd','aa','2025-02-11','Yes','No','No','sdfg','sddfgf','2025-02-11','fds','2025-02-11','2025-02-11','Yes','???','2025-02-11','Yes','2025-02-02 19:09:01'),(7,17,5,'Yes','Other Significant Event',NULL,'a','a','2025-02-08','19:27:00','a','Female','a','a','A','A','a','s','s',NULL,NULL,'2025-02-08','No','No','No',NULL,NULL,'2025-02-08',NULL,'2025-02-08','2025-02-08',NULL,NULL,'2025-02-08','Yes','2025-02-02 19:27:54'),(8,17,5,'Yes','Other Significant Event',NULL,'a','a','2025-02-07','19:27:00','a','Female','a','a','A','A','a','s','s',NULL,NULL,'2025-02-07','No','No','No',NULL,NULL,'2025-02-07',NULL,'2025-02-07','2025-02-07',NULL,NULL,'2025-02-07','Yes','2025-02-02 19:45:49'),(9,17,5,'Yes','Other Significant Event',NULL,'a','a','2025-02-07','19:27:00','a','Female','a','a','A','A','a','s','s',NULL,NULL,'2025-02-07','No','No','No',NULL,NULL,'2025-02-07',NULL,'2025-02-07','2025-02-06',NULL,NULL,'2025-02-07','Yes','2025-02-02 21:23:32'),(10,17,5,'Yes','Other Significant Event',NULL,'a','a','2025-02-06','19:27:00','a','Female','a','a','A','A','a','s','s',NULL,NULL,'2025-02-06','No','No','No',NULL,NULL,'2025-02-06',NULL,'2025-02-06','2025-02-05',NULL,NULL,'2025-02-06','Yes','2025-02-03 09:16:55'),(11,11,7,'Yes','Medical Treatment',NULL,'aa','aa','2025-02-10','17:04:00','qq','Male','w','e','ww','ww','sd','dfed','ss','dd','aa','2025-02-10','Yes','No','No','sdfg','sddfgf','2025-02-10','fds','2025-02-10','2025-02-10','Yes','???','2025-02-10','Yes','2025-02-03 09:47:10'),(12,12,8,'Yes',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'No','No','No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Yes','2025-02-03 10:25:29'),(13,5,7,'Yes',NULL,NULL,NULL,NULL,'2025-02-03','12:28:00',NULL,'Female',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-03','No','No','No',NULL,NULL,'2025-02-03',NULL,'2025-02-03','2025-02-03',NULL,NULL,'2025-02-03','Yes','2025-02-03 12:26:56'),(14,5,7,'Yes',NULL,NULL,NULL,NULL,'2025-02-02','12:28:00',NULL,'Female',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-02','No','No','No',NULL,NULL,'2025-02-02',NULL,'2025-02-02','2025-02-02',NULL,NULL,'2025-02-02','Yes','2025-02-03 12:39:27'),(15,5,7,'Yes','Medical Treatment','e',NULL,NULL,'2025-02-03','12:28:00',NULL,'Female',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-03','No','No','No',NULL,NULL,'2025-02-03',NULL,'2025-02-03','2025-02-03',NULL,NULL,'2025-02-03','Yes','2025-02-03 12:44:09'),(16,5,7,'Yes','Medical Treatment','e',NULL,NULL,'2025-02-02','12:28:00',NULL,'Female',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-02','No','No','No',NULL,NULL,'2025-02-02',NULL,'2025-02-02','2025-02-02',NULL,NULL,'2025-02-02','Yes','2025-02-03 12:44:43'),(17,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-07','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-07','Yes','Yes','Yes','sdf','a','2025-02-07','a','2025-02-07','2025-02-07','az','a','2025-02-07','Yes','2025-02-03 15:48:39'),(18,15,5,'Yes',NULL,NULL,NULL,NULL,'2025-02-11','22:31:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-11','No','No','No',NULL,'a','2025-02-11','a','2025-02-11','2025-02-11',NULL,'a','2025-02-11','Yes','2025-02-03 22:29:33'),(19,15,5,'Yes',NULL,NULL,NULL,NULL,'2025-02-11','22:31:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-11','No','No','No',NULL,'a','2025-02-11','a','2025-02-11','2025-02-11',NULL,'a','2025-02-11','Yes','2025-02-03 22:30:36'),(20,15,5,'Yes',NULL,NULL,NULL,NULL,'2025-02-11','22:31:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-11','No','No','No',NULL,'a','2025-02-11','a','2025-02-11','2025-02-11',NULL,'a','2025-02-11','Yes','2025-02-03 22:35:58'),(21,15,5,'Yes',NULL,NULL,NULL,NULL,'2025-02-10','22:31:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-10','No','No','No',NULL,'a','2025-02-10','a','2025-02-10','2025-02-10',NULL,'a','2025-02-10','Yes','2025-02-03 22:42:29'),(22,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-07','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-07','Yes','Yes','Yes','sdf','a','2025-02-07','a','2025-02-07','2025-02-07','az','a','2025-02-07','Yes','2025-02-04 01:41:06'),(23,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-06','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-06','Yes','Yes','Yes','sdf','a','2025-02-06','a','2025-02-06','2025-02-06','az','a','2025-02-06','Yes','2025-02-04 02:00:00'),(24,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-07','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-07','Yes','Yes','Yes','sdf','a','2025-02-07','a','2025-02-07','2025-02-07','az','a','2025-02-07','Yes','2025-02-04 02:01:20'),(25,15,5,'Yes',NULL,NULL,NULL,NULL,'2025-02-09','22:31:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-09','No','No','No',NULL,'a','2025-02-09','a','2025-02-09','2025-02-09',NULL,'a','2025-02-09','Yes','2025-02-04 02:41:33'),(26,15,5,'Yes',NULL,NULL,NULL,NULL,'2025-02-03','22:31:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-02-03','No','No','No',NULL,'a','2025-02-03','a','2025-02-03','2025-02-03',NULL,'a','2025-02-03','Yes','2025-02-04 02:42:39'),(27,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-07','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-07','Yes','Yes','Yes','sdf','a','2025-02-07','a','2025-02-07','2025-02-07','az','a','2025-02-07','Yes','2025-02-04 19:05:40'),(28,16,5,'Yes','Near Miss',NULL,'a','a','2025-02-08','18:20:00','a','Female','z','a','s','z','z','xz','s','z','s','2025-02-08','Yes','Yes','Yes','sdf','a','2025-02-08','a','2025-02-08','2025-02-08','az','a','2025-02-08','Yes','2025-02-04 19:07:11'),(29,12,8,'Yes',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'No','No','No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Yes','2025-02-05 14:24:54');
/*!40000 ALTER TABLE `activity_incident_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_objectives`
--

DROP TABLE IF EXISTS `activity_objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_objectives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `objective_id` int NOT NULL,
  `amount` int DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateEnd` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `objective_id` (`objective_id`),
  CONSTRAINT `activity_objectives_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`),
  CONSTRAINT `activity_objectives_ibfk_2` FOREIGN KEY (`objective_id`) REFERENCES `objectives` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_objectives`
--

LOCK TABLES `activity_objectives` WRITE;
/*!40000 ALTER TABLE `activity_objectives` DISABLE KEYS */;
INSERT INTO `activity_objectives` VALUES (1,1,1,NULL,NULL,NULL),(2,1,2,NULL,NULL,NULL),(3,1,1,NULL,NULL,NULL),(4,1,2,NULL,NULL,NULL),(5,1,1,NULL,NULL,NULL),(6,1,2,NULL,NULL,NULL),(8,2,1,NULL,NULL,NULL),(9,2,2,NULL,NULL,NULL),(10,2,1,NULL,NULL,NULL),(11,2,2,NULL,NULL,NULL),(12,2,1,NULL,NULL,NULL),(13,2,2,NULL,NULL,NULL),(15,3,5,NULL,NULL,NULL),(16,3,9,NULL,NULL,NULL),(17,3,12,NULL,NULL,NULL),(18,4,5,NULL,NULL,NULL),(19,4,9,NULL,NULL,NULL),(20,4,12,NULL,NULL,NULL),(21,4,2,NULL,NULL,NULL),(25,5,5,NULL,NULL,NULL),(26,5,12,NULL,NULL,NULL),(27,5,2,NULL,NULL,NULL),(28,6,5,NULL,NULL,NULL),(29,6,12,NULL,NULL,NULL),(30,6,2,NULL,NULL,NULL),(31,7,5,NULL,NULL,NULL),(32,7,12,NULL,NULL,NULL),(33,7,2,NULL,NULL,NULL),(34,8,5,NULL,NULL,NULL),(35,8,12,NULL,NULL,NULL),(36,8,2,NULL,NULL,NULL),(37,9,5,NULL,NULL,NULL),(38,9,12,NULL,NULL,NULL),(39,9,2,NULL,NULL,NULL),(40,10,5,NULL,NULL,NULL),(41,10,12,NULL,NULL,NULL),(42,10,2,NULL,NULL,NULL),(43,11,5,NULL,NULL,NULL),(44,11,9,NULL,NULL,NULL),(45,11,12,NULL,NULL,NULL),(46,12,5,3,NULL,NULL),(47,12,9,4,NULL,NULL),(48,12,12,550,NULL,NULL),(49,13,5,56,NULL,NULL),(50,13,9,NULL,NULL,NULL),(51,13,12,NULL,NULL,NULL),(52,14,5,15,NULL,NULL),(53,14,9,NULL,NULL,NULL),(54,14,12,NULL,NULL,NULL),(55,15,5,55,NULL,NULL),(56,15,9,NULL,NULL,NULL),(57,15,12,NULL,NULL,NULL),(58,16,5,9,NULL,NULL),(59,16,9,333,NULL,NULL),(60,16,12,NULL,NULL,NULL),(61,17,5,44,NULL,NULL),(62,17,9,5,NULL,NULL),(63,17,12,700,NULL,NULL),(64,7,11,NULL,NULL,NULL),(65,12,2,NULL,NULL,NULL),(66,12,8,NULL,NULL,NULL),(67,12,11,NULL,NULL,NULL),(68,6,11,NULL,NULL,NULL),(69,5,11,NULL,NULL,NULL),(70,11,11,NULL,NULL,NULL);
/*!40000 ALTER TABLE `activity_objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_people_hazards`
--

DROP TABLE IF EXISTS `activity_people_hazards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_people_hazards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hazard_description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_people_hazards`
--

LOCK TABLES `activity_people_hazards` WRITE;
/*!40000 ALTER TABLE `activity_people_hazards` DISABLE KEYS */;
INSERT INTO `activity_people_hazards` VALUES (1,'Fatigue'),(2,'Lack of Training'),(3,'Heavy Lifting');
/*!40000 ALTER TABLE `activity_people_hazards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_predator`
--

DROP TABLE IF EXISTS `activity_predator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_predator` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `predator_id` int NOT NULL,
  `measurement` int DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateEnd` date DEFAULT NULL,
  `rats` int DEFAULT '0',
  `possums` int DEFAULT '0',
  `mustelids` int DEFAULT '0',
  `hedgehogs` int DEFAULT '0',
  `others` int DEFAULT '0',
  `others_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `predator_id` (`predator_id`),
  CONSTRAINT `activity_predator_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_predator_ibfk_2` FOREIGN KEY (`predator_id`) REFERENCES `predator` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_predator`
--

LOCK TABLES `activity_predator` WRITE;
/*!40000 ALTER TABLE `activity_predator` DISABLE KEYS */;
INSERT INTO `activity_predator` VALUES (1,3,3,0,'2025-01-07','2025-01-15',0,1,1,1,1,'cat'),(7,5,1,3,NULL,NULL,0,0,0,0,0,''),(9,11,3,NULL,NULL,NULL,4,2,2,3,2,'Rab'),(10,11,2,8,NULL,NULL,0,0,0,0,0,''),(11,11,1,8,NULL,NULL,0,0,0,0,0,''),(13,12,2,33,NULL,NULL,0,0,0,0,0,''),(14,12,3,NULL,NULL,NULL,0,0,0,0,2,'rabbit'),(15,12,1,3,NULL,NULL,0,0,0,0,0,''),(16,12,1,5,NULL,NULL,0,0,0,0,0,''),(17,12,1,8,NULL,NULL,0,0,0,0,0,''),(18,11,3,NULL,NULL,NULL,0,0,0,0,1,'ro'),(19,11,1,4,NULL,NULL,0,0,0,0,0,''),(20,11,1,7,NULL,NULL,0,0,0,0,0,''),(23,11,2,3,NULL,NULL,0,0,0,0,0,''),(24,11,3,NULL,NULL,NULL,0,0,0,0,9,'q'),(26,7,1,1,NULL,NULL,0,0,0,0,0,''),(27,6,2,5,NULL,NULL,0,0,0,0,0,''),(28,6,3,NULL,NULL,NULL,0,2,3,0,2,'cat');
/*!40000 ALTER TABLE `activity_predator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_risk_controls`
--

DROP TABLE IF EXISTS `activity_risk_controls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_risk_controls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `risk_id` int NOT NULL,
  `risk_control_id` int NOT NULL,
  `is_checked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `risk_id` (`risk_id`),
  KEY `risk_control_id` (`risk_control_id`),
  CONSTRAINT `activity_risk_controls_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_risk_controls_ibfk_2` FOREIGN KEY (`risk_id`) REFERENCES `risks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_risk_controls_ibfk_3` FOREIGN KEY (`risk_control_id`) REFERENCES `risk_controls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_risk_controls`
--

LOCK TABLES `activity_risk_controls` WRITE;
/*!40000 ALTER TABLE `activity_risk_controls` DISABLE KEYS */;
INSERT INTO `activity_risk_controls` VALUES (20,17,59,764,1,'2025-02-03 20:45:15'),(24,15,61,776,1,'2025-02-03 23:31:48'),(25,15,61,778,1,'2025-02-03 23:31:48'),(26,15,61,782,1,'2025-02-03 23:31:48'),(29,11,63,776,1,'2025-02-04 13:04:31'),(32,16,65,776,1,'2025-02-04 14:26:21'),(33,16,65,778,1,'2025-02-04 14:26:21'),(34,16,65,780,1,'2025-02-04 14:26:21'),(35,14,67,764,1,'2025-02-04 19:27:02'),(36,16,68,765,1,'2025-02-05 11:17:56');
/*!40000 ALTER TABLE `activity_risk_controls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_risk_titles`
--

DROP TABLE IF EXISTS `activity_risk_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_risk_titles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `risk_title_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `risk_title_id` (`risk_title_id`),
  CONSTRAINT `activity_risk_titles_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_risk_titles_ibfk_2` FOREIGN KEY (`risk_title_id`) REFERENCES `risk_titles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_risk_titles`
--

LOCK TABLES `activity_risk_titles` WRITE;
/*!40000 ALTER TABLE `activity_risk_titles` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_risk_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_risks`
--

DROP TABLE IF EXISTS `activity_risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_risks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `risk_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `risk_id` (`risk_id`),
  CONSTRAINT `activity_risks_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_risks_ibfk_2` FOREIGN KEY (`risk_id`) REFERENCES `risks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_risks`
--

LOCK TABLES `activity_risks` WRITE;
/*!40000 ALTER TABLE `activity_risks` DISABLE KEYS */;
INSERT INTO `activity_risks` VALUES (1,1,4,'2025-01-28 20:02:08'),(2,1,5,'2025-01-28 20:02:57'),(3,3,6,'2025-01-29 16:29:01'),(4,2,7,'2025-01-29 22:03:45'),(7,4,10,'2025-01-30 10:51:57'),(8,4,11,'2025-01-30 10:53:17'),(9,4,12,'2025-01-30 10:54:00'),(10,4,13,'2025-01-30 10:55:05'),(11,3,14,'2025-01-30 11:12:27'),(23,8,26,'2025-01-31 19:08:35'),(24,8,27,'2025-01-31 19:10:34'),(25,8,28,'2025-01-31 19:10:38'),(26,8,29,'2025-01-31 19:10:39'),(51,5,54,'2025-02-03 13:39:12'),(52,5,55,'2025-02-03 13:41:03'),(55,15,58,'2025-02-03 20:21:33'),(56,17,59,'2025-02-03 20:45:15'),(57,17,60,'2025-02-03 20:53:32'),(58,15,61,'2025-02-03 23:31:47'),(59,15,62,'2025-02-04 00:12:27'),(60,11,63,'2025-02-04 13:04:30'),(62,16,65,'2025-02-04 14:26:21'),(64,14,67,'2025-02-04 19:27:02'),(65,16,68,'2025-02-05 11:17:56');
/*!40000 ALTER TABLE `activity_risks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_site_hazards`
--

DROP TABLE IF EXISTS `activity_site_hazards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_site_hazards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `site_hazard_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `site_hazard_id` (`site_hazard_id`),
  CONSTRAINT `activity_site_hazards_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_site_hazards_ibfk_2` FOREIGN KEY (`site_hazard_id`) REFERENCES `site_hazards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_site_hazards`
--

LOCK TABLES `activity_site_hazards` WRITE;
/*!40000 ALTER TABLE `activity_site_hazards` DISABLE KEYS */;
INSERT INTO `activity_site_hazards` VALUES (1,1,2),(2,3,3),(4,4,3),(8,2,3),(13,8,3),(20,14,1),(24,5,1),(27,11,3),(28,16,2);
/*!40000 ALTER TABLE `activity_site_hazards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_staff`
--

DROP TABLE IF EXISTS `activity_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `staff_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `activity_staff_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_staff_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_staff`
--

LOCK TABLES `activity_staff` WRITE;
/*!40000 ALTER TABLE `activity_staff` DISABLE KEYS */;
INSERT INTO `activity_staff` VALUES (1,1,1),(2,1,7),(3,1,4),(4,3,2),(6,3,4),(7,14,7),(8,5,5),(9,5,2),(10,13,2),(11,13,5),(12,13,8);
/*!40000 ALTER TABLE `activity_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_volunteer`
--

DROP TABLE IF EXISTS `activity_volunteer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_volunteer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `volunteer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `activity_volunteer_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_volunteer_ibfk_2` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_volunteer`
--

LOCK TABLES `activity_volunteer` WRITE;
/*!40000 ALTER TABLE `activity_volunteer` DISABLE KEYS */;
INSERT INTO `activity_volunteer` VALUES (1,1,2),(2,1,3),(3,3,1),(6,14,3),(7,16,2),(9,16,4),(11,5,3),(12,13,2);
/*!40000 ALTER TABLE `activity_volunteer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklist`
--

DROP TABLE IF EXISTS `checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklist`
--

LOCK TABLES `checklist` WRITE;
/*!40000 ALTER TABLE `checklist` DISABLE KEYS */;
INSERT INTO `checklist` VALUES (1,'All vehicle/driver licences/rego current'),(2,'Pre-existing medical conditions checked'),(3,'Weather checked, appropriate clothing worn/available'),(4,'Risk assessment checked and shared completed'),(5,'Correct PPE available'),(6,'First Aid kit stocked and on site'),(7,'First Aider present'),(8,'Project and safety induction completed');
/*!40000 ALTER TABLE `checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objectives`
--

DROP TABLE IF EXISTS `objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objectives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `measurement` varchar(255) DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateEnd` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objectives`
--

LOCK TABLES `objectives` WRITE;
/*!40000 ALTER TABLE `objectives` DISABLE KEYS */;
INSERT INTO `objectives` VALUES (1,'Community Participation','# of participants',NULL,NULL),(2,'Weed Treatment','#m2',NULL,NULL),(3,'Debris Removal(Weight)','# tonnes',NULL,NULL),(4,'Fencing(m)','# metres',NULL,NULL),(5,'Plant Propagation(Number)','# of plants',NULL,NULL),(6,'Revegetation(Number)','# of plants',NULL,NULL),(7,'Seed Collection kg','# kg',NULL,NULL),(8,'Debris Removal(Area)','#(Area)',NULL,NULL),(9,'Revegetation(Area)','#(Area)',NULL,NULL),(10,'Site Preparation(Treatment)','#(Treatment)',NULL,NULL),(11,'Establishing Predator Control','# trap numbers',NULL,NULL),(12,'Walking track building','metres',NULL,NULL),(13,'Walking track maintenance','metres',NULL,NULL),(14,'Species monitoring','number of species',NULL,NULL),(15,'Tree Releasing','sq. metres',NULL,NULL),(16,'new one','# m2',NULL,NULL),(19,'rrrrr','m2',NULL,NULL),(20,'new','m2',NULL,NULL),(21,'new objectives2','#kgs',NULL,NULL);
/*!40000 ALTER TABLE `objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predator`
--

DROP TABLE IF EXISTS `predator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `predator` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_type` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predator`
--

LOCK TABLES `predator` WRITE;
/*!40000 ALTER TABLE `predator` DISABLE KEYS */;
INSERT INTO `predator` VALUES (1,'Traps established'),(2,'Traps checked'),(3,'Catches');
/*!40000 ALTER TABLE `predator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_activity_people_hazards`
--

DROP TABLE IF EXISTS `project_activity_people_hazards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_activity_people_hazards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `activity_people_hazard_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `activity_people_hazard_id` (`activity_people_hazard_id`),
  CONSTRAINT `project_activity_people_hazards_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_activity_people_hazards_ibfk_2` FOREIGN KEY (`activity_people_hazard_id`) REFERENCES `activity_people_hazards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_activity_people_hazards`
--

LOCK TABLES `project_activity_people_hazards` WRITE;
/*!40000 ALTER TABLE `project_activity_people_hazards` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_activity_people_hazards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_checklist`
--

DROP TABLE IF EXISTS `project_checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_checklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `checklist_id` int NOT NULL,
  `is_checked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `checklist_id` (`checklist_id`),
  CONSTRAINT `project_checklist_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_checklist_ibfk_2` FOREIGN KEY (`checklist_id`) REFERENCES `checklist` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_checklist`
--

LOCK TABLES `project_checklist` WRITE;
/*!40000 ALTER TABLE `project_checklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_objectives`
--

DROP TABLE IF EXISTS `project_objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_objectives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `objective_id` int NOT NULL,
  `amount` int DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateEnd` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `objective_id` (`objective_id`),
  CONSTRAINT `project_objectives_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_objectives_ibfk_2` FOREIGN KEY (`objective_id`) REFERENCES `objectives` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_objectives`
--

LOCK TABLES `project_objectives` WRITE;
/*!40000 ALTER TABLE `project_objectives` DISABLE KEYS */;
INSERT INTO `project_objectives` VALUES (58,4,5,NULL,NULL,NULL),(59,4,9,NULL,NULL,NULL),(60,4,12,NULL,NULL,NULL),(61,4,2,NULL,NULL,NULL),(62,5,5,80,NULL,NULL),(63,5,9,9,NULL,NULL),(64,5,12,3,NULL,NULL),(102,6,5,NULL,NULL,NULL),(103,6,12,NULL,NULL,NULL),(104,6,2,NULL,NULL,NULL),(117,8,2,NULL,NULL,NULL),(118,8,8,NULL,NULL,NULL),(119,8,5,NULL,NULL,NULL),(120,8,11,NULL,NULL,NULL),(126,12,4,NULL,NULL,NULL),(127,12,9,NULL,NULL,NULL),(128,12,12,NULL,NULL,NULL),(132,7,5,5,NULL,NULL),(133,7,12,NULL,NULL,NULL),(134,7,11,NULL,NULL,NULL),(171,13,2,NULL,NULL,NULL),(172,13,5,NULL,NULL,NULL),(173,13,8,NULL,NULL,NULL),(174,14,1,NULL,NULL,NULL),(175,14,7,NULL,NULL,NULL),(176,14,10,NULL,NULL,NULL),(180,15,4,NULL,NULL,NULL),(181,15,6,NULL,NULL,NULL),(182,15,9,NULL,NULL,NULL),(183,16,4,NULL,NULL,NULL),(184,16,6,NULL,NULL,NULL),(185,16,9,NULL,NULL,NULL),(189,17,2,NULL,NULL,NULL),(190,17,6,NULL,NULL,NULL),(191,17,11,NULL,NULL,NULL),(192,18,2,NULL,NULL,NULL),(193,18,6,NULL,NULL,NULL),(194,18,11,NULL,NULL,NULL),(195,19,5,NULL,NULL,NULL),(196,19,8,NULL,NULL,NULL),(197,19,11,NULL,NULL,NULL),(198,20,5,NULL,NULL,NULL),(199,20,8,NULL,NULL,NULL),(200,20,11,NULL,NULL,NULL),(201,21,3,NULL,NULL,NULL),(202,21,7,NULL,NULL,NULL),(203,21,9,NULL,NULL,NULL),(204,21,11,NULL,NULL,NULL),(205,3,2,NULL,NULL,NULL),(206,3,6,NULL,NULL,NULL),(207,3,10,NULL,NULL,NULL),(208,3,15,NULL,NULL,NULL);
/*!40000 ALTER TABLE `project_objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_predator`
--

DROP TABLE IF EXISTS `project_predator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_predator` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `predator_id` int NOT NULL,
  `measurement` int DEFAULT NULL,
  `dateStart` date DEFAULT NULL,
  `dateEnd` date DEFAULT NULL,
  `rats` int DEFAULT '0',
  `possums` int DEFAULT '0',
  `mustelids` int DEFAULT '0',
  `hedgehogs` int DEFAULT '0',
  `others` int DEFAULT '0',
  `others_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `predator_id` (`predator_id`),
  CONSTRAINT `project_predator_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_predator_ibfk_2` FOREIGN KEY (`predator_id`) REFERENCES `predator` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_predator`
--

LOCK TABLES `project_predator` WRITE;
/*!40000 ALTER TABLE `project_predator` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_predator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_risk_controls`
--

DROP TABLE IF EXISTS `project_risk_controls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_risk_controls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `risk_control_id` int NOT NULL,
  `is_checked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `risk_control_id` (`risk_control_id`),
  CONSTRAINT `project_risk_controls_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_risk_controls_ibfk_2` FOREIGN KEY (`risk_control_id`) REFERENCES `risk_controls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_risk_controls`
--

LOCK TABLES `project_risk_controls` WRITE;
/*!40000 ALTER TABLE `project_risk_controls` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_risk_controls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_risk_titles`
--

DROP TABLE IF EXISTS `project_risk_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_risk_titles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `risk_title_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `risk_title_id` (`risk_title_id`),
  CONSTRAINT `project_risk_titles_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_risk_titles_ibfk_2` FOREIGN KEY (`risk_title_id`) REFERENCES `risk_titles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_risk_titles`
--

LOCK TABLES `project_risk_titles` WRITE;
/*!40000 ALTER TABLE `project_risk_titles` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_risk_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_risks`
--

DROP TABLE IF EXISTS `project_risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_risks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `risk_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `risk_id` (`risk_id`),
  CONSTRAINT `project_risks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_risks_ibfk_2` FOREIGN KEY (`risk_id`) REFERENCES `risks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_risks`
--

LOCK TABLES `project_risks` WRITE;
/*!40000 ALTER TABLE `project_risks` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_risks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_site_hazards`
--

DROP TABLE IF EXISTS `project_site_hazards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_site_hazards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `site_hazard_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `site_hazard_id` (`site_hazard_id`),
  CONSTRAINT `project_site_hazards_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_site_hazards_ibfk_2` FOREIGN KEY (`site_hazard_id`) REFERENCES `site_hazards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_site_hazards`
--

LOCK TABLES `project_site_hazards` WRITE;
/*!40000 ALTER TABLE `project_site_hazards` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_site_hazards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_volunteer`
--

DROP TABLE IF EXISTS `project_volunteer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_volunteer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `volunteer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `project_volunteer_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_volunteer_ibfk_2` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_volunteer`
--

LOCK TABLES `project_volunteer` WRITE;
/*!40000 ALTER TABLE `project_volunteer` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_volunteer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `status` enum('inprogress','completed','onhold','archived') NOT NULL DEFAULT 'inprogress',
  `createdBy` int DEFAULT NULL,
  `emergencyServices` varchar(255) DEFAULT '111 will contact all emergency services',
  `localMedicalCenterAddress` varchar(255) DEFAULT NULL,
  `localMedicalCenterPhone` varchar(20) DEFAULT NULL,
  `localHospital` varchar(255) DEFAULT NULL,
  `primaryContactName` varchar(100) DEFAULT NULL,
  `primaryContactPhone` varchar(20) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `inductionFileUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `staffs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (3,'River Restoration-1','123 River St, Auckland, NZ','2024-12-31','inprogress',NULL,'111 will contact all emergency services','Rose Medical Center, 456 Medical Rd','091234567','Auckland City Hospital, 789 Hospital Way','John Manager','0279991234','server/uploads/project 2-1738047575734.png',NULL,'2025-01-28 19:59:35'),(4,'testing4','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2024-12-30','onhold',NULL,'111 will contact all emergency services','medical','1234567','','Saba','22222',NULL,NULL,'2025-01-28 22:40:00'),(5,'testing5','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2024-12-30','archived',NULL,'111 will contact all emergency services','medical','1234567','','Saba','22222',NULL,NULL,'2025-01-28 22:40:33'),(6,'testing55','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2024-12-31','onhold',NULL,'111 will contact all emergency services','medical','1234567','','Saba','22222',NULL,NULL,'2025-01-30 12:07:15'),(7,'testing6','Manukau City Centre, Auckland, New Zealand','2024-12-31','onhold',NULL,'111 will contact all emergency services','medical','1234567','','Saba','22222',NULL,NULL,'2025-01-30 12:08:50'),(8,'testing6-1','Manukau City Centre, Auckland, New Zealand','2024-12-31','completed',NULL,'111 will contact all emergency services','medical','1234567','','Saba','22222',NULL,NULL,'2025-01-31 22:08:13'),(12,'pro3','Wellington, New Zealand','2025-02-13','inprogress',NULL,'111 will contact all emergency services','q','2','','helya2','2',NULL,NULL,'2025-02-01 18:54:18'),(13,'prodate2','Takapuna, Auckland, New Zealand','2024-12-31','inprogress',NULL,'111 will contact all emergency services','q','2','','Sue','2',NULL,NULL,'2025-02-01 20:44:06'),(14,'testing','Motions Rd, Western Springs, Auckland 1022, New Zealand','2025-02-07','completed',NULL,'111 will contact all emergency services','e','2','','Sisi','2',NULL,NULL,'2025-02-01 23:01:32'),(15,'protestdate','Onewa Road, Birkenhead, Auckland, New Zealand','2025-02-14','completed',NULL,'111 will contact all emergency services','ww','2','','yalan','2',NULL,NULL,'2025-02-02 13:53:52'),(16,'protestdate-2','Onewa Road, Birkenhead, Auckland, New Zealand','2025-02-14','completed',NULL,'111 will contact all emergency services','ww','2','','yalan','2',NULL,NULL,'2025-02-02 13:54:33'),(17,'testing11','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2025-02-22','completed',NULL,'111 will contact all emergency services','ww','2','','ww','2',NULL,NULL,'2025-02-02 14:48:50'),(18,'testing11-2','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2025-02-22','completed',NULL,'111 will contact all emergency services','ww','2','','ww','2',NULL,NULL,'2025-02-02 14:50:14'),(19,'test 3','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2025-02-14','completed',NULL,'111 will contact all emergency services','w','4','','s','4',NULL,NULL,'2025-02-03 10:22:47'),(20,'test 3-2','Ray Emery Drive, Māngere, Auckland 2022, New Zealand','2025-02-14','completed',NULL,'111 will contact all emergency services','w','4','','s','4',NULL,NULL,'2025-02-03 10:23:18'),(21,'project1','Auckland Airport, Auckland 2022, New Zealand','2025-02-05','inprogress',NULL,'111 will contact all emergency services','w','33','','Bita','2222',NULL,NULL,'2025-02-03 22:13:09');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `objective_id` int NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `summary_json` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `objective_id` (`objective_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`objective_id`) REFERENCES `objectives` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_controls`
--

DROP TABLE IF EXISTS `risk_controls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_controls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `risk_title_id` int NOT NULL,
  `control_text` text NOT NULL,
  `isReadOnly` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `risk_title_id` (`risk_title_id`),
  CONSTRAINT `risk_controls_ibfk_1` FOREIGN KEY (`risk_title_id`) REFERENCES `risk_titles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1085 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_controls`
--

LOCK TABLES `risk_controls` WRITE;
/*!40000 ALTER TABLE `risk_controls` DISABLE KEYS */;
INSERT INTO `risk_controls` VALUES (745,1,'Explain and demonstrate how to use, carry and store tools correctly.',1,'2025-02-03 20:17:41'),(746,1,'Do not wear jewellery that may become entangled.',1,'2025-02-03 20:17:41'),(747,1,'Maintain strict supervision.',1,'2025-02-03 20:17:41'),(748,1,'Use and maintain tools in accordance with manufacturer specifications.',1,'2025-02-03 20:17:41'),(749,1,'Specify and maintain a safe buffer zone around users.',1,'2025-02-03 20:17:41'),(750,1,'Ensure all equipment are in a safe working condition.',1,'2025-02-03 20:17:41'),(751,1,'Check for broken or cracked components or switches.',1,'2025-02-03 20:17:41'),(752,1,'Emergency shutdown procedures in place.',1,'2025-02-03 20:17:41'),(753,1,'Check that protective guards on tools are attached and effective.',1,'2025-02-03 20:17:41'),(754,1,'Clear trip hazards from the work site.',1,'2025-02-03 20:17:41'),(755,1,'Check team members have hair tied back and clothing tucked in, including drawstrings on jackets, hats, etc.',1,'2025-02-03 20:17:41'),(756,1,'Wear appropriate PPE as recommended by the manufacturer e.g. eye and ear protection, safety boots.',1,'2025-02-03 20:17:41'),(757,1,'Work with project partner/landholder to identify and isolate any areas that contain material suspected as being asbestos (before the project starts).',1,'2025-02-03 20:17:41'),(758,1,'Do not work in areas contaminated by asbestos.',1,'2025-02-03 20:17:41'),(759,1,'Volunteers to immediately notify supervisor if they find material that may contain asbestos.',1,'2025-02-03 20:17:41'),(760,1,'Do not remove or handle any material that may contain asbestos.',1,'2025-02-03 20:17:41'),(761,1,'Do not disturb soil or any other material that may contain asbestos.',1,'2025-02-03 20:17:41'),(762,1,'If you suspect asbestos, use flagging tape to cordon off the area, record the location (site name, description, !at/longs) and work in a different area.',1,'2025-02-03 20:17:41'),(763,1,'Team Leader to notify Regional Manager immediately upon finding suspected asbestos containing material.',1,'2025-02-03 20:17:41'),(764,2,'ID and redeploy people with known allergies.',1,'2025-02-03 20:17:41'),(765,2,'Visually inspect site for insect/ spider activity.',1,'2025-02-03 20:17:41'),(766,2,'Mark and avoid insect nests.',1,'2025-02-03 20:17:41'),(767,2,'Wear PPE; Long sleeves & pants, gloves, enclosed shoes and hat.',1,'2025-02-03 20:17:41'),(768,2,'Provide and use insect repellent.',1,'2025-02-03 20:17:41'),(776,4,'Ensure that all team members know the boundaries of the survey area and remain within them at all times.',1,'2025-02-03 20:17:41'),(777,4,'Set times at which teams must return or report to the supervisor.',1,'2025-02-03 20:17:41'),(778,4,'Anyone lost should find nearest shelter & use distress signal (3 whistle blasts).',1,'2025-02-03 20:17:41'),(779,4,'Instruct that any team member who becomes lost should find the nearest shelter and remain there while using an agreed distress signal eg. three whistle blasts.',1,'2025-02-03 20:17:41'),(780,4,'Ensure that all team members have means of communicating an emergency signal (eg: whistle, radios) and fully understand the signals to be used.',1,'2025-02-03 20:17:41'),(781,4,'If the survey involves collecting seats, ensure that this is done hygienically eg. by using gloves, tongs etc.',1,'2025-02-03 20:17:41'),(782,4,'Work in pairs as a minimum group size.',1,'2025-02-03 20:17:41'),(783,4,'Wear boots that are suitable for walking, and sufficiently sturdy for the terrain.',1,'2025-02-03 20:17:41'),(803,7,'Read, retain and comply with the relevant Material Safety Data Sheet (MSDS).',1,'2025-02-03 20:17:41'),(804,7,'Check that there are no leaks in containers, and that spray equipment is operating correctly.',1,'2025-02-03 20:17:41'),(805,7,'Rotate tasks to avoid prolonged periods of exposure; specify frequency of rotations.',1,'2025-02-03 20:17:41'),(806,7,'Explain and demonstrate how to use, carry and store correctly.',1,'2025-02-03 20:17:41'),(807,7,'Specify and maintain safe working distance to avoid splash or spray drift contamination and take account of wind (spray drift) direction.',1,'2025-02-03 20:17:41'),(808,7,'Provide adequate washing facilities as directed by the MSDS.',1,'2025-02-03 20:17:41'),(809,7,'Wear appropriate PPE as advised on the MSDS. (Note that the use of certain PPE may accelerate the onset of heat stress.)',1,'2025-02-03 20:17:41'),(810,8,'Use tongs to pick up sharps',1,'2025-02-03 20:17:41'),(811,8,'Determine a search strategy i.e. gain local knowledge of area, conduct a visual inspection of the site and flag any sharps for collection, minimise the number of persons involved in a search.',1,'2025-02-03 20:17:41'),(812,8,'Rake through known areas of disposal.',1,'2025-02-03 20:17:41'),(813,8,'Maintain a safe working distance of at least two metres to avoid the inadvertent scratching or spiking of other team members.',1,'2025-02-03 20:17:41'),(814,8,'Provide soap and water on site.',1,'2025-02-03 20:17:41'),(815,8,'Withdraw team if necessary to allow for professional removal of sharps.',1,'2025-02-03 20:17:41'),(816,8,'Put all sharps in approved sharps containers for disposal. Disposal to be in accordance with local health authority/council regulations.',1,'2025-02-03 20:17:41'),(817,8,'Wear gloves, sturdy footwear and high visibility vest. Eye protection may also be necessary.',1,'2025-02-03 20:17:41'),(818,9,'Arrange delivery of materials as near to fencing site as possible ie. minimise the need for carrying.',1,'2025-02-03 20:17:41'),(819,9,'Use only approved methods of straining wire with a proper fencing strainer. Do not use a vehicle to strain wire.',1,'2025-02-03 20:17:41'),(820,9,'Keep team members, who are not directly involved, well clear of any unsecured wire under tension.',1,'2025-02-03 20:17:41'),(821,9,'Demonstrate correct use of picket rammers, with emphasis on head, eye, hearing and hand safety.',1,'2025-02-03 20:17:41'),(822,9,'Do not raise the barrel of the rammer clear of the picket head.',1,'2025-02-03 20:17:41'),(823,9,'Specify and maintain safe working space between team members, especially when digging post holes or ramming the base of posts.',1,'2025-02-03 20:17:41'),(824,9,'Keep the work site clear of trip hazards such as posts, wire off-cuts, stones, tools etc.',1,'2025-02-03 20:17:41'),(825,9,'Wear gloves and eye protection whenever working with, or in close proximity to, wire that is coiled or under tension. Gloves should have gauntlets that protect the wrists when handling barbed wire.',1,'2025-02-03 20:17:41'),(826,9,'Wear gloves when handling chemically treated posts.',1,'2025-02-03 20:17:41'),(827,10,'Ensure adequate washing facilities are available and are used by team members.',1,'2025-02-03 20:17:41'),(828,10,'Look carefully at litter items or piles that might be a refuge for snakes or spiders.',1,'2025-02-03 20:17:41'),(829,10,'Check objects for spikes or sharp edges.',1,'2025-02-03 20:17:41'),(830,10,'Use tongs to pick up any objects that are known, or suspected, to be dangerous eg. syringes.',1,'2025-02-03 20:17:41'),(831,10,'Place any syringes in a proper sharps container.',1,'2025-02-03 20:17:41'),(832,10,'Seek assistance when lifting heavy objects.',1,'2025-02-03 20:17:41'),(833,10,'Wear gloves and eye protection when handling litter.',1,'2025-02-03 20:17:41'),(834,10,'Place any glass or other small sharp objects on a bucket or other hard sided container.',1,'2025-02-03 20:17:41'),(835,11,'Gentle warm up stretches prior to starting task/activity.',1,'2025-02-03 20:17:41'),(836,11,'Use mechanical aids.',1,'2025-02-03 20:17:41'),(837,11,'Set weight limits based on load terrain and people.',1,'2025-02-03 20:17:41'),(838,11,'Eliminate or limit twisting and over-reaching.',1,'2025-02-03 20:17:41'),(839,11,'Use 2 person lift where necessary.',1,'2025-02-03 20:17:41'),(840,11,'Rotate tasks.',1,'2025-02-03 20:17:41'),(841,11,'Maintain and check equipment condition.',1,'2025-02-03 20:17:41'),(842,11,'Team Leader/Project Coord to demonstrate correct technique.',1,'2025-02-03 20:17:41'),(843,11,'Direct supervision provided by Team Leader/Project Coord.',1,'2025-02-03 20:17:41'),(844,12,'Explain and demonstrate wheelbarrow loading and use.',1,'2025-02-03 20:17:41'),(845,12,'Explain and demonstrate correct techniques for using a rake.',1,'2025-02-03 20:17:41'),(846,12,'Explain and demonstrate correct use of fork/shovel.',1,'2025-02-03 20:17:41'),(847,12,'Explain and demonstrate how to carry, put down and store the tools, giving consideration to both the users and the general public.',1,'2025-02-03 20:17:41'),(848,12,'Check that all tools are in good repair, and that there are no split handles or loose tool heads.',1,'2025-02-03 20:17:41'),(849,12,'Redeploy to other tasks (upwind), any person who has disclosed a pre-existing respiratory infection or allergy eg. Asthma.',1,'2025-02-03 20:17:41'),(850,12,'Damp down mulch before working with it.',1,'2025-02-03 20:17:41'),(851,12,'Maintain safe working distance of at least 3 metres.',1,'2025-02-03 20:17:41'),(852,12,'So far as possible, clear the area of any trip hazards.',1,'2025-02-03 20:17:41'),(862,14,'must be competent and confident in trap setting',1,'2025-02-03 20:17:41'),(863,14,'check weather before',1,'2025-02-03 20:17:41'),(864,14,'check all kit/tools on hand relevant to length of trap line; eg water',1,'2025-02-03 20:17:41'),(865,14,'advise ‘buddy’ of leaving and return',1,'2025-02-03 20:17:41'),(866,14,'wear disposable or washable gloves when handling traps/disposing of carcases',1,'2025-02-03 20:17:41'),(867,14,'tongs used for clearing /cleaning traps',1,'2025-02-03 20:17:41'),(868,14,'Use setting tools',1,'2025-02-03 20:17:41'),(869,14,'Carry hand sanitiser',1,'2025-02-03 20:17:41'),(870,14,'Wear high-vis vest -esp. if traps along road.',1,'2025-02-03 20:17:41'),(871,15,'Rotate tasks to guard against postural overuse injuries.',1,'2025-02-03 20:17:41'),(872,15,'Specify and maintain a safe working distance between team members.',1,'2025-02-03 20:17:41'),(873,15,'Explain and demonstrate tool use.',1,'2025-02-03 20:17:41'),(874,15,'Ensure not team members are working directly under others.',1,'2025-02-03 20:17:41'),(875,15,'Wear PPE including safety glasses, gloves, high vis vests and if required hard hats.',1,'2025-02-03 20:17:41'),(876,16,'Remove trip hazards.',1,'2025-02-03 20:17:41'),(877,16,'Mark trip hazards.',1,'2025-02-03 20:17:41'),(878,16,'Ensure appropriate footwear with grip worn.',1,'2025-02-03 20:17:41'),(879,16,'Establish paths across slopes.',1,'2025-02-03 20:17:41'),(880,16,'Do not carry loads that limit visibility.',1,'2025-02-03 20:17:41'),(881,16,'Station vehicle in location with good access.',1,'2025-02-03 20:17:41'),(882,16,'Direct supervision by Team Leader/Project Coard.',1,'2025-02-03 20:17:41'),(883,17,'ID team members in higher risk categories (diabetes, lung/kidney disease, open cuts) and deploy.',1,'2025-02-03 20:17:41'),(884,17,'Cover any minor cuts or scratches prior to work.',1,'2025-02-03 20:17:41'),(885,17,'Suppress dust and modify task to reduce dust.',1,'2025-02-03 20:17:41'),(886,17,'Provide washing facilities and wash areas of potential soil contact prior to eating and drinking.',1,'2025-02-03 20:17:41'),(887,17,'Wear PPE; Long sleeves & pant, enclosed shoes, hat (when outside), gloves (impervious if wet), safety glasses, dust masks (if large amounts of dust).',1,'2025-02-03 20:17:41'),(888,18,'Ensure that all team members know the boundaries of the survey area and remain within them at all times.',1,'2025-02-03 20:17:41'),(889,18,'Set times at which teams must return or report to the supervisor.',1,'2025-02-03 20:17:41'),(890,18,'Instruct that any team member who becomes lost should find the nearest shelter and remain there while using an agreed distress signal eg. three whistle blasts.',1,'2025-02-03 20:17:41'),(891,18,'Ensure that all team members have means of communicating an emergency signal (eg: whistle, radios) and fully understand the signals to be used.',1,'2025-02-03 20:17:41'),(892,18,'If the survey involves collecting seats, ensure that this is done hygienically eg. by using gloves, tongs etc.',1,'2025-02-03 20:17:41'),(893,18,'Work in pairs as a minimum group size.',1,'2025-02-03 20:17:41'),(894,18,'Wear boots that are suitable for walking, and sufficiently sturdy for the terrain.',1,'2025-02-03 20:17:41'),(895,19,'Arrange delivery of tools and materials so as to minimise distance over which things need to be carried.',1,'2025-02-03 20:17:41'),(896,19,'Encourage gentle warm up stretches before commencement and after breaks.',1,'2025-02-03 20:17:41'),(897,19,'Maintain tools in good condition.',1,'2025-02-03 20:17:41'),(898,19,'Maintain safe working distance of at least 3 metres.',1,'2025-02-03 20:17:41'),(899,19,'Arrange emergency communication and explain this to all team members.',1,'2025-02-03 20:17:41'),(900,19,'Rotate tasks even if team members are not experiencing discomfort.',1,'2025-02-03 20:17:41'),(901,19,'Wear appropriate PPE inc. high visibility vests, gloves, safety glasses.',1,'2025-02-03 20:17:41'),(902,19,'Ensure that boots are suitable for walking, and sufficiently sturdy for the terrain.',1,'2025-02-03 20:17:41'),(903,20,'Conduct a visual inspection of the site, and remove potential risks such as broken glass, wire etc.',1,'2025-02-03 20:17:41'),(904,20,'Use kneeling mats or padding if there is a danger of spike injuries from glass, stones etc.',1,'2025-02-03 20:17:41'),(905,20,'Rotate tasks, even if team members are not experiencing discomfort.',1,'2025-02-03 20:17:41'),(906,20,'Take regular breaks and encourage gentle stretching.',1,'2025-02-03 20:17:41'),(907,20,'Provide adequate hand washing facilities.',1,'2025-02-03 20:17:41'),(908,20,'Specify and maintain a safe working space between team members; usually two metres.',1,'2025-02-03 20:17:41'),(909,20,'Wear gloves when handling soil, and additional PPE as necessary.',1,'2025-02-03 20:17:41'),(910,21,'Use only when an alternate tool is not practicable (eg loppers, hand saws, secateurs or similar).',1,'2025-02-03 20:17:41'),(911,21,'Ensure machetes are kept sharp.',1,'2025-02-03 20:17:41'),(912,21,'Team leaders only to sharpen (sharpen away from blade).',1,'2025-02-03 20:17:41'),(913,21,'Ensure handle and wrist strap are securely fastened.',1,'2025-02-03 20:17:41'),(914,21,'Only assign machetes to volunteers who have previously demonstrated high levels of responsibility.',1,'2025-02-03 20:17:41'),(915,21,'Allow a maximum of four machetes to be used at any one time.',1,'2025-02-03 20:17:41'),(916,21,'Team Leader to maintain direct supervision.',1,'2025-02-03 20:17:41'),(917,21,'Demonstrate correct use, including appropriate cutting angle (to avoid blade bouncing off target) and safe working distance (5 metre buffer zone).',1,'2025-02-03 20:17:41'),(918,21,'Use only for cutting soft vegetation (small branches, vines, grasses etc) not hard wood.',1,'2025-02-03 20:17:41'),(919,21,'Ensure appropriate PPE is worn, including gloves, long pants, sturdy boots and shin pads.',1,'2025-02-03 20:17:41'),(920,21,'Rotate tasks or take regular breaks to maintain concentration and reduce repetitive strain injury.',1,'2025-02-03 20:17:41'),(921,21,'Cover blade with a sheath or split hose when not in use, and store in an appropriate place.',1,'2025-02-03 20:17:41'),(922,22,'Explain and demonstrate how to use, carry and store tools correctly.',1,'2025-02-03 20:17:41'),(923,22,'Maintain strict supervision.',1,'2025-02-03 20:17:41'),(924,22,'Use and maintain tools in accordance with manufacturer specifications.',1,'2025-02-03 20:17:41'),(925,22,'Specify and maintain a safe buffer zone around power tool users.',1,'2025-02-03 20:17:41'),(926,22,'Ensure all equipment and lead attachments have been tested and tagged and are in a safe working condition and protected from water.',1,'2025-02-03 20:17:41'),(927,22,'No broken plugs, sockets or switches.',1,'2025-02-03 20:17:41'),(928,22,'No frayed or damaged leads.',1,'2025-02-03 20:17:41'),(929,22,'Emergency shutdown procedures in place.',1,'2025-02-03 20:17:41'),(930,22,'Circuit breaker/safety switch installed and/or RCD used when operating tool.',1,'2025-02-03 20:17:41'),(931,22,'Start/stop switches clearly marked, in easy reach of operator.',1,'2025-02-03 20:17:41'),(932,22,'Check that protective guards on tools are attached and effective.',1,'2025-02-03 20:17:41'),(933,22,'Clear trip hazards from the work site.',1,'2025-02-03 20:17:41'),(934,22,'Position the generator, if used, in a dry, stable location and prevent access to it by unauthorised people.',1,'2025-02-03 20:17:41'),(935,22,'Check that the team members have hair tied back and clothing tucked in, including drawstrings on jackets, hats, etc.',1,'2025-02-03 20:17:41'),(936,22,'Wear appropriate PPE as recommended by the manufacturer eg. eye and ear protection, safety boots.',1,'2025-02-03 20:17:41'),(937,23,'Ensure that suitable work boots, with reinforced toes, are being worn.',1,'2025-02-03 20:17:41'),(938,23,'Encourage gentle warm up stretches before commencement and after breaks.',1,'2025-02-03 20:17:41'),(939,23,'Maintain safe working distance of at least 3 metres; for short handled tools (e.g. hammer), 2 metres.',1,'2025-02-03 20:17:41'),(940,23,'Explain and demonstrate how to use, carry and store tools correctly.',1,'2025-02-03 20:17:41'),(941,23,'Maintain tools in good condition.',1,'2025-02-03 20:17:41'),(942,23,'Establish a firm footing before swinging tools.',1,'2025-02-03 20:17:41'),(943,23,'Raise tools no more than shoulder height on back swing.',1,'2025-02-03 20:17:41'),(944,23,'Rotate tasks even if team members are not experiencing discomfort; specify rotation frequency.',1,'2025-02-03 20:17:41'),(945,23,'Adjust the duration of work periods to take account of the physical capacities of the team members.',1,'2025-02-03 20:17:41'),(946,23,'Wear appropriate PPE eg. high visibility vest, hard hat, glasses and gloves.',1,'2025-02-03 20:17:41'),(947,24,'Clear all exits so they are uncluttered and readily accessible.',1,'2025-02-03 20:17:41'),(948,24,'Inspect all gas and electrical appliances to ensure that they are in a safe, operational condition.',1,'2025-02-03 20:17:41'),(949,24,'Do not overload power points with too many appliances.',1,'2025-02-03 20:17:41'),(950,24,'Formulate a fire evacuation plan and communicate it to all team members.',1,'2025-02-03 20:17:41'),(951,24,'Remove any combustible materials that are stored near a possible fire source.',1,'2025-02-03 20:17:41'),(952,24,'Ensure backup (emergency) lighting is available (e.g. extra torches).',1,'2025-02-03 20:17:41'),(953,24,'Ensure that the CV \"No Smoking\" policy is enforced.',1,'2025-02-03 20:17:41'),(954,24,'Keep food storage and preparation areas, showers and toilets clean and hygienic.',1,'2025-02-03 20:17:41'),(955,24,'Store all garbage outside the accommodation, and dispose of it at the first practicable opportunity.',1,'2025-02-03 20:17:41'),(956,25,'Use rammers with a minimum length of 1.2 metres.',1,'2025-02-03 20:17:41'),(957,25,'Explain and demonstrate proper technique for picket ramming.',1,'2025-02-03 20:17:41'),(958,25,'Encourage gentle warm up stretches before commencing picket ramming.',1,'2025-02-03 20:17:41'),(959,25,'Only allocate this task to people with the physical capacity to perform it safely.',1,'2025-02-03 20:17:41'),(960,25,'Rotate tasks, even if team members are not experiencing discomfort; specify rotation frequency.',1,'2025-02-03 20:17:41'),(961,25,'Only grip the vertical section of the handles when using the rammer.',1,'2025-02-03 20:17:41'),(962,25,'Rammer not to be lifted off post during operation.',1,'2025-02-03 20:17:41'),(963,26,'Comply with all road laws.',1,'2025-02-03 20:17:41'),(964,26,'Complete pre-start checklist prior to operation.',1,'2025-02-03 20:17:41'),(965,26,'Wear seat belts when vehicle is in motion.',1,'2025-02-03 20:17:41'),(966,26,'All tools and equip secured in cargo area.',1,'2025-02-03 20:17:41'),(967,26,'Minimise distraction and take breaks on long drives.',1,'2025-02-03 20:17:41'),(968,26,'Appoint navigator to assist with directions.',1,'2025-02-03 20:17:41'),(969,26,'Appoint a spotter when reversing.',1,'2025-02-03 20:17:41'),(970,26,'Ensure all doors and tailgates are closed before vehicle moves. - Maintain vehicle as per manufacturers manual.',1,'2025-02-03 20:17:41'),(971,27,'Wear gloves whenever hands are at ground level.',1,'2025-02-03 20:17:41'),(972,27,'Encourage gentle warm up stretches.',1,'2025-02-03 20:17:41'),(973,27,'Comply with all MSDS directions if using chemicals.',1,'2025-02-03 20:17:41'),(974,27,'Specify and maintain a safe working space between team members.',1,'2025-02-03 20:17:41'),(975,27,'Provide adequate washing facilities.',1,'2025-02-03 20:17:41'),(976,27,'Wear eye protection where potential for eye injury is identified. Chemical splashes and grass or twig spikes to eyes, are common weeding injuries.',1,'2025-02-03 20:17:41'),(977,28,'Safety rails, fall arrest device and helmet must be in place if fall height exceeds 2m.',1,'2025-02-03 20:17:41'),(978,28,'Complete check for any electrical services in work location.',1,'2025-02-03 20:17:41'),(979,28,'Maintain exclusion zone beneath elevated worker.',1,'2025-02-03 20:17:41'),(980,28,'Use well maintained ladder on non-slip surface.',1,'2025-02-03 20:17:41'),(981,28,'Limit workers at height and only one person permitted on ladder at a time.',1,'2025-02-03 20:17:41'),(982,28,'Secure tools and equipment being used at height.',1,'2025-02-03 20:17:41'),(983,28,'Always work facing the ladder.',1,'2025-02-03 20:17:41'),(984,28,'Appoint spotters.',1,'2025-02-03 20:17:41'),(985,29,'Make food and fluids available, including warm drinks where possible.',1,'2025-02-03 20:17:41'),(986,29,'Conduct gentle warm up stretches before commencing work, and after breaks.',1,'2025-02-03 20:17:41'),(987,29,'Rotate tasks to avoid prolonged exposure and specify frequency of rotations.',1,'2025-02-03 20:17:41'),(988,29,'Identify and Use sheltered area during periods of inactivity e.g.: breaks or extreme conditions.',1,'2025-02-03 20:17:41'),(989,29,'Structure work to avoid the coldest times of the day.',1,'2025-02-03 20:17:41'),(990,29,'Encourage team members to wear layered clothing that enables them to adjust their body temperature according to weather conditions and activity level.',1,'2025-02-03 20:17:41'),(991,29,'Wear a warm hat.',1,'2025-02-03 20:17:41'),(992,30,'Check local weather forecast.',1,'2025-02-03 20:17:41'),(993,30,'Is a severe weather warning current?',1,'2025-02-03 20:17:41'),(994,30,'Will you be working under trees on the site?',1,'2025-02-03 20:17:41'),(995,30,'Does the site contain old growth or dead trees?',1,'2025-02-03 20:17:41'),(996,30,'Are there dead limbs or hanging timber that could fall?',1,'2025-02-03 20:17:41'),(997,30,'Consider the types of activities being undertaken (e.g. mulching/digging/planting may lead to more dust/debris in the air).',1,'2025-02-03 20:17:41'),(998,30,'Check local fire warnings (windy weather can often mean bushfire weather).',1,'2025-02-03 20:17:41'),(999,30,'Do you or any of your team members have a moderate to severe respiratory condition (e.g. asthma)?',1,'2025-02-03 20:17:41'),(1000,31,'Check that no person has a physical or psychological problem that renders them unsuitable for working in the dark.',1,'2025-02-03 20:17:41'),(1001,31,'Check that each person has a reliable torch.',1,'2025-02-03 20:17:41'),(1002,31,'Advise all participants to have ample, layered clothing.',1,'2025-02-03 20:17:41'),(1003,31,'Check that work area boundaries are understood and meeting point is known.',1,'2025-02-03 20:17:41'),(1004,31,'Work in pairs as a minimum group size; establish a \"buddy\" system.',1,'2025-02-03 20:17:41'),(1005,31,'If possible, during daylight hours inspect the site and remove or clearly mark trip hazards or other hazardous areas.',1,'2025-02-03 20:17:41'),(1006,31,'Provide each person with a whistle and ensure that each person knows that three long blasts is the standard emergency/distress signal.',1,'2025-02-03 20:17:41'),(1007,31,'Avoid rough or slippery areas.',1,'2025-02-03 20:17:41'),(1008,31,'Minimise the number, weight and bulk of items to be carried.',1,'2025-02-03 20:17:41'),(1009,31,'Wear high visibility vests.',1,'2025-02-03 20:17:41'),(1010,32,'Prior to project, seek local advice on presence of ticks. (If in plague proportion, reconsider whether or not to continue.)',1,'2025-02-03 20:17:41'),(1011,32,'Reduce tick access to skin by wearing long trousers (tucked into socks), long sleeved shirt (tucked in), broad-brimmed hat (reduces likelihood of ticks from getting into hair or down the neck of clothing)',1,'2025-02-03 20:17:41'),(1012,32,'If possible, wear light colored clothing so that any ticks on clothing are more readily spotted.',1,'2025-02-03 20:17:41'),(1013,32,'Apply DEET repellent to exposed skin.',1,'2025-02-03 20:17:41'),(1014,32,'Minimise disturbance to vegetation (as this appears to make ticks more active) by working for short periods in one location where ticks are a problem.',1,'2025-02-03 20:17:41'),(1015,32,'After leaving tick area, have team members check each other for ticks hair, behind ears, back of neck etc.',1,'2025-02-03 20:17:41'),(1016,32,'Encourage team members to check themselves fully when showering.',1,'2025-02-03 20:17:41'),(1017,32,'If possible, after working in a high tick population area, place clothing in a hot dryer for 20 minutes.',1,'2025-02-03 20:17:41'),(1018,33,'Eliminate or minimise the need for team members to work near heavy machinery.',1,'2025-02-03 20:17:41'),(1019,33,'Advise operator of the location and movement patterns of those working nearby.',1,'2025-02-03 20:17:41'),(1020,33,'Maintain direct liaison between the team, supervisor and the plant operator.',1,'2025-02-03 20:17:41'),(1021,33,'Develop and demonstrate a set of signals to be used; these must be clear, unambiguous and understood by all.',1,'2025-02-03 20:17:41'),(1022,33,'Work upwind or out of fume and dust range.',1,'2025-02-03 20:17:41'),(1023,33,'Appoint a \"spotter\" to provide additional supervision.',1,'2025-02-03 20:17:41'),(1024,34,'Eliminate or minimise the need for team members to work near roadsides.',1,'2025-02-03 20:17:41'),(1025,34,'Arrange for the placement of appropriate signage eg: SLOW DOWN, WORKERS NEAR ROADSIDE, and/or witches hats to indicate to drivers that there are workers ahead. (Note: This must be done by a competent person who has completed the proper training and received authorisation by the appropriate roads management authority.)',1,'2025-02-03 20:17:41'),(1026,34,'Maintain direct and continuous supervision.',1,'2025-02-03 20:17:41'),(1027,34,'Appoint a \"spotter\" to provide additional supervision.',1,'2025-02-03 20:17:41'),(1028,34,'Check that all team members understand the signals to be used, and that the signals are clear and unambiguous.',1,'2025-02-03 20:17:41'),(1029,34,'Work upwind or out of fume and dust range.',1,'2025-02-03 20:17:41'),(1030,34,'Wear high visibility vests or clothing.',1,'2025-02-03 20:17:41'),(1031,35,'Maintain a safe distance between team members and water that is deemed dangerous because of depth, current, murkiness, turbulence, difficulty of escape etc.',1,'2025-02-03 20:17:41'),(1032,35,'Designate areas on steep, slippery or unstable banks as no-go areas and flag or tape off',1,'2025-02-03 20:17:41'),(1033,35,'Identify non-swimmers and ensure that they are deployed away from higher risk areas.',1,'2025-02-03 20:17:41'),(1034,35,'Where there is an inadvertent possibility of the need to rescue someone from the water, ensure there are rescue aids readily accessible eg. rope, long pole, flotation device. Where there is a current, these aids must be positioned downstream of the most likely entry point.',1,'2025-02-03 20:17:41'),(1035,35,'Formulate an emergency response plan that is based on non-contact rescue strategies.',1,'2025-02-03 20:17:41'),(1036,35,'Maintain strict compliance with Conservation Volunteers\' policy of not facilitating recreational swimming.',1,'2025-02-03 20:17:41'),(1037,35,'Encourage team members to have adequate spare, dry socks.',1,'2025-02-03 20:17:41'),(1038,35,'Provide adequate washing facilities eg. soap and clean water.',1,'2025-02-03 20:17:41'),(1039,36,'Do not allow yourself or any volunteer to be alone with a school student or young person.',1,'2025-02-03 20:17:41'),(1040,36,'Always try to arrange for the CV team to have access to a toilet that is not used by the students.',1,'2025-02-03 20:17:41'),(1041,36,'Avoid moving a CV vehicle on school property while students are out of class or in close proximity. If the vehicle absolutely must be moved, switch on hazard lights, appoint spotters in high visibility vests and drive at a speed no greater than 10kph.',1,'2025-02-03 20:17:41'),(1042,36,'Where possible coordinate breaks for your team with the meal breaks of the school students, this reduces the need to manage third parties entering your worksite.',1,'2025-02-03 20:17:41'),(1043,36,'Ensure that tools or personal belongings are not left in unsecured, unsupervised areas.',1,'2025-02-03 20:17:41'),(1044,36,'Insist that a teacher remain present if students are to work with or near to a CV team.',1,'2025-02-03 20:17:41'),(1045,36,'Observe the sign in/ sign out procedures required by the school and observe the rules, laws and standards that apply to the school grounds, eg. no smoking or wearing clothes with offensive slogans or images.',1,'2025-02-03 20:17:41'),(1046,36,'Become familiar with the school\'s emergency evacuation plan and muster point.',1,'2025-02-03 20:17:41'),(1060,38,'Provide appropriate animal handling training.',1,'2025-02-03 20:17:41'),(1061,38,'Stress that all team members must be alert for unpredictable behaviour by animals.',1,'2025-02-03 20:17:41'),(1062,38,'Take into account the physical strength and stature of persons handling particular animals/species.',1,'2025-02-03 20:17:41'),(1063,38,'Wear appropriate PPE eg: glasses, gloves, long sleeves.',1,'2025-02-03 20:17:41'),(1064,38,'Make adequate provision for the maintenance of personal hygiene (eg: clean water and soap).',1,'2025-02-03 20:17:41'),(1065,39,'Ensure the operator is properly trained.',1,'2025-02-03 20:17:41'),(1066,39,'Ensure the operator is of sufficient strength and stature to control the equipment safely.',1,'2025-02-03 20:17:41'),(1067,39,'Check general mechanical condition of brush cutter before use.',1,'2025-02-03 20:17:41'),(1068,39,'Remove all obstacles or potential missiles (eg: stones, wire or timber) from the work area, prior to work commencing.',1,'2025-02-03 20:17:41'),(1069,39,'Ensure no other person is within 20 metres while the brush cutter is running.',1,'2025-02-03 20:17:41'),(1070,39,'Ensure that any other persons working in the general vicinity are wearing eye protection.',1,'2025-02-03 20:17:41'),(1071,39,'Adhere to all manufacturer specifications for use and maintenance.',1,'2025-02-03 20:17:41'),(1072,39,'Keep all feet and hands well clear of moving parts.',1,'2025-02-03 20:17:41'),(1073,39,'Stop operating the brush cutter if other people are close by.',1,'2025-02-03 20:17:41'),(1074,39,'Appoint a \"spotter\" to provide additional site surveillance.',1,'2025-02-03 20:17:41'),(1075,39,'Turn off the brush cutter when not in use or while removing debris.',1,'2025-02-03 20:17:41'),(1076,39,'Wear appropriate PPE eg: glasses, eye/face protection, safety boots, overalls, ear protection and high visibility vests.',1,'2025-02-03 20:17:41'),(1077,40,'Chainsaws only to be used by licensed operators.',1,'2025-02-03 20:17:44'),(1078,40,'Place warning signs at appropriate boundaries of the work area.',1,'2025-02-03 20:17:44'),(1079,40,'Clear other workers and debris from the immediate area of the operator and the fall zone.',1,'2025-02-03 20:17:44'),(1080,40,'Appoint a \"spotter\" to guard against any other team member or third party straying into the work area.',1,'2025-02-03 20:17:44'),(1081,40,'All persons on site to wear high visibility vests.',1,'2025-02-03 20:17:44'),(1082,40,'Always engage chain brake when not cutting.',1,'2025-02-03 20:17:44'),(1083,40,'Start the saw with it resting on the ground. DO NOT DROP START.',1,'2025-02-03 20:17:44'),(1084,40,'Wear appropriate PPE eg. hard hat, ear muffs, safety boots, face guardls, tellers trousers/chaps.',1,'2025-02-03 20:17:44');
/*!40000 ALTER TABLE `risk_controls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_titles`
--

DROP TABLE IF EXISTS `risk_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_titles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `isReadOnly` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_titles`
--

LOCK TABLES `risk_titles` WRITE;
/*!40000 ALTER TABLE `risk_titles` DISABLE KEYS */;
INSERT INTO `risk_titles` VALUES (1,'Asbestos-containing Materials',1,'2025-01-13 22:10:50'),(2,'Bites & Stings',1,'2025-01-13 22:10:50'),(3,'Boardwalk Construction - impact injuries, strains, manual handling, remote locations',1,'2025-01-13 22:10:50'),(4,'Bushfire',1,'2025-01-13 22:10:50'),(5,'Bushwalking',1,'2025-01-13 22:10:50'),(6,'COVID-19',1,'2025-01-13 22:10:50'),(7,'Chemical use - poisoning (inhalation, ingestion, absorption)',1,'2025-01-13 22:10:50'),(8,'Collecting sharps',1,'2025-01-13 22:10:50'),(9,'Fencing - injuries from wire (failure under strain or coiling), impact injury from picket rammer',1,'2025-01-13 22:10:50'),(10,'Litter collection - laceration/spike injuries, bites/stings, infections',1,'2025-01-13 22:10:50'),(11,'Manual Handling',1,'2025-01-13 22:10:50'),(12,'Mulching - inhalation/eye injury, allergies from dust, soft tissue injuries',1,'2025-01-13 22:10:50'),(13,'Plant Propagation - Strains, soil borne diseases, manual handling',1,'2025-01-13 22:10:50'),(14,'Predator control /checking traps',1,'2025-01-13 22:10:50'),(15,'Seed collection - cuts/scratches, eye injuries, allergic reactions, falls from height',1,'2025-01-13 22:10:50'),(16,'Slips, Trips & Falls',1,'2025-01-13 22:10:50'),(17,'Soil Borne Diseases & Inflections',1,'2025-01-13 22:10:50'),(18,'Surveying & Data Collection',1,'2025-01-13 22:10:50'),(19,'Track Construction and Maintenance - impact injuries, strains, manual handling, remote locations',1,'2025-01-13 22:10:50'),(20,'Tree Planting - impact injuries, muscle strain',1,'2025-01-13 22:10:50'),(21,'Using Machete or cane knife',1,'2025-01-13 22:10:50'),(22,'Using Power Tools - electrocution, impact injuries, strains, manual handling, flying particles',1,'2025-01-13 22:10:50'),(23,'Using Swinging Tools - Impact injuries, blisters, eye injuries',1,'2025-01-13 22:10:50'),(24,'Using Temporary Accommodation',1,'2025-01-13 22:10:50'),(25,'Using picket rammers',1,'2025-01-13 22:10:50'),(26,'Vehicle Travel',1,'2025-01-13 22:10:50'),(27,'Weeding - Scratches, strains, chemical exposure, impact injuries',1,'2025-01-13 22:10:50'),(28,'Working at heights - impact injury from falls or falling objects',1,'2025-01-13 22:10:50'),(29,'Working in Cold Conditions (Hypothermia)',1,'2025-01-13 22:10:50'),(30,'Working in Windy Conditions',1,'2025-01-13 22:10:50'),(31,'Working in the dark',1,'2025-01-13 22:10:50'),(32,'Working in tick habitat - allergic reaction, tick borne diseases',1,'2025-01-13 22:10:50'),(33,'Working near heavy machinery',1,'2025-01-13 22:10:50'),(34,'Working near road sides - impact injuries from vehicles',1,'2025-01-13 22:10:50'),(35,'Working near water - drowning',1,'2025-01-13 22:10:50'),(36,'Working with schools',1,'2025-01-13 22:10:50'),(37,'Working with/ near Power Auger',1,'2025-01-13 22:10:50'),(38,'Working with/ near animals',1,'2025-01-13 22:10:50'),(39,'Working with/ near brush cutters',1,'2025-01-13 22:10:50'),(40,'Working with/ near chainsaws',1,'2025-01-13 22:10:50'),(41,'new risk',0,'2025-01-28 19:56:22');
/*!40000 ALTER TABLE `risk_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risks`
--

DROP TABLE IF EXISTS `risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `risk_title_id` int NOT NULL,
  `likelihood` enum('highly unlikely','unlikely','quite possible','likely','almost certain') NOT NULL,
  `consequences` enum('insignificant','minor','moderate','major','catastrophic') NOT NULL,
  `risk_rating` varchar(30) GENERATED ALWAYS AS ((case when ((`likelihood` = _utf8mb4'highly unlikely') and (`consequences` in (_utf8mb4'insignificant',_utf8mb4'minor',_utf8mb4'moderate'))) then _utf8mb4'Low risk' when ((`likelihood` = _utf8mb4'highly unlikely') and (`consequences` = _utf8mb4'major')) then _utf8mb4'moderate risk' when ((`likelihood` = _utf8mb4'highly unlikely') and (`consequences` = _utf8mb4'catastrophic')) then _utf8mb4'High risk' when ((`likelihood` = _utf8mb4'unlikely') and (`consequences` = _utf8mb4'insignificant')) then _utf8mb4'Low risk' when ((`likelihood` = _utf8mb4'unlikely') and (`consequences` in (_utf8mb4'minor',_utf8mb4'moderate'))) then _utf8mb4'moderate risk' when ((`likelihood` = _utf8mb4'unlikely') and (`consequences` in (_utf8mb4'major',_utf8mb4'catastrophic'))) then _utf8mb4'High risk' when ((`likelihood` = _utf8mb4'quite possible') and (`consequences` = _utf8mb4'insignificant')) then _utf8mb4'Low risk' when ((`likelihood` = _utf8mb4'quite possible') and (`consequences` = _utf8mb4'minor')) then _utf8mb4'moderate risk' when ((`likelihood` = _utf8mb4'quite possible') and (`consequences` in (_utf8mb4'moderate',_utf8mb4'major'))) then _utf8mb4'High risk' when ((`likelihood` = _utf8mb4'quite possible') and (`consequences` = _utf8mb4'catastrophic')) then _utf8mb4'Extreme risk' when ((`likelihood` = _utf8mb4'likely') and (`consequences` in (_utf8mb4'minor',_utf8mb4'moderate'))) then _utf8mb4'High risk' when ((`likelihood` in (_utf8mb4'likely',_utf8mb4'almost certain')) and (`consequences` = _utf8mb4'insignificant')) then _utf8mb4'moderate risk' when ((`likelihood` in (_utf8mb4'likely',_utf8mb4'almost certain')) and (`consequences` in (_utf8mb4'major',_utf8mb4'catastrophic'))) then _utf8mb4'Extreme risk' when ((`likelihood` = _utf8mb4'almost certain') and (`consequences` = _utf8mb4'minor')) then _utf8mb4'High risk' when ((`likelihood` = _utf8mb4'almost certain') and (`consequences` = _utf8mb4'moderate')) then _utf8mb4'Extreme risk' else _utf8mb4'Unknown' end)) STORED,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `risk_title_id` (`risk_title_id`),
  CONSTRAINT `risks_ibfk_1` FOREIGN KEY (`risk_title_id`) REFERENCES `risk_titles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risks`
--

LOCK TABLES `risks` WRITE;
/*!40000 ALTER TABLE `risks` DISABLE KEYS */;
INSERT INTO `risks` (`id`, `risk_title_id`, `likelihood`, `consequences`, `created_at`) VALUES (1,1,'unlikely','moderate','2025-01-28 19:28:34'),(2,2,'likely','major','2025-01-28 19:28:34'),(3,3,'almost certain','minor','2025-01-28 19:28:34'),(4,3,'highly unlikely','insignificant','2025-01-28 20:02:08'),(5,6,'highly unlikely','moderate','2025-01-28 20:02:57'),(6,3,'highly unlikely','insignificant','2025-01-29 16:29:01'),(7,3,'highly unlikely','insignificant','2025-01-29 22:03:44'),(8,4,'highly unlikely','insignificant','2025-01-30 09:13:40'),(9,3,'unlikely','insignificant','2025-01-30 10:51:28'),(10,5,'highly unlikely','major','2025-01-30 10:51:57'),(11,3,'highly unlikely','insignificant','2025-01-30 10:53:17'),(12,6,'unlikely','insignificant','2025-01-30 10:54:00'),(13,4,'highly unlikely','insignificant','2025-01-30 10:55:04'),(14,6,'highly unlikely','insignificant','2025-01-30 11:12:27'),(26,1,'unlikely','insignificant','2025-01-31 19:08:35'),(27,6,'highly unlikely','insignificant','2025-01-31 19:10:34'),(28,6,'highly unlikely','insignificant','2025-01-31 19:10:37'),(29,6,'highly unlikely','insignificant','2025-01-31 19:10:39'),(54,5,'highly unlikely','insignificant','2025-02-03 13:39:11'),(55,12,'unlikely','minor','2025-02-03 13:41:03'),(58,3,'highly unlikely','insignificant','2025-02-03 20:21:32'),(59,2,'unlikely','insignificant','2025-02-03 20:45:15'),(60,3,'highly unlikely','minor','2025-02-03 20:53:32'),(61,4,'highly unlikely','minor','2025-02-03 23:31:47'),(62,5,'unlikely','insignificant','2025-02-04 00:12:26'),(63,4,'highly unlikely','minor','2025-02-04 13:04:30'),(65,4,'highly unlikely','insignificant','2025-02-04 14:26:20'),(67,2,'unlikely','insignificant','2025-02-04 19:27:02'),(68,2,'highly unlikely','insignificant','2025-02-05 11:17:56');
/*!40000 ALTER TABLE `risks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_hazards`
--

DROP TABLE IF EXISTS `site_hazards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_hazards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hazard_description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_hazards`
--

LOCK TABLES `site_hazards` WRITE;
/*!40000 ALTER TABLE `site_hazards` DISABLE KEYS */;
INSERT INTO `site_hazards` VALUES (1,'Slippery Surface'),(2,'Bad Weather'),(3,'Uneven Terrain');
/*!40000 ALTER TABLE `site_hazards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffs`
--

DROP TABLE IF EXISTS `staffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Field Staff','Team Leader','Group Admin') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffs`
--

LOCK TABLES `staffs` WRITE;
/*!40000 ALTER TABLE `staffs` DISABLE KEYS */;
INSERT INTO `staffs` VALUES (1,'Dave','Sp','dsharp.unique@example.com','0987654321','$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO','Group Admin'),(2,'Dave','Sharp','dsharp@cvnz.org.nz','0987654321','$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO','Field Staff'),(4,'Helen','voly','admin2@example.com','7890123456','$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2','Team Leader'),(5,'Bill','Hey','admin3@example.com','4567890123','$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG','Group Admin'),(6,'John','Dell','john.doe@example.com','1234567890','$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe','Team Leader'),(7,'Jane','Smith','jane.smith@example.com','0987654321','$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe','Group Admin'),(8,'Alice','Brown','alice.brown@example.com','5678901234','$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe','Team Leader'),(9,'Mark','Taylor','mark.taylor@example.com','4567890123','$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe','Field Staff'),(10,'Emily','Davis','emily.davis@example.com','7890123456','$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe','Group Admin'),(12,'Sina','k','ksina.72@gmail.com','2','$2b$10$vhj6xfOQTcw8BsGZmIDQ1e1JKfbO0EbZAP3Z2Xumimm4rk5/5j9Bm','Field Staff'),(14,'Bita','Hey','suezadeh.a@gmail.com','222222','$2b$10$Y7ZHKU6kAUYpgxVQiPmcy.bM5P0qlsjNbtRX6IGCjQ.1jsZAFLP42','Team Leader');
/*!40000 ALTER TABLE `staffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteers`
--

DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `emergencyContact` varchar(50) NOT NULL,
  `emergencyContactNumber` varchar(15) NOT NULL,
  `role` enum('Volunteer') DEFAULT 'Volunteer',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteers`
--

LOCK TABLES `volunteers` WRITE;
/*!40000 ALTER TABLE `volunteers` DISABLE KEYS */;
INSERT INTO `volunteers` VALUES (1,'John','Doe','johndoe@example.com','123-456-7890','Jane Doe','987-654-3210','Volunteer'),(2,'Alice','Smith','alicesmith@example.com','555-123-4567','Bob Smith','555-765-4321','Volunteer'),(3,'Mark','Johnson','markjohnson@example.com','222-333-4444','Laura Johnson','222-999-8888','Volunteer'),(4,'Emily','Davis','emilydavis@example.com','111-222-3333','Sarah Davis','111-444-5555','Volunteer'),(5,'Michael','Brown','michaelbrown@example.com','444-555-6666','Paul Brown','444-777-8888','Volunteer');
/*!40000 ALTER TABLE `volunteers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-06 13:22:54
