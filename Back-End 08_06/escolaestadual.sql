-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 08/05/2026 às 11:49
-- Versão do servidor: 9.1.0
-- Versão do PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `escolaestadual`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `alunos`
--

DROP TABLE IF EXISTS `alunos`;
CREATE TABLE IF NOT EXISTS `alunos` (
  `IDaluno` int NOT NULL,
  `nome` varchar(140) NOT NULL,
  `Senha` varchar(16) NOT NULL,
  PRIMARY KEY (`IDaluno`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `alunos`
--

INSERT INTO `alunos` (`IDaluno`, `nome`, `Senha`) VALUES
(1, 'teste', 'teste123');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cadastro_livros`
--

DROP TABLE IF EXISTS `cadastro_livros`;
CREATE TABLE IF NOT EXISTS `cadastro_livros` (
  `FK_IDlivro` int NOT NULL,
  `FK_IDprofessor` int NOT NULL,
  PRIMARY KEY (`FK_IDlivro`,`FK_IDprofessor`),
  KEY `fk_professor` (`FK_IDprofessor`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `emprestimos`
--

DROP TABLE IF EXISTS `emprestimos`;
CREATE TABLE IF NOT EXISTS `emprestimos` (
  `FK_IDaluno` int NOT NULL,
  `FK_IDlivro` int NOT NULL,
  `data_emprestimo` date NOT NULL,
  `data_devolucao` date DEFAULT NULL,
  `atrasado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`FK_IDaluno`,`FK_IDlivro`),
  KEY `fk_emprestimo_livro` (`FK_IDlivro`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `livros`
--

DROP TABLE IF EXISTS `livros`;
CREATE TABLE IF NOT EXISTS `livros` (
  `IDlivro` int NOT NULL,
  `Titulo` varchar(140) DEFAULT NULL,
  `Autor` varchar(100) DEFAULT NULL,
  `Descricao` varchar(140) DEFAULT NULL,
  `ISBN` varchar(13) DEFAULT NULL,
  `Quantidade` int NOT NULL,
  PRIMARY KEY (`IDlivro`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `materiais`
--

DROP TABLE IF EXISTS `materiais`;
CREATE TABLE IF NOT EXISTS `materiais` (
  `IDmaterial` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `path` varchar(100) NOT NULL,
  `date_upload` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario` int NOT NULL,
  PRIMARY KEY (`IDmaterial`),
  KEY `usuario` (`usuario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `professores`
--

DROP TABLE IF EXISTS `professores`;
CREATE TABLE IF NOT EXISTS `professores` (
  `IDprofessor` int NOT NULL,
  `Email` varchar(140) NOT NULL,
  `Senha` varchar(16) NOT NULL,
  PRIMARY KEY (`IDprofessor`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `professores`
--

INSERT INTO `professores` (`IDprofessor`, `Email`, `Senha`) VALUES
(1, 'teste@teste.com', 'teste123');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
