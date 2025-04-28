create database programming_prep;
use programming_prep;

create table if not exists Quiz (
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

CREATE TABLE IF NOT EXISTS QuizQuestions (
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

CREATE TABLE IF NOT EXISTS UserAnswers (
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

CREATE TABLE IF NOT EXISTS QuizResults (
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

CREATE TABLE IF NOT EXISTS Admin_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_path VARCHAR(255),
  isPublic BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  IsActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  linktitle VARCHAR(255) NOT NULL,
  linkcontent TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  url TEXT,
  IsActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Admin_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL,
  linktitle VARCHAR(255) NOT NULL,
  linkcontent TEXT NOT NULL,
  url TEXT,
  isPublic BOOLEAN DEFAULT TRUE,
  IsActive BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users (
  UserId VARCHAR(255) PRIMARY KEY,
  Email VARCHAR(255) NOT NULL,
  FirstName VARCHAR(100),
  LastName VARCHAR(100),
  Role VARCHAR(50) DEFAULT 'user',
  IsActive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Users (UserId, Email, FirstName, LastName, Role, IsActive)
VALUES
('user_2tZuwskt4VpmqWVp38Bq7ihQXk0', 'rakshakpatre409@gmail.com', 'Rakshak', 'Patre', 'admin', 1),
('user_2tZwc0kMfQk0ZnIgM0fsx4fAekp', 'tejaskapse19@gmail.com', 'Tejas', 'Kapse', 'admin', 1),
('user_2taSXl9HZvqc2NWw9s1ZzBc2loK', 'tejaskapse1902@gmail.com', 'Rakshak', 'Kapse', 'user', 1),
('user_2tfL6XDC52rSB1Z99e4YjrdFOzJ', 'karthiksharmaa405@gmail.com', 'Karthik', 'Sharma', 'user', 1),
('user_2tnqaFaSZBPd9hB5ebpWYk5bpKp', 'pgkolhe2002@gmail.com', 'Prajwal', 'Kolhe', 'user', 1),
('user_2uGNPME9wztE0gGOCIxWq3t9ego', 'nikhilgalave3@gmail.com', 'Nikhil', 'Galave', 'user', 1),
('user_2uoAPirTf0cYTdRLJaD26TuqR19', 'tejaskapse01@gmail.com', 'Tejas', 'Kapse', 'user', 1);