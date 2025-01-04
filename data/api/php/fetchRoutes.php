<?php

// Setze CORS-Header
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

/**
 * Ein einfaches PHP-Skript, das JSON-Daten von 
 * http://api.fhgr-informatik.ch/get_routes 
 * mit den **erforderlichen** Abfrageparametern abruft:
 *   Abfahrtsort
 *   Ankunftsort
 *   Abfahrtszeit
 *   Ankunftszeit
 *   max_waiting_time
 *
 * und die abgerufenen JSON-Daten ohne Standardwerte an den Aufrufer zurückgibt.
 */

// Überprüfen, ob alle erforderlichen GET-Parameter bereitgestellt werden.
$requiredParams = ['Abfahrtsort', 'Ankunftsort', 'Abfahrtszeit', 'Ankunftszeit', 'max_waiting_time'];
foreach ($requiredParams as $param) {
    if (!isset($_GET[$param])) {
        http_response_code(400);
        echo json_encode([
            'error' => "Fehlender erforderlicher Parameter: $param"
        ]);
        exit; // Beenden der Ausführung
    }
}

// Abrufen der Parameter direkt aus $_GET
$abfahrtsort      = $_GET['Abfahrtsort'];
$ankunftsort      = $_GET['Ankunftsort'];
$abfahrtszeit     = $_GET['Abfahrtszeit'];
$ankunftszeit     = $_GET['Ankunftszeit'];
$max_waiting_time = $_GET['max_waiting_time'];

// Erstellen der Abfragezeichenfolge mit ordnungsgemäßer URL-Codierung.
$query = http_build_query([
    'Abfahrtsort'      => $abfahrtsort,
    'Ankunftsort'      => $ankunftsort,
    'Abfahrtszeit'     => $abfahrtszeit,
    'Ankunftszeit'     => $ankunftszeit,
    'max_waiting_time' => $max_waiting_time,
]);

// Erstellen der vollständigen API-URL (die API unterstützt nur HTTP).
$url = "http://api.fhgr-informatik.ch/get_routes?" . $query;

// Initialisieren von cURL für eine GET-Anfrage (Standard, wenn eine URL angegeben wird).
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Rückgabe der Antwort als Zeichenkette
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Weiterleitung folgen, falls erforderlich

// Ausführen und Abrufen der Antwort
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Schließen von cURL
curl_close($ch);

// Behandeln von Nicht-200-Antworten.
if ($httpcode !== 200) {
    http_response_code($httpcode);
    echo json_encode([
        'error' => 'Anfrage fehlgeschlagen',
        'http_code' => $httpcode
    ]);
    exit;
}

// Ausgabe der Antwort als JSON (Durchreichen).
echo $response;

