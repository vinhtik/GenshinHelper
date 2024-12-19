<?php
$extensions = array("html", "htm");

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$ext = pathinfo($path, PATHINFO_EXTENSION);

if (in_array($ext, $extensions)) {
    $file = __DIR__ . $path;
    $data = file_get_contents($file);
    return eval('?> ' . $data); // this is where the data is processed. 
}
return false; // return false if the file does not have a .html or .htm extension.