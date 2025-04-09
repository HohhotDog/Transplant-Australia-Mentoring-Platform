create table users (
    id serial primary key,
    email varchar(100) not null unique,
    password_hash varchar(255) not null,
    security_question varchar(255) not null,
    security_answer_hash varchar(255) not null,
    type varchar(50) not null, // user=0, admin=1, etc.
    created_at timestamp default current_timestamp
);


create table profiles (
    user_id integer primary key references users(id) on delete cascade,
    first_name varchar(100),
    last_name varchar(100),
    date_of_birth date,
    address varchar(255),
    city_suburb varchar(100),
    state varchar(100),
    postal_code varchar(20),
    gender varchar(10),
    aboriginal_or_torres_strait_islander boolean,
    language_spoken_at_home varchar(100),
    living_situation varchar(100),
    profile_picture_url varchar(255),
    bio text,
    phone_number varchar(20),
    updated_at timestamp default current_timestamp
);

create table mentorship_preferences (
    user_id integer primary key references users(id) on delete cascade,
    // wait until mentor matching questions are determined
    updated_at timestamp default current_timestamp
);

create table sessions (
    id serial primary key,
    name varchar(100) not null,
    start_date date not null,
    end_date date not null,
    description text not null,
    picture_url varchar(255) not null,
    creator_id integer references users(id) on delete cascade,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    status varchar(20) //available=0, active=1, finished=2
);

create table applications (
    id serial primary key,
    session_id integer references sessions(id) on delete cascade,
    user_id integer references users(id) on delete cascade,
    role varchar(50), //mentor=0, mentee=1, etc.
    status varchar(20),// pending=0, approved=1, onhold=2
    application_date date default current_date,
    unique (session_id, user_id)
);

create table participants (
    id serial primary key,
    session_id integer references sessions(id) on delete cascade,
    user_id integer references users(id) on delete cascade,
    application_id integer references applications(id) on delete cascade,
    role varchar(50), //mentor=0, mentee=1, etc.
    joined_date date default current_date,
    unique (session_id, user_id)
);

create table comments (
    id serial primary key,
    session_id integer references sessions(id) on delete cascade,
    user_id integer references users(id) on delete cascade,
    content text not null,
    commenter_id integer references users(id) on delete cascade,
    created_at timestamp default current_timestamp
);

create table matching_pairs (
    id serial primary key,
    session_id integer references sessions(id) on delete cascade,
    mentor_id integer references users(id) on delete cascade,
    mentee_id integer references users(id) on delete cascade,
    created_at timestamp default current_timestamp
    unique (session_id, mentor_id, mentee_id)
);