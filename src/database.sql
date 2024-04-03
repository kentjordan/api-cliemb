CREATE DATABASE cliemb;

DROP TABLE IF EXISTS details CASCADE;
DROP TABLE IF EXISTS received_case CASCADE;
DROP TABLE IF EXISTS admin_logged_in_history CASCADE;
DROP TABLE IF EXISTS admin_log CASCADE;
DROP TABLE IF EXISTS monitoring CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS emergency_hotlines CASCADE;

DROP TYPE IF EXISTS USER_EMERGENCY_STATE;
DROP TYPE IF EXISTS USER_ROLE;

CREATE TYPE USER_EMERGENCY_STATE AS ENUM ('TO RECEIVE', 'PENDING', 'COMPLETED');
CREATE TYPE USER_ROLE AS ENUM ('STUDENT', 'PROFESSOR', 'STAFF');

CREATE TABLE "user"(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	role USER_ROLE NOT NULL, 
	sr_code VARCHAR(255) UNIQUE,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	gender VARCHAR(255) DEFAULT 'N/A',
	email VARCHAR(255) NOT NULL UNIQUE,
	password TEXT NOT NULL,
	emergency_no VARCHAR(255)[] DEFAULT '{N/A}',
	medical_conditions TEXT[] DEFAULT '{N/A}',
	province VARCHAR(255) DEFAULT 'N/A',
	city VARCHAR(255) DEFAULT 'N/A',
	barangay VARCHAR(255) DEFAULT 'N/A',
	profile_photo TEXT,
	is_account_approved BOOLEAN DEFAULT false
);

CREATE TABLE monitoring(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
    state USER_EMERGENCY_STATE,
	room VARCHAR(64) NOT NULL,
	floor_no VARCHAR(64) NOT NULL,
	equipment_needed TEXT[],
	narrative TEXT,
	emergency_level SMALLINT,
    photo TEXT [],
    user_id UUID NOT NULL,
    CONSTRAINT fk_user_id
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
);

CREATE TABLE admin(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	password TEXT NOT NULL,
	gender VARCHAR(255),
	contact_no VARCHAR(255),
	username TEXT,
	position VARCHAR(255),
	province VARCHAR(255),
	city VARCHAR(255),
	barangay VARCHAR(255),
	profile_photo TEXT
);

CREATE TABLE admin_logged_in_history(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	time_out TIMESTAMP,
	admin_id UUID NOT NULL,
	CONSTRAINT fk_admin_id
		FOREIGN KEY (admin_id)
		REFERENCES admin(id)
);

CREATE TABLE received_case(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	user_id UUID NOT NULL,
	monitoring_id UUID NOT NULL,
	admin_id UUID NOT NULL,
	CONSTRAINT fk_admin_id
		FOREIGN KEY (admin_id)
		REFERENCES admin(id),
	CONSTRAINT fk_user_id
		FOREIGN KEY (user_id)
		REFERENCES "user"(id),
	CONSTRAINT fk_monitoring_id
		FOREIGN KEY (monitoring_id)
		REFERENCES monitoring(id)
);

CREATE TABLE details(
	user_id UUID UNIQUE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	room VARCHAR(64) NOT NULL,
	floor_no VARCHAR(64) NOT NULL,
	equipment_needed TEXT[],
	narrative TEXT,
	CONSTRAINT fk_user_id
		FOREIGN KEY (user_id)
		REFERENCES "user"(id)
);

CREATE TABLE emergency_hotlines(
	id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	name VARCHAR(255) NOT NULL,
	landline_no VARCHAR(255)[],
	mobile_no VARCHAR(255)[],
	province VARCHAR(255) NOT NULL,
	city VARCHAR(255) NOT NULL,
	barangay VARCHAR(255) NOT NULL
);

CREATE TABLE monitoring_updates(
	id					UUID UNIQUE DEFAULT gen_random_uuid(),
	created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at 			TIMESTAMP,
	details 			JSON DEFAULT '{"updated_at": null, "isUpdated": false}',
	room 				JSON DEFAULT '{"updated_at": null, "isUpdated": false}',
	floor_no 			JSON DEFAULT '{"updated_at": null, "isUpdated": false}',
	equipment_needed 	JSON DEFAULT '{"updated_at": null, "isUpdated": false}',
	narrative 			JSON DEFAULT '{"updated_at": null, "isUpdated": false}',
	monitoring_id 		UUID NOT NULL PRIMARY KEY,
	CONSTRAINT fk_monitoring_id
		FOREIGN KEY (monitoring_id) 
		REFERENCES monitoring(id)
);

INSERT INTO
	emergency_hotlines(name, landline_no, mobile_no, city, province, barangay)
VALUES
	('Bureau of Fire Batangas City', '{(043) 301 7996}', '{09989677348}', 'Batangas City', 'N/A', 'N/A'),
	('BFP Alangilan Substation', '{(043) 702 1973}', '{09459675216}', 'Batangas City', 'N/A', 'N/A'),
	('Batanagas City Police Station', '{(043) 723 2476}', '{09208463821}', 'Batangas City', 'N/A', 'N/A'),
	('Batangas Medical Center', '{(043) 740 8307}', '{09164291515}', 'Batangas City', 'N/A', 'N/A'),
	('Jesus of Nazareth Hospiital', '{(043) 723 4144}', '{094124336152}', 'Batangas City', 'N/A', 'N/A'),
	('St. Patrikcs Hospital and Medical Center', '{(043) 723 7089}', '{09597360929}', 'Batangas City', 'N/A', 'N/A'),
	('Golden Gate General Hospital', '{(043) 341 4112}' ,'{09442577320}', 'Batangas City', 'N/A', 'N/A'),
	('Batangas Healthcare Specialist', '{(043) 741 2088}','{09648299153}', 'Batangas City', 'N/A', 'N/A');
