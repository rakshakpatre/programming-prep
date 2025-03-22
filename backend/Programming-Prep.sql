create database programming_prep;
use programming_prep;
create table if not exists Quiz(
	QuizId int primary key auto_increment,
	QuizName VARCHAR(255) NOT NULL,
	QuizDescription TEXT NOT NULL,
  NumberOfQue INT NOT NULL,
  IsActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            file_path VARCHAR(255),  -- Store file path here
            view_count INT DEFAULT 0,  -- Track number of views
            download_count INT DEFAULT 0,  -- Track number of downloads
            IsActive BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );


CREATE TABLE IF NOT EXISTS QuizQuestions(
  QuestionId INT PRIMARY KEY AUTO_INCREMENT,
  QuizId INT NOT NULL,
  QuestionText TEXT NOT NULL,
  Option1 TEXT NOT NULL,
  Option2 TEXT NOT NULL,
  Option3 TEXT NOT NULL,
  Option4 TEXT NOT NULL,
  CorrectOption Int NOT NULL,
  IsActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

select * from Quiz;

-- Add is_public column to notes table for public/private visibility
ALTER TABLE notes ADD COLUMN is_public BOOLEAN DEFAULT TRUE;

select * from QuizQuestions;