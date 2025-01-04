-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 14. Dez 2024 um 23:24
-- Server-Version: 10.4.28-MariaDB
-- PHP-Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `trainwork`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `knotenpunkte`
--

CREATE TABLE `knotenpunkte` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `x` float DEFAULT NULL,
  `y` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `knotenpunkte`
--

INSERT INTO `knotenpunkte` (`id`, `name`, `x`, `y`) VALUES
(1, 'Spiez', 46.6864, 7.6801),
(2, 'Zürich HB', 47.3778, 8.5405),
(3, 'Sargans', 47.0448, 9.44626),
(4, 'Lausanne', 46.5168, 6.62909),
(5, 'Montreux', 46.4359, 6.91044),
(6, 'Bern', 46.9488, 7.43914),
(7, 'Genève', 46.2102, 6.14244),
(8, 'Luzern', 47.0502, 8.31019),
(9, 'Genève', 46.2102, 6.14244),
(10, 'Biel/Bienne', 47.1329, 7.24292),
(11, 'St. Gallen', 47.4232, 9.3699),
(12, 'Interlaken Ost', 46.6905, 7.86901),
(13, 'Basel SBB', 47.5474, 7.58958),
(14, 'Bellinzona', 46.1954, 9.02952),
(15, 'Chur', 46.8531, 9.52894),
(16, 'Visp', 46.294, 7.88145),
(17, 'Olten', 47.3519, 7.90771),
(18, 'Neuchâtel', 46.9967, 6.93571);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `knotenpunkte`
--
ALTER TABLE `knotenpunkte`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `knotenpunkte`
--
ALTER TABLE `knotenpunkte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
