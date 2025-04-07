create database programming_prep;

use programming_prep;

create table
  if not exists Quiz (
    QuizId int primary key auto_increment,
    QuizName VARCHAR(255) NOT NULL,
    QuizDescription TEXT NOT NULL,
    NumberOfQue INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    file_path VARCHAR(255),
    isPublic BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    other_user_view_count INT DEFAULT 0,
    other_user_download_count INT DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS QuizQuestions (
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

CREATE TABLE
  IF NOT EXISTS UserAnswers (
    AnswerId INT PRIMARY KEY AUTO_INCREMENT,
    UserId VARCHAR(255) NOT NULL,
    QuizId INT NOT NULL,
    QuestionId INT NOT NULL,
    SelectedOption INT NOT NULL,
    IsCorrect BOOLEAN NOT NULL,
	IsActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS QuizResults (
    ResultId INT PRIMARY KEY AUTO_INCREMENT,
    UserId VARCHAR(255) NOT NULL,
    QuizId INT NOT NULL,
    TotalMarks INT NOT NULL,
    ObtainedMarks INT NOT NULL,
    Percentage DECIMAL(5, 2) NOT NULL,
    Status ENUM ('Pass', 'Fail') NOT NULL,
	IsActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  