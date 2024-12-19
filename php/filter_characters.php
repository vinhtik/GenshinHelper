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

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

// Стартуем запрос
$query = "SELECT * FROM characters WHERE 1=1";

// Применяем фильтрацию по элементам (vision) и оружию (weapon_type)
if (isset($data['vision']) && !empty($data['vision'])) {
    $visionPlaceholders = implode(',', array_fill(0, count($data['vision']), '?'));
    $query .= " AND vision IN ($visionPlaceholders)";
}

if (isset($data['weapon_type']) && !empty($data['weapon_type'])) {
    $weaponTypePlaceholders = implode(',', array_fill(0, count($data['weapon_type']), '?'));
    $query .= " AND weapon_type IN ($weaponTypePlaceholders)";
}

// Применяем сортировку
$sortClauses = [];

if (isset($data['star_rarity']) && isset($data['star_rarity']['sort'])) {
    $sortClauses[] = "star_rarity " . ($data['star_rarity']['sort'] === 'asc' ? 'ASC' : 'DESC');
}

if (isset($data['release_date']) && isset($data['release_date']['sort'])) {
    $sortClauses[] = "release_date " . ($data['release_date']['sort'] === 'asc' ? 'ASC' : 'DESC');
}

if (isset($data['character_name']) && isset($data['character_name']['sort'])) {
    $sortClauses[] = "character_name " . ($data['character_name']['sort'] === 'asc' ? 'ASC' : 'DESC');
}

// Добавляем сортировку в запрос, если есть
if (count($sortClauses) > 0) {
    $query .= " ORDER BY " . implode(", ", $sortClauses);
}

// Выполняем запрос
$stmt = $mysqli->prepare($query);

$bindTypes = '';
$bindValues = [];

// Добавляем параметры для фильтров
if (isset($data['vision'])) {
    foreach ($data['vision'] as $vision) {
        $bindTypes .= 's'; // Тип данных для строки
        $bindValues[] = $vision;
    }
}

if (isset($data['weapon_type'])) {
    foreach ($data['weapon_type'] as $weaponType) {
        $bindTypes .= 's'; // Тип данных для строки
        $bindValues[] = $weaponType;
    }
}

// Если есть фильтры, связываем параметры
if (!empty($bindValues)) {
    $stmt->bind_param($bindTypes, ...$bindValues);
}

$stmt->execute();
$result = $stmt->get_result();

$characters = [];
while ($row = $result->fetch_assoc()) {
    $characters[] = $row;
}

echo json_encode($characters);

$mysqli->close();
?>
