<?php
$servername = "localhost";
$username = "root";
$password = "1004";
$dbname = "genshdatabase";

$mysqli = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Запрос для получения всех персонажей
$sql = "SELECT * FROM characters";
$result = $mysqli->query($sql);

// Проверка, если есть результаты
if ($result->num_rows > 0) {
    
    while ($row = $result->fetch_assoc()) {
        $rarityClass = $row['star_rarity'] == 5 ? 'rarity-5' : ($row['star_rarity'] == 4 ? 'rarity-4' : '');
        echo "<div class='container $rarityClass'>";
        echo "<img class='icon' src='../assets/icons/" . $row['character_name'] . ".webp' alt='" . $row['character_name'] . "'>";
        echo "<img class='vision' src='../assets/icons/" . $row['vision'] . ".webp' alt='" . $row['vision'] . "'>";
        echo "<p>" . $row['character_name'] . "</p>";
        echo "</div>";
    }
    
} else {
    echo "0 results";
}

$mysqli->close();
?>
