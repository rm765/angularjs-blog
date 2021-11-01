<?php

session_start();

$conn = new mysqli("localhost", "root", "", "blog");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$out = array('error' => false);

$user = json_decode(file_get_contents('php://input'));

$username = $user->username;
$password = $user->password;

$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
$query = $conn->query($sql);

if($query->num_rows>0){
	$row = $query->fetch_array();
	$out['message'] = 'Logowanie nastąpiło poprawnie';
	$out['user'] = uniqid('ang_');
	$_SESSION['user'] = $row['userid'];
}
else{
	$out['error'] = true;
	$out['message'] = 'Nieprawidłowe dane logowania';
}

echo json_encode($out);

?>
