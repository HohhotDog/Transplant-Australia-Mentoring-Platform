create table
    users (
        id serial primary key,
        email varchar(100) not null unique,
        password_hash varchar(255) not null,
        security_question varchar(255) not null,
        security_answer_hash varchar(255) not null,
        account_type SMALLINT NOT NULL DEFAULT 0 CHECK (account_type IN (0, 1)), -- 0=user, 1=admin
        created_at timestamp default current_timestamp
    );

create table
    profiles (
        user_id integer primary key references users (id) on delete cascade,
        first_name varchar(100),
        last_name varchar(100),
        date_of_birth DATE CHECK (date_of_birth < CURRENT_DATE), -- Ensure date of birth is in the past
        address varchar(255),
        city_suburb varchar(100),
        state varchar(100),
        postal_code varchar(4),
        gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
        aboriginal_or_torres_strait_islander boolean,
        language_spoken_at_home varchar(100),
        living_situation varchar(100),
        profile_picture_url varchar(255),
        bio text,
        phone_number varchar(20),
        updated_at timestamp default current_timestamp
    );

create table
    mentorship_preferences (
        user_id integer primary key references users (id) on delete cascade,
        -- wait until mentor matching questions are determined
        updated_at timestamp default current_timestamp
    );

create table
    sessions (
        id serial primary key,
        name varchar(100) not null,
        start_date date not null,
        end_date DATE NOT NULL CHECK (end_date > start_date),
        description text not null,
        picture_url varchar(255) not null,
        creator_id integer references users (id) on delete cascade,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp,
        status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'finished'))
    );

create table
    applications (
        id serial primary key,
        session_id integer not null references sessions (id) on delete cascade,
        user_id integer references users (id) on delete cascade,
        role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'onhold')),
        application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_mentor_id integer references users (id) on delete cascade,
        unique (session_id, user_id)
    );

create table
    mentor_recommendations (
        id serial primary key,
        application_id integer not null references applications (id) on delete cascade,
        recommended_mentor_id integer references users (id) on delete cascade,
        recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (application_id, recommended_mentor_id)
    );

create table
    participants (
        id serial primary key,
        session_id integer references sessions (id) on delete cascade,
        user_id integer references users (id) on delete cascade,
        application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unique (session_id, user_id)
    );

CREATE TABLE
    matching_pairs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions (id) ON DELETE CASCADE,
        mentor_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        mentee_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (session_id, mentor_id, mentee_id),
        FOREIGN KEY (session_id, mentor_id) REFERENCES participants (session_id, user_id),
        FOREIGN KEY (session_id, mentee_id) REFERENCES participants (session_id, user_id),
        CHECK (mentor_id <> mentee_id) -- Ensure mentor and mentee are not the same person
    );

create table
    comments (
        id serial primary key,
        session_id integer references sessions (id) on delete cascade,
        target_user_id integer not null references users (id) on delete cascade,
        content text not null,
        commenter_id integer not null references users (id) on delete cascade,
        created_at timestamp default current_timestamp
    );

CREATE INDEX idx_applications_session_id ON applications (session_id);

CREATE INDEX idx_participants_application_id ON participants (application_id);

CREATE INDEX idx_matching_pairs_mentor_id ON matching_pairs (mentor_id);

CREATE INDEX idx_matching_pairs_mentee_id ON matching_pairs (mentee_id);

CREATE INDEX idx_comments_commenter_id ON comments (commenter_id);