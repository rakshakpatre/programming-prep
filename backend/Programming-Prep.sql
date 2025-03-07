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
            IsActive BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

select * from Quiz;
