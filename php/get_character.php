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

if (isset($_GET['name'])) {
    $characterName = $_GET['name'];
    $stmt = $mysqli->prepare("SELECT * FROM characters WHERE character_name = ?");
    $stmt->bind_param("s", $characterName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode([]);
    }

    $stmt->close();
}

$mysqli->close();
?>
