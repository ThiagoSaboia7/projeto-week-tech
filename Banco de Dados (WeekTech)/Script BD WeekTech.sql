CREATE TABLE administrador (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único do administrador',

    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email utilizado para autenticação do administrador',

    senha VARCHAR(255) NOT NULL COMMENT 'Senha criptografada (hash) do administrador'

) COMMENT = 'Tabela responsável pelo controle de acesso administrativo do sistema';

CREATE TABLE aluno (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único do aluno',

    nome_completo VARCHAR(150) NOT NULL COMMENT 'Nome completo do aluno',

    registro_academico CHAR(10) NOT NULL UNIQUE COMMENT 'RA (Registro Acadêmico) do aluno',

    curso VARCHAR(50) NOT NULL COMMENT 'Curso em que o aluno está matriculado',

    serie VARCHAR(20) NOT NULL COMMENT 'Série ou semestre atual do aluno',

    checkin_coffee TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica participação no coffee break (0 = não, 1 = sim)',

    data_hora_inscricao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Data e hora em que o aluno realizou a inscrição'
    COMMENT 'Quando você faz um INSERT, o banco preenche sozinho com a data/hora atual. Você não precisa informar esse campo manualmente'

) COMMENT = 'Tabela responsável por armazenar os dados dos alunos inscritos no evento';

CREATE TABLE palestrante (
    id_palestrante INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único do palestrante',

    nome_completo VARCHAR(200) NOT NULL COMMENT 'Nome completo do palestrante',

    telefone VARCHAR(20) NOT NULL COMMENT 'Telefone para contato do palestrante',

    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email do palestrante utilizado para contato',

    tema VARCHAR(100) NOT NULL COMMENT 'Tema da palestra que será apresentada',

    data_hora_inscricao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Data e hora em que o palestrante se cadastrou'

) COMMENT = 'Tabela responsável por armazenar os dados dos palestrantes do evento';

CREATE TABLE projeto (
    id_projeto INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único do projeto',

    nome_projeto VARCHAR(150) NOT NULL COMMENT 'Nome do projeto desenvolvido',

    descricao VARCHAR(500) NOT NULL COMMENT 'Descrição detalhada do projeto'

) COMMENT = 'Tabela que armazena os projetos cadastrados no sistema';

CREATE TABLE integrante (
    id_integrante INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único do integrante',

    nome VARCHAR(150) NOT NULL COMMENT 'Nome do integrante do projeto',

    registro_academico CHAR(10) NOT NULL UNIQUE COMMENT 'RA do integrante',

    id_projeto INT NOT NULL COMMENT 'Referência ao projeto ao qual o integrante pertence',

    CONSTRAINT fk_integrante_projeto
        FOREIGN KEY (id_projeto)
        REFERENCES projeto(id_projeto)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) COMMENT = 'Tabela que armazena os integrantes associados aos projetos';