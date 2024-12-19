<?php
$servername = "localhost";
$username = "root";
$password = "1004";
$dbname = "genshdatabase";

$mysqli = new mysqli($servername, $username, $password, $dbname);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$query = "SELECT weapon_name, type, rarity, max_atk, substat_type, max_substat FROM weapons WHERE 1=1";

if (isset($data['type']) && !empty($data['type'])) {
    $typePlaceholders = implode(',', array_fill(0, count($data['type']), '?'));
    $query .= " AND type IN ($typePlaceholders)";
}

// Применяем сортировку (сначала по редкости, затем по дате)
$sortClauses = [];

if (isset($data['sorting'])) {
    foreach ($data['sorting'] as $sortField => $sortOrder) {
        $validFields = ['rarity', 'release_date']; // Допустимые поля сортировки
        if (in_array($sortField, $validFields)) {
            $sortClauses[] = "$sortField " . ($sortOrder === 'asc' ? 'ASC' : 'DESC');
        }
    }
}

// Добавляем сортировку в запрос
if (!empty($sortClauses)) {
    $query .= " ORDER BY " . implode(', ', $sortClauses);
}


$stmt = $mysqli->prepare($query);

$bindTypes = '';
$bindValues = [];

if (isset($data['type'])) {
    foreach ($data['type'] as $type) {
        $bindTypes .= 's';
        $bindValues[] = $type;
    }
}

if (!empty($bindValues)) {
    $stmt->bind_param($bindTypes, ...$bindValues);
}

$stmt->execute();
$result = $stmt->get_result();

$weapons = [];
while ($row = $result->fetch_assoc()) {
    $weapons[] = $row;
}

echo json_encode($weapons);

$mysqli->close();
?>
