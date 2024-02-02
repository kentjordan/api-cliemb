CREATE DATABASE cliemb;

DROP TABLE IF EXISTS student_location;
DROP TABLE IF EXISTS admin_log;
DROP TABLE IF EXISTS monitoring;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS admin;

DROP TYPE IF EXISTS STUDENT_EMERGENCY_STATE;

CREATE TYPE STUDENT_EMERGENCY_STATE AS ENUM ('TO RECEIVE', 'PENDING', 'COMPLETED');

CREATE TABLE student(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	sr_code VARCHAR(255) NOT NULL,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	gender VARCHAR(255),
	email VARCHAR(255) NOT NULL,
	password TEXT NOT NULL,
	emergency_no VARCHAR(255)[],
	medical_conditions TEXT[],
	province VARCHAR(255),
	city VARCHAR(255),
	barangay VARCHAR(255),
	profile_photo TEXT
);

CREATE TABLE student_location(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
	room_no VARCHAR(64),
	floor_no VARCHAR(64),
	equipment_needed TEXT,
	narrative TEXT,
	student_id UUID NOT NULL,
	CONSTRAINT fk_student_id
		FOREIGN KEY (student_id)
		REFERENCES student(id)
);

CREATE TABLE monitoring(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP,
    photo TEXT [],
    state STUDENT_EMERGENCY_STATE,
    details TEXT,
    student_id UUID NOT NULL,
    student_location_id UUID NOT NULL,
    CONSTRAINT fk_student_id
        FOREIGN KEY (student_id)
        REFERENCES student(id),
    CONSTRAINT fk_student_location_id
        FOREIGN KEY (student_location_id)
        REFERENCES student_location(id)
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
	student_id UUID NOT NULL,
	student_location_id UUID NOT NULL,
	admin_id UUID NOT NULL,
	CONSTRAINT fk_admin_id
		FOREIGN KEY (admin_id)
		REFERENCES admin(id),
	CONSTRAINT fk_student_id
		FOREIGN KEY (student_id)
		REFERENCES student(id),
	CONSTRAINT fk_student_location_id
		FOREIGN KEY (student_location_id)
		REFERENCES student_location(id)
);