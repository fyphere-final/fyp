/* ===========================================================================
   Obaid Qaida - Phase 1 schema extension (Screens 1-10, student flow)
   Run AFTER Online-Obaid-Qaida.sql has created/populated [Ubaid Qaida].
   Idempotent: safe to run multiple times. Does NOT modify existing data.
   All Arabic/Urdu text columns are NVARCHAR so airab / diacritics never corrupt.
   Batches are separated by GO (handled by scripts/migrate.js).
   =========================================================================== */

-- 1) units.unitTitle was VARCHAR (Urdu turns into '???'). Make it NVARCHAR.
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.units') AND name = 'unitTitle' AND system_type_id = 167 -- varchar
)
    ALTER TABLE dbo.units ALTER COLUMN unitTitle NVARCHAR(MAX) NULL;
GO

-- 2) Users (login accounts; role-based; students link to Students.Sid)
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE dbo.Users (
    UserId       INT IDENTITY(1,1) CONSTRAINT pk_Users PRIMARY KEY,
    Email        NVARCHAR(256) NOT NULL CONSTRAINT uq_Users_Email UNIQUE,
    PasswordHash NVARCHAR(100) NOT NULL,
    Role         VARCHAR(10)   NOT NULL CONSTRAINT ck_Users_Role CHECK (Role IN ('student', 'teacher')),
    DisplayName  NVARCHAR(100) NULL,           -- shown in the app (Urdu allowed)
    Sid          INT NULL CONSTRAINT fk_Users_Students REFERENCES dbo.Students(Sid),
    IsActive     BIT NOT NULL CONSTRAINT df_Users_Active DEFAULT 1,
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT df_Users_Created DEFAULT SYSUTCDATETIME()
);
GO

-- 3) Attempts for quiz (jaiza), exercise (mashq) and re-assess
IF OBJECT_ID('dbo.QuizAttempts', 'U') IS NULL
CREATE TABLE dbo.QuizAttempts (
    AttemptId   INT IDENTITY(1,1) CONSTRAINT pk_QuizAttempts PRIMARY KEY,
    Sid         INT NOT NULL CONSTRAINT fk_QA_Students REFERENCES dbo.Students(Sid),
    unitno      INT NOT NULL,
    lessonNo    INT NOT NULL,
    Kind        VARCHAR(10) NOT NULL CONSTRAINT ck_QA_Kind CHECK (Kind IN ('quiz', 'reassess', 'exercise')),
    SourceAttemptId INT NULL,                  -- reassess -> the attempt whose wrong answers were retried
    ScorePct    TINYINT NOT NULL,
    Correct     SMALLINT NOT NULL,
    Total       SMALLINT NOT NULL,
    Passed      BIT NOT NULL,
    CreatedAt   DATETIME2(0) NOT NULL CONSTRAINT df_QA_Created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_QA_Lessons FOREIGN KEY (unitno, lessonNo) REFERENCES dbo.Lessons(unitno, lessonNo)
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_QA_Student')
    CREATE INDEX ix_QA_Student ON dbo.QuizAttempts (Sid, CreatedAt DESC) INCLUDE (unitno, lessonNo, Kind, ScorePct);
GO

IF OBJECT_ID('dbo.QuizAttemptAnswers', 'U') IS NULL
CREATE TABLE dbo.QuizAttemptAnswers (
    AttemptId  INT NOT NULL CONSTRAINT fk_QAA_Attempt REFERENCES dbo.QuizAttempts(AttemptId) ON DELETE CASCADE,
    QId        VARCHAR(40)   NOT NULL,         -- e.g. q:12 (quiz), t:e1:3 / c:w:5 (exercise)
    Prompt     NVARCHAR(400) NOT NULL,
    Chosen     NVARCHAR(400) NULL,
    Correct    NVARCHAR(400) NOT NULL,
    IsCorrect  BIT NOT NULL,
    CONSTRAINT pk_QAA PRIMARY KEY (AttemptId, QId)
);
GO

-- 4) Per-student, per-lesson progress (drives lock/unlock + progress screens)
IF OBJECT_ID('dbo.StudentProgress', 'U') IS NULL
CREATE TABLE dbo.StudentProgress (
    Sid             INT NOT NULL CONSTRAINT fk_SP_Students REFERENCES dbo.Students(Sid),
    unitno          INT NOT NULL,
    lessonNo        INT NOT NULL,
    SabaqDone       BIT NOT NULL CONSTRAINT df_SP_Sabaq DEFAULT 0,
    ExerciseBestPct TINYINT NULL,
    QuizBestPct     TINYINT NULL,
    Completed       BIT NOT NULL CONSTRAINT df_SP_Done DEFAULT 0,   -- quiz passed
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT df_SP_Upd DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_StudentProgress PRIMARY KEY (Sid, unitno, lessonNo),
    CONSTRAINT fk_SP_Lessons FOREIGN KEY (unitno, lessonNo) REFERENCES dbo.Lessons(unitno, lessonNo)
);
GO
